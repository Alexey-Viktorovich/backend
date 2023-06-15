import { EJwtType } from 'src/jwt/enums';
import { IJwtPayload } from './IJwtPayload.interface';
import { ITokenPair } from './ITokenPair.interface';

export interface IJwtService {
  getToken(payload: Partial<IJwtPayload>, type: EJwtType): string;

  parseToken(token: string): IJwtPayload;

  getTokenPair(payload: Partial<IJwtPayload>): ITokenPair;
}
