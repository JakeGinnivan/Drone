import azure from 'azure-storage'
import { AZURE_STORAGE_ACCOUNT, AZURE_STORAGE_ACCESS_KEY} from '../constants.js'

var tableService = azure.createTableService(AZURE_STORAGE_ACCOUNT, AZURE_STORAGE_ACCESS_KEY)
tableService.createTableIfNotExists('users', function(error) {
  if (error) {
    console.log('Failed to create azure table')
  }
})

export function exists(id) {
  return new Promise((resolve) => {
    tableService.retrieveEntity('users', id, 0, function(error) {
      console.log('User exists', id, error)
      resolve(!error)
    })
  })
}

export function createAccount(details) {
  var entGen = azure.TableUtilities.entityGenerator
  var entity = {
    PartitionKey: entGen.Int32(details.id),
    RowKey: entGen.Int32(0),
    Name: entGen.String(details.name),
    Email: entGen.String(details.email)
  }

  return new Promise((resolve, reject) => {
    tableService.insertEntity('users', entity, function(error, result) {
      if (!error) {
        resolve(result)
      } else {
        reject(error)
      }
    })
  })
}
