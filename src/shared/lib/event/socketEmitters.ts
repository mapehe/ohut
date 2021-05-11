import { io } from "socket.io-client";
import {
  loadingSpinnerInterval,
  transmissionEncoding,
} from "../../const/global";
import strings from "../../const/strings";
import { Keys, Patch } from "../../const/types";
import { getDiff, getGitConfig } from "../console";
import encryptPatch from "../cryptography/patch/encryptPatch";
import { parseAuthorInfo } from "../util";

export const connectSocket = (url: string, keys: Keys, loadingSpinner: any) => {
  const socket = io(url, {
    auth: {
      publicKey: Buffer.from(keys.publicKey).toString(transmissionEncoding),
    },
  });
  process.stdout.write(strings.log.cmd.watch.info.connectingTo(url));
  loadingSpinner.start(loadingSpinnerInterval, { clearChar: true });
  return socket;
};

export const emitPatch = async (
  head: string,
  socket: any,
  keys: Keys,
  destinationKey: string
) => {
  const { stdout: diff } = await getDiff();
  const { stdout: config } = await getGitConfig();
  const authorInfo = parseAuthorInfo(config);
  const patch: Patch = {
    head,
    patch: diff,
    timestamp: Date.now(),
    author: { name: authorInfo?.name, email: authorInfo?.email },
  };
  const encryptedPatch = encryptPatch(patch, keys, destinationKey);
  socket.emit("patch", encryptedPatch);
};
