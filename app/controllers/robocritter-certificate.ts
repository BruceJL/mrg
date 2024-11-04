import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class RobocritterCertificateController extends Controller {
  @tracked minutes = 0;
  @tracked seconds = 0;
  @tracked player: string = '';
  @tracked robot: string = '';

  @action
  async downloadCertificate(event: SubmitEvent) {
    event.preventDefault();
    const response = await fetch('/api/flask/generate-robotcritter-certificate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        player: this.player,
        robot: this.robot,
        minutes: this.minutes,
        seconds: this.seconds,
      }),
    });

    if (response.ok) {
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = this.player + '_' + this.robot + '_certificate.odg';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } else {
      alert('Failed to generate the certificate');
    }
  }
}


