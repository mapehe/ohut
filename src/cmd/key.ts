import strings from "../shared/const/strings";

export const { command, desc } = strings.cmd.key;
export const builder = (yargs: any) =>
  yargs
    .commandDir("key", {
      extensions: ["js", "ts"],
    })
    .demandCommand()
    .check((argv: any) => {
      const subcommand = argv._[1];
      const validCommands = Object.keys(strings.cmd.key.subcommand);
      if (validCommands.includes(subcommand)) {
        return true;
      }
      throw strings.log.shared.error.unknownCommand;
    })
    .help("key").argv;
export const handler = () => {};
