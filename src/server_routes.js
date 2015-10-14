import { CLIENT_ID, CLIENT_SECRET } from './constants'
import axios from 'axios'
import { getAllRepositories, getAccountDetails } from 'services/github'
import { exists, createAccount } from 'services/account'

export default function(expressServer) {
  // TODO Session state?
  expressServer.get('/auth/github/login', (req, res) => {
    let loginUrl = `https://github.com/login/oauth/authorize?client_id=${CLIENT_ID}&redirect_uri=${req.query.redirect}` //&state=....
    res.redirect(loginUrl)
  })

  expressServer.get('/auth/github/callback', (req, res) => {
    axios.post('https://github.com/login/oauth/access_token', {
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      code: req.query.code
    }, {
      headers: {'Accept': 'application/json'}
    })
    .then(response => {
      req.session.githubToken = response.data.access_token
      return getAccountDetails(req.session.githubToken)
    })
    .then(accountDetailsResponse => {
      return (
        exists(accountDetailsResponse.id)
        .then(existsResponse => {
          if (existsResponse) return true
          return createAccount({
            id: accountDetailsResponse.id,
            name: accountDetailsResponse.name,
            email: accountDetailsResponse.email
           })
         })
       )
    })
    .then(() => {
      req.session.save(() => res.redirect(decodeURIComponent(req.query.redirect_uri) || '/'))
    })
  })

  expressServer.get('/api/getAllRepositories', (req, res) => {
    getAllRepositories(req.session.githubToken).then(response => {
      res.status(200).json(response)
    })
  })
}
