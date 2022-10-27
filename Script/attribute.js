'use strict'

// ******************************** 属性窗口 ********************************

const Attribute = {
  // properties
  list: $('#attribute-list'),
  panel: $('#attribute-properties-flex').hide(),
  searcher: $('#attribute-searcher'),
  inputs: {
    name: $('#attribute-name'),
    key: $('#attribute-key'),
    type: $('#attribute-type'),
    note: $('#attribute-note'),
    enum: $('#attribute-enum'),
    enumBox: $('#attribute-enum-box'),
  },
  data: null,
  idList: null,
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
  setFolderGroup: null,
  getGroupAttribute: null,
  getDefAttributeId: null,
  getAttributeItems: null,
  openPropertyPanel: null,
  closePropertyPanel: null,
  unpackAttribute: null,
  packAttribute: null,
  saveHistory: null,
  // events
  windowClose: null,
  windowClosed: null,
  keydown: null,
  listKeydown: null,
  listPointerdown: null,
  listSelect: null,
  listRecord: null,
  listPopup: null,
  nameInput: null,
  keyInput: null,
  typeWrite: null,
  typeInput: null,
  enumInput: null,
  noteInput: null,
  panelKeydown: null,
  searcherInput: null,
  confirm: null,
  apply: null,
}

// list methods
Attribute.list.copy = null
Attribute.list.paste = null
Attribute.list.delete = null
Attribute.list.saveScroll = null
Attribute.list.restoreScroll = null
Attribute.list.cancelSearch = null
Attribute.list.createAttribute = null
Attribute.list.createIcon = null
Attribute.list.updateIcon = null
Attribute.list.addElementClass = null
Attribute.list.createGroupText = null
Attribute.list.updateGroupText = null
Attribute.list.createInitText = null
Attribute.list.updateInitText = null
Attribute.list.createNoteIcon = null
Attribute.list.updateNoteIcon = null

// 初始化
Attribute.initialize = function () {
  // 绑定属性列表
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

  // 设置面板属性默认值
  this.panel.attribute = null

  // 设置列表搜索框按钮
  this.searcher.addCloseButton()

  // 设置历史操作处理器
  History.processors['attribute-list-operation'] = (operation, data) => {
    const {response} = data
    list.restore(operation, response)
    if (list.read() === null &&
      this.panel.attribute !== null) {
      this.closePropertyPanel()
    }
    this.changed = true
  }
  History.processors['attribute-settings-change'] = (operation, data) => {
    const {settings} = data
    data.settings = this.settings
    this.settings = settings
    list.update()
    this.changed = true
  }
  History.processors['attribute-name-change'] = (operation, data) => {
    const {item, value} = data
    data.value = item.name
    item.name = value
    list.updateItemName(item)
    if (this.panel.attribute === item) {
      this.inputs.name.write(value)
    } else {
      list.select(item)
      list.expandToSelection()
      list.scrollToSelection()
    }
    this.changed = true
  }
  History.processors['attribute-key-change'] = (operation, data) => {
    const {item, value} = data
    data.value = item.key
    item.key = value
    list.updateInitText(item)
    if (this.panel.attribute === item) {
      this.inputs.key.write(value)
    } else {
      list.select(item)
      list.expandToSelection()
      list.scrollToSelection()
    }
    this.changed = true
  }
  History.processors['attribute-type-change'] = (operation, data) => {
    const {item, value} = data
    data.value = item.type
    item.type = value
    list.updateIcon(item)
    if (this.panel.attribute === item) {
      this.inputs.type.write(value)
    } else {
      list.select(item)
      list.expandToSelection()
      list.scrollToSelection()
    }
    this.changed = true
  }
  History.processors['attribute-enum-change'] = (operation, data) => {
    const {item, value} = data
    data.value = item.enum
    item.enum = value
    if (this.panel.attribute === item) {
      this.inputs.enum.write(value)
    } else {
      list.select(item)
      list.expandToSelection()
      list.scrollToSelection()
    }
    this.changed = true
  }
  History.processors['attribute-note-change'] = (operation, data) => {
    const {item, value} = data
    data.value = item.note
    item.note = value
    list.updateNoteIcon(item)
    if (this.panel.attribute === item) {
      this.inputs.note.write(value)
    } else {
      list.select(item)
      list.expandToSelection()
      list.scrollToSelection()
    }
    this.changed = true
  }

  // 侦听事件
  $('#attribute').on('close', this.windowClose)
  $('#attribute').on('closed', this.windowClosed)
  list.on('keydown', this.listKeydown)
  list.on('pointerdown', this.listPointerdown)
  list.on('select', this.listSelect)
  list.on('record', this.listRecord)
  list.on('popup', this.listPopup)
  this.inputs.name.on('input', this.nameInput)
  this.inputs.key.on('input', this.keyInput)
  this.inputs.type.on('write', this.typeWrite)
  this.inputs.type.on('input', this.typeInput)
  this.inputs.enum.on('input', this.enumInput)
  this.inputs.note.on('input', this.noteInput)
  this.inputs.note.on('compositionend', this.noteInput)
  this.panel.on('keydown', this.panelKeydown)
  this.searcher.on('input', this.searcherInput)
  this.searcher.on('compositionend', this.searcherInput)
  $('#attribute-confirm').on('click', this.confirm)
  $('#attribute-apply').on('click', this.apply)
}

// 打开窗口
Attribute.open = function () {
  this.history = new History(100)
  this.unpackAttribute()
  Window.open('attribute')

  // 更新列表
  this.list.update()
  this.list.restoreScroll()

  // 列表获得焦点
  this.list.getFocus()

  // 侦听事件
  window.on('keydown', this.keydown)
}

// 撤销操作
Attribute.undo = function () {
  if (this.history.canUndo()) {
    this.history.restore('undo')
  }
}

// 重做操作
Attribute.redo = function () {
  if (this.history.canRedo()) {
    this.history.restore('redo')
  }
}

// 创建ID
Attribute.createId = function () {
  let id
  do {id = GUID.generate64bit()}
  while (this.idList.includes(id))
  this.idList.push(id)
  return id
}

// 设置文件夹分组
Attribute.setFolderGroup = function (folder, newGroup) {
  const oldGroup = folder.element.group
  if (oldGroup !== newGroup) {
    const settings = Object.clone(this.settings)
    if (oldGroup) this.settings[oldGroup] = ''
    if (newGroup) this.settings[newGroup] = folder.id
    this.history.save({
      type: 'attribute-settings-change',
      settings: settings,
    })
    this.list.update()
    this.changed = true
  }
}

// 获取群组属性
Attribute.getGroupAttribute = function (groupKey, attrId) {
  return Data.attribute.context.getGroupAttribute(groupKey, attrId)
}

// 获取默认属性ID
Attribute.getDefAttributeId = function (groupKey) {
  return Data.attribute.context.getDefAttributeId(groupKey)
}

// 获取属性选项列表
Attribute.getAttributeItems = function (groupKey, attrType) {
  return Data.attribute.context.getAttributeItems(groupKey, attrType)
}

// 打开属性面板
Attribute.openPropertyPanel = function (attribute) {
  const panel = this.panel
  if (panel.attribute !== attribute) {
    panel.attribute = attribute
    panel.show()
    const {inputs} = this
    inputs.name.write(attribute.name)
    inputs.key.write(attribute.key)
    inputs.type.write(attribute.type)
    inputs.enum.write(attribute.enum)
    inputs.note.write(attribute.note)
  }
}

// 关闭属性面板
Attribute.closePropertyPanel = function () {
  const panel = this.panel
  if (panel.attribute) {
    panel.attribute = null
    panel.hide()
  }
}

// 解包属性数据
Attribute.unpackAttribute = function IIFE() {
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
      File.planToSave(Data.manifest.project.attribute)
    }
  }
  const clone = items => {
    const length = items.length
    const copies = new Array(length)
    for (let i = 0; i < length; i++) {
      const item = items[i]
      Attribute.idList.push(item.id)
      if (item.class !== 'folder') {
        copies[i] = Object.clone(item)
      } else {
        copies[i] = new ReferencedFolder(item)
      }
    }
    return copies
  }
  return function () {
    this.idList = []
    this.data = clone(Data.attribute.keys)
    this.settings = Object.clone(Data.attribute.settings)
    // 创建特殊分组的键列表
    if (!this.settingKeys) {
      this.settingKeys = Object.keys(this.settings)
    }
  }
}()

// 打包属性数据
Attribute.packAttribute = function IIFE() {
  const clone = items => {
    const length = items.length
    const copies = new Array(length)
    for (let i = 0; i < length; i++) {
      const item = items[i]
      if (item.class !== 'folder') {
        const copy = Object.clone(item)
        // 删除无效的枚举ID
        if (copy.enum !== '' &&
          copy.type !== 'enum') {
          copy.enum = ''
        }
        copies[i] = copy
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
    Data.attribute.keys = clone(this.data)
    Data.attribute.settings = Object.clone(this.settings)
    Data.createAttributeContext()
  }
}()

// 保存操作历史
Attribute.saveHistory = function (item, key, value) {
  const type = `attribute-${key}-change`
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
Attribute.windowClose = function (event) {
  this.list.saveScroll()
  if (this.changed) {
    event.preventDefault()
    const get = Local.createGetter('confirmation')
    Window.confirm({
      message: get('closeUnsavedAttributes'),
    }, [{
      label: get('yes'),
      click: () => {
        this.changed = false
        Window.close('attribute')
      },
    }, {
      label: get('no'),
    }])
  }
}.bind(Attribute)

// 窗口 - 已关闭事件
Attribute.windowClosed = function (event) {
  this.data = null
  this.idList = null
  this.history = null
  this.searcher.write('')
  this.list.clear()
  this.closePropertyPanel()
  window.off('keydown', this.keydown)
}.bind(Attribute)

// 键盘按下事件
Attribute.keydown = function (event) {
  if (event.cmdOrCtrlKey) {
    switch (event.code) {
      case 'KeyZ':
        return Attribute.undo()
      case 'KeyY':
        return Attribute.redo()
    }
  }
}

// 列表 - 键盘按下事件
Attribute.listKeydown = function (event) {
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
        if (item) {
          this.addNodeTo(this.createAttribute(), item)
        }
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
Attribute.listPointerdown = function (event) {
  switch (event.button) {
    case 3:
      this.cancelSearch()
      break
  }
}

// 列表 - 选择事件
Attribute.listSelect = function (event) {
  const item = event.value
  return item.class !== 'folder'
  ? Attribute.openPropertyPanel(item)
  : Attribute.closePropertyPanel()
}

// 列表 - 记录事件
Attribute.listRecord = function (event) {
  Attribute.changed = true
  const response = event.value
  switch (response.type) {
    case 'rename': {
      // 如果是属性则执行操作否则进入默认分支
      const {item, oldValue, newValue} = response
      if (Attribute.panel.attribute === item) {
        Attribute.inputs.name.write(newValue)
        Attribute.saveHistory(item, 'name', oldValue)
        break
      }
    }
    default:
      Attribute.history.save({
        type: 'attribute-list-operation',
        response: response,
      })
      break
  }
}

// 列表 - 菜单弹出事件
Attribute.listPopup = function (event) {
  const item = event.value
  const selected = !!item
  const copyable = selected && item.class !== 'folder'
  const pastable = Clipboard.has('yami.data.attribute')
  const undoable = Attribute.history.canUndo()
  const redoable = Attribute.history.canRedo()
  const get = Local.createGetter('menuAttributeList')
  let headItems = Array.empty
  let footItems = Array.empty
  if (selected) {
    headItems = [{
      label: `ID: ${item.id}`,
      style: 'id',
      click: () => {
        navigator.clipboard.writeText(item.id)
      },
    }]
  }
  if (selected && item.class === 'folder') {
    const group = item.element.group
    const submenu = [{
      label: get('set-as.none'),
      checked: group === '',
      click: () => {
        Attribute.setFolderGroup(item, '')
      },
    }]
    for (const groupKey of Attribute.settingKeys) {
      submenu.push({
        label: get('set-as.' + groupKey),
        checked: group === groupKey,
        click: () => {
          Attribute.setFolderGroup(item, groupKey)
        },
      })
    }
    footItems = [{
      label: get('set-as'),
      submenu: submenu,
    }]
  }
  Menu.popup({
    x: event.clientX,
    y: event.clientY,
  }, [...headItems, {
    label: get('create'),
    submenu: [{
      label: get('create.folder'),
      click: () => {
        this.addNodeTo(this.createFolder(), item)
      },
    }, {
      label: get('create.attribute'),
      accelerator: 'Insert',
      click: () => {
        this.addNodeTo(this.createAttribute(), item)
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
      Attribute.undo()
    },
  }, {
    label: get('redo'),
    accelerator: ctrl('Y'),
    enabled: redoable,
    click: () => {
      Attribute.redo()
    },
  }, ...footItems])
}

// 名字输入框 - 输入事件
Attribute.nameInput = function (event) {
  const item = Attribute.panel.attribute
  if (item.class !== 'folder') {
    Attribute.saveHistory(item, 'name', item.name)
    item.name = event.target.value
    Attribute.list.updateItemName(item)
    Attribute.changed = true
  }
}

// 键输入框 - 输入事件
Attribute.keyInput = function (event) {
  const item = Attribute.panel.attribute
  if (item.class !== 'folder') {
    Attribute.saveHistory(item, 'key', item.key)
    item.key = event.target.value
    Attribute.list.updateInitText(item)
    Attribute.changed = true
  }
}

// 类型输入框 - 写入事件
Attribute.typeWrite = function (event) {
  const {style} = Attribute.inputs.enumBox
  switch (event.value) {
    case 'enum':
      style.visibility = 'visible'
      break
    case 'boolean':
    case 'number':
    case 'string':
      style.visibility = 'hidden'
      break
  }
}

// 类型输入框 - 输入事件
Attribute.typeInput = function (event) {
  // const read = getElementReader('attribute-value')
  const item = Attribute.panel.attribute
  Attribute.saveHistory(item, 'type', item.type)
  item.type = event.value
  // switch (type) {
  //   case 'boolean':
  //   case 'number':
  //   case 'string':
  //     item.value = read(type)
  //     break
  //   case 'object':
  //     item.value = null
  //     break
  // }
  Attribute.list.updateIcon(item)
  Attribute.changed = true
}

// 枚举输入框 - 输入事件
Attribute.enumInput = function (event) {
  const item = Attribute.panel.attribute
  Attribute.saveHistory(item, 'enum', item.enum)
  item.enum = event.value
  Attribute.changed = true
}

// 备注输入框 - 输入事件
Attribute.noteInput = function (event) {
  if (event.inputType !== 'insertCompositionText') {
    const item = Attribute.panel.attribute
    Attribute.saveHistory(item, 'note', item.note)
    item.note = this.read()
    Attribute.list.updateNoteIcon(item)
    Attribute.changed = true
  }
}

// 面板 - 键盘按下事件
Attribute.panelKeydown = function (event) {
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
Attribute.searcherInput = function (event) {
  if (event.inputType === 'insertCompositionText') {
    return
  }
  const text = this.input.value
  Attribute.list.searchNodes(text)
}

// 确定按钮 - 鼠标点击事件
Attribute.confirm = function (event) {
  this.apply()
  Window.close('attribute')
}.bind(Attribute)

// 应用按钮 - 鼠标点击事件
Attribute.apply = function (event) {
  if (this.changed) {
    this.changed = false

    // 保存属性数据
    this.packAttribute()
    File.planToSave(Data.manifest.project.attribute)

    // 发送属性改变事件
    window.dispatchEvent(new Event('attributechange'))
  }
}.bind(Attribute)

// 列表 - 复制
Attribute.list.copy = function (item) {
  if (item.class !== 'folder') {
    Clipboard.write('yami.data.attribute', item)
  }
}

// 列表 - 粘贴
Attribute.list.paste = function (dItem) {
  const copy = Clipboard.read('yami.data.attribute')
  if (copy) {
    copy.id = Attribute.createId()
    copy.name += ' - Copy'
    this.addNodeTo(copy, dItem)
  }
}

// 列表 - 删除
Attribute.list.delete = function (item) {
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
        Attribute.closePropertyPanel()
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
Attribute.list.saveScroll = function () {
  const {attribute} = Data
  // 将数据保存在外部可以切换项目后重置
  if (attribute.scrollTop === undefined) {
    Object.defineProperty(attribute, 'scrollTop', {
      writable: true,
      value: 0,
    })
  }
  attribute.scrollTop = this.scrollTop
}

// 列表 - 恢复滚动状态
Attribute.list.restoreScroll = function () {
  this.scrollTop = Data.attribute.scrollTop ?? 0
}

// 列表 - 取消搜索
Attribute.list.cancelSearch = function () {
  if (this.display === 'search') {
    const active = document.activeElement
    Attribute.searcher.deleteInputContent()
    this.expandToSelection()
    this.scrollToSelection()
    active.focus()
  }
}

// 列表 - 创建文件夹
Attribute.list.createFolder = function () {
  return {
    class: 'folder',
    id: Attribute.createId(),
    name: 'New Folder',
    expanded: false,
    children: [],
  }
}

// 列表 - 创建属性
Attribute.list.createAttribute = function () {
  return {
    id: Attribute.createId(),
    key: '',
    type: 'number',
    name: 'Attribute',
    enum: '',
    note: '',
  }
}

// 列表 - 重写创建图标方法
Attribute.list.createIcon = function IIFE() {
  const classes = {
    boolean: 'icon-boolean',
    number: 'icon-number',
    string: 'icon-string',
    enum: 'icon-object',
  }
  return function (item) {
    const icon = document.createElement('node-icon')
    if (item.class !== 'folder') {
      icon.addClass(classes[item.type])
    } else {
      icon.addClass('icon-folder')
    }
    return icon
  }
}()

// 列表 - 更新图标
Attribute.list.updateIcon = function (item) {
  const {element} = item
  if (element?.nodeIcon) {
    const icon = this.createIcon(item)
    element.replaceChild(icon, element.nodeIcon)
    element.nodeIcon = icon
  }
}

// 列表 - 添加元素类名
Attribute.list.addElementClass = function (item) {
  item.element.addClass('attribute-item')
}

// 列表 - 创建分组文本
Attribute.list.createGroupText = function (item) {
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
Attribute.list.updateGroupText = function (item) {
  const {element} = item
  if (element.groupText !== undefined) {
    let group = ''
    for (const key of Attribute.settingKeys) {
      if (item.id === Attribute.settings[key]) {
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
Attribute.list.createInitText = function (item) {
  if (item.class !== 'folder') {
    const {element} = item
    const initText = document.createElement('text')
    initText.addClass('attribute-init-text')
    element.appendChild(initText)
    element.initText = initText
    element.attrKey = ''
  }
}

// 列表 - 更新初始化文本
Attribute.list.updateInitText = function (item) {
  const {element} = item
  if (element.initText !== undefined) {
    const {key} = item
    if (element.attrKey !== key) {
      element.attrKey = key
      element.initText.textContent = key ? ` = ${key}` : ''
    }
  }
}

// 列表 - 创建笔记图标
Attribute.list.createNoteIcon = function (item) {
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
Attribute.list.updateNoteIcon = function (item) {
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

// ******************************** 属性上下文类 ********************************

class AttributeContext {
  groupMap  //:object
  itemCache //:object
  itemLists //:object

  constructor(attribute) {
    const groupMap = {}

    // 加载数据
    const load = (groupKeys, items) => {
      for (const item of items) {
        const itemKey = item.id
        if (item.class === 'folder') {
          // 这里可能会创建用不到的属性分组
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
    load([], attribute.keys)

    // 移除无效的分组设置
    const settings = attribute.settings
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
    this.groupMap = groupMap
    this.itemCache = {}
    this.itemLists = {}
  }

  // 获取群组属性
  getGroupAttribute(groupKey, attrId) {
    return this.groupMap[groupKey]?.itemMap[attrId]
  }

  // 获取默认属性ID
  getDefAttributeId(groupKey) {
    return this.groupMap[groupKey]?.itemList[0]?.id ?? ''
  }

  // 获取属性选项列表
  getAttributeItems(groupKey, attrType = '') {
    const key = groupKey + attrType
    if (!this.itemLists[key]) {
      // 获取分组的全部同类型选项
      const items = []
      const group = this.groupMap[groupKey]
      if (group) {
        const attrTypes = [attrType]
        if (attrType === 'string') {
          attrTypes.push('enum')
        }
        const itemCache = this.itemCache
        for (const attr of group.itemList) {
          if (!attrType || attrTypes.includes(attr.type)) {
            let item = itemCache[attr.id]
            if (item === undefined) {
              item = itemCache[attr.id] = {
                name: attr.name,
                value: attr.id,
              }
            }
            items.push(item)
          }
        }
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
}
