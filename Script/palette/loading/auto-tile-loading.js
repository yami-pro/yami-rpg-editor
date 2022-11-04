'use strict'

import { AutoTile } from '../auto-tile.js'
import * as Yami from '../../yami.js'

// ******************************** 自动图块加载 ********************************

// list methods
AutoTile.templateList.updateNodeElement = Yami.Easing.list.updateNodeElement
AutoTile.templateList.updateItemName = Yami.Easing.list.updateItemName
AutoTile.templateList.addElementClass = Yami.Easing.list.addElementClass
AutoTile.templateList.updateTextNode = Yami.Easing.list.updateTextNode

// 初始化
AutoTile.initialize = function () {
  // 设置最大数量
  this.nodeMaximum = 64
  this.frameMaximum = 256

  // 绑定模板列表
  const list = this.templateList
  list.removable = true
  list.renamable = true
  list.bind(() => this.templates)
  list.creators.push(list.addElementClass)
  list.updaters.push(list.updateTextNode)

  // 侦听事件
  window.on('dprchange', this.dprchange)
  $('#autoTile').on('close', this.windowClose)
  $('#autoTile').on('closed', this.windowClosed)
  list.on('keydown', this.templatesKeydown)
  list.on('select', this.templatesSelect)
  list.on('change', this.templatesChange)
  list.on('popup', this.templatesPopup)
  this.nodeList.on('write', this.nodesWrite)
  this.nodeList.on('popup', this.nodesPopup)
  this.nodeList.on('keydown', this.nodesKeydown)
  $('.autoTile-neighbor').on('input', this.ruleNeighborInput)
  this.frameList.on('write', this.framesWrite)
  this.frameList.on('popup', this.framesPopup)
  this.frameList.on('keydown', this.framesKeydown)
  this.frameList.on('doubleclick', this.framesDoubleclick)
  $('#autoTile-canvas').on('click', this.canvasClick)
  $('#autoTile-image').on('input', this.imageInput)
  $('#autoTile-x').on('input', this.offsetXInput)
  $('#autoTile-y').on('input', this.offsetYInput)
  $('#autoTile-confirm').on('click', this.confirm)
}

// 打开窗口
AutoTile.open = function ({template, image, x, y}) {
  Yami.Window.open('autoTile')
  $('#autoTile-image').write(image)
  $('#autoTile-x').write(x)
  $('#autoTile-y').write(y)
  this.templates = Object.clone(Yami.Data.autotiles)
  this.nodeIndex = 0
  this.frameIndex = 0
  this.imageId = image
  this.offsetX = x
  this.offsetY = y
  this.updateCanvas()
  this.templateList.update()
  this.templateList.select(
    this.getTemplateById(template) ??
    this.templates[0]
  )
  this.templateList.scrollToSelection()
  $('#autoTile-image').getFocus()
}

// 创建自动图块
AutoTile.create = function () {
  return {
    template: Yami.Data.autotiles[0].id,
    image: '',
    x: 0,
    y: 0,
  }
}

// 插入模板
AutoTile.insertTemplate = function (dItem) {
  this.templateList.addNodeTo(this.createTemplateData(), dItem)
}

// 复制模板
AutoTile.copyTemplate = function (item) {
  if (item) {
    Yami.Clipboard.write('yami.ruletile.template', item)
  }
}

// 粘贴模板
AutoTile.pasteTemplate = function (dItem) {
  const copy = Yami.Clipboard.read('yami.ruletile.template')
  if (copy) {
    copy.name += ' - Copy'
    copy.id = this.createTemplateId()
    this.templateList.addNodeTo(copy, dItem)
  }
}

// 删除模板
AutoTile.deleteTemplate = function (item) {
  const items = this.templates
  if (items.length > 1) {
    const get = Yami.Local.createGetter('confirmation')
    Yami.Window.confirm({
      message: get('deleteSingleFile').replace('<filename>', item.name),
    }, [{
      label: get('yes'),
      click: () => {
        const index = items.indexOf(item)
        this.templateList.deleteNode(item)
        const last = items.length - 1
        const target = items[Math.min(index, last)]
        this.templateList.select(target)
      },
    }, {
      label: get('no'),
    }])
  }
}

// 移动模板图块帧
AutoTile.shiftTemplateFrames = function (template, offsetX, offsetY) {
  const sprite = this.image
  if (!(sprite instanceof Image)) {
    return
  }
  const tileWidth = Yami.Palette.tileset.tileWidth
  const tileHeight = Yami.Palette.tileset.tileHeight
  const hframes = Math.floor(sprite.naturalWidth / tileWidth)
  const vframes = Math.floor(sprite.naturalHeight / tileHeight)
  const ox = (offsetX % hframes + hframes) % hframes
  const oy = (offsetY % vframes + vframes) % vframes
  for (const node of template.nodes) {
    const frames = node.frames
    const length = frames.length
    for (let i = 0; i < length; i++) {
      const frame = frames[i]
      const sx = frame & 0xff
      const sy = frame >> 8
      const dx = (sx + ox) % hframes
      const dy = (sy + oy) % vframes
      frames[i] = dx | dy << 8
    }
  }
  this.createFrameItems()
  this.changed = true
}

// 创建模板ID
AutoTile.createTemplateId = function () {
  let id
  do {id = Yami.GUID.generate64bit()}
  while (this.getTemplateById(id))
  return id
}

// 创建模板数据
AutoTile.createTemplateData = function () {
  return {
    id: this.createTemplateId(),
    name: '',
    cover: 0,
    nodes: [this.createNodeData()],
  }
}

// 获取ID匹配的模板
AutoTile.getTemplateById = function (id) {
  const {templates} = this
  const {length} = templates
  for (let i = 0; i < length; i++) {
    if (templates[i].id === id) {
      return templates[i]
    }
  }
  return undefined
}

// 插入节点
AutoTile.insertNode = function (id = this.nodeIndex) {
  if (id <= this.nodes.length) {
    this.nodes.splice(id, 0, this.createNodeData())
    if (this.template.cover >= id) {
      this.template.cover += 1
    }
    this.createNodeItems(id)
    this.changed = true
  }
}

// 剪切节点
AutoTile.cutNode = function (id = this.nodeIndex) {
  if (this.nodes.length > 1) {
    this.copyNode(id)
    this.deleteNode(id)
  }
}

// 复制节点
AutoTile.copyNode = function (id = this.nodeIndex) {
  if (id < this.nodes.length) {
    Yami.Clipboard.write('yami.ruletile.node', this.nodes[id])
  }
}

// 粘贴节点
AutoTile.pasteNode = function (id = this.nodes.length) {
  const copy = Yami.Clipboard.read('yami.ruletile.node')
  if (copy && id <= this.nodes.length) {
    this.nodes.splice(id, 0, copy)
    this.createNodeItems(id)
    this.changed = true
  }
}

// 删除节点
AutoTile.deleteNode = function (id = this.nodeIndex) {
  if (id < this.nodes.length &&
    this.nodes.length > 1) {
    this.nodes.splice(id, 1)
    if (this.template.cover >= id) {
      if (this.template.cover === id) {
        this.template.cover = 0
      } else {
        this.template.cover -= 1
      }
    }
    this.createNodeItems()
    this.changed = true
  }
}

// 设置节点数量
AutoTile.setNodeQuantity = function (count) {
  const nodes = this.nodes
  const length = nodes.length
  if (length !== count) {
    nodes.length = count
    if (length < count) {
      for (let i = length; i < count; i++) {
        nodes[i] = this.createNodeData()
      }
    }
    if (this.template.cover >= count) {
      this.template.cover = 0
    }
    this.createNodeItems()
    this.changed = true
  }
}

// 创建节点数据
AutoTile.createNodeData = function () {
  return {
    rule: 0,
    frames: [this.createFrameData()],
  }
}

// 创建节点选项
AutoTile.createNodeItems = function (id = this.nodeIndex) {
  const list = this.nodeList.reload()
  const cover = this.template.cover
  const nodes = this.nodes
  const length = nodes.length
  const digits = Number.computeIndexDigits(length)
  for (let i = 0; i < length; i++) {
    const element = document.createElement('common-item')
    const index = i.toString().padStart(digits, '0')
    element.textContent = `#${index}${i === cover ? ' !' : ''}`
    element.dataValue = i
    list.appendElement(element)
  }
  list.update()
  list.write(Math.min(id, length - 1))
}

// 编辑帧
AutoTile.editFrame = function () {
  if (this.image !== null) {
    Yami.TileFrame.open()
  }
}

// 插入帧
AutoTile.insertFrame = function (id = this.frameIndex) {
  if (id <= this.frames.length) {
    this.frames.splice(id, 0, this.createFrameData())
    this.createFrameItems(id)
    this.changed = true
  }
}

// 剪切帧
AutoTile.cutFrame = function (id = this.frameIndex) {
  if (this.frames.length > 1) {
    this.copyFrame(id)
    this.deleteFrame(id)
  }
}

// 复制帧
AutoTile.copyFrame = function (id = this.frameIndex) {
  if (id < this.frames.length) {
    Yami.Clipboard.write('yami.ruletile.frame', {
      frame: this.frames[id]
    })
  }
}

// 粘贴帧
AutoTile.pasteFrame = function (id = this.frames.length) {
  const copy = Yami.Clipboard.read('yami.ruletile.frame')
  if (copy && id <= this.frames.length) {
    this.frames.splice(id, 0, copy.frame)
    this.createFrameItems(id)
    this.changed = true
  }
}

// 删除帧
AutoTile.deleteFrame = function (id = this.frameIndex) {
  if (id < this.frames.length &&
    this.frames.length > 1) {
    this.frames.splice(id, 1)
    this.createFrameItems()
    this.changed = true
  }
}

// 设置帧数量
AutoTile.setFrameQuantity = function (count) {
  const frames = this.frames
  const length = frames.length
  if (length !== count) {
    frames.length = count
    if (length < count) {
      for (let i = length; i < count; i++) {
        frames[i] = this.createFrameData()
      }
    }
    this.createFrameItems()
    this.changed = true
  }
}

// 生成图块帧
AutoTile.generateFrames = function (id, strideX, strideY, count) {
  const sprite = this.image
  if (!(sprite instanceof Image)) {
    return
  }
  const tileWidth = Yami.Palette.tileset.tileWidth
  const tileHeight = Yami.Palette.tileset.tileHeight
  const hframes = Math.floor(sprite.naturalWidth / tileWidth)
  const vframes = Math.floor(sprite.naturalHeight / tileHeight)
  const ox = (strideX % hframes + hframes) % hframes
  const oy = (strideY % vframes + vframes) % vframes
  const maximum = this.frameMaximum
  const frames = this.frames
  const frame = frames[id]
  let x = frame & 0xff
  let y = frame >> 8
  count = Math.min(count, maximum - frames.length)
  while (count-- > 0) {
    x = (x + ox) % hframes
    y = (y + oy) % vframes
    frames.splice(++id, 0, x | y << 8)
  }
  this.createFrameItems()
  this.changed = true
}

// 创建帧数据
AutoTile.createFrameData = function () {
  return 0
}

// 创建帧列表
AutoTile.createFrameItems = function (id = this.frameIndex) {
  const list = this.frameList.reload()
  const frames = this.frames
  const length = frames.length
  const digits = Number.computeIndexDigits(length)
  for (let i = 0; i < length; i++) {
    const frame = frames[i]
    const x = frame & 0xff
    const y = frame >> 8
    const element = document.createElement('common-item')
    const index = i.toString().padStart(digits, '0')
    element.textContent = `#${index}: ${x},${y}`
    element.dataValue = i
    list.appendElement(element)
  }
  list.update()
  list.write(Math.min(id, frames.length - 1))
}

// 更新帧选项
AutoTile.updateFrameItem = function () {
  const frames = this.frames
  const index = this.frameIndex
  const length = frames.length
  const frame = frames[index]
  const prefix = Number.padZero(index, length)
  const x = frame & 0xff
  const y = frame >> 8
  this.frameList.selection.textContent = `#${prefix}: ${x},${y}`
  this.drawFrame()
}

// 更新画布
AutoTile.updateCanvas = function () {
  const canvas = this.canvas
  const {width, height} = CSS.getDevicePixelContentBoxSize(canvas)
  if (canvas.width !== width) {
    canvas.width = width
  }
  if (canvas.height !== height) {
    canvas.height = height
  }
}

// 绘制帧图像
AutoTile.drawFrame = function () {
  const canvas = this.canvas
  const context = canvas.getContext('2d')
  const width = canvas.width
  const height = canvas.height

  // 擦除画布
  context.clearRect(0, 0, width, height)

  // 加载图像
  if (!(this.image instanceof Image)) {
    if (this.image === this.noImage) return
    const guid = this.imageId
    if (!guid) {
      return
    }
    const symbol = this.image = Symbol()
    return Yami.File.get({
      guid: guid,
      type: 'image',
    }).then(image => {
      if (this.image === symbol) {
        if (image) {
          this.image = image
          this.drawFrame()
        } else {
          this.image = this.noImage
        }
      }
    })
  }

  // 获取帧数据
  const image = this.image
  const frames = this.frames
  const frame = frames[this.frameIndex]
  const tileWidth = Yami.Palette.tileset.tileWidth
  const tileHeight = Yami.Palette.tileset.tileHeight
  const x = (this.offsetX + (frame & 0xff)) * tileWidth
  const y = (this.offsetY + (frame >> 8)) * tileHeight

  // 绘制图像
  context.drawAndFitImage(image, x, y, tileWidth, tileHeight)
}

// 窗口 - 关闭事件
AutoTile.windowClose = function (event) {
  if (this.changed) {
    event.preventDefault()
    const get = Yami.Local.createGetter('confirmation')
    Yami.Window.confirm({
      message: get('closeUnsavedTiles'),
    }, [{
      label: get('yes'),
      click: () => {
        this.changed = false
        Yami.Window.close('autoTile')
      },
    }, {
      label: get('no'),
    }])
  }
}.bind(AutoTile)

// 窗口 - 已关闭事件
AutoTile.windowClosed = function (event) {
  this.templates = null
  this.template = null
  this.nodes = null
  this.node = null
  this.frames = null
  this.image = null
  this.updateCanvas()
  this.templateList.clear()
  this.nodeList.clear()
  this.frameList.clear()
}.bind(AutoTile)

// 设备像素比改变事件
AutoTile.dprchange = function (event) {
  if (this.nodes !== null) {
    this.updateCanvas()
    this.drawFrame()
  }
}.bind(AutoTile)

// 模板列表 - 键盘按下事件
AutoTile.templatesKeydown = function (event) {
  const item = this.read()
  if (event.cmdOrCtrlKey) {
    switch (event.code) {
      case 'KeyC':
        AutoTile.copyTemplate(item)
        break
      case 'KeyV':
        AutoTile.pasteTemplate()
        break
    }
  } else if (event.altKey) {
    return
  } else {
    switch (event.code) {
      case 'Insert':
        AutoTile.insertTemplate(item)
        break
      case 'Delete':
        AutoTile.deleteTemplate(item)
        break
    }
  }
}

// 模板列表 - 选择事件
AutoTile.templatesSelect = function (event) {
  const item = event.value
  this.template = item
  this.nodes = item.nodes

  // 创建节点列表
  this.createNodeItems()
}.bind(AutoTile)

// 模板列表 - 改变事件
AutoTile.templatesChange = function (event) {
  this.changed = true
}.bind(AutoTile)

// 模板列表 - 菜单弹出事件
AutoTile.templatesPopup = function (event) {
  const item = event.value
  const selected = !!item
  const pastable = Yami.Clipboard.has('yami.ruletile.template')
  const deletable = selected && AutoTile.templates.length > 1
  const get = Yami.Local.createGetter('menuAutoTileTemplateList')
  Yami.Menu.popup({
    x: event.clientX,
    y: event.clientY,
  }, [{
    label: get('insert'),
    accelerator: 'Insert',
    click: () => {
      AutoTile.insertTemplate(item)
    },
  }, {
    label: get('copy'),
    accelerator: Yami.ctrl('C'),
    enabled: selected,
    click: () => {
      AutoTile.copyTemplate(item)
    },
  }, {
    label: get('paste'),
    accelerator: Yami.ctrl('V'),
    enabled: pastable,
    click: () => {
      AutoTile.pasteTemplate(item)
    },
  }, {
    label: get('delete'),
    accelerator: 'Delete',
    enabled: deletable,
    click: () => {
      AutoTile.deleteTemplate(item)
    },
  }, {
    label: get('rename'),
    accelerator: 'F2',
    enabled: selected,
    click: () => {
      this.rename(item)
    },
  }, {
    type: 'separator',
  }, {
    label: get('shift'),
    enabled: selected,
    click: () => {
      Yami.SceneShift.open((x, y) => {
        AutoTile.shiftTemplateFrames(item, x, y)
      })
    },
  }])
}

// 节点列表 - 写入事件
AutoTile.nodesWrite = function (event) {
  const nodeIndex = event.value
  this.nodeIndex = nodeIndex
  this.node = this.nodes[nodeIndex]
  this.frames = this.node.frames
  const write = Yami.getElementWriter('autoTile')
  const rule = this.node.rule
  write('rule-0', rule       & 0b11)
  write('rule-1', rule >> 2  & 0b11)
  write('rule-2', rule >> 4  & 0b11)
  write('rule-3', rule >> 6  & 0b11)
  write('rule-4', rule >> 8  & 0b11)
  write('rule-5', rule >> 10 & 0b11)
  write('rule-6', rule >> 12 & 0b11)
  write('rule-7', rule >> 14 & 0b11)

  // 创建帧列表
  this.createFrameItems()
}.bind(AutoTile)

// 节点列表 - 菜单弹出事件
AutoTile.nodesPopup = function (event) {
  const id = event.value
  const cover = this.template.cover
  const nodes = this.nodes
  const selected = id !== null
  const insertable = nodes.length < this.nodeMaximum
  const copyable = selected
  const pastable = insertable && Yami.Clipboard.has('yami.ruletile.node')
  const deletable = selected && nodes.length > 1
  const coverable = selected && id !== cover
  const get = Yami.Local.createGetter('menuAutoTileNodeList')
  Yami.Menu.popup({
    x: event.clientX,
    y: event.clientY,
  }, [{
    label: get('insert'),
    accelerator: 'Insert',
    enabled: insertable,
    click: () => {
      this.insertNode(id ?? nodes.length)
    },
  }, {
    label: get('cut'),
    accelerator: Yami.ctrl('X'),
    enabled: deletable,
    click: () => {
      this.cutNode(id)
    },
  }, {
    label: get('copy'),
    accelerator: Yami.ctrl('C'),
    enabled: copyable,
    click: () => {
      this.copyNode(id)
    },
  }, {
    label: get('paste'),
    accelerator: Yami.ctrl('V'),
    enabled: pastable,
    click: () => {
      this.pasteNode(id ?? nodes.length)
    },
  }, {
    label: get('delete'),
    accelerator: 'Delete',
    enabled: deletable,
    click: () => {
      this.deleteNode(id)
    },
  }, {
    label: get('setQuantity'),
    click: () => {
      Yami.SetQuantity.open(
        nodes.length,
        this.nodeMaximum,
        this.setNodeQuantity.bind(this),
      )
    },
  }, {
    type: 'separator',
  }, {
    label: get('setAsCover'),
    enabled: coverable,
    click: () => {
      this.template.cover = id
      this.changed = true
      this.createNodeItems()
    },
  }])
}.bind(AutoTile)

// 节点列表 - 键盘按下事件
AutoTile.nodesKeydown = function (event) {
  if (event.cmdOrCtrlKey) {
    switch (event.code) {
      case 'KeyX':
        AutoTile.cutNode()
        break
      case 'KeyC':
        AutoTile.copyNode()
        break
      case 'KeyV':
        AutoTile.pasteNode()
        break
    }
  } else if (event.altKey) {
    return
  } else {
    switch (event.code) {
      case 'Insert':
        AutoTile.insertNode()
        break
      case 'Delete':
        AutoTile.deleteNode()
        break
    }
  }
}

// 规则相邻关系 - 输入事件
AutoTile.ruleNeighborInput = function (event) {
  const read = Yami.getElementReader('autoTile-rule')
  const rule = (
    read('0')
  | read('1') << 2
  | read('2') << 4
  | read('3') << 6
  | read('4') << 8
  | read('5') << 10
  | read('6') << 12
  | read('7') << 14
  )
  AutoTile.node.rule = rule
  AutoTile.changed = true
}

// 帧列表 - 写入事件
AutoTile.framesWrite = function (event) {
  this.frameIndex = event.value
  this.drawFrame()
}.bind(AutoTile)

// 帧列表 - 菜单弹出事件
AutoTile.framesPopup = function (event) {
  const id = event.value
  const frames = this.frames
  const selected = id !== null
  const editable = selected && this.image instanceof Image
  const insertable = frames.length < this.frameMaximum
  const copyable = selected
  const pastable = insertable && Yami.Clipboard.has('yami.ruletile.frame')
  const deletable = selected && frames.length > 1
  const get = Yami.Local.createGetter('menuAutoTileFrameList')
  Yami.Menu.popup({
    x: event.clientX,
    y: event.clientY,
  }, [{
    label: get('edit'),
    accelerator: 'Enter',
    enabled: editable,
    click: () => {
      this.editFrame()
    },
  }, {
    label: get('insert'),
    accelerator: 'Insert',
    enabled: insertable,
    click: () => {
      this.insertFrame(id ?? frames.length)
    },
  }, {
    label: get('cut'),
    accelerator: Yami.ctrl('X'),
    enabled: deletable,
    click: () => {
      this.cutFrame(id)
    },
  }, {
    label: get('copy'),
    accelerator: Yami.ctrl('C'),
    enabled: copyable,
    click: () => {
      this.copyFrame(id)
    },
  }, {
    label: get('paste'),
    accelerator: Yami.ctrl('V'),
    enabled: pastable,
    click: () => {
      this.pasteFrame(id ?? frames.length)
    },
  }, {
    label: get('delete'),
    accelerator: 'Delete',
    enabled: deletable,
    click: () => {
      this.deleteFrame(id)
    },
  }, {
    label: get('setQuantity'),
    click: () => {
      Yami.SetQuantity.open(
        frames.length,
        this.frameMaximum,
        this.setFrameQuantity.bind(this),
      )
    },
  }, {
    type: 'separator',
  }, {
    label: get('generate'),
    enabled: editable && insertable,
    click: () => {
      Yami.FrameGenerator.open((x, y, count) => {
        this.generateFrames(id, x, y, count)
      })
    },
  }])
}.bind(AutoTile)

// 帧列表 - 键盘按下事件
AutoTile.framesKeydown = function (event) {
  if (event.cmdOrCtrlKey) {
    switch (event.code) {
      case 'KeyX':
        AutoTile.cutFrame()
        break
      case 'KeyC':
        AutoTile.copyFrame()
        break
      case 'KeyV':
        AutoTile.pasteFrame()
        break
    }
  } else if (event.altKey) {
    return
  } else {
    switch (event.code) {
      case 'Enter':
      case 'NumpadEnter':
        event.stopPropagation()
        AutoTile.editFrame()
        break
      case 'Insert':
        AutoTile.insertFrame()
        break
      case 'Delete':
        AutoTile.deleteFrame()
        break
    }
  }
}

// 帧列表 - 鼠标双击事件
AutoTile.framesDoubleclick = function (event) {
  const element = event.target
  if (element.tagName === 'COMMON-ITEM' &&
    element.hasClass('selected')) {
    this.editFrame()
  }
}.bind(AutoTile)

// 画布 - 鼠标点击事件
AutoTile.canvasClick = function (event) {
  this.editFrame()
}.bind(AutoTile)

// 图像 - 输入事件
AutoTile.imageInput = function (event) {
  AutoTile.imageId = this.read()
  AutoTile.image = null
  AutoTile.drawFrame()
}

// 偏移X - 输入事件
AutoTile.offsetXInput = function (event) {
  const x = this.read()
  if (AutoTile.offsetX !== x) {
    AutoTile.offsetX = x
    AutoTile.drawFrame()
  }
}

// 偏移Y - 输入事件
AutoTile.offsetYInput = function (event) {
  const y = this.read()
  if (AutoTile.offsetY !== y) {
    AutoTile.offsetY = y
    AutoTile.drawFrame()
  }
}

// 确定按钮 - 鼠标点击事件
AutoTile.confirm = function (event) {
  if (this.changed) {
    this.changed = false
    // 删除数据绑定的元素对象
    const templates = this.templates
    Yami.NodeList.deleteCaches(templates)
    Yami.Data.autotiles = templates
    Yami.Data.createGUIDMap(templates)
    Yami.File.planToSave(Yami.Data.manifest.project.autotiles)
  }
  const tiles = Yami.Palette.tileset.tiles
  const index = Yami.Palette.openIndex
  const isNew = !tiles[index]
  tiles[index] = {
    template: this.template.id,
    image: this.imageId,
    x: this.offsetX,
    y: this.offsetY,
  }
  // 重新选择图块
  if (isNew) {
    const {marquee} = Palette
    if (marquee.visible) {
      const {x, y, width, height} = marquee
      Yami.Palette.selectTiles(x, y, width, height)
    }
  }
  Yami.File.planToSave(Yami.Palette.meta)
  Yami.Palette.requestRendering()
  Yami.Scene.requestRendering()
  Yami.Window.close('autoTile')
  // console.log(JSON.stringify(tiles[index], null, 2))
}.bind(AutoTile)
