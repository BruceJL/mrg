'use strict';



;define("mrg-sign-in/adapters/-json-api", ["exports", "@ember-data/adapter/json-api"], function (_exports, _jsonApi) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function () {
      return _jsonApi.default;
    }
  });
  0; //eaimeta@70e063a35619d71f0,"@ember-data/adapter/json-api"eaimeta@70e063a35619d71f
});
;define("mrg-sign-in/adapters/application", ["exports", "mrg-sign-in/adapters/postgrestAdapter"], function (_exports, _postgrestAdapter) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  0; //eaimeta@70e063a35619d71f0,"mrg-sign-in/adapters/postgrestAdapter"eaimeta@70e063a35619d71f
  class ApplicationAdapter extends _postgrestAdapter.default {
    //namespace = "api";
    //@ts-ignore
    //namespace = config.APP['API_NAMESPACE'];
  }
  _exports.default = ApplicationAdapter;
});
;define("mrg-sign-in/adapters/postgrestAdapter", ["exports", "@ember-data/adapter", "rsvp", "fetch", "ember-fetch/errors"], function (_exports, _adapter, _rsvp, _fetch, _errors) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  0; //eaimeta@70e063a35619d71f0,"@ember-data/adapter",0,"rsvp",0,"fetch",0,"ember-fetch/errors"eaimeta@70e063a35619d71f
  function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
  function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
  function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); } //import { MinimumAdapterInterface } from '@ember-data/adapter';
  //import ModelSchema from '@ember-data/model';
  //import { inject as service } from '@ember/service';
  class PostgrestAdapter extends _adapter.default {
    constructor() {
      super(...arguments);
      _defineProperty(this, "host", "");
      _defineProperty(this, "namespace", "");
    }
    _fetch(input, init) {
      return (0, _fetch.default)(input, init
      // The following stolen from: https://github.com/ember-cli/ember-fetch
      ).then(function (response) {
        if (response.ok) {
          return response.json();
        } else if ((0, _errors.isUnauthorizedResponse)(response)) {
          // handle 401 response
          (0, _rsvp.reject)(response);
        } else if ((0, _errors.isServerErrorResponse)(response)) {
          // handle 5xx respones
          (0, _rsvp.reject)(response);
        }
      }).catch(function (error) {
        if ((0, _errors.isAbortError)(error)) {
          // handle aborted network error
          (0, _rsvp.reject)(error);
        }
        // handle network error
      });
    }
    makeQueryString(id, includes) {
      if (includes === undefined && id === undefined) {
        return "";
      }
      let s = "?";
      if (id !== undefined) {
        s = s + "id=eq." + id;
      }
      if (includes !== undefined) {
        if (s !== "?") {
          s = s + "&";
        }
        let a = includes.split(",");
        s = s + "select=*";
        a.forEach(element => {
          s = s + "," + element + "(*)";
        });
      }
      return s;
    }

    //POST /table_name HTTP/1.1
    //{ "col1": "value1", "col2": "value2" }
    createRecord(store, type,
    //ModelSchema?
    snapshot) {
      let data = snapshot.serialize({
        includeId: false
      });
      let body = JSON.stringify(data);
      let url = this.prefixURL(type.modelName);
      return this._fetch(url, {
        method: 'POST',
        headers: {
          "Content-type": "application/json; charset=utf-8",
          "Prefer": "return=representation"
        },
        body: body
      });
    }

    // Find all records in a given table.
    // URL looks like this: https://site/robot)
    findAll(store, type,
    //ModelSchema?
    sinceToken, snapshot) {
      let url = this.prefixURL(type.modelName);
      url = url + this.makeQueryString(undefined, snapshot.include);
      return this._fetch(url, {
        method: 'GET',
        headers: {
          "Accept": "application/json; charset=utf-8"
        }
      });
    }

    // Find a record with all associated records from another table.
    // URL looks like this: robots?id=eq.1422&select=*,robotmeasurements(*)
    findHasMany(
    // [OPTIONAL]
    store, snapshot, relatedLink, relationship //FIXME :RelationshipSchema, No way to import this currently.
    ) {
      let s = snapshot.modelName + this.makeQueryString(undefined, relatedLink);
      let url = this.prefixURL(s);
      return this._fetch(url);
    }

    // Find the "owning" record for a given record. The URL works just like a
    // "findMany". The URL looks like this:
    // http://site/robotmeasurements?id=eq.424&select=*,robot(*)
    findBelongsTo(
    // [OPTIONAL]
    store, snapshot, relatedLink, relationship //:RelationshipSchema.
    ) {
      let s = "?id=eq." + snapshot.id + "&select=*," + relatedLink + "(*)";
      let url = this.prefixURL(s);
      return this._fetch(url);
    }

    // Finds entries from a given table for a given list of IDs.
    //URL looks like: http://site/robots?or=(id.eq.1191,id.eq.1192)
    findMany(
    // [OPTIONAL]
    store, type, ids, snapshots) {
      let s = [];
      for (const id of ids) {
        s.push("id.eq." + id);
      }
      let q = s.join(",");
      let url = this.prefixURL(type.modelName + '?or=(' + q + ')');
      return this._fetch(url);
    }

    // Find a specific record
    // URL looks like this: https://site/robots?id=eq.1234)
    findRecord(store, type, id, snapshot // FIXME: Snapshot - but I cannot access include because?
    ) {
      let includes = snapshot.include;
      let s = type.modelName + this.makeQueryString(id, includes);
      let url = this.prefixURL(s);
      return this._fetch(url);
    }

    /* Don't need generateIdForRecordStore as Postgrest will be taking care of
       that.
    generateIdForRecord(store, type, properties) { //[OPTIONAL]
     }
    */

    // Run a query on a given table.
    // url looks like this: people?age=gte.18&student=is.true
    query(store, type, query, recordArray //: Collection,
    // options: Object, Spec'd in MinimumInterfaceAdapter, but not Adapter?
    ) {
      let url = "";
      let s = [];
      for (let key in query) {
        let value = query[key];
        if (typeof value == "boolean") {
          s.push(key + "=is." + value);
        } else {
          s.push(key + "=eq." + value);
        }
      }
      url = this.prefixURL(type.modelName + url);
      return this._fetch(url);
    }

    // UNSURE: I don't know what differentiates a "queryrecord" from a "query"
    // The docs are not too helpful.
    queryRecord(store, type, query //Dict<unknown>, as per MinimumAdapterInterface
    //options: { adapterOptions?: unknown }, Spec'd in MinimumInterfaceAdapter, but not Adapter?
    ) {
      let url = "";
      let s = [];
      for (let key in query) {
        let value = query[key];
        if (typeof value == "boolean") {
          s.push(key + "=is." + value);
        } else {
          s.push(key + "=eq." + value);
        }
      }
      url = this.prefixURL(type.modelName + url);
      return this._fetch(url);
    }
    updateRecord(store, type, snapshot) {
      let data = JSON.stringify(snapshot.serialize({
        includeId: false
      }));
      let s = type.modelName + "?id=eq." + snapshot.id;
      s = this.prefixURL(s);
      return this._fetch(s, {
        method: 'PATCH',
        headers: {
          "Content-type": "application/json;",
          "Prefer": "return=representation"
        },
        body: data
      });
    }
    prefixURL(modelName) {
      let url = [];
      let {
        host
      } = this;
      let prefix = this._urlPrefix();
      url.push(modelName);
      if (prefix) {
        url.unshift(prefix);
      }
      let urlString = url.join('/');
      if (!host && urlString && urlString.charAt(0) !== '/') {
        urlString = '/' + urlString;
      }
      return urlString;
    }

    // stolen from packages/adapter/addon/-private/build-url-mixin.ts
    _urlPrefix(path, parentURL) {
      let {
        host,
        namespace
      } = this;
      let url = [];
      if (!host || host === '/') {
        host = '';
      }
      if (path) {
        // Protocol relative url
        if (/^\/\//.test(path) || /http(s)?:\/\//.test(path)) {
          // Do nothing, the full host is already included.
          url.push(path);
        } else if (path.charAt(0) === '/') {
          // Absolute path
          url.push(`${host}${path}`);
        } else {
          // Relative path
          url.push(`${parentURL}/${path}`);
        }
        return url;
      }

      // No path provided
      if (host) {
        url.push(host);
      }
      if (namespace) {
        url.push(namespace);
      }
      return url;
    }
  }
  _exports.default = PostgrestAdapter;
});
;define("mrg-sign-in/app", ["exports", "@ember/application", "mrg-sign-in/resolver", "ember-load-initializers", "mrg-sign-in/config/environment"], function (_exports, _application, _resolver, _emberLoadInitializers, _environment) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  0; //eaimeta@70e063a35619d71f0,"@ember/application",0,"mrg-sign-in/resolver",0,"ember-load-initializers",0,"mrg-sign-in/config/environment"eaimeta@70e063a35619d71f
  function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
  function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
  function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
  class App extends _application.default {
    constructor() {
      super(...arguments);
      _defineProperty(this, "modulePrefix", _environment.default.modulePrefix);
      _defineProperty(this, "podModulePrefix", _environment.default.podModulePrefix);
      _defineProperty(this, "Resolver", _resolver.default);
      // debugging
      _defineProperty(this, "LOG_TRANSITIONS", true);
      _defineProperty(this, "LOG_RESOLVER", true);
    }
  }
  _exports.default = App;
  (0, _emberLoadInitializers.default)(App, _environment.default.modulePrefix);
});
;define("mrg-sign-in/authenticators/simple", ["exports", "rsvp", "ember-simple-auth/authenticators/base", "@ember/debug", "@ember/service"], function (_exports, _rsvp, _base, _debug, _service) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  var _class, _descriptor; //@ts-ignore
  0; //eaimeta@70e063a35619d71f0,"rsvp",0,"ember-simple-auth/authenticators/base",0,"@ember/debug",0,"@ember/service"eaimeta@70e063a35619d71f
  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }
  function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
  function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
  function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }
  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'proposal-class-properties is enabled and runs after the decorators transform.'); }
  let SimpleAuthenticator = (_class = class SimpleAuthenticator extends _base.default {
    constructor() {
      super(...arguments);
      _initializerDefineProperty(this, "session", _descriptor, this);
    }
    //EmberSimpleAuthSession

    restore(data) {
      let promise = new _rsvp.Promise(function (resolve, reject) {
        resolve(data);
      });
      return promise;
    }
    authenticate(data) {
      let fullname = data;
      (0, _debug.debug)("authenticating " + fullname);
      if (fullname !== undefined) {
        return _rsvp.Promise.resolve({
          fullname
        });
      } else {
        return _rsvp.Promise.reject('Please enter a name.');
      }
    }
    invalidate(data) {
      return _rsvp.Promise.resolve(data);
    }
  }, _descriptor = _applyDecoratedDescriptor(_class.prototype, "session", [_service.inject], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _class);
  _exports.default = SimpleAuthenticator;
});
;define("mrg-sign-in/component-managers/glimmer", ["exports", "@glimmer/component/-private/ember-component-manager"], function (_exports, _emberComponentManager) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function () {
      return _emberComponentManager.default;
    }
  });
  0; //eaimeta@70e063a35619d71f0,"@glimmer/component/-private/ember-component-manager"eaimeta@70e063a35619d71f
});
;define("mrg-sign-in/components/login", ["exports", "@ember/service", "@ember/object", "@glimmer/component"], function (_exports, _service, _object, _component) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  var _class, _descriptor;
  0; //eaimeta@70e063a35619d71f0,"@ember/service",0,"@ember/object",0,"@glimmer/component"eaimeta@70e063a35619d71f
  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }
  function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
  function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
  function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }
  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'proposal-class-properties is enabled and runs after the decorators transform.'); }
  let loginComponent = (_class = class loginComponent extends _component.default {
    constructor() {
      super(...arguments);
      _initializerDefineProperty(this, "session", _descriptor, this);
      //EmberSimpleAuthSession
      _defineProperty(this, "identification", "");
    }
    async authenticate() {
      // let {
      //   identification,
      // } = this.identification;
      // try {
      //   await this.session.authenticate('authenticator:simple', identification);
      // } catch (error) {
      //   this.set('errorMessage', error.error || error);
      // }

      // if (this.session.isAuthenticated) {
      //   // What to do with all this success?
      // }
    }
    invalidateSession() {
      this.session.invalidate();
    }
  }, _descriptor = _applyDecoratedDescriptor(_class.prototype, "session", [_service.inject], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _applyDecoratedDescriptor(_class.prototype, "authenticate", [_object.action], Object.getOwnPropertyDescriptor(_class.prototype, "authenticate"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "invalidateSession", [_object.action], Object.getOwnPropertyDescriptor(_class.prototype, "invalidateSession"), _class.prototype), _class);
  _exports.default = loginComponent;
});
;define("mrg-sign-in/components/radio-button", ["exports", "ember-radio-buttons/components/radio-button"], function (_exports, _radioButton) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function () {
      return _radioButton.default;
    }
  });
  0; //eaimeta@70e063a35619d71f0,"ember-radio-buttons/components/radio-button"eaimeta@70e063a35619d71f
});
;define("mrg-sign-in/components/robot-checkin-listing", ["exports", "@ember/component", "@ember/template-factory", "@ember/component/template-only"], function (_exports, _component, _templateFactory, _templateOnly) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  0; //eaimeta@70e063a35619d71f0,"ember-cli-htmlbars",0,"@ember/component/template-only"eaimeta@70e063a35619d71f
  const __COLOCATED_TEMPLATE__ = (0, _templateFactory.createTemplateFactory)(
  /*
    <table class="list">
    <thead>
      <tr>
        <th>Robot</th>
        <th>School</th>
        <th>Driver</th>
        <th>Checked In</th>
        <th>Measured</th>
        <th>Paid</th>
        <th>Slotted</th>
      </tr>
    </thead>
  
    <tbody>
      {{#each @robots as |item|}}
        <tr class={{item.readyToCompete}}>
          <td>{{item.name}}</td>
          <td>{{item.school}}</td>
          <td>{{item.driver1}}</td>
          <td class="centered">{{item.checkInStatus}}</td>
          <td class="centered">{{item.formattedMeasured}}</td>
          <td class="centered">{{item.formattedPaidDollars}}</td>
          <td class="centered">{{item.slottedStatus}}</td>
        </tr>
      {{/each}}
    </tbody>
  </table>
  
  */
  {
    "id": "GJF8pAun",
    "block": "[[[10,\"table\"],[14,0,\"list\"],[12],[1,\"\\n  \"],[10,\"thead\"],[12],[1,\"\\n    \"],[10,\"tr\"],[12],[1,\"\\n      \"],[10,\"th\"],[12],[1,\"Robot\"],[13],[1,\"\\n      \"],[10,\"th\"],[12],[1,\"School\"],[13],[1,\"\\n      \"],[10,\"th\"],[12],[1,\"Driver\"],[13],[1,\"\\n      \"],[10,\"th\"],[12],[1,\"Checked In\"],[13],[1,\"\\n      \"],[10,\"th\"],[12],[1,\"Measured\"],[13],[1,\"\\n      \"],[10,\"th\"],[12],[1,\"Paid\"],[13],[1,\"\\n      \"],[10,\"th\"],[12],[1,\"Slotted\"],[13],[1,\"\\n    \"],[13],[1,\"\\n  \"],[13],[1,\"\\n\\n  \"],[10,\"tbody\"],[12],[1,\"\\n\"],[42,[28,[37,1],[[28,[37,1],[[30,1]],null]],null],null,[[[1,\"      \"],[10,\"tr\"],[15,0,[30,2,[\"readyToCompete\"]]],[12],[1,\"\\n        \"],[10,\"td\"],[12],[1,[30,2,[\"name\"]]],[13],[1,\"\\n        \"],[10,\"td\"],[12],[1,[30,2,[\"school\"]]],[13],[1,\"\\n        \"],[10,\"td\"],[12],[1,[30,2,[\"driver1\"]]],[13],[1,\"\\n        \"],[10,\"td\"],[14,0,\"centered\"],[12],[1,[30,2,[\"checkInStatus\"]]],[13],[1,\"\\n        \"],[10,\"td\"],[14,0,\"centered\"],[12],[1,[30,2,[\"formattedMeasured\"]]],[13],[1,\"\\n        \"],[10,\"td\"],[14,0,\"centered\"],[12],[1,[30,2,[\"formattedPaidDollars\"]]],[13],[1,\"\\n        \"],[10,\"td\"],[14,0,\"centered\"],[12],[1,[30,2,[\"slottedStatus\"]]],[13],[1,\"\\n      \"],[13],[1,\"\\n\"]],[2]],null],[1,\"  \"],[13],[1,\"\\n\"],[13],[1,\"\\n\"]],[\"@robots\",\"item\"],false,[\"each\",\"-track-array\"]]",
    "moduleName": "mrg-sign-in/components/robot-checkin-listing.hbs",
    "isStrictMode": false
  });
  var _default = (0, _component.setComponentTemplate)(__COLOCATED_TEMPLATE__, (0, _templateOnly.default)());
  _exports.default = _default;
});
;define("mrg-sign-in/components/robot-checkin", ["exports", "@ember/component", "@ember/template-factory", "@glimmer/component", "@ember/object", "@ember/service"], function (_exports, _component, _templateFactory, _component2, _object, _service) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  var _class, _descriptor, _descriptor2;
  0; //eaimeta@70e063a35619d71f0,"ember-cli-htmlbars",0,"@glimmer/component",0,"@ember/object",0,"@ember/service"eaimeta@70e063a35619d71f
  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }
  function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
  function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
  function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }
  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'proposal-class-properties is enabled and runs after the decorators transform.'); }
  const __COLOCATED_TEMPLATE__ = (0, _templateFactory.createTemplateFactory)(
  /*
    <h3>Check-in Information</h3>
  <table class="form">
    <tbody>
      <tr>
        <td>Registered:</td>
        <td colspan="2">{{moment-format @data.registered "YYYY MMM DD, h:mm:ss"}}</td>
      </tr>
      <tr>
        <td>Checked in:</td>
        <td>{{@data.checkInStatus}}</td>
        <td>
          {{#if (eq @data.checkInStatus "CHECKED-IN")}}
            <button {{on "click" (fn this.cancelCheckin @data)}}>
              Cancel Check in
            </button>
          {{else if (eq @data.checkInStatus "WITHDRAWN")}}
            <button {{on "click" (fn this.reinstate @data)}}>
              Reinstate
            </button>
          {{else}}
            <button {{on "click" (fn this.checkIn @data)}}>Check in</button>
            <button {{on "click" (fn this.withdraw @data)}}>Withdraw</button>
          {{/if}}
        </td>
      </tr>
      <tr>
        <td>Slotting Status:</td>
        <td>{{@data.slottedStatus}}</td>
        <td></td>
      </tr>
    </tbody>
  </table>
  
  */
  {
    "id": "wonsGOQj",
    "block": "[[[10,\"h3\"],[12],[1,\"Check-in Information\"],[13],[1,\"\\n\"],[10,\"table\"],[14,0,\"form\"],[12],[1,\"\\n  \"],[10,\"tbody\"],[12],[1,\"\\n    \"],[10,\"tr\"],[12],[1,\"\\n      \"],[10,\"td\"],[12],[1,\"Registered:\"],[13],[1,\"\\n      \"],[10,\"td\"],[14,\"colspan\",\"2\"],[12],[1,[28,[35,0],[[30,1,[\"registered\"]],\"YYYY MMM DD, h:mm:ss\"],null]],[13],[1,\"\\n    \"],[13],[1,\"\\n    \"],[10,\"tr\"],[12],[1,\"\\n      \"],[10,\"td\"],[12],[1,\"Checked in:\"],[13],[1,\"\\n      \"],[10,\"td\"],[12],[1,[30,1,[\"checkInStatus\"]]],[13],[1,\"\\n      \"],[10,\"td\"],[12],[1,\"\\n\"],[41,[28,[37,2],[[30,1,[\"checkInStatus\"]],\"CHECKED-IN\"],null],[[[1,\"          \"],[11,\"button\"],[4,[38,3],[\"click\",[28,[37,4],[[30,0,[\"cancelCheckin\"]],[30,1]],null]],null],[12],[1,\"\\n            Cancel Check in\\n          \"],[13],[1,\"\\n\"]],[]],[[[41,[28,[37,2],[[30,1,[\"checkInStatus\"]],\"WITHDRAWN\"],null],[[[1,\"          \"],[11,\"button\"],[4,[38,3],[\"click\",[28,[37,4],[[30,0,[\"reinstate\"]],[30,1]],null]],null],[12],[1,\"\\n            Reinstate\\n          \"],[13],[1,\"\\n\"]],[]],[[[1,\"          \"],[11,\"button\"],[4,[38,3],[\"click\",[28,[37,4],[[30,0,[\"checkIn\"]],[30,1]],null]],null],[12],[1,\"Check in\"],[13],[1,\"\\n          \"],[11,\"button\"],[4,[38,3],[\"click\",[28,[37,4],[[30,0,[\"withdraw\"]],[30,1]],null]],null],[12],[1,\"Withdraw\"],[13],[1,\"\\n        \"]],[]]]],[]]],[1,\"      \"],[13],[1,\"\\n    \"],[13],[1,\"\\n    \"],[10,\"tr\"],[12],[1,\"\\n      \"],[10,\"td\"],[12],[1,\"Slotting Status:\"],[13],[1,\"\\n      \"],[10,\"td\"],[12],[1,[30,1,[\"slottedStatus\"]]],[13],[1,\"\\n      \"],[10,\"td\"],[12],[13],[1,\"\\n    \"],[13],[1,\"\\n  \"],[13],[1,\"\\n\"],[13],[1,\"\\n\"]],[\"@data\"],false,[\"moment-format\",\"if\",\"eq\",\"on\",\"fn\"]]",
    "moduleName": "mrg-sign-in/components/robot-checkin.hbs",
    "isStrictMode": false
  });
  let RobotCheckinController = (_class = class RobotCheckinController extends _component2.default {
    constructor() {
      super(...arguments);
      _initializerDefineProperty(this, "session", _descriptor, this);
      //EmberSimpleAuthSession
      _initializerDefineProperty(this, "store", _descriptor2, this);
    }
    save(model) {
      model.save();
    }
    withdraw(model) {
      model.checkInStatus = "WITHDRAWN";
      model.save();
      this.createLogEntry(model, "WITHDRAWN");
    }
    reinstate(model) {
      model.checkInStatus = "UNKNOWN";
      model.save();
      this.createLogEntry(model, "RE-INSTATED");
    }
    checkIn(model) {
      model.checkInStatus = "CHECKED-IN";
      model.save();
      this.createLogEntry(model, "CHECKED-IN");
    }
    cancelCheckin(model) {
      model.checkInStatus = "UNKNOWN";
      model.save();
      this.createLogEntry(model, "CHECK-IN CANCELLED");
    }
    createLogEntry(model, action) {
      let record = this.store.createRecord('activity-log', {
        volunteer: this.session.data.authenticated.fullname,
        robot: model,
        function: "CHECK-IN",
        action: action
      });
      record.save();
    }
  }, _descriptor = _applyDecoratedDescriptor(_class.prototype, "session", [_service.inject], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor2 = _applyDecoratedDescriptor(_class.prototype, "store", [_service.inject], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _applyDecoratedDescriptor(_class.prototype, "save", [_object.action], Object.getOwnPropertyDescriptor(_class.prototype, "save"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "withdraw", [_object.action], Object.getOwnPropertyDescriptor(_class.prototype, "withdraw"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "reinstate", [_object.action], Object.getOwnPropertyDescriptor(_class.prototype, "reinstate"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "checkIn", [_object.action], Object.getOwnPropertyDescriptor(_class.prototype, "checkIn"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "cancelCheckin", [_object.action], Object.getOwnPropertyDescriptor(_class.prototype, "cancelCheckin"), _class.prototype), _class);
  _exports.default = RobotCheckinController;
  (0, _component.setComponentTemplate)(__COLOCATED_TEMPLATE__, RobotCheckinController);
});
;define("mrg-sign-in/components/robot-detail", ["exports", "@ember/component", "@ember/template-factory", "@glimmer/component", "@ember/object", "@ember/debug", "@ember/service"], function (_exports, _component, _templateFactory, _component2, _object, _debug, _service) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  var _class, _descriptor;
  0; //eaimeta@70e063a35619d71f0,"ember-cli-htmlbars",0,"@glimmer/component",0,"@ember/object",0,"@ember/debug",0,"@ember/service"eaimeta@70e063a35619d71f
  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }
  function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
  function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
  function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }
  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'proposal-class-properties is enabled and runs after the decorators transform.'); }
  const __COLOCATED_TEMPLATE__ = (0, _templateFactory.createTemplateFactory)(
  /*
      <h3>Registration Details</h3>
    <table class="form">
      <tbody>
        <tr>
          <td>Robot Name:</td>
          <td>
            <ValidatedInput @changeset={{@changeset}} @propertyName="name" />
          </td>
        </tr>
        <tr>
          <td>Competition:</td>
          <td>
            <select id="competition" {{on "change" (val (fn this.updateCompetition @changeset))}}>
              <option value="" selected={{eq @changeset.competition.id ""}} disabled={{true}}>
                Select competition
              </option>
              {{#each @competitions as |c|}}
                <option value={{c.id}} selected={{eq @changeset.competition.id c.id}}>
                  {{c.name}}
                </option>
              {{/each}}
            </select>
          </td>
        </tr>
        <tr>
          <td>Driver 1:</td>
          <td>
            <ValidatedInput @changeset={{@changeset}} @propertyName="driver1"/>
          </td>
        </tr>
        <tr>
          <td>Driver 1 Grade:</td>
          <td>
            <Input class="full-width" @value={{@changeset.driver1gr}} />
          </td>
        </tr>
        <tr>
          <td>Driver 2:</td>
          <td>
            <Input class="full-width" @value={{@changeset.driver2}} />
          </td>
        </tr>
        <tr>
          <td>Driver 2 Grade:</td>
          <td>
            <Input class="full-width" @value={{@changeset.driver2gr}} />
          </td>
        </tr>
        <tr>
          <td>Driver 3:</td>
          <td>
            <Input class="full-width" @value={{@changeset.driver3}} />
          </td>
        </tr>
        <tr>
          <td>Driver 3 Grade:</td>
          <td>
            <Input class="full-width" @value={{@changeset.driver3gr}} />
          </td>
        </tr>
        <tr>
          <td>School:</td>
          <td>
            <Input class="full-width" @value={{@changeset.school}} />
          </td>
        </tr>
        <tr>
          <td>Coach:</td>
          <td>
            <ValidatedInput @changeset={{@changeset}} propertyName="coach"/>
          </td>
        </tr>
        <tr>
          <td>Email:</td>
          <td>
            <ValidatedInput @changeset={{@changeset}} @propertyName="email"/>
          </td>
        </tr>
        <tr>
          <td>Ph:</td>
          <td>
            <ValidatedInput @changeset={{@changeset}} @propertyName="ph"/>
          </td>
        </tr>
      </tbody>
    </table>
  
  */
  {
    "id": "/7BFNMgI",
    "block": "[[[1,\"  \"],[10,\"h3\"],[12],[1,\"Registration Details\"],[13],[1,\"\\n  \"],[10,\"table\"],[14,0,\"form\"],[12],[1,\"\\n    \"],[10,\"tbody\"],[12],[1,\"\\n      \"],[10,\"tr\"],[12],[1,\"\\n        \"],[10,\"td\"],[12],[1,\"Robot Name:\"],[13],[1,\"\\n        \"],[10,\"td\"],[12],[1,\"\\n          \"],[8,[39,0],null,[[\"@changeset\",\"@propertyName\"],[[30,1],\"name\"]],null],[1,\"\\n        \"],[13],[1,\"\\n      \"],[13],[1,\"\\n      \"],[10,\"tr\"],[12],[1,\"\\n        \"],[10,\"td\"],[12],[1,\"Competition:\"],[13],[1,\"\\n        \"],[10,\"td\"],[12],[1,\"\\n          \"],[11,\"select\"],[24,1,\"competition\"],[4,[38,1],[\"change\",[28,[37,2],[[28,[37,3],[[30,0,[\"updateCompetition\"]],[30,1]],null]],null]],null],[12],[1,\"\\n            \"],[10,\"option\"],[14,2,\"\"],[15,\"selected\",[28,[37,4],[[30,1,[\"competition\",\"id\"]],\"\"],null]],[15,\"disabled\",true],[12],[1,\"\\n              Select competition\\n            \"],[13],[1,\"\\n\"],[42,[28,[37,6],[[28,[37,6],[[30,2]],null]],null],null,[[[1,\"              \"],[10,\"option\"],[15,2,[30,3,[\"id\"]]],[15,\"selected\",[28,[37,4],[[30,1,[\"competition\",\"id\"]],[30,3,[\"id\"]]],null]],[12],[1,\"\\n                \"],[1,[30,3,[\"name\"]]],[1,\"\\n              \"],[13],[1,\"\\n\"]],[3]],null],[1,\"          \"],[13],[1,\"\\n        \"],[13],[1,\"\\n      \"],[13],[1,\"\\n      \"],[10,\"tr\"],[12],[1,\"\\n        \"],[10,\"td\"],[12],[1,\"Driver 1:\"],[13],[1,\"\\n        \"],[10,\"td\"],[12],[1,\"\\n          \"],[8,[39,0],null,[[\"@changeset\",\"@propertyName\"],[[30,1],\"driver1\"]],null],[1,\"\\n        \"],[13],[1,\"\\n      \"],[13],[1,\"\\n      \"],[10,\"tr\"],[12],[1,\"\\n        \"],[10,\"td\"],[12],[1,\"Driver 1 Grade:\"],[13],[1,\"\\n        \"],[10,\"td\"],[12],[1,\"\\n          \"],[8,[39,7],[[24,0,\"full-width\"]],[[\"@value\"],[[30,1,[\"driver1gr\"]]]],null],[1,\"\\n        \"],[13],[1,\"\\n      \"],[13],[1,\"\\n      \"],[10,\"tr\"],[12],[1,\"\\n        \"],[10,\"td\"],[12],[1,\"Driver 2:\"],[13],[1,\"\\n        \"],[10,\"td\"],[12],[1,\"\\n          \"],[8,[39,7],[[24,0,\"full-width\"]],[[\"@value\"],[[30,1,[\"driver2\"]]]],null],[1,\"\\n        \"],[13],[1,\"\\n      \"],[13],[1,\"\\n      \"],[10,\"tr\"],[12],[1,\"\\n        \"],[10,\"td\"],[12],[1,\"Driver 2 Grade:\"],[13],[1,\"\\n        \"],[10,\"td\"],[12],[1,\"\\n          \"],[8,[39,7],[[24,0,\"full-width\"]],[[\"@value\"],[[30,1,[\"driver2gr\"]]]],null],[1,\"\\n        \"],[13],[1,\"\\n      \"],[13],[1,\"\\n      \"],[10,\"tr\"],[12],[1,\"\\n        \"],[10,\"td\"],[12],[1,\"Driver 3:\"],[13],[1,\"\\n        \"],[10,\"td\"],[12],[1,\"\\n          \"],[8,[39,7],[[24,0,\"full-width\"]],[[\"@value\"],[[30,1,[\"driver3\"]]]],null],[1,\"\\n        \"],[13],[1,\"\\n      \"],[13],[1,\"\\n      \"],[10,\"tr\"],[12],[1,\"\\n        \"],[10,\"td\"],[12],[1,\"Driver 3 Grade:\"],[13],[1,\"\\n        \"],[10,\"td\"],[12],[1,\"\\n          \"],[8,[39,7],[[24,0,\"full-width\"]],[[\"@value\"],[[30,1,[\"driver3gr\"]]]],null],[1,\"\\n        \"],[13],[1,\"\\n      \"],[13],[1,\"\\n      \"],[10,\"tr\"],[12],[1,\"\\n        \"],[10,\"td\"],[12],[1,\"School:\"],[13],[1,\"\\n        \"],[10,\"td\"],[12],[1,\"\\n          \"],[8,[39,7],[[24,0,\"full-width\"]],[[\"@value\"],[[30,1,[\"school\"]]]],null],[1,\"\\n        \"],[13],[1,\"\\n      \"],[13],[1,\"\\n      \"],[10,\"tr\"],[12],[1,\"\\n        \"],[10,\"td\"],[12],[1,\"Coach:\"],[13],[1,\"\\n        \"],[10,\"td\"],[12],[1,\"\\n          \"],[8,[39,0],[[24,\"propertyName\",\"coach\"]],[[\"@changeset\"],[[30,1]]],null],[1,\"\\n        \"],[13],[1,\"\\n      \"],[13],[1,\"\\n      \"],[10,\"tr\"],[12],[1,\"\\n        \"],[10,\"td\"],[12],[1,\"Email:\"],[13],[1,\"\\n        \"],[10,\"td\"],[12],[1,\"\\n          \"],[8,[39,0],null,[[\"@changeset\",\"@propertyName\"],[[30,1],\"email\"]],null],[1,\"\\n        \"],[13],[1,\"\\n      \"],[13],[1,\"\\n      \"],[10,\"tr\"],[12],[1,\"\\n        \"],[10,\"td\"],[12],[1,\"Ph:\"],[13],[1,\"\\n        \"],[10,\"td\"],[12],[1,\"\\n          \"],[8,[39,0],null,[[\"@changeset\",\"@propertyName\"],[[30,1],\"ph\"]],null],[1,\"\\n        \"],[13],[1,\"\\n      \"],[13],[1,\"\\n    \"],[13],[1,\"\\n  \"],[13],[1,\"\\n\"]],[\"@changeset\",\"@competitions\",\"c\"],false,[\"validated-input\",\"on\",\"val\",\"fn\",\"eq\",\"each\",\"-track-array\",\"input\"]]",
    "moduleName": "mrg-sign-in/components/robot-detail.hbs",
    "isStrictMode": false
  });
  let RobotDetailController = (_class = class RobotDetailController extends _component2.default {
    constructor() {
      super(...arguments);
      _initializerDefineProperty(this, "store", _descriptor, this);
    }
    updateCompetition(changeset, event) {
      (0, _debug.debug)("got competition change to " + event);
      let ok = confirm("Changing the competition of this entry will cause the registration" + " of the entry to be reset to the current time, moving this entry to " + " the end of the stand-by queue. Are you Sure?");
      if (ok) {
        const id = event;
        const c = this.store.peekRecord('competition', id);
        changeset.set('competition', c);
        changeset.set('registered', null);
      } else {
        changeset.rollback();
      }
    }
  }, _descriptor = _applyDecoratedDescriptor(_class.prototype, "store", [_service.inject], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _applyDecoratedDescriptor(_class.prototype, "updateCompetition", [_object.action], Object.getOwnPropertyDescriptor(_class.prototype, "updateCompetition"), _class.prototype), _class);
  _exports.default = RobotDetailController;
  (0, _component.setComponentTemplate)(__COLOCATED_TEMPLATE__, RobotDetailController);
});
;define("mrg-sign-in/components/robot-listing", ["exports", "@ember/component", "@ember/template-factory", "@ember/component/template-only"], function (_exports, _component, _templateFactory, _templateOnly) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  0; //eaimeta@70e063a35619d71f0,"ember-cli-htmlbars",0,"@ember/component/template-only"eaimeta@70e063a35619d71f
  const __COLOCATED_TEMPLATE__ = (0, _templateFactory.createTemplateFactory)(
  /*
    <table class="list">
    <thead>
      <tr>
        <th>#</th>
        <th>Robot</th>
        <th>Competition</th>
        <th>School</th>
        <th>Driver</th>
        <th>Late</th>
        <th>Invoiced</th>
        <th>Paid</th>
        <th>Checked In</th>
        <th>Measured</th>
        <th>Status</th>
      </tr>
    </thead>
  
    <tbody>
      {{#each @robots as |item|}}
        <tr class={{item.readyToCompete}}>
          <td>{{item.id}}</td>
          <td><LinkTo @route="robots.edit" @model={{item.id}}>{{item.name}}</LinkTo></td>
          <td>{{item.competition.name}}</td>
          <td>{{item.school}}</td>
          <td>{{item.driver1}}</td>
          <td>{{#if item.late}}LATE{{/if}}</td>
          <td>{{item.formattedInvoicedDollars}}</td>
          <td>{{item.formattedPaidDollars}}</td>
          <td class="centered">{{item.checkInStatus}}</td>
          <td class="centered">{{item.formattedMeasured}}</td>
          <td class="centered">{{item.slottedStatus}}</td>
        </tr>
      {{/each}}
    </tbody>
  </table>
  
  */
  {
    "id": "lWyipbY0",
    "block": "[[[10,\"table\"],[14,0,\"list\"],[12],[1,\"\\n  \"],[10,\"thead\"],[12],[1,\"\\n    \"],[10,\"tr\"],[12],[1,\"\\n      \"],[10,\"th\"],[12],[1,\"#\"],[13],[1,\"\\n      \"],[10,\"th\"],[12],[1,\"Robot\"],[13],[1,\"\\n      \"],[10,\"th\"],[12],[1,\"Competition\"],[13],[1,\"\\n      \"],[10,\"th\"],[12],[1,\"School\"],[13],[1,\"\\n      \"],[10,\"th\"],[12],[1,\"Driver\"],[13],[1,\"\\n      \"],[10,\"th\"],[12],[1,\"Late\"],[13],[1,\"\\n      \"],[10,\"th\"],[12],[1,\"Invoiced\"],[13],[1,\"\\n      \"],[10,\"th\"],[12],[1,\"Paid\"],[13],[1,\"\\n      \"],[10,\"th\"],[12],[1,\"Checked In\"],[13],[1,\"\\n      \"],[10,\"th\"],[12],[1,\"Measured\"],[13],[1,\"\\n      \"],[10,\"th\"],[12],[1,\"Status\"],[13],[1,\"\\n    \"],[13],[1,\"\\n  \"],[13],[1,\"\\n\\n  \"],[10,\"tbody\"],[12],[1,\"\\n\"],[42,[28,[37,1],[[28,[37,1],[[30,1]],null]],null],null,[[[1,\"      \"],[10,\"tr\"],[15,0,[30,2,[\"readyToCompete\"]]],[12],[1,\"\\n        \"],[10,\"td\"],[12],[1,[30,2,[\"id\"]]],[13],[1,\"\\n        \"],[10,\"td\"],[12],[8,[39,2],null,[[\"@route\",\"@model\"],[\"robots.edit\",[30,2,[\"id\"]]]],[[\"default\"],[[[[1,[30,2,[\"name\"]]]],[]]]]],[13],[1,\"\\n        \"],[10,\"td\"],[12],[1,[30,2,[\"competition\",\"name\"]]],[13],[1,\"\\n        \"],[10,\"td\"],[12],[1,[30,2,[\"school\"]]],[13],[1,\"\\n        \"],[10,\"td\"],[12],[1,[30,2,[\"driver1\"]]],[13],[1,\"\\n        \"],[10,\"td\"],[12],[41,[30,2,[\"late\"]],[[[1,\"LATE\"]],[]],null],[13],[1,\"\\n        \"],[10,\"td\"],[12],[1,[30,2,[\"formattedInvoicedDollars\"]]],[13],[1,\"\\n        \"],[10,\"td\"],[12],[1,[30,2,[\"formattedPaidDollars\"]]],[13],[1,\"\\n        \"],[10,\"td\"],[14,0,\"centered\"],[12],[1,[30,2,[\"checkInStatus\"]]],[13],[1,\"\\n        \"],[10,\"td\"],[14,0,\"centered\"],[12],[1,[30,2,[\"formattedMeasured\"]]],[13],[1,\"\\n        \"],[10,\"td\"],[14,0,\"centered\"],[12],[1,[30,2,[\"slottedStatus\"]]],[13],[1,\"\\n      \"],[13],[1,\"\\n\"]],[2]],null],[1,\"  \"],[13],[1,\"\\n\"],[13],[1,\"\\n\"]],[\"@robots\",\"item\"],false,[\"each\",\"-track-array\",\"link-to\",\"if\"]]",
    "moduleName": "mrg-sign-in/components/robot-listing.hbs",
    "isStrictMode": false
  });
  var _default = (0, _component.setComponentTemplate)(__COLOCATED_TEMPLATE__, (0, _templateOnly.default)());
  _exports.default = _default;
});
;define("mrg-sign-in/components/robot-measurement", ["exports", "@ember/component", "@ember/template-factory", "@glimmer/component", "@ember/object", "@glimmer/tracking", "@ember/debug", "@ember/service"], function (_exports, _component, _templateFactory, _component2, _object, _tracking, _debug, _service) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  var _class, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _descriptor6, _descriptor7, _descriptor8;
  0; //eaimeta@70e063a35619d71f0,"ember-cli-htmlbars",0,"@glimmer/component",0,"@ember/object",0,"@glimmer/tracking",0,"@ember/debug",0,"@ember/service"eaimeta@70e063a35619d71f
  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }
  function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
  function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
  function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }
  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'proposal-class-properties is enabled and runs after the decorators transform.'); }
  const __COLOCATED_TEMPLATE__ = (0, _templateFactory.createTemplateFactory)(
  /*
    <h3>Measurement Information</h3>
  
  
  <p><b>Measured:</b> {{@data.formattedMeasured}}</p>
  <table class="form" >
    <thead>
      <th>Measurement</th>
      <th>Pass</th>
      <th>Fail</th>
    </thead>
    <tbody>
      {{#each this.requiredMeasurements as |measurement|}}
        <tr>
          <td>{{measurement}}:</td>
          <td>
           <input type="radio"
              {{on "click" (fn this.createMeasurement true measurement @data)}}
              checked={{this.isMeasured @data measurement true}}
            >
          </td>
          <td>
            <input type="radio"
              {{on "click" (fn this.createMeasurement false measurement @data)}}
              checked={{this.isMeasured @data measurement false}}
            >
          </td>
        </tr>
      {{/each}}
    </tbody>
  </table>
  <table class="form">
    <thead>
      <th>Type</th>
      <th>Result</th>
      <th>Time</th>
    </thead>
    <tbody>
      <col>
      <col>
      <col>
      {{#each @data.measurement as |m|}}
        <tr>
          <td>{{m.type}}</td>
          <td>{{m.humanReadableResult}}</td>
          <td>{{moment-format m.datetime "h:mm:ss a"}}</td>
        </tr>
      {{/each}}
    </tbody>
  </table>
  
  */
  {
    "id": "//FFc3dK",
    "block": "[[[10,\"h3\"],[12],[1,\"Measurement Information\"],[13],[1,\"\\n\\n\\n\"],[10,2],[12],[10,\"b\"],[12],[1,\"Measured:\"],[13],[1,\" \"],[1,[30,1,[\"formattedMeasured\"]]],[13],[1,\"\\n\"],[10,\"table\"],[14,0,\"form\"],[12],[1,\"\\n  \"],[10,\"thead\"],[12],[1,\"\\n    \"],[10,\"th\"],[12],[1,\"Measurement\"],[13],[1,\"\\n    \"],[10,\"th\"],[12],[1,\"Pass\"],[13],[1,\"\\n    \"],[10,\"th\"],[12],[1,\"Fail\"],[13],[1,\"\\n  \"],[13],[1,\"\\n  \"],[10,\"tbody\"],[12],[1,\"\\n\"],[42,[28,[37,1],[[28,[37,1],[[30,0,[\"requiredMeasurements\"]]],null]],null],null,[[[1,\"      \"],[10,\"tr\"],[12],[1,\"\\n        \"],[10,\"td\"],[12],[1,[30,2]],[1,\":\"],[13],[1,\"\\n        \"],[10,\"td\"],[12],[1,\"\\n         \"],[11,\"input\"],[16,\"checked\",[28,[30,0,[\"isMeasured\"]],[[30,1],[30,2],true],null]],[24,4,\"radio\"],[4,[38,2],[\"click\",[28,[37,3],[[30,0,[\"createMeasurement\"]],true,[30,2],[30,1]],null]],null],[12],[13],[1,\"\\n        \"],[13],[1,\"\\n        \"],[10,\"td\"],[12],[1,\"\\n          \"],[11,\"input\"],[16,\"checked\",[28,[30,0,[\"isMeasured\"]],[[30,1],[30,2],false],null]],[24,4,\"radio\"],[4,[38,2],[\"click\",[28,[37,3],[[30,0,[\"createMeasurement\"]],false,[30,2],[30,1]],null]],null],[12],[13],[1,\"\\n        \"],[13],[1,\"\\n      \"],[13],[1,\"\\n\"]],[2]],null],[1,\"  \"],[13],[1,\"\\n\"],[13],[1,\"\\n\"],[10,\"table\"],[14,0,\"form\"],[12],[1,\"\\n  \"],[10,\"thead\"],[12],[1,\"\\n    \"],[10,\"th\"],[12],[1,\"Type\"],[13],[1,\"\\n    \"],[10,\"th\"],[12],[1,\"Result\"],[13],[1,\"\\n    \"],[10,\"th\"],[12],[1,\"Time\"],[13],[1,\"\\n  \"],[13],[1,\"\\n  \"],[10,\"tbody\"],[12],[1,\"\\n    \"],[10,\"col\"],[12],[13],[1,\"\\n    \"],[10,\"col\"],[12],[13],[1,\"\\n    \"],[10,\"col\"],[12],[13],[1,\"\\n\"],[42,[28,[37,1],[[28,[37,1],[[30,1,[\"measurement\"]]],null]],null],null,[[[1,\"      \"],[10,\"tr\"],[12],[1,\"\\n        \"],[10,\"td\"],[12],[1,[30,3,[\"type\"]]],[13],[1,\"\\n        \"],[10,\"td\"],[12],[1,[30,3,[\"humanReadableResult\"]]],[13],[1,\"\\n        \"],[10,\"td\"],[12],[1,[28,[35,4],[[30,3,[\"datetime\"]],\"h:mm:ss a\"],null]],[13],[1,\"\\n      \"],[13],[1,\"\\n\"]],[3]],null],[1,\"  \"],[13],[1,\"\\n\"],[13],[1,\"\\n\"]],[\"@data\",\"measurement\",\"m\"],false,[\"each\",\"-track-array\",\"on\",\"fn\",\"moment-format\"]]",
    "moduleName": "mrg-sign-in/components/robot-measurement.hbs",
    "isStrictMode": false
  });
  function isMeasured(measurements, type,
  // Measurement type e.g. Mass, size, etc.
  registrationTime,
  // Time where measurements before are invalid.
  passed //are we looking for true or false?
  ) {
    let done = false;
    let result = false;
    let itemType = "";
    let foundMeasurements = false;
    let measurementsArray = measurements.slice().sortBy('datetime').reverse();
    measurementsArray.forEach(function (item, index, array) {
      if (!done) {
        let itemDatetime = item.datetime;
        if (itemDatetime < registrationTime) {
          done = true;
          foundMeasurements = false;
          (0, _debug.debug)("passedMeasurement: No current measurements found for " + type);
        } else {
          itemType = item.type;
          if (type === itemType) {
            result = Boolean(item.result);
            (0, _debug.debug)("passedMeasurement: Found: " + result + " for " + type);
            done = true;
            foundMeasurements = true;
          }
        }
      }
    });
    if (foundMeasurements) {
      return passed == result;
    } else {
      return false;
    }
  }
  let RobotMeasurementComponent = (_class = class RobotMeasurementComponent extends _component2.default {
    constructor(owner, args) {
      super(owner, args);
      _initializerDefineProperty(this, "store", _descriptor, this);
      _initializerDefineProperty(this, "Mass", _descriptor2, this);
      _initializerDefineProperty(this, "Size", _descriptor3, this);
      _initializerDefineProperty(this, "Scratch", _descriptor4, this);
      _initializerDefineProperty(this, "Time", _descriptor5, this);
      _initializerDefineProperty(this, "Deadman", _descriptor6, this);
      _initializerDefineProperty(this, "competition", _descriptor7, this);
      _initializerDefineProperty(this, "measurements", _descriptor8, this);
      this.competition = args.data.competition;
      this.measurements = args.data.measurement;
    }
    PopulateRadioBoxes(model) {
      (0, _debug.debug)("PopulateRadioBoxes fired");
      let registrationTime = this.competition.registrationTime;
      this.Mass = isMeasured(this.measurements, "Mass", registrationTime, true);
      this.Size = isMeasured(this.measurements, "Size", registrationTime, true);
      this.Scratch = isMeasured(this.measurements, "Scratch", registrationTime, true);
      this.Time = isMeasured(this.measurements, "Time", registrationTime, true);
      this.Deadman = isMeasured(this.measurements, "Deadman", registrationTime, true);
    }

    // This function is called by the radio boxes on the page to populate
    // their values.
    isMeasured(model, measurementName, value) {
      let registrationTime = model.competition.registrationTime;
      return isMeasured(model.measurement, measurementName, registrationTime, value);
    }

    // Get the measurements required for this entry based upon the competition
    // that is it registered in.

    get requiredMeasurements() {
      return this.requiredMeasurementsfn();
    }
    requiredMeasurementsfn() {
      let comp = this.competition;
      let measurements = [];
      if (comp !== undefined) {
        if (comp.measureMass) {
          measurements.push('Mass');
        }
        if (comp.measureSize) {
          measurements.push('Size');
        }
        if (comp.measureScratch) {
          measurements.push('Scratch');
        }
        if (comp.measureTime) {
          measurements.push('Time');
        }
        if (comp.measureDeadman) {
          measurements.push('Deadman');
        }
      }
      return measurements;
    }
    createMeasurement(value, type, robot) {
      (0, _debug.debug)("Logging " + type + " measurement of: " + value + " for robot " + robot.id);
      //this.set(type, value);
      let measurement = this.store.createRecord('measurement', {
        robot: robot,
        result: value,
        type: type.toString()
      });
      measurement.save().then(() => {
        measurement.reload();
        robot.reload();
      });
    }
  }, _descriptor = _applyDecoratedDescriptor(_class.prototype, "store", [_service.inject], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor2 = _applyDecoratedDescriptor(_class.prototype, "Mass", [_tracking.tracked], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function () {
      return false;
    }
  }), _descriptor3 = _applyDecoratedDescriptor(_class.prototype, "Size", [_tracking.tracked], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function () {
      return false;
    }
  }), _descriptor4 = _applyDecoratedDescriptor(_class.prototype, "Scratch", [_tracking.tracked], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function () {
      return false;
    }
  }), _descriptor5 = _applyDecoratedDescriptor(_class.prototype, "Time", [_tracking.tracked], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function () {
      return false;
    }
  }), _descriptor6 = _applyDecoratedDescriptor(_class.prototype, "Deadman", [_tracking.tracked], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function () {
      return false;
    }
  }), _descriptor7 = _applyDecoratedDescriptor(_class.prototype, "competition", [_tracking.tracked], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function () {
      return this.args.data.competition;
    }
  }), _descriptor8 = _applyDecoratedDescriptor(_class.prototype, "measurements", [_tracking.tracked], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function () {
      return this.args.data.measurement;
    }
  }), _applyDecoratedDescriptor(_class.prototype, "PopulateRadioBoxes", [_object.action], Object.getOwnPropertyDescriptor(_class.prototype, "PopulateRadioBoxes"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "createMeasurement", [_object.action], Object.getOwnPropertyDescriptor(_class.prototype, "createMeasurement"), _class.prototype), _class);
  _exports.default = RobotMeasurementComponent;
  (0, _component.setComponentTemplate)(__COLOCATED_TEMPLATE__, RobotMeasurementComponent);
});
;define("mrg-sign-in/components/robot-payment", ["exports", "@ember/component", "@ember/template-factory", "@glimmer/component", "@ember/object", "@glimmer/tracking", "@ember/service"], function (_exports, _component, _templateFactory, _component2, _object, _tracking, _service) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  var _class, _descriptor, _descriptor2, _descriptor3;
  0; //eaimeta@70e063a35619d71f0,"ember-cli-htmlbars",0,"@glimmer/component",0,"@ember/object",0,"@glimmer/tracking",0,"@ember/service"eaimeta@70e063a35619d71f
  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }
  function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
  function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
  function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }
  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'proposal-class-properties is enabled and runs after the decorators transform.'); }
  const __COLOCATED_TEMPLATE__ = (0, _templateFactory.createTemplateFactory)(
  /*
    <h3>Payment Information</h3>
  <table class="form">
    <tbody>
      <tr>
        <td>Invoiced:</td>
        <td colspan="2">{{@data.formattedInvoicedDollars}}</td>
      </tr>
      <tr>
        <td>Paid:</td>
        <td>
          <select {{on "change" (val (fn this.selectPaymentType))}} disabled={{this.paymentSelectDisabled}}>
            <option value="" selected={{eq @data.paymentType null}} disabled={{true}}>
              Select payment method
            </option>
            {{#each this.PaymentOptions as |o|}}
              <option value={{o}} selected={{eq @data.paymentType o}}>
                {{o}}
              </option>
            {{/each}}
          </select>
        </td>
        <td colspan="2">
          {{#if (eq @data.paymentType "INVOICED") }}
              Invoiced
          {{else if (eq @data.paymentType "COMPLEMENTARY")}}
              Complementary
          {{else if (not-eq @data.paymentType null)}}
            {{#if @data.isPaid}}
              {{@data.formattedPaidDollars}}
              <button {{on "click" (fn this.refund)}}>Refund</button>
            {{else}}
              <button {{on "click" (fn this.paid "10")}}>Paid $10.00</button><br>
              <button {{on "click" (fn this.paid "20")}}>Paid $20.00</button>
            {{/if}}
          {{/if}}
        </td>
      </tr>
      <tr>
        <td>On-time/Late:</td>
        <td>
          {{#if @data.late}}
            LATE
          {{else}}
            ON-TIME
          {{/if}}
        </td>
        <td></td>
      </tr>
    </tbody>
  </table>
  
  */
  {
    "id": "UQhbvTeO",
    "block": "[[[10,\"h3\"],[12],[1,\"Payment Information\"],[13],[1,\"\\n\"],[10,\"table\"],[14,0,\"form\"],[12],[1,\"\\n  \"],[10,\"tbody\"],[12],[1,\"\\n    \"],[10,\"tr\"],[12],[1,\"\\n      \"],[10,\"td\"],[12],[1,\"Invoiced:\"],[13],[1,\"\\n      \"],[10,\"td\"],[14,\"colspan\",\"2\"],[12],[1,[30,1,[\"formattedInvoicedDollars\"]]],[13],[1,\"\\n    \"],[13],[1,\"\\n    \"],[10,\"tr\"],[12],[1,\"\\n      \"],[10,\"td\"],[12],[1,\"Paid:\"],[13],[1,\"\\n      \"],[10,\"td\"],[12],[1,\"\\n        \"],[11,\"select\"],[16,\"disabled\",[30,0,[\"paymentSelectDisabled\"]]],[4,[38,0],[\"change\",[28,[37,1],[[28,[37,2],[[30,0,[\"selectPaymentType\"]]],null]],null]],null],[12],[1,\"\\n          \"],[10,\"option\"],[14,2,\"\"],[15,\"selected\",[28,[37,3],[[30,1,[\"paymentType\"]],null],null]],[15,\"disabled\",true],[12],[1,\"\\n            Select payment method\\n          \"],[13],[1,\"\\n\"],[42,[28,[37,5],[[28,[37,5],[[30,0,[\"PaymentOptions\"]]],null]],null],null,[[[1,\"            \"],[10,\"option\"],[15,2,[30,2]],[15,\"selected\",[28,[37,3],[[30,1,[\"paymentType\"]],[30,2]],null]],[12],[1,\"\\n              \"],[1,[30,2]],[1,\"\\n            \"],[13],[1,\"\\n\"]],[2]],null],[1,\"        \"],[13],[1,\"\\n      \"],[13],[1,\"\\n      \"],[10,\"td\"],[14,\"colspan\",\"2\"],[12],[1,\"\\n\"],[41,[28,[37,3],[[30,1,[\"paymentType\"]],\"INVOICED\"],null],[[[1,\"            Invoiced\\n\"]],[]],[[[41,[28,[37,3],[[30,1,[\"paymentType\"]],\"COMPLEMENTARY\"],null],[[[1,\"            Complementary\\n\"]],[]],[[[41,[28,[37,7],[[30,1,[\"paymentType\"]],null],null],[[[41,[30,1,[\"isPaid\"]],[[[1,\"            \"],[1,[30,1,[\"formattedPaidDollars\"]]],[1,\"\\n            \"],[11,\"button\"],[4,[38,0],[\"click\",[28,[37,2],[[30,0,[\"refund\"]]],null]],null],[12],[1,\"Refund\"],[13],[1,\"\\n\"]],[]],[[[1,\"            \"],[11,\"button\"],[4,[38,0],[\"click\",[28,[37,2],[[30,0,[\"paid\"]],\"10\"],null]],null],[12],[1,\"Paid $10.00\"],[13],[10,\"br\"],[12],[13],[1,\"\\n            \"],[11,\"button\"],[4,[38,0],[\"click\",[28,[37,2],[[30,0,[\"paid\"]],\"20\"],null]],null],[12],[1,\"Paid $20.00\"],[13],[1,\"\\n\"]],[]]],[1,\"        \"]],[]],null]],[]]]],[]]],[1,\"      \"],[13],[1,\"\\n    \"],[13],[1,\"\\n    \"],[10,\"tr\"],[12],[1,\"\\n      \"],[10,\"td\"],[12],[1,\"On-time/Late:\"],[13],[1,\"\\n      \"],[10,\"td\"],[12],[1,\"\\n\"],[41,[30,1,[\"late\"]],[[[1,\"          LATE\\n\"]],[]],[[[1,\"          ON-TIME\\n\"]],[]]],[1,\"      \"],[13],[1,\"\\n      \"],[10,\"td\"],[12],[13],[1,\"\\n    \"],[13],[1,\"\\n  \"],[13],[1,\"\\n\"],[13],[1,\"\\n\"]],[\"@data\",\"o\"],false,[\"on\",\"val\",\"fn\",\"eq\",\"each\",\"-track-array\",\"if\",\"not-eq\"]]",
    "moduleName": "mrg-sign-in/components/robot-payment.hbs",
    "isStrictMode": false
  });
  let RobotCheckinController = (_class = class RobotCheckinController extends _component2.default {
    //EmberSimpleAuthSession

    constructor(owner, args) {
      super(owner, args);
      _initializerDefineProperty(this, "session", _descriptor, this);
      _initializerDefineProperty(this, "store", _descriptor2, this);
      _initializerDefineProperty(this, "robot", _descriptor3, this);
      this.robot = this.args.data;
    }
    get PaymentOptions() {
      return ['CASH', 'INVOICED', 'CHEQUE', 'CREDIT CARD', 'COMPLEMENTARY'];
    }
    get paymentSelectDisabled() {
      return this.robot.isPaid && this.robot.paymentType !== 'INVOICED';
    }
    save() {
      this.robot.save();
    }
    paid(amount) {
      this.robot.paid = amount;
      this.robot.save();
      this.createLogEntry("PAID $" + amount + " " + this.robot.paymentType);
    }
    refund() {
      this.createLogEntry("REFUNDED $" + this.robot.paid + " " + this.robot.paymentType);
      this.robot.paid = 0.00;
      this.robot.paymentType = "UNPAID";
      this.robot.save();
    }
    selectPaymentType(value) {
      if (value === "INVOICED" && this.robot.paid > 0.0) {
        alert("This entry is marked as PAID. Please refund the money before" + " marking the entry as INVOICED.");
      } else if (value === "INVOICED") {
        this.robot.paymentType = value;
        this.createLogEntry("MARKED AS INVOICED");
      } else {
        this.robot.paymentType = value;
        this.robot.save();
      }
    }
    createLogEntry(action) {
      let store = this.store;
      let session = this.session;
      let record = store.createRecord('activity-log', {
        volunteer: session.data.authenticated.fullname,
        robot: this.robot,
        function: "PAYMENT",
        action: action
      });
      record.save();
    }
  }, _descriptor = _applyDecoratedDescriptor(_class.prototype, "session", [_service.inject], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor2 = _applyDecoratedDescriptor(_class.prototype, "store", [_service.inject], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor3 = _applyDecoratedDescriptor(_class.prototype, "robot", [_tracking.tracked], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _applyDecoratedDescriptor(_class.prototype, "save", [_object.action], Object.getOwnPropertyDescriptor(_class.prototype, "save"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "paid", [_object.action], Object.getOwnPropertyDescriptor(_class.prototype, "paid"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "refund", [_object.action], Object.getOwnPropertyDescriptor(_class.prototype, "refund"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "selectPaymentType", [_object.action], Object.getOwnPropertyDescriptor(_class.prototype, "selectPaymentType"), _class.prototype), _class);
  _exports.default = RobotCheckinController;
  (0, _component.setComponentTemplate)(__COLOCATED_TEMPLATE__, RobotCheckinController);
});
;define("mrg-sign-in/components/validated-input", ["exports", "@ember/component", "@ember/template-factory", "@ember/component/template-only"], function (_exports, _component, _templateFactory, _templateOnly) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  0; //eaimeta@70e063a35619d71f0,"ember-cli-htmlbars",0,"@ember/component/template-only"eaimeta@70e063a35619d71f
  const __COLOCATED_TEMPLATE__ = (0, _templateFactory.createTemplateFactory)(
  /*
    <Input
    @value={{get @changeset @propertyName}}
    @update={{action (changeset-set @changeset @propertyName)}}
    @class={{if (get @changeset.error @propertyName) "full-width-error" "full-width"}}
  />
  
  */
  {
    "id": "mmN13XJL",
    "block": "[[[8,[39,0],null,[[\"@value\",\"@update\",\"@class\"],[[28,[37,1],[[30,1],[30,2]],null],[28,[37,2],[[30,0],[28,[37,3],[[30,1],[30,2]],null]],null],[52,[28,[37,1],[[30,1,[\"error\"]],[30,2]],null],\"full-width-error\",\"full-width\"]]],null],[1,\"\\n\"]],[\"@changeset\",\"@propertyName\"],false,[\"input\",\"get\",\"action\",\"changeset-set\",\"if\"]]",
    "moduleName": "mrg-sign-in/components/validated-input.hbs",
    "isStrictMode": false
  });
  var _default = (0, _component.setComponentTemplate)(__COLOCATED_TEMPLATE__, (0, _templateOnly.default)());
  _exports.default = _default;
});
;define("mrg-sign-in/config/environment", [], function () {
  'use strict';

  0; //eaimeta@70e063a35619d71feaimeta@70e063a35619d71f
  module.exports = function (environment) {
    const ENV = {
      modulePrefix: 'my-app',
      environment,
      rootURL: '/',
      locationType: 'history',
      EmberENV: {
        EXTEND_PROTOTYPES: false,
        FEATURES: {
          // Here you can enable experimental features on an ember canary build
          // e.g. EMBER_NATIVE_DECORATOR_SUPPORT: true
        }
      },
      APP: {
        // Here you can pass flags/options to your application instance
        // when it is created
      }
    };
    if (environment === 'development') {
      // ENV.APP.LOG_RESOLVER = true;
      // ENV.APP.LOG_ACTIVE_GENERATION = true;
      // ENV.APP.LOG_TRANSITIONS = true;
      // ENV.APP.LOG_TRANSITIONS_INTERNAL = true;
      // ENV.APP.LOG_VIEW_LOOKUPS = true;
      ENV.APP.API_NAMESPACE = '';
    }
    if (environment === 'test') {
      // Testem prefers this...
      //ENV.locationType = 'none';

      // keep test console output quieter
      // ENV.APP.LOG_ACTIVE_GENERATION = false;
      // ENV.APP.LOG_VIEW_LOOKUPS = false;

      //ENV.APP.rootElement = '#ember-testing';
      //ENV.APP.autoboot = false;
      ENV.APP.API_NAMESPACE = 'api';
    }
    if (environment === 'production') {
      // here you can enable a production-specific feature
      ENV.APP.API_NAMESPACE = 'api';
    }
    return ENV;
  };
});
;define("mrg-sign-in/controllers/RefreshedController", ["exports", "@ember/controller", "@ember/service", "@ember/component/helper", "@ember/destroyable"], function (_exports, _controller, _service, _helper, _destroyable) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  var _class, _descriptor;
  0; //eaimeta@70e063a35619d71f0,"@ember/controller",0,"@ember/service",0,"@ember/component/helper",0,"@ember/destroyable"eaimeta@70e063a35619d71f
  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }
  function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
  function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
  function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }
  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'proposal-class-properties is enabled and runs after the decorators transform.'); }
  class Poll extends _helper.default {
    compute(_ref) {
      let [fn, interval] = _ref;
      let x = setInterval(fn, interval);
      (0, _destroyable.registerDestructor)(this, () => clearInterval(x));
    }
  }
  let RefreshedController = (_class = class RefreshedController extends _controller.default {
    constructor() {
      super(...arguments);
      _initializerDefineProperty(this, "router", _descriptor, this);
      _defineProperty(this, "poll", Poll);
      _defineProperty(this, "refreshData", () => {
        console.log('Fetching data.');
        this.router.refresh();
      });
    }
  }, _descriptor = _applyDecoratedDescriptor(_class.prototype, "router", [_service.service], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _class);
  _exports.default = RefreshedController;
});
;define("mrg-sign-in/controllers/application", ["exports", "@ember/service", "@ember/object", "@ember/controller"], function (_exports, _service, _object, _controller) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  var _class, _descriptor;
  0; //eaimeta@70e063a35619d71f0,"@ember/service",0,"@ember/object",0,"@ember/controller"eaimeta@70e063a35619d71f
  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }
  function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
  function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
  function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }
  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'proposal-class-properties is enabled and runs after the decorators transform.'); }
  let ApplicationController = (_class = class ApplicationController extends _controller.default {
    constructor() {
      super(...arguments);
      _initializerDefineProperty(this, "session", _descriptor, this);
    }
    //EmberSimpleAuthSession

    invalidateSession() {
      this.session.invalidate();
    }
  }, _descriptor = _applyDecoratedDescriptor(_class.prototype, "session", [_service.inject], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _applyDecoratedDescriptor(_class.prototype, "invalidateSession", [_object.action], Object.getOwnPropertyDescriptor(_class.prototype, "invalidateSession"), _class.prototype), _class);
  _exports.default = ApplicationController;
});
;define("mrg-sign-in/controllers/checkin", ["exports", "mrg-sign-in/controllers/RefreshedController"], function (_exports, _RefreshedController) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  0; //eaimeta@70e063a35619d71f0,"mrg-sign-in/controllers/RefreshedController"eaimeta@70e063a35619d71f
  class CheckInController extends _RefreshedController.default {
    get sortedAssignments() {
      return this.model.robot.slice().sortBy('name');
    }
  }
  _exports.default = CheckInController;
});
;define("mrg-sign-in/controllers/competitions/admin", ["exports", "@ember/object", "@ember/debug", "@ember/controller"], function (_exports, _object, _debug, _controller) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  var _class;
  0; //eaimeta@70e063a35619d71f0,"@ember/object",0,"@ember/debug",0,"@ember/controller"eaimeta@70e063a35619d71f
  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }
  let CompetitionAdminController = (_class = class CompetitionAdminController extends _controller.default {
    toggleMeasurement(competition, property) {
      (0, _debug.debug)('Entering toggleProperty!');
      let b = competition[property];
      (0, _debug.debug)('Setting ' + property + ' to ' + !b);
      competition[property] = !b;
      competition.save();
    }
    resetMeasurementTime(model) {
      let ok = confirm("This will cause all robot in this competition to be " + "marked as &quot;not measured&quot; and set the competition " + "'Measurement Start Time'; to right now. This is useful when " + "a reweigh of robots is required.");

      // let robots = model.robot;
      // robots.forEach((item) => {
      //   debug("setting meausured of " + item.name + " to false");
      //   item.set('measured', false);
      //   item.save();
      // });

      model.set('registrationTime', "now()");
      model.save().then(() => {
        model.reload();
      });
    }
    save(changeset) {
      changeset.save();
    }
    rollback(changeset) {
      changeset.rollback();
    }
  }, _applyDecoratedDescriptor(_class.prototype, "toggleMeasurement", [_object.action], Object.getOwnPropertyDescriptor(_class.prototype, "toggleMeasurement"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "resetMeasurementTime", [_object.action], Object.getOwnPropertyDescriptor(_class.prototype, "resetMeasurementTime"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "save", [_object.action], Object.getOwnPropertyDescriptor(_class.prototype, "save"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "rollback", [_object.action], Object.getOwnPropertyDescriptor(_class.prototype, "rollback"), _class.prototype), _class);
  _exports.default = CompetitionAdminController;
});
;define("mrg-sign-in/controllers/competitions/show", ["exports", "@glimmer/tracking", "@ember/service", "mrg-sign-in/controllers/RefreshedController"], function (_exports, _tracking, _service, _RefreshedController) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  var _class, _descriptor, _descriptor2, _descriptor3;
  0; //eaimeta@70e063a35619d71f0,"@glimmer/tracking",0,"@ember/service",0,"mrg-sign-in/controllers/RefreshedController"eaimeta@70e063a35619d71f
  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }
  function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
  function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
  function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }
  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'proposal-class-properties is enabled and runs after the decorators transform.'); }
  let CompetitionShowController = (_class = class CompetitionShowController extends _RefreshedController.default {
    constructor() {
      super(...arguments);
      _initializerDefineProperty(this, "store", _descriptor, this);
      _defineProperty(this, "queryParams", ['robotFilter']);
      _initializerDefineProperty(this, "robotFilter", _descriptor2, this);
      _initializerDefineProperty(this, "model", _descriptor3, this);
    }
    get filteredRobotsByName() {
      let robots = this.store.peekAll('robot').slice();
      ;
      let robotFilter = this.robotFilter;
      let returnRobots = robots.sortBy('registered');
      let competitionId = this.model.id;
      returnRobots = returnRobots.filter(robot => {
        return robot.competition.name === competitionId;
      });
      if (robotFilter && robotFilter.length > 1) {
        let regex = new RegExp(robotFilter, "i");
        return returnRobots.filter(robot => {
          return regex.test(robot.name);
        });
      } else {
        return returnRobots;
      }
    }
  }, _descriptor = _applyDecoratedDescriptor(_class.prototype, "store", [_service.service], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor2 = _applyDecoratedDescriptor(_class.prototype, "robotFilter", [_tracking.tracked], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function () {
      return "";
    }
  }), _descriptor3 = _applyDecoratedDescriptor(_class.prototype, "model", [_tracking.tracked], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _class);
  _exports.default = CompetitionShowController;
});
;define("mrg-sign-in/controllers/login", ["exports", "@ember/service", "@ember/object", "@ember/controller"], function (_exports, _service, _object, _controller) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  var _class, _descriptor;
  0; //eaimeta@70e063a35619d71f0,"@ember/service",0,"@ember/object",0,"@ember/controller"eaimeta@70e063a35619d71f
  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }
  function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
  function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
  function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }
  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'proposal-class-properties is enabled and runs after the decorators transform.'); }
  let loginComponent = (_class = class loginComponent extends _controller.default {
    constructor() {
      super(...arguments);
      _initializerDefineProperty(this, "session", _descriptor, this);
      //EmberSimpleAuthSession
      _defineProperty(this, "identification", "");
    }
    async authenticate() {
      try {
        await this.session.authenticate('authenticator:simple', this.identification);
      } catch (error) {
        let errorMessage = error;
      }

      // if (this.session.isAuthenticated) {
      //   // What to do with all this success?
      // }
    }
    invalidateSession() {
      this.session.invalidate();
    }
  }, _descriptor = _applyDecoratedDescriptor(_class.prototype, "session", [_service.inject], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _applyDecoratedDescriptor(_class.prototype, "authenticate", [_object.action], Object.getOwnPropertyDescriptor(_class.prototype, "authenticate"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "invalidateSession", [_object.action], Object.getOwnPropertyDescriptor(_class.prototype, "invalidateSession"), _class.prototype), _class);
  _exports.default = loginComponent;
});
;define("mrg-sign-in/controllers/ring-assignments", ["exports", "mrg-sign-in/controllers/RefreshedController"], function (_exports, _RefreshedController) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  0; //eaimeta@70e063a35619d71f0,"mrg-sign-in/controllers/RefreshedController"eaimeta@70e063a35619d71f
  class RingAssignmentController extends _RefreshedController.default {
    get sortedAssignments() {
      return this.model.ringAssignment.slice().sortBy('robot.name');
    }
  }
  _exports.default = RingAssignmentController;
});
;define("mrg-sign-in/controllers/robocritter-certificate", ["exports", "@ember/controller", "@ember/object", "@glimmer/tracking"], function (_exports, _controller, _object, _tracking) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  var _class, _descriptor, _descriptor2, _descriptor3, _descriptor4;
  0; //eaimeta@70e063a35619d71f0,"@ember/controller",0,"@ember/object",0,"@glimmer/tracking"eaimeta@70e063a35619d71f
  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }
  function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
  function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
  function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }
  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'proposal-class-properties is enabled and runs after the decorators transform.'); }
  let RobocritterCertificateController = (_class = class RobocritterCertificateController extends _controller.default {
    constructor() {
      super(...arguments);
      _initializerDefineProperty(this, "minutes", _descriptor, this);
      _initializerDefineProperty(this, "seconds", _descriptor2, this);
      _initializerDefineProperty(this, "player", _descriptor3, this);
      _initializerDefineProperty(this, "robot", _descriptor4, this);
    }
    async downloadCertificate() {
      const response = await fetch('http://127.0.0.1:5000/api/generate-certificate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          player: this.player,
          robot: this.robot,
          minutes: this.minutes,
          seconds: this.seconds
        })
      });
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'certificate.odg';
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      } else {
        alert('Failed to generate the certificate');
      }
    }
  }, _descriptor = _applyDecoratedDescriptor(_class.prototype, "minutes", [_tracking.tracked], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function () {
      return 0;
    }
  }), _descriptor2 = _applyDecoratedDescriptor(_class.prototype, "seconds", [_tracking.tracked], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function () {
      return 0;
    }
  }), _descriptor3 = _applyDecoratedDescriptor(_class.prototype, "player", [_tracking.tracked], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function () {
      return "";
    }
  }), _descriptor4 = _applyDecoratedDescriptor(_class.prototype, "robot", [_tracking.tracked], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function () {
      return "";
    }
  }), _applyDecoratedDescriptor(_class.prototype, "downloadCertificate", [_object.action], Object.getOwnPropertyDescriptor(_class.prototype, "downloadCertificate"), _class.prototype), _class);
  _exports.default = RobocritterCertificateController;
});
;define("mrg-sign-in/controllers/robots/bulk-payment", ["exports", "@ember/object", "@ember/debug", "mrg-sign-in/controllers/RefreshedController"], function (_exports, _object, _debug, _RefreshedController) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  var _class;
  0; //eaimeta@70e063a35619d71f0,"@ember/object",0,"@ember/debug",0,"mrg-sign-in/controllers/RefreshedController"eaimeta@70e063a35619d71f
  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }
  //Good checkbox model described here:
  //https://codeflip.przepiora.ca/blog/2014/05/22/ember-js-recipes-checkboxable-index-pages-using-itemcontroller/
  //and here:
  //https://alexdiliberto.com/posts/ember-toggle-all-checkbox/
  //but both ObjectController and ArrayController are depreciated/superceded by controller
  //so that sucks.
  let RobotBulkPaymentController = (_class = class RobotBulkPaymentController extends _RefreshedController.default {
    get coaches() {
      let coaches = {};
      let robots = this.model;
      robots.forEach(robot => {
        if (coaches[robot.email] == null) {
          coaches[robot.email] = {};
          coaches[robot.email].entries = [];
          coaches[robot.email].name = robot.coach;
          coaches[robot.email].school = robot.school;
          coaches[robot.email].invoiced = 0.0;
          coaches[robot.email].email = robot.email;
        }
        coaches[robot.email].entries.push(robot);
        if (robot.paymentType === "INVOICED" && robot.participated) {
          coaches[robot.email].invoiced += robot.invoiced;
        }
      });
      return coaches;
    }
    invoiceAll(email) {
      (0, _debug.debug)("Invoicing all robots for " + email);
      let robots = this.model;
      robots.forEach(robot => {
        if (robot.email === email) {
          if (robot.paymentType === "UNPAID") {
            robot.paymentType = "INVOICED";
            robot.save();
          }
        }
      });
    }
  }, _applyDecoratedDescriptor(_class.prototype, "invoiceAll", [_object.action], Object.getOwnPropertyDescriptor(_class.prototype, "invoiceAll"), _class.prototype), _class);
  _exports.default = RobotBulkPaymentController;
});
;define("mrg-sign-in/controllers/robots/edit", ["exports", "@ember/controller", "@ember/object", "@ember/service", "mrg-sign-in/validations/robot"], function (_exports, _controller, _object, _service, _robot) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  var _class, _descriptor; // @ts-ignore - Looks like ember-changeset is still not typescriptified.
  0; //eaimeta@70e063a35619d71f0,"@ember/controller",0,"@ember/object",0,"@ember/service",0,"mrg-sign-in/validations/robot"eaimeta@70e063a35619d71f
  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }
  function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
  function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
  function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }
  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'proposal-class-properties is enabled and runs after the decorators transform.'); }
  let RobotEditController = (_class = class RobotEditController extends _controller.default {
    constructor() {
      super(...arguments);
      _initializerDefineProperty(this, "router", _descriptor, this);
      _defineProperty(this, "RobotValidation", _robot.default);
    }
    done(competition) {
      this.router.transitionTo('competitions.show', competition);
    }
    save(changeset) {
      changeset.save();
    }
    rollback(changeset) {
      changeset.rollback();
    }
  }, _descriptor = _applyDecoratedDescriptor(_class.prototype, "router", [_service.service], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _applyDecoratedDescriptor(_class.prototype, "done", [_object.action], Object.getOwnPropertyDescriptor(_class.prototype, "done"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "save", [_object.action], Object.getOwnPropertyDescriptor(_class.prototype, "save"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "rollback", [_object.action], Object.getOwnPropertyDescriptor(_class.prototype, "rollback"), _class.prototype), _class);
  _exports.default = RobotEditController;
  ;
});
;define("mrg-sign-in/controllers/robots/index", ["exports", "mrg-sign-in/controllers/RefreshedController", "@glimmer/tracking", "@ember/service"], function (_exports, _RefreshedController, _tracking, _service) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  var _class, _descriptor, _descriptor2, _descriptor3, _descriptor4;
  0; //eaimeta@70e063a35619d71f0,"mrg-sign-in/controllers/RefreshedController",0,"@glimmer/tracking",0,"@ember/service"eaimeta@70e063a35619d71f
  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }
  function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
  function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
  function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }
  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'proposal-class-properties is enabled and runs after the decorators transform.'); }
  //import { _teardownAJAXHooks } from '@ember/test-helpers/settled';

  function formatDollars(amount) {
    if (!isNaN(amount) && amount > 0) {
      return '$' + amount.toFixed(2);
    } else {
      return "";
    }
  }
  function getTotalDollars(items, property) {
    let total = 0.0;
    items.forEach(function (item) {
      total += Number(item.get(property));
    });
    return formatDollars(total);
  }
  let RobotIndexController = (_class = class RobotIndexController extends _RefreshedController.default {
    constructor() {
      super(...arguments);
      _initializerDefineProperty(this, "store", _descriptor, this);
      _defineProperty(this, "queryParams", ['schoolFilter', 'robotFilter', 'robotIDFilter']);
      _initializerDefineProperty(this, "schoolFilter", _descriptor2, this);
      _initializerDefineProperty(this, "robotFilter", _descriptor3, this);
      _initializerDefineProperty(this, "robotIDFilter", _descriptor4, this);
    }
    get filteredRobots() {
      let returnRobots = this.store.peekAll('robot').slice();
      let robotFilter = this.get('robotFilter');
      let schoolFilter = this.get('schoolFilter');
      let robotIDFilter = this.get('robotIDFilter');
      let regex;
      if (robotIDFilter && robotIDFilter.length > 2) {
        returnRobots = returnRobots.filter(function (i) {
          if (i.get('id') === robotIDFilter) {
            return true;
          } else {
            return false;
          }
        });
      } else {
        if (schoolFilter && schoolFilter.length > 1) {
          regex = new RegExp(schoolFilter, "i");
          returnRobots = returnRobots.filter(function (i) {
            let data = i.get('school');
            if (data === undefined) {
              return false;
            } else {
              return regex.test(data);
            }
          });
        }
        if (robotFilter && robotFilter.length > 1) {
          regex = new RegExp(robotFilter, "i");
          returnRobots = returnRobots.filter(function (i) {
            let data = i.get('name');
            if (data === undefined) {
              return false;
            } else {
              return regex.test(data);
            }
          });
        }
      }

      //Return the results of the two filters.
      return returnRobots;
    }
    get invoicedTotal() {
      let items = this.get('filteredRobots');
      return getTotalDollars(items, 'invoiced');
    }
    get paidTotal() {
      let items = this.get('filteredRobots');
      return getTotalDollars(items, 'paid');
    }
  }, _descriptor = _applyDecoratedDescriptor(_class.prototype, "store", [_service.service], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor2 = _applyDecoratedDescriptor(_class.prototype, "schoolFilter", [_tracking.tracked], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function () {
      return "";
    }
  }), _descriptor3 = _applyDecoratedDescriptor(_class.prototype, "robotFilter", [_tracking.tracked], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function () {
      return "";
    }
  }), _descriptor4 = _applyDecoratedDescriptor(_class.prototype, "robotIDFilter", [_tracking.tracked], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function () {
      return "";
    }
  }), _class);
  _exports.default = RobotIndexController;
});
;define("mrg-sign-in/controllers/robots/new", ["exports", "@ember/object", "@ember/debug", "@ember/service", "@ember/controller", "mrg-sign-in/validations/robot"], function (_exports, _object, _debug, _service, _controller, _robot) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  var _class, _descriptor, _descriptor2; //@ts-ignore
  0; //eaimeta@70e063a35619d71f0,"@ember/object",0,"@ember/debug",0,"@ember/service",0,"@ember/controller",0,"mrg-sign-in/validations/robot"eaimeta@70e063a35619d71f
  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }
  function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
  function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
  function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }
  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'proposal-class-properties is enabled and runs after the decorators transform.'); }
  let RobotNewController = (_class = class RobotNewController extends _controller.default {
    constructor() {
      super(...arguments);
      _initializerDefineProperty(this, "router", _descriptor, this);
      _initializerDefineProperty(this, "store", _descriptor2, this);
      _defineProperty(this, "queryParams", ['competition']);
      _defineProperty(this, "RobotValidation", new _robot.default());
    }
    save(changeset) {
      changeset.set('paid', 0);
      changeset.set('registered', "now()");
      let competitionId = changeset.get('competition');
      if (competitionId.id === "RC1") {
        changeset.set('invoiced', "5.00");
      } else {
        changeset.set('invoiced', "20.00");
      }
      const c = this.store.peekRecord('competition', competitionId.id);
      changeset.set('competition', c);
      changeset.save().then(() => {
        let id = changeset.get('id').toString();
        (0, _debug.debug)("Robot id: " + id);
        this.router.transitionTo('robots.edit', id);
      });
    }
  }, _descriptor = _applyDecoratedDescriptor(_class.prototype, "router", [_service.service], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor2 = _applyDecoratedDescriptor(_class.prototype, "store", [_service.service], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _applyDecoratedDescriptor(_class.prototype, "save", [_object.action], Object.getOwnPropertyDescriptor(_class.prototype, "save"), _class.prototype), _class);
  _exports.default = RobotNewController;
});
;define("mrg-sign-in/data-adapter", ["exports", "@ember-data/debug"], function (_exports, _debug) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function () {
      return _debug.default;
    }
  });
  0; //eaimeta@70e063a35619d71f0,"@ember-data/debug"eaimeta@70e063a35619d71f
});
;define("mrg-sign-in/helpers/-base", ["exports", "ember-moment/helpers/-base.js"], function (_exports, _base) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function () {
      return _base.default;
    }
  });
  0; //eaimeta@70e063a35619d71f0,"ember-moment/helpers/-base.js"eaimeta@70e063a35619d71f
});
;define("mrg-sign-in/helpers/and", ["exports", "ember-truth-helpers/helpers/and"], function (_exports, _and) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "and", {
    enumerable: true,
    get: function () {
      return _and.and;
    }
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function () {
      return _and.default;
    }
  });
  0; //eaimeta@70e063a35619d71f0,"ember-truth-helpers/helpers/and"eaimeta@70e063a35619d71f
});
;define("mrg-sign-in/helpers/app-version", ["exports", "@ember/component/helper", "mrg-sign-in/config/environment", "ember-cli-app-version/utils/regexp"], function (_exports, _helper, _environment, _regexp) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.appVersion = appVersion;
  _exports.default = void 0;
  0; //eaimeta@70e063a35619d71f0,"@ember/component/helper",0,"mrg-sign-in/config/environment",0,"ember-cli-app-version/utils/regexp"eaimeta@70e063a35619d71f
  function appVersion(_) {
    let hash = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    const version = _environment.default.APP.version;
    // e.g. 1.0.0-alpha.1+4jds75hf

    // Allow use of 'hideSha' and 'hideVersion' For backwards compatibility
    let versionOnly = hash.versionOnly || hash.hideSha;
    let shaOnly = hash.shaOnly || hash.hideVersion;
    let match = null;
    if (versionOnly) {
      if (hash.showExtended) {
        match = version.match(_regexp.versionExtendedRegExp); // 1.0.0-alpha.1
      }
      // Fallback to just version
      if (!match) {
        match = version.match(_regexp.versionRegExp); // 1.0.0
      }
    }
    if (shaOnly) {
      match = version.match(_regexp.shaRegExp); // 4jds75hf
    }
    return match ? match[0] : version;
  }
  var _default = (0, _helper.helper)(appVersion);
  _exports.default = _default;
});
;define("mrg-sign-in/helpers/changeset-get", ["exports", "ember-changeset/helpers/changeset-get"], function (_exports, _changesetGet) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function () {
      return _changesetGet.default;
    }
  });
  0; //eaimeta@70e063a35619d71f0,"ember-changeset/helpers/changeset-get"eaimeta@70e063a35619d71f
});
;define("mrg-sign-in/helpers/changeset-set", ["exports", "ember-changeset/helpers/changeset-set"], function (_exports, _changesetSet) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "changesetSet", {
    enumerable: true,
    get: function () {
      return _changesetSet.changesetSet;
    }
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function () {
      return _changesetSet.default;
    }
  });
  0; //eaimeta@70e063a35619d71f0,"ember-changeset/helpers/changeset-set"eaimeta@70e063a35619d71f
});
;define("mrg-sign-in/helpers/changeset", ["exports", "ember-changeset/helpers/changeset"], function (_exports, _changeset) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "changeset", {
    enumerable: true,
    get: function () {
      return _changeset.changeset;
    }
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function () {
      return _changeset.default;
    }
  });
  0; //eaimeta@70e063a35619d71f0,"ember-changeset/helpers/changeset"eaimeta@70e063a35619d71f
});
;define("mrg-sign-in/helpers/ensure-safe-component", ["exports", "@embroider/util"], function (_exports, _util) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function () {
      return _util.EnsureSafeComponentHelper;
    }
  });
  0; //eaimeta@70e063a35619d71f0,"@embroider/util"eaimeta@70e063a35619d71f
});
;define("mrg-sign-in/helpers/eq", ["exports", "ember-truth-helpers/helpers/eq"], function (_exports, _eq) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function () {
      return _eq.default;
    }
  });
  Object.defineProperty(_exports, "equal", {
    enumerable: true,
    get: function () {
      return _eq.equal;
    }
  });
  0; //eaimeta@70e063a35619d71f0,"ember-truth-helpers/helpers/eq"eaimeta@70e063a35619d71f
});
;define("mrg-sign-in/helpers/gt", ["exports", "ember-truth-helpers/helpers/gt"], function (_exports, _gt) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function () {
      return _gt.default;
    }
  });
  Object.defineProperty(_exports, "gt", {
    enumerable: true,
    get: function () {
      return _gt.gt;
    }
  });
  0; //eaimeta@70e063a35619d71f0,"ember-truth-helpers/helpers/gt"eaimeta@70e063a35619d71f
});
;define("mrg-sign-in/helpers/gte", ["exports", "ember-truth-helpers/helpers/gte"], function (_exports, _gte) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function () {
      return _gte.default;
    }
  });
  Object.defineProperty(_exports, "gte", {
    enumerable: true,
    get: function () {
      return _gte.gte;
    }
  });
  0; //eaimeta@70e063a35619d71f0,"ember-truth-helpers/helpers/gte"eaimeta@70e063a35619d71f
});
;define("mrg-sign-in/helpers/is-after", ["exports", "ember-moment/helpers/is-after.js"], function (_exports, _isAfter) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function () {
      return _isAfter.default;
    }
  });
  0; //eaimeta@70e063a35619d71f0,"ember-moment/helpers/is-after.js"eaimeta@70e063a35619d71f
});
;define("mrg-sign-in/helpers/is-array", ["exports", "ember-truth-helpers/helpers/is-array"], function (_exports, _isArray) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function () {
      return _isArray.default;
    }
  });
  Object.defineProperty(_exports, "isArray", {
    enumerable: true,
    get: function () {
      return _isArray.isArray;
    }
  });
  0; //eaimeta@70e063a35619d71f0,"ember-truth-helpers/helpers/is-array"eaimeta@70e063a35619d71f
});
;define("mrg-sign-in/helpers/is-before", ["exports", "ember-moment/helpers/is-before.js"], function (_exports, _isBefore) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function () {
      return _isBefore.default;
    }
  });
  0; //eaimeta@70e063a35619d71f0,"ember-moment/helpers/is-before.js"eaimeta@70e063a35619d71f
});
;define("mrg-sign-in/helpers/is-between", ["exports", "ember-moment/helpers/is-between.js"], function (_exports, _isBetween) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function () {
      return _isBetween.default;
    }
  });
  0; //eaimeta@70e063a35619d71f0,"ember-moment/helpers/is-between.js"eaimeta@70e063a35619d71f
});
;define("mrg-sign-in/helpers/is-empty", ["exports", "ember-truth-helpers/helpers/is-empty"], function (_exports, _isEmpty) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function () {
      return _isEmpty.default;
    }
  });
  0; //eaimeta@70e063a35619d71f0,"ember-truth-helpers/helpers/is-empty"eaimeta@70e063a35619d71f
});
;define("mrg-sign-in/helpers/is-equal", ["exports", "ember-truth-helpers/helpers/is-equal"], function (_exports, _isEqual) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function () {
      return _isEqual.default;
    }
  });
  Object.defineProperty(_exports, "isEqual", {
    enumerable: true,
    get: function () {
      return _isEqual.isEqual;
    }
  });
  0; //eaimeta@70e063a35619d71f0,"ember-truth-helpers/helpers/is-equal"eaimeta@70e063a35619d71f
});
;define("mrg-sign-in/helpers/is-same-or-after", ["exports", "ember-moment/helpers/is-same-or-after.js"], function (_exports, _isSameOrAfter) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function () {
      return _isSameOrAfter.default;
    }
  });
  0; //eaimeta@70e063a35619d71f0,"ember-moment/helpers/is-same-or-after.js"eaimeta@70e063a35619d71f
});
;define("mrg-sign-in/helpers/is-same-or-before", ["exports", "ember-moment/helpers/is-same-or-before.js"], function (_exports, _isSameOrBefore) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function () {
      return _isSameOrBefore.default;
    }
  });
  0; //eaimeta@70e063a35619d71f0,"ember-moment/helpers/is-same-or-before.js"eaimeta@70e063a35619d71f
});
;define("mrg-sign-in/helpers/is-same", ["exports", "ember-moment/helpers/is-same.js"], function (_exports, _isSame) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function () {
      return _isSame.default;
    }
  });
  0; //eaimeta@70e063a35619d71f0,"ember-moment/helpers/is-same.js"eaimeta@70e063a35619d71f
});
;define("mrg-sign-in/helpers/lt", ["exports", "ember-truth-helpers/helpers/lt"], function (_exports, _lt) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function () {
      return _lt.default;
    }
  });
  Object.defineProperty(_exports, "lt", {
    enumerable: true,
    get: function () {
      return _lt.lt;
    }
  });
  0; //eaimeta@70e063a35619d71f0,"ember-truth-helpers/helpers/lt"eaimeta@70e063a35619d71f
});
;define("mrg-sign-in/helpers/lte", ["exports", "ember-truth-helpers/helpers/lte"], function (_exports, _lte) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function () {
      return _lte.default;
    }
  });
  Object.defineProperty(_exports, "lte", {
    enumerable: true,
    get: function () {
      return _lte.lte;
    }
  });
  0; //eaimeta@70e063a35619d71f0,"ember-truth-helpers/helpers/lte"eaimeta@70e063a35619d71f
});
;define("mrg-sign-in/helpers/moment-add", ["exports", "ember-moment/helpers/moment-add.js"], function (_exports, _momentAdd) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function () {
      return _momentAdd.default;
    }
  });
  0; //eaimeta@70e063a35619d71f0,"ember-moment/helpers/moment-add.js"eaimeta@70e063a35619d71f
});
;define("mrg-sign-in/helpers/moment-calendar", ["exports", "ember-moment/helpers/moment-calendar.js"], function (_exports, _momentCalendar) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function () {
      return _momentCalendar.default;
    }
  });
  0; //eaimeta@70e063a35619d71f0,"ember-moment/helpers/moment-calendar.js"eaimeta@70e063a35619d71f
});
;define("mrg-sign-in/helpers/moment-diff", ["exports", "ember-moment/helpers/moment-diff.js"], function (_exports, _momentDiff) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function () {
      return _momentDiff.default;
    }
  });
  0; //eaimeta@70e063a35619d71f0,"ember-moment/helpers/moment-diff.js"eaimeta@70e063a35619d71f
});
;define("mrg-sign-in/helpers/moment-duration", ["exports", "ember-moment/helpers/moment-duration.js"], function (_exports, _momentDuration) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function () {
      return _momentDuration.default;
    }
  });
  0; //eaimeta@70e063a35619d71f0,"ember-moment/helpers/moment-duration.js"eaimeta@70e063a35619d71f
});
;define("mrg-sign-in/helpers/moment-format", ["exports", "ember-moment/helpers/moment-format.js"], function (_exports, _momentFormat) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function () {
      return _momentFormat.default;
    }
  });
  0; //eaimeta@70e063a35619d71f0,"ember-moment/helpers/moment-format.js"eaimeta@70e063a35619d71f
});
;define("mrg-sign-in/helpers/moment-from-now", ["exports", "ember-moment/helpers/moment-from-now.js"], function (_exports, _momentFromNow) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function () {
      return _momentFromNow.default;
    }
  });
  0; //eaimeta@70e063a35619d71f0,"ember-moment/helpers/moment-from-now.js"eaimeta@70e063a35619d71f
});
;define("mrg-sign-in/helpers/moment-from", ["exports", "ember-moment/helpers/moment-from.js"], function (_exports, _momentFrom) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function () {
      return _momentFrom.default;
    }
  });
  0; //eaimeta@70e063a35619d71f0,"ember-moment/helpers/moment-from.js"eaimeta@70e063a35619d71f
});
;define("mrg-sign-in/helpers/moment-subtract", ["exports", "ember-moment/helpers/moment-subtract.js"], function (_exports, _momentSubtract) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function () {
      return _momentSubtract.default;
    }
  });
  0; //eaimeta@70e063a35619d71f0,"ember-moment/helpers/moment-subtract.js"eaimeta@70e063a35619d71f
});
;define("mrg-sign-in/helpers/moment-to-date", ["exports", "ember-moment/helpers/moment-to-date.js"], function (_exports, _momentToDate) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function () {
      return _momentToDate.default;
    }
  });
  0; //eaimeta@70e063a35619d71f0,"ember-moment/helpers/moment-to-date.js"eaimeta@70e063a35619d71f
});
;define("mrg-sign-in/helpers/moment-to-now", ["exports", "ember-moment/helpers/moment-to-now.js"], function (_exports, _momentToNow) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function () {
      return _momentToNow.default;
    }
  });
  0; //eaimeta@70e063a35619d71f0,"ember-moment/helpers/moment-to-now.js"eaimeta@70e063a35619d71f
});
;define("mrg-sign-in/helpers/moment-to", ["exports", "ember-moment/helpers/moment-to.js"], function (_exports, _momentTo) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function () {
      return _momentTo.default;
    }
  });
  0; //eaimeta@70e063a35619d71f0,"ember-moment/helpers/moment-to.js"eaimeta@70e063a35619d71f
});
;define("mrg-sign-in/helpers/moment", ["exports", "ember-moment/helpers/moment.js"], function (_exports, _moment) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function () {
      return _moment.default;
    }
  });
  0; //eaimeta@70e063a35619d71f0,"ember-moment/helpers/moment.js"eaimeta@70e063a35619d71f
});
;define("mrg-sign-in/helpers/not-eq", ["exports", "ember-truth-helpers/helpers/not-eq"], function (_exports, _notEq) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function () {
      return _notEq.default;
    }
  });
  Object.defineProperty(_exports, "notEqualHelper", {
    enumerable: true,
    get: function () {
      return _notEq.notEqualHelper;
    }
  });
  0; //eaimeta@70e063a35619d71f0,"ember-truth-helpers/helpers/not-eq"eaimeta@70e063a35619d71f
});
;define("mrg-sign-in/helpers/not", ["exports", "ember-truth-helpers/helpers/not"], function (_exports, _not) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function () {
      return _not.default;
    }
  });
  Object.defineProperty(_exports, "not", {
    enumerable: true,
    get: function () {
      return _not.not;
    }
  });
  0; //eaimeta@70e063a35619d71f0,"ember-truth-helpers/helpers/not"eaimeta@70e063a35619d71f
});
;define("mrg-sign-in/helpers/now", ["exports", "ember-moment/helpers/now.js"], function (_exports, _now) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function () {
      return _now.default;
    }
  });
  0; //eaimeta@70e063a35619d71f0,"ember-moment/helpers/now.js"eaimeta@70e063a35619d71f
});
;define("mrg-sign-in/helpers/or", ["exports", "ember-truth-helpers/helpers/or"], function (_exports, _or) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function () {
      return _or.default;
    }
  });
  Object.defineProperty(_exports, "or", {
    enumerable: true,
    get: function () {
      return _or.or;
    }
  });
  0; //eaimeta@70e063a35619d71f0,"ember-truth-helpers/helpers/or"eaimeta@70e063a35619d71f
});
;define("mrg-sign-in/helpers/pluralize", ["exports", "ember-inflector/lib/helpers/pluralize"], function (_exports, _pluralize) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  0; //eaimeta@70e063a35619d71f0,"ember-inflector/lib/helpers/pluralize"eaimeta@70e063a35619d71f
  var _default = _pluralize.default;
  _exports.default = _default;
});
;define("mrg-sign-in/helpers/singularize", ["exports", "ember-inflector/lib/helpers/singularize"], function (_exports, _singularize) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  0; //eaimeta@70e063a35619d71f0,"ember-inflector/lib/helpers/singularize"eaimeta@70e063a35619d71f
  var _default = _singularize.default;
  _exports.default = _default;
});
;define("mrg-sign-in/helpers/unix", ["exports", "ember-moment/helpers/unix.js"], function (_exports, _unix) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function () {
      return _unix.default;
    }
  });
  0; //eaimeta@70e063a35619d71f0,"ember-moment/helpers/unix.js"eaimeta@70e063a35619d71f
});
;define("mrg-sign-in/helpers/utc", ["exports", "ember-moment/helpers/utc.js"], function (_exports, _utc) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function () {
      return _utc.default;
    }
  });
  0; //eaimeta@70e063a35619d71f0,"ember-moment/helpers/utc.js"eaimeta@70e063a35619d71f
});
;define("mrg-sign-in/helpers/val", ["exports", "@ember/component/helper"], function (_exports, _helper) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _exports.val = val;
  0; //eaimeta@70e063a35619d71f0,"@ember/component/helper"eaimeta@70e063a35619d71f
  //
  // export function val([fn] : [(arg: unknown) => void]/*, hash*/) {
  //   return (arg: { target: { value: unknown } }) => fn(arg.target.value)
  // }
  //

  function val(_ref /*, hash*/) {
    let [fn] = _ref;
    return arg => fn(arg.target.value);
  }
  var _default = (0, _helper.helper)(val);
  _exports.default = _default;
});
;define("mrg-sign-in/helpers/xor", ["exports", "ember-truth-helpers/helpers/xor"], function (_exports, _xor) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function () {
      return _xor.default;
    }
  });
  Object.defineProperty(_exports, "xor", {
    enumerable: true,
    get: function () {
      return _xor.xor;
    }
  });
  0; //eaimeta@70e063a35619d71f0,"ember-truth-helpers/helpers/xor"eaimeta@70e063a35619d71f
});
;define("mrg-sign-in/initializers/app-version", ["exports", "ember-cli-app-version/initializer-factory", "mrg-sign-in/config/environment"], function (_exports, _initializerFactory, _environment) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  0; //eaimeta@70e063a35619d71f0,"ember-cli-app-version/initializer-factory",0,"mrg-sign-in/config/environment"eaimeta@70e063a35619d71f
  let name, version;
  if (_environment.default.APP) {
    name = _environment.default.APP.name;
    version = _environment.default.APP.version;
  }
  var _default = {
    name: 'App Version',
    initialize: (0, _initializerFactory.default)(name, version)
  };
  _exports.default = _default;
});
;define("mrg-sign-in/initializers/container-debug-adapter", ["exports", "ember-resolver/resolvers/classic/container-debug-adapter"], function (_exports, _containerDebugAdapter) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  0; //eaimeta@70e063a35619d71f0,"ember-resolver/resolvers/classic/container-debug-adapter"eaimeta@70e063a35619d71f
  var _default = {
    name: 'container-debug-adapter',
    initialize() {
      let app = arguments[1] || arguments[0];
      app.register('container-debug-adapter:main', _containerDebugAdapter.default);
    }
  };
  _exports.default = _default;
});
;define("mrg-sign-in/initializers/ember-data-data-adapter", ["exports", "@ember-data/debug/setup"], function (_exports, _setup) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function () {
      return _setup.default;
    }
  });
  0; //eaimeta@70e063a35619d71f0,"@ember-data/debug/setup"eaimeta@70e063a35619d71f
});
;define("mrg-sign-in/initializers/ember-data", ["exports", "ember-data", "ember-data/setup-container"], function (_exports, _emberData, _setupContainer) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  0; //eaimeta@70e063a35619d71f0,"ember-data",0,"ember-data/setup-container"eaimeta@70e063a35619d71f
  /*
    This code initializes EmberData in an Ember application.
  */
  var _default = {
    name: 'ember-data',
    initialize: _setupContainer.default
  };
  _exports.default = _default;
});
;define("mrg-sign-in/initializers/ember-simple-auth", ["exports", "mrg-sign-in/config/environment", "ember-simple-auth/configuration", "ember-simple-auth/initializers/setup-session", "ember-simple-auth/initializers/setup-session-restoration", "ember-simple-auth/session-stores/adaptive", "ember-simple-auth/session-stores/local-storage", "ember-simple-auth/session-stores/cookie"], function (_exports, _environment, _configuration, _setupSession, _setupSessionRestoration, _adaptive, _localStorage, _cookie) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  0; //eaimeta@70e063a35619d71f0,"mrg-sign-in/config/environment",0,"ember-simple-auth/configuration",0,"ember-simple-auth/initializers/setup-session",0,"ember-simple-auth/initializers/setup-session-restoration",0,"ember-simple-auth/session-stores/adaptive",0,"ember-simple-auth/session-stores/local-storage",0,"ember-simple-auth/session-stores/cookie"eaimeta@70e063a35619d71f
  var _default = {
    name: 'ember-simple-auth',
    initialize(registry) {
      const config = _environment.default['ember-simple-auth'] || {};
      config.rootURL = _environment.default.rootURL || _environment.default.baseURL;
      _configuration.default.load(config);
      registry.register('session-store:adaptive', _adaptive.default);
      registry.register('session-store:cookie', _cookie.default);
      registry.register('session-store:local-storage', _localStorage.default);
      (0, _setupSession.default)(registry);
      (0, _setupSessionRestoration.default)(registry);
    }
  };
  _exports.default = _default;
});
;define("mrg-sign-in/instance-initializers/ember-data", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  0; //eaimeta@70e063a35619d71feaimeta@70e063a35619d71f
  /* exists only for things that historically used "after" or "before" */
  var _default = {
    name: 'ember-data',
    initialize() {}
  };
  _exports.default = _default;
});
;define("mrg-sign-in/instance-initializers/ember-simple-auth", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  0; //eaimeta@70e063a35619d71feaimeta@70e063a35619d71f
  // This is only needed for backwards compatibility and will be removed in the
  // next major release of ember-simple-auth. Unfortunately, there is no way to
  // deprecate this without hooking into Ember's internals…
  var _default = {
    name: 'ember-simple-auth',
    initialize() {}
  };
  _exports.default = _default;
});
;define("mrg-sign-in/models/activity-log", ["exports", "@ember-data/model"], function (_exports, _model) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  var _dec, _dec2, _dec3, _dec4, _dec5, _class, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5;
  0; //eaimeta@70e063a35619d71f0,"@ember-data/model"eaimeta@70e063a35619d71f
  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }
  function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
  function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
  function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }
  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'proposal-class-properties is enabled and runs after the decorators transform.'); }
  let ActivityLogModel = (_dec = (0, _model.attr)('date'), _dec2 = (0, _model.attr)('string'), _dec3 = (0, _model.attr)('string'), _dec4 = (0, _model.attr)('string'), _dec5 = (0, _model.belongsTo)('robot', {
    async: false,
    inverse: null
  }), _class = class ActivityLogModel extends _model.default {
    constructor() {
      super(...arguments);
      _initializerDefineProperty(this, "datetime", _descriptor, this);
      _initializerDefineProperty(this, "volunteer", _descriptor2, this);
      _initializerDefineProperty(this, "function", _descriptor3, this);
      _initializerDefineProperty(this, "action", _descriptor4, this);
      _initializerDefineProperty(this, "robot", _descriptor5, this);
    }
  }, _descriptor = _applyDecoratedDescriptor(_class.prototype, "datetime", [_dec], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor2 = _applyDecoratedDescriptor(_class.prototype, "volunteer", [_dec2], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor3 = _applyDecoratedDescriptor(_class.prototype, "function", [_dec3], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor4 = _applyDecoratedDescriptor(_class.prototype, "action", [_dec4], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor5 = _applyDecoratedDescriptor(_class.prototype, "robot", [_dec5], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _class);
  _exports.default = ActivityLogModel;
});
;define("mrg-sign-in/models/competition", ["exports", "@ember-data/model"], function (_exports, _model) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, _dec10, _dec11, _dec12, _dec13, _dec14, _dec15, _dec16, _class, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _descriptor6, _descriptor7, _descriptor8, _descriptor9, _descriptor10, _descriptor11, _descriptor12, _descriptor13, _descriptor14, _descriptor15, _descriptor16;
  0; //eaimeta@70e063a35619d71f0,"@ember-data/model"eaimeta@70e063a35619d71f
  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }
  function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
  function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
  function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }
  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'proposal-class-properties is enabled and runs after the decorators transform.'); }
  let CompetitionModel = (_dec = (0, _model.attr)('string'), _dec2 = (0, _model.attr)('string'), _dec3 = (0, _model.attr)('number'), _dec4 = (0, _model.attr)('number'), _dec5 = (0, _model.attr)('number'), _dec6 = (0, _model.attr)('date'), _dec7 = (0, _model.attr)('boolean'), _dec8 = (0, _model.attr)('boolean'), _dec9 = (0, _model.attr)('boolean'), _dec10 = (0, _model.attr)('boolean'), _dec11 = (0, _model.attr)('boolean'), _dec12 = (0, _model.attr)('number'), _dec13 = (0, _model.attr)('number'), _dec14 = (0, _model.attr)('number'), _dec15 = (0, _model.hasMany)('robot', {
    async: false,
    inverse: 'competition'
  }), _dec16 = (0, _model.hasMany)('ringAssignment', {
    async: false,
    inverse: 'competition'
  }), _class = class CompetitionModel extends _model.default {
    constructor() {
      super(...arguments);
      _initializerDefineProperty(this, "name", _descriptor, this);
      _initializerDefineProperty(this, "longName", _descriptor2, this);
      _initializerDefineProperty(this, "rings", _descriptor3, this);
      _initializerDefineProperty(this, "maxRobotsPerRing", _descriptor4, this);
      _initializerDefineProperty(this, "minRobotsPerRing", _descriptor5, this);
      _initializerDefineProperty(this, "registrationTime", _descriptor6, this);
      _initializerDefineProperty(this, "measureMass", _descriptor7, this);
      _initializerDefineProperty(this, "measureSize", _descriptor8, this);
      _initializerDefineProperty(this, "measureTime", _descriptor9, this);
      _initializerDefineProperty(this, "measureScratch", _descriptor10, this);
      _initializerDefineProperty(this, "measureDeadman", _descriptor11, this);
      _initializerDefineProperty(this, "maxEntries", _descriptor12, this);
      _initializerDefineProperty(this, "robotCount", _descriptor13, this);
      _initializerDefineProperty(this, "robotCheckedInCount", _descriptor14, this);
      _initializerDefineProperty(this, "robot", _descriptor15, this);
      _initializerDefineProperty(this, "ringAssignment", _descriptor16, this);
    }
    get unclaimedSpaces() {
      return this.maxEntries - this.robotCount;
    }

    //Determine the total number of available spaces including all spaces not signed in.
    get uncheckedinSpaces() {
      return this.maxEntries - this.robotCheckedInCount;
    }
  }, _descriptor = _applyDecoratedDescriptor(_class.prototype, "name", [_dec], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor2 = _applyDecoratedDescriptor(_class.prototype, "longName", [_dec2], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor3 = _applyDecoratedDescriptor(_class.prototype, "rings", [_dec3], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor4 = _applyDecoratedDescriptor(_class.prototype, "maxRobotsPerRing", [_dec4], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor5 = _applyDecoratedDescriptor(_class.prototype, "minRobotsPerRing", [_dec5], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor6 = _applyDecoratedDescriptor(_class.prototype, "registrationTime", [_dec6], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor7 = _applyDecoratedDescriptor(_class.prototype, "measureMass", [_dec7], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor8 = _applyDecoratedDescriptor(_class.prototype, "measureSize", [_dec8], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor9 = _applyDecoratedDescriptor(_class.prototype, "measureTime", [_dec9], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor10 = _applyDecoratedDescriptor(_class.prototype, "measureScratch", [_dec10], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor11 = _applyDecoratedDescriptor(_class.prototype, "measureDeadman", [_dec11], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor12 = _applyDecoratedDescriptor(_class.prototype, "maxEntries", [_dec12], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor13 = _applyDecoratedDescriptor(_class.prototype, "robotCount", [_dec13], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor14 = _applyDecoratedDescriptor(_class.prototype, "robotCheckedInCount", [_dec14], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor15 = _applyDecoratedDescriptor(_class.prototype, "robot", [_dec15], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor16 = _applyDecoratedDescriptor(_class.prototype, "ringAssignment", [_dec16], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _class);
  _exports.default = CompetitionModel;
});
;define("mrg-sign-in/models/match", ["exports", "@ember-data/model"], function (_exports, _model) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _class, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _descriptor6, _descriptor7;
  0; //eaimeta@70e063a35619d71f0,"@ember-data/model"eaimeta@70e063a35619d71f
  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }
  function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
  function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
  function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }
  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'proposal-class-properties is enabled and runs after the decorators transform.'); }
  let MatchModel = (_dec = (0, _model.attr)('number'), _dec2 = (0, _model.attr)('number'), _dec3 = (0, _model.belongsTo)('competition'), _dec4 = (0, _model.belongsTo)('robot', {
    async: true,
    inverse: null
  }), _dec5 = (0, _model.belongsTo)('robot', {
    async: true,
    inverse: null
  }), _dec6 = (0, _model.attr)('number'), _dec7 = (0, _model.attr)('number'), _class = class MatchModel extends _model.default {
    constructor() {
      super(...arguments);
      _initializerDefineProperty(this, "round", _descriptor, this);
      _initializerDefineProperty(this, "ring", _descriptor2, this);
      _initializerDefineProperty(this, "competition", _descriptor3, this);
      _initializerDefineProperty(this, "competitor1", _descriptor4, this);
      _initializerDefineProperty(this, "competitor2", _descriptor5, this);
      _initializerDefineProperty(this, "competitor1Wins", _descriptor6, this);
      _initializerDefineProperty(this, "competitor2Wins", _descriptor7, this);
    }
  }, _descriptor = _applyDecoratedDescriptor(_class.prototype, "round", [_dec], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor2 = _applyDecoratedDescriptor(_class.prototype, "ring", [_dec2], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor3 = _applyDecoratedDescriptor(_class.prototype, "competition", [_dec3], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor4 = _applyDecoratedDescriptor(_class.prototype, "competitor1", [_dec4], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor5 = _applyDecoratedDescriptor(_class.prototype, "competitor2", [_dec5], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor6 = _applyDecoratedDescriptor(_class.prototype, "competitor1Wins", [_dec6], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor7 = _applyDecoratedDescriptor(_class.prototype, "competitor2Wins", [_dec7], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _class);
  _exports.default = MatchModel;
});
;define("mrg-sign-in/models/measurement", ["exports", "@ember-data/model", "@ember/object"], function (_exports, _model, _object) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  var _dec, _dec2, _dec3, _dec4, _class, _descriptor, _descriptor2, _descriptor3, _descriptor4;
  0; //eaimeta@70e063a35619d71f0,"@ember-data/model",0,"@ember/object"eaimeta@70e063a35619d71f
  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }
  function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
  function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
  function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }
  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'proposal-class-properties is enabled and runs after the decorators transform.'); }
  let RobotMeasurementModel = (_dec = (0, _model.belongsTo)('robot', {
    async: false,
    inverse: 'measurement'
  }), _dec2 = (0, _model.attr)('boolean'), _dec3 = (0, _model.attr)('date'), _dec4 = (0, _model.attr)('string'), _class = class RobotMeasurementModel extends _model.default {
    constructor() {
      super(...arguments);
      _initializerDefineProperty(this, "robot", _descriptor, this);
      _initializerDefineProperty(this, "result", _descriptor2, this);
      _initializerDefineProperty(this, "datetime", _descriptor3, this);
      _initializerDefineProperty(this, "type", _descriptor4, this);
    }
    get humanReadableResult() {
      if ((0, _object.get)(this, 'result')) {
        return "Pass";
      } else {
        return "Fail";
      }
    }
  }, _descriptor = _applyDecoratedDescriptor(_class.prototype, "robot", [_dec], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor2 = _applyDecoratedDescriptor(_class.prototype, "result", [_dec2], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor3 = _applyDecoratedDescriptor(_class.prototype, "datetime", [_dec3], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor4 = _applyDecoratedDescriptor(_class.prototype, "type", [_dec4], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _class);
  _exports.default = RobotMeasurementModel;
  ;
});
;define("mrg-sign-in/models/ring-assignment", ["exports", "@ember-data/model"], function (_exports, _model) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  var _dec, _dec2, _dec3, _dec4, _class, _descriptor, _descriptor2, _descriptor3, _descriptor4;
  0; //eaimeta@70e063a35619d71f0,"@ember-data/model"eaimeta@70e063a35619d71f
  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }
  function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
  function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
  function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }
  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'proposal-class-properties is enabled and runs after the decorators transform.'); }
  let RingAssignmentModel = (_dec = (0, _model.belongsTo)('competition', {
    async: false,
    inverse: 'ringAssignment'
  }), _dec2 = (0, _model.belongsTo)('robot', {
    async: false,
    inverse: 'ringAssignment'
  }), _dec3 = (0, _model.attr)('number'), _dec4 = (0, _model.attr)('string'), _class = class RingAssignmentModel extends _model.default {
    constructor() {
      super(...arguments);
      _initializerDefineProperty(this, "competition", _descriptor, this);
      _initializerDefineProperty(this, "robot", _descriptor2, this);
      _initializerDefineProperty(this, "ring", _descriptor3, this);
      _initializerDefineProperty(this, "letter", _descriptor4, this);
    } //@attr('number') declare round?: number;
  }, _descriptor = _applyDecoratedDescriptor(_class.prototype, "competition", [_dec], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor2 = _applyDecoratedDescriptor(_class.prototype, "robot", [_dec2], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor3 = _applyDecoratedDescriptor(_class.prototype, "ring", [_dec3], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor4 = _applyDecoratedDescriptor(_class.prototype, "letter", [_dec4], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _class);
  _exports.default = RingAssignmentModel;
});
;define("mrg-sign-in/models/robot", ["exports", "@ember-data/model"], function (_exports, _model) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, _dec10, _dec11, _dec12, _dec13, _dec14, _dec15, _dec16, _dec17, _dec18, _dec19, _dec20, _dec21, _dec22, _class, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _descriptor6, _descriptor7, _descriptor8, _descriptor9, _descriptor10, _descriptor11, _descriptor12, _descriptor13, _descriptor14, _descriptor15, _descriptor16, _descriptor17, _descriptor18, _descriptor19, _descriptor20, _descriptor21, _descriptor22;
  0; //eaimeta@70e063a35619d71f0,"@ember-data/model"eaimeta@70e063a35619d71f
  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }
  function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
  function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
  function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }
  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'proposal-class-properties is enabled and runs after the decorators transform.'); }
  function formatDollars(amount) {
    amount = Number(amount);
    if (!isNaN(amount) && amount > 0) {
      return '$' + amount.toFixed(2);
    } else {
      return "";
    }
  }
  let RobotModel = (_dec = (0, _model.attr)('string'), _dec2 = (0, _model.attr)('string'), _dec3 = (0, _model.attr)('string'), _dec4 = (0, _model.attr)('string'), _dec5 = (0, _model.attr)('string'), _dec6 = (0, _model.attr)('string'), _dec7 = (0, _model.attr)('string'), _dec8 = (0, _model.attr)('string'), _dec9 = (0, _model.attr)('string'), _dec10 = (0, _model.attr)('string'), _dec11 = (0, _model.attr)('string'), _dec12 = (0, _model.attr)('number', {
    // amount the entry was invoiced.
    defaultValue: 0
  }), _dec13 = (0, _model.attr)('number', {
    // Amount entry paid.
    defaultValue: 0
  }), _dec14 = (0, _model.attr)('string', {
    // Unpaid / Cash / Credit Card / Cheque / Invoiced
    defaultValue: "UNPAID"
  }), _dec15 = (0, _model.attr)('date'), _dec16 = (0, _model.attr)('string', {
    // Checked-in / Withdrawn / Unknown
    defaultValue: "UNKNOWN"
  }), _dec17 = (0, _model.attr)('string', {
    // Checked-in / Withdrawn / Unknown
    defaultValue: "UNSEEN"
  }), _dec18 = (0, _model.attr)('boolean', {
    // Has the entry successfully completed measurement.
    defaultValue: false
  }), _dec19 = (0, _model.attr)('boolean', {
    // Has the entry been accepted for competition
    defaultValue: false
  }), _dec20 = (0, _model.hasMany)('measurement', {
    // All the measurements taken of this competitor.
    async: false,
    inverse: 'robot'
  }), _dec21 = (0, _model.belongsTo)('competition', {
    async: false,
    inverse: 'robot'
  }), _dec22 = (0, _model.belongsTo)('ringAssignment', {
    async: false,
    inverse: 'robot'
  }), _class = class RobotModel extends _model.default {
    constructor() {
      super(...arguments);
      // competitor information
      _initializerDefineProperty(this, "name", _descriptor, this);
      // Robot Name
      _initializerDefineProperty(this, "driver1", _descriptor2, this);
      // Driver1 name
      _initializerDefineProperty(this, "driver1gr", _descriptor3, this);
      // Driver 1 grade
      _initializerDefineProperty(this, "driver2", _descriptor4, this);
      // Driver 2 name
      _initializerDefineProperty(this, "driver2gr", _descriptor5, this);
      // Driver 2 grade
      _initializerDefineProperty(this, "driver3", _descriptor6, this);
      // Driver 3 name
      _initializerDefineProperty(this, "driver3gr", _descriptor7, this);
      // Driver 3 grade
      _initializerDefineProperty(this, "school", _descriptor8, this);
      // School
      _initializerDefineProperty(this, "coach", _descriptor9, this);
      // Coach's name
      _initializerDefineProperty(this, "email", _descriptor10, this);
      // Coach's email
      _initializerDefineProperty(this, "ph", _descriptor11, this);
      // Coach's phone #
      // Check-in information
      _initializerDefineProperty(this, "invoiced", _descriptor12, this);
      _initializerDefineProperty(this, "paid", _descriptor13, this);
      _initializerDefineProperty(this, "paymentType", _descriptor14, this);
      _initializerDefineProperty(this, "registered", _descriptor15, this);
      // Time the entry was created.
      _initializerDefineProperty(this, "checkInStatus", _descriptor16, this);
      _initializerDefineProperty(this, "slottedStatus", _descriptor17, this);
      _initializerDefineProperty(this, "measured", _descriptor18, this);
      _initializerDefineProperty(this, "participated", _descriptor19, this);
      _initializerDefineProperty(this, "measurement", _descriptor20, this);
      //: AsyncBelongsTo<RobotModel>;
      _initializerDefineProperty(this, "competition", _descriptor21, this);
      _initializerDefineProperty(this, "ringAssignment", _descriptor22, this);
    }
    get isPaid() {
      if (this.paid > 0.0 || this.paymentType === "INVOICED") {
        return true;
      } else {
        return false;
      }
    }
    get readyToCompete() {
      if (this.isPaid === true && this.measured === true) {
        if (this.slottedStatus === "CONFIRMED") {
          return "CONFIRMED";
        } else if (this.slottedStatus === "STANDBY") {
          return "STANDBY";
        }
      } else if (this.slottedStatus === "DECLINED") {
        return "DECLINED";
      }
      return "UNSEEN";
    }
    get isPayable() {
      let paid = this.paid;
      //let withdrawn = this.withdrawn;
      let withdrawn = this.checkInStatus === "WITHDRAWN";
      return (paid === null || paid === 0) && !withdrawn;
    }
    get formattedPaidDollars() {
      if (this.paymentType === "INVOICED") {
        return "INVOICED";
      } else {
        return formatDollars(this.paid);
      }
    }
    get formattedInvoicedDollars() {
      var invoiced = this.invoiced;
      return formatDollars(invoiced);
    }
    get formattedMeasured() {
      if (this.measured) {
        return "MEASURED";
      } else {
        return "";
      }
    }
  }, _descriptor = _applyDecoratedDescriptor(_class.prototype, "name", [_dec], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor2 = _applyDecoratedDescriptor(_class.prototype, "driver1", [_dec2], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor3 = _applyDecoratedDescriptor(_class.prototype, "driver1gr", [_dec3], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor4 = _applyDecoratedDescriptor(_class.prototype, "driver2", [_dec4], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor5 = _applyDecoratedDescriptor(_class.prototype, "driver2gr", [_dec5], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor6 = _applyDecoratedDescriptor(_class.prototype, "driver3", [_dec6], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor7 = _applyDecoratedDescriptor(_class.prototype, "driver3gr", [_dec7], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor8 = _applyDecoratedDescriptor(_class.prototype, "school", [_dec8], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor9 = _applyDecoratedDescriptor(_class.prototype, "coach", [_dec9], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor10 = _applyDecoratedDescriptor(_class.prototype, "email", [_dec10], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor11 = _applyDecoratedDescriptor(_class.prototype, "ph", [_dec11], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor12 = _applyDecoratedDescriptor(_class.prototype, "invoiced", [_dec12], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor13 = _applyDecoratedDescriptor(_class.prototype, "paid", [_dec13], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor14 = _applyDecoratedDescriptor(_class.prototype, "paymentType", [_dec14], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor15 = _applyDecoratedDescriptor(_class.prototype, "registered", [_dec15], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor16 = _applyDecoratedDescriptor(_class.prototype, "checkInStatus", [_dec16], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor17 = _applyDecoratedDescriptor(_class.prototype, "slottedStatus", [_dec17], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor18 = _applyDecoratedDescriptor(_class.prototype, "measured", [_dec18], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor19 = _applyDecoratedDescriptor(_class.prototype, "participated", [_dec19], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor20 = _applyDecoratedDescriptor(_class.prototype, "measurement", [_dec20], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor21 = _applyDecoratedDescriptor(_class.prototype, "competition", [_dec21], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor22 = _applyDecoratedDescriptor(_class.prototype, "ringAssignment", [_dec22], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _class);
  _exports.default = RobotModel;
});
;define("mrg-sign-in/modifiers/did-insert", ["exports", "@ember/render-modifiers/modifiers/did-insert"], function (_exports, _didInsert) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function () {
      return _didInsert.default;
    }
  });
  0; //eaimeta@70e063a35619d71f0,"@ember/render-modifiers/modifiers/did-insert"eaimeta@70e063a35619d71f
});
;define("mrg-sign-in/modifiers/did-update", ["exports", "@ember/render-modifiers/modifiers/did-update"], function (_exports, _didUpdate) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function () {
      return _didUpdate.default;
    }
  });
  0; //eaimeta@70e063a35619d71f0,"@ember/render-modifiers/modifiers/did-update"eaimeta@70e063a35619d71f
});
;define("mrg-sign-in/modifiers/will-destroy", ["exports", "@ember/render-modifiers/modifiers/will-destroy"], function (_exports, _willDestroy) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function () {
      return _willDestroy.default;
    }
  });
  0; //eaimeta@70e063a35619d71f0,"@ember/render-modifiers/modifiers/will-destroy"eaimeta@70e063a35619d71f
});
;define("mrg-sign-in/resolver", ["exports", "ember-resolver"], function (_exports, _emberResolver) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  0; //eaimeta@70e063a35619d71f0,"ember-resolver"eaimeta@70e063a35619d71f
  var _default = _emberResolver.default;
  _exports.default = _default;
});
;define("mrg-sign-in/router", ["exports", "@ember/routing/router", "mrg-sign-in/config/environment"], function (_exports, _router, _environment) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  0; //eaimeta@70e063a35619d71f0,"@ember/routing/router",0,"mrg-sign-in/config/environment"eaimeta@70e063a35619d71f
  function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
  function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
  function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
  class Router extends _router.default {
    constructor() {
      super(...arguments);
      //location = 'history';
      _defineProperty(this, "rootURL", _environment.default.rootURL);
    }
  }
  _exports.default = Router;
  Router.map(function () {
    this.route('login');
    this.route('robots', function () {
      this.route('edit', {
        path: '/:robot_id'
      });
      this.route('new');
      this.route('bulk-payment');
    });
    this.route('competitions', function () {
      this.route('show', {
        path: '/:competition_id'
      });
      this.route('admin', {
        path: '/:competition_id/admin'
      });
    });
    this.route('ring-assignments', {
      path: 'ring-assignments/:competition_id'
    });
    this.route('checkin', {
      path: 'checkin/:competition_id'
    });
    this.route('robot');
    this.route('log');
    this.route('robocritter-certificate');
  });
});
;define("mrg-sign-in/routes/application", ["exports", "@ember/routing/route", "@ember/service"], function (_exports, _route, _service) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  var _class, _descriptor;
  0; //eaimeta@70e063a35619d71f0,"@ember/routing/route",0,"@ember/service"eaimeta@70e063a35619d71f
  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }
  function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
  function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
  function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }
  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'proposal-class-properties is enabled and runs after the decorators transform.'); }
  let Application = (_class = class Application extends _route.default {
    constructor() {
      super(...arguments);
      _initializerDefineProperty(this, "session", _descriptor, this);
    }
    //EmberSimpleAuthSession

    beforemodel(transition) {
      super.beforeModel(transition);
      this.session.setup();
      this.session.requireAuthentication(transition, 'login');
    }
  }, _descriptor = _applyDecoratedDescriptor(_class.prototype, "session", [_service.inject], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _class);
  _exports.default = Application;
});
;define("mrg-sign-in/routes/checkin", ["exports", "@ember/service", "@ember/routing/route"], function (_exports, _service, _route) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  var _class, _descriptor;
  0; //eaimeta@70e063a35619d71f0,"@ember/service",0,"@ember/routing/route"eaimeta@70e063a35619d71f
  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }
  function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
  function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
  function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }
  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'proposal-class-properties is enabled and runs after the decorators transform.'); }
  let CheckinRoute = (_class = class CheckinRoute extends _route.default {
    constructor() {
      super(...arguments);
      _initializerDefineProperty(this, "store", _descriptor, this);
    }
    model(params) {
      return this.store.findRecord('competition', params.competition_id, {
        include: 'robot'
      });
    }
  }, _descriptor = _applyDecoratedDescriptor(_class.prototype, "store", [_service.inject], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _class);
  _exports.default = CheckinRoute;
});
;define("mrg-sign-in/routes/competitions/admin", ["exports", "@ember/routing/route", "@ember/service"], function (_exports, _route, _service) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  var _class, _descriptor;
  0; //eaimeta@70e063a35619d71f0,"@ember/routing/route",0,"@ember/service"eaimeta@70e063a35619d71f
  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }
  function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
  function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
  function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }
  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'proposal-class-properties is enabled and runs after the decorators transform.'); }
  let CompetitionAdminRoute = (_class = class CompetitionAdminRoute extends _route.default {
    constructor() {
      super(...arguments);
      _initializerDefineProperty(this, "store", _descriptor, this);
    }
    model(params) {
      let store = this.store;
      return store.findRecord('competition', params.competition_id, {
        include: 'robot'
      });
    }
  }, _descriptor = _applyDecoratedDescriptor(_class.prototype, "store", [_service.inject], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _class);
  _exports.default = CompetitionAdminRoute;
});
;define("mrg-sign-in/routes/competitions/show", ["exports", "@ember/routing/route", "@ember/service"], function (_exports, _route, _service) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  var _class, _descriptor;
  0; //eaimeta@70e063a35619d71f0,"@ember/routing/route",0,"@ember/service"eaimeta@70e063a35619d71f
  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }
  function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
  function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
  function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }
  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'proposal-class-properties is enabled and runs after the decorators transform.'); }
  let CompetitionShowRoute = (_class = class CompetitionShowRoute extends _route.default {
    constructor() {
      super(...arguments);
      _initializerDefineProperty(this, "store", _descriptor, this);
    }
    model(params) {
      return this.store.findRecord('competition', params.competition_id, {
        include: 'robot'
      });
    }
  }, _descriptor = _applyDecoratedDescriptor(_class.prototype, "store", [_service.service], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _class);
  _exports.default = CompetitionShowRoute;
});
;define("mrg-sign-in/routes/log", ["exports", "@ember/routing/route", "@ember/service", "rsvp"], function (_exports, _route, _service, _rsvp) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  var _class, _descriptor;
  0; //eaimeta@70e063a35619d71f0,"@ember/routing/route",0,"@ember/service",0,"rsvp"eaimeta@70e063a35619d71f
  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }
  function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
  function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
  function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }
  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'proposal-class-properties is enabled and runs after the decorators transform.'); }
  let LogRoute = (_class = class LogRoute extends _route.default {
    constructor() {
      super(...arguments);
      _initializerDefineProperty(this, "store", _descriptor, this);
    }
    async model() {
      return _rsvp.default.hash({
        competition: this.store.findAll('robot', {
          include: 'competition'
        })
      });
    }
  }, _descriptor = _applyDecoratedDescriptor(_class.prototype, "store", [_service.inject], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _class);
  _exports.default = LogRoute;
});
;define("mrg-sign-in/routes/login", ["exports", "@ember/routing/route"], function (_exports, _route) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  0; //eaimeta@70e063a35619d71f0,"@ember/routing/route"eaimeta@70e063a35619d71f
  class LoginRoute extends _route.default {}
  _exports.default = LoginRoute;
});
;define("mrg-sign-in/routes/ring-assignments", ["exports", "@ember/routing/route", "@ember/service"], function (_exports, _route, _service) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  var _class, _descriptor;
  0; //eaimeta@70e063a35619d71f0,"@ember/routing/route",0,"@ember/service"eaimeta@70e063a35619d71f
  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }
  function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
  function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
  function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }
  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'proposal-class-properties is enabled and runs after the decorators transform.'); }
  let RingAssignmentRoute = (_class = class RingAssignmentRoute extends _route.default {
    constructor() {
      super(...arguments);
      _initializerDefineProperty(this, "store", _descriptor, this);
    }
    model(params) {
      return this.store.findRecord('competition', params.competition_id, {
        include: 'robot, ringAssignment'
      });
    }
  }, _descriptor = _applyDecoratedDescriptor(_class.prototype, "store", [_service.inject], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _class);
  _exports.default = RingAssignmentRoute;
});
;define("mrg-sign-in/routes/robocritter-certificate", ["exports", "@ember/routing/route"], function (_exports, _route) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  0; //eaimeta@70e063a35619d71f0,"@ember/routing/route"eaimeta@70e063a35619d71f
  class RobocritterCertificateRoute extends _route.default {}
  _exports.default = RobocritterCertificateRoute;
});
;define("mrg-sign-in/routes/robots/bulk-payment", ["exports", "@ember/service", "@ember/routing/route"], function (_exports, _service, _route) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  var _class, _descriptor;
  0; //eaimeta@70e063a35619d71f0,"@ember/service",0,"@ember/routing/route"eaimeta@70e063a35619d71f
  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }
  function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
  function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
  function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }
  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'proposal-class-properties is enabled and runs after the decorators transform.'); }
  let RobotsBulkPaymentRoute = (_class = class RobotsBulkPaymentRoute extends _route.default {
    constructor() {
      super(...arguments);
      _initializerDefineProperty(this, "store", _descriptor, this);
    }
    model() {
      return this.store.findAll('robot', {
        include: 'competition'
      });
    }
  }, _descriptor = _applyDecoratedDescriptor(_class.prototype, "store", [_service.inject], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _class);
  _exports.default = RobotsBulkPaymentRoute;
});
;define("mrg-sign-in/routes/robots/edit", ["exports", "@ember/service", "rsvp", "@ember/routing/route"], function (_exports, _service, _rsvp, _route) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  var _class, _descriptor;
  0; //eaimeta@70e063a35619d71f0,"@ember/service",0,"rsvp",0,"@ember/routing/route"eaimeta@70e063a35619d71f
  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }
  function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
  function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
  function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }
  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'proposal-class-properties is enabled and runs after the decorators transform.'); }
  let RobotsEditRoute = (_class = class RobotsEditRoute extends _route.default {
    constructor() {
      super(...arguments);
      _initializerDefineProperty(this, "store", _descriptor, this);
    }
    async model(params) {
      return _rsvp.default.hash({
        competition: this.store.findAll('competition'),
        robot: this.store.findRecord('robot', params.robot_id, {
          include: 'competition, measurement'
        })
      });
    }
  }, _descriptor = _applyDecoratedDescriptor(_class.prototype, "store", [_service.service], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _class);
  _exports.default = RobotsEditRoute;
});
;define("mrg-sign-in/routes/robots/index", ["exports", "@ember/routing/route", "@ember/service"], function (_exports, _route, _service) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  var _class, _descriptor;
  0; //eaimeta@70e063a35619d71f0,"@ember/routing/route",0,"@ember/service"eaimeta@70e063a35619d71f
  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }
  function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
  function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
  function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }
  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'proposal-class-properties is enabled and runs after the decorators transform.'); }
  let RobotsIndexRoute = (_class = class RobotsIndexRoute extends _route.default {
    constructor() {
      super(...arguments);
      _initializerDefineProperty(this, "store", _descriptor, this);
    }
    model() {
      return this.store.findAll('robot', {
        include: 'competition'
      });
    }
  }, _descriptor = _applyDecoratedDescriptor(_class.prototype, "store", [_service.service], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _class);
  _exports.default = RobotsIndexRoute;
});
;define("mrg-sign-in/routes/robots/info", ["exports", "@ember/routing/route"], function (_exports, _route) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  0; //eaimeta@70e063a35619d71f0,"@ember/routing/route"eaimeta@70e063a35619d71f
  class RobotsInfoRoute extends _route.default {
    activate() {
      document.attr('title', 'Router Sheet');
    }
  }
  _exports.default = RobotsInfoRoute;
});
;define("mrg-sign-in/routes/robots/new", ["exports", "rsvp", "@ember/service", "@ember/routing/route"], function (_exports, _rsvp, _service, _route) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  var _class, _descriptor;
  0; //eaimeta@70e063a35619d71f0,"rsvp",0,"@ember/service",0,"@ember/routing/route"eaimeta@70e063a35619d71f
  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }
  function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
  function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
  function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }
  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'proposal-class-properties is enabled and runs after the decorators transform.'); }
  let RobotsNewRoute = (_class = class RobotsNewRoute extends _route.default {
    constructor() {
      super(...arguments);
      _initializerDefineProperty(this, "store", _descriptor, this);
    }
    async model(params) {
      let store = this.store;
      let robot = await store.createRecord('robot');
      let competitions = await store.findAll('competition');
      robot.competition = store.peekRecord('competition', params.competition);
      return (0, _rsvp.hash)({
        competitions: competitions,
        robot: robot
      });
    }
  }, _descriptor = _applyDecoratedDescriptor(_class.prototype, "store", [_service.inject], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _class);
  _exports.default = RobotsNewRoute;
});
;define("mrg-sign-in/serializers/-default", ["exports", "@ember-data/serializer/json"], function (_exports, _json) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function () {
      return _json.default;
    }
  });
  0; //eaimeta@70e063a35619d71f0,"@ember-data/serializer/json"eaimeta@70e063a35619d71f
});
;define("mrg-sign-in/serializers/-json-api", ["exports", "@ember-data/serializer/json-api"], function (_exports, _jsonApi) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function () {
      return _jsonApi.default;
    }
  });
  0; //eaimeta@70e063a35619d71f0,"@ember-data/serializer/json-api"eaimeta@70e063a35619d71f
});
;define("mrg-sign-in/serializers/-rest", ["exports", "@ember-data/serializer/rest"], function (_exports, _rest) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function () {
      return _rest.default;
    }
  });
  0; //eaimeta@70e063a35619d71f0,"@ember-data/serializer/rest"eaimeta@70e063a35619d71f
});
;define("mrg-sign-in/serializers/application", ["exports", "mrg-sign-in/serializers/postgrestSerializer"], function (_exports, _postgrestSerializer) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  0; //eaimeta@70e063a35619d71f0,"mrg-sign-in/serializers/postgrestSerializer"eaimeta@70e063a35619d71f
  class Serializer extends _postgrestSerializer.default {}
  _exports.default = Serializer;
});
;define("mrg-sign-in/serializers/postgrestSerializer", ["exports", "ember-data/serializer", "@ember/service"], function (_exports, _serializer, _service) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  var _class, _descriptor;
  0; //eaimeta@70e063a35619d71f0,"ember-data/serializer",0,"@ember/service"eaimeta@70e063a35619d71f
  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }
  function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
  function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
  function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }
  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'proposal-class-properties is enabled and runs after the decorators transform.'); }
  let PostgresSerializer = (_class = class PostgresSerializer extends _serializer.default {
    constructor() {
      super(...arguments);
      _initializerDefineProperty(this, "store", _descriptor, this);
    }
    //Overrideing the serializeAttibute so that only dirty data is written
    //Back to the database. snippet stolen from:
    //https://emberigniter.com/saving-only-dirty-attributes/

    // serializeAttribute(
    //   snapshot,
    //   json,
    //   key,
    //   attributes
    // ) {
    //     if (snapshot.record.get('isNew') || snapshot.changedAttributes()[key]) {
    //         super.serializeAttribute(...arguments);
    //     }
    // }

    parseIncludedRecord(data, thisType, parentType, entry, included) {
      let model = this.store.modelFor(thisType);
      let o = this.parseRecord(entry, thisType, parentType, model);

      // Since we're not at the top level, any data returned needs
      // to go onto the included array, as it's not the *primary* data.
      // Note that we cannot use Array.concat here has it makes a new
      // array object which is not passed back to the calling function.
      if (o['data']['id'] !== undefined) {
        included.push(o['data']);

        // Because we are not at the top level of the JSON:API document
        // push the return relationshuip to the relationships element.
        data['relationships'][thisType]['data'].push(o['relationshipData']);
      }
    }
    parseRecord(payload, thisType, parentType, model) {
      let included = [];
      let relationshipData = {};
      let data = {};
      let resourceHash = {};
      let parentHash = {};
      data['id'] = payload['id'].toString();
      data['type'] = thisType;
      data['attributes'] = {};
      data['relationships'] = {};
      relationshipData = {
        'type': thisType,
        'id': payload['id']
      };
      model.eachRelationship((name, descriptor) => {
        resourceHash[name] = descriptor.kind;
      });
      for (const key in payload) {
        if ((Array.isArray(payload[key]) || typeof payload[key] === 'object') && payload[key] !== null) {
          // This is an array of objects.
          // It will need to be captured as a 'included' and 'relationships'.
          // information.
          data['relationships'][key] = {};
          data['relationships'][key]['data'] = [];
          if (Array.isArray(payload[key])) {
            // Deal with an array of items. This will be a hasMany relationship.
            payload[key].forEach(entry => {
              this.parseIncludedRecord(data, key, thisType, entry, included);
            });
          } else if (typeof payload[key] === 'object') {
            // Deal with a singular item. Will be a belongsTo relationship.
            this.parseIncludedRecord(data, key, thisType, payload[key], included);
            // Make it a single Object as this is a belongsTo relationship.
            data['relationships'][key]['data'] = data['relationships'][key]['data'][0];
          }

          // Deal with the relationships returned value.
          if (Array.isArray(data['relationships'][key]['data'])) {
            if (data['relationships'][key]['data'].length === 0) {
              // delete it if there's nothing in there.
              delete data['relationships'][key];
            }
          }
        } else if (key !== 'id' && key !== thisType && key !== parentType) {
          if (resourceHash[key] === 'belongsTo') {
            data['relationships'][key] = {};
            data['relationships'][key]['data'] = {};
            data['relationships'][key]['data']['id'] = payload[key];
            data['relationships'][key]['data']['type'] = key;
          } else if (resourceHash[key] === 'hasMany') {
            // TODO:
            // Need to see an example of how postgrest populates this.
            // Not used so far.
          } else {
            // Just a regular attribute. Populate the 'attributes' element.
            data['attributes'][key] = payload[key];
          }
        }
      }

      // tidy up the relationships array.
      if (Object.keys(data['relationships']).length === 0) {
        delete data['relationships'];
      }
      const return_data = {
        'data': data,
        'included': included,
        'relationshipData': relationshipData
      };
      return return_data;
    }
    reformatPayload(primaryModelClass, payload, requestType) {
      //debugger;
      let data = [];
      let included = [];

      // this populates the top level of the JSON:API responce, which does
      // not have a 'relationships' key. 'relationships' only exist as children
      // of data objects.
      payload.forEach(item => {
        let o = this.parseRecord(item, primaryModelClass.modelName.toString(),
        // thisType,
        "",
        // ParentType
        primaryModelClass // Model
        );

        // push the gathered item into the 'data' array.
        data.push(o['data']);

        //merge included and o['included'] removing any duplicates.
        o['included'].forEach(a => {
          let found = false;
          included.every(b => {
            if (a['id'] === b['id'] && a['type'] === b['type']) {
              found = true;
              return false;
            } else {
              return true;
            }
          });

          // The item was not located, add it to included.
          if (!found) {
            included.push(a);
          }
        });

        // Ignore relationships as that is only to be included within
        // specific items.
      });

      // Start building the final object to return.
      let payload_rtn = {};

      // populate the mandatory 'meta' field.
      payload_rtn['meta'] = {};

      // populate the 'data' field.
      if (requestType === "findRecord" || data.length === 1) {
        payload_rtn['data'] = data[0];
      } else {
        payload_rtn['data'] = data;
      }

      // only include the 'included' key if there is at least one item.
      if (included.length === 1) {
        payload_rtn['included'] = included[0];
      } else if (included.length > 1) {
        payload_rtn['included'] = included;
      }
      //debugger;
      return payload_rtn;
    }
    normalizeResponse(store, primaryModelClass, payload, id, requestType) {
      return this.reformatPayload(primaryModelClass, payload, requestType);
    }
    serialize(snapshot, options) {
      let data = {};
      if (options && options['includeId']) {
        const id = snapshot.id;
        if (id) {
          data['id'] = id;
        }
      }

      // load up the attributes
      snapshot.eachAttribute((key, attribute) => {
        if (snapshot.record.get('isNew') || snapshot.changedAttributes()[key.toString()]) {
          let value = snapshot.attr(key);
          if (value === null) {
            value = null;
          } else if (typeof value === 'boolean') {
            if (value) value = 1;else value = 0;
          }
          if (value !== null) {
            data[key.toString()] = value;
          }
        }
      });

      // populate the belongsTo relationships
      snapshot.eachRelationship((key, relationship) => {
        if (relationship.kind === 'belongsTo') {
          if (snapshot.record.get('isNew') || snapshot.changedAttributes()[key.toString()]) {
            let belongsToId = snapshot.belongsTo(key, {
              id: true
            });
            data[key.toString()] = belongsToId;
          }

          // if provided, use the mapping provided by `attrs` in
          // the serializer
          //let schema = this.store.modelFor(snapshot.modelName);
          // let payloadKey = this._getMappedKey(key, schema);
          // if (payloadKey === key && this.keyForRelationship) {
          //   payloadKey = this.keyForRelationship(key, 'belongsTo', 'serialize');
          // }

          // //Need to check whether the id is there for new&async records
          // if (isNone(belongsToId)) {
          //   json[payloadKey] = null;
          // } else {
          //   json[payloadKey] = belongsToId;
          // }

          // if (relationship.options.polymorphic) {
          //   this.serializePolymorphicType(snapshot, json, relationship);
          // }
          // } else if (relationship.kind === 'hasMany') {
          //   //this.serializeHasMany(snapshot, json, relationship);
          // }
        }
      });
      return data;
    }
  }, _descriptor = _applyDecoratedDescriptor(_class.prototype, "store", [_service.service], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _class);
  _exports.default = PostgresSerializer;
});
;define("mrg-sign-in/services/-ensure-registered", ["exports", "@embroider/util/services/ensure-registered"], function (_exports, _ensureRegistered) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function () {
      return _ensureRegistered.default;
    }
  });
  0; //eaimeta@70e063a35619d71f0,"@embroider/util/services/ensure-registered"eaimeta@70e063a35619d71f
});
;define("mrg-sign-in/services/cookies", ["exports", "ember-cookies/services/cookies"], function (_exports, _cookies) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  0; //eaimeta@70e063a35619d71f0,"ember-cookies/services/cookies"eaimeta@70e063a35619d71f
  var _default = _cookies.default;
  _exports.default = _default;
});
;define("mrg-sign-in/services/current-user", ["exports", "@ember/service", "@ember/utils", "rsvp"], function (_exports, _service, _utils, _rsvp) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  var _class, _descriptor, _descriptor2;
  0; //eaimeta@70e063a35619d71f0,"@ember/service",0,"@ember/service",0,"@ember/utils",0,"rsvp"eaimeta@70e063a35619d71f
  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }
  function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
  function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
  function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }
  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'proposal-class-properties is enabled and runs after the decorators transform.'); }
  let CurrentUserService = (_class = class CurrentUserService extends _service.default {
    constructor() {
      super(...arguments);
      _initializerDefineProperty(this, "session", _descriptor, this);
      _initializerDefineProperty(this, "store", _descriptor2, this);
    }
    load() {
      this.session.setup();
      let userId = this.get('session.data.authenticated.user_id');
      if (!(0, _utils.isEmpty)(userId)) {
        return this.get('store').findRecord('user', userId).then(user => {
          this.set('user', user);
        });
      } else {
        return (0, _rsvp.resolve)();
      }
    }
  }, _descriptor = _applyDecoratedDescriptor(_class.prototype, "session", [_service.inject], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor2 = _applyDecoratedDescriptor(_class.prototype, "store", [_service.inject], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _class);
  _exports.default = CurrentUserService;
  ;
});
;define("mrg-sign-in/services/moment", ["exports", "ember-moment/services/moment.js"], function (_exports, _moment) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function () {
      return _moment.default;
    }
  });
  0; //eaimeta@70e063a35619d71f0,"ember-moment/services/moment.js"eaimeta@70e063a35619d71f
});
;define("mrg-sign-in/services/session", ["exports", "ember-simple-auth/services/session"], function (_exports, _session) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  0; //eaimeta@70e063a35619d71f0,"ember-simple-auth/services/session"eaimeta@70e063a35619d71f
  var _default = _session.default;
  _exports.default = _default;
});
;define("mrg-sign-in/services/store", ["exports", "ember-data/store"], function (_exports, _store) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function () {
      return _store.default;
    }
  });
  0; //eaimeta@70e063a35619d71f0,"ember-data/store"eaimeta@70e063a35619d71f
});
;define("mrg-sign-in/session-stores/application", ["exports", "ember-simple-auth/session-stores/adaptive"], function (_exports, _adaptive) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  0; //eaimeta@70e063a35619d71f0,"ember-simple-auth/session-stores/adaptive"eaimeta@70e063a35619d71f
  var _default = _adaptive.default.extend();
  _exports.default = _default;
});
;define("mrg-sign-in/templates/application", ["exports", "@ember/template-factory"], function (_exports, _templateFactory) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  0; //eaimeta@70e063a35619d71f0,"ember-cli-htmlbars"eaimeta@70e063a35619d71f
  var _default = (0, _templateFactory.createTemplateFactory)(
  /*
    <div class="container">
    <div class="menu">
      <h1 class="left">
        Manitoba Robot Games Check-in System
      </h1>
      {{#if this.session.isAuthenticated}}
        <div class="menu">
        </div>
        <div class="main">
        </div>
        <nav>
          <ul>
            <li class="dropdown">
              <a href="javascript:void(0)" class="dropbtn">Robots</a>
              <div class="dropdown-content">
                <LinkTo @route="robots">Index</LinkTo>
                <LinkTo @route="robots.bulk-payment">Bulk payment</LinkTo>
              </div>
            </li>
            <li class="dropdown">
              <a href="javascript:void(0)" class="dropbtn">Competitions</a>
              <div class="dropdown-content">
                <LinkTo @route="competitions.show" @model="RC1">RC1 - Robo Critter</LinkTo>
                <LinkTo @route="competitions.show" @model="LFS">LFS - Line Follower (Scratch)</LinkTo>
                <LinkTo @route="competitions.show" @model="LFK">LFK - Line Follower (Kit)</LinkTo>
                <LinkTo @route="competitions.show" @model="LMA">LMA - Line Maze Autonomous</LinkTo>
                <LinkTo @route="competitions.show" @model="DRA">DRA - Drag Race Atuonomous</LinkTo>
                <LinkTo @route="competitions.show" @model="TPM">TPM - Tractor Pull</LinkTo>
                <LinkTo @route="competitions.show" @model="NXT">NXT - Lego Challenge</LinkTo>
                <LinkTo @route="competitions.show" @model="JC1">JC1 - Judges Choice</LinkTo>
                <LinkTo @route="competitions.show" @model="SSR">SSR - Super Scramble Rookie</LinkTo>
                <LinkTo @route="competitions.show" @model="SSL">SSL - Super Scramble Light</LinkTo>
                <LinkTo @route="competitions.show" @model="SSH">SSH - Super Scramble Heavy</LinkTo>
                <LinkTo @route="competitions.show" @model="MSR">MSR - Mini Sumo Rookie</LinkTo>
                <LinkTo @route="competitions.show" @model="MS1">MS1 - Mini Sumo 1</LinkTo>
                <LinkTo @route="competitions.show" @model="MS2">MS2 - Mini Sumo 2</LinkTo>
                <LinkTo @route="competitions.show" @model="MS3">MS3 - Mini Sumo 3</LinkTo>
                <LinkTo @route="competitions.show" @model="MSA">MSA - Mini Sumo Autonomous</LinkTo>
                <LinkTo @route="competitions.show" @model="PST">PST - Prairie Sumo Tethered</LinkTo>
                <LinkTo @route="competitions.show" @model="PSA">PSA - Prairie Sumo Autonomous</LinkTo>
              </div>
            </li>
  
            <li class="dropdown">
              <a href="javascript:void(0)" class="dropbtn">Ring Assignments</a>
              <div class="dropdown-content">
                <LinkTo @route="ring-assignments" @model="MSR">MSR - Mini Sumo Rookie</LinkTo>
                <LinkTo @route="ring-assignments" @model="MS1">MS1 - Mini Sumo 1</LinkTo>
                <LinkTo @route="ring-assignments" @model="MS2">MS2 - Mini Sumo 2</LinkTo>
                <LinkTo @route="ring-assignments" @model="MS3">MS3 - Mini Sumo 3</LinkTo>
                <LinkTo @route="ring-assignments" @model="MSA">MSA - Mini Sumo Autonomous</LinkTo>
                <LinkTo @route="ring-assignments" @model="PST">PST - Prairie Sumo Teathered</LinkTo>
                <LinkTo @route="ring-assignments" @model="PSA">PSA - Prairie Sumo Autonomous</LinkTo>
              </div>
            </li>
  
            <li class="dropdown">
              <a href="javascript:void(0)" class="dropbtn">Checked-In Index</a>
              <div class="dropdown-content">
                <LinkTo @route="checkin" @model="RC1">RC1 - Robo Critter</LinkTo>
                <LinkTo @route="checkin" @model="LFS">LFS - Line Follower (Scratch)</LinkTo>
                <LinkTo @route="checkin" @model="LFK">LFK - Line Follower (Kit)</LinkTo>
                <LinkTo @route="checkin" @model="LMA">LMA - Line Maze Autonomous</LinkTo>
                <LinkTo @route="checkin" @model="DRA">DRA - Drag Race Atuonomous</LinkTo>
                <LinkTo @route="checkin" @model="TPM">TPM - Tractor Pull</LinkTo>
                <LinkTo @route="checkin" @model="NXT">NXT - Lego Challenge</LinkTo>
                <LinkTo @route="checkin" @model="JC1">JC1 - Judges Choice</LinkTo>
                <LinkTo @route="checkin" @model="SSR">SSR - Super Scramble Rookie</LinkTo>
                <LinkTo @route="checkin" @model="SSL">SSL - Super Scramble Light</LinkTo>
                <LinkTo @route="checkin" @model="SSH">SSH - Super Scramble Heavy</LinkTo>
                <LinkTo @route="checkin" @model="MSR">MSR - Mini Sumo Rookie</LinkTo>
                <LinkTo @route="checkin" @model="MS1">MS1 - Mini Sumo 1</LinkTo>
                <LinkTo @route="checkin" @model="MS2">MS2 - Mini Sumo 2</LinkTo>
                <LinkTo @route="checkin" @model="MS3">MS3 - Mini Sumo 3</LinkTo>
                <LinkTo @route="checkin" @model="MSA">MSA - Mini Sumo Autonomous</LinkTo>
                <LinkTo @route="checkin" @model="PST">PST - Prairie Sumo Tethered</LinkTo>
                <LinkTo @route="checkin" @model="PSA">PSA - Prairie Sumo Autonomous</LinkTo>
              </div>
            </li>
            <li class="dropdown-right">
              <a href="#" {{on "click" this.invalidateSession}}>{{this.session.data.authenticated.fullname}} - LOGOUT</a>
            </li>
          </ul>
        </nav>
        {{/if}}
        {{outlet}}
    </div>
  </div>
  
  */
  {
    "id": "GZpXguPi",
    "block": "[[[10,0],[14,0,\"container\"],[12],[1,\"\\n  \"],[10,0],[14,0,\"menu\"],[12],[1,\"\\n    \"],[10,\"h1\"],[14,0,\"left\"],[12],[1,\"\\n      Manitoba Robot Games Check-in System\\n    \"],[13],[1,\"\\n\"],[41,[30,0,[\"session\",\"isAuthenticated\"]],[[[1,\"      \"],[10,0],[14,0,\"menu\"],[12],[1,\"\\n      \"],[13],[1,\"\\n      \"],[10,0],[14,0,\"main\"],[12],[1,\"\\n      \"],[13],[1,\"\\n      \"],[10,\"nav\"],[12],[1,\"\\n        \"],[10,\"ul\"],[12],[1,\"\\n          \"],[10,\"li\"],[14,0,\"dropdown\"],[12],[1,\"\\n            \"],[10,3],[14,6,\"javascript:void(0)\"],[14,0,\"dropbtn\"],[12],[1,\"Robots\"],[13],[1,\"\\n            \"],[10,0],[14,0,\"dropdown-content\"],[12],[1,\"\\n              \"],[8,[39,1],null,[[\"@route\"],[\"robots\"]],[[\"default\"],[[[[1,\"Index\"]],[]]]]],[1,\"\\n              \"],[8,[39,1],null,[[\"@route\"],[\"robots.bulk-payment\"]],[[\"default\"],[[[[1,\"Bulk payment\"]],[]]]]],[1,\"\\n            \"],[13],[1,\"\\n          \"],[13],[1,\"\\n          \"],[10,\"li\"],[14,0,\"dropdown\"],[12],[1,\"\\n            \"],[10,3],[14,6,\"javascript:void(0)\"],[14,0,\"dropbtn\"],[12],[1,\"Competitions\"],[13],[1,\"\\n            \"],[10,0],[14,0,\"dropdown-content\"],[12],[1,\"\\n              \"],[8,[39,1],null,[[\"@route\",\"@model\"],[\"competitions.show\",\"RC1\"]],[[\"default\"],[[[[1,\"RC1 - Robo Critter\"]],[]]]]],[1,\"\\n              \"],[8,[39,1],null,[[\"@route\",\"@model\"],[\"competitions.show\",\"LFS\"]],[[\"default\"],[[[[1,\"LFS - Line Follower (Scratch)\"]],[]]]]],[1,\"\\n              \"],[8,[39,1],null,[[\"@route\",\"@model\"],[\"competitions.show\",\"LFK\"]],[[\"default\"],[[[[1,\"LFK - Line Follower (Kit)\"]],[]]]]],[1,\"\\n              \"],[8,[39,1],null,[[\"@route\",\"@model\"],[\"competitions.show\",\"LMA\"]],[[\"default\"],[[[[1,\"LMA - Line Maze Autonomous\"]],[]]]]],[1,\"\\n              \"],[8,[39,1],null,[[\"@route\",\"@model\"],[\"competitions.show\",\"DRA\"]],[[\"default\"],[[[[1,\"DRA - Drag Race Atuonomous\"]],[]]]]],[1,\"\\n              \"],[8,[39,1],null,[[\"@route\",\"@model\"],[\"competitions.show\",\"TPM\"]],[[\"default\"],[[[[1,\"TPM - Tractor Pull\"]],[]]]]],[1,\"\\n              \"],[8,[39,1],null,[[\"@route\",\"@model\"],[\"competitions.show\",\"NXT\"]],[[\"default\"],[[[[1,\"NXT - Lego Challenge\"]],[]]]]],[1,\"\\n              \"],[8,[39,1],null,[[\"@route\",\"@model\"],[\"competitions.show\",\"JC1\"]],[[\"default\"],[[[[1,\"JC1 - Judges Choice\"]],[]]]]],[1,\"\\n              \"],[8,[39,1],null,[[\"@route\",\"@model\"],[\"competitions.show\",\"SSR\"]],[[\"default\"],[[[[1,\"SSR - Super Scramble Rookie\"]],[]]]]],[1,\"\\n              \"],[8,[39,1],null,[[\"@route\",\"@model\"],[\"competitions.show\",\"SSL\"]],[[\"default\"],[[[[1,\"SSL - Super Scramble Light\"]],[]]]]],[1,\"\\n              \"],[8,[39,1],null,[[\"@route\",\"@model\"],[\"competitions.show\",\"SSH\"]],[[\"default\"],[[[[1,\"SSH - Super Scramble Heavy\"]],[]]]]],[1,\"\\n              \"],[8,[39,1],null,[[\"@route\",\"@model\"],[\"competitions.show\",\"MSR\"]],[[\"default\"],[[[[1,\"MSR - Mini Sumo Rookie\"]],[]]]]],[1,\"\\n              \"],[8,[39,1],null,[[\"@route\",\"@model\"],[\"competitions.show\",\"MS1\"]],[[\"default\"],[[[[1,\"MS1 - Mini Sumo 1\"]],[]]]]],[1,\"\\n              \"],[8,[39,1],null,[[\"@route\",\"@model\"],[\"competitions.show\",\"MS2\"]],[[\"default\"],[[[[1,\"MS2 - Mini Sumo 2\"]],[]]]]],[1,\"\\n              \"],[8,[39,1],null,[[\"@route\",\"@model\"],[\"competitions.show\",\"MS3\"]],[[\"default\"],[[[[1,\"MS3 - Mini Sumo 3\"]],[]]]]],[1,\"\\n              \"],[8,[39,1],null,[[\"@route\",\"@model\"],[\"competitions.show\",\"MSA\"]],[[\"default\"],[[[[1,\"MSA - Mini Sumo Autonomous\"]],[]]]]],[1,\"\\n              \"],[8,[39,1],null,[[\"@route\",\"@model\"],[\"competitions.show\",\"PST\"]],[[\"default\"],[[[[1,\"PST - Prairie Sumo Tethered\"]],[]]]]],[1,\"\\n              \"],[8,[39,1],null,[[\"@route\",\"@model\"],[\"competitions.show\",\"PSA\"]],[[\"default\"],[[[[1,\"PSA - Prairie Sumo Autonomous\"]],[]]]]],[1,\"\\n            \"],[13],[1,\"\\n          \"],[13],[1,\"\\n\\n          \"],[10,\"li\"],[14,0,\"dropdown\"],[12],[1,\"\\n            \"],[10,3],[14,6,\"javascript:void(0)\"],[14,0,\"dropbtn\"],[12],[1,\"Ring Assignments\"],[13],[1,\"\\n            \"],[10,0],[14,0,\"dropdown-content\"],[12],[1,\"\\n              \"],[8,[39,1],null,[[\"@route\",\"@model\"],[\"ring-assignments\",\"MSR\"]],[[\"default\"],[[[[1,\"MSR - Mini Sumo Rookie\"]],[]]]]],[1,\"\\n              \"],[8,[39,1],null,[[\"@route\",\"@model\"],[\"ring-assignments\",\"MS1\"]],[[\"default\"],[[[[1,\"MS1 - Mini Sumo 1\"]],[]]]]],[1,\"\\n              \"],[8,[39,1],null,[[\"@route\",\"@model\"],[\"ring-assignments\",\"MS2\"]],[[\"default\"],[[[[1,\"MS2 - Mini Sumo 2\"]],[]]]]],[1,\"\\n              \"],[8,[39,1],null,[[\"@route\",\"@model\"],[\"ring-assignments\",\"MS3\"]],[[\"default\"],[[[[1,\"MS3 - Mini Sumo 3\"]],[]]]]],[1,\"\\n              \"],[8,[39,1],null,[[\"@route\",\"@model\"],[\"ring-assignments\",\"MSA\"]],[[\"default\"],[[[[1,\"MSA - Mini Sumo Autonomous\"]],[]]]]],[1,\"\\n              \"],[8,[39,1],null,[[\"@route\",\"@model\"],[\"ring-assignments\",\"PST\"]],[[\"default\"],[[[[1,\"PST - Prairie Sumo Teathered\"]],[]]]]],[1,\"\\n              \"],[8,[39,1],null,[[\"@route\",\"@model\"],[\"ring-assignments\",\"PSA\"]],[[\"default\"],[[[[1,\"PSA - Prairie Sumo Autonomous\"]],[]]]]],[1,\"\\n            \"],[13],[1,\"\\n          \"],[13],[1,\"\\n\\n          \"],[10,\"li\"],[14,0,\"dropdown\"],[12],[1,\"\\n            \"],[10,3],[14,6,\"javascript:void(0)\"],[14,0,\"dropbtn\"],[12],[1,\"Checked-In Index\"],[13],[1,\"\\n            \"],[10,0],[14,0,\"dropdown-content\"],[12],[1,\"\\n              \"],[8,[39,1],null,[[\"@route\",\"@model\"],[\"checkin\",\"RC1\"]],[[\"default\"],[[[[1,\"RC1 - Robo Critter\"]],[]]]]],[1,\"\\n              \"],[8,[39,1],null,[[\"@route\",\"@model\"],[\"checkin\",\"LFS\"]],[[\"default\"],[[[[1,\"LFS - Line Follower (Scratch)\"]],[]]]]],[1,\"\\n              \"],[8,[39,1],null,[[\"@route\",\"@model\"],[\"checkin\",\"LFK\"]],[[\"default\"],[[[[1,\"LFK - Line Follower (Kit)\"]],[]]]]],[1,\"\\n              \"],[8,[39,1],null,[[\"@route\",\"@model\"],[\"checkin\",\"LMA\"]],[[\"default\"],[[[[1,\"LMA - Line Maze Autonomous\"]],[]]]]],[1,\"\\n              \"],[8,[39,1],null,[[\"@route\",\"@model\"],[\"checkin\",\"DRA\"]],[[\"default\"],[[[[1,\"DRA - Drag Race Atuonomous\"]],[]]]]],[1,\"\\n              \"],[8,[39,1],null,[[\"@route\",\"@model\"],[\"checkin\",\"TPM\"]],[[\"default\"],[[[[1,\"TPM - Tractor Pull\"]],[]]]]],[1,\"\\n              \"],[8,[39,1],null,[[\"@route\",\"@model\"],[\"checkin\",\"NXT\"]],[[\"default\"],[[[[1,\"NXT - Lego Challenge\"]],[]]]]],[1,\"\\n              \"],[8,[39,1],null,[[\"@route\",\"@model\"],[\"checkin\",\"JC1\"]],[[\"default\"],[[[[1,\"JC1 - Judges Choice\"]],[]]]]],[1,\"\\n              \"],[8,[39,1],null,[[\"@route\",\"@model\"],[\"checkin\",\"SSR\"]],[[\"default\"],[[[[1,\"SSR - Super Scramble Rookie\"]],[]]]]],[1,\"\\n              \"],[8,[39,1],null,[[\"@route\",\"@model\"],[\"checkin\",\"SSL\"]],[[\"default\"],[[[[1,\"SSL - Super Scramble Light\"]],[]]]]],[1,\"\\n              \"],[8,[39,1],null,[[\"@route\",\"@model\"],[\"checkin\",\"SSH\"]],[[\"default\"],[[[[1,\"SSH - Super Scramble Heavy\"]],[]]]]],[1,\"\\n              \"],[8,[39,1],null,[[\"@route\",\"@model\"],[\"checkin\",\"MSR\"]],[[\"default\"],[[[[1,\"MSR - Mini Sumo Rookie\"]],[]]]]],[1,\"\\n              \"],[8,[39,1],null,[[\"@route\",\"@model\"],[\"checkin\",\"MS1\"]],[[\"default\"],[[[[1,\"MS1 - Mini Sumo 1\"]],[]]]]],[1,\"\\n              \"],[8,[39,1],null,[[\"@route\",\"@model\"],[\"checkin\",\"MS2\"]],[[\"default\"],[[[[1,\"MS2 - Mini Sumo 2\"]],[]]]]],[1,\"\\n              \"],[8,[39,1],null,[[\"@route\",\"@model\"],[\"checkin\",\"MS3\"]],[[\"default\"],[[[[1,\"MS3 - Mini Sumo 3\"]],[]]]]],[1,\"\\n              \"],[8,[39,1],null,[[\"@route\",\"@model\"],[\"checkin\",\"MSA\"]],[[\"default\"],[[[[1,\"MSA - Mini Sumo Autonomous\"]],[]]]]],[1,\"\\n              \"],[8,[39,1],null,[[\"@route\",\"@model\"],[\"checkin\",\"PST\"]],[[\"default\"],[[[[1,\"PST - Prairie Sumo Tethered\"]],[]]]]],[1,\"\\n              \"],[8,[39,1],null,[[\"@route\",\"@model\"],[\"checkin\",\"PSA\"]],[[\"default\"],[[[[1,\"PSA - Prairie Sumo Autonomous\"]],[]]]]],[1,\"\\n            \"],[13],[1,\"\\n          \"],[13],[1,\"\\n          \"],[10,\"li\"],[14,0,\"dropdown-right\"],[12],[1,\"\\n            \"],[11,3],[24,6,\"#\"],[4,[38,2],[\"click\",[30,0,[\"invalidateSession\"]]],null],[12],[1,[30,0,[\"session\",\"data\",\"authenticated\",\"fullname\"]]],[1,\" - LOGOUT\"],[13],[1,\"\\n          \"],[13],[1,\"\\n        \"],[13],[1,\"\\n      \"],[13],[1,\"\\n\"]],[]],null],[1,\"      \"],[46,[28,[37,4],null,null],null,null,null],[1,\"\\n  \"],[13],[1,\"\\n\"],[13],[1,\"\\n\"]],[],false,[\"if\",\"link-to\",\"on\",\"component\",\"-outlet\"]]",
    "moduleName": "mrg-sign-in/templates/application.hbs",
    "isStrictMode": false
  });
  _exports.default = _default;
});
;define("mrg-sign-in/templates/checkin", ["exports", "@ember/template-factory"], function (_exports, _templateFactory) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  0; //eaimeta@70e063a35619d71f0,"ember-cli-htmlbars"eaimeta@70e063a35619d71f
  var _default = (0, _templateFactory.createTemplateFactory)(
  /*
    <h2>{{this.model.longName}}</h2>
  <RobotCheckinListing
    @robots={{this.sortedAssignments}}
  />
  
  */
  {
    "id": "PgLJ5C8y",
    "block": "[[[10,\"h2\"],[12],[1,[30,0,[\"model\",\"longName\"]]],[13],[1,\"\\n\"],[8,[39,0],null,[[\"@robots\"],[[30,0,[\"sortedAssignments\"]]]],null],[1,\"\\n\"]],[],false,[\"robot-checkin-listing\"]]",
    "moduleName": "mrg-sign-in/templates/checkin.hbs",
    "isStrictMode": false
  });
  _exports.default = _default;
});
;define("mrg-sign-in/templates/competitions/admin", ["exports", "@ember/template-factory"], function (_exports, _templateFactory) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  0; //eaimeta@70e063a35619d71f0,"ember-cli-htmlbars"eaimeta@70e063a35619d71f
  var _default = (0, _templateFactory.createTemplateFactory)(
  /*
    <h2>{{this.model.longName}}</h2>
  <h3>Competition Capacity</h3>
  <p>
    {{#with (changeset this.model) as |changeset|}}
      <table class="form">
        <tbody>
          <tr>
            <td><b>Rings:</b></td>
            <td><Input
              @value={{changeset.rings}}
              type="number"
              title="This is the number of rings that will be used."
            /></td>
          </tr>
          <tr>
            <td><b>Maximum Entries per ring:</b></td>
            <td><Input
              @value={{changeset.maxRobotsPerRing}}
              type="number"
              title="This is the maximum allowable number of robots in a given ring"
            /></td>
          </tr>
          <tr>
            <td><b>Minimum Entries per ring:</b></td>
            <td><Input
              @value={{changeset.minRobotsPerRing}}
              type="number"
              title="This is the maximum allowable number of robots in a given ring"
            /></td>
          </tr>
          <tr>
            <td><b>Maximum Entries:</b></td>
            <td>{{this.model.maxEntries}}</td>
          </tr>
        </tbody>
      </table>
      <button {{on "click" (fn this.save changeset)}}>Save</button>
      <button {{on "click" (fn this.rollback changeset)}}>Undo</button>
    {{/with}}
  </p>
  <hr>
  <h3>Restart Measurements</h3>
  <p>
    <button {{on "click" (fn this.resetMeasurementTime this.model)}}>
      Set Measurment Time
    </button>
    <b>&nbsp;&nbsp;&nbsp;&nbsp;Current Measurement Time:</b>
    {{moment-format this.model.registrationTime "YYYY MMM DD, h:mm:ss"}}
  </p>
  <hr>
  <h3>Required Measurements</h3>
  <table class="form">
    <thead>
      <th> Measurement </th>
      <th> Required </th>
    </thead>
    <tbody>
      <tr>
        <td>Mass:</td>
        <td>
          <input
            type="checkbox"
            name="model.measureMass"
            checked={{this.model.measureMass}}
            {{on "click" (fn this.toggleMeasurement this.model "measureMass")}}
          >
        </td>
      </tr>
      <tr>
        <td>Size:</td>
        <td>
          <input
            type="checkbox"
            name="model.measureSize"
            checked={{this.model.measureSize}}
            {{on "click" (fn this.toggleMeasurement this.model "measureSize")}}
          >
        </td>
      </tr>
      <tr>
        <td>Time:</td>
        <td>
          <input
          type="checkbox"
          name="model.measureTime"
          checked={{this.model.measureTime}}
          {{on "click" (fn this.toggleMeasurement this.model "measureTime")}}
        >
        </td>
      </tr>
      <tr>
        <td>Scratch:</td>
        <td>
          <input
            type="checkbox"
            name="model.measureScratch"
            checked={{this.model.measureScratch}}
            {{on "click" (fn this.toggleMeasurement this.model "measureScratch")}}
          >
        </td>
      </tr>
      <tr>
        <td>Deadman:</td>
        <td>
          <input
            type="checkbox"
            name="model.measureDeadMan"
            checked={{this.model.measureDeadman}}
            {{on "click" (fn this.toggleMeasurement this.model "measureDeadman")}}
          >
        </td>
      </tr>
    </tbody>
  </table>
  
  */
  {
    "id": "SLgYieIs",
    "block": "[[[10,\"h2\"],[12],[1,[30,0,[\"model\",\"longName\"]]],[13],[1,\"\\n\"],[10,\"h3\"],[12],[1,\"Competition Capacity\"],[13],[1,\"\\n\"],[10,2],[12],[1,\"\\n\"],[43,[28,[37,1],[[30,0,[\"model\"]]],null],[[[1,\"    \"],[10,\"table\"],[14,0,\"form\"],[12],[1,\"\\n      \"],[10,\"tbody\"],[12],[1,\"\\n        \"],[10,\"tr\"],[12],[1,\"\\n          \"],[10,\"td\"],[12],[10,\"b\"],[12],[1,\"Rings:\"],[13],[13],[1,\"\\n          \"],[10,\"td\"],[12],[8,[39,2],[[24,\"title\",\"This is the number of rings that will be used.\"],[24,4,\"number\"]],[[\"@value\"],[[30,1,[\"rings\"]]]],null],[13],[1,\"\\n        \"],[13],[1,\"\\n        \"],[10,\"tr\"],[12],[1,\"\\n          \"],[10,\"td\"],[12],[10,\"b\"],[12],[1,\"Maximum Entries per ring:\"],[13],[13],[1,\"\\n          \"],[10,\"td\"],[12],[8,[39,2],[[24,\"title\",\"This is the maximum allowable number of robots in a given ring\"],[24,4,\"number\"]],[[\"@value\"],[[30,1,[\"maxRobotsPerRing\"]]]],null],[13],[1,\"\\n        \"],[13],[1,\"\\n        \"],[10,\"tr\"],[12],[1,\"\\n          \"],[10,\"td\"],[12],[10,\"b\"],[12],[1,\"Minimum Entries per ring:\"],[13],[13],[1,\"\\n          \"],[10,\"td\"],[12],[8,[39,2],[[24,\"title\",\"This is the maximum allowable number of robots in a given ring\"],[24,4,\"number\"]],[[\"@value\"],[[30,1,[\"minRobotsPerRing\"]]]],null],[13],[1,\"\\n        \"],[13],[1,\"\\n        \"],[10,\"tr\"],[12],[1,\"\\n          \"],[10,\"td\"],[12],[10,\"b\"],[12],[1,\"Maximum Entries:\"],[13],[13],[1,\"\\n          \"],[10,\"td\"],[12],[1,[30,0,[\"model\",\"maxEntries\"]]],[13],[1,\"\\n        \"],[13],[1,\"\\n      \"],[13],[1,\"\\n    \"],[13],[1,\"\\n    \"],[11,\"button\"],[4,[38,3],[\"click\",[28,[37,4],[[30,0,[\"save\"]],[30,1]],null]],null],[12],[1,\"Save\"],[13],[1,\"\\n    \"],[11,\"button\"],[4,[38,3],[\"click\",[28,[37,4],[[30,0,[\"rollback\"]],[30,1]],null]],null],[12],[1,\"Undo\"],[13],[1,\"\\n\"]],[1]],null],[13],[1,\"\\n\"],[10,\"hr\"],[12],[13],[1,\"\\n\"],[10,\"h3\"],[12],[1,\"Restart Measurements\"],[13],[1,\"\\n\"],[10,2],[12],[1,\"\\n  \"],[11,\"button\"],[4,[38,3],[\"click\",[28,[37,4],[[30,0,[\"resetMeasurementTime\"]],[30,0,[\"model\"]]],null]],null],[12],[1,\"\\n    Set Measurment Time\\n  \"],[13],[1,\"\\n  \"],[10,\"b\"],[12],[1,\"    Current Measurement Time:\"],[13],[1,\"\\n  \"],[1,[28,[35,5],[[30,0,[\"model\",\"registrationTime\"]],\"YYYY MMM DD, h:mm:ss\"],null]],[1,\"\\n\"],[13],[1,\"\\n\"],[10,\"hr\"],[12],[13],[1,\"\\n\"],[10,\"h3\"],[12],[1,\"Required Measurements\"],[13],[1,\"\\n\"],[10,\"table\"],[14,0,\"form\"],[12],[1,\"\\n  \"],[10,\"thead\"],[12],[1,\"\\n    \"],[10,\"th\"],[12],[1,\" Measurement \"],[13],[1,\"\\n    \"],[10,\"th\"],[12],[1,\" Required \"],[13],[1,\"\\n  \"],[13],[1,\"\\n  \"],[10,\"tbody\"],[12],[1,\"\\n    \"],[10,\"tr\"],[12],[1,\"\\n      \"],[10,\"td\"],[12],[1,\"Mass:\"],[13],[1,\"\\n      \"],[10,\"td\"],[12],[1,\"\\n        \"],[11,\"input\"],[24,3,\"model.measureMass\"],[16,\"checked\",[30,0,[\"model\",\"measureMass\"]]],[24,4,\"checkbox\"],[4,[38,3],[\"click\",[28,[37,4],[[30,0,[\"toggleMeasurement\"]],[30,0,[\"model\"]],\"measureMass\"],null]],null],[12],[13],[1,\"\\n      \"],[13],[1,\"\\n    \"],[13],[1,\"\\n    \"],[10,\"tr\"],[12],[1,\"\\n      \"],[10,\"td\"],[12],[1,\"Size:\"],[13],[1,\"\\n      \"],[10,\"td\"],[12],[1,\"\\n        \"],[11,\"input\"],[24,3,\"model.measureSize\"],[16,\"checked\",[30,0,[\"model\",\"measureSize\"]]],[24,4,\"checkbox\"],[4,[38,3],[\"click\",[28,[37,4],[[30,0,[\"toggleMeasurement\"]],[30,0,[\"model\"]],\"measureSize\"],null]],null],[12],[13],[1,\"\\n      \"],[13],[1,\"\\n    \"],[13],[1,\"\\n    \"],[10,\"tr\"],[12],[1,\"\\n      \"],[10,\"td\"],[12],[1,\"Time:\"],[13],[1,\"\\n      \"],[10,\"td\"],[12],[1,\"\\n        \"],[11,\"input\"],[24,3,\"model.measureTime\"],[16,\"checked\",[30,0,[\"model\",\"measureTime\"]]],[24,4,\"checkbox\"],[4,[38,3],[\"click\",[28,[37,4],[[30,0,[\"toggleMeasurement\"]],[30,0,[\"model\"]],\"measureTime\"],null]],null],[12],[13],[1,\"\\n      \"],[13],[1,\"\\n    \"],[13],[1,\"\\n    \"],[10,\"tr\"],[12],[1,\"\\n      \"],[10,\"td\"],[12],[1,\"Scratch:\"],[13],[1,\"\\n      \"],[10,\"td\"],[12],[1,\"\\n        \"],[11,\"input\"],[24,3,\"model.measureScratch\"],[16,\"checked\",[30,0,[\"model\",\"measureScratch\"]]],[24,4,\"checkbox\"],[4,[38,3],[\"click\",[28,[37,4],[[30,0,[\"toggleMeasurement\"]],[30,0,[\"model\"]],\"measureScratch\"],null]],null],[12],[13],[1,\"\\n      \"],[13],[1,\"\\n    \"],[13],[1,\"\\n    \"],[10,\"tr\"],[12],[1,\"\\n      \"],[10,\"td\"],[12],[1,\"Deadman:\"],[13],[1,\"\\n      \"],[10,\"td\"],[12],[1,\"\\n        \"],[11,\"input\"],[24,3,\"model.measureDeadMan\"],[16,\"checked\",[30,0,[\"model\",\"measureDeadman\"]]],[24,4,\"checkbox\"],[4,[38,3],[\"click\",[28,[37,4],[[30,0,[\"toggleMeasurement\"]],[30,0,[\"model\"]],\"measureDeadman\"],null]],null],[12],[13],[1,\"\\n      \"],[13],[1,\"\\n    \"],[13],[1,\"\\n  \"],[13],[1,\"\\n\"],[13],[1,\"\\n\"]],[\"changeset\"],false,[\"with\",\"changeset\",\"input\",\"on\",\"fn\",\"moment-format\"]]",
    "moduleName": "mrg-sign-in/templates/competitions/admin.hbs",
    "isStrictMode": false
  });
  _exports.default = _default;
});
;define("mrg-sign-in/templates/competitions/show", ["exports", "@ember/template-factory"], function (_exports, _templateFactory) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  0; //eaimeta@70e063a35619d71f0,"ember-cli-htmlbars"eaimeta@70e063a35619d71f
  var _default = (0, _templateFactory.createTemplateFactory)(
  /*
    {{this.poll this.refreshData 4000}}
  <h2>{{this.model.longName}}</h2>
  <p>
    Total spaces: {{this.model.maxEntries}}<br>
    Competitors Registered: {{this.model.robotCount}}<br>
    Competitors Checked-in: {{this.model.robotCheckedInCount}}<br>
    Spaces Unclaimed: {{this.model.unclaimedSpaces}}<br>
    Spaces Not Checked-in: {{this.model.uncheckedinSpaces}}<br>
  
    Measurment Start Time: {{moment-format this.model.registrationTime "LTS"}}<br>
    <LinkTo @route="robots.new" @query={{hash competition=this.model.name}}>New Entry</LinkTo><br><br>
    Filter by robot name:{{input value=this.robotFilter}}<br>
  </p>
  
  <RobotListing
    @robots={{this.filteredRobotsByName}}
    @edit-link="robots.edit"
  />
  
  */
  {
    "id": "lud4Hrsa",
    "block": "[[[1,[28,[30,0,[\"poll\"]],[[30,0,[\"refreshData\"]],4000],null]],[1,\"\\n\"],[10,\"h2\"],[12],[1,[30,0,[\"model\",\"longName\"]]],[13],[1,\"\\n\"],[10,2],[12],[1,\"\\n  Total spaces: \"],[1,[30,0,[\"model\",\"maxEntries\"]]],[10,\"br\"],[12],[13],[1,\"\\n  Competitors Registered: \"],[1,[30,0,[\"model\",\"robotCount\"]]],[10,\"br\"],[12],[13],[1,\"\\n  Competitors Checked-in: \"],[1,[30,0,[\"model\",\"robotCheckedInCount\"]]],[10,\"br\"],[12],[13],[1,\"\\n  Spaces Unclaimed: \"],[1,[30,0,[\"model\",\"unclaimedSpaces\"]]],[10,\"br\"],[12],[13],[1,\"\\n  Spaces Not Checked-in: \"],[1,[30,0,[\"model\",\"uncheckedinSpaces\"]]],[10,\"br\"],[12],[13],[1,\"\\n\\n  Measurment Start Time: \"],[1,[28,[35,0],[[30,0,[\"model\",\"registrationTime\"]],\"LTS\"],null]],[10,\"br\"],[12],[13],[1,\"\\n  \"],[8,[39,1],null,[[\"@route\",\"@query\"],[\"robots.new\",[28,[37,2],null,[[\"competition\"],[[30,0,[\"model\",\"name\"]]]]]]],[[\"default\"],[[[[1,\"New Entry\"]],[]]]]],[10,\"br\"],[12],[13],[10,\"br\"],[12],[13],[1,\"\\n  Filter by robot name:\"],[1,[28,[35,3],null,[[\"value\"],[[30,0,[\"robotFilter\"]]]]]],[10,\"br\"],[12],[13],[1,\"\\n\"],[13],[1,\"\\n\\n\"],[8,[39,4],null,[[\"@robots\",\"@edit-link\"],[[30,0,[\"filteredRobotsByName\"]],\"robots.edit\"]],null],[1,\"\\n\"]],[],false,[\"moment-format\",\"link-to\",\"hash\",\"input\",\"robot-listing\"]]",
    "moduleName": "mrg-sign-in/templates/competitions/show.hbs",
    "isStrictMode": false
  });
  _exports.default = _default;
});
;define("mrg-sign-in/templates/log", ["exports", "@ember/template-factory"], function (_exports, _templateFactory) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  0; //eaimeta@70e063a35619d71f0,"ember-cli-htmlbars"eaimeta@70e063a35619d71f
  var _default = (0, _templateFactory.createTemplateFactory)(
  /*
    <table>
    <thead>
      <th>
        Time
      </th>
      <th>
        Entry
      </th>
      <th>
        Volunteer
      </th>
      <th>
        Action
      </th>
    </thead>
    <tbody>
      {{#each this.model as |item|}}
        <tr>
          <td>
            {{moment-format item.datetime "h:mm:ss a"}}
          </td>
          <td>
            <LinkTo @route="robots.edit" @model={{item.entry.id}}>{{item.entry.robot}}</LinkTo>
          </td>
          <td>
            {{item.volunteer}}
          </td>
          <td>
            {{item.action}}
          </td>
        </tr>
      {{/each}}
    </tbody>
  </table>
  
  */
  {
    "id": "fDoVzShH",
    "block": "[[[10,\"table\"],[12],[1,\"\\n  \"],[10,\"thead\"],[12],[1,\"\\n    \"],[10,\"th\"],[12],[1,\"\\n      Time\\n    \"],[13],[1,\"\\n    \"],[10,\"th\"],[12],[1,\"\\n      Entry\\n    \"],[13],[1,\"\\n    \"],[10,\"th\"],[12],[1,\"\\n      Volunteer\\n    \"],[13],[1,\"\\n    \"],[10,\"th\"],[12],[1,\"\\n      Action\\n    \"],[13],[1,\"\\n  \"],[13],[1,\"\\n  \"],[10,\"tbody\"],[12],[1,\"\\n\"],[42,[28,[37,1],[[28,[37,1],[[30,0,[\"model\"]]],null]],null],null,[[[1,\"      \"],[10,\"tr\"],[12],[1,\"\\n        \"],[10,\"td\"],[12],[1,\"\\n          \"],[1,[28,[35,2],[[30,1,[\"datetime\"]],\"h:mm:ss a\"],null]],[1,\"\\n        \"],[13],[1,\"\\n        \"],[10,\"td\"],[12],[1,\"\\n          \"],[8,[39,3],null,[[\"@route\",\"@model\"],[\"robots.edit\",[30,1,[\"entry\",\"id\"]]]],[[\"default\"],[[[[1,[30,1,[\"entry\",\"robot\"]]]],[]]]]],[1,\"\\n        \"],[13],[1,\"\\n        \"],[10,\"td\"],[12],[1,\"\\n          \"],[1,[30,1,[\"volunteer\"]]],[1,\"\\n        \"],[13],[1,\"\\n        \"],[10,\"td\"],[12],[1,\"\\n          \"],[1,[30,1,[\"action\"]]],[1,\"\\n        \"],[13],[1,\"\\n      \"],[13],[1,\"\\n\"]],[1]],null],[1,\"  \"],[13],[1,\"\\n\"],[13],[1,\"\\n\"]],[\"item\"],false,[\"each\",\"-track-array\",\"moment-format\",\"link-to\"]]",
    "moduleName": "mrg-sign-in/templates/log.hbs",
    "isStrictMode": false
  });
  _exports.default = _default;
});
;define("mrg-sign-in/templates/login", ["exports", "@ember/template-factory"], function (_exports, _templateFactory) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  0; //eaimeta@70e063a35619d71f0,"ember-cli-htmlbars"eaimeta@70e063a35619d71f
  var _default = (0, _templateFactory.createTemplateFactory)(
  /*
    <h2>Who's There?</h2>
  <form {{on "submit" this.authenticate }}>
    <label for="identification">Login</label>
    {{input id="identification" placeholder="Enter Login" value=this.identification}}
    <button type="submit">Login</button>
    {{#if this.errorMessage}}
      <p>{{this.errorMessage}}</p>
    {{/if}}
  </form>
  
  */
  {
    "id": "xuc7mtZX",
    "block": "[[[10,\"h2\"],[12],[1,\"Who's There?\"],[13],[1,\"\\n\"],[11,\"form\"],[4,[38,0],[\"submit\",[30,0,[\"authenticate\"]]],null],[12],[1,\"\\n  \"],[10,\"label\"],[14,\"for\",\"identification\"],[12],[1,\"Login\"],[13],[1,\"\\n  \"],[1,[28,[35,1],null,[[\"id\",\"placeholder\",\"value\"],[\"identification\",\"Enter Login\",[30,0,[\"identification\"]]]]]],[1,\"\\n  \"],[10,\"button\"],[14,4,\"submit\"],[12],[1,\"Login\"],[13],[1,\"\\n\"],[41,[30,0,[\"errorMessage\"]],[[[1,\"    \"],[10,2],[12],[1,[30,0,[\"errorMessage\"]]],[13],[1,\"\\n\"]],[]],null],[13],[1,\"\\n\"]],[],false,[\"on\",\"input\",\"if\"]]",
    "moduleName": "mrg-sign-in/templates/login.hbs",
    "isStrictMode": false
  });
  _exports.default = _default;
});
;define("mrg-sign-in/templates/ring-assignments", ["exports", "@ember/template-factory"], function (_exports, _templateFactory) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  0; //eaimeta@70e063a35619d71f0,"ember-cli-htmlbars"eaimeta@70e063a35619d71f
  var _default = (0, _templateFactory.createTemplateFactory)(
  /*
    <p>{{this.model.longName}}</p>
  <table class="list">
    <thead>
      <th>Name</th>
      <th>Ring</th>
      <th>ID</th>
      <th>Driver</th>
    </thead>
    <tbody>
      {{#each this.sortedAssignments as |item|}}
        <tr>
          <td>{{item.robot.name}}</td>
          <td>{{item.ring}}</td>
          <td>{{item.letter}}</td>
          <td>{{item.robot.driver1}}</td>
        </tr>
      {{/each}}
    </tbody>
  </table>
  
  */
  {
    "id": "urM9JvxF",
    "block": "[[[10,2],[12],[1,[30,0,[\"model\",\"longName\"]]],[13],[1,\"\\n\"],[10,\"table\"],[14,0,\"list\"],[12],[1,\"\\n  \"],[10,\"thead\"],[12],[1,\"\\n    \"],[10,\"th\"],[12],[1,\"Name\"],[13],[1,\"\\n    \"],[10,\"th\"],[12],[1,\"Ring\"],[13],[1,\"\\n    \"],[10,\"th\"],[12],[1,\"ID\"],[13],[1,\"\\n    \"],[10,\"th\"],[12],[1,\"Driver\"],[13],[1,\"\\n  \"],[13],[1,\"\\n  \"],[10,\"tbody\"],[12],[1,\"\\n\"],[42,[28,[37,1],[[28,[37,1],[[30,0,[\"sortedAssignments\"]]],null]],null],null,[[[1,\"      \"],[10,\"tr\"],[12],[1,\"\\n        \"],[10,\"td\"],[12],[1,[30,1,[\"robot\",\"name\"]]],[13],[1,\"\\n        \"],[10,\"td\"],[12],[1,[30,1,[\"ring\"]]],[13],[1,\"\\n        \"],[10,\"td\"],[12],[1,[30,1,[\"letter\"]]],[13],[1,\"\\n        \"],[10,\"td\"],[12],[1,[30,1,[\"robot\",\"driver1\"]]],[13],[1,\"\\n      \"],[13],[1,\"\\n\"]],[1]],null],[1,\"  \"],[13],[1,\"\\n\"],[13],[1,\"\\n\"]],[\"item\"],false,[\"each\",\"-track-array\"]]",
    "moduleName": "mrg-sign-in/templates/ring-assignments.hbs",
    "isStrictMode": false
  });
  _exports.default = _default;
});
;define("mrg-sign-in/templates/robocritter-certificate", ["exports", "@ember/template-factory"], function (_exports, _templateFactory) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  0; //eaimeta@70e063a35619d71f0,"ember-cli-htmlbars"eaimeta@70e063a35619d71f
  var _default = (0, _templateFactory.createTemplateFactory)(
  /*
    <!-- app/templates/robocritter-certificate.hbs -->
  <div>
      <label for="player">Player Name:</label>
      <input type="text" id="player" value={{this.player}} oninput={{action (mut this.player) value="target.value"}} autocomplete="off" required>
  </div>
  
  <div>
      <label for="robot">Robot Name:</label>
      <input type="text" id="robot" value={{this.robot}} oninput={{action (mut this.robot) value="target.value"}} autocomplete="off" required>
  </div>
  
  <div>
      <label for="minutes">Minutes:</label>
      <input type="number" id="minutes" value={{this.minutes}} oninput={{action (mut this.minutes) value="target.value"}} autocomplete="off" required>
  </div>
  
  <div>
      <label for="seconds">Seconds:</label>
      <input type="number" id="seconds" value={{this.seconds}} oninput={{action (mut this.seconds) value="target.value"}} autocomplete="off" required>
  </div>
  
  <div><button {{on "click" this.downloadCertificate}}>Download Certificate</button></div>
  
  
  */
  {
    "id": "8unyR3SX",
    "block": "[[[3,\" app/templates/robocritter-certificate.hbs \"],[1,\"\\n\"],[10,0],[12],[1,\"\\n    \"],[10,\"label\"],[14,\"for\",\"player\"],[12],[1,\"Player Name:\"],[13],[1,\"\\n    \"],[10,\"input\"],[14,1,\"player\"],[15,2,[30,0,[\"player\"]]],[15,\"oninput\",[28,[37,0],[[30,0],[28,[37,1],[[30,0,[\"player\"]]],null]],[[\"value\"],[\"target.value\"]]]],[14,\"autocomplete\",\"off\"],[14,\"required\",\"\"],[14,4,\"text\"],[12],[13],[1,\"\\n\"],[13],[1,\"\\n\\n\"],[10,0],[12],[1,\"\\n    \"],[10,\"label\"],[14,\"for\",\"robot\"],[12],[1,\"Robot Name:\"],[13],[1,\"\\n    \"],[10,\"input\"],[14,1,\"robot\"],[15,2,[30,0,[\"robot\"]]],[15,\"oninput\",[28,[37,0],[[30,0],[28,[37,1],[[30,0,[\"robot\"]]],null]],[[\"value\"],[\"target.value\"]]]],[14,\"autocomplete\",\"off\"],[14,\"required\",\"\"],[14,4,\"text\"],[12],[13],[1,\"\\n\"],[13],[1,\"\\n\\n\"],[10,0],[12],[1,\"\\n    \"],[10,\"label\"],[14,\"for\",\"minutes\"],[12],[1,\"Minutes:\"],[13],[1,\"\\n    \"],[10,\"input\"],[14,1,\"minutes\"],[15,2,[30,0,[\"minutes\"]]],[15,\"oninput\",[28,[37,0],[[30,0],[28,[37,1],[[30,0,[\"minutes\"]]],null]],[[\"value\"],[\"target.value\"]]]],[14,\"autocomplete\",\"off\"],[14,\"required\",\"\"],[14,4,\"number\"],[12],[13],[1,\"\\n\"],[13],[1,\"\\n\\n\"],[10,0],[12],[1,\"\\n    \"],[10,\"label\"],[14,\"for\",\"seconds\"],[12],[1,\"Seconds:\"],[13],[1,\"\\n    \"],[10,\"input\"],[14,1,\"seconds\"],[15,2,[30,0,[\"seconds\"]]],[15,\"oninput\",[28,[37,0],[[30,0],[28,[37,1],[[30,0,[\"seconds\"]]],null]],[[\"value\"],[\"target.value\"]]]],[14,\"autocomplete\",\"off\"],[14,\"required\",\"\"],[14,4,\"number\"],[12],[13],[1,\"\\n\"],[13],[1,\"\\n\\n\"],[10,0],[12],[11,\"button\"],[4,[38,2],[\"click\",[30,0,[\"downloadCertificate\"]]],null],[12],[1,\"Download Certificate\"],[13],[13],[1,\"\\n\\n\"]],[],false,[\"action\",\"mut\",\"on\"]]",
    "moduleName": "mrg-sign-in/templates/robocritter-certificate.hbs",
    "isStrictMode": false
  });
  _exports.default = _default;
});
;define("mrg-sign-in/templates/robots/bulk-payment", ["exports", "@ember/template-factory"], function (_exports, _templateFactory) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  0; //eaimeta@70e063a35619d71f0,"ember-cli-htmlbars"eaimeta@70e063a35619d71f
  var _default = (0, _templateFactory.createTemplateFactory)(
  /*
     <h2>Bulk Payment</h2>
   <table class="list">
     <tbody>
       {{#each-in this.coaches as |coach data|}}
         <tr>
           <td colspan="5">
             <h4>{{data.name}} - {{data.school}}
               <button title="Clicking this button will cause all entries for this coach to be marked as &quot;INVOICED&quot; - unless they've already paid." {{on "click" (fn this.invoiceAll data.email)}}>
                 Invoice All Entries
               </button>
             </h4>
           </td>
         </tr>
         <tr>
           <th>Robot</th>
           <th>Competition</th>
           <th>Driver</th>
           <th>Price</th>
           <th>Payment</th>
           <th>Participated</th>
         </tr>
         {{#each data.entries as |entry|}}
           <tr>
             <td><LinkTo @route="robots.edit" @model={{entry.id}}>{{entry.name}}</LinkTo></td>
             <td>{{entry.competition.name}}</td>
             <td>{{entry.driver1}}</td>
             <td>{{entry.formattedInvoicedDollars}}</td>
             <td>{{entry.paymentType}}</td>
             <td>{{if entry.participated "✓"}}</td>
           </tr>
         {{/each}}
         <tr>
           <td></td>
           <td></td>
           <td></td>
           <td><b>Invoiced:</b></td>
           <td>${{data.invoiced}}.00</td>
         </tr>
         <tr></tr>
       {{/each-in}}
     </tbody>
   </table>
  
  */
  {
    "id": "FfW7P1qT",
    "block": "[[[1,\" \"],[10,\"h2\"],[12],[1,\"Bulk Payment\"],[13],[1,\"\\n \"],[10,\"table\"],[14,0,\"list\"],[12],[1,\"\\n   \"],[10,\"tbody\"],[12],[1,\"\\n\"],[42,[28,[37,1],[[30,0,[\"coaches\"]]],null],null,[[[1,\"       \"],[10,\"tr\"],[12],[1,\"\\n         \"],[10,\"td\"],[14,\"colspan\",\"5\"],[12],[1,\"\\n           \"],[10,\"h4\"],[12],[1,[30,1,[\"name\"]]],[1,\" - \"],[1,[30,1,[\"school\"]]],[1,\"\\n             \"],[11,\"button\"],[24,\"title\",\"Clicking this button will cause all entries for this coach to be marked as \\\"INVOICED\\\" - unless they've already paid.\"],[4,[38,2],[\"click\",[28,[37,3],[[30,0,[\"invoiceAll\"]],[30,1,[\"email\"]]],null]],null],[12],[1,\"\\n               Invoice All Entries\\n             \"],[13],[1,\"\\n           \"],[13],[1,\"\\n         \"],[13],[1,\"\\n       \"],[13],[1,\"\\n       \"],[10,\"tr\"],[12],[1,\"\\n         \"],[10,\"th\"],[12],[1,\"Robot\"],[13],[1,\"\\n         \"],[10,\"th\"],[12],[1,\"Competition\"],[13],[1,\"\\n         \"],[10,\"th\"],[12],[1,\"Driver\"],[13],[1,\"\\n         \"],[10,\"th\"],[12],[1,\"Price\"],[13],[1,\"\\n         \"],[10,\"th\"],[12],[1,\"Payment\"],[13],[1,\"\\n         \"],[10,\"th\"],[12],[1,\"Participated\"],[13],[1,\"\\n       \"],[13],[1,\"\\n\"],[42,[28,[37,4],[[28,[37,4],[[30,1,[\"entries\"]]],null]],null],null,[[[1,\"         \"],[10,\"tr\"],[12],[1,\"\\n           \"],[10,\"td\"],[12],[8,[39,5],null,[[\"@route\",\"@model\"],[\"robots.edit\",[30,3,[\"id\"]]]],[[\"default\"],[[[[1,[30,3,[\"name\"]]]],[]]]]],[13],[1,\"\\n           \"],[10,\"td\"],[12],[1,[30,3,[\"competition\",\"name\"]]],[13],[1,\"\\n           \"],[10,\"td\"],[12],[1,[30,3,[\"driver1\"]]],[13],[1,\"\\n           \"],[10,\"td\"],[12],[1,[30,3,[\"formattedInvoicedDollars\"]]],[13],[1,\"\\n           \"],[10,\"td\"],[12],[1,[30,3,[\"paymentType\"]]],[13],[1,\"\\n           \"],[10,\"td\"],[12],[1,[52,[30,3,[\"participated\"]],\"✓\"]],[13],[1,\"\\n         \"],[13],[1,\"\\n\"]],[3]],null],[1,\"       \"],[10,\"tr\"],[12],[1,\"\\n         \"],[10,\"td\"],[12],[13],[1,\"\\n         \"],[10,\"td\"],[12],[13],[1,\"\\n         \"],[10,\"td\"],[12],[13],[1,\"\\n         \"],[10,\"td\"],[12],[10,\"b\"],[12],[1,\"Invoiced:\"],[13],[13],[1,\"\\n         \"],[10,\"td\"],[12],[1,\"$\"],[1,[30,1,[\"invoiced\"]]],[1,\".00\"],[13],[1,\"\\n       \"],[13],[1,\"\\n       \"],[10,\"tr\"],[12],[13],[1,\"\\n\"]],[1,2]],null],[1,\"   \"],[13],[1,\"\\n \"],[13],[1,\"\\n\"]],[\"data\",\"coach\",\"entry\"],false,[\"each\",\"-each-in\",\"on\",\"fn\",\"-track-array\",\"link-to\",\"if\"]]",
    "moduleName": "mrg-sign-in/templates/robots/bulk-payment.hbs",
    "isStrictMode": false
  });
  _exports.default = _default;
});
;define("mrg-sign-in/templates/robots/edit", ["exports", "@ember/template-factory"], function (_exports, _templateFactory) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  0; //eaimeta@70e063a35619d71f0,"ember-cli-htmlbars"eaimeta@70e063a35619d71f
  var _default = (0, _templateFactory.createTemplateFactory)(
  /*
    <h2>Robot: "{{this.model.robot.name}}"</h2>
  <hr>
  {{#with (changeset this.model.robot this.RobotValidation) as |c|}}
    <RobotDetail @changeset={{c}} @competitions={{this.model.competition}} />
    <button {{on "click" (fn this.rollback c)}}>Undo</button>
    <button {{on "click" (fn this.save c)}} disabled={{c.isInvalid}}>
      Save Changes
    </button>
  {{/with}}
  <hr>
  <RobotCheckin @data={{this.model.robot}} />
  <hr>
  <RobotPayment @data={{this.model.robot}} />
  <hr>
  <RobotMeasurement @data={{this.model.robot}} />
  <hr>
  <button {{on "click" (fn this.done this.model.robot.competition)}}>Done</button>
  
  */
  {
    "id": "AS8mLdzD",
    "block": "[[[10,\"h2\"],[12],[1,\"Robot: \\\"\"],[1,[30,0,[\"model\",\"robot\",\"name\"]]],[1,\"\\\"\"],[13],[1,\"\\n\"],[10,\"hr\"],[12],[13],[1,\"\\n\"],[43,[28,[37,1],[[30,0,[\"model\",\"robot\"]],[30,0,[\"RobotValidation\"]]],null],[[[1,\"  \"],[8,[39,2],null,[[\"@changeset\",\"@competitions\"],[[30,1],[30,0,[\"model\",\"competition\"]]]],null],[1,\"\\n  \"],[11,\"button\"],[4,[38,3],[\"click\",[28,[37,4],[[30,0,[\"rollback\"]],[30,1]],null]],null],[12],[1,\"Undo\"],[13],[1,\"\\n  \"],[11,\"button\"],[16,\"disabled\",[30,1,[\"isInvalid\"]]],[4,[38,3],[\"click\",[28,[37,4],[[30,0,[\"save\"]],[30,1]],null]],null],[12],[1,\"\\n    Save Changes\\n  \"],[13],[1,\"\\n\"]],[1]],null],[10,\"hr\"],[12],[13],[1,\"\\n\"],[8,[39,5],null,[[\"@data\"],[[30,0,[\"model\",\"robot\"]]]],null],[1,\"\\n\"],[10,\"hr\"],[12],[13],[1,\"\\n\"],[8,[39,6],null,[[\"@data\"],[[30,0,[\"model\",\"robot\"]]]],null],[1,\"\\n\"],[10,\"hr\"],[12],[13],[1,\"\\n\"],[8,[39,7],null,[[\"@data\"],[[30,0,[\"model\",\"robot\"]]]],null],[1,\"\\n\"],[10,\"hr\"],[12],[13],[1,\"\\n\"],[11,\"button\"],[4,[38,3],[\"click\",[28,[37,4],[[30,0,[\"done\"]],[30,0,[\"model\",\"robot\",\"competition\"]]],null]],null],[12],[1,\"Done\"],[13],[1,\"\\n\"]],[\"c\"],false,[\"with\",\"changeset\",\"robot-detail\",\"on\",\"fn\",\"robot-checkin\",\"robot-payment\",\"robot-measurement\"]]",
    "moduleName": "mrg-sign-in/templates/robots/edit.hbs",
    "isStrictMode": false
  });
  _exports.default = _default;
});
;define("mrg-sign-in/templates/robots/index", ["exports", "@ember/template-factory"], function (_exports, _templateFactory) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  0; //eaimeta@70e063a35619d71f0,"ember-cli-htmlbars"eaimeta@70e063a35619d71f
  var _default = (0, _templateFactory.createTemplateFactory)(
  /*
    {{this.poll this.refreshData 4000}}
  
  <h2>Index</h2>
  <div>
    <table>
      <tbody>
        <tr>
          <td colspan="2"><b>Filters:</b></td>
        </tr>
        <tr>
          <td>Robot Name:</td>
          <td>{{input value=this.robotFilter}}</td>
          <td>School:</td>
          <td>{{input value=this.schoolFilter}}</td>
          <td>ID:</td>
          <td>{{input value=this.robotIDFilter}}</td>
        </tr>
      </tbody>
    </table>
  </div>
  
  <RobotListing @robots={{this.filteredRobots}} />
  
  <table>
    <tbody>
      <tr>
        <td> Invoiced Total: </td>
        <td> {{this.invoicedTotal}}</td>
      </tr>
      <tr>
        <td>Paid Total</td>
        <td>{{this.paidTotal}}</td>
      </tr>
    </tbody>
  </table>
  
  {{outlet}}
  
  */
  {
    "id": "fvC6xZtl",
    "block": "[[[1,[28,[30,0,[\"poll\"]],[[30,0,[\"refreshData\"]],4000],null]],[1,\"\\n\\n\"],[10,\"h2\"],[12],[1,\"Index\"],[13],[1,\"\\n\"],[10,0],[12],[1,\"\\n  \"],[10,\"table\"],[12],[1,\"\\n    \"],[10,\"tbody\"],[12],[1,\"\\n      \"],[10,\"tr\"],[12],[1,\"\\n        \"],[10,\"td\"],[14,\"colspan\",\"2\"],[12],[10,\"b\"],[12],[1,\"Filters:\"],[13],[13],[1,\"\\n      \"],[13],[1,\"\\n      \"],[10,\"tr\"],[12],[1,\"\\n        \"],[10,\"td\"],[12],[1,\"Robot Name:\"],[13],[1,\"\\n        \"],[10,\"td\"],[12],[1,[28,[35,0],null,[[\"value\"],[[30,0,[\"robotFilter\"]]]]]],[13],[1,\"\\n        \"],[10,\"td\"],[12],[1,\"School:\"],[13],[1,\"\\n        \"],[10,\"td\"],[12],[1,[28,[35,0],null,[[\"value\"],[[30,0,[\"schoolFilter\"]]]]]],[13],[1,\"\\n        \"],[10,\"td\"],[12],[1,\"ID:\"],[13],[1,\"\\n        \"],[10,\"td\"],[12],[1,[28,[35,0],null,[[\"value\"],[[30,0,[\"robotIDFilter\"]]]]]],[13],[1,\"\\n      \"],[13],[1,\"\\n    \"],[13],[1,\"\\n  \"],[13],[1,\"\\n\"],[13],[1,\"\\n\\n\"],[8,[39,1],null,[[\"@robots\"],[[30,0,[\"filteredRobots\"]]]],null],[1,\"\\n\\n\"],[10,\"table\"],[12],[1,\"\\n  \"],[10,\"tbody\"],[12],[1,\"\\n    \"],[10,\"tr\"],[12],[1,\"\\n      \"],[10,\"td\"],[12],[1,\" Invoiced Total: \"],[13],[1,\"\\n      \"],[10,\"td\"],[12],[1,\" \"],[1,[30,0,[\"invoicedTotal\"]]],[13],[1,\"\\n    \"],[13],[1,\"\\n    \"],[10,\"tr\"],[12],[1,\"\\n      \"],[10,\"td\"],[12],[1,\"Paid Total\"],[13],[1,\"\\n      \"],[10,\"td\"],[12],[1,[30,0,[\"paidTotal\"]]],[13],[1,\"\\n    \"],[13],[1,\"\\n  \"],[13],[1,\"\\n\"],[13],[1,\"\\n\\n\"],[46,[28,[37,3],null,null],null,null,null],[1,\"\\n\"]],[],false,[\"input\",\"robot-listing\",\"component\",\"-outlet\"]]",
    "moduleName": "mrg-sign-in/templates/robots/index.hbs",
    "isStrictMode": false
  });
  _exports.default = _default;
});
;define("mrg-sign-in/templates/robots/info", ["exports", "@ember/template-factory"], function (_exports, _templateFactory) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  0; //eaimeta@70e063a35619d71f0,"ember-cli-htmlbars"eaimeta@70e063a35619d71f
  var _default = (0, _templateFactory.createTemplateFactory)(
  /*
    <div style="position: absolute; top: 50px; left: 230px; text-align:center">
    <h1>2016 Manitoba Robot Games<br>Router Sheet</h1>
  </div>
  <div style="position: absolute; left: 5px; top: 5px; padding: 1em;">
    <img height="200px" width="200px" src="/assets/images/robot.gif" />
  </div>
  
  <div style="position: absolute; left: 20px; top: 215px; padding: 5px;">
    <p>
      Please read carefully.<br>
      <b>This information will be used for certificates and awards.</b>
    </p>
    <p>Please make changes clear and legible and present the completed sheet with your robot for registering.</p>
  </div>
  
  <div id="router-sheet-div" />
  <div style="position: absolute; left: 10px; top: 330px">
    <table class="data">
      <tbody>
        <col width="150">
        <col width="300">
        <col width="125">
        <col width="50">
        <tr>
          <td class="label">Competition:</td>
          <td class="info">{{model.competition}}</td>
          <td class="label">Amount Paid:</td>
          <td class="info">${{model.amount_paid}}</td>
        </tr>
        <tr>
          <td class="label">Robot Name:</td>
          <td class="info">{{model.robot}}</td>
        </tr>
        <tr>
          <td class="label">Team Member 1:</td>
          <td class="info">{{model.driver1}}</td>
          <td class="label">Grade:</td>
          <td class="info">{{model.driver1Gr}}</td>
        </tr>
        <tr>
          <td class="label">Team Member 2:</td>
          <td class="info">{{model.driver2}}</td>
          <td class="label">Grade:</td>
          <td class="info">{{model.driver2Gr}}</td>
        </tr>
        <tr>
          <td class="label">Team Member 3:</td>
          <td class="info">{{model.driver3}}</td>
          <td class="label">Grade:</td>
          <td class="info">{{model.driver3Gr}}</td>
        </tr>
        <tr>
          <td class="label">School Attending:</td>
          <td class="info" colspan="3">{{model.school}}</td>
        </tr>
        <tr>
          <td class="label" style="text-align: left;" colspan="2">Contact Information:</td>
        </tr>
        <tr>
          <td class="label">Phone:</td>
          <td class="info" colspan="3">{{model.ph}}</td>
        </tr>
        <tr>
          <td class="label">Email:</td>
          <td class="info" colspan="3">{{model.email}}</td>
        </tr>
        <tr>
          <td class="label">Address:</td>
          <td class="info" colspan="3">{{model.address}}</td>
        </tr>
        <tr>
          <td />
          <td />
          <td />
          <td class="label" style="text-align: center; padding: 5px">#: {{id}}</td>
        </tr>
        <tr>
          <td class="label" colspan="3">Ring assignment code:</td>
          <td colspan="2" style="text-align: center; padding: 0px">
            <img height="75px" width="75px" src="/assets/images/octagon.jpg" />
          </td>
        </tr>
      </tbody>
    </table>
  </div>
  
  <div style="position: absolute; top:  785px; left: 25px;">
    <p>
      I hereby acknowledge that I have read, understood, and agree to abide <br>
      by the "General Rules" of the Manitoba Robot Games.
    </p>
  
    <p><br><br>Robot Operator Signature: _____________________________________________</p>
  </div>
  
  */
  {
    "id": "yPZBm8lB",
    "block": "[[[10,0],[14,5,\"position: absolute; top: 50px; left: 230px; text-align:center\"],[12],[1,\"\\n  \"],[10,\"h1\"],[12],[1,\"2016 Manitoba Robot Games\"],[10,\"br\"],[12],[13],[1,\"Router Sheet\"],[13],[1,\"\\n\"],[13],[1,\"\\n\"],[10,0],[14,5,\"position: absolute; left: 5px; top: 5px; padding: 1em;\"],[12],[1,\"\\n  \"],[10,\"img\"],[14,\"height\",\"200px\"],[14,\"width\",\"200px\"],[14,\"src\",\"/assets/images/robot.gif\"],[12],[13],[1,\"\\n\"],[13],[1,\"\\n\\n\"],[10,0],[14,5,\"position: absolute; left: 20px; top: 215px; padding: 5px;\"],[12],[1,\"\\n  \"],[10,2],[12],[1,\"\\n    Please read carefully.\"],[10,\"br\"],[12],[13],[1,\"\\n    \"],[10,\"b\"],[12],[1,\"This information will be used for certificates and awards.\"],[13],[1,\"\\n  \"],[13],[1,\"\\n  \"],[10,2],[12],[1,\"Please make changes clear and legible and present the completed sheet with your robot for registering.\"],[13],[1,\"\\n\"],[13],[1,\"\\n\\n\"],[10,0],[14,1,\"router-sheet-div\"],[12],[13],[1,\"\\n\"],[10,0],[14,5,\"position: absolute; left: 10px; top: 330px\"],[12],[1,\"\\n  \"],[10,\"table\"],[14,0,\"data\"],[12],[1,\"\\n    \"],[10,\"tbody\"],[12],[1,\"\\n      \"],[10,\"col\"],[14,\"width\",\"150\"],[12],[13],[1,\"\\n      \"],[10,\"col\"],[14,\"width\",\"300\"],[12],[13],[1,\"\\n      \"],[10,\"col\"],[14,\"width\",\"125\"],[12],[13],[1,\"\\n      \"],[10,\"col\"],[14,\"width\",\"50\"],[12],[13],[1,\"\\n      \"],[10,\"tr\"],[12],[1,\"\\n        \"],[10,\"td\"],[14,0,\"label\"],[12],[1,\"Competition:\"],[13],[1,\"\\n        \"],[10,\"td\"],[14,0,\"info\"],[12],[1,[31,0,[\"competition\"]]],[13],[1,\"\\n        \"],[10,\"td\"],[14,0,\"label\"],[12],[1,\"Amount Paid:\"],[13],[1,\"\\n        \"],[10,\"td\"],[14,0,\"info\"],[12],[1,\"$\"],[1,[31,0,[\"amount_paid\"]]],[13],[1,\"\\n      \"],[13],[1,\"\\n      \"],[10,\"tr\"],[12],[1,\"\\n        \"],[10,\"td\"],[14,0,\"label\"],[12],[1,\"Robot Name:\"],[13],[1,\"\\n        \"],[10,\"td\"],[14,0,\"info\"],[12],[1,[31,0,[\"robot\"]]],[13],[1,\"\\n      \"],[13],[1,\"\\n      \"],[10,\"tr\"],[12],[1,\"\\n        \"],[10,\"td\"],[14,0,\"label\"],[12],[1,\"Team Member 1:\"],[13],[1,\"\\n        \"],[10,\"td\"],[14,0,\"info\"],[12],[1,[31,0,[\"driver1\"]]],[13],[1,\"\\n        \"],[10,\"td\"],[14,0,\"label\"],[12],[1,\"Grade:\"],[13],[1,\"\\n        \"],[10,\"td\"],[14,0,\"info\"],[12],[1,[31,0,[\"driver1Gr\"]]],[13],[1,\"\\n      \"],[13],[1,\"\\n      \"],[10,\"tr\"],[12],[1,\"\\n        \"],[10,\"td\"],[14,0,\"label\"],[12],[1,\"Team Member 2:\"],[13],[1,\"\\n        \"],[10,\"td\"],[14,0,\"info\"],[12],[1,[31,0,[\"driver2\"]]],[13],[1,\"\\n        \"],[10,\"td\"],[14,0,\"label\"],[12],[1,\"Grade:\"],[13],[1,\"\\n        \"],[10,\"td\"],[14,0,\"info\"],[12],[1,[31,0,[\"driver2Gr\"]]],[13],[1,\"\\n      \"],[13],[1,\"\\n      \"],[10,\"tr\"],[12],[1,\"\\n        \"],[10,\"td\"],[14,0,\"label\"],[12],[1,\"Team Member 3:\"],[13],[1,\"\\n        \"],[10,\"td\"],[14,0,\"info\"],[12],[1,[31,0,[\"driver3\"]]],[13],[1,\"\\n        \"],[10,\"td\"],[14,0,\"label\"],[12],[1,\"Grade:\"],[13],[1,\"\\n        \"],[10,\"td\"],[14,0,\"info\"],[12],[1,[31,0,[\"driver3Gr\"]]],[13],[1,\"\\n      \"],[13],[1,\"\\n      \"],[10,\"tr\"],[12],[1,\"\\n        \"],[10,\"td\"],[14,0,\"label\"],[12],[1,\"School Attending:\"],[13],[1,\"\\n        \"],[10,\"td\"],[14,0,\"info\"],[14,\"colspan\",\"3\"],[12],[1,[31,0,[\"school\"]]],[13],[1,\"\\n      \"],[13],[1,\"\\n      \"],[10,\"tr\"],[12],[1,\"\\n        \"],[10,\"td\"],[14,0,\"label\"],[14,5,\"text-align: left;\"],[14,\"colspan\",\"2\"],[12],[1,\"Contact Information:\"],[13],[1,\"\\n      \"],[13],[1,\"\\n      \"],[10,\"tr\"],[12],[1,\"\\n        \"],[10,\"td\"],[14,0,\"label\"],[12],[1,\"Phone:\"],[13],[1,\"\\n        \"],[10,\"td\"],[14,0,\"info\"],[14,\"colspan\",\"3\"],[12],[1,[31,0,[\"ph\"]]],[13],[1,\"\\n      \"],[13],[1,\"\\n      \"],[10,\"tr\"],[12],[1,\"\\n        \"],[10,\"td\"],[14,0,\"label\"],[12],[1,\"Email:\"],[13],[1,\"\\n        \"],[10,\"td\"],[14,0,\"info\"],[14,\"colspan\",\"3\"],[12],[1,[31,0,[\"email\"]]],[13],[1,\"\\n      \"],[13],[1,\"\\n      \"],[10,\"tr\"],[12],[1,\"\\n        \"],[10,\"td\"],[14,0,\"label\"],[12],[1,\"Address:\"],[13],[1,\"\\n        \"],[10,\"td\"],[14,0,\"info\"],[14,\"colspan\",\"3\"],[12],[1,[31,0,[\"address\"]]],[13],[1,\"\\n      \"],[13],[1,\"\\n      \"],[10,\"tr\"],[12],[1,\"\\n        \"],[10,\"td\"],[12],[13],[1,\"\\n        \"],[10,\"td\"],[12],[13],[1,\"\\n        \"],[10,\"td\"],[12],[13],[1,\"\\n        \"],[10,\"td\"],[14,0,\"label\"],[14,5,\"text-align: center; padding: 5px\"],[12],[1,\"#: \"],[1,[34,1]],[13],[1,\"\\n      \"],[13],[1,\"\\n      \"],[10,\"tr\"],[12],[1,\"\\n        \"],[10,\"td\"],[14,0,\"label\"],[14,\"colspan\",\"3\"],[12],[1,\"Ring assignment code:\"],[13],[1,\"\\n        \"],[10,\"td\"],[14,\"colspan\",\"2\"],[14,5,\"text-align: center; padding: 0px\"],[12],[1,\"\\n          \"],[10,\"img\"],[14,\"height\",\"75px\"],[14,\"width\",\"75px\"],[14,\"src\",\"/assets/images/octagon.jpg\"],[12],[13],[1,\"\\n        \"],[13],[1,\"\\n      \"],[13],[1,\"\\n    \"],[13],[1,\"\\n  \"],[13],[1,\"\\n\"],[13],[1,\"\\n\\n\"],[10,0],[14,5,\"position: absolute; top:  785px; left: 25px;\"],[12],[1,\"\\n  \"],[10,2],[12],[1,\"\\n    I hereby acknowledge that I have read, understood, and agree to abide \"],[10,\"br\"],[12],[13],[1,\"\\n    by the \\\"General Rules\\\" of the Manitoba Robot Games.\\n  \"],[13],[1,\"\\n\\n  \"],[10,2],[12],[10,\"br\"],[12],[13],[10,\"br\"],[12],[13],[1,\"Robot Operator Signature: _____________________________________________\"],[13],[1,\"\\n\"],[13],[1,\"\\n\"]],[],false,[\"model\",\"id\"]]",
    "moduleName": "mrg-sign-in/templates/robots/info.hbs",
    "isStrictMode": false
  });
  _exports.default = _default;
});
;define("mrg-sign-in/templates/robots/new", ["exports", "@ember/template-factory"], function (_exports, _templateFactory) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  0; //eaimeta@70e063a35619d71f0,"ember-cli-htmlbars"eaimeta@70e063a35619d71f
  var _default = (0, _templateFactory.createTemplateFactory)(
  /*
    &nbsp;
  <p>Adding a new Entry!</p>
  {{#with (changeset this.model.robot this.RobotValidation) as |c|}}
    <RobotDetail @changeset={{c}} @competitions={{this.model.competitions}} />
    <button {{on "click" (fn this.save c)}} disabled={{c.isInvalid}}>
      Save Changes
    </button>
  {{/with}}
  
  */
  {
    "id": "mrJdp5v7",
    "block": "[[[1,\" \\n\"],[10,2],[12],[1,\"Adding a new Entry!\"],[13],[1,\"\\n\"],[43,[28,[37,1],[[30,0,[\"model\",\"robot\"]],[30,0,[\"RobotValidation\"]]],null],[[[1,\"  \"],[8,[39,2],null,[[\"@changeset\",\"@competitions\"],[[30,1],[30,0,[\"model\",\"competitions\"]]]],null],[1,\"\\n  \"],[11,\"button\"],[16,\"disabled\",[30,1,[\"isInvalid\"]]],[4,[38,3],[\"click\",[28,[37,4],[[30,0,[\"save\"]],[30,1]],null]],null],[12],[1,\"\\n    Save Changes\\n  \"],[13],[1,\"\\n\"]],[1]],null]],[\"c\"],false,[\"with\",\"changeset\",\"robot-detail\",\"on\",\"fn\"]]",
    "moduleName": "mrg-sign-in/templates/robots/new.hbs",
    "isStrictMode": false
  });
  _exports.default = _default;
});
;define("mrg-sign-in/transforms/boolean", ["exports", "@ember-data/serializer/-private"], function (_exports, _private) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function () {
      return _private.BooleanTransform;
    }
  });
  0; //eaimeta@70e063a35619d71f0,"@ember-data/serializer/-private"eaimeta@70e063a35619d71f
});
;define("mrg-sign-in/transforms/date", ["exports", "@ember-data/serializer/-private"], function (_exports, _private) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function () {
      return _private.DateTransform;
    }
  });
  0; //eaimeta@70e063a35619d71f0,"@ember-data/serializer/-private"eaimeta@70e063a35619d71f
});
;define("mrg-sign-in/transforms/number", ["exports", "@ember-data/serializer/-private"], function (_exports, _private) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function () {
      return _private.NumberTransform;
    }
  });
  0; //eaimeta@70e063a35619d71f0,"@ember-data/serializer/-private"eaimeta@70e063a35619d71f
});
;define("mrg-sign-in/transforms/string", ["exports", "@ember-data/serializer/-private"], function (_exports, _private) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function () {
      return _private.StringTransform;
    }
  });
  0; //eaimeta@70e063a35619d71f0,"@ember-data/serializer/-private"eaimeta@70e063a35619d71f
});
;define("mrg-sign-in/validations/robot", ["exports", "ember-changeset-validations/validators"], function (_exports, _validators) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  0; //eaimeta@70e063a35619d71f0,"ember-changeset-validations/validators"eaimeta@70e063a35619d71f
  function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
  function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
  function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); } //export default function validateRobot(/* options = {} */) {
  // return (/* key, newValue, oldValue, changes, content */) => {
  //   return true;
  //  };
  //}
  class RobotValidation extends Object {
    constructor() {
      super(...arguments);
      _defineProperty(this, "robot", [(0, _validators.validateLength)({
        min: 1,
        max: 28
      }), (0, _validators.validatePresence)(true)]);
      _defineProperty(this, "school", (0, _validators.validateLength)({
        max: 150
      }));
      _defineProperty(this, "driver1", (0, _validators.validatePresence)(true));
      _defineProperty(this, "coach", (0, _validators.validatePresence)(true));
      _defineProperty(this, "ph", (0, _validators.validateFormat)({
        type: 'phone'
      }));
      _defineProperty(this, "email", (0, _validators.validateFormat)({
        type: 'email'
      }));
    }
  }
  _exports.default = RobotValidation;
});
;

;define('mrg-sign-in/config/environment', [], function() {
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

;
          if (!runningTests) {
            require("mrg-sign-in/app")["default"].create({"name":"mrg-sign-in","version":"0.0.0+2bbe1a2e"});
          }
        
//# sourceMappingURL=mrg-sign-in.map
