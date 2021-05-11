import strings from "./shared/const/strings";

const yargs = require("yargs/yargs");

const main = () =>
  yargs(process.argv.slice(2))
    .commandDir("cmd", {
      extensions: ["js", "ts"],
    })
    .demandCommand()
    .check((argv: any) => {
      const command = argv._[0];
      const validCommands = Object.keys(strings.cmd);
      if (validCommands.includes(command)) {
        return true;
      }
      throw strings.log.shared.error.unknownCommand;
    })
    .help().argv;

main();
