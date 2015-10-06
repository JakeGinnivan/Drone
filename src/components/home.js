import React from 'react'
import { Link } from 'react-router'

export default class Footer extends React.Component {
  constructor(props) {
    super(props)
  }

  render() {
    return (
      <div>
        HOME! <Link to='/about'>about</Link>
      </div>
    )
  }
}
