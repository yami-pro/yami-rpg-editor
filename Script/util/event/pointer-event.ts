"use strict"

import { MouseEvent_ext } from "../../yami"

// ******************************** 指针事件方法 ********************************

interface PointerEventExt extends MouseEvent_ext {
  scrollLeft: number
  scrollTop: number

  relate: (event: any) => boolean
  isMouseType: () => boolean
}

interface IPointerEvent extends PointerEvent, PointerEventExt {}

const prototype_as_obj = <Object>PointerEvent.prototype
const prototype = <IPointerEvent>prototype_as_obj
prototype.scrollLeft = 0
prototype.scrollTop = 0

// 指针事件方法 - 判断是否为鼠标类型
prototype.isMouseType = function () {
  return this.pointerType === 'mouse'
}

// 指针事件方法 - 判断两个事件是否有关联
prototype.relate = function (event: PointerEvent) {
  return this.pointerId === event.pointerId
}

export { IPointerEvent }
