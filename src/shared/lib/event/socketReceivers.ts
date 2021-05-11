import { privateDecrypt } from 'crypto'
import EventQueue from '../../const/class/EventQueue'
import { EncryptedPatch, Keys, NamedKey } from '../../const/types'
import hashData from '../cryptography/generic/hash'
import decryptAndValidatePatch from '../cryptography/patch/decryptAndValidatePatch'

export const connectHandler = (loadingSpinner: any) => {
  loadingSpinner.stop()
  console.log()
}

export const connectErrorHandler = (error: any) => {
  console.log(`ERROR: ${error.message}`)
}

export const patchHandler = async (
  encryptedPatch: EncryptedPatch,
  senderKeys: NamedKey[],
  eventQueue: EventQueue,
  keys: Keys
) => {
  decryptAndValidatePatch(encryptedPatch, senderKeys, keys)
    .then((patch) => {
      if (patch) {
        eventQueue.remote.push(patch)
      }
    })
    .catch((error) => {
      console.log(error)
    })
}

export const helloHandler = async (message: string) => console.log(message)

export const challengeHandler = async (
  challenge: Buffer,
  socket: any,
  keys: Keys
) => {
  const decryptedChallenge = privateDecrypt(keys.privateKey, challenge)
  const solution = hashData(decryptedChallenge)
  socket.emit('solution', solution)
}
