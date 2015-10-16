/*eslint "no-console":0*/
require("babel/register")
var path = require('path')
require('app-module-path').addPath(path.join(__dirname, 'src'))

console.log('Starting express server')

var port = process.env.PORT || 4444

console.log('Will use port ' + port)

var express = require('express'),
    session = require('express-session'),
    bodyParser = require('body-parser'),
    app = express(),
    configureServer = require('./src/server_index'),
    configureServerRoutes = require('./src/server_routes'),
    sess = {
      secret: 'drone',
      resave: false,
      saveUninitialized: true,
      cookie: { httpOnly: false }
    }


if (app.get('env') === 'production') {
  app.set('trust proxy', 1) // trust first proxy
  sess.cookie.secure = true // serve secure cookies
}

app.use(bodyParser.json())
app.use(function (req, res, next) {
  req.root = `${req.protocol}://${req.get('host')}`
  next()
})

app.use(session(sess))

configureServer(app)
configureServerRoutes(app)
app.use(express.static(path.join(__dirname, 'dist')))

app.listen(port)
console.log('Server is Up and Running at Port : ' +  port)

if (port === 4444) {
  // we start a webpack-dev-server with our config
  var webpack = require('webpack')
  var WebpackDevServer = require('webpack-dev-server')
  var config = require('./webpack.config.js')

  var compiler = webpack(config)
  var server = new WebpackDevServer(compiler, {
    proxy: {
      "*": "http://localhost:4444"
    },
    stats: {colors: true}
  })
  server.listen(8090, 'localhost', function (err) {
    if (err) {
      console.log(err)
    }

    console.log('Listening at localhost:8090')
  })
}
