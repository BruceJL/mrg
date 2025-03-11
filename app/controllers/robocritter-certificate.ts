import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

type RobotCritterInputObject = {
  player: string;
  robot: string;
  minutes: string;
  seconds: string;
}

export default class RobocritterCertificateController extends Controller {
  @tracked userInput: RobotCritterInputObject = {
    player: '',
    robot: '',
    minutes: '',
    seconds: '',
  }

  @action
  handleInput(event:Event) {
    const formData = new FormData(event.currentTarget as HTMLFormElement);
    this.userInput = Object.fromEntries(formData.entries()) as RobotCritterInputObject;
    console.log(this.userInput);
  }

  @action
  async downloadCertificate(pdf: boolean, event: SubmitEvent) {
    event.preventDefault();
    console.log(pdf);

    const response = await fetch('/api/flask/generate-robotcritter-certificate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(
        {
          ...this.userInput,
          pdf: pdf
        }
      ),
    });

    if (response.ok) {
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;

      let filename = this.userInput.player + '_' + this.userInput.robot;

      if (pdf) {
        a.download = filename + '_certificate.pdf';
      }else{
        a.download = filename + '_certificate.odg';
      }

      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } else {
      alert('Failed to generate the certificate');
    }
  }
}


