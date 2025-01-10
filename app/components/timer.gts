import Component from '@glimmer/component';
import { action } from '@ember/object';
import type { Registry as Services } from '@ember/service';
import { service } from '@ember/service';
import RoundRobinService from '../services/round-robin';
import {fn} from '@ember/helper';
import {on} from '@ember/modifier';

export default class TimerComponent extends Component {
  @service declare store: Services['store'];
  @service('round-robin') declare rrService: RoundRobinService;

  constructor(owner, args) {
    super(owner, args);
  }

  get elapsedTime() {

    if (!this.startTime) {
      return '00:00:00';
    }

    const currentTime = new Date();
      const seconds = Math.floor((currentTime - new Date(this.startTime)) / 1000);

      // convert to date format with hours, minutes and seconds
      const date = new Date(null);
      date.setSeconds(seconds);
      return date.toISOString().substr(11, 8);
  }

  get startTime() {
    return this.args.tournament.startTime
  }

  @action
  async startTimer(competitionId, ring) {
    try {
      if (this.startTime) {
        console.log('Resuming timer from:', this.startTime);
      } else {
        const newTime = new Date();
        await this.rrService.setStartTime(competitionId, ring, newTime);
        console.log('Setting a new start time:', newTime);
      }
    } catch (error) {
      console.error('Error starting timer:', error);
    }
  }

  @action
  resetTimer(competitionId, ring) {
    this.rrService.resetStartTime(competitionId, ring);
  }

  <template>
    <div>
      <h3 >Timer: {{this.elapsedTime}}</h3>
      {{#if this.startTime}}
      <button type="button" {{on "click" (fn this.resetTimer @competitionId @tournament.ring)}}>Reset</button>
      {{else}}
      <button type="button" {{on "click" (fn this.startTimer @competitionId @tournament.ring)}}>Start</button>
      {{/if}}
    </div>
  </template>
}
