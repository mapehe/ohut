import { privateDecrypt } from 'crypto'
import { encoding } from '../../../const/global'
import { DecryptedPatch, EncryptedPatch, Keys } from '../../../const/types'
import { parsePatchHeader, parsePatchWithDestination } from '../../parsers'
import { symmetricDecrypt } from '../generic/encrypt'

const decryptPatch = (
  encryptedPatch: EncryptedPatch,
  keys: Keys
): DecryptedPatch => {
  const header = parsePatchHeader(
    privateDecrypt(keys.privateKey, encryptedPatch.header).toString(encoding)
  )
  const decryptedData = symmetricDecrypt(
    encryptedPatch.data,
    header.key,
    header.iv
  )
  return {
    patchWithDestination: parsePatchWithDestination(
      decryptedData.toString(encoding)
    ),
    signature: encryptedPatch.signature,
    senderKey: encryptedPatch.senderKey
  }
}

export default decryptPatch
