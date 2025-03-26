/** 角色文件数据 */
type ActorFile = {
  id: string //+
  path: string //+
  portrait: string
  clip: ImageClip
  animationId: string
  idleMotion: string
  moveMotion: string
  rotatable: boolean
  passage: keyof ActorPassageMap
  speed: number
  shape: string
  size: number
  weight: number
  immovable: boolean
  scale: number
  priority: number
  inherit: string
  parent?: ActorFile //+
  sprites: Array<InitialSprite>
  attributes: Array<InitialAttribute>
  skills: Array<InitialSkill>
  equipments: Array<InitialEquipment>
  inventory: Array<InitialInventoryGoods>
  events: HashMap<CommandFunctionList> //*
  scripts: Array<ScriptData>
}

/** 初始精灵 */
type InitialSprite = {
  id: string
  image: string
}

/** 初始属性 */
type InitialAttribute = {
  key: string
  value: boolean | number | string
}

/** 初始技能 */
type InitialSkill = {
  id: string
  key: string
}

/** 初始装备 */
type InitialEquipment = {
  id: string
  slot: string
}

/** 初始库存货物 */
type InitialInventoryGoods = InitialInventoryItem | InitialInventoryEquipment | InitialInventoryMoney

/** 初始库存物品 */
type InitialInventoryItem = {
  type: 'item'
  id: string
  quantity: number
}

/** 初始库存装备 */
type InitialInventoryEquipment = {
  type: 'equipment'
  id: string
}

/** 初始库存金钱 */
type InitialInventoryMoney = {
  type: 'money'
  money: number
}

/** 角色通行区域映射表 */
type ActorPassageMap = {
  land: 0
  water: 1
  unrestricted: -1
}

/** 角色存档数据 */
type ActorSaveData = {
  visible: boolean
  entityId: string
  presetId: string
  selfVarId: string
  fileId: string
  teamId: string
  active: boolean
  passage: number
  priority: number
  name: string
  x: number
  y: number
  scale: number
  angle: number
  portrait: string
  clip: ImageClip
  sprites: HashMap<string>
  weight: number
  motions: {
    idle: string
    move: string
  }
  movementSpeed: number
  movementFactor: number
  attributes: AttributeMap
  animations: Array<AnimationComponentSaveData>
  skills: Array<SkillSaveData>
  states: Array<StateSaveData>
  equipments: Array<EquipmentSaveData>
  cooldowns: Array<CooldownItem>
  shortcuts: Array<ShortcutSaveData>
  inventory: InventorySaveData
}

/** 玩家队伍存档数据 */
type PartySaveData = {
  /** 玩家角色的ID(暂定) */
  player: string
  /** 玩家队伍成员的ID数组 */
  members: Array<string>
}

/** 队伍项目 */
type TeamItem = {
  id: string
  name: string
  color: string
  index: number
  relations: HashMap<number>
  collisions: HashMap<number>
}

/** 解包的队伍数据 */
type UnpackedTeamData = {
  relationsMap: HashMap<HashMap<number>>
  collisionsMap: HashMap<HashMap<number>>
}

/** 队伍存档数据 */
type TeamSaveData = {
  /** 队伍的ID列表 */
  keys: keys
  /** 队伍的敌友关系编码 */
  relations: string
  /** 队伍的碰撞开关编码 */
  collisions: string
}

/** 技能存档数据 */
type SkillSaveData = {
  id: string
  cooldown: number
  duration: number
  attributes: AttributeMap
}

/** 状态存档数据 */
type StateSaveData = {
  id: string
  caster: string
  currentTime: number
  duration: number
  attributes: AttributeMap
}

/** 装备存档数据 */
type EquipmentSaveData = {
  id: string
  slot: string
  order: number
  attributes: AttributeMap
}

/** 库存存档数据 */
type InventorySaveData = {
  ref?: string
  list: Array<ItemSaveData | EquipmentSaveData>
  money: number
}

/** 库存引用数据列表 */
type InventoryReferenceList = Array<{
  actor: Actor
  ref: string
}>

/** 物品存档数据 */
type ItemSaveData = {
  id: string
  order: number
  quantity: number
}

/** 快捷项存档数据 */
type ShortcutSaveData = {
  key: string
  id: string
}

/** 角色动作存档数据 */
type ActorMotionSaveData = {
  idle: string
  move: string
}

/** 动画组件存档数据 */
type AnimationComponentSaveData = {
  id: string
  key: string
  rotatable: boolean
  syncAngle: boolean
  angle: number
  scale: number
  speed: number
  opacity: number
  priority: number
  offsetY: number
  motion?: string
  images?: HashMap<string>
}