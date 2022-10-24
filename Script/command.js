'use strict'

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

// 初始化
Command.initialize = function () {
  // 创建词语列表
  this.words = new Command.WordList()

  // 初始化相关对象
  CommandSuggestion.initialize()
  TextSuggestion.initialize()
  VariableGetter.initialize()
  ActorGetter.initialize()
  SkillGetter.initialize()
  StateGetter.initialize()
  EquipmentGetter.initialize()
  ItemGetter.initialize()
  PositionGetter.initialize()
  AngleGetter.initialize()
  TriggerGetter.initialize()
  LightGetter.initialize()
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
      return Local.get('blend.normal')
    case 'screen':
      return Local.get('blend.screen')
    case 'additive':
      return Local.get('blend.additive')
    case 'subtract':
      return Local.get('blend.subtract')
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
      return isConstantKey ? key : `${Local.get('variable.local')}[${key}]`
    case 'global':
      return isConstantKey ? `@${key}` : `${Local.get('variable.global')}[${key}]`
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
  if (id === '') return Local.get('common.none')
  const variable = Data.variables.map[id]
  return variable ? variable.name : `#${id}`
}

// 解析属性键
Command.parseAttributeKey = function (group, id) {
  const attr = Attribute.getGroupAttribute(group, id)
  if (attr) return attr.name
  this.invalid = true
  return `#${id}`
}

// 解析变量标签
Command.parseVariableTag = function IIFE() {
  const regexp = /(?<=<global:)[0-9a-f]{16}(?=>)/g
  const replacer = varKey => {
    const varName = Data.variables.map[varKey]?.name
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
  if (spriteId === '') return Local.get('common.none')
  const animation = Data.animations[animationId]
  const sprite = animation?.sprites.find(a => a.id === spriteId)
  if (sprite) return sprite.name
  this.invalid = true
  return Command.parseUnlinkedId(spriteId)
}

// 解析事件类型
Command.parseEventType = function (groupKey, eventType) {
  return Local.get('eventTypes.' + eventType) ||
  Command.parseGroupEnumString(groupKey, eventType)
}

// 解析枚举字符串
Command.parseEnumString = function (stringId) {
  if (stringId === '') return Local.get('common.none')
  const string = Enum.getString(stringId)
  if (string) return string.name
  this.invalid = true
  return Command.parseUnlinkedId(stringId)
}

// 解析群组枚举字符串
Command.parseGroupEnumString = function (groupKey, stringId) {
  if (stringId === '') return Local.get('common.none')
  const string = Enum.getGroupString(groupKey, stringId)
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
  const label = Local.get('parameter.param')
  const varName = Command.parseVariable(variable)
  const paramKey = Command.parseVariableString(paramName)
  return `${label}(${varName}, ${paramKey})`
}

// 解析角色
Command.parseActor = function (actor) {
  switch (actor.type) {
    case 'trigger':
      return Local.get('actor.trigger')
    case 'caster':
      return Local.get('actor.caster')
    case 'latest':
      return Local.get('actor.latest')
    case 'player':
      return Local.get('actor.player')
    case 'member':
      return `${Local.get('actor.member')}.${actor.memberId + 1}`
    case 'global':
      return Command.parseFileName(actor.actorId)
    case 'by-id': {
      const label = Local.get('actor.common')
      const prop = Local.get('actor.by-id')
      const preset = Command.parsePresetObject(actor.presetId)
      return `${label}(${prop}:${preset})`
    }
    case 'by-name': {
      const label = Local.get('actor.common')
      const prop = Local.get('actor.by-name')
      const name = Command.parseObjectName(actor.name)
      return `${label}(${prop}:${name})`
    }
    case 'variable': {
      const label = Local.get('actor.common')
      const prop = Local.get('actor.variable')
      const variable = Command.parseVariable(actor.variable)
      return `${label}(${prop}:${variable})`
    }
  }
}

// 解析技能
Command.parseSkill = function (skill) {
  switch (skill.type) {
    case 'trigger':
      return Local.get('skill.trigger')
    case 'latest':
      return Local.get('skill.latest')
    case 'by-key': {
      const actor = Command.parseActor(skill.actor)
      const label = Local.get('skill.common')
      const prop = Local.get('skill.by-key')
      const key = Command.parseGroupEnumString('shortcut-key', skill.key)
      return `${actor} -> ${label}(${prop}:${key})`
    }
    case 'variable': {
      const label = Local.get('skill.common')
      const prop = Local.get('skill.variable')
      const variable = Command.parseVariable(skill.variable)
      return `${label}(${prop}:${variable})`
    }
  }
}

// 解析状态
Command.parseState = function (state) {
  switch (state.type) {
    case 'trigger':
      return Local.get('state.trigger')
    case 'latest':
      return Local.get('state.latest')
    case 'variable': {
      const label = Local.get('state.common')
      const prop = Local.get('state.variable')
      const variable = Command.parseVariable(state.variable)
      return `${label}(${prop}:${variable})`
    }
  }
}

// 解析装备
Command.parseEquipment = function (equipment) {
  switch (equipment.type) {
    case 'trigger':
      return Local.get('equipment.trigger')
    case 'latest':
      return Local.get('equipment.latest')
    case 'by-key': {
      const actor = Command.parseActor(equipment.actor)
      const label = Local.get('equipment.common')
      const prop = Local.get('equipment.by-key')
      const key = Command.parseGroupEnumString('equipment-slot', equipment.key)
      return `${actor} -> ${label}(${prop}:${key})`
    }
    case 'variable': {
      const label = Local.get('equipment.common')
      const prop = Local.get('equipment.variable')
      const variable = Command.parseVariable(equipment.variable)
      return `${label}(${prop}:${variable})`
    }
  }
}

// 解析物品
Command.parseItem = function (item) {
  switch (item.type) {
    case 'trigger':
      return Local.get('item.trigger')
    case 'latest':
      return Local.get('item.latest')
    case 'by-key': {
      const actor = Command.parseActor(item.actor)
      const label = Local.get('item.common')
      const prop = Local.get('item.by-key')
      const key = Command.parseGroupEnumString('shortcut-key', item.key)
      return `${actor} -> ${label}(${prop}:${key})`
    }
    case 'variable': {
      const label = Local.get('item.common')
      const prop = Local.get('item.variable')
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
      return `${Local.get('position.common')}(${x}, ${y})`
    }
    case 'relative': {
      const x = this.parseVariableNumber(position.x)
      const y = this.parseVariableNumber(position.y)
      return `${Local.get('position.relative')}(${x}, ${y})`
    }
    case 'actor':
      return `${Local.get('position.common')}(${this.parseActor(position.actor)})`
    case 'trigger':
      return `${Local.get('position.common')}(${this.parseTrigger(position.trigger)})`
    case 'light':
      return `${Local.get('position.common')}(${this.parseLight(position.light)})`
    case 'region':
      return `${Local.get('position.common')}(${this.parseRegion(position.regionId)})`
  }
}

// 解析角度
Command.parseAngle = function (angle) {
  const type = angle.type
  const desc = Local.get('angle.' + type)
  switch (type) {
    case 'position':
      return `${desc} ${this.parsePosition(angle.position)}`
    case 'absolute':
      return `${desc} ${this.parseVariableNumber(angle.degrees)}°`
    case 'relative':
      return `${desc} ${this.parseVariableNumber(angle.degrees)}°`
    case 'direction':
      return `${desc} ${angle.degrees}°`
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
      return Local.get('trigger.trigger')
    case 'latest':
      return Local.get('trigger.latest')
    case 'variable': {
      const label = Local.get('trigger.common')
      const prop = Local.get('trigger.variable')
      const variable = Command.parseVariable(trigger.variable)
      return `${label}(${prop}:${variable})`
    }
  }
}

// 解析光源
Command.parseLight = function (light) {
  switch (light.type) {
    case 'trigger':
      return Local.get('light.trigger')
    case 'latest':
      return Local.get('light.latest')
    case 'by-id': {
      const label = Local.get('light.common')
      const prop = Local.get('light.by-id')
      const preset = Command.parsePresetObject(light.presetId)
      return `${label}(${prop}:${preset})`
    }
    case 'by-name': {
      const label = Local.get('light.common')
      const prop = Local.get('light.by-name')
      return `${label}(${prop}:"${light.name}")`
    }
    case 'variable': {
      const label = Local.get('light.common')
      const prop = Local.get('light.variable')
      const variable = Command.parseVariable(light.variable)
      return `${label}(${prop}:${variable})`
    }
  }
}

// 解析元素
Command.parseElement = function (element) {
  switch (element.type) {
    case 'trigger':
      return Local.get('element.trigger')
    case 'latest':
      return Local.get('element.latest')
    case 'by-id': {
      const label = Local.get('element.common')
      const prop = Local.get('element.by-id')
      const preset = Command.parsePresetElement(element.presetId, false)
      return `${label}(${prop}:${preset})`
    }
    case 'by-name': {
      const label = Local.get('element.common')
      const prop = Local.get('element.by-name')
      return `${label}(${prop}:"${element.name}")`
    }
    case 'by-ancestor-and-id': {
      const ancestor = Command.parseElement(element.ancestor)
      const label = Local.get('element.common')
      const prop = Local.get('element.by-id')
      const preset = Command.parsePresetElement(element.presetId, false)
      const descendant = `${label}(${prop}:${preset})`
      return `${ancestor} -> ${descendant}`
    }
    case 'by-ancestor-and-name': {
      const ancestor = Command.parseElement(element.ancestor)
      const label = Local.get('element.common')
      const prop = Local.get('element.by-name')
      const descendant = `${label}(${prop}:"${element.name}")`
      return `${ancestor} -> ${descendant}`
    }
    case 'variable': {
      const label = Local.get('element.common')
      const prop = Local.get('element.variable')
      const variable = Command.parseVariable(element.variable)
      return `${label}(${prop}:${variable})`
    }
  }
}

// 解析预设对象
Command.parsePresetObject = function (presetId) {
  if (presetId === '') return Local.get('common.none')
  const name = Scene.presets?.[presetId]?.name
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
      return Local.get('common.none')
    }
    const uiId = Data.uiLinks[presetId] ?? ''
    const uiName = Command.parseFileName(uiId)
    let presetName
    const ui = Data.ui[uiId]
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
  const team = Data.teams.map[id]
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
      return Local.get('actorFilter.' + selector)
  }
}

// 解析文件名称
Command.parseFileName = function (id) {
  if (id === '') return Local.get('common.none')
  const meta = Data.manifest.guidMap[id]
  if (meta) return File.parseMetaName(meta)
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
    case true:  return Local.get('transition.wait')
  }
}

// 解析过渡方式
Command.parseEasing = function (easingId, duration, wait) {
  if (duration === 0) return ''
  const easing = Data.easings.map[easingId]
  const time = Command.parseVariableNumber(duration, 'ms')
  const info = `${easing?.name ?? `#${easingId}`}, ${time}`
  return wait ? `${info}, ${Local.get('transition.wait')}` : info
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
          const name = Data.variables.map[id]?.name
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
    const alias = Local.get('command.showText.alias')
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
      this.latinCharWidth = measureText(latinChars, font).width / 10
      this.otherCharWidth = measureText(otherChars, font).width / 10
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
      {text: Local.get('command.showChoices') + ': '},
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
    const when = Local.get('command.showChoices.when')
    for (const choice of choices) {
      contents.push(
        {color: 'flow'},
        {text: when + ' '},
        {color: 'text'},
        {text: choice.content},
        {children: choice.commands},
      )
    }
    contents.push({text: Local.get('command.showChoices.end')})
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
    const write = getElementWriter('showChoices')
    write('choices-0', choices[0]?.content ?? '')
    write('choices-1', choices[1]?.content ?? '')
    write('choices-2', choices[2]?.content ?? '')
    write('choices-3', choices[3]?.content ?? '')
    write('parameters', parameters)
    Command.cases.showChoices.choices = choices
    $('#showChoices-choices-0').getFocus()
  },
  save: function () {
    const read = getElementReader('showChoices')
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
      {text: Local.get('command.setBoolean.alias') + ': '},
      {text: `${varDesc} ${operator} ${value}`},
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
        const variable = read('common-variable')
        const paramName = read('parameter-paramName')
        if (VariableGetter.isNone(variable)) {
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
    $('#setNumber-operands').bind(NumberOperand)

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
      let operandName = NumberOperand.parseOperand(operand)
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
      {text: Local.get('command.setNumber.alias') + ': '},
      {text: `${varDesc} ${operator} ${expression}`},
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
      {text: Local.get('command.setString.alias') + ': '},
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
    let parseTimestampFormat = '{Y}/{M}/{D} {h}:{m}:{s}'
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
    const write = getElementWriter('setString')
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
    const read = getElementReader('setString')
    const variable = read('variable')
    if (VariableGetter.isNone(variable)) {
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
        if (VariableGetter.isNone(variable)) {
          return $('#setString-operand-common-variable').getFocus()
        }
        operand = {type, variable, index}
        break
      }
      case 'parameter': {
        const variable = read('operand-common-variable')
        const paramName = read('operand-parameter-paramName')
        if (VariableGetter.isNone(variable)) {
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
      case 'set': return '='
      case 'add': return '+='
    }
  },

  // 解析字符串方法
  parseStringMethod: function (operand) {
    const method = operand.method
    const variable = operand.variable
    const methodName = Local.get('command.setString.string.' + method)
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
    return `${Local.get('command.setString.enum')}(${name})`
  },

  // 解析对象属性
  parseObjectProperty: function (operand) {
    const property = Local.get('command.setString.object.' + operand.property)
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
    const property = Local.get('command.setString.element.' + operand.property)
    return `${element} -> ${property}`
  },

  // 解析其他数据
  parseOther: function (operand) {
    const label = Local.get('command.setString.other.' + operand.data)
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
        return Local.get('common.none')
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
      {text: Local.get('command.setObject.alias') + ': '},
      {text: `${varDesc} = ${object}`},
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
        const label = Local.get('command.setList.split')
        const text1 = Command.parseVariable(operand)
        const text2 = Command.parseVariableString(separator)
        info = `${varName} = ${label}(${text1}, ${text2})`
        break
      }
    }
    return [
      {color: 'variable'},
      {text: Local.get('command.setList.alias') + ': '},
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
      case 'push':
      case 'remove': {
        const operand = read('operand')
        if (VariableGetter.isNone(operand)) {
          return $('#setList-operand').getFocus()
        }
        Command.save({variable, operation, operand})
        break
      }
      case 'split': {
        const operand = read('operand')
        if (VariableGetter.isNone(operand)) {
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
      {text: Local.get('command.deleteVariable') + ': '},
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
      {color: 'flow'},
    ]
    const textIf = Local.get('command.if.alias')
    for (const branch of branches) {
      contents.push(
        {text: `${textIf} ${IfBranch.parse(branch)}`},
        {children: branch.commands},
      )
    }
    if (elseCommands) {
      contents.push(
        {text: Local.get('command.if.else')},
        {children: elseCommands},
      )
    }
    contents.push({text: Local.get('command.if.end')})
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
      {color: 'flow'},
      {text: Local.get('command.switch') + ' '},
      {text: Command.parseVariable(variable)},
      {break: true},
    ]
    const textCase = Local.get('command.switch.case')
    for (const branch of branches) {
      contents.push(
        {text: `${textCase} ${SwitchBranch.parse(branch)}`},
        {children: branch.commands},
      )
    }
    if (defaultCommands) {
      contents.push(
        {text: Local.get('command.switch.default')},
        {children: defaultCommands},
      )
    }
    contents.push({text: Local.get('command.switch.end')})
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
    let info
    if (conditions.length !== 0) {
      const condition = IfBranch.parse({mode, conditions})
      info = `${Local.get('command.loop.while')} ${condition}`
    } else {
      info = Local.get('command.loop')
    }
    return [
      {color: 'flow'},
      {text: info},
      {children: commands},
      {text: Local.get('command.loop.end')},
    ]
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
    const dataInfo = Local.get('command.forEach.' + data)
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
      {text: Local.get('command.forEach') + ': '},
      {text: words.join()},
      {children: commands},
      {text: Local.get('command.forEach.end')},
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
    const write = getElementWriter('forEach')
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
    const read = getElementReader('forEach')
    const data = read('data')
    const commands = Command.cases.forEach.commands
    switch (data) {
      case 'list': {
        const list = read('list')
        const variable = read('variable')
        if (VariableGetter.isNone(list)) {
          return $('#forEach-list').getFocus()
        }
        if (VariableGetter.isNone(variable)) {
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
      case 'save': {
        const filename = read('filename')
        if (VariableGetter.isNone(filename)) {
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
      const eventTypes = Enum.getMergedItems(EventEditor.types[type], type + '-event')
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
    return [
      {color: 'flow'},
      {text: Local.get('command.callEvent.alias') + ': '},
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
      {name: 'Enable', value: 'enable'},
      {name: 'Disable', value: 'disable'},
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
    .push(Local.get('command.setEvent.' + operation))
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
      {text: Local.get('command.setEvent.alias') + ': '},
      {text: words.join()},
    ]
  },
  load: function ({
    operation   = 'stop',
    variable    = {type: 'global', key: ''},
    eventId     = '',
    choiceIndex = 0,
  }) {
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
      case 'stop':
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

// 标签
Command.cases.label = {
  initialize: function () {
    $('#label-confirm').on('click', this.save)
  },
  parse: function ({name}) {
    return [
      {color: 'flow'},
      {text: Local.get('command.label') + ': '},
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
        words.push(label).push(Local.get('command.jumpTo.save'))
        break
      case 'return':
        words.push(Local.get('command.jumpTo.savedLocation'))
        break
    }
    return [
      {color: 'flow'},
      {text: Local.get('command.jumpTo.alias') + ': '},
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
      {text: Local.get('command.wait') + ': '},
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
      {text: Local.get('command.createElement') + ': '},
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
    for (const entry of properties) {
      words.push(ImageProperty.parse(entry))
    }
    return [
      {color: 'element'},
      {text: Local.get('command.setImage') + ': '},
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
    const label = Local.get('command.loadImage.' + type)
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
      {text: Local.get('command.loadImage') + ': '},
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
    const write = getElementWriter('loadImage')
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
    $('#tintImage-tint-0, #tintImage-tint-1, #tintImage-tint-2, #tintImage-tint-3')
    .on('input', function (event) {
      $('#tintImage-filter').write([
        $('#tintImage-tint-0').read(),
        $('#tintImage-tint-1').read(),
        $('#tintImage-tint-2').read(),
        $('#tintImage-tint-3').read(),
      ])
    })
  },
  parseTint: function ([red, green, blue, gray]) {
    const tint = Local.get('command.tintImage.tint')
    return `${tint}(${red}, ${green}, ${blue}, ${gray})`
  },
  parse: function ({element, tint, easingId, duration, wait}) {
    const words = Command.words
    .push(Command.parseElement(element))
    .push(this.parseTint(tint))
    .push(Command.parseEasing(easingId, duration, wait))
    return [
      {color: 'element'},
      {text: Local.get('command.tintImage') + ': '},
      {text: words.join()},
    ]
  },
  load: function ({
    element   = {type: 'trigger'},
    tint      = [0, 0, 0, 0],
    easingId  = Data.easings[0].id,
    duration  = 0,
    wait      = true,
  }) {
    const write = getElementWriter('tintImage')
    write('element', element)
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
    const red = read('tint-0')
    const green = read('tint-1')
    const blue = read('tint-2')
    const gray = read('tint-3')
    const easingId = read('easingId')
    const duration = read('duration')
    const wait = read('wait')
    const tint = [red, green, blue, gray]
    Command.save({element, tint, easingId, duration, wait})
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
    for (const entry of properties) {
      words.push(TextProperty.parse(entry))
    }
    return [
      {color: 'element'},
      {text: Local.get('command.setText') + ': '},
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
    for (const entry of properties) {
      words.push(TextBoxProperty.parse(entry))
    }
    return [
      {color: 'element'},
      {text: Local.get('command.setTextBox') + ': '},
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
    for (const entry of properties) {
      words.push(DialogBoxProperty.parse(entry))
    }
    return [
      {color: 'element'},
      {text: Local.get('command.setDialogBox') + ': '},
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
      {text: Local.get('command.controlDialog') + ': '},
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
    for (const entry of properties) {
      words.push(ProgressBarProperty.parse(entry))
    }
    return [
      {color: 'element'},
      {text: Local.get('command.setProgressBar') + ': '},
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

// 等待视频结束
Command.cases.waitForVideo = {
  initialize: function () {
    $('#waitForVideo-confirm').on('click', this.save)
  },
  parse: function ({element}) {
    return [
      {color: 'element'},
      {text: Local.get('command.waitForVideo') + ': '},
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
      {text: Local.get('command.setElement.alias') + ': '},
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
      {text: Local.get('command.nestElement') + ': '},
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
    for (const entry of properties) {
      words.push(TransformProperty.parse(entry))
    }
    words.push(Command.parseEasing(easingId, duration, wait))
    return [
      {color: 'element'},
      {text: Local.get('command.moveElement') + ': '},
      {text: words.join()},
    ]
  },
  load: function ({
    element     = {type: 'trigger'},
    properties  = [],
    easingId    = Data.easings[0].id,
    duration    = 0,
    wait        = true,
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
        info = `${Command.parseElement(element)} -> ${Local.get('command.deleteElement.children')}`
        break
      case 'delete-all':
        info = Local.get('command.deleteElement.all-elements')
        break
    }
    return [
      {color: 'element'},
      {text: Local.get('command.deleteElement') + ': '},
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
      {text: Local.get('command.createLight') + ': '},
      {text: words.join()},
    ]
  },
  load: function ({
    presetId  = '',
    position  = {type: 'actor', actor: {type: 'trigger'}},
  }) {
    const write = getElementWriter('createLight')
    write('presetId', presetId)
    write('position', position)
    $('#createLight-presetId').getFocus()
  },
  save: function () {
    const read = getElementReader('createLight')
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
    for (const entry of properties) {
      words.push(LightProperty.parse(entry))
    }
    words.push(Command.parseEasing(easingId, duration, wait))
    return [
      {color: 'object'},
      {text: Local.get('command.moveLight') + ': '},
      {text: words.join()},
    ]
  },
  load: function ({
    light       = {type: 'trigger'},
    properties  = [],
    easingId    = Data.easings[0].id,
    duration    = 0,
    wait        = true,
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

// 删除光源
Command.cases.deleteLight = {
  initialize: function () {
    $('#deleteLight-confirm').on('click', this.save)
  },
  parse: function ({light}) {
    return [
      {color: 'object'},
      {text: Local.get('command.deleteLight') + ': '},
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
    return Local.get('command.setState.' + operation)
  },
  parse: function ({state, operation, time}) {
    const words = Command.words
    .push(Command.parseState(state))
    .push(this.parseOperation(operation))
    .push(Command.parseVariableNumber(time, 'ms'))
    return [
      {color: 'object'},
      {text: Local.get('command.setState') + ': '},
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
      elMotion.loadItems(Animation.getMotionListItems(event.value))
      elMotion.write2(elMotion.read())
    })
  },
  parsePriority: function (priority) {
    if (priority === 0) return ''
    return priority > 0 ? `+${priority}` : priority.toString()
  },
  parseDirectionMapping: function (mappable) {
    return mappable ? Local.get('command.playAnimation.mappable') : ''
  },
  parse: function ({mode, position, actor, animationId, motion, priority, offsetY, rotation, mappable, wait}) {
    const words = Command.words
    switch (mode) {
      case 'position':
        words.push(Command.parsePosition(position))
        break
      case 'actor': {
        const bind = Local.get('command.playAnimation.bind')
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
      {text: Local.get('command.playAnimation') + ': '},
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
    const write = getElementWriter('playAnimation')
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
    const read = getElementReader('playAnimation')
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
      {text: Local.get('command.playAudio') + ': '},
      {text: words.join()},
    ]
  },
  load: function ({
    type    = 'bgm',
    audio   = '',
    volume  = 1,
  }) {
    const write = getElementWriter('playAudio')
    write('type', type)
    write('audio', audio)
    write('volume', volume)
    $('#playAudio-type').getFocus()
  },
  save: function () {
    const read = getElementReader('playAudio')
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
      {text: Local.get('command.stopAudio') + ': '},
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
      {text: Local.get('command.setVolume') + ': '},
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
      {text: Local.get('command.setPan') + ': '},
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
      {text: Local.get('command.setReverb') + ': '},
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
      {text: Local.get('command.setLoop') + ': '},
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
      {text: Local.get('command.saveAudio') + ': '},
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
      {text: Local.get('command.restoreAudio') + ': '},
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
    .push(Command.parseDegrees(Command.parseVariableNumber(angle)))
    return [
      {color: 'actor'},
      {text: Local.get('command.createActor') + ': '},
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
    return Local.get('command.moveActor.mode.' + mode)
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
      {text: Local.get('command.moveActor') + ': '},
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
    .push(Local.get('command.followActor.mode.' + mode))
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
      words.push(Local.get('command.followActor.navigate'))
    }
    if (once) {
      words.push(Local.get('command.followActor.once'))
      words.push(Command.parseWait(wait))
    }
    return [
      {color: 'actor'},
      {text: Local.get('command.followActor') + ': '},
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
    const write = getElementWriter('followActor')
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
    const read = getElementReader('followActor')
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
      {text: Local.get('command.translateActor') + ': '},
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
    return `${sActor} -> ${dActor}`
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
      {text: Local.get('command.changeThreat') + ': '},
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
      {text: Local.get('command.setWeight') + ': '},
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
    const words = Command.words
    .push(Command.parseActor(actor))
    .push(Local.get('command.setMovementSpeed.' + property))
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
      {text: Local.get('command.setMovementSpeed') + ': '},
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
      {text: Local.get('command.setAngle') + ': '},
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
      {text: Local.get('command.fixAngle') + ': '},
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
      {text: Local.get('command.setActive') + ': '},
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

// 删除角色
Command.cases.deleteActor = {
  initialize: function () {
    $('#deleteActor-confirm').on('click', this.save)
  },
  parse: function ({actor}) {
    return [
      {color: 'actor'},
      {text: Local.get('command.deleteActor') + ': '},
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
      {text: Local.get('command.changeActorTeam') + ': '},
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
    return Local.get('command.changeActorState.' + operation)
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
      {text: Local.get('command.changeActorState') + ': '},
      {text: words.join()},
    ]
  },
  load: function ({
    actor     = {type: 'trigger'},
    operation = 'add',
    stateId   = '',
    state     = {type: 'latest'},
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
        return Local.get('command.changeActorEquipment.' + operation)
    }
  },
  parse: function ({actor, operation, equipment, key}) {
    const words = Command.words
    .push(Command.parseActor(actor))
    .push(this.parseOperation(operation))
    switch (operation) {
      case 'add':
        words
        .push(Command.parseVariableString(key))
        .push(Command.parseEquipment(equipment))
        break
      case 'remove':
        words.push(Command.parseVariableString(key))
        break
    }
    return [
      {color: 'actor'},
      {text: Local.get('command.changeActorEquipment') + ': '},
      {text: words.join()},
    ]
  },
  load: function ({
    actor       = {type: 'trigger'},
    operation   = 'add',
    key         = '',
    equipment   = {type: 'trigger'},
  }) {
    const write = getElementWriter('changeActorEquipment')
    write('actor', actor)
    write('operation', operation)
    write('key', key)
    write('equipment', equipment)
    $('#changeActorEquipment-actor').getFocus()
  },
  save: function () {
    const read = getElementReader('changeActorEquipment')
    const actor = read('actor')
    const operation = read('operation')
    const key = read('key')
    if (key === '') {
      return $('#changeActorEquipment-key').getFocus()
    }
    switch (operation) {
      case 'add': {
        const equipment = read('equipment')
        Command.save({actor, operation, key, equipment})
        break
      }
      case 'remove':
        Command.save({actor, operation, key})
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
    return Local.get('command.changeActorSkill.' + operation)
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
      {text: Local.get('command.changeActorSkill') + ': '},
      {text: words.join()},
    ]
  },
  load: function ({
    actor     = {type: 'trigger'},
    operation = 'add',
    skillId   = '',
    skill     = {type: 'latest'},
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
      {text: Local.get('command.changeActorSprite') + ': '},
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
    const motionType = Local.get('command.remapActorMotion.type.' + type)
    const motionName = Command.parseEnumString(motion)
    return `${motionType} -> ${motionName}`
  },
  parse: function ({actor, type, motion}) {
    const words = Command.words
    .push(Command.parseActor(actor))
    .push(this.parseMapping(type, motion))
    return [
      {color: 'actor'},
      {text: Local.get('command.remapActorMotion') + ': '},
      {text: words.join()},
    ]
  },
  load: function ({
    actor   = {type: 'trigger'},
    type    = 'move',
    motion  = '',
  }) {
    const write = getElementWriter('remapActorMotion')
    write('actor', actor)
    write('type', type)
    write('motion', motion)
    $('#remapActorMotion-actor').getFocus()
  },
  save: function () {
    const read = getElementReader('remapActorMotion')
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
      {text: Local.get('command.playActorAnimation') + ': '},
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
      {text: Local.get('command.stopActorAnimation') + ': '},
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
      {text: Local.get('command.createGlobalActor') + ': '},
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
      {text: Local.get('command.placeGlobalActor') + ': '},
      {text: words.join()},
    ]
  },
  load: function ({
    actor     = {type: 'trigger'},
    position  = {type: 'absolute', x: 0, y: 0},
  }) {
    const write = getElementWriter('placeGlobalActor')
    write('actor', actor)
    write('position', position)
    $('#placeGlobalActor-actor').getFocus('all')
  },
  save: function () {
    const read = getElementReader('placeGlobalActor')
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
      {text: Local.get('command.deleteGlobalActor') + ': '},
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
      {text: Local.get('command.getTarget') + ': '},
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
    const write = getElementWriter('getTarget')
    write('actor', actor)
    write('selector', selector)
    write('condition', condition)
    write('attribute', attribute)
    write('divisor', divisor)
    write('variable', variable)
    $('#getTarget-actor').getFocus()
  },
  save: function () {
    const read = getElementReader('getTarget')
    const actor = read('actor')
    const selector = read('selector')
    const condition = read('condition')
    const variable = read('variable')
    if (VariableGetter.isNone(variable)) {
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
        return Local.get('command.detectTargets.inSight')
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
      {text: Local.get('command.detectTargets') + ': '},
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
  parse: function ({actor, distance, selector}) {
    const words = Command.words
    .push(Command.parseActor(actor))
    .push('>' + distance + 't')
    .push(Command.parseActorSelector(selector))
    return [
      {color: 'actor'},
      {text: Local.get('command.discardTargets') + ': '},
      {text: words.join()},
    ]
  },
  load: function ({
    actor     = {type: 'trigger'},
    distance  = 0,
    selector  = 'any',
  }) {
    const write = getElementWriter('discardTargets')
    write('actor', actor)
    write('distance', distance)
    write('selector', selector)
    $('#discardTargets-actor').getFocus()
  },
  save: function () {
    const read = getElementReader('discardTargets')
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
      {text: Local.get('command.resetTargets') + ': '},
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
      {text: Local.get('command.castSkill') + ': '},
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
      {name: 'Set Shortcut Key', value: 'set-key'},
      {name: 'Set Cooldown Time', value: 'set-cooldown'},
      {name: 'Increase Cooldown Time', value: 'increase-cooldown'},
      {name: 'Decrease Cooldown Time', value: 'decrease-cooldown'},
    ])

    // 设置操作关联元素
    $('#setSkill-operation').enableHiddenMode().relate([
      {case: 'set-key', targets: [
        $('#setSkill-key'),
      ]},
      {case: ['set-cooldown', 'increase-cooldown', 'decrease-cooldown'], targets: [
        $('#setSkill-cooldown'),
      ]},
    ])
  },
  parse: function ({skill, operation, key, cooldown}) {
    const words = Command.words
    .push(Command.parseSkill(skill))
    .push(Local.get('command.setSkill.' + operation))
    switch (operation) {
      case 'set-key':
        words.push(Command.parseGroupEnumString('shortcut-key', key))
        break
      case 'set-cooldown':
      case 'increase-cooldown':
      case 'decrease-cooldown':
        words.push(Command.parseVariableNumber(cooldown, 'ms'))
        break
    }
    return [
      {color: 'skill'},
      {text: Local.get('command.setSkill') + ': '},
      {text: words.join()},
    ]
  },
  load: function ({
    skill     = {type: 'trigger'},
    operation = 'set-key',
    key       = '',
    cooldown  = 0,
  }) {
    // 加载快捷键选项
    $('#setSkill-key').loadItems(
      Enum.getStringItems('shortcut-key', true)
    )
    const write = getElementWriter('setSkill')
    write('skill', skill)
    write('operation', operation)
    write('key', key)
    write('cooldown', cooldown)
    $('#setSkill-skill').getFocus()
  },
  save: function () {
    const read = getElementReader('setSkill')
    const skill = read('skill')
    const operation = read('operation')
    switch (operation) {
      case 'set-key': {
        const key = read('key')
        Command.save({skill, operation, key})
        break
      }
      case 'set-cooldown':
      case 'increase-cooldown':
      case 'decrease-cooldown': {
        const cooldown = read('cooldown')
        if (cooldown === 0) {
          return $('#setSkill-cooldown').getFocus('all')
        }
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
      {text: Local.get('command.createTrigger') + ': '},
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
    const write = getElementWriter('createTrigger')
    write('triggerId', triggerId)
    write('caster', caster)
    write('origin', origin)
    write('angle', angle)
    write('distance', distance)
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
      {text: Local.get('command.setTriggerSpeed') + ': '},
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
      {text: Local.get('command.setTriggerAngle') + ': '},
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
    ])
  },
  parse: function ({actor, operation, money, itemId, quantity, equipmentId, equipment, index1, index2}) {
    const words = Command.words
    .push(Command.parseActor(actor))
    .push(Local.get('command.setBag.' + operation))
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
    }
    return [
      {color: 'bag'},
      {text: Local.get('command.setBag') + ': '},
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
  }) {
    const write = getElementWriter('setBag')
    write('actor', actor)
    write('operation', operation)
    write('money', money)
    write('itemId', itemId)
    write('quantity', quantity)
    write('equipmentId', equipmentId)
    write('equipment', equipment)
    write('index1', index1)
    write('index2', index2)
    $('#setBag-actor').getFocus()
  },
  save: function () {
    const read = getElementReader('setBag')
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
      {text: Local.get('command.useItem') + ': '},
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
      {name: 'Set Shortcut Key', value: 'set-key'},
      {name: 'Increase', value: 'increase'},
      {name: 'Decrease', value: 'decrease'},
    ])

    // 设置操作关联元素
    $('#setItem-operation').enableHiddenMode().relate([
      {case: 'set-key', targets: [
        $('#setItem-key'),
      ]},
      {case: ['increase', 'decrease'], targets: [
        $('#setItem-quantity'),
      ]},
    ])
  },
  parse: function ({item, operation, key, quantity}) {
    const words = Command.words
    .push(Command.parseItem(item))
    .push(Local.get('command.setItem.' + operation))
    switch (operation) {
      case 'set-key':
        words.push(Command.parseGroupEnumString('shortcut-key', key))
        break
      case 'increase':
      case 'decrease':
        words.push(Command.parseVariableNumber(quantity))
        break
    }
    return [
      {color: 'bag'},
      {text: Local.get('command.setItem') + ': '},
      {text: words.join()},
    ]
  },
  load: function ({
    item      = {type: 'trigger'},
    operation = 'set-key',
    key       = '',
    quantity  = 1,
  }) {
    // 加载快捷键选项
    $('#setItem-key').loadItems(
      Enum.getStringItems('shortcut-key', true)
    )
    const write = getElementWriter('setItem')
    write('item', item)
    write('operation', operation)
    write('key', key)
    write('quantity', quantity)
    $('#setItem-item').getFocus()
  },
  save: function () {
    const read = getElementReader('setItem')
    const item = read('item')
    const operation = read('operation')
    switch (operation) {
      case 'set-key': {
        const key = read('key')
        Command.save({item, operation, key})
        break
      }
      case 'increase':
      case 'decrease': {
        const quantity = read('quantity')
        if (quantity === 0) {
          return $('#setItem-quantity').getFocus('all')
        }
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
  parseOperation: function (operation) {
    return Local.get('command.setCooldown.' + operation)
  },
  parse: function ({actor, operation, key, cooldown}) {
    const words = Command.words
    .push(Command.parseActor(actor))
    .push(this.parseOperation(operation))
    .push(Command.parseVariableString(key))
    switch (operation) {
      case 'set':
      case 'increase':
      case 'decrease':
        words.push(Command.parseVariableNumber(cooldown, 'ms'))
        break
    }
    return [
      {color: 'bag'},
      {text: Local.get('command.setCooldown') + ': '},
      {text: words.join()},
    ]
  },
  load: function ({
    actor     = {type: 'trigger'},
    operation = 'set',
    key       = '',
    cooldown  = 0,
  }) {
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
    switch (operation) {
      case 'set':
      case 'increase':
      case 'decrease': {
        const cooldown = read('cooldown')
        if (cooldown === 0) {
          return $('#setCooldown-cooldown').getFocus('all')
        }
        Command.save({actor, operation, key, cooldown})
        break
      }
      case 'reset':
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
      {text: Local.get('command.activateScene') + ': '},
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
        scene = Local.get('command.loadScene.start')
        break
    }
    return [
      {color: 'scene'},
      {text: Local.get('command.loadScene') + ': '},
      {text: scene},
    ]
  },
  load: function ({
    type    = 'specify',
    sceneId = '',
  }) {
    const write = getElementWriter('loadScene')
    write('type', type)
    write('sceneId', sceneId)
    $('#loadScene-sceneId').getFocus()
  },
  save: function () {
    const read = getElementReader('loadScene')
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
      {text: Local.get('command.deleteScene')},
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
      {text: Local.get('command.moveCamera') + ': '},
      {text: words.join()},
    ]
  },
  load: function ({
    mode      = 'position',
    position  = {type: 'absolute', x: 0, y: 0},
    actor     = {type: 'trigger'},
    easingId  = Data.easings[0].id,
    duration  = 0,
    wait      = true,
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
      {text: Local.get('command.setZoomFactor') + ': '},
      {text: words.join()},
    ]
  },
  load: function ({
    zoom      = 1,
    easingId  = Data.easings[0].id,
    duration  = 0,
    wait      = true,
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
    return `RGB(${r}, ${g}, ${b})`
  },
  parse: function ({red, green, blue, easingId, duration, wait}) {
    const words = Command.words
    .push(this.parseColor(red, green, blue))
    .push(Command.parseEasing(easingId, duration, wait))
    const contents = [
      {color: 'scene'},
      {text: Local.get('command.setAmbientLight') + ': '},
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
    wait      = true,
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
    return `(${red}, ${green}, ${blue}, ${gray})`
  },
  parse: function ({tint, easingId, duration, wait}) {
    const words = Command.words
    .push(this.parseTint(tint))
    .push(Command.parseEasing(easingId, duration, wait))
    const contents = [
      {color: 'scene'},
      {text: Local.get('command.tintScreen') + ': '},
      {text: words.join()},
    ]
    return contents
  },
  load: function ({
    tint      = [0, 0, 0, 0],
    easingId  = Data.easings[0].id,
    duration  = 0,
    wait      = true,
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
      {text: Local.get('command.setGameSpeed') + ': '},
      {text: words.join()},
    ]
  },
  load: function ({
    speed     = 1,
    easingId  = Data.easings[0].id,
    duration  = 0,
    wait      = true,
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
      {text: Local.get('command.setCursor') + ': '},
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
      {text: Local.get('command.setTeamRelation') + ': '},
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
      {text: Local.get('command.switchCollisionSystem') + ': '},
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
    return Local.get('command.gameData.' + operation)
  },
  parse: function ({operation, filename, variables}) {
    const words = Command.words.push(this.parseOperation(operation))
    switch (operation) {
      case 'save':
        words.push(Command.parseVariableString(filename))
        if (variables) {
          const label = Local.get('command.gameData.variables')
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
      {text: Local.get('command.gameData') + ': '},
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
    const read = getElementReader('gameData')
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
      {text: Local.get('command.reset')},
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
      const get = Local.createGetter('confirmation')
      let continued = false
      return Window.confirm({
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
    const script = this.script
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
          words.push(Data.easings.map[value].name)
          continue
        case 'team':
          words.push(Data.teams.map[value].name)
          continue
        case 'variable':
          words.push(value ? `{variable:${value}}` : Local.get('common.none'))
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
          words.push(value || Local.get('common.none'))
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
    this.windowX = Window.absolutePos.x
    this.windowY = Window.absolutePos.y
    this.parameterPane.update()
    const selector = Layout.focusableSelector
    this.parameterPane.querySelector(selector)?.getFocus()
    this.windowFrame.setTitle(this.commandNameMap[id])
  },

  // 保存参数
  save: function () {
    Command.save(Command.custom.script.parameters ?? {})
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
    CommandSuggestion.windowLocalize()
    // 重新构建指令项目的父对象引用
    NodeList.createParents(commands, this.customFolder)
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
  list.creators.push(list.createCommandTip)

  // 加载指令数据
  const path = 'commands.json'
  this.data = FSP.readFile(path, 'utf8').then(
    data => this.data = JSON.parse(data)
  )

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
      item.name = name
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
    element.addClass('command-suggestion-item')
    element.setTooltip(`Keywords: ${words.join()}`)
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
  getRawData: null,
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
TextSuggestion.listen = function (textBox, type, generator) {
  textBox.suggestionType = type
  if (type === 'custom') {
    textBox.generator = generator
  }
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
    // this.list.update()
    // this.list.selectDefaultCommand()
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

// 获取原始数据
TextSuggestion.getRawData = function (type) {
  switch (type) {
    case 'actor':
      return Scene.actors
    case 'light':
      return Scene.lights
    case 'custom':
      return this.target.generator()
  }
}

// 创建数据
TextSuggestion.createData = function () {
  const type = this.target.suggestionType
  if (type === this.data?.type) return
  const filter = {}
  const data = []
  data.type = type
  this.data = data

  // 创建数据
  const items = this.getRawData(type)
  if (items instanceof Array) {
    for (const item of items) {
      const {name} = item
      if (!filter[name]) {
        filter[name] = true
        data.push({name})
      }
    }
    // 排序
    if (data.length > 1) {
      data.sort((a, b) => a.name.localeCompare(b.name))
    }
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
    element.textContent = element.item.name
    element.addClass('text-suggestion-item')
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
  list: $('#event-commands'),
  outerGutter: $('#event-commands-gutter-outer'),
  innerGutter: $('#event-commands-gutter-inner'),
  caches: [],
  types: null,
  inserting: false,
  changed: false,
  callback: null,
  // methods
  initialize: null,
  open: null,
  save: null,
  resizeGutter: null,
  updateGutter: null,
  appendCommandsToCaches: null,
  clearCommandBuffers: null,
  // events
  windowLocalize: null,
  windowDataChange: null,
  windowClose: null,
  windowClosed: null,
  windowResize: null,
  dataChange: null,
  listUpdate: null,
  listScroll: null,
  confirm: null,
  apply: null,
}

// 初始化
EventEditor.initialize = function () {
  // 创建事件类型选项
  const types = {
    common: {name: 'Common', value: 'common'},
    initialize: {name: 'Initialize', value: 'initialize'},
    autorun: {name: 'Autorun', value: 'autorun'},
    collision: {name: 'Collision', value: 'collision'},
    hittrigger: {name: 'HitTrigger', value: 'hittrigger'},
    hitactor: {name: 'HitActor', value: 'hitactor'},
    destroy: {name: 'Destroy', value: 'destroy'},
    actorenter: {name: 'ActorEnter', value: 'actorenter'},
    actorleave: {name: 'ActorLeave', value: 'actorleave'},
    skillcast: {name: 'SkillCast', value: 'skillcast'},
    skilladd: {name: 'SkillAdd', value: 'skilladd'},
    skillremove: {name: 'SkillRemove', value: 'skillremove'},
    stateadd: {name: 'StateAdd', value: 'stateadd'},
    stateremove: {name: 'StateRemove', value: 'stateremove'},
    equipmentadd: {name: 'EquipmentAdd', value: 'equipmentadd'},
    equipmentremove: {name: 'EquipmentRemove', value: 'equipmentremove'},
    itemuse: {name: 'ItemUse', value: 'itemuse'},
    keydown: {name: 'KeyDown', value: 'keydown'},
    keyup: {name: 'KeyUp', value: 'keyup'},
    mousedown: {name: 'MouseDown', value: 'mousedown'},
    mouseup: {name: 'MouseUp', value: 'mouseup'},
    mousemove: {name: 'MouseMove', value: 'mousemove'},
    mouseenter: {name: 'MouseEnter', value: 'mouseenter'},
    mouseleave: {name: 'MouseLeave', value: 'mouseleave'},
    click: {name: 'Click', value: 'click'},
    doubleclick: {name: 'DoubleClick', value: 'doubleclick'},
    wheel: {name: 'Wheel', value: 'wheel'},
    input: {name: 'Input', value: 'input'},
    focus: {name: 'Focus', value: 'focus'},
    blur: {name: 'Blur', value: 'blur'},
  }
  this.types = {
    all: Object.values(types),
    global: [
      types.common,
      types.keydown,
      types.keyup,
      types.mousedown,
      types.mouseup,
      types.mousemove,
      types.doubleclick,
      types.wheel,
    ],
    scene: [
      types.autorun,
    ],
    actor: [
      types.initialize,
      types.autorun,
      types.collision,
      types.hittrigger,
    ],
    skill: [
      types.skillcast,
      types.skilladd,
      types.skillremove,
    ],
    state: [
      types.stateadd,
      types.stateremove,
    ],
    equipment: [
      types.initialize,
      types.equipmentadd,
      types.equipmentremove,
    ],
    trigger: [
      types.hitactor,
      types.destroy,
    ],
    item: [
      types.itemuse,
    ],
    region: [
      types.autorun,
      types.actorenter,
      types.actorleave,
    ],
    light: [
      types.autorun,
    ],
    animation: [
      types.autorun,
    ],
    particle: [
      types.autorun,
    ],
    parallax: [
      types.autorun,
    ],
    tilemap: [
      types.autorun,
    ],
    element: [
      types.autorun,
      types.mousedown,
      types.mouseup,
      types.mousemove,
      types.mouseenter,
      types.mouseleave,
      types.click,
      types.doubleclick,
      types.wheel,
      types.input,
      types.focus,
      types.blur,
      types.destroy,
    ],
    relatedElements: [],
  }

  // 设置指令列表的内部高度
  const INNER_HEIGHT = 600
  Object.defineProperty(
    this.list, 'innerHeight', {
      configurable: true,
      value: INNER_HEIGHT,
    }
  )

  // 设置行号列表和指令列表的底部填充高度
  const PADDING_BOTTOM = INNER_HEIGHT - 20
  this.list.style.paddingBottom = `${PADDING_BOTTOM + 10}px`
  this.innerGutter.style.paddingBottom = `${PADDING_BOTTOM}px`

  // 侦听事件
  window.on('localize', this.windowLocalize)
  window.on('datachange', this.windowDataChange)
  $('#event').on('close', this.windowClose)
  $('#event').on('closed', this.windowClosed)
  $('#event').on('resize', this.windowResize)
  $('#event').on('change', this.dataChange)
  this.list.on('update', this.listUpdate)
  this.list.on('scroll', this.listScroll)
  $('#event-confirm').on('click', this.confirm)
  $('#event-apply').on('click', this.apply)
}

// 打开数据
EventEditor.open = function (filter, event, callback) {
  this.callback = callback ?? Function.empty
  Window.open('event')

  // 创建类型选项
  $('#event-type').loadItems(
    Enum.getMergedItems(
      this.types[filter],
      filter + '-event',
  ))

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
    Object.defineProperty(commandsClone, 'symbol', {
      configurable: true,
      value: symbol,
    })
  }

  // 写入数据
  const write = getElementWriter('event')
  write('commands', commandsClone)
  write('type', event.type)
  // 当第一行是大块指令时focus效果不佳
  // this.list.getFocus()
}

// 保存数据
EventEditor.save = function () {
  const read = getElementReader('event')
  const commands = read('commands')
  const commandsClone = Object.clone(commands)
  Object.defineProperty(commandsClone, 'symbol', {
    configurable: true,
    value: commands.symbol,
  })
  return {
    type: read('type'),
    commands: commandsClone,
  }
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
  const {list} = this
  const {scrollTop} = list
  const {outerGutter, innerGutter} = EventEditor
  const start = Math.floor(scrollTop / 20) + 1
  const end = list.elements.count + 1
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
  if (caches.append(commands) &&
    caches.length > 10) {
    caches.shift()
  }
}

// 清除指令缓存元素
EventEditor.clearCommandBuffers = function () {
  const {list} = this
  for (const commands of this.caches) {
    list.deleteCommandBuffers(commands)
    const {stack} = commands.history
    const {length} = stack
    for (let i = 0; i < length; i++) {
      const {commands} = stack[i]
      list.deleteCommandBuffers(commands)
    }
  }
}

// 窗口 - 本地化事件
EventEditor.windowLocalize = function (event) {
  // 更新事件类型选项名称
  const types = EventEditor.types
  const get = Local.createGetter('eventTypes')
  for (const item of types.all) {
    const key = item.value
    const name = get(key)
    if (name !== '') {
      item.name = name
    }
  }
  // 更新事件类型相关元素
  for (const selectBox of types.relatedElements) {
    if (selectBox.read()) selectBox.update()
  }
  // 清除之前的语言环境生成的指令列表项
  EventEditor.clearCommandBuffers()
}

// 窗口 - 数据改变事件
EventEditor.windowDataChange = function (event) {
  switch (event.key) {
    case 'easings':
    case 'teams':
      EventEditor.clearCommandBuffers()
      break
  }
}

// 窗口 - 关闭事件
EventEditor.windowClose = function (event) {
  if (this.changed) {
    event.preventDefault()
    const get = Local.createGetter('confirmation')
    Window.confirm({
      message: get('closeUnsavedEvent'),
    }, [{
      label: get('yes'),
      click: () => {
        // 尝试恢复指令数据
        // 成功则添加到缓存
        // 失败则从缓存中移除
        const commands = this.list.read()
        if (commands.history.restoreState()) {
          this.appendCommandsToCaches(commands)
        } else {
          this.caches.remove(commands)
        }
        this.changed = false
        Window.close('event')
      },
    }, {
      label: get('no'),
    }])
  }
}.bind(EventEditor)

// 窗口 - 已关闭事件
EventEditor.windowClosed = function (event) {
  this.inserting = false
  this.callback = null
  this.list.clear()
}.bind(EventEditor)

// 窗口 - 调整大小事件
EventEditor.windowResize = function (event) {
  // 设置指令列表的内部高度
  const {list} = EventEditor
  const parent = list.parentNode
  const outerHeight = parent.clientHeight
  const innerHeight = Math.max(outerHeight - 20, 0)
  Object.defineProperty(
    list, 'innerHeight', {
      configurable: true,
      value: innerHeight,
    }
  )

  // 设置行号列表和指令列表的底部填充高度
  const {innerGutter} = EventEditor
  const paddingBottom = innerHeight - 20
  list.style.paddingBottom = `${paddingBottom + 10}px`
  innerGutter.style.paddingBottom = `${paddingBottom}px`

  // 调整指令列表
  list.resize()

  // 当使用快捷键滚动到底部并且溢出时再最大化窗口
  // 会触发BUG: 插入指令resize刷新时增加scrollTop
  // 重置scrollTop可以避免这个现象
  // 由于scroll是异步事件因此不会重复触发
  const st = list.scrollTop
  list.scrollTop = 0
  list.scrollTop = st

  // 调整行号列表
  EventEditor.resizeGutter()
  EventEditor.updateGutter(true)
}

// 数据 - 改变事件
EventEditor.dataChange = function (event) {
  EventEditor.changed = true
}

// 指令列表 - 更新事件
EventEditor.listUpdate = function (event) {
  EventEditor.resizeGutter()
  EventEditor.updateGutter(true)
}

// 指令列表 - 滚动事件
EventEditor.listScroll = function (event) {
  EventEditor.updateGutter(false)
}

// 确定按钮 - 鼠标点击事件
EventEditor.confirm = function (event) {
  this.apply()
  Window.close('event')
}.bind(EventEditor)

// 应用按钮 - 鼠标点击事件
EventEditor.apply = function (event) {
  if (this.changed) {
    const commands = this.list.read()
    commands.history.saveState()
    this.appendCommandsToCaches(commands)
  }
  if (this.changed || this.inserting) {
    this.changed = false
    this.inserting = false
    this.callback()
  }
}.bind(EventEditor)

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
  windowClosed: null,
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
      $('#setNumber-operand-common-variable'),
      $('#setNumber-operand-parameter-paramName'),
    ]},
    {case: 'other', targets: [
      $('#setNumber-operand-other-data'),
    ]},
  ])

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
    {name: 'Actor - Screen X', value: 'actor-screen-x'},
    {name: 'Actor - Screen Y', value: 'actor-screen-y'},
    {name: 'Actor - Angle', value: 'actor-angle'},
    {name: 'Actor - Direction Angle', value: 'actor-direction'},
    {name: 'Actor - Movement Speed', value: 'actor-movement-speed'},
    {name: 'Actor - Collision Size', value: 'actor-collision-size'},
    {name: 'Actor - Collision Weight', value: 'actor-collision-weight'},
    {name: 'Actor - Item Quantity', value: 'actor-bag-item-quantity'},
    {name: 'Actor - Equipment Quantity', value: 'actor-bag-equipment-quantity'},
    {name: 'Actor - Bag Money', value: 'actor-bag-money'},
    {name: 'Actor - Bag Used Space', value: 'actor-bag-used-space'},
    {name: 'Actor - Bag Version', value: 'actor-bag-version'},
    {name: 'Actor - Skill Version', value: 'actor-skill-version'},
    {name: 'Actor - State Version', value: 'actor-state-version'},
    {name: 'Actor - Equipment Version', value: 'actor-equipment-version'},
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
    {name: 'Equipment - Index', value: 'equipment-index'},
    {name: 'Item - Index', value: 'item-index'},
    {name: 'Item - Quantity', value: 'item-quantity'},
    {name: 'Trigger - Speed', value: 'trigger-speed'},
    {name: 'Trigger - Angle', value: 'trigger-angle'},
    {name: 'List - Length', value: 'list-length'},
  ])

  // 设置对象属性关联元素
  $('#setNumber-operand-object-property').enableHiddenMode().relate([
    {case: [
      'actor-x',
      'actor-y',
      'actor-screen-x',
      'actor-screen-y',
      'actor-angle',
      'actor-direction',
      'actor-movement-speed',
      'actor-collision-size',
      'actor-collision-weight',
      'actor-bag-money',
      'actor-bag-used-space',
      'actor-bag-version',
      'actor-skill-version',
      'actor-state-version',
      'actor-equipment-version',
      'actor-animation-current-time',
      'actor-animation-duration',
      'actor-animation-progress'], targets: [
      $('#setNumber-operand-common-actor'),
    ]},
    {case: 'actor-bag-item-quantity', targets: [
      $('#setNumber-operand-common-actor'),
      $('#setNumber-operand-object-itemId'),
    ]},
    {case: 'actor-bag-equipment-quantity', targets: [
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
    {case: 'equipment-index', targets: [
      $('#setNumber-operand-common-equipment'),
    ]},
    {case: ['item-index', 'item-quantity'], targets: [
      $('#setNumber-operand-common-item'),
    ]},
    {case: ['trigger-speed', 'trigger-angle'], targets: [
      $('#setNumber-operand-common-trigger'),
    ]},
    {case: 'list-length', targets: [
      $('#setNumber-operand-common-variable'),
    ]},
  ])

  // 创建元素属性选项
  $('#setNumber-operand-element-property').loadItems([
    {name: 'Element - Number of Children', value: 'element-children-count'},
    {name: 'Transform - Anchor X', value: 'transform-anchorX'},
    {name: 'Transform - Anchor Y', value: 'transform-anchorY'},
    {name: 'Transform - X', value: 'transform-x'},
    {name: 'Transform - X2', value: 'transform-x2'},
    {name: 'Transform - Y', value: 'transform-y'},
    {name: 'Transform - Y2', value: 'transform-y2'},
    {name: 'Transform - Width', value: 'transform-width'},
    {name: 'Transform - Width2', value: 'transform-width2'},
    {name: 'Transform - Height', value: 'transform-height'},
    {name: 'Transform - Height2', value: 'transform-height2'},
    {name: 'Transform - Rotation', value: 'transform-rotation'},
    {name: 'Transform - Scale X', value: 'transform-scaleX'},
    {name: 'Transform - Scale Y', value: 'transform-scaleY'},
    {name: 'Transform - Skew X', value: 'transform-skewX'},
    {name: 'Transform - Skew Y', value: 'transform-skewY'},
    {name: 'Transform - Opacity', value: 'transform-opacity'},
    {name: 'Text - Text Width', value: 'text-textWidth'},
    {name: 'Text - Text Height', value: 'text-textHeight'},
    {name: 'Text Box - Number', value: 'textBox-number'},
    {name: 'Dialog Box - Print End X', value: 'dialogBox-printEndX'},
    {name: 'Dialog Box - Print End Y', value: 'dialogBox-printEndY'},
  ])

  // 创建其他数据选项
  $('#setNumber-operand-other-data').loadItems([
    {name: 'Event Trigger Button', value: 'trigger-button'},
    {name: 'Event Trigger Wheel Delta X', value: 'trigger-wheel-x'},
    {name: 'Event Trigger Wheel Delta Y', value: 'trigger-wheel-y'},
    {name: 'Mouse Screen X', value: 'mouse-screen-x'},
    {name: 'Mouse Screen Y', value: 'mouse-screen-y'},
    {name: 'Mouse Scene X', value: 'mouse-scene-x'},
    {name: 'Mouse Scene Y', value: 'mouse-scene-y'},
    {name: 'Start Position X', value: 'start-position-x'},
    {name: 'Start Position Y', value: 'start-position-y'},
    {name: 'Camera X', value: 'camera-x'},
    {name: 'Camera Y', value: 'camera-y'},
    {name: 'Camera Zoom', value: 'camera-zoom'},
    {name: 'Screen Width', value: 'screen-width'},
    {name: 'Screen Height', value: 'screen-height'},
    {name: 'Scene Width', value: 'scene-width'},
    {name: 'Scene Height', value: 'scene-height'},
    {name: 'Play Time', value: 'play-time'},
    {name: 'Elapsed Time', value: 'elapsed-time'},
    {name: 'Delta Time', value: 'delta-time'},
    {name: 'Raw Delta Time', value: 'raw-delta-time'},
    {name: 'Get Timestamp', value: 'timestamp'},
  ])

  // 侦听事件
  $('#setNumber-operand').on('closed', this.windowClosed)
  $('#setNumber-operand-confirm').on('click', this.confirm)
}

// 解析数学方法
NumberOperand.parseMathMethod = function (operand) {
  const method = operand.method
  const label = Local.get('command.setNumber.math.' + method)
  switch (method) {
    case 'round': {
      const varName = Command.parseVariable(operand.variable)
      const decimals = operand.decimals
      return `${label}(${varName}${decimals ? `, ${decimals}` : ''})`
    }
    case 'floor':
    case 'ceil':
    case 'sqrt':
    case 'abs':
    case 'cos':
    case 'sin':
    case 'tan': {
      const varName = Command.parseVariable(operand.variable)
      return `${label}(${varName})`
    }
    case 'random':
      return `${label}[0,1)`
    case 'random-int': {
      const min = Command.parseVariableNumber(operand.min)
      const max = Command.parseVariableNumber(operand.max)
      return `${label}[${min},${max}]`
    }
    case 'distance':
    case 'distance-x':
    case 'distance-y':
    case 'relative-angle': {
      const start = Command.parsePosition(operand.start)
      const end = Command.parsePosition(operand.end)
      return `${label}(${start}, ${end})`
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
      const varName = Command.parseVariable(variable)
      return `${methodName}(${varName})`
    }
    case 'search': {
      const {variable, search} = operand
      const varName = Command.parseVariable(variable)
      const searchName = Command.parseVariableString(search)
      return `${methodName}(${varName}, ${searchName})`
    }
  }
}

// 解析对象属性
NumberOperand.parseObjectProperty = function (operand) {
  const property = Local.get('command.setNumber.object.' + operand.property)
  switch (operand.property) {
    case 'actor-x':
    case 'actor-y':
    case 'actor-screen-x':
    case 'actor-screen-y':
    case 'actor-angle':
    case 'actor-direction':
    case 'actor-movement-speed':
    case 'actor-collision-size':
    case 'actor-collision-weight':
    case 'actor-bag-money':
    case 'actor-bag-used-space':
    case 'actor-bag-version':
    case 'actor-skill-version':
    case 'actor-state-version':
    case 'actor-equipment-version':
    case 'actor-animation-current-time':
    case 'actor-animation-duration':
    case 'actor-animation-progress':
      return `${Command.parseActor(operand.actor)} -> ${property}`
    case 'actor-bag-item-quantity':
      return `${Command.parseActor(operand.actor)} -> ${Command.parseFileName(operand.itemId)}.${property}`
    case 'actor-bag-equipment-quantity':
      return `${Command.parseActor(operand.actor)} -> ${Command.parseFileName(operand.equipmentId)}.${property}`
    case 'actor-cooldown-time':
    case 'actor-cooldown-duration':
    case 'actor-cooldown-progress': {
      const key = Command.parseVariableString(operand.key)
      return `${Command.parseActor(operand.actor)} -> ${property}(${key})`
    }
    case 'skill-cooldown-time':
    case 'skill-cooldown-duration':
    case 'skill-cooldown-progress':
      return `${Command.parseSkill(operand.skill)} -> ${property}`
    case 'state-current-time':
    case 'state-duration':
    case 'state-progress':
      return `${Command.parseState(operand.state)} -> ${property}`
    case 'equipment-index':
      return `${Command.parseEquipment(operand.equipment)} -> ${property}`
    case 'item-index':
    case 'item-quantity':
      return `${Command.parseItem(operand.item)} -> ${property}`
    case 'trigger-speed':
    case 'trigger-angle':
      return `${Command.parseTrigger(operand.trigger)} -> ${property}`
    case 'list-length':
      return `${Command.parseVariable(operand.variable)} -> ${property}`
  }
}

// 解析元素属性
NumberOperand.parseElementProperty = function (operand) {
  const element = Command.parseElement(operand.element)
  const property = Local.get('command.setNumber.element.' + operand.property)
  return `${element} -> ${property}`
}

// 解析其他数据
NumberOperand.parseOther = function (operand) {
  return Local.get('command.setNumber.other.' + operand.data)
}

// 解析操作数
NumberOperand.parseOperand = function (operand) {
  switch (operand.type) {
    case 'constant':
      return operand.value.toString()
    case 'variable':
      return Command.parseVariable(operand.variable)
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
      return Command.parseParameter(operand.variable, operand.paramName)
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
  let operandName = this.parseOperand(operand, false)
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
  let elementProperty = 'element-children-count'
  let elementElement = {type: 'trigger'}
  let commonActor = {type: 'trigger'}
  let commonSkill = {type: 'trigger'}
  let commonState = {type: 'trigger'}
  let commonEquipment = {type: 'trigger'}
  let commonItem = {type: 'trigger'}
  let commonTrigger = {type: 'trigger'}
  let cooldownKey = ''
  let listIndex = 0
  let parameterParamName = ''
  let otherData = 'trigger-button'
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
      commonVariable = operand.variable
      parameterParamName = operand.paramName
      break
    case 'other':
      otherData = operand.data
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
  write('string-search', stringSearch)
  write('math-decimals', mathDecimals)
  write('math-min', mathMin)
  write('math-max', mathMax)
  write('math-startPosition', mathStartPosition)
  write('math-endPosition', mathEndPosition)
  write('cooldown-key', cooldownKey)
  write('list-index', listIndex)
  write('parameter-paramName', parameterParamName)
  write('other-data', otherData)
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
        case 'actor-screen-x':
        case 'actor-screen-y':
        case 'actor-angle':
        case 'actor-direction':
        case 'actor-movement-speed':
        case 'actor-collision-size':
        case 'actor-collision-weight':
        case 'actor-bag-money':
        case 'actor-bag-used-space':
        case 'actor-bag-version':
        case 'actor-skill-version':
        case 'actor-state-version':
        case 'actor-equipment-version':
        case 'actor-animation-current-time':
        case 'actor-animation-duration':
        case 'actor-animation-progress': {
          const actor = read('common-actor')
          operand = {operation, type, property, actor}
          break
        }
        case 'actor-bag-item-quantity': {
          const actor = read('common-actor')
          const itemId = read('object-itemId')
          if (itemId === '') {
            return $('#setNumber-operand-object-itemId').getFocus()
          }
          operand = {operation, type, property, actor, itemId}
          break
        }
        case 'actor-bag-equipment-quantity': {
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
        case 'equipment-index': {
          const equipment = read('common-equipment')
          operand = {operation, type, property, equipment}
          break
        }
        case 'item-index':
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
      const variable = read('common-variable')
      const paramName = read('parameter-paramName')
      if (VariableGetter.isNone(variable)) {
        return $('#setNumber-operand-common-variable').getFocus()
      }
      if (paramName === '') {
        return $('#setNumber-operand-parameter-paramName').getFocus()
      }
      operand = {operation, type, variable, paramName}
      break
    }
    case 'other': {
      const data = read('other-data')
      operand = {operation, type, data}
      break
    }
  }
  $('#setNumber-operation').save()
  Window.close('setNumber-operand')
  return operand
}

// 窗口 - 已关闭事件
NumberOperand.windowClosed = function (event) {
  $('#setNumber-operation').restore()
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
IfBranch.parse = function (branch) {
  const words = Command.words
  let joint
  switch (branch.mode) {
    case 'all': joint = ' && '; break
    case 'any': joint = ' || '; break
  }
  for (const condition of branch.conditions) {
    words.push(IfCondition.parse(condition))
  }
  return words.join(joint)
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
    {name: 'Present', value: 'present'},
    {name: 'Absent', value: 'absent'},
    {name: 'active', value: 'active'},
    {name: 'inactive', value: 'inactive'},
    {name: 'Has Targets', value: 'has-targets'},
    {name: 'Has No Targets', value: 'has-no-targets'},
    {name: 'In Screen', value: 'in-screen'},
    {name: 'Has Items', value: 'has-items'},
    {name: 'Has Equipments', value: 'has-equipments'},
    {name: 'Equipped', value: 'equipped'},
  ])

  // 设置角色操作关联元素
  $('#if-condition-actor-operation').enableHiddenMode().relate([
    {case: 'has-items', targets: [
      $('#if-condition-actor-itemId'),
      $('#if-condition-actor-quantity'),
    ]},
    {case: 'has-equipments', targets: [
      $('#if-condition-actor-equipmentId'),
      $('#if-condition-actor-quantity'),
    ]},
    {case: 'equipped', targets: [
      $('#if-condition-actor-equipmentId'),
    ]},
  ])

  // 创建元素操作选项
  $('#if-condition-element-operation').loadItems([
    {name: 'Present', value: 'present'},
    {name: 'Absent', value: 'absent'},
    {name: 'Visible', value: 'visible'},
    {name: 'Invisible', value: 'invisible'},
    {name: 'Dialog Box - is Paused', value: 'dialogbox-is-paused'},
    {name: 'Dialog Box - is Updating', value: 'dialogbox-is-updating'},
    {name: 'Dialog Box - is Waiting', value: 'dialogbox-is-waiting'},
    {name: 'Dialog Box - is Complete', value: 'dialogbox-is-complete'},
  ])

  // 创建键盘状态选项
  $('#if-condition-keyboard-state').loadItems([
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
  ])

  // 侦听事件
  $('#if-condition-confirm').on('click', this.confirm)
}

// 解析布尔值操作
IfCondition.parseBooleanOperation = function ({operation}) {
  switch (operation) {
    case 'equal': return '=='
    case 'unequal': return '!='
  }
}

// 解析布尔值操作数
IfCondition.parseBooleanOperand = function ({operand}) {
  switch (operand.type) {
    case 'none':
      return Local.get('common.none')
    case 'constant':
      return operand.value.toString()
    case 'variable':
      return Command.parseVariable(operand.variable)
  }
}

// 解析数值操作
IfCondition.parseNumberOperation = function ({operation}) {
  switch (operation) {
    case 'equal': return '=='
    case 'unequal': return '!='
    case 'greater-or-equal': return '>='
    case 'less-or-equal': return '<='
    case 'greater': return '>'
    case 'less': return '<'
  }
}

// 解析数值操作数
IfCondition.parseNumberOperand = function ({operand}) {
  switch (operand.type) {
    case 'none':
      return Local.get('common.none')
    case 'constant':
      return operand.value.toString()
    case 'variable':
      return Command.parseVariable(operand.variable)
  }
}

// 解析字符串操作
IfCondition.parseStringOperation = function ({operation}) {
  switch (operation) {
    case 'equal': return '=='
    case 'unequal': return '!='
    default: return Local.get('command.if.string.' + operation)
  }
}

// 解析字符串操作数
IfCondition.parseStringOperand = function ({operand}) {
  switch (operand.type) {
    case 'none':
      return Local.get('common.none')
    case 'constant':
      return `"${Command.parseMultiLineString(operand.value)}"`
    case 'variable':
      return Command.parseVariable(operand.variable)
    case 'enum': {
      const name = Command.parseEnumString(operand.stringId)
      return `${Local.get('command.if.string.enum')}(${name})`
    }
  }
}

// 解析对象操作
IfCondition.parseObjectOperation = function ({operation}) {
  switch (operation) {
    case 'equal': return '=='
    case 'unequal': return '!='
    default: return Local.get('command.if.object.' + operation)
  }
}

// 解析对象操作数
IfCondition.parseObjectOperand = function ({operand}) {
  if (!operand) return ''
  switch (operand.type) {
    case 'none':
      return Local.get('common.none')
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
  }
}

// 解析角色操作
IfCondition.parseActorOperation = function ({operation, itemId, equipmentId, quantity}) {
  const op = Local.get('command.if.actor.' + operation)
  switch (operation) {
    case 'has-items': {
      const text = `${op} ${Command.parseFileName(itemId)}`
      return quantity === 1 ? text : `${text} x ${quantity}`
    }
    case 'has-equipments': {
      const text = `${op} ${Command.parseFileName(equipmentId)}`
      return quantity === 1 ? text : `${text} x ${quantity}`
    }
    case 'equipped':
      return `${op} ${Command.parseFileName(equipmentId)}`
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
IfCondition.parse = function (condition) {
  switch (condition.type) {
    case 'boolean': {
      const variable = Command.parseVariable(condition.variable)
      const operator = this.parseBooleanOperation(condition)
      const value = this.parseBooleanOperand(condition)
      return `${variable} ${operator} ${value}`
    }
    case 'number': {
      const variable = Command.parseVariable(condition.variable)
      const operator = this.parseNumberOperation(condition)
      const value = this.parseNumberOperand(condition)
      return `${variable} ${operator} ${value}`
    }
    case 'string': {
      const variable = Command.parseVariable(condition.variable)
      const operator = this.parseStringOperation(condition)
      const value = this.parseStringOperand(condition)
      return `${variable} ${operator} ${value}`
    }
    case 'object': {
      const variable = Command.parseVariable(condition.variable)
      const operator = this.parseObjectOperation(condition)
      const value = this.parseObjectOperand(condition)
      return `${variable} ${operator} ${value}`
    }
    case 'actor': {
      const actor = Command.parseActor(condition.actor)
      const operation = this.parseActorOperation(condition)
      return `${actor} ${operation}`
    }
    case 'element': {
      const element = Command.parseElement(condition.element)
      const operation = this.parseElementOperation(condition)
      return `${element} ${operation}`
    }
    case 'keyboard': {
      const key = condition.keycode
      const keyboard = Local.get('command.if.keyboard')
      const state = this.parseKeyboardState(condition.state)
      return `${keyboard}["${key}"] ${state}`
    }
    case 'mouse': {
      const button = this.parseMouseButton(condition.button)
      const mouse = Local.get('command.if.mouse')
      const state = this.parseMouseState(condition.state)
      return `${mouse}[${button}] ${state}`
    }
    case 'list': {
      const list = Command.parseVariable(condition.list)
      const operation = this.parseListOperation(condition)
      const target = Command.parseVariable(condition.target)
      return `${list} ${operation} ${target}`
    }
    case 'other':
      return this.parseOther(condition)
  }
}

// 打开数据
IfCondition.open = function (condition = {
  type: 'number',
  variable: {type: 'local', key: ''},
  operation: 'equal',
  operand: {type: 'constant', value: 0},
}) {
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
  let actorOperation = 'present'
  let actorItemId = ''
  let actorEquipmentId = ''
  let actorQuantity = 1
  let elementOperation = 'present'
  let keyboardKeycode = ''
  let keyboardState = 'pressed'
  let mouseButton = 0
  let mouseState = 'pressed'
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
      actorItemId = condition.itemId ?? actorItemId
      actorEquipmentId = condition.equipmentId ?? actorEquipmentId
      actorQuantity = condition.quantity ?? actorQuantity
      break
    case 'element':
      commonElement = condition.element
      elementOperation = condition.operation
      break
    case 'keyboard':
      keyboardKeycode = condition.keycode
      keyboardState = condition.state
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
  write('common-actor', commonActor)
  write('common-skill', commonSkill)
  write('common-state', commonState)
  write('common-equipment', commonEquipment)
  write('common-item', commonItem)
  write('common-trigger', commonTrigger)
  write('common-light', commonLight)
  write('common-element', commonElement)
  write('actor-operation', actorOperation)
  write('actor-itemId', actorItemId)
  write('actor-equipmentId', actorEquipmentId)
  write('actor-quantity', actorQuantity)
  write('element-operation', elementOperation)
  write('keyboard-keycode', keyboardKeycode)
  write('keyboard-state', keyboardState)
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
        case 'equipped': {
          const equipmentId = read('actor-equipmentId')
          if (equipmentId === '') {
            return $('#if-condition-actor-equipmentId').getFocus()
          }
          condition = {type, actor, operation, equipmentId}
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
SwitchBranch.parse = function (branch) {
  const words = Command.words
  for (const condition of branch.conditions) {
    words.push(SwitchCondition.parse(condition))
  }
  return words.join()
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
    {name: 'Enum String', value: 'enum'},
    {name: 'Keyboard', value: 'keyboard'},
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
    {case: 'enum', targets: [
      $('#switch-condition-enum-stringId'),
    ]},
    {case: 'keyboard', targets: [
      $('#switch-condition-keyboard-keycode'),
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
SwitchCondition.parse = function (condition) {
  switch (condition.type) {
    case 'none':
      return Local.get('common.none')
    case 'boolean':
    case 'number':
      return condition.value.toString()
    case 'string':
      return `"${Command.parseMultiLineString(condition.value)}"`
    case 'enum': {
      const name = Command.parseEnumString(condition.stringId)
      return `${Local.get('command.switch.enum')}(${name})`
    }
    case 'keyboard': {
      const key = condition.keycode
      const keyboard = Local.get('command.switch.keyboard')
      return `${keyboard}["${key}"]`
    }
    case 'mouse': {
      const button = IfCondition.parseMouseButton(condition.button)
      const mouse = Local.get('command.switch.mouse')
      return `${mouse}[${button}]`
    }
    case 'variable':
      return Command.parseVariable(condition.variable)
  }
}

// 打开数据
SwitchCondition.open = function (condition = {type: 'number', value: 0}) {
  Window.open('switch-condition')
  let booleanValue = false
  let numberValue = 0
  let stringValue = ''
  let enumStringId = ''
  let keyboardKeycode = ''
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
    case 'enum':
      enumStringId = condition.stringId
      break
    case 'keyboard':
      keyboardKeycode = condition.keycode
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
  write('enum-stringId', enumStringId)
  write('keyboard-keycode', keyboardKeycode)
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
ImageProperty.parse = function ([key, value]) {
  const get = Local.createGetter('command.setImage')
  const name = get(key)
  switch (key) {
    case 'image':
      return `${name}(${Command.parseFileName(value)})`
    case 'display':
      return `${name}(${get('display.' + value)})`
    case 'flip':
      return `${name}(${get('flip.' + value)})`
    case 'blend':
      return `${name}(${Command.parseBlend(value)})`
    case 'shiftX':
    case 'shiftY':
    case 'clip-0':
    case 'clip-1':
    case 'clip-2':
    case 'clip-3':
      return `${name}(${Command.parseVariableNumber(value)})`
  }
}

// 打开数据
ImageProperty.open = function ([key = 'image', value = ''] = []) {
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
  return [key, value]
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
TextProperty.parse = function ([key, value]) {
  const get = Local.createGetter('command.setText')
  const name = get(key)
  switch (key) {
    case 'content': {
      let string = Command.parseMultiLineString(Command.parseVariableTag(value))
      if (string.length > 40) {
        string = string.slice(0, 40) + '...'
      }
      return `${name}("${string}")`
    }
    case 'size':
    case 'lineSpacing':
    case 'letterSpacing':
      return `${name}(${value})`
    case 'color':
      return `${name}(#${Color.simplifyHexColor(value)})`
    case 'font':
      return `${name}(${value || get('font.default')})`
    case 'effect':
      switch (value.type) {
        case 'none':
          return `${name}(${get('effect.none')})`
        case 'shadow': {
          const x = value.shadowOffsetX
          const y = value.shadowOffsetY
          const color = Color.simplifyHexColor(value.color)
          return `${name}(${get('effect.shadow')}, ${x}, ${y}, #${color})`
        }
        case 'stroke': {
          const width = value.strokeWidth
          const color = Color.simplifyHexColor(value.color)
          return `${name}(${get('effect.stroke')}, ${width}, #${color})`
        }
        case 'outline': {
          const color = Color.simplifyHexColor(value.color)
          return `${name}(${get('effect.outline')}, #${color})`
        }
      }
    case 'blend':
      return `${name}(${Command.parseBlend(value)})`
  }
}

// 打开数据
TextProperty.open = function ([key = 'content', value = ''] = []) {
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
  return [key, value]
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
TextBoxProperty.parse = function ([key, value]) {
  const get = Local.createGetter('command.setTextBox')
  const name = get(key)
  switch (key) {
    case 'type':
      return `${name}(${get('type.' + value)})`
    case 'text': {
      let string = Command.parseVariableString(value)
      if (string.length > 40) {
        string = string.slice(0, 40) + '...'
      }
      return `${name}(${string})`
    }
    case 'number':
    case 'min':
    case 'max':
      return `${name}(${Command.parseVariableNumber(value)})`
    case 'decimals':
      return `${name}(${value})`
    case 'color':
      return `${name}(#${Color.simplifyHexColor(value)})`
  }
}

// 打开数据
TextBoxProperty.open = function ([key = 'type', value = 'text'] = []) {
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
  return [key, value]
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
DialogBoxProperty.parse = function ([key, value]) {
  const get = Local.createGetter('command.setDialogBox')
  const name = get(key)
  switch (key) {
    case 'content': {
      let string = Command.parseMultiLineString(Command.parseVariableTag(value))
      if (string.length > 40) {
        string = string.slice(0, 40) + '...'
      }
      return `${name}("${string}")`
    }
    case 'interval':
    case 'size':
    case 'lineSpacing':
    case 'letterSpacing':
      return `${name}(${value})`
    case 'color':
      return `${name}(#${Color.simplifyHexColor(value)})`
    case 'font':
      return `${name}(${value || get('font.default')})`
    case 'effect':
      switch (value.type) {
        case 'none':
          return `${name}(${get('effect.none')})`
        case 'shadow': {
          const x = value.shadowOffsetX
          const y = value.shadowOffsetY
          const color = Color.simplifyHexColor(value.color)
          return `${name}(${get('effect.shadow')}, ${x}, ${y}, #${color})`
        }
        case 'stroke': {
          const width = value.strokeWidth
          const color = Color.simplifyHexColor(value.color)
          return `${name}(${get('effect.stroke')}, ${width}, #${color})`
        }
        case 'outline': {
          const color = Color.simplifyHexColor(value.color)
          return `${name}(${get('effect.outline')}, #${color})`
        }
      }
    case 'blend':
      return `${name}(${Command.parseBlend(value)})`
  }
}

// 打开数据
DialogBoxProperty.open = function ([key = 'content', value = ''] = []) {
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
  return [key, value]
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
ProgressBarProperty.parse = function ([key, value]) {
  const get = Local.createGetter('command.setProgressBar')
  const name = get(key)
  switch (key) {
    case 'image':
      return `${name}(${Command.parseFileName(value)})`
    case 'display':
      return `${name}(${get('display.' + value)})`
    case 'blend':
      return `${name}(${Command.parseBlend(value)})`
    case 'progress':
    case 'clip-0':
    case 'clip-1':
    case 'clip-2':
    case 'clip-3':
    case 'color-0':
    case 'color-1':
    case 'color-2':
    case 'color-3':
      return `${name}(${Command.parseVariableNumber(value)})`
  }
}

// 打开数据
ProgressBarProperty.open = function ([key = 'image', value = ''] = []) {
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
  return [key, value]
}

// 确定按钮 - 鼠标点击事件
ProgressBarProperty.confirm = function (event) {
  return ProgressBarProperty.target.save()
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
    {name: 'X2', value: 'x2'},
    {name: 'Y', value: 'y'},
    {name: 'Y2', value: 'y2'},
    {name: 'Width', value: 'width'},
    {name: 'Width2', value: 'width2'},
    {name: 'Height', value: 'height'},
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
    {case: 'x2', targets: [
      $('#moveElement-property-x2'),
    ]},
    {case: 'y', targets: [
      $('#moveElement-property-y'),
    ]},
    {case: 'y2', targets: [
      $('#moveElement-property-y2'),
    ]},
    {case: 'width', targets: [
      $('#moveElement-property-width'),
    ]},
    {case: 'width2', targets: [
      $('#moveElement-property-width2'),
    ]},
    {case: 'height', targets: [
      $('#moveElement-property-height'),
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
TransformProperty.parse = function ([key, value]) {
  return `${Local.get('command.moveElement.' + key)}(${Command.parseVariableNumber(value)})`
}

// 打开数据
TransformProperty.open = function ([key = 'anchorX', value = 0] = []) {
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
  return [key, value]
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
LightProperty.parse = function ([key, value]) {
  switch (key) {
    case 'x':
    case 'y':
    case 'range':
    case 'intensity':
    case 'anchorX':
    case 'anchorY':
    case 'width':
    case 'height':
    case 'angle':
    case 'red':
    case 'green':
    case 'blue': {
      const number = Command.parseVariableNumber(value)
      return `${Local.get('command.moveLight.' + key)}(${number})`
    }
  }
}

// 打开数据
LightProperty.open = function ([
  key   = 'x',
  value = 0,
] = []) {
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
  return [key, value]
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
    item => item.value !== 'global'
  )
  const objectTypes = [
    types['local'],
    types['global'],
  ]
  this.types = {
    all: allTypes,
    object: objectTypes,
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
      $('#variableGetter-type').loadItems(types.all)
      $('#variableGetter-global-key').setAttribute('filter', filter)
      break
    case 'object':
      $('#variableGetter-type').loadItems(types.object)
      $('#variableGetter-global-key').setAttribute('filter', filter)
      break
    case 'writable-boolean':
    case 'writable-number':
    case 'writable-string':
      $('#variableGetter-type').loadItems(types.writable)
      $('#variableGetter-global-key').setAttribute('filter', filter.slice(9))
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
  switch (type.replace('[]', '')) {
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
    case 'global':
      globalKey = key
      break
    default:
      commonKey = key
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
      const {keyBox} = VariableGetter
      const attrName = keyBox.textContent
      keyBox.write(keyBox.read())
      if (keyBox.invalid) {
        // 如果是无效数据，则写入同名属性或第一项作为默认值
        let defValue = keyBox.dataItems[0]?.value
        for (const item of keyBox.dataItems) {
          if (item.name === attrName) {
            defValue = item.value
            break
          }
        }
        if (defValue !== undefined) {
          keyBox.write(defValue)
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
    case 'global': {
      key = read('global-key')
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
    default:
      key = read('common-key').trim()
      if (key === '') {
        return $('#variableGetter-common-key').getFocus()
      }
      break
  }
  switch (type.replace('[]', '')) {
    case 'local':
    case 'global':
      getter = {type, key}
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
  this.target.input(getter)
  Window.close('variableGetter')
}.bind(VariableGetter)

// ******************************** 角色访问器窗口 ********************************

const ActorGetter = {
  // properties
  target: null,
  // methods
  initialize: null,
  open: null,
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
    {name: 'Player Actor', value: 'player'},
    {name: 'Party Member', value: 'member'},
    {name: 'Global Actor', value: 'global'},
    {name: 'Select By ID', value: 'by-id'},
    {name: 'Select By Name', value: 'by-name'},
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
    {case: 'by-name', targets: [
      $('#actorGetter-name'),
    ]},
    {case: 'variable', targets: [
      $('#actorGetter-variable'),
    ]},
  ])

  // 创建队伍成员编号选项
  $('#actorGetter-memberId').loadItems([
    {name: 'Member #1', value: 0},
    {name: 'Member #2', value: 1},
    {name: 'Member #3', value: 2},
    {name: 'Member #4', value: 3},
  ])

  // 侦听事件
  $('#actorGetter-confirm').on('click', this.confirm)
  TextSuggestion.listen($('#actorGetter-name'), 'actor')
}

// 打开窗口
ActorGetter.open = function (target) {
  this.target = target
  Window.open('actorGetter')

  let name = ''
  let memberId = 0
  let actorId = ''
  let presetId = PresetObject.getDefaultPresetId('actor')
  let variable = {type: 'local', key: ''}
  const actor = target.dataValue
  switch (actor.type) {
    case 'trigger':
    case 'caster':
    case 'latest':
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
    case 'by-name':
      name = actor.name
      break
    case 'variable':
      variable = actor.variable
      break
  }
  $('#actorGetter-type').write(actor.type)
  $('#actorGetter-memberId').write(memberId)
  $('#actorGetter-actorId').write(actorId)
  $('#actorGetter-presetId').write(presetId)
  $('#actorGetter-name').write(name)
  $('#actorGetter-variable').write(variable)
  $('#actorGetter-type').getFocus()
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
    case 'by-name': {
      const name = read('name')
      if (name === '') {
        return $('#actorGetter-name').getFocus()
      }
      getter = {type, name}
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
  // events
  confirm: null,
}

// 初始化
SkillGetter.initialize = function () {
  // 创建访问器类型选项
  $('#skillGetter-type').loadItems([
    {name: 'Event Trigger Skill', value: 'trigger'},
    {name: 'Latest Skill', value: 'latest'},
    {name: 'Select By Shortcut Key', value: 'by-key'},
    {name: 'Variable', value: 'variable'},
  ])

  // 设置关联元素
  $('#skillGetter-type').enableHiddenMode().relate([
    {case: 'by-key', targets: [
      $('#skillGetter-actor'),
      $('#skillGetter-key'),
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
    case 'variable':
      variable = skill.variable
      break
  }
  $('#skillGetter-type').write(skill.type)
  $('#skillGetter-actor').write(actor)
  $('#skillGetter-key').write(key)
  $('#skillGetter-variable').write(variable)
  $('#skillGetter-type').getFocus()
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
    case 'variable': {
      const variable = read('variable')
      if (VariableGetter.isNone(variable)) {
        return $('#skillGetter-variable').getFocus()
      }
      getter = {type, variable}
      break
    }
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
  // events
  confirm: null,
}

// 初始化
StateGetter.initialize = function () {
  // 创建访问器类型选项
  $('#stateGetter-type').loadItems([
    {name: 'Event Trigger State', value: 'trigger'},
    {name: 'Latest State', value: 'latest'},
    {name: 'Variable', value: 'variable'},
  ])

  // 设置关联元素
  $('#stateGetter-type').enableHiddenMode().relate([
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

  let variable = {type: 'local', key: ''}
  const state = target.dataValue
  switch (state.type) {
    case 'trigger':
    case 'latest':
      break
    case 'variable':
      variable = state.variable
      break
  }
  $('#stateGetter-type').write(state.type)
  $('#stateGetter-variable').write(variable)
  $('#stateGetter-type').getFocus()
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
    case 'variable': {
      const variable = read('variable')
      if (VariableGetter.isNone(variable)) {
        return $('#stateGetter-variable').getFocus()
      }
      getter = {type, variable}
      break
    }
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
  // events
  confirm: null,
}

// 初始化
EquipmentGetter.initialize = function () {
  // 创建访问器类型选项
  $('#equipmentGetter-type').loadItems([
    {name: 'Event Trigger Equipment', value: 'trigger'},
    {name: 'Latest Equipment', value: 'latest'},
    {name: 'Select By Key', value: 'by-key'},
    {name: 'Variable', value: 'variable'},
  ])

  // 设置类型关联元素
  $('#equipmentGetter-type').enableHiddenMode().relate([
    {case: 'by-key', targets: [
      $('#equipmentGetter-actor'),
      $('#equipmentGetter-key'),
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
  $('#equipmentGetter-key').loadItems(
    Enum.getStringItems('equipment-slot')
  )

  let actor = {type: 'trigger'}
  let key = Enum.getDefStringId('equipment-slot')
  let variable = {type: 'local', key: ''}
  const equipment = target.dataValue
  switch (equipment.type) {
    case 'trigger':
    case 'latest':
      break
    case 'by-key':
      actor = equipment.actor
      key = equipment.key
      break
    case 'variable':
      variable = equipment.variable
      break
  }
  $('#equipmentGetter-type').write(equipment.type)
  $('#equipmentGetter-actor').write(actor)
  $('#equipmentGetter-key').write(key)
  $('#equipmentGetter-variable').write(variable)
  $('#equipmentGetter-type').getFocus()
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
    case 'by-key': {
      const actor = read('actor')
      const key = read('key')
      if (key === '') {
        return $('#equipmentGetter-key').getFocus()
      }
      getter = {type, actor, key}
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
  // events
  confirm: null,
}

// 初始化
ItemGetter.initialize = function () {
  // 创建访问器类型选项
  $('#itemGetter-type').loadItems([
    {name: 'Event Trigger Item', value: 'trigger'},
    {name: 'Latest Item', value: 'latest'},
    {name: 'Select By Shortcut Key', value: 'by-key'},
    {name: 'Variable', value: 'variable'},
  ])

  // 设置类型关联元素
  $('#itemGetter-type').enableHiddenMode().relate([
    {case: 'by-key', targets: [
      $('#itemGetter-actor'),
      $('#itemGetter-key'),
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
    case 'variable':
      variable = item.variable
      break
  }
  $('#itemGetter-type').write(item.type)
  $('#itemGetter-actor').write(actor)
  $('#itemGetter-key').write(key)
  $('#itemGetter-variable').write(variable)
  $('#itemGetter-type').getFocus()
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
    case 'variable': {
      const variable = read('variable')
      if (VariableGetter.isNone(variable)) {
        return $('#itemGetter-variable').getFocus()
      }
      getter = {type, variable}
      break
    }
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
      $('#positionGetter-regionId'),
    ]},
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
  let regionId = PresetObject.getDefaultPresetId('region')
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
      regionId = position.regionId
      break
  }
  $('#positionGetter-type').write(position.type)
  $('#positionGetter-common-x').write(commonX)
  $('#positionGetter-common-y').write(commonY)
  $('#positionGetter-actor').write(actor)
  $('#positionGetter-trigger').write(trigger)
  $('#positionGetter-light').write(light)
  $('#positionGetter-regionId').write(regionId)
  $('#positionGetter-type').getFocus()
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
      const regionId = read('regionId')
      if (regionId === '') {
        return $('#positionGetter-regionId').getFocus()
      }
      getter = {type, regionId}
      break
    }
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
    {name: 'Select By ID', value: 'by-id'},
    {name: 'Select By Name', value: 'by-name'},
    {name: 'Variable', value: 'variable'},
  ])

  // 设置关联元素
  $('#lightGetter-type').enableHiddenMode().relate([
    {case: 'by-id', targets: [
      $('#lightGetter-presetId'),
    ]},
    {case: 'by-name', targets: [
      $('#lightGetter-name'),
    ]},
    {case: 'variable', targets: [
      $('#lightGetter-variable'),
    ]},
  ])

  // 侦听事件
  $('#lightGetter-confirm').on('click', this.confirm)
  TextSuggestion.listen($('#lightGetter-name'), 'light')
}

// 打开窗口
LightGetter.open = function (target) {
  this.target = target
  Window.open('lightGetter')

  let name = ''
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
    case 'by-name':
      name = light.name
      break
    case 'variable':
      variable = light.variable
      break
  }
  $('#lightGetter-type').write(light.type)
  $('#lightGetter-presetId').write(presetId)
  $('#lightGetter-name').write(name)
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
    case 'by-name': {
      const name = read('name').trim()
      if (!name) {
        return $('#lightGetter-name').getFocus()
      }
      getter = {type, name}
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

// ******************************** 元素访问器窗口 ********************************

const ElementGetter = {
  // properties
  target: null,
  // methods
  initialize: null,
  open: null,
  // events
  confirm: null,
}

// 初始化
ElementGetter.initialize = function () {
  // 创建访问器类型选项
  $('#elementGetter-type').loadItems([
    {name: 'Event Trigger Element', value: 'trigger'},
    {name: 'Latest Element', value: 'latest'},
    {name: 'Select By ID', value: 'by-id'},
    {name: 'Select By Name', value: 'by-name'},
    {name: 'Select By Ancestor And ID', value: 'by-ancestor-and-id'},
    {name: 'Select By Ancestor And Name', value: 'by-ancestor-and-name'},
    {name: 'Variable', value: 'variable'},
  ])

  // 设置关联元素
  $('#elementGetter-type').enableHiddenMode().relate([
    {case: 'by-id', targets: [
      $('#elementGetter-presetId'),
    ]},
    {case: 'by-name', targets: [
      $('#elementGetter-name'),
    ]},
    {case: 'by-ancestor-and-id', targets: [
      $('#elementGetter-ancestor'),
      $('#elementGetter-presetId'),
    ]},
    {case: 'by-ancestor-and-name', targets: [
      $('#elementGetter-ancestor'),
      $('#elementGetter-name'),
    ]},
    {case: 'variable', targets: [
      $('#elementGetter-variable'),
    ]},
  ])

  // 侦听事件
  $('#elementGetter-confirm').on('click', this.confirm)
  TextSuggestion.listen($('#elementGetter-name'), 'element')
}

// 打开窗口
ElementGetter.open = function (target) {
  this.target = target
  Window.open('elementGetter')

  let name = ''
  let presetId = PresetElement.getDefaultPresetId()
  let ancestor = {type: 'trigger'}
  let variable = {type: 'local', key: ''}
  const element = target.dataValue
  switch (element.type) {
    case 'trigger':
    case 'latest':
      break
    case 'by-id':
      presetId = element.presetId
      break
    case 'by-name':
      name = element.name
      break
    case 'by-ancestor-and-id':
      ancestor = element.ancestor
      presetId = element.presetId
      break
    case 'by-ancestor-and-name':
      ancestor = element.ancestor
      name = element.name
      break
    case 'variable':
      variable = element.variable
      break
  }
  $('#elementGetter-type').write(element.type)
  $('#elementGetter-ancestor').write(ancestor)
  $('#elementGetter-presetId').write(presetId)
  $('#elementGetter-name').write(name)
  $('#elementGetter-variable').write(variable)
  $('#elementGetter-type').getFocus()
}

// 确定按钮 - 鼠标点击事件
ElementGetter.confirm = function (event) {
  const read = getElementReader('elementGetter')
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
        return $('#elementGetter-presetId').getFocus()
      }
      getter = {type, presetId}
      break
    }
    case 'by-name': {
      const name = read('name').trim()
      if (!name) {
        return $('#elementGetter-name').getFocus()
      }
      getter = {type, name}
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
    case 'by-ancestor-and-name': {
      const ancestor = read('ancestor')
      const name = read('name').trim()
      if (!name) {
        return $('#elementGetter-name').getFocus()
      }
      getter = {type, ancestor, name}
      break
    }
    case 'variable': {
      const variable = read('variable')
      if (VariableGetter.isNone(variable)) {
        return $('#elementGetter-variable').getFocus()
      }
      getter = {type, variable}
      break
    }
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
    'by-name',
    'variable',
  ]
  $('#ancestorGetter-type').loadItems(
    $('#elementGetter-type').dataItems.filter(
      a => inclusions.includes(a.value)
  ))

  // 设置关联元素
  $('#ancestorGetter-type').enableHiddenMode().relate([
    {case: 'by-name', targets: [
      $('#ancestorGetter-name'),
    ]},
    {case: 'variable', targets: [
      $('#ancestorGetter-variable'),
    ]},
  ])

  // 侦听事件
  $('#ancestorGetter-confirm').on('click', this.confirm)
  TextSuggestion.listen($('#ancestorGetter-name'), 'element')
}

// 打开窗口
AncestorGetter.open = function (target) {
  this.target = target
  Window.open('ancestorGetter')

  let name = ''
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
    case 'by-name':
      name = element.name
      break
    case 'variable':
      variable = element.variable
      break
  }
  $('#ancestorGetter-type').write(element.type)
  $('#ancestorGetter-presetId').write(presetId)
  $('#ancestorGetter-name').write(name)
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
    case 'by-name': {
      const name = read('name').trim()
      if (!name) {
        return $('#ancestorGetter-name').getFocus()
      }
      getter = {type, name}
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
      NodeList.deleteCaches(commands)
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
