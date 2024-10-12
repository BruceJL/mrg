import Component from '@glimmer/component';
import { EmberChangeset } from 'ember-changeset';
import { action } from '@ember/object';

export interface ComponentSignature {
  Args: {
    changeset: EmberChangeset;
  };
}

export default class RobotDetailController extends Component<ComponentSignature> {
  @action
  handleChange(changeset: EmberChangeset, name: string, value: string) {
    changeset[name] = value;
  }
}
