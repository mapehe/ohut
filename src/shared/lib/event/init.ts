import RequestHandlers from './RequestHandlers'
import EventQueue from '../../const/class/EventQueue'
import { Keys, SocketIOEvent, NamedKey, Request } from '../../const/types'
import connectSocket from './socketEmitters'
import {
  challengeHandler,
  connectErrorHandler,
  connectHandler,
  helloHandler
} from './socketReceivers'

const chokidar = require('chokidar')

const registerSocketEventHandler = (
  event: SocketIOEvent,
  socket: any,
  handler: any
) => socket.on(event, handler)

export const registerSocketReceivers = async (
  senderKeys: NamedKey[],
  eventQueue: EventQueue,
  keys: Keys,
  host: string
): Promise<RequestHandlers> => {
  const socket = connectSocket(host)
  const initEventHandlers = new RequestHandlers(keys, senderKeys, socket)

  registerSocketEventHandler('connect', socket, () => connectHandler())
  registerSocketEventHandler('connect-error', socket, (error: any) =>
    connectErrorHandler(error)
  )
  registerSocketEventHandler('patch', socket, (remoteEvent: Request) =>
    initEventHandlers.handleRequest(remoteEvent, eventQueue)
  )
  registerSocketEventHandler('hello', socket, (message: string) =>
    helloHandler(message)
  )
  registerSocketEventHandler('challenge', socket, (challenge: Buffer) =>
    challengeHandler(challenge, socket, keys)
  )

  return initEventHandlers
}

export const initEventHandlers = (
  eventQueue: EventQueue,
  host: string,
  keys: Keys,
  senderKeys: NamedKey[]
): Promise<RequestHandlers> =>
  registerSocketReceivers(senderKeys, eventQueue, keys, host)

export const registerLocalListeners = (eventQueue: EventQueue) => {
  chokidar.watch('.').on('all', (event: string, path: string) => {
    eventQueue.local.push({
      timestamp: Date.now(),
      metadata: { event, path }
    })
  })
}
