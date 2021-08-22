const getPropertyValue = (prop: any): any => {
  let value: any;
  if (undefined !== prop.alphanumericValue) {
    value = prop.alphanumericValue.attributes.fixValue;
    if ('ja' === value) {
      value = true;
    } else if ('nein' === value) {
      value = false;
    }
  } else if (undefined !== prop.numericValue) {
    if (undefined !== prop.numericValue.attributes.minValue) {
      value = {
        min: {
          value: +prop.numericValue.attributes.minValue,
          unit: prop.numericValue.attributes.unit
        },
        max: {
          value: +prop.numericValue.attributes.maxValue,
          unit: prop.numericValue.attributes.unit
        }
      };
    } else {
      value = +prop.numericValue.attributes.fixValue;
    }
  } else if (undefined !== prop.booleanValue) {
    value = 'true' === prop.booleanValue;
  } else if (undefined !== prop.dateValue) {
    value = (prop.dateValue && new Date(prop.dateValue.attributes.fixDate)) || null;
  }

  if (undefined === value) {
    const key = Object.keys(prop)[0];
    value = prop[key].attributes?.fixValue || prop[key];
    // throw new Error(`Unknown prop type: ${Object.keys(prop)[0]}`);
  }

  return value;
};

export const parsePropertyList = (data: any): { [name: string]: any } => {
  const properties: { [name: string]: any } = {};
  const propertyList = Array.isArray(data.property) ? data.property : [data.property];

  propertyList.forEach(prop => {
    const { name } = prop.attributes;
    const val = getPropertyValue(prop.propertyValue);
    if (!properties![name]) {
      properties![name] = val;
    } else {
      if (!Array.isArray(properties![name])) {
        properties![name] = [properties![name]];
      }

      properties![name].push(val);
    }
  });

  return properties;
};
