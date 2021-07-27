import { Debugger } from "debug";
import { getLogger } from "../utils/logger";

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
  walletBalance?: number;
  orderIds?: number[];
}

const CREDENTIALS = Symbol("credentials"),
  TOKEN = Symbol("token");

export class User {
  private [CREDENTIALS]: UserCredentials;
  private [TOKEN]: string | null;
  private walletBalance = 0;
  private infoMessage: string | null = null;
  private orderIds: number[] = [];
  // private showTermsAndConditions = false;
  private log: Debugger;

  constructor(credentials: UserCredentials) {
    this[CREDENTIALS] = credentials;
    this[TOKEN] = null;

    this.log = getLogger("user");
  }

  public load(data: UserData): void {
    this.log("updating user data", data);

    if (data.userToken) {
      this[TOKEN] = data.userToken;
    }
    if (data.walletBalance) {
      this.walletBalance = data.walletBalance;
    }
    if (data.showTermsAndCondition) {
      // this.showTermsAndConditions = data.showTermsAndCondition;
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

  public getWalletBalance(): number {
    return this.walletBalance;
  }

  public getInfoMessage(): string | null {
    return this.infoMessage;
  }

  public getOrderIds(): number[] {
    return this.orderIds;
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
      isAuthenticated,
    };
    if (isAuthenticated) {
      info.walletBalance = this.walletBalance;
      info.orderIds = this.orderIds;
    }

    return info;
  }
}
