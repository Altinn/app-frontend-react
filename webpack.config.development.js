const ForkTsCheckerNotifierWebpackPlugin = require('fork-ts-checker-notifier-webpack-plugin');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { EsbuildPlugin } = require('esbuild-loader');

const common = require('./webpack.common');

const enableEnv = 'NOTIFY_ON_ERRORS';
const enableNotifier = !(enableEnv in process.env) || process.env[enableEnv] === 'true';

const plugins = [...common.plugins, new ReactRefreshWebpackPlugin()];

if (enableNotifier) {
  plugins.push(new ForkTsCheckerNotifierWebpackPlugin());
}

module.exports = {
  ...common,
  mode: 'development',
  devtool: 'inline-source-map',
  performance: {
    // We should fix this here: https://github.com/Altinn/app-frontend-react/issues/1597
    hints: false,
  },
  optimization: {
    minimizer: [
      new EsbuildPlugin({
        target: 'es2020',
        css: true,
      }),
    ],
  },
  module: {
    rules: [
      {
        test: /\.[jt]sx?$/,
        loader: 'esbuild-loader',
        options: {
          target: 'es2020',
        },
      },
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader'],
      },
      {
        test: /\.png$/,
        type: 'asset/resource',
      },
    ],
  },
  plugins,
  devServer: {
    historyApiFallback: true,
    allowedHosts: 'all',
    hot: true,
    headers: { 'Access-Control-Allow-Origin': '*' },
    client: {
      overlay: {
        errors: true,
        warnings: false,
      },
    },
  },
};
