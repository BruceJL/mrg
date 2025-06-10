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
import CompetitionAdminRoute from 'mrg-sign-in/routes/competitions/admin';
import { waitFor } from '@ember/test-waiters';
import type { Registry as Services } from '@ember/service';


export default class CompetitionAdminController extends Controller {

  declare model: ModelFrom<CompetitionAdminRoute>;

  @service('file-download') declare fileDownloadService: FileDownloadService;
  @service('round-robin') declare rrService: RoundRobinService;
  @service declare store: Services['store'];

  get isRoundRobin() {
    return ['MSR', 'MS1', 'MS2', 'MS3', 'MSA', 'PST', 'PSA', 'SSH', 'SSL', 'SSR', 'DRA'].includes(
      this.model.id,
    );
  }


  private async findRobotById(id: string) {
    try {
      const robot = await this.store.findRecord('robot', id, { include: 'competition' });
      return robot;
    } catch (e) {
      return null;
    }
  }

  private async getRobotbyId(id: string) {
    const robot = await this.findRobotById(id);
    if (!robot) {
      this.showFlashError(`Could not find robot with ID ${id}`);
      return null;
    }
    return robot;
  }

  @tracked flashMessage = '';

  @action
  showFlashError(message: string, duration = 2000) {
    this.flashMessage = message;

    // Automatically clear the flash after the duration
    setTimeout(() => {
      this.flashMessage = '';
    }, duration);
  }

  @tracked deleteRobotId = '';

  @action
  updateDeleteRobotId(event: Event) {
    if (event.target) {
      const value = (event.target as HTMLInputElement).value;
      this.deleteRobotId = value;
    }
  }

  @action
  async deleteRobot() {

    if (!this.deleteRobotId){
      this.showFlashError('Please enter a robot ID');
      return;
    }

    const robot = await this.getRobotbyId(this.deleteRobotId);

    if (!robot) return;

    // Confirm with user before deleting
    const ok = confirm(
      `Are you sure you want to delete ${robot.name} (Id: ${robot.id}) in competition ${robot.competition.name}?`
    );
    if (!ok) return;


    robot.deleteRecord();

    try {
      await robot.save();
      this.showFlashError(`Robot ${robot.name} deleted successfully`);
      this.deleteRobotId = '';
    } catch (e: any) {
      this.showFlashError(`Failed to delete robot: ${e.message || e}`);
    }
  }

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
        "marked as 'not measured' and set the competition " +
        "'Measurement Start Time' to right now. This is useful when " +
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

  @action
  updatePlace(place: 'place1' | 'place2' | 'place3', event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this[place] = value;
  }

  // Download the Winners certificates for the competitions.
  @action
  async downloadCertificates(pdf: boolean) {

    const required = [this.place1, this.place2, this.place3].some((v) => !!v);
    if (!required) {
      this.showFlashError('Please enter at least one robot ID');
      return;
    }

    const promises = [this.place1, this.place2, this.place3]
      .filter((v) => !!v)
      .map((id) => this.getRobotbyId(id));

    const robots = await Promise.all(promises);
    if (robots.includes(null)) return;

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

  @tracked number_rings: number = this.model.slottedRings;

  @action
  updateNumberRings(event: Event) {
    this.number_rings = parseInt((event.target as HTMLInputElement).value);
  }

  // Slot all checked in competitors to rings
  @action
  @waitFor
  async slotCheckedInRings(event: SubmitEvent) {
    event.preventDefault()

    const response = await this.rrService.slotCheckedInEntries(this.model.id, this.number_rings);

    if (response.ok) {
      alert('Successfully slotted checked in rings');
      console.log('Successfully slotted checked in rings');
      window.location.reload();
    } else {
      alert('Failed to slot checked in rings');
      console.log('Failed to slot checked in rings');
    }
  }

  // Reset the ring assignment (clear all rings).
  @action
  @waitFor
  async resetRingAssignment() {
    console.log('AdminController: resetRingAssignment');
    const response = await this.rrService.resetRingAssignment(this.model.id);

    if (response.ok) {

      console.log('Successfully reset ring assignments');
      alert('Successfully reset ring assignments');

      this.number_rings = 0;
      this.model.slottedRings = 0;
      await this.model.save();

    }else {
      console.log('Failed to reset ring assignments');
      alert('Failed to reset ring assignments');
    }
  }
}
