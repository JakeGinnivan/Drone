import React from 'react'
import Header from './header.js'
import Footer from './footer.js'

export default class AppLayout extends React.Component {
  constructor(props) {
    super(props)
  }

  render() {
    return (
      <div>
        <Header />
        {this.props.children}
        <Footer />
      </div>
    )
  }
}
