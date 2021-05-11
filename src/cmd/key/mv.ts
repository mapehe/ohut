import { trustedKeysDir } from "../../shared/const/global";
import strings from "../../shared/const/strings";
import { getTrustedKeys } from "../../shared/lib/util";

const fs = require("fs");

const mv = async (keyName: string, updatedKeyName: string) => {
  const trustedKeys = getTrustedKeys(trustedKeysDir);
  const toUpdate = trustedKeys.find(({ name }) => name === keyName);
  if (toUpdate) {
    const filteredKeys = trustedKeys.filter(({ name }) => name !== keyName);
    const alreadyExists = filteredKeys.find(
      ({ name }) => name === updatedKeyName
    );
    if (!alreadyExists) {
      fs.renameSync(
        `${trustedKeysDir}/${keyName}`,
        `${trustedKeysDir}/${updatedKeyName}`
      );
    } else {
      throw strings.log.cmd.key.subcommand.mv.error.duplicateName(
        updatedKeyName
      );
    }
  } else {
    throw strings.log.cmd.key.subcommand.mv.error.noSuchKey(keyName);
  }
};
export const { command, desc } = strings.cmd.key.subcommand.mv;
export const builder = {};
export const handler = (argv: any) => {
  mv(argv.name, argv.updatedName)
    .then(() => process.exit(0))
    .catch((error) => {
      console.log(error);
      process.exit(1);
    });
};
