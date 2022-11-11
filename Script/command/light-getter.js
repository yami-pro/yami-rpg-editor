'use strict'

import {
  getElementReader,
  PresetObject,
  VariableGetter,
  Window
} from '../yami.js'

// ******************************** 光源访问器窗口 ********************************

const LightGetter = {
  // properties
  target: null,
  // methods
  initialize: null,
  open: null,
  // events
  confirm: null,
}

// ******************************** 光源访问器窗口加载 ********************************

// 初始化
LightGetter.initialize = function () {
  // 创建访问器类型选项
  $('#lightGetter-type').loadItems([
    {name: 'Event Trigger Light', value: 'trigger'},
    {name: 'Latest Light', value: 'latest'},
    {name: 'By Light ID', value: 'by-id'},
    {name: 'Variable', value: 'variable'},
  ])

  // 设置关联元素
  $('#lightGetter-type').enableHiddenMode().relate([
    {case: 'by-id', targets: [
      $('#lightGetter-presetId'),
    ]},
    {case: 'variable', targets: [
      $('#lightGetter-variable'),
    ]},
  ])

  // 侦听事件
  $('#lightGetter-confirm').on('click', this.confirm)
}

// 打开窗口
LightGetter.open = function (target) {
  this.target = target
  Window.open('lightGetter')

  let presetId = PresetObject.getDefaultPresetId('light')
  let variable = {type: 'local', key: ''}
  const light = target.dataValue
  switch (light.type) {
    case 'trigger':
    case 'latest':
      break
    case 'by-id':
      presetId = light.presetId
      break
    case 'variable':
      variable = light.variable
      break
  }
  $('#lightGetter-type').write(light.type)
  $('#lightGetter-presetId').write(presetId)

  $('#lightGetter-variable').write(variable)
  $('#lightGetter-type').getFocus()
}

// 确定按钮 - 鼠标点击事件
LightGetter.confirm = function (event) {
  const read = getElementReader('lightGetter')
  const type = read('type')
  let getter
  switch (type) {
    case 'trigger':
    case 'latest':
      getter = {type}
      break
    case 'by-id': {
      const presetId = read('presetId')
      if (presetId === '') {
        return $('#lightGetter-presetId').getFocus()
      }
      getter = {type, presetId}
      break
    }
    case 'variable': {
      const variable = read('variable')
      if (VariableGetter.isNone(variable)) {
        return $('#lightGetter-variable').getFocus()
      }
      getter = {type, variable}
      break
    }
  }
  this.target.input(getter)
  Window.close('lightGetter')
}.bind(LightGetter)

// ******************************** 光源访问器窗口导出 ********************************

export { LightGetter }
