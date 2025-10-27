/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import * as ReactDOM from 'react-dom';
import {
  AppInjectorProps,
  InjectorContainer,
  EnhancedAppInjector,
} from './types';
import { isSupportCreateRoot } from './isSupportCreateRootUtils';

export interface InjectorOptions {
  /**
   * Number of retries on injection failure
   * @default 3
   */
  maxRetries?: number;

  /**
   * Delay between retries in milliseconds
   * @default 1000
   */
  retryDelay?: number;

  /**
   * Enable detailed logging
   * @default false
   */
  debug?: boolean;

  /**
   * Callback when injection succeeds
   */
  onSuccess?: (elementId: string) => void;

  /**
   * Callback when injection fails after all retries
   */
  onFailure?: (elementId: string, error: Error) => void;
}

/**
 * Creates an enhanced app injector with retry logic and better error handling
 *
 * @param AppComponent The React component to be injected
 * @param options Configuration options for the injector
 * @returns An object with inject and unmount functions with retry capabilities
 *
 * @example
 * ```tsx
 * const MyAppInjector = createEnhancedAppInjector(MyApp, {
 *   maxRetries: 3,
 *   retryDelay: 1000,
 *   debug: true,
 *   onSuccess: (id) => console.log(`Successfully injected into ${id}`),
 *   onFailure: (id, error) => console.error(`Failed to inject into ${id}`, error)
 * });
 * ```
 */
export function createEnhancedAppInjector(
  AppComponent: React.ComponentType<any>,
  options: InjectorOptions = {}
): EnhancedAppInjector {
  const {
    maxRetries = 3,
    retryDelay = 1000,
    debug = false,
    onSuccess,
    onFailure,
  } = options;

  const log = (...args: any[]) => {
    if (debug) {
      console.log('[EnhancedAppInjector]', ...args);
    }
  };

  const logError = (...args: any[]) => {
    console.error('[EnhancedAppInjector]', ...args);
  };

  /**
   * Wait for element to be available in DOM
   */
  const waitForElement = (
    elementId: string,
    timeout = 5000
  ): Promise<HTMLElement> => {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();

      const checkElement = () => {
        const element = document.getElementById(elementId);

        if (element) {
          resolve(element);
          return;
        }

        if (Date.now() - startTime > timeout) {
          reject(
            new Error(
              `Timeout waiting for element with id "${elementId}" to be available`
            )
          );
          return;
        }

        requestAnimationFrame(checkElement);
      };

      checkElement();
    });
  };

  /**
   * Delay utility
   */
  const delay = (ms: number): Promise<void> => {
    return new Promise((resolve) => setTimeout(resolve, ms));
  };

  /**
   * Inject component with retry logic
   */
  const inject = async (
    parentElementId: string,
    props: AppInjectorProps = {}
  ): Promise<void> => {
    log(`Starting injection into "${parentElementId}"`);

    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        log(`Attempt ${attempt}/${maxRetries} for "${parentElementId}"`);

        // Wait for element to be available
        const container = (await waitForElement(
          parentElementId
        )) as InjectorContainer;

        if (!container) {
          throw new Error(
            `Container element with id "${parentElementId}" not found`
          );
        }

        const supportsCreateRoot = isSupportCreateRoot();

        if (supportsCreateRoot) {
          // React 18+ rendering
          log('Using React 18+ createRoot');
          const { createRoot } = require('react-dom/client');
          const root = createRoot(container);
          root.render(<AppComponent {...props} />);
          container.__root = root;
        } else {
          // React 16/17 rendering (fallback)
          log('Using React 16/17 render');
          // @ts-expect-error - ReactDOM.render exists in React 16/17 but not in React 19 types
          ReactDOM.render(<AppComponent {...props} />, container);
        }

        log(`Successfully injected into "${parentElementId}"`);
        onSuccess?.(parentElementId);
        return;
      } catch (error) {
        lastError = error as Error;
        logError(
          `Attempt ${attempt}/${maxRetries} failed for "${parentElementId}":`,
          error
        );

        // Call config error handler if provided
        if (props.config?.onError) {
          props.config.onError(lastError);
        }

        // If not the last attempt, wait before retrying
        if (attempt < maxRetries) {
          log(`Waiting ${retryDelay}ms before retry...`);
          await delay(retryDelay);
        }
      }
    }

    // All retries failed
    const finalError =
      lastError ||
      new Error(
        `Failed to inject into "${parentElementId}" after ${maxRetries} attempts`
      );
    logError(
      `All injection attempts failed for "${parentElementId}"`,
      finalError
    );
    onFailure?.(parentElementId, finalError);

    throw finalError;
  };

  /**
   * Unmount component with error handling
   */
  const unmount = (parentElementId: string): void => {
    log(`Starting unmount from "${parentElementId}"`);

    const container = document.getElementById(
      parentElementId
    ) as InjectorContainer | null;

    if (!container) {
      logError(
        `Container element with id "${parentElementId}" not found during unmount`
      );
      return;
    }

    const supportsCreateRoot = isSupportCreateRoot();

    try {
      if (supportsCreateRoot) {
        // React 18+ unmounting
        if (container.__root) {
          log('Unmounting using React 18+ root.unmount()');
          container.__root.unmount();
          delete container.__root;
        } else {
          log('No root instance found to unmount');
        }
      } else {
        // React 16/17 unmounting (fallback)
        log('Unmounting using React 16/17 unmountComponentAtNode');
        // @ts-expect-error - unmountComponentAtNode exists in React 16/17 but not in React 19 types
        ReactDOM.unmountComponentAtNode(container);
      }

      log(`Successfully unmounted from "${parentElementId}"`);
    } catch (error) {
      logError(`Error unmounting from "${parentElementId}":`, error);
    }
  };

  /**
   * Check if component is currently injected
   */
  const isInjected = (parentElementId: string): boolean => {
    const container = document.getElementById(
      parentElementId
    ) as InjectorContainer | null;

    if (!container) {
      return false;
    }

    const supportsCreateRoot = isSupportCreateRoot();

    if (supportsCreateRoot) {
      return !!container.__root;
    }

    // For React 16/17, check if container has children
    return container.children.length > 0;
  };

  return {
    inject,
    unmount,
    isInjected,
  };
}
