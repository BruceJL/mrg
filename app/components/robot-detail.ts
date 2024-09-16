import Component from '@glimmer/component';

import DS from 'ember-data';

import {
  inject as service
} from '@ember/service';

export default class RobotDetailController extends Component {
  @service declare store: DS.Store;
}