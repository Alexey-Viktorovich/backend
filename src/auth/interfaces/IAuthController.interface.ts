import { ITokenPair } from '../../jwt/interfaces';
import { SignInDto } from '../dto';

export interface IAuthController {
  login(user: SignInDto): Promise<ITokenPair>;
}
