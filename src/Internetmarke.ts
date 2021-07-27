/**
 * internetmarke
 * Copyright (c) 2018-2021 Manuel Schächinger
 * MIT Licensed
 */

import { PartnerError } from './1c4a/Error';
import { GalleryItem, MotiveLink } from './1c4a/gallery';
import { Order, ShoppingCartItem, ShoppingCartSummary } from './1c4a/order';
import { PageFormat } from './1c4a/pageFormat';
import {
  CheckoutShoppingCartOptions,
  OneClickForApp,
  OneClickForAppService,
  OneCLickForAppServiceOptions,
  PreviewVoucherOptions,
  ShoppingCartItemOptions
} from './1c4a/Service';
import { UserInfo } from './1c4a/User';
import { InternetmarkeError } from './Error';
import { ClientError } from './prodWs/Error';
import { Product } from './prodWs/product';
import { ProductService, ProductServiceOptions, ProdWS } from './prodWs/Service';
import { SoapService } from './services/Soap';

/**
 * Main class of the internetmarke package with access to all available methods.
 */
export class Internetmarke implements OneClickForApp, ProdWS {
  private oneClick4AppService: OneClickForAppService;
  private productService: ProductService;

  //
  // 1C4A
  //

  /**
   * Initializes the connection to the OneClickPerApp service and authenticates
   * the user.
   */
  public async initOneClickForAppService(
    options: OneCLickForAppServiceOptions
  ): Promise<OneClickForAppService> {
    if (!this.oneClick4AppService) {
      if (!options.partner) {
        throw new PartnerError('Missing partner credentials for OneClickForApp service init.');
      }

      this.oneClick4AppService = new OneClickForAppService(options.partner);

      await this.oneClick4AppService.init(options);
    }

    return this.oneClick4AppService;
  }

  /**
   * Retrieves all available information about the authenticated user.
   */
  getUserInfo(): UserInfo {
    this.checkService(
      this.oneClick4AppService,
      'Cannot get user info before initializing OneClickForApp service'
    );

    return this.oneClick4AppService.getUserInfo();
  }

  /**
   * Retrieves the page formats available for pdf voucher format.
   */
  public retrievePageFormats(): Promise<PageFormat[]> {
    this.checkService(
      this.oneClick4AppService,
      'Cannot retrieve page formats before initializing OneClickForApp service'
    );

    return this.oneClick4AppService.retrievePageFormats();
  }

  /**
   * Retrieves the page formats with the given id if existing.
   */
  public retrievePageFormat(id: number): Promise<PageFormat | null> {
    this.checkService(
      this.oneClick4AppService,
      'Cannot retrieve page format before initializing OneClickForApp service'
    );

    return this.oneClick4AppService.retrievePageFormat(id);
  }

  /**
   * Creates a globally unique order id to pass during checkout.
   */
  public createShopOrderId(): Promise<number | null> {
    this.checkService(
      this.oneClick4AppService,
      'Cannot create shop order id before initializing OneClickForApp service'
    );

    return this.oneClick4AppService.createShopOrderId();
  }

  /**
   * Retrieves all available gallery categories and images from the public
   * gallery provided by Deutsche Post.
   */
  public async retrievePublicGallery(): Promise<GalleryItem[]> {
    this.checkService(
      this.oneClick4AppService,
      'Cannot retrieve public gallery before initializing OneClickForApp service'
    );

    return this.oneClick4AppService.retrievePublicGallery();
  }

  /**
   * Retrieves all images from the private gallery of the authenticated user.
   */
  public async retrievePrivateGallery(): Promise<MotiveLink[]> {
    this.checkService(
      this.oneClick4AppService,
      'Cannot retrieve private gallery before initializing OneClickForApp service'
    );

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
    this.checkService(
      this.oneClick4AppService,
      'Cannot preview voucher before initializing OneClickForApp service'
    );

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
    this.checkService(
      this.oneClick4AppService,
      'Cannot add item to shopping cart before initializing OneClickForApp service'
    );

    return this.oneClick4AppService.addItemToShoppingCart(product, options);
  }

  /**
   * Retrieves a copy of the shopping cart item at the give index if existing.
   *
   * @param index The index of the desired shopping cart item.
   */
  public getItemFromShoppingCart(index: number): ShoppingCartItem | null {
    this.checkService(
      this.oneClick4AppService,
      'Cannot get item from shopping cart before initializing OneClickForApp service'
    );

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
    this.checkService(
      this.oneClick4AppService,
      'Cannot remove item from shopping cart before initializing OneClickForApp service'
    );

    return this.oneClick4AppService.removeItemFromShoppingCart(index);
  }

  /**
   * Generates a brief summary of the items in the shopping cart.
   */
  public getShoppingCartSummary(): ShoppingCartSummary {
    this.checkService(
      this.oneClick4AppService,
      'Cannot get shopping cart summary before initializing OneClickForApp service'
    );

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
    this.checkService(
      this.oneClick4AppService,
      'Cannot checkout shopping cart before initializing OneClickForApp service'
    );

    return this.oneClick4AppService.checkoutShoppingCart(options);
  }

  /**
   * Retrieves the order information of an existing order with the given id.
   *
   * @param shopOrderId The order information that hold the data about the vouchers.
   */
  public async retrieveOrder(shopOrderId: number): Promise<Order | null> {
    this.checkService(
      this.oneClick4AppService,
      'Cannot retrieve order before initializing OneClickForApp service'
    );

    return this.oneClick4AppService.retrieveOrder(shopOrderId);
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
    if (!this.productService) {
      if (!options.client) {
        throw new ClientError('Missing client credentials for product service');
      }
      this.productService = new ProductService(options.client);

      await this.productService.init(options);
    }

    return this.productService;
  }

  /**
   * Retrieves the list of available products from the service.
   */
  public getProductList(): Promise<Product[]> {
    this.checkService(
      this.productService,
      'Cannot get product list before initializing product service'
    );

    return this.productService.getProductList();
  }

  /**
   * Retrieves the product with the given id if existing.
   *
   * @param id The id of the product that should be retrieved.
   */
  public getProduct(id: number): Promise<Product | null> {
    this.checkService(
      this.productService,
      'Cannot get product before initializing product service'
    );

    return this.productService.getProduct(id);
  }

  private checkService(service: SoapService, message: string): void {
    if (!service) {
      throw new InternetmarkeError(message);
    }
  }
}
