import {
  isNone
} from '@ember/utils';
import RefreshedRoute from '../RefreshedRoute';

export default class RobotsIndexRoute extends RefreshedRoute {
  model() {
    this.store.findAll('competition', {
      reload: true
    });
    return this.store.findAll('robot', {
      reload: true
    });
  }
};
