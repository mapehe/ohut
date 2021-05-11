import { hashAlgorithm } from '../../../const/global'

const crypto = require('crypto')

const hashData = (data: Buffer) =>
  crypto.createHash(hashAlgorithm).update(data).digest()

export default hashData
