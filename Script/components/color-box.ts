"use strict"

import {
  MouseKeyboardEvent,
  Color
} from "../yami"

// ******************************** 颜色框 ********************************

class ColorBox extends HTMLElement {
  dataValue: string
  foreground: HTMLElement
  inputEventEnabled: boolean

  constructor() {
    super()

    // 创建背景区域
    const background = document.createElement('box')
    background.addClass('color-box-background')
    this.appendChild(background)

    // 创建前景区域
    const foreground = document.createElement('box')
    foreground.addClass('color-box-foreground')
    this.appendChild(foreground)

    // 设置属性
    this.tabIndex = 0
    this.dataValue = ''
    this.foreground = foreground
    this.inputEventEnabled = false

    // 侦听事件
    this.on('keydown', this.keydown)
    this.on('click', this.mouseclick)
  }

  // 读取数据
  read() {
    return this.dataValue
  }

  // 写入数据
  write(color: string) {
    this.dataValue = color

    // 更新样式
    const r = parseInt(color.slice(0, 2), 16)
    const g = parseInt(color.slice(2, 4), 16)
    const b = parseInt(color.slice(4, 6), 16)
    const a = parseInt(color.slice(6, 8), 16) / 255
    this.foreground.style.backgroundColor = `rgba(${r}, ${g}, ${b}, ${a})`
  }

  // 输入数据
  input(color: string) {
    if (this.dataValue !== color) {
      this.write(color)
      if (this.inputEventEnabled) {
        const input = new Event('input')
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

  // 添加事件
  on(type: string, listener: EventListenerOrEventListenerObject | null, options?: boolean | AddEventListenerOptions) {
    super.on(type, listener, options)
    switch (type) {
      case 'input':
        this.inputEventEnabled = true
        break
    }
  }

  // 键盘按下事件
  keydown(event: MouseKeyboardEvent) {
    switch (event.code) {
      case 'Enter':
      case 'NumpadEnter':
        if (!event.cmdOrCtrlKey) {
          event.stopPropagation()
          this.mouseclick(event)
        }
        break
    }
  }

  // 鼠标点击事件
  mouseclick(event: MouseKeyboardEvent) {
    Color.open(this)
  }
}

customElements.define('color-box', ColorBox)

interface JSXColorBox { [attributes: string]: any }

// ******************************** 颜色框导出 ********************************

export {
  ColorBox,
  JSXColorBox
}
