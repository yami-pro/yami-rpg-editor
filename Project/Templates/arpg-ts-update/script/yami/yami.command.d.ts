/** 指令数据 */
type CommandData = {
  id: string
  params: HashMap<any>
}

/** 指令数据列表 */
interface CommandDataList extends Array<CommandData | CommandFunction> {
  path: string
}

/** 指令函数 */
type CommandFunction = () => boolean

/** 指令堆栈封装器 */
type CommandStackWrap = [CommandFunctionList, number]

/** 编译时指令上下文 */
type CompileTimeCommandContext = {
  commands: CommandFunctionList
  index: number
  loop: boolean
  path: string
}

/** 编译时跳转上下文 */
type compileTimeJumpContext = {
  operation: 'jump' | 'save-jump'
  label: string
  commands: CommandFunctionList
  index: number
}

/** 编译时标签上下文 */
type compileTimeLabelContext = {
  commands: CommandFunctionList
  index: number
}

/** 编译时返回上下文 */
type compileTimeReturnContext = {
  commands: CommandFunctionList
  index: number
}

/** 遍历指令上下文 */
type ForEachCommandContext = {
  list: Array<any>
  index: number
}

/** 过渡指令上下文 */
type TransitionCommandContext = {
  elapsed: number
  start: number
  end: number
  duration: number
}

/** 角色属性键 */
type ActorAttributeKey = string

/** 技能属性键 */
type SkillAttributeKey = string

/** 状态属性键 */
type StateAttributeKey = string

/** 装备属性键 */
type EquipmentAttributeKey = string

/** 装备槽的键 */
type EquipmentSlotKey = string

/** 物品属性键 */
type ItemAttributeKey = string

/** 元素属性键 */
type ElementAttributeKey = string

/** 快捷键 */
type ShortCutKey = string

/** 变量访问器 */
type VariableGetter =
{
  type: 'local' | 'global'
  key: string
}
|
{
  type: 'self'
}
|
{
  type: 'actor'
  actor: ActorGetter
  key: ActorAttributeKey
}
|
{
  type: 'skill'
  skill: SkillGetter
  key: SkillAttributeKey
}
|
{
  type: 'state'
  state: StateGetter
  key: StateAttributeKey
}
|
{
  type: 'equipment'
  equipment: EquipmentGetter
  key: EquipmentAttributeKey
}
|
{
  type: 'item'
  item: ItemGetter
  key: ItemAttributeKey
}
|
{
  type: 'element'
  element: ElementGetter
  key: ElementAttributeKey
}

/** 脚本变量访问器 */
interface ScriptVariableGetter extends VariableGetter {
  getter: 'variable'
}

/** 对象变量访问器 */
type ObjectVariableGetter =
{
  type: 'local' | 'global'
  key: string
}
|
{
  type: 'element'
  element: ElementGetter
  key: ElementAttributeKey
}

/** 角色访问器 */
type ActorGetter =
{
  type: 'trigger' | 'caster' | 'latest' | 'target' | 'player'
}
|
{
  type: 'member'
  memberId: number
}
|
{
  type: 'global'
  actorId: string
}
|
{
  type: 'by-id'
  presetId: string
}
|
{
  type: 'variable'
  variable: ObjectVariableGetter
}

/** 脚本角色访问器 */
interface ScriptActorGetter extends ActorGetter {
  getter: 'actor'
}

/** 技能访问器 */
type SkillGetter =
{
  type: 'trigger' | 'latest'
}
|
{
  type: 'by-key'
  actor: ActorGetter
  key: ShortCutKey
}
|
{
  type: 'by-id'
  actor: ActorGetter
  skillId: string
}
|
{
  type: 'variable'
  variable: ObjectVariableGetter
}

/** 脚本技能访问器 */
interface ScriptSkillGetter extends SkillGetter {
  getter: 'skill'
}

/** 状态访问器 */
type StateGetter =
{
  type: 'trigger' | 'latest'
}
|
{
  type: 'by-id'
  actor: ActorGetter
  stateId: string
}
|
{
  type: 'variable'
  variable: ObjectVariableGetter
}

/** 脚本状态访问器 */
interface ScriptStateGetter extends StateGetter {
  getter: 'state'
}

/** 装备访问器 */
type EquipmentGetter =
{
  type: 'trigger' | 'latest'
}
|
{
  type: 'by-slot'
  actor: ActorGetter
  slot: EquipmentSlotKey
}
|
{
  type: 'by-id-equipped' | 'by-id-inventory'
  actor: ActorGetter
  equipmentId: string
}
|
{
  type: 'variable'
  variable: ObjectVariableGetter
}

/** 脚本装备访问器 */
interface ScriptEquipmentGetter extends EquipmentGetter {
  getter: 'equipment'
}

/** 物品访问器 */
type ItemGetter =
{
  type: 'trigger' | 'latest'
}
|
{
  type: 'by-key'
  actor: ActorGetter
  key: ShortCutKey
}
|
{
  type: 'by-id'
  actor: ActorGetter
  itemId: string
}
|
{
  type: 'variable'
  variable: ObjectVariableGetter
}

/** 脚本物品访问器 */
interface ScriptItemGetter extends ItemGetter {
  getter: 'item'
}

/** 位置访问器 */
type PositionGetter =
{
  type: 'absolute' | 'relative'
  x: number
  y: number
}
|
{
  type: 'actor'
  actor: ActorGetter
}
|
{
  type: 'trigger'
  trigger: TriggerGetter
}
|
{
  type: 'light'
  light: LightGetter
}
|
{
  type: 'region'
  region: RegionGetter
  mode: RegionPositionMode
}
|
{
  type: 'object'
  objectId: string
}
|
{
  type: 'mouse'
}

/** 脚本位置访问器 */
interface ScriptPositionGetter extends PositionGetter {
  getter: 'position'
}

/** 角度访问器 */
type AngleGetter =
{
  type: 'position'
  position: PositionGetter
}
|
{
  type: 'absolute' | 'relative' | 'direction'
  degrees: number
}
|
{
  type: 'random'
}

/** 脚本角度访问器 */
// interface ScriptAngleGetter extends AngleGetter {
//   getter: 'angle'
// }

/** 触发器访问器 */
type TriggerGetter =
{
  type: 'trigger' | 'latest'
}
|
{
  type: 'variable'
  variable: ObjectVariableGetter
}

/** 脚本触发器访问器 */
// interface ScriptTriggerGetter extends TriggerGetter {
//   getter: 'trigger'
// }

/** 光源访问器 */
type LightGetter =
{
  type: 'trigger' | 'latest'
}
|
{
  type: 'by-id'
  presetId: string
}
|
{
  type: 'variable'
  variable: ObjectVariableGetter
}

/** 脚本光源访问器 */
// interface ScriptLightGetter extends LightGetter {
//   getter: 'light'
// }

/** 区域访问器 */
type RegionGetter =
{
  type: 'trigger'
}
|
{
  type: 'by-id'
  presetId: string
}

/** 脚本区域访问器 */
interface ScriptRegionGetter extends RegionGetter {
  getter: 'region'
}

/** 瓦片地图访问器 */
type TilemapGetter =
{
  type: 'trigger'
}
|
{
  type: 'by-id'
  presetId: string
}

/** 脚本瓦片地图访问器 */
interface ScriptTilemapGetter extends TilemapGetter {
  getter: 'tilemap'
}

/** 场景对象访问器 */
type ObjectGetter =
{
  type: 'trigger' | 'latest'
}
|
{
  type: 'by-id'
  presetId: string
}
|
{
  type: 'variable'
  variable: ObjectVariableGetter
}

/** 元素访问器 */
type ElementGetter =
{
  type: 'trigger' | 'latest' | 'focus'
}
|
{
  type: 'by-id'
  presetId: string
}
|
{
  type: 'by-ancestor-and-id'
  ancestor: ElementGetter
  presetId: string
}
|
{
  type: 'by-index'
  parent: ElementGetter
  index: number
}
|
{
  type: 'by-button-index'
  focus: ElementGetter
  index: number
}
|
{
  type: 'selected-button'
  focus: ElementGetter
}
|
{
  type: 'parent' | 'variable'
  variable: ObjectVariableGetter
}

/** 指令参数类型 */
type CommandParameterType = 'boolean' | 'number' | 'string'

/** 脚本元素访问器 */
interface ScriptElementGetter extends ElementGetter {
  getter: 'element'
}