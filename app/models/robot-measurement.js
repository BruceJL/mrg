import DS from 'ember-data';

export default DS.Model.extend({
	robot: DS.belongsTo('robot'),
	result: DS.attr('string'),
	datetime: DS.attr('date'),
	type: DS.attr('string')
});
