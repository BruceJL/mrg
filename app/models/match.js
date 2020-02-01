import DS from 'ember-data';
const {
  Model,
  attr,
  belongsTo,
} = DS;

export default class MatchModel extends Model {
  @attr('competition') competition;
  @attr('number') round;
  @attr('number') ring;
  @belongsTo('robot') competitor1;
  @belongsTo('robot') competitor2;
  @attr('number') competitor1Wins;
  @attr('number') competitor2Wins;
};
