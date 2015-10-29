import { synchroniseIssuesList } from '../api'
import { getToken } from '../account'

export default function(msg) {
  return getToken(msg.userId)
    .then(githubToken => synchroniseIssuesList(msg.userId, msg.repoId, msg.repoName, githubToken))
}
