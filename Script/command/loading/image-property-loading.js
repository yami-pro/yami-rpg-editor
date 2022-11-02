'use strict'

import { ImageProperty } from '../image-property.js'
import { Window } from '../../tools/window.js'

// ******************************** 设置图像 - 属性窗口加载 ********************************

// 初始化
ImageProperty.initialize = function () {
  // 创建属性选项
  $('#setImage-property-key').loadItems([
    {name: 'Image', value: 'image'},
    {name: 'Display', value: 'display'},
    {name: 'Flip', value: 'flip'},
    {name: 'Blend', value: 'blend'},
    {name: 'Shift X', value: 'shiftX'},
    {name: 'Shift Y', value: 'shiftY'},
    {name: 'Clip X', value: 'clip-0'},
    {name: 'Clip Y', value: 'clip-1'},
    {name: 'Clip Width', value: 'clip-2'},
    {name: 'Clip Height', value: 'clip-3'},
  ])

  // 设置属性关联元素
  $('#setImage-property-key').enableHiddenMode().relate([
    {case: 'image', targets: [
      $('#setImage-property-image'),
    ]},
    {case: 'display', targets: [
      $('#setImage-property-display'),
    ]},
    {case: 'flip', targets: [
      $('#setImage-property-flip'),
    ]},
    {case: 'blend', targets: [
      $('#setImage-property-blend'),
    ]},
    {case: 'shiftX', targets: [
      $('#setImage-property-shiftX'),
    ]},
    {case: 'shiftY', targets: [
      $('#setImage-property-shiftY'),
    ]},
    {case: 'clip-0', targets: [
      $('#setImage-property-clip-0'),
    ]},
    {case: 'clip-1', targets: [
      $('#setImage-property-clip-1'),
    ]},
    {case: 'clip-2', targets: [
      $('#setImage-property-clip-2'),
    ]},
    {case: 'clip-3', targets: [
      $('#setImage-property-clip-3'),
    ]},
  ])

  // 创建显示选项
  $('#setImage-property-display').loadItems($('#uiImage-display').dataItems)

  // 创建翻转选项
  $('#setImage-property-flip').loadItems($('#uiImage-flip').dataItems)

  // 创建混合模式选项
  $('#setImage-property-blend').loadItems($('#uiImage-blend').dataItems)

  // 侦听事件
  $('#setImage-property-confirm').on('click', this.confirm)
}

// 解析属性
ImageProperty.parse = function ({key, value}) {
  const get = Local.createGetter('command.setImage')
  const name = get(key)
  switch (key) {
    case 'image':
      return `${name}(${Command.parseFileName(value)})`
    case 'display':
      return `${name}(${get('display.' + value)})`
    case 'flip':
      return `${name}(${get('flip.' + value)})`
    case 'blend':
      return `${name}(${Command.parseBlend(value)})`
    case 'shiftX':
    case 'shiftY':
    case 'clip-0':
    case 'clip-1':
    case 'clip-2':
    case 'clip-3':
      return `${name}(${Command.parseVariableNumber(value)})`
  }
}

// 打开数据
ImageProperty.open = function ({key = 'image', value = ''} = {}) {
  Window.open('setImage-property')
  const write = getElementWriter('setImage-property')
  let image = ''
  let display = 'stretch'
  let flip = 'none'
  let blend = 'normal'
  let shiftX = 0
  let shiftY = 0
  let clipX = 0
  let clipY = 0
  let clipWidth = 0
  let clipHeight = 0
  switch (key) {
    case 'image':
      image = value
      break
    case 'display':
      display = value
      break
    case 'flip':
      flip = value
      break
    case 'blend':
      blend = value
      break
    case 'shiftX':
      shiftX = value
      break
    case 'shiftY':
      shiftY = value
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
  }
  write('key', key)
  write('image', image)
  write('display', display)
  write('flip', flip)
  write('blend', blend)
  write('shiftX', shiftX)
  write('shiftY', shiftY)
  write('clip-0', clipX)
  write('clip-1', clipY)
  write('clip-2', clipWidth)
  write('clip-3', clipHeight)
  $('#setImage-property-key').getFocus()
}

// 保存数据
ImageProperty.save = function () {
  const read = getElementReader('setImage-property')
  const key = read('key')
  let value
  switch (key) {
    case 'image':
      value = read('image')
      break
    case 'display':
      value = read('display')
      break
    case 'flip':
      value = read('flip')
      break
    case 'blend':
      value = read('blend')
      break
    case 'shiftX':
      value = read('shiftX')
      break
    case 'shiftY':
      value = read('shiftY')
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
  }
  Window.close('setImage-property')
  return {key, value}
}

// 确定按钮 - 鼠标点击事件
ImageProperty.confirm = function (event) {
  return ImageProperty.target.save()
}
