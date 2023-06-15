import { IUser } from 'src/users/interfaces';

export interface IRequestWithUser extends Request {
  user?: IUser;
}
