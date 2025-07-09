const { getDefaultConfig } = require('@expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add this to support CJS modules
config.resolver.sourceExts.push('cjs');

// Add this to disable experimental features that conflict with Firebase
config.resolver.unstable_enablePackageExports = false;

// More aggressive tslib resolution for Cloud IDE
config.resolver.alias = {
    tslib: require.resolve('tslib/tslib.es6.js'),
  };

// Force resolver to prioritize our alias
config.resolver.resolverMainFields = ['react-native', 'browser', 'main'];

// Add platforms to ensure proper resolution
config.resolver.platforms = ['native', 'web', 'ios', 'android'];

module.exports = config;