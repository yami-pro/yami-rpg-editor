'use strict'

// ******************************** 编解码器 ********************************
// undefined按位运算等价于0，因此不会产生NaN

const Codec = {
  // properties
  textEncoder: new TextEncoder(),
  textDecoder: new TextDecoder(),
  // methods
  encodeScene: null,
  decodeScene: null,
  encodeTilemap: null,
  decodeTilemap: null,
  encodeTiles: null,
  decodeTiles: null,
  encodeTerrains: null,
  decodeTerrains: null,
  encodeRelations: null,
  decodeRelations: null,
  encodeClone: null,
  decodeClone: null,
  getTilemaps: null,
}

export { Codec }
