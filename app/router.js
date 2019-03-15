import EmberRouter from '@ember/routing/router';
import config from './config/environment';

const Router = EmberRouter.extend({
  location: config.locationType,
  rootURL: config.rootURL
});

Router.map(function() {
    this.route('robots', function() {
        this.route('edit', { path: '/:robot_id'});
        this.route('new');
        this.route('bulk-payment');
  	});

    this.route('competitions', function() {
    	this.route('show', { path: '/:competition_id'});
      this.route('robot', { path: '/robot/:robot_id'});
      this.route('admin', { path: '/:competition_id/admin'});
    });

    this.route('ring-assignments', { path: 'ring-assignments/:competition_id'});
    this.route('checkin', {path: 'checkin/:competition_id'});
});

export default Router;
