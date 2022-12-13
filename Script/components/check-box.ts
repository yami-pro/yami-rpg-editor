"use strict"

// ******************************** 复选框 ********************************

class CheckBox extends HTMLElement {
  dataValue: boolean
  relations: HTMLElement[]
  writeEventEnabled: boolean
  inputEventEnabled: boolean

  constructor(standard: boolean) {
    super()

    // 设置属性
    this.dataValue = false
    this.relations = Array.empty()
    this.writeEventEnabled = false
    this.inputEventEnabled = false

    // 侦听事件
    this.on('keydown', this.keydown)

    // 差异化处理
    switch (standard ?? this.hasClass('standard')) {
      case true: { // 标准复选框
        const mark = document.createElement('check-mark')
        this.tabIndex = 0
        this.insertBefore(mark, this.childNodes[0])
        this.on('click', this.mouseclick)
        break
      }
      case false: // 自定义复选框
        this.on('pointerdown', this.pointerdown)
        break
    }
  }

  // 读取数据
  read() {
    return this.dataValue
  }

  // 写入数据
  write(value: boolean) {
    this.dataValue = !!value
    this.dataValue
    ? this.addClass('selected')
    : this.removeClass('selected')
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
  input(value: boolean) {
    if (this.dataValue !== value) {
      this.write(value)
      if (this.inputEventEnabled) {
        const input = new Event('input', {
          bubbles: true,
        })
        input.value = this.dataValue
        this.dispatchEvent(input)
      }
      this.dispatchChangeEvent()
    }
  }

  // 启用元素
  enable() {
    if (this.removeClass('disabled')) {
      this.toggleRelatedElements()
    }
  }

  // 禁用元素
  disable() {
    if (this.addClass('disabled')) {
      this.toggleRelatedElements()
    }
  }

  // 添加相关元素
  relate(elements: HTMLElement[]) {
    this.relations = elements
  }

  // 启用或禁用相关元素
  toggleRelatedElements() {
    if (!this.hasClass('disabled') && this.dataValue) {
      for (const element of this.relations) {
        element.enable()
      }
    } else {
      for (const element of this.relations) {
        element.disable()
      }
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
        if (!event.cmdOrCtrlKey &&
          !this.hasClass('disabled')) {
          event.stopPropagation()
          this.mouseclick(event)
        }
        break
    }
  }

  // 指针按下事件
  pointerdown(event) {
    switch (event.button) {
      case 0:
        if (document.activeElement !== document.body) {
          document.activeElement.blur()
        }
        this.input(!this.read())
        break
    }
  }

  // 鼠标点击事件
  mouseclick(event) {
    this.input(!this.read())
  }
}

customElements.define('check-box', CheckBox)

interface JSXCheckBox { [attributes: string]: any }

// ******************************** 复选框导出 ********************************

export {
  CheckBox,
  JSXCheckBox
}
