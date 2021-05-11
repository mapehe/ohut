import strings from "../../shared/const/strings";
import { getConfig, updateConfig } from "../../shared/lib/util";

const add = async (serverName: string, url: string) => {
  const config = getConfig();
  const existingServerNames = config.servers.map(({ name }) => name);
  if (!existingServerNames.includes(serverName)) {
    updateConfig({
      ...config,
      servers: config.servers.concat([{ name: serverName, url }]),
    });
  } else {
    throw strings.log.cmd.server.subcommand.add.error.duplicateName;
  }
};

export const { command, desc } = strings.cmd.server.subcommand.add;
export const builder = {};
export const handler = (argv: any) => {
  add(argv.name, argv.url)
    .then(() => process.exit(0))
    .catch((error) => {
      console.log(error);
      process.exit(1);
    });
};
