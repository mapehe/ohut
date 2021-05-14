import { KeyObject } from 'crypto'
import { encoding } from '../../../const/global'
import {
  SessionResponse,
  Request,
  Keys,
  SessionRequest
} from '../../../const/types'
import { keyToBuffer } from '../../util'
import { signData } from '../generic/sign'

export const createSessionResponse = (
  sessionPublicKey: Buffer,
  destinationKey: KeyObject,
  salt: Buffer,
  signatureKeys: Keys
): Request => {
  const request: SessionResponse = {
    publicSessionKey: sessionPublicKey,
    destinationKey: keyToBuffer(destinationKey).toString(encoding),
    salt
  }
  const stringData = Buffer.from(JSON.stringify(request), encoding)
  const signature = signData(stringData, signatureKeys.privateKey)
  const signedRequest: Request = {
    destinationKey: keyToBuffer(destinationKey),
    senderKey: keyToBuffer(signatureKeys.publicKey),
    type: 'session_response',
    signature,
    data: request
  }
  return signedRequest
}

export const createSessionRequest = (
  destinationKey: KeyObject,
  signatureKeys: Keys
): Request => {
  const request: SessionRequest = {
    destinationKey: keyToBuffer(destinationKey).toString(encoding)
  }
  const stringData = Buffer.from(JSON.stringify(request), encoding)
  const signature = signData(stringData, signatureKeys.privateKey)
  const signedRequest: Request = {
    destinationKey: keyToBuffer(destinationKey),
    senderKey: keyToBuffer(signatureKeys.publicKey),
    type: 'session_request',
    signature,
    data: request
  }
  return signedRequest
}
