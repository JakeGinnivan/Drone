import { CLIENT_ID, CLIENT_SECRET } from './constants'
import axios from 'axios'
import { getAccountDetails } from 'services/github'
import { getAllRepositories, addRepository, synchroniseRepositories } from 'services/api'
import { exists, createAccount } from 'services/account'

export default function(expressServer) {
  // TODO Session state?
  expressServer.get('/auth/github/login', (req, res) => {
    var redirect = ''
    if (req.query.redirect) {
      let redirectUri = `${req.root}/auth/github/callback?redirect=${encodeURIComponent(req.query.redirect)}`
      redirect = `&redirect_uri=${redirectUri}`
    }
    let loginUrl = `https://github.com/login/oauth/authorize?client_id=${CLIENT_ID}${redirect}&scope=read:org,admin:repo_hook` //&state=....
    console.log('Redirecting to', loginUrl)
    res.redirect(loginUrl)
  })

  expressServer.get('/auth/github/callback', (req, res) => {
    if (req.query.error) {
      console.log('GitHub OAuth failed', req.query.error)
      res.status(500).send('GitHub OAuth failed')
    }
    console.log('Received callback from github')
    axios.post('https://github.com/login/oauth/access_token', {
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      code: req.query.code
    }, {
      headers: {'Accept': 'application/json'}
    })
    .then(response => {
      console.log('Got GitHub access token, fetching account details')
      req.session.githubToken = response.data.access_token
      return getAccountDetails(req.session.githubToken)
    })
    .then(accountDetailsResponse => {
      console.log(`Account details received for ${accountDetailsResponse.id}`)
      req.session.userId = accountDetailsResponse.id
      return (
        exists(accountDetailsResponse.id)
        .then(existsResponse => {
          if (existsResponse) {
            console.log('User account already exists')
            return true
          }
          console.log(`Creating user account for ${accountDetailsResponse.name}`)
          return createAccount({
            id: accountDetailsResponse.id,
            name: accountDetailsResponse.name,
            email: accountDetailsResponse.email
           })
         })
       )
    })
    .then(() => {
      var redirectTo = decodeURIComponent(req.query.redirect || '/')
      console.log(`Saving session and redirecting to ${redirectTo}`)
      req.session.save(() => res.redirect(redirectTo))
    })
  })

  expressServer.get('/api/getAllRepositories', (req, res) => {
    console.log('get /api/getAllRepositories')
    getAllRepositories(req.session.userId).then(response => {
      res.status(200).json(response)
    })
  })

  expressServer.post('/api/addRepository', (req, res) => {
    console.log('post /api/addRepository', req.body)
    addRepository(req.session.userId, req.body.repoId).then(response => {
      res.status(200).json(response)
    })
  })

  expressServer.get('/api/synchroniseRepositories', (req, res) => {
    console.log('get /api/synchroniseRepositories')
    synchroniseRepositories(req.session.userId, req.session.githubToken).then(response => {
      res.status(200).json(response)
    })
  })
}
