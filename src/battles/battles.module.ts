import { Module } from '@nestjs/common';
import { BattlesController } from './battles.controller';
import { BattlesService } from './battles.service';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Battle,
  Score,
  ScoreSchema,
  BattleSchema,
  Event,
  EventSchema,
  Participant,
  ParticipantSchema,
} from './battle.schema';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [
    ConfigModule,
    UsersModule,
    MongooseModule.forFeature([
      { name: Participant.name, schema: ParticipantSchema },
      { name: Score.name, schema: ScoreSchema },
      { name: Battle.name, schema: BattleSchema },
      { name: Event.name, schema: EventSchema },
    ]),
  ],
  controllers: [BattlesController],
  providers: [BattlesService],
})
export class BattlesModule {}
