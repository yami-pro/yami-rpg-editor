'use strict'

import { NodeList } from '../components/node-list.js'

// ******************************** 节点列表方法 ********************************

// 节点列表 - 添加事件
NodeList.prototype.on = function (type, listener, options) {
  for (const element of this) {
    element.on(type, listener, options)
  }
  return this
}

// 节点列表 - 启用元素
NodeList.prototype.enable = function () {
  for (const element of this) {
    element.enable()
  }
}

// 节点列表 - 禁用元素
NodeList.prototype.disable = function () {
  for (const element of this) {
    element.disable()
  }
}
