'use strict'

// ******************************** 插件窗口 ********************************

const PluginManager = {
  // properties
  list: $('#plugin-list'),
  overviewPane: $('#plugin-overview-detail').hide(),
  overview: $('#plugin-overview'),
  parameterPane: $('#plugin-parameter-pane').hide(),
  data: null,
  meta: null,
  symbol: null,
  detailed: false,
  changed: false,
  // methods
  initialize: null,
  open: null,
  load: null,
  unload: null,
  loadOverview: null,
  createOverview: null,
  createData: null,
  getItemById: null,
  switchOverviewMode: null,
  parseMeta: null,
  reconstruct: null,
  saveToProject: null,
  loadFromProject: null,
  // events
  windowClose: null,
  windowClosed: null,
  keydown: null,
  pointerdown: null,
  scriptChange: null,
  listKeydown: null,
  listSelect: null,
  listUnselect: null,
  listChange: null,
  listPopup: null,
  listOpen: null,
  overviewPointerdown: null,
  parameterPaneUpdate: null,
  confirm: null,
  apply: null,
}

// list methods
PluginManager.list.insert = null
PluginManager.list.toggle = null
PluginManager.list.copy = null
PluginManager.list.paste = null
PluginManager.list.delete = null
PluginManager.list.saveSelection = null
PluginManager.list.restoreSelection = null
PluginManager.list.updateNodeElement = Easing.list.updateNodeElement
PluginManager.list.addElementClass = null
PluginManager.list.updateTextNode = null
PluginManager.list.updateToggleStyle = null
PluginManager.list.createEditIcon = null

// pane methods
PluginManager.parameterPane.createDetailBox = null
PluginManager.parameterPane.clear = null

// 初始化
PluginManager.initialize = function () {
  // 绑定插件列表
  const {list} = this
  list.removable = true
  list.bind(() => this.data)
  list.creators.push(list.addElementClass)
  list.creators.push(list.updateToggleStyle)
  list.updaters.push(list.updateTextNode)
  list.creators.push(list.createEditIcon)

  // 绑定脚本参数面板
  this.parameterPane.bind(list)

  // 侦听事件
  $('#plugin').on('close', this.windowClose)
  $('#plugin').on('closed', this.windowClosed)
  list.on('keydown', this.listKeydown)
  list.on('select', this.listSelect)
  list.on('unselect', this.listUnselect)
  list.on('change', this.listChange)
  list.on('popup', this.listPopup)
  list.on('open', this.listOpen)
  list.on('pointerdown', ScriptListInterface.listPointerdown)
  this.overview.on('pointerdown', this.overviewPointerdown)
  this.parameterPane.on('update', this.parameterPaneUpdate)
  $('#plugin-confirm').on('click', this.confirm)
  $('#plugin-apply').on('click', this.apply)
}

// 打开窗口
PluginManager.open = function () {
  Window.open('plugin')

  // 创建数据副本
  this.data = Object.clone(Data.plugins)

  // 更新列表项目
  this.list.restoreSelection()

  // 列表获得焦点
  this.list.getFocus()

  // 侦听事件
  window.on('keydown', this.keydown)
  window.on('pointerdown', this.pointerdown)
  window.on('script-change', this.scriptChange)
}

// 加载插件
PluginManager.load = async function (item) {
  const symbol = this.symbol = Symbol()
  const meta = await Data.scripts[item.id]
  if (this.symbol === symbol) {
    this.symbol = null
    this.meta = meta
    this.loadOverview()
    this.parameterPane.update()
  }
}

// 卸载插件
PluginManager.unload = function () {
  this.meta = null
  this.symbol = null
  this.overview.clear()
  this.overviewPane.hide()
  this.parameterPane.hide()
  this.parameterPane.clear()
}

// 加载概述内容
PluginManager.loadOverview = function () {
  const {meta, detailed} = this
  if (!meta) return
  const elements = this.createOverview(meta, detailed)
  const overview = this.overview.clear()
  for (const element of elements) {
    overview.appendChild(element)
  }
  this.overviewPane.show()
}

// 创建概述内容
PluginManager.createOverview = function (meta, detailed) {
  const elements = []
  const get = Local.createGetter('plugin')
  const langMap = meta.langMap.update()
  const {plugin, author, link, version, desc} = meta.overview
  if (plugin) {
    const title = document.createElement('text')
    title.addClass('plugin-title')
    elements.push(title)
    const text = document.createElement('text')
    text.textContent = langMap.get(plugin)
    text.addClass('plugin-name')
    title.appendChild(text)
    if (version) {
      const text = document.createElement('text')
      text.textContent = ' ver' + version
      text.addClass('plugin-version')
      title.appendChild(text)
    }
  }
  if (author) {
    if (elements.length) {
      elements.push(document.createTextNode('\n'))
    }
    const label = document.createElement('text')
    label.textContent = `${get('author')}: `
    label.addClass('plugin-label')
    elements.push(label)
    const text = document.createElement('text')
    text.textContent = author
    text.addClass('plugin-type')
    if (link) {
      text.addClass('plugin-link')
      text.onclick = () => File.openURL(link)
    }
    elements.push(text)
  }
  if (desc) {
    if (elements.length) {
      elements.push(document.createTextNode('\n\n'))
    }
    elements.push(document.createTextNode(langMap.get(desc)))
  }
  // 显示更多信息
  if (detailed) {
    const {parameters} = meta
    const {states} = meta.manager
    if (elements.length && parameters.length) {
      elements.push(document.createTextNode('\n\n'))
    }
    for (const parameter of parameters) {
      const {key, type, alias, desc} = parameter
      const elWrap = document.createElement('text')
      elWrap.addClass('plugin-wrap')
      elements.push(elWrap)
      const elKey = document.createElement('text')
      elKey.textContent = langMap.get(alias) ?? key
      elKey.addClass('plugin-key')
      elWrap.appendChild(elKey)
      const delimiter = document.createElement('text')
      delimiter.textContent = ': '
      delimiter.addClass('plugin-label')
      elWrap.appendChild(delimiter)
      switch (type) {
        case 'attribute':
        case 'attribute-key': {
          const elType = document.createElement('text')
          let attrType = 'attribute'
          if (parameter.filter !== 'any') {
            attrType += '.' + parameter.filter
          }
          let text = get(attrType)
          if (type === 'attribute-key') {
            text += `(${get('key')})`
          }
          elType.textContent = text
          elType.addClass('plugin-type')
          elWrap.appendChild(elType)
          break
        }
        case 'attribute-group': {
          const elType = document.createElement('text')
          elType.textContent = get('attribute.group')
          elType.addClass('plugin-type')
          elWrap.appendChild(elType)
          break
        }
        case 'enum':
        case 'enum-value': {
          const elType = document.createElement('text')
          let enumType = 'enum'
          if (parameter.filter !== 'any') {
            enumType += '.' + parameter.filter
          }
          let text = get(enumType)
          if (type === 'enum-value') {
            text += `(${get('value')})`
          }
          elType.textContent = text
          elType.addClass('plugin-type')
          elWrap.appendChild(elType)
          break
        }
        case 'enum-group': {
          const elType = document.createElement('text')
          elType.textContent = get('enum.group')
          elType.addClass('plugin-type')
          elWrap.appendChild(elType)
          break
        }
        case 'element-id': {
          const elType = document.createElement('text')
          elType.textContent = `${get('element')}(${get('id')})`
          elType.addClass('plugin-type')
          elWrap.appendChild(elType)
          break
        }
        case 'file':
          // 如果设置了类型过滤
          if (parameter.filter) {
            const types = parameter.filter.split(' ')
            for (let i = 0; i < types.length; i++) {
              if (i !== 0) {
                const elSeparator = document.createElement('text')
                elSeparator.textContent = '|'
                elSeparator.addClass('plugin-label')
                elWrap.appendChild(elSeparator)
              }
              const elType = document.createElement('text')
              elType.textContent = get(`file.${types[i]}`)
              elType.addClass('plugin-type')
              elWrap.appendChild(elType)
            }
            break
          }
          // 否则跳转到默认分支
        default:
          const elType = document.createElement('text')
          elType.textContent = get(type)
          elType.addClass('plugin-type')
          elWrap.appendChild(elType)
          break
      }
      if (key in states) {
        const elCond = document.createElement('text')
        elCond.textContent = '?'
        elCond.addClass('plugin-label')
        elWrap.appendChild(elCond)
      }
      if (desc) {
        const elDesc = document.createElement('text')
        elDesc.textContent = langMap.get(desc)
        elDesc.addClass('plugin-param-desc')
        elWrap.appendChild(elDesc)
      }
    }
  }
  if (!elements.length) {
    elements.push(document.createTextNode('No Description'))
  }
  return elements
}

// 创建数据
PluginManager.createData = function (id) {
  return {
    id: id ?? '',
    enabled: true,
    parameters: {},
  }
}

// 获取ID匹配的数据
PluginManager.getItemById = Easing.getItemById

// 切换概述模式
PluginManager.switchOverviewMode = function () {
  if (this.meta) {
    this.detailed = !this.detailed
    this.loadOverview()
  }
}

// 解析插件元数据
PluginManager.parseMeta = function IIFE() {
  // 正则表达式[\s\S]等于[^]
  // 但是monaco中没有使用[^]
  const event = new Event('script-change')
  const selector = /\/\*\s*@plugin\s[\s\S]+?(?=\*\/)/
  const statement = /@([a-z\-[\]]+)([\s\S]*?)(?=\s@|$)/g
  const httpLink = /^https?:\/\/.+$/
  const option = /^(.+?)\{([\s\S]+?)\}$/
  const color = /^[0-9a-f]{8}$/
  const separator = /\s*,\s*/
  const spacing = /\s+/
  const strExp = /(?:'[^']*'|"[^"]")(?=\s*,?)/g
  const langName = /^([a-zA-Z\-]+)(?:\s+extends\s+([a-zA-Z\-]+))?/
  const langProp = /(#\S+)\s+([\s\S]+?)(?=\s+#|$)/g
  const parseInitialValue = () => {
    switch (type) {
      case 'boolean':
        return false
      case 'number[]':
      case 'string[]':
        return []
      case 'keycode':
        return ''
      case 'color':
        return 'ffffffff'
      case 'variable-getter':
      case 'variable-setter':
        return VariableGetter.createDefaultForPlugin()
      case 'actor-getter':
        return ActorGetter.createDefaultForPlugin()
      case 'skill-getter':
        return SkillGetter.createDefaultForPlugin()
      case 'state-getter':
        return StateGetter.createDefaultForPlugin()
      case 'equipment-getter':
        return EquipmentGetter.createDefaultForPlugin()
      case 'item-getter':
        return ItemGetter.createDefaultForPlugin()
      case 'element-getter':
        return ElementGetter.createDefaultForPlugin()
      case 'position-getter':
        return PositionGetter.createDefaultForPlugin()
      default:
        return ''
    }
  }
  const parseBoolean = string => {
    switch (string) {
      case 'true':
        return true
      case 'false':
        return false
      default:
        return null
    }
  }
  const parseNumber = string => {
    // 直接用isNaN很不靠谱
    // isNaN('') returns false
    const number = parseFloat(string)
    if (!isNaN(number)) {
      return number
    }
    return null
  }
  const parseString = string => {
    const last = string.length - 1
    const head = string[0]
    const foot = string[last]
    if (head === "'" && foot === "'" ||
      head === '"' && foot === '"') {
      return string.slice(1, last)
    }
    return null
  }
  const parseNumberList = () => {
    if (content[0] === '[' && content[content.length - 1] === ']') {
      const numbers = []
      const slices = content.slice(1, -1).split(separator)
      for (const slice of slices) {
        const number = parseNumber(slice)
        if (number !== null) {
          numbers.push(number)
        }
      }
      return numbers
    }
    return null
  }
  const parseStringList = () => {
    if (content[0] === '[' && content[content.length - 1] === ']') {
      const strings = []
      let match
      while (match = strExp.exec(content)) {
        const string = parseString(match[0])
        if (string !== null) {
          strings.push(string)
        }
      }
      return strings
    }
    return null
  }
  const parseColor = () => {
    if (color.test(content)) {
      return content
    }
    return null
  }
  const parseOption = () => {
    const match = option.exec(content)
    if (match) {
      const key = match[1].trim()
      const set = match[2].trim()
      const values = []
      const slices = set.split(separator)
      for (const slice of slices) {
        const value =
        parseString(slice) ??
        parseNumber(slice) ??
        parseBoolean(slice)
        if (value !== null) {
          values.append(value)
        }
      }
      if (values.length !== 0) {
        return {key, values}
      }
    }
    return null
  }
  const parseOptionAlias = () => {
    const match = option.exec(content)
    if (match) {
      const key = match[1].trim()
      const values = match[2].trim().split(separator)
      return {key, values}
    }
    return {
      key: content,
      values: [],
    }
  }
  const parseDefault = () => {
    switch (parameter.type) {
      case 'boolean':
        return parseBoolean(content)
      case 'number':
      case 'variable-number':
        return parseNumber(content)
      case 'string':
        return parseString(content)
      case 'option': {
        const value =
        parseString(content) ??
        parseNumber(content) ??
        parseBoolean(content)
        return parameter.options.includes(value) ? value : null
      }
      case 'number[]':
        return parseNumberList()
      case 'string[]':
        return parseStringList()
      case 'keycode':
        return parseString(content)
      case 'color':
        return parseColor()
      default:
        return null
    }
  }
  const setPlugin = () => {
    overview.plugin = content
  }
  const setAuthor = () => {
    overview.author = content
  }
  const setLink = () => {
    if (httpLink.test(content)) {
      overview.link = content
    }
  }
  const setVersion = () => {
    overview.version = content
  }
  const setParameter = () => {
    if (!paramMap[content]) {
      parameter = {
        key: content,
        type: type,
        value: parseInitialValue(),
      }
      parameters.push(parameter)
      paramMap[content] = parameter
    }
  }
  const setAttribute = () => {
    if (!paramMap[content]) {
      parameter = {
        key: content,
        type: type,
        value: '',
      }
      Object.defineProperties(parameter, {
        filter: {writable: true, value: 'any'},
      })
      parameters.push(parameter)
      paramMap[content] = parameter
    }
  }
  const setEnum = () => {
    if (!paramMap[content]) {
      parameter = {
        key: content,
        type: type,
        value: '',
      }
      Object.defineProperties(parameter, {
        filter: {writable: true, value: 'any'},
      })
      parameters.push(parameter)
      paramMap[content] = parameter
    }
  }
  const setNumber = () => {
    if (!paramMap[content]) {
      parameter = {
        key: content,
        type: type,
        value: 0,
      }
      Object.defineProperties(parameter, {
        min: {writable: true, value: -1000000000},
        max: {writable: true, value: +1000000000},
        decimals: {writable: true, value: 10},
      })
      parameters.push(parameter)
      paramMap[content] = parameter
    }
  }
  const setCond = () => {
    if (parameter === null) return
    const option = parseOption()
    if (option) {
      manager.append(option)
    }
  }
  const setOption = () => {
    const option = parseOption()
    if (option === null) return
    const {key, values} = option
    if (!paramMap[key]) {
      parameter = {
        key: key,
        type: type,
        value: values[0],
        options: values,
      }
      Object.defineProperty(parameter, 'dataItems', {
        configurable: true,
        value: values.map(value => {
          return {
            name: value.toString(),
            value: value,
          }
        })
      })
      parameters.push(parameter)
      paramMap[key] = parameter
    }
  }
  const setClamp = () => {
    switch (parameter?.type) {
      case 'number':
      case 'variable-number':
        break
      default:
        return
    }
    const slices = content.split(spacing)
    if (slices.length === 2) {
      for (let i = 0; i < 2; i++) {
        const number = parseNumber(slices[i])
        if (number === null) return
        slices[i] = number
      }
      const min = Math.max(-1000000000, Math.min(...slices))
      const max = Math.min(+1000000000, Math.max(...slices))
      parameter.value = Math.clamp(parameter.value, min, max)
      parameter.min = min
      parameter.max = max
    }
  }
  const setFile = () => {
    if (!paramMap[content]) {
      parameter = {
        key: content,
        type: type,
        value: '',
      }
      Object.defineProperties(parameter, {
        filter: {writable: true, value: ''},
      })
      parameters.push(parameter)
      paramMap[content] = parameter
    }
  }
  const fileFilters = {
    actor: true,
    skill: true,
    trigger: true,
    item: true,
    equipment: true,
    state: true,
    event: true,
    scene: true,
    tileset: true,
    ui: true,
    animation: true,
    particle: true,
    image: true,
    audio: true,
    video: true,
    script: true,
    font: true,
    other: true,
  }
  const attrFilters = {
    'actor': 1,
    'skill': 1,
    'state': 1,
    'item': 1,
    'equipment': 1,
    'element': 1
  }
  const enumFilters = {
    'shortcut-key': 1,
    'cooldown-key': 1,
    'equipment-slot': 1,
    'global-event': 1,
    'scene-event': 1,
    'actor-event': 1,
    'skill-event': 1,
    'state-event': 1,
    'equipment-event': 1,
    'item-event': 1,
    'region-event': 1,
    'light-event': 1,
    'animation-event': 1,
    'particle-event': 1,
    'parallax-event': 1,
    'tilemap-event': 1,
    'element-event': 1
  }
  const setFilter = () => {
    switch (parameter?.type) {
      case 'file': {
        const slices = content.split(spacing)
        let i = slices.length
        while (--i >= 0) {
          if (!fileFilters[slices[i]]) {
            slices.splice(i, 1)
          }
        }
        if (slices.length !== 0) {
          parameter.filter = slices.join(' ')
        }
        break
      }
      case 'attribute':
      case 'attribute-key':
        if (attrFilters[content]) {
          parameter.filter = content
        }
        break
      case 'enum':
      case 'enum-value':
        if (enumFilters[content]) {
          parameter.filter = content
        }
        break
    }
  }
  const setDecimals = () => {
    switch (parameter?.type) {
      case 'number':
      case 'variable-number':
        break
      default:
        return
    }
    const decimals = parseNumber(content)
    if (decimals !== null && decimals >= 0 && decimals <= 10) {
      parameter.decimals = decimals
    }
  }
  const setDefault = () => {
    if (parameter === null) return
    const value = parseDefault()
    if (value !== null) {
      parameter.value = value
    }
  }
  const setAlias = () => {
    if (parameter === null) return
    if (parameter.type === 'option') {
      const alias = parseOptionAlias()
      Object.defineProperty(parameter, 'alias', {
        configurable: true,
        value: alias.key,
      })
      const lang = langMap
      const names = alias.values
      const items = parameter.dataItems
      const length = Math.min(items.length, names.length)
      for (let i = 0; i < length; i++) {
        const name = names[i]
        if (name === '') {
          continue
        }
        if (name[0] === '#') {
          Object.defineProperty(items[i], 'name', {
            configurable: true,
            get: () => lang.get(name),
          })
        } else {
          items[i].name = name
        }
      }
    } else {
      Object.defineProperty(parameter, 'alias', {
        configurable: true,
        value: content,
      })
    }
  }
  const setDesc = () => {
    if (parameter === null) {
      overview.desc = content
      return
    }
    Object.defineProperty(parameter, 'desc', {
      configurable: true,
      value: content,
    })
  }
  const setLang = () => {
    const match = langName.exec(content)
    if (match) {
      langMap.append({
        name: match[1],
        base: match[2] ?? '',
        code: content,
      })
    }
  }

  // 选项管理器类
  class OptionManager extends Array {
    constructor() {
      super()
      this.wraps = {}
      this.states = {}
    }

    // 添加条件
    append({key, values}) {
      const {wraps, states} = this
      const pKey = parameter.key
      const owner = paramMap[key]
      if (owner === undefined ||
        owner === parameter ||
        owner.type !== 'option' ||
        states[pKey]) {
        return
      }
      let wrap = wraps[key]
      if (wrap === undefined) {
        wrap = new ConditionWrap(owner)
        wraps[key] = wrap
        this.push(wrap)
      }
      states[pKey] = true
      wrap.relate(values)
    }

    // 排序
    sort() {
      for (let {owner} of this) {
        let priority = 0
        while (owner = owner.parent) {
          const {wrap} = owner
          wrap.priority = Math.max(
            wrap.priority,
            ++priority,
          )
        }
      }
      return super.sort(OptionManager.sorter)
    }

    // 更新数据
    update(parameters) {
      const {states} = this
      for (const wrap of this) {
        wrap.switch(states, parameters)
      }
    }

    // 静态 - 排序器
    static sorter = (a, b) => b.priority - a.priority
  }

  // 条件包装类
  class ConditionWrap {
    constructor(owner) {
      this.owner = owner
      this.map = {}
      this.priority = 0
      Object.defineProperty(owner, 'wrap', {value: this})
    }

    // 设置关联属性
    relate(values) {
      const {owner} = this
      if (parameter.type === 'option') {
        let node = owner
        while (node = node.parent) {
          if (node === parameter) {
            return
          }
        }
        Object.defineProperty(parameter, 'parent', {value: owner})
      }
      const {map} = this
      const {key} = parameter
      const {options} = owner
      for (const value of values) {
        if (options.includes(value)) {
          map[value] === undefined
          ? map[value] = [key]
          : map[value].append(key)
        }
      }
    }

    // 切换选项
    switch(states, parameters) {
      let active
      const {owner, map} = this
      const {key, options} = owner
      if (states[key] !== false) {
        active = parameters[key]
        if (!options.includes(active)) {
          active = owner.value
        }
      }
      const actives = map[active] ?? Array.empty
      for (const option of options) {
        const keys = map[option]
        if (keys === undefined) continue
        for (const key of keys) {
          states[key] = actives.includes(key)
        }
      }
    }
  }

  // 语言映射表类
  class LanguageMap {
    constructor() {
      this.language = ''
      this.active = {}
      this.packs = []
    }

    // 更新语言
    update() {
      if (this.language !== Local.language) {
        this.language = Local.language
        const packs = this.packs
        let active = packs[0]
        let matchedWeight = 0
        const sKeys = Local.language.split('-')
        for (const pack of packs) {
          const dKeys = pack.name.split('-')
          if (sKeys[0] === dKeys[0]) {
            let weight = 0
            for (let sKey of sKeys) {
              if (dKeys.includes(sKey)) {
                weight++
              }
            }
            if (matchedWeight < weight) {
              matchedWeight = weight
              active = pack
            }
          }
        }
        if (active) {
          // 惰性解析语言包
          this.parse(active)
          this.active = active.map
        }
      }
      return this
    }

    // 解析映射表
    parse(pack) {
      const code = pack.code
      if (code !== undefined) {
        delete pack.code
        let match
        const base = pack.base
        const map = pack.map = {}
        while (match = langProp.exec(code)) {
          map[match[1]] = match[2]
        }
        if (!base) return
        for (const pack of this.packs) {
          if (pack.name === base) {
            this.parse(pack)
            // 避免循环继承报错
            try {Object.setPrototypeOf(map, pack.map)}
            catch (error) {}
          }
        }
      }
    }

    // 获取内容
    get(key) {
      if (key && key[0] === '#') {
        return this.active[key] ?? key
      }
      return key
    }

    // 添加映射表
    append(pack) {
      const {name} = pack
      const {packs} = this
      for (const pack of packs) {
        if (pack.name === name) {
          return
        }
      }
      packs.push(pack)
    }
  }

  // 元数据处理器映射表
  const processors = {
    'plugin': setPlugin,
    'author': setAuthor,
    'link': setLink,
    'version': setVersion,
    'boolean': setParameter,
    'number': setNumber,
    'variable-number': setNumber,
    'string': setParameter,
    'number[]': setParameter,
    'string[]': setParameter,
    'keycode': setParameter,
    'color': setParameter,
    'option': setOption,
    'easing': setParameter,
    'team': setParameter,
    'variable': setParameter,
    'attribute': setAttribute,
    'attribute-key': setAttribute,
    'attribute-group': setParameter,
    'enum': setEnum,
    'enum-value': setEnum,
    'enum-group': setParameter,
    'actor': setParameter,
    'region': setParameter,
    'light': setParameter,
    'animation': setParameter,
    'particle': setParameter,
    'parallax': setParameter,
    'tilemap': setParameter,
    'element': setParameter,
    'element-id': setParameter,
    'file': setFile,
    'filter': setFilter,
    'variable-getter': setParameter,
    'variable-setter': setParameter,
    'actor-getter': setParameter,
    'skill-getter': setParameter,
    'state-getter': setParameter,
    'equipment-getter': setParameter,
    'item-getter': setParameter,
    'element-getter': setParameter,
    'position-getter': setParameter,
    'clamp': setClamp,
    'decimals': setDecimals,
    'default': setDefault,
    'alias': setAlias,
    'desc': setDesc,
    'cond': setCond,
    'lang': setLang,
  }

  // 共享变量
  let overview = null
  let parameters = null
  let paramMap = null
  let langMap = null
  let manager = null
  let parameter = null
  let type = ''
  let content = ''

  // 返回函数
  return function (meta, code) {
    overview = {}
    parameters = []
    paramMap = {}
    langMap = new LanguageMap()
    manager = new OptionManager()
    let match = selector.exec(code)
    if (match) {
      const code = match[0]
      // 当元数据代码未改变时不用重新解析
      if (meta.overview?.code === code) {
        return
      }
      overview.code = code
      while (match = statement.exec(code)) {
        type = match[1]
        content = match[2].trim()
        // console.log(type, content)
        processors[type]?.()
      }
    }

    // 设置元数据
    const updating = !!meta.overview
    meta.parameters = parameters
    Data.manifest.changed = true
    Object.defineProperties(meta, {
      overview: {
        configurable: true,
        value: overview,
      },
      langMap: {
        configurable: true,
        value: langMap,
      },
      manager: {
        configurable: true,
        value: manager.sort(),
      },
    })

    // 重置共享变量
    overview = null
    parameters = null
    paramMap = null
    langMap = null
    manager = null
    parameter = null
    type = ''
    content = ''

    // 发送脚本改变事件
    if (updating) {
      event.changedMeta = meta
      window.dispatchEvent(event)
    }
  }
}()

// 重构插件属性
PluginManager.reconstruct = function IIFE() {
  const guidRegExp = /^[0-9a-f]{16}$/
  const colorRegExp = /^[0-9a-f]{8}$/
  const checkValue = (parameter, key, value) => {
    if (parameter.key !== key) {
      return false
    }
    const {type} = parameter
    switch (type) {
      case 'boolean':
      case 'string':
        return typeof value === type
      case 'number':
        if (typeof value === type) {
          const {min, max, decimals} = parameter
          return Math.clamp(Math.roundTo(value, decimals), min, max) === value
        }
      case 'variable-number':
        if (typeof value === 'number') {
          const {min, max, decimals} = parameter
          return Math.clamp(Math.roundTo(value, decimals), min, max) === value
        }
        return VariableGetter.checkDataForPlugin(value)
      case 'option':
        return parameter.options.includes(value)
      case 'easing':
        return !!Data.easings.map[value]
      case 'team':
        return !!Data.teams.map[value]
      case 'variable':
        return value === '' || !!Data.variables.map[value]
      case 'attribute':
      case 'attribute-key':
        if (value === '') return true
        if (parameter.filter === 'any') return !!Attribute.getAttribute(value)
        return !!Attribute.getGroupAttribute(parameter.filter, value)
      case 'attribute-group':
        return value === '' || !!Attribute.getGroup(value)
      case 'enum':
      case 'enum-value':
        if (value === '') return true
        if (parameter.filter === 'any') return !!Enum.getString(value)
        return !!Enum.getGroupString(parameter.filter, value)
      case 'enum-group':
        return value === '' || !!Enum.getGroup(value)
      case 'actor':
      case 'region':
      case 'light':
      case 'animation':
      case 'particle':
      case 'parallax':
      case 'tilemap':
      case 'element':
      case 'element-id':
        return typeof value === 'string'
      case 'file':
        return value === '' || guidRegExp.test(value)
      case 'variable-getter':
      case 'variable-setter':
        return VariableGetter.checkDataForPlugin(value)
      case 'actor-getter':
        return ActorGetter.checkDataForPlugin(value)
      case 'skill-getter':
        return SkillGetter.checkDataForPlugin(value)
      case 'state-getter':
        return StateGetter.checkDataForPlugin(value)
      case 'equipment-getter':
        return EquipmentGetter.checkDataForPlugin(value)
      case 'item-getter':
        return ItemGetter.checkDataForPlugin(value)
      case 'element-getter':
        return ElementGetter.checkDataForPlugin(value)
      case 'position-getter':
        return PositionGetter.checkDataForPlugin(value)
      case 'number[]':
      case 'string[]':
        if (value instanceof Array) {
          const t = type.slice(0, -2)
          for (const item of value) {
            if (typeof item !== t) {
              return false
            }
          }
          return true
        }
        return false
      case 'keycode':
        return typeof value === 'string'
      case 'color':
        return colorRegExp.test(value)
    }
  }
  const readValue = (parameter, value) => {
    const {type} = parameter
    switch (type) {
      case 'boolean':
      case 'string':
        if (typeof value === type) return value
        return parameter.value
      case 'number':
        if (typeof value === type) {
          const {min, max, decimals} = parameter
          return Math.clamp(Math.roundTo(value, decimals), min, max)
        }
        return parameter.value
      case 'variable-number':
        if (typeof value === 'number') {
          const {min, max, decimals} = parameter
          return Math.clamp(Math.roundTo(value, decimals), min, max)
        } else if (VariableGetter.checkDataForPlugin(value)) {
          return value
        }
        return parameter.value
      case 'option':
        if (parameter.options.includes(value)) return value
        return parameter.value
      case 'easing':
        if (Data.easings.map[value]) return value
        return Data.easings[0].id
      case 'team':
        if (Data.teams.map[value]) return value
        return Data.teams.list[0].id
      case 'variable':
        if (Data.variables.map[value]) return value
        return ''
      case 'attribute':
      case 'attribute-key':
        if (parameter.filter === 'any') {
          if (Attribute.getAttribute(value)) return value
        } else {
          if (Attribute.getGroupAttribute(parameter.filter, value)) return value
        }
        return ''
      case 'attribute-group':
        if (Attribute.getGroup(value)) return value
        return ''
      case 'enum':
      case 'enum-value':
        if (parameter.filter === 'any') {
          if (Enum.getString(value)) return value
        } else {
          if (Enum.getGroupString(parameter.filter, value)) return value
        }
        return ''
      case 'enum-group':
        if (Enum.getGroup(value)) return value
        return ''
      case 'actor':
      case 'region':
      case 'light':
      case 'animation':
      case 'particle':
      case 'parallax':
      case 'tilemap':
      case 'element':
      case 'element-id':
        if (typeof value === 'string') return value
        return ''
      case 'file':
        if (guidRegExp.test(value)) return value
        return ''
      case 'variable-getter':
      case 'variable-setter':
        if (VariableGetter.checkDataForPlugin(value)) return value
        return VariableGetter.createDefaultForPlugin()
      case 'actor-getter':
        if (ActorGetter.checkDataForPlugin(value)) return value
        return ActorGetter.createDefaultForPlugin()
      case 'skill-getter':
        if (SkillGetter.checkDataForPlugin(value)) return value
        return SkillGetter.createDefaultForPlugin()
      case 'state-getter':
        if (StateGetter.checkDataForPlugin(value)) return value
        return StateGetter.createDefaultForPlugin()
      case 'equipment-getter':
        if (EquipmentGetter.checkDataForPlugin(value)) return value
        return EquipmentGetter.createDefaultForPlugin()
      case 'item-getter':
        if (ItemGetter.checkDataForPlugin(value)) return value
        return ItemGetter.createDefaultForPlugin()
      case 'element-getter':
        if (ElementGetter.checkDataForPlugin(value)) return value
        return ElementGetter.createDefaultForPlugin()
      case 'position-getter':
        if (PositionGetter.checkDataForPlugin(value)) return value
        return PositionGetter.createDefaultForPlugin()
      case 'number[]':
      case 'string[]':
        if (value instanceof Array) check: {
          const t = type.slice(0, -2)
          for (const item of value) {
            if (typeof item !== t) {
              break check
            }
          }
          return value
        }
        return parameter.value
      case 'keycode':
        if (typeof value === 'string') return value
        return parameter.value
      case 'color':
        if (colorRegExp.test(value)) {
          return value
        }
        return parameter.value
    }
  }
  return function (script) {
    const {id, parameters} = script
    const oEntries = Object.entries(parameters)
    const meta = Data.manifest.guidMap[id]
    const mParameters = meta?.parameters
    // 未找到元数据参数时保留脚本参数
    if (mParameters === undefined) {
      return false
    }
    // 更新选项管理器
    meta.manager.update(parameters)
    // 检查脚本参数的有效性
    let reconstruct = false
    const length = mParameters.length
    if (length !== oEntries.length) {
      reconstruct = true
    } else {
      for (let i = 0; i < length; i++) {
        const oEntry = oEntries[i]
        const mParam = mParameters[i]
        if (!checkValue(mParam, ...oEntry)) {
          reconstruct = true
          break
        }
      }
    }
    // 重构脚本参数
    if (reconstruct) {
      const newParameters = {}
      for (const mParam of mParameters) {
        const key = mParam.key
        const arg = parameters[key]
        const value = readValue(mParam, arg)
        newParameters[key] = value
      }
      script.parameters = newParameters
      return true
    }
    return false
  }
}()

// 保存状态到项目文件
PluginManager.saveToProject = function (project) {
  const {plugin} = project
  plugin.detailed = this.detailed
}

// 从项目文件中加载状态
PluginManager.loadFromProject = function (project) {
  const {plugin} = project
  this.detailed = plugin.detailed
}

// 窗口 - 关闭事件
PluginManager.windowClose = function (event) {
  if (this.changed) {
    event.preventDefault()
    const get = Local.createGetter('confirmation')
    Window.confirm({
      message: get('closeUnsavedPlugins'),
    }, [{
      label: get('yes'),
      click: () => {
        this.changed = false
        Window.close('plugin')
      },
    }, {
      label: get('no'),
    }])
  }
}.bind(PluginManager)

// 窗口 - 已关闭事件
PluginManager.windowClosed = function (event) {
  this.list.saveSelection()
  this.data = null
  this.list.clear()
  window.off('keydown', this.keydown)
  window.off('pointerdown', this.pointerdown)
  window.off('script-change', this.scriptChange)
}.bind(PluginManager)

// 键盘按下事件
PluginManager.keydown = function (event) {
  if (event.cmdOrCtrlKey) {
    switch (event.code) {
      case 'KeyD':
        PluginManager.switchOverviewMode()
        break
    }
  }
}

// 指针按下事件
PluginManager.pointerdown = function (event) {
  // 阻止鼠标在窗口外部双击会选中概述内容的行为
  // 并且调用失去焦点方法避免阻止后失效
  if (event.target === document.documentElement) {
    event.preventDefault()
    document.activeElement.blur()
  }
}

// 脚本元数据改变事件
PluginManager.scriptChange = function (event) {
  if (PluginManager.meta === event.changedMeta) {
    PluginManager.loadOverview()
  }
}

// 列表 - 键盘按下事件
PluginManager.listKeydown = function (event) {
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
PluginManager.listSelect = function (event) {
  PluginManager.load(event.value)
}

// 列表 - 取消选择事件
PluginManager.listUnselect = function (event) {
  PluginManager.unload()
}

// 列表 - 改变事件
PluginManager.listChange = function (event) {
  PluginManager.changed = true
}

// 列表 - 菜单弹出事件
PluginManager.listPopup = function (event) {
  const item = event.value
  const selected = !!item
  const pastable = Clipboard.has('yami.data.plugin')
  const deletable = selected
  const get = Local.createGetter('menuPluginList')
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
PluginManager.listOpen = function (event) {
  this.edit(event.value)
}

// 概述 - 指针按下事件
PluginManager.overviewPointerdown = function IIFE() {
  const once = {once: true}
  const pointerup = event => {
    if (PluginManager.overview.contains(event.target)) {
      Menu.popup({
        x: event.clientX,
        y: event.clientY,
      }, [{
        label: Local.get('menuPluginOverview.detail'),
        accelerator: ctrl('D'),
        checked: PluginManager.detailed,
        click: () => {
          PluginManager.switchOverviewMode()
        },
      }])
    }
  }
  return function (event) {
    switch (event.button) {
      case 2:
        window.on('pointerup', pointerup, once)
        break
    }
  }
}()

// 参数面板 - 更新事件
PluginManager.parameterPaneUpdate = function (event) {
  if (this.wraps.length !== 0) {
    this.show()
  } else {
    this.hide()
  }
}

// 确定按钮 - 鼠标点击事件
PluginManager.confirm = function (event) {
  this.apply()
  Window.close('plugin')
}.bind(PluginManager)

// 应用按钮 - 鼠标点击事件
PluginManager.apply = function (event) {
  if (this.changed) {
    this.changed = false

    // 保存变量数据
    let plugins = this.data
    if (event instanceof Event) {
      plugins = Object.clone(plugins)
    } else {
      TreeList.deleteCaches(plugins)
    }
    Data.plugins = plugins
    File.planToSave(Data.manifest.project.plugins)
  }
}.bind(PluginManager)

// 列表 - 编辑
PluginManager.list.edit = function (item) {
  Selector.open({
    filter: 'script',
    read: () => item.id,
    input: id => {
      if (item.id !== id) {
        item.id = id
        item.parameters = {}
        PluginManager.changed = true
        PluginManager.parameterPane.update()
      }
      // 可能修改了文件名
      this.update()
    }
  }, false)
}

// 列表 - 插入
PluginManager.list.insert = function (dItem) {
  Selector.open({
    filter: 'script',
    read: () => '',
    input: id => {
      this.addNodeTo(PluginManager.createData(id), dItem)
    }
  }, false)
}

// 列表 - 开关
PluginManager.list.toggle = function (item) {
  if (item) {
    item.enabled = !item.enabled
    this.updateToggleStyle(item)
    PluginManager.changed = true
  }
}

// 列表 - 复制
PluginManager.list.copy = function (item) {
  if (item) {
    Clipboard.write('yami.data.plugin', item)
  }
}

// 列表 - 粘贴
PluginManager.list.paste = function (dItem) {
  const copy = Clipboard.read('yami.data.plugin')
  if (copy) {
    this.addNodeTo(copy, dItem)
  }
}

// 列表 - 删除
PluginManager.list.delete = function (item) {
  const get = Local.createGetter('confirmation')
  const name = Command.removeTextTags(Command.parseFileName(item.id))
  Window.confirm({
    message: get('deleteSingleFile').replace('<filename>', name),
  }, [{
    label: get('yes'),
    click: () => {
      const items = this.data
      const index = items.indexOf(item)
      this.deleteNode(item)
      const last = items.length - 1
      this.select(items[Math.min(index, last)])
    },
  }, {
    label: get('no'),
  }])
}

// 列表 - 保存选项状态
PluginManager.list.saveSelection = function () {
  const {plugins} = Data
  // 将数据保存在外部可以切换项目后重置
  if (plugins.selection === undefined) {
    Object.defineProperty(plugins, 'selection', {
      writable: true,
      value: '',
    })
  }
  const selection = this.read()
  if (selection) {
    plugins.selection = selection.id
  }
}

// 列表 - 恢复选项状态
PluginManager.list.restoreSelection = function () {
  const id = Data.plugins.selection
  const item = PluginManager.getItemById(id) ?? this.data[0]
  this.select(item)
  this.update()
  this.scrollToSelection()
}

// 列表 - 添加元素类名
PluginManager.list.addElementClass = function (item) {
  item.element.addClass('plugin-item')
}

// 列表 - 更新文本节点
PluginManager.list.updateTextNode = function (item) {
  const textNode = item.element.textNode
  const text = Command.removeTextTags(
    Command.parseFileName(item.id)
  )
  if (textNode.nodeValue !== text) {
    textNode.nodeValue = text
  }
}

// 列表 - 更新开关样式
PluginManager.list.updateToggleStyle = function (item) {
  return item.enabled
  ? item.element.removeClass('weak')
  : item.element.addClass('weak')
}

// 列表 - 创建编辑图标
PluginManager.list.createEditIcon = function (item) {
  const box = document.createElement('box')
  box.textContent = '\uf044'
  box.addClass('script-edit-button')
  box.addClass('plugin-item-button')
  item.element.appendChild(box)
}

// 参数面板 - 重写创建细节框方法
PluginManager.parameterPane.createDetailBox = function IIFE() {
  const box = $('#plugin-parameter-detail')
  const grid = $('#plugin-parameter-grid')
  const wrap = {box, grid, children: []}
  box.wrap = wrap
  return function () {
    return wrap
  }
}()

// 参数面板 - 重写清除内容方法
PluginManager.parameterPane.clear = function () {
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
  if (!this.scriptList.data) {
    window.off('script-change', this.scriptChange)
  }
}