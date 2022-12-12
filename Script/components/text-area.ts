"use strict"

import {
  TextHistory,
  Timer,
  IHTMLInputElement
} from "../yami"

// ******************************** 文本区域 ********************************

class TextArea extends HTMLElement {
  input: IHTMLInputElement
  focusEventEnabled: boolean
  blurEventEnabled: boolean

  constructor() {
    super()

    // 创建输入框
    const input = document.createElement('textarea')
    input.history = new TextHistory(input)
    input.on('keydown', this.inputKeydown)
    input.on('input', this.inputInput)
    input.listenDraggingScrollbarEvent()
    this.appendChild(input)

    // 设置属性
    this.input = input
    this.focusEventEnabled = false
    this.blurEventEnabled = false
  }

  // 读取数据
  read() {
    return this.input.value
  }

  // 写入数据
  write(value) {
    this.input.value = value
    this.input.history.reset()
  }

  // 插入数据
  insert(value) {
    this.input.dispatchEvent(
      new InputEvent('beforeinput', {
        inputType: 'insertFromPaste',
        data: value,
        bubbles: true,
    }))
    document.execCommand('insertText', false, value)
  }

  // 启用元素
  enable() {
    if (this.removeClass('disabled')) {
      this.showChildNodes()
    }
  }

  // 禁用元素
  disable() {
    if (this.addClass('disabled')) {
      this.hideChildNodes()
    }
  }

  // 获得焦点
  getFocus(mode) {
    return this.input.getFocus(mode)
  }

  // 输入框 - 键盘按下事件
  inputKeydown(event) {
    switch (event.code) {
      case 'Enter':
      case 'NumpadEnter':
        if (!event.cmdOrCtrlKey) {
          event.stopPropagation()
        }
        break
    }
    // 文本区域有内边距时滚动条行为有缺陷
    // 在输入时临时改变内边距
    // 让滚动条滑动到正确的位置
    if (!TextArea.target) {
      TextArea.target = this
      TextArea.timer.add()
      this.addClass('inputting')
    }
  }

  // 输入框 - 输入事件
  inputInput(event) {
    if (!TextArea.target) {
      TextArea.target = this
      TextArea.timer.add()
      this.addClass('inputting')
    }
  }

  // 添加事件
  on(type: string, listener: EventListenerOrEventListenerObject | null, options?: boolean | AddEventListenerOptions) {
    super.on(type, listener, options)
    switch (type) {
      case 'focus':
        if (!this.focusEventEnabled) {
          this.focusEventEnabled = true
          this.input.on('focus', event => {
            this.dispatchEvent(new FocusEvent('focus'))
          })
        }
        break
      case 'blur':
        if (!this.blurEventEnabled) {
          this.blurEventEnabled = true
          this.input.on('blur', event => {
            this.dispatchEvent(new FocusEvent('blur'))
          })
        }
        break
    }
  }

  // 静态 - 文本区域目标元素
  static target = null

  // 静态 - 文本区域计时器
  static timer = new Timer({
    duration: 0,
    callback: timer => {
      TextArea.target.removeClass('inputting')
      TextArea.target = null
    },
  })
}

customElements.define('text-area', TextArea)

interface JSXTextArea { [attributes: string]: any }

// ******************************** 文本区域导出 ********************************

export {
  TextArea,
  JSXTextArea
}
