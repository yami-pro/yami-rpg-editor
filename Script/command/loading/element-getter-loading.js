'use strict'

import { ElementGetter } from '../element-getter.js'
import { TextSuggestion } from '../text-suggestion.js'
import * as Yami from '../../yami.js'

// ******************************** 元素访问器窗口加载 ********************************

// 初始化
ElementGetter.initialize = function () {
  // 创建访问器类型选项
  $('#elementGetter-type').loadItems([
    {name: 'Event Trigger Element', value: 'trigger'},
    {name: 'Latest Element', value: 'latest'},
    {name: 'Select By ID', value: 'by-id'},
    {name: 'Select By Name', value: 'by-name'},
    {name: 'Select By Ancestor And ID', value: 'by-ancestor-and-id'},
    {name: 'Select By Ancestor And Name', value: 'by-ancestor-and-name'},
    {name: 'Variable', value: 'variable'},
  ])

  // 设置关联元素
  $('#elementGetter-type').enableHiddenMode().relate([
    {case: 'by-id', targets: [
      $('#elementGetter-presetId'),
    ]},
    {case: 'by-name', targets: [
      $('#elementGetter-name'),
    ]},
    {case: 'by-ancestor-and-id', targets: [
      $('#elementGetter-ancestor'),
      $('#elementGetter-presetId'),
    ]},
    {case: 'by-ancestor-and-name', targets: [
      $('#elementGetter-ancestor'),
      $('#elementGetter-name'),
    ]},
    {case: 'variable', targets: [
      $('#elementGetter-variable'),
    ]},
  ])

  // 侦听事件
  $('#elementGetter-confirm').on('click', this.confirm)
  TextSuggestion.listen($('#elementGetter-name'), 'element')
}

// 打开窗口
ElementGetter.open = function (target) {
  this.target = target
  Yami.Window.open('elementGetter')

  let name = ''
  let presetId = Yami.PresetElement.getDefaultPresetId()
  let ancestor = {type: 'trigger'}
  let variable = {type: 'local', key: ''}
  const element = target.dataValue
  switch (element.type) {
    case 'trigger':
    case 'latest':
      break
    case 'by-id':
      presetId = element.presetId
      break
    case 'by-name':
      name = element.name
      break
    case 'by-ancestor-and-id':
      ancestor = element.ancestor
      presetId = element.presetId
      break
    case 'by-ancestor-and-name':
      ancestor = element.ancestor
      name = element.name
      break
    case 'variable':
      variable = element.variable
      break
  }
  $('#elementGetter-type').write(element.type)
  $('#elementGetter-ancestor').write(ancestor)
  $('#elementGetter-presetId').write(presetId)
  $('#elementGetter-name').write(name)
  $('#elementGetter-variable').write(variable)
  $('#elementGetter-type').getFocus()
}

// 确定按钮 - 鼠标点击事件
ElementGetter.confirm = function (event) {
  const read = Yami.getElementReader('elementGetter')
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
        return $('#elementGetter-presetId').getFocus()
      }
      getter = {type, presetId}
      break
    }
    case 'by-name': {
      const name = read('name').trim()
      if (!name) {
        return $('#elementGetter-name').getFocus()
      }
      getter = {type, name}
      break
    }
    case 'by-ancestor-and-id': {
      const ancestor = read('ancestor')
      const presetId = read('presetId')
      if (presetId === '') {
        return $('#elementGetter-presetId').getFocus()
      }
      getter = {type, ancestor, presetId}
      break
    }
    case 'by-ancestor-and-name': {
      const ancestor = read('ancestor')
      const name = read('name').trim()
      if (!name) {
        return $('#elementGetter-name').getFocus()
      }
      getter = {type, ancestor, name}
      break
    }
    case 'variable': {
      const variable = read('variable')
      if (VariableGetter.isNone(variable)) {
        return $('#elementGetter-variable').getFocus()
      }
      getter = {type, variable}
      break
    }
  }
  this.target.input(getter)
  Yami.Window.close('elementGetter')
}.bind(ElementGetter)
