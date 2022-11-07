'use strict'

import { ctrl } from '../util/index.js'
import * as Yami from '../yami.js'

const {
  Command,
  CommandHistory,
  CommonList,
  Local,
  Menu,
  WindowFrame
} = Yami

// ******************************** 指令列表 ********************************

class CommandList extends HTMLElement {
  data              //:array
  elements          //:array
  selections        //:array
  start             //:number
  end               //:number
  origin            //:number
  active            //:number
  anchor            //:number
  inserting         //:boolean
  focusing          //:boolean
  dragging          //:event
  windowPointerup   //:function
  windowPointermove //:function

  constructor() {
    super()

    // 设置属性
    this.tabIndex = 0
    this.data = null
    this.elements = []
    this.elements.versionId = 0
    this.elements.count = 0
    this.elements.start = -1
    this.elements.end = -1
    this.elements.head = null
    this.elements.foot = null
    this.selections = []
    this.selections.count = 0
    this.start = null
    this.end = null
    this.origin = null
    this.active = null
    this.anchor = null
    this.inserting = false
    this.focusing = false
    this.dragging = null
    this.windowPointerup = CommandList.windowPointerup.bind(this)
    this.windowPointermove = CommandList.windowPointermove.bind(this)
    this.windowVariableChange = CommandList.windowVariableChange.bind(this)
    this.listenDraggingScrollbarEvent()

    // 侦听事件
    this.on('scroll', this.resize)
    this.on('focus', this.listFocus)
    this.on('blur', this.listBlur)
    this.on('keydown', this.keydown)
    this.on('pointerdown', this.pointerdown)
    this.on('pointerup', this.pointerup)
    this.on('doubleclick', this.doubleclick)
    window.on('variablechange', this.windowVariableChange)
  }

  // 读取操作历史
  get history() {
    return this.data.history
  }

  // 读取上边距
  get paddingTop() {
    let pt = this._paddingTop
    if (pt === undefined) {
      pt = this._paddingTop =
      parseInt(this.css().paddingTop)
    }
    return pt
  }

  // 读取数据
  read() {
    return this.data
  }

  // 写入数据
  write(data) {
    this.data = data
    this.textContent = ''
    this.update()
    if (!data.history) {
      Object.defineProperty(data, 'history', {
        configurable: true,
        value: new CommandHistory(this),
      })
    }
    Promise.resolve().then(() => {
      this.scrollTop = 0
    })
  }

  // 更新列表
  update() {
    const {elements} = this
    elements.start = -1
    elements.count = 0

    // 创建列表项
    Command.format = true
    this.createItems(this.data, 0)
    Command.format = false

    // 写入索引
    const {count} = elements
    for (let i = 0; i < count; i++) {
      elements[i].dataValue = i
    }

    // 清除多余的元素
    this.clearElements(elements.count)

    // 发送更新事件
    this.dispatchUpdateEvent()

    // 重新调整
    this.resize()
  }

  // 重新调整
  resize() {
    return CommonList.resize(this)
  }

  // 更新头部和尾部元素
  updateHeadAndFoot() {
    return CommonList.updateHeadAndFoot(this)
  }

  // 在重新调整时更新
  updateOnResize(element) {
    if (element.contents !== null) {
      this.updateCommandElement(element)
    }
    // 在元素即将出场时更新文本格式
    if (element.updaters !== undefined &&
      element.parentNode === null) {
      for (const updater of element.updaters) {
        updater.update()
      }
    }
  }

  // 创建项目
  createItems(commands, indent) {
    const elements = this.elements
    const length = commands.length
    for (let i = 0; i < length; i++) {
      for (const target of this.createCommandBuffer(
        commands, i, indent,
      )) {
        if (target instanceof HTMLElement) {
          elements[elements.count++] = target
          continue
        }
        if (target instanceof Array) {
          this.createItems(target, indent + 1)
          continue
        }
      }
    }

    // 创建空项目
    elements[elements.count++] =
    this.createBlankElement(commands, length, indent)
  }

  // 创建指令缓冲区
  createCommandBuffer(commands, index, indent) {
    const command = commands[index]
    let buffer = command.buffer
    if (buffer === undefined) {
      buffer = []
      buffer.enabled = true
      Object.defineProperty(
        command, 'buffer', {
          configurable: true,
          value: buffer,
        }
      )

      // 创建列表项
      let li
      let color
      li = document.createElement('command-item')
      li.contents = []
      li.dataKey = true
      li.dataList = commands
      li.dataItem = command
      li.dataIndex = index
      li.dataIndent = indent
      buffer.push(li)

      // 创建内容
      const contents = Command.parse(command)
      const length = contents.length
      for (let i = 0; i < length; i++) {
        const content = contents[i]

        // 保存内容
        if (content.text !== undefined) {
          content.color = color
          li.contents.push(content)
        }

        // 改变颜色
        if (content.color !== undefined) {
          color = Command.invalid ? 'invalid' : content.color
          continue
        }

        // 换行
        if (content.break !== undefined) {
          li = document.createElement('command-item')
          li.contents = []
          li.dataKey = false
          li.dataList = commands
          li.dataItem = command
          li.dataIndex = index
          li.dataIndent = indent
          buffer.push(li)
          continue
        }

        // 创建子项目
        if (content.children !== undefined) {
          const {children} = content
          if (children.parent) {
            children.parent = command
          } else {
            Object.defineProperty(
              children, 'parent', {
                writable: true,
                value: command,
              }
            )
          }
          buffer.push(children)

          if (i < length) {
            li = document.createElement('command-item')
            li.contents = []
            li.dataKey = false
            li.dataList = commands
            li.dataItem = command
            li.dataIndex = index
            li.dataIndent = indent
            buffer.push(li)
            continue
          }
        }
      }
    }

    // 设置数据索引
    if (buffer[0].dataIndex !== index) {
      for (const target of buffer) {
        if (target instanceof HTMLElement) {
          target.dataIndex = index
        }
      }
    }

    // 更新开关状态
    const enabled = command.id[0] !== '!'
    if (buffer.enabled !== enabled) {
      buffer.enabled = enabled
      if (enabled) {
        for (const target of buffer) {
          if (target instanceof HTMLElement) {
            target.removeClass('disabled')
          }
        }
      } else {
        for (const target of buffer) {
          if (target instanceof HTMLElement) {
            target.addClass('disabled')
          }
        }
      }
    }

    return buffer
  }

  // 更新指令元素
  updateCommandElement(element) {
    // 设置文本缩进
    element.style.textIndent = this.computeTextIndent(element.dataIndent)

    // 创建标记
    if (element.dataKey) {
      const mark = document.createElement('command-mark-major')
      mark.textContent = '>'
      element.appendChild(mark)
    } else {
      const mark = document.createElement('command-mark-minor')
      mark.textContent = ':'
      element.appendChild(mark)
    }

    // 创建内容元素
    for (const content of element.contents) {
      // 创建文本
      if (content.text !== undefined) {
        const text = document.createElement('command-text')
        const updater = Command.FormatUpdater.create(content.text, text)
        if (updater) {
          // 如果文本中存在全局变量格式
          // 则创建更新器用来即时更新变量名
          let updaters = element.updaters
          if (updaters === undefined) {
            updaters = element.updaters = []
          }
          updaters.push(updater)
          updater.update()
        } else {
          // 如果不存在全局变量格式
          text.textContent = content.text
        }
        text.addClass(content.color)
        element.appendChild(text)
        continue
      }
    }
    element.contents = null
  }

  // 删除指令缓冲区
  deleteCommandBuffers(commands) {
    for (const command of commands) {
      const {buffer} = command
      if (!buffer) continue
      for (const item of buffer) {
        if (item instanceof Array) {
          this.deleteCommandBuffers(item)
        }
      }
      delete command.buffer
    }
  }

  // 创建空项目
  createBlankElement(commands, index, indent) {
    let blank = commands.blank
    if (blank === undefined) {
      // 创建列表项
      blank = document.createElement('command-item')

      // 设置元素属性
      blank.contents = Array.empty
      blank.enabled = true
      blank.dataKey = true
      blank.dataList = commands
      blank.dataItem = null
      blank.dataIndex = index
      blank.dataIndent = indent
      Object.defineProperty(
        commands, 'blank', {
          value: blank,
        }
      )
    }

    // 更新数据索引
    if (blank.dataIndex !== index) {
      blank.dataIndex = index
    }

    // 更新开关状态
    const {parent} = commands
    if (parent !== undefined) {
      const {enabled} = parent.buffer
      if (blank.enabled !== enabled) {
        blank.enabled = enabled
        if (enabled) {
          blank.removeClass('disabled')
        } else {
          blank.addClass('disabled')
        }
      }
    }

    return blank
  }

  // 计算文本缩进
  computeTextIndent(indent) {
    switch (Local.language) {
      case 'en-US':
        return indent * 2 + 'ch'
      default:
        return indent + 'em'
    }
  }

  // 选择项目
  select(start, end = start) {
    if (start > end) {
      [start, end] = [end, start]
    }

    // 限制范围
    const elements = this.elements
    const count = elements.count
    start = Math.clamp(start, 0, count - 1)
    end = Math.clamp(end, 0, count - 1)
    let indent = Infinity
    for (let i = start; i <= end; i++) {
      const {dataIndent} = elements[i]
      if (dataIndent < indent) {
        indent = dataIndent
      }
    }
    for (let i = start; i >= 0; i--) {
      const element = elements[i]
      if (element.dataIndent === indent &&
        element.dataKey === true) {
        start = i
        break
      }
    }
    for (let i = end + 1; i < count; i++) {
      const element = elements[i]
      if (element.dataIndent < indent ||
        element.dataIndent === indent &&
        element.dataKey === true) {
        end = i - 1
        break
      }
    }
    if (start !== end) {
      const element = elements[end]
      if (!element.dataItem) {
        end--
      }
    }

    // 取消选择
    this.unselect()

    // 更新属性
    this.start = start
    this.end = end
    this.origin = start
    this.active = start
    this.anchor = null

    // 选择目标
    this.reselect()
  }

  // 选择多个项目
  selectMultiple(active) {
    const origin = this.origin
    this.select(origin, active)
    this.origin = origin
    this.active = Math.clamp(
      active,
      this.start,
      this.end,
    )
  }

  // 选择全部项目
  selectAll() {
    this.select(0, Infinity)
    this.active = this.getRangeByIndex(this.end)[0]
  }

  // 取消选择
  unselect() {
    if (this.start !== null) {
      const {selections} = this
      const {count} = selections
      for (let i = 0; i < count; i++) {
        selections[i].removeClass('selected')
        selections[i] = undefined
      }
      selections.count = 0
      if (count > 256) {
        selections.length = 0
      }
    }
  }

  // 重新选择
  reselect() {
    if (this.focusing &&
      this.start !== null) {
      const {selections} = this
      const elements = this.elements
      const start = this.start
      const end = this.end
      let count = 0
      for (let i = start; i <= end; i++) {
        const element = elements[i]
        selections[count++] = element
        element.addClass('selected')
      }
      selections.count = count
    }
  }

  // 向上选择项目
  selectUp() {
    if (this.start !== null) {
      const elements = this.elements
      const sData = elements[this.start].dataItem
      const eData = elements[this.end].dataItem
      let i = this.start
      if (sData === eData) {
        while (--i >= 0) {
          if (elements[i].dataKey) {
            break
          }
        }
      }
      this.select(i)
      this.scrollToSelection()
    }
  }

  // 向下选择
  selectDown() {
    if (this.end !== null) {
      const elements = this.elements
      const sData = elements[this.start].dataItem
      const eData = elements[this.end].dataItem
      let i = this.end
      if (sData === eData) {
        const eElement = elements[i]
        if (!eElement.dataKey) {
          const data = eElement.dataItem
          while (--i >= 0) {
            const element = elements[i]
            if (element.dataItem === data &&
              element.dataKey === true) {
              break
            }
          }
        }
        const {count} = elements
        while (++i < count) {
          if (elements[i].dataKey) {
            break
          }
        }
      }
      this.select(i)
      this.scrollToSelection()
    }
  }

  // 向上翻页
  pageUp(select) {
    let anchor = this.anchor
    if (anchor === null) {
      anchor = this.active
    }
    if (anchor !== null) {
      const scrollLines = Math.floor(this.innerHeight / 20) - 1
      const scrollTop = Math.max(this.scrollTop - scrollLines * 20, 0)
      if (select) {
        const bottom = this.scrollTop + this.innerHeight
        const bottomIndex = Math.floor(bottom / 20) - 1
        const targetIndex = Math.min(anchor, bottomIndex) - scrollLines
        this.select(targetIndex)
        this.anchor = Math.max(targetIndex, this.start)
      }
      this.scroll(0, scrollTop)
    }
  }

  // 向下翻页
  pageDown(select) {
    let anchor = this.anchor
    if (anchor === null) {
      anchor = this.active
    }
    if (anchor !== null) {
      const top = this.scrollTop
      const scrollLines = Math.floor(this.innerHeight / 20) - 1
      let scrollTop = top + scrollLines * 20
      if (select) {
        const topIndex = Math.floor(top / 20)
        const targetIndex = Math.max(anchor, topIndex) + scrollLines
        const scrollBottom = this.elements.count * 20
        const scrollTopMax = scrollBottom - this.innerHeight
        this.select(targetIndex)
        this.anchor = Math.min(targetIndex, this.end)
        scrollTop = Math.min(scrollTop, scrollTopMax)
      }
      this.scroll(0, Math.max(top, scrollTop))
    }
  }

  // 选择指定位置的多个项目
  selectMultipleTo(index) {
    if (this.start !== null) {
      this.selectMultiple(index)
      const elements = this.elements
      const sElement = elements[this.start]
      const aElement = elements[this.active]
      const sIndent = sElement.dataIndent
      const aIndent = aElement.dataIndent
      let n = this.active
      if (sIndent < aIndent) {
        for (let i = n - 1; i >= 0; i--) {
          const element = elements[i]
          if (element.dataIndent === sIndent &&
            element.dataKey === true) {
            n = i
            break
          }
        }
        
      }
      const range = this.getRangeByIndex(n)
      if (this.origin < this.active &&
        this.origin > range[0] &&
        this.origin < range[1]) {
        this.active = range[1]
      } else {
        this.active = range[0]
      }
    }
  }

  // 向上选择多个项目
  selectMultipleUp() {
    if (this.start !== null) {
      const elements = this.elements
      if (this.active <= this.origin) {
        const sElement = elements[this.start]
        const indent = sElement.dataIndent
        let i = this.start
        while (--i >= 0) {
          const element = elements[i]
          if (element.dataIndent <= indent &&
            element.dataKey === true) {
            this.selectMultiple(i)
            break
          }
        }
      } else {
        const eElement = elements[this.end]
        const data = eElement.dataItem
        const end = this.end
        let indent = Infinity
        let n = this.origin
        for (let i = n; i < end; i++) {
          const element = elements[i]
          if (element.dataIndent < indent) {
            indent = element.dataIndent
          }
          if (element.dataIndent === indent &&
            element.dataItem !== data &&
            element.dataItem !== null) {
            n = i
          }
        }
        const range = this.getRangeByIndex(n)
        if (this.origin < n &&
          this.origin > range[0] &&
          this.origin < range[1]) {
          n = range[1]
        } else {
          n = range[0]
        }
        this.selectMultiple(n)
      }
      this.scrollToSelection()
    }
  }

  // 向下选择多个项目
  selectMultipleDown() {
    if (this.end !== null) {
      const elements = this.elements
      if (this.active >= this.origin) {
        const eElement = elements[this.end]
        const indent = eElement.dataIndent
        const count = elements.count
        let i = this.end
        while (++i < count) {
          const element = elements[i]
          if (element.dataIndent < indent) {
            i = this.getRangeByIndex(i)[1]
            break
          }
          if (element.dataIndent === indent &&
            element.dataKey === true &&
            element.dataItem !== null) {
            break
          }
        }
        this.selectMultiple(i)
      } else {
        const start = this.start
        let indent = Infinity
        let n = this.origin
        for (let i = n; i > start; i--) {
          const element = elements[i]
          if (element.dataIndent < indent) {
            indent = element.dataIndent
          }
          if (element.dataIndent === indent &&
            element.dataKey === true) {
            n = i
          }
        }
        this.selectMultiple(n)
      }
      this.scrollToSelection()
    }
  }

  // 滚动到选中项
  scrollToSelection(mode = 'active') {
    if (this.start !== null) {
      let scrollTop
      switch (mode) {
        case 'active': {
          const range = this.getRangeByIndex(this.active)
          const top = this.scrollTop
          const max = range[0] * 20
          const min = range[1] * 20 + 20 - this.innerHeight
          scrollTop = (
            this.active <= this.origin
          ? Math.min(Math.max(top, min), max)
          : Math.max(Math.min(top, max), min)
          )
          break
        }
        case 'alter': {
          const top = this.scrollTop
          const max = this.active * 20
          const min = this.active * 20 + 20 - this.innerHeight
          scrollTop = Math.max(Math.min(top, max), min)
          break
        }
        case 'restore': {
          const top = this.scrollTop
          const max = this.start * 20
          const min = this.end * 20 + 20 - this.innerHeight
          scrollTop = Math.min(Math.max(top, min), max)
          break
        }
        default:
          return
      }
      if (this.scrollTop !== scrollTop) {
        this.scrollTop = scrollTop
      }
    }
  }

  // 滚动并重新调整
  scrollAndResize() {
    const scrolltop = this.scrollTop
    this.scrollToSelection('active')
    if (this.scrollTop !== scrolltop) {
      this.resize()
    }
  }

  // 获取指定索引的项目范围
  getRangeByIndex(index) {
    const elements = this.elements
    const count = elements.count
    const element = elements[index]
    const data = element.dataItem
    const indent = element.dataIndent
    let start = index
    let end = index
    for (let i = index; i >= 0; i--) {
      const element = elements[i]
      if (element.dataItem === data &&
        element.dataKey === true) {
        start = i
        break
      }
    }
    for (let i = index + 1; i < count; i++) {
      const element = elements[i]
      if (element.dataIndent < indent ||
        element.dataIndent === indent &&
        element.dataKey === true) {
        end = i - 1
        break
      }
    }
    return [start, end]
  }

  // 获取指定数据的项目范围
  getRangeByData(data) {
    const elements = this.elements
    const count = elements.count
    let indent
    let start = 0
    let end = 0
    for (let i = 0; i < count; i++) {
      const element = elements[i]
      if (element.dataItem === data) {
        indent = element.dataIndent
        start = i
        break
      }
    }
    for (let i = start + 1; i < count; i++) {
      const element = elements[i]
      if (element.dataIndent < indent ||
        element.dataIndent === indent &&
        element.dataKey === true) {
        end = i - 1
        break
      }
    }
    return [start, end]
  }

  // 判断列表项父对象是否启用
  isParentEnabled(element) {
    return element.dataList.parent?.buffer.enabled ?? true
  }

  // 插入指令
  insert(id = '') {
    if (this.start !== null) {
      const elements = this.elements
      const element = elements[this.start]
      if (!this.isParentEnabled(element)) {
        return
      }
      this.inserting = true
      Command.insert(this, id)
    }
  }

  // 编辑指令
  edit() {
    if (this.start !== null) {
      const elements = this.elements
      const element = elements[this.start]
      if (!this.isParentEnabled(element)) {
        return
      }
      this.inserting = element.dataItem === null
      switch (this.inserting) {
        case true:
          Command.insert(this, '')
          break
        case false: {
          const command = element.dataItem
          if (command.buffer.enabled) {
            Command.edit(this, command)
          }
          break
        }
      }
    }
  }

  // 开关指令
  toggle() {
    if (this.start !== null) {
      const {elements, start, end} = this
      const element = elements[start]
      if (!this.isParentEnabled(element)) {
        return
      }
      let method = 'disable'
      const commands = []
      for (let i = start; i <= end; i++) {
        const element = elements[i]
        if (element.dataKey) {
          const command = element.dataItem
          if (command !== null) {
            switch (method) {
              case 'disable':
                if (!command.buffer.enabled) {
                  method = 'enable'
                  commands.length = 0
                }
                commands.push(command)
                continue
              case 'enable':
                if (!command.buffer.enabled) {
                  commands.push(command)
                }
                continue
            }
          }
        }
      }
      if (commands.length !== 0) {
        this.history.save({
          type: 'toggle',
          method: method,
          commands: commands,
        })
        switch (method) {
          case 'enable':
            this.enableItems(commands)
            break
          case 'disable':
            this.disableItems(commands)
            break
        }
        this.update()
        this.dispatchChangeEvent()
      }
    }
  }

  // 启用项目
  enableItems(commands) {
    for (const command of commands) {
      if (command.id[0] === '!') {
        command.id = command.id.slice(1)
      }
    }
  }

  // 禁用项目
  disableItems(commands) {
    for (const command of commands) {
      if (command.id[0] !== '!') {
        command.id = '!' + command.id
      }
    }
  }

  // 复制项目
  copy() {
    if (this.start !== null) {
      const elements = this.elements
      const sElement = elements[this.start]
      const eElement = elements[this.end]
      const list = sElement.dataList
      const start = sElement.dataIndex
      const end = eElement.dataIndex + 1
      const copies = list.slice(start, end)
      if (copies.length > 0) {
        Clipboard.write('yami.commands', copies)
      }
    }
  }

  // 粘贴项目
  paste() {
    if (this.start !== null) {
      const elements = this.elements
      const element = elements[this.start]
      if (!this.isParentEnabled(element)) {
        return
      }
      const copies = Clipboard.read('yami.commands')
      if (copies) {
        const list = element.dataList
        const start = element.dataIndex
        const count = elements.count
        this.history.save({
          type: 'insert',
          array: list,
          index: start,
          commands: copies,
        })
        list.splice(start, 0, ...copies)
        this.update()
        this.select(this.start + elements.count - count)
        this.scrollToSelection('alter')
        this.dispatchChangeEvent()
      }
    }
  }

  // 删除项目
  delete() {
    if (this.start !== null) {
      const elements = this.elements
      const sElement = elements[this.start]
      const eElement = elements[this.end]
      const list = sElement.dataList
      const start = sElement.dataIndex
      const end = eElement.dataIndex + 1
      const commands = list.slice(start, end)
      if (commands.length > 0) {
        this.history.save({
          type: 'delete',
          array: list,
          index: start,
          commands: commands,
        })
        list.splice(start, end - start)
        this.update()
        this.select(this.start)
        this.scrollToSelection('alter')
        this.dispatchChangeEvent()
      }
    }
  }

  // 撤销操作
  undo() {
    if (!this.dragging &&
      this.history.canUndo()) {
      this.history.restore('undo')
    }
  }

  // 重做操作
  redo() {
    if (!this.dragging &&
      this.history.canRedo()) {
      this.history.restore('redo')
    }
  }

  // 保存指令
  save(command) {
    if (this.start !== null) {
      const elements = this.elements
      const element = elements[this.start]
      const list = element.dataList
      const index = element.dataIndex
      switch (this.inserting) {
        case true:
          this.history.save({
            type: 'insert',
            array: list,
            index: index,
            commands: [command],
          })
          this.end = this.start
          list.splice(index, 0, command)
          this.update()
          this.selectDown()
          break
        case false:
          // 将新旧指令打包到一个数组中
          // 便于切换语言删除缓存时使用
          this.history.save({
            type: 'replace',
            array: list,
            index: index,
            commands: [list[index], command],
          })
          list[index] = command
          this.update()
          this.select(this.start)
          break
      }
      this.scrollToSelection('alter')
      this.dispatchChangeEvent()
    }
  }

  // 获取选中项的位置
  getSelectionPosition() {
    if (this.start === null) {
      return null
    }
    const elements = this.elements
    const element = elements[this.start]
    if (!element.parentNode) {
      return null
    }
    let x = element.childNodes[0].rect().left
    let y = element.rect().top
    // 应用窗口带边框需要减去1px的margin
    if (document.body.hasClass('border')) {
      const dpx = 1 / window.devicePixelRatio
      x -= dpx
      y -= dpx
    }
    return {x, y}
  }

  // 清除元素
  clearElements(start) {
    return CommonList.clearElements(this, start)
  }

  // 清除列表
  clear() {
    this.unselect()
    this.textContent = ''
    this.data = null
    this.start = null
    this.end = null
    this.origin = null
    this.active = null
    this.anchor = null
    this.clearElements(0)
    this.elements.count = 0
    this.elements.start = -1
    this.elements.end = -1
    this.updateHeadAndFoot()
    return this
  }

  // 获得焦点事件
  listFocus(event) {
    if (!this.focusing) {
      this.focusing = true
      this.start !== null
      ? this.reselect()
      : this.select(0)
    }
  }

  // 失去焦点事件
  listBlur(event) {
    if (this.dragging) {
      this.windowPointerup(this.dragging)
    }
    if (this.focusing) {
      let element = this
      while (element = element.parentNode) {
        if (element instanceof WindowFrame) {
          if (element.hasClass('blur')) {
            return
          } else {
            break
          }
        }
      }
      this.focusing = false
      this.unselect()
    }
  }

  // 键盘按下事件
  keydown(event) {
    if (event.cmdOrCtrlKey) {
      switch (event.code) {
        case 'KeyX':
          this.copy()
          this.delete()
          break
        case 'KeyC':
          this.copy()
          break
        case 'KeyV':
          this.paste()
          break
        case 'KeyA':
          this.selectAll()
          break
        case 'KeyZ':
          this.undo()
          break
        case 'KeyY':
          this.redo()
          break
        case 'ArrowUp':
          this.scrollTop -= 20
          break
        case 'ArrowDown':
          this.scrollTop += 20
          break
        case 'Home':
          // Ctrl+Home会触发默认行为
          event.preventDefault()
          this.scroll(0, 0)
          break
        case 'End':
          // Ctrl+End会触发默认行为
          event.preventDefault()
          this.scroll(0, this.scrollHeight)
          break
        case 'PageUp':
          this.pageUp(false)
          break
        case 'PageDown':
          this.pageDown(false)
          break
      }
    } else if (event.altKey) {
      return
    } else if (event.shiftKey) {
      switch (event.code) {
        case 'ArrowUp':
          this.selectMultipleUp()
          break
        case 'ArrowDown':
          this.selectMultipleDown()
          break
        case 'Home':
          this.selectMultipleTo(0)
          this.scrollToSelection()
          break
        case 'End':
          this.selectMultipleTo(Infinity)
          this.scrollToSelection()
          break
      }
    } else {
      switch (event.code) {
        case 'Space':
          event.preventDefault()
          this.insert()
          return
        case 'Enter':
        case 'NumpadEnter':
          if (this.start !== null) {
            event.stopPropagation()
            const elements = this.elements
            const sData = elements[this.start].dataItem
            const eData = elements[this.end].dataItem
            if (sData === eData) {
              this.edit()
            }
          }
          break
        case 'Insert':
          this.insert()
          break
        case 'Slash':
          this.toggle()
          break
        case 'Backslash':
          this.insert('script')
          break
        case 'Delete':
          this.delete()
          break
        case 'ArrowUp':
          event.preventDefault()
          this.selectUp()
          break
        case 'ArrowDown':
          event.preventDefault()
          this.selectDown()
          break
        case 'Home':
          event.preventDefault()
          this.scroll(0, 0)
          this.select(0)
          break
        case 'End': {
          event.preventDefault()
          const scrollBottom = this.elements.count * 20
          const scrollTop = scrollBottom - this.innerHeight
          this.scroll(0, Math.max(this.scrollTop, scrollTop))
          this.select(Infinity)
          break
        }
        case 'PageUp':
          event.preventDefault()
          this.pageUp(true)
          break
        case 'PageDown':
          event.preventDefault()
          this.pageDown(true)
          break
        default:
          if (CommandList.alphabetCode.test(event.code)) {
            this.insert()
            // 获取搜索框焦点可以捕获这次输入
            CommandSuggestion.searcher.input.focus()
          }
          break
      }
    }
  }

  // 指针按下事件
  pointerdown(event) {
    if (this.dragging) {
      return
    }
    switch (event.button) {
      case 0: {
        let element = event.target
        let index
        if (element === this) {
          if (element.isInContent(event)) {
            index = this.elements.count - 1
          }
        } else {
          element = element.seek('command-item', 2)
          if (element.tagName === 'COMMAND-ITEM') {
            index = element.read()
          }
        }
        if (index >= 0) {
          element = this.elements[index]
          if (event.shiftKey &&
            this.start !== null) {
            this.selectMultipleTo(index)
          } else {
            this.select(index)
          }
          this.dragging = event
          event.mode = 'select'
          event.itemIndex = index
          event.itemHeight = element.clientHeight
          window.on('pointerup', this.windowPointerup)
          window.on('pointermove', this.windowPointermove)
          this.addScrollListener('vertical', 2, true, () => {
            this.windowPointermove(event.latest)
          })
        }
        break
      }
      case 2: {
        let element = event.target
        let index
        if (element === this) {
          if (element.isInContent(event)) {
            index = this.elements.count - 1
          }
        } else {
          element = element.seek('command-item')
          if (element.tagName === 'COMMAND-ITEM') {
            index = element.read()
          }
        }
        if (index >= 0) {
          const element = this.elements[index]
          if (!element.hasClass('selected')) {
            this.select(index)
          }
        }
        break
      }
    }
  }

  // 指针弹起事件
  pointerup(event) {
    if (this.dragging) {
      return
    }
    switch (event.button) {
      case 2:
        if (this.start !== null &&
          document.activeElement === this) {
          const elements = this.elements
          const sElement = elements[this.start]
          const dElement = elements[this.end]
          const sData = sElement.dataItem
          const eData = dElement.dataItem
          const valid = !!sData
          const pEnabled = this.isParentEnabled(sElement)
          const sEnabled = valid ? sData.buffer.enabled : pEnabled
          const editable = sEnabled && sData === eData
          const pastable = pEnabled && Clipboard.has('yami.commands')
          const allSelectable = this.data.length > 0
          const undoable = this.history.canUndo()
          const redoable = this.history.canRedo()
          const get = Local.createGetter('menuCommandList')
          Menu.popup({
            x: event.clientX,
            y: event.clientY,
          }, [{
            label: get('edit'),
            accelerator: 'Enter',
            enabled: editable,
            click: () => {
              this.edit()
            },
          }, {
            label: get('insert'),
            accelerator: 'Insert',
            enabled: pEnabled,
            click: () => {
              this.insert()
            },
          }, {
            label: get('toggle'),
            accelerator: '/',
            enabled: pEnabled && valid,
            click: () => {
              this.toggle()
            },
          }, {
            label: get('script'),
            accelerator: '\\',
            enabled: pEnabled,
            click: () => {
              this.insert('script')
            },
          }, {
            type: 'separator',
          }, {
            label: get('cut'),
            accelerator: ctrl('X'),
            enabled: valid,
            click: () => {
              this.copy()
              this.delete()
            },
          }, {
            label: get('copy'),
            accelerator: ctrl('C'),
            enabled: valid,
            click: () => {
              this.copy()
            },
          }, {
            label: get('paste'),
            accelerator: ctrl('V'),
            enabled: pastable,
            click: () => {
              this.paste()
            },
          }, {
            label: get('delete'),
            accelerator: 'Delete',
            enabled: valid,
            click: () => {
              this.delete()
            },
          }, {
            label: get('selectAll'),
            accelerator: ctrl('A'),
            enabled: allSelectable,
            click: () => {
              this.select(0, Infinity)
            },
          }, {
            label: get('undo'),
            accelerator: ctrl('Z'),
            enabled: undoable,
            click: () => {
              this.undo()
            },
          }, {
            label: get('redo'),
            accelerator: ctrl('Y'),
            enabled: redoable,
            click: () => {
              this.redo()
            },
          }])
        }
        break
    }
  }

  // 鼠标双击事件
  doubleclick(event) {
    if (this.start !== null) {
      const elements = this.elements
      const sData = elements[this.start].dataItem
      const eData = elements[this.end].dataItem
      if (sData === eData) {
        this.edit(sData)
      }
    }
  }

  // 正则表达式 - 英文字母键码
  static alphabetCode = /^Key[A-Z]$/

  // 窗口 - 指针弹起事件
  static windowPointerup(event) {
    const {dragging} = this
    if (dragging.relate(event)) {
      switch (dragging.mode) {
        case 'select':
          this.removeScrollListener()
          break
      }
      this.dragging = null
      window.off('pointerup', this.windowPointerup)
      window.off('pointermove', this.windowPointermove)
    }
  }

  // 窗口 - 指针移动事件
  static windowPointermove(event) {
    const {dragging} = this
    if (dragging.relate(event)) {
      switch (dragging.mode) {
        case 'select': {
          dragging.latest = event
          const elements = this.elements
          const count = elements.count
          if (count > 0) {
            const pt = this.paddingTop
            const {itemHeight} = dragging
            const {y} = event.getRelativeCoords(this)
            const line = Math.floor((y - pt) / itemHeight)
            const index = Math.clamp(line, 0, count - 1)
            if (dragging.itemIndex !== index) {
              dragging.itemIndex = index
              this.selectMultipleTo(index)
            }
          }
          break
        }
      }
    }
  }

  // 窗口 - 变量改变事件
  static windowVariableChange(event) {
    for (const element of this.childNodes) {
      const {updaters} = element
      if (updaters !== undefined) {
        for (const updater of updaters) {
          updater.update()
        }
      }
    }
  }
}

customElements.define('command-list', CommandList)

// ******************************** 指令列表导出 ********************************

export { CommandList }
