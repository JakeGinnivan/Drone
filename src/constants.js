import {
  CLIENT_ID as userClientId,
  CLIENT_SECRET as userClientSecret,
  AZURE_STORAGE_ACCOUNT as userStorageAccount,
  AZURE_STORAGE_ACCESS_KEY as userStorageKey,
  NGROK_AUTH_TOKEN as ngrokAuthToken
} from '../user_constants.js'

function getHostUri() {

}

var hostname = require('os').hostname()

export const CLIENT_ID = process.env.CLIENT_ID || userClientId
export const CLIENT_SECRET = process.env.CLIENT_SECRET || userClientSecret
export const AZURE_STORAGE_ACCOUNT = process.env.AZURE_STORAGE_ACCOUNT || userStorageAccount
export const AZURE_STORAGE_ACCESS_KEY = process.env.AZURE_STORAGE_ACCESS_KEY || userStorageKey
export const NGROK_AUTH_TOKEN = process.env.NGROK_AUTH_TOKEN || ngrokAuthToken
export const IS_PRODUCTION = process.env.NODE_ENV === 'production'
export const NGROK_SUBDOMAIN = `lackey-${hostname}`
export const WEBHOOK_CALLBACK_URL = IS_PRODUCTION ? getHostUri() : `https://${NGROK_SUBDOMAIN}.ngrok.io`
