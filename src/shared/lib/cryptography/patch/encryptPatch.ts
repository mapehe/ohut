import { publicEncrypt, KeyObject } from 'crypto'
import { encoding } from '../../../const/global'
import {
  EncryptedPatch,
  Keys,
  Patch,
  PatchHeader,
  PatchWithDestination
} from '../../../const/types'
import {
  generateSymmetricKey,
  generateIv,
  symmetricEncrypt
} from '../generic/encrypt'
import { signData } from '../generic/sign'

const encryptPatch = (
  patch: Patch,
  keys: Keys,
  destinationKey: KeyObject
): EncryptedPatch => {
  const patchWithDestination: PatchWithDestination = {
    ...patch,
    destinationKey: destinationKey
      .export({ format: 'pem', type: 'pkcs1' })
      .toString()
  }
  const patchString = JSON.stringify(patchWithDestination)
  const signature = signData(
    Buffer.from(patchString, encoding),
    keys.privateKey
  )
  const header: PatchHeader = {
    key: generateSymmetricKey(),
    iv: generateIv()
  }
  const headerString = JSON.stringify(header)
  const encryptedHeader = publicEncrypt(
    destinationKey,
    Buffer.from(headerString)
  )
  const data = symmetricEncrypt(
    Buffer.from(patchString, encoding),
    header.key,
    header.iv
  )
  return {
    destinationKey: Buffer.from(
      destinationKey.export({ format: 'pem', type: 'pkcs1' }).toString(),
      encoding
    ),
    senderKey: Buffer.from(
      keys.publicKey.export({ format: 'pem', type: 'pkcs1' }).toString(),
      encoding
    ),
    data,
    header: encryptedHeader,
    signature
  }
}

export default encryptPatch
