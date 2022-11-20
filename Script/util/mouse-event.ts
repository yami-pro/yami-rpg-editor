'use strict'

// ******************************** 鼠标事件方法 ********************************

// 事件方法 - 返回相对于元素的坐标
MouseEvent.prototype.getRelativeCoords = function IIFE() {
  const point = {x: 0, y: 0}
  return function (element) {
    const rect = element.getBoundingClientRect()
    point.x = (
      this.clientX
    - rect.left
    - element.clientLeft
    + element.scrollLeft
    )
    point.y = (
      this.clientY
    - rect.top
    - element.clientTop
    + element.scrollTop
    )
    return point
  }
}()
