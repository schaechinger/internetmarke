export const TYPES = {
  Internetmarke: Symbol('Internetmarke'),
  // accounts
  Client: Symbol('Client'),
  Partner: Symbol('Partner'),
  User: Symbol('User'),
  // services
  OneClickForAppService: Symbol('OneClickForAppService'),
  PortokasseService: Symbol('PortokasseService'),
  ProductService: Symbol('ProductService'),
  // stores
  PageFormatStore: Symbol('DataStore<PageFormat>'),
  MotiveLinkStore: Symbol('DataStore<MotiveLink>'),
  GalleryItemStore: Symbol('DataStore<GalleryItem>'),
  ProductStore: Symbol('DataStore<Product>'),
  // factories
  LoggerFactory: Symbol('Factory<Logger>'),
  SoapClientFactory: Symbol('Factory<SoapClient>')
};
