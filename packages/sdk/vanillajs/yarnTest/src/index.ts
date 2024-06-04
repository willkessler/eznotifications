import dotenv from 'dotenv';
import { configureTinad, 
         generateDefaultConfiguration, 
         getCurrentConfiguration, 
         SDKConfiguration } from '@this-is-not-a-drill/vanillajs-sdk';

dotenv.config();

console.log('Configurating TINAD');
const newConfig = generateDefaultConfiguration();
newConfig.api.endpoint = process.env.API_ENDPOINT;
newConfig.api.key = process.env.API_KEY;
newConfig.api.displayMode = 'toast';
console.log(`newConfig: ${JSON.stringify(newConfig,null,2)}`);
configureTinad(newConfig);

const currentConfig = getCurrentConfiguration();
console.log(`Current TINAD config: ${JSON.stringify(currentConfig,null,2)}`);

console.log('TINAD Configuration done.');
