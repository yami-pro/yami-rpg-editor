"use strict"

import {
  Select,
  IArray
} from "../yami"

// ******************************** 选择框 ********************************

class SelectBox extends HTMLElement {
  info              //:element
  dataItems         //:array
  dataValue         //:any
  relations         //:array
  invalid           //:boolean
  hideUnrelated     //:boolean
  writeEventEnabled //:boolean
  inputEventEnabled //:boolean

  constructor() {
    super()

    // 创建文本
    const text = document.createElement('text')
    text.addClass('select-box-text')
    this.appendChild(text)

    // 设置属性
    this.tabIndex = 0
    this.info = text
    this.dataItems = null
    this.dataValue = null
    this.relations = []
    this.invalid = false
    this.hideUnrelated = false
    this.writeEventEnabled = false
    this.inputEventEnabled = false

    // 侦听事件
    this.on('keydown', this.keydown)
    this.on('pointerdown', this.pointerdown)
  }

  // 读取数据
  read() {
    return this.dataValue
  }

  // 写入数据
  write(value) {
    this.dataValue = value
    this.update()
    if (!this.hasClass('disabled')) {
      this.toggleRelatedElements()
    }
    if (this.writeEventEnabled) {
      const write = new Event('write')
      write.value = this.dataValue
      this.dispatchEvent(write)
    }
  }

  // 写入数据(无效时写入默认值)
  write2(value) {
    for (const item of this.dataItems) {

      if (item.value === value) {
        this.write(value)
        return
      }
    }
    this.writeDefault()
  }

  // 写入默认值
  writeDefault() {
    this.write(this.dataItems[0].value)
  }

  // 输入数据
  input(value) {
    const last = this.dataValue
    if (last !== value) {
      this.write(value)
      if (this.inputEventEnabled) {
        const input = new Event('input', {bubbles: true})
        input.last = last
        input.value = this.dataValue
        this.dispatchEvent(input)
      }
      this.dispatchChangeEvent()
    }
  }

  // 更新信息
  update() {
    const info = this.info
    const value = this.dataValue
    const items = this.dataItems
    const length = items.length
    let name
    for (let i = 0; i < length; i++) {
      const item = items[i]
      if (item.value === value) {
        name = item.name
        break
      }
    }
    if (name !== undefined) {
      this.invalid = false
      info.removeClass('invalid')
      info.textContent = name
    } else {
      this.invalid = true
      info.addClass('invalid')
      info.textContent = value
    }
  }

  // 重新选择
  reselect(offset) {
    const value = this.dataValue
    const items = this.dataItems
    const length = items.length
    for (let i = 0; i < length; i++) {
      if (items[i].value === value) {
        const index = i + offset
        if (index >= 0 && index < length) {
          this.input(items[index].value)
        }
        return
      }
    }
    const index = offset > 0 ? 0 : length - 1
    this.input(items[index].value)
  }

  // 保存值
  save() {
    this.savedValue = this.read()
  }

  // 恢复值
  restore() {
    if (this.savedValue !== undefined) {
      this.input(this.savedValue)
      delete this.savedValue
    }
  }

  // 启用元素
  enable() {
    if (this.removeClass('disabled')) {
      this.tabIndex += 1
      this.showChildNodes()
      this.toggleRelatedElements()
    }
  }

  // 禁用元素
  disable() {
    if (this.addClass('disabled')) {
      this.tabIndex -= 1
      this.hideChildNodes()
      this.toggleRelatedElements()
    }
  }

  // 加载选项
  loadItems(items) {
    this.dataItems = items
  }

  // 设置选项名称
  setItemNames(options) {
    const items = this.dataItems
    for (const item of items) {
      const key = item.value
      const name = options[key]
      if (name !== undefined) {
        item.name = name
      }
    }
    if (this.dataValue !== null) {
      this.update()
    }
  }

  // 清除选项
  clear() {
    this.dataItems = null
    this.dataValue = null
    this.info.textContent = ''
    return this
  }

  // 启用隐藏模式
  enableHiddenMode() {
    this.hideUnrelated = true
    return this
  }

  // 添加相关元素
  relate(entries) {
    this.relations = entries
  }

  // 启用或禁用相关元素
  toggleRelatedElements() {
    if (this.relations.length !== 0) {
      if (!this.hasClass('disabled')) {
        const entries = this.relations
        const value = this.dataValue
        const selection = entries.find(entry =>
          entry.case instanceof Array
        ? entry.case.includes(value)
        : entry.case === value
        )
        const deferredList = []
        for (const entry of entries) {
          if (entry.case instanceof Array
            ? entry.case.includes(value)
            : entry.case === value) {
            deferredList.push(entry)
          } else {
            for (const element of selection
            ? IArray.subtract(entry.targets, selection.targets)
            : entry.targets) {
              this.disableElement(element)
            }
          }
        }
        // 延后启用元素避免可能被禁用的情况
        for (const entry of deferredList) {
          for (const element of entry.targets) {
            this.enableElement(element)
          }
        }
      } else {
        const entries = this.relations
        for (const entry of entries) {
          for (const element of entry.targets) {
            this.disableElement(element)
          }
        }
      }
    }
  }

  // 启用元素
  enableElement(element) {
    element.enable()
    if (this.hideUnrelated) {
      let node = element.previousSibling
      while (node instanceof Text) {
        node = node.previousSibling
      }
      if (node.tagName === 'TEXT') {
        node.show()
      }
      element.show()
    }
  }

  // 禁用元素
  disableElement(element) {
    element.disable()
    if (this.hideUnrelated) {
      let node = element.previousSibling
      while (node instanceof Text) {
        node = node.previousSibling
      }
      if (node.tagName === 'TEXT') {
        node.hide()
      }
      element.hide()
    }
  }

  // 添加事件
  on(type: string, listener: EventListenerOrEventListenerObject | null, options?: boolean | AddEventListenerOptions) {
    super.on(type, listener, options)
    switch (type) {
      case 'write':
        this.writeEventEnabled = true
        break
      case 'input':
        this.inputEventEnabled = true
        break
    }
  }

  // 键盘按下事件
  keydown(event) {
    switch (event.code) {
      case 'Enter':
      case 'NumpadEnter':
        if (!event.cmdOrCtrlKey) {
          event.stopPropagation()
          Select.open(this)
        }
        break
      case 'ArrowUp':
        event.preventDefault()
        event.stopPropagation()
        this.reselect(-1)
        break
      case 'ArrowDown':
        event.preventDefault()
        event.stopPropagation()
        this.reselect(1)
        break
    }
  }

  // 指针按下事件
  pointerdown(event) {
    switch (event.button) {
      case 0:
        Select.open(this)
        break
    }
  }
}

customElements.define('select-box', SelectBox)

// ******************************** 选择框导出 ********************************

export { SelectBox }
