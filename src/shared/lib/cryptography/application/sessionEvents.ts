import { KeyObject } from 'crypto'
import { encoding } from '../../../const/global'
import {
  Request,
  Keys,
  SessionRequest,
  RequestType
} from '../../../const/types'
import { keyToBuffer } from '../../util'
import { signData } from '../generic/sign'

const sessionRequest = (
  sessionPublicKey: Buffer,
  destinationKey: KeyObject,
  salt: Buffer,
  signatureKeys: Keys,
  type: RequestType
): Request => {
  const request: SessionRequest = {
    publicSessionKey: sessionPublicKey,
    destinationKey: keyToBuffer(destinationKey),
    salt
  }
  const stringData = Buffer.from(JSON.stringify(request), encoding)
  const signature = signData(stringData, signatureKeys.privateKey)
  const signedRequest: Request = {
    destinationKey: keyToBuffer(destinationKey),
    senderKey: keyToBuffer(signatureKeys.publicKey),
    type,
    signature,
    data: request
  }
  return signedRequest
}

export const createSessionRequest = (
  sessionPublicKey: Buffer,
  destinationKey: KeyObject,
  salt: Buffer,
  signatureKeys: Keys
) =>
  sessionRequest(
    sessionPublicKey,
    destinationKey,
    salt,
    signatureKeys,
    'session_request'
  )

export const createSessionResponse = (
  sessionPublicKey: Buffer,
  destinationKey: KeyObject,
  salt: Buffer,
  signatureKeys: Keys
) =>
  sessionRequest(
    sessionPublicKey,
    destinationKey,
    salt,
    signatureKeys,
    'session_response'
  )
