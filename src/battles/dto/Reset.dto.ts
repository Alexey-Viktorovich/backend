import { ApiProperty } from '@nestjs/swagger';
import { IsDefined, IsNumber } from 'class-validator';

export class ResetDto {
  @ApiProperty({
    type: Number,
    example: 39,
    description: 'Accept time in seconds',
  })
  @IsDefined()
  @IsNumber()
  public readonly participant_1_time: number;

  @ApiProperty({
    type: Number,
    example: 39,
    description: 'Accept time in seconds',
  })
  @IsDefined()
  @IsNumber()
  public readonly participant_2_time: number;
}
