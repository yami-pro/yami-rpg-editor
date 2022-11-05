'use strict'

import { LightGetter } from '../light-getter.js'
import * as Yami from '../../yami.js'

// ******************************** 光源访问器窗口加载 ********************************

// 初始化
LightGetter.initialize = function () {
  // 创建访问器类型选项
  $('#lightGetter-type').loadItems([
    {name: 'Event Trigger Light', value: 'trigger'},
    {name: 'Latest Light', value: 'latest'},
    {name: 'Select By ID', value: 'by-id'},
    {name: 'Select By Name', value: 'by-name'},
    {name: 'Variable', value: 'variable'},
  ])

  // 设置关联元素
  $('#lightGetter-type').enableHiddenMode().relate([
    {case: 'by-id', targets: [
      $('#lightGetter-presetId'),
    ]},
    {case: 'by-name', targets: [
      $('#lightGetter-name'),
    ]},
    {case: 'variable', targets: [
      $('#lightGetter-variable'),
    ]},
  ])

  // 侦听事件
  $('#lightGetter-confirm').on('click', this.confirm)
  Yami.TextSuggestion.listen($('#lightGetter-name'), 'light')
}

// 打开窗口
LightGetter.open = function (target) {
  this.target = target
  Yami.Window.open('lightGetter')

  let name = ''
  let presetId = Yami.PresetObject.getDefaultPresetId('light')
  let variable = {type: 'local', key: ''}
  const light = target.dataValue
  switch (light.type) {
    case 'trigger':
    case 'latest':
      break
    case 'by-id':
      presetId = light.presetId
      break
    case 'by-name':
      name = light.name
      break
    case 'variable':
      variable = light.variable
      break
  }
  $('#lightGetter-type').write(light.type)
  $('#lightGetter-presetId').write(presetId)
  $('#lightGetter-name').write(name)
  $('#lightGetter-variable').write(variable)
  $('#lightGetter-type').getFocus()
}

// 确定按钮 - 鼠标点击事件
LightGetter.confirm = function (event) {
  const read = Yami.getElementReader('lightGetter')
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
    case 'by-name': {
      const name = read('name').trim()
      if (!name) {
        return $('#lightGetter-name').getFocus()
      }
      getter = {type, name}
      break
    }
    case 'variable': {
      const variable = read('variable')
      if (Yami.VariableGetter.isNone(variable)) {
        return $('#lightGetter-variable').getFocus()
      }
      getter = {type, variable}
      break
    }
  }
  this.target.input(getter)
  Yami.Window.close('lightGetter')
}.bind(LightGetter)
