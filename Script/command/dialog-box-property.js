'use strict'

import * as Yami from '../yami.js'

const {
  Color,
  Command,
  getElementReader,
  getElementWriter,
  Local,
  Window
} = Yami

// ******************************** 设置对话框 - 属性窗口 ********************************

const DialogBoxProperty = {
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

// ******************************** 设置对话框 - 属性窗口加载 ********************************

// 初始化
DialogBoxProperty.initialize = function () {
  // 创建属性选项
  $('#setDialogBox-property-key').loadItems([
    {name: 'Content', value: 'content'},
    {name: 'Print Interval', value: 'interval'},
    {name: 'Size', value: 'size'},
    {name: 'Line Spacing', value: 'lineSpacing'},
    {name: 'Letter Spacing', value: 'letterSpacing'},
    {name: 'Color', value: 'color'},
    {name: 'Font', value: 'font'},
    {name: 'Effect', value: 'effect'},
    {name: 'Blend', value: 'blend'},
  ])

  // 设置属性关联元素
  $('#setDialogBox-property-key').enableHiddenMode().relate([
    {case: 'content', targets: [
      $('#setDialogBox-property-content'),
    ]},
    {case: 'interval', targets: [
      $('#setDialogBox-property-interval'),
    ]},
    {case: 'size', targets: [
      $('#setDialogBox-property-size'),
    ]},
    {case: 'lineSpacing', targets: [
      $('#setDialogBox-property-lineSpacing'),
    ]},
    {case: 'letterSpacing', targets: [
      $('#setDialogBox-property-letterSpacing'),
    ]},
    {case: 'color', targets: [
      $('#setDialogBox-property-color'),
    ]},
    {case: 'font', targets: [
      $('#setDialogBox-property-font'),
    ]},
    {case: 'effect', targets: [
      $('#setDialogBox-property-effect-type'),
    ]},
    {case: 'blend', targets: [
      $('#setDialogBox-property-blend'),
    ]},
  ])

  // 设置效果类型关联元素
  $('#setDialogBox-property-effect-type').enableHiddenMode().relate([
    {case: 'shadow', targets: [
      $('#setDialogBox-property-effect-shadowOffsetX'),
      $('#setDialogBox-property-effect-shadowOffsetY'),
      $('#setDialogBox-property-effect-color'),
    ]},
    {case: 'stroke', targets: [
      $('#setDialogBox-property-effect-strokeWidth'),
      $('#setDialogBox-property-effect-color'),
    ]},
    {case: 'outline', targets: [
      $('#setDialogBox-property-effect-color'),
    ]},
  ])

  // 创建文字效果选项
  $('#setDialogBox-property-effect-type').loadItems($('#uiDialogBox-effect-type').dataItems)

  // 创建混合模式选项
  $('#setDialogBox-property-blend').loadItems($('#uiDialogBox-blend').dataItems)

  // 侦听事件
  $('#setDialogBox-property-confirm').on('click', this.confirm)
}

// 解析属性
DialogBoxProperty.parse = function ({key, value}) {
  const get = Local.createGetter('command.setDialogBox')
  const name = get(key)
  switch (key) {
    case 'content': {
      let string = Command.parseMultiLineString(Command.parseVariableTag(value))
      if (string.length > 40) {
        string = string.slice(0, 40) + '...'
      }
      return `${name}("${string}")`
    }
    case 'interval':
    case 'size':
    case 'lineSpacing':
    case 'letterSpacing':
      return `${name}(${value})`
    case 'color':
      return `${name}(#${Color.simplifyHexColor(value)})`
    case 'font':
      return `${name}(${value || get('font.default')})`
    case 'effect':
      switch (value.type) {
        case 'none':
          return `${name}(${get('effect.none')})`
        case 'shadow': {
          const x = value.shadowOffsetX
          const y = value.shadowOffsetY
          const color = Color.simplifyHexColor(value.color)
          return `${name}(${get('effect.shadow')}, ${x}, ${y}, #${color})`
        }
        case 'stroke': {
          const width = value.strokeWidth
          const color = Color.simplifyHexColor(value.color)
          return `${name}(${get('effect.stroke')}, ${width}, #${color})`
        }
        case 'outline': {
          const color = Color.simplifyHexColor(value.color)
          return `${name}(${get('effect.outline')}, #${color})`
        }
      }
    case 'blend':
      return `${name}(${Command.parseBlend(value)})`
  }
}

// 打开数据
DialogBoxProperty.open = function ({key = 'content', value = ''} = {}) {
  Window.open('setDialogBox-property')
  const write = getElementWriter('setDialogBox-property')
  let content = ''
  let interval = 0
  let size = 16
  let lineSpacing = 0
  let letterSpacing = 0
  let color = 'ffffffff'
  let font = ''
  let effectType = 'none'
  let effectShadowOffsetX = 1
  let effectShadowOffsetY = 1
  let effectStrokeWidth = 1
  let effectColor = '000000ff'
  let blend = 'normal'
  switch (key) {
    case 'content':
      content = value
      break
    case 'interval':
      interval = value
      break
    case 'size':
      size = value
      break
    case 'lineSpacing':
      lineSpacing = value
      break
    case 'letterSpacing':
      letterSpacing = value
      break
    case 'color':
      color = value
      break
    case 'font':
      font = value
      break
    case 'effect':
      effectType = value.type
      effectShadowOffsetX = value.shadowOffsetX ?? effectShadowOffsetX
      effectShadowOffsetY = value.shadowOffsetY ?? effectShadowOffsetY
      effectStrokeWidth = value.strokeWidth ?? effectStrokeWidth
      effectColor = value.color ?? effectColor
      break
    case 'blend':
      blend = value
      break
  }
  write('key', key)
  write('content', content)
  write('interval', interval)
  write('size', size)
  write('lineSpacing', lineSpacing)
  write('letterSpacing', letterSpacing)
  write('color', color)
  write('font', font)
  write('effect-type', effectType)
  write('effect-shadowOffsetX', effectShadowOffsetX)
  write('effect-shadowOffsetY', effectShadowOffsetY)
  write('effect-strokeWidth', effectStrokeWidth)
  write('effect-color', effectColor)
  write('blend', blend)
  $('#setDialogBox-property-key').getFocus()
}

// 保存数据
DialogBoxProperty.save = function () {
  const read = getElementReader('setDialogBox-property')
  const key = read('key')
  let value
  switch (key) {
    case 'content':
      value = read('content')
      break
    case 'interval':
      value = read('interval')
      break
    case 'size':
      value = read('size')
      break
    case 'lineSpacing':
      value = read('lineSpacing')
      break
    case 'letterSpacing':
      value = read('letterSpacing')
      break
    case 'color':
      value = read('color')
      break
    case 'font':
      value = read('font')
      break
    case 'effect':
      switch (read('effect-type')) {
        case 'none':
          value = {
            type: 'none',
          }
          break
        case 'shadow':
          value = {
            type: 'shadow',
            shadowOffsetX: read('effect-shadowOffsetX'),
            shadowOffsetY: read('effect-shadowOffsetY'),
            color: read('effect-color'),
          }
          break
        case 'stroke':
          value = {
            type: 'stroke',
            strokeWidth: read('effect-strokeWidth'),
            color: read('effect-color'),
          }
          break
        case 'outline':
          value = {
            type: 'outline',
            color: read('effect-color'),
          }
          break
      }
      break
    case 'blend':
      value = read('blend')
      break
  }
  Window.close('setDialogBox-property')
  return {key, value}
}

// 确定按钮 - 鼠标点击事件
DialogBoxProperty.confirm = function (event) {
  return DialogBoxProperty.target.save()
}

// ******************************** 设置对话框 - 属性窗口导出 ********************************

export { DialogBoxProperty }
