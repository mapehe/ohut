import {
  diffieHellmanGenerator,
  diffieHellmanPrime,
  encoding
} from '../../const/global'
import { Keys, Request, Patch, NamedKey } from '../../const/types'
import EventQueue from '../../const/class/EventQueue'
import { getDiff, getGitConfig, getHead } from '../console'
import { keyToBuffer, parseAuthorInfo } from '../util'
import Session from '../cryptography/application/Session'

const { createDiffieHellman } = require('crypto')

export default class RequestHandlers {
  sessions: Session[]

  handleRequest = (request: Request, eventQueue: EventQueue) => {
    this.sessions
      .find(
        (session) =>
          keyToBuffer(session.destinationKey).toString(encoding) ===
          request.senderKey.toString(encoding)
      )
      ?.handleRequest(request, eventQueue)
  }

  sendPatch = async () => {
    const { stdout: diff } = await getDiff()
    const { stdout: config } = await getGitConfig()
    const { stdout: head } = await getHead()
    const authorInfo = parseAuthorInfo(config)
    const patch: Patch = {
      head,
      patch: diff,
      timestamp: Date.now(),
      author: { name: authorInfo?.name, email: authorInfo?.email }
    }
    this.sessions.forEach((session) => session.sendPatch(patch))
  }

  constructor(keys: Keys, destinationKeys: NamedKey[], socket: any) {
    this.sessions = destinationKeys.map((destinationKey) => {
      const dh = createDiffieHellman(diffieHellmanPrime, diffieHellmanGenerator)
      return new Session(keys, destinationKey, socket, dh)
    })
  }
}
