import DS from 'ember-data';
import Ember from 'ember';

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

	robotCount: Ember.computed('robots.@each', function(){
		return Ember.get(this, 'robots.length');
	}),

	robotCountCheckedIn: Ember.computed('robots.@each.signedIn', function(){
		var robots = Ember.get(this, 'robots');
		return robots.filter(function(item){
			return item.get('signedIn');
		}).length;
	}),

	unclaimedSpaces: Ember.computed('robotCount', function(){
		return Ember.get(this, 'maxEntries') - Ember.get(this, 'robotCount');
	}),

	//Determine the total number of available spaces including all spaces not signed in.
	uncheckedinSpaces: Ember.computed('robotCountCheckedIn',  function(){
		return Ember.get(this, 'maxEntries') - Ember.get(this, 'robotCountCheckedIn');
	}),
});
