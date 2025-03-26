'use strict'

// ******************************** 游戏本地化对象 ********************************

const GameLocal = {
  // properties
  active: '',
  language: '',
  refRegexp: /<ref:([0-9a-f]{16})>/g,
  langRemap: {
    'zh-HK': 'zh-TW',
    'zh-SG': 'zh-TW',
  },
  // methods
  initialize: null,
  setLanguage: null,
  getLanguage: null,
  get: null,
  replace: null,
  reloadLanguages: null,
  // events
  datachange: null,
}

// 初始化
GameLocal.initialize = function () {
  // 设置默认语言
  this.setLanguage(Data.config.localization.default)

  // 侦听事件
  window.on('datachange', this.datachange)
}

// 设置语言
GameLocal.setLanguage = async function (language) {
  if (this.language !== language || language === 'auto') {
    const languages = Data.config.localization.languages
    let active = language
    if (active === 'auto') {
      active = this.getLanguage()
    }
    let settings = languages.find(lang => lang.name === active)
    if (!settings) settings = languages[0] ?? {name: active, font: '', scale: 1}
    try {
      this.active = settings.name
      this.language = language
      window.dispatchEvent(new Event('localizationchange'))
      Printer.setLanguageFont(settings.font)
      Printer.setSizeScale(settings.scale)
      Printer.setWordWrap(['zh-CN', 'zh-TW', 'ja', 'ko'].includes(active) ? 'break' : 'keep')
    } catch (error) {
      Log.throw(error)
    }
  }
}

// 获取语言
GameLocal.getLanguage = function () {
  const languages = Data.config.localization.languages.map(lang => lang.name)
  let nLanguage = navigator.language
  // 重映射本地语言
  if (this.langRemap[nLanguage]) {
    nLanguage = this.langRemap[nLanguage]
  }
  let language = languages[0] ?? nLanguage
  let matchedWeight = 0
  const sKeys = nLanguage.split('-')
  for (const key of languages) {
    const dKeys = key.split('-')
    if (sKeys[0] === dKeys[0]) {
      let weight = 0
      for (let sKey of sKeys) {
        if (dKeys.includes(sKey)) {
          weight++
        }
      }
      if (matchedWeight < weight) {
        matchedWeight = weight
        language = key
      }
    }
  }
  return language
}

// 获取本地化文本
GameLocal.get = function (id) {
  const map = Data.localization.map
  return map[id]?.contents[this.active]
}

// 替换文本内容
GameLocal.replace = function (text) {
  return text.replace(this.refRegexp, (match, refId) => {
    const ref = this.get(refId)
    return ref !== undefined ? ref : match
  })
}

// 重新加载语言
GameLocal.reloadLanguages = function () {
  const languages = Data.config.localization.languages.map(lang => lang.name)
  const reload = items => {
    for (const item of items) {
      if (item.class === 'folder') {
        reload(item.children)
      } else {
        const contents = {}
        for (const language of languages) {
          contents[language] = item.contents[language] ?? ''
        }
        item.contents = contents
      }
    }
  }
  reload(Data.localization.list)
  File.planToSave(Data.manifest.project.localization)
}

// 数据改变事件
GameLocal.datachange = function (event) {
  if (event.key === 'config') {
    const last = event.last.localization
    const now = Data.config.localization
    const lastLanguages = last.languages.map(lang => lang.name)
    const nowLanguages = now.languages.map(lang => lang.name)
    if (JSON.stringify(lastLanguages) !== JSON.stringify(nowLanguages)) {
      GameLocal.reloadLanguages()
      // 如果是自动语言，随着语言列表的变化重新加载
      if (now.default === 'auto') {
        GameLocal.setLanguage(now.default)
        return
      }
    }
    // 默认语言改变时重新设置语言
    if (last.default !== now.default) {
      GameLocal.setLanguage(now.default)
      return
    }
    // 当前语言参数改变时更新所有文本打印机
    const selector = lang => lang.name === GameLocal.active
    const lastSettings = last.languages.find(selector)
    const nowSettings = now.languages.find(selector)
    if (JSON.stringify(lastSettings ?? '') !== JSON.stringify(nowSettings ?? '')) {
      Printer.setLanguageFont(nowSettings?.font ?? Printer.languageFont)
      Printer.setSizeScale(nowSettings?.scale ?? Printer.sizeScale)
    }
  }
}

// ******************************** 游戏本地化窗口 ********************************

const Localization = {
  // properties
  list: $('#localization-list'),
  panel: $('#localization-inspector').hide(),
  searcher: $('#localization-searcher'),
  inputs: null,
  target: null,
  data: null,
  idMap: null,
  languages: null,
  history: null,
  changed: false,
  // methods
  initialize: null,
  open: null,
  undo: null,
  redo: null,
  createId: null,
  register: null,
  unregister: null,
  getItemById: null,
  openContentPanel: null,
  closeContentPanel: null,
  unpackLocalization: null,
  packLocalization: null,
  resizeTextArea: null,
  // events
  windowClose: null,
  windowClosed: null,
  keydown: null,
  listKeydown: null,
  listPointerdown: null,
  listDoubleclick: null,
  listSelect: null,
  listRecord: null,
  listOpen: null,
  listPopup: null,
  panelInput: null,
  panelKeydown: null,
  searcherInput: null,
  confirm: null,
  apply: null,
}

// list methods
Localization.list.copy = null
Localization.list.paste = null
Localization.list.delete = null
Localization.list.saveScroll = null
Localization.list.restoreScroll = null
Localization.list.cancelSearch = null
Localization.list.createItem = null
Localization.list.createIcon = null
Localization.list.addElementClass = null
Localization.list.updateItemClass = null
Localization.list.updateItemName = null
Localization.list.createInitText = null
Localization.list.updateInitText = null
Localization.list.onCreate = null
Localization.list.onDelete = null
Localization.list.onResume = null

// 初始化
Localization.initialize = function () {
  // 绑定本地化列表
  const {list} = this
  list.removable = true
  list.renamable = true
  list.bind(() => this.data)
  list.creators.push(list.addElementClass)
  list.updaters.push(list.updateItemClass)
  list.creators.push(list.createInitText)
  list.creators.push(list.updateInitText)

  // 设置面板项目默认值
  this.panel.item = null

  // 设置列表搜索框按钮
  this.searcher.addCloseButton()

  // 设置历史操作处理器
  History.processors['localization-list-operation'] = (operation, data) => {
    const {response} = data
    list.restore(operation, response)
    if (list.read() === null &&
      this.panel.item !== null) {
      this.closeContentPanel()
    }
    this.changed = true
  }
  History.processors['localization-content-change'] = (operation, data) => {
    const {item, language, content} = data
    data.content = item.contents[language]
    item.contents[language] = content
    if (this.panel.item === item) {
      const textarea = this.inputs[language]
      textarea.write(content)
      this.resizeTextArea(textarea)
    } else {
      list.select(item)
      list.expandToSelection()
      list.scrollToSelection()
    }
    list.updateInitText(item)
    this.changed = true
  }

  // 侦听事件
  $('#localization').on('close', this.windowClose)
  $('#localization').on('closed', this.windowClosed)
  list.on('keydown', this.listKeydown)
  list.on('pointerdown', this.listPointerdown)
  list.on('pointerdown', Reference.getPointerdownListener(list), {capture: true})
  list.on('doubleclick', this.listDoubleclick, {capture: true})
  list.on('select', this.listSelect)
  list.on('record', this.listRecord)
  list.on('open', this.listOpen)
  list.on('popup', this.listPopup)
  this.panel.on('input', this.panelInput)
  this.panel.on('keydown', this.panelKeydown)
  this.searcher.on('input', this.searcherInput)
  this.searcher.on('compositionend', this.searcherInput)
  $('#localization-confirm').on('click', this.confirm)
  $('#localization-apply').on('click', this.apply)

  // 初始化子对象
  ExportLanguage.initialize()
  ImportLanguage.initialize()
}

// 创建输入框
Localization.createInputs = function () {
  const inputs = this.inputs = {}
  for (const language of this.languages) {
    const detailBox = new DetailBox()
    detailBox.setAttribute('open', '')
    const detailSummary = new DetailSummary()
    detailSummary.textContent = Local.get('languages.' + language)
    const textarea = new TextArea()
    textarea.language = language
    textarea.setAttribute('menu', 'tag-global tag-dynamic-global-var')
    textarea.addClass('localization-text-area')
    detailBox.appendChild(detailSummary)
    detailBox.appendChild(textarea)
    this.panel.appendChild(detailBox)
    inputs[language] = textarea
    Selection.addEventListeners(textarea)
  }
}

// 打开窗口
Localization.open = function (target = null) {
  this.target = target
  this.history = new History(100)
  this.unpackLocalization()
  this.createInputs()
  Window.open('localization')

  // 查询项目并更新列表
  const list = this.list
  const item = !target ? undefined
  : this.getItemById(target.read())
  if (item) {
    list.initialize()
    list.select(item)
    list.expandToSelection(false)
    list.update()
    list.restoreScroll()
    list.scrollToSelection('middle')
  } else {
    list.update()
    list.restoreScroll()
    // 打开本地化输入框时默认选择第一项
    if (target instanceof Object) {
      list.select(list.data[0])
    }
  }

  // 列表获得焦点
  list.getFocus()

  // 侦听事件
  window.on('keydown', this.keydown)
  window.on('keydown', Reference.getKeydownListener(list, 'localization'))
}

// 撤销操作
Localization.undo = function () {
  if (this.history.canUndo()) {
    this.history.restore('undo')
  }
}

// 重做操作
Localization.redo = function () {
  if (this.history.canRedo()) {
    this.history.restore('redo')
  }
}

// 创建ID
Localization.createId = function () {
  let id
  do {id = GUID.generate64bit()}
  while (this.idMap[id])
  return id
}

// 注册本地化
Localization.register = function (item) {
  if (item.class === 'folder') {
    for (const child of item.children) {
      Localization.register(child)
    }
  } else {
    Localization.idMap[item.id] = true
  }
}

// 取消注册本地化
Localization.unregister = function (item) {
  if (item.class === 'folder') {
    for (const child of item.children) {
      Localization.unregister(child)
    }
  } else {
    delete Localization.idMap[item.id]
  }
}

// 获取ID匹配的项目
Localization.getItemById = function IIFE() {
  const find = (items, id) => {
    const length = items.length
    for (let i = 0; i < length; i++) {
      const item = items[i]
      if (item.id === id) {
        return item
      }
      if (item.class === 'folder') {
        const result = find(item.children, id)
        if (result !== undefined) {
          return result
        }
      }
    }
    return undefined
  }
  return function (id) {
    return find(this.data, id)
  }
}()

// 打开内容面板
Localization.openContentPanel = function (item) {
  const panel = this.panel
  if (panel.item !== item) {
    panel.item = item
    panel.show()
    const {inputs} = this
    for (const language of this.languages) {
      const textarea = inputs[language]
      textarea.write(item.contents[language])
      this.resizeTextArea(textarea)
    }
  }
}

// 关闭内容面板
Localization.closeContentPanel = function () {
  const panel = this.panel
  if (panel.item) {
    panel.item = null
    panel.hide()
  }
}

// 解包本地化数据
Localization.unpackLocalization = function IIFE() {
  // 使用引用文件夹类来保存展开状态
  class ReferencedFolder {
    constructor(item) {
      this.data = item
      this.class = item.class
      this.name = item.name
      this.children = clone(item.children)
    }

    // 读取展开状态
    get expanded() {
      return this.data.expanded
    }

    // 写入展开状态
    set expanded(value) {
      this.data.expanded = value
      File.planToSave(Data.manifest.project.localization)
    }
  }
  const clone = items => {
    const length = items.length
    const copies = new Array(length)
    for (let i = 0; i < length; i++) {
      const item = items[i]
      if (item.class !== 'folder') {
        copies[i] = Object.clone(item)
        Localization.idMap[item.id] = true
      } else {
        copies[i] = new ReferencedFolder(item)
      }
    }
    return copies
  }
  return function () {
    this.idMap = {}
    this.data = clone(Data.localization.list)
    this.languages = Data.config.localization.languages.map(lang => lang.name)
  }
}()

// 打包本地化数据
Localization.packLocalization = function IIFE() {
  const clone = items => {
    const length = items.length
    const copies = new Array(length)
    for (let i = 0; i < length; i++) {
      const item = items[i]
      if (item.class !== 'folder') {
        copies[i] = Object.clone(item)
      } else {
        copies[i] = {
          class: item.class,
          name: item.name,
          expanded: item.expanded,
          children: clone(item.children),
        }
      }
    }
    return copies
  }
  return function () {
    Data.localization.list = clone(this.data)
    Data.createLocalizationMap()
  }
}()

// 面板 - 调整输入区域大小
Localization.resizeTextArea = function (textarea) {
  const shadowDOM = textarea.querySelector('textarea')
  textarea.style.height = '0'
  textarea.style.height = `${Math.clamp(shadowDOM.scrollHeight + 11, 40, 200)}px`
}

// 窗口 - 关闭事件
Localization.windowClose = function (event) {
  this.list.saveScroll()
  if (this.changed) {
    event.preventDefault()
    const get = Local.createGetter('confirmation')
    Window.confirm({
      message: get('closeUnsavedLocalization'),
    }, [{
      label: get('yes'),
      click: () => {
        this.changed = false
        Window.close('localization')
      },
    }, {
      label: get('no'),
    }])
  }
}.bind(Localization)

// 窗口 - 已关闭事件
Localization.windowClosed = function (event) {
  this.data = null
  this.idMap = null
  this.inputs = null
  this.history = null
  this.languages = null
  this.searcher.write('')
  this.list.clear()
  this.panel.clear()
  this.closeContentPanel()
  window.off('keydown', this.keydown)
  window.off('keydown', Reference.getKeydownListener(this.list))
}.bind(Localization)

// 键盘按下事件
Localization.keydown = function (event) {
  if (event.cmdOrCtrlKey) {
    switch (event.code) {
      case 'KeyZ':
        if (!event.macRedoKey) {
          return Localization.undo()
        }
      case 'KeyY':
        return Localization.redo()
    }
  }
}

// 列表 - 键盘按下事件
Localization.listKeydown = function (event) {
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
        this.addNodeTo(this.createItem(), item)
        break
      case 'Delete':
        this.delete(item)
        break
      case 'Backspace':
        this.cancelSearch()
        break
    }
  }
}

// 列表 - 指针按下事件
Localization.listPointerdown = function (event) {
  switch (event.button) {
    case 0:
      if (event.target === this) {
        this.unselect()
        Localization.closeContentPanel()
      }
      break
    case 3:
      this.cancelSearch()
      break
  }
}

// 列表 - 鼠标双击事件
Localization.listDoubleclick = function (event) {
  if (Localization.target &&
    Localization.list.read()?.id !== undefined) {
    Localization.target.getFocus?.()
    event.stopPropagation()
    event.preventDefault()
    Localization.confirm()
  }
}

// 列表 - 选择事件
Localization.listSelect = function (event) {
  const item = event.value
  return item.class !== 'folder'
  ? Localization.openContentPanel(item)
  : Localization.closeContentPanel()
}

// 列表 - 记录事件
Localization.listRecord = function (event) {
  Localization.changed = true
  Localization.history.save({
    type: 'localization-list-operation',
    response: event.value,
  })
}

// 列表 - 打开事件
Localization.listOpen = function (event) {
  Localization.listDoubleclick(event)
}

// 列表 - 菜单弹出事件
Localization.listPopup = function (event) {
  const item = event.value
  const selected = !!item
  const copyable = selected && item.class !== 'folder'
  const pastable = Clipboard.has('yami.data.localization')
  const undoable = Localization.history.canUndo()
  const redoable = Localization.history.canRedo()
  const get = Local.createGetter('menuLocalList')
  const items = [{
    label: get('create'),
    submenu: [{
      label: get('create.folder'),
      click: () => {
        this.addNodeTo(this.createFolder(), item)
      },
    }, {
      label: get('create.text'),
      accelerator: 'Insert',
      click: () => {
        this.addNodeTo(this.createItem(), item)
      },
    }],
  }, {
    label: get('copy'),
    accelerator: ctrl('C'),
    enabled: copyable,
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
    enabled: selected,
    click: () => {
      this.delete(item)
    },
  }, {
    label: get('rename'),
    accelerator: 'F2',
    enabled: selected,
    click: () => {
      this.rename(item)
    },
  }, {
    label: get('undo'),
    accelerator: ctrl('Z'),
    enabled: undoable,
    click: () => {
      Localization.undo()
    },
  }, {
    label: get('redo'),
    accelerator: ctrl('Y'),
    enabled: redoable,
    click: () => {
      Localization.redo()
    },
  }]
  if (copyable) {
    items.unshift({
      label: `ID: ${item.id}`,
      style: 'id',
      click: () => {
        navigator.clipboard.writeText(item.id)
      },
    })
    items.push({
      label: get('find-references'),
      accelerator: 'Alt+LB',
      click: () => {
        Reference.openRelated(item.id)
      },
    })
  }
  Menu.popup({
    x: event.clientX,
    y: event.clientY,
  }, items)
}

// 面板 - 输入事件
Localization.panelInput = function (event) {
  const element = event.target
  if (element.tagName === 'TEXTAREA') {
    const item = Localization.panel.item
    const textarea = element.parentNode
    const language = textarea.language
    const history = Localization.history
    const index = history.index
    const length = history.length
    const record = history[index]
    if (index !== length - 1 ||
      record === undefined ||
      record.item !== item ||
      record.language !== language) {
      Localization.history.save({
        type: 'localization-content-change',
        item: item,
        language: language,
        content: item.contents[language],
      })
    }
    item.contents[language] = textarea.read()
    Localization.resizeTextArea(textarea)
    Localization.list.updateInitText(item)
    Localization.changed = true
  }
}

// 面板 - 键盘按下事件
Localization.panelKeydown = function (event) {
  if (event.target.tagName === 'TEXTAREA' && event.cmdOrCtrlKey) {
    switch (event.code) {
      case 'Enter':
      case 'NumpadEnter':
        break
      default:
        event.stopPropagation()
        break
    }
  }
}

// 搜索框 - 输入事件
Localization.searcherInput = function (event) {
  if (event.inputType === 'insertCompositionText') {
    return
  }
  const text = this.input.value
  Localization.list.searchNodes(text)
}

// 确定按钮 - 鼠标点击事件
Localization.confirm = function (event) {
  if (this.target) {
    const item = this.list.read()
    if (item?.id === undefined) {
      return this.list.getFocus()
    }
    Selection.restoreContext()
    this.apply()
    this.target.input(item.id)
  } else {
    this.apply()
  }
  Window.close('localization')
}.bind(Localization)

// 应用按钮 - 鼠标点击事件
Localization.apply = function (event) {
  if (this.changed) {
    this.changed = false

    // 保存本地化数据
    this.packLocalization()
    File.planToSave(Data.manifest.project.localization)

    // 发送本地化改变事件
    window.dispatchEvent(new Event('localizationchange'))
  }
}.bind(Localization)

// 列表 - 复制
Localization.list.copy = function (item) {
  if (item?.class !== 'folder') {
    Clipboard.write('yami.data.localization', item)
  }
}

// 列表 - 粘贴
Localization.list.paste = function (dItem) {
  const copy = Clipboard.read('yami.data.localization')
  if (copy) {
    // 只有冲突时进行更换ID
    // 支持跨项目复制保留ID
    if (Localization.idMap[copy.id]) {
      copy.id = Localization.createId()
      copy.name += ' - Copy'
    }
    this.addNodeTo(copy, dItem)
  }
}

// 列表 - 删除
Localization.list.delete = function (item) {
  if (item) {
    const get = Local.createGetter('confirmation')
    Window.confirm({
      message: get('deleteSingleFile').replace('<filename>', item.name),
    }, [{
      label: get('yes'),
      click: () => {
        const elements = this.elements
        const index = elements.indexOf(item.element)
        this.deleteNode(item)
        Localization.closeContentPanel()
        // 自动选择下一个列表项
        const last = elements.count - 1
        const element = elements[Math.min(index, last)]
        if (element instanceof HTMLElement) {
          this.select(element.item)
        }
      },
    }, {
      label: get('no'),
    }])
  }
}

// 列表 - 保存滚动状态
Localization.list.saveScroll = function () {
  const {localization} = Data
  // 将数据保存在外部可以切换项目后重置
  if (localization.scrollTop === undefined) {
    Object.defineProperty(localization, 'scrollTop', {
      writable: true,
      value: 0,
    })
  }
  localization.scrollTop = this.scrollTop
}

// 列表 - 恢复滚动状态
Localization.list.restoreScroll = function () {
  this.scrollTop = Data.localization.scrollTop ?? 0
}

// 列表 - 取消搜索
Localization.list.cancelSearch = function () {
  if (this.display === 'search') {
    const active = document.activeElement
    Localization.searcher.deleteInputContent()
    this.expandToSelection()
    this.scrollToSelection()
    active.focus()
  }
}

// 列表 - 创建文件夹
Localization.list.createFolder = function () {
  return {
    class: 'folder',
    name: 'New Folder',
    expanded: false,
    children: [],
  }
}

// 列表 - 创建本地化项目
Localization.list.createItem = function () {
  const contents = {}
  for (const language of Localization.languages) {
    contents[language] = ''
  }
  return {
    id: Localization.createId(),
    name: '',
    contents: contents,
  }
}

// 列表 - 重写创建图标方法
Localization.list.createIcon = function (item) {
  const icon = document.createElement('node-icon')
  if (item.class !== 'folder') {
    icon.addClass('icon-string')
  } else {
    icon.addClass('icon-folder')
  }
  return icon
}

// 列表 - 添加元素类名
Localization.list.addElementClass = function (item) {
  item.element.addClass('localization-item')
}

// 列表 - 更新项目类名
Localization.list.updateItemClass = function (item) {
  if (item.class !== 'folder') {
    item.element.addClass('reference')
  } else {
    item.element.removeClass('reference')
  }
}

// 列表 - 重写更新项目名称方法
Localization.list.updateItemName = function (item) {
  TreeList.prototype.updateItemName.call(this, item)
  this.updateInitText(item)
}

// 列表 - 创建初始化文本
Localization.list.createInitText = function (item) {
  if (item.class !== 'folder') {
    const {element} = item
    const initText = document.createElement('text')
    initText.addClass('localization-init-text')
    element.appendChild(initText)
    element.initText = initText
    element.attrValue = ''
  }
}

// 列表 - 更新初始化文本
Localization.list.updateInitText = function (item) {
  const {element} = item
  if (element.initText !== undefined) {
    let value = ''
    for (const language of Localization.languages) {
      if (item.contents[language]) {
        value = item.contents[language]
        break
      }
    }
    if (item.name !== '') {
      if (value !== '') {
        value = ' = ' + value
      }
    } else {
      if (value === '') {
        value = 'Text'
      }
    }
    if (element.attrValue !== value) {
      element.attrValue = value
      element.initText.textContent = value
    }
  }
}

// 列表 - 在创建数据时回调
Localization.list.onCreate = function (item) {
  Localization.register(item)
}

// 列表 - 在删除数据时回调
Localization.list.onDelete = function (item) {
  Localization.unregister(item)
}

// 列表 - 在恢复数据时回调
Localization.list.onResume = function (item) {
  Localization.register(item)
}

// ******************************** 导出语言包窗口 ********************************

const ExportLanguage = {
  // methods
  initialize: null,
  open: null,
  exportLanguagePack: null,
  stringifyLanguagePack: null,
  // events
  confirm: null,
}

// 初始化
ExportLanguage.initialize = function () {
  // 侦听事件
  $('#exportLanguage-confirm').on('click', this.confirm)
}

// 打开窗口
ExportLanguage.open = function () {
  Window.open('exportLanguage')

  // 创建语言选项
  const items = []
  const none = {name: Local.get('common.none'), value: ''}
  for (const language of Data.config.localization.languages) {
    items.push({
      name: Local.get('languages.' + language.name),
      value: language.name,
    })
  }
  $('#exportLanguage-first').loadItems(items)
  $('#exportLanguage-first').writeDefault()
  $('#exportLanguage-second').loadItems([none, ...items])
  $('#exportLanguage-second').writeDefault()
}

// 导出语言包
ExportLanguage.exportLanguagePack = function (first, second) {
  const pack = {}
  // 加载文本到映射表
  const loadText = items => {
    for (const item of items) {
      if (item.class === 'folder') {
        loadText(item.children)
      } else {
        const {id, contents} = item
        pack[id] = contents[first] || contents[second] || ''
      }
    }
  }
  loadText(Data.localization.list)
  return this.stringifyLanguagePack(pack)
}

// 字符串化语言包
ExportLanguage.stringifyLanguagePack = function (map) {
  const entries = Object.entries(map)
  const length = entries.length
  const strings = new Array(length)
  for (let i = 0; i < length; i++) {
    const [id, text] = entries[i]
    strings[i] = '$' + id + '\n' + text
  }
  return strings.join('\n\n')
}

// 确定按钮 - 鼠标点击事件
ExportLanguage.confirm = function (event) {
  Window.close('exportLanguage')
  const dialogs = Editor.config.dialogs
  const first = $('#exportLanguage-first').read()
  const second = $('#exportLanguage-second').read()
  File.showSaveDialog({
    defaultPath: Path.resolve(dialogs.export, first + '.txt'),
  }).then(({filePath}) => {
    if (filePath) {
      dialogs.export = Path.slash(
        Path.dirname(filePath),
      )
      const string = ExportLanguage.exportLanguagePack(first, second)
      return FSP.writeFile(filePath, string)
    }
  })
}

// ******************************** 导入语言包窗口 ********************************

const ImportLanguage = {
  // properties
  filePath: '',
  // methods
  initialize: null,
  open: null,
  importLanguagePack: null,
  parseLanguagePack: null,
  // events
  confirm: null,
}

// 初始化
ImportLanguage.initialize = function () {
  // 侦听事件
  $('#importLanguage-confirm').on('click', this.confirm)
}

// 打开窗口
ImportLanguage.open = function () {
  const dialogs = Editor.config.dialogs
  File.showOpenDialog({
    defaultPath: Path.resolve(dialogs.import),
    filters: [{
      name: 'Language Pack',
      extensions: ['txt'],
    }],
  }).then(({filePaths}) => {
    if (filePaths.length === 1) {
      Window.open('importLanguage')
      // 创建语言选项
      const items = []
      for (const language of Data.config.localization.languages) {
        items.push({
          name: Local.get('languages.' + language.name),
          value: language.name,
        })
      }
      const filePath = this.filePath = filePaths[0]
      const basename = Path.basename(filePath)
      const extname = Path.extname(basename)
      const language = Path.basename(filePath, extname)
      $('#importLanguage-language').loadItems(items)
      $('#importLanguage-language').write2(language)
      $('#importLanguage-language').getFocus()
      dialogs.import = Path.slash(Path.dirname(filePath))
    }
  })
}

// 导出语言包
ImportLanguage.importLanguagePack = function (language, string) {
  const map = Data.localization.map
  for (const [id, text] of Object.entries(this.parseLanguagePack(string))) {
    const item = map[id]
    if (item?.contents[language] !== undefined) {
      item.contents[language] = text
    }
  }
  File.planToSave(Data.manifest.project.localization)
}

// 解析语言包
ImportLanguage.parseLanguagePack = function (string) {
  // 翻译后键名可能变成大写英文字母
  const regexp = /\$([0-9a-fA-F]{16})\n([\s\S]*?)\n?(?=\n?\$[0-9a-fA-F]{16}|$)/g
  const map = {}
  let match
  while (match = regexp.exec(string)) {
    const id = match[1].toLowerCase()
    const text = match[2]
    map[id] = text
  }
  return map
}

// 确定按钮 - 鼠标点击事件
ImportLanguage.confirm = function (event) {
  const get = Local.createGetter('confirmation')
  const filename = Path.basename(ImportLanguage.filePath)
  const language = $('#importLanguage-language').read()
  const langname = Local.get('languages.' + language)
  Window.confirm({
    message: get('importLanguagePack').replace('<filename>', filename).replace('<langname>', langname),
  }, [{
    label: get('confirm'),
    click: () => {
      Window.close('importLanguage')
      File.get({
        local: ImportLanguage.filePath,
        type: 'text',
      }).then(text => {
        if (text) {
          ImportLanguage.importLanguagePack(language, text)
        }
      })
    },
  }, {
    label: get('cancel'),
  }])
}