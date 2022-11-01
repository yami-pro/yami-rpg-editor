'use strict'

// ******************************** 设置文本框 - 属性窗口 ********************************

const TextBoxProperty = {
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

// 初始化
TextBoxProperty.initialize = function () {
  // 创建属性选项
  $('#setTextBox-property-key').loadItems([
    {name: 'Type', value: 'type'},
    {name: 'Text', value: 'text'},
    {name: 'Number', value: 'number'},
    {name: 'Min', value: 'min'},
    {name: 'Max', value: 'max'},
    {name: 'Decimal Places', value: 'decimals'},
    {name: 'Color', value: 'color'},
  ])

  // 设置属性关联元素
  $('#setTextBox-property-key').enableHiddenMode().relate([
    {case: 'type', targets: [
      $('#setTextBox-property-type'),
    ]},
    {case: 'text', targets: [
      $('#setTextBox-property-text'),
    ]},
    {case: 'number', targets: [
      $('#setTextBox-property-number'),
    ]},
    {case: 'min', targets: [
      $('#setTextBox-property-min'),
    ]},
    {case: 'max', targets: [
      $('#setTextBox-property-max'),
    ]},
    {case: 'decimals', targets: [
      $('#setTextBox-property-decimals'),
    ]},
    {case: 'color', targets: [
      $('#setTextBox-property-color'),
    ]},
  ])

  // 创建类型选项
  $('#setTextBox-property-type').loadItems($('#uiTextBox-type').dataItems)

  // 侦听事件
  $('#setTextBox-property-confirm').on('click', this.confirm)
}

// 解析属性
TextBoxProperty.parse = function ({key, value}) {
  const get = Local.createGetter('command.setTextBox')
  const name = get(key)
  switch (key) {
    case 'type':
      return `${name}(${get('type.' + value)})`
    case 'text': {
      let string = Command.parseVariableString(value)
      if (string.length > 40) {
        string = string.slice(0, 40) + '...'
      }
      return `${name}(${string})`
    }
    case 'number':
    case 'min':
    case 'max':
      return `${name}(${Command.parseVariableNumber(value)})`
    case 'decimals':
      return `${name}(${value})`
    case 'color':
      return `${name}(#${Color.simplifyHexColor(value)})`
  }
}

// 打开数据
TextBoxProperty.open = function ({key = 'type', value = 'text'} = {}) {
  Window.open('setTextBox-property')
  const write = getElementWriter('setTextBox-property')
  let type = 'text'
  let text = ''
  let number = 0
  let min = 0
  let max = 0
  let decimals = 0
  let color = 'ffffffff'
  switch (key) {
    case 'type':
      type = value
      break
    case 'text':
      text = value
      break
    case 'number':
      number = value
      break
    case 'min':
      min = value
      break
    case 'max':
      max = value
      break
    case 'decimals':
      decimals = value
      break
    case 'color':
      color = value
      break
  }
  write('key', key)
  write('type', type)
  write('text', text)
  write('number', number)
  write('min', min)
  write('max', max)
  write('decimals', decimals)
  write('color', color)
  $('#setTextBox-property-key').getFocus()
}

// 保存数据
TextBoxProperty.save = function () {
  const read = getElementReader('setTextBox-property')
  const key = read('key')
  let value
  switch (key) {
    case 'type':
      value = read('type')
      break
    case 'text':
      value = read('text')
      break
    case 'number':
      value = read('number')
      break
    case 'min':
      value = read('min')
      break
    case 'max':
      value = read('max')
      break
    case 'decimals':
      value = read('decimals')
      break
    case 'color':
      value = read('color')
      break
  }
  Window.close('setTextBox-property')
  return {key, value}
}

// 确定按钮 - 鼠标点击事件
TextBoxProperty.confirm = function (event) {
  return TextBoxProperty.target.save()
}

export { TextBoxProperty }
