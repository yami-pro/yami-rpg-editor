'use strict'

import {
  Animation,
  Data,
  Easing,
  Layout,
  Timer
} from '../yami'

// ******************************** 曲线窗口 ********************************

const Curve = {
  // properties
  state: 'closed',
  page: $('#animation-easing').hide(),
  head: $('#animation-easing-head'),
  list: $('#animation-easing-id').hide(),
  canvas: $('#animation-easing-canvas'),
  target: null,
  index: null,
  curveMap: null,
  // methods
  initialize: null,
  open: null,
  load: null,
  close: null,
  suspend: null,
  resume: null,
  updateHead: null,
  updateEasingOptions: null,
  updateTimeline: null,
  resize: null,
  drawCurve: null,
  requestRendering: null,
  renderingFunction: null,
  stopRendering: null,
  // events
  windowResize: null,
  themechange: null,
  datachange: null,
  easingIdWrite: null,
  easingIdInput: null,
  settingsPointerdown: null,
}

// ******************************** 曲线窗口加载 ********************************

// 初始化
Curve.initialize = function () {
  // 创建映射表
  this.curveMap = new Easing.CurveMap()

  // 创建默认过渡选项
  this.list.defaultItem = {name: 'No Easing', value: ''}

  // 过渡方式 - 重写设置选项名字方法
  this.list.setItemNames = function (options) {
    const item = this.defaultItem
    const key = item.value
    const name = options[key]
    if (name !== undefined) {
      item.name = name
    }
    if (this.dataValue !== null) {
      this.update()
    }
  }

  // 侦听事件
  window.on('themechange', this.themechange)
  window.on('datachange', this.datachange)
  this.page.on('resize', this.windowResize)
  this.list.on('write', this.easingIdWrite)
  this.list.on('input', this.easingIdInput)
  $('#animation-easing-settings').on('pointerdown', this.settingsPointerdown)
}

// 打开窗口
Curve.open = function () {
  if (this.state === 'closed') {
    this.state = 'open'
    this.page.show()
    this.windowResize()
    this.updateEasingOptions()
  }
}

// 读取数据
Curve.load = function (frame) {
  if (this.target !== frame) {
    this.target = frame
    if (frame) {
      this.list.show()
      this.list.write(frame.easingId)
    } else {
      this.list.hide()
      this.index = null
      this.requestRendering()
    }
  }
}

// 关闭窗口
Curve.close = function () {
  if (this.state !== 'closed') {
    this.state = 'closed'
    this.page.hide()
    this.stopRendering()
  }
}

// 挂起
Curve.suspend = function () {
  if (this.state === 'open') {
    this.state = 'suspended'
    this.stopRendering()
  }
}

// 继续
Curve.resume = function () {
  if (this.state === 'suspended') {
    this.state = 'open'
    this.resize()
    this.requestRendering()
  }
}

// 更新头部位置
Curve.updateHead = function () {
  const {page, head} = this
  if (page.clientWidth !== 0) {
    // 调整左边位置
    const {nav} = Layout.getGroupOfElement(head)
    const nRect = nav.rect()
    const iRect = nav.lastChild.rect()
    const left = iRect.right - nRect.left
    if (head.left !== left) {
      head.left = left
      head.style.left = `${left}px`
    }
  }
}

// 更新过渡选项
Curve.updateEasingOptions = function () {
  const {list} = this
  const {easings} = Data
  if (list.data !== easings) {
    list.data = easings
    const head = list.defaultItem
    const items = Data.createEasingItems()
    list.loadItems([head, ...items])
  }
}

// 更新时间轴
Curve.updateTimeline = function (target) {
  const easing = target.easingId !== ''
  const {key} = target
  if (key.easing !== easing) {
    key.easing = easing
    if (easing) {
      key.addClass('easing')
    } else {
      key.removeClass('easing')
    }
  }
}

// 调整大小
Curve.resize = function () {
  if (this.state === 'open') {
    const screenBox = CSS.getDevicePixelContentBoxSize(this.page)
    const screenWidth = screenBox.width
    const screenHeight = screenBox.height

    // 调整画布
    if (this.canvas.width !== screenWidth ||
      this.canvas.height !== screenHeight) {
      this.canvas.width = screenWidth
      this.canvas.height = screenHeight
    }
  }
}

// 绘制曲线
Curve.drawCurve = function () {
  const canvas = this.canvas
  const width = canvas.width
  const height = canvas.height
  if (width * height === 0) {
    return
  }
  const centerX = width >> 1
  const centerY = height >> 1
  const spacing = Math.floor(Math.min(width, height) / 12)
  const originX = centerX - spacing * 5
  const originY = centerY + spacing * 5
  const fullSize = spacing * 10

  // 擦除画布
  let {context} = canvas
  if (!context) {
    context = canvas.context = canvas.getContext('2d', {desynchronized: true})
  }
  context.clearRect(0, 0, width, height)

  // 绘制虚线网格
  context.strokeStyle = canvas.gridColor
  context.setLineDash([1])
  for (let y = originY % spacing; y < height; y += spacing) {
    context.beginPath()
    context.moveTo(0, y + 0.5)
    context.lineTo(width, y + 0.5)
    context.stroke()
  }
  for (let x = originX % spacing; x < width; x += spacing) {
    context.beginPath()
    context.moveTo(x + 0.5, 0)
    context.lineTo(x + 0.5, height)
    context.stroke()
  }

  // 绘制辅助线
  context.strokeStyle = canvas.axisColor
  context.beginPath()
  context.moveTo(originX, originY - fullSize + 0.5)
  context.lineTo(originX + fullSize + 0.5, originY - fullSize + 0.5)
  context.lineTo(originX + fullSize + 0.5, originY)
  context.stroke()

  // 绘制坐标轴
  context.strokeStyle = canvas.axisColor
  context.setLineDash([])
  context.beginPath()
  context.moveTo(0, originY + 0.5)
  context.lineTo(width, originY + 0.5)
  context.moveTo(originX + 0.5, 0)
  context.lineTo(originX + 0.5, height)
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
  switch (this.index) {
    case null:
      break
    case '':
      context.lineWidth = 2
      context.strokeStyle = canvas.curveColor
      context.beginPath()
      context.moveTo(originX + 0.5, originY + 0.5)
      context.lineTo(originX + fullSize + 0.5, originY + 0.5)
      context.lineTo(originX + fullSize + 0.5, originY - fullSize + 0.5)
      context.stroke()
      context.lineWidth = 1
      break
    default: {
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
      context.lineWidth = 1
      break
    }
  }
}

// 请求渲染
Curve.requestRendering = function () {
  if (this.state === 'open') {
    Timer.utils.appendUpdater('sharedRendering2', this.renderingFunction)
  }
}

// 渲染函数
Curve.renderingFunction = function () {
  Curve.drawCurve()
}

// 停止渲染
Curve.stopRendering = function () {
  Timer.utils.removeUpdater('sharedRendering2', this.renderingFunction)
}

// 窗口 - 调整大小事件
Curve.windowResize = function (event) {
  // 检查器页面不可见时挂起
  if (this.page.clientWidth === 0) {
    return this.suspend()
  }
  this.updateHead()
  switch (this.state) {
    case 'open':
      this.resize()
      this.requestRendering()
      break
    case 'suspended':
      this.resume()
      break
  }
}.bind(Curve)

// 主题改变事件
Curve.themechange = function (event) {
  const {canvas} = this
  switch (event.value) {
    case 'light':
      canvas.textColor = '#808080'
      canvas.gridColor = '#c0c0c0'
      canvas.axisColor = '#606060'
      canvas.curveColor = '#202020'
      break
    case 'dark':
      canvas.textColor = '#808080'
      canvas.gridColor = '#404040'
      canvas.axisColor = '#808080'
      canvas.curveColor = '#d8d8d8'
      break
  }
  this.requestRendering()
}.bind(Curve)

// 数据改变事件
Curve.datachange = function (event) {
  if (Curve.state === 'open' &&
    event.key === 'easings') {
    Curve.updateEasingOptions()
    const {index} = Curve
    if (index !== null) {
      Curve.index = null
      Curve.list.write(index)
    }
  }
}

// 曲线列表 - 写入事件
Curve.easingIdWrite = function (event) {
  const id = event.value
  if (Curve.index !== id) {
    Curve.index = id
    Curve.requestRendering()
    // 更新曲线映射表
    if (id !== '') {
      const easing = Data.easings.map[id]
      const points = easing?.points ??
      [{x: 0, y: 0}, {x: 1, y: 1}]
      const {startPoint, endPoint} = Easing
      Curve.curveMap.update(startPoint, ...points, endPoint)
    }
  }
}

// 曲线列表 - 输入事件
Curve.easingIdInput = function (event) {
  Animation.history.save({
    type: 'animation-easing-change',
    motion: Animation.motion,
    direction: Animation.direction,
    target: Animation.target,
    easingId: Curve.target.easingId,
  })
  Curve.target.easingId = event.value
  Curve.updateTimeline(Curve.target)
}

// 设置按钮 - 指针按下事件
Curve.settingsPointerdown = function () {
  Easing.open()
}

// ******************************** 曲线窗口导出 ********************************

export { Curve }
