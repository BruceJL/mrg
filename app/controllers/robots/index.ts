import RefreshedController from '../RefreshedController';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';
import RobotModel from 'mrg-sign-in/models/robot';
import type { Registry as Services } from '@ember/service';

//import { _teardownAJAXHooks } from '@ember/test-helpers/settled';

function formatDollars(amount: number): string {
  if (!isNaN(amount) && amount > 0) {
    return '$' + amount.toFixed(2);
  } else {
    return '';
  }
}

function getTotalDollars(
  items: RobotModel[],
  property: keyof RobotModel,
): string {
  let total = 0.0;
  items.forEach(function (item) {
    total += Number(item.get(property));
  });
  return formatDollars(total);
}

export default class RobotIndexController extends RefreshedController {
  @service declare store: Services['store'];

  queryParams = ['schoolFilter', 'robotFilter', 'robotIDFilter'];

  @tracked schoolFilter = '';
  @tracked robotFilter = '';
  @tracked robotIDFilter = '';

  get filteredRobots(): Array<RobotModel> {
    let returnRobots = this.store.peekAll('robot').slice();
    const robotFilter = this.robotFilter;
    const schoolFilter = this.schoolFilter;
    const robotIDFilter = this.robotIDFilter;
    let regex: RegExp;

    if (robotIDFilter && robotIDFilter.length > 2) {
      returnRobots = returnRobots.filter(function (i) {
        if (i.get('id') === robotIDFilter) {
          return true;
        } else {
          return false;
        }
      });
    } else {
      if (schoolFilter && schoolFilter.length > 1) {
        regex = new RegExp(schoolFilter, 'i');
        returnRobots = returnRobots.filter(function (i) {
          const data = i.get('school');
          if (data === undefined) {
            return false;
          } else {
            return regex.test(data);
          }
        });
      }

      if (robotFilter && robotFilter.length > 1) {
        regex = new RegExp(robotFilter, 'i');
        returnRobots = returnRobots.filter(function (i) {
          const data = i.get('name');
          if (data === undefined) {
            return false;
          } else {
            return regex.test(data);
          }
        });
      }
    }

    //Return the results of the two filters.
    return returnRobots;
  }

  get invoicedTotal(): string {
    const items = this.filteredRobots;
    return getTotalDollars(items, 'invoiced');
  }

  get paidTotal(): string {
    const items = this.filteredRobots;
    return getTotalDollars(items, 'paid');
  }
}
