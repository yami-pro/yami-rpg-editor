'use strict'

import { getElementReader, getElementWriter } from '../util/index.js'
import * as Yami from '../yami.js'

const {
  Command,
  Local,
  Window
} = Yami

// ******************************** 设置进度条 - 属性窗口 ********************************

const ProgressBarProperty = {
  // properties
  target: null,
  // methods
  initialize: null,
  parse: null,
  open: null,
  save: null,
  // events
  confirm: null,
}

// ******************************** 设置进度条 - 属性窗口加载 ********************************

// 初始化
ProgressBarProperty.initialize = function () {
  // 创建属性选项
  $('#setProgressBar-property-key').loadItems([
    {name: 'Image', value: 'image'},
    {name: 'Display', value: 'display'},
    {name: 'Blend', value: 'blend'},
    {name: 'Progress', value: 'progress'},
    {name: 'Clip X', value: 'clip-0'},
    {name: 'Clip Y', value: 'clip-1'},
    {name: 'Clip Width', value: 'clip-2'},
    {name: 'Clip Height', value: 'clip-3'},
    {name: 'Color Red', value: 'color-0'},
    {name: 'Color Green', value: 'color-1'},
    {name: 'Color Blue', value: 'color-2'},
    {name: 'Color Alpha', value: 'color-3'},
  ])

  // 设置属性关联元素
  $('#setProgressBar-property-key').enableHiddenMode().relate([
    {case: 'image', targets: [
      $('#setProgressBar-property-image'),
    ]},
    {case: 'display', targets: [
      $('#setProgressBar-property-display'),
    ]},
    {case: 'blend', targets: [
      $('#setProgressBar-property-blend'),
    ]},
    {case: 'progress', targets: [
      $('#setProgressBar-property-progress'),
    ]},
    {case: 'clip-0', targets: [
      $('#setProgressBar-property-clip-0'),
    ]},
    {case: 'clip-1', targets: [
      $('#setProgressBar-property-clip-1'),
    ]},
    {case: 'clip-2', targets: [
      $('#setProgressBar-property-clip-2'),
    ]},
    {case: 'clip-3', targets: [
      $('#setProgressBar-property-clip-3'),
    ]},
    {case: 'color-0', targets: [
      $('#setProgressBar-property-color-0'),
    ]},
    {case: 'color-1', targets: [
      $('#setProgressBar-property-color-1'),
    ]},
    {case: 'color-2', targets: [
      $('#setProgressBar-property-color-2'),
    ]},
    {case: 'color-3', targets: [
      $('#setProgressBar-property-color-3'),
    ]},
  ])

  // 创建显示选项
  $('#setProgressBar-property-display').loadItems($('#uiProgressBar-display').dataItems)

  // 创建混合模式选项
  $('#setProgressBar-property-blend').loadItems($('#uiProgressBar-blend').dataItems)

  // 侦听事件
  $('#setProgressBar-property-confirm').on('click', this.confirm)
}

// 解析属性
ProgressBarProperty.parse = function ({key, value}) {
  const get = Local.createGetter('command.setProgressBar')
  const name = get(key)
  switch (key) {
    case 'image':
      return `${name}(${Command.parseFileName(value)})`
    case 'display':
      return `${name}(${get('display.' + value)})`
    case 'blend':
      return `${name}(${Command.parseBlend(value)})`
    case 'progress':
    case 'clip-0':
    case 'clip-1':
    case 'clip-2':
    case 'clip-3':
    case 'color-0':
    case 'color-1':
    case 'color-2':
    case 'color-3':
      return `${name}(${Command.parseVariableNumber(value)})`
  }
}

// 打开数据
ProgressBarProperty.open = function ({key = 'image', value = ''} = {}) {
  Window.open('setProgressBar-property')
  const write = getElementWriter('setProgressBar-property')
  let image = ''
  let display = 'stretch'
  let blend = 'normal'
  let progress = 0
  let clipX = 0
  let clipY = 0
  let clipWidth = 0
  let clipHeight = 0
  let colorRed = 0
  let colorGreen = 0
  let colorBlue = 0
  let colorAlpha = 0
  switch (key) {
    case 'image':
      image = value
      break
    case 'display':
      display = value
      break
    case 'blend':
      blend = value
      break
    case 'progress':
      progress = value
      break
    case 'clip-0':
      clipX = value
      break
    case 'clip-1':
      clipY = value
      break
    case 'clip-2':
      clipWidth = value
      break
    case 'clip-3':
      clipHeight = value
      break
    case 'color-0':
      colorRed = value
      break
    case 'color-1':
      colorGreen = value
      break
    case 'color-2':
      colorBlue = value
      break
    case 'color-3':
      colorAlpha = value
      break
  }
  write('key', key)
  write('image', image)
  write('display', display)
  write('blend', blend)
  write('progress', progress)
  write('clip-0', clipX)
  write('clip-1', clipY)
  write('clip-2', clipWidth)
  write('clip-3', clipHeight)
  write('color-0', colorRed)
  write('color-1', colorGreen)
  write('color-2', colorBlue)
  write('color-3', colorAlpha)
  $('#setProgressBar-property-key').getFocus()
}

// 保存数据
ProgressBarProperty.save = function () {
  const read = getElementReader('setProgressBar-property')
  const key = read('key')
  let value
  switch (key) {
    case 'image':
      value = read('image')
      break
    case 'display':
      value = read('display')
      break
    case 'blend':
      value = read('blend')
      break
    case 'progress':
      value = read('progress')
      break
    case 'clip-0':
      value = read('clip-0')
      break
    case 'clip-1':
      value = read('clip-1')
      break
    case 'clip-2':
      value = read('clip-2')
      break
    case 'clip-3':
      value = read('clip-3')
      break
    case 'color-0':
      value = read('color-0')
      break
    case 'color-1':
      value = read('color-1')
      break
    case 'color-2':
      value = read('color-2')
      break
    case 'color-3':
      value = read('color-3')
      break
  }
  Window.close('setProgressBar-property')
  return {key, value}
}

// 确定按钮 - 鼠标点击事件
ProgressBarProperty.confirm = function (event) {
  return ProgressBarProperty.target.save()
}

// ******************************** 设置进度条 - 属性窗口导出 ********************************

export { ProgressBarProperty }
