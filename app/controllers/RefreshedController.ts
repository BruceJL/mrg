import Controller from '@ember/controller';
import { service } from '@ember/service';
import { Registry as Services } from '@ember/service';
import Helper from '@ember/component/helper';
import { registerDestructor } from '@ember/destroyable';

class Poll extends Helper {
    compute([fn, interval]: [(...args: unknown[]) => unknown, number]) {
       let x = setInterval(fn, interval);
       registerDestructor(this, () => clearInterval(x));
    }
 }

export default class RefreshedController extends Controller {
    @service router!: Services['router'];

    poll = Poll;

    refreshData = () => {
        console.log('Fetching data.');
        this.router.refresh();
    }
}