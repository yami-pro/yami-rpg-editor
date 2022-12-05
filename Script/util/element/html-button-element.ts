'use strict'

import { HTMLElement_ext } from './html-element'

// ******************************** 按钮扩展 ********************************

interface HTMLButtonElement_ext extends HTMLElement_ext {
  enable: () => void
  disable: () => void
}

interface IHTMLButtonElement extends HTMLButtonElement, HTMLButtonElement_ext {}

const prototype = <IHTMLButtonElement>HTMLButtonElement.prototype

// 启用元素
prototype.enable = function () {
  if (this.disabled) {
    this.disabled = false
  }
}

// 禁用元素
prototype.disable = function () {
  if (!this.disabled) {
    this.disabled = true
  }
}

export { IHTMLButtonElement, HTMLButtonElement_ext }
