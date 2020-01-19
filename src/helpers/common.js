import { goto } from '@sapper/app'
import ls from 'local-storage'
import { authStore } from '../store'
import { STORAGE_KEY } from '../helpers/constants.js'

export const lnToBr = content => content.replace(/(?:\r\n|\r|\n)/g, '<br>')

export const signOut = () => {
  ls.remove(STORAGE_KEY)
  authStore.set({})
  goto('/')
}
