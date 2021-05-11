import EventQueue from "../../const/class/EventQueue";
import {
  EncryptedPatch,
  Keys,
  SocketIOEvent,
  NamedKey,
} from "../../const/types";
import { connectSocket } from "./socketEmitters";
import {
  challengeHandler,
  connectErrorHandler,
  connectHandler,
  helloHandler,
  patchHandler,
} from "./socketReceivers";

const chokidar = require("chokidar");

const registerSocketEventHandler = (
  event: SocketIOEvent,
  socket: any,
  handler: any
) => socket.on(event, handler);

export const registerSocketReceivers = (
  socket: any,
  senderKeys: NamedKey[],
  eventQueue: EventQueue,
  keys: Keys,
  loadingSpinner: any
) => {
  registerSocketEventHandler("connect", socket, () =>
    connectHandler(loadingSpinner)
  );
  registerSocketEventHandler("connect-error", socket, (error: any) =>
    connectErrorHandler(error)
  );
  registerSocketEventHandler("patch", socket, (patch: EncryptedPatch) =>
    patchHandler(patch, senderKeys, eventQueue, keys)
  );
  registerSocketEventHandler("hello", socket, (message: string) =>
    helloHandler(message)
  );
  registerSocketEventHandler("challenge", socket, (challenge: string) =>
    challengeHandler(challenge, socket, keys)
  );

  return socket;
};

export const initSocket = (
  eventQueue: EventQueue,
  host: string,
  keys: Keys,
  senderKeys: NamedKey[],
  loadingSpinner: any
) =>
  registerSocketReceivers(
    connectSocket(host, keys, loadingSpinner),
    senderKeys,
    eventQueue,
    keys,
    loadingSpinner
  );

export const registerLocalListeners = (eventQueue: EventQueue) => {
  chokidar.watch(".").on("all", (event: string, path: string) => {
    eventQueue.local.push({
      timestamp: Date.now(),
      metadata: { event, path },
    });
  });
};
