import azure from 'azure-storage'
import _ from 'lodash'
import {
  getAllRepositories as getAllGithubRepositories,
  getAllIssues as getAllGithubIssues,
  getCommentsForIssue
} from './github'
import { AZURE_STORAGE_ACCOUNT, AZURE_STORAGE_ACCESS_KEY} from '../constants.js'
import { enqueueMessage } from './messaging.js'

var tableService = azure.createTableService(AZURE_STORAGE_ACCOUNT, AZURE_STORAGE_ACCESS_KEY)
tableService.createTableIfNotExists('userRepositories', function(error) {
  if (error) {
    console.log('Failed to create userRepositories azure table')
  }
})

tableService.createTableIfNotExists('issuesList', function(error) {
  if (error) {
    console.log('Failed to create issuesList azure table')
  }
})

let entGen = azure.TableUtilities.entityGenerator

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

function setSelection(userId, repoName, selected) {
  var entGen = azure.TableUtilities.entityGenerator
  return new Promise((resolve, reject) => {
    try {
      tableService.retrieveEntity('userRepositories', userId.toString(), repoName, function(error, result) {
        if (error) {
          reject(error)
        } else {
          result.Selected = entGen.Boolean(selected)
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

export function addRepository(userId, repoId, repoName) {
  return enqueueMessage({ type: 'addRepositoryHooks', userId, repoId, repoName }).then(() => setSelection(userId, repoId, true))
}

export function removeRepository(userId, repoId, repoName) {
  return enqueueMessage({ type: 'removeRepositoryHooks', userId, repoId, repoName }).then(() => setSelection(userId, repoId, true))
}
function executeBatch(tableName, batch) {
  console.log(`Executing batch update for ${tableName}`)
  return new Promise((resolve, reject) => {
    try {
      tableService.executeBatch(tableName, batch, function (error) {
        if(error) {
          reject(error)
        } else {
          resolve()
        }
      })
    } catch (e) {
      reject(e)
    }
  })
  .then(() => console.log(`Done batch update for ${tableName}`))
  .catch(ex => {
    console.log(`Failed to execute batch for ${tableName}`, ex)
  })
}
function executeBatches(tableName, batches, fetchAll) {
  return Promise
    .all(batches.map(b => executeBatch(tableName, b)))
    .then(fetchAll)
}

export function synchroniseRepositories(userId, githubToken) {
  return Promise.all([getAllGithubRepositories(githubToken), getAllRepositories(userId)])
    .then(([ githubRepos, savedRepos ]) => {
      console.log('Syncing repos')
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
      var batches = []
      var batch = new azure.TableBatch()
      batches.push(batch)

      try {
        _.forEach(toAdd, r => {
          var entity = {
            PartitionKey: entGen.String(userId.toString()),
            RowKey: entGen.String(r.id.toString()),
            RepoName: entGen.String(r.full_name),
            Selected: entGen.Boolean(false)
          }
          if (batch.size() === 100) {
            batch = new azure.TableBatch()
            batches.push(batch)
          }
          batch.insertEntity(entity)
        })
      } catch (e) {
        console.log('Failed to sync repositories', e)
      }

      return executeBatches('userRepositories', batches, () => getAllRepositories(userId))
    })
}

export function getAllIssues(userId, repoName) {
  return queryTableEntities(
      'issuesList',
      query => query.where('PartitionKey == ? and RowKey == ?', userId.toString(), repoName)
    )
    .then(result => {
      return _.sortBy(result.map(issue => ({
        userId: issue.PartitionKey._,
        repoName: issue.RowKey._,
        issueTitle: issue.Title._,
        issueNumber: issue.IssueNumber._,
        issueUrl: issue.Url._,
        issueActioned: issue.Actioned._,
        lastOwnerActionTimestamp: issue.LastOwnerActionTimestamp._
      })), 'lastOwnerActionTimestamp')
    })
}

function isActioned(comments, userId) {
  var latestComment = _.max(comments, c => c.updated_at)
  return latestComment === -Infinity ? undefined : latestComment.user.id === userId
}

function getLastUserComment(comments, userId) {
  var userComments = _.filter(comments, c => c.user.id === userId)
  var latestUserComment = _.max(userComments, c => c.created_at)
  return latestUserComment === -Infinity ? undefined : latestUserComment
}

function toTableIssue(issue, userId, repoId) {
  var entity = {
    PartitionKey: entGen.String(userId.toString()),
    RowKey: entGen.String(repoId.toString()),
    Title: entGen.String(issue.title),
    IssueNumber: entGen.Int32(issue.number),
    IssueUrl: entGen.String(issue.html_url),
    Actioned: entGen.Boolean(!!isActioned(issue.comments, userId))
  }
  var latestComment = getLastUserComment(issue.comments, userId)
  if (latestComment) {
    console.log(issue.number, latestComment)
    entity.LastOwnerActionId = entGen.Int32(latestComment.id)
    entity.LastOwnerActionTimestamp = entGen.Int32(latestComment.created_at)
  }
  return entity
}

function enrichWithComments(githubToken, issues, repoName) {
  var issuesWithComments = issues.map(i =>
    getCommentsForIssue(githubToken, repoName, i.number).then(c => {
      i.comments = c
      return i
    }))
  return Promise.all(issuesWithComments)
}
export function synchroniseIssuesList(userId, repoId, repoName, githubToken) {
  console.log('Synchronising issues list')
  return Promise.all([getAllGithubIssues(githubToken, repoName), getAllIssues(userId, repoId)])
    .then(([githubIssues, knownIssues]) => {
      console.log(`Synchronising ${githubIssues.length} github issues with ${knownIssues.length} known issues`)
      var existing = _.indexBy(knownIssues, 'issueNumber')
      var toAdd = _.filter(githubIssues, r => !existing[r.number])
      var toUpdate = _.filter(githubIssues, r => existing[r.number])

      var batches = []
      var batch = new azure.TableBatch()
      batches.push(batch)

      var addPromise = enrichWithComments(githubToken, toAdd, repoName)
        .then(toAddWithComments => {
          _.forEach(toAddWithComments, i => {
            if (batch.size() === 100) {
              batch = new azure.TableBatch()
              batches.push(batch)
            }
            batch.insertEntity(toTableIssue(i, userId, repoId))
          })
        })
      var updatePromise = enrichWithComments(githubToken, toUpdate, repoName)
        .then(toUpdateWithComments => {
          _.forEach(toUpdateWithComments, i => {
            if (batch.size() === 100) {
              batch = new azure.TableBatch()
              batches.push(batch)
            }
            batch.mergeEntity(toTableIssue(i, userId, repoId))
          })
        })

      return Promise.all([addPromise, updatePromise])
        .then(() => {
          console.log('Created batches, executing')
          return executeBatches('issuesList', batches, () => getAllIssues(userId, repoName))
        })
        .then(r => {
          console.log('Done synchronising issues', r)
          // TODO need to publish msg via a WS to client to cause their page to refresh
          return r
        })
    })
}

function queryTableEntities(tableName, enrichQuery) {
  return new Promise((resolve, reject) => {
    var query = new azure.TableQuery()
    if (enrichQuery) {
      query = enrichQuery(query)
    }

    try {
      tableService.queryEntities(tableName, query, null, (error, result) => {
        if (error) {
          console.log(error)
          reject(error)
          return
        }
        console.log(`Got ${result.entries.length} from ${tableName}`)
        resolve(result.entries)
      })
    } catch (e) {
      console.log(`Failed to query azure table ${tableName}`, e)
      reject(e)
    }
  })
}
