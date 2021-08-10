import { expect } from 'chai';
import moxios from 'moxios';
import { UserError } from '../../src/Error';
import { PaymentMethod, PortokasseService } from '../../src/portokasse/Service';
import { userCredentials } from '../1c4a/helper';
import { User } from '../../src/User';
import { PortokasseError } from '../../src/portokasse/Error';

describe('Portokasse Service', () => {
  let service: PortokasseService;
  const token = 'bb993a82-8bf8-483d-b5cc-b8cbd1abbd22';

  beforeEach(() => {
    moxios.install();
    moxios.stubOnce('get', /\/login$/, {
      status: 200,
      headers: {
        'set-cookie': [`CSRF-TOKEN=${token}; path=/portokasse; secure`]
      },
      response: { email: 'username' }
    });
    moxios.stubOnce('post', /\/login$/, {
      status: 200,
      headers: {},
      response: { email: 'user@deutschepost.de' }
    });

    service = new PortokasseService(new User());
  });

  afterEach(() => {
    moxios.uninstall();
  });

  describe('init', () => {
    it('should prevent init without user credentials', async () => {
      expect(service.init({} as any)).to.eventually.be.rejectedWith(UserError);
      expect(service.isInitialized()).to.be.false;
    });

    it('should init with minimal options', async () => {
      await service.init({ user: userCredentials });
      expect(service.isInitialized()).to.be.true;
    });
  });

  describe('getUserInfo', () => {
    it('should fail to get user info before init', async () => {
      moxios.stubOnce('get', /\/wallet-overviews\/me$/, {
        status: 401,
        headers: {},
        response: {
          code: 'UNAUTHORIZED'
        }
      });

      expect(service.getUserInfo()).to.eventually.be.rejectedWith(PortokasseError);
    });

    it('should retrieve user balance', async () => {
      moxios.stubOnce('get', /\/wallet-overviews\/me$/, {
        status: 200,
        headers: {},
        response: {
          balance: 2000
        }
      });

      await service.init({ user: userCredentials });
      const info = await service.getUserInfo();

      expect(info.isAuthenticated).to.be.true;
      expect(info.walletBalance).to.exist;
      expect(info.walletBalance!.value).to.equal(20);
    });
  });

  describe('topUp', () => {
    it('should top up with GiroPay', async () => {
      moxios.stubOnce('post', /\/payments$/, {
        status: 200,
        headers: {},
        response: {
          code: 'OK',
          redirect: 'http://localhost'
        }
      });

      const res = await service.topUp(1000, PaymentMethod.GiroPay, 'XXXXDEXXXX');

      expect(res).to.exist;
    });

    it('should top up with Paypal', async () => {
      moxios.stubOnce('post', /\/payments$/, {
        status: 200,
        headers: {},
        response: {
          code: 'OK',
          redirect: 'http://localhost'
        }
      });

      const res = await service.topUp(1000, PaymentMethod.Paypal);

      expect(res).to.exist;
    });
  });
});
