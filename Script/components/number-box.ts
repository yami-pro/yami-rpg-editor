'use strict'

import {
  measureText,
  NumberHistory,
  IMath
} from '../yami'

// ******************************** 数字框 ********************************

class NumberBox extends HTMLElement {
  input             //:element
  decimals          //:number
  focusEventEnabled //:boolean
  blurEventEnabled  //:boolean

  constructor(dom) {
    super()

    // 获取参数
    dom = dom ?? this
    const min = dom.getAttribute('min') ?? '0'
    const max = dom.getAttribute('max') ?? '0'
    const step = dom.getAttribute('step') ?? '1'
    const unit = dom.getAttribute('unit')
    const decimals = parseInt(dom.getAttribute('decimals')) || 0

    // 创建输入框
    // 设置title为空可避免数值不匹配step时弹出提示
    const input = document.createElement('input')
    input.addClass('number-box-input')
    input.type = 'number'
    input.min = min
    input.max = max
    input.step = step
    input.title = ''
    input.history = new NumberHistory(input)
    input.on('keydown', this.inputKeydown)
    input.on('change', this.inputChange)
    this.appendChild(input)

    // 检查标签元素
    if (this.childNodes.length > 1) {
      const label = this.childNodes[0].textContent
      const font = 'var(--font-family-mono)'
      const padding = measureText(label, font).width + 8
      input.style.paddingLeft = `${padding}px`
    }

    // 创建单位文本
    if (unit !== null) {
      const unitText = document.createElement('text')
      const font = 'var(--font-family-mono)'
      const padding = measureText(unit, font).width + 8
      unitText.addClass('unit')
      unitText.textContent = unit
      this.insertBefore(unitText, input)
      input.style.paddingRight = `${padding}px`
    }

    // 设置属性
    this.input = input
    this.decimals = decimals
    this.focusEventEnabled = false
    this.blurEventEnabled = false
  }

  // 读取数据
  read() {
    const min = parseFloat(this.input.min)
    const max = parseFloat(this.input.max)
    let value = parseFloat(this.input.value) || 0
    value = IMath.clamp(value, min, max)
    value = IMath.roundTo(value, this.decimals)
    return value
  }

  // 写入数据
  write(value) {
    const {input} = this
    input.value = value
    input.value = this.read()
    input.history.reset()
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
    !NumberBox.whiteList.includes(event.code) &&
    !event.cmdOrCtrlKey && event.preventDefault()
  }

  // 输入框 - 内容改变事件
  inputChange(event) {
    // 如果小数位数达到8位使用上下键调整
    // 可能精度不足等效于先取近似值再操作
    this.value = this.parentNode.read()
  }

  // 静态 - 按键白名单
  static whiteList = [
    'Digit0',         'Digit1',         'Digit2',         'Digit3',
    'Digit4',         'Digit5',         'Digit6',         'Digit7',
    'Digit8',         'Digit9',         'Minus',          'Period',
    'Numpad0',        'Numpad1',        'Numpad2',        'Numpad3',
    'Numpad4',        'Numpad5',        'Numpad6',        'Numpad7',
    'Numpad8',        'Numpad9',        'NumpadSubtract', 'NumpadDecimal',
    'Backspace',      'Delete',         'Tab',            'Enter',
    'ArrowLeft',      'ArrowUp',        'ArrowRight',     'ArrowDown',
    'Home',           'End',            'NumpadEnter',
  ]
}

customElements.define('number-box', NumberBox)

// ******************************** 数字框导出 ********************************

export { NumberBox }
