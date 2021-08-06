import { stub } from 'sinon';
import soapStub from 'soap/soap-stub';
import { validProducts } from './product.data';

export const prodWsStub = {
  getProductListAsync: stub()
};
(prodWsStub as any).getProductListAsync.respondWithSuccess = soapStub.createRespondingStub(
  {
    attributes: {
      success: 'true'
    },
    Response: {
      salesProduct: [validProducts[0]]
    }
  },
  null
);
