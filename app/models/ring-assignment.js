import DS from 'ember-data';
const { Model, attr, belongsTo } = DS;

export default class RingAssignmentModel extends Model {
  @belongsTo('competition') competition;
  @belongsTo('robot') robot;
  @attr('number') ring;
  @attr('string') letter;
  @attr('number') round;
};
