import axios from 'axios'

export function parseLinkHeader(header) {
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

export function getAccountDetails(githubToken) {
  var args = {
    headers: {
      Accept: 'application/json',
      Authorization: 'token ' + githubToken
    }
  }

  return axios
    .get('https://api.github.com/user', args)
    .then(response => {
      return getAllPages(args, response.data, response)
    })
}

export function getAllRepositories(githubToken) {
  var args = {
    headers: {
      Accept: 'application/json',
      Authorization: 'token ' + githubToken
    }
  }

  console.log('Getting github repos for token ' + githubToken)
  return axios
    .get('https://api.github.com/user/repos', args)
    .then(response => {
      console.log('Got initial payload, loading pages')
      return getAllPages(args, response.data, response)
    })
    .then(response => {
      console.log('done loading github repos')
      return response
    })
}
