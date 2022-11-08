'use strict'

import {
  getElementReader,
  VariableGetter,
  Window
} from '../yami.js'

// ******************************** 触发器访问器窗口 ********************************

const TriggerGetter = {
  // properties
  target: null,
  // methods
  initialize: null,
  open: null,
  // events
  confirm: null,
}

// ******************************** 触发器访问器窗口加载 ********************************

// 初始化
TriggerGetter.initialize = function () {
  // 创建访问器类型选项
  $('#triggerGetter-type').loadItems([
    {name: 'Event Trigger', value: 'trigger'},
    {name: 'Latest Trigger', value: 'latest'},
    {name: 'Variable', value: 'variable'},
  ])

  // 设置关联元素
  $('#triggerGetter-type').enableHiddenMode().relate([
    {case: 'variable', targets: [
      $('#triggerGetter-variable'),
    ]},
  ])

  // 侦听事件
  $('#triggerGetter-confirm').on('click', this.confirm)
}

// 打开窗口
TriggerGetter.open = function (target) {
  this.target = target
  Window.open('triggerGetter')

  let variable = {type: 'local', key: ''}
  const trigger = target.dataValue
  switch (trigger.type) {
    case 'trigger':
    case 'latest':
      break
    case 'variable':
      variable = trigger.variable
      break
  }
  $('#triggerGetter-type').write(trigger.type)
  $('#triggerGetter-variable').write(variable)
  $('#triggerGetter-type').getFocus()
}

// 确定按钮 - 鼠标点击事件
TriggerGetter.confirm = function (event) {
  const read = getElementReader('triggerGetter')
  const type = read('type')
  let getter
  switch (type) {
    case 'trigger':
    case 'latest':
      getter = {type}
      break
    case 'variable': {
      const variable = read('variable')
      if (VariableGetter.isNone(variable)) {
        return $('#triggerGetter-variable').getFocus()
      }
      getter = {type, variable}
      break
    }
  }
  this.target.input(getter)
  Window.close('triggerGetter')
}.bind(TriggerGetter)

// ******************************** 触发器访问器窗口导出 ********************************

export { TriggerGetter }
