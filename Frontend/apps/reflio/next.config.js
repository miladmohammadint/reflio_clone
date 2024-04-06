const path = require('path');

require("dotenv").config({ path: "../../.env" });
const withTM = require("next-transpile-modules")(["ui"]);

const nextConfig = {
  webpack(config) {
    config.resolve.alias['@'] = path.join(__dirname, 'src');
    return config;
  },
};

if (process.env.SENTRY_AUTH_TOKEN) {
  const { withSentryConfig } = require('@sentry/nextjs');
  
  const sentryWebpackPluginOptions = {
    authToken: process.env.SENTRY_AUTH_TOKEN,
    silent: true
  };
  
  module.exports = withTM(withSentryConfig(nextConfig, {
    images: {
      domains: ['s2.googleusercontent.com'],
    },
    sentryWebpackPluginOptions
  }));
} else {
  module.exports = withTM(nextConfig, {
    images: {
      domains: ['s2.googleusercontent.com'],
    }
  });
}
