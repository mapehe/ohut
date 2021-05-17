import { privateDecrypt } from 'crypto'
import { Keys } from '../../const/types'
import hashData from '../cryptography/generic/hash'

export const connectHandler = () => {}

export const connectErrorHandler = (error: any) => {
  console.log(`ERROR: ${error.message}`)
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
