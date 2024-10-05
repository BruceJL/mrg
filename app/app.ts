import Application from '@ember/application';
import Resolver from 'ember-resolver';
import loadInitializers from 'ember-load-initializers';
import config from 'mrg-sign-in/config/environment';

export default class App extends Application {
  modulePrefix = config.modulePrefix;
  podModulePrefix = config.podModulePrefix;
  Resolver = Resolver;
}

loadInitializers(App, config.modulePrefix);

// as per https://blog.emberjs.com/stable-typescript-types-in-ember-5-1/
/**
 * @typedef {import('ember-source/types')} EmberTypes
 */
