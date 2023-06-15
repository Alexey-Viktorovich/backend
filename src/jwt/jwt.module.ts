import { Module } from '@nestjs/common';
import { JWT_MODULE_OPTIONS, JwtService } from './jwt.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModuleOptions } from '@nestjs/jwt';

@Module({
  imports: [ConfigModule],
  providers: [
    JwtService,
    {
      provide: JWT_MODULE_OPTIONS,
      useFactory: (config: ConfigService): JwtModuleOptions => {
        return {
          secret: config.get('SECURITY_JWT_SECRET'),
          signOptions: {
            expiresIn: config.get('SECURITY_ACCESS_TOKEN_EXPIRED'),
          },
        };
      },
      inject: [ConfigService],
    },
  ],
  exports: [JwtService],
})
export class JwtModule {}
