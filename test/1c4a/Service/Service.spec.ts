import { expect } from 'chai';
import { SimpleAddress } from '../../../src/1c4a/address';
import { AddressError, PartnerError, VoucherLayoutError } from '../../../src/1c4a/Error';
import { GalleryItem, ImageItem, MotiveLink } from '../../../src/1c4a/gallery';
import { PageFormat } from '../../../src/1c4a/pageFormat';
import { OneClickForAppService } from '../../../src/1c4a/Service';
import { VoucherLayout } from '../../../src/1c4a/voucher';
import { UserError } from '../../../src/Error';
import { ProductError } from '../../../src/prodWs/Error';
import { Product } from '../../../src/prodWs/product';
import { DataStore } from '../../../src/services/DataStore';
import { InternetmarkeMock } from '../../stubs/Internetmarke.mock';
import { getLoggerStub } from '../../stubs/logger.stub';
import { oneClickForAppServiceStub } from '../../stubs/OneClickForAppService.stub';
import { userStub } from '../../stubs/User.stub';
import { partnerCredentials, userCredentials } from '../helper';
import { partnerStub } from './Partner.stub';
import { get1C4AStub, oneC4AStub } from './Soap.stub';

describe('1C4A Service', () => {
  let service: OneClickForAppService;
  const pageFormatStore = new DataStore<PageFormat>(getLoggerStub);
  const privateGalleryStore = new DataStore<MotiveLink>(getLoggerStub);
  const publicGalleryStore = new DataStore<GalleryItem>(getLoggerStub);
  const options = {
    partner: partnerCredentials,
    user: userCredentials
  };

  beforeEach(async () => {
    oneC4AStub.authenticateUserAsync.resetHistory();
    oneC4AStub.checkoutShoppingCartPDFAsync.resetHistory();
    oneC4AStub.checkoutShoppingCartPNGAsync.resetHistory();
    oneC4AStub.createShopOrderIdAsync.resetHistory();
    oneC4AStub.retrieveOrderAsync.resetHistory();
    oneC4AStub.retrievePageFormatsAsync.resetHistory();
    oneC4AStub.retrievePreviewVoucherPDFAsync.resetHistory();
    oneC4AStub.retrievePreviewVoucherPNGAsync.resetHistory();
    oneC4AStub.retrievePrivateGalleryAsync.resetHistory();
    oneC4AStub.retrievePublicGalleryAsync.resetHistory();
    service = new OneClickForAppService(
      partnerStub,
      userStub,
      pageFormatStore,
      privateGalleryStore,
      publicGalleryStore,
      getLoggerStub,
      get1C4AStub
    );
  });

  describe('init', () => {
    // test init through public internetmarke api
    let internetmarke: InternetmarkeMock;

    beforeEach(() => {
      internetmarke = new InternetmarkeMock();
      internetmarke.set1C4AStub(oneClickForAppServiceStub);
    });

    it('should prevent init without client credentials', async () => {
      expect(internetmarke.initOneClickForAppService({} as any)).to.eventually.be.rejectedWith(
        PartnerError
      );
    });

    it('should prevent init without client credentials', async () => {
      expect(
        internetmarke.initOneClickForAppService({ partner: partnerCredentials } as any)
      ).to.eventually.be.rejectedWith(UserError);
    });

    it('should init with minimal options', async () => {
      const myService = await internetmarke.initOneClickForAppService(options);

      expect(myService).to.exist;
    });
  });

  describe('retrievePageFormats', () => {
    it('should load page formats', async () => {
      await service.init(options);

      const pageFormats = await service.retrievePageFormats();

      expect(pageFormats).to.exist;
      expect(pageFormats).to.have.length(1);
    });
  });

  describe('retrievePageFormat', () => {
    it('should retrieve page format by id', async () => {
      await service.init(options);

      const pageFormat = await service.retrievePageFormat(1);

      expect(pageFormat).to.exist;
    });

    it('should detect invalid page format id', async () => {
      await service.init(options);

      const pageFormat = await service.retrievePageFormat(7);

      expect(pageFormat).to.be.null;
    });
  });

  describe('createShopOrderId', () => {
    it('should create a shop order id', async () => {
      await service.init(options);

      const orderId = await service.createShopOrderId();

      expect(orderId).to.equal(42);
    });
  });

  describe('retrievePrivateGallery', () => {
    it('should load private gallery', async () => {
      await service.init(options);

      const gallery = await service.retrievePrivateGallery();

      expect(gallery).to.exist;
      expect(gallery).to.have.length(1);
    });
  });

  describe('retrievePublicGallery', () => {
    it('should load public gallery', async () => {
      await service.init(options);

      const gallery = await service.retrievePublicGallery();

      expect(gallery).to.exist;
      expect(gallery).to.have.length(1);
    });
  });

  describe('retrievePreviewVoucher', () => {
    it('should retrieve a PNG voucher', async () => {
      await service.init(options);

      const voucher = await service.retrievePreviewVoucher({ id: 1, price: 80 } as Product, {
        voucherLayout: VoucherLayout.FrankingZone
      });

      expect(voucher).to.exist;
      expect(oneC4AStub.retrievePreviewVoucherPNGAsync.calledOnce).to.be.true;
    });

    it('should retrieve a PDF voucher', async () => {
      await service.init(options);

      const voucher = await service.retrievePreviewVoucher({ id: 1, price: 80 } as Product, {
        pageFormat: { id: 1 } as PageFormat,
        voucherLayout: VoucherLayout.FrankingZone
      });

      expect(voucher).to.exist;
      expect(oneC4AStub.retrievePreviewVoucherPDFAsync.calledOnce).to.be.true;
    });

    it('should throw error when passing image in address layout', async () => {
      await service.init(options);

      const promise = service.retrievePreviewVoucher({ id: 1, price: 80 } as Product, {
        pageFormat: { id: 1 } as PageFormat,
        imageItem: { imageID: 1 } as ImageItem,
        voucherLayout: VoucherLayout.AddressZone
      });

      expect(oneC4AStub.retrievePreviewVoucherPDFAsync.calledOnce).to.be.false;
      expect(promise).to.eventually.be.rejectedWith(VoucherLayoutError);
    });
  });

  describe('shopping cart', () => {
    const senderAddress: SimpleAddress = {
      company: 'GIESINGER BIERMANUFAKTUR & SPEZIALITÄTENBRAUGESELLSCHAFT MBH',
      street: 'Martin-Luther-Str.',
      houseNo: '2',
      zip: '81539',
      city: 'München'
    };
    const receiverAddress: SimpleAddress = {
      company: 'Camba Bavaria GmbH',
      street: 'Gewerbering',
      houseNo: '3',
      zip: '83370',
      city: 'Seeon'
    };

    it('should return an empty shopping cart', () => {
      const cart = service.getShoppingCartSummary();

      expect(cart).to.exist;
      expect(cart.positions).to.have.length(0);
      expect(cart.total.value).to.equal(0);
    });

    it('should add an item to the shopping cart', () => {
      service.addItemToShoppingCart({ id: 1, price: 80 } as Product, {
        voucherLayout: VoucherLayout.FrankingZone
      });
      const cart = service.getShoppingCartSummary();

      expect(cart.positions).to.have.length(1);
      expect(cart.positions[0].productCode).to.equal(1);
      expect(cart.total.value).to.equal(0.8);
    });

    it('should sum up the total price of the shopping cart', () => {
      service.addItemToShoppingCart({ id: 2, price: 90 } as Product, {
        voucherLayout: VoucherLayout.FrankingZone
      });
      service.addItemToShoppingCart({ id: 1, price: 80 } as Product, {
        voucherLayout: VoucherLayout.FrankingZone
      });
      const cart = service.getShoppingCartSummary();

      expect(cart.positions).to.have.length(2);
      expect(cart.positions[0].productCode).to.equal(2);
      expect(cart.total.value).to.equal(1.7);
    });

    it('should throw an error if the product price is missing', () => {
      expect(() => {
        service.addItemToShoppingCart({ id: 1 } as Product, {
          voucherLayout: VoucherLayout.AddressZone
        });
      }).to.throw(ProductError);
    });

    it('should throw an error if only sender address is given', () => {
      expect(() => {
        service.addItemToShoppingCart({ id: 1, price: 80 } as Product, {
          voucherLayout: VoucherLayout.AddressZone,
          sender: senderAddress
        });
      }).to.throw(AddressError);
    });

    it('should throw an error if only receiver address is given', () => {
      expect(() => {
        service.addItemToShoppingCart({ id: 1, price: 80 } as Product, {
          voucherLayout: VoucherLayout.AddressZone,
          receiver: receiverAddress
        });
      }).to.throw(AddressError);
    });

    it('should throw an error when passing addresses in franking layout', () => {
      expect(() => {
        service.addItemToShoppingCart({ id: 1, price: 80 } as Product, {
          voucherLayout: VoucherLayout.FrankingZone,
          receiver: receiverAddress,
          sender: senderAddress
        });
      }).to.throw(VoucherLayoutError);
    });

    it('should addresses in address layout', () => {
      expect(() => {
        service.addItemToShoppingCart({ id: 1, price: 80 } as Product, {
          voucherLayout: VoucherLayout.AddressZone,
          receiver: receiverAddress,
          sender: senderAddress
        });
      }).to.not.throw();
    });

    it('should get an existing item from the shopping cart', () => {
      service.addItemToShoppingCart({ id: 1, price: 80 } as Product, {
        voucherLayout: VoucherLayout.FrankingZone
      });
      const item = service.getItemFromShoppingCart(0);

      expect(item).to.exist;
      expect(item!.productCode).to.equal(1);
      expect(item!.price!.value).to.equal(0.8);
    });

    it('should detect an invalid item index of the shopping cart', () => {
      const item = service.getItemFromShoppingCart(0);

      expect(item).to.not.exist;
    });

    it('should get an existing item from the shopping cart', () => {
      service.addItemToShoppingCart({ id: 1, price: 80 } as Product, {
        voucherLayout: VoucherLayout.FrankingZone
      });
      const removedItem = service.removeItemFromShoppingCart(0);
      const item = service.getItemFromShoppingCart(0);

      expect(item).to.not.exist;
      expect(removedItem).to.exist;
      expect(removedItem!.productCode).to.equal(1);
      expect(removedItem!.price!.value).to.equal(0.8);
    });

    it('should ignore removing an invalid index of the shopping cart', () => {
      const item = service.removeItemFromShoppingCart(0);

      expect(item).to.not.exist;
    });
  });
});
