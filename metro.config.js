const { getDefaultConfig } = require('@expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add this to support CJS modules
config.resolver.sourceExts.push('cjs');

// Add this to disable experimental features that conflict with Firebase
config.resolver.unstable_enablePackageExports = false;
config.resolver.alias = {
    tslib: 'tslib/tslib.es6.js',
  };

module.exports = config;