import { CLIENT_ID, CLIENT_SECRET } from './constants'
import axios from 'axios'

export default function(expressServer) {
  // TODO Session state?
  expressServer.get('/auth/github/login', (req, res) => {
    let loginUrl = `https://github.com/login/oauth/authorize?client_id=${CLIENT_ID}` //&state=....
    console.log('login url:', loginUrl)
    res.redirect(loginUrl)
  })

  expressServer.get('/auth/github/callback', (req, res) => {
    console.log('handling callback', req.query)
    axios.post('https://github.com/login/oauth/access_token', {
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      code: req.query.code
    }, {
      headers: {'Accept': 'application/json'}
    }).then(response => {
      console.log('received post response', response.data, response.data.access_token)
      req.session.githubToken = response.data.access_token
      req.session.save(() => res.redirect('/'))
    })
  })
}
