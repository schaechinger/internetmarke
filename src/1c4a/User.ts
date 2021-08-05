// import { Debugger } from 'debug';
import { Amount } from '../prodWs/product';
// import { getLogger } from '../utils/logger';

export interface UserCredentials {
  username: string;
  password: string;
}

export interface UserData {
  userToken?: string;
  walletBalance?: number;
  showTermsAndCondition?: boolean;
  infoMessage?: string;
}

export interface UserInfo {
  isAuthenticated: boolean;
  username?: string;
  walletBalance?: Amount;
  orderIds?: number[];
  infoMessage?: string;
  showTermsAndCondition?: boolean;
}

const CREDENTIALS = Symbol('credentials'),
  TOKEN = Symbol('token');

/**
 * The Portokasse user that is billed for ordered vouchers.
 */
export class User {
  private [CREDENTIALS]: UserCredentials;
  private [TOKEN]: string | null;
  private walletBalance: Amount;
  private infoMessage?: string;
  private orderIds: number[] = [];
  private showTermsAndCondition = false;
  // private log: Debugger;

  constructor(credentials: UserCredentials) {
    this[CREDENTIALS] = credentials;
    this[TOKEN] = null;

    // this.log = getLogger('user');
  }

  public load(data: UserData): void {
    if (data.userToken) {
      this[TOKEN] = data.userToken;
    }

    // only update data for authenticated users
    if (!this[TOKEN]) {
      return;
    }

    if (data.walletBalance) {
      this.walletBalance = {
        value: +data.walletBalance / 100,
        currency: 'EUR'
      };
    }
    if (undefined !== data.showTermsAndCondition) {
      this.showTermsAndCondition = data.showTermsAndCondition;
    }
    if (data.infoMessage) {
      this.infoMessage = data.infoMessage;
    }
  }

  public getCredentials(): UserCredentials {
    return { ...this[CREDENTIALS] };
  }

  public isAuthenticated(): boolean {
    return !!this.getToken();
  }

  /**
   * Add an order id to the user to assign it to him.
   *
   * @param orderIdThe order id that has been added to the user.
   */
  public addOrderId(orderId: number): void {
    this.orderIds.unshift(orderId);
  }

  public getToken(): string | null {
    return this[TOKEN];
  }

  public getInfo(): UserInfo {
    const isAuthenticated = this.isAuthenticated();

    const info: UserInfo = {
      isAuthenticated
    };
    if (isAuthenticated) {
      info.username = this[CREDENTIALS].username;
      info.walletBalance = this.walletBalance;
      info.infoMessage = this.infoMessage;
      info.showTermsAndCondition = this.showTermsAndCondition;
      info.orderIds = this.orderIds;
    }

    return info;
  }
}
