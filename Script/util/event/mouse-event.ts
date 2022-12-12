"use strict"

// ******************************** 鼠标事件方法 ********************************

interface MouseEvent_ext {
  doubleclickProcessed: boolean
  spaceKey: boolean

  getRelativeCoords: (element: any) => {x: number, y: number}
  dragKey: { get: (this: MouseEvent) => boolean }
  cmdOrCtrlKey: { get: (this: MouseEvent) => boolean }
}

// 加入Event原型生效, MouseEvent原型不生效?
const MouseEvent_prototype = <MouseEvent>Event.prototype

Object.defineProperties(MouseEvent_prototype, {
  dragKey: {
    get: function (this: MouseEvent) {
      return this.spaceKey || this.altKey
    }
  },
  cmdOrCtrlKey: {
    get: navigator.userAgentData.platform === 'macOS'
    ? function (this: MouseEvent) {return this.metaKey}
    : function (this: MouseEvent) {return this.ctrlKey}
  },
})

// 事件方法 - 返回相对于元素的坐标
MouseEvent_prototype.getRelativeCoords = function IIFE() {
  const point = {x: 0, y: 0}
  return function (this: MouseEvent, element: Element) {
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

export { MouseEvent_ext }
