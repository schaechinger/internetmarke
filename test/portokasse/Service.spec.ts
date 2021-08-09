import { expect } from 'chai';
import { UserError } from '../../src/Error';
import { PortokasseService } from '../../src/portokasse/Service';
import { userStub } from '../stubs/User.stub';

describe('Portokasse Service', () => {
  let service: PortokasseService;

  beforeEach(() => {
    service = new PortokasseService(userStub);
  });

  describe('init', () => {
    it('should prevent init without user credentials', async () => {
      await expect(service.init({} as any)).to.eventually.be.rejectedWith(UserError);
    });
  });

  it('should access the homepage', () => {});
});
