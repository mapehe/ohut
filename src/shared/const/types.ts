export type Config = {
  servers: { name: string; url: string }[];
};

export type Keys = {
  publicKey: Buffer;
  privateKey: Buffer;
};

export type NamedKey = {
  name: string;
  key: string;
};

export type FsEvent = {
  timestamp: number;
  metadata: {
    event: string;
    path: string;
  };
};

export type Patch = {
  head: string;
  patch: string;
  timestamp: number;
  author: { name: string | undefined; email: string | undefined };
};

export type PatchHeader = {
  key: Buffer;
  iv: Buffer;
};

export type DecryptedPatch = {
  patch: Patch;
  signature: Buffer;
  senderKey: Buffer;
};

export type EncryptedPatch = {
  destinationKey: Buffer;
  senderKey: Buffer;
  data: Buffer;
  header: Buffer;
  signature: Buffer;
};

export type ConsoleOutput = { stdout: string; stderr: string };

export type SocketIOEvent =
  | "connect"
  | "connect-error"
  | "patch"
  | "hello"
  | "challenge";
