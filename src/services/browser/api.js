// The browser version of the API
import axios from 'axios'

var args = {
  headers: {
    Accept: 'application/json'
  }
}

export function getAllRepositories() {
  return axios
    .get(window.location.origin + '/api/getAllRepositories', args)
    .then(r => r.data)
}

export function getAllIssues() {
  return axios
    .get(window.location.origin + '/api/getAllIssues', args)
    .then(r => r.data)
}

export function addRepository(repoId, repoName) {
  return axios
    .post(window.location.origin + '/api/addRepository', { repoId, repoName }, args)
    .then(r => r.data)
}

export function removeRepository(repoId) {
  return axios
    .post(window.location.origin + '/api/removeRepository', { repoId }, args)
    .then(r => r.data)
}

export function synchroniseRepositories() {
  return axios
    .get(window.location.origin + '/api/synchroniseRepositories', args)
    .then(r => r.data)
}
