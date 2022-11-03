'use strict'

import { SetKey } from '../set-key.js'
import { Window } from '../window.js'

// ******************************** 设置键窗口加载 ********************************

// 初始化
SetKey.initialize = function () {
  // 侦听事件
  $('#setKey').on('closed', this.windowClosed)
  $('#setKey-confirm').on('click', this.confirm)
}

// 打开窗口
SetKey.open = function (key, callback) {
  this.callback = callback
  Window.open('setKey')
  $('#setKey-key').write(key)
  $('#setKey-key').getFocus('all')
}

// 窗口 - 已关闭事件
SetKey.windowClosed = function (event) {
  this.callback = null
}.bind(SetKey)

// 确定按钮 - 鼠标点击事件
SetKey.confirm = function (event) {
  this.callback($('#setKey-key').read())
  Window.close('setKey')
}.bind(SetKey)
