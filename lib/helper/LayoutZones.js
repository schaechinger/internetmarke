const { LAYOUT_ZONES } = require('../constants');

class LayoutZones {
  validate(voucherLayout) {
    let valid = false;
    for (const key in LAYOUT_ZONES) {
      if (LAYOUT_ZONES.hasOwnProperty(key) && voucherLayout === LAYOUT_ZONES[key]) {
        valid = true;
      }
    }

    return valid;
  }
};

module.exports = new LayoutZones();
