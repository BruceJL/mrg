import Model, { hasMany, attr, type SyncHasMany } from '@ember-data/model';
import type RobotModel from './robot';
import type RingAssignmentModel from './ring-assignment';

export default class CompetitionModel extends Model {
  @attr('string') declare name: string;
  @attr('string') declare longName: string;
  @attr('number') declare rings: number;

  @attr('number') declare maxRobotsPerRing: number;
  @attr('number') declare minRobotsPerRing: number;
  @attr('date') declare registrationTime: Date;
  @attr('boolean') declare measureMass: boolean;
  @attr('boolean') declare measureSize: boolean;
  @attr('boolean') declare measureTime: boolean;
  @attr('boolean') declare measureScratch: boolean;
  @attr('boolean') declare measureDeadman: boolean;
  @attr('number') declare maxEntries: number;
  @attr('number') declare robotCount: number;
  @attr('number') declare robotCheckedInCount: number;


  @hasMany('robot', {
    async: false,
    inverse: 'competition',
  })
  declare robot: SyncHasMany<RobotModel>;

  @hasMany('ring-assignment', {
    async: false,
    inverse: 'competition',
  })
  declare ringAssignment: SyncHasMany<RingAssignmentModel>;

  get unclaimedSpaces() {
    return this.maxEntries - this.robotCount;
  }

  //Determine the total number of available spaces including all spaces not signed in.
  get uncheckedinSpaces() {
    return this.maxEntries - this.robotCheckedInCount;
  }
}
