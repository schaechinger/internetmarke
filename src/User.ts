import { injectable } from 'inversify';

import { Amount, parseAmount } from './utils/amount';

export interface UserCredentials {
  username: string;
  password: string;
}

export interface UserData {
  // 1C4A
  userToken?: string;
  walletBalance?: number;
  showTermsAndCondition?: boolean;
  infoMessage?: string;

  // portokasse
  email?: string;
  marketplace?: boolean;
  anonymous?: boolean;
  postpaid?: boolean;
  showBannerFooter?: boolean;
}

export interface UserInfo {
  isAuthenticated: boolean;
  username?: string;
  walletBalance?: Amount;
  orderIds?: number[];
  infoMessage?: string;
  showTermsAndCondition?: boolean;
}

const CREDENTIALS = Symbol('credentials');
const TOKEN = Symbol('token');

/**
 * The Portokasse user that is billed for ordered vouchers.
 */
@injectable()
export class User {
  private [CREDENTIALS]: UserCredentials;

  private [TOKEN]: string | null;

  private walletBalance: Amount;

  private infoMessage?: string;

  private orderIds: number[] = [];

  private showTermsAndCondition = false;

  /**
   * Set the credentials to use the services.
   *
   * @param credentials The credentials that authenticate the user.
   */
  public setCredentials(credentials: UserCredentials): void {
    this[CREDENTIALS] = { ...credentials };
    this[TOKEN] = null;
  }

  /**
   * Update the user data as retrieved from the service.
   *
   * @param data The user data from the service.
   * @param initialData Determines whether to reset the token in case non is
   *  provided.
   */
  public load(data: UserData, initialData = false): void {
    if (data.userToken || data.email || initialData) {
      this[TOKEN] = data.userToken || data.email || null;
    }

    // only update data for authenticated users
    if (!this[TOKEN]) {
      return;
    }

    if (undefined !== data.walletBalance) {
      this.walletBalance = parseAmount(data.walletBalance);
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
