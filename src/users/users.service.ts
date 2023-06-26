import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './user.schema';
import { Model } from 'mongoose';
import { UserDto } from './dto/User.dto';
import { PasswordService } from 'src/password/password.service';
import { IUserOutputModel } from './interfaces/IUserOutput.model';
import { EUserRoles } from 'src/common/enums';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private readonly passwordService: PasswordService,
  ) {}

  public async createUser(userDto: UserDto, role: EUserRoles): Promise<string> {
    const hasUser = await this.userModel.findOne({
      nickName: userDto.nickName,
    });

    if (hasUser) {
      throw new Error('this user already exists');
    }

    const userEntity = new this.userModel({
      ...userDto,
      role,
      password: await this.passwordService.hash(userDto.password),
    });

    const user = await userEntity.save();

    return user.id;
  }

  public async findOne(id: string): Promise<IUserOutputModel | null> {
    const user = await this.userModel.findOne({ _id: id }).exec();

    return user
      ? {
          id: user._id.toString(),
          name: user.name,
          nickName: user.nickName,
          role: user.role,
        }
      : null;
  }

  public async findMany(roleId: EUserRoles): Promise<IUserOutputModel[]> {
    return (
      await this.userModel.find({
        role: {
          $regex: new RegExp('^' + roleId.toLowerCase(), 'i'),
        },
      })
    ).map((user) => ({
      role: user.role,
      name: user.name,
      id: user._id.toString(),
      nickName: user.nickName,
    }));
  }

  public async login(
    nickName: string,
    password: string,
  ): Promise<IUserOutputModel | null> {
    const user = await this.userModel.findOne({ nickName }).exec();

    if (!user) {
      throw new Error('User not found');
    }

    const compare = await this.passwordService.compare(password, user.password);

    if (compare) {
      return {
        id: user._id.toString(),
        name: user.name,
        nickName: user.nickName,
        role: user.role,
      };
    }

    throw new Error('Wrong password');
  }

  public async getJudgeCount(): Promise<number> {
    return this.userModel.find({ role: EUserRoles.JUDGE }).count();
  }
}
