'use strict'

import { MouseEvent_ext } from './mouse-event'

// ******************************** 指针事件方法 ********************************

interface PointerEventExt extends MouseEvent_ext {
  relate: (event: any) => boolean
  isMouseType: () => boolean
}

interface IPointerEvent extends PointerEvent, PointerEventExt {}

const prototypeObject = <Object>PointerEvent.prototype
const prototype = <IPointerEvent>prototypeObject

// 指针事件方法 - 判断是否为鼠标类型
prototype.isMouseType = function () {
  return this.pointerType === 'mouse'
}

// 指针事件方法 - 判断两个事件是否有关联
prototype.relate = function (event: PointerEvent) {
  return this.pointerId === event.pointerId
}

export { IPointerEvent }
