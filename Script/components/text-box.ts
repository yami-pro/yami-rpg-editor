'use strict'

import {
  TextHistory,
  IMath
} from '../yami'

// ******************************** 文本框 ********************************

class TextBox extends HTMLElement {
  input             //:element
  focusEventEnabled //:boolean
  blurEventEnabled  //:boolean

  constructor() {
    super()

    // 创建输入框
    const input = document.createElement('input')
    input.addClass('text-box-input')
    input.type = 'text'
    input.history = new TextHistory(input)
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

  // 设置占位符
  setPlaceholder(placeholder) {
    this.input.placeholder = placeholder
  }

  // 设置最大长度
  setMaxLength(length) {
    this.input.maxLength = length
  }

  // 调整输入框大小来适应内容
  fitContent() {
    const parent = this.parentNode
    this.style.width = '0'
    this.style.width = `${IMath.clamp(
      this.input.scrollWidth + 2, 0,
      parent.rect().right
    - this.rect().left,
    )}px`
  }

  // 删除输入框内容
  deleteInputContent() {
    if (this.read() !== '') {
      this.input.select()
      this.input.dispatchEvent(
        new InputEvent('beforeinput', {
          inputType: 'deleteContentForward',
          bubbles: true,
      }))
      document.execCommand('delete')
    }
  }

  // 添加关闭按钮
  addCloseButton() {
    return TextBox.addCloseButton(this)
  }

  // 添加键盘按下过滤器
  addKeydownFilter() {
    return TextBox.addKeydownFilter(this)
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

  // 静态 - 添加关闭按钮
  static addCloseButton = function IIFE() {
    // 重写写入方法
    const write = function (value) {
      TextBox.prototype.write.call(this, value)
      updateCloseButton(this)
    }
    // 更新关闭按钮
    const updateCloseButton = function (textBox) {
      return textBox.read() !== ''
      ? textBox.closeButton.show()
      : textBox.closeButton.hide()
    }
    // 键盘按下事件
    const keydown = function (event) {
      switch (event.code) {
        case 'Escape':
          if (this.read() !== '') {
            event.stopPropagation()
            this.deleteInputContent()
          }
          break
      }
    }
    // 输入事件
    const input = function (event) {
      updateCloseButton(this)
    }
    // 关闭按钮 - 鼠标按下事件
    const closeButtonPointerdown = function (event) {
      // 阻止默认的失去焦点行为并停止传递事件
      event.preventDefault()
      event.stopPropagation()
    }
    // 关闭按钮 - 鼠标点击事件
    const closeButtonClick = function (event) {
      this.parentNode.deleteInputContent()
    }
    return textBox => {
      textBox.write = write
      textBox.on('keydown', keydown)
      textBox.on('input', input)
      textBox.closeButton = document.createElement('box')
      textBox.closeButton.addClass('close-button')
      textBox.closeButton.textContent = '\u2716'
      textBox.closeButton.on('pointerdown', closeButtonPointerdown)
      textBox.closeButton.on('click', closeButtonClick)
      textBox.appendChild(textBox.closeButton.hide())
    }
  }()

  // 静态 - 添加键盘按下过滤器
  static addKeydownFilter = function IIFE() {
    const keydown = function (event) {
      if (event.altKey) {
        return
      } else if (
        !event.cmdOrCtrlKey &&
        !event.shiftKey) {
        switch (event.code) {
          case 'Escape':
          case 'F1':
          case 'F3':
          case 'F4':
          case 'F9':
            return
        }
      }
      event.stopImmediatePropagation()
    }
    return textBox => {
      textBox.on('keydown', keydown)
    }
  }()
}

customElements.define('text-box', TextBox)

// ******************************** 文本框导出 ********************************

export { TextBox }
