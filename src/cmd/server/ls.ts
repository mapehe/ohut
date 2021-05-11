import strings from '../../shared/const/strings'
import { getConfig } from '../../shared/lib/util'

const ls = async () => {
  const config = getConfig()
  config.servers.forEach(({ name, url }) => {
    console.log(`${name}: ${url}`)
  })
}

export const { command, desc } = strings.cmd.server.subcommand.ls
export const builder = {}
export const handler = () => {
  ls()
    .then(() => process.exit(0))
    .catch((error) => {
      console.log(error)
      process.exit(1)
    })
}
