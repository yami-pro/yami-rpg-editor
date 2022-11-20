'use strict'

import {
  CommonList,
  ctrl,
  DetailBox,
  Local,
  Menu,
  ParamHistory,
  WindowFrame
} from '../yami'

// ******************************** 参数列表 ********************************

class ParamList extends HTMLElement {
  object            //:object
  type              //:string
  data              //:array
  elements          //:array
  selections        //:array
  start             //:number
  end               //:number
  origin            //:number
  active            //:number
  flexible          //:boolean
  inserting         //:boolean
  focusing          //:boolean
  dragging          //:event
  history           //:object
  toggleable        //:boolean
  windowPointerup   //:function
  windowPointermove //:function

  constructor() {
    super()

    // 设置属性
    this.tabIndex = 0
    this.object = null
    this.type = null
    this.data = null
    this.elements = []
    this.elements.versionId = 0
    this.elements.count = 0
    this.elements.start = -1
    this.elements.end = -1
    this.elements.head = null
    this.elements.foot = null
    this.selections = []
    this.start = null
    this.end = null
    this.origin = null
    this.active = null
    this.flexible = this.hasAttribute('flexible')
    this.inserting = false
    this.focusing = false
    this.dragging = null
    this.history = null
    this.toggleable = false
    this.windowPointerup = ParamList.windowPointerup.bind(this)
    this.windowPointermove = ParamList.windowPointermove.bind(this)
    this.listenDraggingScrollbarEvent()

    // 侦听事件
    this.on('scroll', this.resize)
    this.on('focus', this.listFocus)
    this.on('blur', this.listBlur)
    this.on('keydown', this.keydown)
    this.on('pointerdown', this.pointerdown)
    this.on('pointerup', this.pointerup)
    this.on('doubleclick', this.doubleclick)
  }

  // 获取内部高度
  get innerHeight() {
    // 避免细节框折叠时无法更新列表项(假设细节框列表都是弹性的)
    return this.flexible ? this.height : super.innerHeight
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

  // 绑定数据
  bind(object) {
    object.initialize(this)
    object.initialize = Function.empty
    this.object = object
    this.type = `yami.${object.type ?? this.id}`
    this.history = object.history ?? new ParamHistory(this)
    return this
  }

  // 读取数据
  read() {
    return this.data
  }

  // 写入数据
  write(data) {
    if (this.flexible) {
      this.autoSwitch = true
    }
    this.data = data
    this.update()
    this.history.reset()
    // Promise.resolve().then(() => {
    //   this.scrollTop = 0
    // })
  }

  // 更新列表
  update() {
    // 检查器的参数列表在历史操作
    // 刷新列表时可能没有加载数据
    const {data} = this
    if (!data) return
    const {elements} = this
    elements.start = -1
    elements.count = 0

    // 创建列表项目
    const object = this.object
    const length = data.length
    for (let i = 0; i < length; i++) {
      const item = data[i]
      const result = object.parse(item, data, i)
      switch (typeof result) {
        case 'string': {
          const li = document.createElement('param-item')
          li.addClass('one-column')
          li.dataValue = i
          li.dataItem = item
          li.textContent = result
          elements[elements.count++] = li
          continue
        }
        case 'object': {
          const li = document.createElement('param-item')
          li.dataValue = i
          li.dataItem = item
          elements[elements.count++] = li
          if (!Array.isArray(result)) {
            li.addClass('one-column')
            li.textContent = result.content
            if (result.class) {
              li.addClass(result.class)
            }
            continue
          }

          // 创建文本 0
          const [result0, result1] = result
          if (result0 instanceof HTMLElement) {
            li.appendChild(result0)
          } else if (result0 instanceof Object) {
            const text0 = document.createElement('text')
            text0.addClass('text-0-of-2')
            text0.textContent = result0.content
            if (result0.class) {
              text0.addClass(result0.class)
            }
            li.appendChild(text0)
          } else {
            const text0 = document.createElement('text')
            text0.addClass('text-0-of-2')
            text0.textContent = result0
            li.appendChild(text0)
          }

          // 创建文本 1
          if (result1 instanceof HTMLElement) {
            li.appendChild(result1)
          } else if (result1 instanceof Object) {
            const text1 = document.createElement('text')
            text1.addClass('text-1-of-2')
            text1.textContent = result1.content
            if (result1.class) {
              text1.addClass(result1.class)
            }
            li.appendChild(text1)
          } else {
            const text1 = document.createElement('text')
            text1.addClass('text-1-of-2')
            text1.textContent = result1
            li.appendChild(text1)
          }
          continue
        }
      }
    }

    // 创建空项目
    const li = document.createElement('param-item')
    const unit = length === 1 ? 'item' : 'items'
    li.addClass('weak')
    li.dataValue = length
    li.dataItem = null
    li.textContent = `${length} ${unit}`
    elements[elements.count++] = li

    // 清除多余的元素
    this.clearElements(elements.count)

    // 更新弹性高度
    this.updateFlexibleHeight()

    // 发送更新事件
    object.update?.(this)

    // 重新调整
    this.resize()
  }

  // 重新调整
  resize() {
    return CommonList.resize(this)
  }

  // 更新弹性高度
  updateFlexibleHeight() {
    if (this.flexible) {
      const count = this.elements.count
      const height = Math.min(count * 20, 500) + 2
      if (this.height !== height) {
        this.height = height
        this.style.height = `${height}px`
      }
      // 自动开关细节框(一次)
      if (this.autoSwitch) {
        this.autoSwitch = false
        const detailBox = this.parentNode
        if (detailBox instanceof DetailBox) {
          if (count !== 1) {
            detailBox.open()
          } else {
            detailBox.close()
          }
        }
      }
    }
  }

  // 更新头部和尾部元素
  updateHeadAndFoot() {
    return CommonList.updateHeadAndFoot(this)
  }

  // 在重新调整时更新
  updateOnResize() {}

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
    this.active = this.end
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
      let index = this.start
      if (index === this.end) {
        index--
      }
      this.select(index)
      this.scrollToSelection()
    }
  }

  // 向下选择项目
  selectDown() {
    if (this.end !== null) {
      let index = this.end
      if (index === this.start) {
        index++
      }
      this.select(index)
      this.scrollToSelection()
    }
  }

  // 向上选择多个项目
  selectMultipleUp() {
    if (this.start !== null) {
      const i = this.active - 1
      if (i >= 0) {
        this.selectMultiple(i)
      }
      this.scrollToSelection()
    }
  }

  // 向下选择多个项目
  selectMultipleDown() {
    if (this.end !== null) {
      const elements = this.elements
      const count = elements.count
      const origin = this.origin
      const i = this.active + 1
      if (i < count - 1 ||
        i === origin) {
        this.selectMultiple(i)
      }
      this.scrollToSelection()
    }
  }

  // 滚动到选中项
  scrollToSelection() {
    if (this.start !== null) {
      const scrollTop = Math.clamp(
        this.scrollTop,
        this.active * 20 + 20 - this.innerHeight,
        this.active * 20,
      )
      if (this.scrollTop !== scrollTop) {
        this.scrollTop = scrollTop
      }
    }
  }

  // 插入项目
  insert() {
    if (this.start !== null) {
      this.inserting = true
      this.object.target = this
      this.object.open()
    }
  }

  // 编辑项目
  edit() {
    if (this.start !== null) {
      const elements = this.elements
      const element = elements[this.start]
      this.inserting = element.dataItem === null
      switch (this.inserting) {
        case true:
          this.object.target = this
          this.object.open()
          break
        case false:
          this.object.target = this
          this.object.open(this.data[this.start])
          break
      }
    }
  }

  // 开关项目
  toggle() {
    if (this.toggleable &&
      this.start !== null) {
      let method = 'disable'
      const items = []
      const {data, start, end} = this
      for (let i = start; i <= end; i++) {
        const item = data[i]
        if (item) {
          switch (method) {
            case 'disable':
              if (!item.enabled) {
                method = 'enable'
                items.length = 0
              }
              items.push(item)
              continue
            case 'enable':
              if (!item.enabled) {
                items.push(item)
              }
              continue
          }
        }
      }
      if (items.length !== 0) {
        this.history.save({
          type: 'toggle',
          array: data,
          method: method,
          items: items,
        })
        switch (method) {
          case 'enable':
            this.enableItems(items)
            break
          case 'disable':
            this.disableItems(items)
            break
        }
        this.update()
        this.reselect()
        this.dispatchChangeEvent()
      }
    }
  }

  // 启用项目
  enableItems(items) {
    for (const item of items) {
      item.enabled = true
    }
  }

  // 禁用项目
  disableItems(items) {
    for (const item of items) {
      item.enabled = false
    }
  }

  // 复制项目
  copy() {
    if (this.start !== null) {
      const data = this.data
      const start = this.start
      const end = this.end + 1
      const copies = data.slice(start, end)
      if (copies.length > 0) {
        Clipboard.write(this.type, copies)
      }
    }
  }

  // 粘贴项目
  paste() {
    if (this.start !== null) {
      const copies = Clipboard.read(this.type)
      if (copies) {
        const data = this.data
        const start = this.start
        this.history.save({
          type: 'insert',
          array: data,
          index: start,
          items: copies,
        })
        this.object.onPaste?.(this, copies)
        data.splice(start, 0, ...copies)
        this.update()
        this.select(start + copies.length)
        this.scrollToSelection()
        this.dispatchChangeEvent()
      }
    }
  }

  // 删除项目
  delete() {
    if (this.start !== null) {
      const data = this.data
      const start = this.start
      const end = this.end + 1
      const items = data.slice(start, end)
      if (items.length > 0) {
        this.history.save({
          type: 'delete',
          array: data,
          index: start,
          items: items,
        })
        data.splice(start, end - start)
        this.update()
        this.select(start)
        this.scrollToSelection()
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

  // 保存数据
  save() {
    const item = this.object.save()
    if (item === undefined) {
      return
    }
    const start = this.start
    if (start !== null) {
      const data = this.data
      const length = data.length
      switch (this.inserting) {
        case true:
          this.history.save({
            type: 'insert',
            array: data,
            index: start,
            items: [item],
          })
          data.splice(start, 0, item)
          this.update()
          this.select(start + data.length - length)
          break
        case false:
          this.history.save({
            type: 'replace',
            array: data,
            index: start,
            oldItem: data[start],
            newItem: item,
          })
          data[start] = item
          this.update()
          this.select(start)
          break
      }
      this.scrollToSelection()
      this.dispatchChangeEvent()
    }
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
    this.history.reset()
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
        default:
          return
      }
      // 位于主界面的组件可能发生快捷键冲突
      // 因此阻止有效按键冒泡(Ctrl + Z|Y)
      event.stopImmediatePropagation()
    } else {
      switch (event.code) {
        case 'Space':
          event.preventDefault()
          return
        case 'Enter':
        case 'NumpadEnter':
          if (this.start !== null) {
            event.stopPropagation()
            if (this.start === this.end) {
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
        case 'Delete':
          this.delete()
          break
        case 'ArrowUp':
          event.preventDefault()
          event.shiftKey
          ? this.selectMultipleUp()
          : this.selectUp()
          break
        case 'ArrowDown':
          event.preventDefault()
          event.shiftKey
          ? this.selectMultipleDown()
          : this.selectDown()
          break
        default:
          return
      }
      event.stopImmediatePropagation()
    }
  }

  // 指针按下事件
  pointerdown(event) {
    if (this.dragging) {
      return
    }
    switch (event.button) {
      case 0: {
        let index
        let element = event.target
        if (element === this) {
          if (element.isInContent(event)) {
            index = this.elements.count - 1
          }
        } else {
          element = element.seek('param-item')
          if (element.tagName === 'PARAM-ITEM') {
            index = element.read()
          }
        }
        if (index >= 0) {
          element = this.elements[index]
          if (event.shiftKey &&
            this.start !== null) {
            this.selectMultiple(index)
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
        let index
        let element = event.target
        if (element === this) {
          if (element.isInContent(event)) {
            index = this.elements.count - 1
          }
        } else {
          element = element.seek('param-item')
          if (element.tagName === 'PARAM-ITEM') {
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
          const element = elements[this.start]
          const valid = !!element.dataItem
          const editable = this.start === this.end
          const pastable = Clipboard.has(this.type)
          const allSelectable = this.data.length > 0
          const undoable = this.history.canUndo()
          const redoable = this.history.canRedo()
          const get = Local.createGetter('menuParamList')
          const menuItems = [{
            label: get('edit'),
            accelerator: 'Enter',
            enabled: editable,
            click: () => {
              this.edit()
            },
          }, {
            label: get('insert'),
            accelerator: 'Insert',
            click: () => {
              this.insert()
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
          }]
          if (this.toggleable) {
            menuItems.splice(2, 0, {
              label: get('toggle'),
              accelerator: '/',
              click: () => {
                this.toggle()
              },
            })
          }
          Menu.popup({
            x: event.clientX,
            y: event.clientY,
          }, menuItems)
        }
        break
    }
  }

  // 鼠标双击事件
  doubleclick(event) {
    if (this.start === this.end) {
      this.edit()
    }
  }

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
              this.selectMultiple(index)
            }
          }
          break
        }
      }
    }
  }
}

customElements.define('param-list', ParamList)

// ******************************** 参数列表导出 ********************************

export { ParamList }
