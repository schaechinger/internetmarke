import { Internetmarke } from '../../src/Internetmarke';

export class InternetmarkeMock extends Internetmarke {
  public setPortokasseStub(portokasseService: any): void {
    this.portokasseService = portokasseService;
  }

  public set1C4AStub(oneC4A: any): void {
    this.oneClick4AppService = oneC4A;
  }

  public setProdWsStub(prodWs: any): void {
    this.productService = prodWs;
  }

  public resetStubs(): void {
    this.init();
  }
}
