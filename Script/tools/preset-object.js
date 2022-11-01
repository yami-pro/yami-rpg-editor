'use strict'

// ******************************** 场景预设对象窗口 ********************************

const PresetObject = {
  // properties
  list: $('#presetObject-list'),
  searcher: $('#presetObject-searcher'),
  target: null,
  nodes: null,
  // methods
  initialize: null,
  open: null,
  buildNodes: null,
  getDefaultPresetId: null,
  // events
  windowClosed: null,
  searcherKeydown: null,
  searcherInput: null,
  listOpen: null,
  confirm: null,
}

// list methods
PresetObject.list.createIcon = null

// 初始化
PresetObject.initialize = function () {
  // 绑定对象目录列表
  this.list.bind(() => this.nodes)

  // 列表 - 重写创建图标方法
  this.list.createIcon = Scene.list.createIcon

  // 设置列表搜索框按钮
  this.searcher.addCloseButton()

  // 侦听事件
  this.list.on('open', this.listOpen)
  this.searcher.on('keydown', this.searcherKeydown)
  this.searcher.on('input', this.searcherInput)
  this.searcher.on('compositionend', this.searcherInput)
  $('#presetObject').on('closed', this.windowClosed)
  $('#presetObject-confirm').on('click', this.confirm)
}

// 打开窗口
PresetObject.open = function (target) {
  this.target = target
  Window.open('presetObject')

  // 写入数据
  const {searcher, list} = this
  const objects = Scene.objects
  const presetId = target.read() || (Scene.target?.presetId ?? '')
  const nodes = objects ? PresetObject.buildNodes(objects, target.filter) : Array.empty
  this.nodes = nodes
  this.list.update()
  searcher.getFocus()
  const item = list.getItemByProperties({presetId})
  if (item) {
    list.select(item)
    list.expandToSelection()
    list.scrollToSelection('middle')
  } else if (nodes.length !== 0) {
    PresetObject.list.select(nodes[0])
  }
}

// 构造简化的对象节点(避免影响对象数据)
PresetObject.buildNodes = function IIFE() {
  const build = (nodes, className) => {
    const list = []
    for (const node of nodes) {
      switch (node.class) {
        case 'folder':
          list.push({
            class: node.class,
            name: node.name,
            expanded: node.expanded,
            children: build(node.children, className),
          })
          continue
        case className:
          list.push({
            class: node.class,
            name: node.name,
            presetId: node.presetId,
            teamId: node.teamId ?? '',
            color: node.color ?? '',
            red: node.red ?? 0,
            green: node.green ?? 0,
            blue: node.blue ?? 0,
            image: node.image ?? '',
          })
          break
      }
    }
    return list
  }
  return function (nodes, className) {
    return build(nodes, className)
  }
}()

// 获取默认的场景预设对象ID
PresetObject.getDefaultPresetId = function (className) {
  return Scene.target?.class === className ? Scene.target.presetId : ''
}

// 窗口 - 已关闭事件
PresetObject.windowClosed = function (event) {
  PresetObject.target = null
  PresetObject.nodes = null
  PresetObject.searcher.write('')
  PresetObject.list.clear()
}

// 搜索框 - 键盘按下事件
PresetObject.searcherKeydown = function (event) {
  switch (event.code) {
    case 'ArrowUp':
    case 'ArrowDown':
      event.preventDefault()
      PresetObject.list.selectRelative(
        event.code.slice(5).toLowerCase()
      )
      break
    case 'PageUp':
      PresetObject.list.pageUp(true)
      break
    case 'PageDown':
      PresetObject.list.pageDown(true)
      break
  }
}

// 搜索框 - 输入事件
PresetObject.searcherInput = function (event) {
  if (event.inputType === 'insertCompositionText') {
    return
  }
  const text = this.input.value
  const list = PresetObject.list
  list.searchNodes(text)
  const elements = list.elements
  for (let i = 0; i < elements.count; i++) {
    const {item} = elements[i]
    if (item.class !== 'folder') {
      list.select(item)
      break
    }
  }
}

// 列表 - 打开事件
PresetObject.listOpen = function (event) {
  PresetObject.confirm()
}

// 确定按钮 - 鼠标点击事件
PresetObject.confirm = function (event) {
  const node = this.list.read()
  const presetId = node?.presetId
  if (!presetId) {
    return this.list.getFocus()
  }
  this.target.input(presetId)
  Window.close('presetObject')
}.bind(PresetObject)

export { PresetObject }
