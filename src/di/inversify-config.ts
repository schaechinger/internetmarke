import 'reflect-metadata';
import debug, { Debugger } from 'debug';
import { Container, interfaces } from 'inversify';
import { Client as SoapClient, createClientAsync } from 'soap';
import { TYPES } from './types';
import { Partner } from '../1c4a/Partner';
import { OneClickForAppService } from '../1c4a/Service';
import { User } from '../User';
import { Client } from '../prodWs/Client';
import { ProductService } from '../prodWs/Service';
import { DataStore } from '../services/DataStore';
import { PageFormat } from '../1c4a/pageFormat';
import { GalleryItem, MotiveLink } from '../1c4a/gallery';
import { Product } from '../prodWs/product';
import { PortokasseService } from '../portokasse/Service';
import { Catalog } from '../prodWs/catalog';

const container = new Container();

// factories
container.bind<interfaces.Factory<Debugger>>(TYPES.LoggerFactory).toFactory<Debugger>((): any => {
  return (logId?: string): Debugger => debug(`internetmarke${logId ? `:${logId}` : ''}`);
});

container
  .bind<interfaces.Factory<SoapClient>>(TYPES.SoapClientFactory)
  .toFactory<Promise<SoapClient>>((): any => (wsdl: string): Promise<SoapClient> => {
    return createClientAsync(wsdl, {
      disableCache: true
    });
  });

// Portokasse
container.bind<User>(TYPES.User).to(User);
container.bind<PortokasseService>(TYPES.PortokasseService).to(PortokasseService);

// 1C4A
container.bind<Partner>(TYPES.Partner).to(Partner);
container.bind<DataStore<PageFormat>>(TYPES.PageFormatStore).to(DataStore).inSingletonScope();
container.bind<DataStore<MotiveLink>>(TYPES.MotiveLinkStore).to(DataStore).inSingletonScope();
container.bind<DataStore<GalleryItem>>(TYPES.GalleryItemStore).to(DataStore).inSingletonScope();
container.bind<OneClickForAppService>(TYPES.OneClickForAppService).to(OneClickForAppService);

// ProdWS
container.bind<Client>(TYPES.Client).to(Client);
container.bind<DataStore<Catalog>>(TYPES.CatalogStore).to(DataStore).inSingletonScope();
container.bind<DataStore<Product>>(TYPES.ProductStore).to(DataStore).inSingletonScope();
container.bind<ProductService>(TYPES.ProductService).to(ProductService);

export default container;
