import { createPrivateKey, createPublicKey } from 'crypto'
import { keyOptions, keyType } from '../../../const/global'
import { Keys } from '../../../const/types'

const { generateKeyPair } = require('crypto')

const generateKeys = async (): Promise<Keys> =>
  new Promise((resolve) =>
    generateKeyPair(
      keyType,
      keyOptions,
      (err: any, publicKey: string, privateKey: string) => {
        if (err) {
          return console.log(err)
        }
        return resolve({
          publicKey: createPublicKey(publicKey),
          privateKey: createPrivateKey(privateKey)
        })
      }
    )
  )

export default generateKeys
