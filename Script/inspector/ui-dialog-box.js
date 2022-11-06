'use strict'

import * as Yami from '../yami.js'

const {
  getElementReader,
  getElementWriter,
  Inspector,
  UI,
  UIElement
} = Yami

// ******************************** 元素 - 对话框页面 ********************************

{
  const UIDialogBox = {
    // properties
    owner: UI,
    target: null,
    // methods
    initialize: null,
    create: null,
    open: null,
    close: null,
    update: null,
    // events
    paramInput: null,
  }

  // 初始化
  UIDialogBox.initialize = function () {
    // 创建字型选项
    $('#uiDialogBox-typeface').loadItems([
      {name: 'Regular', value: 'regular'},
      {name: 'Bold', value: 'bold'},
      {name: 'Italic', value: 'italic'},
      {name: 'Bold Italic', value: 'bold-italic'},
    ])

    // 创建文字效果类型选项
    $('#uiDialogBox-effect-type').loadItems([
      {name: 'None', value: 'none'},
      {name: 'Shadow', value: 'shadow'},
      {name: 'Stroke', value: 'stroke'},
      {name: 'Outline', value: 'outline'},
    ])

    // 创建混合模式选项
    $('#uiDialogBox-blend').loadItems([
      {name: 'Normal', value: 'normal'},
      {name: 'Additive', value: 'additive'},
      {name: 'Subtract', value: 'subtract'},
    ])

    // 同步滑动框和数字框的数值
    $('#uiDialogBox-size-slider').synchronize($('#uiDialogBox-size'))
    $('#uiDialogBox-lineSpacing-slider').synchronize($('#uiDialogBox-lineSpacing'))
    $('#uiDialogBox-letterSpacing-slider').synchronize($('#uiDialogBox-letterSpacing'))

    // 设置文字效果类型关联元素
    $('#uiDialogBox-effect-type').enableHiddenMode().relate([
      {case: 'shadow', targets: [
        $('#uiDialogBox-effect-shadowOffsetX'),
        $('#uiDialogBox-effect-shadowOffsetY'),
        $('#uiDialogBox-effect-color'),
      ]},
      {case: 'stroke', targets: [
        $('#uiDialogBox-effect-strokeWidth'),
        $('#uiDialogBox-effect-color'),
      ]},
      {case: 'outline', targets: [
        $('#uiDialogBox-effect-color'),
      ]},
    ])

    // 侦听事件
    const elements = $(`#uiDialogBox-content, #uiDialogBox-interval, #uiDialogBox-size,
      #uiDialogBox-lineSpacing, #uiDialogBox-letterSpacing, #uiDialogBox-color, #uiDialogBox-font,
      #uiDialogBox-typeface, #uiDialogBox-effect-type, #uiDialogBox-effect-shadowOffsetX, #uiDialogBox-effect-shadowOffsetY,
      #uiDialogBox-effect-strokeWidth, #uiDialogBox-effect-color, #uiDialogBox-blend`)
    const sliders = $('#uiDialogBox-size-slider, #uiDialogBox-lineSpacing-slider, #uiDialogBox-letterSpacing-slider')
    elements.on('input', this.paramInput)
    elements.on('focus', Inspector.inputFocus)
    elements.on('blur', Inspector.inputBlur(this, UI))
    sliders.on('focus', Inspector.sliderFocus)
    sliders.on('blur', Inspector.sliderBlur)
  }

  // 创建文本
  UIDialogBox.create = function () {
    const transform = UIElement.createTransform()
    transform.width = 100
    transform.height = 24
    return {
      class: 'dialogbox',
      name: 'DialogBox',
      enabled: true,
      expanded: false,
      hidden: false,
      locked: false,
      presetId: '',
      content: 'Content',
      interval: 16.6666,
      size: 16,
      lineSpacing: 0,
      letterSpacing: 0,
      color: 'ffffffff',
      font: '',
      typeface: 'regular',
      effect: {type: 'none'},
      blend: 'normal',
      transform: transform,
      events: [],
      scripts: [],
      children: [],
    }
  }

  // 打开数据
  UIDialogBox.open = function (node) {
    if (this.target !== node) {
      this.target = node

      // 写入数据
      const write = getElementWriter('uiDialogBox', node)
      write('content')
      write('interval')
      write('size')
      write('lineSpacing')
      write('letterSpacing')
      write('color')
      write('font')
      write('typeface')
      write('effect-type')
      write('effect-shadowOffsetX', node.effect.shadowOffsetX || 1)
      write('effect-shadowOffsetY', node.effect.shadowOffsetY || 1)
      write('effect-strokeWidth', node.effect.strokeWidth || 1)
      write('effect-color', node.effect.color || '000000ff')
      write('blend')
      UIElement.open(node)
    }
  }

  // 关闭数据
  UIDialogBox.close = function () {
    if (this.target) {
      UI.list.unselect(this.target)
      UI.updateTarget()
      UIElement.close()
      this.target = null
    }
  }

  // 更新数据
  UIDialogBox.update = function (node, key, value) {
    UI.planToSave()
    const element = node.instance
    switch (key) {
      case 'content':
      case 'interval':
      case 'size':
      case 'lineSpacing':
      case 'letterSpacing':
      case 'color':
      case 'typeface':
      case 'blend':
        if (node[key] !== value) {
          node[key] = value
          element[key] = value
        }
        break
      case 'font': {
        const font = value.trim()
        if (node.font !== font) {
          node.font = font
          element.font = font
        }
        break
      }
      case 'effect-type':
        if (node.effect.type !== value) {
          const read = getElementReader('uiDialogBox-effect')
          const effect = {type: value}
          switch (value) {
            case 'none':
              break
            case 'shadow':
              effect.shadowOffsetX = read('shadowOffsetX')
              effect.shadowOffsetY = read('shadowOffsetY')
              effect.color = read('color')
              break
            case 'stroke':
              effect.strokeWidth = read('strokeWidth')
              effect.color = read('color')
              break
            case 'outline':
              effect.color = read('color')
              break
          }
          node.effect = effect
          element.effect = effect
        }
        break
      case 'effect-shadowOffsetX':
      case 'effect-shadowOffsetY':
      case 'effect-strokeWidth':
      case 'effect-color': {
        const index = key.indexOf('-') + 1
        const property = key.slice(index)
        if (node.effect[property] !== value) {
          node.effect[property] = value
          element.effect = node.effect
        }
        break
      }
    }
    UI.requestRendering()
  }

  // 参数 - 输入事件
  UIDialogBox.paramInput = function (event) {
    UIDialogBox.update(
      UIDialogBox.target,
      Inspector.getKey(this),
      this.read(),
    )
  }

  Inspector.uiDialogBox = UIDialogBox
}
