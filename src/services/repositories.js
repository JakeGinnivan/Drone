import axios from 'axios'
import { parseLinkHeader } from './github.js'

export function getAllRepositories(authenticationToken) {
  var args = {
    headers: {
      'Accept': 'application/json'
    }
  }
  // For the moment auth token is enough to know server vs client, need a better way
  if (authenticationToken){
    args.headers['Authorization'] = 'token ' + authenticationToken
    return axios
      .get('https://api.github.com/user/repos', args)
      .then(response => {
        return getAllPages(args, response.data, response)
      })
  }

  //client only
  if (!window) throw new Error('Should only be accessing this on the client..')

  // IE fix, not even sure if I need this, oh well.
  if (!window.location.origin) {
    window.location.origin = window.location.protocol + "//" + window.location.hostname + (window.location.port ? ':' + window.location.port: '')
  }

  var uri = window.location.origin + '/api/getAllRepositories'
  return axios
    .get(uri)
    .then(res => {
      return res.data
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
