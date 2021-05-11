export type Config = {
  servers: { name: string; url: string }[];
};

export type Keys = {
  publicKey: string;
  privateKey: string;
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
  encryptedHeader: string;
  signature: string;
  senderKey: string;
};

export type EncryptedPatch = {
  destinationKey: string;
  senderKey: string;
  data: string;
  header: string;
  signature: string;
};

export type ConsoleOutput = { stdout: string; stderr: string };

export type SocketIOEvent =
  | "connect"
  | "connect-error"
  | "patch"
  | "hello"
  | "challenge";
