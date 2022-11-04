'use strict'

import { Rename } from '../rename.js'
import * as Yami from '../../yami.js'

// ******************************** 重命名窗口加载 ********************************

// 初始化
Rename.initialize = function () {
  // 侦听事件
  $('#rename').on('closed', this.windowClosed)
  $('#rename-confirm').on('click', this.confirm)
}

// 打开窗口
Rename.open = function (name, callback) {
  this.callback = callback
  Yami.Window.open('rename')
  $('#rename-name').write(name)
  $('#rename-name').getFocus('all')
}

// 窗口 - 已关闭事件
Rename.windowClosed = function (event) {
  this.callback = null
}.bind(Rename)

// 确定按钮 - 鼠标点击事件
Rename.confirm = function (event) {
  this.callback($('#rename-name').read())
  Yami.Window.close('rename')
}.bind(Rename)
