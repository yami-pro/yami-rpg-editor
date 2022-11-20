'use strict'

// ******************************** 指针事件方法 ********************************

// 指针事件方法 - 判断是否为鼠标类型
// PointerEvent.prototype.isMouseType = function () {
//   return this.pointerType === 'mouse'
// }

// 指针事件方法 - 判断两个事件是否有关联
PointerEvent.prototype.relate = function (event) {
  return this.pointerId === event.pointerId
}
