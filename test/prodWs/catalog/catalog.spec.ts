import { expect } from 'chai';

import { parseCatalog } from '../../../src/prodWs/catalog';

describe('catalog', () => {
  let data: any;
  beforeEach(() => {
    data = {
      attributes: {
        name: 'Test catalog'
      },
      catalogValueList: {
        catalogValue: []
      }
    };
  });
  it('should detect invalid catalog data', () => {
    const invalidCatalogs = [
      null,
      {},
      {
        INVALID: {
          id: 1
        }
      }
    ];

    invalidCatalogs.forEach(invalid => {
      expect(parseCatalog(invalid)).to.be.null;
    });
  });

  it('should parse a catalog without properties', () => {
    const value = {
      name: 'name',
      value: 'value'
    };
    data.catalogValueList.catalogValue = [value];

    const catalog = parseCatalog(data);

    expect(catalog).to.exist;
    if (catalog) {
      expect(catalog.id).to.equal(data.attributes.name);
      expect(catalog.shortName).to.not.exist;
      expect(catalog.description).to.not.exist;
      expect(catalog.items).to.have.length(1);

      const item = catalog.items[0];
      expect(item.name).to.equal(value.name);
      expect(item.value).to.equal(value.value);
      expect(item.properties).to.not.exist;
    }
  });

  it('should parse a catalog with only one item', () => {
    const value = {
      name: 'name',
      value: 'value'
    };
    data.catalogValueList.catalogValue = value;

    const catalog = parseCatalog(data);

    expect(catalog).to.exist;
    if (catalog) {
      expect(catalog.id).to.equal(data.attributes.name);
      expect(catalog.shortName).to.not.exist;
      expect(catalog.description).to.not.exist;
      expect(catalog.items).to.have.length(1);

      const item = catalog.items[0];
      expect(item.name).to.equal(value.name);
      expect(item.value).to.equal(value.value);
      expect(item.properties).to.not.exist;
    }
  });

  it('should parse a catalog with a single list value', () => {
    const value = {
      name: 'name',
      value: "'value1'"
    };
    data.catalogValueList.catalogValue = [value];

    const catalog = parseCatalog(data);

    expect(catalog).to.exist;
    if (catalog) {
      expect(catalog.items).to.have.length(1);

      const item = catalog.items[0];
      expect(item.value).to.be.instanceOf(Array);
      expect(item.value).to.have.length(1);
      expect(item.value[0]).to.equal('value1');
    }
  });

  it('should parse a catalog with a value list', () => {
    const value = {
      name: 'name',
      value: "'value1','value2'"
    };
    data.catalogValueList.catalogValue = [value];

    const catalog = parseCatalog(data);

    expect(catalog).to.exist;
    if (catalog) {
      expect(catalog.items).to.have.length(1);

      const item = catalog.items[0];
      expect(Array.isArray(item.value)).to.be.true;
      expect(item.value).to.have.length(2);
      expect(item.value[0]).to.equal('value1');
      expect(item.value[1]).to.equal('value2');
    }
  });

  it('should parse a catalog with a single property', () => {
    const value = {
      name: 'name',
      value: 'value',
      propertyList: {
        property: {
          attributes: {
            name: 'prop'
          },
          propertyValue: {
            booleanValue: 'true'
          }
        }
      }
    };
    data.catalogValueList.catalogValue = [value];

    const catalog = parseCatalog(data);

    expect(catalog).to.exist;
    if (catalog) {
      expect(catalog.items).to.have.length(1);

      const item = catalog.items[0];
      expect(item.properties).to.exist;

      if (item.properties) {
        expect(item.properties).to.have.property('prop');
        expect(item.properties.prop).to.be.true;
      }
    }
  });

  it('should parse a catalog with a property list', () => {
    const value = {
      name: 'name',
      value: 'value',
      propertyList: {
        property: [
          {
            attributes: {
              name: 'prop1'
            },
            propertyValue: {
              booleanValue: 'true'
            }
          },
          {
            attributes: {
              name: 'prop2'
            },
            propertyValue: {
              booleanValue: 'false'
            }
          }
        ]
      }
    };
    data.catalogValueList.catalogValue = [value];

    const catalog = parseCatalog(data);

    expect(catalog).to.exist;
    if (catalog) {
      expect(catalog.items).to.have.length(1);

      const item = catalog.items[0];
      expect(item.properties).to.exist;

      if (item.properties) {
        expect(item.properties).to.have.property('prop1');
        expect(item.properties.prop1).to.be.true;
        expect(item.properties).to.have.property('prop2');
        expect(item.properties.prop2).to.be.false;
      }
    }
  });

  it('should parse a catalog with an alphanumeric property', () => {
    const value = {
      name: 'name',
      value: 'value',
      propertyList: {
        property: [
          {
            attributes: {
              name: 'prop'
            },
            propertyValue: {
              alphanumericValue: {
                attributes: {
                  fixValue: 'alphanumeric'
                }
              }
            }
          }
        ]
      }
    };
    data.catalogValueList.catalogValue = [value];

    const catalog = parseCatalog(data);

    expect(catalog).to.exist;
    if (catalog) {
      expect(catalog.items).to.have.length(1);

      const item = catalog.items[0];
      expect(item.properties).to.exist;

      if (item.properties) {
        expect(item.properties).to.have.property('prop');
        expect(item.properties.prop).to.equal('alphanumeric');
      }
    }
  });

  it('should parse a catalog with a numeric property', () => {
    const value = {
      name: 'name',
      value: 'value',
      propertyList: {
        property: [
          {
            attributes: {
              name: 'prop'
            },
            propertyValue: {
              numericValue: {
                attributes: {
                  fixValue: '1234'
                }
              }
            }
          }
        ]
      }
    };
    data.catalogValueList.catalogValue = [value];

    const catalog = parseCatalog(data);

    expect(catalog).to.exist;
    if (catalog) {
      expect(catalog.items).to.have.length(1);

      const item = catalog.items[0];
      expect(item.properties).to.exist;

      if (item.properties) {
        expect(item.properties).to.have.property('prop');
        expect(item.properties.prop).to.equal(1234);
      }
    }
  });

  it('should parse a catalog with a boolean property', () => {
    const value = {
      name: 'name',
      value: 'value',
      propertyList: {
        property: [
          {
            attributes: {
              name: 'prop'
            },
            propertyValue: {
              booleanValue: 'true'
            }
          }
        ]
      }
    };
    data.catalogValueList.catalogValue = [value];

    const catalog = parseCatalog(data);

    expect(catalog).to.exist;
    if (catalog) {
      expect(catalog.items).to.have.length(1);

      const item = catalog.items[0];
      expect(item.properties).to.exist;

      if (item.properties) {
        expect(item.properties).to.have.property('prop');
        expect(item.properties.prop).to.equal(true);
      }
    }
  });

  it('should parse a catalog with a date property', () => {
    const value = {
      name: 'name',
      value: 'value',
      propertyList: {
        property: [
          {
            attributes: {
              name: 'prop'
            },
            propertyValue: {
              dateValue: {
                attributes: {
                  fixDate: '2021-08-17'
                }
              }
            }
          }
        ]
      }
    };
    data.catalogValueList.catalogValue = [value];

    const catalog = parseCatalog(data);

    expect(catalog).to.exist;
    if (catalog) {
      expect(catalog.items).to.have.length(1);

      const item = catalog.items[0];
      expect(item.properties).to.exist;

      if (item.properties) {
        expect(item.properties).to.have.property('prop');
        expect(item.properties.prop).to.be.instanceOf(Date);
        expect(item.properties.prop.getTime()).to.equal(new Date('2021-08-17').getTime());
      }
    }
  });

  it('should parse a catalog with a date property that is null', () => {
    const value = {
      name: 'name',
      value: 'value',
      propertyList: {
        property: [
          {
            attributes: {
              name: 'prop'
            },
            propertyValue: {
              dateValue: null
            }
          }
        ]
      }
    };
    data.catalogValueList.catalogValue = [value];

    const catalog = parseCatalog(data);

    expect(catalog).to.exist;
    if (catalog) {
      expect(catalog.items).to.have.length(1);

      const item = catalog.items[0];
      expect(item.properties).to.exist;

      if (item.properties) {
        expect(item.properties).to.have.property('prop');
        expect(item.properties.prop).to.be.null;
      }
    }
  });

  it('should parse a catalog with an array property', () => {
    const value = {
      name: 'name',
      value: 'value',
      propertyList: {
        property: [
          {
            attributes: {
              name: 'prop'
            },
            propertyValue: {
              alphanumericValue: {
                attributes: {
                  fixValue: 'value1'
                }
              }
            }
          },
          {
            attributes: {
              name: 'prop'
            },
            propertyValue: {
              alphanumericValue: {
                attributes: {
                  fixValue: 'value2'
                }
              }
            }
          },
          {
            attributes: {
              name: 'prop'
            },
            propertyValue: {
              alphanumericValue: {
                attributes: {
                  fixValue: 'value3'
                }
              }
            }
          }
        ]
      }
    };
    data.catalogValueList.catalogValue = [value];

    const catalog = parseCatalog(data);

    expect(catalog).to.exist;
    if (catalog) {
      expect(catalog.items).to.have.length(1);

      const item = catalog.items[0];
      expect(item.properties).to.exist;

      if (item.properties) {
        expect(item.properties).to.have.property('prop');
        expect(item.properties.prop).to.be.instanceOf(Array);
        expect(item.properties.prop).to.have.length(3);
        expect(item.properties.prop[0]).to.equal('value1');
        expect(item.properties.prop[1]).to.equal('value2');
        expect(item.properties.prop[2]).to.equal('value3');
      }
    }
  });

  it('should parse a catalog with an unknown property type and fix value', () => {
    const value = {
      name: 'name',
      value: 'value',
      propertyList: {
        property: [
          {
            attributes: {
              name: 'prop'
            },
            propertyValue: {
              unknownValue: {
                attributes: {
                  fixValue: 'value'
                }
              }
            }
          }
        ]
      }
    };
    data.catalogValueList.catalogValue = [value];

    const catalog = parseCatalog(data);

    expect(catalog).to.exist;
    if (catalog) {
      expect(catalog.items).to.have.length(1);

      const item = catalog.items[0];
      expect(item.properties).to.exist;

      if (item.properties) {
        expect(item.properties).to.have.property('prop');
        expect(item.properties.prop).to.equal('value');
      }
    }
  });

  it('should parse a catalog with an unknown property type without fix value', () => {
    const value = {
      name: 'name',
      value: 'value',
      propertyList: {
        property: [
          {
            attributes: {
              name: 'prop'
            },
            propertyValue: {
              unknownValue: {
                complex: {
                  data: '<>'
                }
              }
            }
          }
        ]
      }
    };
    data.catalogValueList.catalogValue = [value];

    const catalog = parseCatalog(data);

    expect(catalog).to.exist;
    if (catalog) {
      expect(catalog.items).to.have.length(1);

      const item = catalog.items[0];
      expect(item.properties).to.exist;

      if (item.properties) {
        expect(item.properties).to.have.property('prop');
        expect(item.properties.prop).to.be.instanceOf(Object);
      }
    }
  });

  it('should parse a catalog with a short name', () => {
    const value = {
      name: 'name',
      value: 'value'
    };
    data.catalogValueList.catalogValue = [value];
    data.attributes.shortName = 'short';

    const catalog = parseCatalog(data);

    expect(catalog).to.exist;
    if (catalog) {
      expect(catalog.id).to.equal(data.attributes.name);
      expect(catalog.shortName).to.equal('short');
    }
  });

  it('should parse a catalog with a description', () => {
    const value = {
      name: 'name',
      value: 'value'
    };
    data.catalogValueList.catalogValue = [value];
    data.attributes.description = 'desc';

    const catalog = parseCatalog(data);

    expect(catalog).to.exist;
    if (catalog) {
      expect(catalog.id).to.equal(data.attributes.name);
      expect(catalog.description).to.equal('desc');
    }
  });
});
