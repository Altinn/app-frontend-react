const common = require('./webpack.config.development');

module.exports = {
  ...common,
  devServer: {
    ...common.devServer,
    host: '0.0.0.0', // docker needs to bind to public interface in container
  },
  watchOptions: {
    ignored: '**/node_modules',
    poll: 60000,
  },
};
