import strings from '../const/strings'
import { Config, PatchHeader, PatchWithDestination } from '../const/types'

export const parsePatchWithDestination = (
  data: string
): PatchWithDestination => {
  try {
    return JSON.parse(data)
  } catch {
    throw strings.log.shared.warning.patchParseFailure
  }
}

export const parsePatchHeader = (data: string): PatchHeader => {
  try {
    const { key, iv } = JSON.parse(data)
    return {
      key: Buffer.from(key.data),
      iv: Buffer.from(iv.data)
    }
  } catch {
    throw strings.log.shared.warning.headerParseFailure
  }
}

export const parseConfig = (data: string): Config => {
  try {
    return JSON.parse(data)
  } catch {
    throw strings.log.shared.warning.configParseFailure
  }
}
