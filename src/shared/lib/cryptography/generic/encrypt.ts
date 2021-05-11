import {
  symmetricAlgorithm,
  symmetricKeyBytes,
  ivBytes
} from '../../../const/global'

const crypto = require('crypto')

export const generateSymmetricKey = (): Buffer =>
  crypto.randomBytes(symmetricKeyBytes)
export const generateIv = (): Buffer => crypto.randomBytes(ivBytes)

export const symmetricEncrypt = (
  data: Buffer,
  key: Buffer,
  iv: Buffer
): Buffer => {
  const cipher = crypto.createCipheriv(symmetricAlgorithm, key, iv)
  const encrypted = cipher.update(data)
  return Buffer.concat([encrypted, cipher.final()])
}

export const symmetricDecrypt = (
  data: Buffer,
  key: Buffer,
  iv: Buffer
): Buffer => {
  const decipher = crypto.createDecipheriv(symmetricAlgorithm, key, iv)
  const decrypted = decipher.update(data)
  return Buffer.concat([decrypted, decipher.final()])
}
