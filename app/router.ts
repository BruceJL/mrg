import EmberRouter from '@ember/routing/router';
import config from 'mrg-sign-in/config/environment';

export default class Router extends EmberRouter {
  location = config.locationType;
  rootURL = config.rootURL;
}

Router.map(function () {
  this.route('login');

  this.route('robots', function () {
    this.route('edit', {
      path: '/:robot_id',
    });
    this.route('new');
    this.route('bulk-payment');
  });

  this.route('competitions', function () {
    this.route('show', {
      path: '/:competition_id',
    });
    this.route('admin', {
      path: '/:competition_id/admin',
    });
  });

  this.route('ring-assignments', {
    path: 'ring-assignments/:competition_id',
  });

  this.route('checkin', {
    path: 'checkin/:competition_id',
  });

  this.route('robot');
  this.route('log');
  this.route('robocritter-certificate');
});
