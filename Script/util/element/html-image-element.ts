"use strict"

import { HTMLElement_ext } from "../../yami"

// ******************************** 图像扩展 ********************************

interface HTMLImageElement_ext extends HTMLElement_ext {
  guid: string | null
}

interface IHTMLImageElement extends HTMLImageElement, HTMLImageElement_ext {}

const imagePrototype = <IHTMLImageElement>HTMLImageElement.prototype

// 元素方法 - 唯一标识符
imagePrototype.guid = null

export {
  IHTMLImageElement,
  HTMLImageElement_ext
}
