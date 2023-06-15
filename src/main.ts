import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { LoggerService } from './logger/logger.service';
import { ConfigService } from '@nestjs/config';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import * as cors from 'cors';

import { corseConfig, helmetConfig } from './main.config';
import { ErrorsInterceptor } from './common/interceptors';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

class Application {
  public configService: ConfigService;
  public loggerService: LoggerService;

  private app: INestApplication;

  constructor() {
    this.loggerService = new LoggerService('Dance API');
  }

  public async bootstrap(): Promise<void> {
    this.app = await NestFactory.create(AppModule, {
      logger: this.loggerService,
    });

    this.configService = this.app.get(ConfigService);

    const PORT = this.configService.get<number>('PORT') || 4200;

    this.app.setGlobalPrefix('api');

    this.app.use(helmet(helmetConfig));
    this.app.use(cors(corseConfig));

    this.app.useGlobalInterceptors(
      new ErrorsInterceptor(this.loggerService, this.configService),
    );

    this.app.useGlobalPipes(
      new ValidationPipe({ transform: true, whitelist: true }),
    );

    const document = SwaggerModule.createDocument(
      this.app,
      new DocumentBuilder().setTitle('Dance API').setVersion('1.0').build(),
    );
    SwaggerModule.setup(
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      this.configService.get('API_DOC_PATH')!,
      this.app,
      document,
    );

    this.useListeners();

    this.app
      .listen(PORT)
      .then(() =>
        this.loggerService.log(`Application was started on PORT ${PORT}`),
      )
      .catch((e) => this.loggerService.error(e));
  }

  private useListeners(): void {
    process.on('unhandledRejection', (reason: any): void => {
      this.loggerService.error(
        reason.toString(),
        reason.stack || reason,
        'Unhandled Rejection',
      );
      process.exit(1);
    });

    process.on('uncaughtException', (err: any): void => {
      this.loggerService.error({ err }, 'Uncaught Exception');
      process.exit(1);
    });

    process.on('warning', (err: any): void => {
      this.loggerService.error({ err }, 'Warning detected');
    });

    process.on('exit', (code): void => {
      this.loggerService.warn(`Stopped with code: ${code}`);
    });
  }
}

const app = new Application();

app.bootstrap();
