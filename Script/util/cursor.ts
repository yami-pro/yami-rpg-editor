"use strict"

import { IHTMLElement } from "../yami"

// ******************************** 指针对象 ********************************

interface ICursor {
  region: IHTMLElement | null
  open(className: string): void
  close(className: string): void
}

// 使用 #cursor-region 来改变指针样式
// 可以避免更新所有子元素继承到指针属性, 从而提高性能
// 同时解决了一些元素无法继承指针样式的问题

const Cursor = <ICursor>new Object()
Cursor.region = $('#cursor-region')

// 打开指针样式
Cursor.open = function (className) {
  this.region?.addClass(className)
}

// 关闭指针样式
Cursor.close = function (className) {
  this.region?.removeClass(className)
}

// ******************************** 指针对象导出 ********************************

export { Cursor }
