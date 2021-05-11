import { Patch, FsEvent } from '../types'
import DebouncedArray from './DebouncedArray'

export default class EventQueue {
  remote: DebouncedArray<Patch>

  local: DebouncedArray<FsEvent>

  constructor(debounceRate: number) {
    this.remote = new DebouncedArray<Patch>([], debounceRate)
    this.local = new DebouncedArray<FsEvent>([], debounceRate)
  }

  getLatestRemoteEvent = (head: string): Patch | undefined => {
    const newestPatch = this.remote.data
      .filter((patch) => patch.head === head)
      .sort((a, b) => b.timestamp - a.timestamp)[0]
    return newestPatch
  }

  getLatestLocalEvent = (): FsEvent | undefined =>
    this.local.data.sort((a, b) => b.timestamp - a.timestamp)[0]
}
