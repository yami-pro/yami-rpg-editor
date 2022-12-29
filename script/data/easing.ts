"use strict"

import {
  ctrl,
  Data,
  File,
  getElementReader,
  getElementWriter,
  GUID,
  Inspector,
  Local,
  Menu,
  TreeList,
  SetKey,
  Timer,
  Window,
  Clipboard,
  Log,
  ErrorMsg,
  RadioBox,
  SelectBox,
  NumberBox
} from "../yami"

// ******************************** 过渡窗口 ********************************

namespace Type {
  export type node = {
    [key: string]:
      number |
      boolean |
      string |
      node |
      node[]
  }
  export type element = node & HTMLElement
  export type text = node & Text
  export type treeList = TreeList & {
    saveSelection(): void
    restoreSelection(): void
    updateNodeElement(element: element): void
    updateItemName(item: node): void
    addElementClass(item: node): void
    updateTextNode(item: node): void
    createKeyTextNode(item: node): void
    updateKeyTextNode(item: node): void
  }
  export type point = {
    x: number
    y: number
  }
  export type canvas = HTMLCanvasElement & {
    centerX: number
    centerY: number
    spacing: number
    context: CanvasRenderingContext2D | null
    gridColor: string
    axisColor: string
    textColor: string
    curveColor: string
    curveColorActive: string
    linkColorActive: string
  }
  export type linear = {
    get: (key: any) => any
  }
  export type event = Event & {
    key: string
    value: (node & Easing) |
           string |
           number
  }
  export type pointerEvent = PointerEvent & {
    pointStartX: number
    pointStartY: number
  }
}

interface Easing {
  // properties
  list: Type.treeList
  curve: Type.canvas
  preview: Type.canvas
  data: typeof Data.easings
  points: Type.point[]
  dragging: Type.pointerEvent | null
  activePoint: Type.point | null
  scale: number
  originX: number
  originY: number
  timer: Timer
  reverse: boolean
  elapsed: number
  duration: number
  delay: number
  curveMap: Scope.CurveMap | null
  easingMap: Scope.EasingMap | null
  pointImage: HTMLImageElement | null
  previewImage: HTMLCanvasElement | null
  startPoint: Type.point
  endPoint: Type.point
  changed: boolean
  // methods
  initialize(): void
  get(id: string): Type.linear | Scope.EasingMap
  clear(): void
  open(): void
  load(easing: Easing): void
  insert(dItem: Type.node): void
  copy(item: Type.node): void
  paste(dItem: Type.node): void
  delete(item: Type.node): void
  createId(): string
  createData(): {
    id: string
    key: string
    name: string
    points: Type.point[]
  }
  setEasingKey(item: Type.node): void
  getItemById(id: string): Type.node | undefined
  updateMaps(): void
  updateCanvases(): void
  drawCurve(): void
  drawPreview(): void
  updatePoints(): void
  selectPointByCoords(mouseX: number, mouseY: number): Type.point | null
  createPointImage(): void
  createPreviewImage(): void
  requestRendering(): void
  renderingFunction(): void
  stopRendering(): void
  // events
  windowClose(event: Type.event): void
  windowClosed(event: Type.event): void
  dprchange(event: Type.event): void
  themechange(event: Type.event): void
  dataChange(event: Type.event): void
  listKeydown(event: KeyboardEvent): void
  listSelect(event: Type.event): void
  listOpen(event: Type.event): void
  listPopup(event: Type.event): void
  modeSelect(event: Type.event): void
  pointInput(event: Type.event): void
  scaleInput(event: Type.event): void
  curveKeydown(event: KeyboardEvent): void
  curvePointerdown(event: Type.pointerEvent): void
  curveWheel(event: Type.event): void
  curveBlur(event: Type.event): void
  pointerup(event: Type.pointerEvent): void
  pointermove(event: Type.pointerEvent): void
  reverseInput(event: Type.event): void
  durationInput(event: Type.event): void
  delayInput(event: Type.event): void
  confirm(event: Type.event): void
  // classes
  CurveMap: typeof Scope.CurveMap
  EasingMap: typeof Scope.EasingMap
}

const Easing = <Easing & Type.node>{}

// ******************************** 过渡窗口加载 ********************************

Easing.list = <Type.treeList>$('#easing-list')
Easing.curve = $('#easing-curve-canvas')
Easing.preview = $('#easing-preview-canvas')
Easing.data = null
Easing.activePoint = null
Easing.pointImage = null
Easing.previewImage = null
Easing.changed = false

// 初始化
Easing.initialize = function () {
  // 设置起点和终点
  this.startPoint = {x: 0, y: 0}
  this.endPoint = {x: 1, y: 1}

  // 绑定过渡列表
  const {list} = this
  list.removable = true
  list.renamable = true
  list.bind(() => this.data)
  list.creators.push(list.addElementClass)
  list.updaters.push(list.updateTextNode)
  list.creators.push(list.createKeyTextNode)
  list.updaters.push(list.updateKeyTextNode)

  // 创建模式选项
  $('#easing-mode').loadItems([
    {name: 'Use 2 Points', value: 2},
    {name: 'Use 5 Points', value: 5},
    {name: 'Use 8 Points', value: 8},
  ])

  // 创建回放选项
  $('#easing-preview-reverse').loadItems([
    {name: 'ON', value: true},
    {name: 'OFF', value: false},
  ])

  // 设置模式关联元素
  const inputs = []
  for (let i = 0; i < 8; i++) {
    inputs.push(
      $(`#easing-points-${i}-x`),
      $(`#easing-points-${i}-y`),
    )
  }
  $('#easing-mode').enableHiddenMode().relate([
    {case: 2, targets: inputs.slice(0, 4)},
    {case: 5, targets: inputs.slice(0, 10)},
    {case: 8, targets: inputs},
  ])

  // 设置初始缩放率
  this.scale = 1
  $('#easing-scale').write(this.scale)

  // 设置预览参数
  this.reverse = true
  this.duration = 400
  this.delay = 400
  $('#easing-preview-reverse').write(this.reverse)
  $('#easing-preview-duration').write(this.duration)
  $('#easing-preview-delay').write(this.delay)

  // 创建计时器
  this.timer = new Timer({
    duration: this.duration,
    update: timer => {
      switch (timer.state) {
        case 'playing':
          this.elapsed = timer.elapsed
          this.requestRendering()
          this.drawPreview()
          break
      }
      return true
    },
    callback: timer => {
      switch (timer.state) {
        case 'playing':
          // 如果存在等待时间
          if (this.delay !== 0) {
            timer.state = 'waiting'
            timer.elapsed = timer.playbackRate > 0 ? 0 : this.delay
            timer.duration = this.delay
            break
          }
        case 'waiting':
          timer.state = 'playing'
          timer.duration = this.duration
          switch (timer.playbackRate) {
            case 1:
              if (this.reverse) {
                timer.playbackRate = -1
                timer.elapsed = timer.duration
              } else {
                timer.elapsed = 0
              }
              break
            case -1:
              timer.playbackRate = 1
              break
          }
          break
      }
      return true
    },
  })

  // 侦听事件
  window.on('dprchange', this.dprchange)
  window.on('themechange', this.themechange)
  $('#easing').on('close', this.windowClose)
  $('#easing').on('closed', this.windowClosed)
  $('#easing-points-grid').on('change', this.dataChange)
  list.on('keydown', this.listKeydown)
  list.on('select', this.listSelect)
  list.on('change', this.dataChange)
  list.on('open', this.listOpen)
  list.on('popup', this.listPopup)
  $('#easing-mode').on('input', this.modeSelect)
  document.querySelectorAll(`#easing-points-0-x, #easing-points-0-y, #easing-points-1-x, #easing-points-1-y,
    #easing-points-2-x, #easing-points-2-y, #easing-points-3-x, #easing-points-3-y,
    #easing-points-4-x, #easing-points-4-y, #easing-points-5-x, #easing-points-5-y,
    #easing-points-6-x, #easing-points-6-y, #easing-points-7-x, #easing-points-7-y`
  ).on('input', this.pointInput)
  $('#easing-scale').on('input', this.scaleInput)
  this.curve.on('keydown', this.curveKeydown)
  this.curve.on('pointerdown', this.curvePointerdown)
  this.curve.on('wheel', this.curveWheel)
  this.curve.on('blur', this.curveBlur)
  $('#easing-preview-reverse').on('input', this.reverseInput)
  $('#easing-preview-duration').on('input', this.durationInput)
  $('#easing-preview-delay').on('input', this.delayInput)
  $('#easing-confirm').on('click', this.confirm)
}

// 创建作用域
namespace Scope {
  const maps: {[key: string]: Scope.EasingMap} = {}
  const linear: Type.linear = {
    get: (key: any) => key
  }
  export const get = (id: string) => {
    // 返回现有映射表
    const map = maps[id]
    if (map !== undefined) {
      return map
    }

    // 创建新的映射表
    const easing = Data.easings?.map[id]
    if (easing !== undefined) {
      const points = easing.points
      const {startPoint, endPoint} = Easing
      const map = new Easing.EasingMap()
      map.update(startPoint, ...points, endPoint)
      return maps[id] = map
    }

    // 返回缺省值
    return linear
  }
  export const clear = () => {
    for (const key of Object.keys(maps)) {
      delete maps[key]
    }
  }
}

// 获取映射表
Easing.get = Scope.get

// 清除映射表集合
Easing.clear = Scope.clear

// 打开窗口
Easing.open = function () {
  Window.open('easing')

  // 创建数据副本
  this.data = Object.clone(Data.easings)

  // 创建映射表
  this.curveMap = new Easing.CurveMap()
  this.easingMap = new Easing.EasingMap()

  // 重置并添加计时器
  this.timer.state = 'playing'
  this.timer.playbackRate = 1
  this.timer.elapsed = 0
  this.timer.add()

  // 创建控制点图像
  this.createPointImage()

  // 创建预览图像
  this.createPreviewImage()

  // 更新画布
  this.updateCanvases()

  // 更新列表项目
  this.list.restoreSelection()

  // 列表获得焦点
  this.list.getFocus()
}

// 加载数据
Easing.load = function (easing) {
  const points = easing.points
  this.points = points

  // 写入数据
  const write = getElementWriter('easing', easing)
  const length = points.length
  write('mode', length)
  for (let i = 0; i < length; i++) {
    write(`points-${i}-x`)
    write(`points-${i}-y`)
  }
  for (let i = length; i < 8; i++) {
    write(`points-${i}-x`, 0)
    write(`points-${i}-y`, 0)
  }

  // 更新映射表并绘制图形
  this.updateMaps()
  this.requestRendering()
}

// 插入
Easing.insert = function (dItem) {
  this.list.addNodeTo(this.createData(), dItem)
}

// 复制
Easing.copy = function (item) {
  if (item) {
    Clipboard.write('yami.data.easing', item)
  }
}

// 粘贴
Easing.paste = function (dItem) {
  const copy = Clipboard.read('yami.data.easing')
  if (copy) {
    copy.name += ' - Copy'
    copy.id = this.createId()
    this.list.addNodeTo(copy, dItem)
  }
}

// 删除
Easing.delete = function (item) {
  const items = this.data
  if (items !== null && items.length > 1) {
    const get = Local.createGetter('confirmation')
    Window.confirm({
      message: get('deleteSingleFile').replace('<filename>', item.name),
    }, [{
      label: get('yes'),
      click: () => {
        const index = items.indexOf(item)
        this.list.deleteNode(item)
        const last = items.length - 1
        this.list.select(items[Math.min(index, last)])
      },
    }, {
      label: get('no'),
    }])
  }
}

// 创建ID
Easing.createId = function () {
  let id
  do {id = GUID.generate64bit()}
  while (this.getItemById(id))
  return id
}

// 创建数据
Easing.createData = function () {
  return {
    id: this.createId(),
    key: '',
    name: '',
    points: [{x: 0, y: 0}, {x: 1, y: 1}],
  }
}

// 设置过渡曲线的键
Easing.setEasingKey = function (item) {
  SetKey.open(item.key, key => {
    item.key = key
    this.changed = true
    this.list.updateKeyTextNode(item)
  })
}

// 获取ID匹配的数据
Easing.getItemById = function (id) {
  const {data} = this
  if (data !== null) {
    const {length} = data
    for (let i = 0; i < length; i++) {
      if (data[i].id === id) {
        return data[i]
      }
    }
  }
  return undefined
}

// 更新映射表
Easing.updateMaps = function () {
  const {startPoint, endPoint} = this
  this.curveMap?.update(startPoint, ...this.points, endPoint)
  this.easingMap?.update(startPoint, ...this.points, endPoint)
}

// 更新画布
Easing.updateCanvases = function () {
  // 更新曲线画布
  const {curve} = this
  const {width: cWidth, height: cHeight} =
  CSS.getDevicePixelContentBoxSize(curve)
  if (curve.width !== cWidth ||
    curve.height !== cHeight) {
    if (curve.width !== cWidth) {
      curve.width = cWidth
    }
    if (curve.height !== cHeight) {
      curve.height = cHeight
    }
    curve.centerX = cWidth >> 1
    curve.centerY = cHeight >> 1
    // 间隔设置为偶数可保证50%缩放率时原点是整数
    curve.spacing = Math.floor(Math.max(cWidth / 12, 20) / 2) * 2
  }

  // 更新预览画布
  const {preview} = this
  const {width: pWidth, height: pHeight} =
  CSS.getDevicePixelContentBoxSize(preview)
  if (preview.width !== pWidth) {
    preview.width = pWidth
  }
  if (preview.height !== pHeight) {
    preview.height = pHeight
  }
}

// 绘制曲线
Easing.drawCurve = function () {
  const canvas = this.curve
  const scale = this.scale
  const width = canvas.width
  const height = canvas.height
  const spacing = canvas.spacing * scale
  const fullSize = spacing * 10
  const originX = this.originX = canvas.centerX - spacing * 5
  const originY = this.originY = canvas.centerY + spacing * 5

  // 擦除画布
  let {context} = canvas
  if (!context) {
    context = canvas.context = canvas.getContext('2d', {desynchronized: true})
  }
  if (context === null) {
    Log.error(ErrorMsg.E00000062)
    return
  }
  context.clearRect(0, 0, width, height)

  // 绘制虚线网格
  context.beginPath()
  for (let y = originY % spacing; y < height; y += spacing) {
    context.moveTo(0, y + 0.5)
    context.lineTo(width, y + 0.5)
  }
  for (let x = originX % spacing; x < width; x += spacing) {
    context.moveTo(x + 0.5, 0)
    context.lineTo(x + 0.5, height)
  }
  context.strokeStyle = canvas.gridColor
  context.setLineDash([1])
  context.stroke()

  // 绘制辅助线
  context.strokeStyle = canvas.axisColor
  context.beginPath()
  context.moveTo(originX, originY - fullSize + 0.5)
  context.lineTo(originX + fullSize + 0.5, originY - fullSize + 0.5)
  context.lineTo(originX + fullSize + 0.5, originY)
  context.stroke()

  // 绘制坐标轴
  context.beginPath()
  context.moveTo(0, originY + 0.5)
  context.lineTo(width, originY + 0.5)
  context.moveTo(originX + 0.5, 0)
  context.lineTo(originX + 0.5, height)
  context.strokeStyle = canvas.axisColor
  context.setLineDash([])
  context.stroke()

  // 绘制坐标轴文本
  context.textBaseline = 'top'
  context.font = '12px Arial'
  context.fillStyle = canvas.textColor
  context.fillText('TIME', originX + 4, originY + 4)
  context.translate(originX, originY)
  context.rotate(Math.PI * 3 / 2)
  context.fillText('PROGRESSION', 4, -12)
  context.setTransform(1, 0, 0, 1, 0, 0)

  // 绘制曲线
  if (this.curveMap !== null) {
    context.lineWidth = 2
    context.strokeStyle = canvas.curveColor
    context.beginPath()
    context.moveTo(originX + 0.5, originY + 0.5)
    const curveMap = this.curveMap
    const count = curveMap.count
    for (let i = 2; i < count; i += 2) {
      context.lineTo(originX + curveMap[i] * fullSize + 0.5, originY - curveMap[i + 1] * fullSize + 0.5)
    }
    context.stroke()
  }

  // 绘制激活曲线
  if (this.easingMap !== null) {
    context.strokeStyle = canvas.curveColorActive
    context.beginPath()
    context.moveTo(originX + 0.5, originY + 0.5)
    const easingMap = this.easingMap
    const ratio = easingMap.length - 1
    const time = this.elapsed / this.duration
    const length = Math.ceil(ratio * time) + 1
    for (let i = 1; i < length; i++) {
      context.lineTo(originX + i * fullSize / ratio + 0.5, originY - easingMap[i] * fullSize + 0.5)
    }
    context.stroke()
    context.lineWidth = 1
  }

  // 绘制连接线
  const active = this.activePoint
  const points = this.points
  const pLength = points.length
  for (let i = 0; i < pLength; i++) {
    let linkPoint
    switch (i % 3) {
      case 0:
        linkPoint = points[i - 1] ?? this.startPoint
        break
      case 1:
        linkPoint = points[i + 1] ?? this.endPoint
        break
      default:
        continue
    }
    const point = points[i]
    const sx = originX + Math.round(point.x * fullSize)
    const sy = originY - Math.round(point.y * fullSize)
    const dx = originX + Math.round(linkPoint.x * fullSize)
    const dy = originY - Math.round(linkPoint.y * fullSize)
    const isActive = active === point
    context.strokeStyle = isActive ? canvas.linkColorActive : canvas.axisColor
    context.beginPath()
    context.moveTo(sx + 0.5, sy + 0.5)
    context.lineTo(dx + 0.5, dy + 0.5)
    context.stroke()
  }

  // 绘制控制点
  const image = this.pointImage
  if (image === null) return
  for (let i = 0; i < pLength; i++) {
    const point = points[i]
    const x = originX + Math.round(point.x * fullSize)
    const y = originY - Math.round(point.y * fullSize)
    const sx = i * 3
    const isActive = active === point
    if (y - 3 < 0) {
      context.drawImage(image, 7, isActive ? 22: 15, 7, 4, x - 3, 0, 7, 4)
      context.drawImage(image, sx, isActive ? 10: 5, 3, 5, x - 1, 3, 3, 5)
    } else if (y + 4 >= height) {
      context.drawImage(image, 7, isActive ? 25: 18, 7, 4, x - 3, height - 4, 7, 4)
      context.drawImage(image, sx, isActive ? 10: 5, 3, 5, x - 1, height - 8, 3, 5)
    } else {
      context.drawImage(image, 0, isActive ? 22: 15, 7, 7, x - 3, y - 3, 7, 7)
      context.drawImage(image, sx, 0, 3, 5, x - 1, y - 2, 3, 5)
    }
  }
}

// 绘制预览视图
Easing.drawPreview = function () {
  const canvas = this.preview
  const width = canvas.width
  const height = canvas.height
  const image = this.previewImage
  if (image === null) {
    Log.error(ErrorMsg.E00000062)
    return
  }
  const size = image.height
  const halfsize = size / 2
  const spacingX = Math.floor((width - size * 4) / 5)
  const spacingY = Math.floor(height / 2)
  const time = this.easingMap?.get(this.elapsed / this.duration)
  const dpr = window.devicePixelRatio

  // 擦除画布
  let {context} = canvas
  if (!context) {
    context = canvas.context = canvas.getContext('2d', {desynchronized: true})
  }
  if (context === null) {
    Log.error(ErrorMsg.E00000062)
    return
  }
  context.clearRect(0, 0, width, height)

  if (time === undefined)
    return
  // 绘制位移元素
  {
    const offset = Math.round(60 * dpr)
    const y0 = spacingY - halfsize + offset
    const y1 = spacingY - halfsize - offset
    const dx = spacingX
    const dy = y0 * (1 - time) + y1 * time
    context.drawImage(image, 0, 0, size, size, dx, dy, size, size)
  }

  // 绘制缩放元素
  {
    const minScale = 0.5 * dpr
    const maxScale = 1.75 * dpr
    const side0 = size * minScale
    const side1 = size * maxScale
    const side = side0 * (1 - time) + side1 * time
    const halfside = side / 2
    const dx = spacingX * 2 + halfsize * 3 - halfside
    const dy = spacingY - halfside
    context.drawImage(image, size, 0, size, size, dx, dy, side, side)
  }

  // 绘制旋转元素
  {
    const angle = time * Math.PI * 2
    const ox = spacingX * 3 + halfsize * 5
    const oy = spacingY + 20
    context.translate(ox, oy)
    context.rotate(angle)
    context.drawImage(image, size * 2, 0, size, size, -halfsize, -halfsize, size, size)
    context.setTransform(1, 0, 0, 1, 0, 0)
  }

  // 绘制透明元素
  {
    const alpha = time
    const dx = spacingX * 4 + halfsize * 6
    const dy = spacingY + 20 - halfsize
    context.globalAlpha = alpha
    context.drawImage(image, size * 3, 0, size, size, dx, dy, size, size)
    context.globalAlpha = 1
  }
}

// 更新控制点
Easing.updatePoints = function () {
  const read = getElementReader('easing')
  const count = read('mode')
  const points = this.points
  const length = points.length
  if (length !== count) {
    points.length = count
    for (let i = length; i < count; i++) {
      points[i] = {
        x: read(`points-${i}-x`),
        y: read(`points-${i}-y`),
      }
    }
  }
}

// 选择控制点 - 通过坐标
Easing.selectPointByCoords = function (mouseX, mouseY) {
  let target = null
  let weight = 0
  const canvas = this.curve
  const fullSize = canvas.spacing * this.scale * 10
  const x = (mouseX - this.originX) / fullSize
  const y = (this.originY - mouseY) / fullSize
  const ifSelectUpper = mouseY < 20
  const ifSelectLower = mouseY >= canvas.height - 20
  const borderY = ifSelectUpper ? 
                  this.originY / fullSize : ifSelectLower ?
                  (this.originY - canvas.height) / fullSize : 0
  const points = this.points
  for (let i = points.length - 1; i >= 0; i--) {
    const point = points[i]
    const distX = Math.abs(point.x - x)
    const distY = Math.abs(point.y - y)
    if (distX <= 0.1 && distY <= 0.1 ||
      ifSelectUpper && distX <= 0.1 && point.y > borderY ||
      ifSelectLower && distX <= 0.1 && point.y < borderY) {
      const w = -Math.hypot(distX, distY)
      if (target === null || weight < w) {
        target = point
        weight = w
      }
    }
  }
  if (this.activePoint !== target) {
    this.activePoint = target
    this.requestRendering()
  }
  return target
}

// 创建控制点图像
Easing.createPointImage = function () {
  if (!this.pointImage) {
    File.get({
      local: 'images/curve_mark.png',
      type: 'image',
    }).then(image => {
      this.pointImage = <HTMLImageElement>image
    })
  }
}

// 创建预览图像
Easing.createPreviewImage = function () {
  if (!this.previewImage) {
    const canvas = document.createElement('canvas')
    canvas.width = 480
    canvas.height = 120
    const context = canvas.getContext('2d')
    if (context === null) {
      Log.error(ErrorMsg.E00000062)
      return
    }
    const y = (canvas.height - 64) / 2 + 64 * 0.85
    context.fillStyle = '#000000'
    context.fillRect(0, 0, 480, 120)
    context.fillStyle = '#ffffff'
    context.textAlign = 'center'
    context.font = '64px Microsoft YaHei UI'
    context.fillText('Y', 60, y)
    context.fillText('A', 180, y)
    context.fillText('M', 300, y)
    context.fillText('I', 420, y)
    this.previewImage = canvas
  }
}

// 请求渲染
Easing.requestRendering = function () {
  if (this.data !== null) {
    Timer.appendUpdater('sharedRendering', this.renderingFunction)
  }
}

// 渲染函数
Easing.renderingFunction = function () {
  Easing.drawCurve()
}

// 停止渲染
Easing.stopRendering = function () {
  Timer.removeUpdater('sharedRendering', this.renderingFunction)
}

// 窗口 - 关闭事件
Easing.windowClose = function (event) {
  if (Easing.changed) {
    event.preventDefault()
    const get = Local.createGetter('confirmation')
    Window.confirm({
      message: get('closeUnsavedEasings'),
    }, [{
      label: get('yes'),
      click: () => {
        Easing.changed = false
        Window.close('easing')
      },
    }, {
      label: get('no'),
    }])
  }
}

// 窗口 - 已关闭事件
Easing.windowClosed = function (this: Easing, event: Type.event) {
  this.list.saveSelection()
  this.curve.blur()
  this.timer.remove()
  this.data = null
  this.points = []
  this.curveMap = null
  this.easingMap = null
  this.activePoint = null
  this.previewImage = null
  this.list.clear()
  this.stopRendering()
}.bind(Easing)

// 设备像素比改变事件
Easing.dprchange = function (this: Easing, event: Type.event) {
  if (this.data !== null) {
    this.updateCanvases()
    this.requestRendering()
  }
}.bind(Easing)

// 主题改变事件
Easing.themechange = function (this: Easing, event: Type.event) {
  const canvas = this.curve
  switch (event.value) {
    case 'light':
      canvas.textColor = '#808080'
      canvas.gridColor = '#c0c0c0'
      canvas.axisColor = '#606060'
      canvas.curveColor = '#808080'
      canvas.curveColorActive = '#000000'
      canvas.linkColorActive = '#00a0f0'
      break
    case 'dark':
      canvas.textColor = '#808080'
      canvas.gridColor = '#404040'
      canvas.axisColor = '#808080'
      canvas.curveColor = '#000000'
      canvas.curveColorActive = '#d8d8d8'
      canvas.linkColorActive = '#00bbff'
      break
  }
  this.requestRendering()
}.bind(Easing)

// 数据 - 改变事件
Easing.dataChange = function (this: Easing, event: Type.event) {
  this.changed = true
  console.log(event)
}.bind(Easing)

// 列表 - 键盘按下事件
Easing.listKeydown = function (this: Type.treeList, event: KeyboardEvent) {
  const item = this.read()
  if (item === null)
    return
  if (event.cmdOrCtrlKey) {
    switch (event.code) {
      case 'KeyC':
        Easing.copy(item)
        break
      case 'KeyV':
        Easing.paste(item)
        break
    }
  } else if (event.altKey) {
    return
  } else {
    switch (event.code) {
      case 'Insert':
        Easing.insert(item)
        break
      case 'Delete':
        Easing.delete(item)
        break
    }
  }
}

// 列表 - 选择事件
Easing.listSelect = function (event) {
  Easing.load(<Easing>event.value)
}

// 列表 - 打开事件
Easing.listOpen = function (event) {
  Easing.setEasingKey(<Type.node>event.value)
}

// 列表 - 菜单弹出事件
Easing.listPopup = function (this: Type.treeList, event) {
  const item = <Type.node>event.value
  const selected = !!item
  const pastable = Clipboard.has('yami.data.easing')
  const deletable = selected && (Easing.data?.length ?? 0) > 1
  const get = Local.createGetter('menuEasingList')
  Menu.popup({
    x: event.clientX,
    y: event.clientY,
  }, [{
    label: get('insert'),
    accelerator: 'Insert',
    click: () => {
      Easing.insert(item)
    },
  }, {
    label: get('copy'),
    accelerator: ctrl('C'),
    enabled: selected,
    click: () => {
      Easing.copy(item)
    },
  }, {
    label: get('paste'),
    accelerator: ctrl('V'),
    enabled: pastable,
    click: () => {
      Easing.paste(item)
    },
  }, {
    label: get('delete'),
    accelerator: 'Delete',
    enabled: deletable,
    click: () => {
      Easing.delete(item)
    },
  }, {
    label: get('rename'),
    accelerator: 'F2',
    enabled: selected,
    click: () => {
      this.rename(item)
    },
  }, {
    label: get('set-key'),
    enabled: selected,
    click: () => {
      Easing.setEasingKey(item)
    },
  }])
}

// 模式 - 选择事件
Easing.modeSelect = function (this: Easing, event: Type.event) {
  this.updatePoints()
  const points = this.points
  if (this.easingMap === null)
    return
  const easingMap = this.easingMap
  const write = getElementWriter('easing')
  const read = getElementReader('easing')
  if (points.length === 5 &&
    points[2].x === 0 && points[2].y === 0 &&
    points[3].x === 0 && points[3].y === 0 &&
    points[4].x === 0 && points[4].y === 0) {
    const left = 0
    const right = 1
    const startX = left + (right - left) / 2
    const startY = easingMap.get(startX)
    const ctrlX0 = startX + (right - startX) / 3
    const ctrlY0 = easingMap.get(ctrlX0)
    const ctrlX1 = startX + (right - startX) * 2 / 3
    const ctrlY1 = easingMap.get(ctrlX1)
    write('points-2-x', startX)
    write('points-2-y', startY)
    write('points-3-x', ctrlX0)
    write('points-3-y', ctrlY0)
    write('points-4-x', ctrlX1)
    write('points-4-y', ctrlY1)
    for (let i = 2; i < 5; i++) {
      points[i].x = read(`points-${i}-x`)
      points[i].y = read(`points-${i}-y`)
    }
  }
  if (points.length === 8 &&
    points[5].x === 0 && points[5].y === 0 &&
    points[6].x === 0 && points[6].y === 0 &&
    points[7].x === 0 && points[7].y === 0) {
    const left = points[2].x
    const right = 1
    const startX = left + (right - left) / 2
    const startY = easingMap.get(startX)
    const ctrlX0 = startX + (right - startX) / 3
    const ctrlY0 = easingMap.get(ctrlX0)
    const ctrlX1 = startX + (right - startX) * 2 / 3
    const ctrlY1 = easingMap.get(ctrlX1)
    write('points-5-x', startX)
    write('points-5-y', startY)
    write('points-6-x', ctrlX0)
    write('points-6-y', ctrlY0)
    write('points-7-x', ctrlX1)
    write('points-7-y', ctrlY1)
    for (let i = 5; i < 8; i++) {
      points[i].x = read(`points-${i}-x`)
      points[i].y = read(`points-${i}-y`)
    }
  }
  this.updateMaps()
  this.requestRendering()
}.bind(Easing)

// 控制点输入框 - 输入事件
Easing.pointInput = function (this: HTMLElement, event) {
  const key = Inspector.getKey(this)
  const value = this.read()
  const keys = key.split('-')
  const end = keys.length - 1
  let node = Easing.list.read()
  if (node === null)
    return
  for (let i = 0; i < end; i++) {
    node = <Type.node>node[keys[i]]
  }
  const property = keys[end]
  if (node[property] !== value) {
    node[property] = value
  }
  Easing.updateMaps()
  Easing.requestRendering()
}

// 缩放单选框 - 输入事件
Easing.scaleInput = function (this: Easing, event: Type.event) {
  this.scale = <number>event.value
  this.requestRendering()
}.bind(Easing)

// 曲线画布 - 键盘按下事件
Easing.curveKeydown = function (this: Easing, event: KeyboardEvent) {
  const point = this.activePoint
  if (point !== null) {
    switch (event.code) {
      case 'ArrowUp': {
        const index = this.points.indexOf(point)
        const element = $(`#easing-points-${index}-y`)
        element.write(point.y + 0.01)
        point.y = element.read()
        this.changed = true
        this.updateMaps()
        this.requestRendering()
        break
      }
      case 'ArrowDown': {
        const index = this.points.indexOf(point)
        const element = $(`#easing-points-${index}-y`)
        element.write(point.y - 0.01)
        point.y = element.read()
        this.changed = true
        this.updateMaps()
        this.requestRendering()
        break
      }
      case 'ArrowLeft': {
        const index = this.points.indexOf(point)
        const element = $(`#easing-points-${index}-x`)
        element.write(point.x - 0.01)
        point.x = element.read()
        this.changed = true
        this.updateMaps()
        this.requestRendering()
        break
      }
      case 'ArrowRight': {
        const index = this.points.indexOf(point)
        const element = $(`#easing-points-${index}-x`)
        element.write(point.x + 0.01)
        point.x = element.read()
        this.changed = true
        this.updateMaps()
        this.requestRendering()
        break
      }
    }
  }
}.bind(Easing)

// 曲线画布 - 指针按下事件
Easing.curvePointerdown = function (this: Easing, event: Type.pointerEvent) {
  switch (event.button) {
    case 0: {
      const coords = event.getRelativeCoords(this.curve)
      const dpr = window.devicePixelRatio
      const x = coords.x * dpr
      const y = coords.y * dpr
      const selectedPoint = this.selectPointByCoords(x, y)
      if (selectedPoint) {
        this.dragging = event
        event.pointStartX = selectedPoint.x
        event.pointStartY = selectedPoint.y
        window.on('pointerup', this.pointerup)
        window.on('pointermove', this.pointermove)
      }
      break
    }
  }
}.bind(Easing)

// 曲线画布 - 鼠标滚轮事件
Easing.curveWheel = function (this: Easing, event: WheelEvent) {
  if (!this.dragging && event.deltaY !== 0) {
    const radios = <NodeListOf<RadioBox>>document.getElementsByName('easing-scale')
    const length = radios.length
    for (let i = 0; i < length; i++) {
      if (radios[i].dataValue === this.scale) {
        const step = event.deltaY < 0 ? -1 : 1
        const radio = radios[i + step]
        if (radio !== undefined) {
          radio.pointerdown(event)
        }
        break
      }
    }
  }
}.bind(Easing)

// 曲线画布 - 失去焦点事件
Easing.curveBlur = function (this: Easing, event: Type.pointerEvent) {
  this.pointerup(event)
  if (this.activePoint !== null) {
    this.activePoint = null
    this.requestRendering()
  }
}.bind(Easing)

// 指针弹起事件
Easing.pointerup = function (this: Easing, event: Type.pointerEvent) {
  const {dragging} = this
  if (dragging === null) {
    return
  }
  if (event === undefined) {
    event = dragging
  }
  if (this.dragging?.relate(event)) {
    this.dragging = null
    window.off('pointerup', this.pointerup)
    window.off('pointermove', this.pointermove)
  }
}.bind(Easing)

// 指针移动事件
Easing.pointermove = function (this: Easing, event: Type.pointerEvent) {
  if (this.dragging !== null && this.activePoint !== null) {
    const dragging = this.dragging
    const point = this.activePoint
    const index = this.points.indexOf(point)
    const fullSize = this.curve.spacing * this.scale * 10
    const transX = Math.roundTo((event.clientX - dragging.clientX) / fullSize, 2)
    const transY = Math.roundTo((dragging.clientY - event.clientY) / fullSize, 2)
    const pointX = Math.clamp(Math.roundTo(dragging.pointStartX + transX, 2), 0, 1)
    const pointY = Math.clamp(Math.roundTo(dragging.pointStartY + transY, 2), -5, 5)
    const xInput = $(`#easing-points-${index}-x`)
    const yInput = $(`#easing-points-${index}-y`)
    xInput.write(pointX)
    yInput.write(pointY)
    point.x = xInput.read()
    point.y = yInput.read()
    this.changed = true
    this.updateMaps()
    this.requestRendering()
  }
}.bind(Easing)

// 回放 - 输入事件
Easing.reverseInput = function (this: SelectBox, event) {
  Easing.reverse = this.read()
}

// 持续时间 - 输入事件
Easing.durationInput = function (this: NumberBox, event) {
  Easing.duration = this.read()
  const timer = Easing.timer
  if (timer.state === 'playing') {
    const lastDuration = timer.duration
    timer.duration = Easing.duration
    timer.elapsed = timer.elapsed * timer.duration / lastDuration
  }
}

// 延时 - 输入事件
Easing.delayInput = function (this: NumberBox, event) {
  Easing.delay = this.read()
  const timer = Easing.timer
  if (timer.state === 'waiting') {
    const lastDuration = timer.duration
    timer.duration = Easing.delay
    timer.elapsed = timer.elapsed * timer.duration / lastDuration
  }
}

// 确定按钮 - 鼠标点击事件
Easing.confirm = function (this: Easing, event: Type.pointerEvent) {
  if (this.changed) {
    this.changed = false
    this.clear()
    // 删除数据绑定的元素对象
    const easings = this.data
    if (easings === null)
      return
    TreeList.deleteCaches(easings)
    Data.easings = easings
    Data.createGUIDMap(easings)
    File.planToSave(Data.manifest?.project.easings)
    // 发送数据改变事件
    const datachange = <Type.event>new Event('datachange')
    datachange.key = 'easings'
    window.dispatchEvent(datachange)
  }
  Window.close('easing')
}.bind(Easing)

namespace Scope {
  // 三次方曲线映射表类 - 必须使用Float64
  // 因为Float32会导致部分点参数出现绘制BUG:线条变粗
  // Chromium78-89都存在这个BUG而Chromium69是正常的
  export class CurveMap extends Float64Array {
    count: number

    constructor() {
      super(6002)
    }

    // 更新数据
    update(...points: Type.point[]) {
      const length = points.length - 1
      for (let i = 0; i < length; i += 3) {
        const {x: x0, y: y0} = points[i]
        const {x: x1, y: y1} = points[i + 1]
        const {x: x2, y: y2} = points[i + 2]
        const {x: x3, y: y3} = points[i + 3]
        const offset = (i / 3) * 2000
        for (let i = 0; i <= 1000; i++) {
          const t0 = i / 1000
          const t1 = 1 - t0
          const n0 = t1 ** 3
          const n1 = 3 * t0 * t1 ** 2
          const n2 = 3 * t0 ** 2 * t1
          const n3 = t0 ** 3
          const x = x0 * n0 + x1 * n1 + x2 * n2 + x3 * n3
          const y = y0 * n0 + y1 * n1 + y2 * n2 + y3 * n3
          this[offset + i * 2] = x
          this[offset + i * 2 + 1] = y
        }
      }
      this.count = Math.floor(points.length / 3) * 2000 + 2
    }
  }

  // 过渡映射表类
  const SCALE = 1000
  const round = Math.round
  export class EasingMap extends Float32Array {
    constructor() {
      super(SCALE + 1)
    }

    // 更新数据
    update(...points: Type.point[]) {
      const length = points.length - 1
      let pos = -1
      for (let i = 0; i < length; i += 3) {
        const {x: x0, y: y0} = points[i]
        const {x: x1, y: y1} = points[i + 1]
        const {x: x2, y: y2} = points[i + 2]
        const {x: x3, y: y3} = points[i + 3]
        for (let n = 0; n <= SCALE; n++) {
          const t0 = n / SCALE
          const t1 = 1 - t0
          const n0 = t1 ** 3
          const n1 = 3 * t0 * t1 ** 2
          const n2 = 3 * t0 ** 2 * t1
          const n3 = t0 ** 3
          const x = x0 * n0 + x1 * n1 + x2 * n2 + x3 * n3
          const i = round(x * SCALE)
          if (i > pos && i <= SCALE) {
            const y = y0 * n0 + y1 * n1 + y2 * n2 + y3 * n3
            this[i] = y
            if (i > pos + 1) {
              for (let j = pos + 1; j < i; j++) {
                this[j] = this[pos] + (this[i] - this[pos]) * (j - pos) / (i - pos)
              }
            }
            pos = i
          }
        }
      }
      // 尾数不一定是精确值
      // 因此需要设置为1
      this[SCALE] = 1
      return this
    }

    // 映射
    get(time: number) {
      return this[round(time * SCALE)]
    }

    // 静态 - 缓入缓出
    static easeInOut = function IIFE() {
      const p1 = {x: 0, y: 0}
      const p2 = {x: 0.42, y: 0}
      const p3 = {x: 0.58, y: 1}
      const p4 = {x: 1, y: 1}
      const instance = new EasingMap()
      return instance.update(p1, p2, p3, p4)
    }()
  }
}

Easing.CurveMap = Scope.CurveMap
Easing.EasingMap = Scope.EasingMap

// 列表 - 保存选项状态
Easing.list.saveSelection = function () {
  const {easings} = Data
  // 将数据保存在外部可以切换项目后重置
  if (easings !== null && easings.selection === undefined) {
    Object.defineProperty(easings, 'selection', {
      writable: true,
      value: '',
    })
  }
  const selection = this.read()
  if (easings !== null && selection !== null) {
    easings.selection = <string>selection.id
  }
}

// 列表 - 恢复选项状态
Easing.list.restoreSelection = function () {
  if (Data.easings === null)
    return
  const id = Data.easings.selection
  const item = Easing.getItemById(id) ?? this.data[0]
  this.select(item)
  this.update()
  this.scrollToSelection()
}

// 列表 - 重写更新节点元素方法
Easing.list.updateNodeElement = function (element: Type.element) {
  const item = <Type.node>element.item
  if (!element.textNode) {
    // 创建文本节点
    const textNode = <Type.text>document.createTextNode('')
    element.appendChild(textNode)
    

    // 设置元素属性
    element.draggable = true
    element.textNode = textNode

    // 调用组件创建器
    for (const creator of this.creators) {
      creator(item)
    }
  }

  // 调用组件更新器
  for (const updater of this.updaters) {
    updater(item)
  }
}

// 列表 - 重写更新项目名称方法
Easing.list.updateItemName = function (item) {
  this.updateTextNode(item)
  this.updateKeyTextNode(item)
}

// 列表 - 添加元素类名
Easing.list.addElementClass = function (item) {
  const element = <Type.element>item.element
  element.addClass('plain')
}

// 列表 - 更新文本节点
Easing.list.updateTextNode = function (item) {
  const element = <Type.element>item.element
  const textNode = <Type.node>element.textNode
  const parent = <Type.node>item.parent
  const items = <Type.node[]>parent.children
  const index = items.indexOf(item)
  const length = items.length
  const digits = Number.computeIndexDigits(length)
  const sn = index.toString().padStart(digits, '0')
  const text = `${sn}:${item.name}`
  if (textNode.nodeValue !== text) {
    textNode.nodeValue = text
  }
}

// 创建键文本节点
Easing.list.createKeyTextNode = function (item) {
  const keyTextNode = <Type.element>document.createElement('text')
  keyTextNode.key = ''
  keyTextNode.addClass('variable-init-text')
  const element = <Type.element>item.element
  element.appendChild(keyTextNode)
  element.keyTextNode = keyTextNode
}

// 更新键文本节点
Easing.list.updateKeyTextNode = function (item) {
  const element = <Type.element>item.element
  const keyTextNode = <Type.node>element.keyTextNode
  const key = item.key
  if (keyTextNode.key !== key) {
    keyTextNode.key = key
    keyTextNode.textContent = ' = ' + key
  }
}

// ******************************** 过渡窗口导出 ********************************

export { Easing }
