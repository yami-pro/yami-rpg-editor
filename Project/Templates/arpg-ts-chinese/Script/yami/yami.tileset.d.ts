/** 自动图块模板 */
type AutoTileTemplate = {
  id: string
  name: string
  cover: number
  nodes: Array<{
    rule: number
    frames: Array<number>
  }>
}

/** 图块文件 */
type TileFile = NormalTileFile | AutoTileFile

/** 普通图块文件 */
type NormalTileFile = {
  id: string //+
  path: string //+
  type: 'normal'
  image: string
  width: number
  height: number
  tileWidth: number
  tileHeight: number
  globalOffsetX: number
  globalOffsetY: number
  globalPriority: number
  priorities: Array<number>
  terrains: Array<TerrainCode>
  tags: Array<number>
}

/** 自动图块文件 */
type AutoTileFile = {
  id: string //+
  path: string //+
  type: 'auto'
  width: number
  height: number
  tileWidth: number
  tileHeight: number
  globalOffsetX: number
  globalOffsetY: number
  globalPriority: number
  tiles: Array<AutoTileData | 0>
  priorities: Array<number>
  terrains: Array<TerrainCode>
  tags: Array<number>
}

/** 自动图块数据 */
type AutoTileData = {
  template: string
  image: string
  x: number
  y: number
}