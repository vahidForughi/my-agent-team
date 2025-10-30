import { ModuleFederationConfig } from '@nx/module-federation';

const config: ModuleFederationConfig = {
  name: 'host',
  /**
   * NO static remotes!
   * All micro frontends are loaded dynamically at runtime via @module-federation/enhanced/runtime
   * This enables true runtime independence and zero coupling between host and consumers.
   * 
   * See: host/src/microFe/MicroFrontendApp.tsx for dynamic loading implementation
   */
  shared: (libraryName, defaultConfig) => {
    // Critical shared libraries that MUST be singletons
    if (libraryName === 'react' || libraryName === 'react-dom') {
      return {
        ...defaultConfig,
        singleton: true,
        strictVersion: false,
        requiredVersion: false,
        eager: true, // Host loads these eagerly
      };
    }

    // Share Ant Design as singleton
    if (libraryName === 'antd' || libraryName.startsWith('antd/')) {
      return {
        ...defaultConfig,
        singleton: true,
        strictVersion: false,
        requiredVersion: false,
        eager: true,
      };
    }

    // Share Ant Design Icons
    if (libraryName === '@ant-design/icons' || libraryName.startsWith('@ant-design/icons/')) {
      return {
        ...defaultConfig,
        singleton: true,
        strictVersion: false,
        requiredVersion: false,
        eager: true,
      };
    }

    // Share other common libraries
    if (
      libraryName === 'react-router-dom' ||
      libraryName === '@tanstack/react-query' ||
      libraryName === 'zustand' ||
      libraryName === 'axios' ||
      libraryName === 'dayjs' ||
      libraryName === 'lodash'
    ) {
      return {
        ...defaultConfig,
        singleton: true,
        strictVersion: false,
        requiredVersion: false,
      };
    }

    return defaultConfig;
  },
};

/**
* Nx requires a default export of the config to allow correct resolution of the module federation graph.
**/
export default config;
