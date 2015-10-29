import { addWebhook } from '../github'
import { enqueueMessage } from '../messaging'
import { getToken } from '../account'

export default function(msg) {
  return getToken(msg.userId)
    .then(githubToken => addWebhook(githubToken, msg.repoName))
    .then(() => enqueueMessage({
      type: 'refreshData',
      repoId: msg.repoId,
      repoName: msg.repoName,
      userId: msg.userId
    }))
}
