import { encoding } from '../../../const/global'
import strings from '../../../const/strings'
import { DecryptedPatch, Keys, Patch } from '../../../const/types'
import { getHead } from '../../console'
import { validateSignature } from '../generic/sign'

export const checkPatchHead = async (patch: Patch): Promise<boolean> => {
  const { stdout: head } = await getHead()
  if (head === patch.head) {
    return true
  }
  const { name, email } = patch.author
  throw strings.log.shared.warning.headMismatch(
    name || strings.common.unknown,
    email || strings.common.unknown
  )
}

export const checkPatchSignature = (
  decryptedPatch: DecryptedPatch
): boolean => {
  const {
    patchWithDestination: patch,
    senderKey: publicKey,
    signature
  } = decryptedPatch
  const data = Buffer.from(JSON.stringify(patch), encoding)
  return validateSignature(data, publicKey, signature)
}

export const checkPatchDestination = (
  decryptedPatch: DecryptedPatch,
  keys: Keys
) =>
  decryptedPatch.patchWithDestination.destinationKey ===
  keys.publicKey.export({ format: 'pem', type: 'pkcs1' }).toString()
