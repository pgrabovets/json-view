const path = require('path');

module.exports = {
  mode: 'production',
  entry: './src/json-view.js',
  output: {
    filename: 'jsonview.js',
    library: {
      name: 'jsonview',
      type: 'umd'
    },
    path: path.resolve(__dirname, 'dist'),
  },
};
