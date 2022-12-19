"use strict"

import {
  FileItem,
  FolderItem
} from "../../yami"

// ******************************** 按钮扩展 ********************************

namespace TypeMap {
  export type tip = (...params: any[]) => any
}

interface Element_props {
  // static
  _padding: number
  element: EventTarget | null
  itemSize: number
  visibleLines: number
  normalCountPerLine: number
  scrollCountPerLine: number
  scrollCount: number
  countPerLine: number
  changed: boolean
  file: FolderItem | FileItem
  context: EventTarget | null
  fileIcon: EventTarget | null
  nameBox: EventTarget | null
  dataValue: any
  dragging: Event | null
  tip: string | TypeMap.tip
  top: number
  left: number
  width: number
  height: number
  visible: boolean
  isImageChanged(): boolean
}

interface Element_ext {
  // prototype
  isInContent(event: Event): boolean
}

// 元素方法 - 判断事件坐标在内容区域上
Element.prototype.isInContent = function (event) {
  const coords = event.getRelativeCoords(this)
  const x = coords.x - this.scrollLeft
  const y = coords.y - this.scrollTop
  return  x >= 0 && x < this.clientWidth &&
          y >= 0 && y < this.clientHeight
}

export {
  Element_ext,
  Element_props
}
