import Model, { belongsTo, attr} from '@ember-data/model';

import type RobotModel from './robot';
import type TournamentModel from './tournament';

export default class RingAssignmentModel extends Model {

  @belongsTo('robot', {
    async: false,
    inverse: null,
  })
  declare robot: RobotModel;

  @belongsTo('tournament',{
    async: false,
    inverse: null,
  })
  declare tournament: TournamentModel;

  // Current rank of the competitor in the competition.
  @attr('number') declare rank?: number;

  // Artibrary letter assigned to the competitor when slotted.
  @attr('string') declare letter?: string;

  // TODO: Change ring to tournament.
  // @attr('number') declare ring?: number;

  // TODO: Consider moving the letter property to the robot table and deleting
  // the ringAssignment model. It seems superceded by tournament.
  //@attr('number') declare round?: number;
}
