'use strict'

import * as Yami from '../yami.js'

// ******************************** 元素 - 视频页面 ********************************

{
  const UIVideo = {
    // properties
    owner: Yami.UI,
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
  UIVideo.initialize = function () {
    // 创建循环选项
    $('#uiVideo-loop').loadItems([
      {name: 'Once', value: false},
      {name: 'Loop', value: true},
    ])

    // 创建翻转选项
    $('#uiVideo-flip').loadItems([
      {name: 'None', value: 'none'},
      {name: 'Horizontal', value: 'horizontal'},
      {name: 'Vertical', value: 'vertical'},
      {name: 'Both', value: 'both'},
    ])

    // 创建混合模式选项
    $('#uiVideo-blend').loadItems([
      {name: 'Normal', value: 'normal'},
      {name: 'Additive', value: 'additive'},
      {name: 'Subtract', value: 'subtract'},
    ])

    // 侦听事件
    const elements = $('#uiVideo-video, #uiVideo-loop, #uiVideo-flip, #uiVideo-blend')
    elements.on('input', this.paramInput)
    elements.on('focus', Yami.Inspector.inputFocus)
    elements.on('blur', Yami.Inspector.inputBlur(this, Yami.UI))
  }

  // 创建文本框
  UIVideo.create = function () {
    const transform = Yami.UIElement.createTransform()
    transform.width = 100
    transform.height = 100
    return {
      class: 'video',
      name: 'Video',
      enabled: true,
      expanded: false,
      hidden: false,
      locked: false,
      presetId: '',
      video: '',
      loop: false,
      flip: 'none',
      blend: 'normal',
      transform: transform,
      events: [],
      scripts: [],
      children: [],
    }
  }

  // 打开数据
  UIVideo.open = function (node) {
    if (this.target !== node) {
      this.target = node

      // 写入数据
      const write = Yami.getElementWriter('uiVideo', node)
      write('video')
      write('loop')
      write('flip')
      write('blend')
      Yami.UIElement.open(node)
    }
  }

  // 关闭数据
  UIVideo.close = function () {
    if (this.target) {
      Yami.UI.list.unselect(this.target)
      Yami.UI.updateTarget()
      Yami.UIElement.close()
      this.target = null
    }
  }

  // 更新数据
  UIVideo.update = function (node, key, value) {
    Yami.UI.planToSave()
    switch (key) {
      case 'video':
      case 'loop':
      case 'flip':
      case 'blend':
        if (node[key] !== value) {
          node[key] = value
        }
        break
    }
    Yami.UI.requestRendering()
  }

  // 参数 - 输入事件
  UIVideo.paramInput = function (event) {
    UIVideo.update(
      UIVideo.target,
      Yami.Inspector.getKey(this),
      this.read(),
    )
  }

  Yami.Inspector.uiVideo = UIVideo
}
