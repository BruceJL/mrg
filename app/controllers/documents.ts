import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

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



export default class DocumentsController extends Controller {
    @tracked volunteer_name:string = "";
    @tracked eventId = '';

    @action
    updateEventId(event:Event) {
      if (event.target) {
        this.eventId = (event.target as HTMLInputElement).value;
      }
    }

    @action
    updateVolunteerName(event:Event) {
      if (event.target) {
        this.volunteer_name = (event.target as HTMLInputElement).value;
      }
    }

    @action
    async downloadParticipationCertificates( pdf:boolean) {
    const response = await fetch('/api/flask/generate-participation-certificates', {
        method: 'POST',
        headers: {
        'Content-Type': 'application/json',
        },
        body: JSON.stringify({
        pdf: pdf,
        }),
    });

    let filename = "";
    if(true === pdf){
        filename = 'participation_certificates.pdf';
    }else{
        filename = 'participation_certificates.odg';
    }

    if (response.ok) {
        processReponse(response, filename);
    } else {
        alert('Failed to download participation certificates');
    }
    }

    @action
    async downloadEventParticipationCertificates(pdf:boolean) {
    const response = await fetch('/api/flask/generate-event-participation-certificates', {
        method: 'POST',
        headers: {
        'Content-Type': 'application/json',
        },
        body: JSON.stringify({
        competition: this.eventId,
        pdf: pdf,
        }),
    });

    let filename = "";
    if(true === pdf){
        filename = this.eventId + "_participation_certificates.pdf";
    }else{
        filename = this.eventId + "_participation_certificates.odg";
    }

    if (response.ok) {
        processReponse(response, filename);
    } else {
        alert('Failed to download event participation certificates');
    }
    }

    @action
    async downloadVolunteerCertificate(pdf:boolean) {
    const response = await fetch('/api/flask/generate-volunteer-certificate', {
        method: 'POST',
        headers: {
        'Content-Type': 'application/json',
        },
        body: JSON.stringify({
        volunteer: this.volunteer_name,
        pdf: pdf,
        }),
    });

    let filename = "";
    if(true === pdf){
        filename = 'volunteer_certificate.pdf';
    }else{
        filename = 'volunteer_certificate.odg';
    }

    if (response.ok) {
        processReponse(response, filename);
    } else {
        alert('Failed to download volunteer certificate');
    }
    }

    @action
    async downloadLabels(pdf:boolean) {
    const response = await fetch('/api/flask/generate-all-label-sheets', {
        method: 'POST',
        headers: {
        'Content-Type': 'application/json',
        },
        body: JSON.stringify({
        pdf: pdf,
        }),
    });

    let filename = "";
    if(true === pdf){
        filename = 'all_labels.pdf';
    }
    else{
        filename = 'all_labels.odt';
    }

    if (response.ok) {
        processReponse(response, filename);
    } else {
        alert('Failed to download labels');
    }
    }
}
