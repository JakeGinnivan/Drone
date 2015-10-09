import React from 'react'
import ReactDOM from 'react-dom'
import { Router } from 'react-router'
import Routes from './routes'
import createBrowserHistory from 'history/lib/createBrowserHistory'
import drone from './reducers/drone'

import { createStore } from 'redux'
import { Provider } from 'react-redux'

// Grab the state from a global injected into server-generated HTML
const initialState = window.__INITIAL_STATE__
let store = createStore(drone, initialState)

ReactDOM.render(
  <Provider store={store}>
    <Router history={createBrowserHistory()}>{Routes}</Router>
  </Provider>,
  document.getElementById('container')
)
