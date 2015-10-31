import React from 'react'
import { connect } from 'react-redux'
import { getAllIssues } from 'services/api'

export default class Issues extends React.Component {
  constructor(props) {
    super(props)
  }

  componentWillMount() {
    if (!this.props.issues) {
      this.props.dispatch({type: 'LOADING_ISSUES'})

      getAllIssues()
        .then(issues => {
          this.props.dispatch({type: 'ISSUES_LOADED', issues})
        })
    }
  }

  componentWillUnmount() {
    this.props.dispatch({type: 'UNLOAD_ISSUES'})
  }

  render() {
    if (this.props.issuesLoading)
      return <div>Loading...</div>

    let issues = (this.props.issues|| [])
    return (
      <div>
        <p>{issues.length} in list</p>
        <ul>
          {issues.map(i => {
            return (
              <li key={`${i.repoId}+${i.issueNumber}`}>
                {i.repoName} - <a href={i.issueUrl} target='_blank'>#{i.issueNumber}</a> ({i.issueType}) - {i.issueTitle}
                {i.labels.map(l => <div key={l.name} style={{backgroundColor: '#'+l.color, display: 'inline', margin: '2px', padding: '2px'}}>{l.name}</div>)}
              </li>
            )
          })}
        </ul>
      </div>
    )
  }
}

Issues.preloadStore = store => {
  var state = store.getState()
  var userId = state.drone.userId
  if (!userId) return Promise.resolve([])
  var promise = getAllIssues(userId)
  return promise.then(issues => {
    store.dispatch({type: 'ISSUES_LOADED', issues })
  })
}

Issues.propTypes = {
  issues: React.PropTypes.arrayOf(React.PropTypes.shape({
    number: React.PropTypes.number,
    title: React.PropTypes.string
  }))
}

export default connect(s => ({
  issues: s.drone.issues,
  issuesLoading: s.drone.issuesLoading
}))(Issues)
