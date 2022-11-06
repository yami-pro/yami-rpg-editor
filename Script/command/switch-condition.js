'use strict'

import * as Yami from '../yami.js'

const {
  Command,
  getElementReader,
  getElementWriter,
  IfCondition,
  Local,
  VariableGetter,
  Window
} = Yami

// ******************************** 匹配 - 条件窗口 ********************************

const SwitchCondition = {
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

// ******************************** 匹配 - 条件窗口加载 ********************************

// 初始化
SwitchCondition.initialize = function () {
  // 创建条件类型选项
  $('#switch-condition-type').loadItems([
    {name: 'None', value: 'none'},
    {name: 'Boolean', value: 'boolean'},
    {name: 'Number', value: 'number'},
    {name: 'String', value: 'string'},
    {name: 'Enum String', value: 'enum'},
    {name: 'Keyboard', value: 'keyboard'},
    {name: 'Mouse', value: 'mouse'},
    {name: 'Variable', value: 'variable'},
  ])

  // 设置条件类型关联元素
  $('#switch-condition-type').enableHiddenMode().relate([
    {case: 'boolean', targets: [
      $('#switch-condition-boolean-value'),
    ]},
    {case: 'number', targets: [
      $('#switch-condition-number-value'),
    ]},
    {case: 'string', targets: [
      $('#switch-condition-string-value'),
    ]},
    {case: 'enum', targets: [
      $('#switch-condition-enum-stringId'),
    ]},
    {case: 'keyboard', targets: [
      $('#switch-condition-keyboard-keycode'),
    ]},
    {case: 'mouse', targets: [
      $('#switch-condition-mouse-button'),
    ]},
    {case: 'variable', targets: [
      $('#switch-condition-variable-variable'),
    ]},
  ])

  // 创建布尔值常量选项
  $('#switch-condition-boolean-value').loadItems([
    {name: 'False', value: false},
    {name: 'True', value: true},
  ])

  // 创建鼠标按键选项
  $('#switch-condition-mouse-button').loadItems([
    {name: 'Left Button', value: 0},
    {name: 'Middle Button', value: 1},
    {name: 'Right Button', value: 2},
    {name: 'Back Button', value: 3},
    {name: 'Forward Button', value: 4},
  ])

  // 侦听事件
  $('#switch-condition-confirm').on('click', this.confirm)
}

// 解析条件
SwitchCondition.parse = function (condition) {
  switch (condition.type) {
    case 'none':
      return Local.get('common.none')
    case 'boolean':
    case 'number':
      return condition.value.toString()
    case 'string':
      return `"${Command.parseMultiLineString(condition.value)}"`
    case 'enum': {
      const name = Command.parseEnumString(condition.stringId)
      return `${Local.get('command.switch.enum')}(${name})`
    }
    case 'keyboard': {
      const key = condition.keycode
      const keyboard = Local.get('command.switch.keyboard')
      return `${keyboard}["${key}"]`
    }
    case 'mouse': {
      const button = IfCondition.parseMouseButton(condition.button)
      const mouse = Local.get('command.switch.mouse')
      return `${mouse}[${button}]`
    }
    case 'variable':
      return Command.parseVariable(condition.variable)
  }
}

// 打开数据
SwitchCondition.open = function (condition = {type: 'number', value: 0}) {
  Window.open('switch-condition')
  let booleanValue = false
  let numberValue = 0
  let stringValue = ''
  let enumStringId = ''
  let keyboardKeycode = ''
  let mouseButton = 0
  let variableVariable = {type: 'local', key: ''}
  const write = getElementWriter('switch-condition')
  switch (condition.type) {
    case 'none':
      break
    case 'boolean':
      booleanValue = condition.value
      break
    case 'number':
      numberValue = condition.value
      break
    case 'string':
      stringValue = condition.value
      break
    case 'enum':
      enumStringId = condition.stringId
      break
    case 'keyboard':
      keyboardKeycode = condition.keycode
      break
    case 'mouse':
      mouseButton = condition.button
      break
    case 'variable':
      variableVariable = condition.variable
      break
  }
  write('type', condition.type)
  write('boolean-value', booleanValue)
  write('number-value', numberValue)
  write('string-value', stringValue)
  write('enum-stringId', enumStringId)
  write('keyboard-keycode', keyboardKeycode)
  write('mouse-button', mouseButton)
  write('variable-variable', variableVariable)
  $('#switch-condition-type').getFocus()
}

// 保存数据
SwitchCondition.save = function () {
  const read = getElementReader('switch-condition')
  const type = read('type')
  let condition
  switch (type) {
    case 'none':
      condition = {type}
      break
    case 'boolean': {
      const value = read('boolean-value')
      condition = {type, value}
      break
    }
    case 'number': {
      const value = read('number-value')
      condition = {type, value}
      break
    }
    case 'string': {
      const value = read('string-value')
      condition = {type, value}
      break
    }
    case 'enum': {
      const stringId = read('enum-stringId')
      if (stringId === '') {
        return $('#switch-condition-enum-stringId').getFocus()
      }
      condition = {type, stringId}
      break
    }
    case 'keyboard': {
      const keycode = read('keyboard-keycode')
      if (keycode === '') {
        return $('#switch-condition-keyboard-keycode').getFocus()
      }
      condition = {type, keycode}
      break
    }
    case 'mouse': {
      const button = read('mouse-button')
      condition = {type, button}
      break
    }
    case 'variable': {
      const variable = read('variable-variable')
      if (VariableGetter.isNone(variable)) {
        return $('#switch-condition-variable-variable').getFocus()
      }
      condition = {type, variable}
      break
    }
  }
  Window.close('switch-condition')
  return condition
}

// 确定按钮 - 鼠标点击事件
SwitchCondition.confirm = function (event) {
  return SwitchCondition.target.save()
}

// ******************************** 匹配 - 条件窗口导出 ********************************

export { SwitchCondition }
