const path = require('path');

module.exports = {
  mode: "development",
  entry: './js/maincontroller.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'static')
  },
  devServer: {
    contentBase: path.join(__dirname, "static"),
    disableHostCheck: true,
    compress: true,
    port: 9000
  }
};
