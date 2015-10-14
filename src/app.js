import React from 'react'
import ReactDOM from 'react-dom'
import {
  ReduxRouter,
  routerStateReducer,
  reduxReactRouter
} from 'redux-router'
import Routes from './routes'
import createBrowserHistory from 'history/lib/createBrowserHistory'
import drone from './reducers/drone'

import { createStore, compose, combineReducers } from 'redux'
import { Provider } from 'react-redux'

// Grab the state from a global injected into server-generated HTML
const initialState = window.__INITIAL_STATE__
const reducer = combineReducers({
  router: routerStateReducer,
  drone
})

let store = compose(
  reduxReactRouter({ createBrowserHistory }) //, devTools()
)(createStore)(reducer, initialState)

// IE fix, not even sure if I need this, oh well.
if (!window.location.origin) {
  window.location.origin = window.location.protocol + "//" + window.location.hostname + (window.location.port ? ':' + window.location.port: '')
}

ReactDOM.render(
  <Provider store={store}>
    <ReduxRouter history={createBrowserHistory()}>{Routes}</ReduxRouter>
  </Provider>,
  document.getElementById('container')
)
