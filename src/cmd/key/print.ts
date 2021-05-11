import strings from "../../shared/const/strings";
import { localEncoding, publicKey } from "../../shared/const/global";

const fs = require("fs");

const print = async () => {
  const key = fs.readFileSync(publicKey, localEncoding).toString();
  process.stdout.write(key);
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
