'use strict'

import * as Yami from '../yami.js'

// ******************************** 缩放窗口 ********************************

const Zoom = {
  // methods
  initialize: null,
  getFactor: null,
  open: null,
  // events
  confirm: null,
}

// ******************************** 缩放窗口加载 ********************************

// 初始化
Zoom.initialize = function () {
  // 侦听事件
  $('#zoom-confirm').on('click', this.confirm)
}

// 打开窗口
Zoom.open = function () {
  Yami.Window.open('zoom')
  $('#zoom-factor').write(this.getFactor())
  $('#zoom-factor').getFocus('all')
}

// 获取缩放系数
Zoom.getFactor = function () {
  return require('electron').webFrame.getZoomFactor()
}

// 确定按钮 - 鼠标点击事件
Zoom.confirm = function (event) {
  Yami.Window.close('zoom')
  require('electron').webFrame.setZoomFactor(
    Yami.Editor.config.zoom = $('#zoom-factor').read()
  )
}

// ******************************** 缩放窗口导出 ********************************

export { Zoom }
