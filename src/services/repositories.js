import axios from 'axios'
import { parseLinkHeader } from './github.js'

export function getAllRepositories(githubToken) {
  var args = {
    headers: {
      'Accept': 'application/json',
      'Authorization': 'token ' + githubToken
    }
  }
  return axios
    .get('https://api.github.com/user/repos', args)
    .then(response => {
      return getAllPages(args, response.data, response)
    })
}

function getAllPages(args, currentResults, response) {
  var next
  if (response.headers.link && (next = parseLinkHeader(response.headers.link).next)) {
    return axios.get(next, args).then(r => getAllPages(args, currentResults.concat(r.data), r))
  }
  return currentResults
}

export function getSelectedRepositories() {

}
