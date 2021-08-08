import { stub } from 'sinon';
import { validProducts } from '../product/product.data';

export const prodWsStub = {
  getProductListAsync: stub().returns(
    Promise.resolve([
      {
        attributes: {
          success: 'true'
        },
        Response: {
          salesProductList: {
            SalesProduct: validProducts
          }
        }
      }
    ])
  ),
  setSecurity: stub()
};

export const getProdWsStub = () => Promise.resolve(prodWsStub);
