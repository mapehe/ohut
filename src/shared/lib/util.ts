import { createPrivateKey, createPublicKey, KeyObject } from 'crypto'
import {
  configFile,
  configPadding,
  encoding,
  privateKeyFile,
  publicKeyFile
} from '../const/global'
import strings from '../const/strings'
import { Config, Keys, NamedKey, Patch } from '../const/types'
import { getHead } from './console'
import { parseConfig } from './parsers'

const fs = require('fs')
const readline = require('readline')

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

export const question = (prompt: string): Promise<string> =>
  new Promise((resolve) => {
    rl.question(prompt, (answer: string) => {
      resolve(answer)
    })
  })

export const isYes = (s: string) => s.toLocaleLowerCase() === 'y'

export const parseAuthorInfo = (
  config: string
): { name: string; email: string } | undefined => {
  try {
    const configArray = config.split('\n').map((l: string) => l.split('='))
    const email = configArray.find((x) => x[0] === 'user.email')
    const name = configArray.find((x) => x[0] === 'user.name')
    if (name && email) {
      return { name: name[1], email: email[1] }
    }
    return undefined
  } catch (e) {
    console.log(e)
    return undefined
  }
}

export const validPublicKey = (key: string): boolean => {
  try {
    createPublicKey(key)
    return true
  } catch (e) {
    return false
  }
}

export const getTrustedKeys = (trustedKeysDir: string): NamedKey[] => {
  try {
    const keyFileNames: string[] = fs.readdirSync(trustedKeysDir)
    return keyFileNames.reduce<NamedKey[]>((keyList, keyFile) => {
      try {
        const keyObject = createPublicKey(
          fs.readFileSync(`${trustedKeysDir}/${keyFile}`, encoding)
        )
        return keyList.concat([{ name: keyFile, key: keyObject }])
      } catch (error) {
        return keyList
      }
    }, [])
  } catch {
    throw strings.log.shared.error.missingOrInvalidConfiguration
  }
}

export const getConfig = (): Config => {
  try {
    return parseConfig(fs.readFileSync(configFile, encoding))
  } catch {
    throw strings.log.shared.error.missingOrInvalidConfiguration
  }
}

export const getKeys = (): Keys => {
  try {
    return {
      publicKey: createPublicKey(fs.readFileSync(publicKeyFile)),
      privateKey: createPrivateKey(fs.readFileSync(privateKeyFile))
    }
  } catch {
    throw strings.log.shared.error.missingOrInvalidConfiguration
  }
}

export const keyToBuffer = (key: KeyObject): Buffer =>
  Buffer.from(key.export({ format: 'pem', type: 'pkcs1' }).toString(), encoding)

export const writeKeys = (keys: Keys) => {
  try {
    const { publicKey, privateKey } = keys
    const publicKeyStr = keyToBuffer(publicKey).toString(encoding)
    const privateKeyStr = keyToBuffer(privateKey).toString(encoding)
    fs.writeFileSync(publicKeyFile, publicKeyStr)
    fs.writeFileSync(privateKeyFile, privateKeyStr)
  } catch {
    throw strings.log.shared.error.missingOrInvalidConfiguration
  }
}

export const updateConfig = (config: Config) => {
  try {
    return fs.writeFileSync(
      configFile,
      JSON.stringify(config, null, configPadding).concat('\n')
    )
  } catch {
    throw strings.log.shared.error.configWriteFailed
  }
}

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
