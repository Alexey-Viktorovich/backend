import { IsDefined, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SignInDto {
  @ApiProperty({ example: 'nickName', description: 'User nickname' })
  @IsDefined()
  @IsNotEmpty()
  public readonly nickName: string;

  @ApiProperty({ example: 'XaXukjhaADf123', description: 'User password' })
  @IsDefined()
  @IsNotEmpty()
  public readonly password: string;
}
