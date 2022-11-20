'use strict'

// ******************************** 按钮扩展 ********************************

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
