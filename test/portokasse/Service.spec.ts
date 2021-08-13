import { expect } from 'chai';
import moxios from 'moxios';
import { UserError } from '../../src/Error';
import { PaymentMethod, PortokasseService } from '../../src/portokasse/Service';
import { userCredentials } from '../1c4a/helper';
import { User } from '../../src/User';
import { JournalError, PortokasseError } from '../../src/portokasse/Error';
import { Internetmarke } from '../../src/Internetmarke';
import { getLoggerStub } from '../stubs/logger.stub';
import { journalResult } from './journal/journal.spec';

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

    service = new PortokasseService(new User(), getLoggerStub);
  });

  afterEach(() => {
    moxios.uninstall();
  });

  describe('init', () => {
    // test init through public internetmarke api
    let internetmarke: Internetmarke;

    beforeEach(() => {
      internetmarke = new Internetmarke();
    });

    it('should prevent init without user credentials', async () => {
      expect(internetmarke.initPortokasseService({} as any)).to.eventually.be.rejectedWith(
        UserError
      );
    });

    xit('should init with minimal options', async () => {
      const myService = await internetmarke.initPortokasseService({ user: userCredentials });

      expect(myService).to.be.instanceOf(PortokasseService);
    });
  });

  describe('getUserInfo', () => {
    it('should fail to get user info before init', async () => {
      moxios.stubOnce('get', /\/wallet-overviews/, {
        status: 401,
        headers: {},
        response: {
          code: 'UNAUTHORIZED'
        }
      });

      expect(service.getUserInfo()).to.eventually.be.rejectedWith(PortokasseError);
    });

    it('should retrieve user balance', async () => {
      moxios.stubOnce('get', /\/wallet-overviews/, {
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

      await service.init({ user: userCredentials });
      const res = await service.topUp(1000, PaymentMethod.GiroPay, 'XXXXDEXXXX');

      expect(res).to.exist;
    });

    it('should top up with PayPal', async () => {
      moxios.stubOnce('post', /\/payments$/, {
        status: 200,
        headers: {},
        response: {
          code: 'OK',
          redirect: 'http://localhost'
        }
      });

      await service.init({ user: userCredentials });
      const res = await service.topUp(1000, PaymentMethod.PayPal);

      expect(res).to.exist;
    });

    it('should detect too small amount as error', async () => {
      const errorCode = 'InvalidPaymentAmount';
      moxios.stubOnce('post', /\/payments$/, {
        status: 422,
        headers: {},
        response: {
          code: errorCode,
          arguments: null
        }
      });

      await service.init({ user: userCredentials });

      expect(service.topUp(500, PaymentMethod.PayPal)).to.eventually.be.rejectedWith(
        `Error from Portokasse: ${errorCode}`
      );
    });
  });

  describe('getJournal', () => {
    it('should get journal with days', async () => {
      moxios.stubOnce('get', /\/journals\?/, {
        status: 200,
        headers: {},
        response: journalResult
      });

      await service.init({ user: userCredentials });
      const res = await service.getJournal({ days: 10 });

      expect(res).to.exist;
    });

    it('should get journal with date range', async () => {
      moxios.stubOnce('get', /\/journals\?/, {
        status: 200,
        headers: {},
        response: journalResult
      });

      await service.init({ user: userCredentials });
      const res = await service.getJournal({
        startDate: new Date('2021-08-01'),
        endDate: new Date('2021-08-11')
      });

      expect(res).to.exist;
    });

    it('should get journal for different page', async () => {
      moxios.stubOnce('get', /\/journals\?/, {
        status: 200,
        headers: {},
        response: journalResult
      });

      await service.init({ user: userCredentials });
      const res = await service.getJournal({
        offset: 10,
        rows: 5,
        days: 10
      });

      expect(res).to.exist;
    });

    it('should detect missing options', async () => {
      moxios.stubOnce('get', /\/journals\?/, {
        status: 422,
        headers: {},
        response: {
          code: 'InvaliteDate'
        }
      });

      await service.init({ user: userCredentials });
      const promise = service.getJournal({} as any);

      expect(promise).to.eventually.be.rejectedWith(JournalError);
    });

    it('should detect missing start date', async () => {
      moxios.stubOnce('get', /\/journals\?/, {
        status: 422,
        headers: {},
        response: {
          code: 'InvaliteDate'
        }
      });

      await service.init({ user: userCredentials });
      const promise = service.getJournal({
        endDate: new Date('2021-08-11')
      } as any);

      expect(promise).to.eventually.be.rejectedWith(JournalError);
    });

    it('should detect missing end date', async () => {
      moxios.stubOnce('get', /\/journals\?/, {
        status: 422,
        headers: {},
        response: {
          code: 'InvaliteDate'
        }
      });

      await service.init({ user: userCredentials });
      const promise = service.getJournal({
        startDate: new Date('2021-08-01')
      } as any);

      expect(promise).to.eventually.be.rejectedWith(JournalError);
    });
  });
});
