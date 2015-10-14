import React from 'react'
import _ from 'lodash'
import { connect } from 'react-redux'
import { getAllRepositories, addRepository } from 'services/api.js'

class Repositories extends React.Component {
  constructor(props){
    super(props)
    this.synchroniseRepositories = this.synchroniseRepositories.bind(this)
    this.addRepository = this.addRepository.bind(this)
  }

  componentWillMount() {
    if (!this.props.repositories) {
      this.props.dispatch({type: 'LOADING_REPOSITORIES'})

    // Need moar code reuse..
    getAllRepositories()
      .then(repositories => {
        this.props.dispatch({type: 'REPOSITORIES_LOADED', repositories: repositories.map(r => ({
          name: r.full_name,
          selected: false
        }))})
      })
    }
  }

  synchroniseRepositories() {

  }

  addRepository(repo) {
    this.props.dispatch({type: 'ADDING_REPOSITORY', name: repo})
    addRepository(repo)
      .then(() => {
        this.props.dispatch({type: 'REPOSITORY_ADDED', name: repo})
      })
  }

  render() {
    if (this.props.repositoriesLoading)
      return <div>Loading....</div>

    return (
      <div>
        <div style={{width: '50%', float: 'right'}}>
          <h2>Selected</h2>
          <ul>
            {
              _
                .filter(this.props.repositories, r => r.selected)
                .map(r => <li key={r.name}>{r.name} <a onClick={() => this.addRepository(r)}>Add</a></li>)
            }
          </ul>
        </div>
        <div style={{width: '50%', float: 'left'}}>
          <h2>Available</h2>
          <p>Missing a repoistory? <a onClick={this.synchroniseRepositories}>Synchronise</a></p>
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
  repositories: s.repositories,
  repositoriesLoading: s.repositoriesLoading
}))(Repositories)
