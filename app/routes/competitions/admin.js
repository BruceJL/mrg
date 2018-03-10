import Ember from 'ember';

export default Ember.Route.extend({
	model(params) {
    var store = this.get('store');
    this.set('params', params);
		return store.findRecord('competition',
      params.competition_id,
      {include: 'robot'});
	}
});
