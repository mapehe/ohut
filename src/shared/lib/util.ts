import {
  configFile,
  configPadding,
  encoding,
  privateKey,
  publicKey,
} from "../const/global";
import strings from "../const/strings";
import { Config, Keys, NamedKey } from "../const/types";
import { parseConfig } from "./parsers";

const crypto = require("crypto");
const fs = require("fs");
const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const silentFailDeleteFiles = async (fileNames: string[]) =>
  Promise.all(
    fileNames.map(async (filename) => {
      try {
        return fs.unlinkSync(filename);
      } catch (error) {
        return undefined;
      }
    })
  );

export const question = (prompt: string): Promise<string> =>
  new Promise((resolve) => {
    rl.question(prompt, (answer: string) => {
      resolve(answer);
    });
  });

export const isYes = (s: string) => s.toLocaleLowerCase() === "y";

export const parseAuthorInfo = (
  config: string
): { name: string; email: string } | undefined => {
  try {
    const configArray = config.split("\n").map((l: string) => l.split("="));
    const email = configArray.find((x) => x[0] === "user.email");
    const name = configArray.find((x) => x[0] === "user.name");
    if (name && email) {
      return { name: name[1], email: email[1] };
    }
    return undefined;
  } catch (e) {
    console.log(e);
    return undefined;
  }
};

export const validPublicKey = (key: string): boolean => {
  try {
    const verifier = crypto.createVerify("RSA-SHA512");
    verifier.update("__JUNK__");
    verifier.verify(
      Buffer.from(key, encoding),
      Buffer.from("__JUNK___", encoding)
    );
    return true;
  } catch (e) {
    return false;
  }
};

export const getTrustedKeys = (trustedKeysDir: string): NamedKey[] => {
  try {
    return fs
      .readdirSync(trustedKeysDir)
      .map((filename: string) => {
        try {
          return {
            name: filename,
            key: fs.readFileSync(`${trustedKeysDir}/${filename}`).toString(),
          };
        } catch {
          return { name: "", key: "" };
        }
      })
      .filter(({ key }: any) => validPublicKey(key));
  } catch {
    throw strings.log.shared.error.missingOrInvalidConfiguration;
  }
};

export const getConfig = (): Config => {
  try {
    return parseConfig(fs.readFileSync(configFile, encoding));
  } catch {
    throw strings.log.shared.error.missingOrInvalidConfiguration;
  }
};

export const getKeys = (): Keys => {
  try {
    return {
      publicKey: fs.readFileSync(publicKey),
      privateKey: fs.readFileSync(privateKey),
    };
  } catch {
    throw strings.log.shared.error.missingOrInvalidConfiguration;
  }
};

export const writeKeys = (keys: Keys) => {
  try {
    fs.writeFileSync(publicKey, keys.publicKey);
    fs.writeFileSync(privateKey, keys.privateKey);
  } catch {
    throw strings.log.shared.error.missingOrInvalidConfiguration;
  }
};

export const updateConfig = (config: Config) => {
  try {
    return fs.writeFileSync(
      configFile,
      JSON.stringify(config, null, configPadding).concat("\n")
    );
  } catch {
    throw strings.log.shared.error.configWriteFailed;
  }
};

export const newFilesInPatch = (patch: string): string[] => {
  const addBlockRegex = new RegExp(
    "diff --git a/.+? b/.+?\nnew file mode [0-9]{6}\nindex [0-9a-f]{7}..[0-9a-f]{7}\n",
    "g"
  );
  const filenameRegex = new RegExp("diff --git a/.+ b/(?<filename>.+)");
  return Array.from(patch.matchAll(addBlockRegex))
    .map((match) => match[0].split("\n")[0])
    .map((t) => t.match(filenameRegex)?.groups?.filename)
    .reduce<string[]>((acc, value) => (value ? acc.concat([value]) : acc), []);
};

export const removeNewFilesInPatchFile = async (tmpFile: string) => {
  if (fs.existsSync(tmpFile)) {
    const newFiles = newFilesInPatch(fs.readFileSync(tmpFile).toString());
    await silentFailDeleteFiles(newFiles);
  }
};
