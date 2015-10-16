import azure from 'azure-storage'
import _ from 'lodash'
import { getAllRepositories as getAllGithubRepositories } from './github'
import { AZURE_STORAGE_ACCOUNT, AZURE_STORAGE_ACCESS_KEY} from '../constants.js'

var tableService = azure.createTableService(AZURE_STORAGE_ACCOUNT, AZURE_STORAGE_ACCESS_KEY)
tableService.createTableIfNotExists('userRepositories', function(error) {
  if (error) {
    console.log('Failed to create userRepositories azure table')
  }
})

export function getAllRepositories(userId) {
  console.log('Getting repositories for ' + userId)
  return new Promise((resolve, reject) => {
    var query = new azure.TableQuery()
      .where('PartitionKey eq ?', userId.toString())
    tableService.queryEntities('userRepositories', query, null, function(error, result) {
      if (error) {
        console.log(error)
        reject(error)
        return
      }
      console.log(`Got ${result.entries.length} repositories`)
      resolve(result.entries.map(repo => ({
        userId: repo.PartitionKey._,
        repoId: repo.RowKey._,
        repoName: repo.RepoName._,
        selected: repo.Selected._
      })))
    })
  })
}

export function addRepository(userId, repoId) {
  var entGen = azure.TableUtilities.entityGenerator
  return new Promise((resolve, reject) => {
    try {
      tableService.retrieveEntity('userRepositories', userId.toString(), repoId.toString(), function(error, result) {
        if (error) {
          reject(error)
        } else {
          result.selected = entGen.Boolean(true)
          try {
            tableService.mergeEntity('userRepositories', result, function(error) {
              if (error) {
                reject(error)
              } else{
                resolve()
              }
            })
          } catch (e) {
            console.log(e)
            reject(e)
          }
        }
      })
    } catch (e) {
      console.log(e)
      reject(e)
    }
  })
}

export function synchroniseRepositories(userId, githubToken) {
  return Promise.all([getAllGithubRepositories(githubToken), getAllRepositories(userId)])
    .then(([ githubRepos, savedRepos ]) => {
      console.log('Syncing repos')
      return new Promise((resolve, reject) => {
        var existing = _.indexBy(savedRepos, 'repoName')
        var toAdd = _.where(githubRepos, r => !existing[r.full_name])
        console.log(`Adding ${toAdd.length} new repositories`)
        // TODO delete

        // return Promise.all(toAdd.map(r => {
        //   var entGen = azure.TableUtilities.entityGenerator
        //   var entity = {
        //     PartitionKey: entGen.String(userId.toString()),
        //     RowKey: entGen.String(r.full_name),
        //     Selected: entGen.Boolean(false)
        //   }
        //
        //   return new Promise((resolve, reject) => {
        //     console.log('Adding repo', r.full_name)
        //     try {
        //       tableService.insertEntity('userRepositories', entity, function(error, result) {
        //         console.log('Repository added', r.full_name)
        //         if (!error) {
        //           resolve(result)
        //         } else {
        //           reject(error)
        //         }
        //       })
        //     } catch (e) {
        //       console.log(e)
        //       reject(e)
        //     }
        //   })
        // }))
        // Batch not working for some reason
        var batch = new azure.TableBatch()

        _.forEach(toAdd, r => {
          var entGen = azure.TableUtilities.entityGenerator
          var entity = {
            PartitionKey: entGen.String(userId.toString()),
            RowKey: entGen.String(r.id.toString()),
            RepoName: entGen.String(r.full_name),
            Selected: entGen.Boolean(false)
          }
          batch.insertEntity(entity)
        })

        try {
          tableService.executeBatch('userRepositories', batch, function (error) {
            if(error) {
              console.log(error)
              reject(error)
            } else {
              console.log('Done')
              return getAllRepositories(userId)
            }
          })
        } catch (e) {
          console.log(e)
          reject(e)
        }
      })
    })
}
