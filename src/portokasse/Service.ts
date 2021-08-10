import axios, { Method, AxiosRequestConfig } from 'axios';
import axiosCookieJarSupport from 'axios-cookiejar-support';
import { inject, injectable } from 'inversify';
import { CookieJar } from 'tough-cookie';
import { TYPES } from '../di/types';
import { UserError } from '../Error';
import { PortokasseError } from './Error';
import { Amount } from '../prodWs/product';
import { RestService } from '../services/Rest';
import { User, UserCredentials, UserInfo } from '../User';

export enum PaymentMethod {
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
    const data: any = {
      amount: 'number' === typeof amount ? amount : (amount as Amount).value * 100,
      paymentMethod
    };

    if (PaymentMethod.GiroPay === paymentMethod) {
      data.bic = bic;
    }

    return this.request('POST', '/api/v1/payments', data);
  }

  private async login(): Promise<boolean> {
    await this.request('GET', '/login');
    const info = await this.request('POST', '/login', this.user.getCredentials());

    this.user.load(info);

    return this.user.isAuthenticated();
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
        for (let prop in data) {
          encodedData.push(`${prop}=${encodeURIComponent(data[prop])}`);
        }

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
