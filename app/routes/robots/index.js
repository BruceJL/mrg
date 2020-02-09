import {
  isNone
} from '@ember/utils';
import RefreshedRoute from '../RefreshedRoute';
import { debug } from '@ember/debug';

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
