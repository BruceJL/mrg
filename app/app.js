import Application from '@ember/application';
import Resolver from './resolver';
import loadInitializers from 'ember-load-initializers';
import config from './config/environment';

export default class App extends Application {
  modulePrefix = config.modulePrefix;
  podModulePrefix = config.podModulePrefix;
  Resolver = Resolver;

  // debugging
  LOG_TRANSITIONS = true;
  LOG_RESOLVER = true;
}

loadInitializers(App, config.modulePrefix);
