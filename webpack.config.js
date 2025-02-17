const path = require('path');

module.exports = {
  entry: './src/client/game.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'public/dist')
  },
  mode: 'development',
  devtool: 'source-map'
};
