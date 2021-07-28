import { expect } from 'chai';
import { InternetmarkeError } from '../src/Error';
import { Internetmarke } from '../src/Internetmarke';
import { Product } from '../src/prodWs/product';

let internetmarke: Internetmarke;

describe('Internetmarke', () => {
  beforeEach(() => {
    internetmarke = new Internetmarke();
  });

  it('should throw errors when accessing 1C4A services before init', () => {
    expect(() => internetmarke.getUserInfo()).to.throw(InternetmarkeError);
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

  it('should throw errors when accessing ProdWS services before init', () => {
    expect(() => internetmarke.getProductList()).to.throw(InternetmarkeError);
    expect(() => internetmarke.getProduct(0)).to.throw(InternetmarkeError);
  });
});
