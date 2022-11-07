'use strict'

import { getElementReader, getElementWriter } from '../util/index.js'
import * as Yami from '../yami.js'

const {
  Inspector,
  UI,
  UIElement
} = Yami

// ******************************** 元素 - 文本页面 ********************************

 {
  const UIText = {
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
  UIText.initialize = function () {
    // 创建文本方向选项
    $('#uiText-direction').loadItems([
      {name: 'Horizontal - TB', value: 'horizontal-tb'},
      {name: 'Vertical - LR', value: 'vertical-lr'},
      {name: 'Vertical - RL', value: 'vertical-rl'},
    ])

    // 创建字型选项
    $('#uiText-typeface').loadItems([
      {name: 'Regular', value: 'regular'},
      {name: 'Bold', value: 'bold'},
      {name: 'Italic', value: 'italic'},
      {name: 'Bold Italic', value: 'bold-italic'},
    ])

    // 创建文字效果类型选项
    $('#uiText-effect-type').loadItems([
      {name: 'None', value: 'none'},
      {name: 'Shadow', value: 'shadow'},
      {name: 'Stroke', value: 'stroke'},
      {name: 'Outline', value: 'outline'},
    ])

    // 创建溢出处理选项
    $('#uiText-overflow').loadItems([
      {name: 'Visible', value: 'visible'},
      {name: 'Wrap', value: 'wrap'},
      {name: 'Truncate', value: 'truncate'},
      {name: 'Wrap Truncate', value: 'wrap-truncate'},
    ])

    // 创建混合模式选项
    $('#uiText-blend').loadItems([
      {name: 'Normal', value: 'normal'},
      {name: 'Additive', value: 'additive'},
      {name: 'Subtract', value: 'subtract'},
    ])

    // 同步滑动框和数字框的数值
    $('#uiText-size-slider').synchronize($('#uiText-size'))
    $('#uiText-lineSpacing-slider').synchronize($('#uiText-lineSpacing'))
    $('#uiText-letterSpacing-slider').synchronize($('#uiText-letterSpacing'))

    // 设置文字效果类型关联元素
    $('#uiText-effect-type').enableHiddenMode().relate([
      {case: 'shadow', targets: [
        $('#uiText-effect-shadowOffsetX'),
        $('#uiText-effect-shadowOffsetY'),
        $('#uiText-effect-color'),
      ]},
      {case: 'stroke', targets: [
        $('#uiText-effect-strokeWidth'),
        $('#uiText-effect-color'),
      ]},
      {case: 'outline', targets: [
        $('#uiText-effect-color'),
      ]},
    ])

    // 侦听事件
    const elements = $(`#uiText-direction, #uiText-horizontalAlign, #uiText-verticalAlign,
      #uiText-content, #uiText-size, #uiText-lineSpacing, #uiText-letterSpacing, #uiText-color, #uiText-font,
      #uiText-typeface, #uiText-effect-type, #uiText-effect-shadowOffsetX, #uiText-effect-shadowOffsetY,
      #uiText-effect-strokeWidth, #uiText-effect-color, #uiText-overflow, #uiText-blend`)
    const sliders = $('#uiText-size-slider, #uiText-lineSpacing-slider, #uiText-letterSpacing-slider')
    elements.on('input', this.paramInput)
    elements.on('focus', Inspector.inputFocus)
    elements.on('blur', Inspector.inputBlur(this, UI))
    sliders.on('focus', Inspector.sliderFocus)
    sliders.on('blur', Inspector.sliderBlur)
  }

  // 创建文本
  UIText.create = function () {
    const transform = UIElement.createTransform()
    transform.width = 100
    transform.height = 24
    return {
      class: 'text',
      name: 'Text',
      enabled: true,
      expanded: false,
      hidden: false,
      locked: false,
      presetId: '',
      direction: 'horizontal-tb',
      horizontalAlign: 'left',
      verticalAlign: 'middle',
      content: 'New Text',
      size: 16,
      lineSpacing: 0,
      letterSpacing: 0,
      color: 'ffffffff',
      font: '',
      typeface: 'regular',
      effect: {type: 'none'},
      overflow: 'visible',
      blend: 'normal',
      transform: transform,
      events: [],
      scripts: [],
      children: [],
    }
  }

  // 打开数据
  UIText.open = function (node) {
    if (this.target !== node) {
      this.target = node

      // 写入数据
      const write = getElementWriter('uiText', node)
      write('direction')
      write('horizontalAlign')
      write('verticalAlign')
      write('content')
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
      write('overflow')
      write('blend')
      UIElement.open(node)
    }
  }

  // 关闭数据
  UIText.close = function () {
    if (this.target) {
      UI.list.unselect(this.target)
      UI.updateTarget()
      UIElement.close()
      this.target = null
    }
  }

  // 更新数据
  UIText.update = function (node, key, value) {
    UI.planToSave()
    const element = node.instance
    switch (key) {
      case 'horizontalAlign':
        if (node.horizontalAlign !== value) {
          const event = window.event
          if (event &&
            event.type === 'input' &&
            event.value !== undefined) {
            UI.history.save({
              type: 'inspector-change',
              editor: this,
              target: this.target,
              changes: [{
                input: $('#uiText-horizontalAlign'),
                oldValue: node.horizontalAlign,
                newValue: value,
              }],
            })
          }
          node.horizontalAlign = value
          element.horizontalAlign = value
        }
        break
      case 'verticalAlign':
        if (node.verticalAlign !== value) {
          const event = window.event
          if (event &&
            event.type === 'input' &&
            event.value !== undefined) {
            UI.history.save({
              type: 'inspector-change',
              editor: this,
              target: this.target,
              changes: [{
                input: $('#uiText-verticalAlign'),
                oldValue: node.verticalAlign,
                newValue: value,
              }],
            })
          }
          node.verticalAlign = value
          element.verticalAlign = value
        }
        break
      case 'direction':
      case 'content':
      case 'size':
      case 'lineSpacing':
      case 'letterSpacing':
      case 'color':
      case 'typeface':
      case 'overflow':
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
          const read = getElementReader('uiText-effect')
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
  UIText.paramInput = function (event) {
    UIText.update(
      UIText.target,
      Inspector.getKey(this),
      this.read(),
    )
  }

  Inspector.uiText = UIText
}
