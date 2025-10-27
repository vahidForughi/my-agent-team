/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import * as ReactDOM from 'react-dom';
import { AppInjectorProps, InjectorContainer, AppInjector } from './types';
import { isSupportCreateRoot } from './isSupportCreateRootUtils';

/**
 * Creates a higher-order function that provides standardized inject and unmount methods
 * for any React component to be used in a micro-frontend architecture
 *
 * @param AppComponent The React component to be injected
 * @returns An object with inject and unmount functions
 *
 * @example
 * ```tsx
 * import { createAppInjector } from '@ecommerce/app-injector';
 * import MyApp from './MyApp';
 *
 * const MyAppInjector = createAppInjector(MyApp);
 *
 * // Later in your code
 * MyAppInjector.inject('app-container', {
 *   config: {
 *     appContext: { user: currentUser },
 *     onNavigate: handleNavigate
 *   }
 * });
 *
 * // When unmounting
 * MyAppInjector.unmount('app-container');
 * ```
 */
export function createAppInjector(
  AppComponent: React.ComponentType<any>
): AppInjector {
  /**
   * Injects the component into the specified parent element
   *
   * @param parentElementId The ID of the parent element to inject into
   * @param props Props to pass to the component including config
   * @returns void
   */
  const inject = (parentElementId: string, props: AppInjectorProps = {}) => {
    const container = document.getElementById(
      parentElementId
    ) as InjectorContainer | null;

    if (!container) {
      console.error(
        `[AppInjector] Container element with id "${parentElementId}" not found`
      );
      return;
    }

    const supportsCreateRoot = isSupportCreateRoot();

    try {
      if (supportsCreateRoot) {
        // React 18+ rendering
        const { createRoot } = require('react-dom/client');
        const root = createRoot(container);
        root.render(<AppComponent {...props} />);

        // Store the root instance on the container to be able to unmount it later
        container.__root = root;
      } else {
        // React 16/17 rendering (fallback)
        // @ts-expect-error - ReactDOM.render exists in React 16/17 but not in React 19 types
        ReactDOM.render(<AppComponent {...props} />, container);
      }
    } catch (error) {
      console.error('[AppInjector] Error injecting component:', error);
      if (props.config?.onError) {
        props.config.onError(error as Error);
      }
    }
  };

  /**
   * Unmounts the component from the specified parent element
   *
   * @param parentElementId The ID of the parent element to unmount from
   * @returns void
   */
  const unmount = (parentElementId: string) => {
    const container = document.getElementById(
      parentElementId
    ) as InjectorContainer | null;

    if (!container) {
      console.error(
        `[AppInjector] Container element with id "${parentElementId}" not found`
      );
      return;
    }

    const supportsCreateRoot = isSupportCreateRoot();

    try {
      if (supportsCreateRoot) {
        // React 18+ unmounting
        if (container.__root) {
          container.__root.unmount();
          delete container.__root;
        }
      } else {
        // React 16/17 unmounting (fallback)
        // @ts-expect-error - unmountComponentAtNode exists in React 16/17 but not in React 19 types
        ReactDOM.unmountComponentAtNode(container);
      }
    } catch (error) {
      console.error('[AppInjector] Error unmounting component:', error);
    }
  };

  return {
    inject,
    unmount,
  };
}
