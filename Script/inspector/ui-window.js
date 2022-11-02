'use strict'

import { Inspector } from './inspector.js'
import { UI } from '../ui/index.js'

// ******************************** 元素 - 窗口页面 ********************************

{
  const UIWindow = {
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
  UIWindow.initialize = function () {
    // 创建布局选项
    $('#uiWindow-layout').loadItems([
      {name: 'Normal', value: 'normal'},
      {name: 'Horizontal Grid', value: 'horizontal-grid'},
      {name: 'Vertical Grid', value: 'vertical-grid'},
    ])

    // 设置布局关联元素
    $('#uiWindow-layout').enableHiddenMode().relate([
      {case: 'normal', targets: [
        $('#uiWindow-scrollX'),
        $('#uiWindow-scrollY'),
      ]},
      {case: ['horizontal-grid', 'vertical-grid'], targets: [
        $('#uiWindow-scrollX'),
        $('#uiWindow-scrollY'),
        $('#uiWindow-gridWidth'),
        $('#uiWindow-gridHeight'),
        $('#uiWindow-gridGapX'),
        $('#uiWindow-gridGapY'),
        $('#uiWindow-paddingX'),
        $('#uiWindow-paddingY'),
      ]},
    ])

    // 创建溢出选项
    $('#uiWindow-overflow').loadItems([
      {name: 'Visible', value: 'visible'},
      {name: 'Hidden', value: 'hidden'},
    ])

    // 侦听事件
    const elements = $(`#uiWindow-layout,
      #uiWindow-scrollX, #uiWindow-scrollY, #uiWindow-gridWidth,
      #uiWindow-gridHeight, #uiWindow-gridGapX, #uiWindow-gridGapY,
      #uiWindow-paddingX, #uiWindow-paddingY, #uiWindow-overflow`)
    elements.on('input', this.paramInput)
    elements.on('focus', Inspector.inputFocus)
    elements.on('blur', Inspector.inputBlur(this, UI))
  }

  // 创建窗口
  UIWindow.create = function () {
    const transform = UIElement.createTransform()
    transform.width = 100
    transform.height = 100
    return {
      class: 'window',
      name: 'Window',
      enabled: true,
      expanded: false,
      hidden: false,
      locked: false,
      presetId: '',
      layout: 'normal',
      scrollX: 0,
      scrollY: 0,
      gridWidth: 0,
      gridHeight: 0,
      gridGapX: 0,
      gridGapY: 0,
      paddingX: 0,
      paddingY: 0,
      overflow: 'visible',
      transform: transform,
      events: [],
      scripts: [],
      children: [],
    }
  }

  // 打开数据
  UIWindow.open = function (node) {
    if (this.target !== node) {
      this.target = node

      // 写入数据
      const write = getElementWriter('uiWindow', node)
      write('layout')
      write('scrollX')
      write('scrollY')
      write('gridWidth')
      write('gridHeight')
      write('gridGapX')
      write('gridGapY')
      write('paddingX')
      write('paddingY')
      write('overflow')
      UIElement.open(node)
    }
  }

  // 关闭数据
  UIWindow.close = function () {
    if (this.target) {
      UI.list.unselect(this.target)
      UI.updateTarget()
      UIElement.close()
      this.target = null
    }
  }

  // 更新数据
  UIWindow.update = function (node, key, value) {
    UI.planToSave()
    const element = node.instance
    switch (key) {
      case 'layout':
      case 'overflow':
        if (node[key] !== value) {
          node[key] = value
          element[key] = value
        }
        break
      case 'scrollX':
      case 'scrollY':
      case 'gridWidth':
      case 'gridHeight':
      case 'gridGapX':
      case 'gridGapY':
      case 'paddingX':
      case 'paddingY':
        if (node[key] !== value) {
          node[key] = value
          element[key] = value
          element.resize()
        }
        break
    }
    UI.requestRendering()
  }

  // 参数 - 输入事件
  UIWindow.paramInput = function (event) {
    UIWindow.update(
      UIWindow.target,
      Inspector.getKey(this),
      this.read(),
    )
  }

  Inspector.uiWindow = UIWindow
}
