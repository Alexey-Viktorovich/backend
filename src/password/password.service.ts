import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';

@Injectable()
export class PasswordService {
  constructor(private config: ConfigService) {}

  public compare(password: string, hashPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashPassword);
  }

  public async hash(password: string): Promise<string> {
    const salt = this.config.get('SECURITY_PASSWORD_SALT_ROUND');

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return await bcrypt.hash(password, +salt);
  }
}
