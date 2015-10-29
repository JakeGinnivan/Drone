import React from 'react'
import _ from 'lodash'
import { connect } from 'react-redux'
import { getAllRepositories, addRepository, removeRepository, synchroniseRepositories } from 'services/api'

class Repositories extends React.Component {
  constructor(props){
    super(props)
    this.synchroniseRepositories = this.synchroniseRepositories.bind(this)
    this.addRepository = this.addRepository.bind(this)
  }

  componentWillMount() {
    if (!this.props.repositories) {
      this.props.dispatch({type: 'LOADING_REPOSITORIES'})

      getAllRepositories()
        .then(repositories => {
          this.props.dispatch({type: 'REPOSITORIES_LOADED', repositories: repositories})
        })
    }
  }

  synchroniseRepositories() {
    this.props.dispatch({type: 'SYNCHRONISING_REPOSITORIES'})
    synchroniseRepositories()
      .then(repositories => {
        this.props.dispatch({type: 'REPOSITORIES_SYNCHRONISED', repositories: repositories })
      })
  }

  addRepository(repo) {
    this.props.dispatch({type: 'ADDING_REPOSITORY', name: repo.repoName})
    addRepository(repo.repoId, repo.repoName)
      .then(() => {
        this.props.dispatch({type: 'REPOSITORY_ADDED', name: repo.repoName})
      })
  }

  removeRepository(repo) {
    this.props.dispatch({type: 'REMOVING_REPOSITORY', name: repo.repoName})
    removeRepository(repo)
      .then(() => {
        this.props.dispatch({type: 'REPOSITORY_REMOVED', name: repo.repoName})
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
                .map(r => <li key={r.repoName}>{r.repoName} <a href="#" onClick={() => this.removeRepository(r)}>Remove</a></li>)
            }
          </ul>
        </div>
        <div style={{width: '50%', float: 'left'}}>
          <h2>Available</h2>
          <p>Missing a repoistory? <a href='#' onClick={this.synchroniseRepositories}>Synchronise</a></p>
          <ul>
            {
              _
                .filter(this.props.repositories, r => !r.selected)
                .map(r => <li key={r.repoName}>{r.repoName} <a href='#' onClick={() => this.addRepository(r)}>Add</a></li>)
            }
          </ul>
        </div>
      </div>
    )
  }
}

Repositories.preloadStore = store => {
  var state = store.getState()
  var userId = state.drone.userId
  if (!userId) return Promise.resolve([])
  var promise = getAllRepositories(userId)
  return promise.then(repositories => {
    store.dispatch({type: 'REPOSITORIES_LOADED', repositories: repositories})
  })
}

Repositories.propTypes = {
  repositories: React.PropTypes.arrayOf(React.PropTypes.shape({
    selected: React.PropTypes.bool,
    name: React.PropTypes.string
  }))
}

export default connect(s => ({
  repositories: s.drone.repositories,
  repositoriesLoading: s.drone.repositoriesLoading
}))(Repositories)
