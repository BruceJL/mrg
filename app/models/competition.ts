import {
  computed,
  get,
} from '@ember/object';

import Model, {
  hasMany,
  attr,
  type AsyncHasMany,
} from '@ember-data/model';

import type RobotModel from './robot';
import type RingAssignmentModel from './ring-assignment';

export default class CompetitionModel extends Model {
    @attr('string') declare name: string;
    @attr('string') declare longName: string;
    @attr('number') declare rings: number;

    @attr('number') declare maxRobotsPerRing: number;
    @attr('number') declare minRobotsPerRing: number;
    @attr('date') declare registrationTime: string;
    @attr('boolean') declare measureMass: boolean;
    @attr('boolean') declare measureSize: boolean;
    @attr('boolean') declare measureTime: boolean;
    @attr('boolean') declare measureScratch: boolean;
    @attr('boolean') declare measureDeadman: boolean;

    @hasMany('robot', {
      async: false,
      inverse: 'competition',
    })declare robot: RobotModel;

    @hasMany('ring-assignment',{
      async: true,
      inverse: 'competition',
    }) declare ringAssignment: AsyncHasMany<RingAssignmentModel>;

    @computed('rings', 'maxRobotsPerRing')
    get maxEntries() {
      return get(this, 'maxRobotsPerRing') * get(this, 'rings');
    }

    @computed('robots.@each.signedIn')
    get robotCountCheckedIn() : number {
      // The next line is a workaround. See
      // https://github.com/typed-ember/ember-cli-typescript/issues/1416
      let inst = this as CompetitionModel;
      let robots = inst.hasMany("robot").value();
      if(robots === null){
        return 0;
      }else{
          return robots?.filter(function(item: RobotModel) {
            if (item.get('status') === "CHECKED-IN") {
              return item;
            }
          }).length;
      }
    }

    @computed('robots.@each')
    get robotCount(): number {
      // The next line is a workaround. See
      // https://github.com/typed-ember/ember-cli-typescript/issues/1416
      let inst = this as CompetitionModel;
      if (inst.hasMany("robot").value() === null) {
        return 0;
      }
      return inst.hasMany("robot").ids().length;
    }

    @computed('robotCount')
    get unclaimedSpaces() {
      return this.get('maxEntries') - this.get('robotCount');
    }

    //Determine the total number of available spaces including all spaces not signed in.
    @computed('robotCountCheckedIn')
    get uncheckedinSpaces() {
      return this.get('maxEntries') - this.get('robotCountCheckedIn');
    }
}
