'use strict'

import { StateGetter } from '../state-getter.js'
import * as Yami from '../../yami.js'

// ******************************** 状态访问器窗口加载 ********************************

// 初始化
StateGetter.initialize = function () {
  // 创建访问器类型选项
  $('#stateGetter-type').loadItems([
    {name: 'Event Trigger State', value: 'trigger'},
    {name: 'Latest State', value: 'latest'},
    {name: 'Variable', value: 'variable'},
  ])

  // 设置关联元素
  $('#stateGetter-type').enableHiddenMode().relate([
    {case: 'variable', targets: [
      $('#stateGetter-variable'),
    ]},
  ])

  // 侦听事件
  $('#stateGetter-confirm').on('click', this.confirm)
}

// 打开窗口
StateGetter.open = function (target) {
  this.target = target
  Yami.Window.open('stateGetter')

  let variable = {type: 'local', key: ''}
  const state = target.dataValue
  switch (state.type) {
    case 'trigger':
    case 'latest':
      break
    case 'variable':
      variable = state.variable
      break
  }
  $('#stateGetter-type').write(state.type)
  $('#stateGetter-variable').write(variable)
  $('#stateGetter-type').getFocus()
}

// 确定按钮 - 鼠标点击事件
StateGetter.confirm = function (event) {
  const read = Yami.getElementReader('stateGetter')
  const type = read('type')
  let getter
  switch (type) {
    case 'trigger':
    case 'latest':
      getter = {type}
      break
    case 'variable': {
      const variable = read('variable')
      if (Yami.VariableGetter.isNone(variable)) {
        return $('#stateGetter-variable').getFocus()
      }
      getter = {type, variable}
      break
    }
  }
  this.target.input(getter)
  Yami.Window.close('stateGetter')
}.bind(StateGetter)
