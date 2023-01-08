import {
  computed
} from '@ember/object';
import Controller from '@ember/controller';

export default Controller.extend({
  sortedAssignments: computed('model.@each.ringAssignments', function() {
    return this.model.get('ringAssignments').slice().sortBy('robot.name');
  })
});
