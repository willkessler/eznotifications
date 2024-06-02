import { v4 as uuidv4 } from 'uuid';
import { SDKConfig } from '../../../react-core/src/types';
import { ConfigStore } from './ConfigStore';

export class UserIdGenerator {
  public static generate(suppliedUserId: string | undefined, apiKey:string): string {
    let latestUserId:string;
    let tinadConfig = ConfigStore.getConfiguration();

    // Immediately overwrite api key with the one passed in to us.
    tinadConfig.api.key = apiKey;

    if (suppliedUserId && suppliedUserId.length > 0) {
      tinadConfig.api.userId = suppliedUserId;
    } else {
      // If we were not provided a userId by the SDK, generate one and set it into local storage
      const newUuidParts = uuidv4().split('-');
      const newUserId = 'user-' + newUuidParts[0];
      if (!tinadConfig.api.userId) {
        tinadConfig.api.userId = newUserId;
      }
    }
  
    ConfigStore.setConfiguration(tinadConfig);
    return tinadConfig.api.userId;
  }


}
