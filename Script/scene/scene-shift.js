'use strict'

import * as Yami from '../yami.js'

// ******************************** 移动场景 ********************************

const SceneShift = {
  // properties
  callback: null,
  // methods
  initialize: null,
  open: null,
  // events
  windowClosed: null,
  confirm: null,
}

// 初始化
SceneShift.initialize = function () {
  // 侦听事件
  $('#scene-shift').on('closed', this.windowClosed)
  $('#scene-shift-confirm').on('click', this.confirm)
}

// 打开窗口
SceneShift.open = function (callback) {
  this.callback = callback
  Yami.Window.open('scene-shift')
  $('#scene-shift-x').write(0)
  $('#scene-shift-y').write(0)
  $('#scene-shift-x').getFocus('all')
}

// 窗口 - 已关闭事件
SceneShift.windowClosed = function (event) {
  SceneShift.callback = null
}

// 确定按钮 - 鼠标点击事件
SceneShift.confirm = function (event) {
  const x = $('#scene-shift-x').read()
  const y = $('#scene-shift-y').read()
  if (x === 0 && y === 0) {
    return $('#scene-shift-x').getFocus()
  }
  SceneShift.callback(x, y)
  Yami.Window.close('scene-shift')
}

export { SceneShift }
