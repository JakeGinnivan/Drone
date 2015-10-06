import React from 'react'
import { renderToString } from 'react-dom/server'
import { match, RoutingContext } from 'react-router'
import createLocation from 'history/lib/createLocation'
import routes from './routes'

function index(innerHtml) {
  return `<html>
  <head>
    <title>Lackey</title>
    <link rel="stylesheet" type="text/css" href="styles.css">
    <meta name="viewport" content="width=device-width, initial-scale=1">
  </head>
  <body>
    <div id="container">${innerHtml}</div>
    <script src="vendor.bundle.js"></script>
    <script src="browser.js"></script>
  </body>
</html>
`
}

var configureServer = function(expressServer) {
  expressServer.use(function(req, res) {
    console.log('resolving', req.url)
    // Note that req.url here should be the full URL path from
    // the original request, including the query string.
    match({ routes, location: createLocation(req.url) }, (error, redirectLocation, renderProps) => {
      console.log('called back')
      if (error) {
        res.status(500).send(error.message)
      } else if (redirectLocation) {
        res.redirect(302, redirectLocation.pathname + redirectLocation.search)
      } else if (renderProps) {
        let html = renderToString(<RoutingContext {...renderProps} />)
        res.status(200).send(index(html))
      } else {
        res.status(404).send('Not found')
      }
    })
  })
}

export default configureServer;
