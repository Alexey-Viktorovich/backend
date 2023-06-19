import { IBattle } from './IBattle.interface';

export interface IEvent {
  _id: string;

  name: string;
  currentStage: string;
  completedBattlesInStage: number;

  battles: IBattle[];
}
