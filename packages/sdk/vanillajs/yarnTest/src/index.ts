// Replace your current import with the absolute path to the SDK
//import { configureTinad } from '/home/will/Development/this-is-not-a-drill/packages/sdk/vanillajs/dist/bundle.js';
import { configureTinad, generateDefaultConfiguration, SDKConfiguration } from '@this-is-not-a-drill/vanillajs-sdk';

console.log('Configurating TINAD');

const defaultConfig = generateDefaultConfiguration();
defaultConfig.api.endpoint = 'http://localhost:8080';
defaultConfig.api.key = 'C0N94F27';
defaultConfig.api.displayMode = 'toast';
console.log(`defaultConfig: ${JSON.stringify(defaultConfig,null,2)}`);
configureTinad(defaultConfig);

console.log('TINAD Configuration done.');

