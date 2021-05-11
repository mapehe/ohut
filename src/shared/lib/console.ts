import { ConsoleOutput, Patch } from "../const/types";
import { newFilesInPatch, removeNewFilesInPatchFile } from "./util";

const fs = require("fs");
const util = require("util");
const exec = util.promisify(require("child_process").exec);

const writeFile = util.promisify(fs.writeFile);

const gitAdd = async (filename: string): Promise<ConsoleOutput> =>
  exec(`git add ${filename}`);

export const getHead = async (): Promise<ConsoleOutput> =>
  exec("git rev-parse HEAD | tr -d '\n'");

export const getDiff = async (): Promise<ConsoleOutput> =>
  exec("git diff HEAD");

export const getGitConfig = async (): Promise<ConsoleOutput> =>
  exec("git config --list");

export const resetHead = async (): Promise<ConsoleOutput> =>
  exec("git reset --hard HEAD");

export const isGitRepo = async (): Promise<Boolean> =>
  exec("[ -d .git ] && echo .git || git rev-parse --git-dir > /dev/null 2>&1")
    .then(() => true)
    .catch(() => false);

export const initKeys = async (
  keyfile: string,
  email: string
): Promise<ConsoleOutput> => {
  await exec(`ssh-keygen -m PKCS8 -C "${email}" -f ${keyfile} -q -N ""`);
  return exec(`ssh-keygen -e -m PKCS8 -f ${keyfile}.pub > ${keyfile}.pkcs8`);
};

export const applyPatch = async (
  patch: Patch,
  tmpFile: string
): Promise<void> => {
  await resetHead();
  await removeNewFilesInPatchFile(tmpFile);
  if (patch.patch.length > 0) {
    await writeFile(tmpFile, patch.patch);
    await exec(`cat ${tmpFile} | git apply`);
    const newFiles = newFilesInPatch(fs.readFileSync(tmpFile).toString());
    newFiles.reduce(
      (prev, file) => prev.then(async () => gitAdd(file)),
      Promise.resolve()
    );
  } else if (fs.existsSync(tmpFile)) {
    fs.unlinkSync(tmpFile);
  }
};
