'use strict'

// ******************************** 指针对象 ********************************

// 使用 #cursor-region 来改变指针样式
// 可以避免更新所有子元素继承到指针属性, 从而提高性能
// 同时解决了一些元素无法继承指针样式的问题

const Cursor = {
  // properties
  region: $('#cursor-region'),
  // methods
  open: null,
  close: null,
}

// 打开指针样式
Cursor.open = function (className) {
  this.region.addClass(className)
}

// 关闭指针样式
Cursor.close = function (className) {
  this.region.removeClass(className)
}

export { Cursor }
