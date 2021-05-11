import strings from "../../shared/const/strings";
import {
  getConfig,
  isYes,
  question,
  updateConfig,
} from "../../shared/lib/util";

const verify = async (name: string): Promise<boolean> =>
  isYes(
    await question(strings.log.cmd.server.subcommand.rm.prompt.verify(name))
  );

const rm = async (serverName: string) => {
  const config = getConfig();
  const existingServerNames = config.servers.map(({ name }) => name);
  if (existingServerNames.includes(serverName)) {
    if (await verify(serverName)) {
      updateConfig({
        ...config,
        servers: config.servers.filter(({ name }) => name !== serverName),
      });
    } else {
      throw strings.common.aborted;
    }
  } else {
    throw strings.log.cmd.server.subcommand.rm.error.noSuchServer(serverName);
  }
};

export const { command, desc } = strings.cmd.server.subcommand.rm;
export const builder = {};
export const handler = (argv: any) => {
  rm(argv.name)
    .then(() => process.exit(0))
    .catch((error) => {
      console.log(error);
      process.exit(1);
    });
};
