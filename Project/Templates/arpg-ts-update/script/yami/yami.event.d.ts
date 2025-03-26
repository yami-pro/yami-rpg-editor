/** 全局事件群组映射表 */
type GlobalEventGroupMap = {
  common: Array<CommandFunctionList>
  autorun: Array<CommandFunctionList>
  keydown: Array<CommandFunctionList>
  keyup: Array<CommandFunctionList>
  mousedown: Array<CommandFunctionList>
  mouseup: Array<CommandFunctionList>
  mousemove: Array<CommandFunctionList>
  doubleclick: Array<CommandFunctionList>
  wheel: Array<CommandFunctionList>
  touchstart: Array<CommandFunctionList>
  touchmove: Array<CommandFunctionList>
  touchend: Array<CommandFunctionList>
  gamepadbuttonpress: Array<CommandFunctionList>
  gamepadbuttonrelease: Array<CommandFunctionList>
  gamepadleftstickchange: Array<CommandFunctionList>
  gamepadrightstickchange: Array<CommandFunctionList>
  equipmentgain: Array<CommandFunctionList>
  itemgain: Array<CommandFunctionList>
  moneygain: Array<CommandFunctionList>
  startup: Array<CommandFunctionList>
  createscene: Array<CommandFunctionList>
  loadscene: Array<CommandFunctionList>
  loadsave: Array<CommandFunctionList>
  showtext: Array<CommandFunctionList>
  showchoices: Array<CommandFunctionList>
  preload: Array<CommandFunctionList>
  [key: string]: Array<CommandFunctionList> | undefined
}

/** 全局事件注册对象 */
type GlobalEventRegisterObject = {
  type: GlobalEventType
  commandList: CommandFunctionList
}

/** 全局事件类型 */
type GlobalEventType = keyof GlobalEventGroupMap

/** 全局事件返回类型 */
type GlobalEventReturnType = 'none' | 'boolean' | 'number' | 'string' | 'object' | 'actor' | 'skill' | 'state' | 'equipment' | 'item' | 'trigger' | 'light' | 'element'

/** 全局事件参数 */
type GlobalEventParameter = {
  type: 'boolean' | 'number' | 'string' | 'object' | 'actor' | 'skill' | 'state' | 'equipment' | 'item' | 'trigger' | 'light' | 'element'
  key: string
  note: string
}

/** 全局事件实参 */
type GlobalEventArgument =
| {type: 'boolean', key: string, value: boolean}
| {type: 'number', key: string, value: number | VariableGetter}
| {type: 'string', key: string, value: string | VariableGetter}
| {type: 'object', key: string, value: VariableGetter}
| {type: 'actor', key: string, value: ActorGetter}
| {type: 'skill', key: string, value: SkillGetter}
| {type: 'state', key: string, value: StateGetter}
| {type: 'equipment', key: string, value: EquipmentGetter}
| {type: 'item', key: string, value: ItemGetter}
| {type: 'trigger', key: string, value: TriggerGetter}
| {type: 'light', key: string, value: LightGetter}
| {type: 'element', key: string, value: ElementGetter}

/** 全局事件返回值读取器 */
type GlobalEventResultGetter =
| {type: 'none', value: void}
| {type: 'boolean', value: boolean}
| {type: 'number', value: number | VariableGetter}
| {type: 'string', value: string | VariableGetter}
| {type: 'object', value: VariableGetter}
| {type: 'actor', value: ActorGetter}
| {type: 'skill', value: SkillGetter}
| {type: 'state', value: StateGetter}
| {type: 'equipment', value: EquipmentGetter}
| {type: 'item', value: ItemGetter}
| {type: 'trigger', value: TriggerGetter}
| {type: 'light', value: LightGetter}
| {type: 'element', value: ElementGetter}

/** 全局事件返回值写入器 */
type GlobalEventResultSetter =
| {type: 'none', variable: void}
| {type: 'boolean', variable: VariableGetter}
| {type: 'number', variable: VariableGetter}
| {type: 'string', variable: VariableGetter}
| {type: 'object', variable: VariableGetter}
| {type: 'actor', variable: VariableGetter}
| {type: 'skill', variable: VariableGetter}
| {type: 'state', variable: VariableGetter}
| {type: 'equipment', variable: VariableGetter}
| {type: 'item', variable: VariableGetter}
| {type: 'trigger', variable: VariableGetter}
| {type: 'light', variable: VariableGetter}
| {type: 'element', variable: VariableGetter}

/** 游戏事件侦听器映射表 */
type GameEventListenersMap = {
  ready: Array<EventCallback>
  reset: Array<EventCallback>
  quit: Array<EventCallback>
}

/** 游戏事件类型 */
type GameEventType = keyof GameEventListenersMap

/** 脚本方法封装对象 */
type ScriptMethodWrap = {
  scriptInstance: HashMap<Function>
  methodName: string
}

/** 全局事件选项 */
type GlobalEventOptions = {
  /** 发送优先还是非优先事件(缺省表示任意) */
  priority?: boolean
  /** 脚本方法传递参数 */
  argument?: any
  /** 指令事件传递属性 */
  properties?: HashMap<any>
}

/** 脚本父节点 */
type ScriptParentNode = {
  updaters?: UpdaterList
  script: ScriptManager
}