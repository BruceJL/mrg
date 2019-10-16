import {
  computed,
  get
} from '@ember/object';
import DS from 'ember-data';

export default DS.Model.extend({
  name: DS.attr('string'),
  longName: DS.attr('string'),
  rings: DS.attr('number'),
  ringAssignments: DS.hasMany('ring-assignments'),
  robotsPerRing: DS.attr('number'),
  maxEntries: DS.attr('number'),
  registrationTime: DS.attr('date'),
  measureMass: DS.attr('boolean'),
  measureSize: DS.attr('boolean'),
  measureTime: DS.attr('boolean'),
  measureScratch: DS.attr('boolean'),
  robots: DS.hasMany('robot'),

  robotCount: computed('robots.@each', function() {
    return get(this, 'robots.length');
  }),

  robotCountCheckedIn: computed('robots.@each.signedIn', function() {
    var robots = get(this, 'robots');
    return robots.filter(function(item) {
      return item.get('signedIn');
    }).length;
  }),

  unclaimedSpaces: computed('robotCount', function() {
    return get(this, 'maxEntries') - get(this, 'robotCount');
  }),

  //Determine the total number of available spaces including all spaces not signed in.
  uncheckedinSpaces: computed('robotCountCheckedIn', function() {
    return get(this, 'maxEntries') - get(this, 'robotCountCheckedIn');
  }),
});
