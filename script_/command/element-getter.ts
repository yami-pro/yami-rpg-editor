"use strict"

import {
  getElementReader,
  PresetElement,
  VariableGetter,
  Window
} from "../yami"

// ******************************** 元素访问器窗口 ********************************

const ElementGetter = {
  // properties
  target: null,
  // methods
  initialize: null,
  open: null,
  // events
  confirm: null,
}

// ******************************** 元素访问器窗口加载 ********************************

// 初始化
ElementGetter.initialize = function () {
  // 创建访问器类型选项
  $('#elementGetter-type').loadItems([
    {name: 'Event Trigger Element', value: 'trigger'},
    {name: 'Latest Element', value: 'latest'},
    {name: 'By Element ID', value: 'by-id'},
    {name: 'By Ancestor And ID', value: 'by-ancestor-and-id'},
    {name: 'By Parent And Index', value: 'by-index'},
    {name: 'Variable', value: 'variable'},
  ])

  // 设置关联元素
  $('#elementGetter-type').enableHiddenMode().relate([
    {case: 'by-id', targets: [
      $('#elementGetter-presetId'),
    ]},
    {case: 'by-ancestor-and-id', targets: [
      $('#elementGetter-ancestor'),
      $('#elementGetter-presetId'),
    ]},
    {case: 'by-index', targets: [
      $('#elementGetter-ancestor'),
      $('#elementGetter-index'),
    ]},
    {case: 'variable', targets: [
      $('#elementGetter-variable'),
    ]},
  ])

  // 侦听事件
  $('#elementGetter-confirm').on('click', this.confirm)
}

// 打开窗口
ElementGetter.open = function (target) {
  this.target = target
  Window.open('elementGetter')

  let index = 0
  let presetId = PresetElement.getDefaultPresetId()
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
    case 'by-ancestor-and-id':
      ancestor = element.ancestor
      presetId = element.presetId
      break
    case 'by-index':
      ancestor = element.parent
      index = element.index
      break
    case 'variable':
      variable = element.variable
      break
  }
  $('#elementGetter-type').write(element.type)
  $('#elementGetter-ancestor').write(ancestor)
  $('#elementGetter-presetId').write(presetId)
  $('#elementGetter-index').write(index)
  $('#elementGetter-variable').write(variable)
  $('#elementGetter-type').getFocus()
}

// 确定按钮 - 鼠标点击事件
ElementGetter.confirm = function (event) {
  const read = getElementReader('elementGetter')
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
    case 'by-ancestor-and-id': {
      const ancestor = read('ancestor')
      const presetId = read('presetId')
      if (presetId === '') {
        return $('#elementGetter-presetId').getFocus()
      }
      getter = {type, ancestor, presetId}
      break
    }
    case 'by-index': {
      const parent = read('ancestor')
      const index = read('index')
      getter = {type, parent, index}
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
  Window.close('elementGetter')
}.bind(ElementGetter)

// ******************************** 元素访问器窗口导出 ********************************

export { ElementGetter }
