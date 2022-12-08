"use strict"

import { HTMLElement_ext } from "../../yami"

// ******************************** 图像扩展 ********************************

interface HTMLInputElement_ext extends HTMLElement_ext {
  getFocus: (mode?: any) => void
}

interface IHTMLInputElement extends HTMLInputElement, HTMLInputElement_ext {}

// 加入HTMLElement原型生效, HTMLInputElement原型不生效?
const inputPrototype = <IHTMLInputElement>HTMLElement.prototype

// 元素方法 - 获得焦点
// 异步执行可以避免与指针按下行为起冲突
inputPrototype.getFocus = function (mode = null) {
  setTimeout(() => {
    this.focus()
    switch (mode) {
      case 'all':
        if (this.select) {
          this.select()
          this.scrollLeft = 0
        }
        break
      case 'end':
        if (typeof this.selectionStart === 'number') {
          const endIndex = this.value.length
          this.selectionStart = endIndex
          this.selectionEnd = endIndex
        }
        break
    }
  })
}

export { IHTMLInputElement, HTMLInputElement_ext }
