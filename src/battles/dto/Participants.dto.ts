import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsDefined, IsNotEmpty } from 'class-validator';

export class ParticipantsDto {
  @ApiProperty({
    type: Array<string>,
    example: ['user_1', 'user_2'],
    description: 'User password',
  })
  @IsArray()
  @IsDefined()
  @IsNotEmpty()
  public readonly participants: string[];
}
