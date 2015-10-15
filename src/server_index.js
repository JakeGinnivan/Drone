import React from 'react'
import ReactDOMServer from 'react-dom/server'
import { ReduxRouter, routerStateReducer } from 'redux-router'
import { reduxReactRouter, match } from 'redux-router/server'
import routes from './routes'

import drone from './reducers/drone'
import { createStore, compose, combineReducers } from 'redux'
import { Provider } from 'react-redux'

import _ from 'lodash'

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
    const reducer = combineReducers({
      router: routerStateReducer,
      drone
    })
    const store = compose(
      reduxReactRouter({ routes })
    )(createStore)(reducer)
    store.dispatch(match(req.url, (error, redirectLocation, renderProps) => {
      if (!error && !redirectLocation && renderProps) {

        if (req.session.githubToken)
          store.dispatch({ type: 'LOGGED_IN', githubToken: req.session.githubToken })

        let loadDataPromises = _(renderProps.components)
          .filter(c => c.preloadStore)
          .map(c => c.preloadStore(store))
          .value()

        Promise
          .all(loadDataPromises)
          .then(() => {
            var app = <Provider store={store}><ReduxRouter {...renderProps} /></Provider>
            try {
              var html = ReactDOMServer.renderToString(app)
              var result = index(html, store.getState())
              res.status(200).send(result)
            } catch (e) {
              console.log('Failed to render', e)
            }
          })
      } else {
        next()
      }
    }))
  })
}
