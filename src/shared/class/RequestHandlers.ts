import { encoding } from '../const/global'
import { Keys, Request, Patch, NamedKey } from '../const/types'
import EventQueue from './EventQueue'
import { getDiff, getGitConfig, getHead } from '../lib/console'
import { keyToBuffer, parseAuthorInfo } from '../lib/util'
import Session from './Session'

export default class RequestHandlers {
  sessions: Session[]

  handleRequest = (request: Request, eventQueue: EventQueue) => {
    try {
      this.sessions
        .find(
          (session) =>
            keyToBuffer(session.destinationKey).toString(encoding) ===
            request.senderKey.toString(encoding)
        )
        ?.handleRequest(request, eventQueue)
    } catch (error) {
      console.log(error)
    }
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
    this.sessions = destinationKeys.map(
      (destinationKey) => new Session(keys, destinationKey, socket)
    )
  }
}
