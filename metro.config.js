const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Support WASM files for expo-sqlite web backend
config.resolver.assetExts.push('wasm');

module.exports = config;
