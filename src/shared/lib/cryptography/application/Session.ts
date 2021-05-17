import { KeyObject, DiffieHellman, pbkdf2Sync, randomBytes } from 'crypto'
import EventQueue from '../../../const/class/EventQueue'
import {
  symmetricKeyBytes,
  pbkdf2SyncPasses,
  pbkdf2HashAlgorithm,
  saltBytes,
  diffieHellmanGenerator,
  diffieHellmanPrime
} from '../../../const/global'
import strings from '../../../const/strings'
import {
  Patch,
  Request,
  Keys,
  NamedKey,
  SessionRequest
} from '../../../const/types'
import { checkPatchHead, keyToBuffer } from '../../util'
import { decryptPatch, encryptPatch } from './patch'
import { createSessionRequest, createSessionResponse } from './sessionEvents'
import validateRequest from './validate'

const { createDiffieHellman } = require('crypto')

export default class Session {
  signatureKeys: Keys

  destinationKey: KeyObject

  keyName: string

  socket: any

  dh: DiffieHellman

  sessionPublicKey: Buffer

  salt: Buffer

  sessionPrivateKey: Buffer | undefined = undefined

  remoteSessionPublicKey: Buffer | undefined = undefined

  pollForSession = (): Promise<void> => {
    if (!this.sessionPrivateKey) {
      this.sendSessionRequest()
    }
    return new Promise((resolve) =>
      setTimeout(() => resolve(this.pollForSession()), 1000)
    )
  }

  calculateSecrets = (sessionResponse: SessionRequest) => {
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

  /*
          EMITTERS
  */

  sendPatch = async (patch: Patch) => {
    if (this.sessionPrivateKey) {
      const remoteEvent = encryptPatch(
        {
          ...patch,
          destinationKey: keyToBuffer(this.destinationKey)
        },
        this.sessionPrivateKey,
        this.signatureKeys,
        this.destinationKey
      )
      this.socket.emit('patch', remoteEvent)
    }
  }

  sendSessionRequest = () => {
    const remoteEvent = createSessionRequest(
      this.sessionPublicKey,
      this.destinationKey,
      this.salt,
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
    const requestData = request.data as SessionRequest
    const stringData = JSON.stringify(requestData)
    if (
      validateRequest(
        request,
        stringData,
        this.signatureKeys.publicKey,
        this.destinationKey
      )
    ) {
      if (
        this.remoteSessionPublicKey &&
        !requestData.publicSessionKey.equals(this.remoteSessionPublicKey)
      ) {
        console.log(strings.log.cmd.watch.info.reconnecting(this.keyName))
        this.remoteSessionPublicKey = requestData.publicSessionKey
        this.createSessionKeys()
        this.calculateSecrets(requestData)
        this.sendSessionResponse()
      } else if (!this.remoteSessionPublicKey) {
        this.remoteSessionPublicKey = requestData.publicSessionKey
        this.calculateSecrets(requestData)
        this.sendSessionResponse()
      }
    }
  }

  handleSessionResponse = (request: Request) => {
    const requestData = request.data as SessionRequest
    const stringData = JSON.stringify(requestData)
    if (
      validateRequest(
        request,
        stringData,
        this.signatureKeys.publicKey,
        this.destinationKey
      )
    ) {
      if (
        this.remoteSessionPublicKey &&
        !requestData.publicSessionKey.equals(this.remoteSessionPublicKey)
      ) {
        console.log(strings.log.cmd.watch.info.reconnecting(this.keyName))
        this.remoteSessionPublicKey = requestData.publicSessionKey
        this.createSessionKeys()
        this.calculateSecrets(requestData)
      } else if (!this.remoteSessionPublicKey) {
        this.remoteSessionPublicKey = requestData.publicSessionKey
        this.calculateSecrets(requestData)
      }
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

  createSessionKeys = () => {
    this.dh = createDiffieHellman(diffieHellmanPrime, diffieHellmanGenerator)
    this.sessionPublicKey = this.dh.generateKeys()
    this.salt = randomBytes(saltBytes)
  }

  constructor(keys: Keys, destinationKey: NamedKey, socket: any) {
    this.destinationKey = destinationKey.key
    this.keyName = destinationKey.name
    this.socket = socket
    this.signatureKeys = keys
    this.createSessionKeys()
    this.pollForSession()
  }
}
