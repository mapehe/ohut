import strings from '../../shared/const/strings'
import { getKeys } from '../../shared/lib/util'

const print = async () => {
  const { publicKey } = getKeys()
  const str = publicKey.export({ format: 'pem', type: 'pkcs1' }).toString()
  process.stdout.write(str)
}

export const { command, desc } = strings.cmd.key.subcommand.print
export const builder = {}
export const handler = () => {
  print()
    .then(() => process.exit(0))
    .catch((error) => {
      console.log(error)
      process.exit(1)
    })
}
