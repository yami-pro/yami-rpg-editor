"use strict"

// ******************************** 开关选项 ********************************

class SwitchItem extends HTMLElement {
  dataValue: number
  class: string
  length: number
  inputEventEnabled: boolean

  constructor() {
    super()

    const length = Math.clamp(parseInt(this.getAttribute('length')), 1, 4)

    // 设置属性
    this.dataValue = 0
    this.class = ''
    this.length = length
    this.inputEventEnabled = false

    // 侦听事件
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
  }

  // 更新样式
  update() {
    this.removeClass(this.class)
    this.addClass(this.class =
      SwitchItem.classes[this.dataValue]
    )
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

  // 指针按下事件
  pointerdown(event) {
    switch (event.button) {
      case 0: {
        this.write((this.dataValue + 1) % this.length)
        if (this.inputEventEnabled) {
          const input = new Event('input')
          input.value = this.dataValue
          this.dispatchEvent(input)
        }
        break
      }
    }
  }

  // 静态 - 类型列表
  static classes = ['zero', 'one', 'two', 'three']
}

customElements.define('switch-item', SwitchItem)

interface JSXSwitchItem { [attributes: string]: any }

// ******************************** 开关选项导出 ********************************

export {
  SwitchItem,
  JSXSwitchItem
}