'use strict';

define("mrg-sign-in/tests/helpers/destroy-app", ["exports", "@ember/runloop"], function (_exports, _runloop) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = destroyApp;
  0; //eaimeta@70e063a35619d71f0,"@ember/runloop"eaimeta@70e063a35619d71f
  function destroyApp(application) {
    (0, _runloop.run)(application, 'destroy');
  }
});
define("mrg-sign-in/tests/helpers/module-for-acceptance", ["exports", "rsvp", "qunit", "mrg-sign-in/tests/helpers/start-app", "mrg-sign-in/tests/helpers/destroy-app"], function (_exports, _rsvp, _qunit, _startApp, _destroyApp) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = _default;
  0; //eaimeta@70e063a35619d71f0,"rsvp",0,"qunit",0,"mrg-sign-in/tests/helpers/start-app",0,"mrg-sign-in/tests/helpers/destroy-app"eaimeta@70e063a35619d71f
  function _default(name) {
    let options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    (0, _qunit.module)(name, {
      beforeEach() {
        this.application = (0, _startApp.default)();
        if (options.beforeEach) {
          return options.beforeEach.apply(this, arguments);
        }
      },
      afterEach() {
        let afterEach = options.afterEach && options.afterEach.apply(this, arguments);
        return _rsvp.Promise.resolve(afterEach).then(() => (0, _destroyApp.default)(this.application));
      }
    });
  }
});
define("mrg-sign-in/tests/helpers/resolver", ["exports", "mrg-sign-in/resolver", "mrg-sign-in/config/environment"], function (_exports, _resolver, _environment) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  0; //eaimeta@70e063a35619d71f0,"mrg-sign-in/resolver",0,"mrg-sign-in/config/environment"eaimeta@70e063a35619d71f
  const resolver = _resolver.default.create();
  resolver.namespace = {
    modulePrefix: _environment.default.modulePrefix,
    podModulePrefix: _environment.default.podModulePrefix
  };
  var _default = resolver;
  _exports.default = _default;
});
define("mrg-sign-in/tests/helpers/start-app", ["exports", "@ember/runloop", "@ember/polyfills", "mrg-sign-in/app", "mrg-sign-in/config/environment"], function (_exports, _runloop, _polyfills, _app, _environment) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = startApp;
  0; //eaimeta@70e063a35619d71f0,"@ember/runloop",0,"@ember/polyfills",0,"mrg-sign-in/app",0,"mrg-sign-in/config/environment"eaimeta@70e063a35619d71f
  function startApp(attrs) {
    let application;
    let attributes = (0, _polyfills.merge)({}, _environment.default.APP);
    attributes = (0, _polyfills.merge)(attributes, attrs); // use defaults, but you can override;

    (0, _runloop.run)(() => {
      application = _app.default.create(attributes);
      application.setupForTesting();
      application.injectTestHelpers();
    });
    return application;
  }
});
define("mrg-sign-in/tests/integration/components/login-test", ["@ember/template-factory", "qunit", "ember-qunit", "@ember/test-helpers"], function (_templateFactory, _qunit, _emberQunit, _testHelpers) {
  "use strict";

  0; //eaimeta@70e063a35619d71f0,"qunit",0,"ember-qunit",0,"@ember/test-helpers",0,"ember-cli-htmlbars"eaimeta@70e063a35619d71f
  (0, _qunit.module)('Integration | Component | login', function (hooks) {
    (0, _emberQunit.setupRenderingTest)(hooks);
    (0, _qunit.test)('it renders', async function (assert) {
      // Set any properties with this.set('myProperty', 'value');
      // Handle any actions with this.set('myAction', function(val) { ... });

      await (0, _testHelpers.render)((0, _templateFactory.createTemplateFactory)(
      /*
        <Login />
      */
      {
        "id": "Ob7faW1z",
        "block": "[[[8,[39,0],null,null,null]],[],false,[\"login\"]]",
        "moduleName": "/Users/tracyhuang/Dev/mrg/frontend/mrg-sign-in/tests/integration/components/login-test.js",
        "isStrictMode": false
      }));
      assert.equal(this.element.textContent.trim(), '');

      // Template block usage:
      await (0, _testHelpers.render)((0, _templateFactory.createTemplateFactory)(
      /*
        
            <Login>
              template block text
            </Login>
          
      */
      {
        "id": "4PtHbB3/",
        "block": "[[[1,\"\\n      \"],[8,[39,0],null,null,[[\"default\"],[[[[1,\"\\n        template block text\\n      \"]],[]]]]],[1,\"\\n    \"]],[],false,[\"login\"]]",
        "moduleName": "/Users/tracyhuang/Dev/mrg/frontend/mrg-sign-in/tests/integration/components/login-test.js",
        "isStrictMode": false
      }));
      assert.equal(this.element.textContent.trim(), 'template block text');
    });
  });
});
define("mrg-sign-in/tests/integration/components/robot-checkin-listing-test", ["@ember/template-factory", "qunit", "ember-qunit", "@ember/test-helpers"], function (_templateFactory, _qunit, _emberQunit, _testHelpers) {
  "use strict";

  0; //eaimeta@70e063a35619d71f0,"qunit",0,"ember-qunit",0,"@ember/test-helpers",0,"ember-cli-htmlbars"eaimeta@70e063a35619d71f
  (0, _qunit.module)('Integration | Component | robot-checkin-listing', function (hooks) {
    (0, _emberQunit.setupRenderingTest)(hooks);
    (0, _qunit.test)('it renders', async function (assert) {
      // Set any properties with this.set('myProperty', 'value');
      // Handle any actions with this.set('myAction', function(val) { ... });

      await (0, _testHelpers.render)((0, _templateFactory.createTemplateFactory)(
      /*
        <RobotCheckinListing />
      */
      {
        "id": "tNn9gduj",
        "block": "[[[8,[39,0],null,null,null]],[],false,[\"robot-checkin-listing\"]]",
        "moduleName": "/Users/tracyhuang/Dev/mrg/frontend/mrg-sign-in/tests/integration/components/robot-checkin-listing-test.js",
        "isStrictMode": false
      }));
      assert.equal(this.element.textContent.trim(), '');

      // Template block usage:
      await (0, _testHelpers.render)((0, _templateFactory.createTemplateFactory)(
      /*
        
            <RobotCheckinListing>
              template block text
            </RobotCheckinListing>
          
      */
      {
        "id": "0F8fZ0/a",
        "block": "[[[1,\"\\n      \"],[8,[39,0],null,null,[[\"default\"],[[[[1,\"\\n        template block text\\n      \"]],[]]]]],[1,\"\\n    \"]],[],false,[\"robot-checkin-listing\"]]",
        "moduleName": "/Users/tracyhuang/Dev/mrg/frontend/mrg-sign-in/tests/integration/components/robot-checkin-listing-test.js",
        "isStrictMode": false
      }));
      assert.equal(this.element.textContent.trim(), 'template block text');
    });
  });
});
define("mrg-sign-in/tests/integration/components/robot-checkin-test", ["@ember/template-factory", "qunit", "ember-qunit", "@ember/test-helpers"], function (_templateFactory, _qunit, _emberQunit, _testHelpers) {
  "use strict";

  0; //eaimeta@70e063a35619d71f0,"qunit",0,"ember-qunit",0,"@ember/test-helpers",0,"ember-cli-htmlbars"eaimeta@70e063a35619d71f
  (0, _qunit.module)('Integration | Component | robot-checkin', function (hooks) {
    (0, _emberQunit.setupRenderingTest)(hooks);
    (0, _qunit.test)('it renders', async function (assert) {
      // Set any properties with this.set('myProperty', 'value');
      // Handle any actions with this.set('myAction', function(val) { ... });

      await (0, _testHelpers.render)((0, _templateFactory.createTemplateFactory)(
      /*
        <RobotCheckin />
      */
      {
        "id": "exAbkRLt",
        "block": "[[[8,[39,0],null,null,null]],[],false,[\"robot-checkin\"]]",
        "moduleName": "/Users/tracyhuang/Dev/mrg/frontend/mrg-sign-in/tests/integration/components/robot-checkin-test.js",
        "isStrictMode": false
      }));
      assert.equal(this.element.textContent.trim(), '');

      // Template block usage:
      await (0, _testHelpers.render)((0, _templateFactory.createTemplateFactory)(
      /*
        
            <RobotCheckin>
              template block text
            </RobotCheckin>
          
      */
      {
        "id": "JaJAOSRp",
        "block": "[[[1,\"\\n      \"],[8,[39,0],null,null,[[\"default\"],[[[[1,\"\\n        template block text\\n      \"]],[]]]]],[1,\"\\n    \"]],[],false,[\"robot-checkin\"]]",
        "moduleName": "/Users/tracyhuang/Dev/mrg/frontend/mrg-sign-in/tests/integration/components/robot-checkin-test.js",
        "isStrictMode": false
      }));
      assert.equal(this.element.textContent.trim(), 'template block text');
    });
  });
});
define("mrg-sign-in/tests/integration/components/robot-detail-test", ["@ember/template-factory", "qunit", "ember-qunit", "@ember/test-helpers"], function (_templateFactory, _qunit, _emberQunit, _testHelpers) {
  "use strict";

  0; //eaimeta@70e063a35619d71f0,"qunit",0,"ember-qunit",0,"@ember/test-helpers",0,"htmlbars-inline-precompile"eaimeta@70e063a35619d71f
  (0, _qunit.module)('Integration | Component | robot detail', function (hooks) {
    (0, _emberQunit.setupRenderingTest)(hooks);
    (0, _qunit.test)('it renders', async function (assert) {
      // Set any properties with this.set('myProperty', 'value');
      // Handle any actions with this.on('myAction', function(val) { ... });

      await (0, _testHelpers.render)((0, _templateFactory.createTemplateFactory)(
      /*
        {{robot-detail}}
      */
      {
        "id": "54B2q6as",
        "block": "[[[1,[34,0]]],[],false,[\"robot-detail\"]]",
        "moduleName": "/Users/tracyhuang/Dev/mrg/frontend/mrg-sign-in/tests/integration/components/robot-detail-test.js",
        "isStrictMode": false
      }));
      assert.dom('*').hasText('');

      // Template block usage:
      await (0, _testHelpers.render)((0, _templateFactory.createTemplateFactory)(
      /*
        
            {{#robot-detail}}
              template block text
            {{/robot-detail}}
          
      */
      {
        "id": "NuvfylCL",
        "block": "[[[1,\"\\n\"],[6,[39,0],null,null,[[\"default\"],[[[[1,\"        template block text\\n\"]],[]]]]],[1,\"    \"]],[],false,[\"robot-detail\"]]",
        "moduleName": "/Users/tracyhuang/Dev/mrg/frontend/mrg-sign-in/tests/integration/components/robot-detail-test.js",
        "isStrictMode": false
      }));
      assert.dom('*').hasText('template block text');
    });
  });
});
define("mrg-sign-in/tests/integration/components/robot-edit-test", ["@ember/template-factory", "qunit", "ember-qunit", "@ember/test-helpers"], function (_templateFactory, _qunit, _emberQunit, _testHelpers) {
  "use strict";

  0; //eaimeta@70e063a35619d71f0,"qunit",0,"ember-qunit",0,"@ember/test-helpers",0,"htmlbars-inline-precompile"eaimeta@70e063a35619d71f
  (0, _qunit.module)('Integration | Component | robot edit', function (hooks) {
    (0, _emberQunit.setupRenderingTest)(hooks);
    (0, _qunit.test)('it renders', async function (assert) {
      // Set any properties with this.set('myProperty', 'value');
      // Handle any actions with this.on('myAction', function(val) { ... });

      await (0, _testHelpers.render)((0, _templateFactory.createTemplateFactory)(
      /*
        {{robot-edit}}
      */
      {
        "id": "5DJVCYj6",
        "block": "[[[1,[34,0]]],[],false,[\"robot-edit\"]]",
        "moduleName": "/Users/tracyhuang/Dev/mrg/frontend/mrg-sign-in/tests/integration/components/robot-edit-test.js",
        "isStrictMode": false
      }));
      assert.dom('*').hasText('');

      // Template block usage:
      await (0, _testHelpers.render)((0, _templateFactory.createTemplateFactory)(
      /*
        
            {{#robot-edit}}
              template block text
            {{/robot-edit}}
          
      */
      {
        "id": "oS0NELlf",
        "block": "[[[1,\"\\n\"],[6,[39,0],null,null,[[\"default\"],[[[[1,\"        template block text\\n\"]],[]]]]],[1,\"    \"]],[],false,[\"robot-edit\"]]",
        "moduleName": "/Users/tracyhuang/Dev/mrg/frontend/mrg-sign-in/tests/integration/components/robot-edit-test.js",
        "isStrictMode": false
      }));
      assert.dom('*').hasText('template block text');
    });
  });
});
define("mrg-sign-in/tests/integration/components/robot-listing-test", ["@ember/template-factory", "qunit", "ember-qunit", "@ember/test-helpers"], function (_templateFactory, _qunit, _emberQunit, _testHelpers) {
  "use strict";

  0; //eaimeta@70e063a35619d71f0,"qunit",0,"ember-qunit",0,"@ember/test-helpers",0,"htmlbars-inline-precompile"eaimeta@70e063a35619d71f
  (0, _qunit.module)('Integration | Component | robot listing', function (hooks) {
    (0, _emberQunit.setupRenderingTest)(hooks);
    (0, _qunit.test)('it renders', async function (assert) {
      // Set any properties with this.set('myProperty', 'value');
      // Handle any actions with this.on('myAction', function(val) { ... });

      await (0, _testHelpers.render)((0, _templateFactory.createTemplateFactory)(
      /*
        {{robot-listing}}
      */
      {
        "id": "hohWd1qL",
        "block": "[[[1,[34,0]]],[],false,[\"robot-listing\"]]",
        "moduleName": "/Users/tracyhuang/Dev/mrg/frontend/mrg-sign-in/tests/integration/components/robot-listing-test.js",
        "isStrictMode": false
      }));
      assert.dom('*').hasText('');

      // Template block usage:
      await (0, _testHelpers.render)((0, _templateFactory.createTemplateFactory)(
      /*
        
            {{#robot-listing}}
              template block text
            {{/robot-listing}}
          
      */
      {
        "id": "ory4jDeS",
        "block": "[[[1,\"\\n\"],[6,[39,0],null,null,[[\"default\"],[[[[1,\"        template block text\\n\"]],[]]]]],[1,\"    \"]],[],false,[\"robot-listing\"]]",
        "moduleName": "/Users/tracyhuang/Dev/mrg/frontend/mrg-sign-in/tests/integration/components/robot-listing-test.js",
        "isStrictMode": false
      }));
      assert.dom('*').hasText('template block text');
    });
  });
});
define("mrg-sign-in/tests/integration/components/robot-measurement-test", ["@ember/template-factory", "qunit", "ember-qunit", "@ember/test-helpers"], function (_templateFactory, _qunit, _emberQunit, _testHelpers) {
  "use strict";

  0; //eaimeta@70e063a35619d71f0,"qunit",0,"ember-qunit",0,"@ember/test-helpers",0,"ember-cli-htmlbars"eaimeta@70e063a35619d71f
  (0, _qunit.module)('Integration | Component | robot-measurement', function (hooks) {
    (0, _emberQunit.setupRenderingTest)(hooks);
    (0, _qunit.test)('it renders', async function (assert) {
      // Set any properties with this.set('myProperty', 'value');
      // Handle any actions with this.set('myAction', function(val) { ... });

      await (0, _testHelpers.render)((0, _templateFactory.createTemplateFactory)(
      /*
        <RobotMeasurement />
      */
      {
        "id": "tQzQuLlF",
        "block": "[[[8,[39,0],null,null,null]],[],false,[\"robot-measurement\"]]",
        "moduleName": "/Users/tracyhuang/Dev/mrg/frontend/mrg-sign-in/tests/integration/components/robot-measurement-test.js",
        "isStrictMode": false
      }));
      assert.equal(this.element.textContent.trim(), '');

      // Template block usage:
      await (0, _testHelpers.render)((0, _templateFactory.createTemplateFactory)(
      /*
        
            <RobotMeasurement>
              template block text
            </RobotMeasurement>
          
      */
      {
        "id": "C30H8Bh5",
        "block": "[[[1,\"\\n      \"],[8,[39,0],null,null,[[\"default\"],[[[[1,\"\\n        template block text\\n      \"]],[]]]]],[1,\"\\n    \"]],[],false,[\"robot-measurement\"]]",
        "moduleName": "/Users/tracyhuang/Dev/mrg/frontend/mrg-sign-in/tests/integration/components/robot-measurement-test.js",
        "isStrictMode": false
      }));
      assert.equal(this.element.textContent.trim(), 'template block text');
    });
  });
});
define("mrg-sign-in/tests/integration/components/robot-payment-test", ["@ember/template-factory", "qunit", "ember-qunit", "@ember/test-helpers"], function (_templateFactory, _qunit, _emberQunit, _testHelpers) {
  "use strict";

  0; //eaimeta@70e063a35619d71f0,"qunit",0,"ember-qunit",0,"@ember/test-helpers",0,"ember-cli-htmlbars"eaimeta@70e063a35619d71f
  (0, _qunit.module)('Integration | Component | robot-payment', function (hooks) {
    (0, _emberQunit.setupRenderingTest)(hooks);
    (0, _qunit.test)('it renders', async function (assert) {
      // Set any properties with this.set('myProperty', 'value');
      // Handle any actions with this.set('myAction', function(val) { ... });

      await (0, _testHelpers.render)((0, _templateFactory.createTemplateFactory)(
      /*
        <RobotPayment />
      */
      {
        "id": "aJBW7TmY",
        "block": "[[[8,[39,0],null,null,null]],[],false,[\"robot-payment\"]]",
        "moduleName": "/Users/tracyhuang/Dev/mrg/frontend/mrg-sign-in/tests/integration/components/robot-payment-test.js",
        "isStrictMode": false
      }));
      assert.equal(this.element.textContent.trim(), '');

      // Template block usage:
      await (0, _testHelpers.render)((0, _templateFactory.createTemplateFactory)(
      /*
        
            <RobotPayment>
              template block text
            </RobotPayment>
          
      */
      {
        "id": "wgjp1ofw",
        "block": "[[[1,\"\\n      \"],[8,[39,0],null,null,[[\"default\"],[[[[1,\"\\n        template block text\\n      \"]],[]]]]],[1,\"\\n    \"]],[],false,[\"robot-payment\"]]",
        "moduleName": "/Users/tracyhuang/Dev/mrg/frontend/mrg-sign-in/tests/integration/components/robot-payment-test.js",
        "isStrictMode": false
      }));
      assert.equal(this.element.textContent.trim(), 'template block text');
    });
  });
});
define("mrg-sign-in/tests/integration/components/validated-input-test", ["@ember/template-factory", "qunit", "ember-qunit", "@ember/test-helpers"], function (_templateFactory, _qunit, _emberQunit, _testHelpers) {
  "use strict";

  0; //eaimeta@70e063a35619d71f0,"qunit",0,"ember-qunit",0,"@ember/test-helpers",0,"htmlbars-inline-precompile"eaimeta@70e063a35619d71f
  (0, _qunit.module)('Integration | Component | validated input', function (hooks) {
    (0, _emberQunit.setupRenderingTest)(hooks);
    (0, _qunit.test)('it renders', async function (assert) {
      // Set any properties with this.set('myProperty', 'value');
      // Handle any actions with this.on('myAction', function(val) { ... });

      await (0, _testHelpers.render)((0, _templateFactory.createTemplateFactory)(
      /*
        {{validated-input}}
      */
      {
        "id": "GS2zlS3b",
        "block": "[[[1,[34,0]]],[],false,[\"validated-input\"]]",
        "moduleName": "/Users/tracyhuang/Dev/mrg/frontend/mrg-sign-in/tests/integration/components/validated-input-test.js",
        "isStrictMode": false
      }));
      assert.dom('*').hasText('');

      // Template block usage:
      await (0, _testHelpers.render)((0, _templateFactory.createTemplateFactory)(
      /*
        
            {{#validated-input}}
              template block text
            {{/validated-input}}
          
      */
      {
        "id": "qqIIiX8k",
        "block": "[[[1,\"\\n\"],[6,[39,0],null,null,[[\"default\"],[[[[1,\"        template block text\\n\"]],[]]]]],[1,\"    \"]],[],false,[\"validated-input\"]]",
        "moduleName": "/Users/tracyhuang/Dev/mrg/frontend/mrg-sign-in/tests/integration/components/validated-input-test.js",
        "isStrictMode": false
      }));
      assert.dom('*').hasText('template block text');
    });
  });
});
define("mrg-sign-in/tests/test-helper", ["mrg-sign-in/app", "mrg-sign-in/config/environment", "@ember/test-helpers", "ember-qunit"], function (_app, _environment, _testHelpers, _emberQunit) {
  "use strict";

  0; //eaimeta@70e063a35619d71f0,"mrg-sign-in/app",0,"mrg-sign-in/config/environment",0,"@ember/test-helpers",0,"ember-qunit"eaimeta@70e063a35619d71f
  (0, _testHelpers.setApplication)(_app.default.create(_environment.default.APP));
  (0, _emberQunit.start)();
});
define("mrg-sign-in/tests/unit/adapters/application-test", ["qunit", "ember-qunit"], function (_qunit, _emberQunit) {
  "use strict";

  0; //eaimeta@70e063a35619d71f0,"qunit",0,"ember-qunit"eaimeta@70e063a35619d71f
  (0, _qunit.module)('Unit | Adapter | application', function (hooks) {
    (0, _emberQunit.setupTest)(hooks);

    // Replace this with your real tests.
    (0, _qunit.test)('it exists', function (assert) {
      let adapter = this.owner.lookup('adapter:application');
      assert.ok(adapter);
    });
    (0, _qunit.test)('Produce a findAll URL', function (assert) {
      let adapter = this.owner.lookup('adapter:application');
      let s = someThing.findAllUrl("robot");
      assert.equal(s, './robot');
    });
  });
});
define("mrg-sign-in/tests/unit/controllers/ring-assignments-test", ["qunit", "ember-qunit"], function (_qunit, _emberQunit) {
  "use strict";

  0; //eaimeta@70e063a35619d71f0,"qunit",0,"ember-qunit"eaimeta@70e063a35619d71f
  (0, _qunit.module)('Unit | Controller | ring assignments', function (hooks) {
    (0, _emberQunit.setupTest)(hooks);

    // Replace this with your real tests.
    (0, _qunit.test)('it exists', function (assert) {
      let controller = this.owner.lookup('controller:ringAssignment');
      assert.ok(controller);
    });
  });
});
define("mrg-sign-in/tests/unit/controllers/robocritter-certificate-test", ["qunit", "mrg-sign-in/tests/helpers"], function (_qunit, _helpers) {
  "use strict";

  0; //eaimeta@70e063a35619d71f0,"qunit",0,"mrg-sign-in/tests/helpers"eaimeta@70e063a35619d71f
  (0, _qunit.module)('Unit | Controller | robocritter-certificate', function (hooks) {
    (0, _helpers.setupTest)(hooks);

    // TODO: Replace this with your real tests.
    (0, _qunit.test)('it exists', function (assert) {
      let controller = this.owner.lookup('controller:robocritter-certificate');
      assert.ok(controller);
    });
  });
});
define("mrg-sign-in/tests/unit/controllers/robots/index-test", ["qunit", "ember-qunit"], function (_qunit, _emberQunit) {
  "use strict";

  0; //eaimeta@70e063a35619d71f0,"qunit",0,"ember-qunit"eaimeta@70e063a35619d71f
  (0, _qunit.module)('Unit | Controller | robots/index', function (hooks) {
    (0, _emberQunit.setupTest)(hooks);

    // Replace this with your real tests.
    (0, _qunit.test)('it exists', function (assert) {
      let controller = this.owner.lookup('controller:robots/index');
      assert.ok(controller);
    });
  });
});
define("mrg-sign-in/tests/unit/controllers/robots/show-test", ["qunit", "ember-qunit"], function (_qunit, _emberQunit) {
  "use strict";

  0; //eaimeta@70e063a35619d71f0,"qunit",0,"ember-qunit"eaimeta@70e063a35619d71f
  (0, _qunit.module)('Unit | Controller | robots/show', function (hooks) {
    (0, _emberQunit.setupTest)(hooks);

    // Replace this with your real tests.
    (0, _qunit.test)('it exists', function (assert) {
      let controller = this.owner.lookup('controller:robots/show');
      assert.ok(controller);
    });
  });
});
define("mrg-sign-in/tests/unit/models/activity-log-test", ["qunit", "ember-qunit"], function (_qunit, _emberQunit) {
  "use strict";

  0; //eaimeta@70e063a35619d71f0,"qunit",0,"ember-qunit"eaimeta@70e063a35619d71f
  (0, _qunit.module)('Unit | Model | activity log', function (hooks) {
    (0, _emberQunit.setupTest)(hooks);

    // Replace this with your real tests.
    (0, _qunit.test)('it exists', function (assert) {
      let store = this.owner.lookup('service:store');
      let model = store.createRecord('activity-log', {});
      assert.ok(model);
    });
  });
});
define("mrg-sign-in/tests/unit/models/competition-test", ["qunit", "ember-qunit", "@ember/runloop"], function (_qunit, _emberQunit, _runloop) {
  "use strict";

  0; //eaimeta@70e063a35619d71f0,"qunit",0,"ember-qunit",0,"@ember/runloop"eaimeta@70e063a35619d71f
  (0, _qunit.module)('Unit | Model | competition', function (hooks) {
    (0, _emberQunit.setupTest)(hooks);
    (0, _qunit.test)('it exists', function (assert) {
      let model = (0, _runloop.run)(() => this.owner.lookup('service:store').createRecord('competition'));
      // let store = this.store();
      assert.ok(!!model);
    });
  });
});
define("mrg-sign-in/tests/unit/models/robots-test", ["qunit", "ember-qunit", "@ember/runloop"], function (_qunit, _emberQunit, _runloop) {
  "use strict";

  0; //eaimeta@70e063a35619d71f0,"qunit",0,"ember-qunit",0,"@ember/runloop"eaimeta@70e063a35619d71f
  (0, _qunit.module)('Unit | Model | robot', function (hooks) {
    (0, _emberQunit.setupTest)(hooks);
    (0, _qunit.test)('it exists', function (assert) {
      let model = (0, _runloop.run)(() => this.owner.lookup('service:store').createRecord('robot'));
      // let store = this.store();
      assert.ok(!!model);
    });
  });
});
define("mrg-sign-in/tests/unit/routes/application-test", ["qunit", "mrg-sign-in/tests/helpers"], function (_qunit, _helpers) {
  "use strict";

  0; //eaimeta@70e063a35619d71f0,"qunit",0,"mrg-sign-in/tests/helpers"eaimeta@70e063a35619d71f
  (0, _qunit.module)('Unit | Route | application', function (hooks) {
    (0, _helpers.setupTest)(hooks);
    (0, _qunit.test)('it exists', function (assert) {
      let route = this.owner.lookup('route:application');
      assert.ok(route);
    });
  });
});
define("mrg-sign-in/tests/unit/routes/competition-test", ["qunit", "ember-qunit"], function (_qunit, _emberQunit) {
  "use strict";

  0; //eaimeta@70e063a35619d71f0,"qunit",0,"ember-qunit"eaimeta@70e063a35619d71f
  (0, _qunit.module)('Unit | Route | competition', function (hooks) {
    (0, _emberQunit.setupTest)(hooks);
    (0, _qunit.test)('it exists', function (assert) {
      let route = this.owner.lookup('route:competition');
      assert.ok(route);
    });
  });
});
define("mrg-sign-in/tests/unit/routes/competitions-test", ["qunit", "ember-qunit"], function (_qunit, _emberQunit) {
  "use strict";

  0; //eaimeta@70e063a35619d71f0,"qunit",0,"ember-qunit"eaimeta@70e063a35619d71f
  (0, _qunit.module)('Unit | Route | competitions', function (hooks) {
    (0, _emberQunit.setupTest)(hooks);
    (0, _qunit.test)('it exists', function (assert) {
      let route = this.owner.lookup('route:competitions');
      assert.ok(route);
    });
  });
});
define("mrg-sign-in/tests/unit/routes/log-test", ["qunit", "ember-qunit"], function (_qunit, _emberQunit) {
  "use strict";

  0; //eaimeta@70e063a35619d71f0,"qunit",0,"ember-qunit"eaimeta@70e063a35619d71f
  (0, _qunit.module)('Unit | Route | log', function (hooks) {
    (0, _emberQunit.setupTest)(hooks);
    (0, _qunit.test)('it exists', function (assert) {
      let route = this.owner.lookup('route:log');
      assert.ok(route);
    });
  });
});
define("mrg-sign-in/tests/unit/routes/robocritter-certificate-test", ["qunit", "mrg-sign-in/tests/helpers"], function (_qunit, _helpers) {
  "use strict";

  0; //eaimeta@70e063a35619d71f0,"qunit",0,"mrg-sign-in/tests/helpers"eaimeta@70e063a35619d71f
  (0, _qunit.module)('Unit | Route | robocritter-certificate', function (hooks) {
    (0, _helpers.setupTest)(hooks);
    (0, _qunit.test)('it exists', function (assert) {
      let route = this.owner.lookup('route:robocritter-certificate');
      assert.ok(route);
    });
  });
});
define("mrg-sign-in/tests/unit/routes/robots-test", ["qunit", "ember-qunit"], function (_qunit, _emberQunit) {
  "use strict";

  0; //eaimeta@70e063a35619d71f0,"qunit",0,"ember-qunit"eaimeta@70e063a35619d71f
  (0, _qunit.module)('Unit | Route | robot', function (hooks) {
    (0, _emberQunit.setupTest)(hooks);
    (0, _qunit.test)('it exists', function (assert) {
      let route = this.owner.lookup('route:robot');
      assert.ok(route);
    });
  });
});
define("mrg-sign-in/tests/unit/routes/robots/edit-test", ["qunit", "ember-qunit"], function (_qunit, _emberQunit) {
  "use strict";

  0; //eaimeta@70e063a35619d71f0,"qunit",0,"ember-qunit"eaimeta@70e063a35619d71f
  (0, _qunit.module)('Unit | Route | robots/edit', function (hooks) {
    (0, _emberQunit.setupTest)(hooks);
    (0, _qunit.test)('it exists', function (assert) {
      let route = this.owner.lookup('route:robots/edit');
      assert.ok(route);
    });
  });
});
define("mrg-sign-in/tests/unit/routes/robots/index-test", ["qunit", "ember-qunit"], function (_qunit, _emberQunit) {
  "use strict";

  0; //eaimeta@70e063a35619d71f0,"qunit",0,"ember-qunit"eaimeta@70e063a35619d71f
  (0, _qunit.module)('Unit | Route | robots/index', function (hooks) {
    (0, _emberQunit.setupTest)(hooks);
    (0, _qunit.test)('it exists', function (assert) {
      let route = this.owner.lookup('route:robots/index');
      assert.ok(route);
    });
  });
});
define("mrg-sign-in/tests/unit/routes/robots/info-test", ["qunit", "ember-qunit"], function (_qunit, _emberQunit) {
  "use strict";

  0; //eaimeta@70e063a35619d71f0,"qunit",0,"ember-qunit"eaimeta@70e063a35619d71f
  (0, _qunit.module)('Unit | Route | robots/info', function (hooks) {
    (0, _emberQunit.setupTest)(hooks);
    (0, _qunit.test)('it exists', function (assert) {
      let route = this.owner.lookup('route:robots/info');
      assert.ok(route);
    });
  });
});
define("mrg-sign-in/tests/unit/routes/robots/new-test", ["qunit", "ember-qunit"], function (_qunit, _emberQunit) {
  "use strict";

  0; //eaimeta@70e063a35619d71f0,"qunit",0,"ember-qunit"eaimeta@70e063a35619d71f
  (0, _qunit.module)('Unit | Route | robots/new', function (hooks) {
    (0, _emberQunit.setupTest)(hooks);
    (0, _qunit.test)('it exists', function (assert) {
      let route = this.owner.lookup('route:robots/new');
      assert.ok(route);
    });
  });
});
define("mrg-sign-in/tests/unit/serializers/application-test", ["qunit", "ember-qunit", "@ember/runloop"], function (_qunit, _emberQunit, _runloop) {
  "use strict";

  0; //eaimeta@70e063a35619d71f0,"qunit",0,"ember-qunit",0,"@ember/runloop"eaimeta@70e063a35619d71f
  (0, _qunit.module)('Unit | Serializer | application', function (hooks) {
    (0, _emberQunit.setupTest)(hooks);

    // Replace this with your real tests.
    (0, _qunit.test)('it serializes records', function (assert) {
      let record = (0, _runloop.run)(() => this.owner.lookup('service:store').createRecord('application'));
      let serializedRecord = record.serialize();
      assert.ok(serializedRecord);
    });
  });
});
define("mrg-sign-in/tests/unit/validators/robot-test", ["qunit", "mrg-sign-in/validators/robot"], function (_qunit, _robot) {
  "use strict";

  0; //eaimeta@70e063a35619d71f0,"qunit",0,"mrg-sign-in/validators/robot"eaimeta@70e063a35619d71f
  (0, _qunit.module)('Unit | Validator | robot', function () {
    (0, _qunit.test)('it exists', function (assert) {
      assert.ok((0, _robot.default)());
    });
  });
});
define('mrg-sign-in/config/environment', [], function() {
  var prefix = 'mrg-sign-in';
try {
  var metaName = prefix + '/config/environment';
  var rawConfig = document.querySelector('meta[name="' + metaName + '"]').getAttribute('content');
  var config = JSON.parse(decodeURIComponent(rawConfig));

  var exports = { 'default': config };

  Object.defineProperty(exports, '__esModule', { value: true });

  return exports;
}
catch(err) {
  throw new Error('Could not read config from meta tag with name "' + metaName + '".');
}

});

require('mrg-sign-in/tests/test-helper');
EmberENV.TESTS_FILE_LOADED = true;
//# sourceMappingURL=tests.map
