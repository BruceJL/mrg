import Controller from '@ember/controller';
import { action } from '@ember/object';

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
}
