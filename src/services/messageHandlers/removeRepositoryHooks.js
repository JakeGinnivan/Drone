import { enqueueMessage } from '../messaging'

export default function(msg) {
  // we cannot remove webhooks blindly because they might be shared
  // TODO query if webhook is needed then delete if not
  return enqueueMessage({
    type: 'removeData',
    repoId: msg.repoId,
    userId: msg.userId
  })
}
