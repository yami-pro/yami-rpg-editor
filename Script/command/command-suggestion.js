'use strict'

import {
  Command,
  FSP,
  Local,
  Window
} from '../yami.js'

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

// ******************************** 指令提示框加载 ********************************

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

// ******************************** 指令提示框导出 ********************************

export { CommandSuggestion }
