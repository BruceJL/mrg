import Ember from 'ember';

export default Ember.Route.extend({	
	activate: function() {
        (document).attr('title', 'Router Sheet');
    }
});
