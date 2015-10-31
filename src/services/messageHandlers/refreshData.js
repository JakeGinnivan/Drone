import { synchroniseIssuesList } from '../api'
import { getToken } from '../account'

export default function(msg) {
  return getToken(msg.userId)
    .then(githubToken => synchroniseIssuesList(msg.userId, msg.repoId, msg.repoName, githubToken))
  //TODO if we fail here, we should remove the selection then add some sort of
  //error message to the user so they know that the project failed to populate.
}
