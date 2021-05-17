import { encoding } from '../../shared/const/global'
import strings from '../../shared/const/strings'
import { getKeys, keyToBuffer } from '../../shared/lib/util'

const print = async () => {
  const { publicKey } = getKeys()
  const str = keyToBuffer(publicKey).toString(encoding)
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
