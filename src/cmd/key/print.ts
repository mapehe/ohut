import strings from "../../shared/const/strings";
import { getKeys } from "../../shared/lib/util";

const print = async () => {
  const { publicKey } = getKeys();
  process.stdout.write(publicKey);
};

export const { command, desc } = strings.cmd.key.subcommand.print;
export const builder = {};
export const handler = () => {
  print()
    .then(() => process.exit(0))
    .catch((error) => {
      console.log(error);
      process.exit(1);
    });
};
