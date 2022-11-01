'use strict'

// ******************************** 单选框代理 ********************************

class RadioProxy extends HTMLElement {
  dataValue         //:any
  relations         //:array
  cancelable        //:boolean
  writeEventEnabled //:boolean
  inputEventEnabled //:boolean

  constructor() {
    super()

    // 设置属性
    this.dataValue = null
    this.relations = []
    this.cancelable = false
    this.writeEventEnabled = false
    this.inputEventEnabled = false
  }

  // 读取数据
  read() {
    return this.dataValue
  }

  // 写入数据
  write(value) {
    const elements = document.getElementsByName(this.id)
    for (const element of elements) {
      if (element.dataValue === value) {
        element.addClass('selected')
        this.dataValue = value
      } else {
        element.removeClass('selected')
      }
    }
    if (!this.hasClass('disabled')) {
      this.toggleRelatedElements()
    }
    if (this.writeEventEnabled) {
      const write = new Event('write')
      write.value = this.dataValue
      this.dispatchEvent(write)
    }
  }

  // 输入数据
  input(value) {
    const lastValue = this.dataValue
    if (lastValue !== value) {
      this.write(value)
      if (this.inputEventEnabled) {
        const input = new Event('input')
        input.value = this.dataValue
        input.lastValue = lastValue
        this.dispatchEvent(input)
      }
      this.dispatchChangeEvent()
    }
  }

  // 重置数据
  reset() {
    if (this.dataValue !== null) {
      const elements = document.getElementsByName(this.id)
      for (const element of elements) {
        if (element.dataValue === this.dataValue) {
          element.removeClass('selected')
          break
        }
      }
      this.dataValue = null
    }
  }

  // 启用元素
  enable() {
    if (this.removeClass('disabled')) {
      const elements = document.getElementsByName(this.id)
      for (const element of elements) {
        element.removeClass('disabled')
      }
      this.toggleRelatedElements()
    }
  }

  // 禁用元素
  disable() {
    if (this.addClass('disabled')) {
      const elements = document.getElementsByName(this.id)
      for (const element of elements) {
        element.addClass('disabled')
      }
      this.toggleRelatedElements()
    }
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
        const selection = entries.find(entry =>
          entry.case === this.dataValue
        )
        for (const entry of entries) {
          if (entry.case === this.dataValue) {
            for (const element of entry.targets) {
              element.enable()
            }
          } else {
            for (const element of selection
            ? Array.subtract(entry.targets, selection.targets)
            : entry.targets) {
              element.disable()
            }
          }
        }
      } else {
        const entries = this.relations
        for (const entry of entries) {
          for (const element of entry.targets) {
            element.disable()
          }
        }
      }
    }
  }

  // 添加事件
  on(type, listener, options) {
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

  // 静态 - 代理映射表
  static map = {}
}

customElements.define('radio-proxy', RadioProxy)

export { RadioProxy }
