const initialState = {
  authenticated: false,
  repositories: []
}

export default (state, action) => {
  if (typeof state === 'undefined') {
    return initialState
  }

  switch (action.type) {
    case 'LOGGED_IN':
      console.log('Logging in', action)
      return Object.assign({}, state, {
        authenticated: true,
        githubToken: action.githubToken
      })
    case 'REPOSITORIES_LOADED':
      console.log('Repositories loaded', action)
      return Object.assign({}, state, {
        repositories: action.repositories
      })
    default:
      return state
  }
}
