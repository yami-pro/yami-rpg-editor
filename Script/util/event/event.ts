"use strict"

import {
  FileItem,
  FolderItem
} from "../../yami"

// ******************************** 事件访问器 ********************************

type MouseKeyboardEvent = DragEvent & WheelEvent & PointerEvent & KeyboardEvent

interface Event_ext {
  // 属性
  dragKey: boolean
  cmdOrCtrlKey: boolean
  message: string
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
  // 方法
  getRelativeCoords(element: any): {x: number, y: number}
  relate(event: any): boolean
  isMouseType(): boolean
}

Event.prototype.value = null
Event.prototype.mode = null
Event.prototype.scrollLeft = 0
Event.prototype.scrollTop = 0

// 事件方法 - 返回相对于元素的坐标
Event.prototype.getRelativeCoords = function IIFE() {
  const point = {x: 0, y: 0}
  return function (this: MouseKeyboardEvent, element: Element) {
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
Event.prototype.isMouseType = function (this: MouseKeyboardEvent) {
  return this.pointerType === 'mouse'
}

// 指针事件方法 - 判断两个事件是否有关联
Event.prototype.relate = function (this: MouseKeyboardEvent, event: MouseKeyboardEvent) {
  return this.pointerId === event.pointerId
}

Object.defineProperties(Event.prototype, {
  dragKey: {
    get: function (this: MouseKeyboardEvent) {
      return this.spaceKey || this.altKey
    }
  },
  cmdOrCtrlKey: {
    get: navigator.userAgentData.platform === 'macOS'
    ? function (this: MouseKeyboardEvent) {return this.metaKey}
    : function (this: MouseKeyboardEvent) {return this.ctrlKey}
  },
})

export {
  Event_ext,
  MouseKeyboardEvent
}
