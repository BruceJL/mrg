import Route from '@ember/routing/route';

export default class RobotsInfoRoute extends Route {
  activate(){
    (document).attr('title', 'Router Sheet');
  }
}
