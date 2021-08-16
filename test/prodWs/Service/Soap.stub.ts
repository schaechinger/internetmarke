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
  getCatalogListAsync: stub().returns(
    Promise.resolve([
      {
        attributes: {
          success: 'true'
        },
        Response: {
          catalogValueList: {
            catalogValue: []
          }
        }
      }
    ])
  ),
  setSecurity: stub()
};

export const invalidProdWsStub = {
  getProductListAsync: stub().returns(
    Promise.resolve([
      {
        attributes: {
          success: 'false'
        }
      }
    ])
  ),
  getCatalogListAsync: stub().returns(
    Promise.resolve([
      {
        attributes: {
          success: 'false'
        }
      }
    ])
  ),
  setSecurity: stub()
};

export const getProdWsStub = () => Promise.resolve(prodWsStub);
export const getInvalidProdWsStub = () => Promise.resolve(invalidProdWsStub);
