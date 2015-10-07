import { CLIENT_ID as userClientId, CLIENT_SECRET as userClientSecret } from '../user_constants.js'

export const CLIENT_ID = process.env.CLIENT_ID || userClientId
export const CLIENT_SECRET = process.env.CLIENT_SECRET || userClientSecret
