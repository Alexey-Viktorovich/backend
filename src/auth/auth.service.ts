import { Injectable } from '@nestjs/common';
import { ITokenPair } from 'src/jwt/interfaces';
import { JwtService } from 'src/jwt/jwt.service';
import { SignInDto } from './dto';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UsersService,
  ) {}

  public async getAuthTokens(payload: SignInDto): Promise<ITokenPair> {
    const user = await this.userService.login(
      payload.nickName,
      payload.password,
    );

    if (user) {
      return this.jwtService.getTokenPair({ id: user.id });
    }

    throw new Error('User not found');
  }
}
