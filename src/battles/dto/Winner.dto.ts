import { ApiProperty } from '@nestjs/swagger';
import { IsDefined, IsString } from 'class-validator';

export class WinnerDto {
  @ApiProperty({
    type: String,
    description: 'Participant id',
    example: '6490af40c9bf939de0542bae',
  })
  @IsDefined()
  @IsString()
  public readonly participantId: string;
}
