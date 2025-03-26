/** 变量文件数据 */
type VariablesFile = Array<VariableFolder | VariableItem>

/** 变量文件夹 */
type VariableFolder = {
  class: 'folder'
  name: string
  expanded: boolean
  children: Array<VariableFolder | VariableItem>
}

/** 变量对象 */
type VariableItem = {
  id: string
  name: string
  value: boolean | number | string | null
  sort: number
  note: string
}

/** 变量群组列表 */
type VariableGroupList = [Array<VariableItem>, Array<VariableItem>, Array<VariableItem>]

/** 变量写入器 */
type VariableSetter = {
  get(): AttributeValue
  set(value: AttributeValue): void
}

/** 属性文件数据 */
type AttributeFile = {
  settings: {
    actor: string
    skill: string
    state: string
    item: string
    equipment: string
    element: string
  }
  keys: AttributeDirectory
}

/** 属性目录列表 */
type AttributeDirectory = Array<AttributeFolder | Attribute>

/** 属性文件夹 */
type AttributeFolder = {
  class: string
  id: string
  name: string
  expanded: boolean
  children: AttributeDirectory
}

/** 属性对象 */
type Attribute = {
  id: string
  key: string
  type: string
  name: string
  enum: string
  note: string
}

/** 属性群组 */
type AttributeGroup = ItemGroup<Attribute>

/** 枚举文件数据 */
type EnumerationFile = {
  settings: {
    'shortcut-key': string
    'cooldown-key': string
    'equipment-slot': string
    'global-event': string
    'scene-event': string
    'actor-event': string
    'skill-event': string
    'state-event': string
    'equipment-event': string
    'item-event': string
    'region-event': string
    'light-event': string
    'animation-event': string
    'particle-event': string
    'parallax-event': string
    'tilemap-event': string
    'element-event': string
  }
  strings: EnumerationDirectory
}

/** 枚举目录列表 */
type EnumerationDirectory = Array<EnumerationFolder | Enumeration>

/** 枚举文件夹 */
type EnumerationFolder = {
  class: 'folder'
  id: string
  name: string
  expanded: boolean
  children: EnumerationDirectory
}

/** 枚举对象 */
type Enumeration = {
  id: string
  value: string
  name: string
  note: string
}

/** 枚举群组 */
type EnumerationGroup = ItemGroup<Enumeration>