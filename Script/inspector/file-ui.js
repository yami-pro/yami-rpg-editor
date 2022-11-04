'use strict'

import * as Yami from '../yami.js'

// ******************************** 文件 - 界面页面 ********************************

{
  const FileUI = {
    // properties
    button: $('#ui-switch-settings'),
    owner: null,
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
  FileUI.initialize = function () {
    // 创建所有者代理
    this.owner = {
      setTarget: target => {
        if (this.target !== target) {
          Yami.Inspector.open('fileUI', target)
        }
      },
      planToSave: () => {
        Yami.UI.planToSave()
      },
      get history() {
        return Yami.UI.history
      },
    }

    // 侦听事件
    const elements = $('#fileUI-width, #fileUI-height')
    elements.on('input', this.paramInput)
    elements.on('focus', Yami.Inspector.inputFocus)
    elements.on('blur', Yami.Inspector.inputBlur(this, this.owner))
  }

  // 创建界面
  FileUI.create = function () {
    const {resolution} = Yami.Data.config
    return {
      width: resolution.width,
      height: resolution.height,
      nodes: [],
    }
  }

  // 打开数据
  FileUI.open = function (ui) {
    if (this.target !== ui) {
      this.target = ui

      // 更新按钮样式
      this.button.addClass('selected')

      // 写入数据
      const write = Yami.getElementWriter('fileUI', ui)
      write('width')
      write('height')
    }
  }

  // 关闭数据
  FileUI.close = function () {
    if (this.target) {
      this.target = null

      // 更新按钮样式
      this.button.removeClass('selected')
    }
  }

  // 更新数据
  FileUI.update = function (ui, key, value) {
    Yami.UI.planToSave()
    switch (key) {
      case 'width':
        if (ui.width !== value) {
          ui.setSize(value, ui.height)
        }
        break
      case 'height':
        if (ui.height !== value) {
          ui.setSize(ui.width, value)
        }
        break
    }
  }

  // 参数 - 输入事件
  FileUI.paramInput = function (event) {
    FileUI.update(
      FileUI.target,
      Yami.Inspector.getKey(this),
      this.read(),
    )
  }

  Yami.Inspector.fileUI = FileUI
}
