import Component from '@glimmer/component';
import { EmberChangeset } from 'ember-changeset';
import { action } from '@ember/object';
import { on } from '@ember/modifier';
import { fn } from '@ember/helper';

export interface ComponentSignature {
  Args: {
    changeset: EmberChangeset;
  };
}

export default class RobotDetailComponent extends Component<ComponentSignature> {

  @action
  handleChange(changeset: EmberChangeset, name: string, event: Event) {
    const value = (event.target as HTMLInputElement).value;
    changeset[name] = value;
  }


  <template>
    <h3>Registration Details</h3>
    <table class="form">
      <tbody>
        <tr>
          <td>Robot Name:</td>
          <td>
            <input
              aria-label="Robot Name"
              class={{if @changeset.error.name "full-width-error" "full-width"}}
              value={{@changeset.name}}
              {{on "change"  (fn this.handleChange @changeset "name")}}
              autocomplete="off"
            />
          </td>
        </tr>
        <tr>
          <td>Driver 1:</td>
          <td>
            <input
              aria-label="Driver 1 Name"
              class={{if @changeset.error.driver1 "full-width-error" "full-width"}}
              value={{@changeset.driver1}}
              {{on "change"  (fn this.handleChange @changeset "driver1")}}
              autocomplete="off"
            />
          </td>
        </tr>
        <tr>
          <td>Driver 1 Grade:</td>
          <td>
            <input
              aria-label="Driver 1 Grade"
              class="full-width"
              value={{@changeset.driver1gr}}
              {{on "change"  (fn this.handleChange @changeset "driver1gr")}}
              autocomplete="off"
            />
          </td>
        </tr>
        <tr>
          <td>Driver 2:</td>
          <td>
            <input
              aria-label="Driver 2 Name"
              class="full-width"
              value={{@changeset.driver2}}
              {{on "change"  (fn this.handleChange @changeset "driver2")}}
              autocomplete="off"
            />
          </td>
        </tr>
        <tr>
          <td>Driver 2 Grade:</td>
          <td>
            <input
              aria-label="Driver 2 Grade"
              class="full-width"
              value={{@changeset.driver2gr}}
              {{on "change"  (fn this.handleChange @changeset "driver2gr")}}
              autocomplete="off"
            />
          </td>
        </tr>
        <tr>
          <td>Driver 3:</td>
          <td>
            <input
              aria-label="Driver 3 Name"
              class="full-width"
              value={{@changeset.driver3}}
              {{on "change"  (fn this.handleChange @changeset "driver3")}}
              autocomplete="off"
            />
          </td>
        </tr>
        <tr>
          <td>Driver 3 Grade:</td>
          <td>
            <input
              aria-label="Driver 3 Grade"
              class="full-width"
              value={{@changeset.driver3gr}}
              {{on "change"  (fn this.handleChange @changeset "driver3")}}
              autocomplete="off"
            />
          </td>
        </tr>
        <tr>
          <td>School:</td>
          <td>
            <input
              aria-label="Driver School"
              class={{if @changeset.error.school "full-width-error" "full-width"}}
              value={{@changeset.school}}
              {{on "change"  (fn this.handleChange @changeset "school")}}
              autocomplete="off"
            />
          </td>
        </tr>
        <tr>
          <td>Coach:</td>
          <td>
            <input
              aria-label="Coach"
              class={{if @changeset.error.coach "full-width-error" "full-width"}}
              value={{@changeset.coach}}
              {{on "change"  (fn this.handleChange @changeset "coach")}}
              autocomplete="off"
            />
          </td>
        </tr>
        <tr>
          <td>Email:</td>
          <td>
            <input
              aria-label="Coach Email"
              class={{if @changeset.error.email "full-width-error" "full-width"}}
              value={{@changeset.email}}
              {{on "change"  (fn this.handleChange @changeset "email")}}
              autocomplete="off"
            />
          </td>
        </tr>
        <tr>
          <td>Ph:</td>
          <td>
            <input
              aria-label="Coach Phone Number"
              class={{if @changeset.error.ph "full-width-error" "full-width"}}
              value={{@changeset.ph}}
              {{on "change"  (fn this.handleChange @changeset "ph")}}
              autocomplete="off"
            />
          </td>
        </tr>
      </tbody>
    </table>

  </template>
}
