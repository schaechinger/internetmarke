import axios, { Method, AxiosRequestConfig } from 'axios';
import axiosCookieJarSupport from 'axios-cookiejar-support';
import { inject, injectable } from 'inversify';
import { CookieJar } from 'tough-cookie';
import { TYPES } from '../di/types';
import { RestService } from '../services/Rest';
import { User, UserCredentials, UserInfo } from '../User';
import { Amount, parseAmount } from '../utils/amount';
import { InternetmarkeError, UserError } from '../Error';
import { JournalError, PortokasseError } from './Error';
import { formatDate } from './date';
import { Journal, JournalEntry, JournalOptions, parseJournalEntry } from './journal';

export enum PaymentMethod {
  DirectDebit = 'DIRECTDEBIT',
  GiroPay = 'GIROPAY',
  Paypal = 'PAYPAL'
}

export interface PaymentResponse {
  code: string; // 'OK'
  redirect: string; // paypal url
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

  constructor(@inject(TYPES.User) private user: User) {
    super();
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
      amount: 'number' === typeof amount ? amount : (amount as Amount).value * 100,
      paymentMethod
    };

    if (PaymentMethod.GiroPay === paymentMethod) {
      data.bic = bic;
    }

    return this.request('POST', '/api/v1/payments', data);
  }

  public async getJournal(daysOrDateRange: JournalOptions): Promise<Journal> {
    await this.checkServiceInit('Cannot get journal before initializing Portokasse service');

    const params: string[] = ['offset=0', 'rows=10'];

    let type = 'DAYS';

    if ('number' === typeof daysOrDateRange) {
      params.push(`selectionDays=${daysOrDateRange}`);
    } else if (daysOrDateRange.startDate && daysOrDateRange.endDate) {
      type = 'RANGE';
      params.push(`selectionStart=${formatDate(daysOrDateRange.startDate)}`);
      params.push(`selectionEnd=${formatDate(daysOrDateRange.endDate)}`);
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
