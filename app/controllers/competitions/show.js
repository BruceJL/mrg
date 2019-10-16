import {
  computed,
  get
} from '@ember/object';
import Controller from '@ember/controller';

export default Controller.extend({

  queryParams: ['robotFilter'],

  //Filter the currently displayed robots by robot name
  filteredRobotsByName: computed('model', 'robotFilter', function() {
    var returnRobots = get(this, 'model').get('robots');
    var robotFilter = get(this, 'robotFilter');
    console.log(returnRobots);
    if (robotFilter && robotFilter.length > 1) {
      var regex = new RegExp(robotFilter, "i");
      return returnRobots.filter(function(item) {
        var data = item.get('robot');
        return regex.test(data);
      });
    } else {
      return returnRobots;
    }
  })
});
