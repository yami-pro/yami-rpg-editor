'use strict'

// ******************************** 文件 - 物品页面 ********************************

{
  const FileItem = {
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
  FileItem.initialize = function () {
    // 绑定属性列表
    $('#fileItem-attributes').bind(new AttributeListInterface())

    // 绑定事件列表
    $('#fileItem-events').bind(new EventListInterface())

    // 绑定脚本列表
    $('#fileItem-scripts').bind(new ScriptListInterface())

    // 绑定脚本参数面板
    $('#fileItem-parameter-pane').bind($('#fileItem-scripts'))

    // 侦听事件
    $('#fileItem-icon, #fileItem-clip').on('input', this.paramInput)
    $('#fileItem-attributes, #fileItem-events, #fileItem-scripts').on('change', this.listChange)
  }

  // 创建物品
  FileItem.create = function () {
    return {
      icon: '',
      clip: [0, 0, 32, 32],
      attributes: [],
      events: [],
      scripts: [],
    }
  }

  // 打开数据
  FileItem.open = function (item, meta) {
    if (this.meta !== meta) {
      this.target = item
      this.meta = meta

      // 写入数据
      const write = getElementWriter('fileItem', item)
      write('icon')
      write('clip')
      write('attributes')
      write('events')
      write('scripts')
    }
  }

  // 关闭数据
  FileItem.close = function () {
    if (this.target) {
      Browser.unselect(this.meta)
      this.target = null
      this.meta = null
      $('#fileItem-attributes').clear()
      $('#fileItem-events').clear()
      $('#fileItem-scripts').clear()
      $('#fileItem-parameter-pane').clear()
    }
  }

  // 更新数据
  FileItem.update = function (item, key, value) {
    File.planToSave(this.meta)
    switch (key) {
      case 'icon':
      case 'clip':
        if (item[key] !== value) {
          item[key] = value
          Browser.body.updateIcon(this.meta.file)
        }
        break
    }
  }

  // 参数 - 输入事件
  FileItem.paramInput = function (event) {
    FileItem.update(
      FileItem.target,
      Inspector.getKey(this),
      this.read(),
    )
  }

  // 列表 - 改变事件
  FileItem.listChange = function (event) {
    File.planToSave(FileItem.meta)
  }

  Inspector.fileItem = FileItem
}
