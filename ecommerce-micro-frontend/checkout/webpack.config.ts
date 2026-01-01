import { composePlugins, withNx } from '@nx/webpack';
import { withReact } from '@nx/react';
import { withModuleFederation } from '@nx/module-federation/webpack.js';
import { DefinePlugin } from 'webpack';

import baseConfig from './module-federation.config';

const envVars = Object.keys(process.env)
  .filter((key) => key.startsWith('NX_'))
  .reduce((acc, key) => {
    acc[`process.env.${key}`] = JSON.stringify(process.env[key]);
    return acc;
  }, {} as Record<string, string>);

export default composePlugins(
  withNx(),
  withReact(),
  withModuleFederation(baseConfig, {
    dts: false,
  }),
  (config) => {
    config.plugins = config.plugins || [];
    config.plugins.push(new DefinePlugin(envVars));

    if (config.resolve) {
      const path = require('path');
      config.resolve.alias = {
        ...config.resolve.alias,
        '@ecommerce-platform/auth-provider': path.resolve(
          __dirname,
          '../packages/auth-provider/src/index.ts'
        ),
      };
    }

    return config;
  }
);
