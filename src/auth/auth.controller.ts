import { Body, Controller, Post } from '@nestjs/common';
import { IAuthController } from './interfaces';
import { ITokenPair } from 'src/jwt/interfaces';
import { AuthService } from './auth.service';
import { SignInDto } from './dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController implements IAuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  public async login(@Body() user: SignInDto): Promise<ITokenPair> {
    return this.authService.getAuthTokens(user);
  }
}
