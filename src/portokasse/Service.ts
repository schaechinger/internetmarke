import axios, { Method, AxiosRequestConfig } from 'axios';
import axiosCookieJarSupport from 'axios-cookiejar-support';
import { inject, injectable } from 'inversify';
import { CookieJar } from 'tough-cookie';
import { TYPES } from '../di/types';
import { RestService } from '../services/Rest';
import { User, UserCredentials, UserInfo } from '../User';
import { Amount, amountToCents, parseAmount } from '../utils/amount';
import { InternetmarkeError, UserError } from '../Error';
import { JournalError, PortokasseError } from './Error';
import { formatDate } from './date';
import {
  Journal,
  JournalDays,
  JournalEntry,
  JournalOptions,
  JournalRange,
  parseJournalEntry
} from './journal';
import { Debugger } from 'debug';

export enum PaymentMethod {
  DirectDebit = 'DIRECTDEBIT',
  GiroPay = 'GIROPAY',
  PayPal = 'PAYPAL'
}

export interface PaymentResponse {
  /** The status code which is usually 'OK'. */
  code: string;
  /** PayPal/Giropay redirect url, null for DirectDebit. */
  redirect: string | null;
}

export interface PortokasseServiceOptions {
  user: UserCredentials;
}

export interface Portokasse {
  getUserInfo(): Promise<UserInfo>;
  topUp(
    amount: Amount | number,
    paymentMethod: PaymentMethod,
    bic?: string
  ): Promise<PaymentResponse>;
  getJournal(daysOrDateRange: JournalOptions): Promise<Journal>;
}

const BASE_URL = 'https://portokasse.deutschepost.de/portokasse';

@injectable()
export class PortokasseService extends RestService implements Portokasse {
  private cookieJar: CookieJar;

  private csrf?: string;

  private log: Debugger;

  constructor(@inject(TYPES.User) private user: User, @inject(TYPES.LoggerFactory) getLogger: any) {
    super();

    this.log = getLogger('portokasse');
  }

  public async init(options: PortokasseServiceOptions): Promise<boolean> {
    if (!options.user) {
      throw new UserError('Missing user credentials for Portokasse service init.');
    }

    axiosCookieJarSupport(axios);
    this.user.setCredentials(options.user);
    this.cookieJar = new CookieJar();

    return this.login();
  }

  public isInitialized(): boolean {
    return this.user.isAuthenticated();
  }

  /**
   * Retrieves the user information including the wallet balance.
   */
  public async getUserInfo(): Promise<UserInfo> {
    await this.checkServiceInit('Cannot get balance before initializing Portokasse service');

    const res = await this.request('GET', '/api/v1/wallet-overviews/me');

    if (res?.balance) {
      this.user.load({
        walletBalance: res.balance
      });
    }

    return this.user.getInfo();
  }

  public async topUp(
    amount: Amount | number,
    paymentMethod: PaymentMethod,
    bic?: string
  ): Promise<PaymentResponse> {
    await this.checkServiceInit(
      'Cannot top up user account before initializing Portokasse service'
    );

    const data: any = {
      amount: amountToCents(amount),
      paymentMethod
    };

    if (PaymentMethod.GiroPay === paymentMethod) {
      data.bic = bic;
    }

    return this.request('POST', '/api/v1/payments', data);
  }

  /**
   * Get the purchase and top up journal of your account.
   *
   * @param daysOrDateRange Eigher a days or a date range option with optional
   *  offset and rows information.
   */
  public async getJournal(daysOrDateRange: JournalOptions): Promise<Journal> {
    await this.checkServiceInit('Cannot get journal before initializing Portokasse service');

    const params: string[] = [
      `offset=${daysOrDateRange.offset || 0}`,
      `rows=${daysOrDateRange.rows || 10}`
    ];

    let type = 'DAYS';

    if ((daysOrDateRange as JournalDays).days) {
      params.push(`selectionDays=${(daysOrDateRange as JournalDays).days}`);
    } else if (
      (daysOrDateRange as JournalRange).startDate &&
      (daysOrDateRange as JournalRange).endDate
    ) {
      type = 'RANGE';
      params.push(`selectionStart=${formatDate((daysOrDateRange as JournalRange).startDate)}`);
      params.push(`selectionEnd=${formatDate((daysOrDateRange as JournalRange).endDate)}`);
    } else {
      throw new JournalError(
        'Start date and end date need to be passed as a pair or with an amount of days from today'
      );
    }

    params.push(`selectionType=${type}`);

    const journal: Journal = await this.request('GET', `/api/v1/journals?${params.join('&')}`);

    if (journal) {
      journal.newBalance = parseAmount(journal.newBalance);
      journal.oldBalance = parseAmount(journal.oldBalance);
      journal.journalEntries = journal.journalEntries
        .map(parseJournalEntry)
        .filter(entry => !!entry) as JournalEntry[];
    }

    return journal;
  }

  private async login(): Promise<boolean> {
    await this.request('GET', '/login');
    const info = await this.request('POST', '/login', this.user.getCredentials());

    this.user.load(info, true);

    return this.user.isAuthenticated();
  }

  private async checkServiceInit(message: string): Promise<void> {
    if (this.user.isAuthenticated()) {
      await this.login();
    }

    if (!this.isInitialized()) {
      throw new InternetmarkeError(message);
    }
  }

  private async request(method: Method, path: string = '', data?: any): Promise<any> {
    const options: AxiosRequestConfig = {
      method,
      url: `${BASE_URL}${path}`,
      jar: this.cookieJar,
      withCredentials: true
    };

    const isLogin = '/login' === path;

    if (data) {
      if (isLogin) {
        const encodedData: string[] = [];
        Object.keys(data).forEach(prop => {
          encodedData.push(`${prop}=${encodeURIComponent(data[prop])}`);
        });

        options.data = encodedData.join('&');
      } else {
        options.data = data;
      }
    }
    if (this.csrf) {
      options.headers = {
        'X-CSRF-TOKEN': this.csrf
      };

      if (data) {
        options.headers['Content-Type'] = isLogin
          ? 'application/x-www-form-urlencoded'
          : 'application/json';
      }
    }

    try {
      let payload: any = data ? { ...data } : '';
      if (payload && payload.password) {
        payload.password = '********';
      }
      this.log('[%s] %s %o', method, path, payload);

      const res = await axios(options);

      if (res.headers && res.headers['set-cookie']) {
        res.headers['set-cookie'].forEach((cookie: string) => {
          if (cookie.startsWith('CSRF-TOKEN')) {
            this.csrf = cookie.substr(11, 36);
          }
        });
      }

      return res.data;
    } catch (e) {
      const error = new PortokasseError(
        `Error from Portokasse: ${e.response?.data.code || 'Unknown'}`
      );
      (error as any).response = e.response || e.message;

      throw error;
    }
  }
}
