import { CLIENT_ID, CLIENT_SECRET } from './constants'
import axios from 'axios'
import { getAccountDetails } from 'services/github'
import { getAllRepositories, getAllIssues, addRepository, removeRepository, synchroniseRepositories } from 'services/api'
import { createOrUpdateAccount } from 'services/account'

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
      return createOrUpdateAccount({
        id: accountDetailsResponse.id,
        name: accountDetailsResponse.name,
        email: accountDetailsResponse.email,
        githubToken: req.session.githubToken
      }).catch(e => console.log('Failed to create or update account', e))
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

  expressServer.get('/api/getAllIssues', (req, res) => {
    console.log('get /api/getAllIssues')
    getAllIssues(req.session.userId).then(response => {
      res.status(200).json(response)
    })
  })

  expressServer.post('/api/addRepository', (req, res) => {
    console.log('post /api/addRepository', req.body)
    addRepository(req.session.userId, req.body.repoId, req.body.repoName).then(response => {
      res.status(200).json(response)
    })
  })

  expressServer.post('/api/removeRepository', (req, res) => {
    console.log('post /api/removeRepository', req.body)
    removeRepository(req.session.userId, req.body.repoId).then(response => {
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
