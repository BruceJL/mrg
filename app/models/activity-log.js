import DS from 'ember-data';
const {
  Model,
  attr,
  date,
  belongsTo,
} = DS;

export default class ActivityLogModel extends Model {
  @attr('date') datetime;
  @attr('string') volunteer;
  @belongsTo('robot') entry;
  @attr('string') function;
  @attr('string') action;
}
