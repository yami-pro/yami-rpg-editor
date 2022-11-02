'use strict'

import { FrameGenerator } from './frame-generator.js'
import { Window } from '../tools/window.js'

// ******************************** 图块帧生成器窗口加载 ********************************

// 初始化
FrameGenerator.initialize = function () {
  // 写入参数
  $('#autoTile-generateFrames-strideX').write(0)
  $('#autoTile-generateFrames-strideY').write(0)
  $('#autoTile-generateFrames-count').write(1)

  // 侦听事件
  $('#autoTile-generateFrames').on('closed', this.windowClosed)
  $('#autoTile-generateFrames-confirm').on('click', this.confirm)
}

// 打开窗口
FrameGenerator.open = function (callback) {
  this.callback = callback
  Window.open('autoTile-generateFrames')
  $('#autoTile-generateFrames-strideX').getFocus('all')
}

// 窗口 - 已关闭事件
FrameGenerator.windowClosed = function (event) {
  this.callback = null
}.bind(FrameGenerator)

// 确定按钮 - 鼠标点击事件
FrameGenerator.confirm = function (event) {
  const strideX = $('#autoTile-generateFrames-strideX').read()
  const strideY = $('#autoTile-generateFrames-strideY').read()
  const count = $('#autoTile-generateFrames-count').read()
  if (strideX === 0 && strideY === 0) {
    return $('#autoTile-generateFrames-strideX').getFocus()
  }
  this.callback(strideX, strideY, count)
  Window.close('autoTile-generateFrames')
}.bind(FrameGenerator)
