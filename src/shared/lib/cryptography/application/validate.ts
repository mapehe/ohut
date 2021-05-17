import { KeyObject } from 'crypto'
import { encoding } from '../../../const/global'
import strings from '../../../const/strings'
import { Request } from '../../../const/types'
import { keyToBuffer } from '../../util'
import { validateSignature } from '../generic/sign'

const validateRequest = (
  request: Request,
  stringData: string,
  correctDestination: KeyObject,
  correctSender: KeyObject
) => {
  const { destinationKey } = JSON.parse(stringData)
  const validSignature = validateSignature(
    Buffer.from(stringData),
    request.senderKey,
    request.signature
  )
  const validDestination = keyToBuffer(correctDestination).equals(
    Buffer.from(destinationKey)
  )
  const validSender =
    request.senderKey.toString(encoding) ===
    keyToBuffer(correctSender).toString(encoding)

  if (validSignature && validDestination && validSender) {
    return true
  }
  throw strings.log.shared.warning.corruptedRequest
}

export default validateRequest
