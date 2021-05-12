import { ConsoleOutput } from "../const/types";

const util = require("util");
const exec = util.promisify(require("child_process").exec);

export const gitAdd = async (filename: string): Promise<ConsoleOutput> =>
  exec(`git add ${filename}`);

export const getHead = async (): Promise<ConsoleOutput> =>
  exec("git rev-parse HEAD | tr -d '\n'");

export const getDiff = async (): Promise<ConsoleOutput> =>
  exec("git diff HEAD");

export const getGitConfig = async (): Promise<ConsoleOutput> =>
  exec("git config --list");

export const resetHead = async (): Promise<ConsoleOutput> =>
  exec("git reset --hard HEAD");

export const applyPatch = (tmpFile: string) =>
  exec(`cat ${tmpFile} | git apply`);

export const isGitRepo = async (): Promise<Boolean> =>
  exec("[ -d .git ] && echo .git || git rev-parse --git-dir > /dev/null 2>&1")
    .then(() => true)
    .catch(() => false);
