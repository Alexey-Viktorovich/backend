import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModuleOptions, JwtService as JS } from '@nestjs/jwt';
import { InvalidTokenError } from './errors';
import { IJwtPayload, IJwtService, ITokenPair } from './interfaces';

export const JWT_MODULE_OPTIONS = 'JWT_MODULE_OPTIONS';

@Injectable()
export class JwtService extends JS implements IJwtService {
  constructor(
    @Inject(JWT_MODULE_OPTIONS)
    private readonly jwtModuleOptions: JwtModuleOptions,
    private readonly configService: ConfigService,
  ) {
    super(jwtModuleOptions);
  }

  public getToken(payload: Partial<IJwtPayload>): string {
    return this.sign(payload, {
      expiresIn: this.configService.get<number>(
        'SECURITY_ACCESS_TOKEN_EXPIRED',
      ),
    });
  }

  public parseToken(token: string): IJwtPayload {
    try {
      return this.verify(token);
    } catch (e) {
      throw new InvalidTokenError();
    }
  }

  public getTokenPair(payload: Partial<IJwtPayload>): ITokenPair {
    return {
      accessToken: this.getToken(payload),
      refreshToken: this.getToken(payload),
    };
  }
}
