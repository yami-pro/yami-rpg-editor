"use strict"

import {
  VariableGetter,
  Data,
  getElementReader,
  getElementWriter,
  Window
} from "../yami"

// ******************************** 对象变量访问器窗口 ********************************

const ObjectGetter = {
  // properties
  target: null,
  types: null,
  // methods
  initialize: null,
  open: null,
  // events
  confirm: null,
}

// 初始化
ObjectGetter.initialize = function () {
  // 设置对象变量类型关联元素
  $('#objectGetter-type').enableHiddenMode().relate([
    {case: 'local', targets: [$('#objectGetter-common-key')]},
    {case: 'global', targets: [$('#objectGetter-global-key')]},
  ])

  // 侦听事件
  $('#objectGetter-confirm').on('click', this.confirm)
}

// 打开窗口
ObjectGetter.open = function (target) {
  this.target = target
  Window.open('objectGetter')

  // 创建对象变量类型选项
  // 打开元素访问器时则过滤掉元素属性选项
  $('#objectGetter-type').loadItems(
    !Window.isWindowOpen('elementGetter')
  ? VariableGetter.types.object
  : VariableGetter.types.object2
  )

  const variable = target.dataValue
  const type = variable.type
  let commonKey = ''
  let globalKey = ''
  switch (type) {
    case 'local':
      commonKey = variable.key
      break
    case 'global':
      globalKey = variable.key
      break
  }
  const write = getElementWriter('objectGetter')
  write('type', type)
  write('common-key', commonKey)
  write('global-key', globalKey)
  $('#objectGetter-type').getFocus()
}

// 确定按钮 - 鼠标点击事件
ObjectGetter.confirm = function (event) {
  const read = getElementReader('objectGetter')
  const type = read('type')
  let getter
  switch (type) {
    case 'local': {
      const key = read('common-key').trim()
      if (!key) {
        return $('#objectGetter-common-key').getFocus()
      }
      getter = {type, key}
      break
    }
    case 'global': {
      const key = read('global-key')
      const variable = Data.variables.map[key]
      if (typeof variable?.value !== 'object') {
        return $('#objectGetter-global-key').getFocus()
      }
      getter = {type, key}
      break
    }
  }
  this.target.input(getter)
  Window.close('objectGetter')
}.bind(ObjectGetter)

// ******************************** 对象变量访问器窗口导出 ********************************

export { ObjectGetter }
