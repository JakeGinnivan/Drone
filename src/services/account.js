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
    console.log(`Check if ${id} exists`)
    tableService.retrieveEntity('users', id.toString(), '0', function(error) {
      console.log(error ? 'Does not exist' : 'Exists')
      resolve(!error)
    })
  })
}

export function getToken(userId) {
  return new Promise((resolve, reject) => {
    try {
      tableService.retrieveEntity('users', userId.toString(), '0', function(error, serverEntity) {
        if(!error) {
          resolve(serverEntity.GithubToken._)
        } else {
          reject(error)
        }
      })
    } catch (e) {
      reject(e)
    }
  })
}

export function createOrUpdateAccount(details) {
  var entGen = azure.TableUtilities.entityGenerator
  var entity = {
    PartitionKey: entGen.String(details.id.toString()),
    RowKey: entGen.String('0'),
    Name: entGen.String(details.name),
    Email: entGen.String(details.email),
    GithubToken: entGen.String(details.githubToken)
  }

  return new Promise((resolve, reject) => {
    try {
      tableService.insertOrReplaceEntity('users', entity, function(error, result) {
        console.log('Account created or updated')
        if (!error) {
          resolve(result)
        } else {
          reject(error)
        }
      })
    } catch (e) {
      reject(e)
    }
  })
}
