import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { IAuthJwtStrategyConfig } from '../interfaces';
import { IJwtPayload } from '../../jwt/interfaces';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly userService: UsersService,
    private readonly configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get('SECURITY_JWT_SECRET'),
    } as IAuthJwtStrategyConfig);
  }

  public validate(payload: IJwtPayload): Promise<any> {
    return this.userService.findOne(payload.id);
  }
}
