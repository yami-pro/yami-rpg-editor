'use strict'

import { Inspector } from './inspector.js'
import { UI } from '../ui/ui.js'

// ******************************** 元素 - 图像页面 ********************************

{
  const UIImage = {
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
  UIImage.initialize = function () {
    // 创建显示选项
    $('#uiImage-display').loadItems([
      {name: 'Stretch', value: 'stretch'},
      {name: 'Tile', value: 'tile'},
      {name: 'Clip', value: 'clip'},
      {name: 'Slice', value: 'slice'},
    ])

    // 设置显示模式关联元素
    $('#uiImage-display').enableHiddenMode().relate([
      {case: ['stretch', 'tile'], targets: [
        $('#uiImage-flip'),
        $('#uiImage-shift-box'),
      ]},
      {case: 'clip', targets: [
        $('#uiImage-flip'),
        $('#uiImage-clip'),
      ]},
      {case: 'slice', targets: [
        $('#uiImage-clip'),
        $('#uiImage-border'),
      ]},
    ])

    // 创建翻转选项
    $('#uiImage-flip').loadItems([
      {name: 'None', value: 'none'},
      {name: 'Horizontal', value: 'horizontal'},
      {name: 'Vertical', value: 'vertical'},
      {name: 'Both', value: 'both'},
    ])

    // 创建混合模式选项
    $('#uiImage-blend').loadItems([
      {name: 'Normal', value: 'normal'},
      {name: 'Additive', value: 'additive'},
      {name: 'Subtract', value: 'subtract'},
    ])

    // 同步滑动框和数字框的数值
    $('#uiImage-tint-0-slider').synchronize($('#uiImage-tint-0'))
    $('#uiImage-tint-1-slider').synchronize($('#uiImage-tint-1'))
    $('#uiImage-tint-2-slider').synchronize($('#uiImage-tint-2'))
    $('#uiImage-tint-3-slider').synchronize($('#uiImage-tint-3'))

    // 侦听事件
    const elements = $(`#uiImage-image,
      #uiImage-display, #uiImage-flip, #uiImage-blend,
      #uiImage-shiftX, #uiImage-shiftY, #uiImage-clip, #uiImage-border,
      #uiImage-tint-0, #uiImage-tint-1, #uiImage-tint-2, #uiImage-tint-3`)
    const sliders = $(`
      #uiImage-tint-0-slider, #uiImage-tint-1-slider,
      #uiImage-tint-2-slider, #uiImage-tint-3-slider`)
    elements.on('input', this.paramInput)
    elements.on('focus', Inspector.inputFocus)
    elements.on('blur', Inspector.inputBlur(this, UI))
    sliders.on('focus', Inspector.sliderFocus)
    sliders.on('blur', Inspector.sliderBlur)
  }

  // 创建图像
  UIImage.create = function () {
    const transform = UIElement.createTransform()
    transform.width = 100
    transform.height = 100
    return {
      class: 'image',
      name: 'Image',
      enabled: true,
      expanded: false,
      hidden: false,
      locked: false,
      presetId: '',
      image: '',
      display: 'stretch',
      flip: 'none',
      blend: 'normal',
      shiftX: 0,
      shiftY: 0,
      clip: [0, 0, 32, 32],
      border: 1,
      tint: [0, 0, 0, 0],
      transform: transform,
      events: [],
      scripts: [],
      children: [],
    }
  }

  // 打开数据
  UIImage.open = function (node) {
    if (this.target !== node) {
      this.target = node

      // 写入数据
      const write = getElementWriter('uiImage', node)
      write('image')
      write('display')
      write('flip')
      write('blend')
      write('shiftX')
      write('shiftY')
      write('clip')
      write('border')
      write('tint-0')
      write('tint-1')
      write('tint-2')
      write('tint-3')
      UIElement.open(node)
    }
  }

  // 关闭数据
  UIImage.close = function () {
    if (this.target) {
      UI.list.unselect(this.target)
      UI.updateTarget()
      UIElement.close()
      this.target = null
    }
  }

  // 更新数据
  UIImage.update = function (node, key, value) {
    UI.planToSave()
    const element = node.instance
    switch (key) {
      case 'image':
      case 'display':
      case 'flip':
      case 'blend':
      case 'shiftX':
      case 'shiftY':
      case 'clip':
      case 'border':
        if (node[key] !== value) {
          node[key] = value
          element[key] = value
        }
        break
      case 'tint-0':
      case 'tint-1':
      case 'tint-2':
      case 'tint-3': {
        const index = key.indexOf('-') + 1
        const color = key.slice(index)
        if (node.tint[color] !== value) {
          node.tint[color] = value
          element.tint[color] = value
        }
        break
      }
    }
    UI.requestRendering()
  }

  // 参数 - 输入事件
  UIImage.paramInput = function (event) {
    UIImage.update(
      UIImage.target,
      Inspector.getKey(this),
      this.read(),
    )
  }

  Inspector.uiImage = UIImage
}
