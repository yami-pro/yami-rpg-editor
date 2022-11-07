'use strict'

import { getElementReader } from '../util/index.js'
import * as Yami from '../yami.js'

const {
  PresetElement,
  VariableGetter,
  Window
} = Yami

// ******************************** 祖先元素访问器窗口 ********************************

const AncestorGetter = {
  // properties
  target: null,
  // methods
  initialize: null,
  open: null,
  // events
  confirm: null,
}

// ******************************** 祖先元素访问器窗口加载 ********************************

// 初始化
AncestorGetter.initialize = function () {
  // 创建访问器类型选项
  const inclusions = [
    'trigger',
    'latest',
    'by-id',
    'variable',
  ]
  $('#ancestorGetter-type').loadItems(
    $('#elementGetter-type').dataItems.filter(
      a => inclusions.includes(a.value)
  ))

  // 设置关联元素
  $('#ancestorGetter-type').enableHiddenMode().relate([
    {case: 'variable', targets: [
      $('#ancestorGetter-variable'),
    ]},
  ])

  // 侦听事件
  $('#ancestorGetter-confirm').on('click', this.confirm)
}

// 打开窗口
AncestorGetter.open = function (target) {
  this.target = target
  Window.open('ancestorGetter')

  let presetId = PresetElement.getDefaultPresetId()
  let variable = {type: 'local', key: ''}
  const element = target.dataValue
  switch (element.type) {
    case 'trigger':
    case 'latest':
      break
    case 'by-id':
      presetId = element.presetId
      break
    case 'variable':
      variable = element.variable
      break
  }
  $('#ancestorGetter-type').write(element.type)
  $('#ancestorGetter-presetId').write(presetId)
  $('#ancestorGetter-variable').write(variable)
  $('#ancestorGetter-type').getFocus()
}

// 确定按钮 - 鼠标点击事件
AncestorGetter.confirm = function (event) {
  const read = getElementReader('ancestorGetter')
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
        return $('#ancestorGetter-presetId').getFocus()
      }
      getter = {type, presetId}
      break
    }
    case 'variable': {
      const variable = read('variable')
      if (VariableGetter.isNone(variable)) {
        return $('#ancestorGetter-variable').getFocus()
      }
      getter = {type, variable}
      break
    }
  }
  this.target.input(getter)
  Window.close('ancestorGetter')
}.bind(AncestorGetter)

// ******************************** 祖先元素访问器窗口导出 ********************************

export { AncestorGetter }
