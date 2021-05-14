import { KeyObject } from 'crypto'
import { encoding } from '../../../const/global'
import {
  PatchWithDestination,
  Request,
  EncryptedPatch,
  Keys,
  DecryptedPatch
} from '../../../const/types'
import { parsePatchWithDestination } from '../../parsers'
import { keyToBuffer } from '../../util'
import {
  generateIv,
  symmetricDecrypt,
  symmetricEncrypt
} from '../generic/encrypt'
import { signData } from '../generic/sign'

export const encryptPatch = (
  patch: PatchWithDestination,
  sessionSecret: Buffer,
  keys: Keys,
  destinationKey: KeyObject
): Request => {
  const plaintextData = Buffer.from(JSON.stringify(patch), encoding)
  const signature = signData(plaintextData, keys.privateKey)
  const iv = generateIv()
  const encryptedData = symmetricEncrypt(plaintextData, sessionSecret, iv)
  const encryptedPatch: EncryptedPatch = {
    data: encryptedData,
    iv
  }
  return {
    destinationKey: keyToBuffer(destinationKey),
    senderKey: keyToBuffer(keys.publicKey),
    signature,
    data: encryptedPatch,
    type: 'patch'
  }
}

export const decryptPatch = (
  remoteEvent: Request,
  sessionSecret: Buffer
): DecryptedPatch => {
  const { data, iv } = remoteEvent.data as EncryptedPatch
  const patchWithDestination = parsePatchWithDestination(
    symmetricDecrypt(data, sessionSecret, iv).toString(encoding)
  )
  return {
    patchWithDestination,
    signature: remoteEvent.signature,
    senderKey: remoteEvent.senderKey
  }
}
