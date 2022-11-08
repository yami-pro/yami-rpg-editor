'use strict'

import {
  AttributeListInterface,
  Browser,
  EventListInterface,
  File,
  getElementWriter,
  Inspector,
  ScriptListInterface
} from '../yami.js'

// ******************************** 文件 - 状态页面 ********************************

{
  const FileState = {
    // properties
    target: null,
    meta: null,
    // methods
    initialize: null,
    create: null,
    open: null,
    close: null,
    update: null,
    // events
    paramInput: null,
    listChange: null,
  }

  // 初始化
  FileState.initialize = function () {
    // 绑定属性列表
    $('#fileState-attributes').bind(new AttributeListInterface())

    // 绑定事件列表
    $('#fileState-events').bind(new EventListInterface())

    // 绑定脚本列表
    $('#fileState-scripts').bind(new ScriptListInterface())

    // 绑定脚本参数面板
    $('#fileState-parameter-pane').bind($('#fileState-scripts'))

    // 侦听事件
    $('#fileState-icon, #fileState-clip').on('input', this.paramInput)
    $('#fileState-attributes, #fileState-events, #fileState-scripts').on('change', this.listChange)
  }

  // 创建状态
  FileState.create = function () {
    return {
      icon: '',
      clip: [0, 0, 32, 32],
      attributes: [],
      events: [],
      scripts: [],
    }
  }

  // 打开数据
  FileState.open = function (state, meta) {
    if (this.meta !== meta) {
      this.target = state
      this.meta = meta

      // 写入数据
      const write = getElementWriter('fileState', state)
      write('icon')
      write('clip')
      write('attributes')
      write('events')
      write('scripts')
    }
  }

  // 关闭数据
  FileState.close = function () {
    if (this.target) {
      Browser.unselect(this.meta)
      this.target = null
      this.meta = null
      $('#fileState-attributes').clear()
      $('#fileState-events').clear()
      $('#fileState-scripts').clear()
      $('#fileState-parameter-pane').clear()
    }
  }

  // 更新数据
  FileState.update = function (state, key, value) {
    File.planToSave(this.meta)
    switch (key) {
      case 'icon':
      case 'clip':
        if (state[key] !== value) {
          state[key] = value
          Browser.body.updateIcon(this.meta.file)
        }
        break
    }
  }

  // 参数 - 输入事件
  FileState.paramInput = function (event) {
    FileState.update(
      FileState.target,
      Inspector.getKey(this),
      this.read(),
    )
  }

  // 列表 - 改变事件
  FileState.listChange = function (event) {
    File.planToSave(FileState.meta)
  }

  Inspector.fileState = FileState
}
