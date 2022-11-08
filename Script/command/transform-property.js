'use strict'

import * as Yami from '../yami.js'

const {
  Command,
  getElementReader,
  getElementWriter,
  Local,
  Window
} = Yami

// ******************************** 移动元素 - 属性窗口 ********************************

const TransformProperty = {
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

// ******************************** 移动元素 - 属性窗口加载 ********************************

// 初始化
TransformProperty.initialize = function () {
  // 创建属性选项
  $('#moveElement-property-key').loadItems([
    {name: 'Anchor X', value: 'anchorX'},
    {name: 'Anchor Y', value: 'anchorY'},
    {name: 'X', value: 'x'},
    {name: 'X2', value: 'x2'},
    {name: 'Y', value: 'y'},
    {name: 'Y2', value: 'y2'},
    {name: 'Width', value: 'width'},
    {name: 'Width2', value: 'width2'},
    {name: 'Height', value: 'height'},
    {name: 'Height2', value: 'height2'},
    {name: 'Rotation', value: 'rotation'},
    {name: 'Scale X', value: 'scaleX'},
    {name: 'Scale Y', value: 'scaleY'},
    {name: 'Skew X', value: 'skewX'},
    {name: 'Skew Y', value: 'skewY'},
    {name: 'Opacity', value: 'opacity'},
  ])

  // 设置属性关联元素
  $('#moveElement-property-key').enableHiddenMode().relate([
    {case: 'anchorX', targets: [
      $('#moveElement-property-anchorX'),
    ]},
    {case: 'anchorY', targets: [
      $('#moveElement-property-anchorY'),
    ]},
    {case: 'x', targets: [
      $('#moveElement-property-x'),
    ]},
    {case: 'x2', targets: [
      $('#moveElement-property-x2'),
    ]},
    {case: 'y', targets: [
      $('#moveElement-property-y'),
    ]},
    {case: 'y2', targets: [
      $('#moveElement-property-y2'),
    ]},
    {case: 'width', targets: [
      $('#moveElement-property-width'),
    ]},
    {case: 'width2', targets: [
      $('#moveElement-property-width2'),
    ]},
    {case: 'height', targets: [
      $('#moveElement-property-height'),
    ]},
    {case: 'height2', targets: [
      $('#moveElement-property-height2'),
    ]},
    {case: 'rotation', targets: [
      $('#moveElement-property-rotation'),
    ]},
    {case: 'scaleX', targets: [
      $('#moveElement-property-scaleX'),
    ]},
    {case: 'scaleY', targets: [
      $('#moveElement-property-scaleY'),
    ]},
    {case: 'skewX', targets: [
      $('#moveElement-property-skewX'),
    ]},
    {case: 'skewY', targets: [
      $('#moveElement-property-skewY'),
    ]},
    {case: 'opacity', targets: [
      $('#moveElement-property-opacity'),
    ]},
  ])

  // 侦听事件
  $('#moveElement-property-confirm').on('click', this.confirm)
}

// 解析属性
TransformProperty.parse = function ({key, value}) {
  return `${Local.get('command.moveElement.' + key)}(${Command.parseVariableNumber(value)})`
}

// 打开数据
TransformProperty.open = function ({key = 'anchorX', value = 0} = {}) {
  Window.open('moveElement-property')
  const properties = {
    anchorX: 0,
    anchorY: 0,
    x: 0,
    x2: 0,
    y: 0,
    y2: 0,
    width: 0,
    width2: 0,
    height: 0,
    height2: 0,
    rotation: 0,
    scaleX: 1,
    scaleY: 1,
    skewX: 0,
    skewY: 0,
    opacity: 1,
  }
  if (key in properties) {
    properties[key] = value
  }
  const write = getElementWriter('moveElement-property', properties)
  write('key', key)
  write('anchorX')
  write('anchorY')
  write('x')
  write('x2')
  write('y')
  write('y2')
  write('width')
  write('width2')
  write('height')
  write('height2')
  write('rotation')
  write('scaleX')
  write('scaleY')
  write('skewX')
  write('skewY')
  write('opacity')
  $('#moveElement-property-key').getFocus()
}

// 保存数据
TransformProperty.save = function () {
  const read = getElementReader('moveElement-property')
  const key = read('key')
  const value = read(key)
  Window.close('moveElement-property')
  return {key, value}
}

// 确定按钮 - 鼠标点击事件
TransformProperty.confirm = function (event) {
  return TransformProperty.target.save()
}

// ******************************** 移动元素 - 属性窗口导出 ********************************

export { TransformProperty }
