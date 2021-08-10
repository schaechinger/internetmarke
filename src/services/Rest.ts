import { injectable } from 'inversify';
import { PostService } from './service';

@injectable()
export abstract class RestService implements PostService {
  public abstract isInitialized(): boolean;
}
