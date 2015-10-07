import React from 'react'
import Header from './header.js'
import Footer from './footer.js'
import { connect } from 'react-redux'

class Layout extends React.Component {
  constructor(props) { super(props) }

  render() {
      if (!this.props.authenticated) {
      return (
        <div><a href="/auth/github/login">Login</a> with github before using lackey</div>
      )
    }
    return (
      <div>
        <Header />
        {this.props.children}
        <Footer />
      </div>
    )
  }
}

export default connect(s => ({ authenticated: s.authenticated }))(Layout)
