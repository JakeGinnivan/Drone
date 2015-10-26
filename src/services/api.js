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
      resolve(_.sortBy(result.entries.map(repo => ({
        userId: repo.PartitionKey._,
        repoId: repo.RowKey._,
        repoName: repo.RepoName._,
        selected: repo.Selected._
      })), 'repoName'))
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
          result.Selected = entGen.Boolean(true)
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
        console.log('From github', githubRepos.map(r => r.full_name))
        console.log('Existing', Object.keys(existing))
        var toAdd = _.filter(githubRepos, r => {
          var exists = !existing[r.full_name]
          return exists
        })
        if (toAdd.length === 0) {
          return getAllRepositories(userId)
        }
        console.log(`Adding ${toAdd.length} new repositories`)
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
