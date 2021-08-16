import {
  CheckoutShoppingCartOptions,
  OneClickForApp,
  OneClickForAppService,
  OneClickForAppServiceOptions,
  PreviewVoucherOptions,
  ShoppingCartItemOptions
} from './1c4a/Service';
import CountryCode from './1c4a/countryCode';
import { DownloadOptions, DownloadLinks, downloadOrder } from './1c4a/download';
import { GalleryItem, MotiveLink } from './1c4a/gallery';
import { Order, ShoppingCartItem, ShoppingCartSummary } from './1c4a/order';
import { PageFormat } from './1c4a/pageFormat';
import { InternetmarkeError } from './Error';
import { UserInfo } from './User';
import container from './di/inversify-config';
import { TYPES } from './di/types';
import {
  PaymentMethod,
  PaymentResponse,
  Portokasse,
  PortokasseService,
  PortokasseServiceOptions
} from './portokasse/Service';
import { Journal, JournalOptions } from './portokasse/journal';
import { ProductService, ProductServiceOptions, ProdWS } from './prodWs/Service';
import { Product } from './prodWs/product';
import { Amount } from './utils/amount';
import { Catalog } from './prodWs/catalog';

// export types and interfaces
export { UserCredentials, UserInfo } from './User';
// 1C4A
export { PartnerCredentials } from './1c4a/Partner';
export {
  CheckoutShoppingCartOptions,
  OneClickForAppServiceOptions,
  PreviewVoucherOptions,
  ShoppingCartItemOptions
} from './1c4a/Service';
export { SimpleAddress } from './1c4a/address';
export { CountryCode };
export { DownloadLinks, DownloadOptions } from './1c4a/download';
export { GalleryItem, ImageItem, MotiveLink } from './1c4a/gallery';
export { Order, ShoppingCartItem, ShoppingCartSummary } from './1c4a/order';
export {
  PageFormat,
  PageFormatPosition,
  PageFormatOrientation,
  PageFormatPageType
} from './1c4a/pageFormat';
export { Voucher, VoucherFormat, VoucherLayout } from './1c4a/voucher';
// Portokasse
export { PaymentMethod, PaymentResponse, PortokasseServiceOptions } from './portokasse/Service';
export {
  Journal,
  JournalDays,
  JournalEntry,
  JournalEntryState,
  JournalEntryType,
  JournalOptions,
  JournalRange
} from './portokasse/journal';
// ProdWS
export { ClientCredentials } from './prodWs/Client';
export { ProductServiceOptions } from './prodWs/Service';

/**
 * Main class of the internetmarke package with access to all available methods.
 */
export class Internetmarke implements OneClickForApp, Portokasse, ProdWS {
  protected oneClick4AppService: OneClickForAppService;

  protected portokasseService: PortokasseService;

  protected productService: ProductService;

  constructor() {
    this.init();
  }

  //
  // 1C4A
  //

  /**
   * Initializes the connection to the OneClickPerApp service and authenticates
   * the user.
   */
  public async initOneClickForAppService(
    options: OneClickForAppServiceOptions
  ): Promise<OneClickForAppService> {
    await this.oneClick4AppService.init(options);

    return this.oneClick4AppService;
  }

  /**
   * Retrieves all available information about the Portokasse user.
   */
  public async getUserInfo(): Promise<UserInfo> {
    let info: UserInfo | null = null;

    if (this.portokasseService.isInitialized()) {
      info = await this.portokasseService.getUserInfo();
    }

    if (!info && !this.oneClick4AppService.isInitialized()) {
      throw new InternetmarkeError(
        'Cannot get user info before initializing OneClickForApp service'
      );
    }

    if (this.oneClick4AppService.isInitialized()) {
      const extended = await this.oneClick4AppService.getUserInfo();
      extended.walletBalance = info?.walletBalance;

      info = extended;
    }

    return info!;
  }

  /**
   * Retrieves the page formats available for pdf voucher format.
   */
  public retrievePageFormats(): Promise<PageFormat[]> {
    return this.oneClick4AppService.retrievePageFormats();
  }

  /**
   * Retrieves the page formats with the given id if existing.
   */
  public retrievePageFormat(id: number): Promise<PageFormat | null> {
    return this.oneClick4AppService.retrievePageFormat(id);
  }

  /**
   * Creates a globally unique order id to pass during checkout.
   */
  public createShopOrderId(): Promise<number | null> {
    return this.oneClick4AppService.createShopOrderId();
  }

  /**
   * Retrieves all available gallery categories and images from the public
   * gallery provided by Deutsche Post.
   */
  public retrievePublicGallery(): Promise<GalleryItem[]> {
    return this.oneClick4AppService.retrievePublicGallery();
  }

  /**
   * Retrieves all images from the private gallery of the authenticated user.
   */
  public retrievePrivateGallery(): Promise<MotiveLink[]> {
    return this.oneClick4AppService.retrievePrivateGallery();
  }

  /**
   * Generates a preview what the voucher will look like. A pageFormat will
   * result in a pdf voucher. ImageItems can only be used in FrankingZone
   * layouts.
   *
   * @param product The product that shoud be previewed.
   * @param options Additional formatting options to customize the voucher.
   */
  public retrievePreviewVoucher(
    product: Product,
    options: PreviewVoucherOptions = {}
  ): Promise<string | null> {
    return this.oneClick4AppService.retrievePreviewVoucher(product, options);
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
    return this.oneClick4AppService.addItemToShoppingCart(product, options);
  }

  /**
   * Retrieves a copy of the shopping cart item at the give index if existing.
   *
   * @param index The index of the desired shopping cart item.
   */
  public getItemFromShoppingCart(index: number): ShoppingCartItem | null {
    return this.oneClick4AppService.getItemFromShoppingCart(index);
  }

  /**
   * Removes the shopping cart item from the list if available. This will not
   * change affect other item indices.
   *
   * @param index The index of the item that should be removed
   * @returns The removed item if found.
   */
  public removeItemFromShoppingCart(index: number): ShoppingCartItem | null {
    return this.oneClick4AppService.removeItemFromShoppingCart(index);
  }

  /**
   * Generates a brief summary of the items in the shopping cart.
   */
  public getShoppingCartSummary(): ShoppingCartSummary {
    return this.oneClick4AppService.getShoppingCartSummary();
  }

  /**
   * Performs a checkout and retrieves the ordered vouchers.
   * This will charge your Portokasse account (User) if successful!
   * Add the dryrun option to simulate the checkout only and validate the
   * shopping cart.
   *
   * @param options The checkout options to customize the vouchers.
   */
  public checkoutShoppingCart(options: CheckoutShoppingCartOptions = {}): Promise<Order | null> {
    return this.oneClick4AppService.checkoutShoppingCart(options);
  }

  /**
   * Retrieves the order information of an existing order with the given id.
   *
   * @param shopOrderId The order information that hold the data about the
   *  vouchers.
   */
  public async retrieveOrder(shopOrderId: number): Promise<Order | null> {
    return this.oneClick4AppService.retrieveOrder(shopOrderId);
  }

  /**
   * Downloads the file corresponding to the given order. This will also extract
   * archives if the order contains PNG vouchers.
   *
   * @param order The order information as retrieved from the 1C4A service.
   * @param options Download options to customize the download.
   */
  /* eslint-disable class-methods-use-this */
  public async downloadOrder(order: Order, options: DownloadOptions = {}): Promise<DownloadLinks> {
    return downloadOrder(order, options);
  }

  //
  // ProdWS
  //

  /**
   * Initializes the product service and makes it ready to use with the
   * registered client account.
   *
   * @param options Product service options to manipulate the default behaviour.
   */
  public async initProductService(options: ProductServiceOptions): Promise<ProductService> {
    await this.productService.init(options);

    return this.productService;
  }

  /**
   * Retrieves the list of available catalogs from the service.
   */
  public getCatalogList(): Promise<Catalog[]> {
    return this.productService.getCatalogList();
  }

  /**
   * Retrieves the catalog with the given name if existing.
   *
   * @param name The name of the catalog that should be retrieved.
   */
  public getCatalog(name: string): Promise<Catalog | null> {
    return this.productService.getCatalog(name);
  }

  /**
   * Retrieves the list of available products from the service.
   *
   * @param date An optional date that loads the product list at the given date.
   */
  public getProductList(date?: Date): Promise<Product[]> {
    return this.productService.getProductList(date);
  }

  /**
   * Retrieves the product with the given id if existing.
   *
   * @param id The id of the product that should be retrieved.
   */
  public getProduct(id: number): Promise<Product | null> {
    return this.productService.getProduct(id);
  }

  //
  // Portokasse
  //

  /**
   * Initializes the portokasse service and makes it ready to use with the
   * registered user account.
   *
   * @param options Portokasse service options to manipulate the default
   *  behaviour.
   */
  public async initPortokasseService(
    options: PortokasseServiceOptions
  ): Promise<PortokasseService> {
    await this.portokasseService.init(options);

    return this.portokasseService;
  }

  /**
   * Tops up the Portokasse account with the given amount of money and the
   * defined payment provider or type.
   *
   * @param amount The amout you want to charge as amount object or as number in
   *  in Euro cents. Note: The minimum amount id EUR 10.
   * @param paymentMethod The type of provider you want to choose. PayPal and
   *  GiroPay both return a callback url to proceed the transaction, DirectDebit
   *  requires a one time registration at the Portokasse website prior it can
   *  be used.
   * @param bic Optional BIC of the bank account you want to be charged. This
   *  value is only used for GiroPay transactions.
   */
  public topUp(
    amount: Amount | number,
    paymentMethod: PaymentMethod,
    bic?: string
  ): Promise<PaymentResponse> {
    return this.portokasseService.topUp(amount, paymentMethod, bic);
  }

  /**
   * Get the purchase and top up journal of your account.
   *
   * @param daysOrDateRange Eigher a days or a date range option with optional
   *  offset and rows information.
   */
  public getJournal(daysOrDateRange: JournalOptions): Promise<Journal> {
    return this.portokasseService.getJournal(daysOrDateRange);
  }

  protected init(): void {
    this.oneClick4AppService = container.get<OneClickForAppService>(TYPES.OneClickForAppService);
    this.portokasseService = container.get<PortokasseService>(TYPES.PortokasseService);
    this.productService = container.get<ProductService>(TYPES.ProductService);
  }
}

export default Internetmarke;
