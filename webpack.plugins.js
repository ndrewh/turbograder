const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const PreactRefreshPlugin = require('@prefresh/webpack')

module.exports = [
  new ForkTsCheckerWebpackPlugin(),
  new PreactRefreshPlugin()
];
