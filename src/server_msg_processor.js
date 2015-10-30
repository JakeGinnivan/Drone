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

    return dispatch(message.msg)
      .then(() => deleteMessage(message))
      .then(() => true)
  }
  return false
}

var processError = function(reason) {
  console.log("Error:", reason)
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
