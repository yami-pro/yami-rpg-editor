'use strict'

import { getElementReader, getElementWriter } from '../util/index.js'
import * as Yami from '../yami.js'

const {
  Editor,
  Window
} = Yami

// ******************************** 默认对象文件夹 ********************************

const ObjectFolder = {
  // methods
  initialize: null,
  open: null,
  // events
  confirm: null,
}

// 初始化
ObjectFolder.initialize = function () {
  // 侦听事件
  $('#object-folder-confirm').on('click', this.confirm)
}

// 打开窗口
ObjectFolder.open = function () {
  Window.open('object-folder')
  const data = Editor.project.scene.defaultFolders
  const write = getElementWriter('object-folder', data)
  write('tilemap')
  write('actor')
  write('region')
  write('light')
  write('animation')
  write('particle')
  write('parallax')
}

// 确定按钮 - 鼠标点击事件
ObjectFolder.confirm = function (event) {
  const read = getElementReader('object-folder')
  Editor.project.scene.defaultFolders = {
    tilemap: read('tilemap'),
    actor: read('actor'),
    region: read('region'),
    light: read('light'),
    animation: read('animation'),
    particle: read('particle'),
    parallax: read('parallax'),
  }
  Window.close('object-folder')
}

// ******************************** 默认对象文件夹导出 ********************************

export { ObjectFolder }
