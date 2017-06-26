const WebpackDevServer = require("webpack-dev-server");
const webpack = require("webpack");
const config = require("./webpack.config.js");
const compiler = webpack(config);
const argv = process.argv;
const host = argv[2] || 'localhost';
const port = argv[3] || 8080;

config.entry.index.unshift("webpack-dev-server/client?http://" + host + ":" + port + "/", "webpack/hot/dev-server");


var server = new WebpackDevServer(compiler, {
  contentBase: "dist",
  hot: true,
  inline: true,
  // historyApiFallback: true,
  historyApiFallback: false,
  compress: true,
  watchOptions: {
    aggregateTimeout: 300,
    poll: 1000
  },
  watchContentBase: true,
  stats: {
    colors: true,
    children: false

  }
});
server.listen(port, host, function() {
  console.log(`> Listening at http://${host}:${port} \n> Compiling... \n`);
});
