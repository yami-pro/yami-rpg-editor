"use strict"

// ******************************** 键盘按键框 ********************************

class KeyboardBox extends HTMLElement {
  input             //:element
  dataValue         //:number
  inputEventEnabled //:boolean
  focusEventEnabled //:boolean
  blurEventEnabled  //:boolean

  constructor() {
    super()

    // 创建输入框
    const input = document.createElement('input')
    input.addClass('keyboard-box-input')
    input.type = 'text'
    input.on('keydown', this.inputKeydown)
    this.appendChild(input)

    // 设置属性
    this.input = input
    this.dataValue = 0
    this.inputEventEnabled = false
    this.focusEventEnabled = false
    this.blurEventEnabled = false
  }

  // 读取数据
  read() {
    return this.dataValue
  }

  // 写入数据
  write(code) {
    this.dataValue = code
    this.input.value = code
  }

  // 输入键值
  inputCode(code) {
    if (this.dataValue !== code) {
      this.write(code)
      if (this.inputEventEnabled) {
        const input = new InputEvent('input')
        input.value = this.dataValue
        this.dispatchEvent(input)
      }
      this.dispatchChangeEvent()
    }
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

  // 添加事件
  on(type: string, listener: EventListenerOrEventListenerObject | null, options?: boolean | AddEventListenerOptions) {
    super.on(type, listener, options)
    switch (type) {
      case 'input':
        this.inputEventEnabled = true
        break
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

  // 输入框 - 键盘按下事件
  inputKeydown(event) {
    event.stopPropagation()
    event.preventDefault()
    switch (event.code) {
      case 'Backspace':
        this.parentNode.inputCode('')
        break
      case 'Enter':
      case 'NumpadEnter':
        event.stopImmediatePropagation()
      default:
        this.parentNode.inputCode(event.code)
        break
    }
  }
}

customElements.define('keyboard-box', KeyboardBox)

interface JSXKeyboardBox { [attributes: string]: any }

// ******************************** 键盘按键框导出 ********************************

export {
  KeyboardBox,
  JSXKeyboardBox
}
