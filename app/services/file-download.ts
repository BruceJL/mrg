import Service from '@ember/service';

export default class FileDownloadService extends Service {

  async downloadFile(url: string, body: object, filename: string): Promise<boolean> {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (response.ok) {
      await this.processResponse(response, filename);
      // alert('File downloaded successfully');
      return true;
    } else {
      // alert('Failed to download file');
      return false;
    }
  }

  async processResponse(response: Response, fileName: string) {
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  }
}

// Don't remove this declaration: this is what enables TypeScript to resolve
// this service using `Owner.lookup('service:file-download')`, as well
// as to check when you pass the service name as an argument to the decorator,
// like `@service('file-download') declare altName: FileDownloadService;`.
declare module '@ember/service' {
  interface Registry {
    'file-download': FileDownloadService;
  }
}
