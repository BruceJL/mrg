import DS from 'ember-data';

export default DS.Model.extend({
	competition: DS.belongsTo('competition'),
	round: DS.attr('number'),
	ring: DS.attr('number'),
	competitor1: DS.belongsTo('robot'),
	competitor2: DS.belongsTo('robot'),
	competitor1Wins: DS.attr('number'),
	competitor2Wins: DS.attr('number')
});
