'use strict'

import { SetQuantity } from '../set-quantity.js'

// ******************************** 设置数量窗口加载 ********************************

// 初始化
SetQuantity.initialize = function () {
  // 侦听事件
  $('#setQuantity').on('closed', this.windowClosed)
  $('#setQuantity-confirm').on('click', this.confirm)
}

// 打开窗口
SetQuantity.open = function (quantity, maximum, callback) {
  this.callback = callback
  Window.open('setQuantity')
  $('#setQuantity-quantity').input.max = maximum
  $('#setQuantity-quantity').write(quantity)
  $('#setQuantity-quantity').getFocus('all')
}

// 窗口 - 已关闭事件
SetQuantity.windowClosed = function (event) {
  this.callback = null
}.bind(SetQuantity)

// 确定按钮 - 鼠标点击事件
SetQuantity.confirm = function (event) {
  this.callback($('#setQuantity-quantity').read())
  Window.close('setQuantity')
}.bind(SetQuantity)
