
import RefreshedController from '../RefreshedController';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';
import DS from 'ember-data';


import RobotModel from 'mrg-sign-in/models/robot';

//import { _teardownAJAXHooks } from '@ember/test-helpers/settled';

function formatDollars(
  amount: number
): string {
  if (!isNaN(amount) && amount > 0) {
    return '$' + amount.toFixed(2);
  } else {
    return "";
  }
}

function getTotalDollars(
  items: RobotModel[],
  property: keyof RobotModel,
): string {
  let total = 0.0;
  items.forEach(function(item) {
    total += Number(item.get(property));
  });
  return formatDollars(total);
}

export default class RobotIndexController extends RefreshedController {
  @service declare store: DS.Store;

  queryParams = [
    'schoolFilter',
    'robotFilter',
    'robotIDFilter',
  ];

  @tracked schoolFilter = "";
  @tracked robotFilter = "";
  @tracked robotIDFilter = "";

  get filteredRobots(): Array<any> {
    let returnRobots = this.store.peekAll('robot').slice();
    let robotFilter = this.get('robotFilter');
    let schoolFilter = this.get('schoolFilter');
    let robotIDFilter = this.get('robotIDFilter');
    let regex: RegExp;

    if (robotIDFilter && robotIDFilter.length > 2) {
      returnRobots = returnRobots.filter(function(i) {
        if (i.get('id') === robotIDFilter) {
          return true;
        } else {
          return false;
        }
      });
    } else {

      if (schoolFilter && schoolFilter.length > 1) {
        regex = new RegExp(schoolFilter, "i");
        returnRobots = returnRobots.filter(function(i) {
          let data = i.get('school');
          if(data === undefined){
              return false;
          }else{
              return regex.test(data);
          }
        });
      }

      if (robotFilter && robotFilter.length > 1) {
        regex = new RegExp(robotFilter, "i");
        returnRobots = returnRobots.filter(function(i) {
          let data = i.get('name');
          if(data === undefined){
            return false;
          }else{
              return regex.test(data);
          }
        });
      }
    }

    //Return the results of the two filters.
    return returnRobots;
  }

  get invoicedTotal() : string {
    let items = this.get('filteredRobots');
    return getTotalDollars(items, 'invoiced');
  }

  get paidTotal() : string {
    let items = this.get('filteredRobots');
    return getTotalDollars(items, 'paid');
  }
}