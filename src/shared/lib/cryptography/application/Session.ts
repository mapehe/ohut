import { KeyObject, DiffieHellman, pbkdf2Sync, randomBytes } from 'crypto'
import EventQueue from '../../../const/class/EventQueue'
import {
  symmetricKeyBytes,
  pbkdf2SyncPasses,
  pbkdf2HashAlgorithm,
  saltBytes
} from '../../../const/global'
import strings from '../../../const/strings'
import {
  Patch,
  Request,
  Keys,
  SessionResponse,
  NamedKey,
  SessionRequest
} from '../../../const/types'
import { checkPatchHead, keyToBuffer } from '../../util'
import { decryptPatch, encryptPatch } from './patch'
import { createSessionRequest, createSessionResponse } from './sessionEvents'
import validateRequest from './validate'

export default class Session {
  signatureKeys: Keys

  destinationKey: KeyObject

  keyName: string

  socket: any

  dh: DiffieHellman

  sessionPublicKey: Buffer

  sessionPrivateKey: Buffer | undefined = undefined

  salt: Buffer

  pollForSession = (): Promise<void> => {
    if (!this.sessionPrivateKey) {
      this.sendSessionRequest()
      return new Promise((resolve) =>
        setTimeout(() => resolve(this.pollForSession()), 1000)
      )
    }
    return Promise.resolve()
  }

  calculateSecrets = (sessionResponse: SessionResponse) => {
    if (!this.sessionPrivateKey) {
      const salt =
        this.sessionPublicKey.toString('hex') >
        sessionResponse.publicSessionKey.toString('hex')
          ? this.salt
          : sessionResponse.salt
      const secret = this.dh.computeSecret(sessionResponse.publicSessionKey)
      this.sessionPrivateKey = pbkdf2Sync(
        secret,
        salt,
        pbkdf2SyncPasses,
        symmetricKeyBytes,
        pbkdf2HashAlgorithm
      )
      console.log(strings.log.cmd.watch.info.sessionEstablished(this.keyName))
    }
  }

  /*
          EMITTERS
  */

  sendPatch = async (patch: Patch) => {
    if (this.sessionPrivateKey) {
      const remoteEvent = encryptPatch(
        {
          ...patch,
          destinationKey: keyToBuffer(this.destinationKey).toString()
        },
        this.sessionPrivateKey,
        this.signatureKeys,
        this.destinationKey
      )
      this.socket.emit('patch', remoteEvent)
    } else {
      this.sendSessionRequest()
    }
  }

  sendSessionRequest = () => {
    const remoteEvent = createSessionRequest(
      this.destinationKey,
      this.signatureKeys
    )
    return this.socket.emit('patch', remoteEvent)
  }

  sendSessionResponse = () => {
    const remoteEvent = createSessionResponse(
      this.sessionPublicKey,
      this.destinationKey,
      this.salt,
      this.signatureKeys
    )
    return this.socket.emit('patch', remoteEvent)
  }

  /*
          RECEIVERS
  */

  handleSessionRequest = (request: Request) => {
    const stringData = JSON.stringify(request.data as SessionRequest)
    if (
      validateRequest(
        request,
        stringData,
        this.signatureKeys.publicKey,
        this.destinationKey
      )
    ) {
      this.sendSessionResponse()
      if (!this.sessionPrivateKey) {
        setTimeout(() => {
          this.sendSessionRequest()
        }, 1000)
      }
    }
  }

  handleSessionResponse = (request: Request) => {
    const stringData = JSON.stringify(request.data as SessionResponse)
    if (
      validateRequest(
        request,
        stringData,
        this.signatureKeys.publicKey,
        this.destinationKey
      )
    ) {
      this.calculateSecrets(request.data as SessionResponse)
    }
  }

  handlePatch = (request: Request, eventQueue: EventQueue) => {
    if (this.sessionPrivateKey) {
      const decrypted = decryptPatch(request, this.sessionPrivateKey)
      const stringData = JSON.stringify(decrypted.patchWithDestination)
      if (
        validateRequest(
          request,
          stringData,
          this.signatureKeys.publicKey,
          this.destinationKey
        )
      ) {
        const patch = decrypted.patchWithDestination
        if (checkPatchHead(patch)) {
          eventQueue.remote.push(patch)
        } else {
          const { name, email } = patch.author
          console.log(
            strings.log.shared.warning.headMismatch(
              name || 'unknown',
              email || 'unknown'
            )
          )
        }
      }
    } else {
      this.sendSessionRequest()
    }
  }

  handleRequest = (request: Request, eventQueue: EventQueue) => {
    if (request.type === 'patch') {
      this.handlePatch(request, eventQueue)
    } else if (request.type === 'session_response') {
      this.handleSessionResponse(request)
    } else if (request.type === 'session_request') {
      this.handleSessionRequest(request)
    }
  }

  constructor(
    keys: Keys,
    destinationKey: NamedKey,
    socket: any,
    dh: DiffieHellman
  ) {
    this.destinationKey = destinationKey.key
    this.keyName = destinationKey.name
    this.socket = socket
    this.signatureKeys = keys
    this.dh = dh
    this.sessionPublicKey = this.dh.generateKeys()
    this.salt = randomBytes(saltBytes)
    this.pollForSession()
  }
}
