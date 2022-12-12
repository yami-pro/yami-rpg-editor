"use strict"

// ******************************** 按钮扩展 ********************************

interface Element_ext {
  isInContent(event: MouseEvent): boolean
}

// 元素方法 - 判断事件坐标在内容区域上
Element.prototype.isInContent = function (event) {
  const coords = event.getRelativeCoords(this)
  const x = coords.x - this.scrollLeft
  const y = coords.y - this.scrollTop
  return x >= 0 && x < this.clientWidth &&
         y >= 0 && y < this.clientHeight
}

export { Element_ext }
