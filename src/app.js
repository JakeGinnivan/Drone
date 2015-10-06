import React from 'react'
import ReactDOM from 'react-dom'
import { Router } from 'react-router'
import Routes from './routes'
import createBrowserHistory from 'history/lib/createBrowserHistory'

ReactDOM.render(<Router history={createBrowserHistory()}>{Routes}</Router>, document.getElementById("container"))
