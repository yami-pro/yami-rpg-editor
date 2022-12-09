"use strict"

import { IMouseEvent } from "../../yami"

// ******************************** 按钮扩展 ********************************

interface Element_ext {
  isInContent(event: IMouseEvent): boolean
}

interface IElement extends Element, Element_ext {}

const prototype = <IElement>Element.prototype

// 元素方法 - 判断事件坐标在内容区域上
prototype.isInContent = function (event) {
  const coords = event.getRelativeCoords(this)
  const x = coords.x - this.scrollLeft
  const y = coords.y - this.scrollTop
  return x >= 0 && x < this.clientWidth &&
         y >= 0 && y < this.clientHeight
}

export {
  IElement,
  Element_ext
}
