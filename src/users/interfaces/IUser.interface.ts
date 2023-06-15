import { EUserRoles } from 'src/common/enums';

export interface IUser {
  _id: string;

  name?: string | null;

  nickName: string;
  role: EUserRoles;
}
