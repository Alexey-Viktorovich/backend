import { ForbiddenException, Injectable } from '@nestjs/common';
import { ParticipantsDto, ResetDto, WinnerDto } from './dto';
import { InjectModel } from '@nestjs/mongoose';
import { Battle, Event, Participant, Score } from './battle.schema';
import { Model } from 'mongoose';
import { IBattle, IEvent, IParticipant, IScore } from './interfaces';
import { VoteDto } from './dto/Vote.dto';
import { UsersService } from 'src/users/users.service';

export const enum Stage {
  EIGHT = '1/8',
  FOUR = '1/4',
  SEMIFINAL = '1/2',
  FINAL = 'FINAL',
}

const DEFAULT_BATTLE_TIMER = 60; // 60 sec

@Injectable()
export class BattlesService {
  constructor(
    @InjectModel(Event.name) private eventModel: Model<Event>,
    @InjectModel(Score.name) private scoreModel: Model<Score>,
    @InjectModel(Battle.name) private battleModel: Model<Battle>,
    @InjectModel(Participant.name) private participantModel: Model<Participant>,
    private userService: UsersService,
  ) {}

  public async registerParticipants({
    participants,
  }: ParticipantsDto): Promise<Event> {
    const eventsLength = await this.eventModel.count();

    if (eventsLength) {
      throw new ForbiddenException();
    }

    const eventEntity = new this.eventModel({
      name: 'Hip-Hop',
      completedBattlesInStage: 0,
      currentStage: Stage.EIGHT,
    });

    const finalBattle = await new this.battleModel({
      stage: Stage.FINAL,
      participant_1_total_score: 0,
      participant_2_total_score: 0,
      participant_1_timer: DEFAULT_BATTLE_TIMER,
      participant_2_timer: DEFAULT_BATTLE_TIMER,
    }).save();

    eventEntity.battles.push(finalBattle);

    (await this.generateBattles(1, Stage.SEMIFINAL, [finalBattle])).forEach(
      (battle) => eventEntity.battles.push(battle),
    );

    (
      await this.generateBattles(
        2,
        Stage.FOUR,
        eventEntity.battles.filter(
          (battle: any) => battle.stage === Stage.SEMIFINAL,
        ),
      )
    ).forEach((battle) => eventEntity.battles.push(battle));

    (
      await this.generateBattles(
        4,
        Stage.EIGHT,
        eventEntity.battles.filter(
          (battle: any) => battle.stage === Stage.FOUR,
        ),
        participants,
      )
    ).forEach((battle) => eventEntity.battles.push(battle));

    return await eventEntity.save();
  }

  public async getEvent(): Promise<IEvent> {
    const eventEntity = await this.eventModel.findOne();

    if (!eventEntity) {
      throw new Error('event not found');
    }

    const event: IEvent = {
      _id: eventEntity._id.toString(),
      name: eventEntity.name,
      currentStage: eventEntity.currentStage,
      completedBattlesInStage: eventEntity.completedBattlesInStage,
      battles: [],
    };

    for (let i = 0; i < eventEntity.battles.length; i++) {
      const battleId = eventEntity.battles[i];

      event.battles.push(await this.getBattle(battleId));
    }

    return event;
  }

  private getRandomArbitrary(max: number): number {
    return Math.floor(Math.random() * max);
  }

  public async getBattleById(id: string): Promise<IBattle> {
    const battleEntity = await this.battleModel.findById(id);

    if (!battleEntity) {
      throw new Error('battle not found');
    }

    return this.getBattle(battleEntity);
  }

  public getParticipants(): Promise<IParticipant[]> {
    return this.participantModel.find();
  }

  public async getParticipantById(id: string): Promise<IParticipant> {
    const participantEntity = await this.participantModel.findById(id);

    if (!participantEntity) {
      throw new Error('participant not found');
    }

    return this.getParticipant(participantEntity);
  }

  public async activatePhoenixPower(id: string): Promise<IParticipant> {
    const participant = await this.participantModel.findById(id);

    if (!participant) {
      throw new Error('participant not found');
    }

    if (!participant.phoenix_power) {
      throw new Error('phoenix power is already used by participant');
    }

    participant.phoenix_power = false;

    await participant.save();

    return this.getParticipantById(id);
  }

  public async vote(
    battleId: string,
    participantId: string,
    votes: VoteDto,
    judge_id: string,
  ): Promise<IBattle> {
    const battleEntity = await this.battleModel.findById(battleId);

    if (!battleEntity) {
      throw new Error('battle not found');
    }

    const judge = await this.userService.findOne(judge_id);

    if (!judge) {
      throw new Error('judge not found');
    }

    if (await this.is_voted(judge.nickName, battleId, participantId)) {
      throw new Error('already voted');
    }

    const voteEntity = await new this.scoreModel({
      ...votes,
      judge: judge.nickName,
    }).save();

    if (battleEntity.participant_1?.toString() === participantId) {
      battleEntity.participant_1_total_score += votes.totalVotes();
      battleEntity.participant_1_score.push(voteEntity);
    } else if (battleEntity.participant_2?.toString() === participantId) {
      battleEntity.participant_2_total_score += votes.totalVotes();
      battleEntity.participant_2_score.push(voteEntity);
    } else {
      throw new Error('battle participant not found');
    }

    await battleEntity.save();

    const judgeCount = await this.userService.getJudgeCount();
    // get winner
    if (
      battleEntity.participant_1_score.length === judgeCount &&
      battleEntity.participant_2_score.length === judgeCount
    ) {
      const eventEntity = await this.eventModel.findOne();

      if (!eventEntity) {
        throw new Error('event not found');
      }
      let winner: any = null;

      if (
        battleEntity.participant_1_total_score >
        battleEntity.participant_2_total_score
      ) {
        winner = await this.participantModel.findById(
          battleEntity.participant_1?.toString(),
        );
      } else if (
        battleEntity.participant_2_total_score >
        battleEntity.participant_1_total_score
      ) {
        winner = await this.participantModel.findById(
          battleEntity.participant_2?.toString(),
        );
      } else {
        // There was a draw. No need to do anything
      }

      if (winner) {
        const nextBattle = await this.battleModel.findById(
          battleEntity.nextBattle?.toString(),
        );

        // it was final battle
        if (!nextBattle) {
          eventEntity.winner = winner._id;

          await eventEntity.save();

          return this.getBattleById(battleId);
        }

        if (!nextBattle.participant_1) {
          nextBattle.participant_1 = winner._id;
        } else if (!nextBattle.participant_2) {
          nextBattle.participant_2 = winner._id;
        }

        eventEntity.completedBattlesInStage += 1;

        if (
          eventEntity.completedBattlesInStage ===
          this.getBattlesInStage(eventEntity.currentStage as Stage)
        ) {
          eventEntity.currentStage = this.getNextStage(
            eventEntity.currentStage as Stage,
          );
        }

        await nextBattle.save();
        await eventEntity.save();
      }
    }

    return this.getBattleById(battleId);
  }

  public async setWinner(
    battleId: string,
    { participantId }: WinnerDto,
  ): Promise<IBattle> {
    const battle = await this.battleModel.findById(battleId);
    const participant = await this.participantModel.findById(participantId);
    const eventEntity = await this.eventModel.findOne();

    if (!eventEntity) {
      throw new Error('event not found');
    }

    if (!battle) {
      throw new Error('battle not found');
    }

    if (!participant) {
      throw new Error('participant not found');
    }

    if (battle.winner) {
      throw new Error('battle already has a winner');
    }

    if (
      battle.participant_1?.toString() !== participantId &&
      battle.participant_2?.toString() !== participantId
    ) {
      throw new Error('wrong battle participant');
    }

    battle.winner = participant;

    await battle.save();

    const nextBattle = await this.battleModel.findById(
      battle.nextBattle?.toString(),
    );

    // it was final battle
    if (!nextBattle) {
      eventEntity.winner = participant;

      await eventEntity.save();

      return this.getBattleById(battleId);
    }

    if (!nextBattle.participant_1) {
      nextBattle.participant_1 = participant;
    } else if (!nextBattle.participant_2) {
      nextBattle.participant_2 = participant;
    }

    eventEntity.completedBattlesInStage += 1;

    await nextBattle.save();
    await eventEntity.save();

    return this.getBattleById(battleId);
  }

  public async reset(battleId: string, times: ResetDto): Promise<IBattle> {
    const battle = await this.battleModel.findById(battleId);

    if (!battle) {
      throw new Error('battle not found');
    }

    if (!battle.participant_1 || !battle.participant_2) {
      throw new Error('battle is not full');
    }

    const eventEntity = await this.eventModel.findOne();

    if (!eventEntity) {
      throw new Error('event not found');
    }

    eventEntity.completedBattlesInStage -= 1;

    await eventEntity.save();

    battle.winner = undefined;

    await Promise.all(
      battle.participant_1_score.map(async (score) => {
        return this.scoreModel.findByIdAndDelete(score.toString());
      }),
    );
    battle.participant_1_score = [];
    battle.participant_1_total_score = 0;
    battle.participant_1_timer = times.participant_1_time;

    await Promise.all(
      battle.participant_2_score.map(async (score) => {
        return this.scoreModel.findByIdAndDelete(score.toString());
      }),
    );
    battle.participant_2_score = [];
    battle.participant_2_total_score = 0;
    battle.participant_2_timer = times.participant_2_time;

    await battle.save();

    if (battle.nextBattle) {
      const nextBattle = await this.battleModel.findById(
        battle.nextBattle.toString(),
      );

      if (!nextBattle) {
        throw new Error('next battle not found');
      }

      const participant_1_id = nextBattle.participant_1?.toString();
      const participant_2_id = nextBattle.participant_2?.toString();

      if (
        participant_1_id &&
        (battle.participant_1.toString() == participant_1_id ||
          battle.participant_2.toString() == participant_1_id)
      ) {
        nextBattle.participant_1 = undefined;
      } else if (
        participant_2_id &&
        (battle.participant_1.toString() == participant_2_id ||
          battle.participant_2.toString() == participant_2_id)
      ) {
        nextBattle.participant_2 = undefined;
      }

      await nextBattle.save();
    }

    return this.getBattleById(battleId);
  }

  private async getBattle(battle: Battle): Promise<IBattle> {
    const battleEntity = await this.battleModel.findById(battle);

    if (!battleEntity) {
      throw new Error('battle not found');
    }

    return {
      _id: battleEntity._id.toString(),
      stage: battleEntity.stage,
      nextBattle: battleEntity?.nextBattle?.toString(),
      participant_1_timer: battleEntity.participant_1_timer,
      participant_2_timer: battleEntity.participant_2_timer,
      winner: await this.getParticipant(battleEntity.winner),
      participant_1_total_score: battleEntity.participant_1_total_score,
      participant_2_total_score: battleEntity.participant_2_total_score,
      participant_1: await this.getParticipant(battleEntity.participant_1),
      participant_2: await this.getParticipant(battleEntity.participant_2),
      participant_1_score: await Promise.all(
        battleEntity.participant_1_score.map(
          this.getParticipantScore.bind(this),
        ),
      ),
      participant_2_score: await Promise.all(
        battleEntity.participant_2_score.map(
          this.getParticipantScore.bind(this),
        ),
      ),
    };
  }

  private async getParticipant(
    participant?: Participant,
  ): Promise<IParticipant> {
    const participantEntity = await this.participantModel.findById(participant);

    return {
      _id: participantEntity?._id.toString(),
      nickName: participantEntity?.nickName,
      phoenix_power: participantEntity?.phoenix_power,
    };
  }

  private async getParticipantScore(score: Score): Promise<IScore> {
    const scoreEntity = await this.scoreModel.findById(score);

    return {
      _id: scoreEntity?._id?.toString(),
      judge: scoreEntity?.judge,
      filing: scoreEntity?.filing,
      technique: scoreEntity?.technique,
      musicality: scoreEntity?.musicality,
      originality: scoreEntity?.originality,
    };
  }

  private async createParticipant(name: string): Promise<any> {
    const participantEntity = new this.participantModel({
      nickName: name,
      phoenix_power: true,
    });

    return await participantEntity.save();
  }

  public async deleteAll(): Promise<boolean> {
    await this.eventModel.deleteMany();
    await this.battleModel.deleteMany();
    await this.participantModel.deleteMany();

    return true;
  }

  private async generateBattles(
    index: number,
    currentStage: Stage,
    nextBattles: any[],
    participants: string[] | null = null,
  ): Promise<any[]> {
    const battles = [];

    while (index > 0) {
      const firstBattle = await new this.battleModel({
        stage: currentStage,
        participant_1_total_score: 0,
        participant_2_total_score: 0,
        nextBattle: nextBattles[index - 1],
        participant_1_timer: DEFAULT_BATTLE_TIMER,
        participant_2_timer: DEFAULT_BATTLE_TIMER,
      });

      const secondBattle = await new this.battleModel({
        stage: currentStage,
        participant_1_total_score: 0,
        participant_2_total_score: 0,
        nextBattle: nextBattles[index - 1],
        participant_1_timer: DEFAULT_BATTLE_TIMER,
        participant_2_timer: DEFAULT_BATTLE_TIMER,
      });

      if (participants) {
        const [firstPair_1, firstPair_2] = await this.getBattleParticipants(
          participants,
        );

        const [secondPair_1, secondPair_2] = await this.getBattleParticipants(
          participants,
        );

        firstBattle.participant_1 = firstPair_1;
        firstBattle.participant_2 = firstPair_2;

        secondBattle.participant_1 = secondPair_1;
        secondBattle.participant_2 = secondPair_2;
      }

      battles.push(await firstBattle.save());
      battles.push(await secondBattle.save());

      nextBattles.splice(index - 1, 1);

      index--;
    }

    return battles;
  }

  private async getBattleParticipants(
    participants: string[],
  ): Promise<[any, any]> {
    // generate first participant
    const firstParticipantIndex = this.getRandomArbitrary(
      participants.length - 1,
    );
    const firstParticipantName = participants[firstParticipantIndex];
    const firstParticipantEntity = await this.createParticipant(
      firstParticipantName,
    );
    participants.splice(firstParticipantIndex, 1);
    // generate second participant
    const secondParticipantIndex = this.getRandomArbitrary(
      participants.length - 1,
    );
    const secondParticipantName = participants[secondParticipantIndex];
    const secondParticipantEntity = await this.createParticipant(
      secondParticipantName,
    );
    participants.splice(secondParticipantIndex, 1);

    return [firstParticipantEntity, secondParticipantEntity];
  }

  private async is_voted(
    judge: string,
    battle_id: string,
    participant_id: string,
  ): Promise<boolean> {
    const battle = await this.battleModel.findById(battle_id);

    if (!battle) {
      throw new Error('battle not found');
    }

    if (battle.participant_1?.toString() === participant_id) {
      const scoreIds = battle.participant_1_score?.map((score) =>
        score.toString(),
      );

      if (!scoreIds) return false;

      for (let i = 0; i < scoreIds.length || 0; i++) {
        const scoreId = scoreIds[i];
        const score = await this.scoreModel.findById(scoreId);

        if (score?.judge === judge) return true;
      }
    } else if (battle.participant_2?.toString() === participant_id) {
      const scoreIds = battle.participant_2_score?.map((score) =>
        score.toString(),
      );

      if (!scoreIds) return false;

      for (let i = 0; i < scoreIds.length || 0; i++) {
        const scoreId = scoreIds[i];
        const score = await this.scoreModel.findById(scoreId);

        if (score?.judge === judge) return true;
      }
    }

    return false;
  }

  private getBattlesInStage(currentState: Stage): number {
    switch (currentState) {
      case Stage.EIGHT:
        return 8;
      case Stage.FOUR:
        return 4 + this.getBattlesInStage(Stage.EIGHT);
      case Stage.SEMIFINAL:
        return (
          2 +
          this.getBattlesInStage(Stage.FOUR) +
          this.getBattlesInStage(Stage.EIGHT)
        );
    }

    return 1;
  }

  private getNextStage(currentState: Stage): Stage {
    switch (currentState) {
      case Stage.EIGHT:
        return Stage.FOUR;
      case Stage.FOUR:
        return Stage.SEMIFINAL;
      default:
        return Stage.FINAL;
    }
  }
}
