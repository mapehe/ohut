import strings from '../shared/const/strings'

export const { command, desc } = strings.cmd.server
export const builder = (yargs: any) =>
  yargs
    .commandDir('server', {
      extensions: ['js', 'ts']
    })
    .demandCommand()
    .check((argv: any) => {
      const subcommand = argv._[1]
      const validCommands = Object.keys(strings.cmd.server.subcommand)
      if (validCommands.includes(subcommand)) {
        return true
      }
      throw strings.log.shared.error.unknownCommand
    })
    .demandCommand()
    .help('server').argv
export const handler = () => {}
