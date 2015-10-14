import axios from 'axios'
import { parseLinkHeader } from './github.js'

export function getAllRepositories(context) {
  var uri,
      args = {
        headers: {
          'Accept': 'application/json'
        }
      }

  // For the moment auth token is enough to know server vs client, need a better way
  if (process.env.BROWSER) {
    uri = window.location.origin + '/api/getAllRepositories'
  } else {
    args.headers['Authorization'] = 'token ' + context.githubToken
    uri = 'https://api.github.com/user/repos'
  }

  return axios
    .get(uri, args)
    .then(response => {
      return getAllPages(args, response.data, response)
    })
}

export function getSelectedRepositories() {

}

function getAllPages(args, currentResults, response) {
  var next
  if (response.headers.link && (next = parseLinkHeader(response.headers.link).next)) {
    return axios.get(next, args).then(r => getAllPages(args, currentResults.concat(r.data), r))
  }
  return currentResults
}
