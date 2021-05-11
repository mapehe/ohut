import strings from '../../shared/const/strings'
import { trustedKeysDir } from '../../shared/const/global'
import { isYes, question } from '../../shared/lib/util'

const fs = require('fs')

const verifyOverwrite = async (key: string): Promise<boolean> =>
  isYes(
    await question(strings.log.cmd.key.subcommand.untrust.prompt.verify(key))
  )

const untrust = async (key: string) => {
  const fileName = `${trustedKeysDir}/${key}`
  if (fs.existsSync(fileName)) {
    if (await verifyOverwrite(key)) {
      fs.unlinkSync(fileName)
    } else {
      throw strings.common.aborted
    }
  } else {
    throw strings.log.cmd.key.subcommand.untrust.error.noSuchKey(key)
  }
}

export const { command, desc } = strings.cmd.key.subcommand.untrust
export const builder = {}
export const handler = (argv: any) => {
  untrust(argv.keyName)
    .then(() => process.exit(0))
    .catch((error) => {
      console.log(error)
      process.exit(1)
    })
}
