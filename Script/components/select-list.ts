"use strict"

import {
  CommonList,
  Window,
  IMath,
  IHTMLElement
} from "../yami"

// ******************************** 选择列表 ********************************

class SelectList extends IHTMLElement {
  state             //:string
  target            //:element
  elements          //:array
  selection         //:element
  windowKeydown     //:function
  windowPointerdown //:function
  windowResize      //:function
  windowBlur        //:function

  constructor() {
    super()

    // 设置属性
    this.state = 'closed'
    this.target = null
    this.elements = []
    this.elements.versionId = 0
    this.elements.count = 0
    this.elements.start = -1
    this.elements.end = -1
    this.elements.head = null
    this.elements.foot = null
    this.selection = null
    this.windowKeydown = SelectList.windowKeydown.bind(this)
    this.windowPointerdown = SelectList.windowPointerdown.bind(this)
    this.windowResize = SelectList.windowResize.bind(this)
    this.windowBlur = SelectList.windowBlur.bind(this)
    this.listenDraggingScrollbarEvent()

    // 侦听事件
    this.on('scroll', this.resize)
  }

  // 读取数据
  read() {
    return this.selection?.dataValue
  }

  // 写入数据
  write(value) {
    const elements = this.elements
    const count = elements.count
    if (count !== 0) {
      let target = elements[0]
      for (let i = 0; i < count; i++) {
        if (elements[i].dataValue === value) {
          target = elements[i]
          break
        }
      }
      this.select(target)
    }
  }

  // 选择项目
  select(element) {
    if (element instanceof HTMLElement &&
      this.selection !== element) {
      this.unselect()
      this.selection = element
      element.addClass('selected')
    }
  }

  // 取消选择
  unselect() {
    if (this.selection) {
      this.selection.removeClass('selected')
      this.selection = null
    }
  }

  // 重新选择
  reselect(offset) {
    const elements = this.elements
    const selection = this.selection
    const index = elements.indexOf(selection) + offset
    if (index >= 0 && index < elements.count) {
      this.select(elements[index])
    }
  }

  // 打开下拉列表
  open(target) {
    this.close()
    this.state = 'open'

    // 设置目标元素
    this.target = target

    // 创建选项
    this.createItems(target.dataItems)

    // 设置位置
    this.windowResize()

    // 添加列表到文档树
    document.body.appendChild(this)

    // 重新调整
    this.resize()

    // 写入数据
    this.write(target.dataValue)
    this.scrollToSelection()

    // 侦听事件
    this.on('pointermove', this.pointermove)
    window.on('keydown', this.windowKeydown, {capture: true})
    window.on('pointerdown', this.windowPointerdown, {capture: true})
    window.on('resize', this.windowResize)
    window.on('blur', this.windowBlur)
  }

  // 关闭下拉列表
  close() {
    if (this.state === 'closed') {
      return
    }

    this.state = 'closed'
    this.target = null
    this.clear()
    document.body.removeChild(this)

    // 取消侦听事件
    this.off('pointermove', this.pointermove)
    window.off('keydown', this.windowKeydown, {capture: true})
    window.off('pointerdown', this.windowPointerdown, {capture: true})
    window.off('resize', this.windowResize)
    window.off('blur', this.windowBlur)
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
  updateOnResize() {}

  // 创建选项
  createItems(items) {
    const {elements} = this
    elements.start = -1
    elements.count = 0

    for (const item of items) {
      const li = document.createElement('select-item')
      li.dataValue = item.value
      li.textContent = item.name
      elements[elements.count++] = li
    }

    // 清除多余的元素
    this.clearElements(elements.count)
  }

  // 向上翻页
  pageUp(select) {
    const scrollLines = IMath.floor(this.clientHeight / 20) - 1
    if (select) {
      const bottom = this.scrollTop + this.clientHeight
      const bottomIndex = IMath.floor(bottom / 20) - 1
      let index = this.getElementIndexOfSelection(Infinity)
      index = IMath.min(index, bottomIndex) - scrollLines
      index = IMath.max(index, 0)
      this.select(this.elements[index])
    }
    this.scrollBy(0, -scrollLines * 20)
  }

  // 向下翻页
  pageDown(select) {
    const scrollLines = IMath.floor(this.clientHeight / 20) - 1
    if (select) {
      const count = this.elements.count
      const topIndex = IMath.floor(this.scrollTop / 20)
      let index = this.getElementIndexOfSelection(0)
      index = IMath.max(index, topIndex) + scrollLines
      index = IMath.min(index, count - 1)
      this.select(this.elements[index])
    }
    this.scrollBy(0, +scrollLines * 20)
  }

  // 获取选中项的元素索引
  getElementIndexOfSelection(defIndex) {
    const selection = this.selection
    if (selection instanceof HTMLElement) {
      return this.elements.indexOf(selection)
    }
    return defIndex
  }

  // 滚动到选中项
  scrollToSelection() {
    if (this.hasScrollBar()) {
      const elements = this.elements
      const selection = this.selection
      const index = elements.indexOf(selection)
      if (index !== -1) {
        const scrollTop = IMath.clamp(
          this.scrollTop,
          index * 20 + 20 - this.innerHeight,
          index * 20,
        )
        if (this.scrollTop !== scrollTop) {
          this.scrollTop = scrollTop
        }
      }
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
    this.clearElements(0)
    this.elements.count = 0
    this.elements.start = -1
    this.elements.end = -1
    this.updateHeadAndFoot()
    return this
  }

  // 指针移动事件
  pointermove(event) {
    const element = event.target.seek('select-item')
    if (element.tagName === 'SELECT-ITEM' &&
      !element.hasClass('selected')) {
      this.write(element.dataValue)
    }
  }

  // 窗口 - 键盘按下事件
  static windowKeydown(event) {
    event.preventDefault()
    event.stopPropagation()
    switch (event.code) {
      case 'Escape':
        this.close()
        break
      case 'Enter':
      case 'NumpadEnter': {
        const value = this.read()
        if (value !== undefined) {
          this.target.input(value)
        }
        this.close()
        break
      }
      case 'ArrowUp':
        this.reselect(-1)
        this.scrollToSelection()
        break
      case 'ArrowDown':
        this.reselect(1)
        this.scrollToSelection()
        break
      case 'Home': {
        const elements = this.elements
        this.scroll(0, 0)
        this.select(elements[0])
        break
      }
      case 'End': {
        const elements = this.elements
        const last = elements.count - 1
        this.scroll(0, this.scrollHeight)
        this.select(elements[last])
        break
      }
      case 'PageUp':
        this.pageUp(true)
        break
      case 'PageDown':
        this.pageDown(true)
        break
    }
  }

  // 窗口 - 指针按下事件
  static windowPointerdown(event) {
    switch (event.button) {
      case 0: {
        const target = this.target
        let element = event.target
        if (element instanceof SelectList) {
          event.preventDefault()
          return
        }
        if (element.seek('select-box') === target) {
          event.stopImmediatePropagation()
          return this.close()
        }
        element = element.seek('select-item')
        if (element.tagName === 'SELECT-ITEM' &&
          element.parentNode === this) {
          event.preventDefault()
          if (event.altKey) {
            return
          }
          target.input(element.dataValue)
        }
        return this.close()
      }
      case 2:
        return this.close()
    }
  }

  // 窗口 - 调整大小事件
  static windowResize(event) {
    const MAX_LINES = 30
    const rect = this.target.rect()
    const rl = rect.left
    const rt = rect.top
    const rb = rect.bottom
    const rw = rect.width
    const count = this.elements.count
    const space = window.innerHeight - rb
    const below = space >= IMath.min(count, 10) * 20
    const capacity = below
    ? IMath.floor(space / 20)
    : IMath.floor(rt / 20)
    const lines = IMath.min(count, capacity, MAX_LINES)
    const top = below ? rb : rt - lines * 20
    this.style.left = `${rl}px`
    this.style.top = `${top}px`
    this.style.width = `calc(${rw}px - var(--2dpx))`
    this.style.height = `${lines * 20}px`
    this.style.zIndex = Window.frames.length + 1
  }

  // 窗口 - 失去焦点事件
  static windowBlur(event) {
    this.close()
  }
}

customElements.define('select-list', SelectList)

interface JSXSelectList { [attributes: string]: any }

// 创建选择列表实例
const Select = new SelectList()

// ******************************** 选择列表导出 ********************************

export {
  SelectList,
  JSXSelectList,
  Select
}
