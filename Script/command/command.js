'use strict'

import * as Yami from '../yami.js'

// ******************************** 指令对象 ********************************

const Command = {
  // properties
  target: null,
  id: null,
  words: null,
  format: false,
  invalid: false,
  // methods
  initialize: null,
  insert: null,
  edit: null,
  open: null,
  save: null,
  parse: null,
  parseBlend: null,
  parseVariable: null,
  parseGlobalVariable: null,
  parseAttributeKey: null,
  parseVariableTag: null,
  parseVariableNumber: null,
  parseVariableString: null,
  parseVariableEnum: null,
  parseVariableFile: null,
  parseMultiLineString: null,
  parseSpriteName: null,
  parseEventType: null,
  parseEnumString: null,
  parseGroupEnumString: null,
  parseListItem: null,
  parseParameter: null,
  parseActor: null,
  parseSkill: null,
  parseState: null,
  parseEquipment: null,
  parseItem: null,
  parseRegion: null,
  parsePosition: null,
  parseAngle: null,
  parseDegrees: null,
  parseTrigger: null,
  parseLight: null,
  parseElement: null,
  parsePresetObject: null,
  parsePresetElement: null,
  parseTeam: null,
  parseActorSelector: null,
  parseFileName: null,
  parseAudioType: null,
  parseWait: null,
  parseEasing: null,
  parseUnlinkedId: null,
  parseObjectName: null,
  // classes
  WordList: null,
  FormatUpdater: null,
  // objects
  cases: {},
  custom: null,
}

// ******************************** 指令对象加载 ********************************

// 初始化
Command.initialize = function () {
  // 创建词语列表
  this.words = new Command.WordList()

  // 初始化相关对象
  Yami.CommandSuggestion.initialize()
  Yami.TextSuggestion.initialize()
  Yami.VariableGetter.initialize()
  Yami.ActorGetter.initialize()
  Yami.SkillGetter.initialize()
  Yami.StateGetter.initialize()
  Yami.EquipmentGetter.initialize()
  Yami.ItemGetter.initialize()
  Yami.PositionGetter.initialize()
  Yami.AngleGetter.initialize()
  Yami.TriggerGetter.initialize()
  Yami.LightGetter.initialize()
  Yami.ElementGetter.initialize()
  Yami.AncestorGetter.initialize()
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
  Yami.CommandSuggestion.open()
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
      Yami.Window.setPositionMode('absolute')
      Yami.Window.absolutePos.x = point.x + 100
      Yami.Window.absolutePos.y = point.y
      Yami.Window.open(id)
      Yami.Window.setPositionMode('overlap')
      handler.load(params)
    }
  }
  if (handler) return
  const meta = Yami.Data.scripts[id]
  if (meta?.parameters.length > 0 &&
    this.custom.commandNameMap[id]) {
    this.target = target
    this.id = id
    target.scrollAndResize()
    const point = target.getSelectionPosition()
    if (point) {
      Yami.Window.setPositionMode('absolute')
      Yami.Window.absolutePos.x = point.x + 100
      Yami.Window.absolutePos.y = point.y
      Yami.Window.open('scriptCommand')
      Yami.Window.setPositionMode('overlap')
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
        Yami.Window.setPositionMode('absolute')
        Yami.Window.absolutePos.x = point.x + 100
        Yami.Window.absolutePos.y = point.y
        Yami.Window.open(id)
        Yami.Window.setPositionMode('overlap')
        handler.load({})
      }
    } else {
      handler.save()
    }
    return
  }
  const meta = Yami.Data.scripts[id]
  if (meta !== undefined &&
    this.custom.commandNameMap[id]) {
    this.id = id
    if (meta.parameters.length !== 0) {
      const point = this.target.getSelectionPosition()
      if (point) {
        Yami.Window.setPositionMode('absolute')
        Yami.Window.absolutePos.x = point.x + 100
        Yami.Window.absolutePos.y = point.y
        Yami.Window.open('scriptCommand')
        Yami.Window.setPositionMode('overlap')
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
    Yami.Window.close(id)
  } else {
    Yami.Window.close('scriptCommand')
  }
}

// 解析指令
Command.parse = function (command) {
  let id = command.id
  if (id[0] === '!') {
    id = id.slice(1)
  }
  this.invalid = false
  const params = command.params
  const handler = this.cases[id]
  return handler !== undefined
  ? handler.parse(params)
  : this.custom.parse(id, params)
}

// 解析混合模式
Command.parseBlend = function (blend) {
  switch (blend) {
    case 'normal':
      return Yami.Local.get('blend.normal')
    case 'screen':
      return Yami.Local.get('blend.screen')
    case 'additive':
      return Yami.Local.get('blend.additive')
    case 'subtract':
      return Yami.Local.get('blend.subtract')
  }
}

// 解析变量
Command.parseVariable = function (variable) {
  const isConstantKey = !variable.type.includes('[]')
  const key = variable.type === 'global'
  ? this.format
  ? `{variable:${variable.key}}`
  : Command.parseGlobalVariable(variable.key)
  : variable.key
  switch (variable.type.replace('[]', '')) {
    case 'local':
      return isConstantKey ? key : `${Yami.Local.get('variable.local')}[${key}]`
    case 'global':
      return isConstantKey ? `@${key}` : `${Yami.Local.get('variable.global')}[${key}]`
    case 'actor': {
      const actor = Command.parseActor(variable.actor)
      const attrName = Command.parseAttributeKey('actor', key)
      return isConstantKey ? `${actor}.${attrName}` : `${actor}[${attrName}]`
    }
    case 'skill': {
      const skill = Command.parseSkill(variable.skill)
      const attrName = Command.parseAttributeKey('skill', key)
      return isConstantKey ? `${skill}.${attrName}` : `${skill}[${attrName}]`
    }
    case 'state': {
      const state = Command.parseState(variable.state)
      const attrName = Command.parseAttributeKey('state', key)
      return isConstantKey ? `${state}.${attrName}` : `${state}[${attrName}]`
    }
    case 'equipment': {
      const equipment = Command.parseEquipment(variable.equipment)
      const attrName = Command.parseAttributeKey('equipment', key)
      return isConstantKey ? `${equipment}.${attrName}` : `${equipment}[${attrName}]`
    }
    case 'item': {
      const item = Command.parseItem(variable.item)
      const attrName = Command.parseAttributeKey('item', key)
      return isConstantKey ? `${item}.${attrName}` : `${item}[${attrName}]`
    }
    case 'element': {
      const element = Command.parseElement(variable.element)
      const attrName = Command.parseAttributeKey('element', key)
      return isConstantKey ? `${element}.${attrName}` : `${element}[${attrName}]`
    }
  }
}

// 解析全局变量
Command.parseGlobalVariable = function (id) {
  if (id === '') return Yami.Local.get('common.none')
  const variable = Yami.Data.variables.map[id]
  return variable ? variable.name : `#${id}`
}

// 解析属性键
Command.parseAttributeKey = function (group, id) {
  const attr = Yami.Attribute.getGroupAttribute(group, id)
  if (attr) return attr.name
  this.invalid = true
  return `#${id}`
}

// 解析变量标签
Command.parseVariableTag = function IIFE() {
  const regexp = /(?<=<global:)[0-9a-f]{16}(?=>)/g
  const replacer = varKey => {
    const varName = Yami.Data.variables.map[varKey]?.name
    return varName ? '@' + varName : varKey
  }
  return string => string.replace(regexp, replacer)
}(),

// 解析可变数值
Command.parseVariableNumber = function (number, unit) {
  switch (typeof number) {
    case 'number': {
      const text = number.toString()
      return unit ? text + unit : text
    }
    case 'object': {
      const text = this.parseVariable(number)
      return unit ? text + ' ' + unit : text
    }
  }
}

// 解析可变字符串
Command.parseVariableString = function (string) {
  switch (typeof string) {
    case 'string':
      return `"${string}"`
    case 'object':
      return this.parseVariable(string)
  }
}

// 解析可变枚举值
Command.parseVariableEnum = function (groupKey, string) {
  switch (typeof string) {
    case 'string':
      return Command.parseGroupEnumString(groupKey, string)
    case 'object':
      return this.parseVariable(string)
  }
}

// 解析可变文件
Command.parseVariableFile = function (string) {
  switch (typeof string) {
    case 'string':
      return this.parseFileName(string)
    case 'object':
      return this.parseVariable(string)
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
  if (spriteId === '') return Yami.Local.get('common.none')
  const animation = Yami.Data.animations[animationId]
  const sprite = animation?.sprites.find(a => a.id === spriteId)
  if (sprite) return sprite.name
  this.invalid = true
  return Command.parseUnlinkedId(spriteId)
}

// 解析事件类型
Command.parseEventType = function (groupKey, eventType) {
  return Yami.Local.get('eventTypes.' + eventType) ||
  Command.parseGroupEnumString(groupKey, eventType)
}

// 解析枚举字符串
Command.parseEnumString = function (stringId) {
  if (stringId === '') return Yami.Local.get('common.none')
  const string = Yami.Enum.getString(stringId)
  if (string) return string.name
  this.invalid = true
  return Command.parseUnlinkedId(stringId)
}

// 解析群组枚举字符串
Command.parseGroupEnumString = function (groupKey, stringId) {
  if (stringId === '') return Yami.Local.get('common.none')
  const string = Yami.Enum.getGroupString(groupKey, stringId)
  if (string) return string.name
  this.invalid = true
  return Command.parseUnlinkedId(stringId)
}

// 解析列表项目
Command.parseListItem = function (variable, index) {
  const listName = Command.parseVariable(variable)
  const listIndex = Command.parseVariableNumber(index)
  return `${listName}[${listIndex}]`
}

// 解析参数
Command.parseParameter = function (variable, paramName) {
  const label = Yami.Local.get('parameter.param')
  const varName = Command.parseVariable(variable)
  const paramKey = Command.parseVariableString(paramName)
  return `${label}(${varName}, ${paramKey})`
}

// 解析角色
Command.parseActor = function (actor) {
  switch (actor.type) {
    case 'trigger':
      return Yami.Local.get('actor.trigger')
    case 'caster':
      return Yami.Local.get('actor.caster')
    case 'latest':
      return Yami.Local.get('actor.latest')
    case 'player':
      return Yami.Local.get('actor.player')
    case 'member':
      return `${Yami.Local.get('actor.member')}.${actor.memberId + 1}`
    case 'global':
      return Command.parseFileName(actor.actorId)
    case 'by-id': {
      const label = Yami.Local.get('actor.common')
      const prop = Yami.Local.get('actor.by-id')
      const preset = Command.parsePresetObject(actor.presetId)
      return `${label}(${prop}:${preset})`
    }
    case 'by-name': {
      const label = Yami.Local.get('actor.common')
      const prop = Yami.Local.get('actor.by-name')
      const name = Command.parseObjectName(actor.name)
      return `${label}(${prop}:${name})`
    }
    case 'variable': {
      const label = Yami.Local.get('actor.common')
      const prop = Yami.Local.get('actor.variable')
      const variable = Command.parseVariable(actor.variable)
      return `${label}(${prop}:${variable})`
    }
  }
}

// 解析技能
Command.parseSkill = function (skill) {
  switch (skill.type) {
    case 'trigger':
      return Yami.Local.get('skill.trigger')
    case 'latest':
      return Yami.Local.get('skill.latest')
    case 'by-key': {
      const actor = Command.parseActor(skill.actor)
      const label = Yami.Local.get('skill.common')
      const prop = Yami.Local.get('skill.by-key')
      const key = Command.parseGroupEnumString('shortcut-key', skill.key)
      return `${actor} -> ${label}(${prop}:${key})`
    }
    case 'variable': {
      const label = Yami.Local.get('skill.common')
      const prop = Yami.Local.get('skill.variable')
      const variable = Command.parseVariable(skill.variable)
      return `${label}(${prop}:${variable})`
    }
  }
}

// 解析状态
Command.parseState = function (state) {
  switch (state.type) {
    case 'trigger':
      return Yami.Local.get('state.trigger')
    case 'latest':
      return Yami.Local.get('state.latest')
    case 'variable': {
      const label = Yami.Local.get('state.common')
      const prop = Yami.Local.get('state.variable')
      const variable = Command.parseVariable(state.variable)
      return `${label}(${prop}:${variable})`
    }
  }
}

// 解析装备
Command.parseEquipment = function (equipment) {
  switch (equipment.type) {
    case 'trigger':
      return Yami.Local.get('equipment.trigger')
    case 'latest':
      return Yami.Local.get('equipment.latest')
    case 'by-slot': {
      const actor = Command.parseActor(equipment.actor)
      const label = Yami.Local.get('equipment.common')
      const prop = Yami.Local.get('equipment.by-slot')
      const slot = Command.parseGroupEnumString('equipment-slot', equipment.slot)
      return `${actor} -> ${label}(${prop}:${slot})`
    }
    case 'variable': {
      const label = Yami.Local.get('equipment.common')
      const prop = Yami.Local.get('equipment.variable')
      const variable = Command.parseVariable(equipment.variable)
      return `${label}(${prop}:${variable})`
    }
  }
}

// 解析物品
Command.parseItem = function (item) {
  switch (item.type) {
    case 'trigger':
      return Yami.Local.get('item.trigger')
    case 'latest':
      return Yami.Local.get('item.latest')
    case 'by-key': {
      const actor = Command.parseActor(item.actor)
      const label = Yami.Local.get('item.common')
      const prop = Yami.Local.get('item.by-key')
      const key = Command.parseGroupEnumString('shortcut-key', item.key)
      return `${actor} -> ${label}(${prop}:${key})`
    }
    case 'variable': {
      const label = Yami.Local.get('item.common')
      const prop = Yami.Local.get('item.variable')
      const variable = Command.parseVariable(item.variable)
      return `${label}(${prop}:${variable})`
    }
  }
}

// 解析区域
Command.parseRegion = function (regionId) {
  return this.parsePresetObject(regionId)
}

// 解析位置
Command.parsePosition = function (position) {
  switch (position.type) {
    case 'absolute': {
      const x = this.parseVariableNumber(position.x)
      const y = this.parseVariableNumber(position.y)
      return `${Yami.Local.get('position.common')}(${x}, ${y})`
    }
    case 'relative': {
      const x = this.parseVariableNumber(position.x)
      const y = this.parseVariableNumber(position.y)
      return `${Yami.Local.get('position.relative')}(${x}, ${y})`
    }
    case 'actor':
      return `${Yami.Local.get('position.common')}(${this.parseActor(position.actor)})`
    case 'trigger':
      return `${Yami.Local.get('position.common')}(${this.parseTrigger(position.trigger)})`
    case 'light':
      return `${Yami.Local.get('position.common')}(${this.parseLight(position.light)})`
    case 'region':
      return `${Yami.Local.get('position.common')}(${this.parseRegion(position.regionId)})`
  }
}

// 解析角度
Command.parseAngle = function (angle) {
  const type = angle.type
  const desc = Yami.Local.get('angle.' + type)
  switch (type) {
    case 'position':
      return `${desc} ${this.parsePosition(angle.position)}`
    case 'absolute':
      return `${desc} ${this.parseDegrees(this.parseVariableNumber(angle.degrees))}`
    case 'relative':
      return `${desc} ${this.parseDegrees(this.parseVariableNumber(angle.degrees))}`
    case 'direction':
      return `${desc} ${this.parseDegrees(angle.degrees)}`
    case 'random':
      return desc
  }
}

// 解析角度字面值
Command.parseDegrees = function (degrees) {
  return `${degrees}°`
}

// 解析触发器
Command.parseTrigger = function (trigger) {
  switch (trigger.type) {
    case 'trigger':
      return Yami.Local.get('trigger.trigger')
    case 'latest':
      return Yami.Local.get('trigger.latest')
    case 'variable': {
      const label = Yami.Local.get('trigger.common')
      const prop = Yami.Local.get('trigger.variable')
      const variable = Command.parseVariable(trigger.variable)
      return `${label}(${prop}:${variable})`
    }
  }
}

// 解析光源
Command.parseLight = function (light) {
  switch (light.type) {
    case 'trigger':
      return Yami.Local.get('light.trigger')
    case 'latest':
      return Yami.Local.get('light.latest')
    case 'by-id': {
      const label = Yami.Local.get('light.common')
      const prop = Yami.Local.get('light.by-id')
      const preset = Command.parsePresetObject(light.presetId)
      return `${label}(${prop}:${preset})`
    }
    case 'by-name': {
      const label = Yami.Local.get('light.common')
      const prop = Yami.Local.get('light.by-name')
      return `${label}(${prop}:"${light.name}")`
    }
    case 'variable': {
      const label = Yami.Local.get('light.common')
      const prop = Yami.Local.get('light.variable')
      const variable = Command.parseVariable(light.variable)
      return `${label}(${prop}:${variable})`
    }
  }
}

// 解析元素
Command.parseElement = function (element) {
  switch (element.type) {
    case 'trigger':
      return Yami.Local.get('element.trigger')
    case 'latest':
      return Yami.Local.get('element.latest')
    case 'by-id': {
      const label = Yami.Local.get('element.common')
      const prop = Yami.Local.get('element.by-id')
      const preset = Command.parsePresetElement(element.presetId, false)
      return `${label}(${prop}:${preset})`
    }
    case 'by-name': {
      const label = Yami.Local.get('element.common')
      const prop = Yami.Local.get('element.by-name')
      return `${label}(${prop}:"${element.name}")`
    }
    case 'by-ancestor-and-id': {
      const ancestor = Command.parseElement(element.ancestor)
      const label = Yami.Local.get('element.common')
      const prop = Yami.Local.get('element.by-id')
      const preset = Command.parsePresetElement(element.presetId, false)
      const descendant = `${label}(${prop}:${preset})`
      return `${ancestor} -> ${descendant}`
    }
    case 'by-ancestor-and-name': {
      const ancestor = Command.parseElement(element.ancestor)
      const label = Yami.Local.get('element.common')
      const prop = Yami.Local.get('element.by-name')
      const descendant = `${label}(${prop}:"${element.name}")`
      return `${ancestor} -> ${descendant}`
    }
    case 'variable': {
      const label = Yami.Local.get('element.common')
      const prop = Yami.Local.get('element.variable')
      const variable = Command.parseVariable(element.variable)
      return `${label}(${prop}:${variable})`
    }
  }
}

// 解析预设对象
Command.parsePresetObject = function (presetId) {
  if (presetId === '') return Yami.Local.get('common.none')
  const name = Yami.Scene.presets?.[presetId]?.name
  return name ?? Command.parseUnlinkedId(presetId)
}

// 解析预设元素
Command.parsePresetElement = function IIFE() {
  const find = (nodes, presetId) => {
    for (const node of nodes) {
      if (node.presetId === presetId) {
        return node
      }
      const {children} = node
      if (children.length !== 0) {
        const target = find(children, presetId)
        if (target !== undefined) return target
      }
    }
    return undefined
  }
  return function (presetId, detailed = true) {
    if (presetId === '') {
      return Yami.Local.get('common.none')
    }
    const uiId = Yami.Data.uiLinks[presetId] ?? ''
    const uiName = Command.parseFileName(uiId)
    let presetName
    const ui = Yami.Data.ui[uiId]
    if (ui !== undefined) {
      const node = find(ui.nodes, presetId)
      if (node) presetName = node.name
    }
    if (presetName === undefined) {
      presetName = Command.parseUnlinkedId(presetId)
    }
    switch (detailed) {
      case true:
        return `${uiName} {${presetName}}`
      case false:
        return presetName
    }
  }
}()

// 解析队伍
Command.parseTeam = function (id) {
  const team = Yami.Data.teams.map[id]
  return team ? team.name : `#${id}`
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
      return Yami.Local.get('actorFilter.' + selector)
  }
}

// 解析文件名称
Command.parseFileName = function (id) {
  if (id === '') return Yami.Local.get('common.none')
  const meta = Yami.Data.manifest.guidMap[id]
  if (meta) return Yami.File.parseMetaName(meta)
  this.invalid = true
  return `#${id}`
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
      return 'SE'
    case 'all':
      return 'ALL'
  }
}

// 解析等待参数
Command.parseWait = function (wait) {
  switch (wait) {
    case false: return ''
    case true:  return Yami.Local.get('transition.wait')
  }
}

// 解析过渡方式
Command.parseEasing = function (easingId, duration, wait) {
  if (duration === 0) return ''
  const easing = Yami.Data.easings.map[easingId]
  const time = Command.parseVariableNumber(duration, 'ms')
  const info = `${easing?.name ?? `#${easingId}`}, ${time}`
  return wait ? `${info}, ${Yami.Local.get('transition.wait')}` : info
}

// 解析失去连接的ID
Command.parseUnlinkedId = function (name) {
  return name ? `#${name}` : ''
}

// 解析对象名称
Command.parseObjectName = function (name) {
  switch (typeof name) {
    case 'string':
      return `"${name}"`
    case 'object':
      return this.parseVariable(name)
  }
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
  join(joint = ', ') {
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

// 格式更新器类
Command.FormatUpdater = class FormatUpdater {
  format  //:string
  element //:element
  items   //:array

  constructor(format, element, tags) {
    this.format = format
    this.element = element
    this.items = []
    for (const tag of tags) {
      const start = tag.lastIndexOf(':') + 1
      const id = tag.slice(start, -1)
      const item = {
        id: id,
        tag: tag,
        key: null,
        name: null,
        text: null,
      }
      this.items.push(item)
      if (tag.indexOf('variable') !== -1) {
        item.key = 'variable'
        continue
      }
    }
  }

  // 更新文本
  update() {
    let changed = false
    const items = this.items
    for (const item of items) {
      const {key, id} = item
      switch (key) {
        case 'variable': {
          const name = Yami.Data.variables.map[id]?.name
          if (item.name !== name) {
            item.name = name
            item.text = Command.parseGlobalVariable(id)
            changed = true
          }
          break
        }
      }
    }
    if (changed) {
      let string = this.format
      for (const {tag, text} of items) {
        string = string.replace(tag, text)
      }
      this.element.textContent = string
    }
  }

  // 静态 - 正则表达式
  static regexp = /\{(?:variable):[\da-f]{16}\}/g

  // 静态 - 创建实例
  static create(format, element) {
    const regexp = this.regexp
    const tags = format.match(regexp)
    if (tags === null) return null
    return new FormatUpdater(format, element, tags)
  }
}

// 显示文本
Command.cases.showText = {
  latinCharWidth: 0,
  otherCharWidth: 0,
  initialize: function () {
    $('#showText-confirm').on('click', this.save)
  },
  parse: function ({parameters, content}) {
    const alias = Yami.Local.get('command.showText.alias')
    const contents = !parameters ? [] : [
      {color: 'element'},
      {text: alias + ': '},
      {color: 'gray'},
      {text: parameters},
    ]
    content = Command.parseVariableTag(content)
    this.appendTextLines(contents, alias, content)
    return contents
  },
  load: function ({parameters = '', content = ''}) {
    $('#showText-parameters').write(parameters)
    $('#showText-content').write(content)
    $('#showText-parameters').getFocus('end')
  },
  save: function () {
    const parameters = $('#showText-parameters').read()
    const content = $('#showText-content').read()
    if (content === '') {
      return $('#showText-content').getFocus()
    }
    Command.save({parameters, content})
  },
  updateCharWidth: function () {
    if (this.latinCharWidth === 0) {
      const latinChars = '          '
      const otherChars = '　　　　　　　　　　'
      const font = 'var(--font-family-mono)'
      this.latinCharWidth = Yami.measureText(latinChars, font).width / 10
      this.otherCharWidth = Yami.measureText(otherChars, font).width / 10
    }
  },
  appendTextLines: function IIFE() {
    const append = (contents, tag, text) => {
      if (contents.length === 0) {
        contents.push(
          {color: 'element'},
          {text: `${tag}: `},
          {color: 'text'},
          {text: text},
        )
      } else {
        contents.push(
          {break: true},
          {color: 'transparent'},
          {text: tag},
          {color: 'element'},
          {text: ': '},
          {color: 'text'},
          {text: text},
        )
      }
    }
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

    // 清理内存 - 窗口已关闭事件
    $('#showChoices').on('closed', event => {
      this.choices = null
    })
  },
  choices: null,
  parse: function ({choices, parameters}) {
    const contents = [
      {color: 'flow'},
      {text: Yami.Local.get('command.showChoices') + ': '},
      {color: 'text'},
    ]
    // 添加选项内容
    const words = Command.words
    for (const choice of choices) {
      words.push(choice.content)
    }
    contents.push(
      {text: words.join()}
    )
    // 添加参数内容
    if (parameters) {
      contents.push(
        {color: 'gray'},
        {text: ` (${parameters})`},
      )
    }
    contents.push({color: 'flow'})
    // 换行
    contents.push({break: true})
    // 添加选项分支内容
    const when = Yami.Local.get('command.showChoices.when')
    for (const choice of choices) {
      contents.push(
        {color: 'flow'},
        {text: when + ' '},
        {color: 'text'},
        {text: choice.content},
        {children: choice.commands},
      )
    }
    contents.push({text: Yami.Local.get('command.showChoices.end')})
    return contents
  },
  createDefaultChoices: function () {
    return [{
      content: 'Yes',
      commands: [],
    },
    {
      content: 'No',
      commands: [],
    }]
  },
  load: function ({
    choices     = this.createDefaultChoices(),
    parameters  = '',
  }) {
    const write = Yami.getElementWriter('showChoices')
    write('choices-0', choices[0]?.content ?? '')
    write('choices-1', choices[1]?.content ?? '')
    write('choices-2', choices[2]?.content ?? '')
    write('choices-3', choices[3]?.content ?? '')
    write('parameters', parameters)
    Command.cases.showChoices.choices = choices
    $('#showChoices-choices-0').getFocus()
  },
  save: function () {
    const read = Yami.getElementReader('showChoices')
    const choices = []
    for (let i = 0; i < 4; i++) {
      const content = read('choices-' + i)
      if (content) {
        choices.push({
          content: content,
          // 继承上一次的事件指令列表
          commands: Command.cases.showChoices.choices[i]?.commands ?? []
        })
      }
    }
    if (choices.length === 0) {
      return $('#showChoices-choices-0').getFocus()
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
    ])

    // 创建布尔值常量选项
    $('#setBoolean-constant-value').loadItems([
      {name: 'False', value: false},
      {name: 'True', value: true},
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
        $('#setBoolean-common-variable'),
        $('#setBoolean-parameter-paramName'),
      ]},
    ])
  },
  parseOperation: function (operation) {
    switch (operation) {
      case 'set': return '='
      case 'not': return '=!'
      case 'and': return '&='
      case 'or': return '|='
      case 'xor': return '^='
    }
  },
  parseOperand: function (operand) {
    switch (operand.type) {
      case 'constant':
        return operand.value.toString()
      case 'variable':
        return Command.parseVariable(operand.variable)
      case 'list':
        return Command.parseListItem(operand.variable, operand.index)
      case 'parameter':
        return Command.parseParameter(operand.variable, operand.paramName)
    }
  },
  parse: function ({variable, operation, operand}) {
    const varDesc = Command.parseVariable(variable)
    const operator = this.parseOperation(operation)
    const value = this.parseOperand(operand)
    return [
      {color: 'variable'},
      {text: Yami.Local.get('command.setBoolean.alias') + ': '},
      {text: `${varDesc} ${operator} ${value}`},
    ]
  },
  load: function ({
    variable  = {type: 'local', key: ''},
    operation = 'set',
    operand   = {type: 'constant', value: false},
  }) {
    const write = Yami.getElementWriter('setBoolean')
    let constantValue = false
    let commonVariable = {type: 'local', key: ''}
    let listIndex = 0
    let parameterParamName = ''
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
        commonVariable = operand.variable
        parameterParamName = operand.paramName
        break
    }
    write('variable', variable)
    write('operation', operation)
    write('operand-type', operand.type)
    write('constant-value', constantValue)
    write('common-variable', commonVariable)
    write('list-index', listIndex)
    write('parameter-paramName', parameterParamName)
    $('#setBoolean-variable').getFocus()
  },
  save: function () {
    const read = Yami.getElementReader('setBoolean')
    const variable = read('variable')
    if (Yami.VariableGetter.isNone(variable)) {
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
        if (Yami.VariableGetter.isNone(variable)) {
          return $('#setBoolean-common-variable').getFocus()
        }
        operand = {type, variable}
        break
      }
      case 'list': {
        const variable = read('common-variable')
        if (Yami.VariableGetter.isNone(variable)) {
          return $('#setBoolean-common-variable').getFocus()
        }
        const index = read('list-index')
        operand = {type, variable, index}
        break
      }
      case 'parameter': {
        const variable = read('common-variable')
        const paramName = read('parameter-paramName')
        if (Yami.VariableGetter.isNone(variable)) {
          return $('#setBoolean-common-variable').getFocus()
        }
        if (paramName === '') {
          return $('#setBoolean-parameter-paramName').getFocus()
        }
        operand = {type, variable, paramName}
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
    $('#setNumber-operands').bind(Yami.NumberOperand)

    // 清理内存 - 窗口已关闭事件
    $('#setNumber').on('closed', event => {
      $('#setNumber-operands').clear()
    })
  },
  parseOperation: function (operation) {
    switch (operation) {
      case 'set': return '='
      case 'add': return '+='
      case 'sub': return '-='
      case 'mul': return '*='
      case 'div': return '/='
      case 'mod': return '%='
    }
  },
  parseOperands: function (operands) {
    let expression = ''
    let currentPriority
    let nextPriority = false
    const length = operands.length
    for (let i = 0; i < length; i++) {
      const operand = operands[i]
      let operandName = Yami.NumberOperand.parseOperand(operand)
      if (i !== 0) switch (operand.operation.replace('()', '')) {
        case 'add': expression += ' + '; break
        case 'sub': expression += ' - '; break
        case 'mul': expression += ' * '; break
        case 'div': expression += ' / '; break
        case 'mod': expression += ' % '; break
      }
      currentPriority = nextPriority
      nextPriority = operands[i + 1]?.operation.includes('()')
      if (!currentPriority && nextPriority) {
        operandName = '(' + operandName
      }
      if (currentPriority && !nextPriority) {
        operandName = operandName + ')'
      }
      expression += operandName
    }
    return expression
  },
  parse: function ({variable, operation, operands}) {
    const varDesc = Command.parseVariable(variable)
    const operator = this.parseOperation(operation)
    const expression = this.parseOperands(operands)
    return [
      {color: 'variable'},
      {text: Yami.Local.get('command.setNumber.alias') + ': '},
      {text: `${varDesc} ${operator} ${expression}`},
    ]
  },
  load: function ({
    variable  = {type: 'local', key: ''},
    operation = 'set',
    operands  = [{operation: 'add', type: 'constant', value: 0}],
  }) {
    const write = Yami.getElementWriter('setNumber')
    write('variable', variable)
    write('operation', operation)
    write('operands', operands.slice())
    $('#setNumber-variable').getFocus()
  },
  save: function () {
    const read = Yami.getElementReader('setNumber')
    const variable = read('variable')
    if (Yami.VariableGetter.isNone(variable)) {
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
      {name: 'String', value: 'string'},
      {name: 'Enumeration', value: 'enum'},
      {name: 'Object', value: 'object'},
      {name: 'Element', value: 'element'},
      {name: 'List', value: 'list'},
      {name: 'Parameter', value: 'parameter'},
      {name: 'Other', value: 'other'},
    ])

    // 设置类型关联元素
    $('#setString-operand-type').enableHiddenMode().relate([
      {case: 'constant', targets: [
        $('#setString-operand-constant-value'),
      ]},
      {case: 'variable', targets: [
        $('#setString-operand-common-variable'),
      ]},
      {case: 'string', targets: [
        $('#setString-operand-string-method'),
        $('#setString-operand-common-variable'),
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
        $('#setString-operand-common-variable'),
        $('#setString-operand-parameter-paramName'),
      ]},
      {case: 'other', targets: [
        $('#setString-operand-other-data'),
      ]},
    ])

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
      {name: 'Actor - File ID', value: 'actor-file-id'},
      {name: 'Actor - Portrait ID', value: 'actor-portrait-id'},
      {name: 'Actor - Anim Motion Name', value: 'actor-animation-motion-name'},
      {name: 'Skill - File ID', value: 'skill-file-id'},
      {name: 'Skill - Key Name', value: 'skill-key'},
      {name: 'State - File ID', value: 'state-file-id'},
      {name: 'Equipment - File ID', value: 'equipment-file-id'},
      {name: 'Equipment - Key Name', value: 'equipment-key'},
      {name: 'Item - File ID', value: 'item-file-id'},
      {name: 'Item - Key Name', value: 'item-key'},
      {name: 'File - ID', value: 'file-id'},
    ])

    // 设置对象属性关联元素
    $('#setString-operand-object-property').enableHiddenMode().relate([
      {case: ['actor-file-id', 'actor-portrait-id', 'actor-animation-motion-name'], targets: [
        $('#setString-operand-common-actor'),
      ]},
      {case: ['skill-file-id', 'skill-key'], targets: [
        $('#setString-operand-common-skill'),
      ]},
      {case: 'state-file-id', targets: [
        $('#setString-operand-common-state'),
      ]},
      {case: ['equipment-file-id', 'equipment-key'], targets: [
        $('#setString-operand-common-equipment'),
      ]},
      {case: ['item-file-id', 'item-key'], targets: [
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
      {name: 'Parse Timestamp', value: 'parse-timestamp'},
      {name: 'Screenshot(Base64)', value: 'screenshot'},
      {name: 'ShowText Parameters', value: 'showText-parameters'},
      {name: 'ShowText Content', value: 'showText-content'},
      {name: 'ShowChoices Parameters', value: 'showChoices-parameters'},
      {name: 'ShowChoices Content 1', value: 'showChoices-content-0'},
      {name: 'ShowChoices Content 2', value: 'showChoices-content-1'},
      {name: 'ShowChoices Content 3', value: 'showChoices-content-2'},
      {name: 'ShowChoices Content 4', value: 'showChoices-content-3'},
    ])

    // 设置其他数据关联元素
    $('#setString-operand-other-data').enableHiddenMode().relate([
      {case: 'parse-timestamp', targets: [
        $('#setString-operand-parse-timestamp-variable'),
        $('#setString-operand-parse-timestamp-format')
      ]},
      {case: 'screenshot', targets: [
        $('#setString-operand-screenshot-width'),
        $('#setString-operand-screenshot-height')
      ]},
    ])
  },

  // 解析指令
  parse: function ({variable, operation, operand}) {
    const varDesc = Command.parseVariable(variable)
    const operator = this.parseOperation(operation)
    const expression = this.parseOperand(operand)
    return [
      {color: 'variable'},
      {text: Yami.Local.get('command.setString.alias') + ': '},
      {text: `${varDesc} ${operator} ${expression}`},
    ]
  },

  // 加载数据
  load: function ({
    variable  = {type: 'local', key: ''},
    operation = 'set',
    operand   = {type: 'constant', value: ''},
  }) {
    // 写入数据
    let constantValue = ''
    let stringMethod = 'char'
    let commonVariable = {type: 'local', key: ''}
    let stringCharIndex = 0
    let stringSliceBegin = 0
    let stringSliceEnd = 0
    let stringPadStartLength = 2
    let stringPadStartPad = '0'
    let stringReplacePattern = ''
    let stringReplaceReplacement = ''
    let enumStringId = ''
    let objectProperty = 'actor-file-id'
    let elementProperty = 'text-content'
    let elementElement = {type: 'trigger'}
    let commonActor = {type: 'trigger'}
    let commonSkill = {type: 'trigger'}
    let commonState = {type: 'trigger'}
    let commonEquipment = {type: 'trigger'}
    let commonItem = {type: 'trigger'}
    let objectFileId = ''
    let listIndex = 0
    let parameterParamName = ''
    let otherData = 'trigger-key'
    let parseTimestampVariable = {type: 'local', key: ''}
    let parseTimestampFormat = '{Y}-{M}-{D} {h}:{m}:{s}'
    let screenshotWidth = 320
    let screenshotHeight = 180
    switch (operand.type) {
      case 'constant':
        constantValue = operand.value
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
      case 'enum':
        enumStringId = operand.stringId
        break
      case 'object':
        objectProperty = operand.property
        commonActor = operand.actor ?? commonActor
        commonSkill = operand.skill ?? commonSkill
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
        commonVariable = operand.variable
        parameterParamName = operand.paramName
        break
      case 'other':
        otherData = operand.data
        parseTimestampVariable = operand.variable ?? parseTimestampVariable
        parseTimestampFormat = operand.format ?? parseTimestampFormat
        screenshotWidth = operand.width ?? screenshotWidth
        screenshotHeight = operand.height ?? screenshotHeight
        break
    }
    const write = Yami.getElementWriter('setString')
    write('variable', variable)
    write('operation', operation)
    write('operand-type', operand.type)
    write('operand-constant-value', constantValue)
    write('operand-string-method', stringMethod)
    write('operand-common-variable', commonVariable)
    write('operand-string-char-index', stringCharIndex)
    write('operand-string-slice-begin', stringSliceBegin)
    write('operand-string-slice-end', stringSliceEnd)
    write('operand-string-pad-start-length', stringPadStartLength)
    write('operand-string-pad-start-pad', stringPadStartPad)
    write('operand-string-replace-pattern', stringReplacePattern)
    write('operand-string-replace-replacement', stringReplaceReplacement)
    write('operand-enum-stringId', enumStringId)
    write('operand-object-property', objectProperty)
    write('operand-element-property', elementProperty)
    write('operand-element-element', elementElement)
    write('operand-common-actor', commonActor)
    write('operand-common-skill', commonSkill)
    write('operand-common-state', commonState)
    write('operand-common-equipment', commonEquipment)
    write('operand-common-item', commonItem)
    write('operand-object-fileId', objectFileId)
    write('operand-list-index', listIndex)
    write('operand-parameter-paramName', parameterParamName)
    write('operand-other-data', otherData)
    write('operand-parse-timestamp-variable', parseTimestampVariable)
    write('operand-parse-timestamp-format', parseTimestampFormat)
    write('operand-screenshot-width', screenshotWidth)
    write('operand-screenshot-height', screenshotHeight)
    $('#setString-variable').getFocus()
  },

  // 保存数据
  save: function () {
    const read = Yami.getElementReader('setString')
    const variable = read('variable')
    if (Yami.VariableGetter.isNone(variable)) {
      return $('#setString-variable').getFocus()
    }
    const operation = read('operation')
    const type = read('operand-type')
    let operand
    switch (type) {
      case 'constant': {
        const value = read('operand-constant-value')
        operand = {type, value}
        break
      }
      case 'variable': {
        const variable = read('operand-common-variable')
        if (Yami.VariableGetter.isNone(variable)) {
          return $('#setString-operand-common-variable').getFocus()
        }
        operand = {type, variable}
        break
      }
      case 'string': {
        const method = read('operand-string-method')
        const variable = read('operand-common-variable')
        if (Yami.VariableGetter.isNone(variable)) {
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
          case 'actor-file-id':
          case 'actor-portrait-id':
          case 'actor-animation-motion-name': {
            const actor = read('operand-common-actor')
            operand = {type, property, actor}
            break
          }
          case 'skill-file-id':
          case 'skill-key': {
            const skill = read('operand-common-skill')
            operand = {type, property, skill}
            break
          }
          case 'state-file-id': {
            const state = read('operand-common-state')
            operand = {type, property, state}
            break
          }
          case 'equipment-file-id':
          case 'equipment-key': {
            const equipment = read('operand-common-equipment')
            operand = {type, property, equipment}
            break
          }
          case 'item-file-id':
          case 'item-key': {
            const item = read('operand-common-item')
            operand = {type, property, item}
            break
          }
          case 'file-id': {
            const fileId = read('operand-object-fileId')
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
        if (Yami.VariableGetter.isNone(variable)) {
          return $('#setString-operand-common-variable').getFocus()
        }
        operand = {type, variable, index}
        break
      }
      case 'parameter': {
        const variable = read('operand-common-variable')
        const paramName = read('operand-parameter-paramName')
        if (Yami.VariableGetter.isNone(variable)) {
          return $('#setString-operand-common-variable').getFocus()
        }
        if (paramName === '') {
          return $('#setString-operand-parameter-paramName').getFocus()
        }
        operand = {type, variable, paramName}
        break
      }
      case 'other': {
        const data = read('operand-other-data')
        switch (data) {
          case 'parse-timestamp': {
            const variable = read('operand-parse-timestamp-variable')
            const format = read('operand-parse-timestamp-format')
            if (Yami.VariableGetter.isNone(variable)) {
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
      case 'set': return '='
      case 'add': return '+='
    }
  },

  // 解析字符串方法
  parseStringMethod: function (operand) {
    const method = operand.method
    const variable = operand.variable
    const methodName = Yami.Local.get('command.setString.string.' + method)
    const varName = Command.parseVariable(variable)
    switch (method) {
      case 'char': {
        const index = Command.parseVariableNumber(operand.index)
        return `${methodName}(${varName}, ${index})`
      }
      case 'slice': {
        const begin = Command.parseVariableNumber(operand.begin)
        const end = Command.parseVariableNumber(operand.end)
        return `${methodName}(${varName}, ${begin}, ${end})`
      }
      case 'pad-start': {
        const length = operand.length
        const pad = Command.parseVariableString(operand.pad)
        return `${methodName}(${varName}, ${length}, ${pad})`
      }
      case 'replace':
      case 'replace-all': {
        const pattern = Command.parseVariableString(operand.pattern)
        const replacement = Command.parseVariableString(operand.replacement)
        return `${methodName}(${varName}, ${pattern}, ${replacement})`
      }
    }
  },

  // 解析枚举字符串
  parseEnumString: function (operand) {
    const name = Command.parseEnumString(operand.stringId)
    return `${Yami.Local.get('command.setString.enum')}(${name})`
  },

  // 解析对象属性
  parseObjectProperty: function (operand) {
    const property = Yami.Local.get('command.setString.object.' + operand.property)
    switch (operand.property) {
      case 'actor-file-id':
      case 'actor-portrait-id':
      case 'actor-animation-motion-name':
        return `${Command.parseActor(operand.actor)} -> ${property}`
      case 'skill-file-id':
      case 'skill-key':
        return `${Command.parseSkill(operand.skill)} -> ${property}`
      case 'state-file-id':
        return `${Command.parseState(operand.state)} -> ${property}`
      case 'equipment-file-id':
      case 'equipment-key':
        return `${Command.parseEquipment(operand.equipment)} -> ${property}`
      case 'item-file-id':
      case 'item-key':
        return `${Command.parseItem(operand.item)} -> ${property}`
      case 'file-id':
        return `${Command.parseFileName(operand.fileId)} -> ${property}`
    }
  },

  // 解析元素属性
  parseElementProperty: function (operand) {
    const element = Command.parseElement(operand.element)
    const property = Yami.Local.get('command.setString.element.' + operand.property)
    return `${element} -> ${property}`
  },

  // 解析其他数据
  parseOther: function (operand) {
    const label = Yami.Local.get('command.setString.other.' + operand.data)
    switch (operand.data) {
      case 'trigger-key':
      case 'showText-parameters':
      case 'showText-content':
      case 'showChoices-parameters':
      case 'showChoices-content-0':
      case 'showChoices-content-1':
      case 'showChoices-content-2':
      case 'showChoices-content-3':
        return label
      case 'parse-timestamp': {
        const variable = Command.parseVariable(operand.variable)
        const format = Command.parseVariableString(operand.format)
        return `${label}(${variable}, ${format})`
      }
      case 'screenshot':
        return `${label}(${operand.width}, ${operand.height})`
    }
  },

  // 解析操作数
  parseOperand: function (operand) {
    switch (operand.type) {
      case 'constant':
        return `"${Command.parseMultiLineString(operand.value)}"`
      case 'variable':
        return Command.parseVariable(operand.variable)
      case 'string':
        return this.parseStringMethod(operand)
      case 'enum':
        return this.parseEnumString(operand)
      case 'object':
        return this.parseObjectProperty(operand)
      case 'element':
        return this.parseElementProperty(operand)
      case 'list':
        return Command.parseListItem(operand.variable, operand.index)
      case 'parameter':
        return Command.parseParameter(operand.variable, operand.paramName)
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
        return Yami.Local.get('common.none')
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
        return Command.parseVariable(operand.variable)
      case 'list':
        return Command.parseListItem(operand.variable, operand.index)
    }
  },
  parse: function ({variable, operand}) {
    const varDesc = Command.parseVariable(variable)
    const object = this.parseOperand(operand)
    return [
      {color: 'variable'},
      {text: Yami.Local.get('command.setObject.alias') + ': '},
      {text: `${varDesc} = ${object}`},
    ]
  },
  load: function ({
    variable  = {type: 'local', key: ''},
    operand   = {type: 'none'},
  }) {
    const write = Yami.getElementWriter('setObject')
    let operandActor = {type: 'trigger'}
    let operandSkill = {type: 'trigger'}
    let operandState = {type: 'trigger'}
    let operandEquipment = {type: 'trigger'}
    let operandItem = {type: 'trigger'}
    let operandTrigger = {type: 'trigger'}
    let operandLight = {type: 'trigger'}
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
    write('operand-element', operandElement)
    write('operand-variable', operandVariable)
    write('operand-list-index', operandListIndex)
    $('#setObject-variable').getFocus()
  },
  save: function () {
    const read = Yami.getElementReader('setObject')
    const variable = read('variable')
    if (Yami.VariableGetter.isNone(variable)) {
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
      case 'element': {
        const element = read('operand-element')
        operand = {type, element}
        break
      }
      case 'variable': {
        const variable = read('operand-variable')
        if (Yami.VariableGetter.isNone(variable)) {
          return $('#setObject-operand-variable').getFocus()
        }
        operand = {type, variable}
        break
      }
      case 'list': {
        const variable = read('operand-variable')
        if (Yami.VariableGetter.isNone(variable)) {
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
      {name: 'Read Variable', value: 'set-variable'},
      {name: 'Push', value: 'push'},
      {name: 'Remove', value: 'remove'},
      {name: 'Split String', value: 'split'},
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
      {case: ['push', 'remove'], targets: [
        $('#setList-operand'),
      ]},
      {case: 'split', targets: [
        $('#setList-operand'),
        $('#setList-separator'),
      ]},
    ])

    // 创建布尔值常量选项
    $('#setList-boolean').loadItems([
      {name: 'False', value: false},
      {name: 'True', value: true},
    ])
  },
  parse: function ({variable, operation, list, index, constant, operand, separator}) {
    let info
    const varName = Command.parseVariable(variable)
    switch (operation) {
      case 'set-empty':
        info = `${varName} = []`
        break
      case 'set-numbers':
        info = `${varName} = [${Command.parseMultiLineString(list.join(', '))}]`
        break
      case 'set-strings': {
        let values = ''
        if (list.length !== 0) {
          values = `"${Command.parseMultiLineString(list.join('", "'))}"`
        }
        info = `${varName} = [${values}]`
        break
      }
      case 'set-boolean':
        info = `${varName}[${Command.parseVariableNumber(index)}] = ${constant}`
        break
      case 'set-number':
        info = `${varName}[${Command.parseVariableNumber(index)}] = ${constant}`
        break
      case 'set-string':
        info = `${varName}[${Command.parseVariableNumber(index)}] = "${Command.parseMultiLineString(constant)}"`
        break
      case 'set-variable':
        info = `${varName}[${Command.parseVariableNumber(index)}] = ${Command.parseVariable(operand)}`
        break
      case 'push':
        info = `${varName} += ${Command.parseVariable(operand)}`
        break
      case 'remove':
        info = `${varName} -= ${Command.parseVariable(operand)}`
        break
      case 'split': {
        const label = Yami.Local.get('command.setList.split')
        const text1 = Command.parseVariable(operand)
        const text2 = Command.parseVariableString(separator)
        info = `${varName} = ${label}(${text1}, ${text2})`
        break
      }
    }
    return [
      {color: 'variable'},
      {text: Yami.Local.get('command.setList.alias') + ': '},
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
    separator = ''
  }) {
    let numbers = []
    let strings = []
    let boolean = false
    let number = 0
    let string = ''
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
    }
    const write = Yami.getElementWriter('setList')
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
    $('#setList-variable').getFocus()
  },
  save: function () {
    const read = Yami.getElementReader('setList')
    const variable = read('variable')
    if (Yami.VariableGetter.isNone(variable)) {
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
        if (Yami.VariableGetter.isNone(operand)) {
          return $('#setList-operand').getFocus()
        }
        Command.save({variable, operation, index, operand})
        break
      }
      case 'push':
      case 'remove': {
        const operand = read('operand')
        if (Yami.VariableGetter.isNone(operand)) {
          return $('#setList-operand').getFocus()
        }
        Command.save({variable, operation, operand})
        break
      }
      case 'split': {
        const operand = read('operand')
        if (Yami.VariableGetter.isNone(operand)) {
          return $('#setList-operand').getFocus()
        }
        const separator = read('separator')
        Command.save({variable, operation, operand, separator})
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
      {text: Yami.Local.get('command.deleteVariable') + ': '},
      {text: Command.parseVariable(variable)},
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
    if (Yami.VariableGetter.isNone(variable)) {
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
    $('#if-branches').bind(Yami.IfBranch)

    // 绑定条件列表
    $('#if-branch-conditions').bind(Yami.IfCondition)

    // 清理内存 - 窗口已关闭事件
    $('#if').on('closed', event => {
      this.elseCommands = null
      $('#if-branches').clear()
    })
  },
  parse: function ({branches, elseCommands}) {
    const contents = [
      {color: 'flow'},
    ]
    const textIf = Yami.Local.get('command.if.alias')
    for (const branch of branches) {
      contents.push(
        {text: `${textIf} ${Yami.IfBranch.parse(branch)}`},
        {children: branch.commands},
      )
    }
    if (elseCommands) {
      contents.push(
        {text: Yami.Local.get('command.if.else')},
        {children: elseCommands},
      )
    }
    contents.push({text: Yami.Local.get('command.if.end')})
    return contents
  },
  load: function ({
    branches      = [],
    elseCommands  = null,
  }) {
    const write = Yami.getElementWriter('if')
    write('branches', branches.slice())
    write('else', !!elseCommands)
    Command.cases.if.elseCommands = elseCommands
    $('#if-branches').getFocus()
  },
  save: function () {
    const read = Yami.getElementReader('if')
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
    $('#switch-branches').bind(Yami.SwitchBranch)

    // 绑定条件列表
    $('#switch-branch-conditions').bind(Yami.SwitchCondition)

    // 清理内存 - 窗口已关闭事件
    $('#switch').on('closed', event => {
      this.defaultCommands = null
      $('#switch-branches').clear()
    })
  },
  parse: function ({variable, branches, defaultCommands}) {
    const contents = [
      {color: 'flow'},
      {text: Yami.Local.get('command.switch') + ' '},
      {text: Command.parseVariable(variable)},
      {break: true},
    ]
    const textCase = Yami.Local.get('command.switch.case')
    for (const branch of branches) {
      contents.push(
        {text: `${textCase} ${Yami.SwitchBranch.parse(branch)}`},
        {children: branch.commands},
      )
    }
    if (defaultCommands) {
      contents.push(
        {text: Yami.Local.get('command.switch.default')},
        {children: defaultCommands},
      )
    }
    contents.push({text: Yami.Local.get('command.switch.end')})
    return contents
  },
  load: function ({
    variable        = {type: 'local', key: ''},
    branches        = [],
    defaultCommands = null,
  }) {
    const write = Yami.getElementWriter('switch')
    write('variable', variable)
    write('branches', branches.slice())
    write('default', !!defaultCommands)
    Command.cases.switch.defaultCommands = defaultCommands
    $('#switch-variable').getFocus()
  },
  save: function () {
    const read = Yami.getElementReader('switch')
    const variable = read('variable')
    if (Yami.VariableGetter.isNone(variable)) {
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
    $('#loop-conditions').bind(Yami.IfCondition)

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
    let info
    if (conditions.length !== 0) {
      const condition = Yami.IfBranch.parse({mode, conditions})
      info = `${Yami.Local.get('command.loop.while')} ${condition}`
    } else {
      info = Yami.Local.get('command.loop')
    }
    return [
      {color: 'flow'},
      {text: info},
      {children: commands},
      {text: Yami.Local.get('command.loop.end')},
    ]
  },
  load: function ({
    mode        = 'all',
    conditions  = [],
    commands    = [],
  }) {
    const write = Yami.getElementWriter('loop')
    write('mode', mode)
    write('conditions', conditions.slice())
    Command.cases.loop.commands = commands
    $('#loop-conditions').getFocus()
  },
  save: function () {
    const read = Yami.getElementReader('loop')
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
      {name: 'Bag', value: 'bag'},
      {name: 'Element', value: 'element'},
      {name: 'Save Data', value: 'save'},
    ])

    // 设置数据关联元素
    $('#forEach-data').enableHiddenMode().relate([
      {case: 'list', targets: [
        $('#forEach-list'),
        $('#forEach-variable'),
      ]},
      {case: ['skill', 'state', 'equipment', 'bag'], targets: [
        $('#forEach-actor'),
        $('#forEach-variable'),
      ]},
      {case: 'element', targets: [
        $('#forEach-element'),
        $('#forEach-variable'),
      ]},
      {case: 'save', targets: [
        $('#forEach-filename'),
      ]},
    ])

    // 清理内存 - 窗口已关闭事件
    $('#forEach').on('closed', event => {
      this.commands = null
    })
  },
  parse: function ({data, list, actor, element, variable, filename, commands}) {
    const dataInfo = Yami.Local.get('command.forEach.' + data)
    const words = Command.words
    switch (data) {
      case 'list': {
        const listName = Command.parseVariable(list)
        const varName = Command.parseVariable(variable)
        words.push(`${varName} = ${listName} -> ${dataInfo}`)
        break
      }
      case 'skill':
      case 'state':
      case 'equipment':
      case 'bag': {
        const varName = Command.parseVariable(variable)
        const actorInfo = Command.parseActor(actor)
        words.push(`${varName} = ${actorInfo} -> ${dataInfo}`)
        break
      }
      case 'element': {
        const varName = Command.parseVariable(variable)
        const elInfo = Command.parseElement(element)
        words.push(`${varName} = ${elInfo} -> ${dataInfo}`)
        break
      }
      case 'save':
        words.push(`{${Command.parseVariable(filename)}, ...} = ${dataInfo}`)
        break
    }
    return [
      {color: 'flow'},
      {text: Yami.Local.get('command.forEach') + ': '},
      {text: words.join()},
      {children: commands},
      {text: Yami.Local.get('command.forEach.end')},
    ]
  },
  load: function ({
    data      = 'list',
    list      = {type: 'local', key: ''},
    actor     = {type: 'trigger'},
    element   = {type: 'trigger'},
    variable  = {type: 'local', key: ''},
    filename  = {type: 'local', key: ''},
    commands  = [],
  }) {
    const write = Yami.getElementWriter('forEach')
    write('data', data)
    write('list', list)
    write('actor', actor)
    write('element', element)
    write('variable', variable)
    write('filename', filename)
    Command.cases.forEach.commands = commands
    $('#forEach-data').getFocus()
  },
  save: function () {
    const read = Yami.getElementReader('forEach')
    const data = read('data')
    const commands = Command.cases.forEach.commands
    switch (data) {
      case 'list': {
        const list = read('list')
        const variable = read('variable')
        if (Yami.VariableGetter.isNone(list)) {
          return $('#forEach-list').getFocus()
        }
        if (Yami.VariableGetter.isNone(variable)) {
          return $('#forEach-variable').getFocus()
        }
        Command.save({data, list, variable, commands})
        break
      }
      case 'skill':
      case 'state':
      case 'equipment':
      case 'bag': {
        const actor = read('actor')
        const variable = read('variable')
        if (Yami.VariableGetter.isNone(variable)) {
          return $('#forEach-variable').getFocus()
        }
        Command.save({data, actor, variable, commands})
        break
      }
      case 'element': {
        const element = read('element')
        const variable = read('variable')
        if (Yami.VariableGetter.isNone(variable)) {
          return $('#forEach-variable').getFocus()
        }
        Command.save({data, element, variable, commands})
        break
      }
      case 'save': {
        const filename = read('filename')
        if (Yami.VariableGetter.isNone(filename)) {
          return $('#forEach-filename').getFocus()
        }
        Command.save({data, filename, commands})
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
      {text: Yami.Local.get('command.break')},
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
      {text: Yami.Local.get('command.continue')},
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
      {color: 'flow'},
      {text: Yami.Local.get('command.independent')},
      {children: commands},
      {text: Yami.Local.get('command.independent.end')},
    ]
  },
  save: function () {
    Command.save({commands: []})
  },
}

// 调用事件
Command.cases.callEvent = {
  initialize: function () {
    $('#callEvent-confirm').on('click', this.save)

    // 创建类型选项
    $('#callEvent-type').loadItems([
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

    // 类型 - 写入事件
    $('#callEvent-type').on('write', event => {
      const type = event.value
      const elEventType = $('#callEvent-eventType')
      const eventTypes = Yami.Enum.getMergedItems(Yami.EventEditor.types[type], type + '-event')
      // 加载事件类型选项(创建了全局事件类型但是没用到)
      elEventType.loadItems(eventTypes)
      elEventType.write(eventTypes[0].value)
    })
  },
  parse: function ({type, actor, skill, state, equipment, item, light, element, eventId, eventType}) {
    const words = Command.words
    switch (type) {
      case 'global':
        words.push(Command.parseFileName(eventId))
        break
      case 'scene':
        words.push(Yami.Local.get('command.callEvent.scene'))
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
      {text: Yami.Local.get('command.callEvent.alias') + ': '},
      {text: words.join()},
    ]
  },
  load: function ({
    type      = 'global',
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
    const write = Yami.getElementWriter('callEvent')
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
    $('#callEvent-type').getFocus()
  },
  save: function () {
    const read = Yami.getElementReader('callEvent')
    const type = read('type')
    switch (type) {
      case 'global': {
        const eventId = read('eventId')
        if (eventId === '') {
          return $('#callEvent-eventId').getFocus()
        }
        Command.save({type, eventId})
        break
      }
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

// 设置事件
Command.cases.setEvent = {
  initialize: function () {
    $('#setEvent-confirm').on('click', this.save)

    // 创建操作选项
    $('#setEvent-operation').loadItems([
      {name: 'Stop', value: 'stop'},
      {name: 'Stop Propagation', value: 'stop-propagation'},
      {name: 'Pause and Save to Variable', value: 'pause'},
      {name: 'Continue and Reset Variable', value: 'continue'},
      {name: 'Enable Global Event', value: 'enable'},
      {name: 'Disable Global Event', value: 'disable'},
      {name: 'Prevent Scene Input Events', value: 'prevent-scene-input-events'},
      {name: 'Restore Scene Input Events', value: 'restore-scene-input-events'},
      {name: 'Set to Highest Priority', value: 'highest-priority'},
      {name: 'Go to Choice Branch', value: 'goto-choice-branch'},
    ])

    // 创建选择分支选项
    $('#setEvent-choiceIndex').loadItems([
      {name: 'Choice #1', value: 0},
      {name: 'Choice #2', value: 1},
      {name: 'Choice #3', value: 2},
      {name: 'Choice #4', value: 3},
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
    .push(Yami.Local.get('command.setEvent.' + operation))
    switch (operation) {
      case 'pause':
      case 'continue':
        words.push(Command.parseVariable(variable))
        break
      case 'enable':
      case 'disable':
      case 'highest-priority':
        words.push(Command.parseFileName(eventId))
        break
      case 'goto-choice-branch':
        words.push(`#${choiceIndex + 1}`)
        break
    }
    return [
      {color: 'flow'},
      {text: Yami.Local.get('command.setEvent.alias') + ': '},
      {text: words.join()},
    ]
  },
  load: function ({
    operation   = 'stop',
    variable    = {type: 'global', key: ''},
    eventId     = '',
    choiceIndex = 0,
  }) {
    const write = Yami.getElementWriter('setEvent')
    write('operation', operation)
    write('variable', variable)
    write('eventId', eventId)
    write('choiceIndex', choiceIndex)
    $('#setEvent-operation').getFocus()
  },
  save: function () {
    const read = Yami.getElementReader('setEvent')
    const operation = read('operation')
    switch (operation) {
      case 'stop':
      case 'stop-propagation':
      case 'prevent-scene-input-events':
      case 'restore-scene-input-events':
        Command.save({operation})
        break
      case 'pause':
      case 'continue': {
        const variable = read('variable')
        if (Yami.VariableGetter.isNone(variable)) {
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

// 标签
Command.cases.label = {
  initialize: function () {
    $('#label-confirm').on('click', this.save)
  },
  parse: function ({name}) {
    return [
      {color: 'flow'},
      {text: Yami.Local.get('command.label') + ': '},
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
        words.push(label).push(Yami.Local.get('command.jumpTo.save'))
        break
      case 'return':
        words.push(Yami.Local.get('command.jumpTo.savedLocation'))
        break
    }
    return [
      {color: 'flow'},
      {text: Yami.Local.get('command.jumpTo.alias') + ': '},
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
}

// 等待
Command.cases.wait = {
  initialize: function () {
    $('#wait-confirm').on('click', this.save)
  },
  parse: function ({duration}) {
    return [
      {color: 'wait'},
      {text: Yami.Local.get('command.wait') + ': '},
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
    const data = Yami.Data.ui[uiId]
    if (data !== undefined) {
      const words = Command.words
      const nodes = data.nodes
      for (const {name} of nodes) {
        if (name !== '') {
          words.push(name)
        }
        if (words.count === 5) {
          break
        }
      }
      if (words.count < nodes.length) {
        words.push('...')
      }
      return `${uiName} {${words.join()}}`
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
        info = `${Command.parseElement(parent)} -> ${this.parseUIAndNodeNames(uiId)}`
        break
      case 'append-one-to-element':
        info = `${Command.parseElement(parent)} -> ${Command.parsePresetElement(presetId)}`
        break
    }
    return [
      {color: 'element'},
      {text: Yami.Local.get('command.createElement') + ': '},
      {text: info},
    ]
  },
  load: function ({
    operation = 'append-all-to-root',
    parent    = {type: 'trigger'},
    uiId      = '',
    presetId  = Yami.PresetElement.getDefaultPresetId(),
  }) {
    const write = Yami.getElementWriter('createElement')
    write('operation', operation)
    write('parent', parent)
    write('uiId', uiId)
    write('presetId', presetId)
    $('#createElement-operation').getFocus('all')
  },
  save: function () {
    const read = Yami.getElementReader('createElement')
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
    $('#setImage-properties').bind(Yami.ImageProperty)

    // 清理内存 - 窗口已关闭事件
    $('#setImage').on('closed', event => {
      $('#setImage-properties').clear()
    })
  },
  parse: function ({element, properties}) {
    const words = Command.words
    .push(Command.parseElement(element))
    for (const property of properties) {
      words.push(Yami.ImageProperty.parse(property))
    }
    return [
      {color: 'element'},
      {text: Yami.Local.get('command.setImage') + ': '},
      {text: words.join()},
    ]
  },
  load: function ({
    element     = {type: 'trigger'},
    properties  = [],
  }) {
    const write = Yami.getElementWriter('setImage')
    write('element', element)
    write('properties', properties.slice())
    $('#setImage-element').getFocus()
  },
  save: function () {
    const read = Yami.getElementReader('setImage')
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
      {case: 'base64', targets: [
        $('#loadImage-variable'),
      ]},
    ])
  },
  parse: function ({element, type, actor, skill, state, equipment, item, variable}) {
    const words = Command.words
    .push(Command.parseElement(element))
    const label = Yami.Local.get('command.loadImage.' + type)
    let object
    switch (type) {
      case 'actor-portrait':
        object = Command.parseActor(actor)
        break
      case 'skill-icon':
        object = Command.parseSkill(skill)
        break
      case 'state-icon':
        object = Command.parseState(state)
        break
      case 'equipment-icon':
        object = Command.parseEquipment(equipment)
        break
      case 'item-icon':
        object = Command.parseItem(item)
        break
      case 'base64':
        object = Command.parseVariable(variable)
        break
    }
    words.push(`${label}(${object})`)
    return [
      {color: 'element'},
      {text: Yami.Local.get('command.loadImage') + ': '},
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
    variable  = {type: 'local', key: ''},
  }) {
    const write = Yami.getElementWriter('loadImage')
    write('element', element)
    write('type', type)
    write('actor', actor)
    write('skill', skill)
    write('state', state)
    write('equipment', equipment)
    write('item', item)
    write('variable', variable)
    $('#loadImage-element').getFocus()
  },
  save: function () {
    const read = Yami.getElementReader('loadImage')
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
      case 'base64': {
        const variable = read('variable')
        if (Yami.VariableGetter.isNone(variable)) {
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
        Yami.Data.createEasingItems()
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
      const read = Yami.getElementReader('tintImage')
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
    const tint = Yami.Local.get('command.tintImage.tint')
    switch (mode) {
      case 'full':
        return `${tint}(${red}, ${green}, ${blue}, ${gray})`
      case 'rgb':
        return `${tint}(${red}, ${green}, ${blue})`
      case 'gray':
        return `${tint}(${gray})`
    }
  },
  parse: function ({element, mode, tint, easingId, duration, wait}) {
    const words = Command.words
    .push(Command.parseElement(element))
    .push(this.parseTint(mode, tint))
    .push(Command.parseEasing(easingId, duration, wait))
    return [
      {color: 'element'},
      {text: Yami.Local.get('command.tintImage') + ': '},
      {text: words.join()},
    ]
  },
  load: function ({
    element   = {type: 'trigger'},
    mode      = 'full',
    tint      = [0, 0, 0, 0],
    easingId  = Yami.Data.easings[0].id,
    duration  = 0,
    wait      = true,
  }) {
    const write = Yami.getElementWriter('tintImage')
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
    const read = Yami.getElementReader('tintImage')
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
    $('#setText-properties').bind(Yami.TextProperty)

    // 清理内存 - 窗口已关闭事件
    $('#setText').on('closed', event => {
      $('#setText-properties').clear()
    })
  },
  parse: function ({element, properties}) {
    const words = Command.words
    .push(Command.parseElement(element))
    for (const property of properties) {
      words.push(Yami.TextProperty.parse(property))
    }
    return [
      {color: 'element'},
      {text: Yami.Local.get('command.setText') + ': '},
      {text: words.join()},
    ]
  },
  load: function ({
    element     = {type: 'trigger'},
    properties  = [],
  }) {
    const write = Yami.getElementWriter('setText')
    write('element', element)
    write('properties', properties.slice())
    $('#setText-element').getFocus()
  },
  save: function () {
    const read = Yami.getElementReader('setText')
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
    $('#setTextBox-properties').bind(Yami.TextBoxProperty)

    // 清理内存 - 窗口已关闭事件
    $('#setTextBox').on('closed', event => {
      $('#setTextBox-properties').clear()
    })
  },
  parse: function ({element, properties}) {
    const words = Command.words
    .push(Command.parseElement(element))
    for (const property of properties) {
      words.push(Yami.TextBoxProperty.parse(property))
    }
    return [
      {color: 'element'},
      {text: Yami.Local.get('command.setTextBox') + ': '},
      {text: words.join()},
    ]
  },
  load: function ({
    element     = {type: 'trigger'},
    properties  = [],
  }) {
    const write = Yami.getElementWriter('setTextBox')
    write('element', element)
    write('properties', properties.slice())
    $('#setTextBox-element').getFocus()
  },
  save: function () {
    const read = Yami.getElementReader('setTextBox')
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
    $('#setDialogBox-properties').bind(Yami.DialogBoxProperty)

    // 清理内存 - 窗口已关闭事件
    $('#setDialogBox').on('closed', event => {
      $('#setDialogBox-properties').clear()
    })
  },
  parse: function ({element, properties}) {
    const words = Command.words
    .push(Command.parseElement(element))
    for (const property of properties) {
      words.push(Yami.DialogBoxProperty.parse(property))
    }
    return [
      {color: 'element'},
      {text: Yami.Local.get('command.setDialogBox') + ': '},
      {text: words.join()},
    ]
  },
  load: function ({
    element     = {type: 'trigger'},
    properties  = [],
  }) {
    const write = Yami.getElementWriter('setDialogBox')
    write('element', element)
    write('properties', properties.slice())
    $('#setDialogBox-element').getFocus()
  },
  save: function () {
    const read = Yami.getElementReader('setDialogBox')
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
    .push(Yami.Local.get('command.controlDialog.' + operation))
    return [
      {color: 'element'},
      {text: Yami.Local.get('command.controlDialog') + ': '},
      {text: words.join()},
    ]
  },
  load: function ({
    element   = {type: 'trigger'},
    operation = 'pause',
  }) {
    const write = Yami.getElementWriter('controlDialog')
    write('element', element)
    write('operation', operation)
    $('#controlDialog-element').getFocus()
  },
  save: function () {
    const read = Yami.getElementReader('controlDialog')
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
    $('#setProgressBar-properties').bind(Yami.ProgressBarProperty)

    // 清理内存 - 窗口已关闭事件
    $('#setProgressBar').on('closed', event => {
      $('#setProgressBar-properties').clear()
    })
  },
  parse: function ({element, properties}) {
    const words = Command.words
    .push(Command.parseElement(element))
    for (const property of properties) {
      words.push(Yami.ProgressBarProperty.parse(property))
    }
    return [
      {color: 'element'},
      {text: Yami.Local.get('command.setProgressBar') + ': '},
      {text: words.join()},
    ]
  },
  load: function ({
    element     = {type: 'trigger'},
    properties  = [],
  }) {
    const write = Yami.getElementWriter('setProgressBar')
    write('element', element)
    write('properties', properties.slice())
    $('#setProgressBar-element').getFocus()
  },
  save: function () {
    const read = Yami.getElementReader('setProgressBar')
    const element = read('element')
    const properties = read('properties')
    if (properties.length === 0) {
      return $('#setProgressBar-properties').getFocus()
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
      {text: Yami.Local.get('command.waitForVideo') + ': '},
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
    .push(Yami.Local.get('command.setElement.' + operation))
    return [
      {color: 'element'},
      {text: Yami.Local.get('command.setElement.alias') + ': '},
      {text: words.join()},
    ]
  },
  load: function ({
    element   = {type: 'trigger'},
    operation = 'hide',
  }) {
    const write = Yami.getElementWriter('setElement')
    write('element', element)
    write('operation', operation)
    $('#setElement-element').getFocus()
  },
  save: function () {
    const read = Yami.getElementReader('setElement')
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
      {text: Yami.Local.get('command.nestElement') + ': '},
      {text: `${pElement} -> ${cElement}`},
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
    $('#moveElement-properties').bind(Yami.TransformProperty)

    // 创建等待结束选项
    $('#moveElement-wait').loadItems([
      {name: 'Yes', value: true},
      {name: 'No', value: false},
    ])

    // 创建过渡方式选项 - 窗口打开事件
    $('#moveElement').on('open', function (event) {
      $('#moveElement-easingId').loadItems(
        Yami.Data.createEasingItems()
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
      words.push(Yami.TransformProperty.parse(property))
    }
    words.push(Command.parseEasing(easingId, duration, wait))
    return [
      {color: 'element'},
      {text: Yami.Local.get('command.moveElement') + ': '},
      {text: words.join()},
    ]
  },
  load: function ({
    element     = {type: 'trigger'},
    properties  = [],
    easingId    = Yami.Data.easings[0].id,
    duration    = 0,
    wait        = true,
  }) {
    const write = Yami.getElementWriter('moveElement')
    write('element', element)
    write('properties', properties.slice())
    write('easingId', easingId)
    write('duration', duration)
    write('wait', wait)
    $('#moveElement-element').getFocus()
  },
  save: function () {
    const read = Yami.getElementReader('moveElement')
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
        info = `${Command.parseElement(element)} -> ${Yami.Local.get('command.deleteElement.children')}`
        break
      case 'delete-all':
        info = Yami.Local.get('command.deleteElement.all-elements')
        break
    }
    return [
      {color: 'element'},
      {text: Yami.Local.get('command.deleteElement') + ': '},
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

// 创建光源
Command.cases.createLight = {
  initialize: function () {
    $('#createLight-confirm').on('click', this.save)
  },
  parse: function ({presetId, position}) {
    const words = Command.words
    .push(Command.parsePresetObject(presetId))
    .push(Command.parsePosition(position))
    return [
      {color: 'object'},
      {text: Yami.Local.get('command.createLight') + ': '},
      {text: words.join()},
    ]
  },
  load: function ({
    presetId  = '',
    position  = {type: 'actor', actor: {type: 'trigger'}},
  }) {
    const write = Yami.getElementWriter('createLight')
    write('presetId', presetId)
    write('position', position)
    $('#createLight-presetId').getFocus()
  },
  save: function () {
    const read = Yami.getElementReader('createLight')
    const presetId = read('presetId')
    if (presetId === '') {
      return $('#createLight-presetId').getFocus()
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
    $('#moveLight-properties').bind(Yami.LightProperty)

    // 创建等待选项
    $('#moveLight-wait').loadItems([
      {name: 'Yes', value: true},
      {name: 'No', value: false},
    ])

    // 创建过渡方式选项 - 窗口打开事件
    $('#moveLight').on('open', function (event) {
      $('#moveLight-easingId').loadItems(
        Yami.Data.createEasingItems()
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
      words.push(Yami.LightProperty.parse(property))
    }
    words.push(Command.parseEasing(easingId, duration, wait))
    return [
      {color: 'object'},
      {text: Yami.Local.get('command.moveLight') + ': '},
      {text: words.join()},
    ]
  },
  load: function ({
    light       = {type: 'trigger'},
    properties  = [],
    easingId    = Yami.Data.easings[0].id,
    duration    = 0,
    wait        = true,
  }) {
    const write = Yami.getElementWriter('moveLight')
    write('light', light)
    write('properties', properties.slice())
    write('easingId', easingId)
    write('duration', duration)
    write('wait', wait)
    $('#moveLight-light').getFocus()
  },
  save: function () {
    const read = Yami.getElementReader('moveLight')
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

// 删除光源
Command.cases.deleteLight = {
  initialize: function () {
    $('#deleteLight-confirm').on('click', this.save)
  },
  parse: function ({light}) {
    return [
      {color: 'object'},
      {text: Yami.Local.get('command.deleteLight') + ': '},
      {text: Command.parseLight(light)},
    ]
  },
  load: function ({light = {type: 'trigger'}}) {
    $('#deleteLight-light').write(light)
    $('#deleteLight-light').getFocus()
  },
  save: function () {
    const light = $('#deleteLight-light').read()
    Command.save({light})
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
    return Yami.Local.get('command.setState.' + operation)
  },
  parse: function ({state, operation, time}) {
    const words = Command.words
    .push(Command.parseState(state))
    .push(this.parseOperation(operation))
    .push(Command.parseVariableNumber(time, 'ms'))
    return [
      {color: 'object'},
      {text: Yami.Local.get('command.setState') + ': '},
      {text: words.join()},
    ]
  },
  load: function ({
    state     = {type: 'trigger'},
    operation = 'set-time',
    time      = 0,
  }) {
    const write = Yami.getElementWriter('setState')
    write('state', state)
    write('operation', operation)
    write('time', time)
    $('#setState-state').getFocus()
  },
  save: function () {
    const read = Yami.getElementReader('setState')
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

    // 创建方向映射选项
    $('#playAnimation-mappable').loadItems([
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
      elMotion.loadItems(Yami.Animation.getMotionListItems(event.value))
      elMotion.write2(elMotion.read())
    })
  },
  parsePriority: function (priority) {
    if (priority === 0) return ''
    return priority > 0 ? `+${priority}` : priority.toString()
  },
  parseDirectionMapping: function (mappable) {
    return mappable ? Yami.Local.get('command.playAnimation.mappable') : ''
  },
  parse: function ({mode, position, actor, animationId, motion, priority, offsetY, rotation, mappable, wait}) {
    const words = Command.words
    switch (mode) {
      case 'position':
        words.push(Command.parsePosition(position))
        break
      case 'actor': {
        const bind = Yami.Local.get('command.playAnimation.bind')
        words.push(`${bind}(${Command.parseActor(actor)})`)
        break
      }
    }
    words
    .push(Command.parseFileName(animationId))
    .push(Command.parseEnumString(motion))
    .push(this.parsePriority(priority))
    .push(offsetY + 'px')
    .push(Command.parseDegrees(Command.parseVariableNumber(rotation)))
    .push(this.parseDirectionMapping(mappable))
    .push(Command.parseWait(wait))
    return [
      {color: 'object'},
      {text: Yami.Local.get('command.playAnimation') + ': '},
      {text: words.join()},
    ]
  },
  load: function ({
    mode        = 'position',
    position    = {type: 'actor', actor: {type: 'trigger'}},
    actor       = {type: 'trigger'},
    animationId = '',
    motion      = '',
    priority    = 0,
    offsetY     = 0,
    rotation    = 0,
    mappable    = false,
    wait        = false,
  }) {
    const write = Yami.getElementWriter('playAnimation')
    write('mode', mode)
    write('position', position)
    write('actor', actor)
    write('animationId', animationId)
    write('motion', motion)
    write('priority', priority)
    write('offsetY', offsetY)
    write('rotation', rotation)
    write('mappable', mappable)
    write('wait', wait)
    $('#playAnimation-mode').getFocus()
  },
  save: function () {
    const read = Yami.getElementReader('playAnimation')
    const mode = read('mode')
    const animationId = read('animationId')
    const motion = read('motion')
    const priority = read('priority')
    const offsetY = read('offsetY')
    const rotation = read('rotation')
    const mappable = read('mappable')
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
        Command.save({mode, position, animationId, motion, priority, offsetY, rotation, mappable, wait})
        break
      }
      case 'actor': {
        const actor = read('actor')
        Command.save({mode, actor, animationId, motion, priority, offsetY, rotation, mappable, wait})
        break
      }
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
    ])
  },
  parse: function ({type, audio, volume}) {
    const words = Command.words
    .push(Command.parseAudioType(type))
    .push(Command.parseFileName(audio))
    .push(volume)
    return [
      {color: 'audio'},
      {text: Yami.Local.get('command.playAudio') + ': '},
      {text: words.join()},
    ]
  },
  load: function ({
    type    = 'bgm',
    audio   = '',
    volume  = 1,
  }) {
    const write = Yami.getElementWriter('playAudio')
    write('type', type)
    write('audio', audio)
    write('volume', volume)
    $('#playAudio-type').getFocus()
  },
  save: function () {
    const read = Yami.getElementReader('playAudio')
    const type = read('type')
    const audio = read('audio')
    const volume = read('volume')
    Command.save({type, audio, volume})
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
      {text: Yami.Local.get('command.stopAudio') + ': '},
      {text: words.join()},
    ]
  },
  load: function ({type = 'bgm'}) {
    const write = Yami.getElementWriter('stopAudio')
    write('type', type)
    $('#stopAudio-type').getFocus()
  },
  save: function () {
    const read = Yami.getElementReader('stopAudio')
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
        Yami.Data.createEasingItems()
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
      {text: Yami.Local.get('command.setVolume') + ': '},
      {text: words.join()},
    ]
  },
  load: function ({
    type      = 'bgm',
    volume    = 1,
    easingId  = Yami.Data.easings[0].id,
    duration  = 0,
    wait      = false,
  }) {
    const write = Yami.getElementWriter('setVolume')
    write('type', type)
    write('volume', volume)
    write('easingId', easingId)
    write('duration', duration)
    write('wait', wait)
    $('#setVolume-type').getFocus()
  },
  save: function () {
    const read = Yami.getElementReader('setVolume')
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
        Yami.Data.createEasingItems()
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
      {text: Yami.Local.get('command.setPan') + ': '},
      {text: words.join()},
    ]
  },
  load: function ({
    type      = 'bgm',
    pan       = 0,
    easingId  = Yami.Data.easings[0].id,
    duration  = 0,
    wait      = false,
  }) {
    const write = Yami.getElementWriter('setPan')
    write('type', type)
    write('pan', pan)
    write('easingId', easingId)
    write('duration', duration)
    write('wait', wait)
    $('#setPan-type').getFocus()
  },
  save: function () {
    const read = Yami.getElementReader('setPan')
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
        Yami.Data.createEasingItems()
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
      {text: Yami.Local.get('command.setReverb') + ': '},
      {text: words.join()},
    ]
  },
  load: function ({
    type      = 'bgm',
    dry       = 1,
    wet       = 0,
    easingId  = Yami.Data.easings[0].id,
    duration  = 0,
    wait      = false,
  }) {
    const write = Yami.getElementWriter('setReverb')
    write('type', type)
    write('dry', dry)
    write('wet', wet)
    write('easingId', easingId)
    write('duration', duration)
    write('wait', wait)
    $('#setReverb-type').getFocus()
  },
  save: function () {
    const read = Yami.getElementReader('setReverb')
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
      case false: return Yami.Local.get('command.setLoop.once')
      case true:  return Yami.Local.get('command.setLoop.loop')
    }
  },
  parse: function ({type, loop}) {
    const words = Command.words
    .push(Command.parseAudioType(type))
    .push(this.parseLoop(loop))
    return [
      {color: 'audio'},
      {text: Yami.Local.get('command.setLoop') + ': '},
      {text: words.join()},
    ]
  },
  load: function ({type = 'bgm', loop = false}) {
    const write = Yami.getElementWriter('setLoop')
    write('type', type)
    write('loop', loop)
    $('#setLoop-type').getFocus()
  },
  save: function () {
    const read = Yami.getElementReader('setLoop')
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
      {text: Yami.Local.get('command.saveAudio') + ': '},
      {text: Command.parseAudioType(type)},
    ]
  },
  load: function ({type = 'bgm'}) {
    const write = Yami.getElementWriter('saveAudio')
    write('type', type)
    $('#saveAudio-type').getFocus()
  },
  save: function () {
    const read = Yami.getElementReader('saveAudio')
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
      {text: Yami.Local.get('command.restoreAudio') + ': '},
      {text: Command.parseAudioType(type)},
    ]
  },
  load: function ({type = 'bgm'}) {
    const write = Yami.getElementWriter('restoreAudio')
    write('type', type)
    $('#restoreAudio-type').getFocus()
  },
  save: function () {
    const read = Yami.getElementReader('restoreAudio')
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
        Yami.Data.createTeamItems()
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
    .push(Command.parseDegrees(Command.parseVariableNumber(angle)))
    return [
      {color: 'actor'},
      {text: Yami.Local.get('command.createActor') + ': '},
      {text: words.join()},
    ]
  },
  load: function ({
    actorId   = '',
    teamId    = Yami.Data.teams.list[0].id,
    position  = {type: 'absolute', x: 0, y: 0},
    angle     = 0,
  }) {
    const write = Yami.getElementWriter('createActor')
    write('actorId', actorId)
    write('teamId', teamId)
    write('position', position)
    write('angle', angle)
    $('#createActor-actorId').getFocus('all')
  },
  save: function () {
    const read = Yami.getElementReader('createActor')
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
      {name: 'Teleport', value: 'teleport'},
    ])

    // 创建等待结束选项
    $('#moveActor-wait').loadItems([
      {name: 'Yes', value: true},
      {name: 'No', value: false},
    ])

    // 设置关联元素
    $('#moveActor-mode').enableHiddenMode().relate([
      {case: 'keep', targets: [
        $('#moveActor-angle'),
      ]},
      {case: ['straight', 'navigate'], targets: [
        $('#moveActor-destination'),
        $('#moveActor-wait'),
      ]},
      {case: 'teleport', targets: [
        $('#moveActor-destination'),
      ]},
    ])
  },
  parseMode: function (mode) {
    return Yami.Local.get('command.moveActor.mode.' + mode)
  },
  parse: function ({actor, mode, angle, destination, wait}) {
    const words = Command.words
    .push(Command.parseActor(actor))
    .push(this.parseMode(mode))
    switch (mode) {
      case 'stop':
        break
      case 'keep':
        words.push(Command.parseDegrees(Command.parseVariableNumber(angle)))
        break
      case 'straight':
      case 'navigate':
        words.push(Command.parsePosition(destination))
        words.push(Command.parseWait(wait))
        break
      case 'teleport':
        words.push(Command.parsePosition(destination))
        break
    }
    return [
      {color: 'actor'},
      {text: Yami.Local.get('command.moveActor') + ': '},
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
    const write = Yami.getElementWriter('moveActor')
    write('actor', actor)
    write('mode', mode)
    write('angle', angle)
    write('destination', destination)
    write('wait', wait)
    $('#moveActor-actor').getFocus()
  },
  save: function () {
    const read = Yami.getElementReader('moveActor')
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
      case 'navigate': {
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
    return `${sActor} -> ${dActor}`
  },
  parse: function ({actor, target, mode, minDist, maxDist, offset, vertDist, navigate, once, wait}) {
    const words = Command.words
    .push(this.parseActors(actor, target))
    .push(Yami.Local.get('command.followActor.mode.' + mode))
    .push(`${minDist} ~ ${maxDist}`)
    switch (mode) {
      case 'circle':
        words.push(offset.toString())
        break
      case 'rectangle':
        words.push(vertDist.toString())
        break
    }
    if (navigate) {
      words.push(Yami.Local.get('command.followActor.navigate'))
    }
    if (once) {
      words.push(Yami.Local.get('command.followActor.once'))
      words.push(Command.parseWait(wait))
    }
    return [
      {color: 'actor'},
      {text: Yami.Local.get('command.followActor') + ': '},
      {text: words.join()},
    ]
  },
  load: function ({
    actor     = {type: 'trigger'},
    target    = {type: 'trigger'},
    mode      = 'circle',
    minDist   = 1,
    maxDist   = 2,
    offset    = 0,
    vertDist  = 0,
    navigate  = false,
    once      = false,
    wait      = false,
  }) {
    const write = Yami.getElementWriter('followActor')
    write('actor', actor)
    write('target', target)
    write('mode', mode)
    write('minDist', minDist)
    write('maxDist', maxDist)
    write('offset', offset)
    write('vertDist', vertDist)
    write('navigate', navigate)
    write('once', once)
    write('wait', wait)
    $('#followActor-actor').getFocus()
  },
  save: function () {
    const read = Yami.getElementReader('followActor')
    const actor = read('actor')
    const target = read('target')
    const mode = read('mode')
    const minDist = read('minDist')
    const maxDist = Math.max(read('maxDist'), Math.roundTo(minDist + 0.1, 4))
    const navigate = read('navigate')
    const once = read('once')
    const wait = once ? read('wait') : false
    switch (mode) {
      case 'circle': {
        const offset = read('offset')
        Command.save({actor, target, mode, minDist, maxDist, offset, navigate, once, wait})
        break
      }
      case 'rectangle': {
        const vertDist = read('vertDist')
        Command.save({actor, target, mode, minDist, maxDist, vertDist, navigate, once, wait})
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
        Yami.Data.createEasingItems()
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
      {text: Yami.Local.get('command.translateActor') + ': '},
      {text: words.join()},
    ]
  },
  load: function ({
    actor     = {type: 'trigger'},
    angle     = {type: 'absolute', degrees: 0},
    distance  = 0,
    easingId  = Yami.Data.easings[0].id,
    duration  = 0,
    wait      = false,
  }) {
    const write = Yami.getElementWriter('translateActor')
    write('actor', actor)
    write('angle', angle)
    write('distance', distance)
    write('easingId', easingId)
    write('duration', duration)
    write('wait', wait)
    $('#translateActor-actor').getFocus()
  },
  save: function () {
    const read = Yami.getElementReader('translateActor')
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
    return `${sActor} -> ${dActor}`
  },
  parseOperation: function (operation) {
    return Yami.Local.get('command.changeThreat.' + operation)
  },
  parse: function ({actor, target, operation, threat}) {
    const words = Command.words
    .push(this.parseActors(actor, target))
    .push(this.parseOperation(operation))
    .push(Command.parseVariableNumber(threat))
    return [
      {color: 'actor'},
      {text: Yami.Local.get('command.changeThreat') + ': '},
      {text: words.join()},
    ]
  },
  load: function ({
    actor     = {type: 'trigger'},
    target    = {type: 'trigger'},
    operation = 'increase',
    threat    = 0,
  }) {
    const write = Yami.getElementWriter('changeThreat')
    write('actor', actor)
    write('target', target)
    write('operation', operation)
    write('threat', threat)
    $('#changeThreat-actor').getFocus()
  },
  save: function () {
    const read = Yami.getElementReader('changeThreat')
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
      {text: Yami.Local.get('command.setWeight') + ': '},
      {text: words.join()},
    ]
  },
  load: function ({
    actor   = {type: 'trigger'},
    weight  = 0,
  }) {
    const write = Yami.getElementWriter('setWeight')
    write('actor', actor)
    write('weight', weight)
    $('#setWeight-actor').getFocus()
  },
  save: function () {
    const read = Yami.getElementReader('setWeight')
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
    const words = Command.words
    .push(Command.parseActor(actor))
    .push(Yami.Local.get('command.setMovementSpeed.' + property))
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
      {text: Yami.Local.get('command.setMovementSpeed') + ': '},
      {text: words.join()},
    ]
  },
  load: function ({
    actor     = {type: 'trigger'},
    property  = 'base',
    base      = 0,
    factor    = 0,
  }) {
    const write = Yami.getElementWriter('setMovementSpeed')
    write('actor', actor)
    write('property', property)
    write('base', base)
    write('factor', factor)
    $('#setMovementSpeed-actor').getFocus()
  },
  save: function () {
    const read = Yami.getElementReader('setMovementSpeed')
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
        Yami.Data.createEasingItems()
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
      {text: Yami.Local.get('command.setAngle') + ': '},
      {text: words.join()},
    ]
  },
  load: function ({
    actor     = {type: 'trigger'},
    angle     = {type: 'absolute', degrees: 0},
    easingId  = Yami.Data.easings[0].id,
    duration  = 0,
    wait      = false,
  }) {
    const write = Yami.getElementWriter('setAngle')
    write('actor', actor)
    write('angle', angle)
    write('easingId', easingId)
    write('duration', duration)
    write('wait', wait)
    $('#setAngle-actor').getFocus()
  },
  save: function () {
    const read = Yami.getElementReader('setAngle')
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
    .push(Yami.Local.get('command.fixAngle.fixed.' + fixed))
    return [
      {color: 'actor'},
      {text: Yami.Local.get('command.fixAngle') + ': '},
      {text: words.join()},
    ]
  },
  load: function ({
    actor = {type: 'trigger'},
    fixed = true,
  }) {
    const write = Yami.getElementWriter('fixAngle')
    write('actor', actor)
    write('fixed', fixed)
    $('#fixAngle-actor').getFocus()
  },
  save: function () {
    const read = Yami.getElementReader('fixAngle')
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
    .push(Yami.Local.get('command.setActive.active.' + active))
    return [
      {color: 'actor'},
      {text: Yami.Local.get('command.setActive') + ': '},
      {text: words.join()},
    ]
  },
  load: function ({
    actor   = {type: 'trigger'},
    active  = false,
  }) {
    const write = Yami.getElementWriter('setActive')
    write('actor', actor)
    write('active', active)
    $('#setActive-actor').getFocus()
  },
  save: function () {
    const read = Yami.getElementReader('setActive')
    const actor = read('actor')
    const active = read('active')
    Command.save({actor, active})
  },
}

// 删除角色
Command.cases.deleteActor = {
  initialize: function () {
    $('#deleteActor-confirm').on('click', this.save)
  },
  parse: function ({actor}) {
    return [
      {color: 'actor'},
      {text: Yami.Local.get('command.deleteActor') + ': '},
      {text: Command.parseActor(actor)},
    ]
  },
  load: function ({actor = {type: 'trigger'}}) {
    const write = Yami.getElementWriter('deleteActor')
    write('actor', actor)
    $('#deleteActor-actor').getFocus()
  },
  save: function () {
    const read = Yami.getElementReader('deleteActor')
    const actor = read('actor')
    Command.save({actor})
  },
}

// 改变角色队伍
Command.cases.changeActorTeam = {
  initialize: function () {
    $('#changeActorTeam-confirm').on('click', this.save)

    // 创建队伍选项 - 窗口打开事件
    $('#changeActorTeam').on('open', function (event) {
      $('#changeActorTeam-teamId').loadItems(
        Yami.Data.createTeamItems()
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
      {text: Yami.Local.get('command.changeActorTeam') + ': '},
      {text: words.join()},
    ]
  },
  load: function ({
    actor   = {type: 'trigger'},
    teamId  = Yami.Data.teams.list[0].id,
  }) {
    const write = Yami.getElementWriter('changeActorTeam')
    write('actor', actor)
    write('teamId', teamId)
    $('#changeActorTeam-actor').getFocus()
  },
  save: function () {
    const read = Yami.getElementReader('changeActorTeam')
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
      {name: 'Remove by ID', value: 'remove-by-id'},
    ])

    // 设置操作关联元素
    $('#changeActorState-operation').enableHiddenMode().relate([
      {case: ['add', 'remove-by-id'], targets: [
        $('#changeActorState-stateId'),
      ]},
      {case: 'remove', targets: [
        $('#changeActorState-state'),
      ]},
    ])
  },
  parseOperation: function (operation) {
    return Yami.Local.get('command.changeActorState.' + operation)
  },
  parse: function ({actor, operation, stateId, state}) {
    const words = Command.words
    .push(Command.parseActor(actor))
    .push(this.parseOperation(operation))
    switch (operation) {
      case 'add':
      case 'remove-by-id':
        words.push(Command.parseFileName(stateId))
        break
      case 'remove':
        words.push(Command.parseState(state))
        break
    }
    return [
      {color: 'actor'},
      {text: Yami.Local.get('command.changeActorState') + ': '},
      {text: words.join()},
    ]
  },
  load: function ({
    actor     = {type: 'trigger'},
    operation = 'add',
    stateId   = '',
    state     = {type: 'latest'},
  }) {
    const write = Yami.getElementWriter('changeActorState')
    write('actor', actor)
    write('operation', operation)
    write('stateId', stateId)
    write('state', state)
    $('#changeActorState-actor').getFocus()
  },
  save: function () {
    const read = Yami.getElementReader('changeActorState')
    const actor = read('actor')
    const operation = read('operation')
    switch (operation) {
      case 'add':
      case 'remove-by-id': {
        const stateId = read('stateId')
        if (stateId === '') {
          return $('#changeActorState-stateId').getFocus()
        }
        Command.save({actor, operation, stateId})
        break
      }
      case 'remove': {
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
    ])

    // 设置关联元素
    $('#changeActorEquipment-operation').enableHiddenMode().relate([
      {case: 'add', targets: [
        $('#changeActorEquipment-equipment'),
      ]},
    ])
  },
  parseOperation: function (operation) {
    switch (operation) {
      case 'add':
      case 'remove':
        return Yami.Local.get('command.changeActorEquipment.' + operation)
    }
  },
  parse: function ({actor, operation, equipment, slot}) {
    const words = Command.words
    .push(Command.parseActor(actor))
    .push(this.parseOperation(operation))
    switch (operation) {
      case 'add':
        words
        .push(Command.parseGroupEnumString('equipment-slot', slot))
        .push(Command.parseEquipment(equipment))
        break
      case 'remove':
        words.push(Command.parseGroupEnumString('equipment-slot', slot))
        break
    }
    return [
      {color: 'actor'},
      {text: Yami.Local.get('command.changeActorEquipment') + ': '},
      {text: words.join()},
    ]
  },
  load: function ({
    actor       = {type: 'trigger'},
    operation   = 'add',
    slot        = '',
    equipment   = {type: 'trigger'},
  }) {
    // 加载装备选项
    $('#changeActorEquipment-slot').loadItems(
      Yami.Enum.getStringItems('equipment-slot')
    )
    const write = Yami.getElementWriter('changeActorEquipment')
    write('actor', actor)
    write('operation', operation)
    write('equipment', equipment)
    $('#changeActorEquipment-slot').write2(slot)
    $('#changeActorEquipment-actor').getFocus()
  },
  save: function () {
    const read = Yami.getElementReader('changeActorEquipment')
    const actor = read('actor')
    const operation = read('operation')
    const slot = read('slot')
    if (slot === '') {
      return $('#changeActorEquipment-slot').getFocus()
    }
    switch (operation) {
      case 'add': {
        const equipment = read('equipment')
        Command.save({actor, operation, slot, equipment})
        break
      }
      case 'remove':
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
      {name: 'Remove by ID', value: 'remove-by-id'},
      {name: 'Sort by Filename', value: 'sort-by-filename'},
    ])

    // 设置关联元素
    $('#changeActorSkill-operation').enableHiddenMode().relate([
      {case: ['add', 'remove-by-id'], targets: [
        $('#changeActorSkill-skillId'),
      ]},
      {case: 'remove', targets: [
        $('#changeActorSkill-skill'),
      ]},
    ])
  },
  parseOperation: function (operation) {
    return Yami.Local.get('command.changeActorSkill.' + operation)
  },
  parse: function ({actor, operation, skill, skillId}) {
    const words = Command.words
    .push(Command.parseActor(actor))
    .push(this.parseOperation(operation))
    switch (operation) {
      case 'add':
      case 'remove-by-id':
        words.push(Command.parseFileName(skillId))
        break
      case 'remove':
        words.push(Command.parseSkill(skill))
        break
    }
    return [
      {color: 'actor'},
      {text: Yami.Local.get('command.changeActorSkill') + ': '},
      {text: words.join()},
    ]
  },
  load: function ({
    actor     = {type: 'trigger'},
    operation = 'add',
    skillId   = '',
    skill     = {type: 'latest'},
  }) {
    const write = Yami.getElementWriter('changeActorSkill')
    write('actor', actor)
    write('operation', operation)
    write('skillId', skillId)
    write('skill', skill)
    $('#changeActorSkill-actor').getFocus()
  },
  save: function () {
    const read = Yami.getElementReader('changeActorSkill')
    const actor = read('actor')
    const operation = read('operation')
    switch (operation) {
      case 'add':
      case 'remove-by-id': {
        const skillId = read('skillId')
        if (skillId === '') {
          return $('#changeActorSkill-skillId').getFocus()
        }
        Command.save({actor, operation, skillId})
        break
      }
      case 'remove': {
        const skill = read('skill')
        Command.save({actor, operation, skill})
        break
      }
      case 'sort-by-filename':
        Command.save({actor, operation})
        break
    }
  },
}

// 改变角色精灵图
Command.cases.changeActorSprite = {
  initialize: function () {
    $('#changeActorSprite-confirm').on('click', this.save)

    // 侦听事件
    $('#changeActorSprite-animationId').on('write', event => {
      const items = Yami.Animation.getSpriteListItems(event.value)
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
      {text: Yami.Local.get('command.changeActorSprite') + ': '},
      {text: words.join()},
    ]
  },
  load: function ({
    actor       = {type: 'trigger'},
    animationId = '',
    spriteId    = '',
    image       = '',
  }) {
    const write = Yami.getElementWriter('changeActorSprite')
    write('actor', actor)
    write('animationId', animationId)
    write('spriteId', spriteId)
    write('image', image)
    $('#changeActorSprite-actor').getFocus()
  },
  save: function () {
    const read = Yami.getElementReader('changeActorSprite')
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

// 映射角色动作
Command.cases.remapActorMotion = {
  initialize: function () {
    $('#remapActorMotion-confirm').on('click', this.save)

    // 创建动作类型选项
    $('#remapActorMotion-type').loadItems([
      {name: 'Idle', value: 'idle'},
      {name: 'Move', value: 'move'},
    ])
  },
  parseMapping: function (type, motion) {
    const motionType = Yami.Local.get('command.remapActorMotion.type.' + type)
    const motionName = Command.parseEnumString(motion)
    return `${motionType} -> ${motionName}`
  },
  parse: function ({actor, type, motion}) {
    const words = Command.words
    .push(Command.parseActor(actor))
    .push(this.parseMapping(type, motion))
    return [
      {color: 'actor'},
      {text: Yami.Local.get('command.remapActorMotion') + ': '},
      {text: words.join()},
    ]
  },
  load: function ({
    actor   = {type: 'trigger'},
    type    = 'move',
    motion  = '',
  }) {
    const write = Yami.getElementWriter('remapActorMotion')
    write('actor', actor)
    write('type', type)
    write('motion', motion)
    $('#remapActorMotion-actor').getFocus()
  },
  save: function () {
    const read = Yami.getElementReader('remapActorMotion')
    const actor = read('actor')
    const type = read('type')
    const motion = read('motion')
    if (motion === '') {
      return $('#remapActorMotion-motion').getFocus()
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
    switch (typeof speed) {
      case 'number':
        return `x${speed}`
      case 'object':
        return Command.parseVariableNumber(speed)
    }
  },
  parse: function ({actor, motion, speed, wait}) {
    const words = Command.words
    .push(Command.parseActor(actor))
    .push(Command.parseEnumString(motion))
    .push(this.parseSpeed(speed))
    .push(Command.parseWait(wait))
    return [
      {color: 'actor'},
      {text: Yami.Local.get('command.playActorAnimation') + ': '},
      {text: words.join()},
    ]
  },
  load: function ({
    actor     = {type: 'trigger'},
    motion    = '',
    speed     = 1,
    wait      = false,
  }) {
    const write = Yami.getElementWriter('playActorAnimation')
    write('actor', actor)
    write('motion', motion)
    write('speed', speed)
    write('wait', wait)
    $('#playActorAnimation-actor').getFocus()
  },
  save: function () {
    const read = Yami.getElementReader('playActorAnimation')
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
      {text: Yami.Local.get('command.stopActorAnimation') + ': '},
      {text: Command.parseActor(actor)},
    ]
  },
  load: function ({actor = {type: 'trigger'}}) {
    const write = Yami.getElementWriter('stopActorAnimation')
    write('actor', actor)
    $('#stopActorAnimation-actor').getFocus()
  },
  save: function () {
    const read = Yami.getElementReader('stopActorAnimation')
    const actor = read('actor')
    Command.save({actor})
  },
}

// 创建全局角色
Command.cases.createGlobalActor = {
  initialize: function () {
    $('#createGlobalActor-confirm').on('click', this.save)

    // 创建队伍选项 - 窗口打开事件
    $('#createGlobalActor').on('open', function (event) {
      $('#createGlobalActor-teamId').loadItems(
        Yami.Data.createTeamItems()
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
      {text: Yami.Local.get('command.createGlobalActor') + ': '},
      {text: words.join()},
    ]
  },
  load: function ({
    actorId = '',
    teamId  = Yami.Data.teams.list[0].id,
  }) {
    const write = Yami.getElementWriter('createGlobalActor')
    write('actorId', actorId)
    write('teamId', teamId)
    $('#createGlobalActor-actorId').getFocus()
  },
  save: function () {
    const read = Yami.getElementReader('createGlobalActor')
    const actorId = read('actorId')
    if (actorId === '') {
      return $('#createGlobalActor-actorId').getFocus()
    }
    const teamId = read('teamId')
    Command.save({actorId, teamId})
  },
}

// 放置全局角色
Command.cases.placeGlobalActor = {
  initialize: function () {
    $('#placeGlobalActor-confirm').on('click', this.save)
  },
  parse: function ({actor, position}) {
    const words = Command.words
    .push(Command.parseActor(actor))
    .push(Command.parsePosition(position))
    return [
      {color: 'actor'},
      {text: Yami.Local.get('command.placeGlobalActor') + ': '},
      {text: words.join()},
    ]
  },
  load: function ({
    actor     = {type: 'trigger'},
    position  = {type: 'absolute', x: 0, y: 0},
  }) {
    const write = Yami.getElementWriter('placeGlobalActor')
    write('actor', actor)
    write('position', position)
    $('#placeGlobalActor-actor').getFocus('all')
  },
  save: function () {
    const read = Yami.getElementReader('placeGlobalActor')
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
      {text: Yami.Local.get('command.deleteGlobalActor') + ': '},
      {text: words.join()},
    ]
  },
  load: function ({actorId = ''}) {
    const write = Yami.getElementWriter('deleteGlobalActor')
    write('actorId', actorId)
    $('#deleteGlobalActor-actorId').getFocus()
  },
  save: function () {
    const read = Yami.getElementReader('deleteGlobalActor')
    const actorId = read('actorId')
    if (actorId === '') {
      return $('#deleteGlobalActor-actorId').getFocus()
    }
    Command.save({actorId})
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
    const label = Yami.Local.get('command.getTarget.condition.' + condition)
    switch (condition) {
      case 'max-threat':
      case 'nearest':
      case 'farthest':
      case 'random':
        return label
      case 'min-attribute-value':
      case 'max-attribute-value':
        return `${label}(${attribute})`
      case 'min-attribute-ratio':
      case 'max-attribute-ratio':
        return `${label}(${attribute} / ${divisor})`
    }
  },
  parse: function ({actor, selector, condition, attribute, divisor, variable}) {
    const words = Command.words
    .push(Command.parseActor(actor))
    .push(Command.parseActorSelector(selector))
    .push(this.parseCondition(condition, attribute, divisor))
    .push(Command.parseVariable(variable))
    return [
      {color: 'actor'},
      {text: Yami.Local.get('command.getTarget') + ': '},
      {text: words.join()},
    ]
  },
  load: function ({
    actor     = {type: 'trigger'},
    selector  = 'enemy',
    condition = 'max-threat',
    attribute = '',
    divisor   = '',
    variable  = {type: 'local', key: ''},
  }) {
    const write = Yami.getElementWriter('getTarget')
    write('actor', actor)
    write('selector', selector)
    write('condition', condition)
    write('attribute', attribute)
    write('divisor', divisor)
    write('variable', variable)
    $('#getTarget-actor').getFocus()
  },
  save: function () {
    const read = Yami.getElementReader('getTarget')
    const actor = read('actor')
    const selector = read('selector')
    const condition = read('condition')
    const variable = read('variable')
    if (Yami.VariableGetter.isNone(variable)) {
      return $('#getTarget-variable').getFocus()
    }
    switch (condition) {
      case 'max-threat':
      case 'nearest':
      case 'farthest':
      case 'random':
        Command.save({actor, selector, condition, variable})
        break
      case 'min-attribute-value':
      case 'max-attribute-value': {
        const attribute = read('attribute').trim()
        if (attribute === '') {
          return $('#getTarget-attribute').getFocus()
        }
        Command.save({actor, selector, condition, attribute, variable})
        break
      }
      case 'min-attribute-ratio':
      case 'max-attribute-ratio': {
        const attribute = read('attribute').trim()
        const divisor = read('divisor').trim()
        if (attribute === '') {
          return $('#getTarget-attribute').getFocus()
        }
        if (divisor === '') {
          return $('#getTarget-divisor').getFocus()
        }
        Command.save({actor, selector, condition, attribute, divisor, variable})
        break
      }
    }
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
        return Yami.Local.get('command.detectTargets.inSight')
      case false:
        return ''
    }
  },
  parse: function ({actor, distance, selector, inSight}) {
    const words = Command.words
    .push(Command.parseActor(actor))
    .push('≤' + distance + 't')
    .push(Command.parseActorSelector(selector))
    .push(this.parseInSight(inSight))
    return [
      {color: 'actor'},
      {text: Yami.Local.get('command.detectTargets') + ': '},
      {text: words.join()},
    ]
  },
  load: function ({
    actor     = {type: 'trigger'},
    distance  = 0,
    selector  = 'enemy',
    inSight   = false,
  }) {
    const write = Yami.getElementWriter('detectTargets')
    write('actor', actor)
    write('distance', distance)
    write('selector', selector)
    write('inSight', inSight)
    $('#detectTargets-actor').getFocus()
  },
  save: function () {
    const read = Yami.getElementReader('detectTargets')
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
  parse: function ({actor, distance, selector}) {
    const words = Command.words
    .push(Command.parseActor(actor))
    .push('>' + distance + 't')
    .push(Command.parseActorSelector(selector))
    return [
      {color: 'actor'},
      {text: Yami.Local.get('command.discardTargets') + ': '},
      {text: words.join()},
    ]
  },
  load: function ({
    actor     = {type: 'trigger'},
    distance  = 0,
    selector  = 'any',
  }) {
    const write = Yami.getElementWriter('discardTargets')
    write('actor', actor)
    write('distance', distance)
    write('selector', selector)
    $('#discardTargets-actor').getFocus()
  },
  save: function () {
    const read = Yami.getElementReader('discardTargets')
    const actor = read('actor')
    const distance = read('distance')
    const selector = read('selector')
    Command.save({actor, distance, selector})
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
      {text: Yami.Local.get('command.resetTargets') + ': '},
      {text: Command.parseActor(actor)},
    ]
  },
  load: function ({actor = {type: 'trigger'}}) {
    const write = Yami.getElementWriter('resetTargets')
    write('actor', actor)
    $('#resetTargets-actor').getFocus()
  },
  save: function () {
    const read = Yami.getElementReader('resetTargets')
    const actor = read('actor')
    Command.save({actor})
  },
}

// 施放技能
Command.cases.castSkill = {
  initialize: function () {
    $('#castSkill-confirm').on('click', this.save)

    // 创建模式选项
    $('#castSkill-mode').loadItems([
      {name: 'By Shortcut Key', value: 'by-key'},
      {name: 'By Skill Id', value: 'by-id'},
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
      {text: Yami.Local.get('command.castSkill') + ': '},
      {text: words.join()},
    ]
  },
  load: function ({
    actor   = {type: 'trigger'},
    mode    = 'by-key',
    key     = Yami.Enum.getDefStringId('shortcut-key'),
    skillId = '',
    skill   = {type: 'trigger'},
    wait    = false,
  }) {
    // 加载快捷键选项
    $('#castSkill-key').loadItems(
      Yami.Enum.getStringItems('shortcut-key')
    )
    const write = Yami.getElementWriter('castSkill')
    write('actor', actor)
    write('mode', mode)
    write('key', key)
    write('skillId', skillId)
    write('skill', skill)
    write('wait', wait)
    $('#castSkill-actor').getFocus()
  },
  save: function () {
    const read = Yami.getElementReader('castSkill')
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
    .push(Yami.Local.get('command.setSkill.' + operation))
    switch (operation) {
      case 'set-cooldown':
      case 'increase-cooldown':
      case 'decrease-cooldown':
        words.push(Command.parseVariableNumber(cooldown, 'ms'))
        break
    }
    return [
      {color: 'skill'},
      {text: Yami.Local.get('command.setSkill') + ': '},
      {text: words.join()},
    ]
  },
  load: function ({
    skill     = {type: 'trigger'},
    operation = 'set-cooldown',
    cooldown  = 0,
  }) {
    const write = Yami.getElementWriter('setSkill')
    write('skill', skill)
    write('operation', operation)
    write('cooldown', cooldown)
    $('#setSkill-skill').getFocus()
  },
  save: function () {
    const read = Yami.getElementReader('setSkill')
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
  parseTimeScale: function (timeScale) {
    if (timeScale === 1) return ''
    switch (typeof timeScale) {
      case 'number':
        return `x${timeScale}`
      case 'object':
        return Command.parseVariableNumber(timeScale)
    }
  },
  parse: function ({triggerId, caster, origin, angle, distance, timeScale}) {
    const casterName = Command.parseActor(caster)
    const originName = Command.parsePosition(origin)
    const words = Command.words
    .push(Command.parseFileName(triggerId))
    .push(casterName)
    .push(casterName !== originName ? originName : '')
    .push(Command.parseAngle(angle))
    .push(Command.parseVariableNumber(distance, 't'))
    .push(this.parseTimeScale(timeScale))
    return [
      {color: 'skill'},
      {text: Yami.Local.get('command.createTrigger') + ': '},
      {text: words.join()},
    ]
  },
  load: function ({
    triggerId = '',
    caster    = {type: 'trigger'},
    origin    = {type: 'actor', actor: {type: 'trigger'}},
    angle     = {type: 'direction', degrees: 0},
    distance  = 0,
    timeScale = 1,
  }) {
    const write = Yami.getElementWriter('createTrigger')
    write('triggerId', triggerId)
    write('caster', caster)
    write('origin', origin)
    write('angle', angle)
    write('distance', distance)
    write('timeScale', timeScale)
    $('#createTrigger-triggerId').getFocus()
  },
  save: function () {
    const read = Yami.getElementReader('createTrigger')
    const triggerId = read('triggerId')
    if (triggerId === '') {
      return $('#createTrigger-triggerId').getFocus()
    }
    const caster = read('caster')
    const origin = read('origin')
    const angle = read('angle')
    const distance = read('distance')
    const timeScale = read('timeScale')
    Command.save({triggerId, caster, origin, angle, distance, timeScale})
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
      {text: Yami.Local.get('command.setTriggerSpeed') + ': '},
      {text: words.join()},
    ]
  },
  load: function ({
    trigger = {type: 'trigger'},
    speed   = 0,
  }) {
    const write = Yami.getElementWriter('setTriggerSpeed')
    write('trigger', trigger)
    write('speed', speed)
    $('#setTriggerSpeed-trigger').getFocus()
  },
  save: function () {
    const read = Yami.getElementReader('setTriggerSpeed')
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
      {text: Yami.Local.get('command.setTriggerAngle') + ': '},
      {text: words.join()},
    ]
  },
  load: function ({
    trigger = {type: 'trigger'},
    angle   = {type: 'absolute', degrees: 0},
  }) {
    const write = Yami.getElementWriter('setTriggerAngle')
    write('trigger', trigger)
    write('angle', angle)
    $('#setTriggerAngle-trigger').getFocus()
  },
  save: function () {
    const read = Yami.getElementReader('setTriggerAngle')
    const trigger = read('trigger')
    const angle = read('angle')
    Command.save({trigger, angle})
  },
}

// 设置包裹
Command.cases.setBag = {
  initialize: function () {
    $('#setBag-confirm').on('click', this.save)

    // 创建操作选项
    $('#setBag-operation').loadItems([
      {name: 'Increase Money', value: 'increase-money'},
      {name: 'Decrease Money', value: 'decrease-money'},
      {name: 'Increase Items', value: 'increase-items'},
      {name: 'Decrease Items', value: 'decrease-items'},
      {name: 'Create Equipment', value: 'create-equipment'},
      {name: 'Gain Equipment', value: 'gain-equipment'},
      {name: 'Lose Equipment', value: 'lose-equipment'},
      {name: 'Swap Indices', value: 'swap'},
      {name: 'Sort Simply', value: 'sort'},
      {name: 'Sort by Filename', value: 'sort-by-filename'},
      {name: 'Use Someone Else\'s Bag', value: 'reference'},
      {name: 'Reset', value: 'reset'},
    ])

    // 设置关联元素
    $('#setBag-operation').enableHiddenMode().relate([
      {case: ['increase-money', 'decrease-money'], targets: [
        $('#setBag-money'),
      ]},
      {case: ['increase-items', 'decrease-items'], targets: [
        $('#setBag-itemId'),
        $('#setBag-quantity'),
      ]},
      {case: 'create-equipment', targets: [
        $('#setBag-equipmentId'),
      ]},
      {case: ['gain-equipment', 'lose-equipment'], targets: [
        $('#setBag-equipment'),
      ]},
      {case: 'swap', targets: [
        $('#setBag-index1'),
        $('#setBag-index2'),
      ]},
      {case: 'reference', targets: [
        $('#setBag-refActorId'),
      ]},
    ])
  },
  parse: function ({actor, operation, money, itemId, quantity, equipmentId, equipment, index1, index2, refActorId}) {
    const words = Command.words
    .push(Command.parseActor(actor))
    .push(Yami.Local.get('command.setBag.' + operation))
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
      case 'create-equipment':
        words.push(Command.parseVariableFile(equipmentId))
        break
      case 'gain-equipment':
      case 'lose-equipment':
        words.push(Command.parseEquipment(equipment))
        break
      case 'swap': {
        const a = Command.parseVariableNumber(index1)
        const b = Command.parseVariableNumber(index2)
        words.push(`${a} <-> ${b}`)
        break
      }
      case 'reference':
        words.push(Command.parseFileName(refActorId))
        break
    }
    return [
      {color: 'bag'},
      {text: Yami.Local.get('command.setBag') + ': '},
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
    equipment   = {type: 'latest'},
    index1      = 0,
    index2      = 1,
    refActorId  = '',
  }) {
    const write = Yami.getElementWriter('setBag')
    write('actor', actor)
    write('operation', operation)
    write('money', money)
    write('itemId', itemId)
    write('quantity', quantity)
    write('equipmentId', equipmentId)
    write('equipment', equipment)
    write('index1', index1)
    write('index2', index2)
    write('refActorId', refActorId)
    $('#setBag-actor').getFocus()
  },
  save: function () {
    const read = Yami.getElementReader('setBag')
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
          return $('#setBag-itemId').getFocus()
        }
        Command.save({actor, operation, itemId, quantity})
        break
      }
      case 'create-equipment': {
        const equipmentId = read('equipmentId')
        if (equipmentId === '') {
          return $('#setBag-equipmentId').getFocus()
        }
        Command.save({actor, operation, equipmentId})
        break
      }
      case 'gain-equipment':
      case 'lose-equipment': {
        const equipment = read('equipment')
        Command.save({actor, operation, equipment})
        break
      }
      case 'swap': {
        const index1 = read('index1')
        const index2 = read('index2')
        Command.save({actor, operation, index1, index2})
        break
      }
      case 'sort':
      case 'sort-by-filename':
        Command.save({actor, operation})
        break
      case 'reset':
        Command.save({actor, operation})
        break
      case 'reference': {
        const refActorId = read('refActorId')
        Command.save({actor, operation, refActorId})
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
      {name: 'By Item Id', value: 'by-id'},
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
      {color: 'bag'},
      {text: Yami.Local.get('command.useItem') + ': '},
      {text: words.join()},
    ]
  },
  load: function ({
    actor   = {type: 'trigger'},
    mode    = 'by-key',
    key     = Yami.Enum.getDefStringId('shortcut-key'),
    itemId  = '',
    item    = {type: 'trigger'},
    wait    = false,
  }) {
    // 加载快捷键选项
    $('#useItem-key').loadItems(
      Yami.Enum.getStringItems('shortcut-key')
    )
    const write = Yami.getElementWriter('useItem')
    write('actor', actor)
    write('mode', mode)
    write('key', key)
    write('itemId', itemId)
    write('item', item)
    write('wait', wait)
    $('#useItem-actor').getFocus()
  },
  save: function () {
    const read = Yami.getElementReader('useItem')
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
    .push(Yami.Local.get('command.setItem.' + operation))
    switch (operation) {
      case 'increase':
      case 'decrease':
        words.push(Command.parseVariableNumber(quantity))
        break
    }
    return [
      {color: 'bag'},
      {text: Yami.Local.get('command.setItem') + ': '},
      {text: words.join()},
    ]
  },
  load: function ({
    item      = {type: 'trigger'},
    operation = 'increase',
    quantity  = 1,
  }) {
    const write = Yami.getElementWriter('setItem')
    write('item', item)
    write('operation', operation)
    write('quantity', quantity)
    $('#setItem-item').getFocus()
  },
  save: function () {
    const read = Yami.getElementReader('setItem')
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
      {name: 'Reset', value: 'reset'},
    ])

    // 设置操作关联元素
    $('#setCooldown-operation').enableHiddenMode().relate([
      {case: ['set', 'increase', 'decrease'], targets: [
        $('#setCooldown-cooldown'),
      ]},
    ])
  },
  parse: function ({actor, operation, key, cooldown}) {
    const words = Command.words
    .push(Command.parseActor(actor))
    .push(Yami.Local.get('command.setCooldown.' + operation))
    .push(Command.parseVariableEnum('cooldown-key', key))
    switch (operation) {
      case 'set':
      case 'increase':
      case 'decrease':
        words.push(Command.parseVariableNumber(cooldown, 'ms'))
        break
    }
    return [
      {color: 'bag'},
      {text: Yami.Local.get('command.setCooldown') + ': '},
      {text: words.join()},
    ]
  },
  load: function ({
    actor     = {type: 'trigger'},
    operation = 'set',
    key       = Yami.Enum.getDefStringId('cooldown-key'),
    cooldown  = 0,
  }) {
    // 加载快捷键选项
    $('#setCooldown-key').loadItems(
      Yami.Enum.getStringItems('cooldown-key')
    )
    const write = Yami.getElementWriter('setCooldown')
    write('actor', actor)
    write('operation', operation)
    write('key', key)
    write('cooldown', cooldown)
    $('#setCooldown-actor').getFocus()
  },
  save: function () {
    const read = Yami.getElementReader('setCooldown')
    const actor = read('actor')
    const operation = read('operation')
    const key = read('key')
    if (key === '') {
      return $('#setCooldown-key').getFocus()
    }
    switch (operation) {
      case 'set':
      case 'increase':
      case 'decrease': {
        const cooldown = read('cooldown')
        Command.save({actor, operation, key, cooldown})
        break
      }
      case 'reset':
        Command.save({actor, operation, key})
        break
    }
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
    ])

    // 设置操作关联元素
    $('#setShortcut-operation').enableHiddenMode().relate([
      {case: 'set-item-shortcut', targets: [
        $('#setShortcut-item'),
        $('#setShortcut-key'),
      ]},
      {case: 'set-skill-shortcut', targets: [
        $('#setShortcut-skill'),
        $('#setShortcut-key'),
      ]},
      {case: 'delete-shortcut', targets: [
        $('#setShortcut-key'),
      ]},
    ])
  },
  parse: function ({actor, operation, item, skill, key}) {
    const words = Command.words
    .push(Command.parseActor(actor))
    .push(Yami.Local.get('command.setShortcut.' + operation))
    const shortcutKey = Command.parseGroupEnumString('shortcut-key', key)
    switch (operation) {
      case 'set-item-shortcut':
        words.push(Command.parseItem(item)).push(shortcutKey)
        break
      case 'set-skill-shortcut':
        words.push(Command.parseSkill(skill)).push(shortcutKey)
        break
      case 'delete-shortcut':
        words.push(shortcutKey)
        break
    }
    return [
      {color: 'bag'},
      {text: Yami.Local.get('command.setShortcut') + ': '},
      {text: words.join()},
    ]
  },
  load: function ({
    actor     = {type: 'trigger'},
    operation = 'set-item-shortcut',
    item      = {type: 'trigger'},
    skill     = {type: 'trigger'},
    key       = Yami.Enum.getDefStringId('shortcut-key'),
  }) {
    // 加载快捷键选项
    $('#setShortcut-key').loadItems(
      Yami.Enum.getStringItems('shortcut-key')
    )
    const write = Yami.getElementWriter('setShortcut')
    write('actor', actor)
    write('operation', operation)
    write('item', item)
    write('skill', skill)
    write('key', key)
    $('#setShortcut-operation').getFocus()
  },
  save: function () {
    const read = Yami.getElementReader('setShortcut')
    const actor = read('actor')
    const operation = read('operation')
    const key = read('key')
    if (key === '') {
      return $('#setShortcut-key').getFocus()
    }
    switch (operation) {
      case 'set-item-shortcut': {
        const item = read('item')
        Command.save({actor, operation, item, key})
        break
      }
      case 'set-skill-shortcut': {
        const skill = read('skill')
        Command.save({actor, operation, skill, key})
        break
      }
      case 'delete-shortcut':
        Command.save({actor, operation, key})
        break
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
      {text: Yami.Local.get('command.activateScene') + ': '},
      {text: this.parsePointer(pointer)},
    ]
  },
  load: function ({pointer = 0}) {
    const write = Yami.getElementWriter('activateScene')
    write('pointer', pointer)
    $('#activateScene-pointer').getFocus()
  },
  save: function () {
    const read = Yami.getElementReader('activateScene')
    const pointer = read('pointer')
    Command.save({pointer})
  },
}

// 加载场景
Command.cases.loadScene = {
  initialize: function () {
    $('#loadScene-confirm').on('click', this.save)

    // 创建类型选项
    $('#loadScene-type').loadItems([
      {name: 'Specify', value: 'specify'},
      {name: 'Start Scene', value: 'start'},
    ])

    // 设置类型关联元素
    $('#loadScene-type').enableHiddenMode().relate([
      {case: 'specify', targets: [
        $('#loadScene-sceneId'),
      ]},
    ])
  },
  parse: function ({type, sceneId}) {
    let scene
    switch (type) {
      case 'specify':
        scene = Command.parseFileName(sceneId)
        break
      case 'start':
        scene = Yami.Local.get('command.loadScene.start')
        break
    }
    return [
      {color: 'scene'},
      {text: Yami.Local.get('command.loadScene') + ': '},
      {text: scene},
    ]
  },
  load: function ({
    type    = 'specify',
    sceneId = '',
  }) {
    const write = Yami.getElementWriter('loadScene')
    write('type', type)
    write('sceneId', sceneId)
    $('#loadScene-sceneId').getFocus()
  },
  save: function () {
    const read = Yami.getElementReader('loadScene')
    const type = read('type')
    switch (type) {
      case 'specify': {
        const sceneId = read('sceneId')
        if (sceneId === '') {
          return $('#loadScene-sceneId').getFocus()
        }
        Command.save({type, sceneId})
        break
      }
      case 'start':
        Command.save({type})
        break
    }
  },
}

// 删除场景
Command.cases.deleteScene = {
  parse: function () {
    return [
      {color: 'scene'},
      {text: Yami.Local.get('command.deleteScene')},
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
        Yami.Data.createEasingItems()
      )
    })

    // 清理内存 - 窗口已关闭事件
    $('#moveCamera').on('closed', function (event) {
      $('#moveCamera-easingId').clear()
    })
  },
  parse: function ({mode, position, actor, easingId, duration, wait}) {
    const words = Command.words.push(Yami.Local.get('command.moveCamera.' + mode))
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
      {text: Yami.Local.get('command.moveCamera') + ': '},
      {text: words.join()},
    ]
  },
  load: function ({
    mode      = 'position',
    position  = {type: 'absolute', x: 0, y: 0},
    actor     = {type: 'trigger'},
    easingId  = Yami.Data.easings[0].id,
    duration  = 0,
    wait      = true,
  }) {
    const write = Yami.getElementWriter('moveCamera')
    write('mode', mode)
    write('position', position)
    write('actor', actor)
    write('easingId', easingId)
    write('duration', duration)
    write('wait', wait)
    $('#moveCamera-mode').getFocus()
  },
  save: function () {
    const read = Yami.getElementReader('moveCamera')
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
        Yami.Data.createEasingItems()
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
      {text: Yami.Local.get('command.setZoomFactor') + ': '},
      {text: words.join()},
    ]
  },
  load: function ({
    zoom      = 1,
    easingId  = Yami.Data.easings[0].id,
    duration  = 0,
    wait      = true,
  }) {
    const write = Yami.getElementWriter('setZoomFactor')
    write('zoom', zoom)
    write('easingId', easingId)
    write('duration', duration)
    write('wait', wait)
    $('#setZoomFactor-zoom').getFocus('all')
  },
  save: function () {
    const read = Yami.getElementReader('setZoomFactor')
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
        Yami.Data.createEasingItems()
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
    return `RGB(${r}, ${g}, ${b})`
  },
  parse: function ({red, green, blue, easingId, duration, wait}) {
    const words = Command.words
    .push(this.parseColor(red, green, blue))
    .push(Command.parseEasing(easingId, duration, wait))
    const contents = [
      {color: 'scene'},
      {text: Yami.Local.get('command.setAmbientLight') + ': '},
      {text: words.join()},
    ]
    return contents
  },
  load: function ({
    red       = 0,
    green     = 0,
    blue      = 0,
    easingId  = Yami.Data.easings[0].id,
    duration  = 0,
    wait      = true,
  }) {
    const write = Yami.getElementWriter('setAmbientLight')
    write('red', red)
    write('green', green)
    write('blue', blue)
    write('easingId', easingId)
    write('duration', duration)
    write('wait', wait)
    $('#setAmbientLight-red').getFocus('all')
  },
  save: function () {
    const read = Yami.getElementReader('setAmbientLight')
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
        Yami.Data.createEasingItems()
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
    return `(${red}, ${green}, ${blue}, ${gray})`
  },
  parse: function ({tint, easingId, duration, wait}) {
    const words = Command.words
    .push(this.parseTint(tint))
    .push(Command.parseEasing(easingId, duration, wait))
    const contents = [
      {color: 'scene'},
      {text: Yami.Local.get('command.tintScreen') + ': '},
      {text: words.join()},
    ]
    return contents
  },
  load: function ({
    tint      = [0, 0, 0, 0],
    easingId  = Yami.Data.easings[0].id,
    duration  = 0,
    wait      = true,
  }) {
    const write = Yami.getElementWriter('tintScreen')
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
    const read = Yami.getElementReader('tintScreen')
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
        Yami.Data.createEasingItems()
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
      {text: Yami.Local.get('command.setGameSpeed') + ': '},
      {text: words.join()},
    ]
  },
  load: function ({
    speed     = 1,
    easingId  = Yami.Data.easings[0].id,
    duration  = 0,
    wait      = true,
  }) {
    const write = Yami.getElementWriter('setGameSpeed')
    write('speed', speed)
    write('easingId', easingId)
    write('duration', duration)
    write('wait', wait)
    $('#setGameSpeed-speed').getFocus('all')
  },
  save: function () {
    const read = Yami.getElementReader('setGameSpeed')
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
      {text: Yami.Local.get('command.setCursor') + ': '},
      {text: Command.parseFileName(image)},
    ]
  },
  load: function ({image = ''}) {
    const write = Yami.getElementWriter('setCursor')
    write('image', image)
    $('#setCursor-image').getFocus()
  },
  save: function () {
    const read = Yami.getElementReader('setCursor')
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
      const items = Yami.Data.createTeamItems()
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
    return Yami.Local.get('command.setTeamRelation.relation.' + relation)
  },
  parse: function ({teamId1, teamId2, relation}) {
    const words = Command.words
    .push(Command.parseTeam(teamId1))
    .push(Command.parseTeam(teamId2))
    .push(this.parseRelation(relation))
    return [
      {color: 'system'},
      {text: Yami.Local.get('command.setTeamRelation') + ': '},
      {text: words.join()},
    ]
  },
  load: function ({
    teamId1   = Yami.Data.teams.list[0].id,
    teamId2   = Yami.Data.teams.list[0].id,
    relation  = 0,
  }) {
    const write = Yami.getElementWriter('setTeamRelation')
    write('teamId1', teamId1)
    write('teamId2', teamId2)
    write('relation', relation)
    $('#setTeamRelation-teamId1').getFocus()
  },
  save: function () {
    const read = Yami.getElementReader('setTeamRelation')
    const teamId1 = read('teamId1')
    const teamId2 = read('teamId2')
    const relation = read('relation')
    if (teamId1 === teamId2) {
      return $('#setTeamRelation-teamId2').getFocus()
    }
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
      {text: Yami.Local.get('command.switchCollisionSystem') + ': '},
      {text: Yami.Local.get('command.switchCollisionSystem.' + operation)},
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
      {name: 'Save Global Data', value: 'save-global-data'},
      {name: 'Load Global Data', value: 'load-global-data'},
    ])

    // 设置操作关联元素
    $('#gameData-operation').enableHiddenMode().relate([
      {case: 'save', targets: [
        $('#gameData-filename'),
        $('#gameData-variables'),
      ]},
      {case: ['save', 'load', 'delete'], targets: [
        $('#gameData-filename'),
      ]},
    ])
  },
  parseOperation: function (operation) {
    return Yami.Local.get('command.gameData.' + operation)
  },
  parse: function ({operation, filename, variables}) {
    const words = Command.words.push(this.parseOperation(operation))
    switch (operation) {
      case 'save':
        words.push(Command.parseVariableString(filename))
        if (variables) {
          const label = Yami.Local.get('command.gameData.variables')
          const string = variables.split(/\s*,\s*/).join(', ')
          words.push(`${label} {${string}}`)
        }
        break
      case 'load':
      case 'delete':
        words.push(Command.parseVariableString(filename))
        break
    }
    return [
      {color: 'system'},
      {text: Yami.Local.get('command.gameData') + ': '},
      {text: words.join()},
    ]
  },
  load: function ({
    operation = 'save',
    filename  = '',
    variables = '',
  }) {
    $('#gameData-operation').write(operation)
    $('#gameData-filename').write(filename)
    $('#gameData-variables').write(variables)
    $('#gameData-operation').getFocus()
  },
  save: function () {
    const read = Yami.getElementReader('gameData')
    const operation = read('operation')
    switch (operation) {
      case 'save': {
        const filename = read('filename')
        if (filename === '') {
          return $('#gameData-filename').getFocus()
        }
        const variables = read('variables').trim()
        Command.save({operation, filename, variables})
        break
      }
      case 'load':
      case 'delete': {
        const filename = read('filename')
        if (filename === '') {
          return $('#gameData-filename').getFocus()
        }
        Command.save({operation, filename})
        break
      }
      case 'save-global-data':
      case 'load-global-data':
        Command.save({operation})
        break
    }
  },
}

// 重置游戏
Command.cases.reset = {
  parse: function () {
    return [
      {color: 'system'},
      {text: Yami.Local.get('command.reset')},
    ]
  },
  save: function () {
    Command.save({})
  },
}

// 执行脚本
Command.cases.script = {
  initialize: function () {
    $('#script-confirm').on('click', this.save)
  },
  parse: function ({script}) {
    const MAX_LINES = 10
    const contents = []
    const lines = script.split('\n')
    let length = lines.length
    if (length > MAX_LINES) {
      length = MAX_LINES + 1
      lines[MAX_LINES] = '......'
    }
    for (let i = 0; i < length; i++) {
      if (i === 0) {
        contents.push(
          {color: 'text'},
          {text: lines[i]},
        )
      } else {
        contents.push(
          {break: true},
          {text: lines[i]},
        )
      }
    }
    return contents
  },
  load: function ({script = ''}) {
    $('#script-script').write(script)
    $('#script-script').getFocus('end')
  },
  save: function () {
    const script = $('#script-script').read()
    if (script === '') {
      return $('#script-script').getFocus()
    }
    try {
      new Function(script)
    } catch (error) {
      const get = Yami.Local.createGetter('confirmation')
      let continued = false
      return Yami.Window.confirm({
        message: `${error.message}\n${get('compileError')}`,
        close: () => {
          if (!continued) {
            $('#script-script').getFocus()
          }
        },
      }, [{
        label: get('yes'),
        click: () => {
          continued = true
          Command.save({script})
        },
      }, {
        label: get('no'),
      }])
    }
    Command.save({script})
  },
}

// 自定义指令
Command.custom = {
  customFolder: null,
  commandNameMap: null,
  windowX: null,
  windowY: null,
  script: {id: '', parameters: null},
  windowFrame: $('#scriptCommand'),
  parameterPane: $('#scriptCommand-parameter-pane'),
  parameterGrid: $('#scriptCommand-parameter-grid'),

  // 初始化
  initialize: function () {
    window.on('localize', this.windowLocalize)
    $('#scriptCommand-confirm').on('click', this.save)

    // 参数面板 - 设置获取数据方法
    const scriptList = [this.script]
    this.parameterPane.getData = () => scriptList

    // 参数面板 - 调整大小时回调
    this.parameterPane.onResize = () => {
      const height = grid.clientHeight
      this.windowFrame.style.height = `${height + 74}px`
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
      this.script.parameters = null
      this.parameterPane.clear()
    })
  },

  // 解析自定义指令
  parse: function (id, parameters) {
    // 如果不存在脚本，则返回ID名称
    const meta = Yami.Data.scripts[id]
    const name = this.commandNameMap[id]
    if (meta === undefined || name === undefined) {
      const label = Yami.Local.get('command.invalidCommand')
      const cmdId = Command.parseUnlinkedId(id)
      return [
        {color: 'invalid'},
        {text: `${label}: ${cmdId}`},
      ]
    }
    // 重构脚本参数
    const script = this.script
    script.id = id
    script.parameters = parameters
    Yami.PluginManager.reconstruct(script)
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
          words.push(value.toString())
          continue
        case 'number':
          words.push(value.toString())
          continue
        case 'string':
          words.push(`"${value}"`)
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
          words.push(Yami.Data.easings.map[value].name)
          continue
        case 'team':
          words.push(Yami.Data.teams.map[value].name)
          continue
        case 'variable':
          words.push(value ? `{variable:${value}}` : Yami.Local.get('common.none'))
          continue
        case 'file':
        case 'image':
        case 'audio':
          words.push(Command.parseFileName(value))
          continue
        case 'number[]':
          if (value.length <= 5) {
            words.push(`[${value.join(', ')}]`)
          } else {
            words.push(`[${value.slice(0, 5).join(', ')}, ...]`)
          }
          continue
        case 'string[]': {
          const strings = value.slice(0, 5)
          for (let i = 0; i < strings.length; i++) {
            strings[i] = `"${Command.parseMultiLineString(strings[i])}"`
          }
          if (value.length <= 5) {
            words.push(`[${strings.join(', ')}]`)
          } else {
            words.push(`[${strings.join(', ')}, ...]`)
          }
          continue
        }
        case 'keycode':
          words.push(value || Yami.Local.get('common.none'))
          continue
        case 'color':
          words.push(`#${value}`)
          continue
      }
    }
    return [
      {color: 'custom'},
      {text: name + ': '},
      {text: words.join()},
    ]
  },

  // 加载自定义指令
  load: function (id, parameters) {
    this.script.id = id
    this.script.parameters = Object.clone(parameters)
    this.windowX = Yami.Window.absolutePos.x
    this.windowY = Yami.Window.absolutePos.y
    this.parameterPane.update()
    const selector = Yami.Layout.focusableSelector
    this.parameterPane.querySelector(selector)?.getFocus()
    this.windowFrame.setTitle(this.commandNameMap[id])
  },

  // 保存参数
  save: function () {
    Command.save(Command.custom.script.parameters ?? {})
  },

  // 加载指令列表
  loadCommandList: async function () {
    if (!Yami.Data.commands) return
    const {list} = Yami.CommandSuggestion
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
    for (const command of Yami.Data.commands) {
      const id = command.id
      let meta = Yami.Data.scripts[id]
      // 可能出现脚本未加载完毕的情况
      if (meta instanceof Promise) {
        meta = await meta
      }
      if (!meta || id in commandNameMap) {
        continue
      }
      const name = command.alias ||
      meta.langMap.update().get(meta.overview.plugin) ||
      Command.parseFileName(id)
      commandNameMap[id] = name
      commands.push({
        class: 'custom',
        value: id,
        name: name,
        keywords: command.keywords,
        unspacedName: String.compress(name),
      })
    }
    this.customFolder.children = commands
    this.commandNameMap = commandNameMap
    Yami.CommandSuggestion.windowLocalize()
    // 重新构建指令项目的父对象引用
    Yami.NodeList.createParents(commands, this.customFolder)
  },

  // 窗口 - 本地化事件
  windowLocalize: function (event) {
    if (Command.custom.commandNameMap) {
      Command.custom.loadCommandList()
    }
  },
}

// ******************************** 指令对象导出 ********************************

export { Command }
