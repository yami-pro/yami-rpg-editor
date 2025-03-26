'use strict'

// ******************************** 变量窗口 ********************************

const Variable = {
  // properties
  list: $('#variable-list'),
  panel: $('#variable-properties-flex').hide(),
  manager: $('#variable-value-manager'),
  searcher: $('#variable-searcher'),
  inputs: {
    name: $('#variable-name'),
    sort: $('#variable-sort'),
    type: $('#variable-type'),
    value: $('#variable-value-box'),
    boolean: $('#variable-value-boolean'),
    number: $('#variable-value-number'),
    string: $('#variable-value-string'),
    note: $('#variable-note'),
  },
  target: null,
  data: null,
  idMap: null,
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
  getVariableById: null,
  openPropertyPanel: null,
  closePropertyPanel: null,
  unpackVariables: null,
  packVariables: null,
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
  listOpen: null,
  nameInput: null,
  sortWrite: null,
  sortInput: null,
  typeWrite: null,
  typeInput: null,
  valueInput: null,
  noteInput: null,
  panelKeydown: null,
  searcherInput: null,
  confirm: null,
  apply: null,
}

// list methods
Variable.list.copy = null
Variable.list.paste = null
Variable.list.delete = null
Variable.list.saveScroll = null
Variable.list.restoreScroll = null
Variable.list.cancelSearch = null
Variable.list.createFolder = null
Variable.list.createVariable = null
Variable.list.createIcon = null
Variable.list.updateIcon = null
Variable.list.addElementClass = null
Variable.list.updateItemClass = null
Variable.list.createInitText = null
Variable.list.updateInitText = null
Variable.list.createNoteIcon = null
Variable.list.updateNoteIcon = null
Variable.list.onCreate = null
Variable.list.onDelete = null
Variable.list.onResume = null

// 初始化
Variable.initialize = function () {
  // 绑定变量列表
  const {list} = this
  list.removable = true
  list.renamable = true
  list.bind(() => this.data)
  list.creators.push(list.addElementClass)
  list.creators.push(list.updateItemClass)
  list.creators.push(list.createInitText)
  list.creators.push(list.updateInitText)
  list.creators.push(list.createNoteIcon)
  list.creators.push(list.updateNoteIcon)

  // 设置面板变量默认值
  this.panel.variable = null

  // 设置列表搜索框按钮
  this.searcher.addCloseButton()

  // 设置历史操作处理器
  History.processors['variable-list-operation'] = (operation, data) => {
    const {response} = data
    list.restore(operation, response)
    if (list.read() === null &&
      this.panel.variable !== null) {
      this.closePropertyPanel()
    }
    this.changed = true
  }
  History.processors['variable-name-change'] = (operation, data) => {
    const {item, value} = data
    data.value = item.name
    item.name = value
    list.updateItemName(item)
    if (this.panel.variable === item) {
      this.inputs.name.write(value)
    } else {
      list.select(item)
      list.expandToSelection()
      list.scrollToSelection()
    }
    this.changed = true
  }
  History.processors['variable-sort-change'] = (operation, data) => {
    const {item, value: {sort, value}} = data
    data.value.sort = item.sort
    data.value.value = item.value
    item.sort = sort
    item.value = value
    list.updateIcon(item)
    list.updateInitText(item)
    list.updateItemClass(item)
    if (this.panel.variable === item) {
      const type = typeof value
      this.inputs.sort.write(sort)
      this.inputs.type.write(type)
      this.inputs[type]?.write(value)
    } else {
      list.select(item)
      list.expandToSelection()
      list.scrollToSelection()
    }
    this.changed = true
  }
  History.processors['variable-type-change'] = (operation, data) => {
    const {item, value} = data
    data.value = item.value
    item.value = value
    list.updateIcon(item)
    list.updateInitText(item)
    if (this.panel.variable === item) {
      const type = typeof value
      this.inputs.type.write(type)
      this.inputs[type]?.write(value)
    } else {
      list.select(item)
      list.expandToSelection()
      list.scrollToSelection()
    }
    this.changed = true
  }
  History.processors['variable-value-change'] = (operation, data) => {
    const {item, value} = data
    data.value = item.value
    item.value = value
    list.updateInitText(item)
    if (this.panel.variable === item) {
      this.inputs[typeof value].write(value)
    } else {
      list.select(item)
      list.expandToSelection()
      list.scrollToSelection()
    }
    this.changed = true
  }
  History.processors['variable-note-change'] = (operation, data) => {
    const {item, value} = data
    data.value = item.note
    item.note = value
    list.updateNoteIcon(item)
    if (this.panel.variable === item) {
      this.inputs.note.write(value)
    } else {
      list.select(item)
      list.expandToSelection()
      list.scrollToSelection()
    }
    this.changed = true
  }

  // 侦听事件
  $('#variable').on('close', this.windowClose)
  $('#variable').on('closed', this.windowClosed)
  list.on('keydown', this.listKeydown)
  list.on('pointerdown', this.listPointerdown)
  list.on('pointerdown', Reference.getPointerdownListener(list), {capture: true})
  list.on('select', this.listSelect)
  list.on('record', this.listRecord)
  list.on('popup', this.listPopup)
  list.on('open', this.listOpen)
  this.inputs.name.on('input', this.nameInput)
  this.inputs.sort.on('write', this.sortWrite)
  this.inputs.sort.on('input', this.sortInput)
  this.inputs.type.on('write', this.typeWrite)
  this.inputs.type.on('input', this.typeInput)
  this.inputs.boolean.on('input', this.valueInput)
  this.inputs.number.on('input', this.valueInput)
  this.inputs.string.on('input', this.valueInput)
  this.inputs.string.on('compositionend', this.valueInput)
  this.inputs.note.on('input', this.noteInput)
  this.inputs.note.on('compositionend', this.noteInput)
  this.panel.on('keydown', this.panelKeydown)
  this.searcher.on('input', this.searcherInput)
  this.searcher.on('compositionend', this.searcherInput)
  $('#variable-confirm').on('click', this.confirm)
  $('#variable-apply').on('click', this.apply)
}

// 打开窗口
Variable.open = function (target = null) {
  this.target = target
  this.history = new History(100)
  this.unpackVariables()
  Window.open('variable')

  // 查询变量并更新列表
  const list = this.list
  const item = !target ? undefined
  : this.getVariableById(target.read())
  if (item && item.class !== 'folder') {
    list.initialize()
    list.select(item)
    list.expandToSelection(false)
    list.update()
    list.restoreScroll()
    list.scrollToSelection('middle')
  } else {
    list.update()
    list.restoreScroll()
    // 打开变量输入框时默认选择第一项
    if (target instanceof Object) {
      list.select(list.data[0])
    }
  }

  // 列表获得焦点
  list.getFocus()

  // 侦听事件
  window.on('keydown', this.keydown)
  window.on('keydown', Reference.getKeydownListener(list, 'variable'))
}

// 撤销操作
Variable.undo = function () {
  if (this.history.canUndo()) {
    this.history.restore('undo')
  }
}

// 重做操作
Variable.redo = function () {
  if (this.history.canRedo()) {
    this.history.restore('redo')
  }
}

// 创建ID
Variable.createId = function () {
  let id
  do {id = GUID.generate64bit()}
  while (this.idMap[id])
  return id
}

// 注册变量
Variable.register = function (item) {
  if (item.class === 'folder') {
    for (const child of item.children) {
      Variable.register(child)
    }
  } else {
    Variable.idMap[item.id] = true
  }
}

// 取消注册变量
Variable.unregister = function (item) {
  if (item.class === 'folder') {
    for (const child of item.children) {
      Variable.unregister(child)
    }
  } else {
    delete Variable.idMap[item.id]
  }
}

// 获取ID匹配的变量
Variable.getVariableById = function IIFE() {
  const find = (items, id) => {
    const length = items.length
    for (let i = 0; i < length; i++) {
      const item = items[i]
      if (item.class !== 'folder') {
        if (item.id === id) {
          return item
        }
      } else {
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

// 打开属性面板
Variable.openPropertyPanel = function (variable) {
  const panel = this.panel
  if (panel.variable !== variable) {
    panel.variable = variable
    panel.show()
    const {inputs} = this
    const {name, sort, value, note} = variable
    const type = typeof value
    inputs.name.write(name)
    inputs.sort.write(sort)
    inputs.type.write(type)
    inputs.boolean.write(type === 'boolean' ? value : false)
    inputs.number.write(type === 'number' ? value : 0)
    inputs.string.write(type === 'string' ? value : '')
    inputs.note.write(note)
  }
}

// 关闭属性面板
Variable.closePropertyPanel = function () {
  const panel = this.panel
  if (panel.variable) {
    panel.variable = null
    panel.hide()
  }
}

// 解包变量数据
Variable.unpackVariables = function IIFE() {
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
      File.planToSave(Data.manifest.project.variables)
    }
  }
  const clone = items => {
    const length = items.length
    const copies = new Array(length)
    for (let i = 0; i < length; i++) {
      const item = items[i]
      if (item.class !== 'folder') {
        Variable.idMap[item.id] = true
        copies[i] = Object.clone(item)
      } else {
        copies[i] = new ReferencedFolder(item)
      }
    }
    return copies
  }
  return function () {
    this.idMap = {}
    this.data = clone(Data.variables)
  }
}()

// 打包变量数据
Variable.packVariables = function IIFE() {
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
    Data.variables = clone(this.data)
    Data.createVariableMap()
  }
}()

// 保存操作历史
Variable.saveHistory = function (item, key, value) {
  const type = `variable-${key}-change`
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
Variable.windowClose = function (event) {
  this.list.saveScroll()
  if (this.changed) {
    event.preventDefault()
    const get = Local.createGetter('confirmation')
    Window.confirm({
      message: get('closeUnsavedVariables'),
    }, [{
      label: get('yes'),
      click: () => {
        this.changed = false
        Window.close('variable')
      },
    }, {
      label: get('no'),
    }])
  }
}.bind(Variable)

// 窗口 - 已关闭事件
Variable.windowClosed = function (event) {
  this.target = null
  this.data = null
  this.idMap = null
  this.history = null
  this.searcher.write('')
  this.list.clear()
  this.closePropertyPanel()
  window.off('keydown', this.keydown)
  window.off('keydown', Reference.getKeydownListener(this.list))
}.bind(Variable)

// 键盘按下事件
Variable.keydown = function (event) {
  if (event.cmdOrCtrlKey) {
    switch (event.code) {
      case 'KeyZ':
        if (!event.macRedoKey) {
          return Variable.undo()
        }
      case 'KeyY':
        return Variable.redo()
    }
  }
}

// 列表 - 键盘按下事件
Variable.listKeydown = function (event) {
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
        this.addNodeTo(this.createVariable(), item)
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
Variable.listPointerdown = function (event) {
  switch (event.button) {
    case 3:
      this.cancelSearch()
      break
  }
}

// 列表 - 选择事件
Variable.listSelect = function (event) {
  const item = event.value
  return item.class !== 'folder'
  ? Variable.openPropertyPanel(item)
  : Variable.closePropertyPanel()
}

// 列表 - 记录事件
Variable.listRecord = function (event) {
  Variable.changed = true
  const response = event.value
  switch (response.type) {
    case 'rename': {
      // 如果是变量则执行操作否则进入默认分支
      const {item, oldValue, newValue} = response
      if (Variable.panel.variable === item) {
        Variable.inputs.name.write(newValue)
        Variable.saveHistory(item, 'name', oldValue)
        break
      }
    }
    default:
      Variable.history.save({
        type: 'variable-list-operation',
        response: response,
      })
      break
  }
}

// 列表 - 菜单弹出事件
Variable.listPopup = function (event) {
  const item = event.value
  const selected = !!item
  const copyable = selected && item.class !== 'folder'
  const pastable = Clipboard.has('yami.data.variable')
  const undoable = Variable.history.canUndo()
  const redoable = Variable.history.canRedo()
  const get = Local.createGetter('menuVariableList')
  const items = [{
    label: get('create'),
    submenu: [{
      label: get('create.folder'),
      click: () => {
        this.addNodeTo(this.createFolder(), item)
      },
    }, {
      label: get('create.variable'),
      accelerator: 'Insert',
      click: () => {
        this.addNodeTo(this.createVariable(), item)
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
      Variable.undo()
    },
  }, {
    label: get('redo'),
    accelerator: ctrl('Y'),
    enabled: redoable,
    click: () => {
      Variable.redo()
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

// 列表 - 打开事件
Variable.listOpen = function (event) {
  if (event.value.class !== 'folder' &&
    Variable.target instanceof Object) {
    Variable.target.getFocus?.()
    Variable.confirm()
  }
}

// 名字输入框 - 输入事件
Variable.nameInput = function (event) {
  const item = Variable.panel.variable
  if (item.class !== 'folder') {
    Variable.saveHistory(item, 'name', item.name)
    item.name = event.target.value
    Variable.list.updateItemName(item)
    Variable.changed = true
  }
}

// 分类输入框 - 写入事件
Variable.sortWrite = function (event) {
  switch (event.value) {
    case 0:
    case 1:
      $('#variable-type-object').disable()
      break
    case 2:
      $('#variable-type-object').enable()
      break
  }
}

// 分类输入框 - 输入事件
Variable.sortInput = function (event) {
  const item = Variable.panel.variable
  const sort = event.value
  Variable.saveHistory(item, 'sort', {
    sort: item.sort,
    value: item.value,
  })
  // 如果从临时变量对象类型切换到其他分类，修改变量的值为布尔值
  if (item.value === null) {
    item.value = Variable.inputs.boolean.read()
    Variable.inputs.type.write('boolean')
    Variable.list.updateIcon(item)
    Variable.list.updateInitText(item)
  }
  item.sort = sort
  Variable.list.updateItemClass(item)
  Variable.changed = true
}

// 类型输入框 - 写入事件
Variable.typeWrite = function (event) {
  const {style} = Variable.inputs.value
  Variable.manager.switch(event.value)
  switch (event.value) {
    case 'boolean':
    case 'number':
    case 'string':
      style.visibility = 'visible'
      break
    case 'object':
      style.visibility = 'hidden'
      break
  }
}

// 类型输入框 - 输入事件
Variable.typeInput = function (event) {
  const item = Variable.panel.variable
  const type = event.value
  Variable.saveHistory(item, 'type', item.value)
  switch (type) {
    case 'boolean':
    case 'number':
    case 'string':
      item.value = Variable.inputs[type].read()
      break
    case 'object':
      item.value = null
      break
  }
  Variable.list.updateIcon(item)
  Variable.list.updateInitText(item)
  Variable.changed = true
}

// 初始值输入框 - 输入事件
Variable.valueInput = function (event) {
  if (event.inputType !== 'insertCompositionText') {
    const item = Variable.panel.variable
    Variable.saveHistory(item, 'value', item.value)
    item.value = this.read()
    Variable.list.updateInitText(item)
    Variable.changed = true
  }
}

// 备注输入框 - 输入事件
Variable.noteInput = function (event) {
  if (event.inputType !== 'insertCompositionText') {
    const item = Variable.panel.variable
    Variable.saveHistory(item, 'note', item.note)
    item.note = this.read()
    Variable.list.updateNoteIcon(item)
    Variable.changed = true
  }
}

// 面板 - 键盘按下事件
Variable.panelKeydown = function (event) {
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
Variable.searcherInput = function (event) {
  if (event.inputType === 'insertCompositionText') {
    return
  }
  const text = this.input.value
  Variable.list.searchNodes(text)
}

// 确定按钮 - 鼠标点击事件
Variable.confirm = function (event) {
  const target = this.target
  if (target instanceof Object) {
    const variable = this.panel.variable
    if (variable === null) {
      return this.list.getFocus()
    }
    const filter = target.filter
    switch (filter) {
      case 'boolean':
      case 'number':
      case 'string':
      case 'object':
        if (typeof variable.value !== filter) {
          return $(`#variable-type-${filter}`).getFocus()
        }
        break
    }
    this.apply()
    target.input(variable.id)
  } else {
    this.apply()
  }
  Window.close('variable')
}.bind(Variable)

// 应用按钮 - 鼠标点击事件
Variable.apply = function (event) {
  if (this.changed) {
    this.changed = false

    // 保存变量数据
    this.packVariables()
    File.planToSave(Data.manifest.project.variables)

    // 发送变量改变事件
    window.dispatchEvent(new Event('variablechange'))
  }
}.bind(Variable)

// 列表 - 复制
Variable.list.copy = function (item) {
  if (item && item.class !== 'folder') {
    Clipboard.write('yami.data.variable', item)
  }
}

// 列表 - 粘贴
Variable.list.paste = function (dItem) {
  const copy = Clipboard.read('yami.data.variable')
  if (copy) {
    // 只有冲突时进行更换ID
    // 支持跨项目复制保留ID
    if (Variable.idMap[copy.id]) {
      copy.id = Variable.createId()
      copy.name += ' - Copy'
    }
    this.addNodeTo(copy, dItem)
  }
}

// 列表 - 删除
Variable.list.delete = function (item) {
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
        Variable.closePropertyPanel()
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
Variable.list.saveScroll = function () {
  const {variables} = Data
  // 将数据保存在外部可以切换项目后重置
  if (variables.scrollTop === undefined) {
    Object.defineProperty(variables, 'scrollTop', {
      writable: true,
      value: 0,
    })
  }
  variables.scrollTop = this.scrollTop
}

// 列表 - 恢复滚动状态
Variable.list.restoreScroll = function () {
  this.scrollTop = Data.variables.scrollTop ?? 0
}

// 列表 - 取消搜索
Variable.list.cancelSearch = function () {
  if (this.display === 'search') {
    const active = document.activeElement
    Variable.searcher.deleteInputContent()
    this.expandToSelection()
    this.scrollToSelection()
    active.focus()
  }
}

// 列表 - 创建文件夹
Variable.list.createFolder = function () {
  return {
    class: 'folder',
    name: 'New Folder',
    expanded: false,
    children: [],
  }
}

// 列表 - 创建变量
Variable.list.createVariable = function () {
  return {
    id: Variable.createId(),
    name: 'Variable',
    value: false,
    sort: 0,
    note: ''
  }
}

// 列表 - 重写创建图标方法
Variable.list.createIcon = function IIFE() {
  const classes = {
    boolean: 'icon-boolean',
    number: 'icon-number',
    string: 'icon-string',
    object: 'icon-object',
  }
  return function (item) {
    const icon = document.createElement('node-icon')
    if (item.class !== 'folder') {
      icon.addClass(classes[typeof item.value])
    } else {
      icon.addClass('icon-folder')
    }
    return icon
  }
}()

// 列表 - 更新图标
Variable.list.updateIcon = function (item) {
  const {element} = item
  if (element?.nodeIcon) {
    const icon = this.createIcon(item)
    element.replaceChild(icon, element.nodeIcon)
    element.nodeIcon = icon
  }
}

// 列表 - 添加元素类名
Variable.list.addElementClass = function (item) {
  item.element.addClass('variable-item')
}

// 列表 - 更新项目类名
Variable.list.updateItemClass = function (item) {
  const {element} = item
  switch (item.sort) {
    case 0:
      element.removeClass('shared-variable')
      element.removeClass('temporary-variable')
      break
    case 1:
      element.addClass('shared-variable')
      element.removeClass('temporary-variable')
      break
    case 2:
      element.removeClass('shared-variable')
      element.addClass('temporary-variable')
      break
  }
  if (item.class !== 'folder') {
    element.addClass('reference')
  } else {
    element.removeClass('reference')
  }
}

// 列表 - 创建初始化文本
Variable.list.createInitText = function (item) {
  if (item.class !== 'folder') {
    const {element} = item
    const initText = document.createElement('text')
    initText.addClass('variable-init-text')
    element.appendChild(initText)
    element.initText = initText
    // 对象变量的初始值是null，避免冲突
    element.initValue = undefined
  }
}

// 列表 - 更新初始化文本
Variable.list.updateInitText = function (item) {
  const {element} = item
  if (element.initText !== undefined) {
    let {value} = item
    if (element.initValue !== value) {
      element.initValue = value
      switch (typeof value) {
        case 'boolean':
        case 'number':
          element.initText.textContent = ` = ${value}`
          break
        case 'string':
          value = `"${Command.parseMultiLineString(value)}"`
          element.initText.textContent = ` = ${value}`
          break
        case 'object':
          element.initText.textContent = ''
          break
      }
    }
  }
}

// 列表 - 创建笔记图标
Variable.list.createNoteIcon = function (item) {
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
Variable.list.updateNoteIcon = function (item) {
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
Variable.list.onCreate = function (item) {
  Variable.register(item)
}

// 列表 - 在删除数据时回调
Variable.list.onDelete = function (item) {
  Variable.unregister(item)
}

// 列表 - 在恢复数据时回调
Variable.list.onResume = function (item) {
  Variable.register(item)
}