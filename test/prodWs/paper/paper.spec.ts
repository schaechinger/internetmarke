import { expect } from 'chai';

import { DinEnvelope, DinPaper, getPaperDetails } from '../../../src/prodWs/paper';

describe('Paper', () => {
  describe('PaperDetails', () => {
    describe('DIN A', () => {
      it('should calculate DIN A0 details', () => {
        const details = getPaperDetails(DinPaper.DinA0)!;

        expect(details.format).to.equal(DinPaper.DinA0);
        expect(details.dimensions.size).to.eql([841, 1189]);
        expect(details.dimensions.unit).to.equal('mm');
        expect(details.weight.value).to.equal(80);
        expect(details.weight.unit).to.equal('g');
        expect(details.grammage.value).to.equal(80);
      });

      it('should calculate DIN A1 details', () => {
        const details = getPaperDetails(DinPaper.DinA1)!;

        expect(details.format).to.equal(DinPaper.DinA1);
        expect(details.dimensions.size).to.eql([594, 841]);
        expect(details.weight.value).to.equal(39.96);
      });

      it('should calculate DIN A4 details', () => {
        const details = getPaperDetails(DinPaper.DinA4)!;

        expect(details.dimensions.size).to.eql([210, 297]);
        expect(details.weight.value).to.equal(4.99);
      });

      it('should calculate DIN A5 details', () => {
        const details = getPaperDetails(DinPaper.DinA5)!;

        expect(details.dimensions.size).to.eql([148, 210]);
        expect(details.weight.value).to.equal(2.49);
      });

      it('should calculate DIN A10 details', () => {
        const details = getPaperDetails(DinPaper.DinA10)!;

        expect(details.dimensions.size).to.eql([26, 37]);
        expect(details.weight.value).to.equal(0.08);
      });

      it('should calculate DIN A4 details for heavier paper', () => {
        const details = getPaperDetails(DinPaper.DinA4, { grammage: 110 })!;

        expect(details.dimensions.size).to.eql([210, 297]);
        expect(details.weight.value).to.equal(6.86);
        expect(details.grammage.value).to.equal(110);
      });

      it('should calculate DIN A4 details in imperial system', () => {
        const details = getPaperDetails(DinPaper.DinA4, { system: 'IMPERIAL' })!;

        expect(details.dimensions.size).to.eql([8.3, 11.7]);
        expect(details.dimensions.unit).to.equal('in');
        expect(details.weight.value).to.equal(0.176);
        expect(details.weight.unit).to.equal('oz');
      });
    });

    describe('DIN B', () => {
      it('should calculate DIN B4 details', () => {
        const details = getPaperDetails(DinEnvelope.DinB4)!;

        expect(details.dimensions.size).to.eql([250, 353]);
        expect(details.weight.value).to.equal(15.88);
        expect(details.grammage.value).to.equal(90);
      });
    });

    describe('DIN C', () => {
      it('should calculate DIN C4 details', () => {
        const details = getPaperDetails(DinEnvelope.DinC4)!;

        expect(details.dimensions.size).to.eql([229, 324]);
        expect(details.weight.value).to.equal(13.36);
        expect(details.grammage.value).to.equal(90);
      });

      it('should calculate DIN C5 details', () => {
        const details = getPaperDetails(DinEnvelope.DinC5)!;

        expect(details.dimensions.size).to.eql([162, 229]);
        expect(details.weight.value).to.equal(6.68);
      });

      it('should calculate DIN C6 details', () => {
        const details = getPaperDetails(DinEnvelope.DinC6)!;

        expect(details.dimensions.size).to.eql([114, 162]);
        expect(details.weight.value).to.equal(3.32);
      });
    });

    describe('DIN Lang', () => {
      it('should calculate DIN Lang / DL details', () => {
        const details = getPaperDetails(DinEnvelope.DinLang)!;

        expect(details.dimensions.size).to.eql([110, 220]);
        expect(details.weight.value).to.equal(4.36);
      });

      it('should calculate DIN Lang details for heavier envelopes', () => {
        const details = getPaperDetails(DinEnvelope.DinLang, { grammage: 100 })!;

        expect(details.dimensions.size).to.eql([110, 220]);
        expect(details.weight.value).to.equal(4.84);
        expect(details.grammage.value).to.equal(100);
      });
    });

    it('should support post cards with no envelope', () => {
      const details = getPaperDetails(DinEnvelope.None);

      expect(details).to.be.null;
    });
  });
});
