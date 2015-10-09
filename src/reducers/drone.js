const initialState = {
  authenticated: false
}

export default (state, action) => {
  if (typeof state === 'undefined') {
    return initialState
  }

  switch (action.type) {
    case 'LOGGED_IN':
      return Object.assign({}, state, {
        authenticated: true,
        githubToken: action.githubToken
      })
    case 'REPOSITORIES_LOADED':
      return Object.assign({}, state, {
        repositories: action.repositories
      })
    default:
      return state
  }
}
