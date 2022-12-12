"use strict"

// ******************************** 指针事件方法 ********************************

interface PointerEvent_ext {
  scrollLeft: number
  scrollTop: number

  relate: (event: any) => boolean
  isMouseType: () => boolean
}

PointerEvent.prototype.scrollLeft = 0
PointerEvent.prototype.scrollTop = 0

// 指针事件方法 - 判断是否为鼠标类型
PointerEvent.prototype.isMouseType = function () {
  return this.pointerType === 'mouse'
}

// 指针事件方法 - 判断两个事件是否有关联
PointerEvent.prototype.relate = function (event: PointerEvent) {
  return this.pointerId === event.pointerId
}

export { PointerEvent_ext }
