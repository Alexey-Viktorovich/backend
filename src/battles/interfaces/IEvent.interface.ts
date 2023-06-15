import { IBattle } from './IBattle.interface';

export interface IEvent {
  _id: string;

  name: string;

  currentStage: string;

  battles: IBattle[];
}
