import { expect } from 'chai';
import { InternetmarkeError } from '../src/Error';
import { PaymentMethod } from '../src/portokasse/Service';
import { Product } from '../src/prodWs/product';
import { InternetmarkeMock } from './stubs/Internetmarke.mock';
import { oneClickForAppServiceStub } from './stubs/OneClickForAppService.stub';
import { portokasseServiceStub } from './stubs/PortokasseService.stub';
import { portokasseUserInfoResult, userInfoResult } from './stubs/User.stub';

let internetmarke: InternetmarkeMock;

describe('Internetmarke', () => {
  beforeEach(() => {
    internetmarke = new InternetmarkeMock();
  });

  it('should throw errors when accessing 1C4A services before init', () => {
    expect(internetmarke.getUserInfo()).to.eventually.be.rejectedWith(InternetmarkeError);
    expect(() => internetmarke.retrievePageFormats()).to.throw(InternetmarkeError);
    expect(() => internetmarke.retrievePageFormat(1)).to.throw(InternetmarkeError);
    expect(() => internetmarke.createShopOrderId()).to.throw(InternetmarkeError);
    expect(() => internetmarke.retrievePublicGallery()).to.throw(InternetmarkeError);
    expect(() => internetmarke.retrievePrivateGallery()).to.throw(InternetmarkeError);
    expect(() => internetmarke.retrievePreviewVoucher({} as Product)).to.throw(InternetmarkeError);
    expect(() => internetmarke.addItemToShoppingCart({} as Product)).to.throw(InternetmarkeError);
    expect(() => internetmarke.getItemFromShoppingCart(0)).to.throw(InternetmarkeError);
    expect(() => internetmarke.removeItemFromShoppingCart(0)).to.throw(InternetmarkeError);
    expect(() => internetmarke.getShoppingCartSummary()).to.throw(InternetmarkeError);
    expect(() => internetmarke.checkoutShoppingCart()).to.throw(InternetmarkeError);
    expect(() => internetmarke.retrieveOrder(0)).to.throw(InternetmarkeError);
  });

  it('should throw errors when accessing Portokasse services before init', () => {
    expect(internetmarke.getUserInfo()).to.eventually.be.rejectedWith(InternetmarkeError);
    expect(() => internetmarke.topUp(0, PaymentMethod.GiroPay)).to.throw(InternetmarkeError);
  });

  it('should throw errors when accessing ProdWS services before init', () => {
    expect(() => internetmarke.getProductList()).to.throw(InternetmarkeError);
    expect(() => internetmarke.getProduct(0)).to.throw(InternetmarkeError);
  });

  describe('getUserInfo', () => {
    it('should use Portokasse service if initialized', async () => {
      internetmarke.setPortokasseStub(portokasseServiceStub);
      const info = await internetmarke.getUserInfo();

      expect(info).to.exist;
      expect(info.walletBalance).to.equal(portokasseUserInfoResult.walletBalance);
      expect(info.showTermsAndCondition).to.not.exist;
    });
    it('should use 1C4A service if initialized', async () => {
      internetmarke.set1C4AStub(oneClickForAppServiceStub);
      const info = await internetmarke.getUserInfo();

      expect(info).to.exist;
      expect(info.walletBalance).to.equal(userInfoResult.walletBalance);
      expect(info.showTermsAndCondition).to.equal(userInfoResult.showTermsAndCondition);
    });
    it('should merge info from Portokasse and 1C4A services if both initialized', async () => {
      internetmarke.set1C4AStub(oneClickForAppServiceStub);
      internetmarke.setPortokasseStub(portokasseServiceStub);
      const info = await internetmarke.getUserInfo();

      expect(info).to.exist;
      expect(info.walletBalance).to.equal(portokasseUserInfoResult.walletBalance);
      expect(info.showTermsAndCondition).to.equal(userInfoResult.showTermsAndCondition);
    });
  });
});
