"use strict"

import {
  RadioProxy,
  IRegExp
} from "../yami"

// ******************************** 单选框 ********************************

class RadioBox extends HTMLElement {
  proxy: HTMLElement
  dataValue: any

  constructor() {
    super()

    // 获取集合节点
    let proxy = RadioProxy.map[this.name]
    if (proxy === undefined) {
      proxy = document.createElement('radio-proxy')
      proxy.id = this.name
      proxy.style.display = 'none'
      this.appendChild(proxy)
      RadioProxy.map[proxy.id] = proxy
    }

    const string = this.getAttribute('value')
    const isNumber = IRegExp.number.test(string)
    const value = (
      isNumber            ? parseFloat(string)
    : string === 'false'  ? false
    : string === 'true'   ? true
    : string
    )

    // 设置属性
    this.proxy = proxy
    this.dataValue = value

    // 侦听事件
    this.on('keydown', this.keydown)

    // 差异化处理
    switch (this.hasClass('standard')) {
      case true: { // 标准单选框
        const mark = document.createElement('radio-mark')
        this.tabIndex = 0
        this.insertBefore(mark, this.childNodes[0])
        this.on('click', this.mouseclick)
        break
      }
      case false: // 自定义单选框
        this.on('pointerdown', this.pointerdown)
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
        if (!this.hasClass('selected')) {
          if (document.activeElement !== document.body) {
            document.activeElement.blur()
          }
          this.proxy.input(this.dataValue)
        } else if (this.proxy.cancelable) {
          if (document.activeElement !== document.body) {
            document.activeElement.blur()
          }
          this.proxy.reset()
        }
        break
    }
  }

  // 鼠标点击事件
  mouseclick(event) {
    if (!this.hasClass('selected')) {
      this.proxy.input(this.dataValue)
    } else if (this.proxy.cancelable) {
      this.proxy.reset()
    }
  }
}

customElements.define('radio-box', RadioBox)

interface JSXRadioBox { [attributes: string]: any }

// ******************************** 单选框导出 ********************************

export {
  RadioBox,
  JSXRadioBox
}
