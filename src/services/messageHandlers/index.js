import addRepositoryHooks from './addRepositoryHooks'
//import removeRepositoryHooks from './removeRepositoryHooks'
import refreshData from './refreshData'

let handlers = {
  addRepositoryHooks,
  //removeRepositoryHooks,
  refreshData
}
console.log('Registered message handlers', handlers)

export function dispatch(msg) {
  console.log('Trying to handle msg', msg)
  var handler = handlers[msg.type]
  if (handler) {
    console.log(`Dispatching message of type ${msg.type}`)
    return handler(msg)
  } else {
    return Promise.reject('No message handler found')
  }
}
