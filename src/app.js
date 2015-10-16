import React from 'react'
import ReactDOM from 'react-dom'
import {
  ReduxRouter,
  routerStateReducer,
  reduxReactRouter
} from 'redux-router'
import Routes from './routes'
import createHistory from 'history/lib/createBrowserHistory'
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
  reduxReactRouter({ createHistory }) //, devTools()
)(createStore)(reducer, initialState)

ReactDOM.render(
  <Provider store={store}>
    <ReduxRouter>{Routes}</ReduxRouter>
  </Provider>,
  document.getElementById('container')
)
