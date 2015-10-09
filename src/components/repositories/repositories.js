import React from 'react'
import _ from 'lodash'
import { connect } from 'react-redux'
import { getAllRepositories } from 'services/repositories.js'

class Repositories extends React.Component {
  render() {
    return (
      <div>
        <div style={{width: '50%', float: 'right'}}>
          <h2>Selected</h2>
          <ul>
            {
              _
                .filter(this.props.repositories, r => r.selected)
                .map(r => <li key={r.name}>{r.name}</li>)
            }
          </ul>
        </div>
        <div style={{width: '50%', float: 'left'}}>
          <h2>Available</h2>
          <ul>
            {
              _
                .filter(this.props.repositories, r => !r.selected)
                .map(r => <li key={r.name}>{r.name}</li>)
            }
          </ul>
        </div>
      </div>
    )
  }
}

Repositories.preloadStore = store => {
  var state = store.getState()
  var githubToken = state.githubToken
  if (!githubToken) return Promise.resolve([])
  var promise = getAllRepositories(githubToken)
  return promise.then(repositories => {
    store
      .dispatch({type: 'REPOSITORIES_LOADED', repositories: repositories.map(r => ({
        name: r.full_name,
        selected: false
      }))})
    })
}

Repositories.propTypes = {
  repositories: React.PropTypes.arrayOf(React.PropTypes.shape({
    selected: React.PropTypes.bool,
    name: React.PropTypes.string
  }))
}

export default connect(s => ({
  repositories: s.repositories
}))(Repositories)
