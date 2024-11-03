import { action } from '@ember/object';
import { debug } from '@ember/debug';
import Controller from '@ember/controller';
import CompetitionModel from 'mrg-sign-in/models/competition';
import { EmberChangeset } from 'ember-changeset';
import { tracked } from '@glimmer/tracking';
import type { ModelFrom } from '../../routes/competitions/admin';


async function processReponse(response: Response, file_name: string){
  const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file_name;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
}

export default class CompetitionAdminController extends Controller {
  declare model: ModelFrom<CompetitionAdminRoute>;

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

  @tracked place1: string = '';
  @tracked place2: string = '';
  @tracked place3: string = '';

  // Download the Winners certificates for the competitions.
  @action
  async downloadCertificates(event: SubmitEvent, pdf: boolean) {
    event.preventDefault();

    const response = await fetch('/api/flask/generate-event-certificates', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        competition: this.model.id,
        place1: this.place1,
        place2: this.place2,
        place3: this.place3,
        pdf: pdf,
      }),
    });

    let filename = "";
    if(true === pdf){
      filename = this.model.id + '_certificates.pdf';
    }else{
      filename = this.model.id + '_certificates.odt';
    }


    if (response.ok) {
      processReponse(response, filename )
    } else {
      alert('Failed to download certificates');
    }
  }

  // Download the labels for the competition.
  @action
  async downloadLabels(pdf: boolean) {
    const response = await fetch('/api/flask/generate-label-sheets', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        competition: this.model.id,
        pdf: pdf,
      }),
    });

    let filename = "";
    if(true === pdf){
      filename = this.model.id + '_labels.pdf';
    }else{
      filename = this.model.id + '_labels.odt';
    }

    if (response.ok) {
      processReponse(response, filename )
    } else {
      alert('Failed to download labels');
    }
  }

  // Download the score sheets for the competitions.
  @action
  async downloadScoreSheet(pdf: boolean) {
    const response = await fetch('/api/flask/generate-scoresheet', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        competition: this.model.id,
        pdf: pdf,
      }),
    });

    let filename = "";
    if(true === pdf){
      filename = this.model.id + '_score_sheet.pdf';
    }else{
      filename = this.model.id + '_score_sheet.odt';
    }

    if (response.ok) {
      processReponse(response, filename);
    } else {
      alert('Failed to download score sheet');
    }
  }

  @tracked number_rings: number | null = null;

  // Slot all checked in competitors to rings
  @action
  async slotCheckedInRings(event: SubmitEvent) {
    event.preventDefault();

    const response = await fetch('/api/flask/slot-checked-in-entries', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        competition: this.model.id,
        number_rings: this.number_rings,
      }),
    });

    if (response.ok) {
      alert('Successfully slotted checked in rings');
    } else {
      alert('Failed to slot checked in rings');
    }

    this.number_rings = null;
  }

  // Reset the ring assignment (clear all rings).
  @action
  async resetRingAssignments() {
    const response = await fetch('/api/flask/reset-ring-assignments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        competition: this.model.id,
      }),
    });

    if (response.ok) {
      alert('Successfully reset ring assignments');
    } else {
      alert('Failed to reset ring assignments');
    }
  }

  @action
  async downloadParticipationCertificates() {
    const response = await fetch('/api/flask/generate-participation-certificates', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        competition: this.model.id,
      }),
    });

    if (response.ok) {
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = this.model.id + '_participation_certificates.odg';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } else {
      alert('Failed to download participation certificates');
    }
  }
  get isRoundRobin() {
    return ['MSR', 'MS1', 'MS2', 'MS3', 'MSA', 'PST', 'PSA'].includes(
      this.model.id,
    );
  }
}
