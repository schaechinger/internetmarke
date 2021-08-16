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
  CatalogStore: Symbol('DataStore<Catalog>'),
  GalleryItemStore: Symbol('DataStore<GalleryItem>'),
  MotiveLinkStore: Symbol('DataStore<MotiveLink>'),
  PageFormatStore: Symbol('DataStore<PageFormat>'),
  ProductStore: Symbol('DataStore<Product>'),
  // factories
  LoggerFactory: Symbol('Factory<Logger>'),
  SoapClientFactory: Symbol('Factory<SoapClient>')
};
