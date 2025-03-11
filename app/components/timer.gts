import Component from '@glimmer/component';
import { action } from '@ember/object';
import {fn} from '@ember/helper';
import {on} from '@ember/modifier';
import {tracked} from '@glimmer/tracking';

  // Convert a date to UTC time
  function toUTC(date:Date):Date {
    return new Date(date.getTime() + date.getTimezoneOffset() * 60000);
  }

export default class TimerComponent extends Component {
  @tracked currentTime:Date = new Date();

  constructor(owner, args) {
    super(owner, args);
    this._startAutoUpdate();
  }

  get currentTimeUTC():Date | null {
    return this.currentTime ? toUTC(this.currentTime) : null;
  }

  get elapsedTime() {

    if (!this.startTimeUTC) {
      return '00:00:00';
    }

    const seconds = Math.floor((this.currentTimeUTC - this.startTimeUTC) / 1000);

    const date = new Date(null);
    date.setSeconds(seconds);
    return date.toISOString().substr(11, 8);
  }

  get startTimeUTC():Date | null {
    const timer = this.args.tournament?.timer;
    return timer ? toUTC(new Date(timer)) : null;
  }

  @action
  startTimer(tournament) {
    if (!this.startTimeUTC) {
      const newTime = new Date();
      tournament.timer = newTime;
      tournament.save();
      this.currentTime = newTime;
    }

    this._startAutoUpdate();

  }

  @action
  stopTimer() {
    this._stopAutoUpdate();
  }

  @action
  resetTimer(tournament) {
    tournament.timer = '';
    tournament.save();
  }

  private _startAutoUpdate() {
    if (!this._interval) {
      this._interval = window.setInterval(() => {
        this.currentTime = new Date();
      }, 1000);
    }
  }

  private _stopAutoUpdate() {
    if (this._interval) {
      clearInterval(this._interval);
      this._interval = null;
    }
  }

  willDestroy() {
    super.willDestroy(...arguments);
    this._stopAutoUpdate();
  }

  <template>
    <div data-test-timer class="timer-container" ...attributes>
      <h3 >Timer: {{this.elapsedTime}}</h3>
      <div>
      <button type="button" {{on "click" (fn this.startTimer @tournament)}}>Start</button>
      <button type="button" {{on "click" (fn this.stopTimer @tournament)}}>Stop</button>
      <button type="button" {{on "click" (fn this.resetTimer @tournament)}}>Reset</button>
      </div>
    </div>
  </template>
}
