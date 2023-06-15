// import { Injectable } from '@nestjs/common';
// import { PassportStrategy } from '@nestjs/passport';
// import { Strategy } from 'passport-local';
// import { AuthService } from '../auth.service';
// import { SignInDto } from '../dto';
// // import { IUser } from 'src/modules/user/interfaces';

// @Injectable()
// export class LocalStrategy extends PassportStrategy(Strategy, 'local') {
//   constructor(private readonly authService: AuthService) {
//     super({
//       usernameField: 'nickName',
//       passReqToCallback: false,
//     });
//   }

//   public async validate(
//     nickName: SignInDto['nickName'],
//     password: SignInDto['password'],
//   ): Promise<any> {
//     return this.authService.login({ nickName, password });
//   }
// }
