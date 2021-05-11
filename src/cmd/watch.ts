import { getHead, applyPatch, isGitRepo } from "../shared/lib/console";
import { initSocket, registerLocalListeners } from "../shared/lib/event/init";
import { Config, Keys, NamedKey } from "../shared/const/types";
import {
  publicKey,
  privateKey,
  trustedKeysDir,
  localEncoding,
} from "../shared/const/global";
import { getConfig, getTrustedKeys } from "../shared/lib/util";
import strings from "../shared/const/strings";
import { emitPatch } from "../shared/lib/event/socketEmitters";
import EventQueue from "../shared/const/class/EventQueue";

const fs = require("fs");
const loadingSpinner = require("loading-spinner");

const eventLoop = async (
  events: EventQueue,
  socket: any,
  config: Config,
  keys: Keys,
  destinationKeys: NamedKey[],
  passive: boolean,
  refreshRate: number,
  tmpFile: string
) => {
  const { stdout: head } = await getHead();
  const latestRemoteEvent = events.getLatestRemoteEvent(head);
  const latestLocalEvent = events.getLatestLocalEvent();

  if (latestRemoteEvent) {
    const { name, email } = latestRemoteEvent.author;
    console.log(
      strings.log.cmd.watch.info.applyPatch(
        name || strings.common.unknown,
        email || strings.common.unknown
      )
    );
    await applyPatch(latestRemoteEvent, tmpFile);
    events.local.flush();
    events.remote.flush();
  } else if (latestLocalEvent) {
    if (!passive) {
      await Promise.all(
        destinationKeys.map((key) => emitPatch(head, socket, keys, key.key))
      );
    }
    events.local.flush();
  }

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(
        eventLoop(
          events,
          socket,
          config,
          keys,
          destinationKeys,
          passive,
          refreshRate,
          tmpFile
        )
      );
    }, refreshRate);
  });
};

export const watch = async (
  serverName: string,
  keyNames: string[],
  allKeys: boolean,
  passive: boolean,
  debounceRate: number,
  refreshRate: number,
  tmpFile: string
) => {
  const config = getConfig();
  const host = config.servers.find(({ name }) => name === serverName);
  if (host) {
    const eventQueue = new EventQueue(debounceRate);
    const keys = {
      publicKey: fs.readFileSync(publicKey, localEncoding).toString(),
      privateKey: fs.readFileSync(privateKey, localEncoding).toString(),
    };
    const allTrustedKeys = getTrustedKeys(trustedKeysDir);
    const trustedKeyNames = allTrustedKeys.map(({ name }) => name);
    keyNames.forEach((keyName) => {
      if (!trustedKeyNames.includes(keyName)) {
        throw strings.log.cmd.watch.error.invalidTrustedKeyName(keyName);
      }
    });
    const destinationKeys = allKeys
      ? allTrustedKeys
      : allTrustedKeys.filter(({ name }) => keyNames.includes(name));
    const senderKeys = destinationKeys;
    if (await isGitRepo()) {
      if (destinationKeys.length > 0) {
        const socket = initSocket(
          eventQueue,
          host.url,
          keys,
          senderKeys,
          loadingSpinner
        );
        registerLocalListeners(eventQueue);
        await eventLoop(
          eventQueue,
          socket,
          config,
          keys,
          destinationKeys,
          passive,
          refreshRate,
          tmpFile
        );
      } else {
        throw strings.log.cmd.watch.error.noTrustedKeys;
      }
    } else {
      throw strings.log.cmd.watch.error.notInGitRepo;
    }
  } else {
    throw strings.log.cmd.watch.error.noSuchServer(serverName);
  }
};

export const { command, desc } = strings.cmd.watch;
export const builder = (yargs: any) => {
  yargs
    .boolean(strings.cmd.watch.boolean.allKeys.name)
    .alias(
      strings.cmd.watch.boolean.allKeys.name,
      strings.cmd.watch.boolean.allKeys.alias
    )
    .describe(
      strings.cmd.watch.boolean.allKeys.name,
      strings.cmd.watch.boolean.allKeys.describe
    )
    .boolean(strings.cmd.watch.boolean.passive.name)
    .alias(
      strings.cmd.watch.boolean.passive.name,
      strings.cmd.watch.boolean.passive.alias
    )
    .describe(
      strings.cmd.watch.boolean.passive.name,
      strings.cmd.watch.boolean.passive.describe
    )
    .option(strings.cmd.watch.option.debounceRate.name)
    .alias(
      strings.cmd.watch.option.debounceRate.name,
      strings.cmd.watch.option.debounceRate.alias
    )
    .describe(
      strings.cmd.watch.option.debounceRate.name,
      strings.cmd.watch.option.debounceRate.describe
    )
    .default(
      strings.cmd.watch.option.debounceRate.name,
      strings.cmd.watch.option.debounceRate.default
    )
    .option(strings.cmd.watch.option.refreshRate.name)
    .alias(
      strings.cmd.watch.option.refreshRate.name,
      strings.cmd.watch.option.refreshRate.alias
    )
    .describe(
      strings.cmd.watch.option.refreshRate.name,
      strings.cmd.watch.option.refreshRate.describe
    )
    .default(
      strings.cmd.watch.option.refreshRate.name,
      strings.cmd.watch.option.refreshRate.default
    )
    .option(strings.cmd.watch.option.tmpFile.name)
    .alias(
      strings.cmd.watch.option.tmpFile.name,
      strings.cmd.watch.option.tmpFile.alias
    )
    .describe(
      strings.cmd.watch.option.tmpFile.name,
      strings.cmd.watch.option.tmpFile.describe
    )
    .option(strings.cmd.watch.option.password.name)
    .alias(
      strings.cmd.watch.option.password.name,
      strings.cmd.watch.option.password.alias
    )
    .describe(
      strings.cmd.watch.option.password.name,
      strings.cmd.watch.option.password.describe
    )
    .default(
      strings.cmd.watch.option.password.name,
      strings.cmd.watch.option.password.default
    );
};
export const handler = (argv: any) => {
  const keyNames: string[] = Array.from(new Set(argv.keys));
  watch(
    argv.server,
    keyNames,
    argv[strings.cmd.watch.boolean.allKeys.name],
    argv[strings.cmd.watch.boolean.passive.name],
    argv[strings.cmd.watch.option.debounceRate.name],
    argv[strings.cmd.watch.option.refreshRate.name],
    argv[strings.cmd.watch.option.tmpFile.name] ||
      `/tmp/ohut_${String(Date.now())}`
  )
    .then(() => process.exit(0))
    .catch((error) => {
      console.log(error);
      process.exit(1);
    });
};
