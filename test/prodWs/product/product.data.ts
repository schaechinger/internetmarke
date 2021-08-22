import { Product } from '../../../src/Internetmarke';

export const invalidProducts = [
  null,
  {},
  {
    INVALID: {
      id: 1
    }
  }
];

export const validProducts = [
  {
    extendedIdentifier: {
      attributes: {
        destination: 'national'
      },
      externIdentifier: {
        attributes: {
          source: 'PPL',
          id: '1',
          name: 'Standardbrief',
          firstPPLVersion: '1',
          lastPPLVersion: '47',
          actualPPLVersion: '47'
        }
      }
    },
    priceDefinition: {
      price: {
        calculatedGrossPrice: {
          attributes: {
            value: '0.80',
            currency: 'EUR',
            calculated: 'true'
          }
        }
      }
    }
  },
  {
    extendedIdentifier: {
      attributes: {
        destination: 'national'
      },
      externIdentifier: {
        attributes: {
          source: 'PPL',
          id: '1002',
          name: 'Standardbrief Integral + EINSCHREIBEN EINWURF',
          firstPPLVersion: '35',
          lastPPLVersion: '39',
          actualPPLVersion: '39'
        }
      }
    },
    priceDefinition: {
      price: {
        calculatedGrossPrice: {
          attributes: {
            value: '2.85',
            currency: 'EUR',
            calculated: 'true'
          }
        }
      }
    },
    dimensionList: {
      length: {
        attributes: {
          minValue: '140',
          maxValue: '235',
          unit: 'mm'
        }
      },
      width: {
        attributes: {
          minValue: '90',
          maxValue: '125',
          unit: 'mm'
        }
      },
      height: {
        attributes: {
          minValue: '0',
          maxValue: '5',
          unit: 'mm'
        }
      }
    },
    weight: {
      attributes: {
        minValue: '0',
        maxValue: '20',
        unit: 'g'
      }
    },
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
    },
    stampTypeList: {
      stampType: [
        {
          attributes: {
            name: 'Internetmarke'
          },
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
        }
      ]
    }
  }
];

export const skipOptionals = [
  {
    raw: {
      extendedIdentifier: {
        attributes: {
          destination: 'national'
        },
        externIdentifier: {
          attributes: {
            id: '1002',
            name: 'Standardbrief Integral + EINSCHREIBEN EINWURF',
            actualPPLVersion: '39'
          }
        }
      },
      priceDefinition: {
        price: {
          calculatedGrossPrice: {
            attributes: {
              value: '2.85'
            }
          }
        }
      }
    }
  }
];

export const productList: Product[] = [
  {
    id: 1,
    name: 'Standardbrief',
    ppl: 49,
    price: {
      value: 0.8,
      currency: 'EUR'
    },
    domestic: true,
    registered: false,
    priority: false,
    tracking: false,
    dimensions: {
      min: {
        width: 90,
        length: 140,
        unit: 'mm',
        height: 0
      },
      max: {
        width: 125,
        length: 235,
        unit: 'mm',
        height: 5
      }
    },
    weight: {
      min: {
        value: 0,
        unit: 'g'
      },
      max: {
        value: 20,
        unit: 'g'
      }
    },
    properties: {
      MinRatio: 1.4,
      AllowedForm: 'Rechteckform',
      marketingName: 'Standardbrief',
      extProp_Nachsenden: true,
      MachineAbility: true,
      extProp_IST_BASIS_TRACKING: true,
      DisplayName2: 'Standardbrief',
      InformationText:
        'Preis nach UStG umsatzsteuerfrei. Für Briefe, Schriftstücke und kleinere Gegenstände bis 20 g. Die Länge muss mindestens das 1,4-fache der Breite betragen.',
      'extProp_PPL-Ausschluss': false,
      DisplayName: 'Standardbrief',
      URL: 'https://www.deutschepost.de/de/b/brief_postkarte.html',
      Description: 'INTERNETMARKE',
      extProp_Zollerklärung: false,
      BestBeforeDuration: 3,
      NumberStampType: 0,
      StampType: 'Internetmarke',
      extProp_Vertragsprodukt: false
    }
  },
  {
    id: 11,
    name: 'Kompaktbrief',
    ppl: 49,
    price: {
      value: 0.95,
      currency: 'EUR'
    },
    domestic: true,
    registered: false,
    priority: false,
    tracking: false,
    dimensions: {
      min: {
        width: 70,
        length: 100,
        unit: 'mm',
        height: 0
      },
      max: {
        width: 125,
        length: 235,
        unit: 'mm',
        height: 10
      }
    },
    weight: {
      min: {
        value: 0,
        unit: 'g'
      },
      max: {
        value: 50,
        unit: 'g'
      }
    },
    properties: {
      MinRatio: 1.4,
      AllowedForm: 'Rechteckform',
      extProp_IST_BASIS_TRACKING: true,
      extProp_Nachsenden: true,
      marketingName: 'Kompaktbrief',
      Description: 'INTERNETMARKE',
      DisplayName2: 'Kompaktbrief',
      InformationText:
        'Preis nach UStG umsatzsteuerfrei. Für Briefe, Schriftstücke und kleinere Gegenstände bis 50 g. Die Länge muss mindestens das 1,4-fache der Breite betragen.',
      'extProp_PPL-Ausschluss': false,
      StampType: 'Internetmarke',
      NumberStampType: 0,
      extProp_Zollerklärung: false,
      extProp_Vertragsprodukt: false,
      BestBeforeDuration: 3,
      DisplayName: 'Kompaktbrief',
      URL: 'https://www.deutschepost.de/de/b/brief_postkarte.html'
    }
  },
  {
    id: 21,
    name: 'Großbrief',
    ppl: 49,
    price: {
      value: 1.55,
      currency: 'EUR'
    },
    domestic: true,
    registered: false,
    priority: false,
    tracking: false,
    dimensions: {
      min: {
        width: 70,
        length: 100,
        unit: 'mm',
        height: 0
      },
      max: {
        width: 250,
        length: 353,
        unit: 'mm',
        height: 20
      }
    },
    weight: {
      min: {
        value: 0,
        unit: 'g'
      },
      max: {
        value: 500,
        unit: 'g'
      }
    },
    properties: {
      extProp_IST_BASIS_TRACKING: true,
      AllowedForm: 'Quadratform möglich',
      extProp_Nachsenden: true,
      marketingName: 'Großbrief',
      BestBeforeDuration: 3,
      Description: 'INTERNETMARKE',
      DisplayName2: 'Großbrief',
      InformationText:
        'Preis nach UStG umsatzsteuerfrei. Für Briefe, Schriftstücke und kleinere Gegenstände bis 500 g.',
      StampType: 'Internetmarke',
      extProp_Zollerklärung: false,
      extProp_Vertragsprodukt: false,
      URL: 'https://www.deutschepost.de/de/b/brief_postkarte.html',
      NumberStampType: 0,
      'extProp_PPL-Ausschluss': false,
      DisplayName: 'Großbrief'
    }
  },
  {
    id: 31,
    name: 'Maxibrief',
    ppl: 49,
    price: {
      value: 2.7,
      currency: 'EUR'
    },
    domestic: true,
    registered: false,
    priority: false,
    tracking: false,
    dimensions: {
      min: {
        width: 70,
        length: 100,
        unit: 'mm',
        height: 0
      },
      max: {
        width: 250,
        length: 353,
        unit: 'mm',
        height: 50
      }
    },
    weight: {
      min: {
        value: 0,
        unit: 'g'
      },
      max: {
        value: 1000,
        unit: 'g'
      }
    },
    properties: {
      AllowedForm: 'Quadratform möglich',
      extProp_IST_BASIS_TRACKING: true,
      extProp_Nachsenden: true,
      marketingName: 'Maxibrief',
      'extProp_PPL-Ausschluss': false,
      DisplayName: 'Maxibrief',
      URL: 'https://www.deutschepost.de/de/b/brief_postkarte.html',
      extProp_Vertragsprodukt: false,
      extProp_Zollerklärung: false,
      DisplayName2: 'Maxibrief',
      StampType: 'Internetmarke',
      BestBeforeDuration: 3,
      NumberStampType: 0,
      InformationText:
        'Preis nach UStG umsatzsteuerfrei. Für Briefe, Schriftstücke und kleinere Gegenstände bis 1000 g.',
      Description: 'INTERNETMARKE'
    }
  },
  {
    id: 51,
    name: 'Postkarte',
    ppl: 49,
    price: {
      value: 0.6,
      currency: 'EUR'
    },
    domestic: true,
    registered: false,
    priority: false,
    tracking: false,
    dimensions: {
      min: {
        width: 90,
        length: 140,
        unit: 'mm',
        height: 0
      },
      max: {
        width: 125,
        length: 235,
        unit: 'mm',
        height: 2
      }
    },
    properties: {
      MachineAbility: true,
      marketingName: 'Postkarte',
      extProp_Nachsenden: true,
      extProp_IST_BASIS_TRACKING: true,
      AllowedForm: 'Rechteckform',
      Grammage: {
        min: {
          value: 150,
          unit: 'g/m²'
        },
        max: {
          value: 500,
          unit: 'g/m²'
        }
      },
      MinRatio: 1.4,
      StampType: 'Internetmarke',
      NumberStampType: 0,
      BestBeforeDuration: 3,
      Description: 'INTERNETMARKE',
      DisplayName2: 'Postkarte',
      extProp_Zollerklärung: false,
      extProp_Vertragsprodukt: false,
      URL: 'https://www.deutschepost.de/de/b/brief_postkarte.html',
      DisplayName: 'Postkarte',
      'extProp_PPL-Ausschluss': false,
      InformationText:
        'Preis nach UStG umsatzsteuerfrei. Die Länge muss mindestens das 1,4-fache der Breite betragen.'
    }
  },
  {
    id: 195,
    name: 'Standardbrief + Prio',
    ppl: 49,
    price: {
      value: 1.8,
      currency: 'EUR'
    },
    domestic: true,
    registered: false,
    priority: true,
    tracking: true,
    dimensions: {
      min: {
        width: 90,
        length: 140,
        unit: 'mm',
        height: 0
      },
      max: {
        width: 125,
        length: 235,
        unit: 'mm',
        height: 5
      }
    },
    weight: {
      min: {
        value: 0,
        unit: 'g'
      },
      max: {
        value: 20,
        unit: 'g'
      }
    },
    properties: {
      extProp_Nachsenden: true,
      marketingName: 'Brief mit Prio',
      MachineAbility: true,
      extProp_Sendungsverfolgung: true,
      AllowedForm: 'Rechteckform',
      MinRatio: 1.4,
      StampTypeCharacter: 'H',
      extProp_Zollerklärung: false,
      extProp_Vertragsprodukt: false,
      extProp_URL2: 'https://www.deutschepost.de/de/b/brief_postkarte.html',
      URL: 'https://www.deutschepost.de/de/p/prio.html',
      StampType: 'Internetmarke',
      DisplayName2: 'Standardbrief + Prio',
      InformationText:
        'Kombi-Produkt aus Standardbrief (umsatzsteuerfrei) und Zusatzleistung Prio (umsatzsteuerfrei). Sendungsverfolgung per T&T. Einlieferung über die Filialen der Deutschen Post.',
      Description: 'INTERNETMARKE',
      BestBeforeDuration: 3,
      'extProp_PPL-Ausschluss': false,
      ServiceText: 'PRIO',
      NumberStampType: 0
    }
  },
  {
    id: 1002,
    name: 'Standardbrief Integral + EINSCHREIBEN EINWURF',
    ppl: 49,
    price: {
      value: 3,
      currency: 'EUR'
    },
    domestic: true,
    registered: true,
    priority: false,
    tracking: true,
    dimensions: {
      min: {
        width: 90,
        length: 140,
        unit: 'mm',
        height: 0
      },
      max: {
        width: 125,
        length: 235,
        unit: 'mm',
        height: 5
      }
    },
    weight: {
      min: {
        value: 0,
        unit: 'g'
      },
      max: {
        value: 20,
        unit: 'g'
      }
    },
    properties: {
      MachineAbility: true,
      extProp_Sendungsverfolgung: true,
      MinRatio: 1.4,
      'extProp_Ausschleusen INA': true,
      marketingName: 'Brief mit Einschreiben',
      extProp_Haftung: true,
      extProp_Haftungshöhe: {
        min: {
          value: 0,
          unit: 'EUR'
        },
        max: {
          value: 20,
          unit: 'EUR'
        }
      },
      extProp_Nachsenden: false,
      AllowedForm: 'Rechteckform',
      StampType: 'Internetmarke',
      ServiceText: 'EINSCHREIBEN EINWURF',
      NumberStampType: 0,
      BestBeforeDuration: 3,
      Description: 'INTERNETMARKE',
      DisplayName2: 'Standardbrief + Einschreiben + Einwurf',
      StampTypeCharacter: 'R',
      'extProp_PPL-Ausschluss': false,
      DisplayName: 'Standardbrief Einschreiben Einwurf',
      URL: 'https://www.deutschepost.de/de/e/einschreiben.html',
      extProp_URL2: 'https://www.deutschepost.de/de/b/brief_postkarte.html',
      extProp_Zollerklärung: false,
      extProp_Vertragsprodukt: false,
      InformationText:
        'Preis nach UStG umsatzsteuerfrei. Ein Standardbrief bis 20 g, Zustellnachweis durch Postmitarbeiter, Sendungsverfolgung per T&T, Haftung bis 20 EUR, Einlieferung über die Filialen der Deutschen Post.'
    }
  },
  {
    id: 10001,
    name: 'Standardbrief Intern. GK',
    ppl: 49,
    price: {
      value: 1.1,
      currency: 'EUR'
    },
    domestic: false,
    registered: false,
    priority: false,
    tracking: false,
    dimensions: {
      min: {
        width: 90,
        length: 140,
        unit: 'mm',
        height: 0
      },
      max: {
        width: 125,
        length: 235,
        unit: 'mm',
        height: 5
      }
    },
    weight: {
      min: {
        value: 0,
        unit: 'g'
      },
      max: {
        value: 20,
        unit: 'g'
      }
    },
    properties: {
      MinRatio: 1.4,
      AllowedForm: 'Rechteckform',
      extProp_IST_BASIS_TRACKING: true,
      MachineAbility: true,
      MachineReadAbility: true,
      marketingName: 'Brief International',
      StampType: 'Internetmarke',
      DisplayText: 'PRIORITY  P.P.',
      NumberStampType: 0,
      BestBeforeDuration: 3,
      Description: 'INTERNETMARKE',
      DisplayName2: 'Standardbrief International',
      InformationText:
        'Preis nach UStG umsatzsteuerfrei. Für Briefe, Schriftstücke und kleinere Gegenstände bis 20 g. Die Länge muss mindestens das 1,4-fache der Breite betragen.',
      'extProp_PPL-Ausschluss': false,
      DisplayName: 'Standardbrief Intern.',
      URL: 'https://www.deutschepost.de/de/b/briefe-ins-ausland/brief-postkarte-international.html',
      extProp_Vertragsprodukt: false,
      extProp_Zollerklärung: false
    }
  }
];
