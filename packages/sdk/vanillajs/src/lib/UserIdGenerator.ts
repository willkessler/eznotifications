import { v4 as uuidv4 } from 'uuid';
import { SDKConfig } from '../../../react-core/src/types';

export class UserIdGenerator {
  public static generate(suppliedUserId: string | undefined, apiKey:string): string {
    let latestUserId:string;
    let tinadConfig: SDKConfig;

    const tinadConfigStr = localStorage.getItem('tinad');
    if (tinadConfigStr) {
      tinadConfig = JSON.parse(tinadConfigStr);
    } else {
      tinadConfig = {
        userId: 'placeholder',
        apiKey: 'placeholder',
      }
    }
    // Immediately overwrite placeholder or previously stored api key
    // with the one passed in to us.
    tinadConfig.apiKey = apiKey;

    if (suppliedUserId && suppliedUserId.length > 0) {
      tinadConfig.userId = suppliedUserId;
    } else {
      // If we were not provided a userId by the SDK, generate one and set it into local storage
      const newUuidParts = uuidv4().split('-');
      const newUserId = 'user-' + newUuidParts[0];
      if (!tinadConfig.userId) {
        tinadConfig.userId = newUserId;
      } else if (tinadConfig.userId === 'placeholder') {
        tinadConfig.userId = newUserId;
      }        
    }
  
    const newTinadConfigStr = JSON.stringify(tinadConfig);
    localStorage.setItem('tinad', newTinadConfigStr);
    return tinadConfig.userId;
  }


}
