import { Module } from '@nestjs/common';
import { PasswordService } from './password.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  providers: [PasswordService],
  exports: [PasswordService],
})
export class PasswordModule {}
