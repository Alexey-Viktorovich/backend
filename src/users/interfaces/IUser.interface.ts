import { EUserRoles } from 'src/common/enums';

export interface IUser {
  id: string;

  name?: string | null;

  nickName: string;
  role: EUserRoles;
}
