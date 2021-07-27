/**
 * internetmarke
 * Copyright (c) 2018-2021 Manuel Schächinger
 * MIT Licensed
 */

import { PartnerError } from './1c4a/Error';
import { GalleryItem, MotiveLink } from './1c4a/gallery';
import { Order, ShoppingCartSummary } from './1c4a/order';
import { PageFormat } from './1c4a/pageFormat';
import {
  CheckoutShoppingCartOptions,
  OneClickForApp,
  OneClickForAppService,
  OneCLickForAppServiceOptions,
  PreviewVoucherOptions,
  ShoppingCartOptions
} from './1c4a/Service';
import { UserInfo } from './1c4a/User';
import { InternetmarkeError } from './Error';
import { ClientError } from './prodWs/Error';
import { Product } from './prodWs/product';
import { ProductService, ProductServiceOptions, ProdWS } from './prodWs/Service';
import { SoapService } from './services/Soap';

/**
 * Main class of the internetmarke package with access to all available
 * functions.
 */
export class Internetmarke implements OneClickForApp, ProdWS {
  private oneClick4AppService: OneClickForAppService;
  private productService: ProductService;

  //
  // 1C4A
  //

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

  getUserInfo(): UserInfo {
    this.checkService(
      this.oneClick4AppService,
      'Cannot get user info before initializing OneClickForApp service'
    );

    return this.oneClick4AppService.getUserInfo();
  }

  /**
   * Retrieve all available page formats from the service.
   */
  public retrievePageFormats(): Promise<PageFormat[]> {
    this.checkService(
      this.oneClick4AppService,
      'Cannot retrieve page formats before initializing OneClickForApp service'
    );

    return this.oneClick4AppService.retrievePageFormats();
  }

  /**
   * Retrieve the page formats with the given id if existing.
   */
  public retrievePageFormat(id: number): Promise<PageFormat | null> {
    this.checkService(
      this.oneClick4AppService,
      'Cannot retrieve page format before initializing OneClickForApp service'
    );

    return this.oneClick4AppService.retrievePageFormat(id);
  }

  /**
   * Creates an order id and returns it. It also saves the oder id to the user.
   */
  public createShopOrderId(): Promise<number | null> {
    this.checkService(
      this.oneClick4AppService,
      'Cannot create shop order id before initializing OneClickForApp service'
    );

    return this.oneClick4AppService.createShopOrderId();
  }

  public async retrievePublicGallery(): Promise<GalleryItem[]> {
    this.checkService(
      this.oneClick4AppService,
      'Cannot retrieve public gallery before initializing OneClickForApp service'
    );

    return this.oneClick4AppService.retrievePublicGallery();
  }

  public async retrievePrivateGallery(): Promise<MotiveLink[]> {
    this.checkService(
      this.oneClick4AppService,
      'Cannot retrieve private gallery before initializing OneClickForApp service'
    );

    return this.oneClick4AppService.retrievePrivateGallery();
  }

  /**
   * Retrieves a preview link to the voucher with the given id.
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

  public addToShoppingCart(product: Product, options: ShoppingCartOptions = {}): void {
    this.checkService(
      this.oneClick4AppService,
      'Cannot add to shopping cart before initializing OneClickForApp service'
    );

    return this.oneClick4AppService.addToShoppingCart(product, options);
  }

  public getShoppingCartSummary(): ShoppingCartSummary {
    this.checkService(
      this.oneClick4AppService,
      'Cannot get shopping cart summary before initializing OneClickForApp service'
    );

    return this.oneClick4AppService.getShoppingCartSummary();
  }

  public checkoutShoppingCart(options: CheckoutShoppingCartOptions = {}): Promise<any> {
    this.checkService(
      this.oneClick4AppService,
      'Cannot checkout shopping cart before initializing OneClickForApp service'
    );

    return this.oneClick4AppService.checkoutShoppingCart(options);
  }

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

  public getProductList(): Promise<Product[]> {
    this.checkService(
      this.productService,
      'Cannot get product list before initializing product service'
    );

    return this.productService.getProductList();
  }

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
