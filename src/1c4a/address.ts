import CountryCode from './countryCode';
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

export const parseAddress = (data: SimpleAddress): NamedAddress => {
  // address
  const address: Address = {
    additional: (data.additional || '').substr(0, 50),
    street: data.street?.substr(0, 50),
    houseNo: data.houseNo?.substr(0, 10),
    zip: data.zip?.substr(0, 10),
    city: data.city?.substr(0, 35),
    country: (data.country || CountryCode.DEU).toUpperCase() as CountryCode
  };
  if (!address.additional) {
    delete address.additional;
  }

  if (!address.street || !address.houseNo || !address.zip || !address.city) {
    throw new AddressError(
      'Missing address data, minimum requirements are street, houseNo, zip and city'
    );
  }

  if (!Object.values(CountryCode).includes(address.country!)) {
    throw new AddressError('Invalid countryCode given, please refer to the CountryCode enum.');
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
