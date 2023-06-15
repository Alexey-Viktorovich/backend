import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { LoggerModule } from './logger/logger.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { configOptions } from './main.config';
import { UsersModule } from './users/users.module';
import { MongooseModule, MongooseModuleOptions } from '@nestjs/mongoose';
import { PasswordModule } from './password/password.module';
import { BattlesModule } from './battles/battles.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    LoggerModule,
    ConfigModule.forRoot(configOptions),
    UsersModule,
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService): MongooseModuleOptions => ({
        uri: config.get('DB_CONNECTION_URL'),
      }),
      inject: [ConfigService],
    }),
    PasswordModule,
    BattlesModule,
    AuthModule,
  ],
  providers: [AppService],
})
export class AppModule {}
