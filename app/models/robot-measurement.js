import DS from 'ember-data';
const {
  Model,
  attr,
  belongsTo,
} = DS;

export default class RobotMeasurementModel extends Model {
  @belongsTo('robot') robot;
  @attr('string') result;
  @attr('date') datetime;
  @attr('string') type;
};
