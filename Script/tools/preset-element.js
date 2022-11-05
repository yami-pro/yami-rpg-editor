'use strict'

import * as Yami from '../yami.js'

// ******************************** 预设元素窗口 ********************************

const PresetElement = {
  // properties
  ui: $('#presetElement-uiId'),
  list: $('#presetElement-list'),
  target: null,
  nodes: null,
  // methods
  initialize: null,
  open: null,
  buildNodes: null,
  getDefaultPresetId: null,
  // events
  windowClosed: null,
  uiIdWrite: null,
  listOpen: null,
  confirm: null,
}

// ******************************** 预设元素窗口加载 ********************************

// list methods
PresetElement.list.createIcon = null

// 初始化
PresetElement.initialize = function () {
  // 绑定对象目录列表
  this.list.bind(() => this.nodes)

  // 列表 - 重写创建图标方法
  this.list.createIcon = Yami.UI.list.createIcon

  // 侦听事件
  this.ui.on('write', this.uiIdWrite)
  this.list.on('open', this.listOpen)
  $('#presetElement').on('closed', this.windowClosed)
  $('#presetElement-confirm').on('click', this.confirm)
}

// 打开窗口
PresetElement.open = function (target) {
  this.target = target
  Yami.Window.open('presetElement')

  // 写入数据
  const {ui, list} = this
  const presetId = target.read() || (Yami.UI.target?.presetId ?? '')
  const uiId = Yami.Data.uiLinks[presetId] ?? Yami.UI.meta?.guid ?? ''
  ui.write(uiId)
  ui.getFocus()
  const item = list.getItemByProperties({presetId})
  if (item) {
    list.select(item)
    list.expandToSelection()
    list.scrollToSelection('middle')
  }
}

// 构造简化的元素节点(避免影响元素数据)
PresetElement.buildNodes = function IIFE() {
  const build = nodes => {
    const length = nodes.length
    const list = new Array(length)
    for (let i = 0; i < length; i++) {
      const node = nodes[i]
      list[i] = {
        class: node.class,
        name: node.name,
        expanded: node.expanded,
        presetId: node.presetId,
        children: build(node.children),
      }
    }
    return list
  }
  return function (nodes) {
    return build(nodes)
  }
}()

// 获取默认的预设元素ID
PresetElement.getDefaultPresetId = function () {
  return Yami.UI.target?.presetId ?? ''
}

// 窗口 - 已关闭事件
PresetElement.windowClosed = function (event) {
  PresetElement.target = null
  PresetElement.nodes = null
  PresetElement.list.clear()
}

// 界面ID - 写入事件
PresetElement.uiIdWrite = function (event) {
  const ui = Yami.Data.ui[event.value]
  const nodes = ui ? PresetElement.buildNodes(ui.nodes) : Array.empty
  PresetElement.nodes = nodes
  PresetElement.list.update()
  if (nodes.length !== 0) {
    PresetElement.list.select(nodes[0])
    PresetElement.list.scrollTop = 0
  } else {
    PresetElement.list.unselect()
  }
}

// 列表 - 打开事件
PresetElement.listOpen = function (event) {
  PresetElement.confirm()
}

// 确定按钮 - 鼠标点击事件
PresetElement.confirm = function (event) {
  const uiId = this.ui.read()
  if (!uiId) {
    return this.ui.getFocus()
  }
  const node = this.list.read()
  const presetId = node?.presetId
  if (!presetId) {
    return this.list.getFocus()
  }
  this.target.input(presetId)
  Yami.Window.close('presetElement')
}.bind(PresetElement)

// ******************************** 预设元素窗口导出 ********************************

export { PresetElement }
