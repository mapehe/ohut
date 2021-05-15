import { io } from 'socket.io-client'
import { encoding } from '../../const/global'
import strings from '../../const/strings'
import { getKeys, keyToBuffer } from '../util'

const connectSocket = (url: string) => {
  const { publicKey } = getKeys()
  const socket = io(url, {
    auth: {
      publicKey: keyToBuffer(publicKey).toString(encoding)
    }
  })
  process.stdout.write(strings.log.cmd.watch.info.connectingTo(url))
  return socket
}

export default connectSocket
