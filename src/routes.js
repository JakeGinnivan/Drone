import React from 'react'
import {Route, IndexRoute} from 'react-router'
import AppLayout from './components/layout.js'
import Home from './components/home.js'
import About from './components/about.js'

export default (
  <Route path="/" component={AppLayout}>
    <IndexRoute component={Home} />
    <Route path="about" component={About}/>
  </Route>
);
