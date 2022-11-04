'use strict'

import * as Yami from '../yami.js'

// ******************************** 文件 - 事件页面 ********************************

{
  const FileEvent = {
    // properties
    target: null,
    meta: null,
    // methods
    initialize: null,
    create: null,
    open: null,
    close: null,
    write: null,
    update: null,
    // events
    paramInput: null,
  }

  // 初始化
  FileEvent.initialize = function () {
    // 创建类型选项
    $('#fileEvent-type').loadItems(Yami.EventEditor.types.global)
    Yami.EventEditor.types.relatedElements.push($('#fileEvent-type'))

    // 侦听事件
    $('#fileEvent-type').on('input', this.paramInput)
  }

  // 创建事件
  FileEvent.create = function (filter) {
    const type = Yami.EventEditor.types[filter][0].value
    switch (filter) {
      case 'global':
        return {
          enabled: true,
          type: type,
          commands: [],
        }
      default:
        return {
          type: type,
          commands: [],
        }
    }
  }

  // 打开数据
  FileEvent.open = function (event, meta) {
    if (this.meta !== meta) {
      this.target = event
      this.meta = meta

      $('#fileEvent-type').loadItems(
        Yami.Enum.getMergedItems(
          Yami.EventEditor.types.global,
          'global-event',
      ))

      // 写入数据
      const write = Yami.getElementWriter('fileEvent')
      write('type', event.type)
    }
  }

  // 关闭数据
  FileEvent.close = function () {
    if (this.target) {
      Yami.Browser.unselect(this.meta)
      this.target = null
      this.meta = null
    }
  }

  // 写入数据
  FileEvent.write = function (options) {
    if (options.type !== undefined) {
      $('#fileEvent-type').write(options.type)
    }
  }

  // 更新数据
  FileEvent.update = function (event, key, value) {
    Yami.File.planToSave(this.meta)
    switch (key) {
      case 'type':
        if (event.type !== value) {
          event.type = value
        }
        break
    }
  }

  // 参数 - 输入事件
  FileEvent.paramInput = function (event) {
    FileEvent.update(
      FileEvent.target,
      Yami.Inspector.getKey(this),
      this.read(),
    )
  }

  Yami.Inspector.fileEvent = FileEvent
}
