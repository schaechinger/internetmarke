import { Debugger } from 'debug';
import { Product } from '../prodWs/product';
import { DataStore } from '../services/DataStore';
import { SoapService } from '../services/Soap';
import { getLogger } from '../utils/logger';
import { AddressBinding } from './address';
import {
  CheckoutError,
  OneClickForAppError,
  PageFormatError,
  UserError,
  VoucherLayoutError
} from './Error';
import { GalleryItem, ImageItem, MotiveLink } from './gallery';
import { Order, ShoppingCartItem, ShoppingCartSummary } from './order';
import { PageFormat, PageFormatPosition } from './pageFormat';
import { Partner, PartnerCredentials } from './Partner';
import { User, UserCredentials, UserInfo } from './User';
import { VoucherFormat, VoucherLayout } from './voucher';

export interface OneCLickForAppServiceOptions {
  partner: PartnerCredentials;
  user: UserCredentials;
  voucherLayout?: VoucherLayout;
}

export interface PreviewVoucherOptions {
  pageFormat?: PageFormat;
  imageItem?: ImageItem;
  voucherLayout?: VoucherLayout;
}

export interface ShoppingCartOptions {
  imageItem?: ImageItem;
  voucherLayout?: VoucherLayout;
  addressBinding?: AddressBinding;
  position?: PageFormatPosition;
}

export enum ShippingList {
  NoList,
  CreateList,
  CreateListWithAddresses
}

export interface CheckoutShoppingCartOptions {
  shopOrderId?: string;
  pageFormat?: PageFormat;
  createManifest?: boolean;
  createShippingList?: ShippingList;
  dryrun?: boolean;
}

/**
 * The public definition of the OneClickForApplication service.
 */
export interface OneClickForApp {
  getUserInfo(): UserInfo;
  retrievePageFormats(): Promise<PageFormat[]>;
  retrievePageFormat(id: number): Promise<PageFormat | null>;
  createShopOrderId(): Promise<number | null>;
  retrievePublicGallery(): Promise<GalleryItem[]>;
  retrievePrivateGallery(): Promise<MotiveLink[]>;
  retrievePreviewVoucher(product: Product, options: PreviewVoucherOptions): Promise<string | null>;
  addToShoppingCart(product: Product, options: ShoppingCartOptions): void;
  getShoppingCartSummary(): ShoppingCartSummary;
  checkoutShoppingCart(options: CheckoutShoppingCartOptions): Promise<any>;
  retrieveOrder(shopOrderId: number): Promise<Order | null>;
}

const WSDL = 'https://internetmarke.deutschepost.de/OneClickForAppV3/OneClickForAppServiceV3?wsdl';

export class OneClickForAppService extends SoapService implements OneClickForApp {
  protected wsdl = WSDL;
  private partner: Partner;
  private user: User;
  private defaults: { voucherLayout: VoucherLayout | null } = {
    voucherLayout: null
  };
  private pageFormatStore: DataStore<PageFormat>;
  private publicGalleryStore: DataStore<GalleryItem>;
  private privateGalleryStore: DataStore<MotiveLink>;
  private shoppingCart: ShoppingCartItem[];
  private log: Debugger;

  constructor(partnerCredentials: PartnerCredentials) {
    super();

    this.partner = new Partner(partnerCredentials);
    this.pageFormatStore = new DataStore<PageFormat>();
    this.privateGalleryStore = new DataStore<MotiveLink>();
    this.publicGalleryStore = new DataStore<GalleryItem>();
    this.shoppingCart = [];
    this.log = getLogger('1c4a');
  }

  /**
   * Authorizes an user to the api for check it's validity.
   */
  public async init(options: OneCLickForAppServiceOptions): Promise<void> {
    if (!options.user) {
      throw new UserError('Missing user credentials for OneClickForApp service init.');
    }

    this.user = new User(options.user);
    if (options.voucherLayout) {
      this.defaults.voucherLayout = options.voucherLayout;
    }

    await this.checkSoapClient();

    const success = await this.soapClient
      .authenticateUserAsync(this.user.getCredentials())
      .then(([response]: any) => {
        if (response) {
          this.log('logged in with user token %s', response.userToken);
          this.user.load(response);
        }

        return !!response;
      })
      .catch(() => {
        return false;
      });

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

  public getUserInfo(): UserInfo {
    return this.user.getInfo();
  }

  /**
   * Retrieves the page formats available for pdf mode.
   */
  public async retrievePageFormats(): Promise<PageFormat[]> {
    return this.pageFormatStore.getList();
  }

  /**
   * Retrieve the page formats with the given id if existing.
   */
  public async retrievePageFormat(id: number): Promise<PageFormat | null> {
    return this.pageFormatStore.getItem(id);
  }

  /**
   * Create a globally unique order id from the api.
   */
  public async createShopOrderId(): Promise<number | null> {
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
      });
  }

  public async retrievePublicGallery(): Promise<GalleryItem[]> {
    return this.publicGalleryStore.getList();
  }

  public async retrievePrivateGallery(): Promise<MotiveLink[]> {
    return this.privateGalleryStore!.getList();
  }

  /**
   * Generates a preview what the voucher will look like. A pageFormat will
   * result in a pdf voucher. ImageItems can only be used in FrankingZone
   * layouts.
   */
  public async retrievePreviewVoucher(
    product: Product,
    options: PreviewVoucherOptions = {}
  ): Promise<string | null> {
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
        console.log('error', e.root.Envelope.Body.Fault);
        return null;
      });
  }

  public addToShoppingCart(product: Product, options: ShoppingCartOptions = {}): void {
    if (!product) {
      return;
    }

    const voucherLayout = options.voucherLayout || this.defaults.voucherLayout;
    if (!voucherLayout) {
      throw new VoucherLayoutError(
        'Missing voucherLayout. Please pass to addToShoppingCard options or during service init.'
      );
    }

    const position: ShoppingCartItem = {
      productCode: product.id
    };
    if (options.imageItem) {
      if (VoucherLayout.AddressZone === this.defaults.voucherLayout) {
        throw new VoucherLayoutError('Cannot add image to voucher in AddressZone mode');
      }

      position.imageID = options.imageItem.imageID;
    }
    if (options.addressBinding) {
      position.addressBinding = options.addressBinding;
    }
    position.price = product.price;
    position.voucherLayout = voucherLayout;
    if (options.position) {
      position.position = options.position;
    }

    this.shoppingCart.push(position);
  }

  public getShoppingCartSummary(): any {
    let total = 0;
    const positions: any = this.shoppingCart.map(position => {
      total += position.price!.value;

      return position;
    });

    return {
      positions,
      total: {
        value: total,
        currency: 'EUR'
      }
    };
  }

  /**
   * Performs a checkout and retrieves the ordered vouchers.
   *
   * @param order The order information that hold the data about the vouchers.
   * @param outputFormat The format the voucher should have.
   */
  public async checkoutShoppingCart(
    options: CheckoutShoppingCartOptions = {}
  ): Promise<Order | null> {
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
    payload.positions = this.shoppingCart.map((position, i) => {
      total += position.price!.value * 100;
      delete position.price;

      if (isPdfVoucher) {
        if (!position.position) {
          // cannot generatie positions
          if (!positionMap) {
            throw new CheckoutError(
              'Position data is mandatory for shoppingCartItems if no pageFormat object is provided'
            );
          }

          this.placeToFirstEmpty(positionMap, i);
        } else if (positionMap) {
          const { labelX, labelY, page } = position.position;
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

          let formerIndex = positionMap[posIndex];
          positionMap[posIndex] = i;
          // move former index to the next empty position
          if (undefined !== formerIndex) {
            this.placeToFirstEmpty(positionMap, formerIndex);
          }
        }
      }

      return position as ShoppingCartItem;
    });

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
    if (options.dryrun) {
      delete payload.userToken;
      this.log('[dryrun] checkout request payload:', JSON.stringify(payload));

      return null;
    }

    return this.soapClient[checkout](payload)
      .then(([response]: [Order]) => {
        if (response) {
          if (response.shoppingCart.shopOrderId) {
            response.shoppingCart.shopOrderId = +response.shoppingCart.shopOrderId;
          }

          this.user.load({
            walletBalance: response.walletBallance || (response as any).walletBalance
          });
          this.user.addOrderId(response.shoppingCart.shopOrderId!);

          this.shoppingCart = [];
        }

        this.log('checkout successful, shopOrderId: %s', response.shoppingCart.shopOrderId);

        return response;
      })
      .catch((e: any) => {
        console.log('checkout error', e.root.Envelope.Body.Fault);
        throw new OneClickForAppError(e.root.Envelope.Body.Fault);
      });
  }

  /**
   * Retrieves the order information of an existing order with the given id.
   *
   * @param shopOrderId The order information that hold the data about the vouchers.
   */
  public async retrieveOrder(shopOrderId: number): Promise<Order | null> {
    return this.soapClient
      .retrieveOrderAsync({
        userToken: this.user.getToken(),
        shopOrderId
      })
      .then(([response]: any) => {
        this.log('retrieveOrder response', JSON.stringify(response));

        return response || null;
      })
      .catch(() => {
        // order not found
        return null;
      });
  }

  protected initSoapClient(): void {
    this.soapClient.addSoapHeader(this.partner.getSoapHeaders());
  }

  private placeToFirstEmpty(positionMap: number[], index: number): void {
    let placed = false;

    for (let i = 0; positionMap.length > i; i++) {
      if (undefined === positionMap[i]) {
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

    await this.soapClient.retrievePageFormatsAsync({}).then(([response]: any) => {
      if (response) {
        response.pageFormat.forEach((pageFormat: PageFormat) => {
          content[+pageFormat.id] = pageFormat;
        });
      }
    });

    return content;
  }

  private async updatePublicGallery(): Promise<{ [id: number]: GalleryItem }> {
    const content: { [id: number]: GalleryItem } = {};

    await this.soapClient.retrievePublicGalleryAsync({}).then(([response]: any) => {
      if (response) {
        response.items.forEach((item: GalleryItem) => {
          content[+item.categoryId] = item;
        });
      }
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
      });

    return content;
  }
}
