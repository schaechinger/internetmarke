import axios, { Method, AxiosRequestConfig } from 'axios';
import axiosCookieJarSupport from 'axios-cookiejar-support';
import { inject, injectable } from 'inversify';
import { CookieJar } from 'tough-cookie';
import { TYPES } from '../di/types';
import { UserError } from '../Error';
import { Amount } from '../prodWs/product';
import { RestService } from '../services/Rest';
import { User, UserCredentials, UserInfo } from '../User';

export enum PaymentMethod {
  GiroPay = 'GIROPAY',
  Paypal = 'PAYPAL'
}

export interface PortokasseServiceOptions {
  user: UserCredentials;
}

export interface Portokasse {
  topUp(amount: Amount | number, paymentMethod: PaymentMethod): Promise<Amount | false>;
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
    if (!this.cookieJar) {
      if (!options.user) {
        throw new UserError('Missing user credentials for Portokasse service init.');
      }

      axiosCookieJarSupport(axios);
      this.user.setCredentials(options.user);
      this.cookieJar = new CookieJar();
    }

    return this.login();
  }

  public isInitialized(): boolean {
    return !!this.cookieJar;
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
    _amount: Amount | number,
    _paymentMethod: PaymentMethod
  ): Promise<Amount | false> {
    return false;
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

    if (data) {
      const encodedData: string[] = [];
      for (let prop in data) {
        encodedData.push(`${prop}=${encodeURIComponent(data[prop])}`);
      }

      options.data = encodedData.join('&');
    }
    if (this.csrf) {
      options.headers = {
        'X-CSRF-TOKEN': this.csrf,
        'Content-Type': 'application/x-www-form-urlencoded'
      };
    }

    try {
      const res = await axios(options);

      if (res.headers['set-cookie']) {
        res.headers['set-cookie'].forEach((cookie: string) => {
          if (cookie.startsWith('CSRF-TOKEN')) {
            this.csrf = cookie.substr(11, 36);
          }
        });
      }
      console.log(res.status, res.data);

      return res.data;
    } catch (e) {
      console.log(e.response?.data || e);

      return e.response?.data || null;
    }
  }
}
