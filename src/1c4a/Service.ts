import { inject, injectable } from 'inversify';

import { TYPES } from '../di/types';
import { InternetmarkeError, SoapError, UserError } from '../Error';
import { ProductError } from '../prodWs/Error';
import { Product } from '../prodWs/product';
import { DataStore } from '../services/DataStore';
import { SoapService } from '../services/Soap';
import { User, UserCredentials, UserInfo } from '../User';
import { amountToCents, parseAmount } from '../utils/amount';
import { parseAddress, SimpleAddress } from './address';
import CountryCode from './countryCode';
import {
  AddressError,
  CheckoutError,
  OneClickForAppError,
  PageFormatError,
  PartnerError,
  VoucherLayoutError
} from './Error';
import { GalleryItem, ImageItem, MotiveLink } from './gallery';
import { Order, parseOrder, ShoppingCartItem, ShoppingCartSummary } from './order';
import { PageFormat, PageFormatPosition } from './pageFormat';
import { Partner, PartnerCredentials } from './Partner';
import { VoucherFormat, VoucherLayout } from './voucher';

export interface OneClickForAppServiceOptions {
  /** The partner credentials to pass to the service. */
  partner: PartnerCredentials;
  /**
   * The user credentials of the Portokasse account to authenticate at the
   * service.
   */
  user: UserCredentials;
  /**
   * The global default voucher layout that is used if no layout is passed with
   * a voucher.
   */
  voucherLayout?: VoucherLayout;
}

export interface PreviewVoucherOptions {
  /**
   * The desired page format as retreived from `retrievePageFormats()`. This
   * will transform  the voucher into a pdf.
   */
  pageFormat?: PageFormat;
  /**
   * The image item that should be displayed next to the voucher. Image items
   * can only be dislayed in FrankingZone mode.
   */
  imageItem?: ImageItem;
  /** The voucher layout that should be used for the preview. */
  voucherLayout?: VoucherLayout;
}

export interface ShoppingCartItemOptions {
  /**
   * The image item attached to the voucher. This assumes the voucher layout to
   * be FrankingZone.
   */
  imageItem?: ImageItem;
  /**
   * The voucher layout that should be used. This is mandatory if the voucher
   * layout has not been set during service init.
   */
  voucherLayout?: VoucherLayout;
  /**
   * The position of the voucher within the generated pdf. This will be ignores
   * for PNG format vouchers. The position is mandatory if there is no complete
   * pageFormat object passed to `checkoutShoppingCart()`.
   */
  position?: PageFormatPosition;
  /**
   * The sender address including name and company in simple format. Sender
   * expects receiver to also exist and will merge the valued into an address
   * binding.
   */
  sender?: SimpleAddress;
  /**
   * The receiver address including name and company in simple format. Receiver
   * expects sender to also exist and will merge the valued into an address
   * binding.
   */
  receiver?: SimpleAddress;
}

export enum ShippingList {
  NoList,
  CreateList,
  CreateListWithAddresses
}

export interface CheckoutShoppingCartOptions {
  /** The order id that should be used. Will be generated if not set. */
  shopOrderId?: number;
  /**
   * The page format to use for all vouchers. This will turn the vouchers into a combined pdf file.
   */
  pageFormat?: PageFormat;
  /** If set there will be a generated a manifest pdf with the order information. */
  createManifest?: boolean;
  /**
   * ShippingList generates a pdf with all ordered vouchers on checkout
   * depending on the selected option. Default is `NoList`.
   */
  createShippingList?: ShippingList;
  /**
   * Dryrun will not send the request to the backend and will only validate the data locally and log
   * the results to the debug namespace `internetmarke:1c4a`.
   */
  dryrun?: boolean;
}

/**
 * The public definition of the OneClickForApp service.
 */
export interface OneClickForApp {
  getUserInfo(): Promise<UserInfo>;
  retrievePageFormats(): Promise<PageFormat[]>;
  retrievePageFormat(id: number): Promise<PageFormat | null>;
  createShopOrderId(): Promise<number | null>;
  retrievePublicGallery(): Promise<GalleryItem[]>;
  retrievePrivateGallery(): Promise<MotiveLink[]>;
  retrievePreviewVoucher(product: Product, options: PreviewVoucherOptions): Promise<string | null>;
  addItemToShoppingCart(product: Product, options: ShoppingCartItemOptions): number;
  getItemFromShoppingCart(index: number): ShoppingCartItem | null;
  removeItemFromShoppingCart(index: number): ShoppingCartItem | null;
  getShoppingCartSummary(): ShoppingCartSummary;
  checkoutShoppingCart(options: CheckoutShoppingCartOptions): Promise<Order | null>;
  retrieveOrder(shopOrderId: number): Promise<Order | null>;
}

const WSDL = 'https://internetmarke.deutschepost.de/OneClickForAppV3/OneClickForAppServiceV3?wsdl';

/**
 * The implementation of the 1C4A / OneClickForApp service of the Deutsche Post
 * that handles the voucher ordering process and access to related data.
 */
@injectable()
export class OneClickForAppService extends SoapService implements OneClickForApp {
  protected wsdl = WSDL;

  private defaults: { voucherLayout: VoucherLayout | null } = {
    voucherLayout: null
  };

  private shoppingCart: (ShoppingCartItem | null)[];

  constructor(
    @inject(TYPES.Partner) private partner: Partner,
    @inject(TYPES.User) private user: User,
    @inject(TYPES.PageFormatStore) private pageFormatStore: DataStore<PageFormat>,
    @inject(TYPES.MotiveLinkStore) private privateGalleryStore: DataStore<MotiveLink>,
    @inject(TYPES.GalleryItemStore) private publicGalleryStore: DataStore<GalleryItem>,
    @inject(TYPES.LoggerFactory) getLogger: any,
    @inject(TYPES.SoapClientFactory) getSoapClient: any
  ) {
    super(getSoapClient);

    this.shoppingCart = [];
    this.log = getLogger('1c4a');
  }

  /**
   * Initializes the connection to the OneClickPerApp service and authenticates
   * the user.
   */
  public async init(options: OneClickForAppServiceOptions): Promise<void> {
    if (!options.partner) {
      throw new PartnerError('Missing partner credentials for OneClickForApp service init.');
    }
    if (!options.user) {
      throw new UserError('Missing user credentials for OneClickForApp service init.');
    }

    this.partner.setCredentials(options.partner);
    this.user.setCredentials(options.user);

    if (options.voucherLayout) {
      this.defaults.voucherLayout = options.voucherLayout;
    }

    await this.checkSoapClient();

    const success = await this.login();

    if (success) {
      // init stores
      await this.pageFormatStore.init('pageformat.json', this.updatePageFormats.bind(this));
      await this.privateGalleryStore.init(
        'privategallery.json',
        this.updatePrivateGallery.bind(this)
      );
      await this.publicGalleryStore.init('publicgallery.json', this.updatePublicGallery.bind(this));
    } else {
      throw new OneClickForAppError('Unable to login with the given credentials');
    }
  }

  /**
   * Retrieves all available information about the authenticated user.
   */
  public async getUserInfo(): Promise<UserInfo> {
    return this.user.getInfo();
  }

  /**
   * Retrieves the page formats available for pdf voucher format.
   */
  public async retrievePageFormats(): Promise<PageFormat[]> {
    await this.checkServiceInit(
      'Cannot retrieve page formats before initializing OneClickForApp service'
    );

    return this.pageFormatStore.getList();
  }

  /**
   * Retrieve the page formats with the given id if existing.
   */
  public async retrievePageFormat(id: number): Promise<PageFormat | null> {
    await this.checkServiceInit(
      'Cannot retrieve page format before initializing OneClickForApp service'
    );

    return this.pageFormatStore.getItem(id);
  }

  /**
   * Creates a globally unique order id to pass during checkout.
   */
  public async createShopOrderId(): Promise<number | null> {
    await this.checkServiceInit(
      'Cannot create shop order id before initializing OneClickForApp service'
    );

    return this.soapClient
      .createShopOrderIdAsync({
        userToken: this.user.getToken()
      })
      .then(([response]: any) => {
        if (response) {
          const shopOrderId = +response.shopOrderId;
          this.user.addOrderId(shopOrderId);

          this.log('Created new shopOrderId %d', shopOrderId);

          return shopOrderId;
        }

        return null;
      })
      .catch((e: any) => {
        this.log('createShopOrderId', e.root?.Envelope.Body.Fault || e);
        throw new SoapError(e.root?.Envelope.Body.Fault.faultstring || e.message);
      });
  }

  /**
   * Retrieves all available gallery categories and images from the public
   * gallery provided by Deutsche Post.
   */
  public async retrievePublicGallery(): Promise<GalleryItem[]> {
    await this.checkServiceInit(
      'Cannot retrieve public gallery before initializing OneClickForApp service'
    );

    return this.publicGalleryStore.getList();
  }

  /**
   * Retrieves all images from the private gallery of the authenticated user.
   */
  public async retrievePrivateGallery(): Promise<MotiveLink[]> {
    await this.checkServiceInit(
      'Cannot retrieve private gallery before initializing OneClickForApp service'
    );

    return this.privateGalleryStore!.getList();
  }

  /**
   * Generates a preview what the voucher will look like. A pageFormat will
   * result in a pdf voucher. ImageItems can only be used in FrankingZone
   * layouts.
   *
   * @param product The product that shoud be previewed.
   * @param options Additional formatting options to customize the voucher.
   */
  public async retrievePreviewVoucher(
    product: Product,
    options: PreviewVoucherOptions = {}
  ): Promise<string | null> {
    await this.checkServiceInit(
      'Cannot preview voucher before initializing OneClickForApp service'
    );

    const voucherLayout = options.voucherLayout || this.defaults.voucherLayout;
    if (!voucherLayout) {
      throw new VoucherLayoutError(
        'Missing voucherLayout. Please pass to retrievePreviewVoucher options or during service init.'
      );
    }

    const voucherFormat = options.pageFormat ? VoucherFormat.PDF : VoucherFormat.PNG;
    const previewVoucher = `retrievePreviewVoucher${voucherFormat}Async`;

    const payload: any = {
      productCode: product.id
    };
    if (options.imageItem) {
      if (VoucherLayout.AddressZone === voucherLayout) {
        throw new VoucherLayoutError('Cannot add image to voucher in AddressZone mode');
      }

      payload.imageID = options.imageItem.imageID;
    }
    payload.voucherLayout = voucherLayout;
    if (options.pageFormat) {
      payload.pageFormatId = options.pageFormat.id;
    }

    return this.soapClient[previewVoucher](payload)
      .then(([response]: any) => {
        if (response) {
          return response.link;
        }

        return null;
      })
      .catch((e: any) => {
        this.log('retrievePreviewVoucher', e.root.Envelope.Body.Fault);
        throw new SoapError(e.root.Envelope.Body.Fault.faultstring);
      });
  }

  /**
   * Adds the given product to virtual local shopping cart and attaches the
   * given options to it. The shopping cart is used to store vouchers prior to
   * checkout.
   *
   * @param product The product that should be ordered.
   * @param options Options to customize the given product.
   * @returns The index of the item within the shopping cart.
   */
  public addItemToShoppingCart(product: Product, options: ShoppingCartItemOptions = {}): number {
    const voucherLayout = options.voucherLayout || this.defaults.voucherLayout;
    if (!voucherLayout) {
      throw new VoucherLayoutError(
        'Missing voucherLayout. Please pass to addItemToShoppingCard options or during service init.'
      );
    }

    const position: ShoppingCartItem = {
      productCode: product.id
    };
    if (options.imageItem) {
      if (VoucherLayout.AddressZone === voucherLayout) {
        throw new VoucherLayoutError('Cannot add image to voucher in AddressZone mode');
      }

      position.imageID = options.imageItem.imageID;
    }
    if (options.sender || options.receiver) {
      if (!options.sender || !options.receiver) {
        throw new AddressError('Address muss be available for sender and receiver if one is given');
      }

      if (VoucherLayout.FrankingZone === voucherLayout) {
        throw new VoucherLayoutError('Cannot add address data to voucher in FrankingZone mode');
      }

      const sender = parseAddress(options.sender);
      const receiver = parseAddress(options.receiver);

      position.address = { sender, receiver };

      if (undefined !== product.domestic) {
        // domestic product for abroad address
        if (product.domestic && CountryCode.DEU !== receiver.address.country) {
          throw new ProductError(
            'Domestic products cannot be used for international receiver addresses'
          );
        }
        // internatiomal product for national receiver address
        else if (!product.domestic && CountryCode.DEU === receiver.address.country) {
          throw new ProductError(
            'International products should not be used for national receiver addresses'
          );
        }
      }
    }

    if (product.ppl) {
      position.ppl = product.ppl;
    }

    if (product.price) {
      position.price = parseAmount(product.price);
    } else {
      throw new ProductError('Missing price information for product');
    }
    position.voucherLayout = voucherLayout;
    if (options.position) {
      position.position = options.position;
    }

    this.shoppingCart.push(position);

    return this.shoppingCart.length - 1;
  }

  /**
   * Retrieves a copy of the shopping cart item at the give index if existing.
   *
   * @param index The index of the desired shopping cart item.
   */
  public getItemFromShoppingCart(index: number): ShoppingCartItem | null {
    return this.shoppingCart[index] ? { ...this.shoppingCart[index]! } : null;
  }

  /**
   * Removes the shopping cart item from the list if available. This will not
   * change affect other item indices.
   *
   * @param index The index of the item that should be removed
   * @returns The removed item if found.
   */
  public removeItemFromShoppingCart(index: number): ShoppingCartItem | null {
    const item = this.shoppingCart[index];

    if (item) {
      this.shoppingCart[index] = null;
    }

    return item;
  }

  /**
   * Generates a brief summary of the items in the shopping cart.
   */
  public getShoppingCartSummary(): ShoppingCartSummary {
    let total = 0;
    const positions: any = this.shoppingCart
      .map(position => {
        if (position) {
          total += amountToCents(position.price);
        }

        return position;
      })
      .filter(position => !!position);

    return {
      positions,
      total: parseAmount(total)
    };
  }

  /**
   * Performs a checkout and retrieves the ordered vouchers.
   * This will charge your Portokasse account (User) if successful!
   * Add the dryrun option to simulate the checkout only and validate the
   * shopping cart.
   *
   * @param options The checkout options to customize the vouchers.
   */
  public async checkoutShoppingCart(
    options: CheckoutShoppingCartOptions = {}
  ): Promise<Order | null> {
    await this.checkServiceInit(
      'Cannot checkout shopping cart before initializing OneClickForApp service'
    );

    if (!this.shoppingCart.length) {
      throw new CheckoutError('Cannot checkout empty shopping cart');
    }

    const isPdfVoucher = !!options.pageFormat;
    const voucherFormat = isPdfVoucher ? VoucherFormat.PDF : VoucherFormat.PNG;
    const checkout = `checkoutShoppingCart${voucherFormat}Async`;

    const payload: any = {
      userToken: this.user.getToken()
    };
    if (options.shopOrderId) {
      payload.shopOrderId = options.shopOrderId;
    }
    if (options.pageFormat) {
      payload.pageFormatId = options.pageFormat.id;
    }

    let positionMap: number[] | null = null;

    // initialize positions
    let pageFormatX = 0;
    let pageFormatY = 0;
    if (isPdfVoucher && options.pageFormat?.pageLayout?.labelCount) {
      positionMap = [];
      pageFormatX = options.pageFormat!.pageLayout.labelCount.labelX;
      pageFormatY = options.pageFormat!.pageLayout.labelCount.labelY;
    }

    let total = 0;
    payload.ppl = 0;
    payload.positions = this.shoppingCart
      .filter(position => !!position)
      .map((position, i) => {
        const pos = { ...position };

        if (pos) {
          total += amountToCents(pos.price!);
          delete pos.price;

          if (pos.ppl && pos.ppl > payload.ppl) {
            payload.ppl = pos.ppl;
            delete pos.ppl;
          }

          if (isPdfVoucher) {
            if (!pos.position) {
              // cannot generatie positions
              if (!positionMap) {
                throw new CheckoutError(
                  'Position data is mandatory for shoppingCartItems if no pageFormat object is provided'
                );
              }

              this.placeToFirstEmpty(positionMap, i);
            } else if (positionMap) {
              const { labelX, labelY, page } = pos.position;
              // check if position is in range
              if (
                1 > labelX ||
                pageFormatX < labelX ||
                1 > labelY ||
                pageFormatY < labelY ||
                1 > page!
              ) {
                throw new PageFormatError(
                  `PageFormat position is out of range. Range is 1:1 to ${pageFormatX}:${pageFormatY}, given is ${labelX}:${labelY} (page: ${page})`
                );
              }
              // put item into map
              const posIndex =
                labelX -
                1 +
                pageFormatX * (labelY - 1) +
                pageFormatX * pageFormatY * ((page || 1)! - 1);

              const formerIndex = positionMap[posIndex];
              positionMap[posIndex] = i;
              // move former index to the next empty position
              if (undefined !== formerIndex) {
                this.placeToFirstEmpty(positionMap, formerIndex);
              }
            }
          }
        }

        return pos as ShoppingCartItem;
      });

    if (!payload.ppl) {
      delete payload.ppl;
    }

    // set missing position information for given pageFormat
    if (positionMap?.length) {
      const { labelX, labelY } = options.pageFormat!.pageLayout.labelCount;
      const pageSize = labelX * labelY;

      positionMap.forEach((itemIndex, posIndex) => {
        const page = Math.floor(posIndex / pageSize) + 1;
        const x = ((posIndex % pageSize) % labelX) + 1;
        const y = Math.floor((posIndex % pageSize) / labelX) + 1;

        payload.positions[itemIndex].position = {
          labelX: x,
          labelY: y,
          page
        } as PageFormatPosition;
      });
    }

    payload.total = total;
    if (options.createManifest) {
      payload.createManifest = options.createManifest;
    }
    if (options.createShippingList) {
      payload.createShippingList = options.createShippingList;
    }

    // dryrun, don't request checkout
    if (options.dryrun || (undefined === options.dryrun && 'test' === process.env.NODE_ENV)) {
      delete payload.userToken;
      this.log('[dryrun] checkout request payload:', JSON.stringify(payload));

      if ('test' === process.env.NODE_ENV) {
        return payload;
      }

      return {} as any;
    }

    return this.soapClient[checkout](payload)
      .then(([response]) => {
        const order = parseOrder(response);

        if (order) {
          this.user.load({
            walletBalance: response.walletBallance || response.walletBalance
          });
          this.user.addOrderId(order.shoppingCart.shopOrderId!);

          this.shoppingCart = [];

          this.log(
            'checkout successful, shopOrderId: %s with %d voucher(s)',
            order.shoppingCart.shopOrderId,
            order.shoppingCart.vouchers.length
          );
        }

        return order;
      })
      .catch((e: any) => {
        this.log('checkoutShoppingCart', e.root?.Envelope.Body.Fault || e.message);
        throw new SoapError(e.root?.Envelope.Body.Fault.faultstring || e.message);
      });
  }

  /**
   * Retrieves the order information of an existing order with the given id.
   *
   * @param shopOrderId The order information that hold the data about the vouchers.
   */
  public async retrieveOrder(shopOrderId: number): Promise<Order | null> {
    await this.checkServiceInit('Cannot retrieve order before initializing OneClickForApp service');

    return this.soapClient
      .retrieveOrderAsync({
        userToken: this.user.getToken(),
        shopOrderId
      })
      .then(([response]: any) => {
        return parseOrder(response);
      })
      .catch((e: any) => {
        this.log('retrieve order error', e.root?.Envelope.Body.Fault || e);
        throw new SoapError(e.root?.Envelope.Body.Fault.faultstring || e.message);
      });
  }

  protected initSoapClient(): void {
    this.soapClient.addSoapHeader(this.partner.getSoapHeaders());
  }

  protected async checkServiceInit(msg: string): Promise<void> {
    if (this.isInitialized()) {
      // try to refresh token
      // await this.login();
    }

    if (!this.user.isAuthenticated()) {
      throw new InternetmarkeError(msg);
    }
  }

  private login(): Promise<boolean> {
    return this.soapClient
      .authenticateUserAsync(this.user.getCredentials())
      .then(([response]: any) => {
        if (response) {
          this.log('logged in to 1C4A service');
          this.user.load(response, true);
        }

        return !!response;
      })
      .catch((e: any) => {
        this.log('authenticateUser', e.root?.Envelope.Body.Fault || e);
        const error = new SoapError(e.root?.Envelope.Body.Fault.faultstring || e.message);
        if (e.root) {
          (error as any).root = e.root;
        }
      });
  }

  private placeToFirstEmpty(positionMap: number[], index: number): void {
    let placed = false;

    for (let i = 0; positionMap.length > i; i += 1) {
      if (undefined === positionMap[i]) {
        /* eslint-disable no-param-reassign */
        positionMap[i] = index;
        placed = true;
        this.log('  found place @ %d', i);
        break;
      }
    }

    if (!placed) {
      positionMap.push(index);
    }
  }

  private async updatePageFormats(): Promise<{ [id: number]: PageFormat }> {
    const content: { [id: number]: PageFormat } = {};
    await this.checkSoapClient();

    await this.soapClient
      .retrievePageFormatsAsync({})
      .then(([response]: any) => {
        if (response) {
          response.pageFormat.forEach((pageFormat: PageFormat) => {
            content[+pageFormat.id] = pageFormat;
          });
        }
      })
      .catch((e: any) => {
        this.log('retrievePageFormats', e.root?.Envelope.Body.Fault || e);
        // throw new SoapError(e.root.Envelope.Body.Fault.faultstring);
      });

    return content;
  }

  private async updatePublicGallery(): Promise<{ [id: number]: GalleryItem }> {
    const content: { [id: number]: GalleryItem } = {};

    await this.soapClient
      .retrievePublicGalleryAsync({})
      .then(([response]: any) => {
        if (response) {
          response.items.forEach((item: GalleryItem) => {
            content[+item.categoryId] = item;
          });
        }
      })
      .catch((e: any) => {
        this.log('retrievePublicGallery', e.root.Envelope.Body.Fault);
        // throw new SoapError(e.root.Envelope.Body.Fault.faultstring);
      });

    return content;
  }

  private async updatePrivateGallery(): Promise<{ [id: number]: MotiveLink }> {
    const content: { [id: number]: MotiveLink } = {};

    await this.soapClient
      .retrievePrivateGalleryAsync({ userToken: this.user.getToken() })
      .then(([response]: any) => {
        if (response) {
          response.imageLink.forEach((link: MotiveLink) => {
            content[link.link] = link;
          });
        }
      })
      .catch((e: any) => {
        this.log('retrievePrivateGallery', e.root.Envelope.Body.Fault);
        // throw new SoapError(e.root.Envelope.Body.Fault.faultstring);
      });

    return content;
  }
}
