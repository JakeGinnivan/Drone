import {
  CLIENT_ID as userClientId,
  CLIENT_SECRET as userClientSecret,
  AZURE_STORAGE_ACCOUNT as userStorageAccount,
  AZURE_STORAGE_ACCESS_KEY as userStorageKey
} from '../user_constants.js'

export const CLIENT_ID = process.env.CLIENT_ID || userClientId
export const CLIENT_SECRET = process.env.CLIENT_SECRET || userClientSecret
export const AZURE_STORAGE_ACCOUNT = process.env.AZURE_STORAGE_ACCOUNT || userStorageAccount
export const AZURE_STORAGE_ACCESS_KEY = process.env.AZURE_STORAGE_ACCESS_KEY || userStorageKey
