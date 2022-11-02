'use strict'

import { Inspector } from './inspector.js'
import { AttributeListInterface } from '../tools/attribute-list-interface.js'
import { EventListInterface } from '../tools/event-list-interface.js'
import { ScriptListInterface } from '../tools/script-list-interface.js'

// ******************************** 文件 - 装备页面 ********************************

{
  const FileEquipment = {
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
  FileEquipment.initialize = function () {
    // 绑定属性列表
    $('#fileEquipment-attributes').bind(new AttributeListInterface())

    // 绑定事件列表
    $('#fileEquipment-events').bind(new EventListInterface())

    // 绑定脚本列表
    $('#fileEquipment-scripts').bind(new ScriptListInterface())

    // 绑定脚本参数面板
    $('#fileEquipment-parameter-pane').bind($('#fileEquipment-scripts'))

    // 侦听事件
    $('#fileEquipment-icon, #fileEquipment-clip').on('input', this.paramInput)
    $('#fileEquipment-attributes, #fileEquipment-events, #fileEquipment-scripts').on('change', this.listChange)
  }

  // 创建装备
  FileEquipment.create = function () {
    return {
      icon: '',
      clip: [0, 0, 32, 32],
      attributes: [],
      events: [],
      scripts: [],
    }
  }

  // 打开数据
  FileEquipment.open = function (equipment, meta) {
    if (this.meta !== meta) {
      this.target = equipment
      this.meta = meta

      // 写入数据
      const write = getElementWriter('fileEquipment', equipment)
      write('icon')
      write('clip')
      write('attributes')
      write('events')
      write('scripts')
    }
  }

  // 关闭数据
  FileEquipment.close = function () {
    if (this.target) {
      Browser.unselect(this.meta)
      this.target = null
      this.meta = null
      $('#fileEquipment-attributes').clear()
      $('#fileEquipment-events').clear()
      $('#fileEquipment-scripts').clear()
      $('#fileEquipment-parameter-pane').clear()
    }
  }

  // 更新数据
  FileEquipment.update = function (equipment, key, value) {
    File.planToSave(this.meta)
    switch (key) {
      case 'icon':
      case 'clip':
        if (equipment[key] !== value) {
          equipment[key] = value
          Browser.body.updateIcon(this.meta.file)
        }
        break
    }
  }

  // 参数 - 输入事件
  FileEquipment.paramInput = function (event) {
    FileEquipment.update(
      FileEquipment.target,
      Inspector.getKey(this),
      this.read(),
    )
  }

  // 列表 - 改变事件
  FileEquipment.listChange = function (event) {
    File.planToSave(FileEquipment.meta)
  }

  Inspector.fileEquipment = FileEquipment
}