// Main exports
export { createAppInjector } from './AppInjector';
export { createEnhancedAppInjector } from './enhancedAppInjector';
export type { InjectorOptions } from './enhancedAppInjector';
export { isSupportCreateRoot } from './isSupportCreateRootUtils';

// Environment utilities
export {
  isProductionEnv,
  isStagingEnv,
  isDevelopmentEnv,
  getEnvironment,
  isEcommerceApp,
  getApiBaseUrl,
  ECOMMERCE_PRD_HOSTNAME,
  ECOMMERCE_STG_HOSTNAME,
  ECOMMERCE_DEV_HOSTNAME,
} from './envUtils';

// Types
export type {
  User,
  AppContext,
  MicroFrontendConfig,
  AppInjectorProps,
  InjectorContainer,
  Environment,
  AppInjector,
  EnhancedAppInjector,
} from './types';
