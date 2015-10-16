// The browser version of the API
import axios from 'axios'

var args = {
  headers: {
    Accept: 'application/json'
  }
}

export function getAllRepositories() {
  return axios.get(window.location.origin + '/api/getAllRepositories', args)
}

export function addRepository(repo) {
  return axios.post(window.location.origin + '/api/addRepository', repo, args)
}

export function synchroniseRepositories() {
  return axios.get(window.location.origin + '/api/synchroniseRepositories', args)
}
