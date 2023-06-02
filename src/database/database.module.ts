import { Module, Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as mongoose from 'mongoose';

const dbProviders: Provider = {
  provide: 'DATABASE_CONNECTION',
  useFactory: (configService: ConfigService): Promise<typeof mongoose> =>
    mongoose.connect(configService.get<string>('DB_CONNECTION_URL') || ''),
  inject: [ConfigService],
};

@Module({
  providers: [dbProviders],
  exports: [dbProviders],
})
export class DatabaseModule {}
