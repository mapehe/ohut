import { isYes, question, updateConfig, writeKeys } from '../shared/lib/util'
import strings from '../shared/const/strings'
import {
  configDir,
  keysDir,
  trustedKeysDir,
  defaultConfig
} from '../shared/const/global'
import generateKeys from '../shared/lib/cryptography/generic/keys'

const fs = require('fs')

const configDirExists = () => fs.existsSync(configDir)

const createDirs = () => {
  fs.mkdirSync(configDir)
  fs.mkdirSync(keysDir)
  fs.mkdirSync(trustedKeysDir)
}

const createConfigFile = () => updateConfig(defaultConfig)

const createKeys = async () => {
  const keys = await generateKeys()
  await writeKeys(keys)
}

const newConfig = async () => {
  createDirs()
  await createConfigFile()
  await createKeys()
  console.log(strings.log.cmd.init.info.configCreated(configDir))
}

const init = async () => {
  if (configDirExists()) {
    const answer = await question(
      strings.log.cmd.init.prompt.confirmOverwrite(configDir)
    )
    if (isYes(answer)) {
      fs.rmdirSync(configDir, { recursive: true })
      await newConfig()
    } else {
      throw strings.common.aborted
    }
  } else {
    await newConfig()
  }
}

export const { command, desc } = strings.cmd.init
export const handler = () => {
  init()
    .then(() => process.exit(0))
    .catch((error) => {
      console.log(error)
      process.exit(1)
    })
}
