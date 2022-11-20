'use strict'

// ******************************** 元素访问器 ********************************

// 元素访问器 - 名称
Object.defineProperty(
  HTMLElement.prototype, 'name', {
    get: function () {
      return this.getAttribute('name')
    },
    set: function (value) {
      this.setAttribute('name', value)
    },
  }
)

// 元素访问器 - 内部高度
Object.defineProperty(
  HTMLElement.prototype, 'innerHeight', {
    get: function () {
      let padding = this._padding
      if (padding === undefined) {
        const css = this.css()
        const pt = parseInt(css.paddingTop)
        const pb = parseInt(css.paddingBottom)
        padding = this._padding = pt + pb
      }
      const outerHeight = this.clientHeight
      const innerHeight = outerHeight - padding
      return Math.max(innerHeight, 0)
    }
  }
)
