import _ from 'lodash'

const initialState = {
  authenticated: false
}

function toggleRepoAdded(state, repoName, selected) {
  let index = _.findIndex(state.repositories, r => r.repoName === repoName)
  let newRepo = Object.assign({}, state.repositories[index], { selected: selected, saving: false })
  let repos = {
    repositories: state.repositories.slice()
  }
  repos.repositories[index] = newRepo
  return Object.assign({}, state, repos)
}

export default (state, action) => {
  if (typeof state === 'undefined') {
    return initialState
  }

  console.log('Handling dispatched action:', action.type)
  switch (action.type) {
    case 'LOGGED_IN':
      return Object.assign({}, state, {
        authenticated: true,
        githubToken: action.githubToken,
        userId: action.userId
      })
    case 'REPOSITORIES_SYNCHRONISED':
    case 'REPOSITORIES_LOADED':
      return Object.assign({}, state, {
        repositories: action.repositories,
        repositoriesLoading: false
      })
    case 'LOADING_REPOSITORIES':
    case 'SYNCHRONISING_REPOSITORIES':
      return Object.assign({}, state, {
        repositories: [],
        repositoriesLoading: true
      })
    case 'ADDING_REPOSITORY':
    case 'REMOVING_REPOSITORY':
    {
      let index = _.findIndex(state.repositories, r => r.repoName === action.name)
      let newRepo = Object.assign({}, state.repositories[index], { saving: true })
      // TODO Need a better way to replace items in the array
      let repos = {
        repositories: state.repositories.slice()
      }
      repos.repositories[index] = newRepo
      console.log('New repos list', repos)
      return Object.assign({}, state, repos)
    }
    case 'REPOSITORY_ADDED':
    {
      toggleRepoAdded(state, action.name, true)
    }
    case 'REPOSITORY_REMOVED':
    {
      toggleRepoAdded(state, action.name, false)
    }
    default:
      return state
  }
}
