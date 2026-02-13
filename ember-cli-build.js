'use strict';

const EmberApp = require('ember-cli/lib/broccoli/ember-app');

module.exports = function (defaults) {
  const app = new EmberApp(defaults, {
    'ember-cli-babel': { enableTypeScriptTransform: true },
    deprecations: {
      // from https://deprecations.emberjs.com/id/ember-data-deprecate-relationship-remote-update-clearing-local-state/
      // set to false to strip the deprecated code (thereby opting into the new behavior)
      DEPRECATE_RELATIONSHIP_REMOTE_UPDATE_CLEARING_LOCAL_STATE: false,
    },
    emberData: {
      deprecations: {
        DEPRECATE_STORE_EXTENDS_EMBER_OBJECT: false,
      },
    },

    // Add options here
  });

  return app.toTree();
};
