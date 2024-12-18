import { action } from '@ember/object';
import { debug } from '@ember/debug';
import Controller from '@ember/controller';
import CompetitionModel from 'mrg-sign-in/models/competition';
import { EmberChangeset } from 'ember-changeset';
import { tracked } from '@glimmer/tracking';
import type { ModelFrom } from '../../routes/competitions/admin';
import { service } from '@ember/service';
import FileDownloadService from 'mrg-sign-in/services/file-download';
import RoundRobinService from 'mrg-sign-in/services/round-robin';


export default class CompetitionAdminController extends Controller {
  declare model: ModelFrom<CompetitionAdminRoute>;

  @service('file-download') declare fileDownloadService: FileDownloadService;
  @service('round-robin') declare rrService: RoundRobinService;

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
  async downloadCertificates(pdf: boolean, event: SubmitEvent) {

    event.preventDefault();

    const filename = pdf ? `${this.model.id}_certificates.pdf` : `${this.model.id}_certificates.odt`;
    const body = {
      competition: this.model.id,
      place1: this.place1,
      place2: this.place2,
      place3: this.place3,
      pdf,
    };

    await this.fileDownloadService.downloadFile('/api/flask/generate-event-certificates', body, filename);
  }

  // Download the labels for the competition.
  @action
  async downloadLabels(pdf: boolean) {
    const filename = pdf ? `${this.model.id}_labels.pdf` : `${this.model.id}_labels.odt`;
    const body = {
      competition: this.model.id,
      pdf,
    };

    await this.fileDownloadService.downloadFile('/api/flask/generate-label-sheets', body, filename);
  }

  // Download the score sheets for the competitions.
  @action
  async downloadScoreSheet(pdf: boolean) {

    const filename = pdf ? `${this.model.id}_score_sheet.pdf` : `${this.model.id}_score_sheet.odt`;
    const body = {
      competition: this.model.id,
      pdf,
    };

    await this.fileDownloadService.downloadFile('/api/flask/generate-scoresheet', body, filename);
  }

  @tracked number_rings: number = 0;

  // Slot all checked in competitors to rings
  @action
  async slotCheckedInRings(event: SubmitEvent) {
    event.preventDefault();

    const success = await this.rrService.slotCheckedInEntries(this.model.id, this.number_rings);

    if (success) {
      alert('Successfully slotted checked in rings');
      console.log('Successfully slotted checked in rings');
    } else {
      alert('Failed to slot checked in rings');
    }

    this.number_rings = 0;
  }

  // Reset the ring assignment (clear all rings).
  @action
  async resetRingAssignments() {
    const success = await this.rrService.resetRingAssignments(this.model.id);

    if (success) {
      alert('Successfully reset ring assignments');
    }else {
      alert('Failed to reset ring assignments');
    }
  }

  get isRoundRobin() {
    return ['MSR', 'MS1', 'MS2', 'MS3', 'MSA', 'PST', 'PSA'].includes(
      this.model.id,
    );
  }
}
