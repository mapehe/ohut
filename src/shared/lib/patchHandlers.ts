import { exec } from "child_process";
import { Patch } from "../const/types";
import { getDiff, gitAdd, resetHead } from "./console";
import { newFilesInPatch } from "./util";

const fs = require("fs");
const util = require("util");

const writeFile = util.promisify(fs.writeFile);

const processPatch = async (diff: string, tmpFile: string) => {
  if (diff.length > 0) {
    await writeFile(tmpFile, diff);
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

const forceHandlePatch = async (
  patch: Patch,
  remoteTmpFile: string
): Promise<void> => {
  await resetHead();
  processPatch(patch.patch, remoteTmpFile);
};

const handlePatch = async (
  patch: Patch,
  remoteTmpFile: string
): Promise<void> => {
  try {
    const { stdout: localPatch } = await getDiff();
    await processPatch(patch.patch, remoteTmpFile);
    await processPatch(localPatch, remoteTmpFile);
  } catch {
    return forceHandlePatch(patch, remoteTmpFile);
  }
};

export default handlePatch;
