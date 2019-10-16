import {
  computed
} from '@ember/object';
import Controller from '@ember/controller';

export default Controller.extend({
  sortedAssignments: computed('model.@each.robots', function() {
    return this.model.get('robots').sortBy('robot');
  })
});
