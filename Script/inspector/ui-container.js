'use strict'

import * as Yami from '../yami.js'

const {
  getElementWriter,
  Inspector,
  UI,
  UIElement
} = Yami

// ******************************** 元素 - 容器页面 ********************************

{
  const UIContainer = {
    // properties
    owner: UI,
    target: null,
    // methods
    create: null,
    open: null,
    close: null,
  }

  // 创建窗口
  UIContainer.create = function () {
    const transform = UIElement.createTransform()
    transform.width = 100
    transform.height = 100
    return {
      class: 'container',
      name: 'Container',
      enabled: true,
      expanded: false,
      hidden: false,
      locked: false,
      presetId: '',
      transform: transform,
      events: [],
      scripts: [],
      children: [],
    }
  }

  // 打开数据
  UIContainer.open = function (node) {
    if (this.target !== node) {
      this.target = node
      UIElement.open(node)

      // 写入数据
      const write = getElementWriter('uiContainer', node)
      UIElement.open(node)
    }
  }

  // 关闭数据
  UIContainer.close = function () {
    if (this.target) {
      UI.list.unselect(this.target)
      UI.updateTarget()
      UIElement.close()
      this.target = null
    }
  }

  Inspector.uiContainer = UIContainer
}
