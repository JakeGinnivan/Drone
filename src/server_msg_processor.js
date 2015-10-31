import { getSingleMessage, deleteMessage, ensureQueue } from './services/messaging'
import { dispatch } from './services/messageHandlers/index'

var checkQueue = function () {
  console.log('Checking for msg')
  getSingleMessage()
    .then(processMessage)
    .then(setNextCheck)
    .catch(processError)
}

var processMessage = function (message) {
  if (message) {
    console.log('Processing message', message)
    if (message.currentRetryCount > 5)
      throw new Error('Tried 5 times to process message')

    return dispatch(message.msg)
      .then(() => deleteMessage(message))
      .then(() => true)
  }
  return false
}

var processError = function(reason) {
  console.log('Error processing message:', reason)
  console.log('Waiting 10 seconds before trying again')
  // Should probably do backoff or something based on the retry count.. cbf
  setTimeout(checkQueue, 10000)
}

var setNextCheck = function (handledMsg) {
  if (handledMsg) checkQueue()
  else {
    console.log('Waiting 2 seconds before checking for msg')
    setTimeout(checkQueue, 2000)
  }
}

export function start() {
  ensureQueue().then(checkQueue)
}
