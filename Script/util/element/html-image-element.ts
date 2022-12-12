"use strict"

import { HTMLElement_ext } from "../../yami"

// ******************************** 图像扩展 ********************************

interface HTMLImageElement_ext extends HTMLElement_ext {
  guid: string | null
}

interface JSXHTMLImageElement { [attributes: string]: any }

// 元素方法 - 唯一标识符
HTMLImageElement.prototype.guid = null

export {
  HTMLImageElement_ext,
  JSXHTMLImageElement
}
