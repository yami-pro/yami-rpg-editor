/** 元数据清单 */
type Manifest = {
  actors: Array<CommonFileMeta>
  skills: Array<CommonFileMeta>
  triggers: Array<CommonFileMeta>
  items: Array<CommonFileMeta>
  equipments: Array<CommonFileMeta>
  states: Array<CommonFileMeta>
  events: Array<CommonFileMeta>
  scenes: Array<SceneFileMeta>
  tilesets: Array<TileFileMeta>
  ui: Array<CommonFileMeta>
  animations: Array<CommonFileMeta>
  particles: Array<CommonFileMeta>
  images: Array<CommonFileMeta>
  audio: Array<CommonFileMeta>
  videos: Array<CommonFileMeta>
  fonts: Array<FontFileMeta>
  script: Array<ScriptFileMeta>
  others: Array<CommonFileMeta>
  guidMap: HashMap<FileMeta> //+
  pathMap: HashMap<FileMeta> //+
}

/** 数据文件名称 */
type DataFileName =
| 'attribute'
| 'enumeration'
| 'localization'
| 'easings'
| 'teams'
| 'autotiles'
| 'variables'
| 'plugins'
| 'commands'

/** 打包的元数据列表键 */
type PackedMetaListKey =
| 'scenes'
| 'actors'
| 'skills'
| 'triggers'
| 'items'
| 'equipments'
| 'states'
| 'events'
| 'ui'
| 'animations'
| 'particles'
| 'tilesets'

/** 文件元数据 */
type FileMeta = CommonFileMeta | SceneFileMeta | TileFileMeta | FontFileMeta | ScriptFileMeta

/** 普通文件元数据 */
interface CommonFileMeta {
  guid: string
  path: string
  size?: number
}

/** 场景文件元数据 */
interface SceneFileMeta extends CommonFileMeta {
  x: number
  y: number
}

/** 图块文件元数据 */
interface TileFileMeta extends CommonFileMeta {
  x: number
  y: number
}

/** 字体文件元数据 */
interface FontFileMeta extends CommonFileMeta {
  name?: string
}

/** 脚本文件元数据 */
interface ScriptFileMeta extends CommonFileMeta {
  parameters: Array<ScriptParameter>
}

/** 项目配置文件 */
type ConfigFile = {
  gameId: string
  deployed: boolean
  preload: 'never' | 'always' | 'deployed'
  window: {
    title: string
    width: number
    height: number
    display: 'windowed' | 'maximized' | 'fullscreen'
  }
  resolution: {
    width: number
    height: number
    sceneScale: number
    uiScale: number
  }
  scene: {
    padding: number
    animationInterval: number
  }
  tileArea: ExpansionArea
  animationArea: ExpansionArea
  lightArea: ExpansionArea
  virtualAxis: {
    up: string
    down: string
    left: string
    right: string
  }
  collision: {
    actor: {
      enabled: boolean
    }
    scene: {
      enabled: boolean
      actorSize: number
    }
    trigger: {
      collideWithActorShape
    }
  }
  text: {
    importedFonts: Array<string>
    fontFamily: string
    highDefinition: boolean
  }
  actor: {
    tempAttributes: Array<InitialAttribute>
  }
  animation: {
    frameRate: number
  }
  soundAttenuation: {
    distance: number
    easingId: string
  }
  webgl: {
    desynchronized: boolean
    textureMagFilter: 'nearest' | 'linear'
    textureMinFilter: 'nearest' | 'linear'
  }
  script: {
    autoCompile: boolean
  }
  save: {
    location: 'app-data' | 'documents' | 'local'
    subdir: string
  }
  localization: {
    languages: Array<{
      name: string
      font: string
      scale: number
    }>
    default: string
  }
  startPosition: {
    sceneId: string
    x: number
    y: number
  }
  indexedColors: Array<{
    name: string
    code: string
  }>
}

/** 渲染扩张区域 */
type ExpansionArea = {
  expansionTop: number
  expansionLeft: number
  expansionRight: number
  expansionBottom: number
}

/** 事件文件数据 */
type EventFile = {
  id: string //+
  path: string //+
  type: GlobalEventType
  enabled: boolean
  priority: boolean
  namespace: boolean
  returnType: GlobalEventReturnType
  description: string
  parameters: Array<GlobalEventParameter>
  commands: CommandDataList
}

/** 技能文件数据 */
type SkillFile = {
  id: string //+
  path: string //+
  filename: string //+
  icon: string
  clip: ImageClip
  inherit: string
  parent?: SkillFile //+
  attributes: Array<InitialAttribute>
  events: HashMap<CommandFunctionList> //*
  scripts: Array<ScriptData>
}

/** 状态文件数据 */
type StateFile = {
  id: string //+
  path: string //+
  icon: string
  clip: ImageClip
  inherit: string
  parent?: StateFile //+
  attributes: Array<InitialAttribute>
  events: HashMap<CommandFunctionList> //*
  scripts: Array<ScriptData>
}

/** 装备文件数据 */
type EquipmentFile = {
  id: string //+
  path: string //+
  filename: string //+
  icon: string
  clip: ImageClip
  inherit: string
  parent?: EquipmentFile //+
  attributes: Array<InitialAttribute>
  events: HashMap<CommandFunctionList> //*
  scripts: Array<ScriptData>
}

/** 物品文件数据 */
type ItemFile = {
  id: string //+
  path: string //+
  filename: string //+
  icon: string
  clip: ImageClip
  inherit: string
  parent?: ItemFile //+
  attributes: HashMap<InitialAttribute> //*
  events: HashMap<CommandFunctionList> //*
  scripts: Array<ScriptData>
}

/** 过渡曲线 */
type EasingData = {
  id: string
  key: string
  name: string
  points: Array<Point>
}

/** 队伍文件数据 */
type TeamsFile = {
  list: Array<{
    id: string
    name: string
    color: string
  }>
  relations: string
  collisions: string
}

/** 插件文件数据 */
type PluginsFile = Array<ScriptData>

/** 脚本数据 */
type ScriptData = {
  id: string
  enabled: boolean
  parameters: HashMap<any>
  initialized?: true //+
}

/** 自定义指令文件数据 */
type CommandsFile = Array<{
  id: string
  enabled: boolean
  alias: string
  keywords: string
  parameters: {} //+
}>

/** 事件数据 */
interface EventData {
  type: string
  enabled: boolean
  commands: EventCommandList
}

/** 事件指令 */
interface EventCommand {
  id: string
  params: HashMap<any>
}

/** 事件指令列表 */
interface EventCommandList extends Array<EventCommand> {
  path: string
}

/** 加载脚本Promise */
interface LoadingScriptPromise extends Promise<any> {
  meta: ScriptFileMeta
}

/** 脚本封装对象 */
interface ScriptWrap {
  constructor: any,
  parameters: Array<ScriptParameter>
}

/** 脚本参数 */
interface ScriptParameter {
  key: string
  type: string
  value: any
  options?: Array<boolean | number | string>
}

/** 全局存档数据 */
type GlobalSaveData = {
  language: string
  canvasWidth: number
  canvasHeight: number
  sceneScale: number
  uiScale: number
  variables: AttributeMap
}

/** 存档元数据 */
type SaveMeta = {
  index: number
  name: string
  data: AttributeMap
}