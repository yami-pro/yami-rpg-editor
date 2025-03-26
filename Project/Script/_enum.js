'use strict'

// ******************************** 枚举窗口 ********************************

const Enum = {
  // properties
  list: $('#enum-list'),
  panel: $('#enum-properties-flex').hide(),
  searcher: $('#enum-searcher'),
  inputs: {
    name: $('#enum-name'),
    value: $('#enum-value'),
    note: $('#enum-note'),
  },
  mode: null,
  target: null,
  data: null,
  idMap: null,
  settings: null,
  settingKeys: null,
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
  setFolderGroup: null,
  getGroup: null,
  getString: null,
  getGroupString: null,
  getDefStringId: null,
  getStringItems: null,
  getMergedItems: null,
  openPropertyPanel: null,
  closePropertyPanel: null,
  unpackEnumeration: null,
  packEnumeration: null,
  saveHistory: null,
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
  nameInput: null,
  valueInput: null,
  noteInput: null,
  panelKeydown: null,
  searcherInput: null,
  confirm: null,
  apply: null,
}

// list methods
Enum.list.copy = null
Enum.list.paste = null
Enum.list.delete = null
Enum.list.saveScroll = null
Enum.list.restoreScroll = null
Enum.list.cancelSearch = null
Enum.list.createString = null
Enum.list.createIcon = null
Enum.list.parseName = null
Enum.list.addElementClass = null
Enum.list.createGroupText = null
Enum.list.updateGroupText = null
Enum.list.createInitText = null
Enum.list.updateInitText = null
Enum.list.createNoteIcon = null
Enum.list.updateNoteIcon = null
Enum.list.onCreate = null
Enum.list.onDelete = null
Enum.list.onResume = null

// 初始化
Enum.initialize = function () {
  // 绑定枚举列表
  const {list} = this
  list.removable = true
  list.renamable = true
  list.bind(() => this.data)
  list.creators.push(list.addElementClass)
  list.creators.push(list.createGroupText)
  list.updaters.push(list.updateGroupText)
  list.creators.push(list.createInitText)
  list.creators.push(list.updateInitText)
  list.creators.push(list.createNoteIcon)
  list.creators.push(list.updateNoteIcon)

  // 设置面板字符串默认值
  this.panel.enumString = null

  // 设置列表搜索框按钮
  this.searcher.addCloseButton()

  // 设置历史操作处理器
  History.processors['enum-list-operation'] = (operation, data) => {
    const {response} = data
    list.restore(operation, response)
    if (list.read() === null &&
      this.panel.enumString !== null) {
      this.closePropertyPanel()
    }
    this.changed = true
  }
  History.processors['enum-settings-change'] = (operation, data) => {
    const {settings} = data
    data.settings = this.settings
    this.settings = settings
    list.update()
    this.changed = true
  }
  History.processors['enum-name-change'] = (operation, data) => {
    const {item, value} = data
    data.value = item.name
    item.name = value
    list.updateItemName(item)
    if (this.panel.enumString === item) {
      this.inputs.name.write(value)
    } else {
      list.select(item)
      list.expandToSelection()
      list.scrollToSelection()
    }
    this.changed = true
  }
  History.processors['enum-value-change'] = (operation, data) => {
    const {item, value} = data
    data.value = item.value
    item.value = value
    list.updateInitText(item)
    if (this.panel.enumString === item) {
      this.inputs.value.write(value)
    } else {
      list.select(item)
      list.expandToSelection()
      list.scrollToSelection()
    }
    this.changed = true
  }
  History.processors['enum-note-change'] = (operation, data) => {
    const {item, value} = data
    data.value = item.note
    item.note = value
    list.updateNoteIcon(item)
    if (this.panel.enumString === item) {
      this.inputs.note.write(value)
    } else {
      list.select(item)
      list.expandToSelection()
      list.scrollToSelection()
    }
    this.changed = true
  }

  // 侦听事件
  $('#enum').on('close', this.windowClose)
  $('#enum').on('closed', this.windowClosed)
  list.on('keydown', this.listKeydown)
  list.on('pointerdown', this.listPointerdown)
  list.on('pointerdown', Reference.getPointerdownListener(list), {capture: true})
  list.on('doubleclick', this.listDoubleclick, {capture: true})
  list.on('select', this.listSelect)
  list.on('record', this.listRecord)
  list.on('open', this.listOpen)
  list.on('popup', this.listPopup)
  this.inputs.name.on('input', this.nameInput)
  this.inputs.value.on('input', this.valueInput)
  this.inputs.note.on('input', this.noteInput)
  this.inputs.note.on('compositionend', this.noteInput)
  this.panel.on('keydown', this.panelKeydown)
  this.searcher.on('input', this.searcherInput)
  this.searcher.on('compositionend', this.searcherInput)
  $('#enum-confirm').on('click', this.confirm)
  $('#enum-apply').on('click', this.apply)
}

// 打开窗口
Enum.open = function (target = null, mode = 'normal') {
  this.mode = mode
  this.target = target
  this.history = new History(100)
  this.unpackEnumeration()
  Window.open('enum')

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
    // 打开枚举输入框时默认选择第一项
    if (target instanceof Object) {
      list.select(list.data[0])
    }
  }

  // 列表获得焦点
  list.getFocus()

  // 侦听事件
  window.on('keydown', this.keydown)
  window.on('keydown', Reference.getKeydownListener(list, 'enum'))
}

// 撤销操作
Enum.undo = function () {
  if (this.history.canUndo()) {
    this.history.restore('undo')
  }
}

// 重做操作
Enum.redo = function () {
  if (this.history.canRedo()) {
    this.history.restore('redo')
  }
}

// 创建ID
Enum.createId = function () {
  let id
  do {id = GUID.generate64bit()}
  while (this.idMap[id])
  return id
}

// 注册枚举
Enum.register = function (item) {
  Enum.idMap[item.id] = true
  if (item.class === 'folder') {
    for (const child of item.children) {
      Enum.register(child)
    }
  }
}

// 取消注册枚举
Enum.unregister = function (item) {
  delete Enum.idMap[item.id]
  if (item.class === 'folder') {
    for (const child of item.children) {
      Enum.unregister(child)
    }
  }
}

// 获取ID匹配的项目
Enum.getItemById = function IIFE() {
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

// 设置文件夹分组
Enum.setFolderGroup = function (folder, newGroup) {
  const oldGroup = folder.element.group
  if (oldGroup !== newGroup) {
    const settings = Object.clone(this.settings)
    if (oldGroup) this.settings[oldGroup] = ''
    if (newGroup) this.settings[newGroup] = folder.id
    this.history.save({
      type: 'enum-settings-change',
      settings: settings,
    })
    this.list.update()
    this.changed = true
  }
}

// 获取枚举群组
Enum.getGroup = function (groupKey) {
  return Data.enumeration.context.getGroup(groupKey)
}

// 获取字符串
Enum.getString = function (stringId) {
  return Data.enumeration.context.getString(stringId)
}

// 获取群组字符串
Enum.getGroupString = function (groupKey, stringId) {
  return Data.enumeration.context.getGroupString(groupKey, stringId)
}

// 获取默认字符串ID
Enum.getDefStringId = function (groupKey) {
  return Data.enumeration.context.getDefStringId(groupKey)
}

// 获取枚举字符串选项列表
Enum.getStringItems = function (groupKey, allowNone) {
  return Data.enumeration.context.getStringItems(groupKey, allowNone)
}

// 获取合并的选项列表
Enum.getMergedItems = function (headItems, groupKey, mergedKey) {
  return Data.enumeration.context.getMergedItems(headItems, groupKey, mergedKey)
}

// 打开字符串面板
Enum.openPropertyPanel = function (enumString) {
  const panel = this.panel
  if (panel.enumString !== enumString) {
    panel.enumString = enumString
    panel.show()
    const {inputs} = this
    inputs.name.write(enumString.name)
    inputs.value.write(enumString.value)
    inputs.note.write(enumString.note)
  }
}

// 关闭字符串面板
Enum.closePropertyPanel = function () {
  const panel = this.panel
  if (panel.enumString) {
    panel.enumString = null
    panel.hide()
  }
}

// 解包枚举数据
Enum.unpackEnumeration = function IIFE() {
  // 使用引用文件夹类来保存展开状态
  class ReferencedFolder {
    constructor(item) {
      this.data = item
      this.class = item.class
      this.id = item.id
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
      File.planToSave(Data.manifest.project.enumeration)
    }
  }
  const clone = items => {
    const length = items.length
    const copies = new Array(length)
    for (let i = 0; i < length; i++) {
      const item = items[i]
      Enum.idMap[item.id] = true
      if (item.class !== 'folder') {
        copies[i] = Object.clone(item)
      } else {
        copies[i] = new ReferencedFolder(item)
      }
    }
    return copies
  }
  return function () {
    this.idMap = {}
    this.data = clone(Data.enumeration.strings)
    this.settings = Object.clone(Data.enumeration.settings)
    // 创建特殊分组的键列表
    if (!this.settingKeys) {
      this.settingKeys = Object.keys(this.settings)
    }
  }
}()

// 打包枚举数据
Enum.packEnumeration = function IIFE() {
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
          id: item.id,
          name: item.name,
          expanded: item.expanded,
          children: clone(item.children),
        }
      }
    }
    return copies
  }
  return function () {
    Data.enumeration.strings = clone(this.data)
    Data.enumeration.settings = Object.clone(this.settings)
    Data.createEnumerationContext()
  }
}()

// 保存操作历史
Enum.saveHistory = function (item, key, value) {
  const type = `enum-${key}-change`
  const history = this.history
  const index = history.index
  const length = history.length
  const record = history[index]
  if (index !== length - 1 ||
    record === undefined ||
    record.type !== type ||
    record.item !== item) {
    history.save({
      type: type,
      item: item,
      value: value,
    })
  }
}

// 窗口 - 关闭事件
Enum.windowClose = function (event) {
  this.list.saveScroll()
  if (this.changed) {
    event.preventDefault()
    const get = Local.createGetter('confirmation')
    Window.confirm({
      message: get('closeUnsavedEnumeration'),
    }, [{
      label: get('yes'),
      click: () => {
        this.changed = false
        Window.close('enum')
      },
    }, {
      label: get('no'),
    }])
  }
}.bind(Enum)

// 窗口 - 已关闭事件
Enum.windowClosed = function (event) {
  this.data = null
  this.idMap = null
  this.settings = null
  this.history = null
  this.searcher.write('')
  this.list.clear()
  this.closePropertyPanel()
  window.off('keydown', this.keydown)
  window.off('keydown', Reference.getKeydownListener(this.list))
}.bind(Enum)

// 键盘按下事件
Enum.keydown = function (event) {
  if (event.cmdOrCtrlKey) {
    switch (event.code) {
      case 'KeyZ':
        if (!event.macRedoKey) {
          return Enum.undo()
        }
      case 'KeyY':
        return Enum.redo()
    }
  }
}

// 列表 - 键盘按下事件
Enum.listKeydown = function (event) {
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
        this.addNodeTo(this.createString(), item)
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
Enum.listPointerdown = function (event) {
  switch (event.button) {
    case 0:
      if (event.target === this) {
        this.unselect()
        Enum.closePropertyPanel()
      }
      break
    case 3:
      this.cancelSearch()
      break
  }
}

// 列表 - 鼠标双击事件
Enum.listDoubleclick = function (event) {
  switch (Enum.mode) {
    case 'group':
      if (Enum.list.read()?.class === 'folder') {
        Enum.target.getFocus?.()
        event.stopPropagation()
        Enum.confirm()
      }
      break
    case 'string':
      if (Enum.list.read()?.value !== undefined) {
        Enum.target.getFocus?.()
        event.stopPropagation()
        Enum.confirm()
      }
      break
  }
}

// 列表 - 选择事件
Enum.listSelect = function (event) {
  const item = event.value
  return item.class !== 'folder'
  ? Enum.openPropertyPanel(item)
  : Enum.closePropertyPanel()
}

// 列表 - 记录事件
Enum.listRecord = function (event) {
  Enum.changed = true
  const response = event.value
  switch (response.type) {
    case 'rename': {
      // 如果是字符串则执行操作否则进入默认分支
      const {item, oldValue, newValue} = response
      if (Enum.panel.enumString === item) {
        Enum.inputs.name.write(newValue)
        Enum.saveHistory(item, 'name', oldValue)
        break
      }
    }
    default:
      Enum.history.save({
        type: 'enum-list-operation',
        response: response,
      })
      break
  }
}

// 列表 - 打开事件
Enum.listOpen = function (event) {
  Enum.listDoubleclick(event)
}

// 列表 - 菜单弹出事件
Enum.listPopup = function (event) {
  const item = event.value
  const selected = !!item
  const copyable = selected && item.class !== 'folder'
  const pastable = Clipboard.has('yami.data.enumeration')
  const undoable = Enum.history.canUndo()
  const redoable = Enum.history.canRedo()
  const get = Local.createGetter('menuEnumList')
  const items = [{
    label: get('create'),
    submenu: [{
      label: get('create.folder'),
      click: () => {
        this.addNodeTo(this.createFolder(), item)
      },
    }, {
      label: get('create.string'),
      accelerator: 'Insert',
      click: () => {
        this.addNodeTo(this.createString(), item)
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
      Enum.undo()
    },
  }, {
    label: get('redo'),
    accelerator: ctrl('Y'),
    enabled: redoable,
    click: () => {
      Enum.redo()
    },
  }]
  if (selected) {
    items.unshift({
      label: `ID: ${item.id}`,
      style: 'id',
      click: () => {
        navigator.clipboard.writeText(item.id)
      },
    })
  }
  if (selected) {
    items.push({
      label: get('find-references'),
      accelerator: 'Alt+LB',
      click: () => {
        Reference.openRelated(item.id)
      },
    })
  }
  if (selected && item.class === 'folder') {
    const group = item.element.group
    const submenu = [{
      label: get('set-as.none'),
      checked: group === '',
      click: () => {
        Enum.setFolderGroup(item, '')
      },
    }]
    for (const groupKey of Enum.settingKeys) {
      submenu.push({
        label: get('set-as.' + groupKey),
        checked: group === groupKey,
        click: () => {
          Enum.setFolderGroup(item, groupKey)
        },
      })
    }
    items.push({
      label: get('set-as'),
      submenu: submenu,
    })
  }
  Menu.popup({
    x: event.clientX,
    y: event.clientY,
  }, items)
}

// 名字输入框 - 输入事件
Enum.nameInput = function (event) {
  const item = Enum.panel.enumString
  if (item.class !== 'folder') {
    Enum.saveHistory(item, 'name', item.name)
    item.name = event.target.value
    Enum.list.updateItemName(item)
    Enum.changed = true
  }
}

// 值输入框 - 输入事件
Enum.valueInput = function (event) {
  const item = Enum.panel.enumString
  if (item.class !== 'folder') {
    Enum.saveHistory(item, 'value', item.value)
    item.value = event.target.value
    Enum.list.updateInitText(item)
    Enum.changed = true
  }
}

// 备注输入框 - 输入事件
Enum.noteInput = function (event) {
  if (event.inputType !== 'insertCompositionText') {
    const item = Enum.panel.enumString
    Enum.saveHistory(item, 'note', item.note)
    item.note = this.read()
    Enum.list.updateNoteIcon(item)
    Enum.changed = true
  }
}

// 面板 - 键盘按下事件
Enum.panelKeydown = function (event) {
  switch (event.target.tagName) {
    case 'INPUT':
    case 'TEXTAREA':
      if (event.cmdOrCtrlKey) {
        switch (event.code) {
          case 'Enter':
          case 'NumpadEnter':
            break
          default:
            event.stopPropagation()
            break
        }
      }
      break
  }
}

// 搜索框 - 输入事件
Enum.searcherInput = function (event) {
  if (event.inputType === 'insertCompositionText') {
    return
  }
  const text = this.input.value
  Enum.list.searchNodes(text)
}

// 确定按钮 - 鼠标点击事件
Enum.confirm = function (event) {
  switch (this.mode) {
    case 'normal':
      this.apply()
      break
    case 'group': {
      const item = this.list.read()
      if (item && item.class !== 'folder') {
        return this.list.getFocus()
      }
      this.apply()
      this.target.input(item ? item.id : '')
      break
    }
    case 'string': {
      const item = this.list.read()
      if (item && item.class === 'folder') {
        return this.list.getFocus()
      }
      this.apply()
      this.target.input(item ? item.id : '')
      break
    }
  }
  Window.close('enum')
}.bind(Enum)

// 应用按钮 - 鼠标点击事件
Enum.apply = function (event) {
  if (this.changed) {
    this.changed = false

    // 保存枚举数据
    this.packEnumeration()
    File.planToSave(Data.manifest.project.enumeration)

    // 发送枚举改变事件
    window.dispatchEvent(new Event('enumchange'))
  }
}.bind(Enum)

// 列表 - 复制
Enum.list.copy = function (item) {
  if (item.class !== 'folder') {
    Clipboard.write('yami.data.enumeration', item)
  }
}

// 列表 - 粘贴
Enum.list.paste = function (dItem) {
  const copy = Clipboard.read('yami.data.enumeration')
  if (copy) {
    // 只有冲突时进行更换ID
    // 支持跨项目复制保留ID
    if (Enum.idMap[copy.id]) {
      copy.id = Enum.createId()
      copy.name += ' - Copy'
    }
    this.addNodeTo(copy, dItem)
  }
}

// 列表 - 删除
Enum.list.delete = function (item) {
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
        Enum.closePropertyPanel()
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
Enum.list.saveScroll = function () {
  const {enumeration} = Data
  // 将数据保存在外部可以切换项目后重置
  if (enumeration.scrollTop === undefined) {
    Object.defineProperty(enumeration, 'scrollTop', {
      writable: true,
      value: 0,
    })
  }
  enumeration.scrollTop = this.scrollTop
}

// 列表 - 恢复滚动状态
Enum.list.restoreScroll = function () {
  this.scrollTop = Data.enumeration.scrollTop ?? 0
}

// 列表 - 取消搜索
Enum.list.cancelSearch = function () {
  if (this.display === 'search') {
    const active = document.activeElement
    Enum.searcher.deleteInputContent()
    this.expandToSelection()
    this.scrollToSelection()
    active.focus()
  }
}

// 列表 - 创建文件夹
Enum.list.createFolder = function () {
  return {
    class: 'folder',
    id: Enum.createId(),
    name: 'New Folder',
    expanded: false,
    children: [],
  }
}

// 列表 - 创建枚举字符串
Enum.list.createString = function () {
  return {
    id: Enum.createId(),
    value: '',
    name: 'Item',
    note: '',
  }
}

// 列表 - 重写创建图标方法
Enum.list.createIcon = function (item) {
  const icon = document.createElement('node-icon')
  if (item.class !== 'folder') {
    icon.addClass('icon-string')
  } else {
    icon.addClass('icon-folder')
  }
  return icon
}

// 列表 - 重写解析名称方法
Enum.list.parseName = function (item) {
  return GameLocal.replace(item.name)
}

// 列表 - 添加元素类名
Enum.list.addElementClass = function (item) {
  item.element.addClass('enum-item')
  item.element.addClass('reference')
}

// 列表 - 创建分组文本
Enum.list.createGroupText = function (item) {
  if (item.class === 'folder') {
    const {element} = item
    const groupText = document.createElement('text')
    groupText.addClass('enum-init-text')
    element.appendChild(groupText)
    element.groupText = groupText
    element.group = ''
  }
}

// 列表 - 更新分组文本
Enum.list.updateGroupText = function (item) {
  const {element} = item
  if (element.groupText !== undefined) {
    let group = ''
    for (const key of Enum.settingKeys) {
      if (item.id === Enum.settings[key]) {
        group = key
      }
    }
    if (element.group !== group) {
      element.group = group
      element.groupText.textContent = group ? ' ★' : ''
    }
  }
}

// 列表 - 创建初始化文本
Enum.list.createInitText = function (item) {
  if (item.class !== 'folder') {
    const {element} = item
    const initText = document.createElement('text')
    initText.addClass('enum-init-text')
    element.appendChild(initText)
    element.initText = initText
    element.attrValue = ''
  }
}

// 列表 - 更新初始化文本
Enum.list.updateInitText = function (item) {
  const {element} = item
  if (element.initText !== undefined) {
    const value = GameLocal.replace(item.value)
    if (element.attrValue !== value) {
      element.attrValue = value
      element.initText.textContent = value ? ` = ${value}` : ''
    }
  }
}

// 列表 - 创建笔记图标
Enum.list.createNoteIcon = function (item) {
  if (item.class !== 'folder') {
    const {element} = item
    const noteIcon = document.createElement('node-icon')
    noteIcon.addClass('icon-note')
    noteIcon.textContent = '\uf27b'
    element.appendChild(noteIcon)
    element.noteIcon = noteIcon
    element.annotated = null
  }
}

// 列表 - 更新笔记图标
Enum.list.updateNoteIcon = function (item) {
  const {element} = item
  if (element.noteIcon !== undefined) {
    const annotated = item.note !== ''
    if (element.annotated !== annotated) {
      element.annotated = annotated
      annotated
      ? element.noteIcon.show()
      : element.noteIcon.hide()
    }
  }
}

// 列表 - 在创建数据时回调
Enum.list.onCreate = function (item) {
  Enum.register(item)
}

// 列表 - 在删除数据时回调
Enum.list.onDelete = function (item) {
  Enum.unregister(item)
}

// 列表 - 在恢复数据时回调
Enum.list.onResume = function (item) {
  Enum.register(item)
}

// ******************************** 枚举上下文类 ********************************

class EnumerationContext {
  itemMap   //:object
  groupMap  //:object
  itemCache //:object
  itemLists //:object

  constructor(enumeration) {
    const itemMap = {}
    const groupMap = {}

    // 加载数据
    const load = (groupKeys, items) => {
      for (const item of items) {
        const itemKey = item.id
        itemMap[itemKey] = item
        if (item.class === 'folder') {
          groupMap[itemKey] = {
            groupName: item.name,
            itemMap: {},
            itemList: [],
          }
          groupKeys.push(itemKey)
          load(groupKeys, item.children)
          groupKeys.pop()
          continue
        }
        for (let i = 0; i < groupKeys.length; i++) {
          const group = groupMap[groupKeys[i]]
          group.itemMap[itemKey] = item
          group.itemList.push(item)
        }
      }
    }
    load([], enumeration.strings)

    // 移除无效的分组设置
    const settings = enumeration.settings
    for (const [key, groupId] of Object.entries(settings)) {
      if (groupId in groupMap) {
        groupMap[key] = groupMap[groupId]
      } else {
        if (groupId !== '') {
          settings[key] = ''
        }
        groupMap[key] = {
          groupName: '',
          itemMap: Object.empty,
          itemList: Array.empty,
        }
      }
    }
    this.itemMap = itemMap
    this.groupMap = groupMap
    this.itemCache = {}
    this.itemLists = {}
  }

  // 获取枚举群组
  getGroup(groupKey) {
    return this.groupMap[groupKey]
  }

  // 获取枚举字符串对象
  getString(stringId) {
    return this.itemMap[stringId]
  }

  // 获取群组枚举字符串对象
  getGroupString(groupKey, stringId) {
    return this.groupMap[groupKey]?.itemMap[stringId]
  }

  // 获取默认枚举字符串ID
  getDefStringId(groupKey) {
    return this.groupMap[groupKey]?.itemList[0]?.id ?? ''
  }

  // 获取枚举字符串选项列表
  getStringItems(groupKey, allowNone = false) {
    let key = groupKey
    if (allowNone) {
      key += '-allowNone'
    }
    if (!this.itemLists[key]) {
      // 获取分组的全部选项
      const items = []
      const group = this.groupMap[groupKey]
      if (group) {
        const itemCache = this.itemCache
        for (const string of group.itemList) {
          let item = itemCache[string.id]
          if (item === undefined) {
            item = itemCache[string.id] = {
              name: GameLocal.replace(string.name),
              value: string.id,
            }
          }
          items.push(item)
        }
      }
      if (allowNone) {
        items.unshift({
          name: Local.get('common.none'),
          value: '',
        })
      }
      if (items.length === 0) {
        items.push({
          name: Local.get('common.none'),
          value: '',
        })
      }
      this.itemLists[key] = items
    }
    return this.itemLists[key]
  }

  // 获取合并的选项列表
  getMergedItems(headItems, groupKey, mergedKey = 'merged') {
    const key = `${groupKey}-${mergedKey}`
    if (!this.itemLists[key]) {
      // 获取分组的全部选项
      const items = [...headItems]
      const group = this.groupMap[groupKey]
      if (group) {
        const itemCache = this.itemCache
        for (const string of group.itemList) {
          let item = itemCache[string.id]
          if (item === undefined) {
            item = itemCache[string.id] = {
              name: GameLocal.replace(string.name),
              value: string.id,
            }
          }
          items.push(item)
        }
      }
      this.itemLists[key] = items
    }
    return this.itemLists[key]
  }
}