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
        authenticated: true
      })
    default:
      return state
  }
}
