import { Injectable } from '@nestjs/common';
import { ParticipantsDto } from './dto';
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
    const eventEntity = new this.eventModel({
      name: 'Hip-Hop',
      currentStage: Stage.EIGHT,
    });

    const finalBattle = await new this.battleModel({
      stage: Stage.FINAL,
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
      name: eventEntity?.name,
      currentStage: eventEntity?.currentStage,
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

  public async getParticipantById(id: string): Promise<IParticipant> {
    const participantEntity = await this.participantModel.findById(id);

    if (!participantEntity) {
      throw new Error('participant not found');
    }

    return this.getParticipant(participantEntity);
  }

  public async activatePhoenixPower(id: string): Promise<IParticipant> {
    await this.participantModel.findOneAndUpdate(
      { _id: id },
      { phoenix_power: false },
    );

    return this.getParticipantById(id);
  }

  // To Do
  // Method logic is not complete
  public async vote(
    battleId: string,
    participantId: string,
    votes: VoteDto,
  ): Promise<IBattle> {
    const battleEntity = await this.battleModel.findById(battleId);

    if (!battleEntity) {
      throw new Error('battle not found');
    }

    if (battleEntity.participant_1.toString() === participantId) {
      const voteEntity = await new this.scoreModel({
        ...votes,
      }).save();

      battleEntity.participant_1_total_score += votes.totalVotes();
      battleEntity.participant_1_score.push(voteEntity);

      await battleEntity.save();
    }

    if (battleEntity.participant_2.toString() === participantId) {
      const voteEntity = await new this.scoreModel({
        ...votes,
      }).save();

      battleEntity.participant_2_total_score += votes.totalVotes();
      battleEntity.participant_2_score.push(voteEntity);

      await battleEntity.save();
    }

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
          battleEntity.participant_1_total_score.toString(),
        );
      } else if (
        battleEntity.participant_2_total_score >
        battleEntity.participant_1_total_score
      ) {
        winner = await this.participantModel.findById(
          battleEntity.participant_2_total_score.toString(),
        );
      } else {
        // There was a draw. No need to do anything
      }

      if (winner) {
        const nextStage = this.getNextStage(battleEntity.stage as Stage);

        // it was final battle
        if (!nextStage) {
          this.getBattleById(battleId);
        }
      }
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
      participant_1_total_score: battleEntity.participant_1_total_score,
      participant_2_total_score: battleEntity.participant_2_total_score,
      participant_1: await this.getParticipant(battleEntity.participant_1),
      participant_2: await this.getParticipant(battleEntity.participant_2),
      participant_1_score: await Promise.all(
        battleEntity.participant_1_score.map(this.getParticipantScore),
      ),
      participant_2_score: await Promise.all(
        battleEntity.participant_2_score.map(this.getParticipantScore),
      ),
    };
  }

  private async getParticipant(
    participant: Participant,
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
      });

      const secondBattle = await new this.battleModel({
        stage: currentStage,
        participant_1_total_score: 0,
        participant_2_total_score: 0,
        nextBattle: nextBattles[index - 1],
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

  private getNextStage(currentState: Stage): Stage | null {
    switch (currentState) {
      case Stage.EIGHT:
        return Stage.FOUR;
      case Stage.FOUR:
        return Stage.SEMIFINAL;
      case Stage.SEMIFINAL:
        return Stage.FINAL;
    }

    return null;
  }

  // private getPrevStage(currentState: Stage): Stage | null {
  //   switch (currentState) {
  //     case Stage.FINAL:
  //       return Stage.SEMIFINAL;
  //     case Stage.SEMIFINAL:
  //       return Stage.FOUR;
  //     case Stage.FOUR:
  //       return Stage.EIGHT;
  //   }

  //   return null;
  // }
}
