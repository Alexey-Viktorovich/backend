import { ApiProperty } from '@nestjs/swagger';
import { IsDefined, IsNumber, IsString } from 'class-validator';

export class VoteDto {
  @ApiProperty({
    title: 'Judge nickName',
    type: String,
  })
  @IsString()
  @IsDefined()
  judge: string;

  @ApiProperty({
    title: 'Filing vote',
    type: Number,
  })
  @IsNumber()
  @IsDefined()
  filing: number;

  @ApiProperty({
    title: 'Technique vote',
    type: Number,
  })
  @IsNumber()
  @IsDefined()
  technique: number;

  @ApiProperty({
    title: 'Musicality vote',
    type: Number,
  })
  @IsNumber()
  @IsDefined()
  musicality: number;

  @ApiProperty({
    title: 'Originality vote',
    type: Number,
  })
  @IsNumber()
  @IsDefined()
  originality: number;

  public totalVotes(): number {
    return this.filing + this.musicality + this.originality + this.technique;
  }
}
