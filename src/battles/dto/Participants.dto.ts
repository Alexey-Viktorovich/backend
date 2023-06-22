import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsDefined,
  IsNotEmpty,
} from 'class-validator';

export class ParticipantsDto {
  @ApiProperty({
    type: Array<string>,
    example: ['user_1', 'user_2'],
    description: 'User password',
  })
  @IsArray()
  @IsDefined()
  @IsNotEmpty()
  @ArrayMinSize(16)
  @ArrayMaxSize(16)
  public readonly participants: string[];
}
