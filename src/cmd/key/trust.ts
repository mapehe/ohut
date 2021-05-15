import strings from '../../shared/const/strings'
import {
  encoding,
  publicKeyFile,
  publicKeyLineCount,
  readlineTimeout,
  trustedKeysDir
} from '../../shared/const/global'
import {
  getTrustedKeys,
  isYes,
  keyToBuffer,
  question,
  validPublicKey
} from '../../shared/lib/util'

const readline = require('readline')
const fs = require('fs')

const rl = readline.createInterface({
  input: process.stdin
})

const input: string[] = []
rl.on('line', (cmd: string) => input.push(cmd))

const checkInput = async (): Promise<string> =>
  new Promise((resolve) =>
    setTimeout(() => {
      if (input.length >= publicKeyLineCount) {
        resolve(input.join('\n').concat('\n'))
      } else {
        resolve(checkInput())
      }
    }, readlineTimeout)
  )

const readKeyFile = (filename: string): string => {
  try {
    const data = fs.readFileSync(filename, encoding)
    if (validPublicKey(data)) {
      return data
    }
    throw strings.log.cmd.key.subcommand.trust.error.invalidKeyFile(filename)
  } catch (error) {
    throw strings.log.cmd.key.subcommand.trust.error.invalidKeyFile(filename)
  }
}

const duplicateCheck = (data: string) => {
  const trustedKeys = getTrustedKeys(trustedKeysDir)
  const duplicate = trustedKeys.find(
    ({ key }) => keyToBuffer(key).toString(encoding) === data
  )
  if (!duplicate) {
    return data
  }
  throw strings.log.cmd.key.subcommand.trust.error.duplicateKey(duplicate.name)
}

const ownKeyCheck = (data: string, force: boolean) => {
  const ownKey = fs.readFileSync(publicKeyFile, encoding).toString()
  if (ownKey === data && !force) {
    throw strings.log.cmd.key.subcommand.trust.error.ownKeyError
  }
}

const verifyOverwrite = async (): Promise<boolean> =>
  isYes(await question(strings.log.cmd.key.subcommand.trust.prompt.overwrite))

const areYouSureFile = async (filename: string): Promise<boolean> =>
  isYes(
    await question(
      strings.log.cmd.key.subcommand.trust.prompt.fileVerify(filename)
    )
  )

const areYouSureConsole = async (): Promise<boolean> =>
  isYes(
    await question(strings.log.cmd.key.subcommand.trust.prompt.consoleVerify)
  )

const printSuccess = (filename: string | undefined, keyName: string) => {
  if (filename) {
    console.log(
      strings.log.cmd.key.subcommand.trust.info.fileSuccess(filename, keyName)
    )
  } else {
    console.log(
      strings.log.cmd.key.subcommand.trust.info.consoleSuccess(keyName)
    )
  }
}

const verificationAndKeyName = async (
  filename: string | undefined
): Promise<string> => {
  if (filename) {
    if (await areYouSureFile(filename)) {
      return question(
        strings.log.cmd.key.subcommand.trust.prompt.dstFileNameFile(filename)
      )
    }
    throw strings.common.aborted
  } else {
    if (await areYouSureConsole()) {
      return question(
        strings.log.cmd.key.subcommand.trust.prompt.dstFileNameConsole()
      )
    }
    throw strings.common.aborted
  }
}

const addTrustedKey = async (
  key: string,
  filename: string | undefined,
  force: boolean
) => {
  duplicateCheck(key)
  ownKeyCheck(key, force)
  const keyName = await verificationAndKeyName(filename)
  const dstFile = `${trustedKeysDir}/${keyName}`
  if (fs.existsSync(dstFile)) {
    if (await verifyOverwrite()) {
      fs.writeFileSync(dstFile, key)
      printSuccess(filename, keyName)
    } else {
      throw strings.common.aborted
    }
  } else {
    fs.writeFileSync(dstFile, key)
    printSuccess(filename, keyName)
  }
}

const trustFile = async (filename: string, force: boolean) => {
  const key = readKeyFile(filename)
  return addTrustedKey(key, filename, force)
}

const readKeyFromConsole = async (force: boolean) => {
  console.log(strings.log.cmd.key.subcommand.trust.prompt.pastePublicKey)
  rl.prompt()
  const key = await checkInput()
  if (validPublicKey(key)) {
    return addTrustedKey(key, undefined, force)
  }
  throw strings.log.cmd.key.subcommand.trust.error.invalidKeyConsole
}

const trust = async (filename: string | undefined, force: boolean) => {
  if (force) {
    console.log(strings.log.shared.info.usingForce)
  }
  if (filename) {
    return trustFile(filename, force)
  }
  return readKeyFromConsole(force)
}

export const { command, desc } = strings.cmd.key.subcommand.trust
export const builder = (yargs: any) => {
  yargs
    .boolean(strings.cmd.key.subcommand.trust.boolean.force.name)
    .alias(
      strings.cmd.key.subcommand.trust.boolean.force.name,
      strings.cmd.key.subcommand.trust.boolean.force.alias
    )
    .default(
      strings.cmd.key.subcommand.trust.boolean.force.name,
      strings.cmd.key.subcommand.trust.boolean.force.default
    )
    .help()
}
export const handler = (argv: any) => {
  const { file } = argv
  trust(file, argv[strings.cmd.key.subcommand.trust.boolean.force.name])
    .then(() => process.exit(0))
    .catch((error) => {
      console.log(error)
      process.exit(1)
    })
}
