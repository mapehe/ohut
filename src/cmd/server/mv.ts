import strings from "../../shared/const/strings";
import { getConfig, updateConfig } from "../../shared/lib/util";

const mv = async (serverName: string, updatedServerName: string) => {
  const config = getConfig();
  const toUpdate = config.servers.find(({ name }) => name === serverName);
  if (toUpdate) {
    const filteredServers = config.servers.filter(
      ({ name }) => name !== serverName
    );
    const alreadyExists = filteredServers.find(
      ({ name }) => name === updatedServerName
    );
    if (!alreadyExists) {
      updateConfig({
        ...config,
        servers: filteredServers.concat([
          { name: updatedServerName, url: toUpdate.url },
        ]),
      });
    } else {
      throw strings.log.cmd.server.subcommand.mv.error.duplicateName(
        updatedServerName
      );
    }
  } else {
    throw strings.log.cmd.server.subcommand.mv.error.noSuchServer(serverName);
  }
};

export const { command, desc } = strings.cmd.server.subcommand.mv;
export const builder = {};
export const handler = (argv: any) => {
  mv(argv.name, argv.updatedName)
    .then(() => process.exit(0))
    .catch((error) => {
      console.log(error);
      process.exit(1);
    });
};
