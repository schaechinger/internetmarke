import { expect } from 'chai';
import { User, UserCredentials, UserData } from '../src/User';

describe('User', () => {
  let user: User;
  const credentials: UserCredentials = {
    username: 'username',
    password: 'password'
  };
  const data: UserData = {
    walletBalance: 1000,
    infoMessage: 'msg',
    showTermsAndCondition: true,
    userToken: '<TOKEN>'
  };

  beforeEach(() => {
    user = new User();
    user.setCredentials(credentials);
  });

  it('should get user data before loading', () => {
    const info = user.getInfo();

    expect(info.isAuthenticated).to.be.false;
    expect(info.username).to.not.exist;
    expect(info.walletBalance).to.not.exist;
    expect(info.infoMessage).to.not.exist;
    expect(info.orderIds).to.not.exist;
    expect(info.showTermsAndCondition).to.not.exist;
  });

  it('should load user data', () => {
    user.load(data);

    const info = user.getInfo();

    expect(info).to.exist;
    expect(info.isAuthenticated).to.be.true;
    expect(info.username).to.equal(credentials.username);
    expect(info.infoMessage).to.equal(data.infoMessage);
    expect(info.showTermsAndCondition).to.equal(data.showTermsAndCondition);
    expect(info.walletBalance).to.exist;
    expect(info.walletBalance!.value).to.equal(data.walletBalance! / 100);
    expect(info.orderIds).to.be.empty;
  });

  it('should not load data without a valid token', () => {
    const infoUpdate = {
      walletBalance: 2000
    };

    user.load(infoUpdate);

    const info = user.getInfo();

    expect(info.walletBalance).to.not.exist;
  });

  it('should update partial data', () => {
    const infoUpdates: any = {
      walletBalance: 2000,
      showTermsAndCondition: false,
      infoMessage: 'new msg'
    };

    user.load(data);

    const parts = Object.keys(infoUpdates);
    for (let i = 0; parts.length > i; i += 1) {
      const prop = parts[i];
      const update = {
        [prop]: infoUpdates[prop]
      };

      user.load(update);

      const info = user.getInfo();

      if ('walletBalance' === prop) {
        expect(info.walletBalance!.value).to.equal(update[prop] / 100);
      } else {
        expect(info[prop]).to.equal(update[prop]);
      }
    }
  });

  it('should return credentials', () => {
    const cred = user.getCredentials();

    expect(cred).to.exist;
    expect(cred.username).to.equal(credentials.username);
    expect(cred.password).to.equal(credentials.password);
  });

  it('should add an order id to the user', () => {
    const orderId = 12345;

    user.load(data);
    user.addOrderId(orderId);

    const info = user.getInfo();

    expect(info.orderIds).to.exist;
    expect(info.orderIds).to.have.length(1);
    expect(info.orderIds).to.include(orderId);
  });
});
