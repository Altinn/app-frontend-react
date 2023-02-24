const production = require('./webpack.config.production');

module.exports = {
  ...production,
  devtool: 'inline-source-map',
};
