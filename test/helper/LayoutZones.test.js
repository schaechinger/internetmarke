const layoutZoneHelper = require('../../lib/helper/LayoutZones'),
  { LAYOUT_ZONES } = require('../../lib/constants');

const TEST_DATA = require('./LayoutZones.data.json');

describe('Layout Zone Helper', () => {
  it('should accept valid layout zones', () => {
    for (const zone in LAYOUT_ZONES) {
      if (LAYOUT_ZONES.hasOwnProperty(zone)) {
        layoutZoneHelper.validate(LAYOUT_ZONES[zone]).should.be.true();
      }
    }
  });

  it('should reject invalid layout zones', () => {
    TEST_DATA.invalid.forEach(layoutZone => {
      layoutZoneHelper.validate(layoutZone).should.be.false();
    });
  });
});

