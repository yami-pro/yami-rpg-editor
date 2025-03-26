'use strict'

// ******************************** 指令对象 ********************************

const Command = {
  // properties
  target: null,
  id: null,
  words: null,
  invalid: false,
  saveVars: false,
  returnType: '',
  eventName: '',
  eventIndex: 0,
  variables: [],
  varMap: {},
  // methods
  initialize: null,
  insert: null,
  edit: null,
  open: null,
  save: null,
  parse: null,
  parseNone: null,
  parseBlend: null,
  fetchVariables: null,
  parseVariable: null,
  parseGlobalVariable: null,
  parseAttributeGroup: null,
  parseAttributeKey: null,
  parseAttributeTag: null,
  parseVariableTag: null,
  parseVariableNumber: null,
  parseVariableString: null,
  parseVariableTemplate: null,
  parseVariableAttr: null,
  parseVariableEnum: null,
  parseVariableFile: null,
  parseVariableTeam: null,
  parseMultiLineString: null,
  parseSpriteName: null,
  parseEventType: null,
  parseEnumGroup: null,
  parseEnumString: null,
  parseEnumStringTag: null,
  parseGroupEnumString: null,
  parseListItem: null,
  parseParameter: null,
  parseActor: null,
  parseSkill: null,
  parseState: null,
  parseEquipment: null,
  parseItem: null,
  parsePosition: null,
  parseAngle: null,
  parseTrigger: null,
  parseLight: null,
  parseRegion: null,
  parseTilemap: null,
  parseObject: null,
  parseElement: null,
  parsePresetObject: null,
  parsePresetElement: null,
  parseTeam: null,
  parseHexColor: null,
  parseActorSelector: null,
  parseFileName: null,
  parseAudioType: null,
  parseWait: null,
  parseEasing: null,
  parseUnlinkedId: null,
  parseTextTags: null,
  removeTextTags: null,
  setNormalColor: null,
  setVariableColor: null,
  setGlobalVariableColor: null,
  setDelimiterColor: null,
  setOperatorColor: null,
  setBooleanColor: null,
  setNumberColor: null,
  setStringColor: null,
  setScriptColor: null,
  setFileColor: null,
  setPresetColor: null,
  setWeakColor: null,
  setCommaColors: null,
  setTextId: null,
  setTooltip: null,
  setInvalid: null,
  forEachCommand: null,
  // classes
  WordList: null,
  // objects
  cases: {},
  custom: null,
}

// 初始化
Command.initialize = function () {
  // 创建词语列表
  this.words = new Command.WordList()

  // 初始化相关对象
  CommandSuggestion.initialize()
  TextSuggestion.initialize()
  VariableGetter.initialize()
  VariableGetter2.initialize()
  ActorGetter.initialize()
  SkillGetter.initialize()
  StateGetter.initialize()
  EquipmentGetter.initialize()
  ItemGetter.initialize()
  PositionGetter.initialize()
  AngleGetter.initialize()
  TriggerGetter.initialize()
  LightGetter.initialize()
  RegionGetter.initialize()
  TilemapGetter.initialize()
  ObjectGetter.initialize()
  ElementGetter.initialize()
  AncestorGetter.initialize()
  Command.custom.initialize()

  // 初始化指令模块
  // 引用了Inspector子对象选择框的选项
  // 因此需要保证Inspector优先完成初始化
  for (const object of Object.values(this.cases)) {
    object.initialize?.()
  }
}

// 插入指令
Command.insert = function (target, id) {
  this.target = target
  if (id) {
    target.scrollAndResize()
    return this.open(id)
  }
  CommandSuggestion.open()
}

// 编辑指令
Command.edit = function (target, command) {
  const {id, params} = command
  const handler = this.cases[id]
  if (handler?.load instanceof Function) {
    this.target = target
    this.id = id
    target.scrollAndResize()
    const point = target.getSelectionPosition()
    if (point) {
      Window.setPositionMode('absolute')
      Window.absolutePos.x = point.x + 100
      Window.absolutePos.y = point.y
      Window.open(id)
      Window.setPositionMode('overlap')
      handler.load(params)
    }
  }
  if (handler) return
  const meta = Data.scripts[id]
  if (meta?.parameters.length > 0 &&
    this.custom.commandNameMap[id]) {
    this.target = target
    this.id = id
    target.scrollAndResize()
    const point = target.getSelectionPosition()
    if (point) {
      Window.setPositionMode('absolute')
      Window.absolutePos.x = point.x + 100
      Window.absolutePos.y = point.y
      Window.open('scriptCommand')
      Window.setPositionMode('overlap')
      this.custom.load(id, params)
    }
  }
}

// 打开指令
Command.open = function (id) {
  const handler = this.cases[id]
  if (handler !== undefined) {
    this.id = id
    if (handler.load) {
      const point = this.target.getSelectionPosition()
      if (point) {
        Window.setPositionMode('absolute')
        Window.absolutePos.x = point.x + 100
        Window.absolutePos.y = point.y
        Window.open(id)
        Window.setPositionMode('overlap')
        handler.load({})
      }
    } else {
      handler.save()
    }
    return
  }
  const meta = Data.scripts[id]
  if (meta !== undefined &&
    this.custom.commandNameMap[id]) {
    this.id = id
    if (meta.parameters.length !== 0) {
      const point = this.target.getSelectionPosition()
      if (point) {
        Window.setPositionMode('absolute')
        Window.absolutePos.x = point.x + 100
        Window.absolutePos.y = point.y
        Window.open('scriptCommand')
        Window.setPositionMode('overlap')
        this.custom.load(id, {})
      }
    } else {
      this.custom.save()
    }
  }
}

// 保存指令
Command.save = function (params) {
  const {id, target} = this
  target.save({id, params})
  const handler = this.cases[id]
  if (handler !== undefined) {
    handler.load &&
    Window.close(id)
  } else {
    Window.close('scriptCommand')
  }
}

// 解析指令
Command.parse = function (command, varMap) {
  this.varMap = varMap
  let id = command.id
  if (id[0] === '!') {
    id = id.slice(1)
  }
  this.invalid = false
  const params = command.params
  const handler = this.cases[id]
  const contents = handler
  ? handler.parse(params)
  : this.custom.parse(id, params)
  return Command.parseTextTags(contents)
}

// 解析混合模式
Command.parseBlend = function (blend) {
  return Local.get('blend.' + blend)
}

// 获取变量列表
Command.fetchVariables = function (commands) {
  const eventId = commands.eventId
  const calledEvents = [eventId]
  let eventIndex = 0
  this.returnType = Data.events[eventId]?.returnType ?? 'none'
  this.saveVars = true
  // 获取全局事件参数变量
  const fetchParameters = guid => {
    const globalEvent = Data.events[guid]
    if (!globalEvent) return
    for (const {type, key} of globalEvent.parameters) {
      let varType
      switch (type) {
        case 'boolean': varType = 'boolean'; break
        case 'number': varType = 'number'; break
        case 'string': varType = 'string'; break
        default: varType = 'object'; break
      }
      Command.variables.push({
        name: key,
        type: varType,
        comment: this.eventName || '⭐️' + Local.get(`eventParameterTypes.${type}`),
        evIndex: eventIndex,
        isLeftValue: true,
        refCount: 0,
      })
    }
  }
  // 遍历指令列表获取变量
  const fetchVariables = commands => {
    for (const command of commands) {
      const {id, params} = command
      // 跳过关闭的指令
      if (id[0] === '!') continue
      // 遍历调用事件中的全局事件指令列表
      if (id === 'callEvent') {
        if (params.type === 'global' && calledEvents.append(params.eventId)) {
          const file = Data.manifest.guidMap[params.eventId]?.file
          if (file instanceof FileItem && !file.data.namespace) {
            let lastEventName = this.eventName
            let lasteventIndex = this.eventIndex
            this.eventName = file.basename
            this.eventIndex = ++eventIndex
            fetchParameters(params.eventId)
            fetchVariables(file.data.commands)
            this.eventName = lastEventName
            this.eventIndex = lasteventIndex
          }
        }
      }
      // 执行指令解析事件
      const handler = this.cases[id]
      const contents = handler
      ? handler.parse(params)
      : this.custom.parse(id, params)
      // 遍历子代指令列表
      for (const content of contents) {
        if (content.children) {
          fetchVariables(content.children)
        }
      }
    }
  }
  // 获取变量
  fetchParameters(eventId)
  fetchVariables(commands)
  // 恢复上下文状态
  const {variables} = this
  this.eventIndex = 0
  this.eventName = ''
  this.saveVars = false
  this.variables = []
  return variables
}

// 解析变量
Command.parseVariable = function (variable, valueType = '', isLeftValue = false) {
  const key = variable.key
  switch (variable.type) {
    case 'local': {
      // 如果开启了保存变量模式
      if (Command.saveVars) {
        if (key !== '') {
          Command.variables.push({
            name: key,
            type: valueType,
            comment: Command.eventName,
            evIndex: Command.eventIndex,
            isLeftValue: isLeftValue,
            refCount: 0,
          })
        }
      }
      let varName = Command.setVariableColor(key || Local.get('common.none'))
      if (valueType) {
        const textId = Command.setTextId(`local-${valueType}-${key}`)
        varName = textId + varName
      }
      return varName
    }
    case 'global': {
      let varName = Command.parseGlobalVariable(key)
      if (valueType) {
        const gVar = Data.variables.map[variable.key]
        // 优先使用全局变量值的类型
        const type = gVar ? typeof gVar.value : valueType
        const textId = Command.setTextId(`global-${type}-${variable.key}`)
        varName = textId + Command.setGlobalVariableColor(varName)
      }
      return varName
    }
    case 'self': {
      let varName = Command.setVariableColor(Local.get('variable.self'))
      if (valueType) {
        const textId = Command.setTextId(`self-${valueType}-unnamed`)
        varName = textId + varName
      }
      return varName
    }
    case 'actor': {
      const actor = Command.parseActor(variable.actor)
      const attrName = Command.parseVariableAttr('actor', key)
      return typeof key === 'string' ? actor + Token('.') + attrName : actor + Token('[') + attrName + Token(']')
    }
    case 'skill': {
      const skill = Command.parseSkill(variable.skill)
      const attrName = Command.parseVariableAttr('skill', key)
      return typeof key === 'string' ? skill + Token('.') + attrName : skill + Token('[') + attrName + Token(']')
    }
    case 'state': {
      const state = Command.parseState(variable.state)
      const attrName = Command.parseVariableAttr('state', key)
      return typeof key === 'string' ? state + Token('.') + attrName : state + Token('[') + attrName + Token(']')
    }
    case 'equipment': {
      const equipment = Command.parseEquipment(variable.equipment)
      const attrName = Command.parseVariableAttr('equipment', key)
      return typeof key === 'string' ? equipment + Token('.') + attrName : equipment + Token('[') + attrName + Token(']')
    }
    case 'item': {
      const item = Command.parseItem(variable.item)
      const attrName = Command.parseVariableAttr('item', key)
      return typeof key === 'string' ? item + Token('.') + attrName : item + Token('[') + attrName + Token(']')
    }
    case 'element': {
      const element = Command.parseElement(variable.element)
      const attrName = Command.parseVariableAttr('element', key)
      return typeof key === 'string' ? element + Token('.') + attrName : element + Token('[') + attrName + Token(']')
    }
  }
}

// 解析全局变量
Command.parseGlobalVariable = function (id) {
  if (id === '') return Token('none')
  const variable = Data.variables.map[id]
  return variable ? variable.name : Command.parseUnlinkedId(id)
}

// 解析属性群组
Command.parseAttributeGroup = function (groupKey) {
  if (groupKey === '') return Token('none')
  const group = Attribute.getGroup(groupKey)
  if (group) return GameLocal.replace(group.groupName)
  this.invalid = true
  return Command.parseUnlinkedId(groupKey)
}

// 解析属性键
Command.parseAttributeKey = function () {
  const i = / +/g
  return function (groupKey, attrId, valueType) {
    const attr = groupKey
    ? Attribute.getGroupAttribute(groupKey, attrId)
    : Attribute.getAttribute(attrId)
    if (attr) {
      const type = valueType ?? (attr.type === 'enum' ? 'string' : attr.type)
      const textId = Command.setTextId(`attribute-${type}-${attr.key ?? attrId}-${attrId}`)
      return textId + Command.setVariableColor(GameLocal.replace(attr.name.replace(i, '')))
    }
    this.invalid = true
    const textId = Command.setTextId(`attribute-${valueType ?? 'any'}-${attrId}-${attrId}`)
    return textId + Command.setVariableColor(Command.parseUnlinkedId(attrId))
  }
}()

// 解析属性标签
Command.parseAttributeTag = function (id, valueType) {
  return Token('<') + Command.parseAttributeKey('', id, valueType) + Token('>')
}

// 解析变量标签
Command.parseVariableTag = function IIFE() {
  const local = /(?<=<)local:([\s\S]+?)(?=>)/g
  const global = /(?<=<)global(::?)([0-9a-f]{16})(?=>)/g
  const localVar = {type: 'local', key: ''}
  const globalVar = {type: 'global', key: ''}
  const localReplacer = (match, varKey) => {
    localVar.key = varKey
    // 使用这个方法注册变量
    return Command.parseVariable(localVar, 'any')
  }
  const globalReplacer = (match, delimiter, varKey) => {
    globalVar.key = varKey
    const varSign = delimiter === '::' ? '@' : ''
    return varSign + Command.parseVariable(globalVar, 'any')
  }
  return string => string.replace(local, localReplacer).replace(global, globalReplacer)
}()

// 解析可变数值
Command.parseVariableNumber = function (number, unit) {
  switch (typeof number) {
    case 'number': {
      const text = Command.setNumberColor(number)
      return unit ? text + unit : text
    }
    case 'object': {
      const text = Command.parseVariable(number, 'number')
      return unit ? text + ' ' + unit : text
    }
  }
}

// 解析可变字符串
Command.parseVariableString = function (string) {
  switch (typeof string) {
    case 'string':
      return Command.setStringColor(`"${Command.parseMultiLineString(string)}"`)
    case 'object':
      return Command.parseVariable(string, 'string')
  }
}

// 解析可变模板字符串
Command.parseVariableTemplate = function (content, maxLength = 0) {
  switch (typeof content) {
    case 'string': {
      const tag = Command.parseVariableTag(GameLocal.replace(content))
      let string = Command.parseMultiLineString(tag)
      if (maxLength !== 0 && string.length > maxLength) {
        string = string.slice(0, maxLength) + '...'
      }
      return Command.setStringColor(`"${string}"`, true)
    }
    case 'object':
      return Command.parseVariable(content, 'any')
  }
}

// 解析可变属性
Command.parseVariableAttr = function (groupKey, attrId) {
  switch (typeof attrId) {
    case 'string':
      return Command.parseAttributeKey(groupKey, attrId)
    case 'object':
      return Command.parseVariable(attrId, 'string')
  }
}

// 解析可变枚举值
Command.parseVariableEnum = function (groupKey, enumId) {
  switch (typeof enumId) {
    case 'string':
      return Command.parseGroupEnumString(groupKey, enumId)
    case 'object':
      return Command.parseVariable(enumId, 'string')
  }
}

// 解析可变文件
Command.parseVariableFile = function (fileId) {
  switch (typeof fileId) {
    case 'string':
      return Command.parseFileName(fileId)
    case 'object':
      return Command.parseVariable(fileId, 'string')
  }
}

// 解析可变队伍
Command.parseVariableTeam = function (id) {
  switch (typeof id) {
    case 'string':
      return Command.parseTeam(id)
    case 'object':
      return Command.parseVariable(id, 'string')
  }
}

// 解析多行字符串
Command.parseMultiLineString = function IIFE() {
  const regexp = /\n/g
  return function (string) {
    return string.replace(regexp, '\\n')
  }
}()

// 解析精灵图名称
Command.parseSpriteName = function (animationId, spriteId) {
  if (spriteId === '') return Token('none')
  const animation = Data.animations[animationId]
  const sprite = animation?.sprites.find(a => a.id === spriteId)
  if (sprite) return sprite.name
  this.invalid = true
  return Command.parseUnlinkedId(spriteId)
}

// 解析事件类型(内置事件普通颜色，自定义事件字符串颜色)
Command.parseEventType = function (groupKey, eventType) {
  return Local.get('eventTypes.' + eventType) ||
  Command.parseGroupEnumString(groupKey, eventType)
}

// 解析枚举群组
Command.parseEnumGroup = function (groupKey) {
  if (groupKey === '') return Token('none')
  const group = Enum.getGroup(groupKey)
  if (group) return GameLocal.replace(group.groupName)
  this.invalid = true
  return Command.parseUnlinkedId(groupKey)
}

// 解析枚举字符串
Command.parseEnumString = function (stringId) {
  if (stringId === '') return Token('none')
  const string = Enum.getString(stringId)
  if (string) {
    const textId = Command.setTextId(`enum-string-${string.value ?? stringId}-${stringId}`)
    return textId + Command.setStringColor(GameLocal.replace(string.name))
  }
  this.invalid = true
  const textId = Command.setTextId(`enum-string-${stringId}-${stringId}`)
  return textId + Command.setStringColor(Command.parseUnlinkedId(stringId))
}

// 解析枚举字符串标签
Command.parseEnumStringTag = function (stringId) {
  return Token('<') + Command.parseEnumString(stringId) + Token('>')
}

// 解析群组枚举字符串
Command.parseGroupEnumString = function (groupKey, stringId) {
  if (stringId === '') return Token('none')
  const string = Enum.getGroupString(groupKey, stringId)
  const textId = Command.setTextId(`enum-string-${stringId}-${stringId}`)
  if (string) return textId + Command.setStringColor(GameLocal.replace(string.name))
  this.invalid = true
  return textId + Command.setStringColor(Command.parseUnlinkedId(stringId))
}

// 解析列表项目
Command.parseListItem = function (variable, index) {
  const listName = Command.parseVariable(variable, 'object')
  const listIndex = Command.parseVariableNumber(index)
  return listName + Token('[') + listIndex + Token(']')
}

// 解析参数
Command.parseParameter = function (key) {
  const label = Local.get('parameter.param')
  const paramKey = Command.parseVariableString(key)
  return label + Token('(') + paramKey + Token(')')
}

// 解析角色
Command.parseActor = function (actor) {
  switch (actor.type) {
    case 'trigger':
      return Command.setTextId('actor-object-trigger') + Local.get('actor.trigger')
    case 'caster':
      return Command.setTextId('actor-object-caster') + Local.get('actor.caster')
    case 'latest':
      return Command.setTextId('actor-object-latest') + Local.get('actor.latest')
    case 'target':
      return Command.setTextId('actor-object-target') + Local.get('actor.target')
    case 'player':
      return Command.setTextId('actor-object-player') + Local.get('actor.player')
    case 'member':
      return Command.setTextId('actor-object-member') + Local.get('actor.member') + Token('[') + Command.parseVariableNumber(actor.memberId) + Token(']')
    case 'global':
      return Command.setTextId(`actor-object-${actor.actorId}`) + Command.parseFileName(actor.actorId)
    case 'by-id':
      return Command.parsePresetObject(actor.presetId)
    case 'variable': {
      const label = Local.get('actor.common')
      const textId = Command.setTextId('actor-object-variable')
      const variable = Command.parseVariable(actor.variable, 'object')
      return textId + label + Token('(') + variable + Token(')')
    }
  }
}

// 解析技能
Command.parseSkill = function (skill) {
  switch (skill.type) {
    case 'trigger':
      return Command.setTextId('skill-object-trigger') + Local.get('skill.trigger')
    case 'latest':
      return Command.setTextId('skill-object-latest') + Local.get('skill.latest')
    case 'by-key': {
      const actor = Command.parseActor(skill.actor)
      const label = Local.get('skill.common')
      const textId = Command.setTextId('skill-object-by-key')
      const key = Command.parseVariableEnum('shortcut-key', skill.key)
      return actor + Token(' -> ') + textId + label + Token('<') + key + Token('>')
    }
    case 'by-id': {
      const actor = Command.parseActor(skill.actor)
      const file = Command.parseFileName(skill.skillId)
      return actor + Token(' -> ') + file
    }
    case 'variable': {
      const label = Local.get('skill.common')
      const textId = Command.setTextId('skill-object-variable')
      const variable = Command.parseVariable(skill.variable, 'object')
      return textId + label + Token('(') + variable + Token(')')
    }
  }
}

// 解析状态
Command.parseState = function (state) {
  switch (state.type) {
    case 'trigger':
      return Command.setTextId('state-object-trigger') + Local.get('state.trigger')
    case 'latest':
      return Command.setTextId('state-object-latest') + Local.get('state.latest')
    case 'by-id': {
      const actor = Command.parseActor(state.actor)
      const file = Command.parseFileName(state.stateId)
      return actor + Token(' -> ') + file
    }
    case 'variable': {
      const label = Local.get('state.common')
      const textId = Command.setTextId('state-object-variable')
      const variable = Command.parseVariable(state.variable, 'object')
      return textId + label + Token('(') + variable + Token(')')
    }
  }
}

// 解析装备
Command.parseEquipment = function (equipment) {
  switch (equipment.type) {
    case 'trigger':
      return Command.setTextId('equipment-object-trigger') + Local.get('equipment.trigger')
    case 'latest':
      return Command.setTextId('equipment-object-latest') + Local.get('equipment.latest')
    case 'by-slot': {
      const actor = Command.parseActor(equipment.actor)
      const label = Local.get('equipment.common')
      const textId = Command.setTextId('equipment-object-by-slot')
      const slot = Command.parseVariableEnum('equipment-slot', equipment.slot)
      return actor + Token(' -> ') + textId + label + Token('<') + slot + Token('>')
    }
    case 'by-id-equipped':
    case 'by-id-inventory': {
      const actor = Command.parseActor(equipment.actor)
      const file = Command.parseFileName(equipment.equipmentId)
      const source = Command.setWeakColor(Local.get('equipment.' + equipment.type))
      return actor + Token(' -> ') + file + ' ' + Token('(') + source + Token(')')
    }
    case 'variable': {
      const label = Local.get('equipment.common')
      const textId = Command.setTextId('equipment-object-variable')
      const variable = Command.parseVariable(equipment.variable, 'object')
      return textId + label + Token('(') + variable + Token(')')
    }
  }
}

// 解析物品
Command.parseItem = function (item) {
  switch (item.type) {
    case 'trigger':
      return Command.setTextId('item-object-trigger') + Local.get('item.trigger')
    case 'latest':
      return Command.setTextId('item-object-latest') + Local.get('item.latest')
    case 'by-key': {
      const actor = Command.parseActor(item.actor)
      const label = Local.get('item.common')
      const textId = Command.setTextId('item-object-by-key')
      const key = Command.parseVariableEnum('shortcut-key', item.key)
      return actor + Token(' -> ') + textId + label + Token('<') + key + Token('>')
    }
    case 'by-id': {
      const actor = Command.parseActor(item.actor)
      const file = Command.parseFileName(item.itemId)
      return actor + Token(' -> ') + file
    }
    case 'variable': {
      const label = Local.get('item.common')
      const variable = Command.parseVariable(item.variable, 'object')
      const textId = Command.setTextId('item-object-variable')
      return textId + label + Token('(') + variable + Token(')')
    }
  }
}

// 解析位置
Command.parsePosition = function (position) {
  switch (position.type) {
    case 'absolute': {
      const x = Command.parseVariableNumber(position.x)
      const y = Command.parseVariableNumber(position.y)
      return Local.get('position.common') + Token('(') + x + Token(', ') + y + Token(')')
    }
    case 'relative': {
      const x = Command.parseVariableNumber(position.x)
      const y = Command.parseVariableNumber(position.y)
      return Local.get('position.relative') + Token('(') + x + Token(', ') + y + Token(')')
    }
    case 'actor':
      return Local.get('position.common') + Token('(') + Command.parseActor(position.actor) + Token(')')
    case 'trigger':
      return Local.get('position.common') + Token('(') + Command.parseTrigger(position.trigger) + Token(')')
    case 'light':
      return Local.get('position.common') + Token('(') + Command.parseLight(position.light) + Token(')')
    case 'region': {
      const region = Command.parseRegion(position.region)
      const mode = Local.get('position.region.mode.' + position.mode)
      return Local.get('position.common') + Token('(') + region + Token(', ') + mode + Token(')')
    }
    case 'object':
      return Local.get('position.common') + Token('(') + Command.parsePresetObject(position.objectId) + Token(')')
    case 'mouse':
      return Local.get('position.common') + Token('(') + Local.get('position.mouse') + Token(')')
  }
}

// 解析角度
Command.parseAngle = function (angle) {
  const type = angle.type
  const desc = Local.get('angle.' + type)
  switch (type) {
    case 'position':
      return `${desc} ${Command.parsePosition(angle.position)}`
    case 'absolute':
    case 'relative':
    case 'direction':
      return `${desc} ${Command.parseVariableNumber(angle.degrees, '°')}`
    case 'random':
      return desc
  }
}

// 解析触发器
Command.parseTrigger = function (trigger) {
  switch (trigger.type) {
    case 'trigger':
      return Command.setTextId('trigger-object-trigger') + Local.get('trigger.trigger')
    case 'latest':
      return Command.setTextId('trigger-object-latest') + Local.get('trigger.latest')
    case 'variable': {
      const label = Local.get('trigger.common')
      const textId = Command.setTextId('trigger-object-variable')
      const variable = Command.parseVariable(trigger.variable, 'object')
      return textId + label + Token('(') + variable + Token(')')
    }
  }
}

// 解析光源
Command.parseLight = function (light) {
  switch (light.type) {
    case 'trigger':
      return Command.setTextId('light-object-trigger') + Local.get('light.trigger')
    case 'latest':
      return Command.setTextId('light-object-latest') + Local.get('light.latest')
    case 'by-id':
      return Command.parsePresetObject(light.presetId)
    case 'variable': {
      const label = Local.get('light.common')
      const textId = Command.setTextId('light-object-variable')
      const variable = Command.parseVariable(light.variable, 'object')
      return textId + label + Token('(') + variable + Token(')')
    }
  }
}

// 解析区域
Command.parseRegion = function (region) {
  switch (region.type) {
    case 'trigger':
      return Command.setTextId('region-object-trigger') + Local.get('region.trigger')
    case 'by-id':
      return Command.parsePresetObject(region.presetId)
  }
}

// 解析瓦片地图
Command.parseTilemap = function (tilemap) {
  switch (tilemap.type) {
    case 'trigger':
      return Command.setTextId('tilemap-object-trigger') + Local.get('tilemap.trigger')
    case 'by-id':
      return Command.parsePresetObject(tilemap.presetId)
  }
}

// 解析场景对象
Command.parseObject = function (object) {
  switch (object.type) {
    case 'trigger':
      return Command.setTextId('preset-object-trigger') + Local.get('object.trigger')
    case 'latest':
      return Command.setTextId('preset-object-latest') + Local.get('object.latest')
    case 'by-id':
      return Command.parsePresetObject(object.presetId)
    case 'variable': {
      const label = Local.get('object.common')
      const textId = Command.setTextId('preset-object-variable')
      const variable = Command.parseVariable(object.variable, 'object')
      return textId + label + Token('(') + variable + Token(')')
    }
  }
}

// 解析元素
Command.parseElement = function (element) {
  switch (element.type) {
    case 'trigger':
      return Command.setTextId('element-object-trigger') + Local.get('element.trigger')
    case 'latest':
      return Command.setTextId('element-object-latest') + Local.get('element.latest')
    case 'by-id':
      return Command.parsePresetElement(element.presetId, false)
    case 'by-ancestor-and-id': {
      const ancestor = Command.parseElement(element.ancestor)
      const descendant = Command.parsePresetElement(element.presetId, false)
      return ancestor + Token(' -> ') + descendant
    }
    case 'by-index': {
      const parent = Command.parseElement(element.parent)
      const label = Local.get('element.common')
      const textId = Command.setTextId('element-object-by-index')
      const index = Command.parseVariableNumber(element.index)
      const child = textId + label + Token('[') + index + Token(']')
      return parent + Token(' -> ') + child
    }
    case 'by-button-index': {
      const focus = Command.parseElement(element.focus)
      const label = Local.get('element.button')
      const textId = Command.setTextId('element-object-by-button-index')
      const index = Command.parseVariableNumber(element.index)
      const child = textId + label + Token('[') + index + Token(']')
      return focus + Token(' -> ') + child
    }
    case 'selected-button': {
      const focus = Command.parseElement(element.focus)
      const button = Local.get('element.selected-button')
      const textId = Command.setTextId('element-object-selected-button')
      return focus + Token(' -> ') + textId + button
    }
    case 'focus':
      return Command.setTextId('element-object-focus') + Local.get('element.focus')
    case 'parent': {
      const label = Local.get('element.parent')
      const textId = Command.setTextId('element-object-parent')
      const parent = Command.parseVariable(element.variable, 'object')
      return textId + label + Token('(') + parent + Token(')')
    }
    case 'variable': {
      const label = Local.get('element.common')
      const textId = Command.setTextId('element-object-variable')
      const variable = Command.parseVariable(element.variable, 'object')
      return textId + label + Token('(') + variable + Token(')')
    }
  }
}

// 解析预设对象
Command.parsePresetObject = function (presetId) {
  if (presetId === '') return Token('none')
  const name = Data.scenePresets[presetId]?.data.name
  const textId = Command.setTextId(`scene-object-${presetId}`)
  return typeof name === 'string'
  ? textId + Command.setPresetColor(name)
  : textId + Command.setPresetColor(Command.parseUnlinkedId(presetId))
}

// 解析预设元素
Command.parsePresetElement = function (presetId, detailed = true) {
  if (presetId === '') return Token('none')
  const uiId = Data.uiPresets[presetId]?.uiId ?? ''
  const preset = Data.uiPresets[presetId]?.data
  const textId = Command.setTextId(`ui-object-${presetId}`)
  let presetName = preset?.name
  if (presetName === undefined) {
    this.invalid = true
    presetName = Command.setPresetColor(Command.parseUnlinkedId(presetId))
  } else if (presetName) {
    presetName = Command.setPresetColor(presetName)
  }
  switch (detailed) {
    case true: {
      const uiName = Command.parseFileName(uiId)
      return uiName + ' ' + Token('{') + textId + presetName + Token('}')
    }
    case false:
      return textId + presetName
  }
}

// 解析队伍
Command.parseTeam = function (id) {
  const team = Data.teams.map[id]
  if (team) return team.name
  this.invalid = true
  return Command.parseUnlinkedId(id)
}

// 解析十六进制颜色
Command.parseHexColor = function (hex) {
  return Command.setStringColor('#' + hex)
}

// 解析角色选择器
Command.parseActorSelector = function (selector) {
  switch (selector) {
    case 'enemy':
    case 'friend':
    case 'team':
    case 'team-except-self':
    case 'any-except-self':
    case 'any':
      return Local.get('actorFilter.' + selector)
  }
}

// 解析文件名称
Command.parseFileName = function (id) {
  if (id === '') return Token('none')
  const meta = Data.manifest.guidMap[id]
  const textId = Command.setTextId(`file-string-${id}`)
  if (meta) return textId + Command.setFileColor(File.parseMetaName(meta))
  this.invalid = true
  return textId + Command.setFileColor(Command.parseUnlinkedId(id))
}

// 解析音频类型
Command.parseAudioType = function (type) {
  switch (type) {
    case 'bgm':
      return 'BGM'
    case 'bgs':
      return 'BGS'
    case 'cv':
      return 'CV'
    case 'se':
    case 'se-attenuated':
      return 'SE'
    case 'all':
      return 'ALL'
  }
}

// 解析等待参数
Command.parseWait = function (wait) {
  switch (wait) {
    case false:
      return ''
    case true:
      return Local.get('transition.wait')
  }
}

// 解析过渡方式
Command.parseEasing = function (easingId, duration, wait) {
  if (duration === 0) return ''
  const easing = Data.easings.map[easingId]
  const time = Command.parseVariableNumber(duration, 'ms')
  const info = (easing?.name ?? `#${easingId}`) + Token(', ') + time
  return wait ? info + Token(', ') + Local.get('transition.wait') : info
}

// 解析失去连接的ID
Command.parseUnlinkedId = function (name) {
  return name ? `#${name}` : ''
}

// 解析文本标签
Command.parseTextTags = function IIFE() {
  const regexp = /\$_(\S+?)_\$([\s\S]*?)\$_\/_\$/g
  return function (contents) {
    let i = contents.length
    while (--i >= 0) {
      const content = contents[i]
      if (content.text !== undefined) {
        const text = content.text
        const inserts = []
        let end = 0
        let match
        while (match = regexp.exec(text)) {
          const start = match.index
          // 插入普通文本
          if (end < start) {
            inserts.push(
              {text: text.slice(end, start)},
            )
          }
          if (match[1] === 'textId') {
            // 插入文本ID
            inserts.push({textId: match[2]})
          } else if (match[1] === 'tooltip') {
            // 插入工具提示
            inserts.push({tooltip: match[2]})
          } else if (match[1] === 'class') {
            // 插入自定义类名
            inserts.push({class: match[2]})
          } else if (match[2] === '$_none_$') {
            // 如果存在特殊文本，只插入颜色
            inserts.push({color: match[1]})
          } else {
            // 插入高亮文本
            inserts.push(
              {color: match[1]},
              {text: match[2]},
              {color: 'restore'},
            )
          }
          // 更新尾部索引
          end = start + match[0].length
        }
        // 如果存在高亮文本
        if (inserts.length !== 0) {
          // 插入尾部普通文本
          if (end < text.length) {
            inserts.push(
              {text: text.slice(end)},
            )
          }
          // 替换内容对象
          contents.splice(i, 1, ...inserts)
        }
      }
    }
    return contents
  }
}()

// 移除文本标签
Command.removeTextTags = function IIFE() {
  const regexp = /\$_textId_\$(?:\S+?)_\/_\$|\$_(?:\S+?)_\$/g
  return function (string) {
    return string.replace(regexp, '')
  }
}()

// 设置普通颜色
Command.setNormalColor = function (value) {
  return `$_normal_$${value}$_/_$`
}

// 设置变量颜色
Command.setVariableColor = function (value) {
  return `$_identifier_$${value}$_/_$`
}

// 设置全局变量颜色
Command.setGlobalVariableColor = function (value) {
  return `$_global-var_$${value}$_/_$`
}

// 设置定界符颜色
Command.setDelimiterColor = function (value) {
  return `$_delimiter_$${value}$_/_$`
}

// 设置操作符颜色
Command.setOperatorColor = function (value) {
  return `$_operator_$${value}$_/_$`
}

// 设置布尔值颜色
Command.setBooleanColor = function (value) {
  return `$_boolean_$${value}$_/_$`
}

// 设置数值颜色
Command.setNumberColor = function (value) {
  if (typeof value) {
    value = value.toString()
  }
  if (value[0] !== '-') return `$_number_$${value}$_/_$`
  return Token('-') + `$_number_$${value.slice(1)}$_/_$`
}

// 设置字符串颜色
Command.setStringColor = function (value, save = false) {
  if (save === false) return `$_string_$${value}$_/_$`
  return `$_string_$$_none_$$_/_$$_save_$$_none_$$_/_$${value}$_normal_$$_none_$$_/_$$_save_$$_none_$$_/_$`
}

// 设置脚本颜色
Command.setScriptColor = function (value) {
  return `$_text_$${value}$_/_$`
}

// 设置文件的颜色
Command.setFileColor = function (value) {
  return `$_file_$${value}$_/_$`
}

// 设置预设对象的颜色
Command.setPresetColor = function (value) {
  return `$_preset_$${value}$_/_$`
}

// 设置微弱的颜色
Command.setWeakColor = function (value) {
  return `$_weak_$${value}$_/_$`
}

// 设置逗号颜色
Command.setCommaColors = function IIFE() {
  const regexp = /,/g
  return function (value) {
    return value.replace(regexp, '$_delimiter_$,$_/_$')
  }
}()

// 设置文本ID
Command.setTextId = function (id) {
  return `$_textId_$${id}$_/_$`
}

// 设置工具提示
Command.setTooltip = function (tip) {
  return `$_tooltip_$${tip}$_/_$`
}

// 设置自定义类名
Command.setClass = function (className) {
  return `$_class_$${className}$_/_$`
}

// 遍历指令列表中的每个指令
Command.forEachCommand = function (commands, handler) {
  const forEach = commands => {
    for (const command of commands) {
      // console.log(command)
      handler(command)
      switch (command.id) {
        case 'showChoices':
          for (const choice of command.params.choices) {
            // console.log('choice-branch')
            forEach(choice.commands)
            // console.log('--------------------')
          }
          continue
        case 'if':
          for (const branch of command.params.branches) {
            // console.log('if-branch')
            forEach(branch.commands)
            // console.log('--------------------')
          }
          if (command.params.elseCommands) {
            // console.log('if-else')
            forEach(command.params.elseCommands)
            // console.log('--------------------')
          }
          continue
        case 'switch':
          for (const branch of command.params.branches) {
            // console.log('switch-branch')
            forEach(branch.commands)
            // console.log('--------------------')
          }
          if (command.params.defaultCommands) {
            // console.log('switch-default')
            forEach(command.params.defaultCommands)
            // console.log('--------------------')
          }
          continue
        case 'loop':
          // console.log('loop-block')
          forEach(command.params.commands)
          // console.log('--------------------')
          continue
        case 'forEach':
          // console.log('forEach-block')
          forEach(command.params.commands)
          // console.log('--------------------')
          continue
        case 'independent':
          // console.log('independent-block')
          forEach(command.params.commands)
          // console.log('--------------------')
          continue
        case 'transition':
          // console.log('transition-block')
          forEach(command.params.commands)
          // console.log('--------------------')
          continue
      }
    }
  }
  return forEach(commands)
}

// 词语列表类
Command.WordList = class WordList extends Array {
  count //:number

  constructor() {
    super()
    this.count = 0
  }

  // 推入内容
  push(string) {
    if (string) this[this.count++] = string
    return this
  }

  // 连接内容
  join(joint = '$_delimiter_$, $_/_$') {
    const length = this.count
    if (length === 0) {
      return ''
    }
    this.count = 0
    let string = this[0]
    for (let i = 1; i < length; i++) {
      string += joint + this[i]
    }
    return string
  }
}

// 显示文本
Command.cases.showText = {
  latinCharWidth: 0,
  otherCharWidth: 0,
  initialize: function () {
    $('#showText-confirm').on('click', this.save)
  },
  parse: function ({target, parameters, content}) {
    const alias = Local.get('command.showText.alias')
    const words = Command.words
    .push(Command.parseActor(target))
    .push(Command.setCommaColors(parameters))
    const contents = [
      {fold: true},
      {color: 'element'},
      {text: alias + Token(': ')},
      {color: 'gray'},
      {color: 'save'},
      {text: words.join()},
    ]
    content = GameLocal.replace(content)
    content = Command.parseVariableTag(content)
    this.appendTextLines(contents, alias, content)
    return contents
  },
  load: function ({
    target      = {type: 'trigger'},
    parameters  = '',
    content     = '',
  }) {
    $('#showText-target').write(target)
    $('#showText-parameters').write(parameters)
    $('#showText-content').write(content)
    if (content === '') {
      $('#showText-target').getFocus()
    } else {
      $('#showText-content').getFocus()
    }
  },
  save: function () {
    const target = $('#showText-target').read()
    const parameters = $('#showText-parameters').read()
    const content = $('#showText-content').read()
    if (content === '') {
      return $('#showText-content').getFocus()
    }
    Command.save({target, parameters, content})
  },
  updateCharWidth: function () {
    if (this.latinCharWidth === 0) {
      const latinChars = '          '
      const otherChars = '　　　　　　　　　　'
      const font = 'var(--font-family-mono)'
      this.latinCharWidth = measureText(latinChars, font).width / 10
      this.otherCharWidth = measureText(otherChars, font).width / 10
    }
  },
  appendTextLines: function IIFE() {
    const append = (contents, tag, text) => {
      if (contents.length === 0) {
        contents.push(
          {color: 'element'},
          {text: tag + Token(': ')},
          {color: 'text'},
          {color: 'save'},
          {text: text},
        )
      } else {
        contents.push(
          {break: true},
          {color: 'transparent'},
          {text: tag + Token(': ')},
          {color: 'text'},
          {color: 'save'},
          {text: text},
        )
      }
    }
    const textIdTag = /^\$_textId_\$(?:\S+?)_\/_\$/
    const tooltipTag = /^\$_tooltip_\$(?:\S+?)_\/_\$/
    const classTag = /^\$_class_\$(?:\S+?)_\/_\$/
    const colorTag = /^\$_\S+?_\$([\s\S]*?)\$_\/_\$/
    return function (contents, tag, text) {
      if (!text) return
      this.updateCharWidth()
      const MAX_LINES = 10
      const MAX_LINE_WIDTH = 500
      const length = text.length
      const {latinCharWidth} = this
      const {otherCharWidth} = this
      let lineCount = 0
      let lineWidth = 0
      let startIndex = 0
      for (let i = 0; i < length; i++) {
        const char = text[i]
        if (char === '\n') {
          const line = text.slice(startIndex, i)
          append(contents, tag, line)
          lineWidth = 0
          startIndex = i + 1
          if (++lineCount === MAX_LINES) {
            break
          }
          continue
        }
        if (char === '$') {
          const slice = text.slice(i)
          const idMatch = slice.match(textIdTag)
          if (idMatch) {
            // 跳到结束位置
            i += idMatch[0].length - 1
            continue
          }
          const tipMatch = slice.match(tooltipTag)
          if (tipMatch) {
            // 跳到结束位置
            i += tipMatch[0].length - 1
            continue
          }
          const classMatch = slice.match(classTag)
          if (classMatch) {
            // 跳到结束位置
            i += classMatch[0].length - 1
            continue
          }
          const colorMatch = slice.match(colorTag)
          if (colorMatch) {
            for (const char of colorMatch[1]) {
              lineWidth +=
                char < '\xff'
              ? latinCharWidth
              : otherCharWidth
            }
            // 跳到结束位置
            i += colorMatch[0].length - 1
            continue
          }
        }
        const charWidth =
          char < '\xff'
        ? latinCharWidth
        : otherCharWidth
        lineWidth += charWidth
        if (lineWidth > MAX_LINE_WIDTH) {
          const line = text.slice(startIndex, i)
          append(contents, tag, line)
          lineWidth = charWidth
          startIndex = i
          if (++lineCount === MAX_LINES) {
            break
          }
          continue
        }
      }
      if (lineCount === MAX_LINES) {
        append(contents, tag, '......')
      } else if (lineWidth !== 0) {
        const line = text.slice(startIndex, length)
        append(contents, tag, line)
      }
    }
  }(),
}

// 显示选项
Command.cases.showChoices = {
  initialize: function () {
    $('#showChoices-confirm').on('click', this.save)

    // 绑定选项列表
    $('#showChoices-choices').bind(Choices)

    // 清理内存 - 窗口已关闭事件
    $('#showChoices').on('closed', event => {
      $('#showChoices-choices').clear()
    })
  },
  parse: function ({choices, parameters}) {
    const contents = [
      {fold: true},
      {color: 'flow'},
      {text: Local.get('command.showChoices') + Token(': ')},
      {color: 'text'},
      {color: 'save'},
    ]
    // 添加选项数量
    contents.push(
      {text: Command.setNumberColor(choices.length)},
    )
    // 添加参数内容
    if (parameters) {
      contents.push(
        {color: 'gray'},
        {color: 'save'},
        {text: ' ' + Token('(') + Command.setCommaColors(parameters) + Token(')')},
      )
    }
    contents.push({color: 'flow'})
    // 换行
    contents.push({break: true})
    // 添加选项分支内容
    const when = Local.get('command.showChoices.when')
    for (const choice of choices) {
      contents.push(
        {color: 'flow'},
        {text: when + ' '},
        {color: 'text'},
        {text: Command.parseVariableTag(GameLocal.replace(choice.content))},
        {children: choice.commands},
      )
    }
    contents.push(
      {color: 'flow'},
      {text: Local.get('command.showChoices.end')},
    )
    return contents
  },
  createDefaultChoices: function () {
    return [{
      content: Local.get('showChoices.yes'),
      commands: [],
    },
    {
      content: Local.get('showChoices.no'),
      commands: [],
    }]
  },
  load: function ({
    choices     = this.createDefaultChoices(),
    parameters  = '',
  }) {
    const write = getElementWriter('showChoices')
    write('choices', choices.slice())
    write('parameters', parameters)
    Command.cases.showChoices.choices = choices
    $('#showChoices-choices').getFocus()
  },
  save: function () {
    const read = getElementReader('showChoices')
    const choices = read('choices')
    if (choices.length === 0) {
      return $('#showChoices-choices').getFocus()
    }
    const parameters = read('parameters')
    Command.save({choices, parameters})
  },
}

// 注释
Command.cases.comment = {
  initialize: function () {
    $('#comment-confirm').on('click', this.save)
  },
  parse: function ({comment}) {
    const contents = []
    const lines = comment.split('\n')
    for (const line of lines) {
      if (contents.length === 0) {
        contents.push(
          {color: 'comment'},
          {text: line},
        )
      } else {
        contents.push(
          {break: true},
          {text: line},
        )
      }
    }
    if (lines.length > 1) {
      contents.unshift({fold: true})
    }
    return contents
  },
  load: function ({comment = ''}) {
    $('#comment-comment').write(comment)
    $('#comment-comment').getFocus('end')
  },
  save: function () {
    const comment = $('#comment-comment').read()
    if (comment === '') {
      return $('#comment-comment').getFocus()
    }
    Command.save({comment})
  },
}

// 设置布尔值
Command.cases.setBoolean = {
  initialize: function () {
    $('#setBoolean-confirm').on('click', this.save)

    // 创建操作选项
    $('#setBoolean-operation').loadItems([
      {name: 'Set', value: 'set'},
      {name: 'Not', value: 'not'},
      {name: 'And', value: 'and'},
      {name: 'Or', value: 'or'},
      {name: 'Xor', value: 'xor'},
    ])

    // 创建类型选项
    $('#setBoolean-operand-type').loadItems([
      {name: 'Constant', value: 'constant'},
      {name: 'Variable', value: 'variable'},
      {name: 'List', value: 'list'},
      {name: 'Parameter', value: 'parameter'},
      {name: 'Script', value: 'script'},
    ])

    // 设置类型关联元素
    $('#setBoolean-operand-type').enableHiddenMode().relate([
      {case: 'constant', targets: [
        $('#setBoolean-constant-value'),
      ]},
      {case: 'variable', targets: [
        $('#setBoolean-common-variable'),
      ]},
      {case: 'list', targets: [
        $('#setBoolean-common-variable'),
        $('#setBoolean-list-index'),
      ]},
      {case: 'parameter', targets: [
        $('#setBoolean-parameter-key'),
      ]},
      {case: 'script', targets: [
        $('#setBoolean-script'),
      ]},
    ])

    // 创建布尔值常量选项
    $('#setBoolean-constant-value').loadItems([
      {name: 'False', value: false},
      {name: 'True', value: true},
    ])

    // 设置类型写入事件，切换变量输入框的过滤器
    $('#setBoolean-operand-type').on('write', event => {
      let filter = 'all'
      switch (event.value) {
        case 'variable':
          filter = 'boolean'
          break
        case 'list':
          filter = 'object'
          break
      }
      $('#setBoolean-common-variable').filter = filter
    })
  },
  parseOperation: function (operation) {
    switch (operation) {
      case 'set': return ' = '
      case 'not': return ' =! '
      case 'and': return ' &= '
      case 'or': return ' |= '
      case 'xor': return ' ^= '
    }
  },
  parseOperand: function (operand) {
    switch (operand.type) {
      case 'constant':
        return Command.setBooleanColor(operand.value.toString())
      case 'variable':
        return Command.parseVariable(operand.variable, 'boolean')
      case 'list':
        return Command.parseListItem(operand.variable, operand.index)
      case 'parameter':
        return Command.parseParameter(operand.key)
      case 'script':
        return Command.setScriptColor(operand.script)
    }
  },
  parse: function ({variable, operation, operand}) {
    const varDesc = Command.parseVariable(variable, 'boolean', operation === 'set')
    const operator = Command.setOperatorColor(this.parseOperation(operation))
    const value = this.parseOperand(operand)
    return [
      {color: 'variable'},
      {text: Local.get('command.setBoolean.alias') + ' '},
      {color: 'restore'},
      {text: `${varDesc}${operator}${value}`},
    ]
  },
  load: function ({
    variable  = {type: 'local', key: ''},
    operation = 'set',
    operand   = {type: 'constant', value: false},
  }) {
    const write = getElementWriter('setBoolean')
    let constantValue = false
    let commonVariable = {type: 'local', key: ''}
    let listIndex = 0
    let parameterKey = ''
    let script = ''
    switch (operand.type) {
      case 'constant':
        constantValue = operand.value
        break
      case 'variable':
        commonVariable = operand.variable
        break
      case 'list':
        commonVariable = operand.variable
        listIndex = operand.index
        break
      case 'parameter':
        parameterKey = operand.key
        break
      case 'script':
        script = operand.script
        break
    }
    write('variable', variable)
    write('operation', operation)
    write('operand-type', operand.type)
    write('constant-value', constantValue)
    write('common-variable', commonVariable)
    write('list-index', listIndex)
    write('parameter-key', parameterKey)
    write('script', script)
    $('#setBoolean-variable').getFocus()
  },
  save: function () {
    const read = getElementReader('setBoolean')
    const variable = read('variable')
    if (VariableGetter.isNone(variable)) {
      return $('#setBoolean-variable').getFocus()
    }
    const operation = read('operation')
    const type = read('operand-type')
    let operand
    switch (type) {
      case 'constant': {
        const value = read('constant-value')
        operand = {type, value}
        break
      }
      case 'variable': {
        const variable = read('common-variable')
        if (VariableGetter.isNone(variable)) {
          return $('#setBoolean-common-variable').getFocus()
        }
        operand = {type, variable}
        break
      }
      case 'list': {
        const variable = read('common-variable')
        if (VariableGetter.isNone(variable)) {
          return $('#setBoolean-common-variable').getFocus()
        }
        const index = read('list-index')
        operand = {type, variable, index}
        break
      }
      case 'parameter': {
        const key = read('parameter-key')
        if (key === '') {
          return $('#setBoolean-parameter-key').getFocus()
        }
        operand = {type, key}
        break
      }
      case 'script': {
        const script = read('script').trim()
        if (script === '') {
          return $('#setBoolean-script').getFocus()
        }
        operand = {type, script}
        break
      }
    }
    Command.save({variable, operation, operand})
  },
}

// 设置数值
Command.cases.setNumber = {
  initialize: function () {
    $('#setNumber-confirm').on('click', this.save)

    // 绑定操作数列表
    $('#setNumber-operands').bind(NumberOperand)

    // 清理内存 - 窗口已关闭事件
    $('#setNumber').on('closed', event => {
      $('#setNumber-operands').clear()
    })
  },
  parseOperation: function (operation) {
    switch (operation) {
      case 'set': return ' = '
      case 'add': return ' += '
      case 'sub': return ' -= '
      case 'mul': return ' *= '
      case 'div': return ' /= '
      case 'mod': return ' %= '
    }
  },
  parseOperands: function (operands) {
    let expression = ''
    let currentPriority
    let nextPriority = false
    const length = operands.length
    for (let i = 0; i < length; i++) {
      const operand = operands[i]
      let operandName = NumberOperand.parseOperand(operand)
      if (i !== 0) switch (operand.operation.replace('()', '')) {
        case 'add': expression += Command.setOperatorColor(' + '); break
        case 'sub': expression += Command.setOperatorColor(' - '); break
        case 'mul': expression += Command.setOperatorColor(' * '); break
        case 'div': expression += Command.setOperatorColor(' / '); break
        case 'mod': expression += Command.setOperatorColor(' % '); break
      }
      currentPriority = nextPriority
      nextPriority = operands[i + 1]?.operation.includes('()')
      if (!currentPriority && nextPriority) {
        operandName = Token('(') + operandName
      }
      if (currentPriority && !nextPriority) {
        operandName = operandName + Token(')')
      }
      expression += operandName
    }
    return expression
  },
  parse: function ({variable, operation, operands}) {
    const varDesc = Command.parseVariable(variable, 'number', operation === 'set')
    const operator = Command.setOperatorColor(this.parseOperation(operation))
    const expression = this.parseOperands(operands)
    return [
      {color: 'variable'},
      {text: Local.get('command.setNumber.alias') + ' '},
      {color: 'restore'},
      {text: `${varDesc}${operator}${expression}`},
    ]
  },
  load: function ({
    variable  = {type: 'local', key: ''},
    operation = 'set',
    operands  = [{operation: 'add', type: 'constant', value: 0}],
  }) {
    const write = getElementWriter('setNumber')
    write('variable', variable)
    write('operation', operation)
    write('operands', operands.slice())
    $('#setNumber-variable').getFocus()
  },
  save: function () {
    const read = getElementReader('setNumber')
    const variable = read('variable')
    if (VariableGetter.isNone(variable)) {
      return $('#setNumber-variable').getFocus()
    }
    const operation = read('operation')
    const operands = read('operands')
    if (operands.length === 0) {
      return $('#setNumber-operands').getFocus()
    }
    operands[0].operation = 'add'
    Command.save({variable, operation, operands})
  },
}

// 设置字符串
Command.cases.setString = {
  initialize: function () {
    $('#setString-confirm').on('click', this.save)

    // 创建头部操作选项
    $('#setString-operation').loadItems([
      {name: 'Set', value: 'set'},
      {name: 'Add', value: 'add'},
    ])

    // 创建类型选项
    $('#setString-operand-type').loadItems([
      {name: 'Constant', value: 'constant'},
      {name: 'Variable', value: 'variable'},
      {name: 'Template String', value: 'template'},
      {name: 'String Method', value: 'string'},
      {name: 'Attribute Key', value: 'attribute'},
      {name: 'Enumeration', value: 'enum'},
      {name: 'Object', value: 'object'},
      {name: 'Element', value: 'element'},
      {name: 'List', value: 'list'},
      {name: 'Parameter', value: 'parameter'},
      {name: 'Script', value: 'script'},
      {name: 'Other', value: 'other'},
    ])

    // 设置类型关联元素
    $('#setString-operand-type').enableHiddenMode().relate([
      {case: 'constant', targets: [
        $('#setString-operand-common-value'),
      ]},
      {case: 'variable', targets: [
        $('#setString-operand-common-variable'),
      ]},
      {case: 'template', targets: [
        $('#setString-operand-common-value'),
      ]},
      {case: 'string', targets: [
        $('#setString-operand-string-method'),
        $('#setString-operand-common-variable'),
      ]},
      {case: 'attribute', targets: [
        $('#setString-operand-attribute-attributeId'),
      ]},
      {case: 'enum', targets: [
        $('#setString-operand-enum-stringId'),
      ]},
      {case: 'object', targets: [
        $('#setString-operand-object-property'),
      ]},
      {case: 'element', targets: [
        $('#setString-operand-element-property'),
        $('#setString-operand-element-element'),
      ]},
      {case: 'list', targets: [
        $('#setString-operand-common-variable'),
        $('#setString-operand-list-index'),
      ]},
      {case: 'parameter', targets: [
        $('#setString-operand-parameter-key'),
      ]},
      {case: 'script', targets: [
        $('#setString-operand-script'),
      ]},
      {case: 'other', targets: [
        $('#setString-operand-other-data'),
      ]},
    ])

    // 设置类型写入事件，切换变量输入框的过滤器
    $('#setString-operand-type').on('write', event => {
      let filter = 'all'
      switch (event.value) {
        case 'variable':
          filter = 'all'
          break
        case 'string':
          filter = 'string'
          break
        case 'object':
        case 'list':
          filter = 'object'
          break
      }
      $('#setString-operand-common-variable').filter = filter
    })

    // 创建字符串方法选项
    $('#setString-operand-string-method').loadItems([
      {name: 'Char', value: 'char'},
      {name: 'Slice', value: 'slice'},
      {name: 'Pad Start', value: 'pad-start'},
      {name: 'Replace', value: 'replace'},
      {name: 'Replace All', value: 'replace-all'},
    ])

    // 设置字符串方法关联元素
    $('#setString-operand-string-method').enableHiddenMode().relate([
      {case: 'char', targets: [
        $('#setString-operand-string-char-index'),
      ]},
      {case: 'slice', targets: [
        $('#setString-operand-string-slice-begin'),
        $('#setString-operand-string-slice-end'),
      ]},
      {case: 'pad-start', targets: [
        $('#setString-operand-string-pad-start-length'),
        $('#setString-operand-string-pad-start-pad'),
      ]},
      {case: ['replace', 'replace-all'], targets: [
        $('#setString-operand-string-replace-pattern'),
        $('#setString-operand-string-replace-replacement'),
      ]},
    ])

    // 创建对象属性选项
    $('#setString-operand-object-property').loadItems([
      {name: 'Actor - Team ID', value: 'actor-team-id'},
      {name: 'Actor - File ID', value: 'actor-file-id'},
      {name: 'Actor - Anim Motion Name', value: 'actor-animation-motion-name'},
      {name: 'Skill - File ID', value: 'skill-file-id'},
      {name: 'Trigger - File ID', value: 'trigger-file-id'},
      {name: 'State - File ID', value: 'state-file-id'},
      {name: 'Equipment - File ID', value: 'equipment-file-id'},
      {name: 'Equipment - Slot', value: 'equipment-slot'},
      {name: 'Item - File ID', value: 'item-file-id'},
      {name: 'File - ID', value: 'file-id'},
    ])

    // 设置对象属性关联元素
    $('#setString-operand-object-property').enableHiddenMode().relate([
      {case: ['actor-team-id', 'actor-file-id', 'actor-animation-motion-name'], targets: [
        $('#setString-operand-common-actor'),
      ]},
      {case: 'skill-file-id', targets: [
        $('#setString-operand-common-skill'),
      ]},
      {case: 'trigger-file-id', targets: [
        $('#setString-operand-common-trigger'),
      ]},
      {case: 'state-file-id', targets: [
        $('#setString-operand-common-state'),
      ]},
      {case: ['equipment-file-id', 'equipment-slot'], targets: [
        $('#setString-operand-common-equipment'),
      ]},
      {case: 'item-file-id', targets: [
        $('#setString-operand-common-item'),
      ]},
      {case: 'file-id', targets: [
        $('#setString-operand-object-fileId'),
      ]},
    ])

    // 创建元素属性选项
    $('#setString-operand-element-property').loadItems([
      {name: 'Text - Content', value: 'text-content'},
      {name: 'Text Box - Text', value: 'textBox-text'},
      {name: 'Dialog Box - Content', value: 'dialogBox-content'},
    ])

    // 创建其他数据选项
    $('#setString-operand-other-data').loadItems([
      {name: 'Event Trigger Key', value: 'trigger-key'},
      {name: 'Start Position - Scene ID', value: 'start-position-scene-id'},
      {name: 'Show Text - Content', value: 'showText-content'},
      {name: 'Show Choices - Content', value: 'showChoices-content'},
      {name: 'Parse Timestamp', value: 'parse-timestamp'},
      {name: 'Screenshot(Base64)', value: 'screenshot'},
      {name: 'Game Language', value: 'game-language'},
    ])

    // 设置其他数据关联元素
    $('#setString-operand-other-data').enableHiddenMode().relate([
      {case: 'showChoices-content', targets: [
        $('#setString-operand-showChoices-content-choiceIndex'),
      ]},
      {case: 'parse-timestamp', targets: [
        $('#setString-operand-parse-timestamp-variable'),
        $('#setString-operand-parse-timestamp-format'),
      ]},
      {case: 'screenshot', targets: [
        $('#setString-operand-screenshot-width'),
        $('#setString-operand-screenshot-height'),
      ]},
    ])
  },

  // 解析指令
  parse: function ({variable, operation, operand}) {
    const varDesc = Command.parseVariable(variable, 'string', operation === 'set')
    const operator = Command.setOperatorColor(this.parseOperation(operation))
    const expression = this.parseOperand(operand)
    return [
      {color: 'variable'},
      {text: Local.get('command.setString.alias') + ' '},
      {color: 'restore'},
      {text: `${varDesc}${operator}${expression}`},
    ]
  },

  // 加载数据
  load: function ({
    variable  = {type: 'local', key: ''},
    operation = 'set',
    operand   = {type: 'constant', value: ''},
  }) {
    // 写入数据
    let commonValue = ''
    let stringMethod = 'char'
    let commonVariable = {type: 'local', key: ''}
    let stringCharIndex = 0
    let stringSliceBegin = 0
    let stringSliceEnd = 0
    let stringPadStartLength = 2
    let stringPadStartPad = '0'
    let stringReplacePattern = ''
    let stringReplaceReplacement = ''
    let attributeId = ''
    let enumStringId = ''
    let objectProperty = 'actor-team-id'
    let elementProperty = 'text-content'
    let elementElement = {type: 'trigger'}
    let commonActor = {type: 'trigger'}
    let commonSkill = {type: 'trigger'}
    let commonTrigger = {type: 'trigger'}
    let commonState = {type: 'trigger'}
    let commonEquipment = {type: 'trigger'}
    let commonItem = {type: 'trigger'}
    let objectFileId = ''
    let listIndex = 0
    let parameterKey = ''
    let script = ''
    let otherData = 'trigger-key'
    let showChoicesIndex = 0
    let parseTimestampVariable = {type: 'local', key: ''}
    let parseTimestampFormat = '{Y}-{M}-{D} {h}:{m}:{s}'
    let screenshotWidth = 320
    let screenshotHeight = 180
    switch (operand.type) {
      case 'constant':
      case 'template':
        commonValue = operand.value
        break
      case 'variable':
        commonVariable = operand.variable
        break
      case 'string':
        stringMethod = operand.method
        commonVariable = operand.variable
        stringCharIndex = operand.index ?? stringCharIndex
        stringSliceBegin = operand.begin ?? stringSliceBegin
        stringSliceEnd = operand.end ?? stringSliceEnd
        stringPadStartLength = operand.length ?? stringPadStartLength
        stringPadStartPad = operand.pad ?? stringPadStartPad
        stringReplacePattern = operand.pattern ?? stringReplacePattern
        stringReplaceReplacement = operand.replacement ?? stringReplaceReplacement
        break
      case 'attribute':
        attributeId = operand.attributeId
        break
      case 'enum':
        enumStringId = operand.stringId
        break
      case 'object':
        objectProperty = operand.property
        commonActor = operand.actor ?? commonActor
        commonSkill = operand.skill ?? commonSkill
        commonTrigger = operand.trigger ?? commonTrigger
        commonState = operand.state ?? commonState
        commonEquipment = operand.equipment ?? commonEquipment
        commonItem = operand.item ?? commonItem
        objectFileId = operand.fileId ?? objectFileId
        break
      case 'element':
        elementProperty = operand.property
        elementElement = operand.element
        break
      case 'list':
        commonVariable = operand.variable
        listIndex = operand.index
        break
      case 'parameter':
        parameterKey = operand.key
        break
      case 'script':
        script = operand.script
        break
      case 'other':
        // 补丁：2023-1-18
        switch (operand.data) {
          case 'showChoices-content-0':
          case 'showChoices-content-1':
          case 'showChoices-content-2':
          case 'showChoices-content-3':
            operand.choiceIndex = parseInt(operand.data.slice(-1))
            operand.data = 'showChoices-content'
            break
        }
        otherData = operand.data
        showChoicesIndex = operand.choiceIndex ?? showChoicesIndex
        parseTimestampVariable = operand.variable ?? parseTimestampVariable
        parseTimestampFormat = operand.format ?? parseTimestampFormat
        screenshotWidth = operand.width ?? screenshotWidth
        screenshotHeight = operand.height ?? screenshotHeight
        break
    }
    const write = getElementWriter('setString')
    write('variable', variable)
    write('operation', operation)
    write('operand-type', operand.type)
    write('operand-common-value', commonValue)
    write('operand-string-method', stringMethod)
    write('operand-common-variable', commonVariable)
    write('operand-string-char-index', stringCharIndex)
    write('operand-string-slice-begin', stringSliceBegin)
    write('operand-string-slice-end', stringSliceEnd)
    write('operand-string-pad-start-length', stringPadStartLength)
    write('operand-string-pad-start-pad', stringPadStartPad)
    write('operand-string-replace-pattern', stringReplacePattern)
    write('operand-string-replace-replacement', stringReplaceReplacement)
    write('operand-attribute-attributeId', attributeId)
    write('operand-enum-stringId', enumStringId)
    write('operand-object-property', objectProperty)
    write('operand-element-property', elementProperty)
    write('operand-element-element', elementElement)
    write('operand-common-actor', commonActor)
    write('operand-common-skill', commonSkill)
    write('operand-common-trigger', commonTrigger)
    write('operand-common-state', commonState)
    write('operand-common-equipment', commonEquipment)
    write('operand-common-item', commonItem)
    write('operand-object-fileId', objectFileId)
    write('operand-list-index', listIndex)
    write('operand-parameter-key', parameterKey)
    write('operand-script', script)
    write('operand-other-data', otherData)
    write('operand-showChoices-content-choiceIndex', showChoicesIndex)
    write('operand-parse-timestamp-variable', parseTimestampVariable)
    write('operand-parse-timestamp-format', parseTimestampFormat)
    write('operand-screenshot-width', screenshotWidth)
    write('operand-screenshot-height', screenshotHeight)
    $('#setString-variable').getFocus()
  },

  // 保存数据
  save: function () {
    const read = getElementReader('setString')
    const variable = read('variable')
    if (VariableGetter.isNone(variable)) {
      return $('#setString-variable').getFocus()
    }
    const operation = read('operation')
    const type = read('operand-type')
    let operand
    switch (type) {
      case 'constant':
      case 'template': {
        const value = read('operand-common-value')
        operand = {type, value}
        break
      }
      case 'variable': {
        const variable = read('operand-common-variable')
        if (VariableGetter.isNone(variable)) {
          return $('#setString-operand-common-variable').getFocus()
        }
        operand = {type, variable}
        break
      }
      case 'string': {
        const method = read('operand-string-method')
        const variable = read('operand-common-variable')
        if (VariableGetter.isNone(variable)) {
          return $('#setString-operand-common-variable').getFocus()
        }
        switch (method) {
          case 'char': {
            const index = read('operand-string-char-index')
            operand = {type, method, variable, index}
            break
          }
          case 'slice': {
            const begin = read('operand-string-slice-begin')
            const end = read('operand-string-slice-end')
            operand = {type, method, variable, begin, end}
            break
          }
          case 'pad-start': {
            const length = read('operand-string-pad-start-length')
            const pad = read('operand-string-pad-start-pad')
            operand = {type, method, variable, length, pad}
            break
          }
          case 'replace':
          case 'replace-all': {
            const pattern = read('operand-string-replace-pattern')
            if (pattern === '') {
              return $('#setString-operand-string-replace-pattern').getFocus()
            }
            const replacement = read('operand-string-replace-replacement')
            operand = {type, method, variable, pattern, replacement}
            break
          }
        }
        break
      }
      case 'attribute': {
        const attributeId = read('operand-attribute-attributeId')
        if (attributeId === '') {
          return $('#setString-operand-attribute-attributeId').getFocus()
        }
        operand = {type, attributeId}
        break
      }
      case 'enum': {
        const stringId = read('operand-enum-stringId')
        if (stringId === '') {
          return $('#setString-operand-enum-stringId').getFocus()
        }
        operand = {type, stringId}
        break
      }
      case 'object': {
        const property = read('operand-object-property')
        switch (property) {
          case 'actor-team-id':
          case 'actor-file-id':
          case 'actor-animation-motion-name': {
            const actor = read('operand-common-actor')
            operand = {type, property, actor}
            break
          }
          case 'skill-file-id': {
            const skill = read('operand-common-skill')
            operand = {type, property, skill}
            break
          }
          case 'trigger-file-id': {
            const trigger = read('operand-common-trigger')
            operand = {type, property, trigger}
            break
          }
          case 'state-file-id': {
            const state = read('operand-common-state')
            operand = {type, property, state}
            break
          }
          case 'equipment-file-id':
          case 'equipment-slot': {
            const equipment = read('operand-common-equipment')
            operand = {type, property, equipment}
            break
          }
          case 'item-file-id': {
            const item = read('operand-common-item')
            operand = {type, property, item}
            break
          }
          case 'file-id': {
            const fileId = read('operand-object-fileId')
            if (fileId === '') {
              return $('#setString-operand-object-fileId').getFocus()
            }
            operand = {type, property, fileId}
            break
          }
        }
        break
      }
      case 'element': {
        const property = read('operand-element-property')
        const element = read('operand-element-element')
        operand = {type, property, element}
        break
      }
      case 'list': {
        const variable = read('operand-common-variable')
        const index = read('operand-list-index')
        if (VariableGetter.isNone(variable)) {
          return $('#setString-operand-common-variable').getFocus()
        }
        operand = {type, variable, index}
        break
      }
      case 'parameter': {
        const key = read('operand-parameter-key')
        if (key === '') {
          return $('#setString-operand-parameter-key').getFocus()
        }
        operand = {type, key}
        break
      }
      case 'script': {
        const script = read('operand-script').trim()
        if (script === '') {
          return $('#setString-operand-script').getFocus()
        }
        operand = {type, script}
        break
      }
      case 'other': {
        const data = read('operand-other-data')
        switch (data) {
          case 'showChoices-content': {
            const choiceIndex = read('operand-showChoices-content-choiceIndex')
            operand = {type, data, choiceIndex}
            break
          }
          case 'parse-timestamp': {
            const variable = read('operand-parse-timestamp-variable')
            const format = read('operand-parse-timestamp-format')
            if (VariableGetter.isNone(variable)) {
              return $('#setString-operand-parse-timestamp-variable').getFocus()
            }
            operand = {type, data, variable, format}
            break
          }
          case 'screenshot': {
            const width = read('operand-screenshot-width')
            const height = read('operand-screenshot-height')
            operand = {type, data, width, height}
            break
          }
          default:
            operand = {type, data}
            break
        }
        break
      }
    }
    Command.save({variable, operation, operand})
  },

  // 解析字符串操作
  parseOperation: function (operation) {
    switch (operation) {
      case 'set': return ' = '
      case 'add': return ' += '
    }
  },

  // 解析字符串方法
  parseStringMethod: function (operand) {
    const method = operand.method
    const variable = operand.variable
    const methodName = Local.get('command.setString.string.' + method)
    const varName = Command.parseVariable(variable, 'string')
    switch (method) {
      case 'char': {
        const index = Command.parseVariableNumber(operand.index)
        return methodName + Token('(') + varName + Token(', ') + index + Token(')')
      }
      case 'slice': {
        const begin = Command.parseVariableNumber(operand.begin)
        const end = Command.parseVariableNumber(operand.end)
        return methodName + Token('(') + varName + Token(', ') + begin + Token(', ') + end + Token(')')
      }
      case 'pad-start': {
        const length = Command.setNumberColor(operand.length)
        const pad = Command.setStringColor(operand.pad)
        return methodName + Token('(') + varName + Token(', ') + length + Token(', ') + pad + Token(')')
      }
      case 'replace':
      case 'replace-all': {
        const pattern = Command.parseVariableString(operand.pattern)
        const replacement = Command.parseVariableString(operand.replacement)
        return methodName + Token('(') + varName + Token(', ') + pattern + Token(', ') + replacement + Token(')')
      }
    }
  },

  // 解析对象属性
  parseObjectProperty: function (operand) {
    const property = Local.get('command.setString.object.' + operand.property)
    switch (operand.property) {
      case 'actor-team-id':
      case 'actor-file-id':
      case 'actor-animation-motion-name':
        return Command.parseActor(operand.actor) + Token(' -> ') + property.replace('.', Token('.'))
      case 'skill-file-id':
        return Command.parseSkill(operand.skill) + Token(' -> ') + property
      case 'trigger-file-id':
        return Command.parseTrigger(operand.trigger) + Token(' -> ') + property
      case 'state-file-id':
        return Command.parseState(operand.state) + Token(' -> ') + property
      case 'equipment-file-id':
      case 'equipment-slot':
        return Command.parseEquipment(operand.equipment) + Token(' -> ') + property
      case 'item-file-id':
        return Command.parseItem(operand.item) + Token(' -> ') + property
      case 'file-id':
        return Command.parseFileName(operand.fileId) + Token(' -> ') + property
    }
  },

  // 解析元素属性
  parseElementProperty: function (operand) {
    const element = Command.parseElement(operand.element)
    const property = Local.get('command.setString.element.' + operand.property)
    return element + Token(' -> ') + property.replace('.', Token('.'))
  },

  // 解析其他数据
  parseOther: function (operand) {
    const label = Local.get('command.setString.other.' + operand.data).replace('.', Token('.'))
    switch (operand.data) {
      case 'trigger-key':
      case 'start-position-scene-id':
      case 'showText-content':
      case 'game-language':
        return label
      // 补丁：2023-1-18
      case 'showChoices-content-0':
      case 'showChoices-content-1':
      case 'showChoices-content-2':
      case 'showChoices-content-3': {
        const label = Local.get('command.setString.other.showChoices-content')
        return label + Token('[') + Command.setNumberColor(operand.data.slice(-1)) + Token(']')
      }
      case 'showChoices-content':
        return label + Token('[') + Command.parseVariableNumber(operand.choiceIndex) + Token(']')
      case 'parse-timestamp': {
        const variable = Command.parseVariable(operand.variable, 'number')
        const format = Command.parseVariableString(operand.format)
        return label + Token('(') + variable + Token(', ') + format + Token(')')
      }
      case 'screenshot': {
        const width = Command.setNumberColor(operand.width)
        const height = Command.setNumberColor(operand.height)
        return label + Token('(') + width + Token(', ') + height + Token(')')
      }
    }
  },

  // 解析操作数
  parseOperand: function (operand) {
    switch (operand.type) {
      case 'constant':
        return Command.setStringColor(`"${Command.parseMultiLineString(operand.value)}"`)
      case 'template':
        return Command.parseVariableTemplate(operand.value)
      case 'variable':
        return Command.parseVariable(operand.variable, 'string')
      case 'string':
        return this.parseStringMethod(operand)
      case 'attribute':
        return Command.parseAttributeTag(operand.attributeId, 'string')
      case 'enum':
        return Command.parseEnumStringTag(operand.stringId)
      case 'object':
        return this.parseObjectProperty(operand)
      case 'element':
        return this.parseElementProperty(operand)
      case 'list':
        return Command.parseListItem(operand.variable, operand.index)
      case 'parameter':
        return Command.parseParameter(operand.key)
      case 'script':
        return operand.script
      case 'other':
        return this.parseOther(operand)
    }
  },
}

// 设置对象
Command.cases.setObject = {
  initialize: function () {
    $('#setObject-confirm').on('click', this.save)

    // 创建类型选项
    $('#setObject-operand-type').loadItems([
      {name: 'None', value: 'none'},
      {name: 'Actor', value: 'actor'},
      {name: 'Skill', value: 'skill'},
      {name: 'State', value: 'state'},
      {name: 'Equipment', value: 'equipment'},
      {name: 'Item', value: 'item'},
      {name: 'Trigger', value: 'trigger'},
      {name: 'Light', value: 'light'},
      {name: 'Object', value: 'object'},
      {name: 'Element', value: 'element'},
      {name: 'Variable', value: 'variable'},
      {name: 'List', value: 'list'},
    ])

    // 设置类型关联元素
    $('#setObject-operand-type').enableHiddenMode().relate([
      {case: 'actor', targets: [
        $('#setObject-operand-actor'),
      ]},
      {case: 'skill', targets: [
        $('#setObject-operand-skill'),
      ]},
      {case: 'state', targets: [
        $('#setObject-operand-state'),
      ]},
      {case: 'equipment', targets: [
        $('#setObject-operand-equipment'),
      ]},
      {case: 'item', targets: [
        $('#setObject-operand-item'),
      ]},
      {case: 'trigger', targets: [
        $('#setObject-operand-trigger'),
      ]},
      {case: 'light', targets: [
        $('#setObject-operand-light'),
      ]},
      {case: 'object', targets: [
        $('#setObject-operand-object'),
      ]},
      {case: 'element', targets: [
        $('#setObject-operand-element'),
      ]},
      {case: 'variable', targets: [
        $('#setObject-operand-variable'),
      ]},
      {case: 'list', targets: [
        $('#setObject-operand-variable'),
        $('#setObject-operand-list-index'),
      ]},
    ])
  },
  parseOperand: function (operand) {
    switch (operand.type) {
      case 'none':
        return Token('null')
      case 'actor':
        return Command.parseActor(operand.actor)
      case 'skill':
        return Command.parseSkill(operand.skill)
      case 'state':
        return Command.parseState(operand.state)
      case 'equipment':
        return Command.parseEquipment(operand.equipment)
      case 'item':
        return Command.parseItem(operand.item)
      case 'trigger':
        return Command.parseTrigger(operand.trigger)
      case 'light':
        return Command.parseLight(operand.light)
      case 'object':
        return Command.parseObject(operand.object)
      case 'element':
        return Command.parseElement(operand.element)
      case 'variable':
        return Command.parseVariable(operand.variable, 'object')
      case 'list':
        return Command.parseListItem(operand.variable, operand.index)
    }
  },
  parse: function ({variable, operand}) {
    const varDesc = Command.parseVariable(variable, 'object', true)
    const object = this.parseOperand(operand)
    return [
      {color: 'variable'},
      {text: Local.get('command.setObject.alias') + ' '},
      {color: 'restore'},
      {text: `${varDesc} ${Token('=')} ${object}`},
    ]
  },
  load: function ({
    variable  = {type: 'local', key: ''},
    operand   = {type: 'none'},
  }) {
    const write = getElementWriter('setObject')
    let operandActor = {type: 'trigger'}
    let operandSkill = {type: 'trigger'}
    let operandState = {type: 'trigger'}
    let operandEquipment = {type: 'trigger'}
    let operandItem = {type: 'trigger'}
    let operandTrigger = {type: 'trigger'}
    let operandLight = {type: 'trigger'}
    let operandObject = {type: 'trigger'}
    let operandElement = {type: 'trigger'}
    let operandVariable = {type: 'local', key: ''}
    let operandListIndex = 0
    switch (operand.type) {
      case 'actor':
        operandActor = operand.actor
        break
      case 'skill':
        operandSkill = operand.skill
        break
      case 'state':
        operandState = operand.state
        break
      case 'equipment':
        operandEquipment = operand.equipment
        break
      case 'item':
        operandItem = operand.item
        break
      case 'trigger':
        operandTrigger = operand.trigger
        break
      case 'light':
        operandLight = operand.light
        break
      case 'object':
        operandObject = operand.object
        break
      case 'element':
        operandElement = operand.element
        break
      case 'variable':
        operandVariable = operand.variable
        break
      case 'list':
        operandVariable = operand.variable
        operandListIndex = operand.index
        break
    }
    write('variable', variable)
    write('operand-type', operand.type)
    write('operand-actor', operandActor)
    write('operand-skill', operandSkill)
    write('operand-state', operandState)
    write('operand-equipment', operandEquipment)
    write('operand-item', operandItem)
    write('operand-trigger', operandTrigger)
    write('operand-light', operandLight)
    write('operand-object', operandObject)
    write('operand-element', operandElement)
    write('operand-variable', operandVariable)
    write('operand-list-index', operandListIndex)
    $('#setObject-variable').getFocus()
  },
  save: function () {
    const read = getElementReader('setObject')
    const variable = read('variable')
    if (VariableGetter.isNone(variable)) {
      return $('#setObject-variable').getFocus()
    }
    const type = read('operand-type')
    let operand
    switch (type) {
      case 'none':
        operand = {type}
        break
      case 'actor': {
        const actor = read('operand-actor')
        operand = {type, actor}
        break
      }
      case 'skill': {
        const skill = read('operand-skill')
        operand = {type, skill}
        break
      }
      case 'state': {
        const state = read('operand-state')
        operand = {type, state}
        break
      }
      case 'equipment': {
        const equipment = read('operand-equipment')
        operand = {type, equipment}
        break
      }
      case 'item': {
        const item = read('operand-item')
        operand = {type, item}
        break
      }
      case 'trigger': {
        const trigger = read('operand-trigger')
        operand = {type, trigger}
        break
      }
      case 'light': {
        const light = read('operand-light')
        operand = {type, light}
        break
      }
      case 'object': {
        const object = read('operand-object')
        operand = {type, object}
        break
      }
      case 'element': {
        const element = read('operand-element')
        operand = {type, element}
        break
      }
      case 'variable': {
        const variable = read('operand-variable')
        if (VariableGetter.isNone(variable)) {
          return $('#setObject-operand-variable').getFocus()
        }
        operand = {type, variable}
        break
      }
      case 'list': {
        const variable = read('operand-variable')
        if (VariableGetter.isNone(variable)) {
          return $('#setObject-operand-variable').getFocus()
        }
        const index = read('operand-list-index')
        operand = {type, variable, index}
        break
      }
    }
    Command.save({variable, operand})
  },
}

// 设置列表
Command.cases.setList = {
  initialize: function () {
    $('#setList-confirm').on('click', this.save)

    // 创建操作选项
    $('#setList-operation').loadItems([
      {name: 'Set to Empty', value: 'set-empty'},
      {name: 'Set Numbers', value: 'set-numbers'},
      {name: 'Set Strings', value: 'set-strings'},
      {name: 'Set Boolean', value: 'set-boolean'},
      {name: 'Set Number', value: 'set-number'},
      {name: 'Set String', value: 'set-string'},
      {name: 'Set Variable', value: 'set-variable'},
      {name: 'Split String', value: 'split-string'},
      {name: 'Push', value: 'push'},
      {name: 'Remove', value: 'remove'},
      {name: 'Get Attribute Names', value: 'get-attribute-names'},
      {name: 'Get Attribute Keys', value: 'get-attribute-keys'},
      {name: 'Get Enumeration Names', value: 'get-enum-names'},
      {name: 'Get Enumeration Values', value: 'get-enum-values'},
      {name: 'Get Actor Targets', value: 'get-actor-targets'},
    ])

    // 设置操作关联元素
    $('#setList-operation').enableHiddenMode().relate([
      {case: 'set-numbers', targets: [
        $('#setList-numbers'),
      ]},
      {case: 'set-strings', targets: [
        $('#setList-strings'),
      ]},
      {case: 'set-boolean', targets: [
        $('#setList-index'),
        $('#setList-boolean'),
      ]},
      {case: 'set-number', targets: [
        $('#setList-index'),
        $('#setList-number'),
      ]},
      {case: 'set-string', targets: [
        $('#setList-index'),
        $('#setList-string'),
      ]},
      {case: 'set-variable', targets: [
        $('#setList-index'),
        $('#setList-operand'),
      ]},
      {case: 'split-string', targets: [
        $('#setList-operand'),
        $('#setList-separator'),
      ]},
      {case: ['push', 'remove'], targets: [
        $('#setList-operand'),
      ]},
      {case: ['get-attribute-names', 'get-attribute-keys'], targets: [
        $('#setList-attribute-groupId'),
      ]},
      {case: ['get-enum-names', 'get-enum-values'], targets: [
        $('#setList-enum-groupId'),
      ]},
      {case: 'get-actor-targets', targets: [
        $('#setList-actor'),
      ]},
    ])

    // 创建布尔值常量选项
    $('#setList-boolean').loadItems([
      {name: 'False', value: false},
      {name: 'True', value: true},
    ])
  },
  parse: function ({variable, operation, list, index, constant, operand, separator, groupId, actor}) {
    let info
    let isLeftValue = true
    switch (operation) {
      case 'set-boolean':
      case 'set-number':
      case 'set-string':
      case 'set-variable':
      case 'push':
      case 'remove':
        isLeftValue = false
        break
    }
    const varName = Command.parseVariable(variable, 'object', isLeftValue)
    const equal = Command.setOperatorColor('=')
    switch (operation) {
      case 'set-empty':
        info = `${varName} ${equal} ${Token('[') + Token(']')}`
        break
      case 'set-numbers': {
        let values = ''
        if (list.length !== 0) {
          for (const number of list) {
            if (values !== '') {
              values += Token(', ')
            }
            values += Command.setNumberColor(number)
          }
        }
        info = `${varName} ${equal} ${Token('[') + values + Token(']')}`
        break
      }
      case 'set-strings': {
        let values = ''
        if (list.length !== 0) {
          for (const string of list) {
            if (values !== '') {
              values += Token(', ')
            }
            values += Command.setStringColor(`"${string}"`)
          }
          values = Command.parseMultiLineString(values)
        }
        info = `${varName} ${equal} ${Token('[') + values + Token(']')}`
        break
      }
      case 'set-boolean':
        info = `${varName}${Token('[') + Command.parseVariableNumber(index) + Token(']')} ${equal} ${Command.setBooleanColor(constant)}`
        break
      case 'set-number':
        info = `${varName}${Token('[') + Command.parseVariableNumber(index) + Token(']')} ${equal} ${Command.setNumberColor(constant)}`
        break
      case 'set-string': {
        const string = Command.setStringColor('"' + Command.parseMultiLineString(constant) + '"')
        info = `${varName}${Token('[') + Command.parseVariableNumber(index) + Token(']')} ${equal} ${string}`
        break
      }
      case 'set-variable':
        info = `${varName}${Token('[') + Command.parseVariableNumber(index) + Token(']')} ${equal} ${Command.parseVariable(operand, 'any')}`
        break
      case 'split-string': {
        const label = Local.get('command.setList.split-string')
        const text1 = Command.parseVariable(operand, 'string')
        const text2 = Command.parseVariableString(separator)
        const comma = Command.setDelimiterColor(', ')
        info = `${varName} ${equal} ${label}${Token('(')}${text1}${comma}${text2}${Token(')')}`
        break
      }
      case 'push':
        info = `${varName} ${Command.setOperatorColor('+=')} ${Command.parseVariable(operand, 'any')}`
        break
      case 'remove':
        info = `${varName} ${Command.setOperatorColor('-=')} ${Command.parseVariable(operand, 'any')}`
        break
      case 'get-attribute-names':
      case 'get-attribute-keys': {
        const label = Local.get('command.setList.' + operation)
        const group = Command.parseAttributeGroup(groupId)
        info = `${varName} ${equal} ${label}${Token('(')}${group}${Token(')')}`
        break
      }
      case 'get-enum-names':
      case 'get-enum-values': {
        const label = Local.get('command.setList.' + operation)
        const group = Command.parseEnumGroup(groupId)
        info = `${varName} ${equal} ${label}${Token('(')}${group}${Token(')')}`
        break
      }
      case 'get-actor-targets': {
        const label = Local.get('command.setList.' + operation)
        const actorInfo = Command.parseActor(actor)
        info = `${varName} ${equal} ${label}${Token('(')}${actorInfo}${Token(')')}`
        break
      }
    }
    return [
      {color: 'variable'},
      {text: Local.get('command.setList.alias') + ' '},
      {color: 'restore'},
      {text: info},
    ]
  },
  load: function ({
    variable  = {type: 'local', key: ''},
    operation = 'set-empty',
    list      = [],
    index     = 0,
    constant  = 0,
    operand   = {type: 'local', key: ''},
    separator = '',
    groupId   = '',
    actor     = {type: 'trigger'},
  }) {
    let numbers = []
    let strings = []
    let boolean = false
    let number = 0
    let string = ''
    let attrGroupId = ''
    let enumGroupId = ''
    switch (operation) {
      case 'set-numbers':
        numbers = list
        break
      case 'set-strings':
        strings = list
        break
      case 'set-boolean':
        boolean = constant
        break
      case 'set-number':
        number = constant
        break
      case 'set-string':
        string = constant
        break
      case 'get-attribute-names':
      case 'get-attribute-keys':
        attrGroupId = groupId
        break
      case 'get-enum-names':
      case 'get-enum-values':
        enumGroupId = groupId
        break
    }
    const write = getElementWriter('setList')
    write('variable', variable)
    write('operation', operation)
    write('numbers', numbers)
    write('strings', strings)
    write('index', index)
    write('boolean', boolean)
    write('number', number)
    write('string', string)
    write('operand', operand)
    write('separator', separator)
    write('attribute-groupId', attrGroupId)
    write('enum-groupId', enumGroupId)
    write('actor', actor)
    $('#setList-variable').getFocus()
  },
  save: function () {
    const read = getElementReader('setList')
    const variable = read('variable')
    if (VariableGetter.isNone(variable)) {
      return $('#setList-variable').getFocus()
    }
    const operation = read('operation')
    switch (operation) {
      case 'set-empty':
        Command.save({variable, operation})
        break
      case 'set-numbers': {
        const list = read('numbers')
        if (list.length === 0) {
          return $('#setList-numbers').getFocus()
        }
        Command.save({variable, operation, list})
        break
      }
      case 'set-strings': {
        const list = read('strings')
        if (list.length === 0) {
          return $('#setList-strings').getFocus()
        }
        Command.save({variable, operation, list})
        break
      }
      case 'set-boolean': {
        const index = read('index')
        const constant = read('boolean')
        Command.save({variable, operation, index, constant})
        break
      }
      case 'set-number': {
        const index = read('index')
        const constant = read('number')
        Command.save({variable, operation, index, constant})
        break
      }
      case 'set-string': {
        const index = read('index')
        const constant = read('string')
        Command.save({variable, operation, index, constant})
        break
      }
      case 'set-variable': {
        const index = read('index')
        const operand = read('operand')
        if (VariableGetter.isNone(operand)) {
          return $('#setList-operand').getFocus()
        }
        Command.save({variable, operation, index, operand})
        break
      }
      case 'split-string': {
        const operand = read('operand')
        if (VariableGetter.isNone(operand)) {
          return $('#setList-operand').getFocus()
        }
        const separator = read('separator')
        Command.save({variable, operation, operand, separator})
        break
      }
      case 'push':
      case 'remove': {
        const operand = read('operand')
        if (VariableGetter.isNone(operand)) {
          return $('#setList-operand').getFocus()
        }
        Command.save({variable, operation, operand})
        break
      }
      case 'get-attribute-names':
      case 'get-attribute-keys': {
        const groupId = read('attribute-groupId')
        if (groupId === '') {
          return $('#setList-attribute-groupId').getFocus()
        }
        Command.save({variable, operation, groupId})
        break
      }
      case 'get-enum-names':
      case 'get-enum-values': {
        const groupId = read('enum-groupId')
        if (groupId === '') {
          return $('#setList-enum-groupId').getFocus()
        }
        Command.save({variable, operation, groupId})
        break
      }
      case 'get-actor-targets': {
        const actor = read('actor')
        Command.save({variable, operation, actor})
        break
      }
    }
  },
}

// 删除变量
Command.cases.deleteVariable = {
  initialize: function () {
    $('#deleteVariable-confirm').on('click', this.save)
  },
  parse: function ({variable}) {
    return [
      {color: 'variable'},
      {text: Local.get('command.deleteVariable.alias') + ' '},
      {color: 'restore'},
      {text: Command.parseVariable(variable, 'any')},
    ]
  },
  load: function ({
    variable = {type: 'local', key: ''},
  }) {
    $('#deleteVariable-variable').write(variable)
    $('#deleteVariable-variable').getFocus()
  },
  save: function () {
    const elVariable = $('#deleteVariable-variable')
    const variable = elVariable.read()
    if (VariableGetter.isNone(variable)) {
      return elVariable.getFocus()
    }
    Command.save({variable})
  },
}

// 分支条件
Command.cases.if = {
  elseCommands: null,
  initialize: function () {
    $('#if-confirm').on('click', this.save)

    // 绑定分支列表
    $('#if-branches').bind(IfBranch)

    // 绑定条件列表
    $('#if-branch-conditions').bind(IfCondition)

    // 清理内存 - 窗口已关闭事件
    $('#if').on('closed', event => {
      this.elseCommands = null
      $('#if-branches').clear()
    })
  },
  parse: function ({branches, elseCommands}) {
    const contents = [
      {fold: true},
    ]
    const textIf = Local.get('command.if')
    for (const branch of branches) {
      contents.push(
        {color: 'flow'},
        {text: textIf + ' '},
        {color: 'normal'},
        {text: IfBranch.parse(branch)},
        {children: branch.commands},
      )
    }
    if (elseCommands) {
      contents.push(
        {color: 'flow'},
        {text: Local.get('command.if.else')},
        {children: elseCommands},
      )
    }
    contents.push(
      {color: 'flow'},
      {text: Local.get('command.if.end')},
    )
    return contents
  },
  load: function ({
    branches      = [],
    elseCommands  = null,
  }) {
    const write = getElementWriter('if')
    write('branches', branches.slice())
    write('else', !!elseCommands)
    Command.cases.if.elseCommands = elseCommands
    $('#if-branches').getFocus()
  },
  save: function () {
    const read = getElementReader('if')
    const branches = read('branches')
    if (branches.length === 0) {
      return $('#if-branches').getFocus()
    }
    switch (read('else')) {
      case true: {
        const elseCommands = Command.cases.if.elseCommands ?? []
        Command.save({branches, elseCommands})
        break
      }
      case false:
        Command.save({branches})
        break
    }
  },
}

// 匹配
Command.cases.switch = {
  defaultCommands: null,
  initialize: function () {
    $('#switch-confirm').on('click', this.save)

    // 绑定分支列表
    $('#switch-branches').bind(SwitchBranch)

    // 绑定条件列表
    $('#switch-branch-conditions').bind(SwitchCondition)

    // 清理内存 - 窗口已关闭事件
    $('#switch').on('closed', event => {
      this.defaultCommands = null
      $('#switch-branches').clear()
    })
  },
  parse: function ({variable, branches, defaultCommands}) {
    const contents = [
      {fold: true},
      {color: 'flow'},
      {text: Local.get('command.switch') + ' '},
      {color: 'normal'},
      {text: Command.parseVariable(variable, 'any')},
      {break: true},
    ]
    const textCase = Local.get('command.switch.case')
    for (const branch of branches) {
      contents.push(
        {color: 'flow'},
        {text: textCase + ' '},
        {color: 'normal'},
        {text: SwitchBranch.parse(branch)},
        {children: branch.commands},
      )
    }
    if (defaultCommands) {
      contents.push(
        {color: 'flow'},
        {text: Local.get('command.switch.default')},
        {children: defaultCommands},
      )
    }
    contents.push(
      {color: 'flow'},
      {text: Local.get('command.switch.end')},
    )
    return contents
  },
  load: function ({
    variable        = {type: 'local', key: ''},
    branches        = [],
    defaultCommands = null,
  }) {
    const write = getElementWriter('switch')
    write('variable', variable)
    write('branches', branches.slice())
    write('default', !!defaultCommands)
    Command.cases.switch.defaultCommands = defaultCommands
    $('#switch-variable').getFocus()
  },
  save: function () {
    const read = getElementReader('switch')
    const variable = read('variable')
    if (VariableGetter.isNone(variable)) {
      return $('#switch-variable').getFocus()
    }
    const branches = read('branches')
    if (branches.length === 0) {
      return $('#switch-branches').getFocus()
    }
    switch (read('default')) {
      case true: {
        const defaultCommands = Command.cases.switch.defaultCommands ?? []
        Command.save({variable, branches, defaultCommands})
        break
      }
      case false:
        Command.save({variable, branches})
        break
    }
  },
}

// 循环
Command.cases.loop = {
  commands: null,
  initialize: function () {
    $('#loop-confirm').on('click', this.save)

    // 绑定条件列表
    $('#loop-conditions').bind(IfCondition)

    // 创建模式选项
    $('#loop-mode').loadItems([
      {name: 'Meet All', value: 'all'},
      {name: 'Meet Any', value: 'any'},
    ])

    // 清理内存 - 窗口已关闭事件
    $('#loop').on('closed', event => {
      this.commands = null
      $('#loop-conditions').clear()
    })
  },
  parse: function ({mode, conditions, commands}) {
    const contents = [
      {fold: true},
      {color: 'flow'},
    ]
    if (conditions.length !== 0) {
      const condition = IfBranch.parse({mode, conditions})
      contents.push(
        {text: Local.get('command.loop.while')},
        {color: 'restore'},
        {text: ' ' + condition},
      )
    } else {
      contents.push(
        {text: Local.get('command.loop')},
      )
    }
    contents.push(
      {children: commands},
      {color: 'flow'},
      {text: Local.get('command.loop.end')},
    )
    return contents
  },
  load: function ({
    mode        = 'all',
    conditions  = [],
    commands    = [],
  }) {
    const write = getElementWriter('loop')
    write('mode', mode)
    write('conditions', conditions.slice())
    Command.cases.loop.commands = commands
    $('#loop-conditions').getFocus()
  },
  save: function () {
    const read = getElementReader('loop')
    const mode = read('mode')
    const conditions = read('conditions')
    const commands = Command.cases.loop.commands
    Command.save({mode, conditions, commands})
  },
}

// 遍历
Command.cases.forEach = {
  commands: null,
  initialize: function () {
    $('#forEach-confirm').on('click', this.save)

    // 创建数据选项
    $('#forEach-data').loadItems([
      {name: 'List', value: 'list'},
      {name: 'Skill', value: 'skill'},
      {name: 'State', value: 'state'},
      {name: 'Equipment', value: 'equipment'},
      {name: 'Inventory', value: 'inventory'},
      {name: 'Element', value: 'element'},
      {name: 'Party Member', value: 'member'},
      {name: 'Attribute Key', value: 'attribute'},
      {name: 'Enumeration Value', value: 'enum'},
      {name: 'Save Data', value: 'save'},
      {name: 'Touch Point', value: 'touch'},
      {name: 'Changed Touch Point', value: 'changed-touch'},
    ])

    // 设置数据关联元素
    $('#forEach-data').enableHiddenMode().relate([
      {case: 'list', targets: [
        $('#forEach-list'),
        $('#forEach-variable'),
      ]},
      {case: ['skill', 'state', 'equipment', 'inventory'], targets: [
        $('#forEach-actor'),
        $('#forEach-variable'),
      ]},
      {case: 'element', targets: [
        $('#forEach-element'),
        $('#forEach-variable'),
      ]},
      {case: 'member', targets: [
        $('#forEach-variable'),
      ]},
      {case: 'attribute', targets: [
        $('#forEach-attribute-groupId'),
        $('#forEach-variable'),
      ]},
      {case: 'enum', targets: [
        $('#forEach-enum-groupId'),
        $('#forEach-variable'),
      ]},
      {case: 'save', targets: [
        $('#forEach-saveIndex'),
      ]},
      {case: ['touch', 'changed-touch'], targets: [
        $('#forEach-touchId'),
      ]},
    ])

    // 清理内存 - 窗口已关闭事件
    $('#forEach').on('closed', event => {
      this.commands = null
    })
  },
  parse: function ({data, list, actor, element, groupId, variable, saveIndex, touchId, commands}) {
    const dataInfo = Local.get('command.forEach.' + data)
    const words = Command.words
    switch (data) {
      case 'list': {
        const varName = Command.parseVariable(variable, 'any', true)
        const listName = Command.parseVariable(list, 'object')
        words.push(varName + Token(' = ') + listName + Token(' -> ') + dataInfo)
        break
      }
      case 'skill':
      case 'state':
      case 'equipment':
      case 'inventory': {
        const varName = Command.parseVariable(variable, 'object', true)
        const actorInfo = Command.parseActor(actor)
        words.push(varName + Token(' = ') + actorInfo + Token(' -> ') + dataInfo)
        break
      }
      case 'element': {
        const varName = Command.parseVariable(variable, 'object', true)
        const elInfo = Command.parseElement(element)
        words.push(varName + Token(' = ') + elInfo + Token(' -> ') + dataInfo)
        break
      }
      case 'member': {
        const varName = Command.parseVariable(variable, 'object', true)
        words.push(varName + Token(' = ') + dataInfo)
        break
      }
      case 'attribute': {
        const varName = Command.parseVariable(variable, 'string', true)
        const group = Command.parseAttributeGroup(groupId)
        words.push(varName + Token(' = ') + group + Token(' -> ') + dataInfo)
        break
      }
      case 'enum': {
        const varName = Command.parseVariable(variable, 'string', true)
        const group = Command.parseEnumGroup(groupId)
        words.push(varName + Token(' = ') + group + Token(' -> ') + dataInfo)
        break
      }
      case 'save': {
        const varName = Command.parseVariable(saveIndex, 'number', true)
        words.push(Token('{') + varName + Command.setDelimiterColor(', ...}') + Token(' = ') + dataInfo)
        break
      }
      case 'touch':
      case 'changed-touch': {
        const varName = Command.parseVariable(touchId, 'number', true)
        words.push(varName + Token(' = ') + dataInfo)
        break
      }
    }
    return [
      {fold: true},
      {color: 'flow'},
      {text: Local.get('command.forEach') + ' '},
      {color: 'restore'},
      {text: words.join()},
      {children: commands},
      {color: 'flow'},
      {text: Local.get('command.forEach.end')},
    ]
  },
  load: function ({
    data      = 'list',
    list      = {type: 'local', key: ''},
    actor     = {type: 'trigger'},
    element   = {type: 'trigger'},
    groupId   = '',
    variable  = {type: 'local', key: ''},
    saveIndex = {type: 'local', key: ''},
    touchId   = {type: 'local', key: ''},
    commands  = [],
  }) {
    let attrGroupId = ''
    let enumGroupId = ''
    switch (data) {
      case 'attribute':
        attrGroupId = groupId
        break
      case 'enum':
        enumGroupId = groupId
        break
    }
    const write = getElementWriter('forEach')
    write('data', data)
    write('list', list)
    write('actor', actor)
    write('element', element)
    write('attribute-groupId', attrGroupId)
    write('enum-groupId', enumGroupId)
    write('variable', variable)
    write('saveIndex', saveIndex)
    write('touchId', touchId)
    Command.cases.forEach.commands = commands
    $('#forEach-data').getFocus()
  },
  save: function () {
    const read = getElementReader('forEach')
    const data = read('data')
    const commands = Command.cases.forEach.commands
    switch (data) {
      case 'list': {
        const list = read('list')
        if (VariableGetter.isNone(list)) {
          return $('#forEach-list').getFocus()
        }
        const variable = read('variable')
        if (VariableGetter.isNone(variable)) {
          return $('#forEach-variable').getFocus()
        }
        Command.save({data, list, variable, commands})
        break
      }
      case 'skill':
      case 'state':
      case 'equipment':
      case 'inventory': {
        const actor = read('actor')
        const variable = read('variable')
        if (VariableGetter.isNone(variable)) {
          return $('#forEach-variable').getFocus()
        }
        Command.save({data, actor, variable, commands})
        break
      }
      case 'element': {
        const element = read('element')
        const variable = read('variable')
        if (VariableGetter.isNone(variable)) {
          return $('#forEach-variable').getFocus()
        }
        Command.save({data, element, variable, commands})
        break
      }
      case 'member':
        const variable = read('variable')
        if (VariableGetter.isNone(variable)) {
          return $('#forEach-variable').getFocus()
        }
        Command.save({data, variable, commands})
        break
      case 'attribute': {
        const groupId = read('attribute-groupId')
        if (groupId === '') {
          return $('#forEach-attribute-groupId').getFocus()
        }
        const variable = read('variable')
        if (VariableGetter.isNone(variable)) {
          return $('#forEach-variable').getFocus()
        }
        Command.save({data, groupId, variable, commands})
        break
      }
      case 'enum': {
        const groupId = read('enum-groupId')
        if (groupId === '') {
          return $('#forEach-enum-groupId').getFocus()
        }
        const variable = read('variable')
        if (VariableGetter.isNone(variable)) {
          return $('#forEach-variable').getFocus()
        }
        Command.save({data, groupId, variable, commands})
        break
      }
      case 'save': {
        const saveIndex = read('saveIndex')
        if (VariableGetter.isNone(saveIndex)) {
          return $('#forEach-saveIndex').getFocus()
        }
        Command.save({data, saveIndex, commands})
        break
      }
      case 'touch':
      case 'changed-touch': {
        const touchId = read('touchId')
        if (VariableGetter.isNone(touchId)) {
          return $('#forEach-touchId').getFocus()
        }
        Command.save({data, touchId, commands})
        break
      }
    }
  },
}

// 跳出循环
Command.cases.break = {
  parse: function () {
    return [
      {color: 'flow'},
      {text: Local.get('command.break')},
    ]
  },
  save: function () {
    Command.save({})
  },
}

// 继续循环
Command.cases.continue = {
  parse: function () {
    return [
      {color: 'flow'},
      {text: Local.get('command.continue')},
    ]
  },
  save: function () {
    Command.save({})
  },
}

// 独立执行
Command.cases.independent = {
  parse: function ({commands}) {
    return [
      {fold: true},
      {color: 'flow'},
      {text: Local.get('command.independent')},
      {children: commands},
      {text: Local.get('command.independent.end')},
    ]
  },
  save: function () {
    Command.save({commands: []})
  },
}

// 调用事件
Command.cases.callEvent = {
  windowFrame: $('#callEvent'),
  gridBox: $('#callEvent').querySelector('grid-box'),
  eventArgs: [],
  parameters: [],
  eventResult: null,
  initialize: function () {
    $('#callEvent-confirm').on('click', this.save)

    // 创建类型选项
    $('#callEvent-type').loadItems([
      {name: 'Global', value: 'global'},
      {name: 'Inherited', value: 'inherited'},
      {name: 'Scene', value: 'scene'},
      {name: 'Actor', value: 'actor'},
      {name: 'Skill', value: 'skill'},
      {name: 'State', value: 'state'},
      {name: 'Equipment', value: 'equipment'},
      {name: 'Item', value: 'item'},
      {name: 'Light', value: 'light'},
      {name: 'Element', value: 'element'},
    ])

    // 设置关联元素
    $('#callEvent-type').enableHiddenMode().relate([
      {case: 'global', targets: [
        $('#callEvent-eventId'),
      ]},
      {case: 'scene', targets: [
        $('#callEvent-eventType'),
      ]},
      {case: 'actor', targets: [
        $('#callEvent-actor'),
        $('#callEvent-eventType'),
      ]},
      {case: 'skill', targets: [
        $('#callEvent-skill'),
        $('#callEvent-eventType'),
      ]},
      {case: 'state', targets: [
        $('#callEvent-state'),
        $('#callEvent-eventType'),
      ]},
      {case: 'equipment', targets: [
        $('#callEvent-equipment'),
        $('#callEvent-eventType'),
      ]},
      {case: 'item', targets: [
        $('#callEvent-item'),
        $('#callEvent-eventType'),
      ]},
      {case: 'light', targets: [
        $('#callEvent-light'),
        $('#callEvent-eventType'),
      ]},
      {case: 'element', targets: [
        $('#callEvent-element'),
        $('#callEvent-eventType'),
      ]},
    ])

    // 窗口 - 已关闭事件
    this.windowFrame.on('closed', event => {
      this.eventArgs = []
      this.clearGlobalEventElements()
    })

    // 类型 - 写入事件
    $('#callEvent-type').on('write', event => {
      const type = event.value
      // 加载事件类型选项(创建了全局事件类型但是没用到)
      if (type !== 'inherited') {
        const elEventType = $('#callEvent-eventType')
        const eventTypes = Enum.getMergedItems(EventEditor.types[type], type + '-event')
        elEventType.loadItems(eventTypes)
        elEventType.write(eventTypes[0].value)
      }
      // 显示或隐藏全局事件参数和返回值元素组件
      for (const element of $('.call-event-component')) {
        type === 'global' ? element.show() : element.hide()
      }
      this.resizeWindow()
    })

    // 全局事件ID - 写入事件
    $('#callEvent-eventId').on('write', event => {
      this.eventArgs = this.readEventArgs()
      this.clearGlobalEventElements()
      const id = event.value
      if (id !== '') {
        const flags = {}
        const globalEvent = Data.events[id]
        for (const parameter of globalEvent.parameters) {
          if (parameter.key in flags) {
            continue
          }
          flags[parameter.key] = true
          this.createParameterElements(parameter)
        }
        this.createEventResultElements(globalEvent.returnType)
      }
      this.resizeWindow()
    })

    // 全局事件ID - 输入事件
    $('#callEvent-eventId').on('input', event => {
      this.writeEventArgs(this.eventArgs)
    })
  },
  // 调整窗口大小
  resizeWindow: function () {
    this.windowFrame.style.height = `${this.gridBox.clientHeight + 78}px`
  },
  // 清除全局事件元素
  clearGlobalEventElements: function () {
    const {parameters} = this
    if (parameters.length !== 0) {
      for (const {label, input} of parameters) {
        label.remove()
        input.remove()
      }
      parameters.length = 0
    }
    const {eventResult} = this
    if (eventResult) {
      eventResult.label.remove()
      eventResult.input.remove()
      this.eventResult = null
    }
  },
  // 创建参数元素
  createParameterElements: function (parameter) {
    const {type, key, note} = parameter
    const label = document.createElement('text')
    const name = key ? key.charAt(0).toUpperCase() + key.slice(1) : ''
    label.textContent = name
    let input
    switch (type) {
      case 'boolean':
        input = new SelectBox()
        input.loadItems([
          {name: 'False', value: false},
          {name: 'True', value: true},
        ])
        break
      case 'number':
        input = new NumberVar()
        input.numBox.input.min = '-1000000000'
        input.numBox.input.max = '1000000000'
        input.numBox.decimals = 10
        break
      case 'string':
        input = new TextAreaVar()
        input.strBox.setAttribute('menu', 'tag-local-var tag-global-var tag-dynamic-global-var tag-localization')
        input.addClass('callEvent-argument-string')
        input.on('change', () => this.resizeWindow())
        Selection.addEventListeners(input.strBox)
        break
      case 'object':
        input = new CustomBox()
        input.type = 'variable'
        input.filter = 'object'
        break
      case 'actor':
        input = new CustomBox()
        input.type = 'actor'
        break
      case 'skill':
        input = new CustomBox()
        input.type = 'skill'
        break
      case 'state':
        input = new CustomBox()
        input.type = 'state'
        break
      case 'equipment':
        input = new CustomBox()
        input.type = 'equipment'
        break
      case 'item':
        input = new CustomBox()
        input.type = 'item'
        break
      case 'trigger':
        input = new CustomBox()
        input.type = 'trigger'
        break
      case 'light':
        input = new CustomBox()
        input.type = 'light'
        break
      case 'element':
        input = new CustomBox()
        input.type = 'element'
        break
    }
    if (note) {
      input.setTooltip(`<b>${name}</b>\n${note}`)
    }
    label.addClass('call-event-component')
    input.addClass('call-event-component')
    this.gridBox.appendChild(label)
    this.gridBox.appendChild(input)
    this.parameters.push({key, type, label, input})
  },
  // 创建返回值元素
  createEventResultElements: function (type) {
    let input
    switch (type) {
      case 'none':
        return
      case 'boolean':
        input = new CustomBox()
        input.type = 'variable'
        input.filter = 'boolean'
        break
      case 'number':
        input = new CustomBox()
        input.type = 'variable'
        input.filter = 'number'
        break
      case 'string':
        input = new CustomBox()
        input.type = 'variable'
        input.filter = 'string'
        break
      case 'object':
        input = new CustomBox()
        input.type = 'variable'
        input.filter = 'object'
        break
      case 'actor':
      case 'skill':
      case 'state':
      case 'equipment':
      case 'item':
      case 'trigger':
      case 'light':
      case 'element':
        input = new CustomBox()
        input.type = 'variable'
        input.filter = 'object'
        break
    }
    input.write({type: 'local', key: ''})
    const label = document.createElement('text')
    const text = Local.get('command.callEvent.return')
    const tip = Local.get('command.callEvent.return.tip')
    label.textContent = text
    input.setTooltip(`<b>${text}</b>\n${tip}`)
    label.addClass('call-event-component')
    input.addClass('call-event-component')
    this.gridBox.appendChild(label)
    this.gridBox.appendChild(input)
    this.eventResult = {type, label, input}
  },
  parseEventArgs: function (event, args) {
    const words = Command.words
    if (event) {
      const flags = {}
      const parameters = event.parameters
      outer: for (const {type, key, note} of parameters) {
        const name = note ? Command.setTooltip(`<b>${key}</b>\n${note}`) + key : key
        for (const arg of args) {
          if (arg.key === key && arg.type === type) {
            if (key in flags) {
              continue
            }
            flags[key] = true
            words.push(name + Token(' = ') + this.parseEventArgInput(arg))
            continue outer
          }
        }
        const info = `${Command.setClass('error')}${name}${Token(': ') + Command.setWeakColor(Local.get('eventParameterTypes.' + type))}`
        words.push(info)
      }
    }
    let info = words.join()
    if (info) info = `(${info})`
    return info
  },
  parseEventArgInput: function (arg) {
    switch (arg.type) {
      case 'boolean':
        return Command.setBooleanColor(arg.value.toString())
      case 'number':
        return Command.parseVariableNumber(arg.value)
      case 'string':
        return Command.parseVariableTemplate(arg.value, 40)
      case 'object':
        return Command.parseVariable(arg.value, 'object')
      case 'actor':
        return Command.parseActor(arg.value)
      case 'skill':
        return Command.parseSkill(arg.value)
      case 'state':
        return Command.parseState(arg.value)
      case 'equipment':
        return Command.parseEquipment(arg.value)
      case 'item':
        return Command.parseItem(arg.value)
      case 'trigger':
        return Command.parseTrigger(arg.value)
      case 'light':
        return Command.parseLight(arg.value)
      case 'element':
        return Command.parseElement(arg.value)
    }
  },
  getDefaultArgValue: function (type) {
    switch (type) {
      case 'boolean':
        return false
      case 'number':
        return 0
      case 'string':
        return ''
      case 'object':
        return {type: 'local', key: ''}
      case 'actor':
      case 'skill':
      case 'state':
      case 'equipment':
      case 'item':
      case 'trigger':
      case 'light':
      case 'element':
        return {type: 'trigger'}
    }
  },
  writeEventArgs: function (args) {
    outer: for (const {type, key, input} of this.parameters) {
      for (const arg of args) {
        if (arg.key === key && arg.type === type) {
          input.write(arg.value)
          continue outer
        }
      }
      input.write(this.getDefaultArgValue(type))
    }
  },
  readEventArgs: function () {
    const args = []
    for (const {type, key, input} of this.parameters) {
      const value = input.read()
      if (type === 'object' && VariableGetter.isNone(value)) {
        input.getFocus()
        return null
      }
      args.push({type, key, value})
    }
    return args
  },
  writeEventResult: function (eventResult) {
    if (this.eventResult === null) return
    if (eventResult.type === 'none') return
    const baseTypes = 'boolean|number|string'
    const objectTypes = 'actor|skill|state|equipment|item|trigger|light|element|any'
    // 如果数据结构兼容，写入数据
    if (eventResult.type === this.eventResult.type ||
      baseTypes.includes(eventResult.type) && baseTypes.includes(this.eventResult.type) && eventResult.variable.type === 'local' ||
      objectTypes.includes(eventResult.type) && objectTypes.includes(this.eventResult.type)) {
      this.eventResult.input.write(eventResult.variable)
    }
  },
  readEventResult: function () {
    const eventResult = {type: 'none'}
    if (this.eventResult !== null) {
      eventResult.type = this.eventResult.type
      eventResult.variable = this.eventResult.input.read()
    }
    return eventResult
  },
  parse: function ({type, actor, skill, state, equipment, item, light, element, eventId, eventArgs, eventResult, eventType}) {
    const words = Command.words
    switch (type) {
      case 'global': {
        // 2025.2.22补丁
        if (eventArgs === undefined) {
          eventArgs = []
        }
        if (eventResult === undefined) {
          eventResult = {type: 'none'}
        }
        let leftValue = ''
        let eventName = Command.parseFileName(eventId)
        const event = Data.events[eventId]
        if (!event) break
        switch (eventResult.type) {
          case 'none':
            if (event.returnType !== 'none') {
              leftValue = Command.setVariableColor('?')
            }
            break
          case 'boolean':
          case 'number':
          case 'string':
            leftValue = Command.parseVariable(eventResult.variable, eventResult.type, true)
            break
          case 'object':
            leftValue = Command.parseVariable(eventResult.variable, 'object', true)
            break
          case 'actor':
          case 'skill':
          case 'state':
          case 'equipment':
          case 'item':
          case 'trigger':
          case 'light':
          case 'element':
            leftValue = Command.parseVariable(eventResult.variable, 'object', true)
            break
        }
        if (leftValue) {
          if (eventResult.type !== event.returnType) {
            leftValue = Command.setClass('error') + leftValue
          }
          leftValue += Token(' = ')
        }
        if (event.description) {
          eventName = Command.setTooltip(`<b>${Command.removeTextTags(eventName)}</b>\n${event.description}`) + eventName
        }
        words.push(leftValue + eventName + this.parseEventArgs(event, eventArgs))
        break
      }
      case 'inherited':
        words.push(Local.get('command.callEvent.inherited'))
        break
      case 'scene':
        words.push(Local.get('command.callEvent.scene'))
        break
      case 'actor':
        words.push(Command.parseActor(actor))
        break
      case 'skill':
        words.push(Command.parseSkill(skill))
        break
      case 'state':
        words.push(Command.parseState(state))
        break
      case 'equipment':
        words.push(Command.parseEquipment(equipment))
        break
      case 'item':
        words.push(Command.parseItem(item))
        break
      case 'light':
        words.push(Command.parseLight(light))
        break
      case 'element':
        words.push(Command.parseElement(element))
        break
    }
    if (eventType) {
      words.push(Command.parseEventType(type + '-event', eventType))
    }
    const contents = [
      {color: 'flow'},
      {text: Local.get('command.callEvent.alias') + Token(': ')},
      {text: words.join()},
    ]
    if (type === 'global') {
      contents.unshift({class: 'parent:global-event'})
    }
    return contents
  },
  load: function ({
    type        = 'global',
    actor       = {type: 'trigger'},
    skill       = {type: 'trigger'},
    state       = {type: 'trigger'},
    equipment   = {type: 'trigger'},
    item        = {type: 'trigger'},
    light       = {type: 'trigger'},
    element     = {type: 'trigger'},
    eventId     = '',
    eventArgs   = [],
    eventResult = {type: 'none'},
    eventType   = '',
  }) {
    const write = getElementWriter('callEvent')
    write('type', type)
    write('actor', actor)
    write('skill', skill)
    write('state', state)
    write('equipment', equipment)
    write('item', item)
    write('light', light)
    write('element', element)
    write('eventId', eventId)
    write('eventType', eventType)
    this.writeEventArgs(eventArgs)
    this.writeEventResult(eventResult)
    $('#callEvent-type').getFocus()
  },
  save: function () {
    const read = getElementReader('callEvent')
    const type = read('type')
    switch (type) {
      case 'global': {
        const eventId = read('eventId')
        if (eventId === '') {
          return $('#callEvent-eventId').getFocus()
        }
        const callEvent = Command.cases.callEvent
        const eventArgs = callEvent.readEventArgs()
        if (eventArgs === null) return
        const eventResult = callEvent.readEventResult()
        if (eventResult.type !== 'none' &&
          VariableGetter.isNone(eventResult.variable)) {
          return callEvent.eventResult.input.getFocus()
        }
        Command.save({type, eventId, eventArgs, eventResult})
        break
      }
      case 'inherited':
        Command.save({type})
        break
      case 'scene':
        const eventType = read('eventType')
        if (eventType === '') {
          return $('#callEvent-eventType').getFocus()
        }
        Command.save({type, eventType})
        break
      default: {
        const target = read(type)
        const eventType = read('eventType')
        if (eventType === '') {
          return $('#callEvent-eventType').getFocus()
        }
        Command.save({
          type: type,
          [type]: target,
          eventType: eventType,
        })
        break
      }
    }
  },
}

// 返回值
Command.cases.return = {
  typeItems: {
    none: {name: 'None', value: 'none'},
    boolean: {name: 'Boolean', value: 'boolean'},
    number: {name: 'Number', value: 'number'},
    string: {name: 'String', value: 'string'},
    object: {name: 'Object', value: 'object'},
    actor: {name: 'Actor', value: 'actor'},
    skill: {name: 'Skill', value: 'skill'},
    state: {name: 'State', value: 'state'},
    equipment: {name: 'Equipment', value: 'equipment'},
    item: {name: 'Item', value: 'item'},
    trigger: {name: 'Trigger', value: 'trigger'},
    light: {name: 'Light', value: 'light'},
    element: {name: 'Element', value: 'element'},
  },
  initialize: function () {
    $('#return-confirm').on('click', this.save)

    // 创建返回类型选项
    $('#return-type').loadItems(Object.values(this.typeItems))

    // 创建布尔值选项
    $('#return-boolean').loadItems([
      {name: 'False', value: false},
      {name: 'True', value: true},
    ])

    // 设置返回类型关联元素
    $('#return-type').enableHiddenMode().relate([
      {case: 'boolean', targets: [
        $('#return-boolean'),
      ]},
      {case: 'number', targets: [
        $('#return-number'),
      ]},
      {case: 'string', targets: [
        $('#return-string'),
      ]},
      {case: 'object', targets: [
        $('#return-object'),
      ]},
      {case: 'actor', targets: [
        $('#return-actor'),
      ]},
      {case: 'skill', targets: [
        $('#return-skill'),
      ]},
      {case: 'state', targets: [
        $('#return-state'),
      ]},
      {case: 'equipment', targets: [
        $('#return-equipment'),
      ]},
      {case: 'item', targets: [
        $('#return-item'),
      ]},
      {case: 'trigger', targets: [
        $('#return-trigger'),
      ]},
      {case: 'light', targets: [
        $('#return-light'),
      ]},
      {case: 'element', targets: [
        $('#return-element'),
      ]},
    ])
  },
  parse: function ({type, value}) {
    const words = Command.words
    switch (type) {
      case 'none':
        break
      case 'boolean':
        words.push(Command.setBooleanColor(value.toString()))
        break
      case 'number':
        words.push(Command.parseVariableNumber(value))
        break
      case 'string':
        words.push(Command.parseVariableString(value))
        break
      case 'object':
        words.push(Command.parseVariable(value, 'object'))
        break
      case 'actor':
        words.push(Command.parseActor(value))
        break
      case 'skill':
        words.push(Command.parseSkill(value))
        break
      case 'state':
        words.push(Command.parseState(value))
        break
      case 'equipment':
        words.push(Command.parseEquipment(value))
        break
      case 'item':
        words.push(Command.parseItem(value))
        break
      case 'trigger':
        words.push(Command.parseTrigger(value))
        break
      case 'light':
        words.push(Command.parseLight(value))
        break
      case 'element':
        words.push(Command.parseElement(value))
        break
    }
    let info = words.join()
    if (Command.returnType !== type) {
      info = Command.setClass('error') + (info || '?')
    }
    return [
      {color: 'flow'},
      {text: Local.get('command.return') + ' '},
      {color: 'restore'},
      {text: info},
    ]
  },
  // 加载类型选项
  loadTypeItems: function (type) {
    let items
    switch (type) {
      case 'none': items = [this.typeItems.none]; break
      case 'boolean': items = [this.typeItems.boolean]; break
      case 'number': items = [this.typeItems.number]; break
      case 'string': items = [this.typeItems.string]; break
      case 'object': items = [this.typeItems.object]; break
      case 'actor': items = [this.typeItems.actor]; break
      case 'skill': items = [this.typeItems.skill]; break
      case 'state': items = [this.typeItems.state]; break
      case 'equipment': items = [this.typeItems.equipment]; break
      case 'item': items = [this.typeItems.item]; break
      case 'trigger': items = [this.typeItems.trigger]; break
      case 'light': items = [this.typeItems.light]; break
      case 'element': items = [this.typeItems.element]; break
      default: throw new Error('Not implemented')
    }
    $('#return-type').loadItems(items)
  },
  load: function ({
    type  = Command.returnType,
    value = null,
  }) {
    this.loadTypeItems(Command.returnType)
    const write = getElementWriter('return')
    write('type', type)
    write('boolean', type === 'boolean' && value !== null ? value : false)
    write('number', type === 'number' && value !== null ? value : 0)
    write('string', type === 'string' && value !== null ? value : '')
    write('object', type === 'object' && value !== null ? value : {type: 'local', key: ''})
    write('actor', type === 'actor' && value !== null ? value : {type: 'trigger'})
    write('skill', type === 'skill' && value !== null ? value : {type: 'trigger'})
    write('state', type === 'state' && value !== null ? value : {type: 'trigger'})
    write('equipment', type === 'equipment' && value !== null ? value : {type: 'trigger'})
    write('item', type === 'item' && value !== null ? value : {type: 'trigger'})
    write('trigger', type === 'trigger' && value !== null ? value : {type: 'trigger'})
    write('light', type === 'light' && value !== null ? value : {type: 'trigger'})
    write('element', type === 'element' && value !== null ? value : {type: 'trigger'})
    $('#return-type').getFocus()
  },
  save: function () {
    const read = getElementReader('return')
    const type = read('type')
    switch (type) {
      case 'none':
        Command.save({type})
        break
      case 'boolean':
        Command.save({type, value: read('boolean')})
        break
      case 'number':
        Command.save({type, value: read('number')})
        break
      case 'string':
        Command.save({type, value: read('string')})
        break
      case 'object': {
        const variable = read('object')
        if (VariableGetter.isNone(variable)) {
          return $('#return-object').getFocus()
        }
        Command.save({type, value: variable})
        break
      }
      case 'actor':
        Command.save({type, value: read('actor')})
        break
      case 'skill':
        Command.save({type, value: read('skill')})
        break
      case 'state':
        Command.save({type, value: read('state')})
        break
      case 'equipment':
        Command.save({type, value: read('equipment')})
        break
      case 'item':
        Command.save({type, value: read('item')})
        break
      case 'trigger':
        Command.save({type, value: read('trigger')})
        break
      case 'light':
        Command.save({type, value: read('light')})
        break
      case 'element':
        Command.save({type, value: read('element')})
        break
    }
  },
}

// 停止事件
Command.cases.stopEvent = {
  initialize: function () {
    $('#stopEvent-confirm').on('click', this.save)

    // 创建类型选项
    $('#stopEvent-type').loadItems([
      {name: 'Current', value: 'current'},
      {name: 'Global', value: 'global'},
      {name: 'Scene', value: 'scene'},
      {name: 'Actor', value: 'actor'},
      {name: 'Skill', value: 'skill'},
      {name: 'State', value: 'state'},
      {name: 'Equipment', value: 'equipment'},
      {name: 'Item', value: 'item'},
      {name: 'Light', value: 'light'},
      {name: 'Element', value: 'element'},
    ])

    // 设置关联元素
    $('#stopEvent-type').enableHiddenMode().relate([
      {case: 'global', targets: [
        $('#stopEvent-eventId'),
      ]},
      {case: 'scene', targets: [
        $('#stopEvent-eventType'),
      ]},
      {case: 'actor', targets: [
        $('#stopEvent-actor'),
        $('#stopEvent-eventType'),
      ]},
      {case: 'skill', targets: [
        $('#stopEvent-skill'),
        $('#stopEvent-eventType'),
      ]},
      {case: 'state', targets: [
        $('#stopEvent-state'),
        $('#stopEvent-eventType'),
      ]},
      {case: 'equipment', targets: [
        $('#stopEvent-equipment'),
        $('#stopEvent-eventType'),
      ]},
      {case: 'item', targets: [
        $('#stopEvent-item'),
        $('#stopEvent-eventType'),
      ]},
      {case: 'light', targets: [
        $('#stopEvent-light'),
        $('#stopEvent-eventType'),
      ]},
      {case: 'element', targets: [
        $('#stopEvent-element'),
        $('#stopEvent-eventType'),
      ]},
    ])

    // 类型 - 写入事件
    $('#stopEvent-type').on('write', event => {
      const type = event.value
      // 加载事件类型选项(创建了全局事件类型但是没用到)
      if (type !== 'current') {
        const elEventType = $('#stopEvent-eventType')
        const eventTypes = Enum.getMergedItems(EventEditor.types[type], type + '-event')
        elEventType.loadItems(eventTypes)
        elEventType.write(eventTypes[0].value)
      }
    })
  },
  parse: function ({type, actor, skill, state, equipment, item, light, element, eventId, eventType}) {
    // 2025.2.27补丁
    if (type === undefined) {
      type = 'current'
    }
    const words = Command.words
    switch (type) {
      case 'current':
        words.push(Local.get('command.stopEvent.current'))
        break
      case 'global':
        words.push(Command.parseFileName(eventId))
        break
      case 'scene':
        words.push(Local.get('command.stopEvent.scene'))
        break
      case 'actor':
        words.push(Command.parseActor(actor))
        break
      case 'skill':
        words.push(Command.parseSkill(skill))
        break
      case 'state':
        words.push(Command.parseState(state))
        break
      case 'equipment':
        words.push(Command.parseEquipment(equipment))
        break
      case 'item':
        words.push(Command.parseItem(item))
        break
      case 'light':
        words.push(Command.parseLight(light))
        break
      case 'element':
        words.push(Command.parseElement(element))
        break
    }
    if (eventType) {
      words.push(Command.parseEventType(type + '-event', eventType))
    }
    return [
      {color: 'flow'},
      {text: Local.get('command.stopEvent.alias') + Token(': ')},
      {text: words.join()},
    ]
  },
  load: function ({
    type      = 'current',
    actor     = {type: 'trigger'},
    skill     = {type: 'trigger'},
    state     = {type: 'trigger'},
    equipment = {type: 'trigger'},
    item      = {type: 'trigger'},
    light     = {type: 'trigger'},
    element   = {type: 'trigger'},
    eventId   = '',
    eventType = '',
  }) {
    const write = getElementWriter('stopEvent')
    write('type', type)
    write('actor', actor)
    write('skill', skill)
    write('state', state)
    write('equipment', equipment)
    write('item', item)
    write('light', light)
    write('element', element)
    write('eventId', eventId)
    write('eventType', eventType)
    $('#stopEvent-type').getFocus()
  },
  save: function () {
    const read = getElementReader('stopEvent')
    const type = read('type')
    switch (type) {
      case 'current':
        Command.save({type})
        break
      case 'global': {
        const eventId = read('eventId')
        if (eventId === '') {
          return $('#stopEvent-eventId').getFocus()
        }
        Command.save({type, eventId})
        break
      }
      case 'scene':
        const eventType = read('eventType')
        if (eventType === '') {
          return $('#stopEvent-eventType').getFocus()
        }
        Command.save({type, eventType})
        break
      default: {
        const target = read(type)
        const eventType = read('eventType')
        if (eventType === '') {
          return $('#stopEvent-eventType').getFocus()
        }
        Command.save({
          type: type,
          [type]: target,
          eventType: eventType,
        })
        break
      }
    }
  },
}

// 注册事件
Command.cases.registerEvent = {
  commands: [],
  priorityEnabled: false,
  initialize: function () {
    $('#registerEvent-confirm').on('click', this.save)

    // 创建目标选项
    $('#registerEvent-target').loadItems([
      {name: 'Global', value: 'global'},
      {name: 'Actor', value: 'actor'},
      {name: 'Element', value: 'element'},
    ])

    // 设置目标关联元素
    $('#registerEvent-target').enableHiddenMode().relate([
      {case: 'actor', targets: [
        $('#registerEvent-actor'),
      ]},
      {case: 'element', targets: [
        $('#registerEvent-element'),
      ]},
    ])

    // 目标 - 写入事件
    $('#registerEvent-target').on('write', event => {
      const type = event.value
      const elEventType = $('#registerEvent-type')
      const registerType = 'register_' + type
      const eventTypes = Enum.getMergedItems(EventEditor.types[registerType], registerType + '-event')
      this.switchTypeAndTagInput()
      // 加载事件类型选项
      elEventType.loadItems(eventTypes)
      elEventType.write(eventTypes[0].value)
    })

    // 创建操作选项
    $('#registerEvent-operation').loadItems([
      {name: 'Register', value: 'register'},
      {name: 'Unregister', value: 'unregister'},
      {name: 'Reset', value: 'reset'},
    ])

    // 事件操作 - 写入事件
    $('#registerEvent-operation').on('write', () => {
      this.switchTypeAndTagInput()
      this.switchPriority()
    })

    // 事件类型 - 写入事件
    $('#registerEvent-type').on('write', () => this.switchPriority())
  },
  switchTypeAndTagInput: function (event) {
    const show = input => {
      input.previousElementSibling.show()
      input.show()
    }
    const hide = input => {
      input.previousElementSibling.hide()
      input.hide()
    }
    const typeInput = $('#registerEvent-type')
    const tagInput = $('#registerEvent-tag')
    const target = $('#registerEvent-target').read()
    const operation = $('#registerEvent-operation').read()
    switch (target) {
      case 'global':
        switch (operation) {
          case 'register':
            show(typeInput)
            show(tagInput)
            break
          case 'unregister':
            hide(typeInput)
            show(tagInput)
            break
          case 'reset':
            hide(typeInput)
            hide(tagInput)
            break
        }
        break
      case 'actor':
      case 'element':
        switch (operation) {
          case 'register':
          case 'unregister':
            show(typeInput)
            hide(tagInput)
            break
          case 'reset':
            hide(typeInput)
            hide(tagInput)
            break
        }
        break
    }
  },
  switchPriority: function () {
    const priorityTypes = {
      input: true,
      keydown: true,
      keyup: true,
      mousedown: true,
      mouseup: true,
      mousemove: true,
      doubleclick: true,
      wheel: true,
      touchstart: true,
      touchmove: true,
      touchend: true,
      gamepadbuttonpress: true,
      gamepadbuttonrelease: true,
      gamepadleftstickchange: true,
      gamepadrightstickchange: true,
    }
    const target = $('#registerEvent-target').read()
    const operation = $('#registerEvent-operation').read()
    const type = $('#registerEvent-type').read()
    const priority = $('#registerEvent-priority')
    if (target === 'global' && operation === 'register' && type in priorityTypes) {
      priority.previousElementSibling.show()
      priority.show()
      this.priorityEnabled = true
    } else {
      priority.previousElementSibling.hide()
      priority.hide()
      this.priorityEnabled = false
    }
  },
  parse: function ({target, actor, element, operation, type, priority, tag, commands}) {
    const words = Command.words
    switch (target) {
      case 'global':
        switch (operation) {
          case 'register': {
            const priorityFlag = priority ? Command.setOperatorColor('*') : ''
            const tagName = tag ? (Token('(') + Command.parseVariableString(tag) + Token(')')) : ''
            words.push(Command.parseEventType(target + '-event', type) + priorityFlag + tagName)
            break
          }
          case 'unregister': {
            const tagName = Token('(') + Command.parseVariableString(tag) + Token(')')
            words.push(Local.get('command.registerEvent.reset.global-event') + tagName)
            break
          }
          case 'reset':
            words.push(Local.get('command.registerEvent.reset.global-events'))
            break
        }
        break
      case 'actor':
        switch (operation) {
          case 'register':
          case 'unregister':
            words.push(Command.parseActor(actor))
            words.push(Command.parseEventType(target + '-event', type))
            break
          case 'reset':
            words.push(Command.parseActor(actor) + Token(' -> ') + Local.get('command.registerEvent.reset.events'))
            break
        }
        break
      case 'element':
        switch (operation) {
          case 'register':
          case 'unregister':
            words.push(Command.parseElement(element))
            words.push(Command.parseEventType(target + '-event', type))
            break
          case 'reset':
            words.push(Command.parseElement(element) + Token(' -> ') + Local.get('command.registerEvent.reset.events'))
            break
        }
        break
    }
    const contents = [
      {color: 'flow'},
      {text: Local.get('command.registerEvent.alias.' + operation) + Token(': ')},
      {text: words.join()},
    ]
    if (commands) {
      contents.unshift(
        {fold: true},
      )
      contents.push(
        {children: commands},
        {color: 'flow'},
        {text: Local.get('command.registerEvent.end')},
      )
    }
    return contents
  },
  load: function ({
    target    = 'global',
    actor     = {type: 'trigger'},
    element   = {type: 'trigger'},
    operation = 'register',
    type      = 'autorun',
    priority  = false,
    tag       = '',
    commands  = [],
  }) {
    const write = getElementWriter('registerEvent')
    write('target', target)
    write('actor', actor)
    write('element', element)
    write('operation', operation)
    write('type', type)
    write('priority', priority)
    write('tag', tag)
    Command.cases.registerEvent.commands = commands
    $('#registerEvent-target').getFocus()
  },
  save: function () {
    const read = getElementReader('registerEvent')
    const target = read('target')
    const operation = read('operation')
    const type = read('type')
    const commands = Command.cases.registerEvent.commands
    switch (target) {
      case 'global':
        switch (operation) {
          case 'register': {
            let tag = read('tag')
            if (typeof tag === 'string') {
              tag = tag.trim()
            }
            const priority = Command.cases.registerEvent.priorityEnabled ? read('priority') : false
            Command.save({target, operation, type, priority, tag, commands})
            break
          }
          case 'unregister': {
            let tag = read('tag')
            if (typeof tag === 'string' && (tag = tag.trim()) === '') {
              return $('#registerEvent-tag').getFocus()
            }
            Command.save({target, operation, tag})
            break
          }
          case 'reset':
            Command.save({target, operation})
            break
        }
        break
      case 'actor': {
        const actor = read('actor')
        switch (operation) {
          case 'register':
            Command.save({target, actor, operation, type, commands})
            break
          case 'unregister':
            Command.save({target, actor, operation, type})
            break
          case 'reset':
            Command.save({target, actor, operation})
            break
        }
        break
      }
      case 'element': {
        const element = read('element')
        switch (operation) {
          case 'register':
            Command.save({target, element, operation, type, commands})
            break
          case 'unregister':
          Command.save({target, element, operation, type})
            break
          case'reset':
            Command.save({target, element, operation})
            break
        }
        break
      }
    }
  },
}

// 设置事件
Command.cases.setEvent = {
  initialize: function () {
    $('#setEvent-confirm').on('click', this.save)

    // 创建操作选项
    $('#setEvent-operation').loadItems([
      {name: 'Stop Propagation', value: 'stop-propagation'},
      {name: 'Pause and Save to Variable', value: 'pause'},
      {name: 'Continue and Reset Variable', value: 'continue'},
      {name: 'Enable Global Event', value: 'enable'},
      {name: 'Disable Global Event', value: 'disable'},
      {name: 'Set to Highest Priority', value: 'highest-priority'},
      {name: 'Go to Choice Branch', value: 'goto-choice-branch'},
    ])

    // 设置操作关联元素
    $('#setEvent-operation').enableHiddenMode().relate([
      {case: ['pause', 'continue'], targets: [
        $('#setEvent-variable'),
      ]},
      {case: ['enable', 'disable', 'highest-priority'], targets: [
        $('#setEvent-eventId'),
      ]},
      {case: 'goto-choice-branch', targets: [
        $('#setEvent-choiceIndex'),
      ]},
    ])
  },
  parse: function ({operation, variable, eventId, choiceIndex}) {
    const words = Command.words
    .push(Local.get('command.setEvent.' + operation))
    switch (operation) {
      case 'pause':
        words.push(Command.parseVariable(variable, 'object', true))
        break
      case 'continue':
        words.push(Command.parseVariable(variable, 'object'))
        break
      case 'enable':
      case 'disable':
      case 'highest-priority':
        words.push(Command.parseFileName(eventId))
        break
      case 'goto-choice-branch':
        words.push(Command.parseVariableNumber(choiceIndex))
        break
    }
    return [
      {color: 'flow'},
      {text: Local.get('command.setEvent.alias') + Token(': ')},
      {text: words.join()},
    ]
  },
  load: function ({
    operation   = 'stop-propagation',
    variable    = {type: 'global', key: ''},
    eventId     = '',
    choiceIndex = 0,
  }) {
    // 补丁：删除了阻止和回复场景输入事件选项
    switch (operation) {
      case 'prevent-scene-input-events':
      case 'restore-scene-input-events':
        operation = 'stop-propagation'
        break
    }
    const write = getElementWriter('setEvent')
    write('operation', operation)
    write('variable', variable)
    write('eventId', eventId)
    write('choiceIndex', choiceIndex)
    $('#setEvent-operation').getFocus()
  },
  save: function () {
    const read = getElementReader('setEvent')
    const operation = read('operation')
    switch (operation) {
      case 'stop-propagation':
        Command.save({operation})
        break
      case 'pause':
      case 'continue': {
        const variable = read('variable')
        if (VariableGetter.isNone(variable)) {
          return $('#setEvent-variable').getFocus()
        }
        Command.save({operation, variable})
        break
      }
      case 'enable':
      case 'disable':
      case 'highest-priority': {
        const eventId = read('eventId')
        if (eventId === '') {
          return $('#setEvent-eventId').getFocus()
        }
        Command.save({operation, eventId})
        break
      }
      case 'goto-choice-branch': {
        const choiceIndex = read('choiceIndex')
        Command.save({operation, choiceIndex})
        break
      }
    }
  },
}

// 过渡
Command.cases.transition = {
  commands: null,
  initialize: function () {
    $('#transition-confirm').on('click', this.save)

    // 创建过渡方式选项 - 窗口打开事件
    $('#transition').on('open', function (event) {
      $('#transition-easingId').loadItems(
        Data.createEasingItems()
      )
    })

    // 清理内存 - 窗口已关闭事件
    $('#transition').on('closed', function (event) {
      $('#transition-easingId').clear()
      this.commands = null
    })
  },
  parse: function ({variable, start, end, easingId, duration, commands}) {
    const varName = Command.parseVariable(variable, 'number', true)
    const from = Command.parseVariableNumber(start)
    const to = Command.parseVariableNumber(end)
    const easing = Command.parseEasing(easingId, duration)
    const expression = varName + Token(' = ') + from + Token(' -> ') + to
    const words = Command.words.push(expression).push(easing)
    return [
      {fold: true},
      {color: 'flow'},
      {text: Local.get('command.transition') + ' '},
      {color: 'restore'},
      {text: words.join()},
      {children: commands},
      {color: 'flow'},
      {text: Local.get('command.transition.end')},
    ]
  },
  load: function ({
    variable  = {type: 'local', key: ''},
    start     = 0,
    end       = 1,
    easingId  = Data.easings[0].id,
    duration  = 1000,
    commands  = [],
  }) {
    const write = getElementWriter('transition')
    write('variable', variable)
    write('start', start)
    write('end', end)
    write('easingId', easingId)
    write('duration', duration)
    Command.cases.transition.commands = commands
    $('#transition-variable').getFocus()
  },
  save: function () {
    const read = getElementReader('transition')
    const variable = read('variable')
    if (VariableGetter.isNone(variable)) {
      return $('#transition-variable').getFocus()
    }
    const start = read('start')
    const end = read('end')
    const easingId = read('easingId')
    const duration = read('duration')
    if (duration === 0) {
      return $('#transition-duration').getFocus('all')
    }
    const commands = Command.cases.transition.commands
    Command.save({variable, start, end, easingId, duration, commands})
  },
}

// 指令块
Command.cases.block = {
  initialize: function () {
    $('#block-confirm').on('click', this.save)
  },
  parse: function ({note, asynchronous, commands}) {
    // 补丁：2025-3-21
    if (asynchronous === undefined) {
      asynchronous = false
    }
    const asyncFlag = asynchronous ? Command.setOperatorColor('*') : ''
    const blockNote = note || asyncFlag ? Token(': ') + note + asyncFlag : ''
    return [
      {fold: true},
      {color: 'flow'},
      {text: Local.get('command.block') + blockNote},
      {children: commands},
      {color: 'flow'},
      {text: Local.get('command.block.end')},
    ]
  },
  load: function ({note = '', asynchronous = false, commands = []}) {
    $('#block-note').write(note)
    $('#block-asynchronous').write(asynchronous)
    $('#block-note').getFocus()
    Command.cases.block.commands = commands
  },
  save: function () {
    const note = $('#block-note').read().trim()
    const asynchronous = $('#block-asynchronous').read()
    const commands = Command.cases.block.commands
    Command.save({note, asynchronous, commands})
  },
}

// 标签
Command.cases.label = {
  initialize: function () {
    $('#label-confirm').on('click', this.save)
  },
  parse: function ({name}) {
    return [
      {color: 'flow'},
      {text: Local.get('command.label') + Token(': ')},
      {color: 'label'},
      {text: name},
    ]
  },
  load: function ({name = ''}) {
    $('#label-name').write(name)
    $('#label-name').getFocus('all')
  },
  save: function () {
    const name = $('#label-name').read().trim()
    if (name === '') {
      return $('#label-name').getFocus()
    }
    Command.save({name})
  },
}

// 跳转到
Command.cases.jumpTo = {
  initialize: function () {
    $('#jumpTo-confirm').on('click', this.save)

    // 侦听文本提示
    TextSuggestion.listen($('#jumpTo-label'), this.loadLabels)

    // 创建操作选项
    $('#jumpTo-operation').loadItems([
      {name: 'Jump to Label', value: 'jump'},
      {name: 'Save and Jump to Label', value: 'save-jump'},
      {name: 'Jump to the Saved Location', value: 'return'},
    ])

    // 设置操作关联元素
    $('#jumpTo-operation').enableHiddenMode().relate([
      {case: ['jump', 'save-jump'], targets: [
        $('#jumpTo-label'),
      ]},
    ])
  },
  parse: function ({operation, label}) {
    const words = Command.words
    switch (operation) {
      case 'jump':
        words.push(label)
        break
      case 'save-jump':
        words.push(label).push(Local.get('command.jumpTo.save'))
        break
      case 'return':
        words.push(Local.get('command.jumpTo.savedLocation'))
        break
    }
    return [
      {color: 'flow'},
      {text: Local.get('command.jumpTo.alias') + Token(': ')},
      {text: words.join()},
    ]
  },
  load: function ({
    operation = 'jump',
    label     = '',
  }) {
    $('#jumpTo-operation').write(operation)
    $('#jumpTo-label').write(label)
    $('#jumpTo-operation').getFocus()
  },
  save: function () {
    const operation = $('#jumpTo-operation').read()
    switch (operation) {
      case 'jump':
      case 'save-jump': {
        const label = $('#jumpTo-label').read().trim()
        if (label === '') {
          return $('#jumpTo-label').getFocus()
        }
        Command.save({operation, label})
        break
      }
      case 'return':
        Command.save({operation})
        break
    }
  },
  // 加载本地变量键
  loadLabels: function () {
    const items = []
    const commands = EventEditor.commandList.read()
    if (!commands) return items
    // 遍历目标事件的指令列表
    Command.forEachCommand(commands, command => {
      if (command.id === 'label') {
        items.push({
          name: command.params.name,
          icon: 'icon-label',
        })
      }
    })
    // 按名称排序列表项，并返回
    return items.sort((a, b) => a.name.localeCompare(b.name))
  }
}

// 等待
Command.cases.wait = {
  initialize: function () {
    $('#wait-confirm').on('click', this.save)
  },
  parse: function ({duration}) {
    return [
      {color: 'wait'},
      {text: Local.get('command.wait') + Token(': ')},
      {text: Command.parseVariableNumber(duration, 'ms')},
    ]
  },
  load: function ({duration = 1}) {
    $('#wait-duration').write(duration)
    $('#wait-duration').getFocus('all')
  },
  save: function () {
    const duration = $('#wait-duration').read()
    Command.save({duration})
  },
}

// 创建元素
Command.cases.createElement = {
  initialize: function () {
    $('#createElement-confirm').on('click', this.save)

    // 创建操作选项
    $('#createElement-operation').loadItems([
      {name: 'Append All to Root', value: 'append-all-to-root'},
      {name: 'Append One to Root', value: 'append-one-to-root'},
      {name: 'Append All to Element', value: 'append-all-to-element'},
      {name: 'Append One to Element', value: 'append-one-to-element'},
    ])

    // 设置操作关联元素
    $('#createElement-operation').enableHiddenMode().relate([
      {case: 'append-all-to-root', targets: [
        $('#createElement-uiId'),
      ]},
      {case: 'append-one-to-root', targets: [
        $('#createElement-presetId'),
      ]},
      {case: 'append-all-to-element', targets: [
        $('#createElement-parent'),
        $('#createElement-uiId'),
      ]},
      {case: 'append-one-to-element', targets: [
        $('#createElement-parent'),
        $('#createElement-presetId'),
      ]},
    ])
  },
  parseUIAndNodeNames: function (uiId) {
    const uiName = Command.parseFileName(uiId)
    const data = Data.ui[uiId]
    if (data !== undefined) {
      const words = Command.words
      const nodes = data.nodes
      for (const {name} of nodes) {
        if (name !== '') {
          words.push(Command.setPresetColor(name))
        }
        if (words.count === 5) {
          break
        }
      }
      if (words.count < nodes.length) {
        words.push(Token('...'))
      }
      return uiName + ' ' + Token('{') + words.join() + Token('}')
    }
    return uiName
  },
  parse: function ({operation, parent, uiId, presetId}) {
    let info
    switch (operation) {
      case 'append-all-to-root':
        info = this.parseUIAndNodeNames(uiId)
        break
      case 'append-one-to-root':
        info = Command.parsePresetElement(presetId)
        break
      case 'append-all-to-element':
        info = Command.parseElement(parent) + Token(' -> ') + this.parseUIAndNodeNames(uiId)
        break
      case 'append-one-to-element':
        info = Command.parseElement(parent) + Token(' -> ') + Command.parsePresetElement(presetId)
        break
    }
    return [
      {color: 'element'},
      {text: Local.get('command.createElement') + Token(': ')},
      {text: info},
    ]
  },
  load: function ({
    operation = 'append-all-to-root',
    parent    = {type: 'trigger'},
    uiId      = '',
    presetId  = PresetElement.getDefaultPresetId(),
  }) {
    const write = getElementWriter('createElement')
    write('operation', operation)
    write('parent', parent)
    write('uiId', uiId)
    write('presetId', presetId)
    $('#createElement-operation').getFocus('all')
  },
  save: function () {
    const read = getElementReader('createElement')
    const operation = read('operation')
    switch (operation) {
      case 'append-all-to-root': {
        const uiId = read('uiId')
        if (uiId === '') {
          return $('#createElement-uiId').getFocus()
        }
        Command.save({operation, uiId})
        break
      }
      case 'append-one-to-root': {
        const presetId = read('presetId')
        if (presetId === '') {
          return $('#createElement-presetId').getFocus()
        }
        Command.save({operation, presetId})
        break
      }
      case 'append-all-to-element': {
        const parent = read('parent')
        const uiId = read('uiId')
        if (uiId === '') {
          return $('#createElement-uiId').getFocus()
        }
        Command.save({operation, parent, uiId})
        break
      }
      case 'append-one-to-element': {
        const parent = read('parent')
        const presetId = read('presetId')
        if (presetId === '') {
          return $('#createElement-presetId').getFocus()
        }
        Command.save({operation, parent, presetId})
        break
      }
    }
  },
}

// 设置图像
Command.cases.setImage = {
  initialize: function () {
    $('#setImage-confirm').on('click', this.save)

    // 绑定属性列表
    $('#setImage-properties').bind(ImageProperty)

    // 清理内存 - 窗口已关闭事件
    $('#setImage').on('closed', event => {
      $('#setImage-properties').clear()
    })
  },
  parse: function ({element, properties}) {
    const words = Command.words
    .push(Command.parseElement(element))
    for (const property of properties) {
      words.push(ImageProperty.parse(property))
    }
    return [
      {color: 'element'},
      {text: Local.get('command.setImage') + Token(': ')},
      {text: words.join()},
    ]
  },
  load: function ({
    element     = {type: 'trigger'},
    properties  = [],
  }) {
    const write = getElementWriter('setImage')
    write('element', element)
    write('properties', properties.slice())
    $('#setImage-element').getFocus()
  },
  save: function () {
    const read = getElementReader('setImage')
    const element = read('element')
    const properties = read('properties')
    if (properties.length === 0) {
      return $('#setImage-properties').getFocus()
    }
    Command.save({element, properties})
  },
}

// 加载图像
Command.cases.loadImage = {
  initialize: function () {
    $('#loadImage-confirm').on('click', this.save)

    // 创建类型选项
    $('#loadImage-type').loadItems([
      {name: 'Actor Portrait', value: 'actor-portrait'},
      {name: 'Skill Icon', value: 'skill-icon'},
      {name: 'State Icon', value: 'state-icon'},
      {name: 'Equipment Icon', value: 'equipment-icon'},
      {name: 'Item Icon', value: 'item-icon'},
      {name: 'Shortcut Icon', value: 'shortcut-icon'},
      {name: 'Base64 Image', value: 'base64'},
    ])

    // 设置类型关联元素
    $('#loadImage-type').enableHiddenMode().relate([
      {case: 'actor-portrait', targets: [
        $('#loadImage-actor'),
      ]},
      {case: 'skill-icon', targets: [
        $('#loadImage-skill'),
      ]},
      {case: 'state-icon', targets: [
        $('#loadImage-state'),
      ]},
      {case: 'equipment-icon', targets: [
        $('#loadImage-equipment'),
      ]},
      {case: 'item-icon', targets: [
        $('#loadImage-item'),
      ]},
      {case: 'shortcut-icon', targets: [
        $('#loadImage-actor'),
        $('#loadImage-key'),
      ]},
      {case: 'base64', targets: [
        $('#loadImage-variable'),
      ]},
    ])
  },
  parse: function ({element, type, actor, skill, state, equipment, item, key, variable}) {
    const words = Command.words.push(Command.parseElement(element))
    const label = Local.get('command.loadImage.' + type)
    let content
    switch (type) {
      case 'actor-portrait':
        content = Command.parseActor(actor)
        break
      case 'skill-icon':
        content = Command.parseSkill(skill)
        break
      case 'state-icon':
        content = Command.parseState(state)
        break
      case 'equipment-icon':
        content = Command.parseEquipment(equipment)
        break
      case 'item-icon':
        content = Command.parseItem(item)
        break
      case 'shortcut-icon': {
        const actorInfo = Command.parseActor(actor)
        const shortcutKey = Command.parseVariableEnum('shortcut-key', key)
        content = actorInfo + Token(' -> ') + shortcutKey
        break
      }
      case 'base64':
        content = Command.parseVariable(variable, 'string')
        break
    }
    words.push(label + Token('(') + content + Token(')'))
    return [
      {color: 'element'},
      {text: Local.get('command.loadImage') + Token(': ')},
      {text: words.join()},
    ]
  },
  load: function ({
    element   = {type: 'trigger'},
    type      = 'actor-portrait',
    actor     = {type: 'trigger'},
    skill     = {type: 'trigger'},
    state     = {type: 'trigger'},
    equipment = {type: 'trigger'},
    item      = {type: 'trigger'},
    key       = Enum.getDefStringId('shortcut-key'),
    variable  = {type: 'local', key: ''},
  }) {
    // 加载快捷键选项
    $('#loadImage-key').loadItems(
      Enum.getStringItems('shortcut-key')
    )
    const write = getElementWriter('loadImage')
    write('element', element)
    write('type', type)
    write('actor', actor)
    write('skill', skill)
    write('state', state)
    write('equipment', equipment)
    write('item', item)
    write('key', key)
    write('variable', variable)
    $('#loadImage-element').getFocus()
  },
  save: function () {
    const read = getElementReader('loadImage')
    const element = read('element')
    const type = read('type')
    switch (type) {
      case 'actor-portrait': {
        const actor = read('actor')
        Command.save({element, type, actor})
        break
      }
      case 'skill-icon': {
        const skill = read('skill')
        Command.save({element, type, skill})
        break
      }
      case 'state-icon': {
        const state = read('state')
        Command.save({element, type, state})
        break
      }
      case 'equipment-icon': {
        const equipment = read('equipment')
        Command.save({element, type, equipment})
        break
      }
      case 'item-icon': {
        const item = read('item')
        Command.save({element, type, item})
        break
      }
      case 'shortcut-icon': {
        const actor = read('actor')
        const key = read('key')
        Command.save({element, type, actor, key})
        break
      }
      case 'base64': {
        const variable = read('variable')
        if (VariableGetter.isNone(variable)) {
          return $('#loadImage-variable').getFocus()
        }
        Command.save({element, type, variable})
        break
      }
    }
  },
}

// 改变图像色调
Command.cases.tintImage = {
  initialize: function () {
    $('#tintImage-confirm').on('click', this.save)

    // 创建模式选项
    $('#tintImage-mode').loadItems([
      {name: 'Full', value: 'full'},
      {name: 'RGB', value: 'rgb'},
      {name: 'Gray', value: 'gray'},
    ])

    // 设置模式关联元素
    $('#tintImage-mode').enableHiddenMode().relate([
      {case: 'full', targets: [
        $('#tintImage-tint-0'),
        $('#tintImage-tint-1'),
        $('#tintImage-tint-2'),
        $('#tintImage-tint-3'),
      ]},
      {case: 'rgb', targets: [
        $('#tintImage-tint-0'),
        $('#tintImage-tint-1'),
        $('#tintImage-tint-2'),
      ]},
      {case: 'gray', targets: [
        $('#tintImage-tint-3'),
      ]},
    ])

    // 创建等待结束选项
    $('#tintImage-wait').loadItems([
      {name: 'Yes', value: true},
      {name: 'No', value: false},
    ])

    // 创建过渡方式选项 - 窗口打开事件
    $('#tintImage').on('open', function (event) {
      $('#tintImage-easingId').loadItems(
        Data.createEasingItems()
      )
    })

    // 清理内存 - 窗口已关闭事件
    $('#tintImage').on('closed', function (event) {
      $('#tintImage-easingId').clear()
      $('#tintImage-filter').clear()
    })

    // 写入滤镜框 - 色调输入框输入事件
    $('#tintImage-mode, #tintImage-tint-0, #tintImage-tint-1, #tintImage-tint-2, #tintImage-tint-3')
    .on('input', function (event) {
      const tint = [0, 0, 0, 0]
      const read = getElementReader('tintImage')
      switch (read('mode')) {
        case 'full':
          tint[0] = read('tint-0')
          tint[1] = read('tint-1')
          tint[2] = read('tint-2')
          tint[3] = read('tint-3')
          break
        case 'rgb':
          tint[0] = read('tint-0')
          tint[1] = read('tint-1')
          tint[2] = read('tint-2')
          break
        case 'gray':
          tint[3] = read('tint-3')
          break
      }
      $('#tintImage-filter').write(tint)
    })
  },
  parseTint: function (mode, [red, green, blue, gray]) {
    const label = Local.get('command.tintImage.' + mode)
    const _red = Command.setNumberColor(red)
    const _green = Command.setNumberColor(green)
    const _blue = Command.setNumberColor(blue)
    const _gray = Command.setNumberColor(gray)
    switch (mode) {
      case 'full':
        return label + Token('(') + _red + Token(', ') + _green + Token(', ') + _blue + Token(', ') + _gray + Token(')')
      case 'rgb':
        return label + Token('(') + _red + Token(', ') + _green + Token(', ') + _blue + Token(')')
      case 'gray':
        return label + Token('(') + _gray + Token(')')
    }
  },
  parse: function ({element, mode, tint, easingId, duration, wait}) {
    const words = Command.words
    .push(Command.parseElement(element))
    .push(this.parseTint(mode, tint))
    .push(Command.parseEasing(easingId, duration, wait))
    return [
      {color: 'element'},
      {text: Local.get('command.tintImage') + Token(': ')},
      {text: words.join()},
    ]
  },
  load: function ({
    element   = {type: 'trigger'},
    mode      = 'full',
    tint      = [0, 0, 0, 0],
    easingId  = Data.easings[0].id,
    duration  = 0,
    wait      = false,
  }) {
    const write = getElementWriter('tintImage')
    write('element', element)
    write('mode', mode)
    write('tint-0', tint[0])
    write('tint-1', tint[1])
    write('tint-2', tint[2])
    write('tint-3', tint[3])
    write('filter', tint)
    write('easingId', easingId)
    write('duration', duration)
    write('wait', wait)
    $('#tintImage-element').getFocus()
  },
  save: function () {
    const read = getElementReader('tintImage')
    const element = read('element')
    const mode = read('mode')
    let red = read('tint-0')
    let green = read('tint-1')
    let blue = read('tint-2')
    let gray = read('tint-3')
    switch (mode) {
      case 'full':
        break
      case 'rgb':
        gray = 0
        break
      case 'gray':
        red = 0
        green = 0
        blue = 0
        break
    }
    const easingId = read('easingId')
    const duration = read('duration')
    const wait = read('wait')
    const tint = [red, green, blue, gray]
    Command.save({element, mode, tint, easingId, duration, wait})
  },
}

// 设置文本
Command.cases.setText = {
  initialize: function () {
    $('#setText-confirm').on('click', this.save)

    // 绑定属性列表
    $('#setText-properties').bind(TextProperty)

    // 清理内存 - 窗口已关闭事件
    $('#setText').on('closed', event => {
      $('#setText-properties').clear()
    })
  },
  parse: function ({element, properties}) {
    const words = Command.words
    .push(Command.parseElement(element))
    for (const property of properties) {
      words.push(TextProperty.parse(property))
    }
    return [
      {color: 'element'},
      {text: Local.get('command.setText') + Token(': ')},
      {text: words.join()},
    ]
  },
  load: function ({
    element     = {type: 'trigger'},
    properties  = [],
  }) {
    const write = getElementWriter('setText')
    write('element', element)
    write('properties', properties.slice())
    $('#setText-element').getFocus()
  },
  save: function () {
    const read = getElementReader('setText')
    const element = read('element')
    const properties = read('properties')
    if (properties.length === 0) {
      return $('#setText-properties').getFocus()
    }
    Command.save({element, properties})
  },
}

// 设置文本框
Command.cases.setTextBox = {
  initialize: function () {
    $('#setTextBox-confirm').on('click', this.save)

    // 绑定属性列表
    $('#setTextBox-properties').bind(TextBoxProperty)

    // 清理内存 - 窗口已关闭事件
    $('#setTextBox').on('closed', event => {
      $('#setTextBox-properties').clear()
    })
  },
  parse: function ({element, properties}) {
    const words = Command.words
    .push(Command.parseElement(element))
    for (const property of properties) {
      words.push(TextBoxProperty.parse(property))
    }
    return [
      {color: 'element'},
      {text: Local.get('command.setTextBox') + Token(': ')},
      {text: words.join()},
    ]
  },
  load: function ({
    element     = {type: 'trigger'},
    properties  = [],
  }) {
    const write = getElementWriter('setTextBox')
    write('element', element)
    write('properties', properties.slice())
    $('#setTextBox-element').getFocus()
  },
  save: function () {
    const read = getElementReader('setTextBox')
    const element = read('element')
    const properties = read('properties')
    if (properties.length === 0) {
      return $('#setTextBox-properties').getFocus()
    }
    Command.save({element, properties})
  },
}

// 设置对话框
Command.cases.setDialogBox = {
  initialize: function () {
    $('#setDialogBox-confirm').on('click', this.save)

    // 绑定属性列表
    $('#setDialogBox-properties').bind(DialogBoxProperty)

    // 清理内存 - 窗口已关闭事件
    $('#setDialogBox').on('closed', event => {
      $('#setDialogBox-properties').clear()
    })
  },
  parse: function ({element, properties}) {
    const words = Command.words
    .push(Command.parseElement(element))
    for (const property of properties) {
      words.push(DialogBoxProperty.parse(property))
    }
    return [
      {color: 'element'},
      {text: Local.get('command.setDialogBox') + Token(': ')},
      {text: words.join()},
    ]
  },
  load: function ({
    element     = {type: 'trigger'},
    properties  = [],
  }) {
    const write = getElementWriter('setDialogBox')
    write('element', element)
    write('properties', properties.slice())
    $('#setDialogBox-element').getFocus()
  },
  save: function () {
    const read = getElementReader('setDialogBox')
    const element = read('element')
    const properties = read('properties')
    if (properties.length === 0) {
      return $('#setDialogBox-properties').getFocus()
    }
    Command.save({element, properties})
  },
}

// 控制对话框
Command.cases.controlDialog = {
  initialize: function () {
    $('#controlDialog-confirm').on('click', this.save)

    // 创建操作选项
    $('#controlDialog-operation').loadItems([
      {name: 'Pause Printing', value: 'pause'},
      {name: 'Continue Printing', value: 'continue'},
      {name: 'Print Immediately', value: 'print-immediately'},
      {name: 'Print Next Page', value: 'print-next-page'},
    ])
  },
  parse: function ({element, operation}) {
    const words = Command.words
    .push(Command.parseElement(element))
    .push(Local.get('command.controlDialog.' + operation))
    return [
      {color: 'element'},
      {text: Local.get('command.controlDialog') + Token(': ')},
      {text: words.join()},
    ]
  },
  load: function ({
    element   = {type: 'trigger'},
    operation = 'pause',
  }) {
    const write = getElementWriter('controlDialog')
    write('element', element)
    write('operation', operation)
    $('#controlDialog-element').getFocus()
  },
  save: function () {
    const read = getElementReader('controlDialog')
    const element = read('element')
    const operation = read('operation')
    Command.save({element, operation})
  },
}

// 设置进度条
Command.cases.setProgressBar = {
  initialize: function () {
    $('#setProgressBar-confirm').on('click', this.save)

    // 绑定属性列表
    $('#setProgressBar-properties').bind(ProgressBarProperty)

    // 清理内存 - 窗口已关闭事件
    $('#setProgressBar').on('closed', event => {
      $('#setProgressBar-properties').clear()
    })
  },
  parse: function ({element, properties}) {
    const words = Command.words
    .push(Command.parseElement(element))
    for (const property of properties) {
      words.push(ProgressBarProperty.parse(property))
    }
    return [
      {color: 'element'},
      {text: Local.get('command.setProgressBar') + Token(': ')},
      {text: words.join()},
    ]
  },
  load: function ({
    element     = {type: 'trigger'},
    properties  = [],
  }) {
    const write = getElementWriter('setProgressBar')
    write('element', element)
    write('properties', properties.slice())
    $('#setProgressBar-element').getFocus()
  },
  save: function () {
    const read = getElementReader('setProgressBar')
    const element = read('element')
    const properties = read('properties')
    if (properties.length === 0) {
      return $('#setProgressBar-properties').getFocus()
    }
    Command.save({element, properties})
  },
}

// 设置按钮
Command.cases.setButton = {
  initialize: function () {
    $('#setButton-confirm').on('click', this.save)

    // 绑定属性列表
    $('#setButton-properties').bind(ButtonProperty)

    // 清理内存 - 窗口已关闭事件
    $('#setButton').on('closed', event => {
      $('#setButton-properties').clear()
    })
  },
  parse: function ({element, properties}) {
    const words = Command.words
    .push(Command.parseElement(element))
    for (const property of properties) {
      words.push(ButtonProperty.parse(property))
    }
    return [
      {color: 'element'},
      {text: Local.get('command.setButton') + Token(': ')},
      {text: words.join()},
    ]
  },
  load: function ({
    element     = {type: 'trigger'},
    properties  = [],
  }) {
    const write = getElementWriter('setButton')
    write('element', element)
    write('properties', properties.slice())
    $('#setButton-element').getFocus()
  },
  save: function () {
    const read = getElementReader('setButton')
    const element = read('element')
    const properties = read('properties')
    if (properties.length === 0) {
      return $('#setButton-properties').getFocus()
    }
    Command.save({element, properties})
  },
}

// 控制按钮
Command.cases.controlButton = {
  initialize: function () {
    $('#controlButton-confirm').on('click', this.save)

    // 创建操作选项
    $('#controlButton-operation').loadItems([
      {name: 'Select Default Button', value: 'select-default'},
      {name: 'Select Button', value: 'select'},
      {name: 'Display Hover Mode', value: 'hover-mode'},
      {name: 'Display Active Mode', value: 'active-mode'},
      {name: 'Restore Display Mode', value: 'normal-mode'},
    ])

    // 设置操作关联元素
    $('#controlButton-operation').enableHiddenMode().relate([
      {case: ['select', 'hover-mode', 'active-mode', 'normal-mode'], targets: [
        $('#controlButton-element'),
      ]},
    ])
  },
  parse: function ({operation, element}) {
    const words = Command.words
    .push(Local.get('command.controlButton.' + operation))
    switch (operation) {
      case 'select':
      case 'hover-mode':
      case 'active-mode':
      case 'normal-mode':
        words.push(Command.parseElement(element))
        break
    }
    return [
      {color: 'element'},
      {text: Local.get('command.controlButton') + Token(': ')},
      {text: words.join()},
    ]
  },
  load: function ({
    operation = 'select-default',
    element   = {type: 'trigger'},
  }) {
    const write = getElementWriter('controlButton')
    write('operation', operation)
    write('element', element)
    $('#controlButton-operation').getFocus()
  },
  save: function () {
    const read = getElementReader('controlButton')
    const operation = read('operation')
    switch (operation) {
      case 'select-default':
        Command.save({operation})
        break
      case 'select':
      case 'hover-mode':
      case 'active-mode':
      case 'normal-mode': {
        const element = read('element')
        Command.save({operation, element})
        break
      }
    }
  },
}

// 设置动画
Command.cases.setAnimation = {
  initialize: function () {
    $('#setAnimation-confirm').on('click', this.save)

    // 绑定属性列表
    $('#setAnimation-properties').bind(AnimationProperty)

    // 清理内存 - 窗口已关闭事件
    $('#setAnimation').on('closed', event => {
      $('#setAnimation-properties').clear()
    })
  },
  parse: function ({element, properties}) {
    const words = Command.words
    .push(Command.parseElement(element))
    for (const property of properties) {
      words.push(AnimationProperty.parse(property))
    }
    return [
      {color: 'element'},
      {text: Local.get('command.setAnimation') + Token(': ')},
      {text: words.join()},
    ]
  },
  load: function ({
    element     = {type: 'trigger'},
    properties  = [],
  }) {
    const write = getElementWriter('setAnimation')
    write('element', element)
    write('properties', properties.slice())
    $('#setAnimation-element').getFocus()
  },
  save: function () {
    const read = getElementReader('setAnimation')
    const element = read('element')
    const properties = read('properties')
    if (properties.length === 0) {
      return $('#setAnimation-properties').getFocus()
    }
    Command.save({element, properties})
  },
}

// 设置视频
Command.cases.setVideo = {
  initialize: function () {
    $('#setVideo-confirm').on('click', this.save)

    // 绑定属性列表
    $('#setVideo-properties').bind(VideoProperty)

    // 清理内存 - 窗口已关闭事件
    $('#setVideo').on('closed', event => {
      $('#setVideo-properties').clear()
    })
  },
  parse: function ({element, properties}) {
    const words = Command.words
    .push(Command.parseElement(element))
    for (const property of properties) {
      words.push(VideoProperty.parse(property))
    }
    return [
      {color: 'element'},
      {text: Local.get('command.setVideo') + Token(': ')},
      {text: words.join()},
    ]
  },
  load: function ({
    element     = {type: 'trigger'},
    properties  = [],
  }) {
    const write = getElementWriter('setVideo')
    write('element', element)
    write('properties', properties.slice())
    $('#setVideo-element').getFocus()
  },
  save: function () {
    const read = getElementReader('setVideo')
    const element = read('element')
    const properties = read('properties')
    if (properties.length === 0) {
      return $('#setVideo-properties').getFocus()
    }
    Command.save({element, properties})
  },
}

// 设置窗口
Command.cases.setWindow = {
  initialize: function () {
    $('#setWindow-confirm').on('click', this.save)

    // 绑定属性列表
    $('#setWindow-properties').bind(WindowProperty)

    // 清理内存 - 窗口已关闭事件
    $('#setWindow').on('closed', event => {
      $('#setWindow-properties').clear()
    })
  },
  parse: function ({element, properties}) {
    const words = Command.words
    .push(Command.parseElement(element))
    for (const property of properties) {
      words.push(WindowProperty.parse(property))
    }
    return [
      {color: 'element'},
      {text: Local.get('command.setWindow') + Token(': ')},
      {text: words.join()},
    ]
  },
  load: function ({
    element     = {type: 'trigger'},
    properties  = [],
  }) {
    const write = getElementWriter('setWindow')
    write('element', element)
    write('properties', properties.slice())
    $('#setWindow-element').getFocus()
  },
  save: function () {
    const read = getElementReader('setWindow')
    const element = read('element')
    const properties = read('properties')
    if (properties.length === 0) {
      return $('#setWindow-properties').getFocus()
    }
    Command.save({element, properties})
  },
}

// 等待视频结束
Command.cases.waitForVideo = {
  initialize: function () {
    $('#waitForVideo-confirm').on('click', this.save)
  },
  parse: function ({element}) {
    return [
      {color: 'element'},
      {text: Local.get('command.waitForVideo') + Token(': ')},
      {text: Command.parseElement(element)},
    ]
  },
  load: function ({element = {type: 'trigger'}}) {
    $('#waitForVideo-element').write(element)
    $('#waitForVideo-element').getFocus()
  },
  save: function () {
    const element = $('#waitForVideo-element').read()
    Command.save({element})
  },
}

// 设置元素
Command.cases.setElement = {
  initialize: function () {
    $('#setElement-confirm').on('click', this.save)

    // 创建操作选项
    $('#setElement-operation').loadItems([
      {name: 'Hide', value: 'hide'},
      {name: 'Show', value: 'show'},
      {name: 'Disable Pointer Events', value: 'disable-pointer-events'},
      {name: 'Enable Pointer Events', value: 'enable-pointer-events'},
      {name: 'Skip Pointer Events', value: 'skip-pointer-events'},
      {name: 'Move to First', value: 'move-to-first'},
      {name: 'Move to Last', value: 'move-to-last'},
    ])
  },
  parse: function ({element, operation}) {
    const words = Command.words
    .push(Command.parseElement(element))
    .push(Local.get('command.setElement.' + operation))
    return [
      {color: 'element'},
      {text: Local.get('command.setElement.alias') + Token(': ')},
      {text: words.join()},
    ]
  },
  load: function ({
    element   = {type: 'trigger'},
    operation = 'hide',
  }) {
    const write = getElementWriter('setElement')
    write('element', element)
    write('operation', operation)
    $('#setElement-element').getFocus()
  },
  save: function () {
    const read = getElementReader('setElement')
    const element = read('element')
    const operation = read('operation')
    Command.save({element, operation})
  },
}

// 嵌套元素
Command.cases.nestElement = {
  initialize: function () {
    $('#nestElement-confirm').on('click', this.save)
  },
  parse: function ({parent, child}) {
    const pElement = Command.parseElement(parent)
    const cElement = Command.parseElement(child)
    return [
      {color: 'element'},
      {text: Local.get('command.nestElement') + Token(': ')},
      {text: pElement + Token(' -> ') + cElement},
    ]
  },
  load: function ({
    parent  = {type: 'trigger'},
    child   = {type: 'latest'},
  }) {
    $('#nestElement-parent').write(parent)
    $('#nestElement-child').write(child)
    $('#nestElement-parent').getFocus()
  },
  save: function () {
    const parent = $('#nestElement-parent').read()
    const child = $('#nestElement-child').read()
    Command.save({parent, child})
  },
}

// 移动元素
Command.cases.moveElement = {
  initialize: function () {
    $('#moveElement-confirm').on('click', this.save)

    // 绑定属性列表
    $('#moveElement-properties').bind(TransformProperty)

    // 创建等待结束选项
    $('#moveElement-wait').loadItems([
      {name: 'Yes', value: true},
      {name: 'No', value: false},
    ])

    // 创建过渡方式选项 - 窗口打开事件
    $('#moveElement').on('open', function (event) {
      $('#moveElement-easingId').loadItems(
        Data.createEasingItems()
      )
    })

    // 清理内存 - 窗口已关闭事件
    $('#moveElement').on('closed', function (event) {
      $('#moveElement-properties').clear()
      $('#moveElement-easingId').clear()
    })
  },
  parse: function ({element, properties, easingId, duration, wait}) {
    const words = Command.words
    .push(Command.parseElement(element))
    for (const property of properties) {
      words.push(TransformProperty.parse(property))
    }
    words.push(Command.parseEasing(easingId, duration, wait))
    return [
      {color: 'element'},
      {text: Local.get('command.moveElement') + Token(': ')},
      {text: words.join()},
    ]
  },
  load: function ({
    element     = {type: 'trigger'},
    properties  = [],
    easingId    = Data.easings[0].id,
    duration    = 0,
    wait        = false,
  }) {
    const write = getElementWriter('moveElement')
    write('element', element)
    write('properties', properties.slice())
    write('easingId', easingId)
    write('duration', duration)
    write('wait', wait)
    $('#moveElement-element').getFocus()
  },
  save: function () {
    const read = getElementReader('moveElement')
    const element = read('element')
    const properties = read('properties')
    if (properties.length === 0) {
      return $('#moveElement-properties').getFocus()
    }
    const easingId = read('easingId')
    const duration = read('duration')
    const wait = read('wait')
    Command.save({element, properties, easingId, duration, wait})
  },
}

// 删除元素
Command.cases.deleteElement = {
  initialize: function () {
    $('#deleteElement-confirm').on('click', this.save)

    // 创建操作选项
    $('#deleteElement-operation').loadItems([
      {name: 'Delete Element', value: 'delete-element'},
      {name: 'Delete Children', value: 'delete-children'},
      {name: 'Delete All', value: 'delete-all'},
    ])

    // 设置操作关联元素
    $('#deleteElement-operation').enableHiddenMode().relate([
      {case: ['delete-element', 'delete-children'], targets: [
        $('#deleteElement-element'),
      ]},
    ])
  },
  parse: function ({operation, element}) {
    let info
    switch (operation) {
      case 'delete-element':
        info = Command.parseElement(element)
        break
      case 'delete-children':
        info = Command.parseElement(element) + Token(' -> ') + Local.get('command.deleteElement.children')
        break
      case 'delete-all':
        info = Local.get('command.deleteElement.all-elements')
        break
    }
    return [
      {color: 'element'},
      {text: Local.get('command.deleteElement') + Token(': ')},
      {text: info},
    ]
  },
  load: function ({
    operation = 'delete-element',
    element   = {type: 'trigger'},
  }) {
    $('#deleteElement-operation').write(operation)
    $('#deleteElement-element').write(element)
    $('#deleteElement-operation').getFocus()
  },
  save: function () {
    const operation = $('#deleteElement-operation').read()
    switch (operation) {
      case 'delete-element':
      case 'delete-children': {
        const element = $('#deleteElement-element').read()
        Command.save({operation, element})
        break
      }
      case 'delete-all':
        Command.save({operation})
        break
    }
  },
}

// 设置指针事件根元素
Command.cases.setPointerEventRoot = {
  initialize: function () {
    $('#setPointerEventRoot-confirm').on('click', this.save)

    // 创建操作选项
    $('#setPointerEventRoot-operation').loadItems([
      {name: 'Add Root Element', value: 'add'},
      {name: 'Remove Root Element', value: 'remove'},
      {name: 'Remove The Latest Root Element', value: 'remove-latest'},
      {name: 'Reset', value: 'reset'},
    ])

    // 设置操作关联元素
    $('#setPointerEventRoot-operation').enableHiddenMode().relate([
      {case: ['add', 'remove'], targets: [
        $('#setPointerEventRoot-element'),
      ]},
    ])
  },
  parse: function ({operation, element}) {
    // 补丁：2023-3-19
    if (operation === 'set') {
      operation = 'add'
    }
    const words = Command.words
    .push(Local.get('command.setPointerEventRoot.' + operation))
    switch (operation) {
      case 'add':
      case 'remove':
        words.push(Command.parseElement(element))
        break
    }
    return [
      {color: 'element'},
      {text: Local.get('command.setPointerEventRoot') + Token(': ')},
      {text: words.join()},
    ]
  },
  load: function ({
    operation = 'add',
    element   = {type: 'trigger'},
  }) {
    // 补丁：2023-3-19
    if (operation === 'set') {
      operation = 'add'
    }
    $('#setPointerEventRoot-operation').write(operation)
    $('#setPointerEventRoot-element').write(element)
    $('#setPointerEventRoot-operation').getFocus()
  },
  save: function () {
    const operation = $('#setPointerEventRoot-operation').read()
    switch (operation) {
      case 'add':
      case 'remove': {
        const element = $('#setPointerEventRoot-element').read()
        Command.save({operation, element})
        break
      }
      case 'remove-latest':
      case 'reset':
        Command.save({operation})
        break
    }
  },
}

// 设置焦点
Command.cases.setFocus = {
  initialize: function () {
    $('#setFocus-confirm').on('click', this.save)

    // 创建操作选项
    $('#setFocus-operation').loadItems([
      {name: 'Add Focus', value: 'add'},
      {name: 'Remove Focus', value: 'remove'},
      {name: 'Remove The Latest Focus', value: 'remove-latest'},
      {name: 'Reset', value: 'reset'},
    ])

    // 创建模式选项
    $('#setFocus-mode').loadItems([
      {name: 'Control Child Buttons', value: 'control-child-buttons'},
      {name: 'Control Descendant Buttons', value: 'control-descendant-buttons'},
    ])

    // 设置操作关联元素
    $('#setFocus-operation').enableHiddenMode().relate([
      {case: 'add', targets: [
        $('#setFocus-element'),
        $('#setFocus-mode'),
        $('#setFocus-cancelable'),
      ]},
      {case: 'remove', targets: [
        $('#setFocus-element'),
      ]},
    ])
  },
  parse: function ({operation, element, mode, cancelable}) {
    const words = Command.words
    .push(Local.get('command.setFocus.' + operation))
    switch (operation) {
      case 'add':
        // 补丁：2023-3-21
        if (mode === undefined) {
          mode = 'control-child-buttons'
        }
        words.push(Command.parseElement(element))
        words.push(Local.get('command.setFocus.' + mode))
        if (cancelable) {
          words.push(Local.get('command.setFocus.cancelable'))
        }
        break
      case 'remove':
        words.push(Command.parseElement(element))
        break
    }
    return [
      {color: 'element'},
      {text: Local.get('command.setFocus') + Token(': ')},
      {text: words.join()},
    ]
  },
  load: function ({
    operation   = 'add',
    element     = {type: 'trigger'},
    mode        = 'control-child-buttons',
    cancelable  = true,
  }) {
    $('#setFocus-operation').write(operation)
    $('#setFocus-element').write(element)
    $('#setFocus-mode').write(mode)
    $('#setFocus-cancelable').write(cancelable)
    $('#setFocus-operation').getFocus()
  },
  save: function () {
    const read = getElementReader('setFocus')
    const operation = read('operation')
    switch (operation) {
      case 'add': {
        const element = read('element')
        const mode = read('mode')
        const cancelable = read('cancelable')
        Command.save({operation, element, mode, cancelable})
        break
      }
      case 'remove': {
        const element = read('element')
        Command.save({operation, element})
        break
      }
      case 'remove-latest':
      case 'reset':
        Command.save({operation})
        break
    }
  },
}

// 创建对象
Command.cases.createObject = {
  initialize: function () {
    $('#createObject-confirm').on('click', this.save)
  },
  parse: function ({presetId, position}) {
    const words = Command.words
    .push(Command.parsePresetObject(presetId))
    .push(Command.parsePosition(position))
    return [
      {color: 'object'},
      {text: Local.get('command.createObject') + Token(': ')},
      {text: words.join()},
    ]
  },
  load: function ({
    presetId  = '',
    position  = {type: 'actor', actor: {type: 'trigger'}},
  }) {
    const write = getElementWriter('createObject')
    write('presetId', presetId)
    write('position', position)
    $('#createObject-presetId').getFocus()
  },
  save: function () {
    const read = getElementReader('createObject')
    const presetId = read('presetId')
    if (presetId === '') {
      return $('#createObject-presetId').getFocus()
    }
    const position = read('position')
    Command.save({presetId, position})
  },
}

// 移动光源
Command.cases.moveLight = {
  initialize: function () {
    $('#moveLight-confirm').on('click', this.save)

    // 绑定属性列表
    $('#moveLight-properties').bind(LightProperty)

    // 创建等待选项
    $('#moveLight-wait').loadItems([
      {name: 'Yes', value: true},
      {name: 'No', value: false},
    ])

    // 创建过渡方式选项 - 窗口打开事件
    $('#moveLight').on('open', function (event) {
      $('#moveLight-easingId').loadItems(
        Data.createEasingItems()
      )
    })

    // 清理内存 - 窗口已关闭事件
    $('#moveLight').on('closed', function (event) {
      $('#moveLight-properties').clear()
      $('#moveLight-easingId').clear()
    })
  },
  parse: function ({light, properties, easingId, duration, wait}) {
    const words = Command.words
    .push(Command.parseLight(light))
    for (const property of properties) {
      words.push(LightProperty.parse(property))
    }
    words.push(Command.parseEasing(easingId, duration, wait))
    return [
      {color: 'object'},
      {text: Local.get('command.moveLight') + Token(': ')},
      {text: words.join()},
    ]
  },
  load: function ({
    light       = {type: 'trigger'},
    properties  = [],
    easingId    = Data.easings[0].id,
    duration    = 0,
    wait        = false,
  }) {
    const write = getElementWriter('moveLight')
    write('light', light)
    write('properties', properties.slice())
    write('easingId', easingId)
    write('duration', duration)
    write('wait', wait)
    $('#moveLight-light').getFocus()
  },
  save: function () {
    const read = getElementReader('moveLight')
    const light = read('light')
    const properties = read('properties')
    if (properties.length === 0) {
      return $('#moveLight-properties').getFocus()
    }
    const easingId = read('easingId')
    const duration = read('duration')
    const wait = read('wait')
    Command.save({light, properties, easingId, duration, wait})
  },
}

// 删除对象
Command.cases.deleteObject = {
  initialize: function () {
    $('#deleteObject-confirm').on('click', this.save)
  },
  parse: function ({object}) {
    return [
      {color: 'object'},
      {text: Local.get('command.deleteObject') + Token(': ')},
      {text: Command.parseObject(object)},
    ]
  },
  load: function ({object = {type: 'trigger'}}) {
    $('#deleteObject-object').write(object)
    $('#deleteObject-object').getFocus()
  },
  save: function () {
    const object = $('#deleteObject-object').read()
    Command.save({object})
  },
}

// 设置状态
Command.cases.setState = {
  initialize: function () {
    $('#setState-confirm').on('click', this.save)

    // 创建操作选项
    $('#setState-operation').loadItems([
      {name: 'Set Time', value: 'set-time'},
      {name: 'Increase Time', value: 'increase-time'},
      {name: 'Decrease Time', value: 'decrease-time'},
    ])
  },
  parseOperation: function (operation) {
    return Local.get('command.setState.' + operation)
  },
  parse: function ({state, operation, time}) {
    const words = Command.words
    .push(Command.parseState(state))
    .push(this.parseOperation(operation))
    .push(Command.parseVariableNumber(time, 'ms'))
    return [
      {color: 'object'},
      {text: Local.get('command.setState') + Token(': ')},
      {text: words.join()},
    ]
  },
  load: function ({
    state     = {type: 'trigger'},
    operation = 'set-time',
    time      = 0,
  }) {
    const write = getElementWriter('setState')
    write('state', state)
    write('operation', operation)
    write('time', time)
    $('#setState-state').getFocus()
  },
  save: function () {
    const read = getElementReader('setState')
    const state = read('state')
    const operation = read('operation')
    const time = read('time')
    Command.save({state, operation, time})
  },
}

// 播放动画
Command.cases.playAnimation = {
  initialize: function () {
    $('#playAnimation-confirm').on('click', this.save)

    // 创建模式选项
    $('#playAnimation-mode').loadItems([
      {name: 'Position', value: 'position'},
      {name: 'Actor', value: 'actor'},
    ])

    // 设置模式关联元素
    $('#playAnimation-mode').enableHiddenMode().relate([
      {case: 'position', targets: [
        $('#playAnimation-position'),
      ]},
      {case: 'actor', targets: [
        $('#playAnimation-actor'),
      ]},
    ])

    // 创建旋转选项
    $('#playAnimation-rotatable').loadItems([
      {name: 'Yes', value: true},
      {name: 'No', value: false},
    ])

    // 创建等待结束选项
    $('#playAnimation-wait').loadItems([
      {name: 'Yes', value: true},
      {name: 'No', value: false},
    ])

    // 动画ID - 写入事件
    $('#playAnimation-animationId').on('write', event => {
      const elMotion = $('#playAnimation-motion')
      elMotion.loadItems(Animation.getMotionListItems(event.value))
      elMotion.write2(elMotion.read())
    })
  },
  parseRotatable: function (rotatable) {
    return rotatable ? Local.get('command.playAnimation.rotatable') : ''
  },
  parsePriority: function (priority) {
    if (priority === 0) return ''
    const abs = Command.setNumberColor(Math.abs(priority))
    return priority > 0 ? Token('+') + abs : Token('-') + abs
  },
  parseOffsetY: function (offsetY) {
    if (offsetY === 0) return ''
    const abs = Command.setNumberColor(Math.abs(offsetY)) + 'px'
    return offsetY > 0 ? abs : Token('-') + abs
  },
  parse: function ({mode, position, actor, animationId, motion, rotatable, priority, offsetY, angle, speed, wait}) {
    const words = Command.words
    switch (mode) {
      case 'position':
        words.push(Command.parsePosition(position))
        break
      case 'actor': {
        const bind = Local.get('command.playAnimation.bind')
        words.push(bind + Token('(') + Command.parseActor(actor) + Token(')'))
        break
      }
    }
    words
    .push(Command.parseFileName(animationId))
    .push(Command.parseEnumString(motion))
    .push(this.parseRotatable(rotatable))
    .push(this.parsePriority(priority))
    .push(this.parseOffsetY(offsetY))
    .push(Command.parseVariableNumber(angle, '°'))
    .push(Command.parseVariableNumber(speed))
    .push(Command.parseWait(wait))
    return [
      {color: 'object'},
      {text: Local.get('command.playAnimation') + Token(': ')},
      {text: words.join()},
    ]
  },
  load: function ({
    mode        = 'position',
    position    = {type: 'actor', actor: {type: 'trigger'}},
    actor       = {type: 'trigger'},
    animationId = '',
    motion      = '',
    rotatable   = false,
    priority    = 0,
    offsetY     = 0,
    angle       = 0,
    speed       = 1,
    wait        = false,
  }) {
    const write = getElementWriter('playAnimation')
    write('mode', mode)
    write('position', position)
    write('actor', actor)
    write('animationId', animationId)
    write('motion', motion)
    write('rotatable', rotatable)
    write('priority', priority)
    write('offsetY', offsetY)
    write('angle', angle)
    write('speed', speed)
    write('wait', wait)
    $('#playAnimation-mode').getFocus()
  },
  save: function () {
    const read = getElementReader('playAnimation')
    const mode = read('mode')
    const animationId = read('animationId')
    const motion = read('motion')
    const rotatable = read('rotatable')
    const priority = read('priority')
    const offsetY = read('offsetY')
    const angle = read('angle')
    const speed = read('speed')
    const wait = read('wait')
    if (animationId === '') {
      return $('#playAnimation-animationId').getFocus()
    }
    if (motion === '') {
      return $('#playAnimation-motion').getFocus()
    }
    switch (mode) {
      case 'position': {
        const position = read('position')
        Command.save({mode, position, animationId, motion, rotatable, priority, offsetY, angle, speed, wait})
        break
      }
      case 'actor': {
        const actor = read('actor')
        Command.save({mode, actor, animationId, motion, rotatable, priority, offsetY, angle, speed, wait})
        break
      }
    }
  },
}

// 设置对象动画
Command.cases.setObjectAnimation = {
  initialize: function () {
    $('#setObjectAnimation-confirm').on('click', this.save)

    // 创建分类选项
    $('#setObjectAnimation-sort').loadItems([
      {name: 'Only Actor Animation', value: 'actor'},
      {name: 'All Animation Components', value: 'components'},
      {name: 'Trigger Animation', value: 'trigger'},
      {name: 'Scene Animation', value: 'animation'},
    ])

    // 设置动画关联元素
    $('#setObjectAnimation-sort').enableHiddenMode().relate([
      {case: ['actor', 'components'], targets: [
        $('#setObjectAnimation-actor'),
      ]},
      {case: 'trigger', targets: [
        $('#setObjectAnimation-trigger'),
      ]},
      {case: 'animation', targets: [
        $('#setObjectAnimation-animation'),
      ]},
    ])

    // 创建操作选项
    $('#setObjectAnimation-operation').loadItems([
      {name: 'Set Tint', value: 'set-tint'},
      {name: 'Set RGB', value: 'set-rgb'},
      {name: 'Set Gray', value: 'set-gray'},
      {name: 'Set Opacity', value: 'set-opacity'},
      {name: 'Set OffsetY', value: 'set-offsetY'},
      {name: 'Set Rotation', value: 'set-rotation'},
    ])

    // 设置操作关联元素
    $('#setObjectAnimation-operation').enableHiddenMode().relate([
      {case: 'set-tint', targets: [
        $('#setObjectAnimation-tint-0'),
        $('#setObjectAnimation-tint-1'),
        $('#setObjectAnimation-tint-2'),
        $('#setObjectAnimation-tint-3'),
      ]},
      {case: 'set-rgb', targets: [
        $('#setObjectAnimation-tint-0'),
        $('#setObjectAnimation-tint-1'),
        $('#setObjectAnimation-tint-2'),
      ]},
      {case: 'set-gray', targets: [
        $('#setObjectAnimation-tint-3'),
      ]},
      {case: 'set-opacity', targets: [
        $('#setObjectAnimation-opacity'),
      ]},
      {case: 'set-offsetY', targets: [
        $('#setObjectAnimation-offsetY'),
      ]},
      {case: 'set-rotation', targets: [
        $('#setObjectAnimation-rotation'),
      ]},
    ])

    // 创建等待结束选项
    $('#setObjectAnimation-wait').loadItems([
      {name: 'Yes', value: true},
      {name: 'No', value: false},
    ])

    // 创建过渡方式选项 - 窗口打开事件
    $('#setObjectAnimation').on('open', function (event) {
      $('#setObjectAnimation-easingId').loadItems(
        Data.createEasingItems()
      )
    })

    // 清理内存 - 窗口已关闭事件
    $('#setObjectAnimation').on('closed', function (event) {
      $('#setObjectAnimation-easingId').clear()
    })
  },
  parseTint: function (operation, [red, green, blue, gray]) {
    const label = Local.get('command.setObjectAnimation.' + operation)
    const _red = Command.setNumberColor(red)
    const _green = Command.setNumberColor(green)
    const _blue = Command.setNumberColor(blue)
    const _gray = Command.setNumberColor(gray)
    switch (operation) {
      case 'set-tint':
        return label + Token('(') + _red + Token(', ') + _green + Token(', ') + _blue + Token(', ') + _gray + Token(')')
      case 'set-rgb':
        return label + Token('(') + _red + Token(', ') + _green + Token(', ') + _blue + Token(')')
      case 'set-gray':
        return label + Token('(') + _gray + Token(')')
    }
  },
  parseProperty: function (operation, property) {
    const label = Local.get('command.setObjectAnimation.' + operation)
    return label + Token('(') + Command.parseVariableNumber(property) + Token(')')
  },
  parse: function ({sort, object, operation, tint, opacity, offsetY, rotation, easingId, duration, wait}) {
    const words = Command.words
    words.push(Local.get('command.setObjectAnimation.sort.' + sort))
    switch (sort) {
      case 'actor':
      case 'components':
        words.push(Command.parseActor(object))
        break
      case 'trigger':
        words.push(Command.parseTrigger(object))
        break
      case 'animation':
        words.push(Command.parseObject(object))
        break
    }
    switch (operation) {
      case 'set-tint':
      case 'set-rgb':
      case 'set-gray':
        words.push(this.parseTint(operation, tint))
        break
      case 'set-opacity':
        words.push(this.parseProperty(operation, opacity))
        break
      case 'set-offsetY':
        words.push(this.parseProperty(operation, offsetY))
        break
      case 'set-rotation':
        words.push(this.parseProperty(operation, rotation))
        break
    }
    words.push(Command.parseEasing(easingId, duration, wait))
    return [
      {color: 'object'},
      {text: Local.get('command.setObjectAnimation') + Token(': ')},
      {text: words.join()},
    ]
  },
  load: function ({
    sort      = 'actor',
    object    = {type: 'trigger'},
    operation = 'set-tint',
    tint      = [0, 0, 0, 0],
    opacity   = 1,
    offsetY   = 0,
    rotation  = 0,
    easingId  = Data.easings[0].id,
    duration  = 0,
    wait      = false,
  }) {
    const write = getElementWriter('setObjectAnimation')
    let actor = {type: 'trigger'}
    let trigger = {type: 'trigger'}
    let animation = {type: 'trigger'}
    switch (sort) {
      case 'actor':
      case 'components':
        actor = object
        break
      case 'trigger':
        trigger = object
        break
      case 'animation':
        animation = object
        break
    }
    write('sort', sort)
    write('actor', actor)
    write('trigger', trigger)
    write('animation', animation)
    write('operation', operation)
    write('tint-0', tint[0])
    write('tint-1', tint[1])
    write('tint-2', tint[2])
    write('tint-3', tint[3])
    write('opacity', opacity)
    write('offsetY', offsetY)
    write('rotation', rotation)
    write('easingId', easingId)
    write('duration', duration)
    write('wait', wait)
    $('#setObjectAnimation-sort').getFocus()
  },
  save: function () {
    const read = getElementReader('setObjectAnimation')
    const sort = read('sort')
    const operation = read('operation')
    let object
    let red = read('tint-0')
    let green = read('tint-1')
    let blue = read('tint-2')
    let gray = read('tint-3')
    switch (sort) {
      case 'actor':
      case 'components':
        object = read('actor')
        break
      case 'trigger':
        object = read('trigger')
        break
      case 'animation':
        object = read('animation')
        break
    }
    switch (operation) {
      case 'set-tint':
        break
      case 'set-rgb':
        gray = 0
        break
      case 'set-gray':
        red = 0
        green = 0
        blue = 0
        break
    }
    const easingId = read('easingId')
    const duration = read('duration')
    const wait = read('wait')
    if ('set-tint|set-rgb|set-gray'.includes(operation)) {
      const tint = [red, green, blue, gray]
      Command.save({sort, object, operation, tint, easingId, duration, wait})
    } else if (operation === 'set-opacity') {
      const opacity = read('opacity')
      Command.save({sort, object, operation, opacity, easingId, duration, wait})
    } else if (operation === 'set-offsetY') {
      const offsetY = read('offsetY')
      Command.save({sort, object, operation, offsetY, easingId, duration, wait})
    } else if (operation === 'set-rotation') {
      const rotation = read('rotation')
      Command.save({sort, object, operation, rotation, easingId, duration, wait})
    }
  },
}

// 播放音频
Command.cases.playAudio = {
  initialize: function () {
    $('#playAudio-confirm').on('click', this.save)

    // 创建类型选项
    $('#playAudio-type').loadItems([
      {name: 'BGM', value: 'bgm'},
      {name: 'BGS', value: 'bgs'},
      {name: 'CV', value: 'cv'},
      {name: 'SE', value: 'se'},
      {name: 'SE - Attenuated', value: 'se-attenuated'},
    ])

    // 设置类型关联元素
    $('#playAudio-type').enableHiddenMode().relate([
      {case: 'se-attenuated', targets: [
        $('#playAudio-location'),
      ]},
    ])
  },
  parse: function ({type, audio, volume, location}) {
    const words = Command.words
    .push(Command.parseAudioType(type))
    .push(Command.parseFileName(audio))
    .push(Command.setNumberColor(volume))
    switch (type) {
      case 'se-attenuated':
        words.push(Command.parsePosition(location))
        break
    }
    return [
      {color: 'audio'},
      {text: Local.get('command.playAudio') + Token(': ')},
      {text: words.join()},
    ]
  },
  load: function ({
    type      = 'se-attenuated',
    audio     = '',
    volume    = 1,
    location  = {type: 'actor', actor: {type: 'trigger'}},
  }) {
    const write = getElementWriter('playAudio')
    write('type', type)
    write('audio', audio)
    write('volume', volume)
    write('location', location)
    $('#playAudio-type').getFocus()
  },
  save: function () {
    const read = getElementReader('playAudio')
    const type = read('type')
    const audio = read('audio')
    const volume = read('volume')
    if (audio === '') {
      return $('#playAudio-audio').getFocus()
    }
    switch (type) {
      case 'bgm':
      case 'bgs':
      case 'cv':
      case 'se':
        Command.save({type, audio, volume})
        break
      case 'se-attenuated': {
        const location = read('location')
        Command.save({type, audio, volume, location})
        break
      }
    }
  },
}

// 停止播放音频
Command.cases.stopAudio = {
  initialize: function () {
    $('#stopAudio-confirm').on('click', this.save)

    // 创建类型选项
    $('#stopAudio-type').loadItems([
      {name: 'BGM', value: 'bgm'},
      {name: 'BGS', value: 'bgs'},
      {name: 'CV', value: 'cv'},
      {name: 'SE', value: 'se'},
      {name: 'ALL', value: 'all'},
    ])
  },
  parse: function ({type}) {
    const words = Command.words
    .push(Command.parseAudioType(type))
    return [
      {color: 'audio'},
      {text: Local.get('command.stopAudio') + Token(': ')},
      {text: words.join()},
    ]
  },
  load: function ({type = 'bgm'}) {
    const write = getElementWriter('stopAudio')
    write('type', type)
    $('#stopAudio-type').getFocus()
  },
  save: function () {
    const read = getElementReader('stopAudio')
    const type = read('type')
    Command.save({type})
  },
}

// 设置音量
Command.cases.setVolume = {
  initialize: function () {
    $('#setVolume-confirm').on('click', this.save)

    // 创建类型选项
    $('#setVolume-type').loadItems([
      {name: 'BGM', value: 'bgm'},
      {name: 'BGS', value: 'bgs'},
      {name: 'CV', value: 'cv'},
      {name: 'SE', value: 'se'},
    ])

    // 创建等待选项
    $('#setVolume-wait').loadItems([
      {name: 'Yes', value: true},
      {name: 'No', value: false},
    ])

    // 创建过渡方式选项 - 窗口打开事件
    $('#setVolume').on('open', function (event) {
      $('#setVolume-easingId').loadItems(
        Data.createEasingItems()
      )
    })

    // 清理内存 - 窗口已关闭事件
    $('#setVolume').on('closed', function (event) {
      $('#setVolume-easingId').clear()
    })
  },
  parse: function ({type, volume, easingId, duration, wait}) {
    const words = Command.words
    .push(Command.parseAudioType(type))
    .push(Command.parseVariableNumber(volume))
    .push(Command.parseEasing(easingId, duration, wait))
    return [
      {color: 'audio'},
      {text: Local.get('command.setVolume') + Token(': ')},
      {text: words.join()},
    ]
  },
  load: function ({
    type      = 'bgm',
    volume    = 1,
    easingId  = Data.easings[0].id,
    duration  = 0,
    wait      = false,
  }) {
    const write = getElementWriter('setVolume')
    write('type', type)
    write('volume', volume)
    write('easingId', easingId)
    write('duration', duration)
    write('wait', wait)
    $('#setVolume-type').getFocus()
  },
  save: function () {
    const read = getElementReader('setVolume')
    const type = read('type')
    const volume = read('volume')
    const easingId = read('easingId')
    const duration = read('duration')
    const wait = read('wait')
    Command.save({type, volume, easingId, duration, wait})
  },
}

// 设置声像
Command.cases.setPan = {
  initialize: function () {
    $('#setPan-confirm').on('click', this.save)

    // 创建类型选项
    $('#setPan-type').loadItems([
      {name: 'BGM', value: 'bgm'},
      {name: 'BGS', value: 'bgs'},
      {name: 'CV', value: 'cv'},
      {name: 'SE', value: 'se'},
    ])

    // 创建等待选项
    $('#setPan-wait').loadItems([
      {name: 'Yes', value: true},
      {name: 'No', value: false},
    ])

    // 创建过渡方式选项 - 窗口打开事件
    $('#setPan').on('open', function (event) {
      $('#setPan-easingId').loadItems(
        Data.createEasingItems()
      )
    })

    // 清理内存 - 窗口已关闭事件
    $('#setPan').on('closed', function (event) {
      $('#setPan-easingId').clear()
    })
  },
  parse: function ({type, pan, easingId, duration, wait}) {
    const words = Command.words
    .push(Command.parseAudioType(type))
    .push(Command.parseVariableNumber(pan))
    .push(Command.parseEasing(easingId, duration, wait))
    return [
      {color: 'audio'},
      {text: Local.get('command.setPan') + Token(': ')},
      {text: words.join()},
    ]
  },
  load: function ({
    type      = 'bgm',
    pan       = 0,
    easingId  = Data.easings[0].id,
    duration  = 0,
    wait      = false,
  }) {
    const write = getElementWriter('setPan')
    write('type', type)
    write('pan', pan)
    write('easingId', easingId)
    write('duration', duration)
    write('wait', wait)
    $('#setPan-type').getFocus()
  },
  save: function () {
    const read = getElementReader('setPan')
    const type = read('type')
    const pan = read('pan')
    const easingId = read('easingId')
    const duration = read('duration')
    const wait = read('wait')
    Command.save({type, pan, easingId, duration, wait})
  },
}

// 设置混响
Command.cases.setReverb = {
  initialize: function () {
    $('#setReverb-confirm').on('click', this.save)

    // 创建类型选项
    $('#setReverb-type').loadItems([
      {name: 'BGM', value: 'bgm'},
      {name: 'BGS', value: 'bgs'},
      {name: 'CV', value: 'cv'},
      {name: 'SE', value: 'se'},
    ])

    // 创建等待选项
    $('#setReverb-wait').loadItems([
      {name: 'Yes', value: true},
      {name: 'No', value: false},
    ])

    // 创建过渡方式选项 - 窗口打开事件
    $('#setReverb').on('open', function (event) {
      $('#setReverb-easingId').loadItems(
        Data.createEasingItems()
      )
    })

    // 清理内存 - 窗口已关闭事件
    $('#setReverb').on('closed', function (event) {
      $('#setReverb-easingId').clear()
    })
  },
  parse: function ({type, dry, wet, easingId, duration, wait}) {
    const words = Command.words
    .push(Command.parseAudioType(type))
    .push(Command.parseVariableNumber(dry))
    .push(Command.parseVariableNumber(wet))
    .push(Command.parseEasing(easingId, duration, wait))
    return [
      {color: 'audio'},
      {text: Local.get('command.setReverb') + Token(': ')},
      {text: words.join()},
    ]
  },
  load: function ({
    type      = 'bgm',
    dry       = 1,
    wet       = 0,
    easingId  = Data.easings[0].id,
    duration  = 0,
    wait      = false,
  }) {
    const write = getElementWriter('setReverb')
    write('type', type)
    write('dry', dry)
    write('wet', wet)
    write('easingId', easingId)
    write('duration', duration)
    write('wait', wait)
    $('#setReverb-type').getFocus()
  },
  save: function () {
    const read = getElementReader('setReverb')
    const type = read('type')
    const dry = read('dry')
    const wet = read('wet')
    const easingId = read('easingId')
    const duration = read('duration')
    const wait = read('wait')
    Command.save({type, dry, wet, easingId, duration, wait})
  },
}

// 设置循环
Command.cases.setLoop = {
  initialize: function () {
    $('#setLoop-confirm').on('click', this.save)

    // 创建类型选项
    $('#setLoop-type').loadItems([
      {name: 'BGM', value: 'bgm'},
      {name: 'BGS', value: 'bgs'},
      {name: 'CV', value: 'cv'},
    ])

    // 创建循环选项
    $('#setLoop-loop').loadItems([
      {name: 'Once', value: false},
      {name: 'Loop', value: true},
    ])
  },
  parseLoop: function (loop) {
    switch (loop) {
      case false: return Local.get('command.setLoop.once')
      case true:  return Local.get('command.setLoop.loop')
    }
  },
  parse: function ({type, loop}) {
    const words = Command.words
    .push(Command.parseAudioType(type))
    .push(this.parseLoop(loop))
    return [
      {color: 'audio'},
      {text: Local.get('command.setLoop') + Token(': ')},
      {text: words.join()},
    ]
  },
  load: function ({type = 'bgm', loop = false}) {
    const write = getElementWriter('setLoop')
    write('type', type)
    write('loop', loop)
    $('#setLoop-type').getFocus()
  },
  save: function () {
    const read = getElementReader('setLoop')
    const type = read('type')
    const loop = read('loop')
    Command.save({type, loop})
  },
}

// 保存音频
Command.cases.saveAudio = {
  initialize: function () {
    $('#saveAudio-confirm').on('click', this.save)

    // 创建类型选项
    $('#saveAudio-type').loadItems([
      {name: 'BGM', value: 'bgm'},
      {name: 'BGS', value: 'bgs'},
      {name: 'CV', value: 'cv'},
    ])
  },
  parse: function ({type}) {
    return [
      {color: 'audio'},
      {text: Local.get('command.saveAudio') + Token(': ')},
      {text: Command.parseAudioType(type)},
    ]
  },
  load: function ({type = 'bgm'}) {
    const write = getElementWriter('saveAudio')
    write('type', type)
    $('#saveAudio-type').getFocus()
  },
  save: function () {
    const read = getElementReader('saveAudio')
    const type = read('type')
    Command.save({type})
  },
}

// 恢复音频
Command.cases.restoreAudio = {
  initialize: function () {
    $('#restoreAudio-confirm').on('click', this.save)

    // 创建类型选项
    $('#restoreAudio-type').loadItems([
      {name: 'BGM', value: 'bgm'},
      {name: 'BGS', value: 'bgs'},
      {name: 'CV', value: 'cv'},
    ])
  },
  parse: function ({type}) {
    return [
      {color: 'audio'},
      {text: Local.get('command.restoreAudio') + Token(': ')},
      {text: Command.parseAudioType(type)},
    ]
  },
  load: function ({type = 'bgm'}) {
    const write = getElementWriter('restoreAudio')
    write('type', type)
    $('#restoreAudio-type').getFocus()
  },
  save: function () {
    const read = getElementReader('restoreAudio')
    const type = read('type')
    Command.save({type})
  },
}

// 创建角色
Command.cases.createActor = {
  initialize: function () {
    $('#createActor-confirm').on('click', this.save)

    // 创建队伍选项 - 窗口打开事件
    $('#createActor').on('open', function (event) {
      $('#createActor-teamId').loadItems(
        Data.createTeamItems()
      )
    })

    // 清理内存 - 窗口已关闭事件
    $('#createActor').on('closed', function (event) {
      $('#createActor-teamId').clear()
    })
  },
  parse: function ({actorId, teamId, position, angle}) {
    const words = Command.words
    .push(Command.parseFileName(actorId))
    .push(Command.parseTeam(teamId))
    .push(Command.parsePosition(position))
    .push(Command.parseVariableNumber(angle, '°'))
    return [
      {color: 'actor'},
      {text: Local.get('command.createActor') + Token(': ')},
      {text: words.join()},
    ]
  },
  load: function ({
    actorId   = '',
    teamId    = Data.teams.list[0].id,
    position  = {type: 'absolute', x: 0, y: 0},
    angle     = 0,
  }) {
    const write = getElementWriter('createActor')
    write('actorId', actorId)
    write('teamId', teamId)
    write('position', position)
    write('angle', angle)
    $('#createActor-actorId').getFocus('all')
  },
  save: function () {
    const read = getElementReader('createActor')
    const actorId = read('actorId')
    const teamId = read('teamId')
    const position = read('position')
    const angle = read('angle')
    if (actorId === '') {
      return $('#createActor-actorId').getFocus()
    }
    Command.save({actorId, teamId, position, angle})
  },
}

// 移动角色
Command.cases.moveActor = {
  initialize: function () {
    $('#moveActor-confirm').on('click', this.save)

    // 创建移动模式选项
    $('#moveActor-mode').loadItems([
      {name: 'Stop', value: 'stop'},
      {name: 'Keep', value: 'keep'},
      {name: 'Straight', value: 'straight'},
      {name: 'Navigate', value: 'navigate'},
      {name: 'Navigate - Bypass Actors', value: 'navigate-bypass'},
      {name: 'Teleport', value: 'teleport'},
    ])

    // 设置移动模式关联元素
    $('#moveActor-mode').enableHiddenMode().relate([
      {case: 'keep', targets: [
        $('#moveActor-angle'),
      ]},
      {case: ['straight', 'navigate', 'navigate-bypass'], targets: [
        $('#moveActor-destination'),
        $('#moveActor-wait'),
      ]},
      {case: 'teleport', targets: [
        $('#moveActor-destination'),
      ]},
    ])

    // 创建等待结束选项
    $('#moveActor-wait').loadItems([
      {name: 'Yes', value: true},
      {name: 'No', value: false},
    ])
  },
  parseMode: function (mode) {
    let string = Local.get('command.moveActor.mode.' + mode)
    if (mode === 'navigate-bypass') {
      string = string.replace('(', Token('(')).replace(')', Token(')'))
    }
    return string
  },
  parse: function ({actor, mode, angle, destination, wait}) {
    const words = Command.words
    .push(Command.parseActor(actor))
    .push(this.parseMode(mode))
    switch (mode) {
      case 'stop':
        break
      case 'keep':
        words.push(Command.parseVariableNumber(angle, '°'))
        break
      case 'straight':
      case 'navigate':
      case 'navigate-bypass':
        words.push(Command.parsePosition(destination))
        words.push(Command.parseWait(wait))
        break
      case 'teleport':
        words.push(Command.parsePosition(destination))
        break
    }
    return [
      {color: 'actor'},
      {text: Local.get('command.moveActor') + Token(': ')},
      {text: words.join()},
    ]
  },
  load: function ({
    actor       = {type: 'trigger'},
    mode        = 'straight',
    angle       = 0,
    destination = {type: 'absolute', x: 0, y: 0},
    wait        = false,
  }) {
    const write = getElementWriter('moveActor')
    write('actor', actor)
    write('mode', mode)
    write('angle', angle)
    write('destination', destination)
    write('wait', wait)
    $('#moveActor-actor').getFocus()
  },
  save: function () {
    const read = getElementReader('moveActor')
    const actor = read('actor')
    const mode = read('mode')
    switch (mode) {
      case 'stop':
        Command.save({actor, mode})
        break
      case 'keep': {
        const angle = read('angle')
        Command.save({actor, mode, angle})
        break
      }
      case 'straight':
      case 'navigate':
      case 'navigate-bypass': {
        const destination = read('destination')
        const wait = read('wait')
        Command.save({actor, mode, destination, wait})
        break
      }
      case 'teleport': {
        const destination = read('destination')
        Command.save({actor, mode, destination})
        break
      }
    }
  },
}

// 跟随角色
Command.cases.followActor = {
  initialize: function () {
    $('#followActor-confirm').on('click', this.save)

    // 创建模式选项
    $('#followActor-mode').loadItems([
      {name: 'Circle', value: 'circle'},
      {name: 'Rectangle', value: 'rectangle'},
    ])

    // 设置模式关联元素
    $('#followActor-mode').enableHiddenMode().relate([
      {case: 'circle', targets: [
        $('#followActor-offset'),
      ]},
      {case: 'rectangle', targets: [
        $('#followActor-vertDist'),
      ]},
    ])

    // 创建导航选项
    $('#followActor-navigate').loadItems([
      {name: 'Yes', value: true},
      {name: 'No', value: false},
    ])

    // 设置导航关联元素
    $('#followActor-navigate').enableHiddenMode().relate([
      {case: true, targets: [
        $('#followActor-bypass'),
      ]},
    ])

    // 创建绕过角色选项
    $('#followActor-bypass').loadItems([
      {name: 'Yes', value: true},
      {name: 'No', value: false},
    ])

    // 创建跟随一次选项
    $('#followActor-once').loadItems([
      {name: 'Yes', value: true},
      {name: 'No', value: false},
    ])

    // 设置跟随一次关联元素
    $('#followActor-once').enableHiddenMode().relate([
      {case: true, targets: [
        $('#followActor-wait'),
      ]},
    ])

    // 创建等待选项
    $('#followActor-wait').loadItems([
      {name: 'Yes', value: true},
      {name: 'No', value: false},
    ])
  },
  parseActors: function (actor, target) {
    const sActor = Command.parseActor(actor)
    const dActor = Command.parseActor(target)
    return sActor + Token(' -> ') + dActor
  },
  parse: function ({actor, target, mode, minDist, maxDist, offset, vertDist, bufferDist, navigate, bypass, once, wait}) {
    // 2025.3.5补丁
    if (bufferDist === undefined) {
      bufferDist = 0
    }
    const words = Command.words
    .push(this.parseActors(actor, target))
    .push(Local.get('command.followActor.mode.' + mode))
    .push(Command.parseVariableNumber(minDist) + Token(' ~ ') + Command.parseVariableNumber(maxDist))
    switch (mode) {
      case 'circle':
        words.push(Command.setNumberColor(offset.toString()))
        break
      case 'rectangle':
        words.push(Command.setNumberColor(vertDist.toString()))
        break
    }
    words.push(Command.setNumberColor(bufferDist.toString()))
    if (navigate) {
      words.push(Local.get('command.followActor.navigate'))
      if (bypass) {
        words.push(Local.get('command.followActor.bypass'))
      }
    }
    if (once) {
      words.push(Local.get('command.followActor.once'))
      words.push(Command.parseWait(wait))
    }
    return [
      {color: 'actor'},
      {text: Local.get('command.followActor') + Token(': ')},
      {text: words.join()},
    ]
  },
  load: function ({
    actor       = {type: 'trigger'},
    target      = {type: 'trigger'},
    mode        = 'circle',
    minDist     = 1,
    maxDist     = 2,
    offset      = 0,
    vertDist    = 0,
    bufferDist  = 0,
    navigate    = true,
    bypass      = false,
    once        = false,
    wait        = false,
  }) {
    const write = getElementWriter('followActor')
    write('actor', actor)
    write('target', target)
    write('mode', mode)
    write('minDist', minDist)
    write('maxDist', maxDist)
    write('offset', offset)
    write('vertDist', vertDist)
    write('bufferDist', bufferDist)
    write('navigate', navigate)
    write('bypass', bypass)
    write('once', once)
    write('wait', wait)
    $('#followActor-actor').getFocus()
  },
  save: function () {
    const read = getElementReader('followActor')
    const actor = read('actor')
    const target = read('target')
    const mode = read('mode')
    const minDist = read('minDist')
    const maxDist = read('maxDist')
    const bufferDist = read('bufferDist')
    const navigate = read('navigate')
    const bypass = navigate ? {bypass: read('bypass')} : {}
    const once = read('once')
    const wait = once ? read('wait') : false
    switch (mode) {
      case 'circle': {
        const offset = read('offset')
        Command.save({actor, target, mode, minDist, maxDist, offset, bufferDist, navigate, ...bypass, once, wait})
        break
      }
      case 'rectangle': {
        const vertDist = read('vertDist')
        Command.save({actor, target, mode, minDist, maxDist, vertDist, bufferDist, navigate, ...bypass, once, wait})
        break
      }
    }
  },
}

// 平移角色
Command.cases.translateActor = {
  initialize: function () {
    $('#translateActor-confirm').on('click', this.save)

    // 创建等待结束选项
    $('#translateActor-wait').loadItems([
      {name: 'Yes', value: true},
      {name: 'No', value: false},
    ])

    // 创建过渡方式选项 - 窗口打开事件
    $('#translateActor').on('open', function (event) {
      $('#translateActor-easingId').loadItems(
        Data.createEasingItems()
      )
    })

    // 清理内存 - 窗口已关闭事件
    $('#translateActor').on('closed', function (event) {
      $('#translateActor-easingId').clear()
    })
  },
  parse: function ({actor, angle, distance, easingId, duration, wait}) {
    const words = Command.words
    .push(Command.parseActor(actor))
    .push(Command.parseAngle(angle))
    .push(Command.parseVariableNumber(distance, 't'))
    .push(Command.parseEasing(easingId, duration, wait))
    return [
      {color: 'actor'},
      {text: Local.get('command.translateActor') + Token(': ')},
      {text: words.join()},
    ]
  },
  load: function ({
    actor     = {type: 'trigger'},
    angle     = {type: 'absolute', degrees: 0},
    distance  = 0,
    easingId  = Data.easings[0].id,
    duration  = 0,
    wait      = false,
  }) {
    const write = getElementWriter('translateActor')
    write('actor', actor)
    write('angle', angle)
    write('distance', distance)
    write('easingId', easingId)
    write('duration', duration)
    write('wait', wait)
    $('#translateActor-actor').getFocus()
  },
  save: function () {
    const read = getElementReader('translateActor')
    const actor = read('actor')
    const angle = read('angle')
    const distance = read('distance')
    const easingId = read('easingId')
    const duration = read('duration')
    const wait = read('wait')
    if (distance === 0) {
      return $('#translateActor-distance').getFocus('all')
    }
    Command.save({actor, angle, distance, easingId, duration, wait})
  },
}

// 增减仇恨值
Command.cases.changeThreat = {
  initialize: function () {
    $('#changeThreat-confirm').on('click', this.save)

    // 创建操作选项
    $('#changeThreat-operation').loadItems([
      {name: 'Increase', value: 'increase'},
      {name: 'Decrease', value: 'decrease'},
    ])
  },
  parseActors: function (actor, target) {
    const sActor = Command.parseActor(actor)
    const dActor = Command.parseActor(target)
    return sActor + Token(' -> ') + dActor
  },
  parseOperation: function (operation) {
    return Local.get('command.changeThreat.' + operation)
  },
  parse: function ({actor, target, operation, threat}) {
    const words = Command.words
    .push(this.parseActors(actor, target))
    .push(this.parseOperation(operation))
    .push(Command.parseVariableNumber(threat))
    return [
      {color: 'actor'},
      {text: Local.get('command.changeThreat') + Token(': ')},
      {text: words.join()},
    ]
  },
  load: function ({
    actor     = {type: 'trigger'},
    target    = {type: 'trigger'},
    operation = 'increase',
    threat    = 0,
  }) {
    const write = getElementWriter('changeThreat')
    write('actor', actor)
    write('target', target)
    write('operation', operation)
    write('threat', threat)
    $('#changeThreat-actor').getFocus()
  },
  save: function () {
    const read = getElementReader('changeThreat')
    const actor = read('actor')
    const target = read('target')
    const operation = read('operation')
    const threat = read('threat')
    Command.save({actor, target, operation, threat})
  },
}

// 设置体重
Command.cases.setWeight = {
  initialize: function () {
    $('#setWeight-confirm').on('click', this.save)
  },
  parse: function ({actor, weight}) {
    const words = Command.words
    .push(Command.parseActor(actor))
    .push(Command.parseVariableNumber(weight))
    return [
      {color: 'actor'},
      {text: Local.get('command.setWeight') + Token(': ')},
      {text: words.join()},
    ]
  },
  load: function ({
    actor   = {type: 'trigger'},
    weight  = 0,
  }) {
    const write = getElementWriter('setWeight')
    write('actor', actor)
    write('weight', weight)
    $('#setWeight-actor').getFocus()
  },
  save: function () {
    const read = getElementReader('setWeight')
    const actor = read('actor')
    const weight = read('weight')
    Command.save({actor, weight})
  },
}

// 设置移动速度
Command.cases.setMovementSpeed = {
  initialize: function () {
    $('#setMovementSpeed-confirm').on('click', this.save)

    // 创建属性选项
    $('#setMovementSpeed-property').loadItems([
      {name: 'Base Speed', value: 'base'},
      {name: 'Speed Factor', value: 'factor'},
      {name: 'Speed Factor (Temp)', value: 'factor-temp'},
    ])

    // 设置属性关联元素
    $('#setMovementSpeed-property').enableHiddenMode().relate([
      {case: 'base', targets: [
        $('#setMovementSpeed-base'),
      ]},
      {case: ['factor', 'factor-temp'], targets: [
        $('#setMovementSpeed-factor'),
      ]},
    ])
  },
  parse: function ({actor, property, base, factor}) {
    const label = Local.get('command.setMovementSpeed.' + property)
    const words = Command.words
    .push(Command.parseActor(actor))
    .push(label.replace('(', Token('(')).replace(')', Token(')')))
    switch (property) {
      case 'base':
        words.push(Command.parseVariableNumber(base, 't/s'))
        break
      case 'factor':
      case 'factor-temp':
        words.push(Command.parseVariableNumber(factor))
        break
    }
    return [
      {color: 'actor'},
      {text: Local.get('command.setMovementSpeed') + Token(': ')},
      {text: words.join()},
    ]
  },
  load: function ({
    actor     = {type: 'trigger'},
    property  = 'base',
    base      = 0,
    factor    = 0,
  }) {
    const write = getElementWriter('setMovementSpeed')
    write('actor', actor)
    write('property', property)
    write('base', base)
    write('factor', factor)
    $('#setMovementSpeed-actor').getFocus()
  },
  save: function () {
    const read = getElementReader('setMovementSpeed')
    const actor = read('actor')
    const property = read('property')
    switch (property) {
      case 'base': {
        const base = read('base')
        Command.save({actor, property, base})
        break
      }
      case 'factor':
      case 'factor-temp': {
        const factor = read('factor')
        Command.save({actor, property, factor})
        break
      }
    }
  },
}

// 设置角度
Command.cases.setAngle = {
  initialize: function () {
    $('#setAngle-confirm').on('click', this.save)

    // 创建等待结束选项
    $('#setAngle-wait').loadItems([
      {name: 'Yes', value: true},
      {name: 'No', value: false},
    ])

    // 创建过渡方式选项 - 窗口打开事件
    $('#setAngle').on('open', function (event) {
      $('#setAngle-easingId').loadItems(
        Data.createEasingItems()
      )
    })

    // 清理内存 - 窗口已关闭事件
    $('#setAngle').on('closed', function (event) {
      $('#setAngle-easingId').clear()
    })
  },
  parse: function ({actor, angle, easingId, duration, wait}) {
    const words = Command.words
    .push(Command.parseActor(actor))
    .push(Command.parseAngle(angle))
    .push(Command.parseEasing(easingId, duration, wait))
    return [
      {color: 'actor'},
      {text: Local.get('command.setAngle') + Token(': ')},
      {text: words.join()},
    ]
  },
  load: function ({
    actor     = {type: 'trigger'},
    angle     = {type: 'absolute', degrees: 0},
    easingId  = Data.easings[0].id,
    duration  = 0,
    wait      = false,
  }) {
    const write = getElementWriter('setAngle')
    write('actor', actor)
    write('angle', angle)
    write('easingId', easingId)
    write('duration', duration)
    write('wait', wait)
    $('#setAngle-actor').getFocus()
  },
  save: function () {
    const read = getElementReader('setAngle')
    const actor = read('actor')
    const angle = read('angle')
    const easingId = read('easingId')
    const duration = read('duration')
    const wait = read('wait')
    Command.save({actor, angle, easingId, duration, wait})
  },
}

// 固定角度
Command.cases.fixAngle = {
  initialize: function () {
    $('#fixAngle-confirm').on('click', this.save)

    // 创建操作选项
    $('#fixAngle-fixed').loadItems([
      {name: 'Fixed', value: true},
      {name: 'Unfixed', value: false},
    ])
  },
  parse: function ({actor, fixed}) {
    const words = Command.words
    .push(Command.parseActor(actor))
    .push(Local.get('command.fixAngle.fixed.' + fixed))
    return [
      {color: 'actor'},
      {text: Local.get('command.fixAngle') + Token(': ')},
      {text: words.join()},
    ]
  },
  load: function ({
    actor = {type: 'trigger'},
    fixed = true,
  }) {
    const write = getElementWriter('fixAngle')
    write('actor', actor)
    write('fixed', fixed)
    $('#fixAngle-actor').getFocus()
  },
  save: function () {
    const read = getElementReader('fixAngle')
    const actor = read('actor')
    const fixed = read('fixed')
    Command.save({actor, fixed})
  },
}

// 设置激活状态
Command.cases.setActive = {
  initialize: function () {
    $('#setActive-confirm').on('click', this.save)

    // 创建激活状态选项
    $('#setActive-active').loadItems([
      {name: 'Active', value: true},
      {name: 'Inactive', value: false},
    ])
  },
  parse: function ({actor, active}) {
    const words = Command.words
    .push(Command.parseActor(actor))
    .push(Local.get('command.setActive.active.' + active))
    return [
      {color: 'actor'},
      {text: Local.get('command.setActive') + Token(': ')},
      {text: words.join()},
    ]
  },
  load: function ({
    actor   = {type: 'trigger'},
    active  = false,
  }) {
    const write = getElementWriter('setActive')
    write('actor', actor)
    write('active', active)
    $('#setActive-actor').getFocus()
  },
  save: function () {
    const read = getElementReader('setActive')
    const actor = read('actor')
    const active = read('active')
    Command.save({actor, active})
  },
}

// 获取角色
Command.cases.getActor = {
  initialize: function () {
    $('#getActor-confirm').on('click', this.save)

    // 创建区域选项
    $('#getActor-area').loadItems([
      {name: 'Square', value: 'square'},
      {name: 'Circle', value: 'circle'},
    ])

    // 设置区域关联元素
    $('#getActor-area').enableHiddenMode().relate([
      {case: 'square', targets: [
        $('#getActor-size'),
      ]},
      {case: 'circle', targets: [
        $('#getActor-radius'),
      ]},
    ])

    // 创建选择器选项
    $('#getActor-selector').loadItems([
      {name: 'Team Enemy', value: 'enemy'},
      {name: 'Team Friend', value: 'friend'},
      {name: 'Team Member', value: 'team'},
      {name: 'Any', value: 'any'},
    ])

    // 设置选择器关联元素
    $('#getActor-selector').enableHiddenMode().relate([
      {case: ['enemy', 'friend', 'team'], targets: [
        $('#getActor-teamId'),
      ]},
    ])

    // 创建条件选项
    $('#getActor-condition').loadItems([
      {name: 'Nearest', value: 'nearest'},
      {name: 'Farthest', value: 'farthest'},
      {name: 'Min Attribute Value', value: 'min-attribute-value'},
      {name: 'Max Attribute Value', value: 'max-attribute-value'},
      {name: 'Min Attribute Ratio', value: 'min-attribute-ratio'},
      {name: 'Max Attribute Ratio', value: 'max-attribute-ratio'},
      {name: 'Random', value: 'random'},
    ])

    // 设置条件关联元素
    $('#getActor-condition').enableHiddenMode().relate([
      {case: ['min-attribute-value', 'max-attribute-value'], targets: [
        $('#getActor-attribute'),
      ]},
      {case: ['min-attribute-ratio', 'max-attribute-ratio'], targets: [
        $('#getActor-attribute'),
        $('#getActor-divisor'),
      ]},
    ])

    // 创建激活状态选项
    $('#getActor-activation').loadItems([
      {name: 'Active', value: 'active'},
      {name: 'Inactive', value: 'inactive'},
      {name: 'Either', value: 'either'},
    ])

    // 创建排除模式选项
    $('#getActor-exclusion').loadItems([
      {name: 'None', value: 'none'},
      {name: 'Exclude an Actor', value: 'actor'},
      {name: 'Exclude a Team', value: 'team'},
    ])

    // 设置排除模式关联元素
    $('#getActor-exclusion').enableHiddenMode().relate([
      {case: 'actor', targets: [
        $('#getActor-exclusionActor'),
      ]},
      {case: 'team', targets: [
        $('#getActor-exclusionTeamId'),
      ]},
    ])

    // 侦听窗口打开事件
    $('#getActor').on('open', function (event) {
      const items = Data.createTeamItems()
      $('#getActor-teamId').loadItems(items)
      $('#getActor-exclusionTeamId').loadItems(items)
    })

    // 侦听窗口已关闭事件
    $('#getActor').on('closed', function (event) {
      $('#getActor-teamId').clear()
      $('#getActor-exclusionTeamId').clear()
    })
  },
  remapSelectorPatch: function (selector) {
    switch (selector) {
      case 'team-enemy':
        return 'enemy'
      case 'team-friend':
        return 'friend'
      case 'team-member':
        return 'team'
      default:
        return selector
    }
  },
  remapActivationPatch: function (activation, active) {
    switch (active) {
      case true:
        return 'active'
      case false:
        return 'either'
      default:
        return activation
    }
  },
  parseCondition: function (condition, attribute, divisor) {
    const label = Local.get('command.getActor.condition.' + condition)
    switch (condition) {
      case 'nearest':
      case 'farthest':
      case 'random':
        return label
      case 'min-attribute-value':
      case 'max-attribute-value':
        return label + Token('(') + Command.parseAttributeKey('actor', attribute) + Token(')')
      case 'min-attribute-ratio':
      case 'max-attribute-ratio':
        return label + Token('(') + Command.parseAttributeKey('actor', attribute) + Token(' / ') + Command.parseAttributeKey('actor', divisor) + Token(')')
    }
  },
  parse: function ({variable, position, area, size, radius, selector, teamId, condition,
    attribute, divisor, activation, exclusion, exclusionActor, exclusionTeamId, active}) {
    // 补丁：2023-1-7
    selector = this.remapSelectorPatch(selector)
    activation = this.remapActivationPatch(activation, active)
    condition = condition ?? 'nearest'
    exclusion = exclusion ?? 'none'
    const actor = Command.parseVariable(variable, 'object', true)
    const words = Command.words
    .push(Command.parsePosition(position))
    .push(Local.get('command.getActor.' + area))
    .push(Command.parseVariableNumber(size ?? radius, 't'))
    const selectorLabel = Command.parseActorSelector(selector)
    switch (selector) {
      case 'enemy':
      case 'friend':
      case 'team':
        words.push(selectorLabel + Token('(') + Command.parseVariableTeam(teamId) + Token(')'))
        break
      case 'any':
        words.push(selectorLabel)
        break
    }
    words.push(this.parseCondition(condition, attribute, divisor))
    words.push(Local.get('command.getActor.' + activation))
    switch (exclusion) {
      case 'actor': {
        const label = Local.get('command.getActor.exclude')
        words.push(label + Token('(') + Command.parseActor(exclusionActor) + Token(')'))
        break
      }
      case 'team': {
        const label = Local.get('command.getActor.exclude')
        words.push(label + Token('(') + Command.parseVariableTeam(exclusionTeamId) + Token(')'))
        break
      }
    }
    return [
      {color: 'actor'},
      {text: Local.get('command.getActor') + Token(': ')},
      {text: actor + Token(' = ') + words.join()},
    ]
  },
  load: function ({
    variable        = {type: 'local', key: ''},
    position        = {type: 'absolute', x: 0, y: 0},
    area            = 'square',
    size            = 1,
    radius          = 0.5,
    selector        = 'enemy',
    teamId          = Data.teams.list[0].id,
    condition       = 'nearest',
    attribute       = Attribute.getDefAttributeId('actor', 'number'),
    divisor         = Attribute.getDefAttributeId('actor', 'number'),
    activation      = 'active',
    exclusion       = 'none',
    exclusionActor  = {type: 'trigger'},
    exclusionTeamId = Data.teams.list[0].id,
    active,
  }) {
    // 补丁：2023-1-7
    selector = this.remapSelectorPatch(selector)
    activation = this.remapActivationPatch(activation, active)
    // 加载角色数值属性选项
    const attrItems = Attribute.getAttributeItems('actor', 'number')
    $('#getActor-attribute').loadItems(attrItems)
    $('#getActor-divisor').loadItems(attrItems)
    const write = getElementWriter('getActor')
    write('variable', variable)
    write('position', position)
    write('area', area)
    write('size', size)
    write('radius', radius)
    write('selector', selector)
    write('teamId', teamId)
    write('condition', condition)
    write('attribute', attribute)
    write('divisor', divisor)
    write('activation', activation)
    write('exclusion', exclusion)
    write('exclusionActor', exclusionActor)
    write('exclusionTeamId', exclusionTeamId)
    $('#getActor-variable').getFocus()
  },
  save: function () {
    const read = getElementReader('getActor')
    const variable = read('variable')
    if (VariableGetter.isNone(variable)) {
      return $('#getActor-variable').getFocus()
    }
    const position = read('position')
    const area = read('area')
    const size = read('size')
    const radius = read('radius')
    const selector = read('selector')
    const teamId = read('teamId')
    const condition = read('condition')
    const attribute = read('attribute')
    const divisor = read('divisor')
    const activation = read('activation')
    const exclusion = read('exclusion')
    const exclusionActor = read('exclusionActor')
    const exclusionTeamId = read('exclusionTeamId')
    let params1
    let params2
    let params3
    let params4
    switch (area) {
      case 'square':
        params1 = {variable, position, area, size}
        break
      case 'circle':
        params1 = {variable, position, area, radius}
        break
    }
    switch (selector) {
      case 'enemy':
      case 'friend':
      case 'team':
        params2 = {selector, teamId}
        break
      case 'any':
        params2 = {selector}
        break
    }
    switch (condition) {
      case 'nearest':
      case 'farthest':
      case 'random':
        params3 = {condition}
        break
      case 'min-attribute-value':
      case 'max-attribute-value':
        if (attribute === '') {
          return $('#getActor-attribute').getFocus()
        }
        params3 = {condition, attribute}
        break
      case 'min-attribute-ratio':
      case 'max-attribute-ratio':
        if (attribute === '') {
          return $('#getActor-attribute').getFocus()
        }
        if (divisor === '' || attribute === divisor) {
          return $('#getActor-divisor').getFocus()
        }
        params3 = {condition, attribute, divisor}
        break
    }
    switch (exclusion) {
      case 'none':
        params4 = {activation, exclusion}
        break
      case 'actor':
        params4 = {activation, exclusion, exclusionActor}
        break
      case 'team':
        params4 = {activation, exclusion, exclusionTeamId}
        break
    }
    Command.save({...params1, ...params2, ...params3, ...params4})
  }
}

// 获取多个角色
Command.cases.getMultipleActors = {
  initialize: function () {
    $('#getMultipleActors-confirm').on('click', this.save)

    // 创建区域选项
    $('#getMultipleActors-area').loadItems([
      {name: 'Rectangle', value: 'rectangle'},
      {name: 'Circle', value: 'circle'},
    ])

    // 设置区域关联元素
    $('#getMultipleActors-area').enableHiddenMode().relate([
      {case: 'rectangle', targets: [
        $('#getMultipleActors-width'),
        $('#getMultipleActors-height'),
      ]},
      {case: 'circle', targets: [
        $('#getMultipleActors-radius'),
      ]},
    ])

    // 创建选择器选项
    $('#getMultipleActors-selector').loadItems([
      {name: 'Team Enemy', value: 'enemy'},
      {name: 'Team Friend', value: 'friend'},
      {name: 'Team Member', value: 'team'},
      {name: 'Any', value: 'any'},
    ])

    // 设置选择器关联元素
    $('#getMultipleActors-selector').enableHiddenMode().relate([
      {case: ['enemy', 'friend', 'team'], targets: [
        $('#getMultipleActors-teamId'),
      ]},
    ])

    // 创建激活状态选项
    $('#getMultipleActors-activation').loadItems([
      {name: 'Active', value: 'active'},
      {name: 'Inactive', value: 'inactive'},
      {name: 'Either', value: 'either'},
    ])

    // 侦听窗口打开事件
    $('#getMultipleActors').on('open', function (event) {
      const items = Data.createTeamItems()
      $('#getMultipleActors-teamId').loadItems(items)
    })

    // 侦听窗口已关闭事件
    $('#getMultipleActors').on('closed', function (event) {
      $('#getMultipleActors-teamId').clear()
    })
  },
  parse: function ({variable, position, area, width, height, radius, selector, teamId, activation}) {
    const actors = Command.parseVariable(variable, 'object', true)
    const words = Command.words
    .push(Command.parsePosition(position))
    .push(Local.get('command.getMultipleActors.' + area))
    switch (area) {
      case 'rectangle':
        words.push(Command.parseVariableNumber(width, 't'))
        words.push(Command.parseVariableNumber(height, 't'))
        break
      case 'circle':
        words.push(Command.parseVariableNumber(radius, 't'))
        break
    }
    const selectorLabel = Command.parseActorSelector(selector)
    switch (selector) {
      case 'enemy':
      case 'friend':
      case 'team':
        words.push(selectorLabel + Token('(') + Command.parseVariableTeam(teamId) + Token(')'))
        break
      case 'any':
        words.push(selectorLabel)
        break
    }
    words.push(Local.get('command.getMultipleActors.' + activation))
    return [
      {color: 'actor'},
      {text: Local.get('command.getMultipleActors') + Token(': ')},
      {text: actors + Token(' = ') + words.join()},
    ]
  },
  load: function ({
    variable    = {type: 'local', key: ''},
    position    = {type: 'absolute', x: 0, y: 0},
    area        = 'rectangle',
    width       = 1,
    height      = 1,
    radius      = 0.5,
    selector    = 'enemy',
    teamId      = Data.teams.list[0].id,
    activation  = 'active',
  }) {
    const write = getElementWriter('getMultipleActors')
    write('variable', variable)
    write('position', position)
    write('area', area)
    write('width', width)
    write('height', height)
    write('radius', radius)
    write('selector', selector)
    write('teamId', teamId)
    write('activation', activation)
    $('#getMultipleActors-variable').getFocus()
  },
  save: function () {
    const read = getElementReader('getMultipleActors')
    const variable = read('variable')
    if (VariableGetter.isNone(variable)) {
      return $('#getMultipleActors-variable').getFocus()
    }
    const position = read('position')
    const area = read('area')
    const width = read('width')
    const height = read('height')
    const radius = read('radius')
    const selector = read('selector')
    const teamId = read('teamId')
    const activation = read('activation')
    let params1
    let params2
    switch (area) {
      case 'rectangle':
        params1 = {variable, position, area, width, height}
        break
      case 'circle':
        params1 = {variable, position, area, radius}
        break
    }
    switch (selector) {
      case 'enemy':
      case 'friend':
      case 'team':
        params2 = {selector, teamId}
        break
      case 'any':
        params2 = {selector}
        break
    }
    Command.save({...params1, ...params2, activation})
  }
}

// 删除角色
Command.cases.deleteActor = {
  initialize: function () {
    $('#deleteActor-confirm').on('click', this.save)
  },
  parse: function ({actor}) {
    return [
      {color: 'actor'},
      {text: Local.get('command.deleteActor') + Token(': ')},
      {text: Command.parseActor(actor)},
    ]
  },
  load: function ({actor = {type: 'trigger'}}) {
    const write = getElementWriter('deleteActor')
    write('actor', actor)
    $('#deleteActor-actor').getFocus()
  },
  save: function () {
    const read = getElementReader('deleteActor')
    const actor = read('actor')
    Command.save({actor})
  },
}

// 设置玩家角色
Command.cases.setPlayerActor = {
  initialize: function () {
    $('#setPlayerActor-confirm').on('click', this.save)
  },
  parse: function ({actor}) {
    return [
      {color: 'actor'},
      {text: Local.get('command.setPlayerActor') + Token(': ')},
      {text: Command.parseActor(actor)},
    ]
  },
  load: function ({actor = {type: 'trigger'}}) {
    const write = getElementWriter('setPlayerActor')
    write('actor', actor)
    $('#setPlayerActor-actor').getFocus()
  },
  save: function () {
    const read = getElementReader('setPlayerActor')
    const actor = read('actor')
    Command.save({actor})
  },
}

// 设置队伍成员
Command.cases.setPartyMember = {
  initialize: function () {
    $('#setPartyMember-confirm').on('click', this.save)

    // 创建操作选项
    $('#setPartyMember-operation').loadItems([
      {name: 'Add', value: 'add'},
      {name: 'Remove', value: 'remove'},
    ])
  },
  parse: function ({operation, actor}) {
    const words = Command.words
    .push(Local.get('command.setPartyMember.' + operation))
    .push(Command.parseActor(actor))
    return [
      {color: 'actor'},
      {text: Local.get('command.setPartyMember') + Token(': ')},
      {text: words.join()},
    ]
  },
  load: function ({
    operation = 'add',
    actor     = {type: 'trigger'},
  }) {
    const write = getElementWriter('setPartyMember')
    write('operation', operation)
    write('actor', actor)
    $('#setPartyMember-operation').getFocus()
  },
  save: function () {
    const read = getElementReader('setPartyMember')
    const operation = read('operation')
    const actor = read('actor')
    Command.save({operation, actor})
  },
}

// 改变通行区域
Command.cases.changePassableTerrain = {
  initialize: function () {
    $('#changePassableTerrain-confirm').on('click', this.save)
    $('#changePassableTerrain-passage').loadItems([
      {name: 'Land', value: 'land'},
      {name: 'Water', value: 'water'},
      {name: 'Unrestricted', value: 'unrestricted'},
    ])
  },
  parse: function ({actor, passage}) {
    const words = Command.words
    .push(Command.parseActor(actor))
    .push(Local.get('command.changePassableTerrain.' + passage))
    return [
      {color: 'actor'},
      {text: Local.get('command.changePassableTerrain') + Token(': ')},
      {text: words.join()},
    ]
  },
  load: function ({
    actor   = {type: 'trigger'},
    passage = 'land',
  }) {
    const write = getElementWriter('changePassableTerrain')
    write('actor', actor)
    write('passage', passage)
    $('#changePassableTerrain-actor').getFocus()
  },
  save: function () {
    const read = getElementReader('changePassableTerrain')
    const actor = read('actor')
    const passage = read('passage')
    Command.save({actor, passage})
  }
}

// 改变角色队伍
Command.cases.changeActorTeam = {
  initialize: function () {
    $('#changeActorTeam-confirm').on('click', this.save)

    // 创建队伍选项 - 窗口打开事件
    $('#changeActorTeam').on('open', function (event) {
      $('#changeActorTeam-teamId').loadItems(
        Data.createTeamItems()
      )
    })

    // 清理内存 - 窗口已关闭事件
    $('#changeActorTeam').on('closed', function (event) {
      $('#changeActorTeam-teamId').clear()
    })
  },
  parse: function ({actor, teamId}) {
    const words = Command.words
    .push(Command.parseActor(actor))
    .push(Command.parseTeam(teamId))
    return [
      {color: 'actor'},
      {text: Local.get('command.changeActorTeam') + Token(': ')},
      {text: words.join()},
    ]
  },
  load: function ({
    actor   = {type: 'trigger'},
    teamId  = Data.teams.list[0].id,
  }) {
    const write = getElementWriter('changeActorTeam')
    write('actor', actor)
    write('teamId', teamId)
    $('#changeActorTeam-actor').getFocus()
  },
  save: function () {
    const read = getElementReader('changeActorTeam')
    const actor = read('actor')
    const teamId = read('teamId')
    Command.save({actor, teamId})
  },
}

// 改变角色状态
Command.cases.changeActorState = {
  initialize: function () {
    $('#changeActorState-confirm').on('click', this.save)

    // 创建操作选项
    $('#changeActorState-operation').loadItems([
      {name: 'Add', value: 'add'},
      {name: 'Remove', value: 'remove'},
      {name: 'Remove Instance', value: 'remove-instance'},
    ])

    // 设置操作关联元素
    $('#changeActorState-operation').enableHiddenMode().relate([
      {case: ['add', 'remove'], targets: [
        $('#changeActorState-stateId'),
      ]},
      {case: 'remove-instance', targets: [
        $('#changeActorState-state'),
      ]},
    ])
  },
  parseOperation: function (operation) {
    return Local.get('command.changeActorState.' + operation)
  },
  parse: function ({actor, operation, stateId, state}) {
    const words = Command.words
    .push(Command.parseActor(actor))
    .push(this.parseOperation(operation))
    switch (operation) {
      case 'add':
      case 'remove':
        words.push(Command.parseFileName(stateId))
        break
      case 'remove-instance':
        words.push(Command.parseState(state))
        break
    }
    return [
      {color: 'actor'},
      {text: Local.get('command.changeActorState') + Token(': ')},
      {text: words.join()},
    ]
  },
  load: function ({
    actor     = {type: 'trigger'},
    operation = 'add',
    stateId   = '',
    state     = {type: 'trigger'},
  }) {
    const write = getElementWriter('changeActorState')
    write('actor', actor)
    write('operation', operation)
    write('stateId', stateId)
    write('state', state)
    $('#changeActorState-actor').getFocus()
  },
  save: function () {
    const read = getElementReader('changeActorState')
    const actor = read('actor')
    const operation = read('operation')
    switch (operation) {
      case 'add':
      case 'remove': {
        const stateId = read('stateId')
        if (stateId === '') {
          return $('#changeActorState-stateId').getFocus()
        }
        Command.save({actor, operation, stateId})
        break
      }
      case 'remove-instance': {
        const state = read('state')
        Command.save({actor, operation, state})
        break
      }
    }
  },
}

// 改变角色装备
Command.cases.changeActorEquipment = {
  initialize: function () {
    $('#changeActorEquipment-confirm').on('click', this.save)

    // 创建操作选项
    $('#changeActorEquipment-operation').loadItems([
      {name: 'Add', value: 'add'},
      {name: 'Remove', value: 'remove'},
      {name: 'Add Instance', value: 'add-instance'},
      {name: 'Remove Instance', value: 'remove-instance'},
      {name: 'Remove Slot', value: 'remove-slot'},
    ])

    // 设置关联元素
    $('#changeActorEquipment-operation').enableHiddenMode().relate([
      {case: 'add', targets: [
        $('#changeActorEquipment-slot'),
        $('#changeActorEquipment-equipmentId'),
      ]},
      {case: 'remove', targets: [
        $('#changeActorEquipment-equipmentId'),
      ]},
      {case: 'add-instance', targets: [
        $('#changeActorEquipment-slot'),
        $('#changeActorEquipment-equipment'),
      ]},
      {case: 'remove-instance', targets: [
        $('#changeActorEquipment-equipment'),
      ]},
      {case: 'remove-slot', targets: [
        $('#changeActorEquipment-slot'),
      ]},
    ])
  },
  parse: function ({actor, operation, slot, equipmentId, equipment}) {
    const words = Command.words
    .push(Command.parseActor(actor))
    .push(Local.get('command.changeActorEquipment.' + operation))
    switch (operation) {
      case 'add': {
        const equipSlot = Command.parseVariableEnum('equipment-slot', slot)
        const equipName = Command.parseFileName(equipmentId)
        words.push(equipSlot + Token(' = ') + equipName)
        break
      }
      case 'remove':
        words.push(Command.parseFileName(equipmentId))
        break
      case 'add-instance': {
        const equipSlot = Command.parseVariableEnum('equipment-slot', slot)
        const equipName = Command.parseEquipment(equipment)
        words.push(equipSlot + Token(' = ') + equipName)
        break
      }
      case 'remove-instance':
        words.push(Command.parseEquipment(equipment))
        break
      case 'remove-slot':
        words.push(Command.parseVariableEnum('equipment-slot', slot))
        break
    }
    return [
      {color: 'actor'},
      {text: Local.get('command.changeActorEquipment') + Token(': ')},
      {text: words.join()},
    ]
  },
  load: function ({
    actor       = {type: 'trigger'},
    operation   = 'add',
    slot        = Enum.getDefStringId('equipment-slot'),
    equipmentId = '',
    equipment   = {type: 'trigger'},
  }) {
    // 加载装备选项
    $('#changeActorEquipment-slot').loadItems(
      Enum.getStringItems('equipment-slot')
    )
    const write = getElementWriter('changeActorEquipment')
    write('actor', actor)
    write('operation', operation)
    write('slot', slot)
    write('equipmentId', equipmentId)
    write('equipment', equipment)
    $('#changeActorEquipment-actor').getFocus()
  },
  save: function () {
    const read = getElementReader('changeActorEquipment')
    const actor = read('actor')
    const operation = read('operation')
    switch (operation) {
      case 'add': {
        const slot = read('slot')
        if (slot === '') {
          return $('#changeActorEquipment-slot').getFocus()
        }
        const equipmentId = read('equipmentId')
        if (equipmentId === '') {
          return $('#changeActorEquipment-equipmentId').getFocus()
        }
        Command.save({actor, operation, slot, equipmentId})
        break
      }
      case 'remove': {
        const equipmentId = read('equipmentId')
        if (equipmentId === '') {
          return $('#changeActorEquipment-equipmentId').getFocus()
        }
        Command.save({actor, operation, equipmentId})
        break
      }
      case 'add-instance': {
        const slot = read('slot')
        if (slot === '') {
          return $('#changeActorEquipment-slot').getFocus()
        }
        const equipment = read('equipment')
        Command.save({actor, operation, slot, equipment})
        break
      }
      case 'remove-instance': {
        const equipment = read('equipment')
        Command.save({actor, operation, equipment})
        break
      }
      case 'remove-slot':
        const slot = read('slot')
        if (slot === '') {
          return $('#changeActorEquipment-slot').getFocus()
        }
        Command.save({actor, operation, slot})
        break
    }
  },
}

// 改变角色技能
Command.cases.changeActorSkill = {
  initialize: function () {
    $('#changeActorSkill-confirm').on('click', this.save)

    // 创建操作选项
    $('#changeActorSkill-operation').loadItems([
      {name: 'Add', value: 'add'},
      {name: 'Remove', value: 'remove'},
      {name: 'Remove Instance', value: 'remove-instance'},
      {name: 'Sort by Filename', value: 'sort-by-order'},
    ])

    // 设置关联元素
    $('#changeActorSkill-operation').enableHiddenMode().relate([
      {case: ['add', 'remove'], targets: [
        $('#changeActorSkill-skillId'),
      ]},
      {case: 'remove-instance', targets: [
        $('#changeActorSkill-skill'),
      ]},
    ])
  },
  parseOperation: function (operation) {
    return Local.get('command.changeActorSkill.' + operation)
  },
  parse: function ({actor, operation, skill, skillId}) {
    const words = Command.words
    .push(Command.parseActor(actor))
    .push(this.parseOperation(operation))
    switch (operation) {
      case 'add':
      case 'remove':
        words.push(Command.parseVariableFile(skillId))
        break
      case 'remove-instance':
        words.push(Command.parseSkill(skill))
        break
    }
    return [
      {color: 'actor'},
      {text: Local.get('command.changeActorSkill') + Token(': ')},
      {text: words.join()},
    ]
  },
  load: function ({
    actor     = {type: 'trigger'},
    operation = 'add',
    skillId   = '',
    skill     = {type: 'trigger'},
  }) {
    const write = getElementWriter('changeActorSkill')
    write('actor', actor)
    write('operation', operation)
    write('skillId', skillId)
    write('skill', skill)
    $('#changeActorSkill-actor').getFocus()
  },
  save: function () {
    const read = getElementReader('changeActorSkill')
    const actor = read('actor')
    const operation = read('operation')
    switch (operation) {
      case 'add':
      case 'remove': {
        const skillId = read('skillId')
        if (skillId === '') {
          return $('#changeActorSkill-skillId').getFocus()
        }
        Command.save({actor, operation, skillId})
        break
      }
      case 'remove-instance': {
        const skill = read('skill')
        Command.save({actor, operation, skill})
        break
      }
      case 'sort-by-order':
        Command.save({actor, operation})
        break
    }
  },
}

// 改变角色头像
Command.cases.changeActorPortrait = {
  initialize: function () {
    $('#changeActorPortrait-confirm').on('click', this.save)

    // 创建模式选项
    $('#changeActorPortrait-mode').loadItems([
      {name: 'Full Mode', value: 'full'},
      {name: 'Image Mode', value: 'portrait'},
      {name: 'Clip Mode', value: 'clip'},
    ])

    // 设置模式关联元素
    $('#changeActorPortrait-mode').enableHiddenMode().relate([
      {case: 'full', targets: [
        $('#changeActorPortrait-portrait'),
        $('#changeActorPortrait-clip'),
      ]},
      {case: 'portrait', targets: [
        $('#changeActorPortrait-portrait'),
      ]},
      {case: 'clip', targets: [
        $('#changeActorPortrait-clip'),
      ]},
    ])
  },
  parsePortraitClip: function (clip) {
    const label = Local.get('command.changeActorPortrait.clip')
    const x = Command.setNumberColor(clip[0])
    const y = Command.setNumberColor(clip[1])
    const width = Command.setNumberColor(clip[2])
    const height = Command.setNumberColor(clip[3])
    return label + Token('(') + x + Token(', ') + y + Token(', ') + width + Token(', ') + height + Token(')')
  },
  parse: function ({actor, mode, portrait, clip}) {
    const words = Command.words
    .push(Command.parseActor(actor))
    switch (mode) {
      case 'full':
        words
        .push(Command.parseFileName(portrait))
        .push(this.parsePortraitClip(clip))
        break
      case 'portrait':
        words.push(Command.parseFileName(portrait))
        break
      case 'clip':
        words.push(this.parsePortraitClip(clip))
        break
    }
    return [
      {color: 'actor'},
      {text: Local.get('command.changeActorPortrait') + Token(': ')},
      {text: words.join()},
    ]
  },
  load: function ({
    actor     = {type: 'trigger'},
    mode      = 'full',
    portrait  = '',
    clip      = [0, 0, 64, 64],
  }) {
    const write = getElementWriter('changeActorPortrait')
    write('actor', actor)
    write('mode', mode)
    write('portrait', portrait)
    write('clip', clip)
    $('#changeActorPortrait-actor').getFocus()
  },
  save: function () {
    const read = getElementReader('changeActorPortrait')
    const actor = read('actor')
    const mode = read('mode')
    const portrait = read('portrait')
    const clip = read('clip')
    switch (mode) {
      case 'full':
        return Command.save({actor, mode, portrait, clip})
      case 'portrait':
        return Command.save({actor, mode, portrait})
      case 'clip':
        return Command.save({actor, mode, clip})
    }
  },
}

// 改变角色动画
Command.cases.changeActorAnimation = {
  initialize: function () {
    $('#changeActorAnimation-confirm').on('click', this.save)
  },
  parse: function ({actor, animationId}) {
    const words = Command.words
    .push(Command.parseActor(actor))
    .push(Command.parseFileName(animationId))
    return [
      {color: 'actor'},
      {text: Local.get('command.changeActorAnimation') + Token(': ')},
      {text: words.join()},
    ]
  },
  load: function ({
    actor       = {type: 'trigger'},
    animationId = '',
  }) {
    const write = getElementWriter('changeActorAnimation')
    write('actor', actor)
    write('animationId', animationId)
    $('#changeActorAnimation-actor').getFocus()
  },
  save: function () {
    const read = getElementReader('changeActorAnimation')
    const actor = read('actor')
    const animationId = read('animationId')
    if (animationId === '') {
      return $('#changeActorAnimation-animationId').getFocus()
    }
    Command.save({actor, animationId})
  },
}

// 改变角色精灵图
Command.cases.changeActorSprite = {
  initialize: function () {
    $('#changeActorSprite-confirm').on('click', this.save)

    // 侦听事件
    $('#changeActorSprite-animationId').on('write', event => {
      const items = Animation.getSpriteListItems(event.value)
      const elSpriteId = $('#changeActorSprite-spriteId')
      elSpriteId.loadItems(items)
      elSpriteId.write(elSpriteId.read())
    })
  },
  parse: function ({actor, animationId, spriteId, image}) {
    const words = Command.words
    .push(Command.parseActor(actor))
    .push(Command.parseFileName(animationId))
    .push(Command.parseSpriteName(animationId, spriteId))
    .push(Command.parseFileName(image))
    return [
      {color: 'actor'},
      {text: Local.get('command.changeActorSprite') + Token(': ')},
      {text: words.join()},
    ]
  },
  load: function ({
    actor       = {type: 'trigger'},
    animationId = '',
    spriteId    = '',
    image       = '',
  }) {
    const write = getElementWriter('changeActorSprite')
    write('actor', actor)
    write('animationId', animationId)
    write('spriteId', spriteId)
    write('image', image)
    $('#changeActorSprite-actor').getFocus()
  },
  save: function () {
    const read = getElementReader('changeActorSprite')
    const actor = read('actor')
    const animationId = read('animationId')
    if (animationId === '') {
      return $('#changeActorSprite-animationId').getFocus()
    }
    const spriteId = read('spriteId')
    if (spriteId === '') {
      return $('#changeActorSprite-spriteId').getFocus()
    }
    const image = read('image')
    Command.save({actor, animationId, spriteId, image})
  },
}

// 改变角色动作
Command.cases.changeActorMotion = {
  initialize: function () {
    $('#changeActorMotion-confirm').on('click', this.save)

    // 创建动作类型选项
    $('#changeActorMotion-type').loadItems([
      {name: 'Idle', value: 'idle'},
      {name: 'Move', value: 'move'},
    ])
  },
  parseMapping: function (type, motion) {
    const motionType = Local.get('command.changeActorMotion.type.' + type)
    const motionName = Command.parseEnumString(motion)
    return motionType + Token(' -> ') + motionName
  },
  parse: function ({actor, type, motion}) {
    const words = Command.words
    .push(Command.parseActor(actor))
    .push(this.parseMapping(type, motion))
    return [
      {color: 'actor'},
      {text: Local.get('command.changeActorMotion') + Token(': ')},
      {text: words.join()},
    ]
  },
  load: function ({
    actor   = {type: 'trigger'},
    type    = 'move',
    motion  = '',
  }) {
    const write = getElementWriter('changeActorMotion')
    write('actor', actor)
    write('type', type)
    write('motion', motion)
    $('#changeActorMotion-actor').getFocus()
  },
  save: function () {
    const read = getElementReader('changeActorMotion')
    const actor = read('actor')
    const type = read('type')
    const motion = read('motion')
    if (motion === '') {
      return $('#changeActorMotion-motion').getFocus()
    }
    Command.save({actor, type, motion})
  },
}

// 播放角色动画
Command.cases.playActorAnimation = {
  initialize: function () {
    $('#playActorAnimation-confirm').on('click', this.save)

    // 创建等待结束选项
    $('#playActorAnimation-wait').loadItems([
      {name: 'Yes', value: true},
      {name: 'No', value: false},
    ])
  },
  parseSpeed: function (speed) {
    if (speed === 1) return ''
    return Command.parseVariableNumber(speed)
  },
  parse: function ({actor, motion, speed, wait}) {
    const words = Command.words
    .push(Command.parseActor(actor))
    .push(Command.parseEnumString(motion))
    .push(this.parseSpeed(speed))
    .push(Command.parseWait(wait))
    return [
      {color: 'actor'},
      {text: Local.get('command.playActorAnimation') + Token(': ')},
      {text: words.join()},
    ]
  },
  load: function ({
    actor     = {type: 'trigger'},
    motion    = '',
    speed     = 1,
    wait      = false,
  }) {
    const write = getElementWriter('playActorAnimation')
    write('actor', actor)
    write('motion', motion)
    write('speed', speed)
    write('wait', wait)
    $('#playActorAnimation-actor').getFocus()
  },
  save: function () {
    const read = getElementReader('playActorAnimation')
    const actor = read('actor')
    const motion = read('motion').trim()
    const speed = read('speed')
    const wait = read('wait')
    if (!motion) {
      return $('#playActorAnimation-motion').getFocus()
    }
    Command.save({actor, motion, speed, wait})
  },
}

// 停止角色动画
Command.cases.stopActorAnimation = {
  initialize: function () {
    $('#stopActorAnimation-confirm').on('click', this.save)
  },
  parse: function ({actor}) {
    return [
      {color: 'actor'},
      {text: Local.get('command.stopActorAnimation') + Token(': ')},
      {text: Command.parseActor(actor)},
    ]
  },
  load: function ({actor = {type: 'trigger'}}) {
    const write = getElementWriter('stopActorAnimation')
    write('actor', actor)
    $('#stopActorAnimation-actor').getFocus()
  },
  save: function () {
    const read = getElementReader('stopActorAnimation')
    const actor = read('actor')
    Command.save({actor})
  },
}

// 添加动画组件
Command.cases.addAnimationComponent = {
  initialize: function () {
    $('#addAnimationComponent-confirm').on('click', this.save)

    // 创建可旋转选项
    $('#addAnimationComponent-rotatable').loadItems([
      {name: 'Yes', value: true},
      {name: 'No', value: false},
    ])

    // 创建同步角度选项
    $('#addAnimationComponent-syncAngle').loadItems([
      {name: 'Yes', value: true},
      {name: 'No', value: false},
    ])

    // 侦听动画ID写入事件
    $('#addAnimationComponent-animationId').on('write', event => {
      const elMotion = $('#addAnimationComponent-motion')
      elMotion.loadItems(Animation.getMotionListItems(event.value))
      elMotion.write2(elMotion.read())
    })
  },
  parseRotatable: function (rotatable) {
    return rotatable ? Local.get('command.addAnimationComponent.rotatable') : ''
  },
  parseSyncAngle: function (syncAngle) {
    return syncAngle ? Local.get('command.addAnimationComponent.syncAngle') : ''
  },
  parsePriority: function (priority) {
    if (priority === 0) return ''
    const abs = Command.setNumberColor(Math.abs(priority))
    return priority > 0 ? Token('+') + abs : Token('-') + abs
  },
  parseOffsetY: function (offsetY) {
    if (offsetY === 0) return ''
    const abs = Command.setNumberColor(Math.abs(offsetY)) + 'px'
    return offsetY > 0 ? abs : Token('-') + abs
  },
  parse: function ({actor, animationId, motion, rotatable, syncAngle, priority, offsetY}) {
    syncAngle = syncAngle ?? false // 补丁
    offsetY = offsetY ?? 0 // 补丁
    const words = Command.words
    .push(Command.parseActor(actor))
    .push(Command.parseFileName(animationId))
    .push(Command.parseEnumString(motion))
    .push(this.parseRotatable(rotatable))
    .push(this.parseSyncAngle(syncAngle))
    .push(this.parsePriority(priority))
    .push(this.parseOffsetY(offsetY))
    return [
      {color: 'actor'},
      {text: Local.get('command.addAnimationComponent') + Token(': ')},
      {text: words.join()},
    ]
  },
  load: function ({
    actor       = {type: 'trigger'},
    animationId = '',
    motion      = '',
    rotatable   = false,
    syncAngle   = false,
    priority    = 0,
    offsetY     = 0,
  }) {
    const write = getElementWriter('addAnimationComponent')
    write('actor', actor)
    write('animationId', animationId)
    write('motion', motion)
    write('rotatable', rotatable)
    write('syncAngle', syncAngle)
    write('priority', priority)
    write('offsetY', offsetY)
    $('#addAnimationComponent-actor').getFocus()
  },
  save: function () {
    const read = getElementReader('addAnimationComponent')
    const actor = read('actor')
    const animationId = read('animationId')
    if (animationId === '') {
      return $('#addAnimationComponent-animationId').getFocus()
    }
    const motion = read('motion')
    if (motion === '') {
      return $('#addAnimationComponent-motion').getFocus()
    }
    const rotatable = read('rotatable')
    const syncAngle = read('syncAngle')
    const priority = read('priority')
    const offsetY = read('offsetY')
    Command.save({actor, animationId, motion, rotatable, syncAngle, priority, offsetY})
  }
}

// 设置动画组件
Command.cases.setAnimationComponent = {
  initialize: function () {
    $('#setAnimationComponent-confirm').on('click', this.save)

    // 创建操作选项
    $('#setAnimationComponent-operation').loadItems([
      {name: 'Set Angle', value: 'set-angle'},
      {name: 'Set Scale', value: 'set-scale'},
      {name: 'Set Speed', value: 'set-speed'},
      {name: 'Set Opacity', value: 'set-opacity'},
      {name: 'Set Priority', value: 'set-priority'},
      {name: 'Set Offset Y', value: 'set-offsetY'},
      {name: 'Set Sprite', value: 'set-sprite'},
      {name: 'Play Motion', value: 'play-motion'},
      {name: 'Stop Motion', value: 'stop-motion'},
    ]),

    // 关联操作相关元素
    $('#setAnimationComponent-operation').enableHiddenMode().relate([
      {case: 'set-angle', targets: [
        $('#setAnimationComponent-angle'),
      ]},
      {case: 'set-scale', targets: [
        $('#setAnimationComponent-scale'),
      ]},
      {case: 'set-speed', targets: [
        $('#setAnimationComponent-speed'),
      ]},
      {case: 'set-opacity', targets: [
        $('#setAnimationComponent-opacity'),
      ]},
      {case: 'set-priority', targets: [
        $('#setAnimationComponent-priority'),
      ]},
      {case: 'set-offsetY', targets: [
        $('#setAnimationComponent-offsetY'),
      ]},
      {case: 'set-sprite', targets: [
        $('#setAnimationComponent-spriteId'),
        $('#setAnimationComponent-image'),
      ]}, {case: 'play-motion', targets: [
        $('#setAnimationComponent-playMotion'),
        $('#setAnimationComponent-wait'),
      ]}
    ])

    // 创建等待选项
    $('#setAnimationComponent-wait').loadItems([
      {name: 'Yes', value: true},
      {name: 'No', value: false},
    ])

    // 侦听动画ID写入事件
    $('#setAnimationComponent-animationId').on('write', event => {
      const elMotion = $('#setAnimationComponent-motion')
      const elPlayMotion = $('#setAnimationComponent-playMotion')
      const elSpriteId = $('#setAnimationComponent-spriteId')
      const motionItems = Animation.getMotionListItems(event.value)
      const spriteItems = Animation.getSpriteListItems(event.value)
      elMotion.loadItems(motionItems)
      elPlayMotion.loadItems(motionItems)
      elSpriteId.loadItems(spriteItems)
      elMotion.write2(elMotion.read())
      elPlayMotion.write2(elPlayMotion.read())
      elSpriteId.write2(elSpriteId.read())
    })
  },
  parsePriority: function (priority) {
    const abs = Command.setNumberColor(Math.abs(priority))
    return priority === 0 ? abs : priority > 0 ? Token('+') + abs : Token('-') + abs
  },
  parseOffsetY: function (offsetY) {
    const abs = Command.setNumberColor(Math.abs(offsetY)) + 'px'
    return offsetY >= 0 ? abs : Token('-') + abs
  },
  parse: function ({actor, animationId, motion, operation, angle, scale, speed, opacity, priority, offsetY, spriteId, image, playMotion, wait}) {
    const words = Command.words
    .push(Command.parseActor(actor))
    .push(Command.parseFileName(animationId))
    .push(Command.parseEnumString(motion))
    .push(Local.get('command.setAnimationComponent.' + operation))
    switch (operation) {
      case 'set-angle':
        words.push(Command.parseAngle(angle))
        break
      case 'set-scale':
        words.push(Command.parseVariableNumber(scale))
        break
      case 'set-speed':
        words.push(Command.parseVariableNumber(speed))
        break
      case 'set-opacity':
        words.push(Command.parseVariableNumber(opacity))
        break
      case 'set-priority':
        words.push(this.parsePriority(priority))
        break
      case 'set-offsetY':
        words.push(this.parseOffsetY(offsetY))
        break
      case 'set-sprite':
        words.push(Command.parseSpriteName(animationId, spriteId))
        words.push(Command.parseFileName(image))
        break
      case 'play-motion':
        words.push(Command.parseEnumString(playMotion))
        words.push(Command.parseWait(wait))
        break
    }
    return [
      {color: 'actor'},
      {text: Local.get('command.setAnimationComponent') + Token(': ')},
      {text: words.join()},
    ]
  },
  load: function ({
    actor       = {type: 'trigger'},
    animationId = '',
    motion      = '',
    operation   = 'set-angle',
    angle       = {type: 'absolute', degrees: 0},
    scale       = 1,
    speed       = 1,
    opacity     = 1,
    priority    = 0,
    offsetY     = 0,
    spriteId    = '',
    image       = '',
    playMotion  = '',
    wait        = false,
  }) {
    var write = getElementWriter('setAnimationComponent')
    write('actor', actor)
    write('animationId', animationId)
    write('motion', motion)
    write('operation', operation)
    write('angle', angle)
    write('scale', scale)
    write('speed', speed)
    write('opacity', opacity)
    write('priority', priority)
    write('offsetY', offsetY)
    write('spriteId', spriteId)
    write('image', image)
    write('wait', wait)
    if (playMotion) write('playMotion', playMotion)
    $('#setAnimationComponent-actor').getFocus()
  },
  save: function () {
    const read = getElementReader('setAnimationComponent')
    const actor = read('actor')
    const animationId = read('animationId')
    if (animationId === '') {
      return $('#setAnimationComponent-animationId').getFocus()
    }
    const motion = read('motion')
    if (motion === '') {
      return $('#setAnimationComponent-motion').getFocus()
    }
    const operation = read('operation')
    switch (operation) {
      case 'set-angle': {
        const angle = read('angle')
        Command.save({actor, animationId, motion, operation, angle})
        break
      }
      case 'set-scale': {
        const scale = read('scale')
        Command.save({actor, animationId, motion, operation, scale})
        break
      }
      case 'set-speed': {
        const speed = read('speed')
        Command.save({actor, animationId, motion, operation, speed})
        break
      }
      case 'set-opacity': {
        const opacity = read('opacity')
        Command.save({actor, animationId, motion, operation, opacity})
        break
      }
      case 'set-priority': {
        const priority = read('priority')
        Command.save({actor, animationId, motion, operation, priority})
        break
      }
      case 'set-offsetY':
        const offsetY = read('offsetY')
        Command.save({actor, animationId, motion, operation, offsetY})
        break
      case 'set-sprite': {
        const spriteId = read('spriteId')
        const image = read('image')
        if (spriteId === '') {
          return $('#setAnimationComponent-spriteId').getFocus()
        }
        Command.save({actor, animationId, motion, operation, spriteId, image})
        break
      }
      case 'play-motion': {
        const playMotion = read('playMotion')
        if (playMotion === '') {
          return $('#setAnimationComponent-playMotion').getFocus()
        }
        const wait = read('wait')
        Command.save({actor, animationId, motion, operation, playMotion, wait})
        break
      }
      case 'stop-motion':
        Command.save({actor, animationId, motion, operation})
        break
    }
  }
}

// 移除动画组件
Command.cases.removeAnimationComponent = {
  initialize: function () {
    $('#removeAnimationComponent-confirm').on('click', this.save)

    // 侦听动画ID写入事件
    $('#removeAnimationComponent-animationId').on('write', event => {
      const elMotion = $('#removeAnimationComponent-motion')
      elMotion.loadItems(Animation.getMotionListItems(event.value))
      elMotion.write2(elMotion.read())
    })
  },
  parse: function ({actor, animationId, motion}) {
    const words = Command.words
    .push(Command.parseActor(actor))
    .push(Command.parseFileName(animationId))
    .push(Command.parseEnumString(motion))
    return [
      {color: 'actor'},
      {text: Local.get('command.removeAnimationComponent') + Token(': ')},
      {text: words.join()},
    ]
  },
  load: function ({
    actor       = {type: 'trigger'},
    animationId = '',
    motion      = '',
  }) {
    var write = getElementWriter('removeAnimationComponent')
    write('actor', actor)
    write('animationId', animationId)
    write('motion', motion)
    $('#removeAnimationComponent-actor').getFocus()
  },
  save: function () {
    const read = getElementReader('removeAnimationComponent')
    const actor = read('actor')
    const animationId = read('animationId')
    const motion = read('motion')
    if (animationId === '') {
      return $('#removeAnimationComponent-animationId').getFocus()
    }
    if (motion === '') {
      return $('#removeAnimationComponent-motion').getFocus()
    }
    Command.save({actor, animationId, motion})
  }
}

// 创建全局角色
Command.cases.createGlobalActor = {
  initialize: function () {
    $('#createGlobalActor-confirm').on('click', this.save)

    // 创建队伍选项 - 窗口打开事件
    $('#createGlobalActor').on('open', function (event) {
      $('#createGlobalActor-teamId').loadItems(
        Data.createTeamItems()
      )
    })

    // 清理内存 - 窗口已关闭事件
    $('#createGlobalActor').on('closed', function (event) {
      $('#createGlobalActor-teamId').clear()
    })
  },
  parse: function ({actorId, teamId}) {
    const words = Command.words
    .push(Command.parseFileName(actorId))
    .push(Command.parseTeam(teamId))
    return [
      {color: 'actor'},
      {text: Local.get('command.createGlobalActor') + Token(': ')},
      {text: words.join()},
    ]
  },
  load: function ({
    actorId = '',
    teamId  = Data.teams.list[0].id,
  }) {
    const write = getElementWriter('createGlobalActor')
    write('actorId', actorId)
    write('teamId', teamId)
    $('#createGlobalActor-actorId').getFocus()
  },
  save: function () {
    const read = getElementReader('createGlobalActor')
    const actorId = read('actorId')
    if (actorId === '') {
      return $('#createGlobalActor-actorId').getFocus()
    }
    const teamId = read('teamId')
    Command.save({actorId, teamId})
  },
}

// 转移全局角色
Command.cases.transferGlobalActor = {
  initialize: function () {
    $('#transferGlobalActor-confirm').on('click', this.save)
  },
  parse: function ({actor, position}) {
    const words = Command.words
    .push(Command.parseActor(actor))
    .push(Command.parsePosition(position))
    return [
      {color: 'actor'},
      {text: Local.get('command.transferGlobalActor') + Token(': ')},
      {text: words.join()},
    ]
  },
  load: function ({
    actor     = {type: 'trigger'},
    position  = {type: 'absolute', x: 0, y: 0},
  }) {
    const write = getElementWriter('transferGlobalActor')
    write('actor', actor)
    write('position', position)
    $('#transferGlobalActor-actor').getFocus('all')
  },
  save: function () {
    const read = getElementReader('transferGlobalActor')
    const actor = read('actor')
    const position = read('position')
    Command.save({actor, position})
  },
}

// 删除全局角色
Command.cases.deleteGlobalActor = {
  initialize: function () {
    $('#deleteGlobalActor-confirm').on('click', this.save)
  },
  parse: function ({actorId}) {
    const words = Command.words
    .push(Command.parseFileName(actorId))
    return [
      {color: 'actor'},
      {text: Local.get('command.deleteGlobalActor') + Token(': ')},
      {text: words.join()},
    ]
  },
  load: function ({actorId = ''}) {
    const write = getElementWriter('deleteGlobalActor')
    write('actorId', actorId)
    $('#deleteGlobalActor-actorId').getFocus()
  },
  save: function () {
    const read = getElementReader('deleteGlobalActor')
    const actorId = read('actorId')
    if (actorId === '') {
      return $('#deleteGlobalActor-actorId').getFocus()
    }
    Command.save({actorId})
  },
}

// 设置目标
Command.cases.setTarget = {
  initialize: function () {
    $('#setTarget-confirm').on('click', this.save)
  },
  parse: function ({actor}) {
    return [
      {color: 'actor'},
      {text: Local.get('command.setTarget') + Token(': ')},
      {text: Command.parseActor(actor)},
    ]
  },
  load: function ({actor = {type: 'trigger'}}) {
    const write = getElementWriter('setTarget')
    write('actor', actor)
    $('#setTarget-actor').getFocus()
  },
  save: function () {
    const read = getElementReader('setTarget')
    const actor = read('actor')
    Command.save({actor})
  },
}

// 获取目标
Command.cases.getTarget = {
  initialize: function () {
    $('#getTarget-confirm').on('click', this.save)

    // 创建选择器选项
    $('#getTarget-selector').loadItems([
      {name: 'Enemy', value: 'enemy'},
      {name: 'Friend', value: 'friend'},
      {name: 'Team Member', value: 'team'},
      {name: 'Team Member Except Self', value: 'team-except-self'},
      {name: 'Any Except Self', value: 'any-except-self'},
      {name: 'Any', value: 'any'},
    ])

    // 创建条件选项
    $('#getTarget-condition').loadItems([
      {name: 'Max Threat', value: 'max-threat'},
      {name: 'Nearest', value: 'nearest'},
      {name: 'Farthest', value: 'farthest'},
      {name: 'Min Attribute Value', value: 'min-attribute-value'},
      {name: 'Max Attribute Value', value: 'max-attribute-value'},
      {name: 'Min Attribute Ratio', value: 'min-attribute-ratio'},
      {name: 'Max Attribute Ratio', value: 'max-attribute-ratio'},
      {name: 'Random', value: 'random'},
    ])

    // 设置条件关联元素
    $('#getTarget-condition').enableHiddenMode().relate([
      {case: ['min-attribute-value', 'max-attribute-value'], targets: [
        $('#getTarget-attribute'),
      ]},
      {case: ['min-attribute-ratio', 'max-attribute-ratio'], targets: [
        $('#getTarget-attribute'),
        $('#getTarget-divisor'),
      ]},
    ])
  },
  parseCondition: function (condition, attribute, divisor) {
    const label = Local.get('command.getTarget.condition.' + condition)
    switch (condition) {
      case 'max-threat':
      case 'nearest':
      case 'farthest':
      case 'random':
        return label
      case 'min-attribute-value':
      case 'max-attribute-value':
        return label + Token('(') + Command.parseAttributeKey('actor', attribute) + Token(')')
      case 'min-attribute-ratio':
      case 'max-attribute-ratio':
        return label + Token('(') + Command.parseAttributeKey('actor', attribute) + Token(' / ') + Command.parseAttributeKey('actor', divisor) + Token(')')
    }
  },
  parse: function ({actor, selector, condition, attribute, divisor}) {
    const words = Command.words
    .push(Command.parseActor(actor))
    .push(Command.parseActorSelector(selector))
    .push(this.parseCondition(condition, attribute, divisor))
    return [
      {color: 'actor'},
      {text: Local.get('command.getTarget') + Token(': ')},
      {text: words.join()},
    ]
  },
  load: function ({
    actor     = {type: 'trigger'},
    selector  = 'enemy',
    condition = 'max-threat',
    attribute = Attribute.getDefAttributeId('actor', 'number'),
    divisor   = Attribute.getDefAttributeId('actor', 'number'),
  }) {
    // 加载角色数值属性选项
    const attrItems = Attribute.getAttributeItems('actor', 'number')
    $('#getTarget-attribute').loadItems(attrItems)
    $('#getTarget-divisor').loadItems(attrItems)
    const write = getElementWriter('getTarget')
    write('actor', actor)
    write('selector', selector)
    write('condition', condition)
    write('attribute', attribute)
    write('divisor', divisor)
    $('#getTarget-actor').getFocus()
  },
  save: function () {
    const read = getElementReader('getTarget')
    const actor = read('actor')
    const selector = read('selector')
    const condition = read('condition')
    switch (condition) {
      case 'max-threat':
      case 'nearest':
      case 'farthest':
      case 'random':
        Command.save({actor, selector, condition})
        break
      case 'min-attribute-value':
      case 'max-attribute-value': {
        const attribute = read('attribute')
        if (attribute === '') {
          return $('#getTarget-attribute').getFocus()
        }
        Command.save({actor, selector, condition, attribute})
        break
      }
      case 'min-attribute-ratio':
      case 'max-attribute-ratio': {
        const attribute = read('attribute')
        const divisor = read('divisor')
        if (attribute === '') {
          return $('#getTarget-attribute').getFocus()
        }
        if (divisor === '') {
          return $('#getTarget-divisor').getFocus()
        }
        Command.save({actor, selector, condition, attribute, divisor})
        break
      }
    }
  },
}

// 添加目标
Command.cases.appendTarget = {
  initialize: function () {
    $('#appendTarget-confirm').on('click', this.save)
  },
  parse: function ({actor, target}) {
    const words = Command.words
    .push(Command.parseActor(actor))
    .push(Command.parseActor(target))
    return [
      {color: 'actor'},
      {text: Local.get('command.appendTarget') + Token(': ')},
      {text: words.join()},
    ]
  },
  load: function ({
    actor   = {type: 'trigger'},
    target  = {type: 'trigger'},
  }) {
    const write = getElementWriter('appendTarget')
    write('actor', actor)
    write('target', target)
    $('#appendTarget-actor').getFocus()
  },
  save: function () {
    const read = getElementReader('appendTarget')
    const actor = read('actor')
    const target = read('target')
    Command.save({actor, target})
  },
}

// 移除目标
Command.cases.removeTarget = {
  initialize: function () {
    $('#removeTarget-confirm').on('click', this.save)
  },
  parse: function ({actor, target}) {
    const words = Command.words
    .push(Command.parseActor(actor))
    .push(Command.parseActor(target))
    return [
      {color: 'actor'},
      {text: Local.get('command.removeTarget') + Token(': ')},
      {text: words.join()},
    ]
  },
  load: function ({
    actor   = {type: 'trigger'},
    target  = {type: 'trigger'},
  }) {
    const write = getElementWriter('removeTarget')
    write('actor', actor)
    write('target', target)
    $('#removeTarget-actor').getFocus()
  },
  save: function () {
    const read = getElementReader('removeTarget')
    const actor = read('actor')
    const target = read('target')
    Command.save({actor, target})
  },
}

// 探测目标
Command.cases.detectTargets = {
  initialize: function () {
    $('#detectTargets-confirm').on('click', this.save)

    // 创建选择器选项
    $('#detectTargets-selector').loadItems([
      {name: 'Enemy', value: 'enemy'},
      {name: 'Friend', value: 'friend'},
      {name: 'Team Member', value: 'team'},
      {name: 'Team Member Except Self', value: 'team-except-self'},
      {name: 'Any Except Self', value: 'any-except-self'},
      {name: 'Any', value: 'any'},
    ])

    // 创建视线判断选项
    $('#detectTargets-inSight').loadItems([
      {name: 'Enabled', value: true},
      {name: 'Disabled', value: false},
    ])
  },
  parseInSight: function (inSight) {
    switch (inSight) {
      case true:
        return Local.get('command.detectTargets.inSight')
      case false:
        return ''
    }
  },
  parse: function ({actor, distance, selector, inSight}) {
    const words = Command.words
    .push(Command.parseActor(actor))
    .push(Token('≤') + Command.parseVariableNumber(distance, 't'))
    .push(Command.parseActorSelector(selector))
    .push(this.parseInSight(inSight))
    return [
      {color: 'actor'},
      {text: Local.get('command.detectTargets') + Token(': ')},
      {text: words.join()},
    ]
  },
  load: function ({
    actor     = {type: 'trigger'},
    distance  = 0,
    selector  = 'enemy',
    inSight   = false,
  }) {
    const write = getElementWriter('detectTargets')
    write('actor', actor)
    write('distance', distance)
    write('selector', selector)
    write('inSight', inSight)
    $('#detectTargets-actor').getFocus()
  },
  save: function () {
    const read = getElementReader('detectTargets')
    const actor = read('actor')
    const distance = read('distance')
    const selector = read('selector')
    const inSight = read('inSight')
    if (distance === 0) {
      return $('#detectTargets-distance').getFocus('all')
    }
    Command.save({actor, distance, selector, inSight})
  },
}

// 放弃目标
Command.cases.discardTargets = {
  initialize: function () {
    $('#discardTargets-confirm').on('click', this.save)

    // 创建选择器选项
    $('#discardTargets-selector').loadItems([
      {name: 'Enemy', value: 'enemy'},
      {name: 'Friend', value: 'friend'},
      {name: 'Team Member', value: 'team'},
      {name: 'Team Member Except Self', value: 'team-except-self'},
      {name: 'Any Except Self', value: 'any-except-self'},
      {name: 'Any', value: 'any'},
    ])
  },
  parse: function ({actor, selector, distance}) {
    const words = Command.words
    .push(Command.parseActor(actor))
    .push(Command.parseActorSelector(selector))
    if (distance !== 0) {
      words.push(Token('>=') + Command.parseVariableNumber(distance, 't'))
    }
    return [
      {color: 'actor'},
      {text: Local.get('command.discardTargets') + Token(': ')},
      {text: words.join()},
    ]
  },
  load: function ({
    actor     = {type: 'trigger'},
    selector  = 'any',
    distance  = 0,
  }) {
    const write = getElementWriter('discardTargets')
    write('actor', actor)
    write('selector', selector)
    write('distance', distance)
    $('#discardTargets-actor').getFocus()
  },
  save: function () {
    const read = getElementReader('discardTargets')
    const actor = read('actor')
    const selector = read('selector')
    const distance = read('distance')
    Command.save({actor, selector, distance})
  },
}

// 重置目标列表
Command.cases.resetTargets = {
  initialize: function () {
    $('#resetTargets-confirm').on('click', this.save)
  },
  parse: function ({actor}) {
    return [
      {color: 'actor'},
      {text: Local.get('command.resetTargets') + Token(': ')},
      {text: Command.parseActor(actor)},
    ]
  },
  load: function ({actor = {type: 'trigger'}}) {
    const write = getElementWriter('resetTargets')
    write('actor', actor)
    $('#resetTargets-actor').getFocus()
  },
  save: function () {
    const read = getElementReader('resetTargets')
    const actor = read('actor')
    Command.save({actor})
  },
}

// 渲染轮廓
Command.cases.renderOutline = {
  initialize: function () {
    $('#renderOutline-confirm').on('click', this.save)

    // 创建操作选项
    $('#renderOutline-operation').loadItems([
      {name: 'Add', value: 'add'},
      {name: 'Remove', value: 'remove'},
      {name: 'Reset', value: 'reset'},
    ])

    // 设置操作关联元素
    $('#renderOutline-operation').enableHiddenMode().relate([
      {case: 'add', targets: [
        $('#renderOutline-actor'),
        $('#renderOutline-color'),
      ]},
      {case: 'remove', targets: [
        $('#renderOutline-actor'),
      ]},
    ])
  },
  parse: function ({operation, actor, color}) {
    const label = Local.get('command.renderOutline.' + operation)
    const words = Command.words
    switch (operation) {
      case 'add':
        words.push(label).push(Command.parseActor(actor)).push(Command.parseHexColor(Color.simplifyHexColor(color)))
        break
      case 'remove':
        words.push(label).push(Command.parseActor(actor))
        break
      case 'reset':
        words.push(label)
        break
    }
    return [
      {color: 'flow'},
      {text: Local.get('command.renderOutline') + Token(': ')},
      {text: words.join()},
    ]
  },
  load: function ({
    operation = 'add',
    actor     = {type: 'trigger'},
    color     = 'ffffffff',
  }) {
    $('#renderOutline-operation').write(operation)
    $('#renderOutline-actor').write(actor)
    $('#renderOutline-color').write(color)
    $('#renderOutline-operation').getFocus()
  },
  save: function () {
    const operation = $('#renderOutline-operation').read()
    switch (operation) {
      case 'add': {
        const actor = $('#renderOutline-actor').read()
        const color = $('#renderOutline-color').read()
        Command.save({operation, actor, color})
        break
      }
      case 'remove': {
        const actor = $('#renderOutline-actor').read()
        Command.save({operation, actor})
        break
      }
      case 'reset':
        Command.save({operation})
        break
    }
  },
}

// 施放技能
Command.cases.castSkill = {
  initialize: function () {
    $('#castSkill-confirm').on('click', this.save)

    // 创建模式选项
    $('#castSkill-mode').loadItems([
      {name: 'By Shortcut Key', value: 'by-key'},
      {name: 'By Skill ID', value: 'by-id'},
      {name: 'By Skill Instance', value: 'by-skill'},
    ])

    // 设置模式关联元素
    $('#castSkill-mode').enableHiddenMode().relate([
      {case: 'by-key', targets: [
        $('#castSkill-key'),
      ]},
      {case: 'by-id', targets: [
        $('#castSkill-skillId'),
      ]},
      {case: 'by-skill', targets: [
        $('#castSkill-skill'),
      ]},
    ])

    // 创建等待结束选项
    $('#castSkill-wait').loadItems([
      {name: 'Yes', value: true},
      {name: 'No', value: false},
    ])
  },
  parse: function ({actor, mode, key, skillId, skill, wait}) {
    const words = Command.words.push(Command.parseActor(actor))
    switch (mode) {
      case 'by-key':
        words.push(Command.parseGroupEnumString('shortcut-key', key))
        break
      case 'by-id':
        words.push(Command.parseFileName(skillId))
        break
      case 'by-skill':
        words.push(Command.parseSkill(skill))
        break
    }
    words.push(Command.parseWait(wait))
    return [
      {color: 'skill'},
      {text: Local.get('command.castSkill') + Token(': ')},
      {text: words.join()},
    ]
  },
  load: function ({
    actor   = {type: 'trigger'},
    mode    = 'by-key',
    key     = Enum.getDefStringId('shortcut-key'),
    skillId = '',
    skill   = {type: 'trigger'},
    wait    = false,
  }) {
    // 加载快捷键选项
    $('#castSkill-key').loadItems(
      Enum.getStringItems('shortcut-key')
    )
    const write = getElementWriter('castSkill')
    write('actor', actor)
    write('mode', mode)
    write('key', key)
    write('skillId', skillId)
    write('skill', skill)
    write('wait', wait)
    $('#castSkill-actor').getFocus()
  },
  save: function () {
    const read = getElementReader('castSkill')
    const actor = read('actor')
    const mode = read('mode')
    const wait = read('wait')
    switch (mode) {
      case 'by-key': {
        const key = read('key')
        if (key === '') {
          return $('#castSkill-key').getFocus()
        }
        Command.save({actor, mode, key, wait})
        break
      }
      case 'by-id': {
        const skillId = read('skillId')
        if (skillId === '') {
          return $('#castSkill-skillId').getFocus()
        }
        Command.save({actor, mode, skillId, wait})
        break
      }
      case 'by-skill': {
        const skill = read('skill')
        Command.save({actor, mode, skill, wait})
        break
      }
    }
  },
}

// 设置技能
Command.cases.setSkill = {
  initialize: function () {
    $('#setSkill-confirm').on('click', this.save)

    // 创建操作选项
    $('#setSkill-operation').loadItems([
      {name: 'Set Cooldown Time', value: 'set-cooldown'},
      {name: 'Increase Cooldown Time', value: 'increase-cooldown'},
      {name: 'Decrease Cooldown Time', value: 'decrease-cooldown'},
    ])
  },
  parse: function ({skill, operation, cooldown}) {
    const words = Command.words
    .push(Command.parseSkill(skill))
    .push(Local.get('command.setSkill.' + operation))
    switch (operation) {
      case 'set-cooldown':
      case 'increase-cooldown':
      case 'decrease-cooldown':
        words.push(Command.parseVariableNumber(cooldown, 'ms'))
        break
    }
    return [
      {color: 'skill'},
      {text: Local.get('command.setSkill') + Token(': ')},
      {text: words.join()},
    ]
  },
  load: function ({
    skill     = {type: 'trigger'},
    operation = 'set-cooldown',
    cooldown  = 0,
  }) {
    const write = getElementWriter('setSkill')
    write('skill', skill)
    write('operation', operation)
    write('cooldown', cooldown)
    $('#setSkill-skill').getFocus()
  },
  save: function () {
    const read = getElementReader('setSkill')
    const skill = read('skill')
    const operation = read('operation')
    switch (operation) {
      case 'set-cooldown':
      case 'increase-cooldown':
      case 'decrease-cooldown': {
        const cooldown = read('cooldown')
        Command.save({skill, operation, cooldown})
        break
      }
    }
  },
}

// 创建触发器
Command.cases.createTrigger = {
  initialize: function () {
    $('#createTrigger-confirm').on('click', this.save)
  },
  parse: function ({triggerId, caster, origin, angle, distance, scale, timeScale}) {
    const casterName = Command.parseActor(caster)
    const originName = Command.parsePosition(origin)
    const words = Command.words
    .push(Command.parseVariableFile(triggerId))
    .push(casterName)
    .push(originName.indexOf(casterName) === -1 ? originName : '')
    .push(Command.parseAngle(angle))
    .push(Command.parseVariableNumber(distance, 't'))
    .push(Command.parseVariableNumber(scale))
    .push(Command.parseVariableNumber(timeScale))
    return [
      {color: 'skill'},
      {text: Local.get('command.createTrigger') + Token(': ')},
      {text: words.join()},
    ]
  },
  load: function ({
    triggerId = '',
    caster    = {type: 'trigger'},
    origin    = {type: 'actor', actor: {type: 'trigger'}},
    angle     = {type: 'direction', degrees: 0},
    distance  = 0,
    scale     = 1,
    timeScale = 1,
  }) {
    const write = getElementWriter('createTrigger')
    write('triggerId', triggerId)
    write('caster', caster)
    write('origin', origin)
    write('angle', angle)
    write('distance', distance)
    write('scale', scale)
    write('timeScale', timeScale)
    $('#createTrigger-triggerId').getFocus()
  },
  save: function () {
    const read = getElementReader('createTrigger')
    const triggerId = read('triggerId')
    if (triggerId === '') {
      return $('#createTrigger-triggerId').getFocus()
    }
    const caster = read('caster')
    const origin = read('origin')
    const angle = read('angle')
    const distance = read('distance')
    const scale = read('scale')
    const timeScale = read('timeScale')
    Command.save({triggerId, caster, origin, angle, distance, scale, timeScale})
  },
}

// 设置触发器速度
Command.cases.setTriggerSpeed = {
  initialize: function () {
    $('#setTriggerSpeed-confirm').on('click', this.save)
  },
  parse: function ({trigger, speed}) {
    const words = Command.words
    .push(Command.parseTrigger(trigger))
    .push(Command.parseVariableNumber(speed, 't/s'))
    return [
      {color: 'skill'},
      {text: Local.get('command.setTriggerSpeed') + Token(': ')},
      {text: words.join()},
    ]
  },
  load: function ({
    trigger = {type: 'trigger'},
    speed   = 0,
  }) {
    const write = getElementWriter('setTriggerSpeed')
    write('trigger', trigger)
    write('speed', speed)
    $('#setTriggerSpeed-trigger').getFocus()
  },
  save: function () {
    const read = getElementReader('setTriggerSpeed')
    const trigger = read('trigger')
    const speed = read('speed')
    Command.save({trigger, speed})
  },
}

// 设置触发器角度
Command.cases.setTriggerAngle = {
  initialize: function () {
    $('#setTriggerAngle-confirm').on('click', this.save)
  },
  parse: function ({trigger, angle}) {
    const words = Command.words
    .push(Command.parseTrigger(trigger))
    .push(Command.parseAngle(angle))
    return [
      {color: 'skill'},
      {text: Local.get('command.setTriggerAngle') + Token(': ')},
      {text: words.join()},
    ]
  },
  load: function ({
    trigger = {type: 'trigger'},
    angle   = {type: 'absolute', degrees: 0},
  }) {
    const write = getElementWriter('setTriggerAngle')
    write('trigger', trigger)
    write('angle', angle)
    $('#setTriggerAngle-trigger').getFocus()
  },
  save: function () {
    const read = getElementReader('setTriggerAngle')
    const trigger = read('trigger')
    const angle = read('angle')
    Command.save({trigger, angle})
  },
}

// 设置触发器持续时间
Command.cases.setTriggerDuration = {
  initialize: function () {
    $('#setTriggerDuration-confirm').on('click', this.save)

    // 创建操作选项
    $('#setTriggerDuration-operation').loadItems([
      {name: 'Set', value: 'set'},
      {name: 'Increase', value: 'increase'},
      {name: 'Decrease', value: 'decrease'},
    ])
  },
  parse: function ({trigger, operation, duration}) {
    const words = Command.words
    .push(Command.parseTrigger(trigger))
    .push(Local.get('command.setTriggerDuration.' + operation))
    .push(Command.parseVariableNumber(duration, 'ms'))
    return [
      {color: 'skill'},
      {text: Local.get('command.setTriggerDuration') + Token(': ')},
      {text: words.join()},
    ]
  },
  load: function ({
    trigger   = {type: 'trigger'},
    operation = 'set',
    duration  = 0,
  }) {
    const write = getElementWriter('setTriggerDuration')
    write('trigger', trigger)
    write('operation', operation)
    write('duration', duration)
    $('#setTriggerDuration-trigger').getFocus()
  },
  save: function () {
    const read = getElementReader('setTriggerDuration')
    const trigger = read('trigger')
    const operation = read('operation')
    const duration = read('duration')
    Command.save({trigger, operation, duration})
  },
}

// 设置触发器动作
Command.cases.setTriggerMotion = {
  initialize: function () {
    $('#setTriggerMotion-confirm').on('click', this.save)
  },
  parse: function ({trigger, motion}) {
    const words = Command.words
    .push(Command.parseTrigger(trigger))
    .push(Command.parseEnumString(motion))
    return [
      {color: 'skill'},
      {text: Local.get('command.setTriggerMotion') + Token(': ')},
      {text: words.join()},
    ]
  },
  load: function ({
    trigger = {type: 'trigger'},
    motion  = '',
  }) {
    const write = getElementWriter('setTriggerMotion')
    write('trigger', trigger)
    write('motion', motion)
    $('#setTriggerMotion-trigger').getFocus()
  },
  save: function () {
    const read = getElementReader('setTriggerMotion')
    const trigger = read('trigger')
    const motion = read('motion')
    if (motion === '') {
      return $('#setTriggerMotion-motion').getFocus()
    }
    Command.save({trigger, motion})
  },
}

// 设置库存
Command.cases.setInventory = {
  initialize: function () {
    $('#setInventory-confirm').on('click', this.save)

    // 创建操作选项
    $('#setInventory-operation').loadItems([
      {name: 'Increase Money', value: 'increase-money'},
      {name: 'Decrease Money', value: 'decrease-money'},
      {name: 'Increase Items', value: 'increase-items'},
      {name: 'Decrease Items', value: 'decrease-items'},
      {name: 'Gain Equipment', value: 'gain-equipment'},
      {name: 'Lose Equipment', value: 'lose-equipment'},
      {name: 'Gain Equipment', value: 'gain-equipment-instance'},
      {name: 'Lose Equipment', value: 'lose-equipment-instance'},
      {name: 'Swap Order of Items', value: 'swap'},
      {name: 'Sort Simply', value: 'sort'},
      {name: 'Sort by Filename', value: 'sort-by-order'},
      {name: 'Use Global Actor\'s Inventory', value: 'reference'},
      {name: 'Restore Inventory', value: 'dereference'},
      {name: 'Reset', value: 'reset'},
    ])

    // 设置关联元素
    $('#setInventory-operation').enableHiddenMode().relate([
      {case: ['increase-money', 'decrease-money'], targets: [
        $('#setInventory-money'),
      ]},
      {case: ['increase-items', 'decrease-items'], targets: [
        $('#setInventory-itemId'),
        $('#setInventory-quantity'),
      ]},
      {case: ['gain-equipment', 'lose-equipment'], targets: [
        $('#setInventory-equipmentId'),
      ]},
      {case: ['gain-equipment-instance', 'lose-equipment-instance'], targets: [
        $('#setInventory-equipment'),
      ]},
      {case: 'swap', targets: [
        $('#setInventory-order1'),
        $('#setInventory-order2'),
      ]},
      {case: 'reference', targets: [
        $('#setInventory-refActor'),
      ]},
    ])
  },
  parse: function ({actor, operation, money, itemId, quantity, equipmentId, equipment, order1, order2, refActor}) {
    const words = Command.words
    .push(Command.parseActor(actor))
    .push(Local.get('command.setInventory.' + operation))
    switch (operation) {
      case 'increase-money':
      case 'decrease-money':
        words.push(Command.parseVariableNumber(money))
        break
      case 'increase-items':
      case 'decrease-items':
        words.push(Command.parseVariableFile(itemId))
        words.push(Command.parseVariableNumber(quantity))
        break
      case 'gain-equipment':
      case 'lose-equipment':
        words.push(Command.parseVariableFile(equipmentId))
        break
      case 'gain-equipment-instance':
      case 'lose-equipment-instance':
        words.push(Command.parseEquipment(equipment))
        break
      case 'swap': {
        const a = Command.parseVariableNumber(order1)
        const b = Command.parseVariableNumber(order2)
        words.push(a + Token(' <-> ') + b)
        break
      }
      case 'reference':
        words.push(Command.parseActor(refActor))
        break
    }
    return [
      {color: 'inventory'},
      {text: Local.get('command.setInventory') + Token(': ')},
      {text: words.join()},
    ]
  },
  load: function ({
    actor       = {type: 'trigger'},
    operation   = 'increase-money',
    money       = 1,
    itemId      = '',
    quantity    = 1,
    equipmentId = '',
    equipment   = {type: 'trigger'},
    order1      = 0,
    order2      = 1,
    refActor    = {type: 'player'},
  }) {
    const write = getElementWriter('setInventory')
    write('actor', actor)
    write('operation', operation)
    write('money', money)
    write('itemId', itemId)
    write('quantity', quantity)
    write('equipmentId', equipmentId)
    write('equipment', equipment)
    write('order1', order1)
    write('order2', order2)
    write('refActor', refActor)
    $('#setInventory-actor').getFocus()
  },
  save: function () {
    const read = getElementReader('setInventory')
    const actor = read('actor')
    const operation = read('operation')
    switch (operation) {
      case 'increase-money':
      case 'decrease-money': {
        const money = read('money')
        Command.save({actor, operation, money})
        break
      }
      case 'increase-items':
      case 'decrease-items': {
        const itemId = read('itemId')
        const quantity = read('quantity')
        if (itemId === '') {
          return $('#setInventory-itemId').getFocus()
        }
        Command.save({actor, operation, itemId, quantity})
        break
      }
      case 'gain-equipment':
      case 'lose-equipment': {
        const equipmentId = read('equipmentId')
        if (equipmentId === '') {
          return $('#setInventory-equipmentId').getFocus()
        }
        Command.save({actor, operation, equipmentId})
        break
      }
      case 'gain-equipment-instance':
      case 'lose-equipment-instance': {
        const equipment = read('equipment')
        Command.save({actor, operation, equipment})
        break
      }
      case 'swap': {
        const order1 = read('order1')
        const order2 = read('order2')
        Command.save({actor, operation, order1, order2})
        break
      }
      case 'sort':
      case 'sort-by-order':
      case 'reset':
      case 'dereference':
        Command.save({actor, operation})
        break
      case 'reference': {
        const refActor = read('refActor')
        Command.save({actor, operation, refActor})
        break
      }
    }
  },
}

// 使用物品
Command.cases.useItem = {
  initialize: function () {
    $('#useItem-confirm').on('click', this.save)

    // 创建模式选项
    $('#useItem-mode').loadItems([
      {name: 'By Shortcut Key', value: 'by-key'},
      {name: 'By Item ID', value: 'by-id'},
      {name: 'By Item Instance', value: 'by-item'},
    ])

    // 设置模式关联元素
    $('#useItem-mode').enableHiddenMode().relate([
      {case: 'by-key', targets: [
        $('#useItem-key'),
      ]},
      {case: 'by-id', targets: [
        $('#useItem-itemId'),
      ]},
      {case: 'by-item', targets: [
        $('#useItem-item'),
      ]},
    ])

    // 创建等待结束选项
    $('#useItem-wait').loadItems([
      {name: 'Yes', value: true},
      {name: 'No', value: false},
    ])
  },
  parse: function ({actor, mode, key, itemId, item, wait}) {
    const words = Command.words.push(Command.parseActor(actor))
    switch (mode) {
      case 'by-key':
        words.push(Command.parseGroupEnumString('shortcut-key', key))
        break
      case 'by-id':
        words.push(Command.parseFileName(itemId))
        break
      case 'by-item':
        words.push(Command.parseItem(item))
        break
    }
    words.push(Command.parseWait(wait))
    return [
      {color: 'inventory'},
      {text: Local.get('command.useItem') + Token(': ')},
      {text: words.join()},
    ]
  },
  load: function ({
    actor   = {type: 'trigger'},
    mode    = 'by-key',
    key     = Enum.getDefStringId('shortcut-key'),
    itemId  = '',
    item    = {type: 'trigger'},
    wait    = false,
  }) {
    // 加载快捷键选项
    $('#useItem-key').loadItems(
      Enum.getStringItems('shortcut-key')
    )
    const write = getElementWriter('useItem')
    write('actor', actor)
    write('mode', mode)
    write('key', key)
    write('itemId', itemId)
    write('item', item)
    write('wait', wait)
    $('#useItem-actor').getFocus()
  },
  save: function () {
    const read = getElementReader('useItem')
    const actor = read('actor')
    const mode = read('mode')
    const wait = read('wait')
    switch (mode) {
      case 'by-key': {
        const key = read('key')
        if (key === '') {
          return $('#useItem-key').getFocus()
        }
        Command.save({actor, mode, key, wait})
        break
      }
      case 'by-id': {
        const itemId = read('itemId')
        if (itemId === '') {
          return $('#useItem-itemId').getFocus()
        }
        Command.save({actor, mode, itemId, wait})
        break
      }
      case 'by-item': {
        const item = read('item')
        Command.save({actor, mode, item, wait})
        break
      }
    }
  },
}

// 设置物品
Command.cases.setItem = {
  initialize: function () {
    $('#setItem-confirm').on('click', this.save)

    // 创建操作选项
    $('#setItem-operation').loadItems([
      {name: 'Increase', value: 'increase'},
      {name: 'Decrease', value: 'decrease'},
    ])
  },
  parse: function ({item, operation, quantity}) {
    const words = Command.words
    .push(Command.parseItem(item))
    .push(Local.get('command.setItem.' + operation))
    switch (operation) {
      case 'increase':
      case 'decrease':
        words.push(Command.parseVariableNumber(quantity))
        break
    }
    return [
      {color: 'inventory'},
      {text: Local.get('command.setItem') + Token(': ')},
      {text: words.join()},
    ]
  },
  load: function ({
    item      = {type: 'trigger'},
    operation = 'increase',
    quantity  = 1,
  }) {
    const write = getElementWriter('setItem')
    write('item', item)
    write('operation', operation)
    write('quantity', quantity)
    $('#setItem-item').getFocus()
  },
  save: function () {
    const read = getElementReader('setItem')
    const item = read('item')
    const operation = read('operation')
    switch (operation) {
      case 'increase':
      case 'decrease': {
        const quantity = read('quantity')
        Command.save({item, operation, quantity})
        break
      }
    }
  },
}

// 设置冷却时间
Command.cases.setCooldown = {
  initialize: function () {
    $('#setCooldown-confirm').on('click', this.save)

    // 创建操作选项
    $('#setCooldown-operation').loadItems([
      {name: 'Set', value: 'set'},
      {name: 'Increase', value: 'increase'},
      {name: 'Decrease', value: 'decrease'},
    ])
  },
  parse: function ({actor, operation, key, cooldown}) {
    const words = Command.words
    .push(Command.parseActor(actor))
    .push(Local.get('command.setCooldown.' + operation))
    .push(Command.parseVariableEnum('cooldown-key', key))
    .push(Command.parseVariableNumber(cooldown, 'ms'))
    return [
      {color: 'inventory'},
      {text: Local.get('command.setCooldown') + Token(': ')},
      {text: words.join()},
    ]
  },
  load: function ({
    actor     = {type: 'trigger'},
    operation = 'set',
    key       = Enum.getDefStringId('cooldown-key'),
    cooldown  = 0,
  }) {
    // 加载冷却键选项
    $('#setCooldown-key').loadItems(
      Enum.getStringItems('cooldown-key')
    )
    const write = getElementWriter('setCooldown')
    write('actor', actor)
    write('operation', operation)
    write('key', key)
    write('cooldown', cooldown)
    $('#setCooldown-actor').getFocus()
  },
  save: function () {
    const read = getElementReader('setCooldown')
    const actor = read('actor')
    const operation = read('operation')
    const key = read('key')
    if (key === '') {
      return $('#setCooldown-key').getFocus()
    }
    const cooldown = read('cooldown')
    Command.save({actor, operation, key, cooldown})
  },
}

// 设置快捷键
Command.cases.setShortcut = {
  initialize: function () {
    $('#setShortcut-confirm').on('click', this.save)

    // 创建操作选项
    $('#setShortcut-operation').loadItems([
      {name: 'Set Item Shortcut', value: 'set-item-shortcut'},
      {name: 'Set Skill Shortcut', value: 'set-skill-shortcut'},
      {name: 'Delete Shortcut', value: 'delete-shortcut'},
      {name: 'Swap Shortcuts', value: 'swap-shortcuts'},
    ])

    // 设置操作关联元素
    $('#setShortcut-operation').enableHiddenMode().relate([
      {case: 'set-item-shortcut', targets: [
        $('#setShortcut-itemId'),
      ]},
      {case: 'set-skill-shortcut', targets: [
        $('#setShortcut-skillId'),
      ]},
      {case: 'swap-shortcuts', targets: [
        $('#setShortcut-key2'),
      ]},
    ])
  },
  parse: function ({actor, operation, itemId, skillId, key, key2}) {
    const shortcutKey = Command.parseVariableEnum('shortcut-key', key)
    const words = Command.words
    .push(Command.parseActor(actor))
    .push(Local.get('command.setShortcut.' + operation))
    switch (operation) {
      case 'set-item-shortcut': {
        words.push(shortcutKey + Token(' = ') + Command.parseVariableFile(itemId))
        break
      }
      case 'set-skill-shortcut':
        words.push(shortcutKey + Token(' = ') + Command.parseVariableFile(skillId))
        break
      case 'delete-shortcut':
        words.push(shortcutKey)
        break
      case 'swap-shortcuts':
        words.push(shortcutKey + Token(' <-> ') + Command.parseVariableEnum('shortcut-key', key2))
        break
    }
    return [
      {color: 'inventory'},
      {text: Local.get('command.setShortcut') + Token(': ')},
      {text: words.join()},
    ]
  },
  load: function ({
    actor     = {type: 'trigger'},
    operation = 'set-item-shortcut',
    itemId    = '',
    skillId   = '',
    key       = Enum.getDefStringId('shortcut-key'),
    key2      = Enum.getDefStringId('shortcut-key'),
  }) {
    // 加载快捷键选项
    const items = Enum.getStringItems('shortcut-key')
    $('#setShortcut-key').loadItems(items)
    $('#setShortcut-key2').loadItems(items)
    const write = getElementWriter('setShortcut')
    write('actor', actor)
    write('operation', operation)
    write('key', key)
    write('key2', key2)
    write('itemId', itemId)
    write('skillId', skillId)
    $('#setShortcut-operation').getFocus()
  },
  save: function () {
    const read = getElementReader('setShortcut')
    const actor = read('actor')
    const operation = read('operation')
    const key = read('key')
    if (key === '') {
      return $('#setShortcut-key').getFocus()
    }
    switch (operation) {
      case 'set-item-shortcut': {
        const itemId = read('itemId')
        if (itemId === '') {
          return $('#setShortcut-itemId').getFocus()
        }
        Command.save({actor, operation, key, itemId})
        break
      }
      case 'set-skill-shortcut': {
        const skillId = read('skillId')
        if (skillId === '') {
          return $('#setShortcut-skillId').getFocus()
        }
        Command.save({actor, operation, key, skillId})
        break
      }
      case 'delete-shortcut':
        Command.save({actor, operation, key})
        break
      case 'swap-shortcuts': {
        const key2 = read('key2')
        Command.save({actor, operation, key, key2})
        break
      }
    }
  },
}

// 激活场景
Command.cases.activateScene = {
  initialize: function () {
    $('#activateScene-confirm').on('click', this.save)

    // 创建场景选项
    $('#activateScene-pointer').loadItems([
      {name: 'Scene A', value: 0},
      {name: 'Scene B', value: 1},
    ])
  },
  parsePointer: function (pointer) {
    switch (pointer) {
      case 0: return 'A'
      case 1: return 'B'
    }
  },
  parse: function ({pointer}) {
    return [
      {color: 'scene'},
      {text: Local.get('command.activateScene') + Token(': ')},
      {text: this.parsePointer(pointer)},
    ]
  },
  load: function ({pointer = 0}) {
    const write = getElementWriter('activateScene')
    write('pointer', pointer)
    $('#activateScene-pointer').getFocus()
  },
  save: function () {
    const read = getElementReader('activateScene')
    const pointer = read('pointer')
    Command.save({pointer})
  },
}

// 加载场景
Command.cases.loadScene = {
  initialize: function () {
    $('#loadScene-confirm').on('click', this.save)

    // 创建转移玩家角色选项
    $('#loadScene-transfer').loadItems([
      {name: 'Yes', value: true},
      {name: 'No', value: false},
    ])

    // 设置转移玩家角色关联元素
    $('#loadScene-transfer').enableHiddenMode().relate([
      {case: true, targets: [
        $('#loadScene-x'),
        $('#loadScene-y'),
      ]},
    ])
  },
  parse: function ({sceneId, transfer, x, y}) {
    const words = Command.words
    .push(Command.parseVariableFile(sceneId))
    if (transfer) {
      words
      .push(Command.parseVariableNumber(x))
      .push(Command.parseVariableNumber(y))
    }
    return [
      {color: 'scene'},
      {text: Local.get('command.loadScene') + Token(': ')},
      {text: words.join()},
    ]
  },
  load: function ({
    sceneId   = '',
    transfer  = true,
    x         = 0,
    y         = 0,
  }) {
    const write = getElementWriter('loadScene')
    write('sceneId', sceneId)
    write('transfer', transfer)
    write('x', x)
    write('y', y)
    $('#loadScene-sceneId').getFocus()
  },
  save: function () {
    const read = getElementReader('loadScene')
    const sceneId = read('sceneId')
    if (sceneId === '') {
      return $('#loadScene-sceneId').getFocus()
    }
    const transfer = read('transfer')
    switch (transfer) {
      case true: {
        const x = read('x')
        const y = read('y')
        Command.save({sceneId, transfer, x, y})
        break
      }
      case false:
        Command.save({sceneId, transfer})
        break
    }
  },
}

// 加载子场景
Command.cases.loadSubscene = {
  initialize: function () {
    $('#loadSubscene-confirm').on('click', this.save)
  },
  parse: function ({sceneId, shiftX, shiftY}) {
    const words = Command.words
    .push(Command.parseVariableFile(sceneId))
    .push(Command.parseVariableNumber(shiftX))
    .push(Command.parseVariableNumber(shiftY))
    return [
      {color: 'scene'},
      {text: Local.get('command.loadSubscene') + Token(': ')},
      {text: words.join()},
    ]
  },
  load: function ({
    sceneId = '',
    shiftX  = 0,
    shiftY  = 0,
  }) {
    const write = getElementWriter('loadSubscene')
    write('sceneId', sceneId)
    write('shiftX', shiftX)
    write('shiftY', shiftY)
    $('#loadSubscene-sceneId').getFocus()
  },
  save: function () {
    const read = getElementReader('loadSubscene')
    const sceneId = read('sceneId')
    if (sceneId === '') {
      return $('#loadSubscene-sceneId').getFocus()
    }
    const shiftX = read('shiftX')
    const shiftY = read('shiftY')
    Command.save({sceneId, shiftX, shiftY})
  },
}

// 卸载子场景
Command.cases.unloadSubscene = {
  initialize: function () {
    $('#unloadSubscene-confirm').on('click', this.save)
  },
  parse: function ({sceneId}) {
    return [
      {color: 'scene'},
      {text: Local.get('command.unloadSubscene') + Token(': ')},
      {text: Command.parseVariableFile(sceneId)},
    ]
  },
  load: function ({
    sceneId = '',
  }) {
    const write = getElementWriter('unloadSubscene')
    write('sceneId', sceneId)
    $('#unloadSubscene-sceneId').getFocus()
  },
  save: function () {
    const read = getElementReader('unloadSubscene')
    const sceneId = read('sceneId')
    if (sceneId === '') {
      return $('#unloadSubscene-sceneId').getFocus()
    }
    Command.save({sceneId})
  },
}

// 删除场景
Command.cases.deleteScene = {
  parse: function () {
    return [
      {color: 'scene'},
      {text: Local.get('command.deleteScene')},
    ]
  },
  save: function () {
    Command.save({})
  },
}

// 限制摄像机边界
Command.cases.clampCamera = {
  initialize: function () {
    $('#clampCamera-confirm').on('click', this.save)
  },
  parse: function ({left, top, right, bottom}) {
    const words = Command.words
    .push(Local.get('command.clampCamera.left') + Token(' = ') + Command.parseVariableNumber(left))
    .push(Local.get('command.clampCamera.top') + Token(' = ') + Command.parseVariableNumber(top))
    .push(Local.get('command.clampCamera.right') + Token(' = ') + Command.parseVariableNumber(right))
    .push(Local.get('command.clampCamera.bottom') + Token(' = ') + Command.parseVariableNumber(bottom))
    return [
      {color: 'scene'},
      {text: Local.get('command.clampCamera') + Token(': ')},
      {text: words.join()},
    ]
  },
  load: function ({
    left    = 0,
    top     = 0,
    right   = 0,
    bottom  = 0,
  }) {
    const write = getElementWriter('clampCamera')
    write('left', left)
    write('top', top)
    write('right', right)
    write('bottom', bottom)
    $('#clampCamera-left').getFocus('all')
  },
  save: function () {
    const read = getElementReader('clampCamera')
    const left = read('left')
    const top = read('top')
    const right = read('right')
    const bottom = read('bottom')
    Command.save({left, top, right, bottom})
  },
}

// 解除摄像机边界
Command.cases.unclampCamera = {
  parse: function () {
    return [
      {color: 'scene'},
      {text: Local.get('command.unclampCamera')},
    ]
  },
  save: function () {
    Command.save({})
  },
}

// 移动摄像机
Command.cases.moveCamera = {
  initialize: function () {
    $('#moveCamera-confirm').on('click', this.save)

    // 创建模式选项
    $('#moveCamera-mode').loadItems([
      {name: 'Move to Position', value: 'position'},
      {name: 'Follow Actor', value: 'actor'},
    ])

    // 设置模式关联元素
    $('#moveCamera-mode').enableHiddenMode().relate([
      {case: 'position', targets: [
        $('#moveCamera-position'),
      ]},
      {case: 'actor', targets: [
        $('#moveCamera-actor'),
      ]},
    ])

    // 创建等待选项
    $('#moveCamera-wait').loadItems([
      {name: 'Yes', value: true},
      {name: 'No', value: false},
    ])

    // 创建过渡方式选项 - 窗口打开事件
    $('#moveCamera').on('open', function (event) {
      $('#moveCamera-easingId').loadItems(
        Data.createEasingItems()
      )
    })

    // 清理内存 - 窗口已关闭事件
    $('#moveCamera').on('closed', function (event) {
      $('#moveCamera-easingId').clear()
    })
  },
  parse: function ({mode, position, actor, easingId, duration, wait}) {
    const words = Command.words.push(Local.get('command.moveCamera.' + mode))
    switch (mode) {
      case 'position':
        words.push(Command.parsePosition(position))
        break
      case 'actor':
        words.push(Command.parseActor(actor))
        break
    }
    words.push(Command.parseEasing(easingId, duration, wait))
    return [
      {color: 'scene'},
      {text: Local.get('command.moveCamera') + Token(': ')},
      {text: words.join()},
    ]
  },
  load: function ({
    mode      = 'position',
    position  = {type: 'absolute', x: 0, y: 0},
    actor     = {type: 'trigger'},
    easingId  = Data.easings[0].id,
    duration  = 0,
    wait      = false,
  }) {
    const write = getElementWriter('moveCamera')
    write('mode', mode)
    write('position', position)
    write('actor', actor)
    write('easingId', easingId)
    write('duration', duration)
    write('wait', wait)
    $('#moveCamera-mode').getFocus()
  },
  save: function () {
    const read = getElementReader('moveCamera')
    const mode = read('mode')
    const easingId = read('easingId')
    const duration = read('duration')
    const wait = read('wait')
    switch (mode) {
      case 'position': {
        const position = read('position')
        Command.save({mode, position, easingId, duration, wait})
        break
      }
      case 'actor': {
        const actor = read('actor')
        Command.save({mode, actor, easingId, duration, wait})
        break
      }
    }
  },
}

// 设置缩放率
Command.cases.setZoomFactor = {
  initialize: function () {
    $('#setZoomFactor-confirm').on('click', this.save)

    // 创建等待选项
    $('#setZoomFactor-wait').loadItems([
      {name: 'Yes', value: true},
      {name: 'No', value: false},
    ])

    // 创建过渡方式选项 - 窗口打开事件
    $('#setZoomFactor').on('open', function (event) {
      $('#setZoomFactor-easingId').loadItems(
        Data.createEasingItems()
      )
    })

    // 清理内存 - 窗口已关闭事件
    $('#setZoomFactor').on('closed', function (event) {
      $('#setZoomFactor-easingId').clear()
    })
  },
  parse: function ({zoom, easingId, duration, wait}) {
    const words = Command.words
    .push(Command.parseVariableNumber(zoom))
    .push(Command.parseEasing(easingId, duration, wait))
    return [
      {color: 'scene'},
      {text: Local.get('command.setZoomFactor') + Token(': ')},
      {text: words.join()},
    ]
  },
  load: function ({
    zoom      = 1,
    easingId  = Data.easings[0].id,
    duration  = 0,
    wait      = false,
  }) {
    const write = getElementWriter('setZoomFactor')
    write('zoom', zoom)
    write('easingId', easingId)
    write('duration', duration)
    write('wait', wait)
    $('#setZoomFactor-zoom').getFocus('all')
  },
  save: function () {
    const read = getElementReader('setZoomFactor')
    const zoom = read('zoom')
    const easingId = read('easingId')
    const duration = read('duration')
    const wait = read('wait')
    Command.save({zoom, easingId, duration, wait})
  },
}

// 设置环境光
Command.cases.setAmbientLight = {
  initialize: function () {
    $('#setAmbientLight-confirm').on('click', this.save)

    // 创建等待结束选项
    $('#setAmbientLight-wait').loadItems([
      {name: 'Yes', value: true},
      {name: 'No', value: false},
    ])

    // 创建过渡方式选项 - 窗口打开事件
    $('#setAmbientLight').on('open', function (event) {
      $('#setAmbientLight-easingId').loadItems(
        Data.createEasingItems()
      )
    })

    // 清理内存 - 窗口已关闭事件
    $('#setAmbientLight').on('closed', function (event) {
      $('#setAmbientLight-easingId').clear()
    })
  },
  parseColor: function (red, green, blue) {
    const r = Command.parseVariableNumber(red)
    const g = Command.parseVariableNumber(green)
    const b = Command.parseVariableNumber(blue)
    return 'RGB' + Token('(') + r + Token(', ') + g + Token(', ') + b + Token(')')
  },
  parse: function ({red, green, blue, easingId, duration, wait}) {
    const words = Command.words
    .push(this.parseColor(red, green, blue))
    .push(Command.parseEasing(easingId, duration, wait))
    const contents = [
      {color: 'scene'},
      {text: Local.get('command.setAmbientLight') + Token(': ')},
      {text: words.join()},
    ]
    return contents
  },
  load: function ({
    red       = 0,
    green     = 0,
    blue      = 0,
    easingId  = Data.easings[0].id,
    duration  = 0,
    wait      = false,
  }) {
    const write = getElementWriter('setAmbientLight')
    write('red', red)
    write('green', green)
    write('blue', blue)
    write('easingId', easingId)
    write('duration', duration)
    write('wait', wait)
    $('#setAmbientLight-red').getFocus('all')
  },
  save: function () {
    const read = getElementReader('setAmbientLight')
    const red = read('red')
    const green = read('green')
    const blue = read('blue')
    const easingId = read('easingId')
    const duration = read('duration')
    const wait = read('wait')
    Command.save({red, green, blue, easingId, duration, wait})
  },
}

// 改变画面色调
Command.cases.tintScreen = {
  initialize: function () {
    $('#tintScreen-confirm').on('click', this.save)

    // 创建等待结束选项
    $('#tintScreen-wait').loadItems([
      {name: 'Yes', value: true},
      {name: 'No', value: false},
    ])

    // 创建过渡方式选项 - 窗口打开事件
    $('#tintScreen').on('open', function (event) {
      $('#tintScreen-easingId').loadItems(
        Data.createEasingItems()
      )
    })

    // 清理内存 - 窗口已关闭事件
    $('#tintScreen').on('closed', function (event) {
      $('#tintScreen-easingId').clear()
      $('#tintScreen-filter').clear()
    })

    // 写入滤镜框 - 色调输入框输入事件
    $('#tintScreen-tint-0, #tintScreen-tint-1, #tintScreen-tint-2, #tintScreen-tint-3')
    .on('input', function (event) {
      $('#tintScreen-filter').write([
        $('#tintScreen-tint-0').read(),
        $('#tintScreen-tint-1').read(),
        $('#tintScreen-tint-2').read(),
        $('#tintScreen-tint-3').read(),
      ])
    })
  },
  parseTint: function ([red, green, blue, gray]) {
    const _red = Command.setNumberColor(red)
    const _green = Command.setNumberColor(green)
    const _blue = Command.setNumberColor(blue)
    const _gray = Command.setNumberColor(gray)
    return Token('(') + _red + Token(', ') + _green + Token(', ') + _blue + Token(', ') + _gray + Token(')')
  },
  parse: function ({tint, easingId, duration, wait}) {
    const words = Command.words
    .push(this.parseTint(tint))
    .push(Command.parseEasing(easingId, duration, wait))
    return [
      {color: 'scene'},
      {text: Local.get('command.tintScreen') + Token(': ')},
      {text: words.join()},
    ]
  },
  load: function ({
    tint      = [0, 0, 0, 0],
    easingId  = Data.easings[0].id,
    duration  = 0,
    wait      = false,
  }) {
    const write = getElementWriter('tintScreen')
    write('tint-0', tint[0])
    write('tint-1', tint[1])
    write('tint-2', tint[2])
    write('tint-3', tint[3])
    write('filter', tint)
    write('easingId', easingId)
    write('duration', duration)
    write('wait', wait)
    $('#tintScreen-tint-0').getFocus('all')
  },
  save: function () {
    const read = getElementReader('tintScreen')
    const red = read('tint-0')
    const green = read('tint-1')
    const blue = read('tint-2')
    const gray = read('tint-3')
    const easingId = read('easingId')
    const duration = read('duration')
    const wait = read('wait')
    const tint = [red, green, blue, gray]
    Command.save({tint, easingId, duration, wait})
  },
}

// 震动屏幕
Command.cases.shakeScreen = {
  initialize: function () {
    $('#shakeScreen-confirm').on('click', this.save)

    // 创建震动模式选项
    $('#shakeScreen-mode').loadItems([
      {name: 'Random', value: 'random'},
      {name: 'Horizontal', value: 'horizontal'},
      {name: 'Vertical', value: 'vertical'},
    ])

    // 创建等待结束选项
    $('#shakeScreen-wait').loadItems([
      {name: 'Yes', value: true},
      {name: 'No', value: false},
    ])

    // 创建过渡方式选项 - 窗口打开事件
    $('#shakeScreen').on('open', function (event) {
      $('#shakeScreen-easingId').loadItems(
        Data.createEasingItems()
      )
    })

    // 清理内存 - 窗口已关闭事件
    $('#shakeScreen').on('closed', function (event) {
      $('#shakeScreen-easingId').clear()
    })
  },
  parse: function ({mode, power, speed, easingId, duration, wait}) {
    const words = Command.words
    .push(Local.get('command.shakeScreen.' + mode))
    .push(Command.setNumberColor(power))
    .push(Command.setNumberColor(speed))
    .push(Command.parseEasing(easingId, duration, wait))
    return [
      {color: 'scene'},
      {text: Local.get('command.shakeScreen') + Token(': ')},
      {text: words.join()},
    ]
  },
  load: function ({
    mode      = 'random',
    power     = 5,
    speed     = 10,
    easingId  = Data.easings[0].id,
    duration  = 200,
    wait      = false,
  }) {
    const write = getElementWriter('shakeScreen')
    write('mode', mode)
    write('power', power)
    write('speed', speed)
    write('easingId', easingId)
    write('duration', duration)
    write('wait', wait)
    $('#shakeScreen-mode').getFocus()
  },
  save: function () {
    const read = getElementReader('shakeScreen')
    const mode = read('mode')
    const power = read('power')
    const speed = read('speed')
    const easingId = read('easingId')
    const duration = read('duration')
    const wait = read('wait')
    Command.save({mode, power, speed, easingId, duration, wait})
  },
}

// 设置图块
Command.cases.setTile = {
  initialize: function () {
    $('#setTile-confirm').on('click', this.save)
  },
  parse: function ({tilemap, tilemapX, tilemapY, tilesetId, tilesetX, tilesetY}) {
    const words = Command.words
    .push(Command.parseTilemap(tilemap))
    .push(Command.parseVariableNumber(tilemapX))
    .push(Command.parseVariableNumber(tilemapY))
    .push(Command.parseFileName(tilesetId))
    .push(Command.parseVariableNumber(tilesetX))
    .push(Command.parseVariableNumber(tilesetY))
    return [
      {color: 'scene'},
      {text: Local.get('command.setTile') + Token(': ')},
      {text: words.join()},
    ]
  },
  load: function ({
    tilemap   = {type: 'trigger'},
    tilemapX  = 0,
    tilemapY  = 0,
    tilesetId = '',
    tilesetX  = 0,
    tilesetY  = 0,
  }) {
    const write = getElementWriter('setTile')
    write('tilemap', tilemap)
    write('tilemapX', tilemapX)
    write('tilemapY', tilemapY)
    write('tilesetId', tilesetId)
    write('tilesetX', tilesetX)
    write('tilesetY', tilesetY)
    $('#setTile-tilemap').getFocus()
  },
  save: function () {
    const read = getElementReader('setTile')
    const tilemap = read('tilemap')
    const tilemapX = read('tilemapX')
    const tilemapY = read('tilemapY')
    const tilesetId = read('tilesetId')
    const tilesetX = read('tilesetX')
    const tilesetY = read('tilesetY')
    if (tilesetId === '') {
      return $('#setTile-tilesetId').getFocus()
    }
    Command.save({tilemap, tilemapX, tilemapY, tilesetId, tilesetX, tilesetY})
  }
}

// 删除图块
Command.cases.deleteTile = {
  initialize: function () {
    $('#deleteTile-confirm').on('click', this.save)
  },
  parse: function ({tilemap, tilemapX, tilemapY}) {
    const words = Command.words
    .push(Command.parseTilemap(tilemap))
    .push(Command.parseVariableNumber(tilemapX))
    .push(Command.parseVariableNumber(tilemapY))
    return [
      {color: 'scene'},
      {text: Local.get('command.deleteTile') + Token(': ')},
      {text: words.join()},
    ]
  },
  load: function ({
    tilemap   = {type: 'trigger'},
    tilemapX  = 0,
    tilemapY  = 0,
  }) {
    const write = getElementWriter('deleteTile')
    write('tilemap', tilemap)
    write('tilemapX', tilemapX)
    write('tilemapY', tilemapY)
    $('#deleteTile-tilemap').getFocus()
  },
  save: function () {
    const read = getElementReader('deleteTile')
    const tilemap = read('tilemap')
    const tilemapX = read('tilemapX')
    const tilemapY = read('tilemapY')
    Command.save({tilemap, tilemapX, tilemapY})
  }
}

// 设置地形
Command.cases.setTerrain = {
  initialize: function () {
    $('#setTerrain-confirm').on('click', this.save)
    $('#setTerrain-terrain').loadItems([
      {name: 'Land', value: 'land'},
      {name: 'Water', value: 'water'},
      {name: 'Wall', value: 'wall'},
    ])
  },
  parse: function ({position, terrain}) {
    const words = Command.words
    .push(Command.parsePosition(position))
    .push(Local.get('command.setTerrain.' + terrain))
    return [
      {color: 'scene'},
      {text: Local.get('command.setTerrain') + Token(': ')},
      {text: words.join()},
    ]
  },
  load: function ({
    position  = {type: 'absolute', x: 0, y: 0},
    terrain   = 'land',
  }) {
    const write = getElementWriter('setTerrain')
    write('position', position)
    write('terrain', terrain)
    $('#setTerrain-position').getFocus()
  },
  save: function () {
    const read = getElementReader('setTerrain')
    const position = read('position')
    const terrain = read('terrain')
    Command.save({position, terrain})
  }
}

// 设置游戏速度
Command.cases.setGameSpeed = {
  initialize: function () {
    $('#setGameSpeed-confirm').on('click', this.save)

    // 创建等待选项
    $('#setGameSpeed-wait').loadItems([
      {name: 'Yes', value: true},
      {name: 'No', value: false},
    ])

    // 创建过渡方式选项 - 窗口打开事件
    $('#setGameSpeed').on('open', function (event) {
      $('#setGameSpeed-easingId').loadItems(
        Data.createEasingItems()
      )
    })

    // 清理内存 - 窗口已关闭事件
    $('#setGameSpeed').on('closed', function (event) {
      $('#setGameSpeed-easingId').clear()
    })
  },
  parse: function ({speed, easingId, duration, wait}) {
    const words = Command.words
    .push(Command.parseVariableNumber(speed))
    .push(Command.parseEasing(easingId, duration, wait))
    return [
      {color: 'system'},
      {text: Local.get('command.setGameSpeed') + Token(': ')},
      {text: words.join()},
    ]
  },
  load: function ({
    speed     = 1,
    easingId  = Data.easings[0].id,
    duration  = 0,
    wait      = false,
  }) {
    const write = getElementWriter('setGameSpeed')
    write('speed', speed)
    write('easingId', easingId)
    write('duration', duration)
    write('wait', wait)
    $('#setGameSpeed-speed').getFocus('all')
  },
  save: function () {
    const read = getElementReader('setGameSpeed')
    const speed = read('speed')
    const easingId = read('easingId')
    const duration = read('duration')
    const wait = read('wait')
    Command.save({speed, easingId, duration, wait})
  },
}

// 设置鼠标指针
Command.cases.setCursor = {
  initialize: function () {
    $('#setCursor-confirm').on('click', this.save)
  },
  parse: function ({image}) {
    return [
      {color: 'system'},
      {text: Local.get('command.setCursor') + Token(': ')},
      {text: Command.parseFileName(image)},
    ]
  },
  load: function ({image = ''}) {
    const write = getElementWriter('setCursor')
    write('image', image)
    $('#setCursor-image').getFocus()
  },
  save: function () {
    const read = getElementReader('setCursor')
    const image = read('image')
    Command.save({image})
  },
}

// 设置队伍关系
Command.cases.setTeamRelation = {
  initialize: function () {
    $('#setTeamRelation-confirm').on('click', this.save)

    // 创建关系选项
    $('#setTeamRelation-relation').loadItems([
      {name: 'Enemy', value: 0},
      {name: 'Friend', value: 1},
    ])

    // 创建过渡方式选项 - 窗口打开事件
    $('#setTeamRelation').on('open', function (event) {
      const items = Data.createTeamItems()
      $('#setTeamRelation-teamId1').loadItems(items)
      $('#setTeamRelation-teamId2').loadItems(items)
    })

    // 清理内存 - 窗口已关闭事件
    $('#setTeamRelation').on('closed', function (event) {
      $('#setTeamRelation-teamId1').clear()
      $('#setTeamRelation-teamId2').clear()
    })
  },
  parseRelation: function (relation) {
    return Local.get('command.setTeamRelation.relation.' + relation)
  },
  parse: function ({teamId1, teamId2, relation}) {
    const words = Command.words
    .push(Command.parseTeam(teamId1))
    .push(Command.parseTeam(teamId2))
    .push(this.parseRelation(relation))
    return [
      {color: 'system'},
      {text: Local.get('command.setTeamRelation') + Token(': ')},
      {text: words.join()},
    ]
  },
  load: function ({
    teamId1   = Data.teams.list[0].id,
    teamId2   = Data.teams.list[0].id,
    relation  = 0,
  }) {
    const write = getElementWriter('setTeamRelation')
    write('teamId1', teamId1)
    write('teamId2', teamId2)
    write('relation', relation)
    $('#setTeamRelation-teamId1').getFocus()
  },
  save: function () {
    const read = getElementReader('setTeamRelation')
    const teamId1 = read('teamId1')
    const teamId2 = read('teamId2')
    const relation = read('relation')
    Command.save({teamId1, teamId2, relation})
  },
}

// 开关碰撞系统
Command.cases.switchCollisionSystem = {
  initialize: function () {
    $('#switchCollisionSystem-confirm').on('click', this.save)

    // 创建操作选项
    $('#switchCollisionSystem-operation').loadItems([
      {name: 'Enable Actor Collision', value: 'enable-actor-collision'},
      {name: 'Disable Actor Collision', value: 'disable-actor-collision'},
      {name: 'Enable Scene Collision', value: 'enable-scene-collision'},
      {name: 'Disable Scene Collision', value: 'disable-scene-collision'},
    ])
  },
  parse: function ({operation}) {
    return [
      {color: 'system'},
      {text: Local.get('command.switchCollisionSystem') + Token(': ')},
      {text: Local.get('command.switchCollisionSystem.' + operation)},
    ]
  },
  load: function ({operation = 'enable-actor-collision'}) {
    $('#switchCollisionSystem-operation').write(operation)
    $('#switchCollisionSystem-operation').getFocus()
  },
  save: function () {
    const operation = $('#switchCollisionSystem-operation').read()
    Command.save({operation})
  },
}

// 游戏数据
Command.cases.gameData = {
  initialize: function () {
    $('#gameData-confirm').on('click', this.save)

    // 创建操作选项
    $('#gameData-operation').loadItems([
      {name: 'Save', value: 'save'},
      {name: 'Load', value: 'load'},
      {name: 'Delete', value: 'delete'},
    ])

    // 设置操作关联元素
    $('#gameData-operation').enableHiddenMode().relate([
      {case: 'save', targets: [
        $('#gameData-index'),
        $('#gameData-variables'),
      ]},
      {case: ['load', 'delete'], targets: [
        $('#gameData-index'),
      ]},
    ])
  },
  parse: function ({operation, index, variables}) {
    const words = Command.words
    .push(Local.get('command.gameData.' + operation))
    .push(Command.parseVariableNumber(index))
    switch (operation) {
      case 'save':
        if (variables) {
          const label = Local.get('command.gameData.variables')
          const keys = variables.split(/\s*,\s*/).map(key => Command.setVariableColor(key))
          const string = keys.join(Token(', '))
          words.push(label + ' ' + Token('{') + string + Token('}'))
        }
        break
    }
    return [
      {color: 'system'},
      {text: Local.get('command.gameData') + Token(': ')},
      {text: words.join()},
    ]
  },
  load: function ({
    operation = 'save',
    index     = 0,
    variables = '',
  }) {
    $('#gameData-operation').write(operation)
    $('#gameData-index').write(index)
    $('#gameData-variables').write(variables)
    $('#gameData-operation').getFocus()
  },
  save: function () {
    const read = getElementReader('gameData')
    const operation = read('operation')
    switch (operation) {
      case 'save': {
        const index = read('index')
        const variables = read('variables').trim()
        Command.save({operation, index, variables})
        break
      }
      case 'load':
      case 'delete': {
        const index = read('index')
        Command.save({operation, index})
        break
      }
    }
  },
}

// 模拟按键
Command.cases.simulateKey = {
  initialize: function () {
    $('#simulateKey-confirm').on('click', this.save)

    // 创建类型选项
    $('#simulateKey-operation').loadItems([
      {name: 'Click', value: 'click'},
      {name: 'Press', value: 'press'},
      {name: 'Release', value: 'release'},
    ])
  },
  parse: function ({operation, keycode}) {
    const words = Command.words
    .push(Local.get('command.simulateKey.' + operation))
    .push(Command.setStringColor(keycode))
    return [
      {color: 'system'},
      {text: Local.get('command.simulateKey') + Token(': ')},
      {text: words.join()},
    ]
  },
  load: function ({
    operation = 'click',
    keycode   = '',
  }) {
    $('#simulateKey-operation').write(operation)
    $('#simulateKey-keycode').write(keycode)
    $('#simulateKey-operation').getFocus()
  },
  save: function () {
    const read = getElementReader('simulateKey')
    const operation = read('operation')
    const keycode = read('keycode')
    Command.save({operation, keycode})
  },
}

// 设置语言
Command.cases.setLanguage = {
  initialize: function () {
    $('#setLanguage-confirm').on('click', this.save)
  },
  parse: function ({language}) {
    return [
      {color: 'system'},
      {text: Local.get('command.setLanguage') + Token(': ')},
      {text: Local.get('languages.' + language)},
    ]
  },
  load: function ({language = 'auto'}) {
    // 创建语言选项
    $('#setLanguage-language').loadItems(this.createLanguageItems())
    $('#setLanguage-language').write(language)
    $('#setLanguage-language').getFocus()
  },
  save: function () {
    const read = getElementReader('setLanguage')
    const language = read('language')
    Command.save({language})
  },
  createLanguageItems: function () {
    const items = []
    const languages = Local.get('languages')
    if (languages) {
      const langList = Data.config.localization.languages.map(lang => lang.name)
      for (const [value, name] of Object.entries(languages)) {
        if (value === 'auto' || langList.includes(value)) {
          items.push({name, value})
        }
      }
    }
    return items
  },
}

// 设置分辨率
Command.cases.setResolution = {
  initialize: function () {
    $('#setResolution-confirm').on('click', this.save)
  },
  parse: function ({width, height, sceneScale, uiScale}) {
    const words = Command.words
    .push(Command.parseVariableNumber(width) + Token(' x ') + Command.parseVariableNumber(height))
    .push(Command.parseVariableNumber(sceneScale))
    .push(Command.parseVariableNumber(uiScale))
    return [
      {color: 'system'},
      {text: Local.get('command.setResolution') + Token(': ')},
      {text: words.join()},
    ]
  },
  load: function ({
    width       = 1920,
    height      = 1080,
    sceneScale  = 1,
    uiScale     = 1,
  }) {
    const write = getElementWriter('setResolution')
    write('width', width)
    write('height', height)
    write('sceneScale', sceneScale)
    write('uiScale', uiScale)
    $('#setResolution-width').getFocus('all')
  },
  save: function () {
    const read = getElementReader('setResolution')
    const width = read('width')
    const height = read('height')
    const sceneScale = read('sceneScale')
    const uiScale = read('uiScale')
    Command.save({width, height, sceneScale, uiScale})
  },
}

// 重置游戏
Command.cases.reset = {
  parse: function () {
    return [
      {color: 'system'},
      {text: Local.get('command.reset')},
    ]
  },
  save: function () {
    Command.save({})
  },
}

// 暂停游戏
Command.cases.pauseGame = {
  parse: function () {
    return [
      {color: 'system'},
      {text: Local.get('command.pauseGame')},
    ]
  },
  save: function () {
    Command.save({})
  },
}

// 继续游戏
Command.cases.continueGame = {
  parse: function () {
    return [
      {color: 'system'},
      {text: Local.get('command.continueGame')},
    ]
  },
  save: function () {
    Command.save({})
  },
}

// 阻止场景输入事件
Command.cases.preventSceneInput = {
  parse: function () {
    return [
      {color: 'system'},
      {text: Local.get('command.preventSceneInput')},
    ]
  },
  save: function () {
    Command.save({})
  },
}

// 恢复场景输入事件
Command.cases.restoreSceneInput = {
  parse: function () {
    return [
      {color: 'system'},
      {text: Local.get('command.restoreSceneInput')},
    ]
  },
  save: function () {
    Command.save({})
  },
}

// 执行脚本
Command.cases.script = {
  editor: null,
  model: null,
  versionId: null,
  changed: false,
  fontSize: 12,
  lineHeight: 14,
  mark: $('#script-mark'),
  colorOptions: {
    mimeType: 'javascript',
    tabSize: 2,
    theme: '',
  },
  initialize: function () {
    $('#script-confirm').on('click', this.save.bind(this))

    // 窗口关闭事件
    $('#script').on('close', event => {
      if (this.changed) {
        event.preventDefault()
        const get = Local.createGetter('confirmation')
        Window.confirm({
          message: get('closeUnsavedScript'),
          close: () => {
            this.editor.getFocus()
          },
        }, [{
          label: get('yes'),
          click: () => {
            this.setChangeState(false)
            Window.close('script')
          },
        }, {
          label: get('no'),
        }])
      }
    })

    // 窗口已关闭事件
    $('#script').on('closed', event => {
      this.model.setValue('')
    })

    // 键盘按下事件
    $('#script').on('keydown', event => {
      if (event.target.hasClass('inputarea')) {
        switch (event.code) {
          case 'Enter':
            event.stopPropagation()
            break
        }
      }
    })
  },
  parse: function ({script}) {
    const contents = [{script: script}]
    if (script.includes('\n')) {
      contents.unshift({fold: true})
    }
    return contents
  },
  load: function ({script = ''}) {
    this.createEditor()
    this.model.setValue(script)
    this.versionId = this.model.getAlternativeVersionId()
    this.editor.setPosition(new monaco.Position(9999, 9999))
    this.editor.setScrollTop(0)
    this.editor.revealLine(9999)
    this.editor.getFocus()
  },
  save: function () {
    const script = this.model.getValue()
    if (script === '') {
      return this.editor.getFocus()
    }
    try {
      new Function(script)
    } catch (error) {
      const get = Local.createGetter('confirmation')
      let continued = false
      return Window.confirm({
        message: `${error.message}\n${get('compileError')}`,
        close: () => {
          if (!continued) {
            this.editor.getFocus()
          }
        },
      }, [{
        label: get('yes'),
        click: () => {
          continued = true
          this.setChangeState(false)
          Command.save({script})
        },
      }, {
        label: get('no'),
      }])
    }
    this.setChangeState(false)
    Command.save({script})
  },
  setChangeState: function (changed) {
    if (this.changed !== changed) {
      this.changed = changed
      if (changed) {
        this.mark.show()
      } else {
        this.mark.hide()
      }
    }
  },
  createEditor: function () {
    const {theme} = Title
    this.createTheme(theme)
    // 假设monaco对象已加载完毕
    this.editor = monaco.editor.create($('#script-script'), {
      language: 'javascript',
      theme: theme,
      tabSize: 2,
      fontSize: this.fontSize,
      lineHeight: this.lineHeight,
      mouseWheelScrollSensitivity: this.lineHeight * 3 / 50,
      fastScrollSensitivity: 5,
      wordWrap: 'on',
      matchBrackets: 'never',
      folding: true,
      formatOnType: false,
      showDeprecated: false,
      selectionHighlight: true,
      detectIndentation: false,
      insertSpaces: true,
      roundedSelection: false,
      overviewRulerBorder: false,
      hideCursorInOverviewRuler: true,
      automaticLayout: false,
      hover: false,
      lightbulb: {
        enabled: false,
      },
      minimap: {
        enabled: false,
      },
      scrollbar: {
        useShadows: false,
        horizontalScrollbarSize: 12,
        verticalScrollbarSize: 12,
      },
    })
    this.model = this.editor.getModel()

    // 编辑器 - 获得焦点
    this.editor.getFocus = function () {
      setTimeout(() => this.focus())
    }

    // 侦听键盘按下事件
    this.editor.onKeyDown(event => {
      event = event.browserEvent
      if (event.ctrlKey) {
        switch (event.code) {
          case 'Enter':
            event.preventDefault()
            event.stopPropagation()
            this.save()
            break
        }
      }
    })

    // 侦听内容改变事件
    this.editor.onDidChangeModelContent(event => {
      if (event.isFlush) return
      if (event.isUndoing || event.isRedoing) {
        const versionId = this.model.getAlternativeVersionId()
        const changed = this.versionId !== versionId
        if (this.changed !== changed) {
          this.setChangeState(changed)
        }
      } else if (!this.changed) {
        this.setChangeState(true)
      }
    })

    // 设置为空函数
    this.createEditor = Function.empty
  },
  // 给代码行元素着色
  colorizeCodeLines: function (items, code) {
    const text = document.createElement('text')
    const options = this.colorOptions
    text.textContent = code
    options.theme = Title.theme
    this.createTheme(Title.theme)
    monaco.editor.colorizeElement(text, options)
    let index = setInterval(() => {
      if (text.children.length !== 0) {
        clearInterval(index)
        const nodes = text.childNodes
        const nLength = nodes.length
        const sLength = nLength >> 1
        const spans = new Array(sLength)
        for (let i = 0; i < nLength; i += 2) {
          spans[i >> 1] = nodes[i]
        }
        for (let i = 0; i < sLength; i++) {
          items[i].appendChild(spans[i])
        }
      }
    })
  },
  // 创建主题
  createTheme: function IIFE () {
    const themeData = {
      light: {
        base: 'vs',
        inherit: true,
        rules: [
          {token: '', foreground: '#000000'},
          {token: 'comment', foreground: '#008e00'},
          {token: 'string', foreground: '#d01515'},
          {token: 'string-bracket', foreground: '#0000c0'},
          {token: 'string-escape', foreground: '#a000e6'},
          {token: 'string-invalid', foreground: '#ff0000'},
          {token: 'number', foreground: '#f06000'},
          {token: 'property', foreground: '#000000'},
          {token: 'function', foreground: '#ff0080'},
          {token: 'class', foreground: '#000000'},
          {token: 'regexp', foreground: '#d01515'},
          {token: 'regexp-bracket', foreground: '#0000c0'},
          {token: 'regexp-escape', foreground: '#a000e6'},
          {token: 'regexp-escape-control', foreground: '#585cf6'},
          {token: 'regexp-escape-end', foreground: '#ff8000'},
          {token: 'regexp-range', foreground: '#0060a0'},
          {token: 'regexp-invalid', foreground: '#ff0000'},
          {token: 'regexp-flag', foreground: '#40a0ff'},
          {token: 'keyword', foreground: '#c800a4'},
          {token: 'keyword-declaration', foreground: '#c800a4'},
          {token: 'keyword-operation', foreground: '#c800a4'},
          {token: 'keyword-constant', foreground: '#0020e0'},
          {token: 'keyword-builtin', foreground: '#0020e0'},
          {token: 'keyword-highlight', foreground: '#000000'},
          {token: 'identifier', foreground: '#1818c0'},
          {token: 'identifier-global', foreground: '#000000'},
          {token: 'flag', foreground: '#585cf6'},
          {token: 'operator', foreground: '#c800a4'},
          {token: 'delimiter', foreground: '#000000'},
          {token: 'delimiter-bracket', foreground: '#000000'},
          {token: 'delimiter-bracket-invalid', foreground: '#ff0000'},
        ],
        colors: {
          'editor.background': '#ffffff',
          'editorWidget.background': '#f0f0f0',
          'editorWidget.border': '#00000000',
          'editorHoverWidget.background': '#f0f0f0',
          'editorHoverWidget.border': '#c0c0c0',
          'editorCursor.foreground': '#000000',
          'editor.wordHighlightStrongBackground': '#c0ffe080',
          'editor.lineHighlightBorder': '#00000000',
          'editor.selectionBackground': '#add6ff',
          'editor.inactiveSelectionBackground': '#e5ebf1',
          'editor.findMatchBackground': '#80ff80',
          'editor.findMatchHighlightBackground': '#00000000',
          'editorSuggestWidget.background': '#f0f0f0',
          'editorSuggestWidget.border': '#c0c0c0',
          'editorIndentGuide.background': '#f0f0f0',
          'editorIndentGuide.activeBackground': '#e0e0e0',
          'editorLineNumber.foreground': '#a0a0a0',
          'editorLineNumber.activeForeground': '#404040',
          'dropdown.background': '#ffffff',
          'menu.border': '#c0c0c0',
          'input.background': '#ffffff',
          'input.foreground': '#000000',
          'input.border': '#c0c0c0',
          'widget.shadow': '#00000000',
          'focusBorder': '#0050a0',
          'contrastBorder': '#c0c0c0',
          'list.activeSelectionBackground': '#e6f3ff',
          'list.activeSelectionForeground': '#000000',
          'list.highlightForeground': '#b00080',
          'list.focusHighlightForeground': '#b00080',
        },
      },
      dark: {
        base: 'vs-dark',
        inherit: true,
        rules: [
          {token: '', foreground: '#dad6cd'},
          {token: 'comment', foreground: '#608b4e'},
          {token: 'string', foreground: '#a9d157'},
          {token: 'string-bracket', foreground: '#e882b2'},
          {token: 'string-escape', foreground: '#797be6'},
          {token: 'string-invalid', foreground: '#f44747'},
          {token: 'number', foreground: '#99cc66'},
          {token: 'property', foreground: '#dad6cd'},
          {token: 'function', foreground: '#e8dcaa'},
          {token: 'class', foreground: '#4ec9b0'},
          {token: 'regexp', foreground: '#a9d157'},
          {token: 'regexp-bracket', foreground: '#e882b2'},
          {token: 'regexp-escape', foreground: '#797be6'},
          {token: 'regexp-escape-control', foreground: '#5bdbb1'},
          {token: 'regexp-escape-end', foreground: '#cb6a27'},
          {token: 'regexp-range', foreground: '#37aae4'},
          {token: 'regexp-invalid', foreground: '#f44747'},
          {token: 'regexp-flag', foreground: '#00d2e5'},
          {token: 'keyword', foreground: '#569cd6'},
          {token: 'keyword-declaration', foreground: '#569cd6'},
          {token: 'keyword-operation', foreground: '#3e8f9a'},
          {token: 'keyword-constant', foreground: '#3299cc'},
          {token: 'keyword-builtin', foreground: '#6d9cbe'},
          {token: 'keyword-highlight', foreground: '#7aca3c'},
          {token: 'identifier', foreground: '#b0e0e6'},
          {token: 'identifier-global', foreground: '#9ed34e'},
          {token: 'flag', foreground: '#00d2e5'},
          {token: 'operator', foreground: '#3e8f9a'},
          {token: 'delimiter', foreground: '#dad6cd'},
          {token: 'delimiter-bracket', foreground: '#dad6cd'},
          {token: 'delimiter-bracket-invalid', foreground: '#f44747'},
        ],
        colors: {
          'editor.background': '#18191a',
          'editorWidget.background': '#242628',
          'editorWidget.border': '#00000000',
          'editorHoverWidget.background': '#1c1e20',
          'editorHoverWidget.border': '#101010',
          'editorCursor.foreground': '#ffffff',
          'editor.wordHighlightStrongBackground': '#0060a080',
          'editor.lineHighlightBorder': '#00000000',
          'editor.selectionBackground': '#5a286f',
          'editor.inactiveSelectionBackground': '#7e668a',
          'editor.findMatchBackground': '#4030c0',
          'editor.findMatchHighlightBackground': '#00000000',
          'editorSuggestWidget.background': '#1c1e20',
          'editorSuggestWidget.border': '#101010',
          'editorIndentGuide.background': '#2c2c2c',
          'editorIndentGuide.activeBackground': '#3c3c3c',
          'editorLineNumber.foreground': '#7d7b77',
          'editorLineNumber.activeForeground': '#bebcb8',
          'dropdown.background': '#1c1e20',
          'dropdown.foreground': '#d8d8d8',
          'menu.border': '#101010',
          'input.background': '#161718',
          'input.foreground': '#d8d8d8',
          'input.border': '#000000',
          'widget.shadow': '#00000000',
          'focusBorder': '#0080ff',
          'contrastBorder': '#101010',
          'list.activeSelectionBackground': '#303234',
          'list.activeSelectionForeground': '#d4d4d4',
          'list.highlightForeground': '#80e0e0',
          'list.focusHighlightForeground': '#80e0e0',
        },
      },
    }
    return function (theme) {
      const options = themeData[theme]
      if (options instanceof Object &&
        window.monaco instanceof Object) {
        monaco.editor.defineTheme(theme, options)
        themeData[theme] = null
      }
    }
  }(),
}

// 自定义指令
Command.custom = {
  customFolder: null,
  commandNameMap: null,
  windowX: null,
  windowY: null,
  parsingScript: {id: '', parameters: null},
  loadedScript: {id: '', parameters: null},
  windowFrame: $('#scriptCommand'),
  parameterPane: $('#scriptCommand-parameter-pane'),
  parameterGrid: $('#scriptCommand-parameter-grid'),

  // 初始化
  initialize: function () {
    window.on('localize', this.windowLocalize)
    $('#scriptCommand-confirm').on('click', this.save)

    // 参数面板 - 设置获取数据方法
    const scriptList = [this.loadedScript]
    this.parameterPane.getData = () => scriptList

    // 参数面板 - 调整大小时回调
    this.parameterPane.onResize = () => {
      const height = grid.clientHeight
      this.windowFrame.style.height = `${height + 78}px`
      // 如果窗口被拖动过会重置位置，不过影响不大
      this.windowFrame.absolute(this.windowX, this.windowY)
    }

    // 参数面板 - 重新创建细节框方法
    const box = $('#scriptCommand-parameter-detail')
    const grid = this.parameterGrid
    const wrap = {box, grid, children: []}
    box.wrap = wrap
    this.parameterPane.createDetailBox = function () {
      return wrap
    }

    // 参数面板 - 重写清除内容方法
    this.parameterPane.clear = function () {
      this.metas = []
      const {wraps} = this
      if (wraps.length !== 0) {
        const {children, box} = wraps[0]
        let i = children.length
        while (--i >= 0) {
          this.recycle(children[i])
        }
        box.meta = null
        box.data = null
        children.length = 0
        wraps.length = 0
      }
      window.off('script-change', this.scriptChange)
    }

    // 窗口 - 已关闭事件
    this.windowFrame.on('closed', event => {
      this.loadedScript.parameters = null
      this.parameterPane.clear()
    })
  },

  // 解析自定义指令
  parse: function (id, parameters) {
    // 如果不存在脚本，则返回ID名称
    const meta = Data.scripts[id]
    const name = this.commandNameMap[id]
    if (meta === undefined || name === undefined) {
      const label = Local.get('command.invalidCommand')
      const cmdId = Command.parseUnlinkedId(id)
      return [
        {color: 'invalid'},
        {text: `${label}: ${cmdId}`},
      ]
    }
    // 重构脚本参数
    const script = this.parsingScript
    script.id = id
    script.parameters = parameters
    PluginManager.reconstruct(script)
    // 获取重构后的参数
    parameters = script.parameters
    script.parameters = null
    // 如果不带参数，直接返回指令名称
    const mParameters = meta.parameters
    if (mParameters.length === 0) {
      return [
        {color: 'custom'},
        {text: name},
      ]
    }
    // 获取指令参数
    const words = Command.words
    const states = meta.manager.states
    for (const parameter of mParameters) {
      const {type, key} = parameter
      const value = parameters[key]
      if (states[key] === false) {
        continue
      }
      switch (type) {
        case 'boolean':
          words.push(Command.setBooleanColor(value))
          continue
        case 'number':
          words.push(Command.setNumberColor(value))
          continue
        case 'variable-number':
          words.push(Command.parseVariableNumber(value))
          continue
        case 'string':
          words.push(Command.setStringColor(`"${value}"`))
          continue
        case 'option': {
          const index = parameter.options.indexOf(value)
          if (index !== -1) {
            const {name} = parameter.dataItems[index]
            words.push(meta.langMap.update().get(name))
          }
          continue
        }
        case 'easing':
          words.push(Data.easings.map[value].name)
          continue
        case 'team':
          words.push(Data.teams.map[value].name)
          continue
        case 'variable':
          words.push(value ? Command.parseVariable({type: 'global', key: value}, 'any') : Token('none'))
          continue
        case 'attribute':
          words.push(Command.parseAttributeKey('', value, 'object'))
          continue
        case 'attribute-key':
          words.push(Command.parseAttributeKey('', value, 'string'))
          continue
        case 'attribute-group':
          words.push(Command.parseAttributeGroup(value))
          continue
        case 'enum':
        case 'enum-value':
          words.push(Command.parseEnumString(value))
          continue
        case 'enum-group':
          words.push(Command.parseEnumGroup(value))
          continue
        case 'file':
        case 'image':
        case 'audio':
          words.push(Command.parseFileName(value))
          continue
        case 'variable-getter':
        case 'variable-setter':
          words.push(Command.parseVariable(value, 'any'))
          continue
        case 'actor-getter':
          words.push(Command.parseActor(value))
          continue
        case 'skill-getter':
          words.push(Command.parseSkill(value))
          continue
        case 'state-getter':
          words.push(Command.parseState(value))
          continue
        case 'equipment-getter':
          words.push(Command.parseEquipment(value))
          continue
        case 'item-getter':
          words.push(Command.parseItem(value))
          continue
        case 'element-getter':
          words.push(Command.parseElement(value))
          continue
        case 'position-getter':
          words.push(Command.parsePosition(value))
          continue
        case 'number[]': {
          const numbers = value.slice(0, 5)
          for (let i = 0; i < numbers.length; i++) {
            numbers[i] = Command.setNumberColor(numbers[i])
          }
          if (value.length > 5) {
            numbers.push(Token('...'))
          }
          words.push(Token('[') + numbers.join(Token(', ')) + Token(']'))
          continue
        }
        case 'string[]': {
          const strings = value.slice(0, 5)
          for (let i = 0; i < strings.length; i++) {
            strings[i] = Command.setStringColor(`"${Command.parseMultiLineString(strings[i])}"`)
          }
          if (value.length > 5) {
            numbers.push(Token('...'))
          }
          words.push(Token('[') + strings.join(Token(', ')) + Token(']'))
          continue
        }
        case 'keycode':
          words.push(value ? Command.setStringColor(value) : Token('null'))
          continue
        case 'color':
          words.push(Command.parseHexColor(value))
          continue
      }
    }
    return [
      {color: 'custom'},
      {text: name + Token(': ')},
      {text: words.join()},
    ]
  },

  // 加载自定义指令
  load: function (id, parameters) {
    this.loadedScript.id = id
    this.loadedScript.parameters = Object.clone(parameters)
    this.windowX = Window.absolutePos.x
    this.windowY = Window.absolutePos.y
    this.parameterPane.update()
    const selector = Layout.focusableSelector
    this.parameterPane.querySelector(selector)?.getFocus()
    this.windowFrame.setTitle(this.commandNameMap[id])
  },

  // 保存参数
  save: function () {
    Command.save(Command.custom.loadedScript.parameters ?? {})
  },

  // 加载指令列表
  loadCommandList: async function () {
    if (!Data.commands) return
    const {list} = CommandSuggestion
    if (!this.customFolder) {
      if (list.data instanceof Promise) {
        await list.data
      }
      list.data.push(
        this.customFolder = {
          class: 'folder',
          value: 'custom',
          expanded: true,
          children: null,
        }
      )
    }
    const commands = []
    const commandNameMap = {}
    for (const command of Data.commands) {
      const id = command.id
      let meta = Data.scripts[id]
      // 可能出现脚本未加载完毕的情况
      if (meta instanceof Promise) {
        meta = await meta
      }
      if (!meta || id in commandNameMap) {
        continue
      }
      const map = meta.langMap.update()
      const name = command.alias ||
      map.get(meta.overview.plugin) ||
      Command.parseFileName(id)
      commandNameMap[id] = name
      commands.push({
        class: 'custom',
        value: id,
        name: name,
        desc: map.get(meta.overview.desc),
        keywords: command.keywords,
        unspacedName: String.compress(name),
      })
    }
    this.customFolder.children = commands
    this.commandNameMap = commandNameMap
    CommandSuggestion.windowLocalize()
    // 重新构建指令项目的父对象引用
    TreeList.createParents(commands, this.customFolder)
  },

  // 窗口 - 本地化事件
  windowLocalize: function (event) {
    if (Command.custom.commandNameMap) {
      Command.custom.loadCommandList()
    }
  },
}

// ******************************** 指令提示框 ********************************

const CommandSuggestion = {
  // properties
  widget: $('#command-widget'),
  searcher: $('#command-searcher'),
  list: $('#command-suggestions'),
  data: null,
  // methods
  initialize: null,
  open: null,
  select: null,
  // events
  windowLocalize: null,
  windowClose: null,
  pointerdown: null,
  searcherKeydown: null,
  searcherInput: null,
  listKeydown: null,
  listPointerdown: null,
  listUpdate: null,
  listOpen: null,
}

// list methods
CommandSuggestion.list.createIcon = null
CommandSuggestion.list.createComment = null
CommandSuggestion.list.searchNodesAlgorithm = null
CommandSuggestion.list.updateCommandNames = null
CommandSuggestion.list.createCommandTip = null
CommandSuggestion.list.selectDefaultCommand = null

// 初始化
CommandSuggestion.initialize = function () {
  // 禁止窗口背景幕布
  this.widget.enableAmbient = false

  // 设置列表搜索框按钮和其他属性
  this.searcher.addCloseButton()
  const mark = document.createElement('text')
  const input = this.searcher.input
  input.id = 'command-searcher-input'
  mark.id = 'command-searcher-mark'
  mark.textContent = '>'
  this.searcher.insertBefore(mark, input)

  // 绑定指令目录列表
  const {list} = this
  list.bind(() => this.data)
  list.creators.push(list.createComment)
  list.creators.push(list.createCommandTip)

  // 加载指令数据
  this.data = File.get({
    local: 'commands.json',
    type: 'json',
  }).then(data => {
    this.data = data
  })

  // 侦听事件
  window.on('localize', this.windowLocalize)
  this.widget.on('close', this.windowClose)
  this.searcher.on('keydown', this.searcherKeydown)
  this.searcher.on('input', this.searcherInput)
  this.searcher.on('compositionend', this.searcherInput)
  list.on('keydown', this.listKeydown)
  list.on('pointerdown', this.listPointerdown)
  list.on('update', this.listUpdate)
  list.on('open', this.listOpen)
}

// 打开
CommandSuggestion.open = function () {
  const list = Command.target
  list.scrollAndResize()
  const point = list.getSelectionPosition()
  if (point) {
    Window.open('command-widget')
    const {widget, list, searcher} = this
    const x = point.x - 5
    const y = point.y
    widget.x = x
    widget.y = y
    widget.style.left = `${x}px`
    widget.style.top = `${y}px`
    if (!list.initialized) {
      list.initialized = true
      list.updateCommandNames()
      list.update()
      list.selectDefaultCommand()
    } else {
      list.dispatchUpdateEvent()
      list.resize()
    }
    searcher.getFocus()
    window.on('pointerdown', this.pointerdown, {capture: true})
  }
}

// 选择指令
CommandSuggestion.select = function (item) {
  Window.close('command-widget')
  Command.open(item.value)
}

// 窗口 - 本地化事件
CommandSuggestion.windowLocalize = function (event) {
  // 用重置textContent代替clear来保留选中项
  const {list, data} = CommandSuggestion
  if (list.initialized) {
    list.initialized = false
    list.textContent = ''
    list.deleteNodeElements(data)
  }
}

// 窗口 - 关闭事件
CommandSuggestion.windowClose = function (event) {
  // 删除内容会触发search|update|scroll行为
  // 但是异步触发的scroll事件因为列表被隐藏而不会刷新列表项
  CommandSuggestion.searcher.deleteInputContent()
  CommandSuggestion.list.hide()
  window.off('pointerdown', CommandSuggestion.pointerdown, {capture: true})
}

// 指针按下事件
CommandSuggestion.pointerdown = function (event) {
  const {widget, list} = CommandSuggestion
  if (!widget.contains(event.target) &&
    !list.contains(event.target)) {
    event.preventDefault()
    Window.close('command-widget')
  }
}

// 搜索框 - 键盘按下事件
CommandSuggestion.searcherKeydown = function (event) {
  switch (event.code) {
    case 'ArrowUp':
    case 'ArrowDown':
      event.preventDefault()
      CommandSuggestion.list.selectRelative(
        event.code.slice(5).toLowerCase()
      )
      break
    case 'PageUp':
      CommandSuggestion.list.pageUp(true)
      break
    case 'PageDown':
      CommandSuggestion.list.pageDown(true)
      break
    case 'Enter':
    case 'NumpadEnter': {
      const item = CommandSuggestion.list.read()
      if (item && !CommandSuggestion.list.hasClass('hidden')) {
        // 阻止触发确定按钮点击操作
        event.stopPropagation()
        CommandSuggestion.list.open(item)
      }
      break
    }
  }
}

// 搜索框 - 输入事件
CommandSuggestion.searcherInput = function (event) {
  if (event.inputType !== 'insertCompositionText') {
    const text = String.compress(this.read())
    CommandSuggestion.list.searchNodes(text)
    CommandSuggestion.list.selectDefaultCommand()
  }
}

// 列表 - 键盘按下事件
CommandSuggestion.listKeydown = function (event) {
  switch (event.code) {
    case 'Tab':
      // 提前让搜索框获得焦点
      event.preventDefault()
      CommandSuggestion.searcher.input.focus()
      break
    case 'Home':
      event.preventDefault()
      this.scrollToHome()
      break
    case 'End':
      event.preventDefault()
      this.scrollToEnd()
      break
    case 'PageUp':
      event.preventDefault()
      this.pageUp(true)
      break
    case 'PageDown':
      event.preventDefault()
      this.pageDown(true)
      break
  }
}

// 列表 - 指针按下事件
CommandSuggestion.listPointerdown = function (event) {
  const element = event.target
  if (element.tagName === 'NODE-ITEM' &&
    element.item.class !== 'folder') {
    const pointerup = event => {
      if (this.pressing === pointerup) {
        this.pressing = null
        if (element.contains(event.target)) {
          CommandSuggestion.select(element.item)
        }
      }
    }
    this.pressing = pointerup
    window.on('pointerup', pointerup, {once: true})
  }
}

// 列表 - 更新事件
CommandSuggestion.listUpdate = function (event) {
  const MAX_LINES = 30
  const {x, y} = CommandSuggestion.widget
  const space = window.innerHeight - y - 20
  const below = space >= 200
  const capacity = below
  ? Math.floor(space / 20)
  : Math.floor(y / 20)
  const lines = Math.min(this.elements.count, capacity, MAX_LINES)
  const top = below
  ? y + 20
  : y - lines * 20
  if (lines !== 0) {
    this.style.left = `${x}px`
    this.style.top = `${top}px`
    this.style.height = `${lines * 20}px`
    this.style.zIndex = Window.frames.length - 1
    this.show()
  } else {
    this.hide()
  }
}

// 列表 - 打开事件
CommandSuggestion.listOpen = function (event) {
  const item = event.value
  // 指令选项在列表中的时候打开
  if (item.class !== 'folder' &&
    item.element.parentNode) {
    CommandSuggestion.select(item)
  }
}

// 列表 - 重写创建图标方法
CommandSuggestion.list.createIcon = function IIFE() {
  return function (item) {
    const icon = document.createElement('node-icon')
    switch (item.class) {
      case 'folder':
        icon.addClass('icon-folder')
        break
      default:
        icon.addClass('icon-command')
        icon.addClass(item.class)
        break
    }
    return icon
  }
}()

// 列表 - 创建注释
CommandSuggestion.list.createComment = function (item) {
  // 非英文语言包
  if (item.class !== 'folder' && !/^en/.test(Local.language)) {
    // 获取自定义指令的关键字或内置指令的方法名
    const string = item.class === 'custom'
    ? item.keywords ?? item.value
    : item.value
    if (string) {
      const comment = document.createElement('text')
      comment.addClass('command-suggestion-comment')
      comment.textContent = string.charAt(0).toUpperCase() + string.slice(1)
      item.element.appendChild(comment)
    }
  }
}

// 列表 - 重写搜索节点算法
CommandSuggestion.list.searchNodesAlgorithm = function (data, keyword, list) {
  const length = data.length
  for (let i = 0; i < length; i++) {
    const item = data[i]
    // item.keywords可以是undefined
    switch (item.class) {
      default: {
        if (keyword.test(item.unspacedName) ||
          keyword.test(item.class) ||
          keyword.test(item.value) ||
          keyword.test(item.keywords)) {
          list.push(item)
        }
        const children = item.children
        if (children instanceof Array) {
          this.searchNodesAlgorithm(children, keyword, list)
        }
        continue
      }
      case 'custom':
        if (keyword.test(item.unspacedName) ||
          keyword.test(item.class) ||
          keyword.test(item.keywords)) {
          list.push(item)
        }
        continue
    }
  }
}

// 列表扩展方法 - 更新指令名称
CommandSuggestion.list.updateCommandNames = function IIFE() {
  const update = (data, get) => {
    const length = data.length
    for (let i = 0; i < length; i++) {
      const item = data[i]
      const key = item.value
      const name = get(key)
      const desc = get(key + '.desc')
      item.name = name
      item.desc = desc
      item.unspacedName = String.compress(name)
      const children = item.children
      if (children instanceof Array && key !== 'custom') {
        update(children, get)
      }
    }
  }
  return function () {
    update(this.data, Local.createGetter('command'))
  }
}()

// 列表扩展方法 - 创建指令提示
CommandSuggestion.list.createCommandTip = function IIFE() {
  const separator = /\s*,\s*/
  return function (item) {
    const element = item.element
    const words = Command.words.push(item.class)
    if (item.class !== 'custom') {
      words.push(item.value)
    }
    if (item.keywords) {
      for (const keyword of item.keywords.split(separator)) {
        words.push(keyword)
      }
    }
    const tip1 = item.class === 'folder' ? '' : `$${item.name}\n${item.desc}\n`
    const tip2 = `$${Local.get('command.keywords')}\n${words.join(', ')}`
    element.addClass('command-suggestion-item')
    element.setTooltip(Local.parseTip(tip1 + tip2))
  }
}()

// 列表扩展方法 - 选择默认指令选项
CommandSuggestion.list.selectDefaultCommand = function () {
  // 如果有选中的指令存在于结果列表中则返回
  const {selection, elements} = this
  const {count} = elements
  if (selection && selection.class !== 'folder') {
    for (let i = 0; i < count; i++) {
      if (elements[i].item === selection) {
        this.scrollToSelection('middle')
        return
      }
    }
  }
  // 从结果列表中选择第一个匹配的指令选项
  for (let i = 0; i < count; i++) {
    const item = elements[i].item
    if (item.class !== 'folder') {
      this.select(item)
      this.scrollToSelection('middle')
      return
    }
  }
}

// ******************************** 文本提示框 ********************************

const TextSuggestion = {
  // properties
  list: $('#text-suggestions'),
  inserting: false,
  target: null,
  data: null,
  // methods
  initialize: null,
  listen: null,
  open: null,
  close: null,
  select: null,
  createData: null,
  // events
  textBoxFocus: null,
  textBoxBlur: null,
  textBoxKeydown: null,
  textBoxInput: null,
  listPointerdown: null,
  listUpdate: null,
  listOpen: null,
}

// list methods
TextSuggestion.list.updateNodeElement = null
TextSuggestion.list.createIcon = null
TextSuggestion.list.createText = null
TextSuggestion.list.createRefCount = null
TextSuggestion.list.createComment = null
TextSuggestion.list.selectDefaultCommand = null

// 初始化
TextSuggestion.initialize = function () {
  // 绑定指令目录列表
  const {list} = this
  list.bind(() => this.data)

  // 侦听事件
  list.on('pointerdown', this.listPointerdown)
  list.on('update', this.listUpdate)
  list.on('open', this.listOpen)
}

// 侦听文本输入框
TextSuggestion.listen = function (textBox, generator) {
  textBox.generator = generator
  textBox.on('focus', this.textBoxFocus)
  textBox.on('blur', this.textBoxBlur)
  textBox.on('keydown', this.textBoxKeydown)
  textBox.on('input', this.textBoxInput)
  textBox.on('compositionend', this.textBoxInput)
}

// 打开
TextSuggestion.open = function (target) {
  if (this.target !== target) {
    this.target = target
    this.createData()
    this.list.update()
    this.list.selectDefaultCommand()
  }
}

// 关闭
TextSuggestion.close = function () {
  this.target = null
  this.data = null
  this.list.clear()
  this.list.hide()
}

// 选择文本
TextSuggestion.select = function (item) {
  this.inserting = true
  let {target} = this
  if (target instanceof StringVar) {
    target = target.strBox
  }
  target.input.select()
  target.insert(item.name)
  this.inserting = false
  this.close()
}

// 创建数据
TextSuggestion.createData = function () {
  if (!this.data) {
    this.data = this.target.generator()
  }
}

// 文本框 - 获得焦点事件
TextSuggestion.textBoxFocus = function (event) {
  const text = this.read().trim()
  TextSuggestion.open(this)
  TextSuggestion.list.searchNodes(text)
  TextSuggestion.list.selectDefaultCommand()
}

// 文本框 - 失去焦点事件
TextSuggestion.textBoxBlur = function (event) {
  TextSuggestion.close()
}

// 文本框 - 键盘按下事件
TextSuggestion.textBoxKeydown = function (event) {
  if (!TextSuggestion.list.hasClass('hidden')) {
    switch (event.code) {
      case 'ArrowUp':
      case 'ArrowDown':
        event.preventDefault()
        TextSuggestion.list.selectRelative(
          event.code.slice(5).toLowerCase()
        )
        break
      case 'PageUp':
        TextSuggestion.list.pageUp(true)
        break
      case 'PageDown':
        TextSuggestion.list.pageDown(true)
        break
      case 'Enter':
      case 'NumpadEnter': {
        const item = TextSuggestion.list.read()
        if (item) {
          // 阻止触发确定按钮点击操作
          event.stopPropagation()
          TextSuggestion.list.open(item)
        }
        break
      }
      case 'Escape':
        event.stopPropagation()
        TextSuggestion.close()
        break
    }
  }
}

// 文本框 - 输入事件
TextSuggestion.textBoxInput = function (event) {
  if (this.contains(document.activeElement) &&
    TextSuggestion.inserting === false &&
    event.inputType !== 'insertCompositionText') {
    const text = this.read().trim()
    TextSuggestion.open(this)
    TextSuggestion.list.searchNodes(text)
    TextSuggestion.list.selectDefaultCommand()
  }
}

// 列表 - 指针按下事件
TextSuggestion.listPointerdown = function (event) {
  const element = event.target
  if (element.tagName === 'NODE-ITEM') {
    // 阻止文本输入框的blur行为
    event.preventDefault()
    const pointerup = event => {
      if (this.pressing === pointerup) {
        this.pressing = null
        if (element.contains(event.target)) {
          TextSuggestion.select(element.item)
        }
      }
    }
    this.pressing = pointerup
    window.on('pointerup', pointerup, {once: true})
  }
}

// 列表 - 更新事件
TextSuggestion.listUpdate = function (event) {
  const MAX_LINES = 30
  const rect = TextSuggestion.target.rect()
  const rl = rect.left
  const rt = rect.top
  const rb = rect.bottom
  const rw = rect.width
  const space = window.innerHeight - rb
  const below = space >= 200
  const capacity = below
  ? Math.floor(space / 20)
  : Math.floor(rt / 20)
  const lines = Math.min(this.elements.count, capacity, MAX_LINES)
  const top = below ? rb : rt - lines * 20
  if (lines !== 0 && !(lines === 1 &&
    this.elements[0].item.name === TextSuggestion.target.read())) {
    this.style.left = `${rl}px`
    this.style.top = `${top}px`
    this.style.width = `calc(${rw}px - var(--2dpx))`
    this.style.height = `${lines * 20}px`
    this.style.zIndex = Window.frames.length + 1
    this.show()
  } else {
    this.hide()
  }
}

// 列表 - 打开事件
TextSuggestion.listOpen = function (event) {
  const item = event.value
  // 指令选项在列表中的时候打开
  if (item.element.parentNode) {
    TextSuggestion.select(item)
  }
}

// 列表 - 重写更新节点元素方法
TextSuggestion.list.updateNodeElement = function (element) {
  if (!element.initialized) {
    element.initialized = true
    this.createIcon(element)
    this.createText(element)
    this.createRefCount(element)
    this.createComment(element)
    element.addClass('text-suggestion-item')
  }
}

// 列表 - 创建图标
TextSuggestion.list.createIcon = function (element) {
  if (element.item.icon) {
    const icon = document.createElement('node-icon')
    icon.addClass(element.item.icon)
    element.appendChild(icon)
  }
}

// 列表 - 创建文本
TextSuggestion.list.createText = function (element) {
  const item = element.item
  const text = document.createElement('text')
  text.addClass('text-suggestion-content')
  if (item.class) text.addClass(item.class)
  text.textContent = item.name
  element.appendChild(text)
}

// 列表 - 创建引用计数
TextSuggestion.list.createRefCount = function (element) {
  if (element.item.refCount) {
    const comment = document.createElement('text')
    comment.addClass('text-suggestion-ref-count')
    comment.textContent = element.item.refCount
    element.appendChild(comment)
  }
}

// 列表 - 创建注释
TextSuggestion.list.createComment = function (element) {
  if (element.item.comment) {
    const comment = document.createElement('text')
    comment.addClass('text-suggestion-comment')
    comment.textContent = element.item.comment
    element.appendChild(comment)
  }
}

// 列表扩展方法 - 选择默认指令选项
TextSuggestion.list.selectDefaultCommand = function () {
  // 如果有选中的指令存在于结果列表中则返回
  const {selection, elements} = this
  const {count} = elements
  if (selection) {
    for (let i = 0; i < count; i++) {
      if (elements[i].item === selection) {
        this.scrollToSelection('middle')
        return
      }
    }
  }
  // 从结果列表中选择第一个匹配的指令选项
  for (let i = 0; i < count; i++) {
    this.select(elements[i].item)
    this.scrollToSelection('middle')
    return
  }
}

// ******************************** 事件编辑器 ********************************

const EventEditor = {
  // properties
  list: $('#event-open-list'),
  commandList: $('#event-commands'),
  outerGutter: $('#event-commands-gutter-outer'),
  innerGutter: $('#event-commands-gutter-inner'),
  closing: false,
  data: null,
  caches: [],
  types: null,
  // methods
  initialize: null,
  openLocalEvent: null,
  openGlobalEvent: null,
  openRelatedEvents: null,
  findRelatedEvents: null,
  getAllLocalEvents: null,
  clearAllEventClasses: null,
  clearRelatedEventClasses: null,
  save: null,
  isChanged: null,
  getItemById: null,
  getItemByEvent: null,
  openCommandList: null,
  closeCommandList: null,
  unpackOpenEvents: null,
  packOpenEvents: null,
  resizeGutter: null,
  updateGutter: null,
  appendCommandsToCaches: null,
  fetchCommandBuffer: null,
  clearCommandBuffers: null,
  getGlobalEventName: null,
  // events
  windowLocalize: null,
  windowClose: null,
  windowClosed: null,
  windowResize: null,
  windowKeydown: null,
  windowKeyup: null,
  windowPointermove: null,
  listPointerdown: null,
  listSelect: null,
  listPopup: null,
  typeInput: null,
  commandListChange: null,
  commandListUpdate: null,
  commandListScroll: null,
  confirm: null,
  apply: null,
}

// list methods
EventEditor.list.lastScrollTop = 0
EventEditor.list.selectIndex = null
EventEditor.list.close = null
EventEditor.list.closeMultiple = null
EventEditor.list.closeBelow = null
EventEditor.list.closeOthers = null
EventEditor.list.closeAll = null
EventEditor.list.saveScroll = null
EventEditor.list.restoreScroll = null
EventEditor.list.defineProperties = null
EventEditor.list.createLocalEventItem = null
EventEditor.list.createGlobalEventItem = null
EventEditor.list.createIcon = null
EventEditor.list.updateItemClass = null
EventEditor.list.createIcon = null
EventEditor.list.createInitText = null
EventEditor.list.updateInitText = null
EventEditor.list.updateItemName = null
EventEditor.list.closeButtonClick = null

// 初始化
EventEditor.initialize = function () {
  // 绑定打开事件列表
  const {list} = this
  list.removable = true
  list.foldable = false
  list.bind(() => this.data)
  list.updaters.push(list.updateItemClass)
  list.creators.push(list.createInitText)
  list.creators.push(list.updateInitText)

  // 创建事件类型选项
  const types = {
    common: {name: 'Common', value: 'common', tip: ''},
    create: {name: 'Create', value: 'create', tip: ''},
    autorun: {name: 'Autorun', value: 'autorun', tip: ''},
    collision: {name: 'Collision', value: 'collision', tip: ''},
    hittrigger: {name: 'Hit Trigger', value: 'hittrigger', tip: ''},
    hitactor: {name: 'Hit Actor', value: 'hitactor', tip: ''},
    destroy: {name: 'Destroy', value: 'destroy', tip: ''},
    playerenter: {name: 'Player Enter', value: 'playerenter', tip: ''},
    playerleave: {name: 'Player Leave', value: 'playerleave', tip: ''},
    actorenter: {name: 'Actor Enter', value: 'actorenter', tip: ''},
    actorleave: {name: 'Actor Leave', value: 'actorleave', tip: ''},
    skillcast: {name: 'Cast Skill', value: 'skillcast', tip: ''},
    skilladd: {name: 'Add Skill', value: 'skilladd', tip: ''},
    skillremove: {name: 'Remove Skill', value: 'skillremove', tip: ''},
    stateadd: {name: 'Add State', value: 'stateadd', tip: ''},
    stateremove: {name: 'Remove State', value: 'stateremove', tip: ''},
    equipmentadd: {name: 'Add Equipment', value: 'equipmentadd', tip: ''},
    equipmentremove: {name: 'Remove Equipment', value: 'equipmentremove', tip: ''},
    equipmentgain: {name: 'Gain Equipment', value: 'equipmentgain', tip: ''},
    itemuse: {name: 'Use Item', value: 'itemuse', tip: ''},
    itemgain: {name: 'Gain Item', value: 'itemgain', tip: ''},
    moneygain: {name: 'Gain Money', value: 'moneygain', tip: ''},
    startup: {name: 'Startup', value: 'startup', tip: ''},
    createscene: {name: 'Create Scene', value: 'createscene', tip: ''},
    loadscene: {name: 'Load Scene', value: 'loadscene', tip: ''},
    loadsave: {name: 'Load Save', value: 'loadsave', tip: ''},
    showtext: {name: 'Show Text', value: 'showtext', tip: ''},
    showchoices: {name: 'Show Choices', value: 'showchoices', tip: ''},
    keydown: {name: 'Key Down', value: 'keydown', tip: ''},
    keyup: {name: 'Key Up', value: 'keyup', tip: ''},
    mousedown: {name: 'Mouse Down', value: 'mousedown', tip: ''},
    mousedownLB: {name: 'Mouse Down LB', value: 'mousedownLB', tip: ''},
    mousedownRB: {name: 'Mouse Down RB', value: 'mousedownRB', tip: ''},
    mouseup: {name: 'Mouse Up', value: 'mouseup', tip: ''},
    mouseupLB: {name: 'Mouse Up LB', value: 'mouseupLB', tip: ''},
    mouseupRB: {name: 'Mouse Up RB', value: 'mouseupRB', tip: ''},
    mousemove: {name: 'Mouse Move', value: 'mousemove', tip: ''},
    mouseenter: {name: 'Mouse Enter', value: 'mouseenter', tip: ''},
    mouseleave: {name: 'Mouse Leave', value: 'mouseleave', tip: ''},
    click: {name: 'Click', value: 'click', tip: ''},
    doubleclick: {name: 'Double Click', value: 'doubleclick', tip: ''},
    wheel: {name: 'Wheel', value: 'wheel', tip: ''},
    touchstart: {name: 'Touch Start', value: 'touchstart', tip: ''},
    touchmove: {name: 'Touch Move', value: 'touchmove', tip: ''},
    touchend: {name: 'Touch End', value: 'touchend', tip: ''},
    select: {name: 'Select Button', value: 'select', tip: ''},
    deselect: {name: 'Deselect Button', value: 'deselect', tip: ''},
    input: {name: 'Input', value: 'input', tip: ''},
    focus: {name: 'Focus', value: 'focus', tip: ''},
    blur: {name: 'Blur', value: 'blur', tip: ''},
    end: {name: 'Play Ended', value: 'ended', tip: ''},
    gamepadbuttonpress: {name: 'Gamepad Press', value: 'gamepadbuttonpress', tip: ''},
    gamepadbuttonrelease: {name: 'Gamepad Release', value: 'gamepadbuttonrelease', tip: ''},
    gamepadleftstickchange: {name: 'Left Stick Change', value: 'gamepadleftstickchange', tip: ''},
    gamepadrightstickchange: {name: 'Right Stick Change', value: 'gamepadrightstickchange', tip: ''},
    preload: {name: 'Preload', value: 'preload', tip: ''},
  }
  this.types = {
    all: Object.values(types),
    global: [
      types.common,
      types.autorun,
      types.keydown,
      types.keyup,
      types.mousedown,
      types.mouseup,
      types.mousemove,
      types.doubleclick,
      types.wheel,
      types.touchstart,
      types.touchmove,
      types.touchend,
      types.gamepadbuttonpress,
      types.gamepadbuttonrelease,
      types.gamepadleftstickchange,
      types.gamepadrightstickchange,
      types.equipmentgain,
      types.itemgain,
      types.moneygain,
      types.startup,
      types.createscene,
      types.loadscene,
      types.loadsave,
      types.showtext,
      types.showchoices,
      types.preload,
    ],
    scene: [
      types.create,
      types.autorun,
      types.destroy,
    ],
    actor: [
      types.create,
      types.autorun,
      types.collision,
      types.hittrigger,
      types.destroy,
      types.mousedownLB,
      types.mousedownRB,
      types.mousedown,
      types.mouseupLB,
      types.mouseupRB,
      types.mouseup,
      types.mousemove,
      types.mouseenter,
      types.mouseleave,
      types.click,
      types.doubleclick,
    ],
    skill: [
      types.skillcast,
      types.skilladd,
      types.skillremove,
    ],
    state: [
      types.stateadd,
      types.stateremove,
      types.autorun,
    ],
    equipment: [
      types.create,
      types.equipmentadd,
      types.equipmentremove,
    ],
    trigger: [
      types.autorun,
      types.hitactor,
      types.destroy,
    ],
    item: [
      types.itemuse,
    ],
    region: [
      types.autorun,
      types.playerenter,
      types.playerleave,
      types.actorenter,
      types.actorleave,
      types.destroy,
    ],
    light: [
      types.autorun,
      types.destroy,
    ],
    animation: [
      types.autorun,
      types.destroy,
    ],
    particle: [
      types.autorun,
      types.destroy,
    ],
    parallax: [
      types.autorun,
      types.destroy,
    ],
    tilemap: [
      types.autorun,
      types.destroy,
    ],
    element: [
      types.create,
      types.autorun,
      types.mousedownLB,
      types.mousedownRB,
      types.mousedown,
      types.mouseupLB,
      types.mouseupRB,
      types.mouseup,
      types.mousemove,
      types.mouseenter,
      types.mouseleave,
      types.click,
      types.doubleclick,
      types.wheel,
      types.touchstart,
      types.touchmove,
      types.touchend,
      types.keydown,
      types.keyup,
      types.select,
      types.deselect,
      types.focus,
      types.blur,
      types.end,
      types.destroy,
      types.gamepadbuttonpress,
      types.gamepadbuttonrelease,
      types.gamepadleftstickchange,
      types.gamepadrightstickchange,
    ],
    register_global: [
      types.autorun,
      types.keydown,
      types.keyup,
      types.mousedown,
      types.mouseup,
      types.mousemove,
      types.doubleclick,
      types.wheel,
      types.touchstart,
      types.touchmove,
      types.touchend,
      types.gamepadbuttonpress,
      types.gamepadbuttonrelease,
      types.gamepadleftstickchange,
      types.gamepadrightstickchange,
      types.equipmentgain,
      types.itemgain,
      types.moneygain,
      types.createscene,
      types.loadscene,
      types.loadsave,
      types.showtext,
      types.showchoices,
    ],
    register_actor: [
      types.autorun,
      types.collision,
      types.hittrigger,
      types.mousedownLB,
      types.mousedownRB,
      types.mousedown,
      types.mouseupLB,
      types.mouseupRB,
      types.mouseup,
      types.mousemove,
      types.mouseenter,
      types.mouseleave,
      types.click,
      types.doubleclick,
    ],
    register_element: [
      types.autorun,
      types.mousedownLB,
      types.mousedownRB,
      types.mousedown,
      types.mouseupLB,
      types.mouseupRB,
      types.mouseup,
      types.mousemove,
      types.mouseenter,
      types.mouseleave,
      types.click,
      types.doubleclick,
      types.wheel,
      types.touchstart,
      types.touchmove,
      types.touchend,
      types.keydown,
      types.keyup,
      types.select,
      types.deselect,
      types.focus,
      types.blur,
      types.end,
      types.destroy,
      types.gamepadbuttonpress,
      types.gamepadbuttonrelease,
      types.gamepadleftstickchange,
      types.gamepadrightstickchange,
    ],
    relatedElements: [],
  }

  // 设置指令列表的内部高度
  const INNER_HEIGHT = 600
  Object.defineProperty(
    this.commandList, 'innerHeight', {
      configurable: true,
      value: INNER_HEIGHT,
    }
  )

  // 设置行号列表和指令列表的底部填充高度
  const PADDING_BOTTOM = INNER_HEIGHT - 20
  this.commandList.style.paddingBottom = `${PADDING_BOTTOM + 10}px`
  this.innerGutter.style.paddingBottom = `${PADDING_BOTTOM}px`

  // 侦听事件
  window.on('localize', this.windowLocalize)
  $('#event').on('close', this.windowClose)
  $('#event').on('closed', this.windowClosed)
  $('#event').on('resize', this.windowResize)
  this.list.on('pointerdown', this.listPointerdown, {capture: true})
  this.list.on('select', this.listSelect)
  this.list.on('popup', this.listPopup)
  $('#event-type').on('input', this.typeInput)
  $('#event-commands').on('change', this.commandListChange)
  this.commandList.on('update', this.commandListUpdate)
  this.commandList.on('scroll', this.commandListScroll)
  $('#event-confirm').on('click', this.confirm)
  $('#event-apply').on('click', this.apply)
}

// 打开本地事件
EventEditor.openLocalEvent = function (inserting, filter, name, event, callback) {
  this.unpackOpenEvents()
  Window.open('event')
  window.on('keydown', this.windowKeydown)

  // 查询项目并更新列表
  const list = this.list
  const item = list.createLocalEventItem(inserting, filter, name, event, callback)
  list.addNodeTo(item, null)
  list.update()
  list.select(item)
  list.restoreScroll()
  list.scrollToSelection('middle')

  // 列表获得焦点
  list.getFocus()
  return item
}

// 打开数据
EventEditor.openGlobalEvent = function (guid) {
  if (!Window.isWindowOpen('event')) {
    this.unpackOpenEvents()
    Window.open('event')
    window.on('keydown', this.windowKeydown)
  } else if (this.list.read()?.id === guid) {
    return
  }

  // 查询项目并更新列表
  const list = this.list
  const item = this.getItemById(guid)
  if (item) {
    list.initialize()
    list.select(item)
    list.expandToSelection(false)
    list.update()
    list.restoreScroll()
  } else {
    const item = list.createGlobalEventItem(guid)
    list.addNodeTo(item, null)
    list.update()
    list.select(item)
    list.restoreScroll()
  }
  list.scrollToSelection('middle')

  // 列表获得焦点
  list.getFocus()
}

// 打开相关事件
EventEditor.openRelatedEvents = function (contexts) {
  const list = this.list
  const items = []
  this.clearRelatedEventClasses(...this.data)
  for (const context of contexts) {
    let item
    if (context.filter === 'global') {
      const {id} = context
      item = this.getItemById(id)
      if (!item) {
        item = list.createGlobalEventItem(id)
        TreeList.createParents([item], null)
        this.data.push(item)
      }
    } else {
      const {filter, name, event} = context
      item = this.getItemByEvent(event)
      if (!item) {
        item = list.createLocalEventItem(false, filter, name, event, null)
        TreeList.createParents([item], null)
        this.data.push(item)
      }
    }
    items.push(item)
  }
  if (items.length !== 0) {
    list.update()
    let index = Infinity
    for (const item of items) {
      item.element.addClass('related-event')
      index = Math.min(index, this.data.indexOf(item))
    }
    list.unselect()
    list.selectIndex(index)
    list.scrollToSelection('middle')
  }
}

// 查找相关事件
EventEditor.findRelatedEvents = function (eventId) {
  const guidMap = Data.manifest.guidMap
  const references = []
  const find = event => {
    for (const command of event.commands) {
      switch (command.id) {
        case 'callEvent':
        case '!callEvent':
          if (command.params.type === 'global' &&
            command.params.eventId === eventId) {
            return true
          }
          break
      }
    }
    return false
  }
  for (const [id, event] of Object.entries(Data.events)) {
    if (find(event)) {
      references.push({
        filter: 'global',
        id: id,
      })
    }
  }
  for (const [id, actor] of Object.entries(Data.actors)) {
    for (const event of actor.events) {
      if (find(event)) {
        references.push({
          filter: 'actor',
          name: guidMap[id]?.file.basename,
          event: event,
        })
      }
    }
  }
  for (const [id, skill] of Object.entries(Data.skills)) {
    for (const event of skill.events) {
      if (find(event)) {
        references.push({
          filter: 'skill',
          name: guidMap[id]?.file.basename,
          event: event,
        })
      }
    }
  }
  for (const [id, trigger] of Object.entries(Data.triggers)) {
    for (const event of trigger.events) {
      if (find(event)) {
        references.push({
          filter: 'trigger',
          name: guidMap[id]?.file.basename,
          event: event,
        })
      }
    }
  }
  for (const [id, item] of Object.entries(Data.items)) {
    for (const event of item.events) {
      if (find(event)) {
        references.push({
          filter: 'item',
          name: guidMap[id]?.file.basename,
          event: event,
        })
      }
    }
  }
  for (const [id, equipment] of Object.entries(Data.equipments)) {
    for (const event of equipment.events) {
      if (find(event)) {
        references.push({
          filter: 'equipment',
          name: guidMap[id]?.file.basename,
          event: event,
        })
      }
    }
  }
  for (const [id, state] of Object.entries(Data.states)) {
    for (const event of state.events) {
      if (find(event)) {
        references.push({
          filter: 'state',
          name: guidMap[id]?.file.basename,
          event: event,
        })
      }
    }
  }
  for (const preset of Object.values(Data.scenePresets)) {
    for (const event of preset.data.events) {
      if (find(event)) {
        const rootName = guidMap[preset.sceneId]?.file.basename
        references.push({
          filter: preset.data.class,
          name: `${rootName}.${preset.data.name}`,
          event: event,
        })
      }
    }
  }
  for (const preset of Object.values(Data.uiPresets)) {
    for (const event of preset.data.events) {
      if (find(event)) {
        const rootName = guidMap[preset.uiId]?.file.basename
        references.push({
          filter: 'element',
          name: `${rootName}.${preset.data.name}`,
          event: event,
        })
      }
    }
  }
  this.openRelatedEvents(references)
}

// 获取所有本地事件
EventEditor.getAllLocalEvents = function () {
  const listMap = {}
  for (const [id, actor] of Object.entries(Data.actors)) {
    if (actor.events.length !== 0) {
      listMap[id] = actor.events
    }
  }
  for (const [id, skill] of Object.entries(Data.skills)) {
    if (skill.events.length !== 0) {
      listMap[id] = skill.events
    }
  }
  for (const [id, trigger] of Object.entries(Data.triggers)) {
    if (trigger.events.length !== 0) {
      listMap[id] = trigger.events
    }
  }
  for (const [id, item] of Object.entries(Data.items)) {
    if (item.events.length !== 0) {
      listMap[id] = item.events
    }
  }
  for (const [id, equipment] of Object.entries(Data.equipments)) {
    if (equipment.events.length !== 0) {
      listMap[id] = equipment.events
    }
  }
  for (const [id, state] of Object.entries(Data.states)) {
    if (state.events.length !== 0) {
      listMap[id] = state.events
    }
  }
  for (const [id, scene] of Object.entries(Data.scenes)) {
    if (scene.events.length !== 0) {
      listMap[id] = scene.events.slice()
    }
  }
  for (const {sceneId, data} of Object.values(Data.scenePresets)) {
    if (data.events.length !== 0) {
      (listMap[sceneId] ??= []).push(...data.events)
    }
  }
  for (const {uiId, data} of Object.values(Data.uiPresets)) {
    if (data.events.length !== 0) {
      (listMap[uiId] ??= []).push(...data.events)
    }
  }
  return listMap
}

// 清除所有事件标记类名
EventEditor.clearAllEventClasses = function (...items) {
  for (const item of items) {
    item.element.removeClass('local-event')
    item.element.removeClass('global-event')
    item.element.removeClass('related-event')
  }
}

// 清除相关事件标记类名
EventEditor.clearRelatedEventClasses = function (...items) {
  for (const item of items) {
    item.element.removeClass('related-event')
  }
}

// 保存数据
EventEditor.save = function (item) {
  const commands = item.commands
  commands.history.saveState()
  this.appendCommandsToCaches(commands)
  const commandsClone = Object.clone(commands)
  Object.defineProperty(commandsClone, 'symbol', {
    configurable: true,
    value: commands.symbol,
  })
  return {
    type: item.type,
    enabled: item.event.enabled,
    commands: commandsClone,
  }
}

// 判断是否已改变
EventEditor.isChanged = function () {
  for (const item of this.data) {
    if (item.changed) {
      return true
    }
  }
  return false
}

// 获取ID匹配的项目
EventEditor.getItemById = function (id) {
  const items = this.data
  const length = items.length
  for (let i = 0; i < length; i++) {
    const item = items[i]
    if (item.id === id) {
      return item
    }
  }
  return undefined
}

// 获取事件匹配的项目
EventEditor.getItemByEvent = function (event) {
  const items = this.data
  const length = items.length
  for (let i = 0; i < length; i++) {
    const item = items[i]
    if (item.event === event) {
      return item
    }
  }
  return undefined
}

// 打开指令列表
EventEditor.openCommandList = function (item) {
  // 获取指令缓存
  this.fetchCommandBuffer(item)
  $('#event-commands-fieldset').show()
  $('#event-type').show()

  const {commands, filter} = item

  // 创建类型选项
  $('#event-type').loadItems(
    Enum.getMergedItems(
      this.types[filter],
      filter + '-event',
  ))

  // 创建类型工具提示
  $('#event-type').createTooltip()

  // 写入数据
  const write = getElementWriter('event')
  write('commands', commands)
  write('type', item.type)
}

// 关闭指令列表
EventEditor.closeCommandList = function () {
  this.commandList.clear()
  $('#event-commands-fieldset').hide()
  $('#event-type').hide()
}

// 解包已打开事件列表
EventEditor.unpackOpenEvents = function () {
  const copies = []
  const events = Editor.project.openEvents
  // 移除无效的事件
  let i = events.length
  while (--i >= 0) {
    if (Data.events[events[i].id] === undefined) {
      events.splice(i, 1)
    }
  }
  for (const item of events) {
    if ('name' in item) {
      item.name = EventEditor.getGlobalEventName(item.id)
      EventEditor.list.updateItemName(item)
      copies.push(item)
    } else {
      copies.push(EventEditor.list.createGlobalEventItem(item.id))
    }
  }
  this.data = copies
}

// 打包已打开事件列表
EventEditor.packOpenEvents = function () {
  const copies = []
  for (const item of this.data) {
    if (item.class === 'global') {
      copies.push(item)
    }
  }
  Editor.project.openEvents = copies
}

// 调整行号列表
EventEditor.resizeGutter = function () {
  const {outerGutter, innerGutter} = this
  const height = outerGutter.clientHeight
  if (height !== 0) {
    const length = Math.ceil(height / 20) + 1
    const nodes = innerGutter.childNodes
    let i = nodes.length
    if (i !== length) {
      if (i < length) {
        while (i < length) {
          const node = document.createElement('box')
          node.addClass('event-commands-line-number')
          node.number = -1
          innerGutter.appendChild(node)
          i++
        }
      } else {
        while (--i >= length) {
          nodes[i].remove()
        }
      }
    }
  }
}

// 更新行号列表
EventEditor.updateGutter = function (force) {
  const {commandList} = this
  const {scrollTop} = commandList
  const {outerGutter, innerGutter} = EventEditor
  const start = Math.floor(scrollTop / 20) + 1
  const end = commandList.elements.count + 1
  if (innerGutter.start !== start || force) {
    innerGutter.start = start
    const nodes = innerGutter.childNodes
    const length = nodes.length
    for (let i = 0; i < length; i++) {
      const node = nodes[i]
      const number = start + i
      if (number < end) {
        if (node.number !== number) {
          node.number = number
          node.textContent = number.toString()
        }
      } else {
        if (node.number !== -1) {
          node.number = -1
          node.textContent = ''
        } else {
          break
        }
      }
    }
  }
  // 通过容差来消除非1:1时的抖动
  const tolerance = 0.0001
  outerGutter.scrollTop = (scrollTop + tolerance) % 20
}

// 添加指令数据到缓存列表
EventEditor.appendCommandsToCaches = function (commands) {
  const {caches} = this
  if (caches.append(commands) && caches.length > 50) {
    caches.shift()
  }
}

// 获取指令缓存
EventEditor.fetchCommandBuffer = function (item) {
  if (item.commands) return
  const {event, id} = item
  // 初始化指令数据标记
  const commands = event.commands
  if (!commands.symbol) {
    Object.defineProperty(commands, 'symbol', {
      configurable: true,
      value: Symbol(),
    })
  }

  // 获取指令数据缓存
  const symbol = commands.symbol
  let commandsClone = this.caches.find(target => {
    return target.symbol === symbol
  })

  // 克隆指令数据
  if (!commandsClone) {
    commandsClone = Object.clone(commands)
    Object.defineProperties(commandsClone, {
      symbol: {
        configurable: true,
        value: symbol,
      },
      eventId: {
        configurable: true,
        value: id,
      },
    })
  }

  item.commands = commandsClone
}

// 清除指令缓存元素
EventEditor.clearCommandBuffers = function () {
  const {commandList} = this
  for (const commands of this.caches) {
    commandList.deleteCommandBuffers(commands)
    const {stack} = commands.history
    const {length} = stack
    for (let i = 0; i < length; i++) {
      const {commands} = stack[i]
      commandList.deleteCommandBuffers(commands)
    }
  }
}

// 获取全局事件名称
EventEditor.getGlobalEventName = function (id) {
  return Data.manifest.guidMap[id]?.file.basename ?? ''
}

// 窗口 - 本地化事件
EventEditor.windowLocalize = function (event) {
  // 更新事件类型选项名称
  const types = EventEditor.types
  const getType = Local.createGetter('eventTypes')
  const getTip = Local.createGetter('eventTips')
  for (const item of types.all) {
    const key = item.value
    const name = getType(key)
    const tip = getTip(key)
    if (name !== '') {
      item.name = name
    }
    if (tip !== '') {
      item.tip = Local.parseTip(tip, name)
    }
  }
  // 更新事件类型相关元素
  for (const selectBox of types.relatedElements) {
    selectBox.createTooltip()
    if (selectBox.read()) {
      selectBox.update()
    }
  }
}

// 窗口 - 关闭事件
EventEditor.windowClose = function (event) {
  this.closing = true
  if (this.isChanged()) {
    event.preventDefault()
    const get = Local.createGetter('confirmation')
    return Window.confirm({
      message: get('closeUnsavedEvent'),
    }, [{
      label: get('yes'),
      click: () => {
        // 尝试恢复指令数据
        // 成功则添加到缓存
        // 失败则从缓存中移除
        for (const item of this.data) {
          if (item.changed) {
            item.changed = false
            const commands = item.commands
            if (commands.history.restoreState()) {
              this.appendCommandsToCaches(commands)
            } else {
              this.caches.remove(commands)
              item.commands = null
            }
          }
        }
        Window.close('event')
      },
    }, {
      label: get('no'),
    }])
  }
  this.list.saveScroll()
  this.closing = false
}.bind(EventEditor)

// 窗口 - 已关闭事件
EventEditor.windowClosed = function (event) {
  this.clearAllEventClasses(...this.data)
  this.packOpenEvents()
  this.data = null
  this.list.clear()
  this.commandList.clear()
  this.clearCommandBuffers()
  window.off('keydown', this.windowKeydown)
}.bind(EventEditor)

// 窗口 - 调整大小事件
EventEditor.windowResize = function (event) {
  // 设置指令列表的内部高度
  const {list, commandList} = EventEditor
  const parent = commandList.parentNode
  const outerHeight = parent.clientHeight
  const innerHeight = Math.max(outerHeight - 20, 0)
  Object.defineProperty(
    commandList, 'innerHeight', {
      configurable: true,
      value: innerHeight,
    }
  )

  // 设置行号列表和指令列表的底部填充高度
  const {innerGutter} = EventEditor
  const paddingBottom = innerHeight - 20
  commandList.style.paddingBottom = `${paddingBottom + 10}px`
  innerGutter.style.paddingBottom = `${paddingBottom}px`

  // 调整列表
  list.resize()
  commandList.resize()

  // 当使用快捷键滚动到底部并且溢出时再最大化窗口
  // 会触发BUG: 插入指令resize刷新时增加scrollTop
  // 重置scrollTop可以避免这个现象
  // 由于scroll是异步事件因此不会重复触发
  const st = commandList.scrollTop
  commandList.scrollTop = 0
  commandList.scrollTop = st

  // 调整行号列表
  EventEditor.resizeGutter()
  EventEditor.updateGutter(true)
}

// 窗口 - 键盘按下事件
EventEditor.windowKeydown = function (event) {
  if (event.cmdOrCtrlKey) {
    switch (event.code) {
      case 'KeyW':
        if (Window.getTopWindow()?.id === 'event') {
          EventEditor.list.close()
        }
        break
    }
  }
  if (event.altKey) {
    switch (event.code) {
      case 'AltLeft':
        if (Window.getTopWindow()?.id === 'event') {
          EventEditor.list.addClass('alt')
          EventEditor.commandList.addClass('alt')
          window.on('keyup', EventEditor.windowKeyup)
          window.on('pointermove', EventEditor.windowPointermove)
        }
        break
    }
  }
}

// 窗口 - 键盘弹起事件
EventEditor.windowKeyup = function (event) {
  if (!event.altKey) {
    switch (event.code) {
      case 'AltLeft':
        EventEditor.list.removeClass('alt')
        EventEditor.commandList.removeClass('alt')
        window.off('keyup', EventEditor.windowKeyup)
        window.off('pointermove', EventEditor.windowPointermove)
        break
    }
  }
}

// 窗口 - 指针移动事件
// ctrl组合快捷键导致blur无法触发按键弹起事件，补救方法
EventEditor.windowPointermove = function (event) {
  if (!event.altKey) {
    EventEditor.list.removeClass('alt')
    EventEditor.commandList.removeClass('alt')
    window.off('keyup', EventEditor.windowKeyup)
    window.off('pointermove', EventEditor.windowPointermove)
  }
}

// 列表 - 指针按下事件
EventEditor.listPointerdown = function (event) {
  if (event.altKey && event.button === 0) {
    const element = event.target
    if (element.tagName === 'NODE-ITEM') {
      const item = element.item
      if (item.id) {
        // 阻止focus后快捷键不被禁用的情况
        event.preventDefault()
        event.stopImmediatePropagation()
        EventEditor.findRelatedEvents(item.id)
      }
    }
  }
}

// 列表 - 选择事件
EventEditor.listSelect = function (event) {
  const item = event.value
  EventEditor.openCommandList(item)
  if (item.element instanceof HTMLElement) {
    item.element.removeClass('related-event')
  }
}

// 列表 - 菜单弹出事件
EventEditor.listPopup = function (event) {
  const item = event.value
  const selected = !!item
  const get = Local.createGetter('menuEventList')
  Menu.popup({
    x: event.clientX,
    y: event.clientY,
  }, [{
    label: get('close'),
    accelerator: ctrl('W'),
    enabled: selected,
    click: () => {
      EventEditor.list.close(item)
    },
  }, {
    label: get('close-below'),
    enabled: selected,
    click: () => {
      EventEditor.list.closeBelow(item)
    },
  }, {
    label: get('close-others'),
    enabled: selected,
    click: () => {
      EventEditor.list.closeOthers(item)
    },
  }, {
    label: get('close-all'),
    enabled: selected,
    click: () => {
      EventEditor.list.closeAll()
    },
  }, {
    label: get('find-related-events'),
    accelerator: 'Alt+LB',
    enabled: selected && item.id !== '',
    click: () => {
      EventEditor.findRelatedEvents(item.id)
    },
  }])
}

// 类型 - 输入事件
EventEditor.typeInput = function (event) {
  const item = EventEditor.list.read()
  if (!item.changed) {
    item.changed = true
    item.name += '*'
  }
  item.type = event.value
  EventEditor.list.updateItemName(item)
}

// 指令列表 - 改变事件
EventEditor.commandListChange = function (event) {
  if (EventEditor.closing) return
  const item = EventEditor.list.read()
  if (!item.changed) {
    item.changed = true
    item.name += '*'
    EventEditor.list.updateItemName(item)
  }
}

// 指令列表 - 更新事件
EventEditor.commandListUpdate = function (event) {
  EventEditor.resizeGutter()
  EventEditor.updateGutter(true)
}

// 指令列表 - 滚动事件
EventEditor.commandListScroll = function (event) {
  EventEditor.updateGutter(false)
}

// 确定按钮 - 鼠标点击事件
EventEditor.confirm = function (event) {
  this.apply()
  Window.close('event')
}.bind(EventEditor)

// 应用按钮 - 鼠标点击事件
EventEditor.apply = function (event) {
  for (const item of this.data) {
    switch (item.class) {
      // 保存全局事件
      case 'global':
        if (item.changed) {
          item.changed = false
          File.planToSave(item.meta)
          const event = item.event
          const save = EventEditor.save(item)
          if (event.type !== save.type) {
            event.type = save.type
            if (Inspector.fileEvent.target === event) {
              Inspector.fileEvent.write({type: event.type})
            }
          }
          event.commands = save.commands
        }
        break
      // 保存本地事件
      case 'local':
        if (item.changed || item.inserting) {
          item.changed = false
          item.inserting = false
          if (item.callback) {
            item.callback()
          } else {
            const save = EventEditor.save(item)
            item.event.type = save.type
            item.event.commands = save.commands
          }
        }
        break
    }
  }
}.bind(EventEditor)

// 列表 - 选择索引
EventEditor.list.selectIndex = function (index) {
  const elements = this.elements
  const last = elements.count - 1
  const element = elements[Math.min(index, last)]
  if (element instanceof HTMLElement) {
    this.select(element.item)
  }
}

// 列表 - 关闭
EventEditor.list.close = function (item) {
  if (item === undefined) {
    item = this.read()
  }
  if (item) {
    const close = () => {
      const index = this.data.indexOf(item)
      EventEditor.clearAllEventClasses(item)
      this.deleteNode(item)
      EventEditor.closeCommandList()
      // 自动选择下一个列表项
      this.selectIndex(index)
    }
    if (item.changed) {
      const get = Local.createGetter('confirmation')
      return Window.confirm({
        message: get('closeUnsavedEvent'),
      }, [{
        label: get('yes'),
        click: close,
      }, {
        label: get('no'),
      }])
    }
    close()
  }
}

// 列表 - 关闭多个事件
EventEditor.list.closeMultiple = function (items, callback) {
  if (items.length === 0) return
  const closeMultiple = () => {
    for (const item of items) {
      EventEditor.clearAllEventClasses(item)
      this.deleteNode(item)
    }
    callback?.()
  }
  for (const item of items) {
    if (item.changed) {
      const get = Local.createGetter('confirmation')
      return Window.confirm({
        message: get('closeUnsavedEvent'),
      }, [{
        label: get('yes'),
        click: closeMultiple,
      }, {
        label: get('no'),
      }])
    }
  }
  closeMultiple()
}

// 列表 - 关闭下面的事件
EventEditor.list.closeBelow = function (item) {
  const index = this.data.indexOf(item)
  this.closeMultiple(this.data.slice(index + 1))
}

// 列表 - 关闭其他的事件
EventEditor.list.closeOthers = function (item) {
  const items = this.data.slice()
  items.remove(item)
  this.closeMultiple(items)
}

// 列表 - 关闭全部的事件
EventEditor.list.closeAll = function () {
  const callback = () => EventEditor.closeCommandList()
  this.closeMultiple(this.data.slice(), callback)
}

// 列表 - 保存滚动状态
EventEditor.list.saveScroll = function () {
  this.lastScrollTop = this.scrollTop
}

// 列表 - 恢复滚动状态
EventEditor.list.restoreScroll = function () {
  this.scrollTop = this.lastScrollTop
}

// 列表 - 定义属性
EventEditor.list.defineProperties = function (item) {
  return Object.defineProperties(item, {
    name: {
      writable: true,
      value: '',
    },
    class: {
      writable: true,
      value: '',
    },
    type: {
      writable: true,
      value: '',
    },
    commands: {
      writable: true,
      value: null,
    },
    filter: {
      writable: true,
      value: '',
    },
    meta: {
      writable: true,
      value: null,
    },
    event: {
      writable: true,
      value: null,
    },
    callback: {
      writable: true,
      value: null,
    },
    changed: {
      writable: true,
      value: false,
    },
    inserting: {
      writable: true,
      value: false,
    },
  })
}

// 列表 - 创建本地事件项目
EventEditor.list.createLocalEventItem = function (inserting, filter, name, event, callback) {
  const item = EventEditor.list.defineProperties({id: ''})
  item.name = name
  item.class = 'local'
  item.filter = filter
  item.type = event.type
  item.event = event
  item.callback = callback
  item.inserting = inserting
  item.changed = false
  return item
}

// 列表 - 创建全局事件项目
EventEditor.list.createGlobalEventItem = function (guid) {
  const item = EventEditor.list.defineProperties({id: guid})
  const event = Data.events[guid]
  item.name = EventEditor.getGlobalEventName(guid)
  item.class = 'global'
  item.filter = 'global'
  item.type = event.type
  item.meta = Data.manifest.guidMap[guid]
  item.event = Data.events[guid]
  item.callback = null
  item.changed = false
  return item
}

// 列表 - 更新项目类名
EventEditor.list.updateItemClass = function (item) {
  const {element} = item
  element.addClass('event-open-item')
  if (item.filter === 'global') {
    element.addClass('global-event')
  } else {
    element.addClass('local-event')
  }
}

// 列表 - 重写创建图标方法
EventEditor.list.createIcon = function () {
  const closeButton = document.createElement('text')
  closeButton.textContent = '×'
  closeButton.addClass('event-close-button')
  closeButton.on('click', EventEditor.list.closeButtonClick)
  return closeButton
}

// 列表 - 创建初始化文本
EventEditor.list.createInitText = function (item) {
  const {element} = item
  const initText = document.createElement('text')
  initText.addClass('event-init-text')
  element.appendChild(initText)
  element.initText = initText
  element.attrValue = ''
}

// 列表 - 更新初始化文本
EventEditor.list.updateInitText = function (item) {
  const {element} = item
  if (element.initText !== undefined) {
    let typeName = ''
    if (item.type !== 'common') {
      typeName = ' : ' + Command.removeTextTags(Command.parseEventType(item.filter + '-event', item.type))
    }
    if (element.attrValue !== typeName) {
      element.attrValue = typeName
      element.initText.textContent = typeName
    }
  }
}

// 列表 - 重写更新项目名称方法
EventEditor.list.updateItemName = function (item) {
  TreeList.prototype.updateItemName.call(this, item)
  this.updateInitText(item)
}

// 列表 - 关闭按钮点击事件
EventEditor.list.closeButtonClick = function (event) {
  EventEditor.list.close(event.target.parentNode.item)
}

// ******************************** 显示选项窗口 ********************************

const Choices = {
  // properties
  target: null,
  commands: null,
  // methods
  initialize: null,
  parse: null,
  open: null,
  save: null,
  // events
  windowClosed: null,
  confirm: null,
}

// 初始化
Choices.initialize = function () {
  // 侦听事件
  $('#choice').on('closed', this.windowClosed)
  $('#choice-confirm').on('click', this.confirm)
}

// 解析项目
Choices.parse = function (choice) {
  return Command.removeTextTags(Command.parseVariableTag(GameLocal.replace(choice.content)))
}

// 打开数据
Choices.open = function (choice = {content: '', commands: []}) {
  Window.open('choice')
  $('#choice-content').write(choice.content)
  $('#choice-content').getFocus('all')
  this.commands = choice.commands
}

// 保存数据
Choices.save = function () {
  const commands = this.commands
  const content = $('#choice-content').read().trim()
  if (content === '') {
    return $('#choice-content').getFocus()
  }
  Window.close('choice')
  return {content, commands}
}

// 窗口 - 已关闭事件
Choices.windowClosed = function (event) {
  Choices.commands = null
}

// 确定按钮 - 鼠标点击事件
Choices.confirm = function (event) {
  return Choices.target.save()
}

// ******************************** 设置数值 - 操作数窗口 ********************************

const NumberOperand = {
  // properties
  target: null,
  // methods
  initialize: null,
  parseMathMethod: null,
  parseStringMethod: null,
  parseObjectProperty: null,
  parseElementProperty: null,
  parseOther: null,
  parseOperand: null,
  parse: null,
  open: null,
  save: null,
  // events
  confirm: null,
}

// 初始化
NumberOperand.initialize = function () {
  // 创建头部操作选项
  $('#setNumber-operation').loadItems([
    {name: 'Set', value: 'set'},
    {name: 'Add', value: 'add'},
    {name: 'Sub', value: 'sub'},
    {name: 'Mul', value: 'mul'},
    {name: 'Div', value: 'div'},
    {name: 'Mod', value: 'mod'},
  ])

  // 创建操作选项
  $('#setNumber-operand-operation').loadItems([
    {name: 'Add', value: 'add'},
    {name: 'Sub', value: 'sub'},
    {name: 'Mul', value: 'mul'},
    {name: 'Div', value: 'div'},
    {name: 'Mod', value: 'mod'},
    {name: '(Add)', value: 'add()'},
    {name: '(Sub)', value: 'sub()'},
    {name: '(Mul)', value: 'mul()'},
    {name: '(Div)', value: 'div()'},
    {name: '(Mod)', value: 'mod()'},
  ])

  // 创建类型选项
  $('#setNumber-operand-type').loadItems([
    {name: 'Constant', value: 'constant'},
    {name: 'Variable', value: 'variable'},
    {name: 'Math', value: 'math'},
    {name: 'String', value: 'string'},
    {name: 'Object', value: 'object'},
    {name: 'Element', value: 'element'},
    {name: 'List', value: 'list'},
    {name: 'Parameter', value: 'parameter'},
    {name: 'Script', value: 'script'},
    {name: 'Other', value: 'other'},
  ])

  // 设置类型关联元素
  $('#setNumber-operand-type').enableHiddenMode().relate([
    {case: 'constant', targets: [
      $('#setNumber-operand-constant-value'),
    ]},
    {case: 'variable', targets: [
      $('#setNumber-operand-common-variable'),
    ]},
    {case: 'math', targets: [
      $('#setNumber-operand-math-method'),
    ]},
    {case: 'string', targets: [
      $('#setNumber-operand-string-method'),
      $('#setNumber-operand-common-variable'),
    ]},
    {case: 'object', targets: [
      $('#setNumber-operand-object-property'),
    ]},
    {case: 'element', targets: [
      $('#setNumber-operand-element-property'),
      $('#setNumber-operand-element-element'),
    ]},
    {case: 'list', targets: [
      $('#setNumber-operand-common-variable'),
      $('#setNumber-operand-list-index'),
    ]},
    {case: 'parameter', targets: [
      $('#setNumber-operand-parameter-key'),
    ]},
    {case: 'script', targets: [
      $('#setNumber-operand-script'),
    ]},
    {case: 'other', targets: [
      $('#setNumber-operand-other-data'),
    ]},
  ])

  // 设置类型写入事件，切换变量输入框的过滤器
  $('#setNumber-operand-type').on('write', event => {
    let filter = 'all'
    switch (event.value) {
      case 'variable':
      case 'math':
        filter = 'number'
        break
      case 'string':
        filter = 'string'
        break
      case 'object':
      case 'list':
        filter = 'object'
        break
    }
    $('#setNumber-operand-common-variable').filter = filter
  })

  // 创建数学方法选项
  $('#setNumber-operand-math-method').loadItems([
    {name: 'Round', value: 'round'},
    {name: 'Floor', value: 'floor'},
    {name: 'Ceil', value: 'ceil'},
    {name: 'Sqrt', value: 'sqrt'},
    {name: 'Abs', value: 'abs'},
    {name: 'Cos(radians)', value: 'cos'},
    {name: 'Sin(radians)', value: 'sin'},
    {name: 'Tan(radians)', value: 'tan'},
    {name: 'Random[0,1)', value: 'random'},
    {name: 'Random Int', value: 'random-int'},
    {name: 'Distance', value: 'distance'},
    {name: 'Horizontal Distance', value: 'distance-x'},
    {name: 'Vertical Distance', value: 'distance-y'},
    {name: 'Relative Angle', value: 'relative-angle'},
  ])

  // 设置数学方法关联元素
  $('#setNumber-operand-math-method').enableHiddenMode().relate([
    {case: 'round', targets: [
      $('#setNumber-operand-common-variable'),
      $('#setNumber-operand-math-decimals'),
    ]},
    {case: ['floor', 'ceil', 'sqrt', 'abs', 'cos', 'sin', 'tan'], targets: [
      $('#setNumber-operand-common-variable'),
    ]},
    {case: 'random-int', targets: [
      $('#setNumber-operand-math-min'),
      $('#setNumber-operand-math-max'),
    ]},
    {case: ['distance', 'distance-x', 'distance-y', 'relative-angle'], targets: [
      $('#setNumber-operand-math-startPosition'),
      $('#setNumber-operand-math-endPosition'),
    ]},
  ])

  // 创建字符串方法选项
  $('#setNumber-operand-string-method').loadItems([
    {name: 'Get Length', value: 'length'},
    {name: 'Parse Number', value: 'parse'},
    {name: 'Get Index of Substring', value: 'search'},
  ])

  // 设置字符串方法关联元素
  $('#setNumber-operand-string-method').enableHiddenMode().relate([
    {case: ['length', 'parse'], targets: [
      $('#setNumber-operand-common-variable'),
    ]},
    {case: 'search', targets: [
      $('#setNumber-operand-common-variable'),
      $('#setNumber-operand-string-search'),
    ]},
  ])

  // 创建对象属性选项
  $('#setNumber-operand-object-property').loadItems([
    {name: 'Actor - X', value: 'actor-x'},
    {name: 'Actor - Y', value: 'actor-y'},
    {name: 'Actor - UI X', value: 'actor-ui-x'},
    {name: 'Actor - UI Y', value: 'actor-ui-y'},
    {name: 'Actor - Screen X', value: 'actor-screen-x'},
    {name: 'Actor - Screen Y', value: 'actor-screen-y'},
    {name: 'Actor - Angle', value: 'actor-angle'},
    {name: 'Actor - Direction Angle', value: 'actor-direction'},
    {name: 'Actor - Movement Speed', value: 'actor-movement-speed'},
    {name: 'Actor - Collision Size', value: 'actor-collision-size'},
    {name: 'Actor - Collision Weight', value: 'actor-collision-weight'},
    {name: 'Actor - Scaling Factor', value: 'actor-scaling-factor'},
    {name: 'Actor - Item Quantity', value: 'actor-inventory-item-quantity'},
    {name: 'Actor - Equipment Quantity', value: 'actor-inventory-equipment-quantity'},
    {name: 'Actor - Inventory Money', value: 'actor-inventory-money'},
    {name: 'Actor - Inventory Used Space', value: 'actor-inventory-used-space'},
    {name: 'Actor - Inventory Version', value: 'actor-inventory-version'},
    {name: 'Actor - Skill Version', value: 'actor-skill-version'},
    {name: 'Actor - State Version', value: 'actor-state-version'},
    {name: 'Actor - Equipment Version', value: 'actor-equipment-version'},
    {name: 'Actor - Shortcut Version', value: 'actor-shortcut-version'},
    {name: 'Actor - Anim Current Time', value: 'actor-animation-current-time'},
    {name: 'Actor - Anim Duration', value: 'actor-animation-duration'},
    {name: 'Actor - Anim Progress', value: 'actor-animation-progress'},
    {name: 'Actor - Cooldown Time', value: 'actor-cooldown-time'},
    {name: 'Actor - Cooldown Duration', value: 'actor-cooldown-duration'},
    {name: 'Actor - Cooldown Progress', value: 'actor-cooldown-progress'},
    {name: 'Skill - Cooldown Time', value: 'skill-cooldown-time'},
    {name: 'Skill - Cooldown Duration', value: 'skill-cooldown-duration'},
    {name: 'Skill - Cooldown Progress', value: 'skill-cooldown-progress'},
    {name: 'State - Current Time', value: 'state-current-time'},
    {name: 'State - Duration', value: 'state-duration'},
    {name: 'State - Progress', value: 'state-progress'},
    {name: 'Equipment - Order in Inventory', value: 'equipment-order'},
    {name: 'Item - Order in Inventory', value: 'item-order'},
    {name: 'Item - Quantity', value: 'item-quantity'},
    {name: 'Trigger - Speed', value: 'trigger-speed'},
    {name: 'Trigger - Angle', value: 'trigger-angle'},
    {name: 'Tilemap - Width', value: 'tilemap-width'},
    {name: 'Tilemap - Height', value: 'tilemap-height'},
    {name: 'List - Length', value: 'list-length'},
  ])

  // 设置对象属性关联元素
  $('#setNumber-operand-object-property').enableHiddenMode().relate([
    {case: [
      'actor-x',
      'actor-y',
      'actor-ui-x',
      'actor-ui-y',
      'actor-screen-x',
      'actor-screen-y',
      'actor-angle',
      'actor-direction',
      'actor-movement-speed',
      'actor-collision-size',
      'actor-collision-weight',
      'actor-scaling-factor',
      'actor-inventory-money',
      'actor-inventory-used-space',
      'actor-inventory-version',
      'actor-skill-version',
      'actor-state-version',
      'actor-equipment-version',
      'actor-shortcut-version',
      'actor-animation-current-time',
      'actor-animation-duration',
      'actor-animation-progress'], targets: [
      $('#setNumber-operand-common-actor'),
    ]},
    {case: 'actor-inventory-item-quantity', targets: [
      $('#setNumber-operand-common-actor'),
      $('#setNumber-operand-object-itemId'),
    ]},
    {case: 'actor-inventory-equipment-quantity', targets: [
      $('#setNumber-operand-common-actor'),
      $('#setNumber-operand-object-equipmentId'),
    ]},
    {case: ['actor-cooldown-time', 'actor-cooldown-duration', 'actor-cooldown-progress'], targets: [
      $('#setNumber-operand-common-actor'),
      $('#setNumber-operand-cooldown-key'),
    ]},
    {case: ['skill-cooldown-time', 'skill-cooldown-duration', 'skill-cooldown-progress'], targets: [
      $('#setNumber-operand-common-skill'),
    ]},
    {case: ['state-current-time', 'state-duration', 'state-progress'], targets: [
      $('#setNumber-operand-common-state'),
    ]},
    {case: 'equipment-order', targets: [
      $('#setNumber-operand-common-equipment'),
    ]},
    {case: ['item-order', 'item-quantity'], targets: [
      $('#setNumber-operand-common-item'),
    ]},
    {case: ['trigger-speed', 'trigger-angle'], targets: [
      $('#setNumber-operand-common-trigger'),
    ]},
    {case: ['tilemap-width', 'tilemap-height'], targets: [
      $('#setNumber-operand-common-tilemap'),
    ]},
    {case: 'list-length', targets: [
      $('#setNumber-operand-common-variable'),
    ]},
  ])

  // 创建元素属性选项
  $('#setNumber-operand-element-property').loadItems([
    {name: 'Element - X', value: 'element-x'},
    {name: 'Element - Y', value: 'element-y'},
    {name: 'Element - Width', value: 'element-width'},
    {name: 'Element - Height', value: 'element-height'},
    {name: 'Element - Number of Children', value: 'element-children-count'},
    {name: 'Element - Index of the Selected Button', value: 'element-index-of-selected-button'},
    {name: 'Transform - Anchor X', value: 'transform-anchorX'},
    {name: 'Transform - Anchor Y', value: 'transform-anchorY'},
    {name: 'Transform - X', value: 'transform-x'},
    {name: 'Transform - Y', value: 'transform-y'},
    {name: 'Transform - Width', value: 'transform-width'},
    {name: 'Transform - Height', value: 'transform-height'},
    {name: 'Transform - X2', value: 'transform-x2'},
    {name: 'Transform - Y2', value: 'transform-y2'},
    {name: 'Transform - Width2', value: 'transform-width2'},
    {name: 'Transform - Height2', value: 'transform-height2'},
    {name: 'Transform - Rotation', value: 'transform-rotation'},
    {name: 'Transform - Scale X', value: 'transform-scaleX'},
    {name: 'Transform - Scale Y', value: 'transform-scaleY'},
    {name: 'Transform - Skew X', value: 'transform-skewX'},
    {name: 'Transform - Skew Y', value: 'transform-skewY'},
    {name: 'Transform - Opacity', value: 'transform-opacity'},
    {name: 'Window - Visible Grid Columns', value: 'window-visibleGridColumns'},
    {name: 'Window - Visible Grid Rows', value: 'window-visibleGridRows'},
    {name: 'Text - Text Width', value: 'text-textWidth'},
    {name: 'Text - Text Height', value: 'text-textHeight'},
    {name: 'Text Box - Number', value: 'textBox-number'},
    {name: 'Dialog Box - Print End X', value: 'dialogBox-printEndX'},
    {name: 'Dialog Box - Print End Y', value: 'dialogBox-printEndY'},
  ])

  // 创建其他数据选项
  $('#setNumber-operand-other-data').loadItems([
    {name: 'Event Trigger Mouse Button', value: 'trigger-button'},
    {name: 'Event Trigger Wheel Delta Y', value: 'trigger-wheel-y'},
    {name: 'Event Trigger Gamepad Button', value: 'trigger-gamepad-button'},
    {name: 'Gamepad Left Stick Angle', value: 'gamepad-left-stick-angle'},
    {name: 'Gamepad Right Stick Angle', value: 'gamepad-right-stick-angle'},
    {name: 'Mouse Screen X', value: 'mouse-screen-x'},
    {name: 'Mouse Screen Y', value: 'mouse-screen-y'},
    {name: 'Mouse UI X', value: 'mouse-ui-x'},
    {name: 'Mouse UI Y', value: 'mouse-ui-y'},
    {name: 'Mouse Scene X', value: 'mouse-scene-x'},
    {name: 'Mouse Scene Y', value: 'mouse-scene-y'},
    {name: 'Touch Screen X', value: 'touch-screen-x'},
    {name: 'Touch Screen Y', value: 'touch-screen-y'},
    {name: 'Touch UI X', value: 'touch-ui-x'},
    {name: 'Touch UI Y', value: 'touch-ui-y'},
    {name: 'Touch Scene X', value: 'touch-scene-x'},
    {name: 'Touch Scene Y', value: 'touch-scene-y'},
    {name: 'Virtual Axis X', value: 'virtual-axis-x'},
    {name: 'Virtual Axis Y', value: 'virtual-axis-y'},
    {name: 'Virtual Axis Angle', value: 'virtual-axis-angle'},
    {name: 'Start Position X', value: 'start-position-x'},
    {name: 'Start Position Y', value: 'start-position-y'},
    {name: 'Camera X', value: 'camera-x'},
    {name: 'Camera Y', value: 'camera-y'},
    {name: 'Camera Zoom', value: 'camera-zoom'},
    {name: 'Raw Camera Zoom', value: 'raw-camera-zoom'},
    {name: 'Screen Width', value: 'screen-width'},
    {name: 'Screen Height', value: 'screen-height'},
    {name: 'Scene Width', value: 'scene-width'},
    {name: 'Scene Height', value: 'scene-height'},
    {name: 'Scene Scale', value: 'scene-scale'},
    {name: 'UI Scale', value: 'ui-scale'},
    {name: 'Play Time', value: 'play-time'},
    {name: 'Elapsed Time', value: 'elapsed-time'},
    {name: 'Delta Time', value: 'delta-time'},
    {name: 'Raw Delta Time', value: 'raw-delta-time'},
    {name: 'Get Timestamp', value: 'timestamp'},
    {name: 'Party Version', value: 'party-version'},
    {name: 'Number of Party Members', value: 'party-member-count'},
    {name: 'Number of Actors in the Scene', value: 'actor-count'},
    {name: 'Latest Item Increment', value: 'latest-item-increment'},
    {name: 'Latest Money Increment', value: 'latest-money-increment'},
    {name: 'Loader - Loaded Bytes', value: 'loader-loaded-bytes'},
    {name: 'Loader - Total Bytes', value: 'loader-total-bytes'},
    {name: 'Loader - Completion Progress', value: 'loader-completion-progress'},
  ])

  // 设置其他数据关联元素
  $('#setNumber-operand-other-data').enableHiddenMode().relate([
    {case: ['touch-screen-x', 'touch-screen-y', 'touch-ui-x', 'touch-ui-y', 'touch-scene-x', 'touch-scene-y'], targets: [
      $('#setNumber-operand-other-touchId'),
    ]},
    {case: 'actor-count', targets: [
      $('#setNumber-operand-other-teamId'),
    ]},
  ])

  // 创建队伍选项 - 窗口打开事件
  $('#setNumber-operand').on('open', event => {
    $('#setNumber-operand-other-teamId').loadItems(
      Data.createTeamItems()
    )
  })

  // 清理内存 - 窗口已关闭事件
  $('#setNumber-operand').on('closed', event => {
    $('#setNumber-operand-other-teamId').clear()
    $('#setNumber-operation').restore()
  })

  // 侦听事件
  $('#setNumber-operand-confirm').on('click', this.confirm)
}

// 解析数学方法
NumberOperand.parseMathMethod = function (operand) {
  const method = operand.method
  const label = Local.get('command.setNumber.math.' + method)
  switch (method) {
    case 'round': {
      const varName = Command.parseVariable(operand.variable, 'number')
      const decimals = operand.decimals
      return `${label}${Token('(')}${varName}${decimals ? `${Token(', ')}${Command.setNumberColor(decimals)}` : ''}${Token(')')}`
    }
    case 'floor':
    case 'ceil':
    case 'sqrt':
    case 'abs':
    case 'cos':
    case 'sin':
    case 'tan': {
      const varName = Command.parseVariable(operand.variable, 'number')
      return `${label}${Token('(')}${varName}${Token(')')}`
    }
    case 'random': {
      const min = Command.setNumberColor(0)
      const max = Command.setNumberColor(1)
      return `${label}${Token('[')}${min}${Token(', ')}${max}${Token(')')}`
    }
    case 'random-int': {
      const min = Command.parseVariableNumber(operand.min)
      const max = Command.parseVariableNumber(operand.max)
      return `${label}${Token('[')}${min}${Token(', ')}${max}${Token(']')}`
    }
    case 'distance':
    case 'distance-x':
    case 'distance-y':
    case 'relative-angle': {
      const start = Command.parsePosition(operand.start)
      const end = Command.parsePosition(operand.end)
      return `${label}${Token('(')}${start}${Token(', ')}${end}${Token(')')}`
    }
  }
}

// 解析字符串方法
NumberOperand.parseStringMethod = function (operand) {
  const method = operand.method
  const methodName = Local.get('command.setNumber.string.' + method)
  switch (method) {
    case 'length':
    case 'parse': {
      const variable = operand.variable
      const varName = Command.parseVariable(variable, 'string')
      return methodName + Token('(') + varName + Token(')')
    }
    case 'search': {
      const {variable, search} = operand
      const varName = Command.parseVariable(variable, 'string')
      const searchName = Command.parseVariableString(search)
      return methodName + Token('(') + varName + Token(', ') + searchName + Token(')')
    }
  }
}

// 解析对象属性
NumberOperand.parseObjectProperty = function (operand) {
  const property = Local.get('command.setNumber.object.' + operand.property)
  switch (operand.property) {
    case 'actor-x':
    case 'actor-y':
    case 'actor-ui-x':
    case 'actor-ui-y':
    case 'actor-screen-x':
    case 'actor-screen-y':
    case 'actor-angle':
    case 'actor-direction':
    case 'actor-movement-speed':
    case 'actor-collision-size':
    case 'actor-collision-weight':
    case 'actor-scaling-factor':
    case 'actor-inventory-money':
    case 'actor-inventory-used-space':
    case 'actor-inventory-version':
    case 'actor-skill-version':
    case 'actor-state-version':
    case 'actor-equipment-version':
    case 'actor-shortcut-version':
    case 'actor-animation-current-time':
    case 'actor-animation-duration':
    case 'actor-animation-progress':
      return Command.parseActor(operand.actor) + Token(' -> ') + property.replace('.', Token('.'))
    case 'actor-inventory-item-quantity':
      return Command.parseActor(operand.actor) + Token(' -> ') + Command.parseVariableFile(operand.itemId) + Token('.') + property
    case 'actor-inventory-equipment-quantity':
      return Command.parseActor(operand.actor) + Token(' -> ') + Command.parseVariableFile(operand.equipmentId) + Token('.') + property
    case 'actor-cooldown-time':
    case 'actor-cooldown-duration':
    case 'actor-cooldown-progress': {
      const key = Command.parseVariableEnum('cooldown-key', operand.key)
      return Command.parseActor(operand.actor) + Token(' -> ') + property + Token('(') + key + Token(')')
    }
    case 'skill-cooldown-time':
    case 'skill-cooldown-duration':
    case 'skill-cooldown-progress':
      return Command.parseSkill(operand.skill) + Token(' -> ') + property
    case 'state-current-time':
    case 'state-duration':
    case 'state-progress':
      return Command.parseState(operand.state) + Token(' -> ') + property
    case 'equipment-order':
      return Command.parseEquipment(operand.equipment) + Token(' -> ') + property
    case 'item-order':
    case 'item-quantity':
      return Command.parseItem(operand.item) + Token(' -> ') + property
    case 'trigger-speed':
    case 'trigger-angle':
      return Command.parseTrigger(operand.trigger) + Token(' -> ') + property
    case 'tilemap-width':
    case 'tilemap-height':
      return Command.parseTilemap(operand.tilemap) + Token(' -> ') + property
    case 'list-length':
      return Command.parseVariable(operand.variable, 'object') + Token(' -> ') + property
  }
}

// 解析元素属性
NumberOperand.parseElementProperty = function (operand) {
  const element = Command.parseElement(operand.element)
  const property = Local.get('command.setNumber.element.' + operand.property)
  return element + Token(' -> ') + property.replace('.', Token('.'))
}

// 解析其他数据
NumberOperand.parseOther = function (operand) {
  const label = Local.get('command.setNumber.other.' + operand.data)
  switch (operand.data) {
    case 'touch-screen-x':
    case 'touch-screen-y':
    case 'touch-ui-x':
    case 'touch-ui-y':
    case 'touch-scene-x':
    case 'touch-scene-y': {
      const index = label.indexOf('.')
      const head = index !== -1 ? label.slice(0, index) : label
      const end = index !== -1 ? label.slice(index + 1) : ''
      return head + Token('[') + Command.parseVariableNumber(operand.touchId) + Token(']') + Token('.') + end
    }
    case 'actor-count':
      return label + Token('(') + Command.parseTeam(operand.teamId) + Token(')')
    default:
      return label.replace('.', Token('.'))
  }
}

// 解析操作数
NumberOperand.parseOperand = function (operand) {
  switch (operand.type) {
    case 'constant':
      return Command.setNumberColor(operand.value.toString())
    case 'variable':
      return Command.parseVariable(operand.variable, 'number')
    case 'math':
      return this.parseMathMethod(operand)
    case 'string':
      return this.parseStringMethod(operand)
    case 'object':
      return this.parseObjectProperty(operand)
    case 'element':
      return this.parseElementProperty(operand)
    case 'list':
      return Command.parseListItem(operand.variable, operand.index)
    case 'parameter':
      return Command.parseParameter(operand.key)
    case 'script':
      return Command.setScriptColor(operand.script)
    case 'other':
      return this.parseOther(operand)
  }
}

// 解析项目
NumberOperand.parse = function (operand, data, index) {
  let operation
  let operator
  if (index === 0) {
    operation = $('#setNumber-operation').read()
    switch (operation) {
      case 'set': operator = '= '; break
      case 'add': operator = '+= '; break
      case 'sub': operator = '-= '; break
      case 'mul': operator = '*= '; break
      case 'div': operator = '/= '; break
      case 'mod': operator = '%= '; break
    }
  } else {
    operation = operand.operation
    switch (operation.replace('()', '')) {
      case 'add': operator = '+ '; break
      case 'sub': operator = '- '; break
      case 'mul': operator = '* '; break
      case 'div': operator = '/ '; break
      case 'mod': operator = '% '; break
    }
  }
  let operandName = Command.removeTextTags(this.parseOperand(operand))
  const currentPriority = operation.includes('()')
  const nextPriority = data[index + 1]?.operation.includes('()')
  if (!currentPriority && nextPriority) {
    operandName = '(' + operandName
  }
  if (currentPriority && !nextPriority) {
    operandName = operandName + ')'
  }
  return operator + operandName
}

// 打开数据
NumberOperand.open = function (operand = {
  operation: 'add',
  type: 'constant',
  value: 0,
}) {
  Window.open('setNumber-operand')

  // 切换操作选择框
  if (this.target.start === 0) {
    $('#setNumber-operation').save()
    $('#setNumber-operation').show()
    $('#setNumber-operation').getFocus()
    $('#setNumber-operand-operation').hide()
  } else {
    $('#setNumber-operation').hide()
    $('#setNumber-operand-operation').show()
    $('#setNumber-operand-operation').getFocus()
  }

  // 加载冷却键选项
  $('#setNumber-operand-cooldown-key').loadItems(
    Enum.getStringItems('cooldown-key')
  )

  // 写入数据
  const write = getElementWriter('setNumber-operand')
  let constantValue = 0
  let mathMethod = 'round'
  let mathDecimals = 0
  let mathMin = 0
  let mathMax = 1
  let mathStartPosition = {type: 'actor', actor: {type: 'trigger'}}
  let mathEndPosition = {type: 'actor', actor: {type: 'trigger'}}
  let stringMethod = 'length'
  let stringSearch = ''
  let commonVariable = {type: 'local', key: ''}
  let objectProperty = 'actor-x'
  let objectItemId = ''
  let objectEquipmentId = ''
  let elementProperty = 'element-x'
  let elementElement = {type: 'trigger'}
  let commonActor = {type: 'trigger'}
  let commonSkill = {type: 'trigger'}
  let commonState = {type: 'trigger'}
  let commonEquipment = {type: 'trigger'}
  let commonItem = {type: 'trigger'}
  let commonTrigger = {type: 'trigger'}
  let commonTilemap = {type: 'trigger'}
  let cooldownKey = Enum.getDefStringId('cooldown-key')
  let listIndex = 0
  let parameterKey = ''
  let script = ''
  let otherData = 'trigger-button'
  let otherTouchId = 0
  let otherTeamId = Data.teams.list[0].id
  switch (operand.type) {
    case 'constant':
      constantValue = operand.value
      break
    case 'variable':
      commonVariable = operand.variable
      break
    case 'math':
      mathMethod = operand.method
      commonVariable = operand.variable ?? commonVariable
      mathDecimals = operand.decimals ?? mathDecimals
      mathMin = operand.min ?? mathMin
      mathMax = operand.max ?? mathMax
      mathStartPosition = operand.start ?? mathStartPosition
      mathEndPosition = operand.end ?? mathEndPosition
      break
    case 'string':
      stringMethod = operand.method
      commonVariable = operand.variable
      stringSearch = operand.search ?? stringSearch
      break
    case 'object':
      objectProperty = operand.property
      objectItemId = operand.itemId ?? objectItemId
      objectEquipmentId = operand.equipmentId ?? objectEquipmentId
      commonActor = operand.actor ?? commonActor
      commonSkill = operand.skill ?? commonSkill
      commonState = operand.state ?? commonState
      commonEquipment = operand.equipment ?? commonEquipment
      commonItem = operand.item ?? commonItem
      commonTrigger = operand.trigger ?? commonTrigger
      commonTilemap = operand.tilemap ?? commonTilemap
      cooldownKey = operand.key ?? cooldownKey
      commonVariable = operand.variable ?? commonVariable
      break
    case 'element':
      elementProperty = operand.property
      elementElement = operand.element
      break
    case 'list':
      commonVariable = operand.variable
      listIndex = operand.index
      break
    case 'parameter':
      parameterKey = operand.key
      break
    case 'script':
      script = operand.script
      break
    case 'other':
      otherData = operand.data
      otherTouchId = operand.touchId ?? otherTouchId
      otherTeamId = operand.teamId ?? otherTeamId
      break
  }
  write('operation', operand.operation)
  write('type', operand.type)
  write('constant-value', constantValue)
  write('math-method', mathMethod)
  write('string-method', stringMethod)
  write('object-property', objectProperty)
  write('object-itemId', objectItemId)
  write('object-equipmentId', objectEquipmentId)
  write('element-property', elementProperty)
  write('element-element', elementElement)
  write('common-variable', commonVariable)
  write('common-actor', commonActor)
  write('common-skill', commonSkill)
  write('common-state', commonState)
  write('common-equipment', commonEquipment)
  write('common-item', commonItem)
  write('common-trigger', commonTrigger)
  write('common-tilemap', commonTilemap)
  write('string-search', stringSearch)
  write('math-decimals', mathDecimals)
  write('math-min', mathMin)
  write('math-max', mathMax)
  write('math-startPosition', mathStartPosition)
  write('math-endPosition', mathEndPosition)
  write('cooldown-key', cooldownKey)
  write('list-index', listIndex)
  write('parameter-key', parameterKey)
  write('script', script)
  write('other-data', otherData)
  write('other-touchId', otherTouchId)
  write('other-teamId', otherTeamId)
}

// 保存数据
NumberOperand.save = function () {
  const read = getElementReader('setNumber-operand')
  const operation = read('operation')
  const type = read('type')
  let operand
  switch (type) {
    case 'constant': {
      const value = read('constant-value')
      operand = {operation, type, value}
      break
    }
    case 'variable': {
      const variable = read('common-variable')
      if (VariableGetter.isNone(variable)) {
        return $('#setNumber-operand-common-variable').getFocus()
      }
      operand = {operation, type, variable}
      break
    }
    case 'math': {
      const method = read('math-method')
      switch (method) {
        case 'round': {
          const variable = read('common-variable')
          if (VariableGetter.isNone(variable)) {
            return $('#setNumber-operand-common-variable').getFocus()
          }
          const decimals = read('math-decimals')
          operand = {operation, type, method, variable, decimals}
          break
        }
        case 'floor':
        case 'ceil':
        case 'sqrt':
        case 'abs':
        case 'cos':
        case 'sin':
        case 'tan': {
          const variable = read('common-variable')
          if (VariableGetter.isNone(variable)) {
            return $('#setNumber-operand-common-variable').getFocus()
          }
          operand = {operation, type, method, variable}
          break
        }
        case 'random':
          operand = {operation, type, method}
          break
        case 'random-int': {
          const min = read('math-min')
          const max = read('math-max')
          operand = {operation, type, method, min, max}
          break
        }
        case 'distance':
        case 'distance-x':
        case 'distance-y':
        case 'relative-angle': {
          const start = read('math-startPosition')
          const end = read('math-endPosition')
          operand = {operation, type, method, start, end}
          break
        }
      }
      break
    }
    case 'string': {
      const method = read('string-method')
      const variable = read('common-variable')
      if (VariableGetter.isNone(variable)) {
        return $('#setNumber-operand-common-variable').getFocus()
      }
      switch (method) {
        case 'length':
        case 'parse':
          operand = {operation, type, method, variable}
          break
        case 'search': {
          const search = read('string-search')
          if (search === '') {
            return $('#setNumber-operand-string-search').getFocus()
          }
          operand = {operation, type, method, variable, search}
          break
        }
      }
      break
    }
    case 'object': {
      const property = read('object-property')
      switch (property) {
        case 'actor-x':
        case 'actor-y':
        case 'actor-ui-x':
        case 'actor-ui-y':
        case 'actor-screen-x':
        case 'actor-screen-y':
        case 'actor-angle':
        case 'actor-direction':
        case 'actor-movement-speed':
        case 'actor-collision-size':
        case 'actor-collision-weight':
        case 'actor-scaling-factor':
        case 'actor-inventory-money':
        case 'actor-inventory-used-space':
        case 'actor-inventory-version':
        case 'actor-skill-version':
        case 'actor-state-version':
        case 'actor-equipment-version':
        case 'actor-shortcut-version':
        case 'actor-animation-current-time':
        case 'actor-animation-duration':
        case 'actor-animation-progress': {
          const actor = read('common-actor')
          operand = {operation, type, property, actor}
          break
        }
        case 'actor-inventory-item-quantity': {
          const actor = read('common-actor')
          const itemId = read('object-itemId')
          if (itemId === '') {
            return $('#setNumber-operand-object-itemId').getFocus()
          }
          operand = {operation, type, property, actor, itemId}
          break
        }
        case 'actor-inventory-equipment-quantity': {
          const actor = read('common-actor')
          const equipmentId = read('object-equipmentId')
          if (equipmentId === '') {
            return $('#setNumber-operand-object-equipmentId').getFocus()
          }
          operand = {operation, type, property, actor, equipmentId}
          break
        }
        case 'actor-cooldown-time':
        case 'actor-cooldown-duration':
        case 'actor-cooldown-progress': {
          const actor = read('common-actor')
          const key = read('cooldown-key')
          if (key === '') {
            return $('#setNumber-operand-cooldown-key').getFocus()
          }
          operand = {operation, type, property, actor, key}
          break
        }
        case 'skill-cooldown-time':
        case 'skill-cooldown-duration':
        case 'skill-cooldown-progress': {
          const skill = read('common-skill')
          operand = {operation, type, property, skill}
          break
        }
        case 'state-current-time':
        case 'state-duration':
        case 'state-progress': {
          const state = read('common-state')
          operand = {operation, type, property, state}
          break
        }
        case 'equipment-order': {
          const equipment = read('common-equipment')
          operand = {operation, type, property, equipment}
          break
        }
        case 'item-order':
        case 'item-quantity': {
          const item = read('common-item')
          operand = {operation, type, property, item}
          break
        }
        case 'trigger-speed':
        case 'trigger-angle': {
          const trigger = read('common-trigger')
          operand = {operation, type, property, trigger}
          break
        }
        case 'tilemap-width':
        case 'tilemap-height': {
          const tilemap = read('common-tilemap')
          operand = {operation, type, property, tilemap}
          break
        }
        case 'list-length': {
          const variable = read('common-variable')
          if (VariableGetter.isNone(variable)) {
            return $('#setNumber-operand-common-variable').getFocus()
          }
          operand = {operation, type, property, variable}
          break
        }
      }
      break
    }
    case 'element': {
      const property = read('element-property')
      const element = read('element-element')
      operand = {operation, type, property, element}
      break
    }
    case 'list': {
      const variable = read('common-variable')
      const index = read('list-index')
      if (VariableGetter.isNone(variable)) {
        return $('#setNumber-operand-common-variable').getFocus()
      }
      operand = {operation, type, variable, index}
      break
    }
    case 'parameter': {
      const key = read('parameter-key')
      if (key === '') {
        return $('#setNumber-operand-parameter-key').getFocus()
      }
      operand = {operation, type, key}
      break
    }
    case 'script': {
      const script = read('script').trim()
      if (script === '') {
        return $('#setNumber-operand-script').getFocus()
      }
      operand = {operation, type, script}
      break
    }
    case 'other': {
      const data = read('other-data')
      switch (data) {
        case 'touch-screen-x':
        case 'touch-screen-y':
        case 'touch-ui-x':
        case 'touch-ui-y':
        case 'touch-scene-x':
        case 'touch-scene-y': {
          const touchId = read('other-touchId')
          operand = {operation, type, data, touchId}
          break
        }
        case 'actor-count': {
          const teamId = read('other-teamId')
          operand = {operation, type, data, teamId}
          break
        }
        default:
          operand = {operation, type, data}
          break
      }
      break
    }
  }
  $('#setNumber-operation').save()
  Window.close('setNumber-operand')
  return operand
}

// 确定按钮 - 鼠标点击事件
NumberOperand.confirm = function (event) {
  return NumberOperand.target.save()
}

// ******************************** 条件分支 - 分支窗口 ********************************

const IfBranch = {
  // properties
  target: null,
  commands: null,
  // methods
  initialize: null,
  parse: null,
  open: null,
  save: null,
  // events
  windowClosed: null,
  confirm: null,
}

// 初始化
IfBranch.initialize = function () {
  // 创建模式选项
  $('#if-branch-mode').loadItems([
    {name: 'Meet All', value: 'all'},
    {name: 'Meet Any', value: 'any'},
  ])

  // 侦听事件
  $('#if-branch').on('closed', this.windowClosed)
  $('#if-branch-confirm').on('click', this.confirm)
}

// 解析项目
IfBranch.parse = function (branch, listData) {
  const words = Command.words
  let joint
  switch (branch.mode) {
    case 'all': joint = Command.setOperatorColor(' && '); break
    case 'any': joint = Command.setOperatorColor(' || '); break
  }
  for (const condition of branch.conditions) {
    words.push(IfCondition.parse(condition))
  }
  let string = words.join(joint)
  if (listData) {
    string = Command.removeTextTags(string)
  }
  return string
}

// 打开数据
IfBranch.open = function (branch) {
  if (this.target.inserting) {
    IfCondition.target = this.target
    IfCondition.open()
  } else {
    Window.open('if-branch')
    $('#if-branch-mode').write(branch.mode)
    $('#if-branch-conditions').write(branch.conditions.slice())
    $('#if-branch-conditions').getFocus()
    this.commands = branch.commands
  }
}

// 保存数据
IfBranch.save = function () {
  if (this.target.inserting) {
    const condition = IfCondition.save()
    if (condition !== undefined) {
      const mode = 'all'
      const conditions = [condition]
      const commands = []
      return {mode, conditions, commands}
    }
  } else {
    const mode = $('#if-branch-mode').read()
    const element = $('#if-branch-conditions')
    const conditions = element.read()
    if (conditions.length === 0) {
      return element.getFocus()
    }
    const commands = this.commands
    Window.close('if-branch')
    return {mode, conditions, commands}
  }
}

// 窗口 - 已关闭事件
IfBranch.windowClosed = function (event) {
  IfBranch.commands = null
  $('#if-branch-conditions').clear()
}

// 确定按钮 - 鼠标点击事件
IfBranch.confirm = function (event) {
  return IfBranch.target.save()
}

// ******************************** 条件分支 - 条件窗口 ********************************

const IfCondition = {
  // properties
  type: 'condition',
  target: null,
  // methods
  initialize: null,
  parseBooleanOperation: null,
  parseBooleanOperand: null,
  parseNumberOperation: null,
  parseNumberOperand: null,
  parseStringOperation: null,
  parseStringOperand: null,
  parseObjectOperation: null,
  parseObjectOperand: null,
  parseActorOperation: null,
  parseElementOperation: null,
  parseKeyboardState: null,
  parseGamepadState: null,
  parseMouseButton: null,
  parseMouseState: null,
  parseListOperation: null,
  parseOther: null,
  parse: null,
  open: null,
  save: null,
  // events
  confirm: null,
}

// 初始化
IfCondition.initialize = function () {
  // 创建条件类型选项
  $('#if-condition-type').loadItems([
    {name: 'Boolean', value: 'boolean'},
    {name: 'Number', value: 'number'},
    {name: 'String', value: 'string'},
    {name: 'Object', value: 'object'},
    {name: 'Actor', value: 'actor'},
    {name: 'Element', value: 'element'},
    {name: 'Keyboard', value: 'keyboard'},
    {name: 'Gamepad', value: 'gamepad'},
    {name: 'Mouse', value: 'mouse'},
    {name: 'List', value: 'list'},
    {name: 'Other', value: 'other'},
  ])

  // 设置条件类型关联元素
  $('#if-condition-type').enableHiddenMode().relate([
    {case: 'boolean', targets: [
      $('#if-condition-common-variable'),
      $('#if-condition-boolean-operation'),
      $('#if-condition-boolean-operand-type'),
    ]},
    {case: 'number', targets: [
      $('#if-condition-common-variable'),
      $('#if-condition-number-operation'),
      $('#if-condition-number-operand-type'),
    ]},
    {case: 'string', targets: [
      $('#if-condition-common-variable'),
      $('#if-condition-string-operation'),
      $('#if-condition-string-operand-type'),
    ]},
    {case: 'object', targets: [
      $('#if-condition-common-variable'),
      $('#if-condition-object-operation'),
    ]},
    {case: 'actor', targets: [
      $('#if-condition-common-actor'),
      $('#if-condition-actor-operation'),
    ]},
    {case: 'element', targets: [
      $('#if-condition-common-element'),
      $('#if-condition-element-operation'),
    ]},
    {case: 'keyboard', targets: [
      $('#if-condition-keyboard-keycode'),
      $('#if-condition-keyboard-state'),
    ]},
    {case: 'gamepad', targets: [
      $('#if-condition-gamepad-button'),
      $('#if-condition-gamepad-state'),
    ]},
    {case: 'mouse', targets: [
      $('#if-condition-mouse-button'),
      $('#if-condition-mouse-state'),
    ]},
    {case: 'list', targets: [
      $('#if-condition-common-variable'),
      $('#if-condition-list-operation'),
      $('#if-condition-operand-variable'),
    ]},
    {case: 'other', targets: [
      $('#if-condition-other-key'),
    ]},
  ])

  // 设置类型写入事件，切换变量输入框的过滤器
  $('#if-condition-type').on('write', event => {
    let filter1 = 'all'
    let filter2 = 'all'
    switch (event.value) {
      case 'boolean':
        filter1 = filter2 = 'boolean'
        break
      case 'number':
        filter1 = filter2 = 'number'
        break
      case 'string':
        filter1 = filter2 = 'string'
        break
      case 'object':
        filter1 = filter2 = 'object'
        break
      case 'list':
        filter1 = 'object'
        filter2 = 'all'
        break
    }
    $('#if-condition-common-variable').filter = filter1
    $('#if-condition-operand-variable').filter = filter2
  })

  // 创建布尔值操作选项
  $('#if-condition-boolean-operation').loadItems([
    {name: '==', value: 'equal'},
    {name: '!=', value: 'unequal'},
  ])

  // 创建布尔值类型选项
  $('#if-condition-boolean-operand-type').loadItems([
    {name: 'None', value: 'none'},
    {name: 'Constant', value: 'constant'},
    {name: 'Variable', value: 'variable'},
  ])

  // 设置布尔值类型关联元素
  $('#if-condition-boolean-operand-type').enableHiddenMode().relate([
    {case: 'constant', targets: [
      $('#if-condition-boolean-constant-value'),
    ]},
    {case: 'variable', targets: [
      $('#if-condition-operand-variable'),
    ]},
  ])

  // 创建布尔值常量选项
  $('#if-condition-boolean-constant-value').loadItems([
    {name: 'False', value: false},
    {name: 'True', value: true},
  ])

  // 创建数值操作选项
  $('#if-condition-number-operation').loadItems([
    {name: '==', value: 'equal'},
    {name: '!=', value: 'unequal'},
    {name: '>=', value: 'greater-or-equal'},
    {name: '<=', value: 'less-or-equal'},
    {name: '>', value: 'greater'},
    {name: '<', value: 'less'},
  ])

  // 创建数值类型选项
  $('#if-condition-number-operand-type').loadItems([
    {name: 'None', value: 'none'},
    {name: 'Constant', value: 'constant'},
    {name: 'Variable', value: 'variable'},
  ])

  // 设置数值类型关联元素
  $('#if-condition-number-operand-type').enableHiddenMode().relate([
    {case: 'constant', targets: [
      $('#if-condition-number-constant-value'),
    ]},
    {case: 'variable', targets: [
      $('#if-condition-operand-variable'),
    ]},
  ])

  // 创建字符串操作选项
  $('#if-condition-string-operation').loadItems([
    {name: '==', value: 'equal'},
    {name: '!=', value: 'unequal'},
    {name: 'Include', value: 'include'},
    {name: 'Exclude', value: 'exclude'},
  ])

  // 创建字符串类型选项
  $('#if-condition-string-operand-type').loadItems([
    {name: 'None', value: 'none'},
    {name: 'Constant', value: 'constant'},
    {name: 'Variable', value: 'variable'},
    {name: 'Enumeration', value: 'enum'},
  ])

  // 设置字符串类型关联元素
  $('#if-condition-string-operand-type').enableHiddenMode().relate([
    {case: 'constant', targets: [
      $('#if-condition-string-constant-value'),
    ]},
    {case: 'variable', targets: [
      $('#if-condition-operand-variable'),
    ]},
    {case: 'enum', targets: [
      $('#if-condition-string-enum-stringId'),
    ]},
  ])

  // 创建对象操作选项
  $('#if-condition-object-operation').loadItems([
    {name: '==', value: 'equal'},
    {name: '!=', value: 'unequal'},
    {name: 'Is Actor', value: 'is-actor'},
    {name: 'Is Skill', value: 'is-skill'},
    {name: 'Is State', value: 'is-state'},
    {name: 'Is Equipment', value: 'is-equipment'},
    {name: 'Is Item', value: 'is-item'},
    {name: 'Is Trigger', value: 'is-trigger'},
    {name: 'Is Light', value: 'is-light'},
    {name: 'Is Element', value: 'is-element'},
  ])

  // 设置对象操作关联元素
  $('#if-condition-object-operation').enableHiddenMode().relate([
    {case: ['equal', 'unequal'], targets: [
      $('#if-condition-object-operand-type'),
    ]},
  ])

  // 创建对象类型选项
  $('#if-condition-object-operand-type').loadItems([
    {name: 'None', value: 'none'},
    {name: 'Actor', value: 'actor'},
    {name: 'Skill', value: 'skill'},
    {name: 'State', value: 'state'},
    {name: 'Equipment', value: 'equipment'},
    {name: 'Item', value: 'item'},
    {name: 'Trigger', value: 'trigger'},
    {name: 'Light', value: 'light'},
    {name: 'Element', value: 'element'},
    {name: 'Variable', value: 'variable'},
  ])

  // 设置类型关联元素
  $('#if-condition-object-operand-type').enableHiddenMode().relate([
    {case: 'actor', targets: [
      $('#if-condition-common-actor'),
    ]},
    {case: 'skill', targets: [
      $('#if-condition-common-skill'),
    ]},
    {case: 'state', targets: [
      $('#if-condition-common-state'),
    ]},
    {case: 'equipment', targets: [
      $('#if-condition-common-equipment'),
    ]},
    {case: 'item', targets: [
      $('#if-condition-common-item'),
    ]},
    {case: 'trigger', targets: [
      $('#if-condition-common-trigger'),
    ]},
    {case: 'light', targets: [
      $('#if-condition-common-light'),
    ]},
    {case: 'element', targets: [
      $('#if-condition-common-element'),
    ]},
    {case: 'variable', targets: [
      $('#if-condition-operand-variable'),
    ]},
  ])

  // 创建角色操作选项
  $('#if-condition-actor-operation').loadItems([
    {name: 'Present and Active', value: 'present-active'},
    {name: 'Present', value: 'present'},
    {name: 'Absent', value: 'absent'},
    {name: 'active', value: 'active'},
    {name: 'inactive', value: 'inactive'},
    {name: 'Has Targets', value: 'has-targets'},
    {name: 'Has No Targets', value: 'has-no-targets'},
    {name: 'In Screen', value: 'in-screen'},
    {name: 'Is Player Actor', value: 'is-player'},
    {name: 'Is Party Member', value: 'is-member'},
    {name: 'Has Skill', value: 'has-skill'},
    {name: 'Has State', value: 'has-state'},
    {name: 'Has Items', value: 'has-items'},
    {name: 'Has Equipments', value: 'has-equipments'},
    {name: 'Has Skill Shortcut', value: 'has-skill-shortcut'},
    {name: 'Has Item Shortcut', value: 'has-item-shortcut'},
    {name: 'Equipped', value: 'equipped'},
    {name: 'Is a Teammate of Actor ...', value: 'is-teammate'},
    {name: 'Is a Friend of Actor ...', value: 'is-friend'},
    {name: 'Is an Enemy of Actor ...', value: 'is-enemy'},
    {name: 'Is a Member of Team ...', value: 'is-team-member'},
    {name: 'Is a Friend of Team ...', value: 'is-team-friend'},
    {name: 'Is an Enemy of Team ...', value: 'is-team-enemy'},
  ])

  // 设置角色操作关联元素
  $('#if-condition-actor-operation').enableHiddenMode().relate([
    {case: 'has-skill', targets: [
      $('#if-condition-actor-skillId'),
    ]},
    {case: 'has-state', targets: [
      $('#if-condition-actor-stateId'),
    ]},
    {case: 'has-items', targets: [
      $('#if-condition-actor-itemId'),
      $('#if-condition-actor-quantity'),
    ]},
    {case: 'has-equipments', targets: [
      $('#if-condition-actor-equipmentId'),
      $('#if-condition-actor-quantity'),
    ]},
    {case: ['has-skill-shortcut', 'has-item-shortcut'], targets: [
      $('#if-condition-actor-shortcutKey'),
    ]},
    {case: 'equipped', targets: [
      $('#if-condition-actor-equipmentId'),
    ]},
    {case: ['is-teammate', 'is-friend', 'is-enemy'], targets: [
      $('#if-condition-actor-target'),
    ]},
    {case: ['is-team-member', 'is-team-friend', 'is-team-enemy'], targets: [
      $('#if-condition-actor-teamId'),
    ]},
  ])

  // 创建元素操作选项
  $('#if-condition-element-operation').loadItems([
    {name: 'Present', value: 'present'},
    {name: 'Absent', value: 'absent'},
    {name: 'Visible', value: 'visible'},
    {name: 'Invisible', value: 'invisible'},
    {name: 'Is Focus Element', value: 'is-focus'},
    {name: 'Dialog Box - is Paused', value: 'dialogbox-is-paused'},
    {name: 'Dialog Box - is Updating', value: 'dialogbox-is-updating'},
    {name: 'Dialog Box - is Waiting', value: 'dialogbox-is-waiting'},
    {name: 'Dialog Box - is Complete', value: 'dialogbox-is-complete'},
  ])

  // 创建键盘状态选项
  $('#if-condition-keyboard-state').loadItems([
    {name: 'Just Pressed', value: 'just-pressed'},
    {name: 'Just Released', value: 'just-released'},
    {name: 'Pressed', value: 'pressed'},
    {name: 'Released', value: 'released'},
  ])

  // 创建手柄状态选项
  $('#if-condition-gamepad-state').loadItems([
    {name: 'Just Pressed', value: 'just-pressed'},
    {name: 'Just Released', value: 'just-released'},
    {name: 'Pressed', value: 'pressed'},
    {name: 'Released', value: 'released'},
  ])

  // 创建鼠标按键选项
  $('#if-condition-mouse-button').loadItems([
    {name: 'Left Button', value: 0},
    {name: 'Middle Button', value: 1},
    {name: 'Right Button', value: 2},
    {name: 'Back Button', value: 3},
    {name: 'Forward Button', value: 4},
  ])

  // 创建鼠标状态选项
  $('#if-condition-mouse-state').loadItems([
    {name: 'Just Pressed', value: 'just-pressed'},
    {name: 'Just Released', value: 'just-released'},
    {name: 'Pressed', value: 'pressed'},
    {name: 'Released', value: 'released'},
  ])

  // 创建列表操作选项
  $('#if-condition-list-operation').loadItems([
    {name: 'Include', value: 'include'},
    {name: 'Exclude', value: 'exclude'},
  ])

  // 创建其他条件选项
  $('#if-condition-other-key').loadItems([
    {name: 'Mouse has entered the window', value: 'mouse-entered'},
    {name: 'Mouse has left the window', value: 'mouse-left'},
    {name: 'Game is paused', value: 'game-is-paused'},
    {name: 'Game is not paused', value: 'game-is-not-paused'},
    {name: 'Scene input is prevented', value: 'scene-input-is-prevented'},
    {name: 'Scene input is not prevented', value: 'scene-input-is-not-prevented'},
    {name: 'In debugging mode', value: 'status-debugging'},
    {name: 'In deployed mode', value: 'status-deployed'},
    {name: 'Running on Windows platform', value: 'platform-windows'},
    {name: 'Running on MacOS platform', value: 'platform-macos'},
    {name: 'Running on a mobile platform', value: 'platform-mobile'},
  ])

  // 创建队伍选项 - 窗口打开事件
  $('#if-condition').on('open', function (event) {
    $('#if-condition-actor-teamId').loadItems(
      Data.createTeamItems()
    )
  })

  // 清理内存 - 窗口已关闭事件
  $('#if-condition').on('closed', function (event) {
    $('#if-condition-actor-teamId').clear()
  })

  // 侦听事件
  $('#if-condition-confirm').on('click', this.confirm)
}

// 解析布尔值操作
IfCondition.parseBooleanOperation = function ({operation}) {
  const set = Command.setOperatorColor
  switch (operation) {
    case 'equal': return set('==')
    case 'unequal': return set('!=')
  }
}

// 解析布尔值操作数
IfCondition.parseBooleanOperand = function ({operand}) {
  switch (operand.type) {
    case 'none':
      return Token('null')
    case 'constant':
      return Command.setBooleanColor(operand.value.toString())
    case 'variable':
      return Command.parseVariable(operand.variable, 'boolean')
  }
}

// 解析数值操作
IfCondition.parseNumberOperation = function ({operation}) {
  const set = Command.setOperatorColor
  switch (operation) {
    case 'equal': return set('==')
    case 'unequal': return set('!=')
    case 'greater-or-equal': return set('>=')
    case 'less-or-equal': return set('<=')
    case 'greater': return set('>')
    case 'less': return set('<')
  }
}

// 解析数值操作数
IfCondition.parseNumberOperand = function ({operand}) {
  switch (operand.type) {
    case 'none':
      return Token('null')
    case 'constant':
      return Command.setNumberColor(operand.value.toString())
    case 'variable':
      return Command.parseVariable(operand.variable, 'number')
  }
}

// 解析字符串操作
IfCondition.parseStringOperation = function ({operation}) {
  const set = Command.setOperatorColor
  switch (operation) {
    case 'equal': return set('==')
    case 'unequal': return set('!=')
    default: return Local.get('command.if.string.' + operation)
  }
}

// 解析字符串操作数
IfCondition.parseStringOperand = function ({operand}) {
  switch (operand.type) {
    case 'none':
      return Token('null')
    case 'constant':
      return Command.setStringColor(`"${Command.parseMultiLineString(operand.value)}"`)
    case 'variable':
      return Command.parseVariable(operand.variable, 'string')
    case 'enum':
      return Command.parseEnumStringTag(operand.stringId)
  }
}

// 解析对象操作
IfCondition.parseObjectOperation = function ({operation}) {
  const set = Command.setOperatorColor
  switch (operation) {
    case 'equal': return set('==')
    case 'unequal': return set('!=')
    default: return Local.get('command.if.object.' + operation)
  }
}

// 解析对象操作数
IfCondition.parseObjectOperand = function ({operand}) {
  if (!operand) return ''
  switch (operand.type) {
    case 'none':
      return Token('null')
    case 'actor':
      return Command.parseActor(operand.actor)
    case 'skill':
      return Command.parseSkill(operand.skill)
    case 'state':
      return Command.parseState(operand.state)
    case 'equipment':
      return Command.parseEquipment(operand.equipment)
    case 'item':
      return Command.parseItem(operand.item)
    case 'trigger':
      return Command.parseTrigger(operand.trigger)
    case 'light':
      return Command.parseLight(operand.light)
    case 'element':
      return Command.parseElement(operand.element)
    case 'variable':
      return Command.parseVariable(operand.variable, 'object')
  }
}

// 解析角色操作
IfCondition.parseActorOperation = function ({operation, itemId, equipmentId, skillId, stateId, quantity, shortcutKey, target, teamId}) {
  const op = Local.get('command.if.actor.' + operation)
  switch (operation) {
    case 'has-skill':
      return `${op} ${Command.parseFileName(skillId)}`
    case 'has-state':
      return `${op} ${Command.parseFileName(stateId)}`
    case 'has-items': {
      const text = `${op} ${Command.parseFileName(itemId)}`
      return quantity === 1 ? text : `${text} x ${quantity}`
    }
    case 'has-equipments': {
      const text = `${op} ${Command.parseFileName(equipmentId)}`
      return quantity === 1 ? text : `${text} x ${quantity}`
    }
    case 'has-skill-shortcut':
    case 'has-item-shortcut':
      return `${op} <${Command.parseVariableEnum('shortcut-key', shortcutKey)}>`
    case 'equipped':
      return `${op} ${Command.parseFileName(equipmentId)}`
    case 'is-teammate':
    case 'is-friend':
    case 'is-enemy':
      return op.replace('<actor>', Command.parseActor(target))
    case 'is-team-member':
    case 'is-team-friend':
    case 'is-team-enemy':
      return op.replace('<team>', Command.parseTeam(teamId))
    default:
      return op
  }
}

// 解析元素操作
IfCondition.parseElementOperation = function ({operation}) {
  return Local.get('command.if.element.' + operation)
}

// 解析键盘按键状态
IfCondition.parseKeyboardState = function (state) {
  return Local.get('command.if.keyboard.' + state)
}

// 解析手柄按键状态
IfCondition.parseGamepadState = function (state) {
  return Local.get('command.if.gamepad.' + state)
}

// 解析鼠标按键
IfCondition.parseMouseButton = function (button) {
  return Local.get('command.if.mouse.button.' + button)
}

// 解析鼠标按键状态
IfCondition.parseMouseState = function (state) {
  return Local.get('command.if.mouse.' + state)
}

// 解析列表操作
IfCondition.parseListOperation = function ({operation}) {
  return Local.get('command.if.list.' + operation)
}

// 解析其他
IfCondition.parseOther = function ({key}) {
  return Local.get('command.if.other.' + key)
}

// 解析条件
IfCondition.parse = function (condition, listData) {
  let string
  switch (condition.type) {
    case 'boolean': {
      const variable = Command.parseVariable(condition.variable, 'boolean')
      const operator = this.parseBooleanOperation(condition)
      const value = this.parseBooleanOperand(condition)
      string = `${variable} ${operator} ${value}`
      break
    }
    case 'number': {
      const variable = Command.parseVariable(condition.variable, 'number')
      const operator = this.parseNumberOperation(condition)
      const value = this.parseNumberOperand(condition)
      string = `${variable} ${operator} ${value}`
      break
    }
    case 'string': {
      const variable = Command.parseVariable(condition.variable, 'string')
      const operator = this.parseStringOperation(condition)
      const value = this.parseStringOperand(condition)
      string = `${variable} ${operator} ${value}`
      break
    }
    case 'object': {
      const variable = Command.parseVariable(condition.variable, 'object')
      const operator = this.parseObjectOperation(condition)
      const value = this.parseObjectOperand(condition)
      // 如果value为空字符串，删除尾部空格
      string = `${variable} ${operator} ${value}`.trim()
      break
    }
    case 'actor': {
      const actor = Command.parseActor(condition.actor)
      const operation = this.parseActorOperation(condition)
      string = `${actor} ${operation}`
      break
    }
    case 'element': {
      const element = Command.parseElement(condition.element)
      const operation = this.parseElementOperation(condition)
      string = `${element} ${operation}`
      break
    }
    case 'keyboard': {
      const key = condition.keycode
      const keyboard = Local.get('command.if.keyboard')
      const state = this.parseKeyboardState(condition.state)
      string = keyboard + Token('[') + Command.setStringColor(key) + Token(']') + ' ' + state
      break
    }
    case 'gamepad': {
      const button = GamepadBox.getButtonName(condition.button)
      const gamepad = Local.get('command.if.gamepad')
      const state = this.parseGamepadState(condition.state)
      string = gamepad + Token('[') + Command.setStringColor(button) + Token(']') + ' ' + state
      break
    }
    case 'mouse': {
      const button = this.parseMouseButton(condition.button)
      const mouse = Local.get('command.if.mouse')
      const state = this.parseMouseState(condition.state)
      string = mouse + Token('[') + Command.setStringColor(button) + Token(']') + ' ' + state
      break
    }
    case 'list': {
      const list = Command.parseVariable(condition.list, 'object')
      const operation = this.parseListOperation(condition)
      const target = Command.parseVariable(condition.target, 'any')
      string = `${list} ${operation} ${target}`
      break
    }
    case 'other':
      string = this.parseOther(condition)
      break
  }
  if (listData) {
    string = Command.removeTextTags(string)
  }
  return string
}

// 打开数据
IfCondition.open = function (condition = {
  type: 'number',
  variable: {type: 'local', key: ''},
  operation: 'equal',
  operand: {type: 'constant', value: 0},
}) {
  // 加载快捷键选项
  $('#if-condition-actor-shortcutKey').loadItems(
    Enum.getStringItems('shortcut-key')
  )
  Window.open('if-condition')
  const write = getElementWriter('if-condition')
  const defaultVariable = {type: 'local', key: ''}
  let commonVariable = defaultVariable
  let booleanOperation = 'equal'
  let booleanOperandType = 'constant'
  let booleanConstantValue = true
  let numberOperation = 'equal'
  let numberOperandType = 'constant'
  let numberConstantValue = 0
  let stringOperation = 'equal'
  let stringOperandType = 'constant'
  let stringConstantValue = ''
  let stringEnumStringId = ''
  let objectOperation = 'equal'
  let objectOperandType = 'none'
  let operandVariable = defaultVariable
  let commonActor = {type: 'trigger'}
  let commonSkill = {type: 'trigger'}
  let commonState = {type: 'trigger'}
  let commonEquipment = {type: 'trigger'}
  let commonItem = {type: 'trigger'}
  let commonTrigger = {type: 'trigger'}
  let commonLight = {type: 'trigger'}
  let commonElement = {type: 'trigger'}
  let actorOperation = 'present-active'
  let actorSkillId = ''
  let actorStateId = ''
  let actorItemId = ''
  let actorEquipmentId = ''
  let actorQuantity = 1
  let actorShortcutKey = Enum.getDefStringId('shortcut-key')
  let actorTarget = {type: 'trigger'}
  let actorTeamId = Data.teams.list[0].id
  let elementOperation = 'present'
  let keyboardKeycode = ''
  let keyboardState = 'just-pressed'
  let gamepadButton = -1
  let gamepadState = 'just-pressed'
  let mouseButton = 0
  let mouseState = 'just-pressed'
  let listOperation = 'include'
  let otherKey = 'mouse-entered'
  switch (condition.type) {
    case 'boolean':
      commonVariable = condition.variable
      booleanOperation = condition.operation
      booleanOperandType = condition.operand.type
      booleanConstantValue = condition.operand.value ?? booleanConstantValue
      operandVariable = condition.operand.variable ?? operandVariable
      break
    case 'number':
      commonVariable = condition.variable
      numberOperation = condition.operation
      numberOperandType = condition.operand.type
      numberConstantValue = condition.operand.value ?? numberConstantValue
      operandVariable = condition.operand.variable ?? operandVariable
      break
    case 'string':
      commonVariable = condition.variable
      stringOperation = condition.operation
      stringOperandType = condition.operand.type
      stringConstantValue = condition.operand.value ?? stringConstantValue
      stringEnumStringId = condition.operand.stringId ?? stringEnumStringId
      operandVariable = condition.operand.variable ?? operandVariable
      break
    case 'object':
      commonVariable = condition.variable
      objectOperation = condition.operation
      objectOperandType = condition.operand?.type ?? objectOperandType
      operandVariable = condition.operand?.variable ?? operandVariable
      commonActor = condition.operand?.actor ?? commonActor
      commonSkill = condition.operand?.skill ?? commonSkill
      commonState = condition.operand?.state ?? commonState
      commonEquipment = condition.operand?.equipment ?? commonEquipment
      commonItem = condition.operand?.item ?? commonItem
      commonTrigger = condition.operand?.trigger ?? commonTrigger
      commonLight = condition.operand?.light ?? commonLight
      commonElement = condition.operand?.element ?? commonElement
      break
    case 'actor':
      commonActor = condition.actor
      actorOperation = condition.operation
      actorSkillId = condition.skillId ?? actorSkillId
      actorStateId = condition.stateId ?? actorStateId
      actorItemId = condition.itemId ?? actorItemId
      actorEquipmentId = condition.equipmentId ?? actorEquipmentId
      actorQuantity = condition.quantity ?? actorQuantity
      actorShortcutKey = condition.shortcutKey ?? actorShortcutKey
      actorTarget = condition.target ?? actorTarget
      actorTeamId = condition.teamId ?? actorTeamId
      break
    case 'element':
      commonElement = condition.element
      elementOperation = condition.operation
      break
    case 'keyboard':
      keyboardKeycode = condition.keycode
      keyboardState = condition.state
      break
    case 'gamepad':
      gamepadButton = condition.button
      gamepadState = condition.state
      break
    case 'mouse':
      mouseButton = condition.button
      mouseState = condition.state
      break
    case 'list':
      commonVariable = condition.list
      listOperation = condition.operation
      operandVariable = condition.target
      break
    case 'other':
      otherKey = condition.key
      break
  }
  write('type', condition.type)
  write('common-variable', commonVariable)
  write('boolean-operation', booleanOperation)
  write('boolean-operand-type', booleanOperandType)
  write('boolean-constant-value', booleanConstantValue)
  write('number-operation', numberOperation)
  write('number-operand-type', numberOperandType)
  write('number-constant-value', numberConstantValue)
  write('string-operation', stringOperation)
  write('string-operand-type', stringOperandType)
  write('string-constant-value', stringConstantValue)
  write('string-enum-stringId', stringEnumStringId)
  write('object-operation', objectOperation)
  write('object-operand-type', objectOperandType)
  write('list-operation', listOperation)
  write('operand-variable', operandVariable)
  write('actor-operation', actorOperation)
  write('common-actor', commonActor)
  write('common-skill', commonSkill)
  write('common-state', commonState)
  write('common-equipment', commonEquipment)
  write('common-item', commonItem)
  write('common-trigger', commonTrigger)
  write('common-light', commonLight)
  write('common-element', commonElement)
  write('actor-skillId', actorSkillId)
  write('actor-stateId', actorStateId)
  write('actor-itemId', actorItemId)
  write('actor-equipmentId', actorEquipmentId)
  write('actor-quantity', actorQuantity)
  write('actor-shortcutKey', actorShortcutKey)
  write('actor-target', actorTarget)
  write('actor-teamId', actorTeamId)
  write('element-operation', elementOperation)
  write('keyboard-keycode', keyboardKeycode)
  write('keyboard-state', keyboardState)
  write('gamepad-button', gamepadButton)
  write('gamepad-state', gamepadState)
  write('mouse-button', mouseButton)
  write('mouse-state', mouseState)
  write('other-key', otherKey)
  $('#if-condition-type').getFocus()
}

// 保存数据
IfCondition.save = function () {
  const read = getElementReader('if-condition')
  const type = read('type')
  let condition
  switch (type) {
    case 'boolean': {
      const variable = read('common-variable')
      if (VariableGetter.isNone(variable)) {
        return $('#if-condition-common-variable').getFocus()
      }
      const operation = read('boolean-operation')
      let operand
      switch (read('boolean-operand-type')) {
        case 'none':
          operand = {
            type: 'none',
          }
          break
        case 'constant':
          operand = {
            type: 'constant',
            value: read('boolean-constant-value'),
          }
          break
        case 'variable':
          operand = {
            type: 'variable',
            variable: read('operand-variable'),
          }
          if (VariableGetter.isNone(operand.variable)) {
            return $('#if-condition-operand-variable').getFocus()
          }
          break
      }
      condition = {type, variable, operation, operand}
      break
    }
    case 'number': {
      const variable = read('common-variable')
      if (VariableGetter.isNone(variable)) {
        return $('#if-condition-common-variable').getFocus()
      }
      const operation = read('number-operation')
      let operand
      switch (read('number-operand-type')) {
        case 'none':
          operand = {
            type: 'none',
          }
          break
        case 'constant':
          operand = {
            type: 'constant',
            value: read('number-constant-value'),
          }
          break
        case 'variable':
          operand = {
            type: 'variable',
            variable: read('operand-variable'),
          }
          if (VariableGetter.isNone(operand.variable)) {
            return $('#if-condition-operand-variable').getFocus()
          }
          break
      }
      condition = {type, variable, operation, operand}
      break
    }
    case 'string': {
      const variable = read('common-variable')
      if (VariableGetter.isNone(variable)) {
        return $('#if-condition-common-variable').getFocus()
      }
      const operation = read('string-operation')
      let operand
      switch (read('string-operand-type')) {
        case 'none':
          operand = {
            type: 'none',
          }
          break
        case 'constant':
          operand = {
            type: 'constant',
            value: read('string-constant-value'),
          }
          break
        case 'variable':
          operand = {
            type: 'variable',
            variable: read('operand-variable'),
          }
          if (VariableGetter.isNone(operand.variable)) {
            return $('#if-condition-operand-variable').getFocus()
          }
          break
        case 'enum':
          operand = {
            type: 'enum',
            stringId: read('string-enum-stringId'),
          }
          if (operand.stringId === '') {
            return $('#if-condition-string-enum-stringId').getFocus()
          }
          break
      }
      condition = {type, variable, operation, operand}
      break
    }
    case 'object': {
      const variable = read('common-variable')
      if (VariableGetter.isNone(variable)) {
        return $('#if-condition-common-variable').getFocus()
      }
      const operation = read('object-operation')
      switch (operation) {
        case 'equal':
        case 'unequal': {
          let operand
          switch (read('object-operand-type')) {
            case 'none':
              operand = {
                type: 'none',
              }
              break
            case 'actor':
              operand = {
                type: 'actor',
                actor: read('common-actor'),
              }
              break
            case 'skill':
              operand = {
                type: 'skill',
                skill: read('common-skill'),
              }
              break
            case 'state':
              operand = {
                type: 'state',
                state: read('common-state'),
              }
              break
            case 'equipment':
              operand = {
                type: 'equipment',
                equipment: read('common-equipment'),
              }
              break
            case 'item':
              operand = {
                type: 'item',
                item: read('common-item'),
              }
              break
            case 'trigger':
              operand = {
                type: 'trigger',
                trigger: read('common-trigger'),
              }
              break
            case 'light':
              operand = {
                type: 'light',
                light: read('common-light'),
              }
              break
            case 'element':
              operand = {
                type: 'element',
                element: read('common-element'),
              }
              break
            case 'variable':
              operand = {
                type: 'variable',
                variable: read('operand-variable'),
              }
              if (VariableGetter.isNone(operand.variable)) {
                return $('#if-condition-operand-variable').getFocus()
              }
              break
          }
          condition = {type, variable, operation, operand}
          break
        }
        default:
          condition = {type, variable, operation}
          break
      }
      break
    }
    case 'actor': {
      const actor = read('common-actor')
      const operation = read('actor-operation')
      switch (operation) {
        case 'has-skill': {
          const skillId = read('actor-skillId')
          if (skillId === '') {
            return $('#if-condition-actor-skillId').getFocus()
          }
          condition = {type, actor, operation, skillId}
          break
        }
        case 'has-state': {
          const stateId = read('actor-stateId')
          if (stateId === '') {
            return $('#if-condition-actor-stateId').getFocus()
          }
          condition = {type, actor, operation, stateId}
          break
        }
        case 'has-items': {
          const itemId = read('actor-itemId')
          if (itemId === '') {
            return $('#if-condition-actor-itemId').getFocus()
          }
          const quantity = read('actor-quantity')
          condition = {type, actor, operation, itemId, quantity}
          break
        }
        case 'has-equipments': {
          const equipmentId = read('actor-equipmentId')
          if (equipmentId === '') {
            return $('#if-condition-actor-equipmentId').getFocus()
          }
          const quantity = read('actor-quantity')
          condition = {type, actor, operation, equipmentId, quantity}
          break
        }
        case 'has-skill-shortcut':
        case 'has-item-shortcut': {
          const shortcutKey = read('actor-shortcutKey')
          if (shortcutKey === '') {
            return $('#if-condition-actor-shortcutKey').getFocus()
          }
          condition = {type, actor, operation, shortcutKey}
          break
        }
        case 'equipped': {
          const equipmentId = read('actor-equipmentId')
          if (equipmentId === '') {
            return $('#if-condition-actor-equipmentId').getFocus()
          }
          condition = {type, actor, operation, equipmentId}
          break
        }
        case 'is-teammate':
        case 'is-friend':
        case 'is-enemy': {
          const target = read('actor-target')
          condition = {type, actor, operation, target}
          break
        }
        case 'is-team-member':
        case 'is-team-friend':
        case 'is-team-enemy': {
          const teamId = read('actor-teamId')
          condition = {type, actor, operation, teamId}
          break
        }
        default:
          condition = {type, actor, operation}
          break
      }
      break
    }
    case 'element': {
      const element = read('common-element')
      const operation = read('element-operation')
      condition = {type, element, operation}
      break
    }
    case 'keyboard': {
      const keycode = read('keyboard-keycode')
      const state = read('keyboard-state')
      if (keycode === '') {
        return $('#if-condition-keyboard-keycode').getFocus()
      }
      condition = {type, keycode, state}
      break
    }
    case 'gamepad': {
      const button = read('gamepad-button')
      const state = read('gamepad-state')
      if (button === -1) {
        return $('#if-condition-gamepad-button').getFocus()
      }
      condition = {type, button, state}
      break
    }
    case 'mouse': {
      const button = read('mouse-button')
      const state = read('mouse-state')
      condition = {type, button, state}
      break
    }
    case 'list': {
      const list = read('common-variable')
      if (VariableGetter.isNone(list)) {
        return $('#if-condition-common-variable').getFocus()
      }
      const operation = read('list-operation')
      const target = read('operand-variable')
      if (VariableGetter.isNone(target)) {
        return $('#if-condition-operand-variable').getFocus()
      }
      condition = {type, list, operation, target}
      break
    }
    case 'other': {
      const key = read('other-key')
      condition = {type, key}
      break
    }
  }
  Window.close('if-condition')
  return condition
}

// 确定按钮 - 鼠标点击事件
IfCondition.confirm = function (event) {
  return IfCondition.target.save()
}

// ******************************** 匹配 - 分支窗口 ********************************

const SwitchBranch = {
  // properties
  target: null,
  commands: null,
  // methods
  initialize: null,
  parse: null,
  open: null,
  save: null,
  // events
  windowClosed: null,
  confirm: null,
}

// 初始化
SwitchBranch.initialize = function () {
  // 侦听事件
  $('#switch-branch').on('closed', this.windowClosed)
  $('#switch-branch-confirm').on('click', this.confirm)
}

// 解析项目
SwitchBranch.parse = function (branch, listData) {
  const words = Command.words
  for (const condition of branch.conditions) {
    words.push(SwitchCondition.parse(condition))
  }
  let string = words.join()
  if (listData) {
    string = Command.removeTextTags(string)
  }
  return string
}

// 打开数据
SwitchBranch.open = function (branch) {
  if (this.target.inserting) {
    SwitchCondition.target = this.target
    SwitchCondition.open()
  } else {
    Window.open('switch-branch')
    $('#switch-branch-conditions').write(branch.conditions.slice())
    $('#switch-branch-conditions').getFocus()
    this.commands = branch.commands
  }
}
// 保存数据
SwitchBranch.save = function () {
  if (this.target.inserting) {
    const condition = SwitchCondition.save()
    if (condition !== undefined) {
      const conditions = [condition]
      const commands = []
      return {conditions, commands}
    }
  } else {
    const element = $('#switch-branch-conditions')
    const conditions = element.read()
    if (conditions.length === 0) {
      return element.getFocus()
    }
    const commands = this.commands
    Window.close('switch-branch')
    return {conditions, commands}
  }
}

// 窗口 - 已关闭事件
SwitchBranch.windowClosed = function (event) {
  SwitchBranch.commands = null
  $('#switch-branch-conditions').clear()
}

// 确定按钮 - 鼠标点击事件
SwitchBranch.confirm = function (event) {
  return SwitchBranch.target.save()
}

// ******************************** 匹配 - 条件窗口 ********************************

const SwitchCondition = {
  // properties
  target: null,
  // methods
  initialize: null,
  parse: null,
  open: null,
  save: null,
  // events
  confirm: null,
}

// 初始化
SwitchCondition.initialize = function () {
  // 创建条件类型选项
  $('#switch-condition-type').loadItems([
    {name: 'None', value: 'none'},
    {name: 'Boolean', value: 'boolean'},
    {name: 'Number', value: 'number'},
    {name: 'String', value: 'string'},
    {name: 'Attribute Key', value: 'attribute'},
    {name: 'Enum String', value: 'enum'},
    {name: 'Keyboard', value: 'keyboard'},
    {name: 'Gamepad', value: 'gamepad'},
    {name: 'Mouse', value: 'mouse'},
    {name: 'Variable', value: 'variable'},
  ])

  // 设置条件类型关联元素
  $('#switch-condition-type').enableHiddenMode().relate([
    {case: 'boolean', targets: [
      $('#switch-condition-boolean-value'),
    ]},
    {case: 'number', targets: [
      $('#switch-condition-number-value'),
    ]},
    {case: 'string', targets: [
      $('#switch-condition-string-value'),
    ]},
    {case: 'attribute', targets: [
      $('#switch-condition-attribute-attributeId'),
    ]},
    {case: 'enum', targets: [
      $('#switch-condition-enum-stringId'),
    ]},
    {case: 'keyboard', targets: [
      $('#switch-condition-keyboard-keycode'),
    ]},
    {case: 'gamepad', targets: [
      $('#switch-condition-gamepad-button'),
    ]},
    {case: 'mouse', targets: [
      $('#switch-condition-mouse-button'),
    ]},
    {case: 'variable', targets: [
      $('#switch-condition-variable-variable'),
    ]},
  ])

  // 创建布尔值常量选项
  $('#switch-condition-boolean-value').loadItems([
    {name: 'False', value: false},
    {name: 'True', value: true},
  ])

  // 创建鼠标按键选项
  $('#switch-condition-mouse-button').loadItems([
    {name: 'Left Button', value: 0},
    {name: 'Middle Button', value: 1},
    {name: 'Right Button', value: 2},
    {name: 'Back Button', value: 3},
    {name: 'Forward Button', value: 4},
  ])

  // 侦听事件
  $('#switch-condition-confirm').on('click', this.confirm)
}

// 解析条件
SwitchCondition.parse = function (condition, listData) {
  let string
  switch (condition.type) {
    case 'none':
      string = Token('null')
      break
    case 'boolean':
      string = Command.setBooleanColor(condition.value.toString())
      break
    case 'number':
      string = Command.setNumberColor(condition.value.toString())
      break
    case 'string':
      string = Command.setStringColor(`"${Command.parseMultiLineString(condition.value)}"`)
      break
    case 'attribute':
      string = Command.parseAttributeTag(condition.attributeId, 'string')
      break
    case 'enum':
      string = Command.parseEnumStringTag(condition.stringId)
      break
    case 'keyboard': {
      const key = condition.keycode
      const keyboard = Local.get('command.switch.keyboard')
      string = keyboard + Token('[') + Command.setStringColor(key) + Token(']')
      break
    }
    case 'gamepad': {
      const button = GamepadBox.getButtonName(condition.button)
      const gamepad = Local.get('command.switch.gamepad')
      string = gamepad + Token('[') + Command.setStringColor(button) + Token(']')
      break
    }
    case 'mouse': {
      const button = IfCondition.parseMouseButton(condition.button)
      const mouse = Local.get('command.switch.mouse')
      string = mouse + Token('[') + Command.setStringColor(button) + Token(']')
      break
    }
    case 'variable':
      string = Command.parseVariable(condition.variable, 'any')
      break
  }
  if (listData) {
    string = Command.removeTextTags(string)
  }
  return string
}

// 打开数据
SwitchCondition.open = function (condition = {type: 'number', value: 0}) {
  Window.open('switch-condition')
  let booleanValue = false
  let numberValue = 0
  let stringValue = ''
  let attributeId = ''
  let enumStringId = ''
  let keyboardKeycode = ''
  let gamepadButton = -1
  let mouseButton = 0
  let variableVariable = {type: 'local', key: ''}
  const write = getElementWriter('switch-condition')
  switch (condition.type) {
    case 'none':
      break
    case 'boolean':
      booleanValue = condition.value
      break
    case 'number':
      numberValue = condition.value
      break
    case 'string':
      stringValue = condition.value
      break
    case 'attribute':
      attributeId = condition.attributeId
      break
    case 'enum':
      enumStringId = condition.stringId
      break
    case 'keyboard':
      keyboardKeycode = condition.keycode
      break
    case 'gamepad':
      gamepadButton = condition.button
      break
    case 'mouse':
      mouseButton = condition.button
      break
    case 'variable':
      variableVariable = condition.variable
      break
  }
  write('type', condition.type)
  write('boolean-value', booleanValue)
  write('number-value', numberValue)
  write('string-value', stringValue)
  write('attribute-attributeId', attributeId)
  write('enum-stringId', enumStringId)
  write('keyboard-keycode', keyboardKeycode)
  write('gamepad-button', gamepadButton)
  write('mouse-button', mouseButton)
  write('variable-variable', variableVariable)
  $('#switch-condition-type').getFocus()
}

// 保存数据
SwitchCondition.save = function () {
  const read = getElementReader('switch-condition')
  const type = read('type')
  let condition
  switch (type) {
    case 'none':
      condition = {type}
      break
    case 'boolean': {
      const value = read('boolean-value')
      condition = {type, value}
      break
    }
    case 'number': {
      const value = read('number-value')
      condition = {type, value}
      break
    }
    case 'string': {
      const value = read('string-value')
      condition = {type, value}
      break
    }
    case 'attribute': {
      const attributeId = read('attribute-attributeId')
      if (attributeId === '') {
        return $('#switch-condition-attribute-attributeId').getFocus()
      }
      condition = {type, attributeId}
      break
    }
    case 'enum': {
      const stringId = read('enum-stringId')
      if (stringId === '') {
        return $('#switch-condition-enum-stringId').getFocus()
      }
      condition = {type, stringId}
      break
    }
    case 'keyboard': {
      const keycode = read('keyboard-keycode')
      if (keycode === '') {
        return $('#switch-condition-keyboard-keycode').getFocus()
      }
      condition = {type, keycode}
      break
    }
    case 'gamepad': {
      const button = read('gamepad-button')
      if (button === -1) {
        return $('#switch-condition-gamepad-button').getFocus()
      }
      condition = {type, button}
      break
    }
    case 'mouse': {
      const button = read('mouse-button')
      condition = {type, button}
      break
    }
    case 'variable': {
      const variable = read('variable-variable')
      if (VariableGetter.isNone(variable)) {
        return $('#switch-condition-variable-variable').getFocus()
      }
      condition = {type, variable}
      break
    }
  }
  Window.close('switch-condition')
  return condition
}

// 确定按钮 - 鼠标点击事件
SwitchCondition.confirm = function (event) {
  return SwitchCondition.target.save()
}

// ******************************** 设置图像 - 属性窗口 ********************************

const ImageProperty = {
  // properties
  target: null,
  // methods
  initialize: null,
  parse: null,
  open: null,
  save: null,
  // events
  confirm: null,
}

// 初始化
ImageProperty.initialize = function () {
  // 创建属性选项
  $('#setImage-property-key').loadItems([
    {name: 'Image', value: 'image'},
    {name: 'Display', value: 'display'},
    {name: 'Flip', value: 'flip'},
    {name: 'Blend', value: 'blend'},
    {name: 'Shift X', value: 'shiftX'},
    {name: 'Shift Y', value: 'shiftY'},
    {name: 'Clip X', value: 'clip-0'},
    {name: 'Clip Y', value: 'clip-1'},
    {name: 'Clip Width', value: 'clip-2'},
    {name: 'Clip Height', value: 'clip-3'},
  ])

  // 设置属性关联元素
  $('#setImage-property-key').enableHiddenMode().relate([
    {case: 'image', targets: [
      $('#setImage-property-image'),
    ]},
    {case: 'display', targets: [
      $('#setImage-property-display'),
    ]},
    {case: 'flip', targets: [
      $('#setImage-property-flip'),
    ]},
    {case: 'blend', targets: [
      $('#setImage-property-blend'),
    ]},
    {case: 'shiftX', targets: [
      $('#setImage-property-shiftX'),
    ]},
    {case: 'shiftY', targets: [
      $('#setImage-property-shiftY'),
    ]},
    {case: 'clip-0', targets: [
      $('#setImage-property-clip-0'),
    ]},
    {case: 'clip-1', targets: [
      $('#setImage-property-clip-1'),
    ]},
    {case: 'clip-2', targets: [
      $('#setImage-property-clip-2'),
    ]},
    {case: 'clip-3', targets: [
      $('#setImage-property-clip-3'),
    ]},
  ])

  // 创建显示选项
  $('#setImage-property-display').loadItems($('#uiImage-display').dataItems)

  // 创建翻转选项
  $('#setImage-property-flip').loadItems($('#uiImage-flip').dataItems)

  // 创建混合模式选项
  $('#setImage-property-blend').loadItems($('#uiImage-blend').dataItems)

  // 侦听事件
  $('#setImage-property-confirm').on('click', this.confirm)
}

// 解析属性
ImageProperty.parse = function ({key, value}, listData) {
  let string
  const get = Local.createGetter('command.setImage')
  const name = get(key).replace('.', Token('.'))
  switch (key) {
    case 'image':
      string = name + Token('(') + Command.parseFileName(value) + Token(')')
      break
    case 'display':
      string = name + Token('(') + get('display.' + value) + Token(')')
      break
    case 'flip':
      string = name + Token('(') + get('flip.' + value) + Token(')')
      break
    case 'blend':
      string = name + Token('(') + Command.parseBlend(value) + Token(')')
      break
    case 'shiftX':
    case 'shiftY':
    case 'clip-0':
    case 'clip-1':
    case 'clip-2':
    case 'clip-3':
      string = name + Token('(') + Command.parseVariableNumber(value) + Token(')')
      break
  }
  if (listData) {
    string = Command.removeTextTags(string)
  }
  return string
}

// 打开数据
ImageProperty.open = function ({key = 'image', value = ''} = {}) {
  Window.open('setImage-property')
  const write = getElementWriter('setImage-property')
  let image = ''
  let display = 'stretch'
  let flip = 'none'
  let blend = 'normal'
  let shiftX = 0
  let shiftY = 0
  let clipX = 0
  let clipY = 0
  let clipWidth = 0
  let clipHeight = 0
  switch (key) {
    case 'image':
      image = value
      break
    case 'display':
      display = value
      break
    case 'flip':
      flip = value
      break
    case 'blend':
      blend = value
      break
    case 'shiftX':
      shiftX = value
      break
    case 'shiftY':
      shiftY = value
      break
    case 'clip-0':
      clipX = value
      break
    case 'clip-1':
      clipY = value
      break
    case 'clip-2':
      clipWidth = value
      break
    case 'clip-3':
      clipHeight = value
      break
  }
  write('key', key)
  write('image', image)
  write('display', display)
  write('flip', flip)
  write('blend', blend)
  write('shiftX', shiftX)
  write('shiftY', shiftY)
  write('clip-0', clipX)
  write('clip-1', clipY)
  write('clip-2', clipWidth)
  write('clip-3', clipHeight)
  $('#setImage-property-key').getFocus()
}

// 保存数据
ImageProperty.save = function () {
  const read = getElementReader('setImage-property')
  const key = read('key')
  let value
  switch (key) {
    case 'image':
      value = read('image')
      break
    case 'display':
      value = read('display')
      break
    case 'flip':
      value = read('flip')
      break
    case 'blend':
      value = read('blend')
      break
    case 'shiftX':
      value = read('shiftX')
      break
    case 'shiftY':
      value = read('shiftY')
      break
    case 'clip-0':
      value = read('clip-0')
      break
    case 'clip-1':
      value = read('clip-1')
      break
    case 'clip-2':
      value = read('clip-2')
      break
    case 'clip-3':
      value = read('clip-3')
      break
  }
  Window.close('setImage-property')
  return {key, value}
}

// 确定按钮 - 鼠标点击事件
ImageProperty.confirm = function (event) {
  return ImageProperty.target.save()
}

// ******************************** 设置文本 - 属性窗口 ********************************

const TextProperty = {
  // properties
  target: null,
  // methods
  initialize: null,
  parse: null,
  open: null,
  save: null,
  // events
  confirm: null,
}

// 初始化
TextProperty.initialize = function () {
  // 创建属性选项
  $('#setText-property-key').loadItems([
    {name: 'Content', value: 'content'},
    {name: 'Size', value: 'size'},
    {name: 'Line Spacing', value: 'lineSpacing'},
    {name: 'Letter Spacing', value: 'letterSpacing'},
    {name: 'Color', value: 'color'},
    {name: 'Font', value: 'font'},
    {name: 'Effect', value: 'effect'},
    {name: 'Blend', value: 'blend'},
  ])

  // 设置属性关联元素
  $('#setText-property-key').enableHiddenMode().relate([
    {case: 'content', targets: [
      $('#setText-property-content'),
    ]},
    {case: 'size', targets: [
      $('#setText-property-size'),
    ]},
    {case: 'lineSpacing', targets: [
      $('#setText-property-lineSpacing'),
    ]},
    {case: 'letterSpacing', targets: [
      $('#setText-property-letterSpacing'),
    ]},
    {case: 'color', targets: [
      $('#setText-property-color'),
    ]},
    {case: 'font', targets: [
      $('#setText-property-font'),
    ]},
    {case: 'effect', targets: [
      $('#setText-property-effect-type'),
    ]},
    {case: 'blend', targets: [
      $('#setText-property-blend'),
    ]},
  ])

  // 设置效果类型关联元素
  $('#setText-property-effect-type').enableHiddenMode().relate([
    {case: 'shadow', targets: [
      $('#setText-property-effect-shadowOffsetX'),
      $('#setText-property-effect-shadowOffsetY'),
      $('#setText-property-effect-color'),
    ]},
    {case: 'stroke', targets: [
      $('#setText-property-effect-strokeWidth'),
      $('#setText-property-effect-color'),
    ]},
    {case: 'outline', targets: [
      $('#setText-property-effect-color'),
    ]},
  ])

  // 创建文字效果选项
  $('#setText-property-effect-type').loadItems($('#uiText-effect-type').dataItems)

  // 创建混合模式选项
  $('#setText-property-blend').loadItems($('#uiText-blend').dataItems)

  // 侦听事件
  $('#setText-property-confirm').on('click', this.confirm)
}

// 解析属性
TextProperty.parse = function ({key, value}, listData) {
  let string
  const get = Local.createGetter('command.setText')
  const name = get(key)
  switch (key) {
    case 'content':
      string = name + Token('(') + Command.parseVariableTemplate(value) + Token(')')
      break
    case 'size':
    case 'lineSpacing':
    case 'letterSpacing':
      string = name + Token('(') + Command.setNumberColor(value) + Token(')')
      break
    case 'color':
      string = name + Token('(') + Command.parseHexColor(Color.simplifyHexColor(value)) + Token(')')
      break
    case 'font':
      string = name + Token('(') + (value ? Command.setStringColor(value) : get('font.default')) + Token(')')
      break
    case 'effect':
      switch (value.type) {
        case 'none':
          string = name + Token('(') + get('effect.none') + Token(')')
          break
        case 'shadow': {
          const x = Command.setNumberColor(value.shadowOffsetX)
          const y = Command.setNumberColor(value.shadowOffsetY)
          const color = Command.parseHexColor(Color.simplifyHexColor(value.color))
          string = name + Token('(') + get('effect.shadow') + Token(', ') + x + Token(', ') + y + Token(', ') + color + Token(')')
          break
        }
        case 'stroke': {
          const width = Command.setNumberColor(value.strokeWidth)
          const color = Command.parseHexColor(Color.simplifyHexColor(value.color))
          string = name + Token('(') + get('effect.stroke') + Token(', ') + width + Token(', ') + color + Token(')')
          break
        }
        case 'outline': {
          const color = Command.parseHexColor(Color.simplifyHexColor(value.color))
          string = name + Token('(') + get('effect.outline') + Token(', ') + color + Token(')')
          break
        }
      }
      break
    case 'blend':
      string = name + Token('(') + Command.parseBlend(value) + Token(')')
      break
  }
  if (listData) {
    string = Command.removeTextTags(string)
  }
  return string
}

// 打开数据
TextProperty.open = function ({key = 'content', value = ''} = {}) {
  Window.open('setText-property')
  const write = getElementWriter('setText-property')
  let content = ''
  let size = 16
  let lineSpacing = 0
  let letterSpacing = 0
  let color = 'ffffffff'
  let font = ''
  let effectType = 'none'
  let effectShadowOffsetX = 1
  let effectShadowOffsetY = 1
  let effectStrokeWidth = 1
  let effectColor = '000000ff'
  let blend = 'normal'
  switch (key) {
    case 'content':
      content = value
      break
    case 'size':
      size = value
      break
    case 'lineSpacing':
      lineSpacing = value
      break
    case 'letterSpacing':
      letterSpacing = value
      break
    case 'color':
      color = value
      break
    case 'font':
      font = value
      break
    case 'effect':
      effectType = value.type
      effectShadowOffsetX = value.shadowOffsetX ?? effectShadowOffsetX
      effectShadowOffsetY = value.shadowOffsetY ?? effectShadowOffsetY
      effectStrokeWidth = value.strokeWidth ?? effectStrokeWidth
      effectColor = value.color ?? effectColor
      break
    case 'blend':
      blend = value
      break
  }
  write('key', key)
  write('content', content)
  write('size', size)
  write('lineSpacing', lineSpacing)
  write('letterSpacing', letterSpacing)
  write('color', color)
  write('font', font)
  write('effect-type', effectType)
  write('effect-shadowOffsetX', effectShadowOffsetX)
  write('effect-shadowOffsetY', effectShadowOffsetY)
  write('effect-strokeWidth', effectStrokeWidth)
  write('effect-color', effectColor)
  write('blend', blend)
  $('#setText-property-key').getFocus()
}

// 保存数据
TextProperty.save = function () {
  const read = getElementReader('setText-property')
  const key = read('key')
  let value
  switch (key) {
    case 'content':
      value = read('content')
      break
    case 'size':
      value = read('size')
      break
    case 'lineSpacing':
      value = read('lineSpacing')
      break
    case 'letterSpacing':
      value = read('letterSpacing')
      break
    case 'color':
      value = read('color')
      break
    case 'font':
      value = read('font')
      break
    case 'effect':
      switch (read('effect-type')) {
        case 'none':
          value = {
            type: 'none',
          }
          break
        case 'shadow':
          value = {
            type: 'shadow',
            shadowOffsetX: read('effect-shadowOffsetX'),
            shadowOffsetY: read('effect-shadowOffsetY'),
            color: read('effect-color'),
          }
          break
        case 'stroke':
          value = {
            type: 'stroke',
            strokeWidth: read('effect-strokeWidth'),
            color: read('effect-color'),
          }
          break
        case 'outline':
          value = {
            type: 'outline',
            color: read('effect-color'),
          }
          break
      }
      break
    case 'blend':
      value = read('blend')
      break
  }
  Window.close('setText-property')
  return {key, value}
}

// 确定按钮 - 鼠标点击事件
TextProperty.confirm = function (event) {
  return TextProperty.target.save()
}

// ******************************** 设置文本框 - 属性窗口 ********************************

const TextBoxProperty = {
  // properties
  target: null,
  // methods
  initialize: null,
  parse: null,
  open: null,
  save: null,
  // events
  confirm: null,
}

// 初始化
TextBoxProperty.initialize = function () {
  // 创建属性选项
  $('#setTextBox-property-key').loadItems([
    {name: 'Type', value: 'type'},
    {name: 'Text', value: 'text'},
    {name: 'Number', value: 'number'},
    {name: 'Min', value: 'min'},
    {name: 'Max', value: 'max'},
    {name: 'Decimal Places', value: 'decimals'},
    {name: 'Color', value: 'color'},
  ])

  // 设置属性关联元素
  $('#setTextBox-property-key').enableHiddenMode().relate([
    {case: 'type', targets: [
      $('#setTextBox-property-type'),
    ]},
    {case: 'text', targets: [
      $('#setTextBox-property-text'),
    ]},
    {case: 'number', targets: [
      $('#setTextBox-property-number'),
    ]},
    {case: 'min', targets: [
      $('#setTextBox-property-min'),
    ]},
    {case: 'max', targets: [
      $('#setTextBox-property-max'),
    ]},
    {case: 'decimals', targets: [
      $('#setTextBox-property-decimals'),
    ]},
    {case: 'color', targets: [
      $('#setTextBox-property-color'),
    ]},
  ])

  // 创建类型选项
  $('#setTextBox-property-type').loadItems($('#uiTextBox-type').dataItems)

  // 侦听事件
  $('#setTextBox-property-confirm').on('click', this.confirm)
}

// 解析属性
TextBoxProperty.parse = function ({key, value}, listData) {
  let string
  const get = Local.createGetter('command.setTextBox')
  const name = get(key)
  switch (key) {
    case 'type':
      string = name + Token('(') + get('type.' + value) + Token(')')
      break
    case 'text': {
      let text = value
      if (typeof text === 'string' && text.length > 80) {
        text = text.slice(0, 80) + '...'
      }
      string = name + Token('(') + Command.parseVariableString(text) + Token(')')
      break
    }
    case 'number':
    case 'min':
    case 'max':
      string = name + Token('(') + Command.parseVariableNumber(value) + Token(')')
      break
    case 'decimals':
      string = name + Token('(') + Command.setNumberColor(value) + Token(')')
      break
    case 'color': {
      const color = Command.parseHexColor(Color.simplifyHexColor(value))
      string = name + Token('(') + color + Token(')')
      break
    }
  }
  if (listData) {
    string = Command.removeTextTags(string)
  }
  return string
}

// 打开数据
TextBoxProperty.open = function ({key = 'type', value = 'text'} = {}) {
  Window.open('setTextBox-property')
  const write = getElementWriter('setTextBox-property')
  let type = 'text'
  let text = ''
  let number = 0
  let min = 0
  let max = 0
  let decimals = 0
  let color = 'ffffffff'
  switch (key) {
    case 'type':
      type = value
      break
    case 'text':
      text = value
      break
    case 'number':
      number = value
      break
    case 'min':
      min = value
      break
    case 'max':
      max = value
      break
    case 'decimals':
      decimals = value
      break
    case 'color':
      color = value
      break
  }
  write('key', key)
  write('type', type)
  write('text', text)
  write('number', number)
  write('min', min)
  write('max', max)
  write('decimals', decimals)
  write('color', color)
  $('#setTextBox-property-key').getFocus()
}

// 保存数据
TextBoxProperty.save = function () {
  const read = getElementReader('setTextBox-property')
  const key = read('key')
  let value
  switch (key) {
    case 'type':
      value = read('type')
      break
    case 'text':
      value = read('text')
      break
    case 'number':
      value = read('number')
      break
    case 'min':
      value = read('min')
      break
    case 'max':
      value = read('max')
      break
    case 'decimals':
      value = read('decimals')
      break
    case 'color':
      value = read('color')
      break
  }
  Window.close('setTextBox-property')
  return {key, value}
}

// 确定按钮 - 鼠标点击事件
TextBoxProperty.confirm = function (event) {
  return TextBoxProperty.target.save()
}

// ******************************** 设置对话框 - 属性窗口 ********************************

const DialogBoxProperty = {
  // properties
  target: null,
  // methods
  initialize: null,
  parse: null,
  open: null,
  save: null,
  // events
  confirm: null,
}

// 初始化
DialogBoxProperty.initialize = function () {
  // 创建属性选项
  $('#setDialogBox-property-key').loadItems([
    {name: 'Content', value: 'content'},
    {name: 'Print Interval', value: 'interval'},
    {name: 'Size', value: 'size'},
    {name: 'Line Spacing', value: 'lineSpacing'},
    {name: 'Letter Spacing', value: 'letterSpacing'},
    {name: 'Color', value: 'color'},
    {name: 'Font', value: 'font'},
    {name: 'Effect', value: 'effect'},
    {name: 'Blend', value: 'blend'},
  ])

  // 设置属性关联元素
  $('#setDialogBox-property-key').enableHiddenMode().relate([
    {case: 'content', targets: [
      $('#setDialogBox-property-content'),
    ]},
    {case: 'interval', targets: [
      $('#setDialogBox-property-interval'),
    ]},
    {case: 'size', targets: [
      $('#setDialogBox-property-size'),
    ]},
    {case: 'lineSpacing', targets: [
      $('#setDialogBox-property-lineSpacing'),
    ]},
    {case: 'letterSpacing', targets: [
      $('#setDialogBox-property-letterSpacing'),
    ]},
    {case: 'color', targets: [
      $('#setDialogBox-property-color'),
    ]},
    {case: 'font', targets: [
      $('#setDialogBox-property-font'),
    ]},
    {case: 'effect', targets: [
      $('#setDialogBox-property-effect-type'),
    ]},
    {case: 'blend', targets: [
      $('#setDialogBox-property-blend'),
    ]},
  ])

  // 设置效果类型关联元素
  $('#setDialogBox-property-effect-type').enableHiddenMode().relate([
    {case: 'shadow', targets: [
      $('#setDialogBox-property-effect-shadowOffsetX'),
      $('#setDialogBox-property-effect-shadowOffsetY'),
      $('#setDialogBox-property-effect-color'),
    ]},
    {case: 'stroke', targets: [
      $('#setDialogBox-property-effect-strokeWidth'),
      $('#setDialogBox-property-effect-color'),
    ]},
    {case: 'outline', targets: [
      $('#setDialogBox-property-effect-color'),
    ]},
  ])

  // 创建文字效果选项
  $('#setDialogBox-property-effect-type').loadItems($('#uiDialogBox-effect-type').dataItems)

  // 创建混合模式选项
  $('#setDialogBox-property-blend').loadItems($('#uiDialogBox-blend').dataItems)

  // 侦听事件
  $('#setDialogBox-property-confirm').on('click', this.confirm)
}

// 解析属性
DialogBoxProperty.parse = function ({key, value}, listData) {
  let string
  const get = Local.createGetter('command.setDialogBox')
  const name = get(key)
  switch (key) {
    case 'content':
      string = name + Token('(') + Command.parseVariableTemplate(value) + Token(')')
      break
    case 'interval':
    case 'size':
    case 'lineSpacing':
    case 'letterSpacing':
      string = name + Token('(') + Command.setNumberColor(value) + Token(')')
      break
    case 'color':
      string = name + Token('(') + Command.parseHexColor(Color.simplifyHexColor(value)) + Token(')')
      break
    case 'font':
      string = name + Token('(') + (value ? Command.setStringColor(value) : get('font.default')) + Token(')')
      break
    case 'effect':
      switch (value.type) {
        case 'none':
          string = name + Token('(') + get('effect.none') + Token(')')
          break
        case 'shadow': {
          const x = Command.setNumberColor(value.shadowOffsetX)
          const y = Command.setNumberColor(value.shadowOffsetY)
          const color = Command.parseHexColor(Color.simplifyHexColor(value.color))
          string = name + Token('(') + get('effect.shadow') + Token(', ') + x + Token(', ') + y + Token(', ') + color + Token(')')
          break
        }
        case 'stroke': {
          const width = Command.setNumberColor(value.strokeWidth)
          const color = Command.parseHexColor(Color.simplifyHexColor(value.color))
          string = name + Token('(') + get('effect.stroke') + Token(', ') + width + Token(', ') + color + Token(')')
          break
        }
        case 'outline': {
          const color = Command.parseHexColor(Color.simplifyHexColor(value.color))
          string = name + Token('(') + get('effect.outline') + Token(', ') + color + Token(')')
          break
        }
      }
      break
    case 'blend':
      string = name + Token('(') + Command.parseBlend(value) + Token(')')
      break
  }
  if (listData) {
    string = Command.removeTextTags(string)
  }
  return string
}

// 打开数据
DialogBoxProperty.open = function ({key = 'content', value = ''} = {}) {
  Window.open('setDialogBox-property')
  const write = getElementWriter('setDialogBox-property')
  let content = ''
  let interval = 0
  let size = 16
  let lineSpacing = 0
  let letterSpacing = 0
  let color = 'ffffffff'
  let font = ''
  let effectType = 'none'
  let effectShadowOffsetX = 1
  let effectShadowOffsetY = 1
  let effectStrokeWidth = 1
  let effectColor = '000000ff'
  let blend = 'normal'
  switch (key) {
    case 'content':
      content = value
      break
    case 'interval':
      interval = value
      break
    case 'size':
      size = value
      break
    case 'lineSpacing':
      lineSpacing = value
      break
    case 'letterSpacing':
      letterSpacing = value
      break
    case 'color':
      color = value
      break
    case 'font':
      font = value
      break
    case 'effect':
      effectType = value.type
      effectShadowOffsetX = value.shadowOffsetX ?? effectShadowOffsetX
      effectShadowOffsetY = value.shadowOffsetY ?? effectShadowOffsetY
      effectStrokeWidth = value.strokeWidth ?? effectStrokeWidth
      effectColor = value.color ?? effectColor
      break
    case 'blend':
      blend = value
      break
  }
  write('key', key)
  write('content', content)
  write('interval', interval)
  write('size', size)
  write('lineSpacing', lineSpacing)
  write('letterSpacing', letterSpacing)
  write('color', color)
  write('font', font)
  write('effect-type', effectType)
  write('effect-shadowOffsetX', effectShadowOffsetX)
  write('effect-shadowOffsetY', effectShadowOffsetY)
  write('effect-strokeWidth', effectStrokeWidth)
  write('effect-color', effectColor)
  write('blend', blend)
  $('#setDialogBox-property-key').getFocus()
}

// 保存数据
DialogBoxProperty.save = function () {
  const read = getElementReader('setDialogBox-property')
  const key = read('key')
  let value
  switch (key) {
    case 'content':
      value = read('content')
      break
    case 'interval':
      value = read('interval')
      break
    case 'size':
      value = read('size')
      break
    case 'lineSpacing':
      value = read('lineSpacing')
      break
    case 'letterSpacing':
      value = read('letterSpacing')
      break
    case 'color':
      value = read('color')
      break
    case 'font':
      value = read('font')
      break
    case 'effect':
      switch (read('effect-type')) {
        case 'none':
          value = {
            type: 'none',
          }
          break
        case 'shadow':
          value = {
            type: 'shadow',
            shadowOffsetX: read('effect-shadowOffsetX'),
            shadowOffsetY: read('effect-shadowOffsetY'),
            color: read('effect-color'),
          }
          break
        case 'stroke':
          value = {
            type: 'stroke',
            strokeWidth: read('effect-strokeWidth'),
            color: read('effect-color'),
          }
          break
        case 'outline':
          value = {
            type: 'outline',
            color: read('effect-color'),
          }
          break
      }
      break
    case 'blend':
      value = read('blend')
      break
  }
  Window.close('setDialogBox-property')
  return {key, value}
}

// 确定按钮 - 鼠标点击事件
DialogBoxProperty.confirm = function (event) {
  return DialogBoxProperty.target.save()
}

// ******************************** 设置进度条 - 属性窗口 ********************************

const ProgressBarProperty = {
  // properties
  target: null,
  // methods
  initialize: null,
  parse: null,
  open: null,
  save: null,
  // events
  confirm: null,
}

// 初始化
ProgressBarProperty.initialize = function () {
  // 创建属性选项
  $('#setProgressBar-property-key').loadItems([
    {name: 'Image', value: 'image'},
    {name: 'Display', value: 'display'},
    {name: 'Blend', value: 'blend'},
    {name: 'Progress', value: 'progress'},
    {name: 'Clip X', value: 'clip-0'},
    {name: 'Clip Y', value: 'clip-1'},
    {name: 'Clip Width', value: 'clip-2'},
    {name: 'Clip Height', value: 'clip-3'},
    {name: 'Color Red', value: 'color-0'},
    {name: 'Color Green', value: 'color-1'},
    {name: 'Color Blue', value: 'color-2'},
    {name: 'Color Alpha', value: 'color-3'},
  ])

  // 设置属性关联元素
  $('#setProgressBar-property-key').enableHiddenMode().relate([
    {case: 'image', targets: [
      $('#setProgressBar-property-image'),
    ]},
    {case: 'display', targets: [
      $('#setProgressBar-property-display'),
    ]},
    {case: 'blend', targets: [
      $('#setProgressBar-property-blend'),
    ]},
    {case: 'progress', targets: [
      $('#setProgressBar-property-progress'),
    ]},
    {case: 'clip-0', targets: [
      $('#setProgressBar-property-clip-0'),
    ]},
    {case: 'clip-1', targets: [
      $('#setProgressBar-property-clip-1'),
    ]},
    {case: 'clip-2', targets: [
      $('#setProgressBar-property-clip-2'),
    ]},
    {case: 'clip-3', targets: [
      $('#setProgressBar-property-clip-3'),
    ]},
    {case: 'color-0', targets: [
      $('#setProgressBar-property-color-0'),
    ]},
    {case: 'color-1', targets: [
      $('#setProgressBar-property-color-1'),
    ]},
    {case: 'color-2', targets: [
      $('#setProgressBar-property-color-2'),
    ]},
    {case: 'color-3', targets: [
      $('#setProgressBar-property-color-3'),
    ]},
  ])

  // 创建显示选项
  $('#setProgressBar-property-display').loadItems($('#uiProgressBar-display').dataItems)

  // 创建混合模式选项
  $('#setProgressBar-property-blend').loadItems($('#uiProgressBar-blend').dataItems)

  // 侦听事件
  $('#setProgressBar-property-confirm').on('click', this.confirm)
}

// 解析属性
ProgressBarProperty.parse = function ({key, value}, listData) {
  let string
  const get = Local.createGetter('command.setProgressBar')
  const name = get(key).replace('.', Token('.'))
  switch (key) {
    case 'image':
      string = name + Token('(') + Command.parseFileName(value) + Token(')')
      break
    case 'display':
      string = name + Token('(') + get('display.' + value) + Token(')')
      break
    case 'blend':
      string = name + Token('(') + Command.parseBlend(value) + Token(')')
      break
    case 'progress':
    case 'clip-0':
    case 'clip-1':
    case 'clip-2':
    case 'clip-3':
    case 'color-0':
    case 'color-1':
    case 'color-2':
    case 'color-3':
      string = name + Token('(') + Command.parseVariableNumber(value) + Token(')')
      break
  }
  if (listData) {
    string = Command.removeTextTags(string)
  }
  return string
}

// 打开数据
ProgressBarProperty.open = function ({key = 'image', value = ''} = {}) {
  Window.open('setProgressBar-property')
  const write = getElementWriter('setProgressBar-property')
  let image = ''
  let display = 'stretch'
  let blend = 'normal'
  let progress = 0
  let clipX = 0
  let clipY = 0
  let clipWidth = 0
  let clipHeight = 0
  let colorRed = 0
  let colorGreen = 0
  let colorBlue = 0
  let colorAlpha = 0
  switch (key) {
    case 'image':
      image = value
      break
    case 'display':
      display = value
      break
    case 'blend':
      blend = value
      break
    case 'progress':
      progress = value
      break
    case 'clip-0':
      clipX = value
      break
    case 'clip-1':
      clipY = value
      break
    case 'clip-2':
      clipWidth = value
      break
    case 'clip-3':
      clipHeight = value
      break
    case 'color-0':
      colorRed = value
      break
    case 'color-1':
      colorGreen = value
      break
    case 'color-2':
      colorBlue = value
      break
    case 'color-3':
      colorAlpha = value
      break
  }
  write('key', key)
  write('image', image)
  write('display', display)
  write('blend', blend)
  write('progress', progress)
  write('clip-0', clipX)
  write('clip-1', clipY)
  write('clip-2', clipWidth)
  write('clip-3', clipHeight)
  write('color-0', colorRed)
  write('color-1', colorGreen)
  write('color-2', colorBlue)
  write('color-3', colorAlpha)
  $('#setProgressBar-property-key').getFocus()
}

// 保存数据
ProgressBarProperty.save = function () {
  const read = getElementReader('setProgressBar-property')
  const key = read('key')
  let value
  switch (key) {
    case 'image':
      value = read('image')
      break
    case 'display':
      value = read('display')
      break
    case 'blend':
      value = read('blend')
      break
    case 'progress':
      value = read('progress')
      break
    case 'clip-0':
      value = read('clip-0')
      break
    case 'clip-1':
      value = read('clip-1')
      break
    case 'clip-2':
      value = read('clip-2')
      break
    case 'clip-3':
      value = read('clip-3')
      break
    case 'color-0':
      value = read('color-0')
      break
    case 'color-1':
      value = read('color-1')
      break
    case 'color-2':
      value = read('color-2')
      break
    case 'color-3':
      value = read('color-3')
      break
  }
  Window.close('setProgressBar-property')
  return {key, value}
}

// 确定按钮 - 鼠标点击事件
ProgressBarProperty.confirm = function (event) {
  return ProgressBarProperty.target.save()
}

// ******************************** 设置按钮 - 属性窗口 ********************************

const ButtonProperty = {
  // properties
  target: null,
  // methods
  initialize: null,
  parse: null,
  open: null,
  save: null,
  // events
  confirm: null,
}

// 初始化
ButtonProperty.initialize = function () {
  // 创建属性选项
  $('#setButton-property-key').loadItems([
    {name: 'Normal Image', value: 'normalImage'},
    {name: 'Hover Image', value: 'hoverImage'},
    {name: 'Active Image', value: 'activeImage'},
    {name: 'Normal Clip', value: 'normalClip'},
    {name: 'Hover Clip', value: 'hoverClip'},
    {name: 'Active Clip', value: 'activeClip'},
    {name: 'Normal Tint', value: 'normalTint'},
    {name: 'Hover Tint', value: 'hoverTint'},
    {name: 'Active Tint', value: 'activeTint'},
    {name: 'Image Opacity', value: 'imageOpacity'},
    {name: 'Content', value: 'content'},
    {name: 'Size', value: 'size'},
    {name: 'Letter Spacing', value: 'letterSpacing'},
  ])

  // 设置属性关联元素
  $('#setButton-property-key').enableHiddenMode().relate([
    {case: ['normalImage', 'hoverImage', 'activeImage'], targets: [
      $('#setButton-property-image'),
    ]},
    {case: ['normalClip', 'hoverClip', 'activeClip'], targets: [
      $('#setButton-property-clip-box'),
    ]},
    {case: ['normalTint', 'hoverTint', 'activeTint'], targets: [
      $('#setButton-property-tint-box'),
    ]},
    {case: 'imageOpacity', targets: [
      $('#setButton-property-imageOpacity'),
    ]},
    {case: 'content', targets: [
      $('#setButton-property-content'),
    ]},
    {case: 'size', targets: [
      $('#setButton-property-size'),
    ]},
    {case: 'letterSpacing', targets: [
      $('#setButton-property-letterSpacing'),
    ]},
  ])

  // 侦听事件
  $('#setButton-property-confirm').on('click', this.confirm)
}

// 解析属性
ButtonProperty.parse = function ({key, value}, listData) {
  let string
  const get = Local.createGetter('command.setButton')
  const name = get(key)
  switch (key) {
    case 'normalImage':
    case 'hoverImage':
    case 'activeImage':
      string = name + Token('(') + Command.parseFileName(value) + Token(')')
      break
    case 'normalClip':
    case 'hoverClip':
    case 'activeClip':
    case 'normalTint':
    case 'hoverTint':
    case 'activeTint': {
      const params = [
        Command.setNumberColor(value[0]),
        Command.setNumberColor(value[1]),
        Command.setNumberColor(value[2]),
        Command.setNumberColor(value[3]),
      ]
      string = name + Token('(') + params.join(Token(', ')) + Token(')')
      break
    }
    case 'content':
      string = name + Token('(') + Command.parseVariableTemplate(value) + Token(')')
      break
    case 'imageOpacity':
    case 'size':
    case 'letterSpacing':
      string = name + Token('(') + Command.setNumberColor(value) + Token(')')
      break
  }
  if (listData) {
    string = Command.removeTextTags(string)
  }
  return string
}

// 打开数据
ButtonProperty.open = function ({key = 'normalImage', value = ''} = {}) {
  Window.open('setButton-property')
  const write = getElementWriter('setButton-property')
  let image = ''
  let clip = [0, 0, 0, 0]
  let tint = [0, 0, 0, 0]
  let imageOpacity = 1
  let content = ''
  let size = 16
  let letterSpacing = 0
  switch (key) {
    case 'normalImage':
    case 'hoverImage':
    case 'activeImage':
      image = value
      break
    case 'normalClip':
    case 'hoverClip':
    case 'activeClip':
      clip = value
      break
    case 'normalTint':
    case 'hoverTint':
    case 'activeTint':
      tint = value
      break
    case 'imageOpacity':
      imageOpacity = value
      break
    case 'content':
      content = value
      break
    case 'size':
      size = value
      break
    case 'letterSpacing':
      letterSpacing = value
      break
  }
  write('key', key)
  write('image', image)
  write('clip-0', clip[0])
  write('clip-1', clip[1])
  write('clip-2', clip[2])
  write('clip-3', clip[3])
  write('tint-0', tint[0])
  write('tint-1', tint[1])
  write('tint-2', tint[2])
  write('tint-3', tint[3])
  write('imageOpacity', imageOpacity)
  write('content', content)
  write('size', size)
  write('letterSpacing', letterSpacing)
  $('#setButton-property-key').getFocus()
}

// 保存数据
ButtonProperty.save = function () {
  const read = getElementReader('setButton-property')
  const key = read('key')
  let value
  switch (key) {
    case 'normalImage':
    case 'hoverImage':
    case 'activeImage':
      value = read('image')
      break
    case 'normalClip':
    case 'hoverClip':
    case 'activeClip':
      value = [read('clip-0'), read('clip-1'), read('clip-2'), read('clip-3')]
      break
    case 'normalTint':
    case 'hoverTint':
    case 'activeTint':
      value = [read('tint-0'), read('tint-1'), read('tint-2'), read('tint-3')]
      break
    case 'imageOpacity':
      value = read('imageOpacity')
      break
    case 'content':
      value = read('content')
      break
    case 'size':
      value = read('size')
      break
    case 'letterSpacing':
      value = read('letterSpacing')
      break
  }
  Window.close('setButton-property')
  return {key, value}
}

// 确定按钮 - 鼠标点击事件
ButtonProperty.confirm = function (event) {
  return ButtonProperty.target.save()
}

// ******************************** 设置动画 - 属性窗口 ********************************

const AnimationProperty = {
  // properties
  target: null,
  // methods
  initialize: null,
  parse: null,
  open: null,
  save: null,
  // events
  confirm: null,
}

// 初始化
AnimationProperty.initialize = function () {
  // 创建属性选项
  $('#setAnimation-property-key').loadItems([
    {name: 'Animation', value: 'animation'},
    {name: 'Animation(from actor)', value: 'animation-from-actor'},
    {name: 'Motion', value: 'motion'},
    {name: 'Angle', value: 'angle'},
    {name: 'Frame', value: 'frame'},
  ])

  // 设置属性关联元素
  $('#setAnimation-property-key').enableHiddenMode().relate([
    {case: 'animation', targets: [
      $('#setAnimation-property-animation'),
    ]},
    {case: 'animation-from-actor', targets: [
      $('#setAnimation-property-actor'),
    ]},
    {case: 'motion', targets: [
      $('#setAnimation-property-motion'),
    ]},
    {case: 'angle', targets: [
      $('#setAnimation-property-angle'),
    ]},
    {case: 'frame', targets: [
      $('#setAnimation-property-frame'),
    ]},
  ])

  // 侦听事件
  $('#setAnimation-property-confirm').on('click', this.confirm)
}

// 解析属性
AnimationProperty.parse = function ({key, value}, listData) {
  let string
  const get = Local.createGetter('command.setAnimation')
  const name = get(key)
  switch (key) {
    case 'animation':
      string = name + Token('(') + Command.parseFileName(value) + Token(')')
      break
    case 'animation-from-actor':
      string = name + Token('(') + Command.parseActor(value) + Token(')')
      break
    case 'motion':
      string = name + Token('(') + Command.parseEnumString(value) + Token(')')
      break
    case 'angle':
    case 'frame':
      string = name + Token('(') + Command.parseVariableNumber(value) + Token(')')
      break
  }
  if (listData) {
    string = Command.removeTextTags(string)
  }
  return string
}

// 打开数据
AnimationProperty.open = function ({key = 'animation', value = ''} = {}) {
  Window.open('setAnimation-property')
  const write = getElementWriter('setAnimation-property')
  let animation = ''
  let actor = {type: 'trigger'}
  let motion = ''
  let angle = 0
  let frame = 0
  switch (key) {
    case 'animation':
      animation = value
      break
    case 'animation-from-actor':
      actor = value
      break
    case 'motion':
      motion = value
      break
    case 'angle':
      angle = value
      break
    case 'frame':
      frame = value
      break
  }
  write('key', key)
  write('animation', animation)
  write('actor', actor)
  write('motion', motion)
  write('angle', angle)
  write('frame', frame)
  $('#setAnimation-property-key').getFocus()
}

// 保存数据
AnimationProperty.save = function () {
  const read = getElementReader('setAnimation-property')
  const key = read('key')
  let value
  switch (key) {
    case 'animation':
      value = read('animation')
      break
    case 'animation-from-actor':
      value = read('actor')
      break
    case 'motion':
      value = read('motion')
      break
    case 'angle':
      value = read('angle')
      break
    case 'frame':
      value = read('frame')
      break
  }
  Window.close('setAnimation-property')
  return {key, value}
}

// 确定按钮 - 鼠标点击事件
AnimationProperty.confirm = function (event) {
  return AnimationProperty.target.save()
}

// ******************************** 设置视频 - 属性窗口 ********************************

const VideoProperty = {
  // properties
  target: null,
  // methods
  initialize: null,
  parse: null,
  open: null,
  save: null,
  // events
  confirm: null,
}

// 初始化
VideoProperty.initialize = function () {
  // 创建属性选项
  $('#setVideo-property-key').loadItems([
    {name: 'Video', value: 'video'},
    {name: 'Playback Rate', value: 'playbackRate'},
    {name: 'Loop', value: 'loop'},
    {name: 'Flip', value: 'flip'},
    {name: 'Blend', value: 'blend'},
  ])

  // 设置属性关联元素
  $('#setVideo-property-key').enableHiddenMode().relate([
    {case: 'video', targets: [
      $('#setVideo-property-video'),
    ]},
    {case: 'playbackRate', targets: [
      $('#setVideo-property-playbackRate'),
    ]},
    {case: 'loop', targets: [
      $('#setVideo-property-loop'),
    ]},
    {case: 'flip', targets: [
      $('#setVideo-property-flip'),
    ]},
    {case: 'blend', targets: [
      $('#setVideo-property-blend'),
    ]},
  ])

  // 创建显示选项
  $('#setVideo-property-loop').loadItems($('#uiVideo-loop').dataItems)

  // 创建翻转选项
  $('#setVideo-property-flip').loadItems($('#uiVideo-flip').dataItems)

  // 创建混合模式选项
  $('#setVideo-property-blend').loadItems($('#uiVideo-blend').dataItems)

  // 侦听事件
  $('#setVideo-property-confirm').on('click', this.confirm)
}

// 解析属性
VideoProperty.parse = function ({key, value}, listData) {
  let string
  const get = Local.createGetter('command.setVideo')
  const name = get(key).replace('.', Token('.'))
  switch (key) {
    case 'video':
      string = name + Token('(') + Command.parseFileName(value) + Token(')')
      break
    case 'playbackRate':
      string = name + Token('(') + Command.parseVariableNumber(value) + Token(')')
      break
    case 'loop':
      string = name + Token('(') + get('loop.' + value) + Token(')')
      break
    case 'flip':
      string = name + Token('(') + get('flip.' + value) + Token(')')
      break
    case 'blend':
      string = name + Token('(') + Command.parseBlend(value) + Token(')')
      break
  }
  if (listData) {
    string = Command.removeTextTags(string)
  }
  return string
}

// 打开数据
VideoProperty.open = function ({key = 'video', value = ''} = {}) {
  Window.open('setVideo-property')
  const write = getElementWriter('setVideo-property')
  let video = ''
  let playbackRate = 1
  let loop = false
  let flip = 'none'
  let blend = 'normal'
  switch (key) {
    case 'video':
      video = value
      break
    case 'playbackRate':
      playbackRate = value
      break
    case 'loop':
      loop = value
      break
    case 'flip':
      flip = value
      break
    case 'blend':
      blend = value
      break
  }
  write('key', key)
  write('video', video)
  write('playbackRate', playbackRate)
  write('loop', loop)
  write('flip', flip)
  write('blend', blend)
  $('#setVideo-property-key').getFocus()
}

// 保存数据
VideoProperty.save = function () {
  const read = getElementReader('setVideo-property')
  const key = read('key')
  let value
  switch (key) {
    case 'video':
      value = read('video')
      break
    case 'playbackRate':
      value = read('playbackRate')
      break
    case 'loop':
      value = read('loop')
      break
    case 'flip':
      value = read('flip')
      break
    case 'blend':
      value = read('blend')
      break
  }
  Window.close('setVideo-property')
  return {key, value}
}

// 确定按钮 - 鼠标点击事件
VideoProperty.confirm = function (event) {
  return VideoProperty.target.save()
}

// ******************************** 设置窗口 - 属性窗口 ********************************

const WindowProperty = {
  // properties
  target: null,
  // methods
  initialize: null,
  parse: null,
  open: null,
  save: null,
  // events
  confirm: null,
}

// 初始化
WindowProperty.initialize = function () {
  // 创建属性选项
  $('#setWindow-property-key').loadItems([
    {name: 'Scroll X', value: 'scrollX'},
    {name: 'Scroll Y', value: 'scrollY'},
    {name: 'Grid Width', value: 'gridWidth'},
    {name: 'Grid Height', value: 'gridHeight'},
    {name: 'Grid Gap X', value: 'gridGapX'},
    {name: 'Grid Gap Y', value: 'gridGapY'},
    {name: 'Padding X', value: 'paddingX'},
    {name: 'Padding Y', value: 'paddingY'},
  ])

  // 设置属性关联元素
  $('#setWindow-property-key').enableHiddenMode().relate([
    {case: 'scrollX', targets: [
      $('#setWindow-property-scrollX'),
    ]},
    {case: 'scrollY', targets: [
      $('#setWindow-property-scrollY'),
    ]},
    {case: 'gridWidth', targets: [
      $('#setWindow-property-gridWidth'),
    ]},
    {case: 'gridHeight', targets: [
      $('#setWindow-property-gridHeight'),
    ]},
    {case: 'gridGapX', targets: [
      $('#setWindow-property-gridGapX'),
    ]},
    {case: 'gridGapY', targets: [
      $('#setWindow-property-gridGapY'),
    ]},
    {case: 'paddingX', targets: [
      $('#setWindow-property-paddingX'),
    ]},
    {case: 'paddingY', targets: [
      $('#setWindow-property-paddingY'),
    ]},
  ])

  // 侦听事件
  $('#setWindow-property-confirm').on('click', this.confirm)
}

// 解析属性
WindowProperty.parse = function ({key, value}, listData) {
  let string
  const get = Local.createGetter('command.setWindow')
  const name = get(key)
  switch (key) {
    case 'scrollX':
    case 'scrollY':
    case 'gridWidth':
    case 'gridHeight':
    case 'gridGapX':
    case 'gridGapY':
    case 'paddingX':
    case 'paddingY':
      string = name + Token('(') + Command.parseVariableNumber(value) + Token(')')
      break
  }
  if (listData) {
    string = Command.removeTextTags(string)
  }
  return string
}

// 打开数据
WindowProperty.open = function ({key = 'scrollX', value = 0} = {}) {
  Window.open('setWindow-property')
  const write = getElementWriter('setWindow-property')
  let scrollX = 0
  let scrollY = 0
  let gridWidth = 0
  let gridHeight = 0
  let gridGapX = 0
  let gridGapY = 0
  let paddingX = 0
  let paddingY = 0
  switch (key) {
    case 'scrollX':
      scrollX = value
      break
    case 'scrollY':
      scrollY = value
      break
    case 'gridWidth':
      gridWidth = value
      break
    case 'gridHeight':
      gridHeight = value
      break
    case 'gridGapX':
      gridGapX = value
      break
    case 'gridGapY':
      gridGapY = value
      break
    case 'paddingX':
      paddingX = value
      break
    case 'paddingY':
      paddingY = value
      break
  }
  write('key', key)
  write('scrollX', scrollX)
  write('scrollY', scrollY)
  write('gridWidth', gridWidth)
  write('gridHeight', gridHeight)
  write('gridGapX', gridGapX)
  write('gridGapY', gridGapY)
  write('paddingX', paddingX)
  write('paddingY', paddingY)
  $('#setWindow-property-key').getFocus()
}

// 保存数据
WindowProperty.save = function () {
  const read = getElementReader('setWindow-property')
  const key = read('key')
  let value
  switch (key) {
    case 'scrollX':
      value = read('scrollX')
      break
    case 'scrollY':
      value = read('scrollY')
      break
    case 'gridWidth':
      value = read('gridWidth')
      break
    case 'gridHeight':
      value = read('gridHeight')
      break
    case 'gridGapX':
      value = read('gridGapX')
      break
    case 'gridGapY':
      value = read('gridGapY')
      break
    case 'paddingX':
      value = read('paddingX')
      break
    case 'paddingY':
      value = read('paddingY')
      break
  }
  Window.close('setWindow-property')
  return {key, value}
}

// 确定按钮 - 鼠标点击事件
WindowProperty.confirm = function (event) {
  return WindowProperty.target.save()
}

// ******************************** 移动元素 - 属性窗口 ********************************

const TransformProperty = {
  // properties
  target: null,
  // methods
  initialize: null,
  parse: null,
  open: null,
  save: null,
  // events
  confirm: null,
}

// 初始化
TransformProperty.initialize = function () {
  // 创建属性选项
  $('#moveElement-property-key').loadItems([
    {name: 'Anchor X', value: 'anchorX'},
    {name: 'Anchor Y', value: 'anchorY'},
    {name: 'X', value: 'x'},
    {name: 'Y', value: 'y'},
    {name: 'Width', value: 'width'},
    {name: 'Height', value: 'height'},
    {name: 'X2', value: 'x2'},
    {name: 'Y2', value: 'y2'},
    {name: 'Width2', value: 'width2'},
    {name: 'Height2', value: 'height2'},
    {name: 'Rotation', value: 'rotation'},
    {name: 'Scale X', value: 'scaleX'},
    {name: 'Scale Y', value: 'scaleY'},
    {name: 'Skew X', value: 'skewX'},
    {name: 'Skew Y', value: 'skewY'},
    {name: 'Opacity', value: 'opacity'},
  ])

  // 设置属性关联元素
  $('#moveElement-property-key').enableHiddenMode().relate([
    {case: 'anchorX', targets: [
      $('#moveElement-property-anchorX'),
    ]},
    {case: 'anchorY', targets: [
      $('#moveElement-property-anchorY'),
    ]},
    {case: 'x', targets: [
      $('#moveElement-property-x'),
    ]},
    {case: 'y', targets: [
      $('#moveElement-property-y'),
    ]},
    {case: 'width', targets: [
      $('#moveElement-property-width'),
    ]},
    {case: 'height', targets: [
      $('#moveElement-property-height'),
    ]},
    {case: 'x2', targets: [
      $('#moveElement-property-x2'),
    ]},
    {case: 'y2', targets: [
      $('#moveElement-property-y2'),
    ]},
    {case: 'width2', targets: [
      $('#moveElement-property-width2'),
    ]},
    {case: 'height2', targets: [
      $('#moveElement-property-height2'),
    ]},
    {case: 'rotation', targets: [
      $('#moveElement-property-rotation'),
    ]},
    {case: 'scaleX', targets: [
      $('#moveElement-property-scaleX'),
    ]},
    {case: 'scaleY', targets: [
      $('#moveElement-property-scaleY'),
    ]},
    {case: 'skewX', targets: [
      $('#moveElement-property-skewX'),
    ]},
    {case: 'skewY', targets: [
      $('#moveElement-property-skewY'),
    ]},
    {case: 'opacity', targets: [
      $('#moveElement-property-opacity'),
    ]},
  ])

  // 侦听事件
  $('#moveElement-property-confirm').on('click', this.confirm)
}

// 解析属性
TransformProperty.parse = function ({key, value}, listData) {
  const number = Command.parseVariableNumber(value)
  let string = Local.get('command.moveElement.' + key) + Token('(') + number + Token(')')
  if (listData) {
    string = Command.removeTextTags(string)
  }
  return string
}

// 打开数据
TransformProperty.open = function ({key = 'anchorX', value = 0} = {}) {
  Window.open('moveElement-property')
  const properties = {
    anchorX: 0,
    anchorY: 0,
    x: 0,
    x2: 0,
    y: 0,
    y2: 0,
    width: 0,
    width2: 0,
    height: 0,
    height2: 0,
    rotation: 0,
    scaleX: 1,
    scaleY: 1,
    skewX: 0,
    skewY: 0,
    opacity: 1,
  }
  if (key in properties) {
    properties[key] = value
  }
  const write = getElementWriter('moveElement-property', properties)
  write('key', key)
  write('anchorX')
  write('anchorY')
  write('x')
  write('x2')
  write('y')
  write('y2')
  write('width')
  write('width2')
  write('height')
  write('height2')
  write('rotation')
  write('scaleX')
  write('scaleY')
  write('skewX')
  write('skewY')
  write('opacity')
  $('#moveElement-property-key').getFocus()
}

// 保存数据
TransformProperty.save = function () {
  const read = getElementReader('moveElement-property')
  const key = read('key')
  const value = read(key)
  Window.close('moveElement-property')
  return {key, value}
}

// 确定按钮 - 鼠标点击事件
TransformProperty.confirm = function (event) {
  return TransformProperty.target.save()
}

// ******************************** 移动光源 - 属性窗口 ********************************

const LightProperty = {
  // properties
  target: null,
  // methods
  initialize: null,
  parse: null,
  open: null,
  save: null,
  // events
  confirm: null,
}

// 初始化
LightProperty.initialize = function () {
  // 创建属性选项
  $('#moveLight-property-key').loadItems([
    {name: 'X', value: 'x'},
    {name: 'Y', value: 'y'},
    {name: 'Range', value: 'range'},
    {name: 'intensity', value: 'intensity'},
    {name: 'Anchor X', value: 'anchorX'},
    {name: 'Anchor Y', value: 'anchorY'},
    {name: 'Width', value: 'width'},
    {name: 'Height', value: 'height'},
    {name: 'Angle', value: 'angle'},
    {name: 'Red', value: 'red'},
    {name: 'Green', value: 'green'},
    {name: 'Blue', value: 'blue'},
  ])

  // 设置属性关联元素
  $('#moveLight-property-key').enableHiddenMode().relate([
    {case: 'x', targets: [
      $('#moveLight-property-x'),
    ]},
    {case: 'y', targets: [
      $('#moveLight-property-y'),
    ]},
    {case: 'range', targets: [
      $('#moveLight-property-range'),
    ]},
    {case: 'intensity', targets: [
      $('#moveLight-property-intensity'),
    ]},
    {case: 'anchorX', targets: [
      $('#moveLight-property-anchorX'),
    ]},
    {case: 'anchorY', targets: [
      $('#moveLight-property-anchorY'),
    ]},
    {case: 'width', targets: [
      $('#moveLight-property-width'),
    ]},
    {case: 'height', targets: [
      $('#moveLight-property-height'),
    ]},
    {case: 'angle', targets: [
      $('#moveLight-property-angle'),
    ]},
    {case: 'red', targets: [
      $('#moveLight-property-red'),
    ]},
    {case: 'green', targets: [
      $('#moveLight-property-green'),
    ]},
    {case: 'blue', targets: [
      $('#moveLight-property-blue'),
    ]},
  ])

  // 侦听事件
  $('#moveLight-property-confirm').on('click', this.confirm)
}

// 解析属性
LightProperty.parse = function ({key, value}, listData) {
  const number = Command.parseVariableNumber(value)
  let string = Local.get('command.moveLight.' + key) + Token('(') + number + Token(')')
  if (listData) {
    string = Command.removeTextTags(string)
  }
  return string
}

// 打开数据
LightProperty.open = function ({key = 'x', value = 0} = {}) {
  Window.open('moveLight-property')
  const write = getElementWriter('moveLight-property')
  let x = 0
  let y = 0
  let range = 1
  let intensity = 0.5
  let anchorX = 0.5
  let anchorY = 0.5
  let width = 1
  let height = 1
  let angle = 0
  let red = 0
  let green = 0
  let blue = 0
  switch (key) {
    case 'x':
      x = value
      break
    case 'y':
      y = value
      break
    case 'range':
      range = value
      break
    case 'intensity':
      intensity = value
      break
    case 'anchorX':
      anchorX = value
      break
    case 'anchorY':
      anchorY = value
      break
    case 'width':
      width = value
      break
    case 'height':
      height = value
      break
    case 'angle':
      angle = value
      break
    case 'red':
      red = value
      break
    case 'green':
      green = value
      break
    case 'blue':
      blue = value
      break
  }
  write('key', key)
  write('x', x)
  write('y', y)
  write('range', range)
  write('intensity', intensity)
  write('anchorX', anchorX)
  write('anchorY', anchorY)
  write('width', width)
  write('height', height)
  write('angle', angle)
  write('red', red)
  write('green', green)
  write('blue', blue)
  $('#moveLight-property-key').getFocus()
}

// 保存数据
LightProperty.save = function () {
  const read = getElementReader('moveLight-property')
  const key = read('key')
  let value
  switch (key) {
    case 'x':
      value = read('x')
      break
    case 'y':
      value = read('y')
      break
    case 'range':
      value = read('range')
      break
    case 'intensity':
      value = read('intensity')
      break
    case 'anchorX':
      value = read('anchorX')
      break
    case 'anchorY':
      value = read('anchorY')
      break
    case 'width':
      value = read('width')
      break
    case 'height':
      value = read('height')
      break
    case 'angle':
      value = read('angle')
      break
    case 'red':
      value = read('red')
      break
    case 'green':
      value = read('green')
      break
    case 'blue':
      value = read('blue')
      break
  }
  Window.close('moveLight-property')
  return {key, value}
}

// 确定按钮 - 鼠标点击事件
LightProperty.confirm = function (event) {
  return LightProperty.target.save()
}

// ******************************** 变量访问器窗口 ********************************

const VariableGetter = {
  // properties
  keyBox: $('#variableGetter-preset-key'),
  target: null,
  filter: null,
  types: null,
  // methods
  initialize: null,
  open: null,
  isNone: null,
  loadPresetKeys: null,
  checkDataForPlugin: null,
  createDefaultForPlugin: null,
  createVarListGenerator: null,
  // events
  typeWrite: null,
  typeInput: null,
  confirm: null,
}

// 初始化
VariableGetter.initialize = function () {
  // 设置变量类型集合
  const types = {
    'local': {name: 'Local', value: 'local'},
    'global': {name: 'Global', value: 'global'},
    'self': {name: 'Self Variable', value: 'self'},
    'actor': {name: 'Actor Attribute', value: 'actor'},
    'skill': {name: 'Skill Attribute', value: 'skill'},
    'state': {name: 'State Attribute', value: 'state'},
    'equipment': {name: 'Equipment Attribute', value: 'equipment'},
    'item': {name: 'Item Attribute', value: 'item'},
    'element': {name: 'Element Attribute', value: 'element'},
  }
  const allTypes = Object.values(types)
  const writableTypes = allTypes.filter(
    item => item.value !== 'item'
  )
  const deletableTypes = writableTypes.filter(
    item => item.value !== 'global' && item.value !== 'self'
  )
  const objectTypes = [
    types.local,
    types.global,
    types.element,
  ]
  const objectTypes2 = [
    types.local,
    types.global,
  ]
  this.types = {
    all: allTypes,
    object: objectTypes,
    object2: objectTypes2,
    writable: writableTypes,
    deletable: deletableTypes,
  }

  // 设置变量类型关联元素
  const actor = $('#variableGetter-actor')
  const skill = $('#variableGetter-skill')
  const state = $('#variableGetter-state')
  const equipment = $('#variableGetter-equipment')
  const item = $('#variableGetter-item')
  const element = $('#variableGetter-element')
  const commonKey = $('#variableGetter-common-key')
  const presetKey = $('#variableGetter-preset-key')
  const globalKey = $('#variableGetter-global-key')
  $('#variableGetter-type').enableHiddenMode().relate([
    {case: 'local', targets: [commonKey]},
    {case: 'global', targets: [globalKey]},
    {case: 'actor', targets: [actor, presetKey]},
    {case: 'skill', targets: [skill, presetKey]},
    {case: 'state', targets: [state, presetKey]},
    {case: 'equipment', targets: [equipment, presetKey]},
    {case: 'item', targets: [item, presetKey]},
    {case: 'element', targets: [element, presetKey]},
  ])

  // 变量类型 - 重写设置选项名字方法
  $('#variableGetter-type').setItemNames = function (options) {
    const backup = this.dataItems
    this.dataItems = allTypes
    SelectBox.prototype.setItemNames.call(this, options)
    this.dataItems = backup
  }

  // 侦听事件
  $('#variableGetter-type').on('write', this.typeWrite)
  $('#variableGetter-type').on('input', this.typeInput)
  $('#variableGetter-confirm').on('click', this.confirm)
  TextSuggestion.listen($('#variableGetter-common-key'), VariableGetter.createVarListGenerator(this))
}

// 打开窗口
VariableGetter.open = function (target) {
  // 创建变量类型选项
  const types = this.types
  const filter = target.filter
  this.filter = filter
  switch (filter) {
    case 'all':
    case 'boolean':
    case 'number':
    case 'string':
      // 如果已经打开了变量访问器窗口，避免冲突使用新窗口
      if (Window.isWindowOpen('variableGetter')) {
        return VariableGetter2.open(target, filter)
      }
      $('#variableGetter-type').loadItems(types.all)
      $('#variableGetter-global-key').filter = filter
      break
    case 'object':
      // 如果已经打开了变量访问器窗口，避免冲突使用新窗口
      if (Window.isWindowOpen('variableGetter')) {
        return VariableGetter2.open(target, filter)
      }
      // 打开元素访问器时则过滤掉元素属性选项
      $('#variableGetter-type').loadItems(
        !Window.isWindowOpen('elementGetter')
      ? types.object
      : types.object2
      )
      $('#variableGetter-global-key').filter = filter
      break
    case 'writable-boolean':
    case 'writable-number':
    case 'writable-string':
      $('#variableGetter-type').loadItems(types.writable)
      $('#variableGetter-global-key').filter = filter.slice(9)
      break
    case 'deletable':
      $('#variableGetter-type').loadItems(types.deletable)
      break
  }

  this.target = target
  Window.open('variableGetter')
  const variable = target.dataValue
  const type = variable.type
  const key = variable.key
  let commonKey = ''
  let presetKey = ''
  let globalKey = ''
  let actor = {type: 'trigger'}
  let skill = {type: 'trigger'}
  let state = {type: 'trigger'}
  let equipment = {type: 'trigger'}
  let item = {type: 'trigger'}
  let element = {type: 'trigger'}
  switch (type) {
    case 'local':
      commonKey = key
      break
    case 'global':
      globalKey = key
      break
    case 'actor':
      this.loadPresetKeys(type)
      actor = variable.actor
      presetKey = key
      break
    case 'skill':
      this.loadPresetKeys(type)
      skill = variable.skill
      presetKey = key
      break
    case 'state':
      this.loadPresetKeys(type)
      state = variable.state
      presetKey = key
      break
    case 'equipment':
      this.loadPresetKeys(type)
      equipment = variable.equipment
      presetKey = key
      break
    case 'item':
      this.loadPresetKeys(type)
      item = variable.item
      presetKey = key
      break
    case 'element':
      this.loadPresetKeys(type)
      element = variable.element
      presetKey = key
      break
  }
  const write = getElementWriter('variableGetter')
  this.keyBox.loadItems(Attribute.getAttributeItems('none'))
  write('type', type)
  write('actor', actor)
  write('skill', skill)
  write('state', state)
  write('equipment', equipment)
  write('item', item)
  write('element', element)
  write('common-key', commonKey)
  write('preset-key', presetKey)
  write('global-key', globalKey)
  $('#variableGetter-type').getFocus()
}

// 判断变量是否为空
VariableGetter.isNone = function (variable) {
  return variable.key === ''
}

// 加载预设属性键
VariableGetter.loadPresetKeys = function (group) {
  let type = undefined
  switch (this.filter) {
    case 'boolean':
    case 'number':
    case 'string':
    case 'object':
      type = this.filter
      break
    case 'writable-boolean':
    case 'writable-number':
    case 'writable-string':
      type = this.filter.split('-')[1]
      break
  }
  this.keyBox.loadItems(Attribute.getAttributeItems(group, type))
}

// 检查插件版本的变量访问器数据有效性
VariableGetter.checkDataForPlugin = function (data) {
  if (data instanceof Object) {
    return data.getter === 'variable'
  }
  return false
}

// 创建插件版本的默认变量访问器
VariableGetter.createDefaultForPlugin = function () {
  return {getter: 'variable', type: 'local', key: ''}
}

// 创建本地变量列表生成器
VariableGetter.createVarListGenerator = function (filterObject) {
  return function () {
    const commands = EventEditor.commandList.read()
    if (!commands) return []

    // 生成过滤字符串
    const filter =
      filterObject.filter.includes('boolean') ? 'boolean'
    : filterObject.filter.includes('number')  ? 'number'
    : filterObject.filter.includes('string')  ? 'string'
    : filterObject.filter.includes('object')  ? 'object'
    : 'any'

    return EventEditor.commandList.varList.filter(item => {
      // 过滤类型不匹配的变量
      return filter === 'any' || item.type === 'any' || filter === item.type
    })
  }
}

// 类型写入事件
VariableGetter.typeWrite = function (event) {
  const type = event.value
  switch (type) {
    case 'actor':
    case 'skill':
    case 'state':
    case 'item':
    case 'equipment':
    case 'element':
      VariableGetter.loadPresetKeys(type)
      break
  }
}

// 类型输入事件
VariableGetter.typeInput = function (event) {
  const type = event.value
  switch (type) {
    case 'actor':
    case 'skill':
    case 'state':
    case 'item':
    case 'equipment':
    case 'element': {
      // 重新写入属性键
      const {selectBox} = VariableGetter.keyBox
      const attrName = selectBox.textContent
      selectBox.write(selectBox.read())
      if (selectBox.invalid) {
        // 如果是无效数据，则写入同名属性或第一项作为默认值
        const items = selectBox.dataItems
        let defValue = items[0]?.value
        for (const item of items) {
          if (item.name === attrName) {
            defValue = item.value
            break
          }
        }
        if (defValue !== undefined) {
          selectBox.write(defValue)
        }
      }
      break
    }
  }
}

// 确定按钮 - 鼠标点击事件
VariableGetter.confirm = function (event) {
  const read = getElementReader('variableGetter')
  const type = read('type')
  let getter
  let key
  switch (type) {
    case 'local':
      key = read('common-key').trim()
      if (key === '') {
        return $('#variableGetter-common-key').getFocus()
      }
      break
    case 'global': {
      key = read('global-key')
      if (key === '') {
        return $('#variableGetter-global-key').getFocus()
      }
      const variable = Data.variables.map[key]
      const filter = this.target.filter
      switch (filter) {
        case 'boolean':
        case 'number':
        case 'string':
          if (typeof variable?.value !== filter) {
            return $('#variableGetter-global-key').getFocus()
          }
          break
      }
      break
    }
    case 'actor':
    case 'skill':
    case 'state':
    case 'item':
    case 'equipment':
    case 'element':
      key = read('preset-key')
      if (key === '') {
        return $('#variableGetter-preset-key').getFocus()
      }
      break
  }
  switch (type) {
    case 'local':
    case 'global':
      getter = {type, key}
      break
    case 'self':
      getter = {type}
      break
    case 'actor': {
      const actor = read('actor')
      getter = {type, actor, key}
      break
    }
    case 'skill': {
      const skill = read('skill')
      getter = {type, skill, key}
      break
    }
    case 'state': {
      const state = read('state')
      getter = {type, state, key}
      break
    }
    case 'equipment': {
      const equipment = read('equipment')
      getter = {type, equipment, key}
      break
    }
    case 'item': {
      const item = read('item')
      getter = {type, item, key}
      break
    }
    case 'element': {
      const element = read('element')
      getter = {type, element, key}
      break
    }
  }
  // 如果是插件输入框，额外附加一个属性
  if (this.target.isPluginInput) {
    getter = {getter: 'variable', ...getter}
  }
  this.target.input(getter)
  Window.close('variableGetter')
}.bind(VariableGetter)

// ******************************** 变量访问器窗口2 ********************************

const VariableGetter2 = {
  // properties
  target: null,
  filter: '',
  types: null,
  // methods
  initialize: null,
  open: null,
  // events
  confirm: null,
}

// 初始化
VariableGetter2.initialize = function () {
  // 设置对象变量类型关联元素
  $('#variableGetter2-type').enableHiddenMode().relate([
    {case: 'local', targets: [$('#variableGetter2-common-key')]},
    {case: 'global', targets: [$('#variableGetter2-global-key')]},
    {case: 'element', targets: [$('#variableGetter2-element'), $('#variableGetter2-preset-key')]},
  ])

  // 侦听事件
  $('#variableGetter2-confirm').on('click', this.confirm)
  TextSuggestion.listen($('#variableGetter2-common-key'), VariableGetter.createVarListGenerator(this))
}

// 打开窗口
VariableGetter2.open = function (target, filter) {
  this.target = target
  this.filter = filter
  Window.open('variableGetter2')

  // 创建对象变量类型选项
  // 打开元素访问器时则过滤掉元素属性选项
  $('#variableGetter2-type').loadItems(
    filter === 'object' &&
    !Window.isWindowOpen('elementGetter')
  ? VariableGetter.types.object
  : VariableGetter.types.object2
  )

  // 设置全局变量类型过滤器
  $('#variableGetter2-global-key').filter = filter

  // 创建元素属性键选项
  $('#variableGetter2-preset-key').loadItems(
    Attribute.getAttributeItems('element', filter)
  )

  const variable = target.dataValue
  const type = variable.type
  let element = {type: 'trigger'}
  let commonKey = ''
  let globalKey = ''
  let presetKey = Attribute.getDefAttributeId('element', filter)
  switch (type) {
    case 'local':
      commonKey = variable.key
      break
    case 'global':
      globalKey = variable.key
      break
    case 'element':
      element = variable.element
      presetKey = variable.key
      break
  }
  const write = getElementWriter('variableGetter2')
  write('type', type)
  write('element', element)
  write('common-key', commonKey)
  write('global-key', globalKey)
  write('preset-key', presetKey)
  $('#variableGetter2-type').getFocus()
}

// 确定按钮 - 鼠标点击事件
VariableGetter2.confirm = function (event) {
  const read = getElementReader('variableGetter2')
  const type = read('type')
  let getter
  switch (type) {
    case 'local': {
      const key = read('common-key').trim()
      if (!key) {
        return $('#variableGetter2-common-key').getFocus()
      }
      getter = {type, key}
      break
    }
    case 'global': {
      const key = read('global-key')
      const variable = Data.variables.map[key]
      if (key === '' ||
        this.filter !== 'all' &&
        typeof variable?.value !== this.filter) {
        return $('#variableGetter2-global-key').getFocus()
      }
      getter = {type, key}
      break
    }
    case 'element': {
      const element = read('element')
      const key = read('preset-key')
      if (key === '') {
        return $('#variableGetter2-preset-key').getFocus()
      }
      getter = {type, element, key}
      break
    }
  }
  this.target.input(getter)
  Window.close('variableGetter2')
}.bind(VariableGetter2)

// ******************************** 角色访问器窗口 ********************************

const ActorGetter = {
  // properties
  target: null,
  // methods
  initialize: null,
  open: null,
  checkDataForPlugin: null,
  createDefaultForPlugin: null,
  // events
  confirm: null,
}

// 初始化
ActorGetter.initialize = function () {
  // 创建访问器类型选项
  $('#actorGetter-type').loadItems([
    {name: 'Event Trigger Actor', value: 'trigger'},
    {name: 'Skill Caster', value: 'caster'},
    {name: 'Latest Actor', value: 'latest'},
    {name: 'Target Actor', value: 'target'},
    {name: 'Player Actor', value: 'player'},
    {name: 'Party Member', value: 'member'},
    {name: 'Global Actor', value: 'global'},
    {name: 'By Actor ID', value: 'by-id'},
    {name: 'Variable', value: 'variable'},
  ])

  // 设置关联元素
  $('#actorGetter-type').enableHiddenMode().relate([
    {case: 'member', targets: [
      $('#actorGetter-memberId'),
    ]},
    {case: 'global', targets: [
      $('#actorGetter-actorId'),
    ]},
    {case: 'by-id', targets: [
      $('#actorGetter-presetId'),
    ]},
    {case: 'variable', targets: [
      $('#actorGetter-variable'),
    ]},
  ])

  // 侦听事件
  $('#actorGetter-confirm').on('click', this.confirm)
}

// 打开窗口
ActorGetter.open = function (target) {
  this.target = target
  Window.open('actorGetter')

  let memberId = 0
  let actorId = ''
  let presetId = PresetObject.getDefaultPresetId('actor')
  let variable = {type: 'local', key: ''}
  const actor = target.dataValue
  switch (actor.type) {
    case 'trigger':
    case 'caster':
    case 'latest':
    case 'target':
    case 'player':
      break
    case 'member':
      memberId = actor.memberId
      break
    case 'global':
      actorId = actor.actorId
      break
    case 'by-id':
      presetId = actor.presetId
      break
    case 'variable':
      variable = actor.variable
      break
  }
  $('#actorGetter-type').write(actor.type)
  $('#actorGetter-memberId').write(memberId)
  $('#actorGetter-actorId').write(actorId)
  $('#actorGetter-presetId').write(presetId)
  $('#actorGetter-variable').write(variable)
  $('#actorGetter-type').getFocus()
}

// 检查插件版本的角色访问器数据有效性
ActorGetter.checkDataForPlugin = function (data) {
  if (data instanceof Object) {
    return data.getter === 'actor'
  }
  return false
}

// 创建插件版本的默认角色访问器
ActorGetter.createDefaultForPlugin = function () {
  return {getter: 'actor', type: 'trigger'}
}

// 确定按钮 - 鼠标点击事件
ActorGetter.confirm = function (event) {
  const read = getElementReader('actorGetter')
  const type = read('type')
  let getter
  switch (type) {
    case 'trigger':
    case 'caster':
    case 'latest':
    case 'target':
    case 'player':
      getter = {type}
      break
    case 'member': {
      const memberId = read('memberId')
      getter = {type, memberId}
      break
    }
    case 'global': {
      const actorId = read('actorId')
      if (actorId === '') {
        return $('#actorGetter-actorId').getFocus()
      }
      getter = {type, actorId}
      break
    }
    case 'by-id': {
      const presetId = read('presetId')
      if (presetId === '') {
        return $('#actorGetter-presetId').getFocus()
      }
      getter = {type, presetId}
      break
    }
    case 'variable': {
      const variable = read('variable')
      if (VariableGetter.isNone(variable)) {
        return $('#actorGetter-variable').getFocus()
      }
      getter = {type, variable}
      break
    }
  }
  // 如果是插件输入框，额外附加一个属性
  if (this.target.isPluginInput) {
    getter = {getter: 'actor', ...getter}
  }
  this.target.input(getter)
  Window.close('actorGetter')
}.bind(ActorGetter)

// ******************************** 技能访问器窗口 ********************************

const SkillGetter = {
  // properties
  target: null,
  // methods
  initialize: null,
  open: null,
  checkDataForPlugin: null,
  createDefaultForPlugin: null,
  // events
  confirm: null,
}

// 初始化
SkillGetter.initialize = function () {
  // 创建访问器类型选项
  $('#skillGetter-type').loadItems([
    {name: 'Event Trigger Skill', value: 'trigger'},
    {name: 'Latest Skill', value: 'latest'},
    {name: 'By Shortcut Key', value: 'by-key'},
    {name: 'By Skill ID', value: 'by-id'},
    {name: 'Variable', value: 'variable'},
  ])

  // 设置关联元素
  $('#skillGetter-type').enableHiddenMode().relate([
    {case: 'by-key', targets: [
      $('#skillGetter-actor'),
      $('#skillGetter-key'),
    ]},
    {case: 'by-id', targets: [
      $('#skillGetter-actor'),
      $('#skillGetter-skillId'),
    ]},
    {case: 'variable', targets: [
      $('#skillGetter-variable'),
    ]},
  ])

  // 侦听事件
  $('#skillGetter-confirm').on('click', this.confirm)
}

// 打开窗口
SkillGetter.open = function (target) {
  this.target = target
  Window.open('skillGetter')

  // 加载快捷键选项
  $('#skillGetter-key').loadItems(
    Enum.getStringItems('shortcut-key')
  )

  let actor = {type: 'trigger'}
  let key = Enum.getDefStringId('shortcut-key')
  let skillId = ''
  let variable = {type: 'local', key: ''}
  const skill = target.dataValue
  switch (skill.type) {
    case 'trigger':
    case 'latest':
      break
    case 'by-key':
      actor = skill.actor
      key = skill.key
      break
    case 'by-id':
      actor = skill.actor
      skillId = skill.skillId
      break
    case 'variable':
      variable = skill.variable
      break
  }
  $('#skillGetter-type').write(skill.type)
  $('#skillGetter-actor').write(actor)
  $('#skillGetter-key').write(key)
  $('#skillGetter-skillId').write(skillId)
  $('#skillGetter-variable').write(variable)
  $('#skillGetter-type').getFocus()
}

// 检查插件版本的技能访问器数据有效性
SkillGetter.checkDataForPlugin = function (data) {
  if (data instanceof Object) {
    return data.getter === 'skill'
  }
  return false
}

// 创建插件版本的默认技能访问器
SkillGetter.createDefaultForPlugin = function () {
  return {getter: 'skill', type: 'trigger'}
}

// 确定按钮 - 鼠标点击事件
SkillGetter.confirm = function (event) {
  const read = getElementReader('skillGetter')
  const type = read('type')
  let getter
  switch (type) {
    case 'trigger':
    case 'latest':
      getter = {type}
      break
    case 'by-key': {
      const actor = read('actor')
      const key = read('key')
      if (key === '') {
        return $('#skillGetter-key').getFocus()
      }
      getter = {type, actor, key}
      break
    }
    case 'by-id': {
      const actor = read('actor')
      const skillId = read('skillId')
      if (skillId === '') {
        return $('#skillGetter-skillId').getFocus()
      }
      getter = {type, actor, skillId}
      break
    }
    case 'variable': {
      const variable = read('variable')
      if (VariableGetter.isNone(variable)) {
        return $('#skillGetter-variable').getFocus()
      }
      getter = {type, variable}
      break
    }
  }
  // 如果是插件输入框，额外附加一个属性
  if (this.target.isPluginInput) {
    getter = {getter: 'skill', ...getter}
  }
  this.target.input(getter)
  Window.close('skillGetter')
}.bind(SkillGetter)

// ******************************** 状态访问器窗口 ********************************

const StateGetter = {
  // properties
  target: null,
  // methods
  initialize: null,
  open: null,
  checkDataForPlugin: null,
  createDefaultForPlugin: null,
  // events
  confirm: null,
}

// 初始化
StateGetter.initialize = function () {
  // 创建访问器类型选项
  $('#stateGetter-type').loadItems([
    {name: 'Event Trigger State', value: 'trigger'},
    {name: 'Latest State', value: 'latest'},
    {name: 'By State ID', value: 'by-id'},
    {name: 'Variable', value: 'variable'},
  ])

  // 设置关联元素
  $('#stateGetter-type').enableHiddenMode().relate([
    {case: 'by-id', targets: [
      $('#stateGetter-actor'),
      $('#stateGetter-stateId'),
    ]},
    {case: 'variable', targets: [
      $('#stateGetter-variable'),
    ]},
  ])

  // 侦听事件
  $('#stateGetter-confirm').on('click', this.confirm)
}

// 打开窗口
StateGetter.open = function (target) {
  this.target = target
  Window.open('stateGetter')

  let actor = {type: 'trigger'}
  let stateId = ''
  let variable = {type: 'local', key: ''}
  const state = target.dataValue
  switch (state.type) {
    case 'trigger':
    case 'latest':
      break
    case 'by-id':
      actor = state.actor
      stateId = state.stateId
      break
    case 'variable':
      variable = state.variable
      break
  }
  $('#stateGetter-type').write(state.type)
  $('#stateGetter-actor').write(actor)
  $('#stateGetter-stateId').write(stateId)
  $('#stateGetter-variable').write(variable)
  $('#stateGetter-type').getFocus()
}

// 检查插件版本的状态访问器数据有效性
StateGetter.checkDataForPlugin = function (data) {
  if (data instanceof Object) {
    return data.getter === 'state'
  }
  return false
}

// 创建插件版本的默认状态访问器
StateGetter.createDefaultForPlugin = function () {
  return {getter: 'state', type: 'trigger'}
}

// 确定按钮 - 鼠标点击事件
StateGetter.confirm = function (event) {
  const read = getElementReader('stateGetter')
  const type = read('type')
  let getter
  switch (type) {
    case 'trigger':
    case 'latest':
      getter = {type}
      break
    case 'by-id': {
      const actor = read('actor')
      const stateId = read('stateId')
      if (stateId === '') {
        return $('#stateGetter-stateId').getFocus()
      }
      getter = {type, actor, stateId}
      break
    }
    case 'variable': {
      const variable = read('variable')
      if (VariableGetter.isNone(variable)) {
        return $('#stateGetter-variable').getFocus()
      }
      getter = {type, variable}
      break
    }
  }
  // 如果是插件输入框，额外附加一个属性
  if (this.target.isPluginInput) {
    getter = {getter: 'state', ...getter}
  }
  this.target.input(getter)
  Window.close('stateGetter')
}.bind(StateGetter)

// ******************************** 装备访问器窗口 ********************************

const EquipmentGetter = {
  // properties
  target: null,
  // methods
  initialize: null,
  open: null,
  checkDataForPlugin: null,
  createDefaultForPlugin: null,
  // events
  confirm: null,
}

// 初始化
EquipmentGetter.initialize = function () {
  // 创建访问器类型选项
  $('#equipmentGetter-type').loadItems([
    {name: 'Event Trigger Equipment', value: 'trigger'},
    {name: 'Latest Equipment', value: 'latest'},
    {name: 'By Equipment Slot', value: 'by-slot'},
    {name: 'By Equipment ID (Equipped)', value: 'by-id-equipped'},
    {name: 'By Equipment ID (Inventory)', value: 'by-id-inventory'},
    {name: 'Variable', value: 'variable'},
  ])

  // 设置类型关联元素
  $('#equipmentGetter-type').enableHiddenMode().relate([
    {case: 'by-slot', targets: [
      $('#equipmentGetter-actor'),
      $('#equipmentGetter-slot'),
    ]},
    {case: ['by-id-equipped', 'by-id-inventory'], targets: [
      $('#equipmentGetter-actor'),
      $('#equipmentGetter-equipmentId'),
    ]},
    {case: 'variable', targets: [
      $('#equipmentGetter-variable'),
    ]},
  ])

  // 侦听事件
  $('#equipmentGetter-confirm').on('click', this.confirm)
}

// 打开窗口
EquipmentGetter.open = function (target) {
  this.target = target
  Window.open('equipmentGetter')
  // 加载快捷键选项
  $('#equipmentGetter-slot').loadItems(
    Enum.getStringItems('equipment-slot')
  )

  let actor = {type: 'trigger'}
  let slot = Enum.getDefStringId('equipment-slot')
  let equipmentId = ''
  let variable = {type: 'local', key: ''}
  const equipment = target.dataValue
  switch (equipment.type) {
    case 'trigger':
    case 'latest':
      break
    case 'by-slot':
      actor = equipment.actor
      slot = equipment.slot
      break
    case 'by-id-equipped':
    case 'by-id-inventory':
      actor = equipment.actor
      equipmentId = equipment.equipmentId
      break
    case 'variable':
      variable = equipment.variable
      break
  }
  $('#equipmentGetter-type').write(equipment.type)
  $('#equipmentGetter-actor').write(actor)
  $('#equipmentGetter-slot').write(slot)
  $('#equipmentGetter-equipmentId').write(equipmentId)
  $('#equipmentGetter-variable').write(variable)
  $('#equipmentGetter-type').getFocus()
}

// 检查插件版本的装备访问器数据有效性
EquipmentGetter.checkDataForPlugin = function (data) {
  if (data instanceof Object) {
    return data.getter === 'equipment'
  }
  return false
}

// 创建插件版本的默认装备访问器
EquipmentGetter.createDefaultForPlugin = function () {
  return {getter: 'equipment', type: 'trigger'}
}

// 确定按钮 - 鼠标点击事件
EquipmentGetter.confirm = function (event) {
  const read = getElementReader('equipmentGetter')
  const type = read('type')
  let getter
  switch (type) {
    case 'trigger':
    case 'latest':
      getter = {type}
      break
    case 'by-slot': {
      const actor = read('actor')
      const slot = read('slot')
      if (slot === '') {
        return $('#equipmentGetter-slot').getFocus()
      }
      getter = {type, actor, slot}
      break
    }
    case 'by-id-equipped':
    case 'by-id-inventory': {
      const actor = read('actor')
      const equipmentId = read('equipmentId')
      if (equipmentId === '') {
        return $('#equipmentGetter-equipmentId').getFocus()
      }
      getter = {type, actor, equipmentId}
      break
    }
    case 'variable': {
      const variable = read('variable')
      if (VariableGetter.isNone(variable)) {
        return $('#equipmentGetter-variable').getFocus()
      }
      getter = {type, variable}
      break
    }
  }
  // 如果是插件输入框，额外附加一个属性
  if (this.target.isPluginInput) {
    getter = {getter: 'equipment', ...getter}
  }
  this.target.input(getter)
  Window.close('equipmentGetter')
}.bind(EquipmentGetter)

// ******************************** 物品访问器窗口 ********************************

const ItemGetter = {
  // properties
  target: null,
  // methods
  initialize: null,
  open: null,
  checkDataForPlugin: null,
  createDefaultForPlugin: null,
  // events
  confirm: null,
}

// 初始化
ItemGetter.initialize = function () {
  // 创建访问器类型选项
  $('#itemGetter-type').loadItems([
    {name: 'Event Trigger Item', value: 'trigger'},
    {name: 'Latest Item', value: 'latest'},
    {name: 'By Shortcut Key', value: 'by-key'},
    {name: 'By Item ID', value: 'by-id'},
    {name: 'Variable', value: 'variable'},
  ])

  // 设置类型关联元素
  $('#itemGetter-type').enableHiddenMode().relate([
    {case: 'by-key', targets: [
      $('#itemGetter-actor'),
      $('#itemGetter-key'),
    ]},
    {case: 'by-id', targets: [
      $('#itemGetter-actor'),
      $('#itemGetter-itemId'),
    ]},
    {case: 'variable', targets: [
      $('#itemGetter-variable'),
    ]},
  ])

  // 侦听事件
  $('#itemGetter-confirm').on('click', this.confirm)
}

// 打开窗口
ItemGetter.open = function (target) {
  this.target = target
  Window.open('itemGetter')

  // 加载快捷键选项
  $('#itemGetter-key').loadItems(
    Enum.getStringItems('shortcut-key')
  )

  let actor = {type: 'trigger'}
  let key = Enum.getDefStringId('shortcut-key')
  let itemId = ''
  let variable = {type: 'local', key: ''}
  const item = target.dataValue
  switch (item.type) {
    case 'trigger':
    case 'latest':
      break
    case 'by-key':
      actor = item.actor
      key = item.key
      break
    case 'by-id':
      actor = item.actor
      itemId = item.itemId
      break
    case 'variable':
      variable = item.variable
      break
  }
  $('#itemGetter-type').write(item.type)
  $('#itemGetter-actor').write(actor)
  $('#itemGetter-key').write(key)
  $('#itemGetter-itemId').write(itemId)
  $('#itemGetter-variable').write(variable)
  $('#itemGetter-type').getFocus()
}

// 检查插件版本的物品访问器数据有效性
ItemGetter.checkDataForPlugin = function (data) {
  if (data instanceof Object) {
    return data.getter === 'item'
  }
  return false
}

// 创建插件版本的默认物品访问器
ItemGetter.createDefaultForPlugin = function () {
  return {getter: 'item', type: 'trigger'}
}

// 确定按钮 - 鼠标点击事件
ItemGetter.confirm = function (event) {
  const read = getElementReader('itemGetter')
  const type = read('type')
  let getter
  switch (type) {
    case 'trigger':
    case 'latest':
      getter = {type}
      break
    case 'by-key': {
      const actor = read('actor')
      const key = read('key')
      if (key === '') {
        return $('#itemGetter-key').getFocus()
      }
      getter = {type, actor, key}
      break
    }
    case 'by-id': {
      const actor = read('actor')
      const itemId = read('itemId')
      if (itemId === '') {
        return $('#itemGetter-itemId').getFocus()
      }
      getter = {type, actor, itemId}
      break
    }
    case 'variable': {
      const variable = read('variable')
      if (VariableGetter.isNone(variable)) {
        return $('#itemGetter-variable').getFocus()
      }
      getter = {type, variable}
      break
    }
  }
  // 如果是插件输入框，额外附加一个属性
  if (this.target.isPluginInput) {
    getter = {getter: 'item', ...getter}
  }
  this.target.input(getter)
  Window.close('itemGetter')
}.bind(ItemGetter)

// ******************************** 位置访问器窗口 ********************************

const PositionGetter = {
  // properties
  target: null,
  // methods
  initialize: null,
  open: null,
  checkDataForPlugin: null,
  createDefaultForPlugin: null,
  // events
  confirm: null,
}

// 初始化
PositionGetter.initialize = function () {
  // 创建类型选项
  $('#positionGetter-type').loadItems([
    {name: 'Absolute Coordinates', value: 'absolute'},
    {name: 'Relative Coordinates', value: 'relative'},
    {name: 'Position of Actor', value: 'actor'},
    {name: 'Position of Trigger', value: 'trigger'},
    {name: 'Position of Light', value: 'light'},
    {name: 'Position of Region', value: 'region'},
    {name: 'Position of Object', value: 'object'},
    {name: 'Position of Mouse', value: 'mouse'},
  ])

  // 设置类型关联元素
  $('#positionGetter-type').enableHiddenMode().relate([
    {case: 'absolute', targets: [
      $('#positionGetter-common-x'),
      $('#positionGetter-common-y'),
    ]},
    {case: 'relative', targets: [
      $('#positionGetter-common-x'),
      $('#positionGetter-common-y'),
    ]},
    {case: 'actor', targets: [
      $('#positionGetter-actor'),
    ]},
    {case: 'trigger', targets: [
      $('#positionGetter-trigger'),
    ]},
    {case: 'light', targets: [
      $('#positionGetter-light'),
    ]},
    {case: 'region', targets: [
      $('#positionGetter-region'),
      $('#positionGetter-region-mode'),
    ]},
    {case: 'object', targets: [
      $('#positionGetter-objectId'),
    ]},
  ])

  // 创建区域模式选项
  $('#positionGetter-region-mode').loadItems([
    {name: 'Center', value: 'center'},
    {name: 'Random', value: 'random'},
    {name: 'Random - Land', value: 'random-land'},
    {name: 'Random - Water', value: 'random-water'},
    {name: 'Random - Wall', value: 'random-wall'},
  ])

  // 侦听事件
  $('#positionGetter-confirm').on('click', this.confirm)
}

// 打开窗口
PositionGetter.open = function (target) {
  this.target = target
  Window.open('positionGetter')

  let commonX = 0
  let commonY = 0
  let actor = {type: 'trigger'}
  let trigger = {type: 'trigger'}
  let light = {type: 'trigger'}
  let region = {type: 'trigger'}
  let regionMode = 'center'
  let objectId = PresetObject.getDefaultPresetId('any')
  const position = target.dataValue
  switch (position.type) {
    case 'absolute':
      commonX = position.x
      commonY = position.y
      break
    case 'relative':
      commonX = position.x
      commonY = position.y
      break
    case 'actor':
      actor = position.actor
      break
    case 'trigger':
      trigger = position.trigger
      break
    case 'light':
      light = position.light
      break
    case 'region':
      region = position.region
      regionMode = position.mode
      break
    case 'object':
      objectId = position.objectId
      break
  }
  $('#positionGetter-type').write(position.type)
  $('#positionGetter-common-x').write(commonX)
  $('#positionGetter-common-y').write(commonY)
  $('#positionGetter-actor').write(actor)
  $('#positionGetter-trigger').write(trigger)
  $('#positionGetter-light').write(light)
  $('#positionGetter-region').write(region)
  $('#positionGetter-region-mode').write(regionMode)
  $('#positionGetter-objectId').write(objectId)
  $('#positionGetter-type').getFocus()
}

// 检查插件版本的位置访问器数据有效性
PositionGetter.checkDataForPlugin = function (data) {
  if (data instanceof Object) {
    return data.getter === 'position'
  }
  return false
}

// 创建插件版本的默认位置访问器
PositionGetter.createDefaultForPlugin = function () {
  return {getter: 'position', type: 'absolute', x: 0, y: 0}
}

// 确定按钮 - 鼠标点击事件
PositionGetter.confirm = function (event) {
  const read = getElementReader('positionGetter')
  const type = read('type')
  let getter
  switch (type) {
    case 'absolute': {
      const x = read('common-x')
      const y = read('common-y')
      getter = {type, x, y}
      break
    }
    case 'relative': {
      const x = read('common-x')
      const y = read('common-y')
      getter = {type, x, y}
      break
    }
    case 'actor': {
      const actor = read('actor')
      getter = {type, actor}
      break
    }
    case 'trigger': {
      const trigger = read('trigger')
      getter = {type, trigger}
      break
    }
    case 'light': {
      const light = read('light')
      getter = {type, light}
      break
    }
    case 'region': {
      const region = read('region')
      const mode = read('region-mode')
      getter = {type, region, mode}
      break
    }
    case 'object': {
      const objectId = read('objectId')
      if (objectId === '') {
        return $('#positionGetter-objectId').getFocus()
      }
      getter = {type, objectId}
      break
    }
    case 'mouse':
      getter = {type}
      break
  }
  // 如果是插件输入框，额外附加一个属性
  if (this.target.isPluginInput) {
    getter = {getter: 'position', ...getter}
  }
  this.target.input(getter)
  Window.close('positionGetter')
}.bind(PositionGetter)

// ******************************** 角度访问器窗口 ********************************

const AngleGetter = {
  // properties
  target: null,
  // methods
  initialize: null,
  open: null,
  // events
  confirm: null,
}

// 初始化
AngleGetter.initialize = function () {
  // 创建访问器类型选项
  $('#angleGetter-type').loadItems([
    {name: 'Towards Position', value: 'position'},
    {name: 'Absolute Angle', value: 'absolute'},
    {name: 'Relative Angle', value: 'relative'},
    {name: 'Direction Angle', value: 'direction'},
    {name: 'Random Angle', value: 'random'},
  ])

  // 设置关联元素
  $('#angleGetter-type').enableHiddenMode().relate([
    {case: 'position', targets: [
      $('#angleGetter-position-position'),
    ]},
    {case: ['absolute', 'relative', 'direction'], targets: [
      $('#angleGetter-common-degrees'),
    ]},
  ])

  // 侦听事件
  $('#angleGetter-confirm').on('click', this.confirm)
}

// 打开窗口
AngleGetter.open = function (target) {
  this.target = target
  Window.open('angleGetter')

  let positionPosition = {type: 'actor', actor: {type: 'trigger'}}
  let commonDegrees = 0
  const angle = target.dataValue
  switch (angle.type) {
    case 'position':
      positionPosition = angle.position
      break
    case 'absolute':
    case 'relative':
    case 'direction':
      commonDegrees = angle.degrees
      break
    case 'random':
      break
  }
  $('#angleGetter-type').write(angle.type)
  $('#angleGetter-position-position').write(positionPosition)
  $('#angleGetter-common-degrees').write(commonDegrees)
  $('#angleGetter-type').getFocus()
}

// 确定按钮 - 鼠标点击事件
AngleGetter.confirm = function (event) {
  const read = getElementReader('angleGetter')
  const type = read('type')
  let getter
  switch (type) {
    case 'position': {
      const position = read('position-position')
      getter = {type, position}
      break
    }
    case 'absolute':
    case 'relative':
    case 'direction': {
      const degrees = read('common-degrees')
      getter = {type, degrees}
      break
    }
    case 'random':
      getter = {type}
      break
  }
  this.target.input(getter)
  Window.close('angleGetter')
}.bind(AngleGetter)

// ******************************** 触发器访问器窗口 ********************************

const TriggerGetter = {
  // properties
  target: null,
  // methods
  initialize: null,
  open: null,
  // events
  confirm: null,
}

// 初始化
TriggerGetter.initialize = function () {
  // 创建访问器类型选项
  $('#triggerGetter-type').loadItems([
    {name: 'Event Trigger', value: 'trigger'},
    {name: 'Latest Trigger', value: 'latest'},
    {name: 'Variable', value: 'variable'},
  ])

  // 设置关联元素
  $('#triggerGetter-type').enableHiddenMode().relate([
    {case: 'variable', targets: [
      $('#triggerGetter-variable'),
    ]},
  ])

  // 侦听事件
  $('#triggerGetter-confirm').on('click', this.confirm)
}

// 打开窗口
TriggerGetter.open = function (target) {
  this.target = target
  Window.open('triggerGetter')

  let variable = {type: 'local', key: ''}
  const trigger = target.dataValue
  switch (trigger.type) {
    case 'trigger':
    case 'latest':
      break
    case 'variable':
      variable = trigger.variable
      break
  }
  $('#triggerGetter-type').write(trigger.type)
  $('#triggerGetter-variable').write(variable)
  $('#triggerGetter-type').getFocus()
}

// 确定按钮 - 鼠标点击事件
TriggerGetter.confirm = function (event) {
  const read = getElementReader('triggerGetter')
  const type = read('type')
  let getter
  switch (type) {
    case 'trigger':
    case 'latest':
      getter = {type}
      break
    case 'variable': {
      const variable = read('variable')
      if (VariableGetter.isNone(variable)) {
        return $('#triggerGetter-variable').getFocus()
      }
      getter = {type, variable}
      break
    }
  }
  this.target.input(getter)
  Window.close('triggerGetter')
}.bind(TriggerGetter)

// ******************************** 光源访问器窗口 ********************************

const LightGetter = {
  // properties
  target: null,
  // methods
  initialize: null,
  open: null,
  // events
  confirm: null,
}

// 初始化
LightGetter.initialize = function () {
  // 创建访问器类型选项
  $('#lightGetter-type').loadItems([
    {name: 'Event Trigger Light', value: 'trigger'},
    {name: 'Latest Light', value: 'latest'},
    {name: 'By Light ID', value: 'by-id'},
    {name: 'Variable', value: 'variable'},
  ])

  // 设置关联元素
  $('#lightGetter-type').enableHiddenMode().relate([
    {case: 'by-id', targets: [
      $('#lightGetter-presetId'),
    ]},
    {case: 'variable', targets: [
      $('#lightGetter-variable'),
    ]},
  ])

  // 侦听事件
  $('#lightGetter-confirm').on('click', this.confirm)
}

// 打开窗口
LightGetter.open = function (target) {
  this.target = target
  Window.open('lightGetter')

  let presetId = PresetObject.getDefaultPresetId('light')
  let variable = {type: 'local', key: ''}
  const light = target.dataValue
  switch (light.type) {
    case 'trigger':
    case 'latest':
      break
    case 'by-id':
      presetId = light.presetId
      break
    case 'variable':
      variable = light.variable
      break
  }
  $('#lightGetter-type').write(light.type)
  $('#lightGetter-presetId').write(presetId)
  $('#lightGetter-variable').write(variable)
  $('#lightGetter-type').getFocus()
}

// 确定按钮 - 鼠标点击事件
LightGetter.confirm = function (event) {
  const read = getElementReader('lightGetter')
  const type = read('type')
  let getter
  switch (type) {
    case 'trigger':
    case 'latest':
      getter = {type}
      break
    case 'by-id': {
      const presetId = read('presetId')
      if (presetId === '') {
        return $('#lightGetter-presetId').getFocus()
      }
      getter = {type, presetId}
      break
    }
    case 'variable': {
      const variable = read('variable')
      if (VariableGetter.isNone(variable)) {
        return $('#lightGetter-variable').getFocus()
      }
      getter = {type, variable}
      break
    }
  }
  this.target.input(getter)
  Window.close('lightGetter')
}.bind(LightGetter)

// ******************************** 区域访问器窗口 ********************************

const RegionGetter = {
  // properties
  target: null,
  // methods
  initialize: null,
  open: null,
  // events
  confirm: null,
}

// 初始化
RegionGetter.initialize = function () {
  // 创建访问器类型选项
  $('#regionGetter-type').loadItems([
    {name: 'Event Trigger Region', value: 'trigger'},
    {name: 'By Region ID', value: 'by-id'},
  ])

  // 设置关联元素
  $('#regionGetter-type').enableHiddenMode().relate([
    {case: 'by-id', targets: [
      $('#regionGetter-presetId'),
    ]},
  ])

  // 侦听事件
  $('#regionGetter-confirm').on('click', this.confirm)
}

// 打开窗口
RegionGetter.open = function (target) {
  this.target = target
  Window.open('regionGetter')

  let presetId = PresetObject.getDefaultPresetId('region')
  const region = target.dataValue
  switch (region.type) {
    case 'trigger':
      break
    case 'by-id':
      presetId = region.presetId
      break
  }
  $('#regionGetter-type').write(region.type)
  $('#regionGetter-presetId').write(presetId)
  $('#regionGetter-type').getFocus()
}

// 确定按钮 - 鼠标点击事件
RegionGetter.confirm = function (event) {
  const read = getElementReader('regionGetter')
  const type = read('type')
  let getter
  switch (type) {
    case 'trigger':
      getter = {type}
      break
    case 'by-id': {
      const presetId = read('presetId')
      if (presetId === '') {
        return $('#regionGetter-presetId').getFocus()
      }
      getter = {type, presetId}
      break
    }
  }
  this.target.input(getter)
  Window.close('regionGetter')
}.bind(RegionGetter)

// ******************************** 瓦片地图访问器窗口 ********************************

const TilemapGetter = {
  // properties
  target: null,
  // methods
  initialize: null,
  open: null,
  // events
  confirm: null,
}

// 初始化
TilemapGetter.initialize = function () {
  // 创建访问器类型选项
  $('#tilemapGetter-type').loadItems([
    {name: 'Event Trigger Tilemap', value: 'trigger'},
    {name: 'By Tilemap ID', value: 'by-id'},
  ])

  // 设置关联元素
  $('#tilemapGetter-type').enableHiddenMode().relate([
    {case: 'by-id', targets: [
      $('#tilemapGetter-presetId'),
    ]},
  ])

  // 侦听事件
  $('#tilemapGetter-confirm').on('click', this.confirm)
}

// 打开窗口
TilemapGetter.open = function (target) {
  this.target = target
  Window.open('tilemapGetter')

  let presetId = PresetObject.getDefaultPresetId('tilemap')
  const tilemap = target.dataValue
  switch (tilemap.type) {
    case 'trigger':
      break
    case 'by-id':
      presetId = tilemap.presetId
      break
  }
  $('#tilemapGetter-type').write(tilemap.type)
  $('#tilemapGetter-presetId').write(presetId)
  $('#tilemapGetter-type').getFocus()
}

// 确定按钮 - 鼠标点击事件
TilemapGetter.confirm = function (event) {
  const read = getElementReader('tilemapGetter')
  const type = read('type')
  let getter
  switch (type) {
    case 'trigger':
      getter = {type}
      break
    case 'by-id': {
      const presetId = read('presetId')
      if (presetId === '') {
        return $('#tilemapGetter-presetId').getFocus()
      }
      getter = {type, presetId}
      break
    }
  }
  this.target.input(getter)
  Window.close('tilemapGetter')
}.bind(TilemapGetter)

// ******************************** 场景对象访问器窗口 ********************************

const ObjectGetter = {
  // properties
  target: null,
  // methods
  initialize: null,
  open: null,
  // events
  confirm: null,
}

// 初始化
ObjectGetter.initialize = function () {
  // 创建访问器类型选项
  $('#objectGetter-type').loadItems([
    {name: 'Event Trigger Object', value: 'trigger'},
    {name: 'Latest Scene Object', value: 'latest'},
    {name: 'By Object ID', value: 'by-id'},
    {name: 'Variable', value: 'variable'},
  ])

  // 设置关联元素
  $('#objectGetter-type').enableHiddenMode().relate([
    {case: 'by-id', targets: [
      $('#objectGetter-presetId'),
    ]},
    {case: 'variable', targets: [
      $('#objectGetter-variable'),
    ]},
  ])

  // 侦听事件
  $('#objectGetter-confirm').on('click', this.confirm)
}

// 打开窗口
ObjectGetter.open = function (target) {
  this.target = target
  Window.open('objectGetter')

  let presetId = PresetObject.getDefaultPresetId('any')
  let variable = {type: 'local', key: ''}
  const object = target.dataValue
  switch (object.type) {
    case 'trigger':
    case 'latest':
      break
    case 'by-id':
      presetId = object.presetId
      break
    case 'variable':
      variable = object.variable
      break
  }
  $('#objectGetter-type').write(object.type)
  $('#objectGetter-presetId').write(presetId)
  $('#objectGetter-variable').write(variable)
  $('#objectGetter-type').getFocus()
}

// 确定按钮 - 鼠标点击事件
ObjectGetter.confirm = function (event) {
  const read = getElementReader('objectGetter')
  const type = read('type')
  let getter
  switch (type) {
    case 'trigger':
    case 'latest':
      getter = {type}
      break
    case 'by-id': {
      const presetId = read('presetId')
      if (presetId === '') {
        return $('#objectGetter-presetId').getFocus()
      }
      getter = {type, presetId}
      break
    }
    case 'variable': {
      const variable = read('variable')
      if (VariableGetter.isNone(variable)) {
        return $('#objectGetter-variable').getFocus()
      }
      getter = {type, variable}
      break
    }
  }
  this.target.input(getter)
  Window.close('objectGetter')
}.bind(ObjectGetter)

// ******************************** 元素访问器窗口 ********************************

const ElementGetter = {
  // properties
  target: null,
  // methods
  initialize: null,
  open: null,
  checkDataForPlugin: null,
  createDefaultForPlugin: null,
  // events
  confirm: null,
}

// 初始化
ElementGetter.initialize = function () {
  // 创建访问器类型选项
  $('#elementGetter-type').loadItems([
    {name: 'Event Trigger Element', value: 'trigger'},
    {name: 'Latest Element', value: 'latest'},
    {name: 'By Element ID', value: 'by-id'},
    {name: 'By Ancestor And ID', value: 'by-ancestor-and-id'},
    {name: 'By Parent And Index', value: 'by-index'},
    {name: 'By Focus And Button Index', value: 'by-button-index'},
    {name: 'Get Selected Button In Focus', value: 'selected-button'},
    {name: 'Get The Latest Focus Element', value: 'focus'},
    {name: 'Get Parent Element', value: 'parent'},
    {name: 'Variable', value: 'variable'},
  ])

  // 设置关联元素
  $('#elementGetter-type').enableHiddenMode().relate([
    {case: 'by-id', targets: [
      $('#elementGetter-presetId'),
    ]},
    {case: 'by-ancestor-and-id', targets: [
      $('#elementGetter-ancestor'),
      $('#elementGetter-presetId'),
    ]},
    {case: ['by-index', 'by-button-index'], targets: [
      $('#elementGetter-ancestor'),
      $('#elementGetter-index'),
    ]},
    {case: 'selected-button', targets: [
      $('#elementGetter-ancestor'),
    ]},
    {case: ['parent', 'variable'], targets: [
      $('#elementGetter-variable'),
    ]},
  ])

  // 侦听事件
  $('#elementGetter-confirm').on('click', this.confirm)
}

// 打开窗口
ElementGetter.open = function (target) {
  this.target = target
  Window.open('elementGetter')

  let index = 0
  let presetId = PresetElement.getDefaultPresetId()
  let ancestor = {type: 'trigger'}
  let variable = {type: 'local', key: ''}
  const element = target.dataValue
  switch (element.type) {
    case 'trigger':
    case 'latest':
    case 'focus':
      break
    case 'by-id':
      presetId = element.presetId
      break
    case 'by-ancestor-and-id':
      ancestor = element.ancestor
      presetId = element.presetId
      break
    case 'by-index':
      ancestor = element.parent
      index = element.index
      break
    case 'by-button-index':
      ancestor = element.focus
      index = element.index
      break
    case 'selected-button':
      ancestor = element.focus
      break
    case 'parent':
    case 'variable':
      variable = element.variable
      break
  }
  $('#elementGetter-type').write(element.type)
  $('#elementGetter-ancestor').write(ancestor)
  $('#elementGetter-presetId').write(presetId)
  $('#elementGetter-index').write(index)
  $('#elementGetter-variable').write(variable)
  $('#elementGetter-type').getFocus()
}

// 检查插件版本的元素访问器数据有效性
ElementGetter.checkDataForPlugin = function (data) {
  if (data instanceof Object) {
    return data.getter === 'element'
  }
  return false
}

// 创建插件版本的默认元素访问器
ElementGetter.createDefaultForPlugin = function () {
  return {getter: 'element', type: 'trigger'}
}

// 确定按钮 - 鼠标点击事件
ElementGetter.confirm = function (event) {
  const read = getElementReader('elementGetter')
  const type = read('type')
  let getter
  switch (type) {
    case 'trigger':
    case 'latest':
    case 'focus':
      getter = {type}
      break
    case 'by-id': {
      const presetId = read('presetId')
      if (presetId === '') {
        return $('#elementGetter-presetId').getFocus()
      }
      getter = {type, presetId}
      break
    }
    case 'by-ancestor-and-id': {
      const ancestor = read('ancestor')
      const presetId = read('presetId')
      if (presetId === '') {
        return $('#elementGetter-presetId').getFocus()
      }
      getter = {type, ancestor, presetId}
      break
    }
    case 'by-index': {
      const parent = read('ancestor')
      const index = read('index')
      getter = {type, parent, index}
      break
    }
    case 'by-button-index': {
      const focus = read('ancestor')
      const index = read('index')
      getter = {type, focus, index}
      break
    }
    case 'selected-button': {
      const focus = read('ancestor')
      getter = {type, focus}
      break
    }
    case 'parent':
    case 'variable': {
      const variable = read('variable')
      if (VariableGetter.isNone(variable)) {
        return $('#elementGetter-variable').getFocus()
      }
      getter = {type, variable}
      break
    }
  }
  // 如果是插件输入框，额外附加一个属性
  if (this.target.isPluginInput) {
    getter = {getter: 'element', ...getter}
  }
  this.target.input(getter)
  Window.close('elementGetter')
}.bind(ElementGetter)

// ******************************** 祖先元素访问器窗口 ********************************

const AncestorGetter = {
  // properties
  target: null,
  // methods
  initialize: null,
  open: null,
  // events
  confirm: null,
}

// 初始化
AncestorGetter.initialize = function () {
  // 创建访问器类型选项
  const inclusions = [
    'trigger',
    'latest',
    'by-id',
    'variable',
  ]
  $('#ancestorGetter-type').loadItems(
    $('#elementGetter-type').dataItems.filter(
      a => inclusions.includes(a.value)
  ))

  // 设置关联元素
  $('#ancestorGetter-type').enableHiddenMode().relate([
    {case: 'by-id', targets: [
      $('#ancestorGetter-presetId'),
    ]},
    {case: 'variable', targets: [
      $('#ancestorGetter-variable'),
    ]},
  ])

  // 侦听事件
  $('#ancestorGetter-confirm').on('click', this.confirm)
}

// 打开窗口
AncestorGetter.open = function (target) {
  this.target = target
  Window.open('ancestorGetter')

  let presetId = PresetElement.getDefaultPresetId()
  let variable = {type: 'local', key: ''}
  const element = target.dataValue
  switch (element.type) {
    case 'trigger':
    case 'latest':
      break
    case 'by-id':
      presetId = element.presetId
      break
    case 'variable':
      variable = element.variable
      break
  }
  $('#ancestorGetter-type').write(element.type)
  $('#ancestorGetter-presetId').write(presetId)
  $('#ancestorGetter-variable').write(variable)
  $('#ancestorGetter-type').getFocus()
}

// 确定按钮 - 鼠标点击事件
AncestorGetter.confirm = function (event) {
  const read = getElementReader('ancestorGetter')
  const type = read('type')
  let getter
  switch (type) {
    case 'trigger':
    case 'latest':
      getter = {type}
      break
    case 'by-id': {
      const presetId = read('presetId')
      if (presetId === '') {
        return $('#ancestorGetter-presetId').getFocus()
      }
      getter = {type, presetId}
      break
    }
    case 'variable': {
      const variable = read('variable')
      if (VariableGetter.isNone(variable)) {
        return $('#ancestorGetter-variable').getFocus()
      }
      getter = {type, variable}
      break
    }
  }
  this.target.input(getter)
  Window.close('ancestorGetter')
}.bind(AncestorGetter)

// ******************************** 自定义指令窗口 ********************************

const CustomCommand = {
  // properties
  list: $('#command-list'),
  overviewPane: $('#command-overview-detail').hide(),
  overview: $('#command-overview'),
  settingsPane: $('#command-settings-detail').hide(),
  data: null,
  meta: null,
  symbol: null,
  changed: false,
  // methods
  initialize: null,
  open: null,
  load: null,
  unload: null,
  loadOverview: null,
  createData: null,
  getItemById: null,
  // events
  windowClose: null,
  windowClosed: null,
  pointerdown: null,
  scriptChange: null,
  listKeydown: null,
  listSelect: null,
  listUnselect: null,
  listChange: null,
  listPopup: null,
  listOpen: null,
  paramInput: null,
  confirm: null,
  apply: null,
}

// list methods
CustomCommand.list.insert = null
CustomCommand.list.toggle = null
CustomCommand.list.copy = null
CustomCommand.list.paste = null
CustomCommand.list.delete = PluginManager.list.delete
CustomCommand.list.saveSelection = null
CustomCommand.list.restoreSelection = null
CustomCommand.list.updateNodeElement = Easing.list.updateNodeElement
CustomCommand.list.addElementClass = PluginManager.list.addElementClass
CustomCommand.list.updateTextNode = PluginManager.list.updateTextNode
CustomCommand.list.updateToggleStyle = PluginManager.list.updateToggleStyle
CustomCommand.list.createEditIcon = PluginManager.list.createEditIcon

// 初始化
CustomCommand.initialize = function () {
  // 绑定指令列表
  const {list} = this
  list.removable = true
  list.bind(() => this.data)
  list.creators.push(list.addElementClass)
  list.creators.push(list.updateToggleStyle)
  list.updaters.push(list.updateTextNode)
  list.creators.push(list.createEditIcon)

  // 侦听事件
  $('#command').on('close', this.windowClose)
  $('#command').on('closed', this.windowClosed)
  list.on('keydown', this.listKeydown)
  list.on('select', this.listSelect)
  list.on('unselect', this.listUnselect)
  list.on('change', this.listChange)
  list.on('popup', this.listPopup)
  list.on('open', this.listOpen)
  list.on('pointerdown', ScriptListInterface.listPointerdown)
  $('#command-alias, #command-keywords').on('input', this.paramInput)
  $('#command-confirm').on('click', this.confirm)
  $('#command-apply').on('click', this.apply)
}

// 打开窗口
CustomCommand.open = function () {
  Window.open('command')

  // 创建数据副本
  this.data = Object.clone(Data.commands)

  // 更新列表项目
  this.list.restoreSelection()

  // 列表获得焦点
  this.list.getFocus()

  // 侦听事件
  window.on('pointerdown', this.pointerdown)
  window.on('script-change', this.scriptChange)
}

// 加载指令
CustomCommand.load = async function (item) {
  const symbol = this.symbol = Symbol()
  const meta = await Data.scripts[item.id]
  if (this.symbol === symbol) {
    this.symbol = null
    this.meta = meta
    this.loadOverview()
    const data = this.list.read()
    if (data) {
      const write = getElementWriter('command', data)
      write('alias')
      write('keywords')
      this.settingsPane.show()
    }
  }
}

// 卸载指令
CustomCommand.unload = function () {
  this.meta = null
  this.symbol = null
  this.overview.clear()
  this.overviewPane.hide()
  this.settingsPane.hide()
}

// 加载概述内容
CustomCommand.loadOverview = function () {
  const {meta} = this
  if (!meta) return
  const elements = PluginManager.createOverview(meta, true)
  const overview = this.overview.clear()
  for (const element of elements) {
    overview.appendChild(element)
  }
  this.overviewPane.show()
}

// 创建数据
CustomCommand.createData = function (id) {
  return {
    id: id,
    enabled: true,
    alias: '',
    keywords: '',
  }
}

// 获取ID匹配的数据
CustomCommand.getItemById = Easing.getItemById

// 窗口 - 关闭事件
CustomCommand.windowClose = function (event) {
  if (this.changed) {
    event.preventDefault()
    const get = Local.createGetter('confirmation')
    Window.confirm({
      message: get('closeUnsavedCommands'),
    }, [{
      label: get('yes'),
      click: () => {
        this.changed = false
        Window.close('command')
      },
    }, {
      label: get('no'),
    }])
  }
}.bind(CustomCommand)

// 窗口 - 已关闭事件
CustomCommand.windowClosed = function (event) {
  this.list.saveSelection()
  this.data = null
  this.list.clear()
  window.off('pointerdown', this.pointerdown)
  window.off('script-change', this.scriptChange)
}.bind(CustomCommand)

// 指针按下事件
CustomCommand.pointerdown = PluginManager.pointerdown

// 脚本元数据改变事件
CustomCommand.scriptChange = function (event) {
  if (CustomCommand.meta === event.changedMeta) {
    CustomCommand.loadOverview()
  }
}

// 列表 - 键盘按下事件
CustomCommand.listKeydown = function (event) {
  const item = this.read()
  if (event.cmdOrCtrlKey) {
    switch (event.code) {
      case 'KeyC':
        this.copy(item)
        break
      case 'KeyV':
        this.paste()
        break
    }
  } else if (event.altKey) {
    return
  } else {
    switch (event.code) {
      case 'Insert':
        this.insert(item)
        break
      case 'Slash':
        this.toggle(item)
        break
      case 'Delete':
        this.delete(item)
        break
    }
  }
}

// 列表 - 选择事件
CustomCommand.listSelect = function (event) {
  CustomCommand.load(event.value)
}

// 列表 - 取消选择事件
CustomCommand.listUnselect = function (event) {
  CustomCommand.unload()
}

// 列表 - 改变事件
CustomCommand.listChange = function (event) {
  CustomCommand.changed = true
}

// 列表 - 菜单弹出事件
CustomCommand.listPopup = function (event) {
  const item = event.value
  const selected = !!item
  const pastable = Clipboard.has('yami.data.customCommand')
  const deletable = selected
  const get = Local.createGetter('menuCustomCommandList')
  Menu.popup({
    x: event.clientX,
    y: event.clientY,
  }, [{
    label: get('edit'),
    accelerator: 'Enter',
    enabled: selected,
    click: () => {
      this.edit(item)
    },
  }, {
    label: get('insert'),
    accelerator: 'Insert',
    click: () => {
      this.insert(item)
    },
  }, {
    label: get('toggle'),
    accelerator: '/',
    enabled: selected,
    click: () => {
      this.toggle(item)
    },
  }, {
    label: get('copy'),
    accelerator: ctrl('C'),
    enabled: selected,
    click: () => {
      this.copy(item)
    },
  }, {
    label: get('paste'),
    accelerator: ctrl('V'),
    enabled: pastable,
    click: () => {
      this.paste(item)
    },
  }, {
    label: get('delete'),
    accelerator: 'Delete',
    enabled: deletable,
    click: () => {
      this.delete(item)
    },
  }])
}

// 列表 - 打开事件
CustomCommand.listOpen = function (event) {
  this.edit(event.value)
}

// 参数 - 输入事件
CustomCommand.paramInput = function (event) {
  CustomCommand.changed = true
  const data = CustomCommand.list.read()
  switch (this.id) {
    case 'command-alias':
      data.alias = this.read()
      break
    case 'command-keywords':
      data.keywords = this.read()
      break
  }
}

// 确定按钮 - 鼠标点击事件
CustomCommand.confirm = function (event) {
  this.apply()
  Window.close('command')
}.bind(CustomCommand)

// 应用按钮 - 鼠标点击事件
CustomCommand.apply = function (event) {
  if (this.changed) {
    this.changed = false

    // 保存变量数据
    let commands = this.data
    if (event instanceof Event) {
      commands = Object.clone(commands)
    } else {
      TreeList.deleteCaches(commands)
    }
    Data.commands = commands
    File.planToSave(Data.manifest.project.commands)
    Command.custom.loadCommandList()
  }
}.bind(CustomCommand)

// 列表 - 编辑
CustomCommand.list.edit = function (item) {
  Selector.open({
    filter: 'script',
    read: () => item.id,
    input: id => {
      if (item.id !== id) {
        item.id = id
        item.parameters = {}
        CustomCommand.changed = true
        // CustomCommand.parameterPane.update()
      }
      // 可能修改了文件名
      this.update()
    }
  }, false)
}

// 列表 - 插入
CustomCommand.list.insert = function (dItem) {
  Selector.open({
    filter: 'script',
    read: () => '',
    input: id => {
      this.addNodeTo(CustomCommand.createData(id), dItem)
    }
  }, false)
}

// 列表 - 开关
CustomCommand.list.toggle = function (item) {
  if (item) {
    item.enabled = !item.enabled
    this.updateToggleStyle(item)
    CustomCommand.changed = true
  }
}

// 列表 - 复制
CustomCommand.list.copy = function (item) {
  if (item) {
    Clipboard.write('yami.data.customCommand', item)
  }
}

// 列表 - 粘贴
CustomCommand.list.paste = function (dItem) {
  const copy = Clipboard.read('yami.data.customCommand')
  if (copy) {
    this.addNodeTo(copy, dItem)
  }
}

// 列表 - 保存选项状态
CustomCommand.list.saveSelection = function () {
  const {commands} = Data
  // 将数据保存在外部可以切换项目后重置
  if (commands.selection === undefined) {
    Object.defineProperty(commands, 'selection', {
      writable: true,
      value: '',
    })
  }
  const selection = this.read()
  if (selection) {
    commands.selection = selection.id
  }
}

// 列表 - 恢复选项状态
CustomCommand.list.restoreSelection = function () {
  const id = Data.commands.selection
  const item = CustomCommand.getItemById(id) ?? this.data[0]
  this.select(item)
  this.update()
  this.scrollToSelection()
}

// ******************************** 标记字符串管理器 ********************************

const Token = function IIFE() {
  const map = {
    '=': Command.setOperatorColor('='),
    ' = ': Command.setOperatorColor(' = '),
    ' / ': Command.setOperatorColor(' / '),
    ' <-> ': Command.setOperatorColor(' <-> '),
    '>=': Command.setOperatorColor('>='),
    '-': Command.setOperatorColor('-'),
    '+': Command.setOperatorColor('+'),
    '≤': Command.setOperatorColor('≤'),
    '(': Command.setDelimiterColor('('),
    ')': Command.setDelimiterColor(')'),
    '[': Command.setDelimiterColor('['),
    ']': Command.setDelimiterColor(']'),
    '{': Command.setDelimiterColor('{'),
    '}': Command.setDelimiterColor('}'),
    '<': Command.setDelimiterColor('<'),
    '>': Command.setDelimiterColor('>'),
    '.': Command.setDelimiterColor('.'),
    ',': Command.setDelimiterColor(','),
    ', ': Command.setDelimiterColor(', '),
    ': ': Command.setDelimiterColor(': '),
    ' ~ ': Command.setDelimiterColor(' ~ '),
    ' x ': Command.setDelimiterColor(' x '),
    ' -> ': Command.setDelimiterColor(' -> '),
    '...': Command.setDelimiterColor('...'),
    get none() {return Command.setBooleanColor(Local.get('common.none'))},
    get null() {return Command.setBooleanColor(Local.get('common.null'))},
  }

  // 获取定界符
  return key => map[key]
}()