import { CorsOptions } from 'cors';
import { HelmetOptions } from 'helmet';
import { config, configSchemaValidation } from './config';
import { ConfigModuleOptions } from '@nestjs/config/dist/interfaces';

export const helmetConfig: HelmetOptions = {
  referrerPolicy: true,
};

export const corseConfig: CorsOptions = {};

export const configOptions: ConfigModuleOptions = {
  load: [config],
  isGlobal: true,
  validationSchema: configSchemaValidation,
  validationOptions: {
    abortEarly: false,
    allowUnknown: true,
  },
};
