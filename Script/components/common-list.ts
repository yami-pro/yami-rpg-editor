"use strict"

import {
  IMath,
  IHTMLElement,
  IArray
} from "../yami"

// ******************************** 普通列表 ********************************

class CommonList extends IHTMLElement {
  elements: IArray<IHTMLElement>
  selection: IHTMLElement
  writeEventEnabled: boolean
  selectEventEnabled: boolean
  popupEventEnabled: boolean

  constructor() {
    super()

    // 设置属性
    this.tabIndex = 0
    this.elements = []
    this.elements.versionId = 0
    this.elements.count = 0
    this.elements.start = -1
    this.elements.end = -1
    this.elements.head = null
    this.elements.foot = null
    this.selection = null
    this.writeEventEnabled = false
    this.selectEventEnabled = false
    this.popupEventEnabled = false
    this.listenDraggingScrollbarEvent()

    // 侦听事件
    this.on('scroll', this.scroll)
    this.on('keydown', this.keydown)
    this.on('pointerdown', this.pointerdown)
    this.on('pointerup', this.pointerup)
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
      this.unselect()
      let index = 0
      let target = elements[index]
      for (let i = 0; i < count; i++) {
        if (elements[i].dataValue === value) {
          target = elements[index = i]
          break
        }
      }
      target.addClass('selected')
      this.selection = target
      this.scrollToItem(index)
      if (this.writeEventEnabled) {
        const write = new Event('write')
        write.value = target.dataValue
        this.dispatchEvent(write)
      }
    }
  }

  // 重新装填
  reload() {
    const {elements} = this
    elements.start = -1
    elements.count = 0
    return this
  }

  // 添加元素
  appendElement(element) {
    const {elements} = this
    elements[elements.count++] = element
  }

  // 更新列表
  update() {
    // 清除多余的元素
    this.clearElements(this.elements.count)

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
  updateOnResize() {}

  // 选择项目
  select(element) {
    if (element instanceof HTMLElement &&
      this.selection !== element) {
      this.write(element.dataValue)
      if (this.selectEventEnabled) {
        const select = new Event('select')
        select.value = element.dataValue
        this.dispatchEvent(select)
      }
    }
  }

  // 取消选择
  unselect() {
    if (this.selection) {
      this.selection.removeClass('selected')
      this.selection = null
    }
  }

  // 滚动到项目
  scrollToItem(index) {
    const scrollTop = IMath.clamp(
      this.scrollTop,
      index * 20 + 20 - this.innerHeight,
      index * 20,
    )
    if (this.scrollTop !== scrollTop) {
      this.scrollTop = scrollTop
    }
  }

  // 选择相对位置的项目
  selectRelative(direction) {
    const elements = this.elements
    const count = elements.count
    if (count > 0) {
      let index = -1
      const last = count - 1
      const {selection} = this
      if (selection) {
        index = elements.indexOf(selection)
      }
      switch (direction) {
        case 'up':
          if (index !== -1) {
            index = IMath.max(index - 1, 0)
          } else {
            index = last
          }
          break
        case 'down':
          if (index !== -1) {
            index = IMath.min(index + 1, last)
          } else {
            index = 0
          }
          break
      }
      this.select(elements[index])
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

  // 添加事件
  on(type: string, listener: EventListenerOrEventListenerObject | null, options?: boolean | AddEventListenerOptions) {
    super.on(type, listener, options)
    switch (type) {
      case 'write':
        this.writeEventEnabled = true
        break
      case 'select':
        this.selectEventEnabled = true
        break
      case 'popup':
        this.popupEventEnabled = true
        break
    }
  }

  // 滚动事件
  scroll(event) {
    // 可调用重写的resize
    return this.resize()
  }

  // 键盘按下事件
  keydown(event) {
    if (event.cmdOrCtrlKey) {
      switch (event.code) {
        case 'ArrowUp':
          this.scrollTop -= 20
          break
        case 'ArrowDown':
          this.scrollTop += 20
          break
      }
    } else if (event.altKey) {
      return
    } else {
      switch (event.code) {
        case 'Space':
          event.preventDefault()
          return
        case 'ArrowUp':
          event.preventDefault()
          this.selectRelative('up')
          break
        case 'ArrowDown':
          event.preventDefault()
          this.selectRelative('down')
          break
      }
    }
  }

  // 指针按下事件
  pointerdown(event) {
    switch (event.button) {
      case 0: case 2: {
        const element = event.target
        if (element.tagName === 'COMMON-ITEM' &&
          !element.hasClass('selected')) {
          this.select(element)
        }
        break
      }
    }
  }

  // 指针弹起事件
  pointerup(event) {
    switch (event.button) {
      case 2:
        if (this.popupEventEnabled &&
          document.activeElement === this) {
          const element = event.target.seek('common-item')
          if (element.tagName === 'COMMON-ITEM' &&
            element.hasClass('selected')) {
            const popup = new Event('popup')
            popup.value = element.dataValue
            popup.clientX = event.clientX
            popup.clientY = event.clientY
            this.dispatchEvent(popup)
          } else {
            const popup = new Event('popup')
            popup.value = null
            popup.clientX = event.clientX
            popup.clientY = event.clientY
            this.dispatchEvent(popup)
          }
        }
        break
    }
  }

  // 静态 - 重新调整
  static resize = self => {
    const st = self.scrollTop
    const ch = self.innerHeight
    const elements = self.elements
    const count = elements.count
    if (ch === 0) {
      return
    }
    if (count === 0) {
      self.textContent = ''
      return
    }
    const start = IMath.min(IMath.floor(st / 20), count - 1)
    const length = IMath.ceil(ch / 20) + 1
    const end = IMath.min(start + length, count)
    if (elements.start !== start ||
      elements.end !== end) {
      elements.start = start
      elements.end = end
      self.updateHeadAndFoot()
      const versionId = elements.versionId++
      for (let i = start; i < end; i++) {
        const element = elements[i]
        element.versionId = versionId
        self.updateOnResize(element)
      }
      const nodes = self.childNodes
      const last = nodes.length - 1
      for (let i = last; i >= 0; i--) {
        const element = nodes[i]
        if (element.versionId !== versionId) {
          element.remove()
        }
      }
      // 保证尾部元素已经被添加
      if (!elements.foot.parentNode) {
        self.appendChild(elements.foot)
      }
      for (let i = end - 2; i >= start; i--) {
        const element = elements[i]
        if (element.parentNode === null) {
          const next = elements[i + 1]
          self.insertBefore(element, next)
        }
      }
    }
  }

  // 静态 - 更新头部和尾部元素
  static updateHeadAndFoot = self => {
    const {elements} = self
    if (elements.head) {
      elements.head.style.marginTop = ''
      elements.head = null
    }
    if (elements.foot) {
      elements.foot.style.marginBottom = ''
      elements.foot = null
    }
    // 设置头部和尾部元素的外边距
    const {count, start, end} = elements
    if (count !== 0) {
      const pad = self.padded ? 1 : 0
      const mt = start * 20
      const mb = (count - end + pad) * 20
      elements.head = elements[start]
      elements.head.style.marginTop = `${mt}px`
      elements.foot = elements[end - 1]
      elements.foot.style.marginBottom = `${mb}px`
    }
  }

  // 静态 - 清除元素
  static clearElements(self, start) {
    let i = start
    const {elements} = self
    while (elements[i] !== undefined) {
      elements[i++] = undefined
    }
  }
}

customElements.define('common-list', CommonList)

interface JSXCommonList { [attributes: string]: any }

// ******************************** 普通列表导出 ********************************

export {
  CommonList,
  JSXCommonList
}
