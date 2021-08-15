import axios from 'axios';
import { createWriteStream, mkdirSync, unlinkSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join as joinPath } from 'path';
import yauzl, { Entry } from 'yauzl';
import { Order } from './order';

export interface DownloadLinks {
  [voucherId: string]: string;
}

export interface DownloadOptions {
  /** The base path where the downloaded files should be stored. */
  path?: string;
  /** Determines whether to delete archives after extraction. Defaults to true. */
  deleteArchive?: boolean;
  /** Determines whether to extract vouchers in the archive. Defaults to true. */
  extractArchive?: boolean;
}

export const getBasePath = (basePath?: string): string => {
  const base = basePath || joinPath(tmpdir(), 'node-internetmarke');
  mkdirSync(base, { recursive: true });

  return base;
};

const extractArchive = async (
  filename: string,
  order: Order,
  options: DownloadOptions = {}
): Promise<DownloadLinks> => {
  const links: DownloadLinks = {};

  const basePath = getBasePath(options.path);

  await new Promise<void>(resolve => {
    const promises: Promise<void>[] = [];
    let i = 0;

    yauzl.open(joinPath(basePath, filename), { lazyEntries: true }, (zipErr, zipfile) => {
      if (!zipErr && zipfile) {
        zipfile.readEntry();
        zipfile.on('entry', (entry: Entry) => {
          const index = i;
          i += 1;

          zipfile.openReadStream(entry, (entryErr, readstream) => {
            if (!entryErr && readstream) {
              readstream.on('end', () => {
                zipfile.readEntry();
              });

              const promise = new Promise<void>(rsv => {
                const voucherId =
                  order.shoppingCart.voucherList.voucher[index]?.voucherId ||
                  `im-${order.shoppingCart.shopOrderId}-${index}`;
                const voucherPath = joinPath(
                  basePath,
                  `${voucherId}${entry.fileName.substr(entry.fileName.lastIndexOf('.'))}`
                );
                const stream = createWriteStream(voucherPath);

                stream.on('finish', () => {
                  links[voucherId] = voucherPath;

                  rsv();
                });

                readstream.pipe(stream);
              });
              promises.push(promise);
            }
          });
        });

        zipfile.on('end', () => {
          Promise.all(promises).then(() => resolve());
        });
      }
    });
  });

  return links;
};

/**
 * Downloads the file corresponding to the given order. This will also extract
 * archives if the order contains PNG vouchers.
 *
 * @param order The order information as retrieved from the 1C4A service.
 * @param options Download options to customize the download.
 */
export const downloadOrder = async (
  order: Order,
  options: DownloadOptions = {}
): Promise<DownloadLinks> => {
  let links: DownloadLinks = {};

  const vouchers = order.shoppingCart.voucherList.voucher;
  const res = await axios.get(order.link, { responseType: 'arraybuffer' });
  let filename: string = res.headers['content-disposition'].substr(
    res.headers['content-disposition'].lastIndexOf('=') + 1
  );
  const { data } = res;

  const basePath = getBasePath(options.path);

  const type: string = res.headers['content-type'];
  const isArchive = 'application/zip' === type;

  const id =
    1 === vouchers.length && !isArchive
      ? vouchers[0].voucherId
      : `im-${order.shoppingCart.shopOrderId}`;
  filename = `${id}${filename.substr(filename.lastIndexOf('.'))}`;

  vouchers.forEach(({ voucherId }) => {
    links[voucherId] = joinPath(basePath, filename);
  });

  const filePath = joinPath(basePath, filename);

  writeFileSync(filePath, data);

  if (isArchive && false !== options.extractArchive) {
    links = await extractArchive(filename, order, options);

    if (false !== options.deleteArchive) {
      unlinkSync(filePath);
    }
  }

  return links;
};
