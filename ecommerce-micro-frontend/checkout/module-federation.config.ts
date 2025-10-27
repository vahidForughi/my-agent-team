import { ModuleFederationConfig } from '@nx/module-federation';

const config: ModuleFederationConfig = {
  name: 'checkout',
  exposes: {
    './Module': './src/remote-entry.ts',
  },
  shared: (libraryName, defaultConfig) => {
    // Critical shared libraries that MUST be singletons
    if (libraryName === 'react' || libraryName === 'react-dom') {
      return {
        singleton: true,
        strictVersion: false,
        requiredVersion: false,
        eager: false, // Remotes wait for host's version
        import: false, // Don't bundle, expect from host
      };
    }

    // Share Ant Design as singleton
    if (libraryName === 'antd' || libraryName.startsWith('antd/')) {
      return {
        singleton: true,
        strictVersion: false,
        requiredVersion: false,
        eager: false,
        import: false, // Don't bundle, expect from host
      };
    }

    // Share Ant Design Icons
    if (
      libraryName === '@ant-design/icons' ||
      libraryName.startsWith('@ant-design/icons/')
    ) {
      return {
        singleton: true,
        strictVersion: false,
        requiredVersion: false,
        eager: false,
        import: false, // Don't bundle, expect from host
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
