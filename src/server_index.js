import React from 'react'
import { renderToString } from 'react-dom/server'
import { match, RoutingContext } from 'react-router'
import createLocation from 'history/lib/createLocation'
import routes from './routes'

import lackey from './reducers/lackey'
import { createStore } from 'redux'
import { Provider } from 'react-redux'

function index(innerHtml, initialState) {
  return `<html>
  <head>
    <title>Lackey</title>
    <link rel="stylesheet" type="text/css" href="styles.css">
    <meta name="viewport" content="width=device-width, initial-scale=1">
  </head>
  <body>
    <div id="container">${innerHtml}</div>
    <script src="vendor.bundle.js"></script>
    <script>
      window.__INITIAL_STATE__ = ${JSON.stringify(initialState)};
    </script>
    <script src="browser.js"></script>
  </body>
</html>
`
}

export default function(expressServer) {
  expressServer.use(function(req, res, next) {
    match({ routes, location: createLocation(req.url) }, (error, redirectLocation, renderProps) => {
      if (!error && !redirectLocation && renderProps) {
        const store = createStore(lackey)
        console.log('session:', req.session)
        if (req.session.githubToken)
          store.dispatch({ type: 'LOGGED_IN' })
        let html = renderToString(<Provider store={store}><RoutingContext {...renderProps} /></Provider>)
        res.status(200).send(index(html, store.getState()))
      } else {
        next()
      }
    })
  })
}
