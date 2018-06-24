'use strict'

// https://github.com/bitcoin/bitcoin/blob/5961b23898ee7c0af2626c46d5d70e80136578d3/src/script/script.h#L39
const LOCKTIME_THRESHOLD = 0x1dcd6500 // 500000000

function decode (lockTime) {
  if (lockTime >= LOCKTIME_THRESHOLD) {
    return {
      utc: lockTime
    }
  }

  return {
    blocks: lockTime
  }
}

function encode (obj) {
  let blocks = obj.blocks
  let utc = obj.utc
  if (blocks !== undefined && utc !== undefined) throw new TypeError('Cannot encode blocks AND utc')
  if (blocks === undefined && utc === undefined) return 0 // neither?

  if (utc !== undefined) {
    if (!Number.isFinite(utc)) throw new TypeError('Expected Number utc')
    if (utc < LOCKTIME_THRESHOLD) throw new TypeError('Expected Number utc >= ' + LOCKTIME_THRESHOLD)

    return utc
  }

  if (!Number.isFinite(blocks)) throw new TypeError('Expected Number blocks')
  if (blocks >= LOCKTIME_THRESHOLD) throw new TypeError('Expected Number blocks < ' + LOCKTIME_THRESHOLD)

  return blocks
}

module.exports = { decode, encode }
