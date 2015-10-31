import { deleteIssuesList } from '../api'

export default function(msg) {
  return deleteIssuesList(msg.userId, msg.repoId)
}
