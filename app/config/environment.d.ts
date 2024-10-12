export default config;

/**
 * Type declarations for
 *    import config from 'mrg-sign-in/config/environment'
 */
declare const config: {
  environment: string;
  modulePrefix: string;
  podModulePrefix: string;
  locationType: 'history' | 'hash' | 'none';
  rootURL: string;
  APP: Record<string, unknown>;
  SERVICE_WORKER: boolean;
};
