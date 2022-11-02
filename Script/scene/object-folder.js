'use strict'

import { Window } from '../tools/window.js'

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

export { ObjectFolder }
