'use strict'

import { INavigator } from '../navigator'
import { UIEvent_ext } from './ui-event'

// ******************************** 鼠标事件方法 ********************************

interface MouseEvent_ext extends UIEvent_ext {
  doubleclickProcessed: boolean
  spaceKey: boolean

  getRelativeCoords: (element: any) => {x: number, y: number}
  dragKey: { get: (this: IMouseEvent) => boolean }
  cmdOrCtrlKey: { get: (this: IMouseEvent) => boolean }
}

interface IMouseEvent extends MouseEvent, MouseEvent_ext {}

// 加入Event原型生效, MouseEvent原型不生效?
const prototype = <IMouseEvent>Event.prototype

Object.defineProperties(prototype, {
  dragKey: {
    get: function (this: IMouseEvent) {
      return this.spaceKey || this.altKey
    }
  },
  cmdOrCtrlKey: {
    get: (<INavigator>navigator).userAgentData.platform === 'macOS'
    ? function (this: IMouseEvent) {return this.metaKey}
    : function (this: IMouseEvent) {return this.ctrlKey}
  },
})

// 事件方法 - 返回相对于元素的坐标
prototype.getRelativeCoords = function IIFE() {
  const point = {x: 0, y: 0}
  return function (this: IMouseEvent, element: Element) {
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

export { IMouseEvent, MouseEvent_ext }
