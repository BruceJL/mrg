import { action } from '@ember/object';
import { debug } from '@ember/debug';
import Controller from '@ember/controller';
import CompetitionModel from 'mrg-sign-in/models/competition';
import { EmberChangeset } from 'ember-changeset';
import { tracked } from '@glimmer/tracking';

export default class CompetitionAdminController extends Controller {
  @action
  toggleMeasurement(
    competition: CompetitionModel,
    property:
      | 'measureDeadman'
      | 'measureScratch'
      | 'measureTime'
      | 'measureSize'
      | 'measureMass',
  ): void {
    debug('Entering toggleProperty!');
    const b = competition[property];
    debug('Setting ' + property + ' to ' + !b);
    competition[property] = !b;
    competition.save();
  }

  @action
  resetMeasurementTime(model: CompetitionModel): void {
    const ok = confirm(
      'This will cause all robot in this competition to be ' +
        'marked as &quot;not measured&quot; and set the competition ' +
        "'Measurement Start Time'; to right now. This is useful when " +
        'a reweigh of robots is required.',
    );

    if (ok) {
      // Note that the database will reset all the robots registrations times
      // with the "RESET_MEASUREMENT_STATUS" function.
      model.set('registrationTime', 'now()');
      model.save().then(() => {
        model.reload();
      });
    }
  }

  @action
  save(changeset: EmberChangeset): void {
    changeset.save();
  }

  @action
  rollback(changeset: EmberChangeset): void {
    changeset.rollback();
  }

  @tracked place1: string = "";
  @tracked place2: string = "";
  @tracked place3: string = "";

  @action
  async downloadCertificates(event:SubmitEvent){
    event.preventDefault();
    console.log(`${this.model.id}`)
    const response = await fetch('/flask/api/generate-event-certificates', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        competition:this.model.id,
        place1: this.place1,
        place2: this.place2,
        place3: this.place3,
      }),
    });

    if (response.ok) {
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = this.model.id + '_certificates.odg';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } else {
      alert(`Failed to download certificates`);
    }
  }
}