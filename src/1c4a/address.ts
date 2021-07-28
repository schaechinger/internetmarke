import { AddressError } from './Error';

export interface SimpleName {
  firstname?: string;
  lastname?: string;
  title?: string;
  salutation?: string;
}
export interface SimpleAddress extends SimpleName {
  company?: string;

  street: string;
  houseNo: string;
  additional?: string;
  zip: string;
  city: string;
  country?: CountryCode;
}

export interface PersonName {
  firstname: string;
  lastname: string;
  title?: string;
  salutation?: string;
}

export interface CompanyName {
  company: string;
  personName?: PersonName;
}

export interface Address {
  street: string;
  houseNo: string;
  additional?: string;
  zip: string;
  city: string;
  country?: CountryCode;
}

export interface PersonAddress {
  name: {
    personName: PersonName;
  };
  address: Address;
}

export interface CompanyAddress {
  name: {
    companyName: CompanyName;
  };
  address: Address;
}

export type NamedAddress = PersonAddress | CompanyAddress;

export interface AddressBinding {
  sender: NamedAddress;
  receiver: NamedAddress;
}

export enum CountryCode {
  ABW = 'ABW', //Aruba
  AFG = 'AFG', //Afghanistan
  AGO = 'AGO', //Angola
  AIA = 'AIA', //Anguilla
  ALA = 'ALA', //Åland Islands
  ALB = 'ALB', //Albania
  AND = 'AND', //Andorra
  ANT = 'ANT', //Netherlands Antilles
  ARE = 'ARE', //United Arab Emirates
  ARG = 'ARG', //Argentina
  ARM = 'ARM', //Armenia
  ASM = 'ASM', //American Samoa
  ATA = 'ATA', //Antarctica
  ATF = 'ATF', //French Southern Territories
  ATG = 'ATG', //Antigua and Barbuda
  AUS = 'AUS', //Australia
  AUT = 'AUT', //Austria
  AZE = 'AZE', //Azerbaijan
  BDI = 'BDI', //Burundi
  BEL = 'BEL', //Belgium
  BEN = 'BEN', //Benin
  BFA = 'BFA', //Burkina Faso
  BGD = 'BGD', //Bangladesh
  BGR = 'BGR', //Bulgaria
  BHR = 'BHR', //Bahrain
  BHS = 'BHS', //Bahamas
  BIH = 'BIH', //Bosnia and Herzegovina
  BLM = 'BLM', //Saint Barthélemy
  BLR = 'BLR', //Belarus
  BLZ = 'BLZ', //Belize
  BMU = 'BMU', //Bermuda
  BOL = 'BOL', //Bolivia,  Plurinational State of
  BRA = 'BRA', //Brazil
  BRB = 'BRB', //Barbados
  BRN = 'BRN', //Brunei Darussalam
  BTN = 'BTN', //Bhutan
  BVT = 'BVT', //Bouvet Island
  BWA = 'BWA', //Botswana
  CAF = 'CAF', //Central African Republic
  CAN = 'CAN', //Canada
  CCK = 'CCK', //Cocos (Keeling) Islands
  CHE = 'CHE', //Switzerland
  CHL = 'CHL', //Chile
  CHN = 'CHN', //China
  CIV = 'CIV', //Côte d'Ivoire
  CMR = 'CMR', //Cameroon
  COD = 'COD', //Congo,  the Democratic Republic of the
  COG = 'COG', //Congo
  COK = 'COK', //Cook Islands
  COL = 'COL', //Colombia
  COM = 'COM', //Comoros
  CPV = 'CPV', //Cape Verde
  CRI = 'CRI', //Costa Rica
  CUB = 'CUB', //Cuba
  CXR = 'CXR', //Christmas Island
  CYM = 'CYM', //Cayman Islands
  CYP = 'CYP', //Cyprus
  CZE = 'CZE', //Czech Republic
  DEU = 'DEU', //Germany
  DJI = 'DJI', //Djibouti
  DMA = 'DMA', //Dominica
  DNK = 'DNK', //Denmark
  DOM = 'DOM', //Dominican Republic
  DZA = 'DZA', //Algeria
  ECU = 'ECU', //Ecuador
  EGY = 'EGY', //Egypt
  ERI = 'ERI', //Eritrea
  ESH = 'ESH', //Western Sahara
  ESP = 'ESP', //Spain
  EST = 'EST', //Estonia
  ETH = 'ETH', //Ethiopia
  FIN = 'FIN', //Finland
  FJI = 'FJI', //Fiji
  FLK = 'FLK', //Falkland Islands (Malvinas)
  FRA = 'FRA', //France
  FRO = 'FRO', //Faroe Islands
  FSM = 'FSM', //Micronesia,  Federated States of
  GAB = 'GAB', //Gabon
  GBR = 'GBR', //United Kingdom
  GEO = 'GEO', //Georgia
  GGY = 'GGY', //Guernsey
  GHA = 'GHA', //Ghana
  GIB = 'GIB', //Gibraltar
  GIN = 'GIN', //Guinea
  GLP = 'GLP', //Guadeloupe
  GMB = 'GMB', //Gambia
  GNB = 'GNB', //Guinea-Bissau
  GNQ = 'GNQ', //Equatorial Guinea
  GRC = 'GRC', //Greece
  GRD = 'GRD', //Grenada
  GRL = 'GRL', //Greenland
  GTM = 'GTM', //Guatemala
  GUF = 'GUF', //French Guiana
  GUM = 'GUM', //Guam
  GUY = 'GUY', //Guyana
  HKG = 'HKG', //Hong Kong
  HMD = 'HMD', //Heard Island and McDonald Islands
  HND = 'HND', //Honduras
  HRV = 'HRV', //Croatia
  HTI = 'HTI', //Haiti
  HUN = 'HUN', //Hungary
  IDN = 'IDN', //Indonesia
  IMN = 'IMN', //Isle of Man
  IND = 'IND', //India
  IOT = 'IOT', //British Indian Ocean Territory
  IRL = 'IRL', //Ireland
  IRN = 'IRN', //Iran,  Islamic Republic of
  IRQ = 'IRQ', //Iraq
  ISL = 'ISL', //Iceland
  ISR = 'ISR', //Israel
  ITA = 'ITA', //Italy
  JAM = 'JAM', //Jamaica
  JEY = 'JEY', //Jersey
  JOR = 'JOR', //Jordan
  JPN = 'JPN', //Japan
  KAZ = 'KAZ', //Kazakhstan
  KEN = 'KEN', //Kenya
  KGZ = 'KGZ', //Kyrgyzstan
  KHM = 'KHM', //Cambodia
  KIR = 'KIR', //Kiribati
  KNA = 'KNA', //Saint Kitts and Nevis
  KOR = 'KOR', //Korea,  Republic of
  KWT = 'KWT', //Kuwait
  LAO = 'LAO', //Lao People's Democratic Republic
  LBN = 'LBN', //Lebanon
  LBR = 'LBR', //Liberia
  LBY = 'LBY', //Libyan Arab Jamahiriya
  LCA = 'LCA', //Saint Lucia
  LIE = 'LIE', //Liechtenstein
  LKA = 'LKA', //Sri Lanka
  LSO = 'LSO', //Lesotho
  LTU = 'LTU', //Lithuania
  LUX = 'LUX', //Luxembourg
  LVA = 'LVA', //Latvia
  MAC = 'MAC', //Macao
  MAF = 'MAF', //Saint Martin (French part)
  MAR = 'MAR', //Morocco
  MCO = 'MCO', //Monaco
  MDA = 'MDA', //Moldova,  Republic of
  MDG = 'MDG', //Madagascar
  MDV = 'MDV', //Maldives
  MEX = 'MEX', //Mexico
  MHL = 'MHL', //Marshall Islands
  MKD = 'MKD', //Macedonia,  the former Yugoslav Republic of
  MLI = 'MLI', //Mali
  MLT = 'MLT', //Malta
  MMR = 'MMR', //Myanmar
  MNE = 'MNE', //Montenegro
  MNG = 'MNG', //Mongolia
  MNP = 'MNP', //Northern Mariana Islands
  MOZ = 'MOZ', //Mozambique
  MRT = 'MRT', //Mauritania
  MSR = 'MSR', //Montserrat
  MTQ = 'MTQ', //Martinique
  MUS = 'MUS', //Mauritius
  MWI = 'MWI', //Malawi
  MYS = 'MYS', //Malaysia
  MYT = 'MYT', //Mayotte
  NAM = 'NAM', //Namibia
  NCL = 'NCL', //New Caledonia
  NER = 'NER', //Niger
  NFK = 'NFK', //Norfolk Island
  NGA = 'NGA', //Nigeria
  NIC = 'NIC', //Nicaragua
  NIU = 'NIU', //Niue
  NLD = 'NLD', //Netherlands
  NOR = 'NOR', //Norway
  NPL = 'NPL', //Nepal
  NRU = 'NRU', //Nauru
  NZL = 'NZL', //New Zealand
  OMN = 'OMN', //Oman
  PAK = 'PAK', //Pakistan
  PAN = 'PAN', //Panama
  PCN = 'PCN', //Pitcairn
  PER = 'PER', //Peru
  PHL = 'PHL', //Philippines
  PLW = 'PLW', //Palau
  PNG = 'PNG', //Papua New Guinea
  POL = 'POL', //Poland
  PRI = 'PRI', //Puerto Rico
  PRK = 'PRK', //Korea,  Democratic People's Republic of
  PRT = 'PRT', //Portugal
  PRY = 'PRY', //Paraguay
  PSE = 'PSE', //Palestinian Territory,  Occupied
  PYF = 'PYF', //French Polynesia
  QAT = 'QAT', //Qatar
  REU = 'REU', //Réunion
  ROU = 'ROU', //Romania
  RUS = 'RUS', //Russian Federation
  RWA = 'RWA', //Rwanda
  SAU = 'SAU', //Saudi Arabia
  SDN = 'SDN', //Sudan
  SEN = 'SEN', //Senegal
  SGP = 'SGP', //Singapore
  SGS = 'SGS', //South Georgia and the South Sandwich Islands
  SHN = 'SHN', //Saint Helena,  Ascension and Tristan da Cunha
  SJM = 'SJM', //Svalbard and Jan Mayen
  SLB = 'SLB', //Solomon Islands
  SLE = 'SLE', //Sierra Leone
  SLV = 'SLV', //El Salvador
  SMR = 'SMR', //San Marino
  SOM = 'SOM', //Somalia
  SPM = 'SPM', //Saint Pierre and Miquelon
  SRB = 'SRB', //Serbia
  STP = 'STP', //Sao Tome and Principe
  SUR = 'SUR', //Suriname
  SVK = 'SVK', //Slovakia
  SVN = 'SVN', //Slovenia
  SWE = 'SWE', //Sweden
  SWZ = 'SWZ', //Swaziland
  SYC = 'SYC', //Seychelles
  SYR = 'SYR', //Syrian Arab Republic
  TCA = 'TCA', //Turks and Caicos Islands
  TCD = 'TCD', //Chad
  TGO = 'TGO', //Togo
  THA = 'THA', //Thailand
  TJK = 'TJK', //Tajikistan
  TKL = 'TKL', //Tokelau
  TKM = 'TKM', //Turkmenistan
  TLS = 'TLS', //Timor-Leste
  TON = 'TON', //Tonga
  TTO = 'TTO', //Trinidad and Tobago
  TUN = 'TUN', //Tunisia
  TUR = 'TUR', //Turkey
  TUV = 'TUV', //Tuvalu
  TWN = 'TWN', //Taiwan, Province of China
  TZA = 'TZA', //Tanzania, United Republic of
  UGA = 'UGA', //Uganda
  UKR = 'UKR', //Ukraine
  UMI = 'UMI', //United States Minor Outlying Islands
  URY = 'URY', //Uruguay
  USA = 'USA', //United States
  UZB = 'UZB', //Uzbekistan
  VAT = 'VAT', //Holy See (Vatican City State)
  VCT = 'VCT', //Saint Vincent and the Grenadines
  VEN = 'VEN', //Venezuela,  Bolivarian Republic of
  VGB = 'VGB', //Virgin Islands,  British
  VIR = 'VIR', //Virgin Islands,  U.S.
  VNM = 'VNM', //Viet Nam
  VUT = 'VUT', //Vanuatu
  WLF = 'WLF', //Wallis and Futuna
  WSM = 'WSM', //Samoa
  YEM = 'YEM', //Yemen
  ZAF = 'ZAF', //South Africa
  ZMB = 'ZMB', //Zambia
  ZWE = 'ZWE' //Zimbabwe"
}

export const parseAddress = (data: SimpleAddress): NamedAddress => {
  // address
  const address: Address = {
    additional: (data.additional || '').substr(0, 50),
    street: data.street?.substr(0, 50),
    houseNo: data.houseNo?.substr(0, 10),
    zip: data.zip?.substr(0, 10),
    city: data.city?.substr(0, 35),
    country: data.country || CountryCode.DEU
  };
  if (!address.additional) {
    delete address.additional;
  }

  if (!address.street || !address.houseNo || !address.zip || !address.city) {
    throw new AddressError(
      'Missing address data, minimum requirements are street, houseNo, zip and city'
    );
  }

  // name
  const name = parseName(data);

  // company address
  if (data.company) {
    const companyAddress: CompanyAddress = {
      name: {
        companyName: {
          company: data.company.substr(0, 50)
        }
      },
      address
    };

    // named company address
    if (name) {
      companyAddress.name.companyName.personName = name;
    }

    return companyAddress;
  }
  // person address
  else if (name) {
    return {
      name: {
        personName: name
      },
      address
    };
  }

  // missing data
  throw new AddressError(
    'Missing address name, at least company or firstname and lastname must be provided.'
  );
};

export const parseName = (data: SimpleName): PersonName | null => {
  let name: PersonName | null = null;

  if (data.firstname && data.lastname) {
    name = {
      salutation: (data.salutation || '').substr(0, 10),
      title: (data.title || '').substr(0, 10),
      firstname: data.firstname.substr(0, 35),
      lastname: data.lastname.substr(0, 35)
    };
    if (!name.salutation) {
      delete name.salutation;
    }
    if (!name.title) {
      delete name.title;
    }
  }

  return name;
};
