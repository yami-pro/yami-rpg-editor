'use strict'

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

export { TextSuggestion }
