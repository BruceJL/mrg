import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';
import FileDownloadService from 'mrg-sign-in/services/file-download';


export default class DocumentsController extends Controller {
  @service('file-download') declare fileDownloadService: FileDownloadService;
  @tracked volunteer_name: string = "";
  @tracked eventId = '';

  @action
  updateEventId(event: Event) {
    if (event.target) {
      this.eventId = (event.target as HTMLInputElement).value;
    }
  }

  @action
  updateVolunteerName(event: Event) {
    if (event.target) {
      this.volunteer_name = (event.target as HTMLInputElement).value;
    }
  }

  @action
  async downloadParticipationCertificates(pdf: boolean) {
    const filename = pdf? 'participation_certificates.pdf' : 'participation_certificates.odg';
    const body = {
      pdf
    }

    const success = await this.fileDownloadService.downloadFile(
      '/api/flask/generate-participation-certificates',
      body,
      filename
    )

    if (!success) {
      alert('Failed to download participation certificates');
    }else{
      alert('Participation certificates downloaded');
    }
  }

  @action
  async downloadVolunteerCertificate(pdf: boolean) {
    const filename = pdf? 'volunteer_certificate.pdf' : 'volunteer_certificate.odg';
    const body = {
      volunteer: this.volunteer_name,
      pdf
    }

    const success = await this.fileDownloadService.downloadFile(
      '/api/flask/generate-volunteer-certificate',
      body,
      filename
    )

    if (!success) {
      alert('Failed to download volunteer certificate');
    }else{
      alert('Volunteer certificate downloaded');
    }
  }

  @action
  async downloadLabels(pdf: boolean) {
    const filename = pdf? `all_labels.pdf` : `all_labels.odt`;
    const body = {
      pdf,
    }

    const success = await this.fileDownloadService.downloadFile(
      '/api/flask/generate-all-label-sheets',
      body,
      filename,
    );

    if (!success) {
      alert('Failed to download labels');
    }else{
      alert('Labels downloaded');
    }
  }
}

