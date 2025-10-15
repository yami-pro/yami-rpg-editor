'use strict'

// ******************************** 编解码器 ********************************
// undefined按位运算等价于0，因此不会产生NaN

const Codec = {
  // properties
  textEncoder: new TextEncoder(),
  textDecoder: new TextDecoder(),
  // methods
  encodeFile: null,
  encodeScene: null,
  decodeScene: null,
  encodeTilemap: null,
  decodeTilemap: null,
  encodeTiles: null,
  decodeTiles: null,
  encodeTerrains: null,
  decodeTerrains: null,
  encodeTeamData: null,
  decodeTeamData: null,
  encodeClone: null,
  decodeClone: null,
  getTilemaps: null,
}

// 编码文件
Codec.encodeFile = function (buffer) {
  // 如果是字符串，转换成缓冲区
  if (typeof buffer === 'string') {
    buffer = this.textEncoder.encode(buffer)
  }
  for (let i = 0; i < 0x10; i++) {
    buffer[i] += 0x80
  }
  return buffer
}

// 编码场景
Codec.encodeScene = function (scene) {
  const tilemaps = this.getTilemaps(scene)
  for (const tilemap of tilemaps) {
    Codec.encodeTilemap(tilemap)
  }
  if (scene.terrainChanged) {
    scene.terrainChanged = false
    scene.terrains = this.encodeTerrains(scene.terrainArray)
  }
  return scene
}

// 解码场景
Codec.decodeScene = function (scene) {
  if (scene.terrainArray === undefined) {
    const terrainArray = this.decodeTerrains(scene.terrains, scene.width, scene.height)
    Object.defineProperty(scene, 'terrainArray', {writable: true, value: terrainArray})
    Object.defineProperty(scene, 'terrainChanged', {writable: true, value: false})
    const tilemaps = this.getTilemaps(scene)
    for (const tilemap of tilemaps) {
      Codec.decodeTilemap(tilemap)
    }
  }
  return scene
}

// 编码瓦片地图
Codec.encodeTilemap = function (tilemap) {
  if (tilemap.changed) {
    tilemap.changed = false
    tilemap.code = Codec.encodeTiles(tilemap.tiles)
    // 修剪图块组映射表
    const flags = {}
    const tilesetMap = tilemap.tilesetMap
    const indices = Object.keys(tilesetMap)
    for (const index of indices) {
      flags[index] = false
    }
    const tiles = tilemap.tiles
    const length = tiles.length
    for (let i = 0; i < length; i++) {
      const index = tiles[i] >> 24
      if (index === 0) continue
      flags[index] = true
    }
    const trimmedMap = {}
    const reverseMap = {}
    for (const index of indices) {
      if (flags[index]) {
        const guid = tilesetMap[index]
        trimmedMap[index] = guid
        reverseMap[guid] = parseInt(index)
      }
    }
    tilemap.tilesetMap = trimmedMap
    tilemap.reverseMap = reverseMap
  }
}

// 解码瓦片地图
Codec.decodeTilemap = function (tilemap) {
  const tiles = Codec.decodeTiles(tilemap.code, tilemap.width, tilemap.height)
  Object.defineProperty(tilemap, 'tiles', {writable: true, value: tiles})
  Object.defineProperty(tilemap, 'changed', {writable: true, value: false})
  Object.defineProperty(tilemap, 'reverseMap', {writable: true, value: {}})
  // 构建图块组反向映射表
  const {tilesetMap, reverseMap} = tilemap
  const entries = Object.entries(tilesetMap)
  for (const [index, guid] of entries) {
    reverseMap[guid] = parseInt(index)
  }
  return tilemap
}

// 编码图块
Codec.encodeTiles = function (tiles) {
  const {encodeClone} = this
  const TILES = tiles
  const TILES_LENGTH = TILES.length
  const BYTES = GL.arrays[0].uint8
  let Bi = 0
  let Ti = 0
  while (Ti < TILES_LENGTH) {
    if (TILES[Ti] === 0) {
      let blankCount = 1
      Ti += 1
      while (TILES[Ti] === 0) {
        blankCount++
        Ti++
      }
      if (blankCount <= 16) {
        BYTES[Bi++] = blankCount + 109
      } else {
        BYTES[Bi++] = 126
        Bi = encodeClone(BYTES, Bi, blankCount)
      }
    } else if (TILES[Ti] === TILES[Ti - 1]) {
      let cloneCount = 1
      Ti += 1
      while (TILES[Ti] === TILES[Ti - 1]) {
        cloneCount++
        Ti++
      }
      if (cloneCount <= 10) {
        BYTES[Bi++] = cloneCount + 98
      } else {
        BYTES[Bi++] = 109
        Bi = encodeClone(BYTES, Bi, cloneCount)
      }
    } else {
      const TILE = TILES[Ti]
      BYTES[Bi    ] = (TILE >> 26           ) + 35
      BYTES[Bi + 1] = (TILE >> 20 & 0b111111) + 35
      BYTES[Bi + 2] = (TILE >> 14 & 0b111111) + 35
      BYTES[Bi + 3] = (TILE >> 8  & 0b111111) + 35
      BYTES[Bi + 4] = (TILE       & 0b111111) + 35
      Bi += 5
      Ti += 1
    }
  }
  return this.textDecoder.decode(
    new Uint8Array(BYTES.buffer, 0, Bi)
  )
}

// 解码图块
Codec.decodeTiles = function (code, width, height) {
  const {decodeClone} = this
  const BYTES = this.textEncoder.encode(code)
  const BYTES_LENGTH = BYTES.length
  const TILES = Scene.createTiles(width, height)
  const TILES_LENGTH = TILES.length
  let Bi = 0
  let Ti = 0
  while (Bi < BYTES_LENGTH) {
    const CODE = BYTES[Bi]
    if (CODE <= 98) {
      TILES[Ti] =
        (BYTES[Bi    ] - 35 << 26)
      + (BYTES[Bi + 1] - 35 << 20)
      + (BYTES[Bi + 2] - 35 << 14)
      + (BYTES[Bi + 3] - 35 << 8)
      + (BYTES[Bi + 4] - 35)
      Ti += 1
      Bi += 5
    } else if (CODE <= 109) {
      if (CODE !== 109) {
        const COPY = TILES[Ti - 1]
        const END = Ti + CODE - 98
        while (Ti < END) {
          TILES[Ti++] = COPY
        }
        Bi += 1
      } else {
        const {index, count} = decodeClone(BYTES, ++Bi)
        const COPY = TILES[Ti - 1]
        const END = Ti + count
        while (Ti < END) {
          TILES[Ti++] = COPY
        }
        Bi = index
      }
    } else {
      if (CODE !== 126) {
        Ti += CODE - 109
        Bi += 1
      } else {
        const {index, count} = decodeClone(BYTES, ++Bi)
        Ti += count
        Bi = index
      }
    }
  }
  if (Bi !== BYTES_LENGTH || Ti !== TILES_LENGTH) {
    throw new RangeError(`
    Failed to decode tiles.
    Processed bytes: ${Bi} / ${BYTES_LENGTH}
    Restored data: ${Ti} / ${TILES_LENGTH}
    `)
  }
  return TILES
}

// 编码地形，最多可存放4位数据(目前仅使用了2位)
Codec.encodeTerrains = function (terrains) {
  const {encodeClone} = this
  const TERRAINS = terrains
  const LENGTH = TERRAINS.length
  const BYTES = GL.arrays[0].uint8
  let Bi = 0
  let Ti = 0
  while (Ti < LENGTH) {
    if (TERRAINS[Ti] === 0) {
      let blankCount = 1
      Ti += 1
      while (TERRAINS[Ti] === 0) {
        blankCount++
        Ti++
      }
      if (blankCount <= 49) {
        BYTES[Bi++] = blankCount + 76
      } else if (blankCount <= 98) {
        BYTES[Bi++] = 125
        BYTES[Bi++] = blankCount - 49 + 76
      } else {
        BYTES[Bi++] = 126
        Bi = encodeClone(BYTES, Bi, blankCount)
      }
    } else if (
      TERRAINS[Ti] === TERRAINS[Ti - 1] &&
      TERRAINS[Ti] === TERRAINS[Ti + 1]) {
      let cloneCount = 2
      Ti += 2
      while (TERRAINS[Ti] === TERRAINS[Ti - 1]) {
        cloneCount++
        Ti++
      }
      if (cloneCount <= 25) {
        BYTES[Bi++] = cloneCount + 50
      } else if (cloneCount <= 50) {
        BYTES[Bi++] = 75
        BYTES[Bi++] = cloneCount - 25 + 50
      } else {
        BYTES[Bi++] = 76
        Bi = encodeClone(BYTES, Bi, cloneCount)
      }
    } else {
      BYTES[Bi++] = TERRAINS[Ti++] + 35
    }
  }
  return this.textDecoder.decode(
    new Uint8Array(BYTES.buffer, 0, Bi)
  )
}

// 解码地形
Codec.decodeTerrains = function (code, width, height) {
  const {decodeClone} = this
  const BYTES = this.textEncoder.encode(code)
  const BYTES_LENGTH = BYTES.length
  const TERRAINS = Scene.createTerrains(width, height)
  const TERRAINS_LENGTH = TERRAINS.length
  let Bi = 0
  let Ti = 0
  while (Bi < BYTES_LENGTH) {
    const CODE = BYTES[Bi]
    if (CODE <= 50) {
      TERRAINS[Ti] = CODE - 35
      Ti += 1
      Bi += 1
    } else if (CODE <= 76) {
      if (CODE !== 76) {
        const COPY = TERRAINS[Ti - 1]
        const END = Ti + CODE - 50
        while (Ti < END) {
          TERRAINS[Ti++] = COPY
        }
        Bi += 1
      } else {
        const {index, count} = decodeClone(BYTES, ++Bi)
        const COPY = TERRAINS[Ti - 1]
        const END = Ti + count
        while (Ti < END) {
          TERRAINS[Ti++] = COPY
        }
        Bi = index
      }
    } else {
      if (CODE !== 126) {
        Ti += CODE - 76
        Bi += 1
      } else {
        const {index, count} = decodeClone(BYTES, ++Bi)
        Ti += count
        Bi = index
      }
    }
  }
  if (Bi !== BYTES_LENGTH || Ti !== TERRAINS_LENGTH) {
    throw new RangeError(`
    Failed to decode terrains.
    Processed bytes: ${Bi} / ${BYTES_LENGTH}
    Restored data: ${Ti} / ${TERRAINS_LENGTH}
    `)
  }
  return TERRAINS
}

// 编码队伍数据
Codec.encodeTeamData = function (data) {
  const DATA = data
  const LENGTH = DATA.length
  const BYTES = GL.arrays[0].uint8
  let Bi = 0
  let Ri = 0
  while (Ri < LENGTH) {
    BYTES[Bi++] = 35 + (
      DATA[Ri    ]
    | DATA[Ri + 1] << 1
    | DATA[Ri + 2] << 2
    | DATA[Ri + 3] << 3
    | DATA[Ri + 4] << 4
    | DATA[Ri + 5] << 5
    )
    Ri += 6
  }
  return this.textDecoder.decode(
    new Uint8Array(BYTES.buffer, 0, Bi)
  )
}

// 解码队伍数据
Codec.decodeTeamData = function (code, length) {
  const BYTES = this.textEncoder.encode(code)
  const BYTES_LENGTH = BYTES.length
  const DATA_LENGTH = (length + 1) / 2 * length
  const DATA = new Uint8Array(DATA_LENGTH)
  let Bi = 0
  let Ri = 0
  while (Bi < BYTES_LENGTH) {
    const CODE = BYTES[Bi] - 35
    DATA[Ri    ] = CODE      & 0b000001
    DATA[Ri + 1] = CODE >> 1 & 0b00001
    DATA[Ri + 2] = CODE >> 2 & 0b0001
    DATA[Ri + 3] = CODE >> 3 & 0b001
    DATA[Ri + 4] = CODE >> 4 & 0b01
    DATA[Ri + 5] = CODE >> 5
    Ri += 6
    Bi += 1
  }
  if (Bi !== BYTES_LENGTH || Ri < DATA_LENGTH) {
    throw new RangeError(`
    Failed to decode data.
    Processed bytes: ${Bi} / ${BYTES_LENGTH}
    Restored data: ${Ri} / ${DATA_LENGTH}
    `)
  }
  return DATA
}

// 编码克隆数据
Codec.encodeClone = function (array, index, count) {
  const bits = Math.ceil(Math.log2(count + 1))
  const bytes = Math.ceil(bits / 5)
  for (let i = 0; i < bytes; i++) {
    const n = bytes - i - 1
    const head = n !== 0 ? 1 : 0
    const code = head << 5 | count >> n * 5 & 0b011111
    array[index++] = code + 35
  }
  return index
}

// 解码克隆数据
Codec.decodeClone = function IIFE() {
  const response = {index: 0, count: 0}
  return (array, index) => {
    let count = 0
    let code
    do {
      code = array[index++] - 35
      count = count << 5 | code & 0b011111
    } while (code & 0b100000)
    response.index = index
    response.count = count
    return response
  }
}()

// 获取所有瓦片地图
Codec.getTilemaps = function IIFE() {
  const getTilemaps = (items, list) => {
    for (const item of items) {
      switch (item.class) {
        case 'folder':
          getTilemaps(item.children, list)
          continue
        case 'tilemap':
          list.push(item)
          continue
      }
    }
    return list
  }
  return function (scene) {
    return getTilemaps(scene.objects, [])
  }
}()

// 文件解密函数
// btoa(`new Function(\`
// window.decrypt = buffer => {
//   const array = new Uint8Array(buffer)
//   for (let i = 0; i < 0x10; i++) {
//     array[i] -= 0x80
//   }
//   return buffer
// }
// \`)()
// new Function(\`
// const {decrypt} = window
// window.decrypt = buffer => decrypt(buffer)
// \`)()`)