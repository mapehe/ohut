import { KeyObject } from 'crypto'

export type RequestType = 'patch' | 'session_request' | 'session_response'

export type SocketIOEvent =
  | 'connect'
  | 'connect-error'
  | 'patch'
  | 'hello'
  | 'challenge'

export type Config = {
  servers: { name: string; url: string }[]
}

export type Keys = {
  publicKey: KeyObject
  privateKey: KeyObject
}

export type NamedKey = {
  name: string
  key: KeyObject
}

export type FsEvent = {
  timestamp: number
  metadata: {
    event: string
    path: string
  }
}

export type Patch = {
  head: string
  patch: string
  timestamp: number
  author: { name: string | undefined; email: string | undefined }
}

export interface PatchWithDestination extends Patch {
  destinationKey: Buffer
}

export type PatchHeader = {
  key: Buffer
  iv: Buffer
}

export type DecryptedPatch = {
  patchWithDestination: PatchWithDestination
  signature: Buffer
  senderKey: Buffer
}

export type EncryptedPatch = {
  data: Buffer
  iv: Buffer
}

export type SessionRequest = {
  destinationKey: Buffer
  publicSessionKey: Buffer
  salt: Buffer
}

export type Request = {
  destinationKey: Buffer
  senderKey: Buffer
  type: RequestType
  data: EncryptedPatch | SessionRequest
  signature: Buffer
}

export type ConsoleOutput = { stdout: string; stderr: string }
