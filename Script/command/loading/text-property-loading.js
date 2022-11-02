'use strict'

import { TextProperty } from '../text-property.js'

// ******************************** 设置文本 - 属性窗口加载 ********************************

// 初始化
TextProperty.initialize = function () {
  // 创建属性选项
  $('#setText-property-key').loadItems([
    {name: 'Content', value: 'content'},
    {name: 'Size', value: 'size'},
    {name: 'Line Spacing', value: 'lineSpacing'},
    {name: 'Letter Spacing', value: 'letterSpacing'},
    {name: 'Color', value: 'color'},
    {name: 'Font', value: 'font'},
    {name: 'Effect', value: 'effect'},
    {name: 'Blend', value: 'blend'},
  ])

  // 设置属性关联元素
  $('#setText-property-key').enableHiddenMode().relate([
    {case: 'content', targets: [
      $('#setText-property-content'),
    ]},
    {case: 'size', targets: [
      $('#setText-property-size'),
    ]},
    {case: 'lineSpacing', targets: [
      $('#setText-property-lineSpacing'),
    ]},
    {case: 'letterSpacing', targets: [
      $('#setText-property-letterSpacing'),
    ]},
    {case: 'color', targets: [
      $('#setText-property-color'),
    ]},
    {case: 'font', targets: [
      $('#setText-property-font'),
    ]},
    {case: 'effect', targets: [
      $('#setText-property-effect-type'),
    ]},
    {case: 'blend', targets: [
      $('#setText-property-blend'),
    ]},
  ])

  // 设置效果类型关联元素
  $('#setText-property-effect-type').enableHiddenMode().relate([
    {case: 'shadow', targets: [
      $('#setText-property-effect-shadowOffsetX'),
      $('#setText-property-effect-shadowOffsetY'),
      $('#setText-property-effect-color'),
    ]},
    {case: 'stroke', targets: [
      $('#setText-property-effect-strokeWidth'),
      $('#setText-property-effect-color'),
    ]},
    {case: 'outline', targets: [
      $('#setText-property-effect-color'),
    ]},
  ])

  // 创建文字效果选项
  $('#setText-property-effect-type').loadItems($('#uiText-effect-type').dataItems)

  // 创建混合模式选项
  $('#setText-property-blend').loadItems($('#uiText-blend').dataItems)

  // 侦听事件
  $('#setText-property-confirm').on('click', this.confirm)
}

// 解析属性
TextProperty.parse = function ({key, value}) {
  const get = Local.createGetter('command.setText')
  const name = get(key)
  switch (key) {
    case 'content': {
      let string = Command.parseMultiLineString(Command.parseVariableTag(value))
      if (string.length > 40) {
        string = string.slice(0, 40) + '...'
      }
      return `${name}("${string}")`
    }
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
TextProperty.open = function ({key = 'content', value = ''} = {}) {
  Window.open('setText-property')
  const write = getElementWriter('setText-property')
  let content = ''
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
  $('#setText-property-key').getFocus()
}

// 保存数据
TextProperty.save = function () {
  const read = getElementReader('setText-property')
  const key = read('key')
  let value
  switch (key) {
    case 'content':
      value = read('content')
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
  Window.close('setText-property')
  return {key, value}
}

// 确定按钮 - 鼠标点击事件
TextProperty.confirm = function (event) {
  return TextProperty.target.save()
}
