import { io } from 'socket.io-client'
import { URL } from 'url'
import { encoding } from '../../const/global'
import strings from '../../const/strings'
import { getKeys, keyToBuffer } from '../util'

const connectSocket = (url: string, force: boolean) => {
  const { publicKey } = getKeys()
  const secure = new URL(url).protocol === 'https:'
  if (secure || force) {
    const socket = io(url, {
      auth: {
        publicKey: keyToBuffer(publicKey).toString(encoding)
      }
    })
    console.log(strings.log.cmd.watch.info.connectingTo(url))
    return socket
  }
  throw strings.log.cmd.watch.error.insecureURL
}

export default connectSocket
