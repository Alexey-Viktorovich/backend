import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LoggerModule } from './logger/logger.module';
import { ConfigModule } from '@nestjs/config';
import { configOptions } from './main.config';
import { DatabaseModule } from './database/database.module';

@Module({
  imports: [LoggerModule, ConfigModule.forRoot(configOptions), DatabaseModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
