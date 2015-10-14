import React from 'react'
import Header from './header.js'
import Footer from './footer.js'
import { connect } from 'react-redux'

class Layout extends React.Component {
  constructor(props) { super(props) }

  render() {
      if (!this.props.authenticated) {
      return (
        <div><a href={'/auth/github/login?redirect='}>Login</a> with github before using drone</div>
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

export default connect(s => {
  console.log(s)
  return {
    authenticated: s.authenticated,
    location: s.router.location
  }
})(Layout)
