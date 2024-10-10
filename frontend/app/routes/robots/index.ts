import Route from '@ember/routing/route';
import { service } from '@ember/service';
import DS from 'ember-data';
import RobotModel from 'mrg-sign-in/models/robot';

export default class RobotsIndexRoute extends Route {
  @service declare store: DS.Store;

  model(): DS.PromiseArray<RobotModel> {
    return this.store.findAll(
      'robot',
      {
        include: 'competition',
      }
    )
  }
}