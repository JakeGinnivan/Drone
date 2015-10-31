import azure from 'azure-storage'
import { AZURE_STORAGE_ACCOUNT, AZURE_STORAGE_ACCESS_KEY } from '../constants.js'

var queueService = azure.createQueueService(AZURE_STORAGE_ACCOUNT, AZURE_STORAGE_ACCESS_KEY)

export function ensureQueue() {
  console.log('Ensuring message queue')
  return new Promise((resolve, reject) => {
    queueService.createQueueIfNotExists('lackeyqueue', function(error) {
      if (error) {
        console.log('Failed to create lackeyqueue azure table')
        reject(error)
      } else {
        console.log('Queue exists or has been created')
        resolve()
      }
    })
  })
}

export function getSingleMessage() {
  return new Promise((resolve, reject) => {
    queueService.getMessages('lackeyqueue', {numOfMessages: 1}, function(error, result) {
      if(!error) {
        if (result.length > 0) {
          let msg = result[0]
          console.log('Found msg', msg.messagetext)
          resolve({
            msg: JSON.parse(msg.messagetext),
            messageid: msg.messageid,
            popreceipt: msg.popreceipt,
            currentRetryCount: msg.currentRetryCount
          })
        }
        else
          resolve()
      } else {
        reject(error)
      }
    })
  })
}

export function deleteMessage(msg) {
  console.log('Deleting message', msg)
  return new Promise((resolve, reject) => {
    queueService.deleteMessage('lackeyqueue', msg.messageid, msg.popreceipt, function(error) {
      if(!error){
        resolve()
      } else {
        reject(error)
      }
    })
  })
}

export function enqueueMessage(msg) {
  console.log('Enqueuing message', msg)
  return new Promise((resolve, reject) => {
    queueService.createMessage('lackeyqueue', JSON.stringify(msg), function(error){
      if(!error){
        console.log('Message enqueued successfully')
        resolve()
      } else {
        console.log('Failed to insert message into queue', error)
        reject(error)
      }
    })
  })
}
