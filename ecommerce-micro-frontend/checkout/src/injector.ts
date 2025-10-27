import { createAppInjector, AppInjectorProps } from '@ecommerce/app-injector';
import CheckoutModule from './app/Module';

/**
 * Checkout App Injector
 *
 * This creates standardized inject/unmount methods for the Checkout micro-frontend.
 * Used by the host application to dynamically load and unload this remote app.
 */
const CheckoutAppInjector = createAppInjector(CheckoutModule);

/**
 * Inject the Checkout app into a DOM element
 *
 * @param elementId - The ID of the DOM element to inject into
 * @param props - Configuration and props to pass to the Checkout app
 *
 * @example
 * ```typescript
 * inject('checkout-container', {
 *   config: {
 *     appContext: {
 *       user: currentUser,
 *       token: authToken,
 *       theme: 'light'
 *     },
 *     onNavigate: (path) => navigate(path),
 *     onError: (error) => console.error(error)
 *   }
 * });
 * ```
 */
export const inject = (elementId: string, props?: AppInjectorProps) => {
  CheckoutAppInjector.inject(elementId, props);
};

/**
 * Unmount the Checkout app from a DOM element
 *
 * @param elementId - The ID of the DOM element to unmount from
 *
 * @example
 * ```typescript
 * unmount('checkout-container');
 * ```
 */
export const unmount = (elementId: string) => {
  CheckoutAppInjector.unmount(elementId);
};

// Default export for Module Federation
export default {
  inject,
  unmount,
};
