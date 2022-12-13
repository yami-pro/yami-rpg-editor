"use strict"

import {
  FileItem,
  FolderItem
} from "../../yami"

// ******************************** 事件访问器 ********************************

interface Event_ext {
  // UIEvent
  detail: number
  view: Window | null

  // MouseEvent
  button: number
  buttons: number
  clientX: number
  clientY: number
  movementX: number
  movementY: number
  offsetX: number
  offsetY: number
  pageX: number
  pageY: number
  relatedTarget: EventTarget | null
  screenX: number
  screenY: number
  x: number
  y: number
  getModifierState(keyArg: string): boolean

  // PointerEvent
  height: number
  isPrimary: boolean
  pointerId: number
  pointerType: string
  pressure: number
  tangentialPressure: number
  tiltX: number
  tiltY: number
  twist: number
  width: number
  getCoalescedEvents(): PointerEvent[]
  getPredictedEvents(): PointerEvent[]

  // KeyboardEvent
  code: string
  isComposing: boolean
  key: string
  location: number
  repeat: boolean
  getModifierState(keyArg: string): boolean
  DOM_KEY_LOCATION_LEFT: number
  DOM_KEY_LOCATION_NUMPAD: number
  DOM_KEY_LOCATION_RIGHT: number
  DOM_KEY_LOCATION_STANDARD: number

  // KeyboardEvent && MouseEvent
  altKey: boolean
  ctrlKey: boolean
  metaKey: boolean
  shiftKey: boolean

  // DragEvent
  dataTransfer: DataTransfer | null

  // WheelEvent
  deltaMode: number
  deltaX: number
  deltaY: number
  deltaZ: number
  DOM_DELTA_LINE: number
  DOM_DELTA_PAGE: number
  DOM_DELTA_PIXEL: number

  // 自定义属性 && 方法
  mode: string | null
  value:  string |
          number |
          boolean |
          (FolderItem | FileItem)[] |
          null
  raw: Event
  doubleclickProcessed: boolean
  spaceKey: boolean
  dropTarget: HTMLElement | null
  allowMove: boolean
  allowCopy: boolean
  dropPath: string | null
  dropMode: string | null
  files: HTMLElement[]
  filePaths: string[]
  promise: Promise<void>
  scrollLeft: number
  scrollTop: number
  latest: Event
  itemHeight: number
  itemIndex: number

  getRelativeCoords(element: any): {x: number, y: number}
  dragKey: { get: (this: Event) => boolean }
  cmdOrCtrlKey: { get: (this: Event) => boolean }
  relate: (event: any) => boolean
  isMouseType: () => boolean
}

Event.prototype.value = null
Event.prototype.mode = null
Event.prototype.scrollLeft = 0
Event.prototype.scrollTop = 0

// 事件方法 - 返回相对于元素的坐标
Event.prototype.getRelativeCoords = function IIFE() {
  const point = {x: 0, y: 0}
  return function (this: Event, element: Element) {
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

// 指针事件方法 - 判断是否为鼠标类型
Event.prototype.isMouseType = function () {
  return this.pointerType === 'mouse'
}

// 指针事件方法 - 判断两个事件是否有关联
Event.prototype.relate = function (event: Event) {
  return this.pointerId === event.pointerId
}

Object.defineProperties(Event.prototype, {
  dragKey: {
    get: function (this: Event) {
      return this.spaceKey || this.altKey
    }
  },
  cmdOrCtrlKey: {
    get: navigator.userAgentData.platform === 'macOS'
    ? function (this: Event) {return this.metaKey}
    : function (this: Event) {return this.ctrlKey}
  },
})

export { Event_ext }
