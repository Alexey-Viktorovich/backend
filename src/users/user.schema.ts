import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { EUserRoles } from 'src/common/enums';

@Schema()
export class User {
  @Prop()
  name: string;

  @Prop()
  nickName: string;

  @Prop()
  role: EUserRoles;

  @Prop()
  password: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
