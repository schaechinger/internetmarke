import { expect } from 'chai';

import { DinAPaper, getPaperDetails } from '../../../src/prodWs/paper';

describe('Paper', () => {
  describe('PaperDetails', () => {
    it('should calculate DIN 4A0 details', () => {
      const details = getPaperDetails(DinAPaper.Din4A0);

      expect(details.format).to.equal(DinAPaper.Din4A0);
      expect(details.dimensions.x).to.equal(1682);
      expect(details.dimensions.y).to.equal(2378);
      expect(details.dimensions.unit).to.equal('mm');
      expect(details.weight.value).to.equal(319.98);
      expect(details.weight.unit).to.equal('g');
    });

    it('should calculate DIN 2A0 details', () => {
      const details = getPaperDetails(DinAPaper.Din2A0);

      expect(details.format).to.equal(DinAPaper.Din2A0);
      expect(details.dimensions.x).to.equal(1189);
      expect(details.dimensions.y).to.equal(1682);
      expect(details.weight.value).to.equal(159.99);
    });

    it('should calculate DIN A1 details', () => {
      const details = getPaperDetails(DinAPaper.DinA1);

      expect(details.format).to.equal(DinAPaper.DinA1);
      expect(details.dimensions.x).to.equal(594);
      expect(details.dimensions.y).to.equal(841);
      expect(details.weight.value).to.equal(39.96);
    });

    it('should calculate DIN A4 details', () => {
      const details = getPaperDetails(DinAPaper.DinA4);

      expect(details.dimensions.x).to.equal(210);
      expect(details.dimensions.y).to.equal(297);
      expect(details.weight.value).to.equal(4.99);
    });

    it('should calculate DIN A10 details', () => {
      const details = getPaperDetails(DinAPaper.DinA10);

      expect(details.dimensions.x).to.equal(26);
      expect(details.dimensions.y).to.equal(37);
      expect(details.weight.value).to.equal(0.08);
    });

    it('should calculate DIN A4 details in imperial system', () => {
      const details = getPaperDetails(DinAPaper.DinA4, { system: 'IMPERIAL' });

      expect(details.dimensions.x).to.equal(8.3);
      expect(details.dimensions.y).to.equal(11.7);
      expect(details.dimensions.unit).to.equal('in');
      expect(details.weight.value).to.equal(0.176);
      expect(details.weight.unit).to.equal('oz');
    });
  });
});
