"use strict"

// ******************************** 按钮扩展 ********************************

interface HTMLButtonElement_ext {
  enable: () => void
  disable: () => void
}

// 启用元素
HTMLButtonElement.prototype.enable = function () {
  if (this.disabled) {
    this.disabled = false
  }
}

// 禁用元素
HTMLButtonElement.prototype.disable = function () {
  if (!this.disabled) {
    this.disabled = true
  }
}

export { HTMLButtonElement_ext }
