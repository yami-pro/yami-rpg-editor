'use strict'

import {
  getElementWriter,
  Inspector,
  UI,
  UIElement
} from '../yami.js'

// ******************************** 元素 - 进度条页面 ********************************

{
const UIProgressBar = {
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
UIProgressBar.initialize = function () {
  // 创建显示选项
  $('#uiProgressBar-display').loadItems([
    {name: 'Stretch', value: 'stretch'},
    {name: 'Clip', value: 'clip'},
  ])

  // 设置显示关联元素
  $('#uiProgressBar-display').enableHiddenMode().relate([
    {case: 'clip', targets: [
      $('#uiProgressBar-clip'),
    ]},
  ])

  // 创建类型选项
  $('#uiProgressBar-type').loadItems([
    {name: 'Horizontal', value: 'horizontal'},
    {name: 'Vertical', value: 'vertical'},
    {name: 'Round', value: 'round'},
  ])

  // 设置类型关联元素
  $('#uiProgressBar-type').enableHiddenMode().relate([
    {case: 'round', targets: [
      $('#uiProgressBar-centerX'),
      $('#uiProgressBar-centerY'),
      $('#uiProgressBar-startAngle'),
      $('#uiProgressBar-centralAngle'),
    ]},
  ])

  // 创建混合模式选项
  $('#uiProgressBar-blend').loadItems([
    {name: 'Normal', value: 'normal'},
    {name: 'Additive', value: 'additive'},
    {name: 'Subtract', value: 'subtract'},
  ])

  // 创建颜色模式选项
  $('#uiProgressBar-colorMode').loadItems([
    {name: 'Texture Sampling', value: 'texture'},
    {name: 'Fixed', value: 'fixed'},
  ])

  // 设置颜色模式关联元素
  $('#uiProgressBar-colorMode').enableHiddenMode().relate([
    {case: 'fixed', targets: [
      $('#uiProgressBar-color-0-box'),
      $('#uiProgressBar-color-1-box'),
      $('#uiProgressBar-color-2-box'),
      $('#uiProgressBar-color-3-box'),
    ]},
  ])

  // 同步滑动框和数字框的数值
  $('#uiProgressBar-color-0-slider').synchronize($('#uiProgressBar-color-0'))
  $('#uiProgressBar-color-1-slider').synchronize($('#uiProgressBar-color-1'))
  $('#uiProgressBar-color-2-slider').synchronize($('#uiProgressBar-color-2'))
  $('#uiProgressBar-color-3-slider').synchronize($('#uiProgressBar-color-3'))

  // 侦听事件
  const elements = $(`#uiProgressBar-image,
    #uiProgressBar-display, #uiProgressBar-clip,
    #uiProgressBar-type, #uiProgressBar-centerX, #uiProgressBar-centerY,
    #uiProgressBar-startAngle, #uiProgressBar-centralAngle, #uiProgressBar-step,
    #uiProgressBar-progress, #uiProgressBar-blend, #uiProgressBar-colorMode,
    #uiProgressBar-color-0, #uiProgressBar-color-1,
    #uiProgressBar-color-2, #uiProgressBar-color-3`)
  const sliders = $(`
    #uiProgressBar-color-0-slider, #uiProgressBar-color-1-slider,
    #uiProgressBar-color-2-slider, #uiProgressBar-color-3-slider`)
  elements.on('input', this.paramInput)
  elements.on('focus', Inspector.inputFocus)
  elements.on('blur', Inspector.inputBlur(this, UI))
  sliders.on('focus', Inspector.sliderFocus)
  sliders.on('blur', Inspector.sliderBlur)
}

// 创建图像
UIProgressBar.create = function () {
  const transform = UIElement.createTransform()
  transform.width = 100
  transform.height = 100
  return {
    class: 'progressbar',
    name: 'ProgressBar',
    enabled: true,
    expanded: false,
    hidden: false,
    locked: false,
    presetId: '',
    image: '',
    display: 'stretch',
    clip: [0, 0, 32, 32],
    type: 'horizontal',
    centerX: 0.5,
    centerY: 0.5,
    startAngle: -90,
    centralAngle: 360,
    step: 0,
    progress: 1,
    blend: 'normal',
    colorMode: 'texture',
    color: [0, 0, 0, 0],
    transform: transform,
    events: [],
    scripts: [],
    children: [],
  }
}

// 打开数据
UIProgressBar.open = function (node) {
  if (this.target !== node) {
    this.target = node

    // 写入数据
    const write = getElementWriter('uiProgressBar', node)
    write('image')
    write('display')
    write('clip')
    write('type')
    write('centerX')
    write('centerY')
    write('startAngle')
    write('centralAngle')
    write('step')
    write('progress')
    write('blend')
    write('colorMode')
    write('color-0')
    write('color-1')
    write('color-2')
    write('color-3')
    UIElement.open(node)
  }
}

// 关闭数据
UIProgressBar.close = function () {
  if (this.target) {
    UI.list.unselect(this.target)
    UI.updateTarget()
    UIElement.close()
    this.target = null
  }
}

// 更新数据
UIProgressBar.update = function (node, key, value) {
  UI.planToSave()
  const element = node.instance
  switch (key) {
    case 'image':
    case 'display':
    case 'clip':
    case 'type':
    case 'centerX':
    case 'centerY':
    case 'startAngle':
    case 'centralAngle':
    case 'step':
    case 'progress':
    case 'blend':
    case 'colorMode':
      if (node[key] !== value) {
        node[key] = value
        element[key] = value
      }
      break
    case 'color-0':
    case 'color-1':
    case 'color-2':
    case 'color-3': {
      const index = key.indexOf('-') + 1
      const color = key.slice(index)
      if (node.color[color] !== value) {
        node.color[color] = value
        element.color[color] = value
      }
      break
    }
  }
  UI.requestRendering()
}

// 参数 - 输入事件
UIProgressBar.paramInput = function (event) {
  UIProgressBar.update(
    UIProgressBar.target,
    Inspector.getKey(this),
    this.read(),
  )
}

Inspector.uiProgressBar = UIProgressBar
}
