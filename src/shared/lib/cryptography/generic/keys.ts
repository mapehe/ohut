import { encoding, keyOptions, keyType } from "../../../const/global";
import { Keys } from "../../../const/types";

const { generateKeyPair } = require("crypto");

const generateKeys = async (): Promise<Keys> =>
  new Promise((resolve) =>
    generateKeyPair(
      keyType,
      keyOptions,
      (err: any, publicKey: string, privateKey: string) => {
        if (err) {
          return console.log(err);
        }
        return resolve({
          publicKey: Buffer.from(publicKey, encoding),
          privateKey: Buffer.from(privateKey, encoding),
        });
      }
    )
  );

export default generateKeys;
