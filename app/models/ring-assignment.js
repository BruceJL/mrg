import DS from 'ember-data';

export default DS.Model.extend({
	competition: DS.belongsTo('competition'),
	robot: DS.belongsTo('robot', {async: false}),
	ring: DS.attr('number'),
	letter: DS.attr('string'),
	round: DS.attr('number')
});
