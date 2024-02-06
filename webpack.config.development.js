const ForkTsCheckerNotifierWebpackPlugin = require('fork-ts-checker-notifier-webpack-plugin');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const ReactRefreshTypeScript = require('react-refresh-typescript');

const common = require('./webpack.common');
const fs = require('fs');

const enableEnv = 'NOTIFY_ON_ERRORS';
const enableNotifier = !(enableEnv in process.env) || process.env[enableEnv] === 'true';

const plugins = [...common.plugins, new ReactRefreshWebpackPlugin()];

if (enableNotifier) {
  plugins.push(new ForkTsCheckerNotifierWebpackPlugin());
}

// Find the git current branch name from .git/HEAD. This is used in LocalTest to show you the current branch name.
// We can't just read this when starting, as you may want to switch branch while the dev server is running. This
// will be called every time you refresh/reload the dev server.
const branchName = {
  toString() {
    const hasGitFolder = fs.existsSync('.git');
    const gitHead = hasGitFolder ? fs.readFileSync('.git/HEAD', 'utf-8') : '';
    const ref = gitHead.match(/ref: refs\/heads\/([^\n]+)/);
    return ref ? ref[1] : 'unknown-branch';
  },
};

module.exports = {
  ...common,
  mode: 'development',
  devtool: 'inline-source-map',
  performance: {
    hints: 'warning',
  },
  module: {
    rules: [
      ...common.module.rules,
      {
        test: /\.tsx?/,
        use: [
          {
            loader: 'ts-loader',
            options: {
              getCustomTransformers: () => ({
                before: [ReactRefreshTypeScript()],
              }),
              transpileOnly: true,
            },
          },
        ],
      },
      {
        enforce: 'pre',
        test: /\.js$/,
        loader: 'source-map-loader',
      },
    ],
  },
  plugins,
  devServer: {
    historyApiFallback: true,
    allowedHosts: 'all',
    hot: true,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'X-Altinn-Frontend-Branch': branchName,
    },
    client: {
      overlay: {
        errors: true,
        warnings: false,
      },
    },
  },
};
