import { IParticipant } from './IParticipant.interface';
import { IScore } from './IScore.interface';

export interface IBattle {
  _id: string;

  stage?: string;

  winner?: IParticipant;

  participant_1_timer: number;

  participant_2_timer: number;

  participant_1?: IParticipant;

  participant_2?: IParticipant;

  participant_1_score?: IScore[];

  participant_1_total_score?: number;

  participant_2_score?: IScore[];

  participant_2_total_score?: number;

  nextBattle?: string | null;
}
