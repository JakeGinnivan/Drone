import axios from 'axios'
import { WEBHOOK_CALLBACK_URL } from '../constants'

function parseLinkHeader(header) {
  if (header.length === 0) {
      throw new Error("input must not be of zero length")
  }

  // Split parts by comma
  var parts = header.split(',')
  var links = {}
  // Parse each part into a named link
  for(var i=0; i<parts.length; i++) {
      var section = parts[i].split(';')
      if (section.length !== 2) {
          throw new Error("section could not be split on ';'")
      }
      var url = section[0].replace(/<(.*)>/, '$1').trim()
      var name = section[1].replace(/rel="(.*)"/, '$1').trim()
      links[name] = url
  }

  return links
}

function getAllPages(args, currentResults, response) {
  var next
  if (response.headers.link && (next = parseLinkHeader(response.headers.link).next)) {
    console.log('Loading ' + next)
    return axios.get(next, args)
      .then(r => {
        console.log('Done loading', next)
        return getAllPages(args, currentResults.concat(r.data), r)}
      )
  }
  console.log('No more next links, returning results')
  return currentResults
}

var header = function(githubToken) {
  return {
    headers: {
      Accept: 'application/json',
      Authorization: 'token ' + githubToken
    }
  }
}

export function getAccountDetails(githubToken) {
  return axios
    .get('https://api.github.com/user', header(githubToken))
    .then(response => {
      return getAllPages(header(githubToken), response.data, response)
    })
}

export function getAllRepositories(githubToken) {
  console.log('Getting github repos for token ' + githubToken)
  return axios
    .get('https://api.github.com/user/repos', header(githubToken))
    .then(response => {
      console.log('Got initial payload, loading pages')
      return getAllPages(header(githubToken), response.data, response)
    })
    .then(response => {
      console.log('done loading github repos')
      return response
    })
}

export function getAllIssues(githubToken, repoName) {
  console.log(`Getting github issues for ${repoName}`)
  return axios
    .get(`https://api.github.com/repos/${repoName}/issues`, header(githubToken))
    .then(response => {
      console.log('Got initial payload, loading pages')
      return getAllPages(header(githubToken), response.data, response)
    })
    .then(response => {
      console.log('done loading github issues')
      return response
    })
}

export function getCommentsForIssue(githubToken, repoName, issueNumber) {
  console.log(`Getting issue comments for ${repoName}/#${issueNumber}`)
  return axios
    .get(`https://api.github.com/repos/${repoName}/issues/${issueNumber}/comments`, header(githubToken))
    .then(response => getAllPages(header(githubToken), response.data, response))
    .then(response => {
      console.log(`done loading issue comments for ${repoName}/#${issueNumber}`)
      return response
    })
    .catch(e => console.log(`Failed loading issue comments for ${repoName}/#${issueNumber}`, e))
}

export function addWebhook(githubToken, repoName) {
  var payload = {
    name: 'web ',
    active: true,
    events: [ 'push', 'pull_request', 'pull_request_review_comment', 'issues', 'issue_comment' ],
    config: {
      url: `${WEBHOOK_CALLBACK_URL}/githubEvent`,
      content_type: 'json'
    }
  }
  console.log(`Adding webhook for ${repoName}`, payload)
  return axios
    .post(`https://api.github.com/repos/${repoName}/hooks`, payload, header(githubToken))
    .then(response => {
      console.log('add hook', response)
    })
    .catch(e => {
      console.log(e.data.errors)
    })
}
