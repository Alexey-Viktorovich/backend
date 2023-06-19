import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema()
export class Participant {
  @Prop()
  nickName: string;

  @Prop()
  phoenix_power: boolean;
}

export const ParticipantSchema = SchemaFactory.createForClass(Participant);

@Schema()
export class Score {
  @Prop()
  judge: string;

  @Prop()
  filing: number;

  @Prop()
  technique: number;

  @Prop()
  musicality: number;

  @Prop()
  originality: number;
}

export const ScoreSchema = SchemaFactory.createForClass(Score);

@Schema()
export class Battle {
  @Prop()
  stage: string;

  @Prop({ type: Types.ObjectId, ref: Participant.name })
  participant_1: Participant;

  @Prop({ type: Types.ObjectId, ref: Participant.name })
  participant_2: Participant;

  @Prop()
  participant_1_timer: number;

  @Prop()
  participant_2_timer: number;

  @Prop({ type: [Types.ObjectId], ref: Score.name })
  participant_1_score: Score[];

  @Prop()
  participant_1_total_score: number;

  @Prop({ type: [Types.ObjectId], ref: Score.name })
  participant_2_score: Score[];

  @Prop()
  participant_2_total_score: number;

  @Prop({ type: Types.ObjectId, ref: Battle.name })
  nextBattle?: Battle;
}

export const BattleSchema = SchemaFactory.createForClass(Battle);

@Schema()
export class Event {
  @Prop()
  name: string;

  @Prop({ type: Types.ObjectId, ref: Participant.name })
  winner?: Participant | null;

  @Prop()
  completedBattlesInStage: number;

  @Prop()
  currentStage: string;

  @Prop({ type: [Types.ObjectId], ref: Battle.name })
  battles: Battle[];
}

export const EventSchema = SchemaFactory.createForClass(Event);
