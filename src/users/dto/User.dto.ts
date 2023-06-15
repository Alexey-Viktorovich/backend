import { ApiProperty } from '@nestjs/swagger';
import {
  IsDefined,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class UserDto {
  @ApiProperty({
    type: String,
    required: false,
    example: 'Super User',
    description: 'User name and/or second name',
  })
  @IsString()
  @IsOptional()
  public readonly name: string;

  @ApiProperty({
    type: String,
    example: 'nick',
    description: 'User nickname',
  })
  @IsString()
  @IsDefined()
  @IsNotEmpty()
  public readonly nickName: string;

  @ApiProperty({
    type: String,
    example: '#$#FWDCC!@#decvfv53',
    description: 'User password',
  })
  @IsString()
  @IsDefined()
  @IsNotEmpty()
  @MinLength(6)
  public readonly password: string;
}
