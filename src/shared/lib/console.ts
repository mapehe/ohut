import { ConsoleOutput, Patch } from '../const/types'

const fs = require('fs')
const util = require('util')
const exec = util.promisify(require('child_process').exec)

export const getHead = async (): Promise<ConsoleOutput> =>
  exec("git rev-parse HEAD | tr -d '\n'")

export const getDiff = async (): Promise<ConsoleOutput> => exec('git diff HEAD')

export const getGitConfig = async (): Promise<ConsoleOutput> =>
  exec('git config --list')

export const resetHead = async (): Promise<ConsoleOutput> =>
  exec('git reset --hard HEAD')

export const isGitRepo = async (): Promise<Boolean> =>
  exec('[ -d .git ] && echo .git || git rev-parse --git-dir > /dev/null 2>&1')
    .then(() => true)
    .catch(() => false)

export const applyPatch = async (
  patch: Patch,
  tmpFile: string
): Promise<void> => {
  const localTmpFile = `${tmpFile}_local`
  const { stdout: localDiff } = await exec('git diff HEAD')

  try {
    // Merge the remote and the local changes.
    // Default to the remote version on conflict.
    fs.writeFileSync(localTmpFile, localDiff)
    fs.writeFileSync(tmpFile, patch.patch)
    await resetHead()
    await exec(`git apply --index ${tmpFile}`)
    await exec(`git apply --reject --index ${localTmpFile}`)
    return undefined
  } catch {
    return undefined
  }
}
