import strings from "../../shared/const/strings";
import { getTrustedKeys } from "../../shared/lib/util";
import { trustedKeysDir } from "../../shared/const/global";

const ls = async () => {
  const trustedKeyNames = getTrustedKeys(trustedKeysDir).map(
    ({ name }) => name
  );
  console.log(trustedKeyNames.join("\n"));
};

export const { command, desc } = strings.cmd.key.subcommand.ls;
export const builder = {};
export const handler = () => {
  ls()
    .then(() => process.exit(0))
    .catch((error) => {
      console.log(error);
      process.exit(1);
    });
};
