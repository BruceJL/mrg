import {
  computed,
  setProperties,
  get,
} from '@ember/object';
import DS from 'ember-data';
const {
  Model,
  attr,
  hasMany,
} = DS;

export default class CompetitionModel extends Model {
  @attr('string') name;
  @attr('string') longName;
  @attr('number') rings;
  @attr('number') robotsPerRing;
  @hasMany('ring-assignments', {
    async: false
  }) ringAssignments; // used to be a hasMany, now readonly?
  @attr('number') maxEntries;
  @attr('number') maxRobotsPerRing;
  @attr('number') minRobotsPerRing;
  @attr('date') registrationTime;
  @attr('boolean') measureMass;
  @attr('boolean') measureSize;
  @attr('boolean') measureTime;
  @attr('boolean') measureScratch;
  @attr('boolean') measureDeadman;
  @hasMany('robot', {
    async: false
  }) robots; // used to be a hasMany, now readonly?

  @computed('robots.@each')
  get robotCount() {
    return get(this, 'robots.length');
  }

  @computed('robots.@each.signedIn')
  get robotCountCheckedIn() {
    let robots = get(this, 'robots');
    return robots.filter(function(item) {
      if (item.get('status') === "CHECKED-IN") {
        return item;
      }
    }).length;
  }

  @computed('robotCount')
  get unclaimedSpaces() {
    return get(this, 'maxEntries') - get(this, 'robotCount');
  }

  //Determine the total number of available spaces including all spaces not signed in.
  @computed('robotCountCheckedIn')
  get uncheckedinSpaces() {
    return get(this, 'maxEntries') - get(this, 'robotCountCheckedIn');
  }
};
