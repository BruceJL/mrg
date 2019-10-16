import Route from '@ember/routing/route';

export default Route.extend({
  activate: function() {
    (document).attr('title', 'Router Sheet');
  }
});
