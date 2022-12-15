"use strict"

// ******************************** 图像扩展 ********************************

interface HTMLInputElement_ext {
  getFocus: (mode?: string | null) => void
}

interface JSXHTMLInputElement { [attributes: string]: any }

// 加入HTMLElement原型生效, HTMLInputElement原型不生效?
// 元素方法 - 获得焦点
// 异步执行可以避免与指针按下行为起冲突
HTMLElement.prototype.getFocus = function (this: HTMLInputElement, mode: string | null = null) {
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

export {
  HTMLInputElement_ext,
  JSXHTMLInputElement
}
