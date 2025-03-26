/** 场景文件数据 */
type SceneFile = {
  id: string //+
  path: string //+
  width: number
  height: number
  tileWidth: number
  tileHeight: number
  ambient: SceneAmbientLight
  terrains: string
  events: HashMap<CommandFunctionList> //*
  scripts: Array<ScriptData>
  objects: SceneObjectDataDirectory
}

/** 场景环境光 */
type SceneAmbientLight = {
  /** 红[0, 255] */
  red: number
  /** 绿[0, 255] */
  green: number
  /** 蓝[0, 255] */
  blue: number
  /** 直射率[0, 1] */
  direct: number
}

/** 场景选择框 */
type SelectionBox = {
  x: number
  y: number
  size: number
  left: number
  right: number
  top: number
  bottom: number
  timestamp: number
  condition: 'select'
  actor?: Actor
}

/** 场景对象 */
type SceneObject =
| Actor
| Trigger
| SceneRegion
| SceneLight
| SceneAnimation
| SceneParticleEmitter
| SceneParallax
| SceneTilemap

/** 预设对象 */
type PresetObject =
| Actor
| SceneRegion
| SceneLight
| SceneAnimation
| SceneParticleEmitter
| SceneParallax
| SceneTilemap

/** 场景对象数据列表 */
type SceneObjectDataDirectory = Array<SceneObjectFolder | SceneObjectData>

/** 场景对象数据 */
type SceneObjectData =
| SceneActorData
| SceneRegionData
| SceneLightData
| SceneAnimationData
| SceneParticleData
| SceneParallaxData
| SceneTilemapData

/** 场景对象文件夹 */
type SceneObjectFolder = {
  class: 'folder'
  name: string
  expanded: boolean
  hidden: boolean
  locked: boolean
  children: SceneObjectDataDirectory
}

/** 场景角色数据 */
type SceneActorData = {
  scene: SceneFile //+
  class: 'actor'
  name: string
  type: 'local' | 'global'
  enabled: boolean
  hidden: boolean
  locked: boolean
  presetId: string
  actorId: string
  teamId: string
  x: number
  y: number
  angle: number
  scale: number
  conditions: Array<SceneObjectCondition>
  events: HashMap<CommandFunctionList> //*
  scripts: Array<ScriptData>
  data: ActorFile //+
}

/** 场景区域数据 */
type SceneRegionData = {
  scene: SceneFile //+
  class: 'region'
  name: string
  enabled: boolean
  hidden: boolean
  locked: boolean
  presetId: string
  color: string
  x: number
  y: number
  width: number
  height: number
  conditions: Array<SceneObjectCondition>
  events: HashMap<CommandFunctionList> //*
  scripts: Array<ScriptData>
}

/** 场景光源初始化选项 */
interface LightOptions {
  name?: string
  presetId?: string
  selfVarId?: string
  visible?: boolean
  type?: LightType
  blend?: LightBlendingMode
  x?: number
  y?: number
  range?: number
  intensity?: number
  mask?: string
  anchorX?: number
  anchorY?: number
  width?: number
  height?: number
  angle?: number
  red?: number
  green?: number
  blue?: number
  direct?: number
  events?: HashMap<CommandFunctionList>
  scripts?: Array<ScriptData>
}

/** 场景光源数据 */
type SceneLightData = {
  scene: SceneFile //+
  class: 'light'
  name: string
  enabled: boolean
  hidden: boolean
  locked: boolean
  presetId: string
  type: LightType
  blend: LightBlendingMode
  x: number
  y: number
  range: number
  intensity: number
  mask: string
  anchorX: number
  anchorY: number
  width: number
  height: number
  angle: number
  red: number
  green: number
  blue: number
  direct: number
  conditions: Array<SceneObjectCondition>
  events: HashMap<CommandFunctionList> //*
  scripts: Array<ScriptData>
  visible?: boolean //+
  selfVarId?: '' //+
}

/** 场景动画数据 */
type SceneAnimationData = {
  scene: SceneFile //+
  class: 'animation'
  name: string
  enabled: boolean
  hidden: boolean
  locked: boolean
  presetId: string
  animationId: string
  motion: string
  rotatable: boolean
  x: number
  y: number
  angle: number
  scale: number
  speed: number
  opacity: number
  priority: number
  conditions: Array<SceneObjectCondition>
  events: HashMap<CommandFunctionList> //*
  scripts: Array<ScriptData>
  data: AnimationFile //+
}

/** 场景粒子数据 */
type SceneParticleData = {
  scene: SceneFile //+
  class: 'particle'
  name: string
  enabled: boolean
  hidden: boolean
  locked: boolean
  presetId: string
  particleId: string
  x: number
  y: number
  angle: number
  scale: number
  speed: number
  opacity: number
  priority: number
  conditions: Array<SceneObjectCondition>
  events: HashMap<CommandFunctionList> //*
  scripts: Array<ScriptData>
  data: ParticleFile //+
}

/** 场景视差图数据 */
type SceneParallaxData = {
  scene: SceneFile //+
  class: 'parallax'
  name: string
  enabled: boolean
  hidden: boolean
  locked: boolean
  presetId: string
  image: string
  layer: ParallaxLayer
  order: number
  light: LightSamplingMode
  blend: BlendingMode
  opacity: number
  x: number
  y: number
  scaleX: number
  scaleY: number
  repeatX: number
  repeatY: number
  anchorX: number
  anchorY: number
  offsetX: number
  offsetY: number
  parallaxFactorX: number
  parallaxFactorY: number
  shiftSpeedX: number
  shiftSpeedY: number
  tint: ImageTint
  conditions: Array<SceneObjectCondition>
  events: HashMap<CommandFunctionList> //*
  scripts: Array<ScriptData>
  visible?: boolean //+
  selfVarId?: string //+
}

/** 场景瓦片地图数据 */
type SceneTilemapData = {
  scene: SceneFile //+
  class: 'tilemap'
  name: string
  enabled: boolean
  hidden: boolean
  locked: boolean
  presetId: string
  tilesetMap: HashMap<string>
  shortcut: number
  layer: TilemapLayer
  order: number
  light: TilemapLightSamplingMode
  blend: BlendingMode
  x: number
  y: number
  width: number
  height: number
  anchorX: number
  anchorY: number
  offsetX: number
  offsetY: number
  parallaxFactorX: number
  parallaxFactorY: number
  opacity: number
  code: string
  conditions: Array<SceneObjectCondition>
  events: HashMap<CommandFunctionList> //*
  scripts: Array<ScriptData>
  visible?: boolean //+
  selfVarId?: string //+
  tileStartX?: number //+
  tileStartY?: number //+
  tileEndX?: number //+
  tileEndY?: number //+
}

/** 场景对象条件 */
type SceneObjectCondition =
SceneObjectConditionGlobalBoolean |
SceneObjectConditionGlobalNumber |
SceneObjectConditionGlobalString |
SceneObjectConditionSelfBoolean |
SceneObjectConditionSelfNumber |
SceneObjectConditionSelfString

/** 场景对象条件 - 全局布尔值 */
type SceneObjectConditionGlobalBoolean = {
  type: 'global-boolean'
  key: string
  operation: BooleanLogicOperation
  value: boolean
}

/** 场景对象条件 - 全局数值 */
type SceneObjectConditionGlobalNumber = {
  type: 'global-number'
  key: string
  operation: NumberLogicOperation
  value: number
}

/** 场景对象条件 - 全局字符串 */
type SceneObjectConditionGlobalString = {
  type: 'global-string'
  key: string
  operation: StringLogicOperation
  value: string
}

/** 场景对象条件 - 独立布尔值 */
type SceneObjectConditionSelfBoolean = {
  type: 'self-boolean'
  operation: BooleanLogicOperation
  value: boolean
}

/** 场景对象条件 - 独立数值 */
type SceneObjectConditionSelfNumber = {
  type: 'self-number'
  operation: NumberLogicOperation
  value: number
}

/** 场景对象条件 - 独立字符串 */
type SceneObjectConditionSelfString = {
  type: 'self-string'
  operation: StringLogicOperation
  value: string
}

/** 布尔值操作 */
type BooleanLogicOperation = 'equal' | 'unequal'

/** 数值操作 */
type NumberLogicOperation = 'equal' | 'unequal' | 'greater-or-equal' | 'less-or-equal' | 'greater' | 'less'

/** 字符串操作 */
type StringLogicOperation = 'equal' | 'unequal'

/** 视差图图层 */
type ParallaxLayer = 'background' | 'foreground'

/** 视差图光线采样模式映射表 */
type ParallaxLightSamplingMap = {raw: 0, global: 1, anchor: 2, ambient: 3}

/** 视差图初始化选项 */
interface ParallaxOptions {
  name?: string
  presetId?: string
  selfVarId?: string
  visible?: boolean
  layer?: ParallaxLayer
  order?: number
  light?: LightSamplingMode
  blend?: BlendingMode
  opacity?: number
  x?: number
  y?: number
  scaleX?: number
  scaleY?: number
  repeatX?: number
  repeatY?: number
  anchorX?: number
  anchorY?: number
  offsetX?: number
  offsetY?: number
  parallaxFactorX?: number
  parallaxFactorY?: number
  shiftSpeedX?: number
  shiftSpeedY?: number
  tint?: ImageTint
  image?: string
  events?: HashMap<CommandFunctionList>
  scripts?: Array<ScriptData>
}

/** 视差图存档数据 */
type ParallaxSaveData = {
  name: string
  entityId: string
  presetId: string
  selfVarId: string
  visible: boolean
  x: number
  y: number
}

/** 地形码 */
type TerrainCode = 0 | 1 | 2

/** 瓦片地图{ID:图块数据}映射表 */
type TilemapTileDataMap = HashMap<null | TilemapNormalTileData | TilemapAutoTileData>

/** 瓦片地图普通图块数据 */
type TilemapNormalTileData = {
  x: number
  y: number
  type: 'normal',
  tileset: NormalTileFile
  terrain: TerrainCode
  tag: number
  priority: number
}

/** 瓦片地图自动图块数据 */
type TilemapAutoTileData = {
  x: number
  y: number
  type: 'auto',
  tileset: AutoTileFile
  terrain: TerrainCode
  tag: number
  priority: number
  autoTile: AutoTileData
  template: AutoTileTemplate
}

/** 瓦片地图图像数据映射表 */
type TilemapImageDataMap = HashMap<null | Float32Array>

/** 视差图图层 */
type TilemapLayer = 'background' | 'foreground' | 'object'

/** 瓦片地图光线采样模式映射表 */
type TilemapLightSamplingMap = {raw: 0, global: 1, ambient: 2}

/** 瓦片地图光线采样模式 */
type TilemapLightSamplingMode = 'raw' | 'global' | 'ambient'

/** 瓦片地图初始化选项 */
interface TilemapOptions {
  name?: string
  presetId?: string
  selfVarId?: string
  visible?: boolean
  layer?: TilemapLayer
  order?: number
  light?: TilemapLightSamplingMode
  blend?: BlendingMode
  x?: number
  y?: number
  code?: string
  width?: number
  height?: number
  anchorX?: number
  anchorY?: number
  offsetX?: number
  offsetY?: number
  parallaxFactorX?: number
  parallaxFactorY?: number
  opacity?: number
  tileStartX?: number
  tileStartY?: number
  tileEndX?: number
  tileEndY?: number
  tilesetMap?: HashMap<string>
  events?: HashMap<CommandFunctionList>
  scripts?: Array<ScriptData>
}

/** 瓦片地图存档数据 */
type TilemapSaveData = {
  name: string
  entityId: string
  presetId: string
  selfVarId: string
  visible: boolean
  x: number
  y: number
  tileStartX: number
  tileStartY: number
  tileEndX: number
  tileEndY: number
  tilesetMap: HashMap<string>
  code: string
}

/** 场景分区的对象 */
type ObjectInCell = {
  x: number
  y: number
  cellId: number
}

/** 场景角色存档数据 */
type SceneActorSaveData = ActorSaveData | {globalId: string}

/** 动画初始化选项 */
interface AnimationOptions {
  name?: string
  presetId?: string
  selfVarId?: string
  visible?: boolean
  rotatable?: boolean
  x?: number
  y?: number
  scale?: number
  speed?: number
  opacity?: number
  priority?: number
  events?: HashMap<CommandFunctionList>
  scripts?: Array<ScriptData>
}

/** 动画存档数据 */
type AnimationSaveData = {
  name: string
  entityId: string
  presetId: string
  selfVarId: string
  visible: boolean
  motion: string
  rotatable: boolean
  x: number
  y: number
  angle: number
  scale: number
  speed: number
  opacity: number
  priority: number
  events?: HashMap<CommandFunctionList>
  scripts?: Array<ScriptData>
}

/** 区域初始化选项 */
interface RegionOptions {
  name?: string
  presetId?: string
  selfVarId?: string
  x?: number
  y?: number
  width?: number
  height?: number
  events?: HashMap<CommandFunctionList>
  scripts?: Array<ScriptData>
}

/** 区域存档数据 */
type RegionSaveData = {
  name: string
  entityId: string
  presetId: string
  selfVarId: string
  x: number
  y: number
  width: number
  height: number
  events?: HashMap<CommandFunctionList>
  scripts?: Array<ScriptData>
}

/** 光源类型 */
type LightType = 'point' | 'area'

/** 光源存档数据 */
type LightSaveData = LightSaveDataPoint | LightSaveDataArea

/** 光源存档数据 - 点光 */
type LightSaveDataPoint = {
  name: string
  presetId: string
  selfVarId: string
  visible: boolean
  type: LightType
  blend: LightBlendingMode
  x: number
  y: number
  range: number
  intensity: number
  red: number
  green: number
  blue: number
  direct: number
  events?: HashMap<CommandFunctionList> //+
  scripts?: Array<ScriptData> //+
}

/** 光源存档数据 - 区域光 */
type LightSaveDataArea = {
  name: string
  presetId: string
  selfVarId: string
  visible: boolean
  type: LightType
  blend: LightBlendingMode
  x: number
  y: number
  mask: string
  anchorX: number
  anchorY: number
  width: number
  height: number
  angle: number
  red: number
  green: number
  blue: number
  direct: number
  events?: HashMap<CommandFunctionList> //+
  scripts?: Array<ScriptData> //+
}

/** 光源属性过滤器集合 */
type LightPropertyFilters = {
  point: {
    x: true
    y: true
    red: true
    green: true
    blue: true
    range: true
    intensity: true
  }
  area: {
    x: true
    y: true
    red: true
    green: true
    blue: true
    anchorX: true
    anchorY: true
    width: true
    height: true
    angle: true
  }
}

/** 粒子发射器初始化选项 */
interface ParticleEmitterOptions {
  name?: string
  presetId?: string
  selfVarId?: string
  visible?: boolean
  x?: number
  y?: number
  angle?: number
  scale?: number
  speed?: number
  opacity?: number
  priority?: number
  events?: HashMap<CommandFunctionList>
  scripts?: Array<ScriptData>
}

/** 粒子发射器存档数据 */
type ParticleEmitterSaveData = {
  name: string
  entityId: string
  presetId: string
  selfVarId: string
  visible: boolean
  x: number
  y: number
  angle: number
  scale: number
  speed: number
  opacity: number
  priority: number
  events?: HashMap<CommandFunctionList>
  scripts?: Array<ScriptData>
}

/** 场景管理器存档数据 */
type SceneManagerSaveData = {
  active: number
  contexts: Array<SceneSaveData>
}

/** 场景初始化选项 */
interface SceneOptions {
  id?: string
  width?: number
  height?: number
  ambient?: SceneAmbientLight
  terrains?: string
  tileWidth?: number
  tileHeight?: number
  events?: HashMap<CommandFunctionList>
  scripts?: Array<ScriptData>
  objects?: SceneObjectDataDirectory
}

/** 场景存档数据 */
type SceneSaveData = {
  id: string
  subscenes: Array<string>
  subdata?: Array<SceneFile>
  index: number
  width: number
  height: number
  ambient: SceneAmbientLight
  terrains: string
  actors: Array<SceneActorSaveData>
  animations: Array<AnimationSaveData>
  emitters: Array<ParticleEmitterSaveData>
  regions: Array<RegionSaveData>
  lights: Array<LightSaveData>
  parallaxes: Array<ParallaxSaveData | TilemapSaveData>
}

/** 移动路径 */
interface MovementPath extends Float64Array {
  index: number
}

/** 场景光源群组映射表 */
interface SceneLightGroupMap extends Array<Array<SceneLight>> {
  max: Array<SceneLight>
  screen: Array<SceneLight>
  additive: Array<SceneLight>
  subtract: Array<SceneLight>
}

/** 实体对象 */
interface EntityObject {
  entityId: string
  presetId: string
  name: string
}