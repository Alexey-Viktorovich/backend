import * as Joi from 'joi';
import { EConfigEnvironment } from 'src/common/enums';

export const configSchemaValidation: Joi.ObjectSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid(...Object.values(EConfigEnvironment))
    .default(EConfigEnvironment.production),
  PORT: Joi.number().required(),
  SWAGGER_USR: Joi.string().optional(),
  API_DOC_PATH: Joi.string().required(),
  SWAGGER_PASSWORD: Joi.string().optional(),
  DB_CONNECTION_URL: Joi.string().required(),
  SECURITY_JWT_SECRET: Joi.string().required(),
  SECURITY_PASSWORD_SALT_ROUND: Joi.string().required(),
  SECURITY_ACCESS_TOKEN_EXPIRED: Joi.string().required(),
});
