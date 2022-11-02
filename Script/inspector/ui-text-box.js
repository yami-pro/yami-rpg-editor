'use strict'

import { Inspector } from './inspector.js'
import { UI } from '../ui/index.js'

// ******************************** 元素 - 文本框页面 ********************************

{
  const UITextBox = {
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
  UITextBox.initialize = function () {
    // 创建类型选项
    $('#uiTextBox-type').loadItems([
      {name: 'Text', value: 'text'},
      {name: 'Number', value: 'number'},
    ])

    // 创建对齐方式选项
    $('#uiTextBox-align').loadItems([
      {name: 'Left', value: 'left'},
      {name: 'Center', value: 'center'},
      {name: 'Right', value: 'right'},
    ])

    // 设置类型关联元素
    $('#uiTextBox-type').enableHiddenMode().relate([
      {case: 'text', targets: [
        $('#uiTextBox-text'),
        $('#uiTextBox-maxLength'),
      ]},
      {case: 'number', targets: [
        $('#uiTextBox-number'),
        $('#uiTextBox-min'),
        $('#uiTextBox-max'),
        $('#uiTextBox-decimals'),
      ]},
    ])

    // 侦听事件
    const elements = $(`#uiTextBox-type, #uiTextBox-align, #uiTextBox-text,
      #uiTextBox-maxLength, #uiTextBox-number, #uiTextBox-min, #uiTextBox-max,
      #uiTextBox-decimals, #uiTextBox-padding, #uiTextBox-size, #uiTextBox-font,
      #uiTextBox-color, #uiTextBox-selectionColor, #uiTextBox-selectionBgColor`)
    elements.on('input', this.paramInput)
    elements.on('focus', Inspector.inputFocus)
    elements.on('blur', Inspector.inputBlur(this, UI))
  }

  // 创建文本框
  UITextBox.create = function () {
    const transform = UIElement.createTransform()
    transform.width = 100
    transform.height = 24
    return {
      class: 'textbox',
      name: 'TextBox',
      enabled: true,
      expanded: false,
      hidden: false,
      locked: false,
      presetId: '',
      type: 'text',
      align: 'left',
      text: 'Content',
      maxLength: 16,
      number: 0,
      min: 0,
      max: 0,
      decimals: 0,
      padding: 4,
      size: 16,
      font: '',
      color: 'ffffffff',
      selectionColor: 'ffffffff',
      selectionBgColor: '0090ccff',
      transform: transform,
      events: [],
      scripts: [],
      children: [],
    }
  }

  // 打开数据
  UITextBox.open = function (node) {
    if (this.target !== node) {
      this.target = node

      // 写入数据
      const write = getElementWriter('uiTextBox', node)
      const number = $('#uiTextBox-number')
      number.input.min = node.min
      number.input.max = node.max
      number.decimals = node.decimals
      write('type')
      write('align')
      write('text')
      write('maxLength')
      write('number')
      write('min')
      write('max')
      write('decimals')
      write('padding')
      write('size')
      write('font')
      write('color')
      write('selectionColor')
      write('selectionBgColor')
      UIElement.open(node)
    }
  }

  // 关闭数据
  UITextBox.close = function () {
    if (this.target) {
      UI.list.unselect(this.target)
      UI.updateTarget()
      UIElement.close()
      this.target = null
    }
  }

  // 更新数据
  UITextBox.update = function (node, key, value) {
    UI.planToSave()
    const element = node.instance
    switch (key) {
      case 'type':
      case 'align':
      case 'maxLength':
      case 'padding':
      case 'size':
      case 'font':
      case 'color':
      case 'selectionColor':
      case 'selectionBgColor':
        if (node[key] !== value) {
          node[key] = value
          element[key] = value
        }
        break
      case 'text':
      case 'number':
        if (node[key] !== value) {
          node[key] = value
          element.content = value.toString()
        }
        break
      case 'min':
      case 'max':
        if (node[key] !== value) {
          node[key] = value
          element[key] = value
          $('#uiTextBox-number').input[key] = value
        }
        break
      case 'decimals':
        if (node.decimals !== value) {
          node.decimals = value
          element.decimals = value
          $('#uiTextBox-number').decimals = value
        }
        break
    }
    UI.requestRendering()
  }

  // 参数 - 输入事件
  UITextBox.paramInput = function (event) {
    UITextBox.update(
      UITextBox.target,
      Inspector.getKey(this),
      this.read(),
    )
  }

  Inspector.uiTextBox = UITextBox
}
