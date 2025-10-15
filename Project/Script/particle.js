'use strict'

// ******************************** 粒子窗口 ********************************

const Particle = {
  // properties
  state: 'closed',
  page: $('#particle'),
  head: $('#particle-head'),
  body: $('#particle-body').hide(),
  info: $('#particle-info'),
  screen: $('#particle-screen'),
  marquee: $('#particle-marquee'),
  list: $('#particle-list'),
  // editor properties
  dragging: null,
  target: null,
  paused: false,
  history: null,
  restartKey: false,
  translationKey: 0b0000,
  translationTimer: null,
  showAxes: true,
  showWireframe: false,
  showAnchor: false,
  background: null,
  matrix: null,
  speed: null,
  zoom: null,
  zoomTimer: null,
  scale: null,
  scaleX: null,
  scaleY: null,
  outerWidth: null,
  outerHeight: null,
  scrollLeft: null,
  scrollTop: null,
  scrollRight: null,
  scrollBottom: null,
  centerX: null,
  centerY: null,
  centerOffsetX: null,
  centerOffsetY: null,
  padding: null,
  // particle properties
  context: null,
  meta: null,
  layers: null,
  emitter: null,
  // methods
  initialize: null,
  open: null,
  load: null,
  save: null,
  close: null,
  destroy: null,
  restart: null,
  undo: null,
  redo: null,
  setSpeed: null,
  setZoom: null,
  setTarget: null,
  updateTarget: null,
  updateTargetItem: null,
  updateParticleInfo: null,
  updateHead: null,
  resize: null,
  getPointerCoords: null,
  updateCamera: null,
  updateTransform: null,
  updateElements: null,
  drawElements: null,
  drawBackground: null,
  drawCoordinateAxes: null,
  drawEmitterWireframe: null,
  drawEmitterAnchor: null,
  drawAreaWireframe: null,
  drawElementWireframes: null,
  drawElementAnchors: null,
  computeOuterRect: null,
  selectEmitter: null,
  requestAnimation: null,
  updateAnimation: null,
  stopAnimation: null,
  requestRendering: null,
  renderingFunction: null,
  stopRendering: null,
  switchWireframe: null,
  switchAnchor: null,
  switchPause: null,
  planToSave: null,
  saveToConfig: null,
  loadFromConfig: null,
  saveToProject: null,
  loadFromProject: null,
  // events
  webglRestored: null,
  windowResize: null,
  themechange: null,
  datachange: null,
  keydown: null,
  restartKeyup: null,
  headPointerdown: null,
  viewPointerdown: null,
  controlPointerdown: null,
  speedInput: null,
  zoomFocus: null,
  zoomInput: null,
  screenKeydown: null,
  screenWheel: null,
  screenUserscroll: null,
  screenBlur: null,
  marqueePointerdown: null,
  marqueePointermove: null,
  marqueePointerleave: null,
  pointerup: null,
  pointermove: null,
  listKeydown: null,
  listPointerdown: null,
  listSelect: null,
  listRecord: null,
  listPopup: null,
  listChange: null,
  // classes
  Emitter: null,
  Layer: null,
  Element: null,
}

// list methods
Particle.list.create = null
Particle.list.copy = null
Particle.list.paste = null
Particle.list.delete = null
Particle.list.createIcon = null
Particle.list.updateIcon = Scene.list.updateIcon
Particle.list.createVisibilityIcon = null
Particle.list.updateVisibilityIcon = Scene.list.updateVisibilityIcon
Particle.list.onCreate = null
Particle.list.onRemove = null
Particle.list.onDelete = null
Particle.list.onResume = null

// 初始化
Particle.initialize = function () {
  // 添加设置滚动方法
  this.screen.addSetScrollMethod()

  // 创建位移计时器
  this.translationTimer = new Timer({
    duration: Infinity,
    update: timer => {
      if (this.state === 'open' &&
        this.dragging === null) {
        const key = this.translationKey
        const step = Timer.deltaTime * 1.5 / this.scale
        let x = 0
        let y = 0
        if (key & 0b0001) {x -= step}
        if (key & 0b0010) {y -= step}
        if (key & 0b0100) {x += step}
        if (key & 0b1000) {y += step}
        const screen = this.screen
        const sl = screen.scrollLeft
        const st = screen.scrollTop
        const cx = Math.roundTo(this.centerX + x, 4)
        const cy = Math.roundTo(this.centerY + y, 4)
        this.updateCamera(cx, cy)
        this.updateTransform()
        if (screen.scrollLeft !== sl ||
          screen.scrollTop !== st) {
          this.requestRendering()
        }
      } else {
        return false
      }
    }
  })

  // 创建缩放计时器
  this.zoomTimer = new Timer({
    duration: 80,
    update: timer => {
      if (this.state === 'open') {
        const {elapsed, duration, start, end} = timer
        const time = elapsed / duration
        this.scale = start * (1 - time) + end * time
        this.resize()
        this.requestRendering()
      } else {
        this.scale = timer.end
        return false
      }
    }
  })

  // 设置舞台边距
  this.padding = 800

  // 创建变换矩阵
  this.matrix = new Matrix()

  // 绑定图层目录列表
  const {list} = this
  list.removable = true
  list.renamable = true
  list.bind(() => this.layers)
  list.creators.push(list.createVisibilityIcon)
  list.updaters.push(list.updateVisibilityIcon)

  // 设置历史操作处理器
  History.processors['particle-layer-create'] =
  History.processors['particle-layer-delete'] =
  History.processors['particle-layer-remove'] = (operation, data) => {
    list.restore(operation, data.response)
  }
  History.processors['particle-layer-hidden'] = (operation, data) => {
    const {item, oldValue, newValue} = data
    item.hidden = operation === 'undo' ? oldValue : newValue
    list.update()
    Particle.requestRendering()
    Particle.planToSave()
  }

  // 侦听事件
  window.on('themechange', this.themechange)
  window.on('datachange', this.datachange)
  window.on('keydown', this.keydown)
  this.page.on('resize', this.windowResize)
  this.head.on('pointerdown', this.headPointerdown)
  GL.canvas.on('webglcontextrestored', this.webglRestored)
  $('#particle-head-start').on('pointerdown', this.viewPointerdown)
  $('#particle-control').on('pointerdown', this.controlPointerdown)
  $('#particle-speed').on('input', this.speedInput)
  $('#particle-zoom').on('focus', this.zoomFocus)
  $('#particle-zoom').on('input', this.zoomInput)
  this.screen.on('keydown', this.screenKeydown)
  this.screen.on('wheel', this.screenWheel)
  this.screen.on('userscroll', this.screenUserscroll)
  this.screen.on('blur', this.screenBlur)
  this.marquee.on('pointerdown', this.marqueePointerdown)
  this.marquee.on('pointermove', this.marqueePointermove)
  this.marquee.on('pointerleave', this.marqueePointerleave)
  this.list.on('keydown', this.listKeydown)
  this.list.on('pointerdown', this.listPointerdown)
  this.list.on('select', this.listSelect)
  this.list.on('record', this.listRecord)
  this.list.on('popup', this.listPopup)
  this.list.on('change', this.listChange)
}

// 打开粒子动画
Particle.open = function (context) {
  if (this.context === context) {
    return
  }
  this.save()
  this.close()

  // 设置粒子元素舞台
  Particle.Element.stage = this

  // 首次加载粒子动画
  const {meta} = context
  if (!context.particle) {
    context.particle = Data.particles[meta.guid]
  }
  if (context.particle) {
    this.state = 'open'
    this.context = context
    this.meta = meta
    this.body.show()
    this.load(context)
    this.resize()
    this.requestAnimation()
    this.requestRendering()
  } else {
    Layout.manager.switch('directory')
    Window.confirm({
      message: `Failed to read file: ${meta.path}`,
    }, [{
      label: 'Confirm',
    }])
  }
}

// 加载数据
Particle.load = function (context) {
  if (!context.editor) {
    context.editor = {
      target: null,
      emitter: new Particle.Emitter(context.particle),
      history: new History(100),
      centerX: 0,
      centerY: 0,
      paused: false,
    }
  }
  const {particle, editor} = context

  // 加载粒子属性
  this.layers = particle.layers

  // 加载编辑器属性
  this.emitter = editor.emitter
  this.history = editor.history
  this.centerX = editor.centerX
  this.centerY = editor.centerY

  // 开关暂停状态
  this.switchPause(editor.paused)

  // 更新列表
  this.list.update()

  // 更新过渡映射表
  this.emitter.updateEasing()

  // 计算发射器外部矩形
  this.computeOuterRect()

  // 设置目标对象
  this.setTarget(editor.target)
}

// 保存数据
Particle.save = function () {
  if (this.state === 'open') {
    const {editor} = this.context

    // 保存编辑器属性
    editor.target = this.target
    editor.emitter = this.emitter
    editor.history = this.history
    editor.centerX = this.centerX
    editor.centerY = this.centerY
    editor.paused = this.paused
  }
}

// 关闭粒子动画
Particle.close = function () {
  if (this.state !== 'closed') {
    this.screen.blur()
    this.setTarget(null)
    this.state = 'closed'
    this.context = null
    this.meta = null
    this.layers = null
    this.emitter = null
    this.history = null
    this.body.hide()
    this.stopAnimation()
    this.stopRendering()
  }
}

// 销毁粒子动画
Particle.destroy = function (context) {
  if (!context.editor) return
  if (this.context === context) {
    this.save()
    this.close()
  }
  // 销毁粒子发射器
  context.editor.emitter.destroy()
  // 销毁绑定的元素
  TreeList.deleteCaches(context.particle.layers)
}

// 重新启动
Particle.restart = function () {
  this.emitter.clear()
  this.requestRendering()
}

// 撤销操作
Particle.undo = function () {
  if (this.state === 'open' &&
    !this.dragging &&
    this.history.canUndo()) {
    this.history.restore('undo')
  }
}

// 重做操作
Particle.redo = function () {
  if (this.state === 'open' &&
    !this.dragging &&
    this.history.canRedo()) {
    this.history.restore('redo')
  }
}

// 设置速度
Particle.setSpeed = function IIFE() {
  const numberBox = $('#particle-speed')
  return function (speed) {
    this.speed = speed
    numberBox.write(speed)
  }
}()

// 设置缩放
Particle.setZoom = function IIFE() {
  const slider = $('#particle-zoom')
  return function (zoom) {
    if (this.zoom !== zoom) {
      let scale
      switch (zoom) {
        case 0: scale = 0.25; break
        case 1: scale = 0.5 ; break
        case 2: scale = 1   ; break
        case 3: scale = 2   ; break
        case 4: scale = 4   ; break
        default: return
      }
      this.zoom = zoom
      slider.write(zoom)
      if (this.state === 'open') {
        const timer = this.zoomTimer
        timer.start = this.scale
        timer.end = scale
        timer.elapsed = 0
        timer.add()
      } else {
        this.scale = scale
      }
    }
  }
}()

// 设置目标对象
Particle.setTarget = function (target) {
  if (this.target !== target) {
    this.target = target
    this.updateTargetItem()
    this.requestRendering()
    if (target) {
      Inspector.open('particleLayer', target)
    } else {
      Inspector.close()
    }
  }
}

// 更新目标对象
Particle.updateTarget = function () {
  const item = this.list.read()
  if (item !== this.target) {
    this.setTarget(item)
  }
}

// 更新目标对象列表项
Particle.updateTargetItem = function () {
  const {target} = this
  if (target !== null) {
    const {list} = this
    if (list.read() !== target) {
      list.selectWithNoEvent(target)
      if (target) {
        list.scrollToSelection()
      }
    }
  }
}

// 更新粒子信息
Particle.updateParticleInfo = function () {
  const {emitter, info} = this
  const words = Command.words
  for (const layer of emitter.layers) {
    const {name} = layer.data
    const {count} = layer.elements
    words.push(`${name} ${count}`)
  }
  const content = words.join('\n')
  if (info.textContent !== content) {
    info.textContent = content
  }
}

// 更新头部位置
Particle.updateHead = function () {
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
    // 调整居中组件的位置
    const width = nRect.right - iRect.right
    if (head.width !== width) {
      head.width = width
      const [start, center, end] = head.children
      end.style.marginLeft = ''
      const sRect = start.rect()
      const cRect = center.rect()
      const eRect = end.rect()
      const spacing = eRect.left - sRect.right - cRect.width
      const difference = sRect.right - nRect.left - eRect.width
      const margin = Math.min(spacing, difference)
      end.style.marginLeft = `${margin}px`
    }
  }
}

// 调整大小
Particle.resize = function () {
  if (this.state === 'open' &&
    this.screen.clientWidth !== 0) {
    const scale = this.scale
    const screenBox = CSS.getDevicePixelContentBoxSize(this.screen)
    const screenWidth = screenBox.width
    const screenHeight = screenBox.height
    const stageWidth = screenWidth + this.padding
    const stageHeight = screenHeight + this.padding
    const innerWidth = Math.round(stageWidth * scale)
    const innerHeight = Math.round(stageHeight * scale)
    const outerWidth = Math.max(screenWidth, innerWidth)
    const outerHeight = Math.max(screenHeight, innerHeight)
    const dpr = window.devicePixelRatio
    this.outerWidth = outerWidth
    this.outerHeight = outerHeight
    this.centerOffsetX = screenWidth / 2
    this.centerOffsetY = screenHeight / 2
    this.scaleX = innerWidth / stageWidth
    this.scaleY = innerHeight / stageHeight
    this.marquee.style.width = `${outerWidth / dpr}px`
    this.marquee.style.height = `${outerHeight / dpr}px`
    GL.resize(screenWidth, screenHeight)
    this.updateCamera()
    this.updateTransform()
  }
}

// 获取指针坐标
Particle.getPointerCoords = function IIFE() {
  const point = {x: 0, y: 0}
  return function (event) {
    const coords = event.getRelativeCoords(this.marquee)
    const dpr = window.devicePixelRatio
    point.x = (coords.x * dpr - (this.outerWidth >> 1)) / this.scaleX
    point.y = (coords.y * dpr - (this.outerHeight >> 1)) / this.scaleY
    return point
  }
}()

// 更新摄像机位置
Particle.updateCamera = function (x = this.centerX, y = this.centerY) {
  const screen = this.screen
  const dpr = window.devicePixelRatio
  const scrollX = x * this.scaleX + this.outerWidth / 2
  const scrollY = y * this.scaleY + this.outerHeight / 2
  const toleranceForDPR = 0.0001
  screen.rawScrollLeft = Math.clamp(scrollX - this.centerOffsetX, 0, this.outerWidth - GL.width) / dpr
  screen.rawScrollTop = Math.clamp(scrollY - this.centerOffsetY, 0, this.outerHeight - GL.height) / dpr
  screen.scrollLeft = (scrollX - (GL.width >> 1) + toleranceForDPR) / dpr
  screen.scrollTop = (scrollY - (GL.height >> 1) + toleranceForDPR) / dpr
}

// 更新变换参数
Particle.updateTransform = function () {
  const screen = this.screen
  const dpr = window.devicePixelRatio
  const left = Math.roundTo(screen.scrollLeft * dpr - (this.outerWidth >> 1), 4)
  const top = Math.roundTo(screen.scrollTop * dpr - (this.outerHeight >> 1), 4)
  const right = left + GL.width
  const bottom = top + GL.height
  this.scrollLeft = left / this.scaleX
  this.scrollTop = top / this.scaleY
  this.scrollRight = right / this.scaleX
  this.scrollBottom = bottom / this.scaleY
  this.matrix.reset()
  .scale(this.scaleX, this.scaleY)
  .translate(-this.scrollLeft, -this.scrollTop)
  const scrollX = screen.rawScrollLeft * dpr + this.centerOffsetX
  const scrollY = screen.rawScrollTop * dpr + this.centerOffsetY
  this.centerX = Math.roundTo((scrollX - this.outerWidth / 2) / this.scaleX, 4)
  this.centerY = Math.roundTo((scrollY - this.outerHeight / 2) / this.scaleY, 4)
}

// 更新元素
Particle.updateElements = function (deltaTime) {
  this.emitter.update(deltaTime * this.speed)
}

// 绘制元素
Particle.drawElements = function () {
  for (const layer of this.emitter.layers) {
    if (!layer.data.hidden) layer.draw()
  }
}

// 绘制背景
Particle.drawBackground = function () {
  const gl = GL
  gl.clearColor(...this.background.getGLRGBA())
  gl.clear(gl.COLOR_BUFFER_BIT)
}

// 绘制坐标轴
Particle.drawCoordinateAxes = function () {
  if (this.showAxes) {
    const gl = GL
    const vertices = gl.arrays[0].float32
    const matrix = gl.matrix
    .set(Particle.matrix)
    // 避免缩放时虚线抖动
    const L = -10000 / this.scaleX
    const T = -10000 / this.scaleY
    const R = 10000 / this.scaleX
    const B = 10000 / this.scaleY
    const a = matrix[0]
    const b = matrix[1]
    const c = matrix[3]
    const d = matrix[4]
    const e = matrix[6]
    const f = matrix[7]
    const x1 = a * L + e
    const y1 = b * L + f
    const x2 = a * R + e
    const y2 = b * R + f
    const x3 = c * T + e
    const y3 = d * T + f
    const x4 = c * B + e
    const y4 = d * B + f
    vertices[0] = x1
    vertices[1] = y1 + 0.5
    vertices[2] = 0
    vertices[3] = x2
    vertices[4] = y2 + 0.5
    vertices[5] = Math.dist(x1, y1, x2, y2)
    vertices[6] = x3 + 0.5
    vertices[7] = y3
    vertices[8] = 0
    vertices[9] = x4 + 0.5
    vertices[10] = y4
    vertices[11] = Math.dist(x3, y3, x4, y4)
    matrix.project(
      gl.flip,
      gl.width,
      gl.height,
    )
    gl.alpha = 1
    gl.blend = 'normal'
    const program = gl.dashedLineProgram.use()
    gl.bindVertexArray(program.vao)
    gl.uniformMatrix3fv(program.u_Matrix, false, matrix)
    gl.uniform4f(program.u_Color, 0.5, 0, 1, 1)
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STREAM_DRAW, 0, 12)
    gl.drawArrays(gl.LINES, 0, 4)
  }
}

// 绘制发射器线框
Particle.drawEmitterWireframe = function () {
  let color
  const emitter = this.emitter
  if (emitter.active) color = 0xffffffff
  if (emitter.selected) color = 0xffc0ff00
  if (emitter.outerLeft === 0 &&
    emitter.outerTop === 0 &&
    emitter.outerRight === 0 &&
    emitter.outerBottom === 0 ||
    color === undefined) {
    return
  }
  const gl = GL
  const vertices = gl.arrays[0].float32
  const colors = gl.arrays[0].uint32
  const ox = 0.5 / this.scaleX
  const oy = 0.5 / this.scaleY
  const L = emitter.outerLeft + ox
  const T = emitter.outerTop + oy
  const R = emitter.outerRight - ox
  const B = emitter.outerBottom - oy
  vertices[0] = L
  vertices[1] = T
  colors  [2] = color
  vertices[3] = L
  vertices[4] = B
  colors  [5] = color
  vertices[6] = R
  vertices[7] = B
  colors  [8] = color
  vertices[9] = R
  vertices[10] = T
  colors  [11] = color
  const program = gl.graphicProgram.use()
  const matrix = gl.matrix.project(
    gl.flip,
    gl.width,
    gl.height,
  ).multiply(Particle.matrix)
  gl.bindVertexArray(program.vao)
  gl.uniformMatrix3fv(program.u_Matrix, false, matrix)
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STREAM_DRAW, 0, 12)
  gl.drawArrays(gl.LINE_LOOP, 0, 4)
}

// 绘制发射器锚点
Particle.drawEmitterAnchor = function () {
  const emitter = this.emitter
  if (!emitter.selected) return
  const X = emitter.startX
  const Y = emitter.startY
  if (!this.selectEmitter(X, Y)) {
    emitter.selected = false
    return
  }
  const gl = GL
  const vertices = gl.arrays[0].float32
  const matrix = this.matrix
  const a = matrix[0]
  const b = matrix[1]
  const c = matrix[3]
  const d = matrix[4]
  const e = matrix[6]
  const f = matrix[7]
  const x = a * X + c * Y + e
  const y = b * X + d * Y + f
  vertices[0] = x + 0.5 - 8
  vertices[1] = y + 0.5
  vertices[2] = x + 0.5 + 9
  vertices[3] = y + 0.5
  vertices[4] = x + 0.5
  vertices[5] = y + 0.5 - 8
  vertices[6] = x + 0.5
  vertices[7] = y + 0.5 + 9
  gl.matrix.project(
    gl.flip,
    gl.width,
    gl.height,
  )
  gl.alpha = 1
  gl.blend = 'normal'
  const program = gl.graphicProgram.use()
  gl.bindVertexArray(program.vao.a10)
  gl.uniformMatrix3fv(program.u_Matrix, false, gl.matrix)
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STREAM_DRAW, 0, 8)
  gl.vertexAttrib4f(program.a_Color, 1, 0, 0, 1)
  gl.drawArrays(gl.LINES, 0, 4)
}

// 绘制区域线框
Particle.drawAreaWireframe = function () {
  if (!this.showWireframe || !this.target) return
  let vi = 0
  const gl = GL
  const vertices = gl.arrays[0].float32
  const {area} = this.target
  switch (area.type) {
    case 'rectangle': {
      const ax = area.x
      const ay = area.y
      const aw = area.width
      const ah = area.height
      const ox = 0.5 / this.scaleX
      const oy = 0.5 / this.scaleY
      const L = ax - aw * 0.5 + ox
      const T = ay - ah * 0.5 + oy
      const R = Math.max(L, ax + aw * 0.5 - ox)
      const B = Math.max(T, ay + ah * 0.5 - oy)
      vertices[0] = L
      vertices[1] = T
      vertices[2] = L
      vertices[3] = B
      vertices[4] = R
      vertices[5] = B
      vertices[6] = R
      vertices[7] = T
      vi = 8
      break
    }
    case 'circle': {
      const ax = area.x
      const ay = area.y
      const ar = area.radius
      const segments = 100
      const step = Math.PI * 2 / segments
      for (let i = 0; i < segments; i++) {
        const angle = i * step
        vertices[vi    ] = ax + ar * Math.cos(angle)
        vertices[vi + 1] = ay + ar * Math.sin(angle)
        vi += 2
      }
      break
    }
    default:
      return
  }
  if (vi !== 0) {
    const program = gl.graphicProgram.use()
    const matrix = gl.matrix.project(
      gl.flip,
      gl.width,
      gl.height,
    ).multiply(Particle.matrix)
    gl.bindVertexArray(program.vao.a10)
    gl.uniformMatrix3fv(program.u_Matrix, false, matrix)
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STREAM_DRAW, 0, vi)
    gl.vertexAttrib4f(program.a_Color, 1, 0, 0, 1)
    gl.drawArrays(gl.LINE_LOOP, 0, vi / 2)
  }
}

// 绘制元素线框
Particle.drawElementWireframes = function () {
  if (!this.showWireframe) return
  const gl = GL
  const vertices = gl.arrays[0].float32
  const matrix = gl.matrix
  let vi = 0
  for (const layer of this.emitter.layers) {
    if (layer.data.hidden) continue
    const {texture} = layer
    if (texture instanceof ImageTexture) {
      const elements = layer.elements
      const count = elements.count
      const sw = layer.unitWidth
      const sh = layer.unitHeight
      for (let i = 0; i < count; i++) {
        const element = elements[i]
        const ax = element.anchorX + 0.5
        const ay = element.anchorY + 0.5
        matrix
        .set(Particle.matrix)
        .translate(element.x, element.y)
        .rotate(element.rotationAngle)
        .scale(element.scaleFactor, element.scaleFactor)
        .translate(-ax * sw, -ay * sh)
        const R = sw
        const B = sh
        const a = matrix[0]
        const b = matrix[1]
        const c = matrix[3]
        const d = matrix[4]
        const e = matrix[6]
        const f = matrix[7]
        const x1 = e
        const y1 = f
        const x2 = c * B + e
        const y2 = d * B + f
        const x3 = a * R + c * B + e
        const y3 = b * R + d * B + f
        const x4 = a * R + e
        const y4 = b * R + f
        const angle1 = Math.atan2(y1 - y2, x1 - x2)
        const angle2 = Math.atan2(y2 - y3, x2 - x3)
        const angle3 = Math.atan2(y3 - y4, x3 - x4)
        const angle4 = Math.atan2(y4 - y1, x4 - x1)
        const ox1 = Math.cos(angle1) * 0.5
        const oy1 = Math.sin(angle1) * 0.5
        const ox2 = Math.cos(angle2) * 0.5
        const oy2 = Math.sin(angle2) * 0.5
        const ox3 = Math.cos(angle3) * 0.5
        const oy3 = Math.sin(angle3) * 0.5
        const ox4 = Math.cos(angle4) * 0.5
        const oy4 = Math.sin(angle4) * 0.5
        const bx1 = x1 + ox4 - ox1
        const by1 = y1 + oy4 - oy1
        const bx2 = x2 + ox1 - ox2
        const by2 = y2 + oy1 - oy2
        const bx3 = x3 + ox2 - ox3
        const by3 = y3 + oy2 - oy3
        const bx4 = x4 + ox3 - ox4
        const by4 = y4 + oy3 - oy4
        vertices[vi    ] = bx1
        vertices[vi + 1] = by1
        vertices[vi + 2] = bx2
        vertices[vi + 3] = by2
        vertices[vi + 4] = bx2
        vertices[vi + 5] = by2
        vertices[vi + 6] = bx3
        vertices[vi + 7] = by3
        vertices[vi + 8] = bx3
        vertices[vi + 9] = by3
        vertices[vi + 10] = bx4
        vertices[vi + 11] = by4
        vertices[vi + 12] = bx4
        vertices[vi + 13] = by4
        vertices[vi + 14] = bx1
        vertices[vi + 15] = by1
        vi += 16
      }
    }
  }
  if (vi !== 0) {
    const program = gl.graphicProgram.use()
    matrix.project(
      gl.flip,
      gl.width,
      gl.height,
    )
    gl.bindVertexArray(program.vao.a10)
    gl.uniformMatrix3fv(program.u_Matrix, false, matrix)
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STREAM_DRAW, 0, vi)
    gl.vertexAttrib4f(program.a_Color, 1, 1, 1, 1)
    gl.drawArrays(gl.LINES, 0, vi / 2)
  }
}

// 绘制元素锚点
Particle.drawElementAnchors = function () {
  if (!this.showAnchor) return
  const gl = GL
  const vertices = gl.arrays[0].float32
  const lines = gl.arrays[1].float32
  const matrix = gl.matrix
  let vi = 0
  let li = 0
  for (const layer of this.emitter.layers) {
    const elements = layer.elements
    const count = elements.count
    const sw = layer.unitWidth
    const sh = layer.unitHeight
    for (let i = 0; i < count; i++) {
      const element = elements[i]
      matrix
      .set(Particle.matrix)
      .translate(element.x, element.y)
      const x = matrix[6]
      const y = matrix[7]
      vertices[vi    ] = x + 0.5 - 8
      vertices[vi + 1] = y + 0.5
      vertices[vi + 2] = x + 0.5 + 9
      vertices[vi + 3] = y + 0.5
      vertices[vi + 4] = x + 0.5
      vertices[vi + 5] = y + 0.5 - 8
      vertices[vi + 6] = x + 0.5
      vertices[vi + 7] = y + 0.5 + 9
      vi += 8
      const ax = element.anchorX
      const ay = element.anchorY
      if (ax === 0 && ay === 0) {
        continue
      }
      matrix
      .rotate(element.rotationAngle)
      .scale(element.scaleFactor, element.scaleFactor)
      .translate(-ax * sw, -ay * sh)
      const cx = matrix[6]
      const cy = matrix[7]
      lines[li    ] = x + 0.5
      lines[li + 1] = y + 0.5
      lines[li + 2] = cx + 0.5
      lines[li + 3] = cy + 0.5
      li += 4
    }
  }
  if (vi !== 0) {
    const program = gl.graphicProgram.use()
    matrix.project(
      gl.flip,
      gl.width,
      gl.height,
    )
    gl.bindVertexArray(program.vao.a10)
    gl.uniformMatrix3fv(program.u_Matrix, false, matrix)
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STREAM_DRAW, 0, vi)
    gl.vertexAttrib4f(program.a_Color, 1, 0, 0, 1)
    gl.drawArrays(gl.LINES, 0, vi / 2)
    if (li !== 0) {
      gl.bufferData(gl.ARRAY_BUFFER, lines, gl.STREAM_DRAW, 0, li)
      gl.vertexAttrib4f(program.a_Color, 0, 1, 0, 1)
      gl.drawArrays(gl.LINES, 0, li / 2)
    }
  }
}

// 计算发射器外部矩形
Particle.computeOuterRect = function () {
  const emitter = this.emitter
  const sx = emitter.startX
  const sy = emitter.startY
  const rect = emitter.calculateOuterRect()
  emitter.outerLeft = sx + rect.left
  emitter.outerTop = sy + rect.top
  emitter.outerRight = sx + rect.right
  emitter.outerBottom = sy + rect.bottom
  if (rect.hasArea) {
    this.requestRendering()
  }
}

// 选择发射器
Particle.selectEmitter = function (x, y) {
  const emitter = this.emitter
  if (x >= emitter.outerLeft &&
    y >= emitter.outerTop &&
    x < emitter.outerRight &&
    y < emitter.outerBottom) {
    return true
  }
  return false
}

// 请求更新动画
Particle.requestAnimation = function () {
  if (this.state === 'open' && !this.paused) {
    Timer.appendUpdater('stageAnimation', this.updateAnimation)
  }
}

// 更新动画帧
Particle.updateAnimation = function (deltaTime) {
  Particle.updateElements(deltaTime)
  Particle.updateParticleInfo()
  if (Timer.updaters.stageRendering !== Particle.renderingFunction) {
    Particle.renderingFunction()
  }
}

// 停止更新动画
Particle.stopAnimation = function () {
  Timer.removeUpdater('stageAnimation', this.updateAnimation)
}

// 请求渲染
Particle.requestRendering = function () {
  if (this.state === 'open') {
    Timer.appendUpdater('stageRendering', this.renderingFunction)
  }
}

// 渲染函数
Particle.renderingFunction = function () {
  if (GL.width * GL.height !== 0) {
    Particle.drawBackground()
    Particle.drawElements()
    Particle.drawCoordinateAxes()
    Particle.drawAreaWireframe()
    Particle.drawElementWireframes()
    Particle.drawElementAnchors()
    Particle.drawEmitterWireframe()
    Particle.drawEmitterAnchor()
  }
}

// 停止渲染
Particle.stopRendering = function () {
  Timer.removeUpdater('stageRendering', this.renderingFunction)
}

// 开关线框
Particle.switchWireframe = function IIFE() {
  const item = $('#particle-view-wireframe')
  return function (enabled = !this.showWireframe) {
    if (enabled) {
      item.addClass('selected')
    } else {
      item.removeClass('selected')
    }
    this.showWireframe = enabled
    this.requestRendering()
  }
}()

// 开关锚点
Particle.switchAnchor = function IIFE() {
  const item = $('#particle-view-anchor')
  return function (enabled = !this.showAnchor) {
    if (enabled) {
      item.addClass('selected')
    } else {
      item.removeClass('selected')
    }
    this.showAnchor = enabled
    this.requestRendering()
  }
}()

// 开关暂停状态
Particle.switchPause = function IIFE() {
  const item = $('#particle-control-pause')
  return function (enabled = !this.paused) {
    this.paused = enabled
    if (enabled) {
      item.addClass('selected')
      this.stopAnimation()
    } else {
      item.removeClass('selected')
      this.requestAnimation()
    }
  }
}()

// 计划保存
Particle.planToSave = function () {
  File.planToSave(this.meta)
}

// 保存状态到配置文件
Particle.saveToConfig = function (config) {
  config.colors.particleBackground = this.background.hex
}

// 从配置文件中加载状态
Particle.loadFromConfig = function (config) {
  this.background = new StageColor(
    config.colors.particleBackground,
    () => this.requestRendering(),
  )
}

// 保存状态到项目文件
Particle.saveToProject = function (project) {
  const {particle} = project
  particle.wireframe = this.showWireframe ?? particle.wireframe
  particle.anchor = this.showAnchor ?? particle.anchor
  particle.speed = this.speed ?? particle.speed
  particle.zoom = this.zoom ?? particle.zoom
}

// 从项目文件中加载状态
Particle.loadFromProject = function (project) {
  const {particle} = project
  this.switchWireframe(particle.wireframe)
  this.switchAnchor(particle.anchor)
  this.setSpeed(particle.speed)
  this.setZoom(particle.zoom)
}

// WebGL - 上下文恢复事件
Particle.webglRestored = function (event) {
  if (Particle.state === 'open') {
    Particle.requestRendering()
  }
}

// 窗口 - 调整大小事件
Particle.windowResize = function (event) {
  this.updateHead()
  if (this.state === 'open') {
    this.resize()
    this.updateCamera()
    this.requestRendering()
  }
}.bind(Particle)

// 主题改变事件
Particle.themechange = function (event) {
  this.requestRendering()
}.bind(Particle)

// 数据改变事件
Particle.datachange = function (event) {
  if (Particle.state === 'open' &&
    event.key === 'easings') {
    Particle.emitter.updateEasing()
  }
}

// 键盘按下事件
Particle.keydown = function (event) {
  if (Particle.state === 'open' &&
    Particle.dragging === null) {
    if (event.cmdOrCtrlKey) {
      return
    } else if (event.altKey) {
      return
    } else {
      switch (event.code) {
        case 'KeyR':
          if (!Particle.restartKey) {
            Particle.restartKey = true
            Particle.restart()
            $('#particle-control-restart').addClass('selected')
            window.on('keyup', Particle.restartKeyup)
            window.on('blur', Particle.restartKeyup)
          }
          break
        case 'KeyP':
          Particle.switchPause()
          break
      }
    }
  }
}

// 重启键弹起事件
Particle.restartKeyup = function (event) {
  if (!Particle.restartKey) {
    return
  }
  switch (event.code) {
    case 'KeyR':
    case undefined:
      if (Particle.restartKey) {
        Particle.restartKey = false
        $('#particle-control-restart').removeClass('selected')
        window.off('keyup', Particle.restartKeyup)
        window.off('blur', Particle.restartKeyup)
      }
      break
  }
}

// 头部 - 指针按下事件
Particle.headPointerdown = function (event) {
  if (!(event.target instanceof HTMLInputElement)) {
    event.preventDefault()
    if (document.activeElement !== Particle.screen) {
      Particle.screen.focus()
    }
  }
}

// 视图 - 指针按下事件
Particle.viewPointerdown = function (event) {
  switch (event.button) {
    case 0: {
      const element = event.target
      if (element.tagName === 'ITEM') {
        switch (element.getAttribute('value')) {
          case 'wireframe':
            return Particle.switchWireframe()
          case 'anchor':
            return Particle.switchAnchor()
        }
      }
      break
    }
  }
}

// 控制 - 指针按下事件
Particle.controlPointerdown = function (event) {
  switch (event.button) {
    case 0: {
      const element = event.target
      if (element.tagName === 'ITEM') {
        switch (element.getAttribute('value')) {
          case 'restart':
            return Particle.restart()
          case 'pause':
            return Particle.switchPause()
        }
      }
      break
    }
  }
}

// 速度 - 输入事件
Particle.speedInput = function (event) {
  Particle.speed = this.read()
}

// 缩放 - 获得焦点事件
Particle.zoomFocus = function (event) {
  Particle.screen.focus()
}

// 缩放 - 输入事件
Particle.zoomInput = function (event) {
  Particle.setZoom(this.read())
}

// 屏幕 - 键盘按下事件
Particle.screenKeydown = function (event) {
  if (this.state === 'open' &&
    this.dragging === null) {
    if (event.cmdOrCtrlKey) {
      return
    }
    if (event.altKey) {
      return
    }
    switch (event.code) {
      case 'Minus':
      case 'NumpadSubtract':
        this.setZoom(this.zoom - 1)
        break
      case 'Equal':
      case 'NumpadAdd':
        this.setZoom(this.zoom + 1)
        break
      case 'Digit0':
      case 'Numpad0':
        this.setZoom(2)
        break
    }
  }
}.bind(Particle)

// 屏幕 - 鼠标滚轮事件
Particle.screenWheel = function (event) {
  if (this.state === 'open' &&
    this.dragging === null) {
    event.preventDefault()
    if (event.deltaY !== 0) {
      const step = event.deltaY > 0 ? -1 : 1
      this.setZoom(this.zoom + step)
    }
  }
}.bind(Particle)

// 屏幕 - 用户滚动事件
Particle.screenUserscroll = function (event) {
  if (this.state === 'open') {
    this.screen.rawScrollLeft = this.screen.scrollLeft
    this.screen.rawScrollTop = this.screen.scrollTop
    this.updateTransform()
    this.requestRendering()
  }
}.bind(Particle)

// 屏幕 - 失去焦点事件
Particle.screenBlur = function (event) {
  // this.translationKeyup()
  // this.pointerup()
  this.marqueePointerleave()
}.bind(Particle)

// 选框 - 指针按下事件
Particle.marqueePointerdown = function (event) {
  if (this.dragging) {
    return
  }
  switch (event.button) {
    case 0:
      if (!event.dragKey) {
        const {emitter} = this
        if (emitter.active) {
          emitter.selected = true
          if (this.paused) break
          this.dragging = event
          event.mode = 'object-move'
          event.enabled = false
          event.startX = emitter.startX
          event.startY = emitter.startY
          window.on('pointerup', this.pointerup)
          window.on('pointermove', this.pointermove)
        } else {
          emitter.selected = false
        }
        this.requestRendering()
        break
      }
    case 2:
      this.dragging = event
      event.mode = 'scroll'
      event.scrollLeft = this.screen.scrollLeft
      event.scrollTop = this.screen.scrollTop
      Cursor.open('cursor-grab')
      window.on('pointerup', this.pointerup)
      window.on('pointermove', this.pointermove)
      break
  }
}.bind(Particle)

// 选框 - 指针移动事件
Particle.marqueePointermove = function (event) {
  if (!this.dragging) {
    this.marquee.pointerevent = event
    const {x, y} = this.getPointerCoords(event)
    const active = this.selectEmitter(x, y)
    if (this.emitter.active !== active) {
      this.emitter.active = active
      this.requestRendering()
    }
  }
}.bind(Particle)

// 选框 - 指针离开事件
Particle.marqueePointerleave = function (event) {
  if (this.marquee.pointerevent) {
    this.marquee.pointerevent = null
    // 删除粒子时this.emitter为null
    if (this.emitter?.active) {
      this.emitter.active = false
      this.requestRendering()
    }
  }
}.bind(Particle)

// 指针弹起事件
Particle.pointerup = function (event) {
  const {dragging} = Particle
  if (dragging === null) {
    return
  }
  if (event === undefined) {
    event = dragging
  }
  if (dragging.relate(event)) {
    switch (dragging.mode) {
      case 'object-move':
        break
      case 'scroll':
        Cursor.close('cursor-grab')
        break
    }
    Particle.dragging = null
    window.off('pointerup', Particle.pointerup)
    window.off('pointermove', Particle.pointermove)
  }
}

// 指针移动事件
Particle.pointermove = function (event) {
  const {dragging} = Particle
  if (dragging.relate(event)) {
    switch (dragging.mode) {
      case 'object-move': {
        if (!dragging.enabled) {
          const distX = event.clientX - dragging.clientX
          const distY = event.clientY - dragging.clientY
          if (Math.sqrt(distX ** 2 + distY ** 2) > 4 ||
            event.timeStamp - dragging.timeStamp >= 500) {
            dragging.enabled = true
          } else {
            break
          }
        }
        const emitter = Particle.emitter
        const dpr = window.devicePixelRatio
        const distX = (event.clientX - dragging.clientX) * dpr / Particle.scaleX
        const distY = (event.clientY - dragging.clientY) * dpr / Particle.scaleY
        const x = Math.round(dragging.startX + distX)
        const y = Math.round(dragging.startY + distY)
        if (emitter.startX !== x || emitter.startY !== y) {
          emitter.startX = x
          emitter.startY = y
          Particle.computeOuterRect()
        }
        break
      }
      case 'scroll': {
        const distX = event.clientX - dragging.clientX
        const distY = event.clientY - dragging.clientY
        Particle.screen.setScroll(
          dragging.scrollLeft - distX,
          dragging.scrollTop - distY,
        )
        break
      }
    }
  }
}

// 列表 - 键盘按下事件
Particle.listKeydown = function (event) {
  if (!this.data) {
    return
  }
  const item = this.read()
  if (event.cmdOrCtrlKey) {
    switch (event.code) {
      case 'KeyX':
        this.copy(item)
        this.delete(item)
        break
      case 'KeyC':
        this.copy(item)
        break
      case 'KeyV':
        this.paste()
        break
    }
  } else {
    switch (event.code) {
      case 'Delete':
        this.delete(item)
        break
      case 'Escape':
        Particle.setTarget(null)
        break
    }
  }
}

// 列表 - 指针按下事件
Particle.listPointerdown = function (event) {
  switch (event.button) {
    case 0: {
      const element = event.target
      switch (element.tagName) {
        case 'VISIBILITY-ICON': {
          const {item} = element.parentNode
          const {hidden} = item
          item.hidden = !hidden
          this.update()
          this.dispatchChangeEvent()
          Particle.requestRendering()
          Particle.history.save({
            type: 'particle-layer-hidden',
            item: item,
            oldValue: hidden,
            newValue: !hidden,
          })
          break
        }
      }
      break
    }
  }
}

// 列表 - 选择事件
Particle.listSelect = function (event) {
  Particle.setTarget(event.value)
}

// 列表 - 记录事件
Particle.listRecord = function (event) {
  const response = event.value
  switch (response.type) {
    case 'rename': {
      const editor = Inspector.particleLayer
      const input = editor.nameBox
      const {item, oldValue, newValue} = response
      input.write(newValue)
      Particle.updateParticleInfo()
      Particle.requestRendering()
      Particle.history.save({
        type: 'inspector-change',
        editor: editor,
        target: item,
        changes: [{
          input,
          oldValue,
          newValue,
        }],
      })
      break
    }
    case 'create':
      Particle.history.save({
        type: 'particle-layer-create',
        response: response,
      })
      break
    case 'delete':
      Particle.history.save({
        type: 'particle-layer-delete',
        response: response,
      })
      break
    case 'remove':
      Particle.history.save({
        type: 'particle-layer-remove',
        response: response,
      })
      break
  }
}

// 列表 - 弹出事件
Particle.listPopup = function (event) {
  const item = event.value
  const get = Local.createGetter('menuParticleList')
  let copyable
  let pastable
  let deletable
  let renamable
  if (item) {
    copyable = true
    pastable = Clipboard.has('yami.particle.layer')
    deletable = true
    renamable = true
  } else {
    copyable = false
    pastable = Clipboard.has('yami.particle.layer')
    deletable = false
    renamable = false
  }
  Menu.popup({
    x: event.clientX,
    y: event.clientY,
  }, [{
    label: get('insert'),
    click: () => {
      this.create(item)
    },
  }, {
    type: 'separator',
  }, {
    label: get('cut'),
    accelerator: ctrl('X'),
    enabled: copyable,
    click: () => {
      this.copy(item)
      this.delete(item)
    },
  }, {
    label: get('copy'),
    accelerator: ctrl('C'),
    enabled: copyable,
    click: () => {
      this.copy(item)
    },
  }, {
    label: get('paste'),
    accelerator: ctrl('V'),
    enabled: pastable,
    click: () => {
      this.paste(item)
    },
  }, {
    label: get('delete'),
    accelerator: 'Delete',
    enabled: deletable,
    click: () => {
      this.delete(item)
    },
  }, {
    label: get('rename'),
    accelerator: 'F2',
    enabled: renamable,
    click: () => {
      this.rename(item)
    },
  }])
}

// 列表 - 改变事件
Particle.listChange = function (event) {
  Particle.planToSave()
}

// 列表 - 创建
Particle.list.create = function (dItem) {
  this.addNodeTo(Inspector.particleLayer.create(), dItem)
}

// 列表 - 复制
Particle.list.copy = function (item) {
  if (item) {
    Clipboard.write('yami.particle.layer', item)
  }
}

// 列表 - 粘贴
Particle.list.paste = function (dItem) {
  const copy = Clipboard.read('yami.particle.layer')
  if (copy && this.data) {
    this.addNodeTo(copy, dItem)
  }
}

// 列表 - 删除
Particle.list.delete = function (item) {
  if (item) {
    this.deleteNode(item)
  }
}

// 列表 - 重写创建图标方法
Particle.list.createIcon = function (item) {
  const icon = document.createElement('node-icon')
  const path = File.getPath(item.image)
  if (path) {
    icon.addClass('icon-particle-image')
    FileBodyPane.prototype.setIconClip(icon, path, 0, 0, -item.sprite.hframes, -item.sprite.vframes)
  } else {
    icon.textContent = '\uf2dc'
  }
  return icon
}

// 列表 - 创建可见性图标
Particle.list.createVisibilityIcon = function (item) {
  const {element} = item
  const hiddenIcon = document.createElement('visibility-icon')
  hiddenIcon.style.right = '0'
  element.appendChild(hiddenIcon)
  element.hiddenIcon = hiddenIcon
  element.hiddenState = null
}

// 列表 - 在创建数据时回调
Particle.list.onCreate = function () {
  Particle.emitter.updateLayers()
  Particle.computeOuterRect()
  Particle.requestRendering()
}

// 列表 - 在迁移数据时回调
Particle.list.onRemove = function () {
  Particle.emitter.updateLayers()
  Particle.requestRendering()
}

// 列表 - 在删除数据时回调
Particle.list.onDelete = function () {
  Particle.updateTarget()
  Particle.emitter.updateLayers()
  Particle.emitter.active = false
  Particle.emitter.selected = false
  Particle.computeOuterRect()
  Particle.requestRendering()
}

// 列表 - 在恢复数据时回调
Particle.list.onResume = function () {
  Particle.emitter.updateLayers()
  Particle.computeOuterRect()
  Particle.requestRendering()
}

// ******************************** 粒子发射器类 ********************************

Particle.Emitter = class ParticleEmitter {
  alwaysEmit  //:boolean
  visible     //:boolean
  anchorY     //:number
  data        //:object
  startX      //:number
  startY      //:number
  angle       //:number
  scale       //:number
  speed       //:number
  opacity     //:number
  matrix      //:object
  layers      //:array

  constructor(data) {
    let alwaysEmit = false
    const sLayers = data.layers
    const sLength = sLayers.length
    const dLayers = new Array(sLength)
    for (let i = 0; i < sLength; i++) {
      const sLayer = sLayers[i]
      // 如果有一个粒子层的发射区域是屏幕边缘，设为总是发射和绘制
      if (sLayer.area.type === 'edge') {
        alwaysEmit = true
      }
      dLayers[i] = new Particle.Layer(this, sLayers[i])
    }
    this.alwaysEmit = alwaysEmit
    this.visible = false
    this.anchorY = 0
    this.data = data
    this.startX = 0
    this.startY = 0
    this.angle = 0
    this.scale = 1
    this.speed = 1
    this.opacity = 1
    this.matrix = null
    this.layers = dLayers
  }

  // 计算发射器外部矩形
  calculateOuterRect() {
    let L = Infinity
    let T = Infinity
    let R = -Infinity
    let B = -Infinity
    for (const {area} of this.data.layers) {
      switch (area.type) {
        case 'edge':
          continue
        case 'point':
          L = Math.min(L, area.x)
          T = Math.min(T, area.y)
          R = Math.max(R, area.x)
          B = Math.max(B, area.y)
          break
        case 'rectangle':
          L = Math.min(L, area.x - area.width * 0.5)
          T = Math.min(T, area.y - area.height * 0.5)
          R = Math.max(R, area.x + area.width * 0.5)
          B = Math.max(B, area.y + area.height * 0.5)
          continue
        case 'circle':
          L = Math.min(L, area.x - area.radius)
          T = Math.min(T, area.y - area.radius)
          R = Math.max(R, area.x + area.radius)
          B = Math.max(B, area.y + area.radius)
          continue
      }
    }
    // 最小外部矩形宽度32
    if (L > R) {
      L = R = 0
    } else if (R - L < 32) {
      const padding = 32 - (R - L)
      L += -padding >> 1
      R += +padding >> 1
    }
    // 最小外部矩形高度32
    if (T > B) {
      T = B = 0
    } else if (B - T < 32) {
      const padding = 32 - (B - T)
      T += -padding >> 1
      B += +padding >> 1
    }
    return {
      left: L,
      top: T,
      right: R,
      bottom: B,
      width: R - L,
      height: B - T,
      hasArea: L !== R && T !== B,
    }
  }

  // 获取图层
  getLayer(layerData) {
    for (const layer of this.layers) {
      if (layer.data === layerData) {
        return layer
      }
    }
  }

  // 更新图层
  updateLayers() {
    const map = new Map()
    for (const layer of this.layers) {
      map.set(layer.data, layer)
    }
    const sLayers = this.data.layers
    const sLength = sLayers.length
    const dLayers = new Array(sLength)
    for (let i = 0; i < sLength; i++) {
      const sLayer = sLayers[i]
      let dLayer = map.get(sLayer)
      if (dLayer) map.delete(sLayer)
      else dLayer = new Particle.Layer(this, sLayer)
      dLayers[i] = dLayer
    }
    // 销毁已经不存在的图层
    for (const entries of map) {
      entries[1].destroy()
    }
    this.layers = dLayers
  }

  // 更新数据
  update(deltaTime) {
    this.emitParticles(deltaTime)
    this.updateParticles(deltaTime)
  }

  // 发射粒子
  emitParticles(deltaTime) {
    for (const layer of this.layers) {
      layer.emitParticles(deltaTime)
    }
  }

  // 更新粒子
  updateParticles(deltaTime) {
    let count = 0
    for (const layer of this.layers) {
      count += layer.updateParticles(deltaTime)
    }
    return count
  }

  // 绘制粒子
  draw(opacity) {
    for (const layer of this.layers) {
      layer.draw(opacity)
    }
  }

  // 更新过渡映射表
  updateEasing() {
    for (const layer of this.layers) {
      layer.updateEasing()
    }
  }

  // 判断是否为空
  isEmpty() {
    for (const {elements} of this.layers) {
      if (elements.count !== 0) {
        return false
      }
    }
    return true
  }

  // 清除粒子元素
  clear() {
    for (const layer of this.layers) {
      layer.clear()
    }
  }

  // 销毁资源
  destroy() {
    for (const layer of this.layers) {
      layer.destroy()
    }
  }
}

// ******************************** 粒子图层类 ********************************

Particle.Layer = class ParticleLayer {
  emitter       //:object
  data          //:object
  texture       //:object
  textureWidth  //:number
  textureHeight //:number
  unitWidth     //:number
  unitHeight    //:number
  elapsed       //:number
  capacity      //:number
  count         //:number
  stocks        //:number
  elements      //:array
  reserves      //:array

  constructor(emitter, data) {
    this.emitter = emitter
    this.data = data
    this.texture = null
    this.textureWidth = 0
    this.textureHeight = 0
    this.unitWidth = 0
    this.unitHeight = 0
    this.elapsed = data.interval - data.delay
    this.capacity = 0
    this.count = 0
    this.stocks = 0
    this.elements = []
    this.elements.count = 0
    this.reserves = []
    this.reserves.count = 0

    // 更新发射数量
    this.updateCount()

    // 更新过渡映射表
    this.updateEasing()

    // 加载纹理
    this.loadTexture()
  }

  // 发射粒子
  emitParticles(deltaTime) {
    let stocks = this.stocks
    if (stocks === 0) return
    this.elapsed += deltaTime * this.emitter.speed
    const data = this.data
    const dInterval = data.interval
    let count = Math.floor(this.elapsed / dInterval)
    if (count > 0) {
      // 0 * Infinity returns NaN
      this.elapsed -= dInterval * count || 0
      const elements = this.elements
      const maximum = ParticleLayer.maximum
      let eCount = elements.count
      if (eCount === maximum) return
      const reserves = this.reserves
      let rCount = reserves.count
      spawn: {
        // 重用旧的粒子
        while (rCount > 0) {
          const element = reserves[--rCount]
          elements[eCount++] = element
          element.initialize()
          count--
          stocks--
          // 由于Infinity * 0返回NaN，这里分开判断
          if (count === 0 || stocks === 0) {
            break spawn
          }
        }
        // 创建新的粒子
        for (let i = this.capacity; i < maximum; i++) {
          elements[eCount++] = new Particle.Element(this)
          this.capacity = i + 1
          count--
          stocks--
          if (count === 0 || stocks === 0) {
            break spawn
          }
        }
      }
      elements.count = eCount
      reserves.count = rCount
      this.stocks = stocks
    }
  }

  // 更新粒子
  updateParticles(deltaTime) {
    const elements = this.elements
    const eCount = elements.count
    if (eCount === 0) return 0
    const reserves = this.reserves
    let rCount = reserves.count
    let offset = 0
    deltaTime *= this.emitter.speed
    for (let i = 0; i < eCount; i++) {
      const element = elements[i]
      switch (element.update(deltaTime)) {
        // 回收粒子
        case false:
          reserves[rCount + offset] = element
          offset++
          continue
        // 重新排序
        default:
          if (offset !== 0) {
            elements[i - offset] = element
          }
          continue
      }
    }
    if (offset !== 0) {
      // 为了通知动画舞台继续更新画面
      // 这里不对返回的粒子数量做更新(零粒子数停止播放)
      elements.count = eCount - offset
      reserves.count = rCount + offset
    }
    return eCount
  }

  // 绘制粒子
  draw(opacity = 1) {
    const gl = GL
    const data = this.data
    const texture = this.texture
    const elements = this.elements
    const count = elements.count
    let vi = 0
    switch (data.sort) {
      case 'youngest-in-front':
        for (let i = 0; i < count; i++) {
          elements[i].draw(vi)
          vi += 20
        }
        break
      case 'oldest-in-front':
        for (let i = count - 1; i >= 0; i--) {
          elements[i].draw(vi)
          vi += 20
        }
        break
      case 'by-scale-factor': {
        const {min, abs, round} = Math
        const layers = ParticleLayer.layers
        const starts = ParticleLayer.zeros
        const ends = ParticleLayer.sharedUint32A
        const set = ParticleLayer.sharedUint32B
        const times = 0x3ffff / 10
        let li = 0
        let si = 2
        for (let i = 0; i < count; i++) {
          const element = elements[i]
          const key = min(0x3ffff, round(
            abs(element.scaleFactor) * times
          ))
          if (starts[key] === 0) {
            starts[key] = si
            layers[li++] = key
          } else {
            set[ends[key] + 1] = si
          }
          ends[key] = si
          set[si++] = i
          set[si++] = 0
        }
        const queue = new Uint32Array(layers.buffer, 0, li).sort()
        for (let i = 0; i < li; i++) {
          const key = queue[i]
          let si = starts[key]
          starts[key] = 0
          do {
            elements[set[si]].draw(vi)
            vi += 20
          } while ((si = set[si + 1]) !== 0)
        }
        break
      }
    }

    // 绘制元素
    if (vi !== 0) {
      gl.alpha = this.emitter.opacity * opacity
      gl.blend = data.blend
      const program = gl.particleProgram.use()
      const vertices = gl.arrays[0].float32
      const matrix = gl.matrix.project(
        gl.flip,
        gl.width,
        gl.height,
      ).multiply(Particle.Element.stage.matrix)
      gl.bindVertexArray(program.vao)
      gl.uniformMatrix3fv(program.u_Matrix, false, matrix)
      switch (data.color.mode) {
        default:
          gl.uniform1i(program.u_Mode, 0)
          break
        case 'texture': {
          const tint = data.color.tint
          const red = tint[0] / 255
          const green = tint[1] / 255
          const blue = tint[2] / 255
          const gray = tint[3] / 255
          gl.uniform1i(program.u_Mode, 1)
          gl.uniform4f(program.u_Tint, red, green, blue, gray)
          break
        }
      }
      const lightMode = Scene.state === 'open' && Scene.showLight ? data.light : 'raw'
      gl.uniform1i(program.u_LightMode, ParticleLayer.lightSamplingModes[lightMode])
      gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STREAM_DRAW, 0, vi)
      gl.bindTexture(gl.TEXTURE_2D, texture.base.glTexture)
      gl.drawElements(gl.TRIANGLES, vi / 20 * 6, gl.UNSIGNED_INT, 0)
      // 重置混合模式
      gl.alpha = 1
      gl.blend = 'normal'
    }
  }

  // 加载粒子纹理
  loadTexture() {
    const guid = this.data.image
    const texture = this.texture
    if (texture instanceof ImageTexture) {
      if (texture.complete &&
        texture.base.guid === guid) {
        this.calculateElementSize()
        return
      }
      texture.destroy()
      this.texture = null
      this.unitWidth = 0
      this.unitHeight = 0
    }
    if (guid) {
      const texture = new ImageTexture(guid)
      if (texture.complete) {
        this.texture = texture
        this.calculateElementSize()
        Particle.Element.stage.requestRendering()
        delete this.draw
        return
      }
      this.texture = texture
      texture.on('load', () => {
        if (this.texture === texture) {
          this.texture = texture
          this.calculateElementSize()
          Particle.Element.stage.requestRendering()
          delete this.draw
        } else {
          texture.destroy()
        }
      })
    }
    this.draw = Function.empty
  }

  // 计算粒子元素大小
  calculateElementSize() {
    const {data, texture} = this
    if (!texture) return
    this.textureWidth = texture.width
    this.textureHeight = texture.height
    this.unitWidth = Math.floor(texture.width / data.sprite.hframes)
    this.unitHeight = Math.floor(texture.height / data.sprite.vframes)
  }

  // 调整元素索引
  resizeElementIndices() {
    const sprite = this.data.sprite
    const hframes = sprite.hframes
    const vframes = sprite.vframes
    const elements = this.elements
    const count = elements.count
    for (let i = 0; i < count; i++) {
      const element = elements[i]
      element.spriteX %= hframes
      element.spriteY %= vframes
    }
  }

  // 更新发射数量
  updateCount() {
    let {count} = this.data
    if (count === 0) {
      count = 1e16
    }
    this.count = count
    this.stocks = count
  }

  // 更新过渡映射表
  updateEasing() {
    const {color} = this.data
    if (color.mode === 'easing') {
      this.easing = Easing.get(color.easingId)
    }
  }

  // 更新元素方法
  updateElementMethods() {
    this.clear()
    const reserves = this.reserves
    const count = reserves.count
    for (let i = 0; i < count; i++) {
      reserves[i].updateMethods()
    }
  }

  // 清除粒子元素
  clear() {
    const elements = this.elements
    const reserves = this.reserves
    const eCount = elements.count
    let rCount = reserves.count
    for (let i = 0; i < eCount; i++) {
      reserves[rCount++] = elements[i]
    }
    elements.count = 0
    reserves.count = rCount
    this.elapsed = this.data.interval - this.data.delay
    this.stocks = this.count
  }

  // 销毁资源
  destroy() {
    if (this.texture instanceof ImageTexture) {
      this.texture.destroy()
      this.texture = null
    }
  }

  // 静态 - 同时存在的最大粒子数量
  static maximum = 1000

  // 静态 - 图层数组
  static layers = new Uint32Array(0x40000)

  // 静态 - 零值数组(用完后要确保所有值归零)
  static zeros = new Uint32Array(0x40000)

  // 静态 - 共享数组
  static sharedUint32A = new Uint32Array(GL.arrays[0].uint32.buffer, 512 * 512 * 88, 512 * 512)
  static sharedUint32B = new Uint32Array(GL.arrays[0].uint32.buffer, 512 * 512 * 92, 512 * 512)

  // 静态 - 光照采样模式映射表
  static lightSamplingModes = {raw: 0, global: 1, ambient: 2}
}

// ******************************** 粒子元素类 ********************************

Particle.Element = class ParticleElement {
  emitter                 //:object
  layer                   //:object
  data                    //:object
  elapsed                 //:number
  lifetime                //:number
  fadeout                 //:number
  fadeoutTime             //:number
  globalAngle             //:number
  x                       //:number
  y                       //:number
  anchorX                 //:number
  anchorY                 //:number
  anchorSpeedX            //:number
  anchorSpeedY            //:number
  movementSpeedX          //:number
  movementSpeedY          //:number
  movementAccelX          //:number
  movementAccelY          //:number
  rotationAngle           //:number
  rotationSpeed           //:number
  rotationAccel           //:number
  hRotationOffsetX        //:number
  hRotationOffsetY        //:number
  hRotationRadius         //:number
  hRotationExpansionSpeed //:number
  hRotationExpansionAccel //:number
  hRotationAngle          //:number
  hRotationAngularSpeed   //:number
  hRotationAngularAccel   //:number
  scaleFactor             //:number
  scaleSpeed              //:number
  scaleAccel              //:number
  spriteMode              //:string
  spriteHframes           //:number
  spriteVframes           //:number
  spriteInterval          //:number
  spriteElapsed           //:number
  spriteFrame             //:number
  spriteCount             //:number
  spriteX                 //:number
  spriteY                 //:number
  opacity                 //:number
  color                   //:array
  setStartPosition        //:function
  postProcessing          //:function
  setStartColor           //:function
  updateColor             //:function

  constructor(layer) {
    this.emitter = layer.emitter
    this.layer = layer
    this.data = layer.data
    this.elapsed = 0
    this.lifetime = 0
    this.fadeout = 0
    this.fadeoutTime = 0
    this.globalAngle = 0
    this.x = 0
    this.y = 0
    this.anchorX = 0
    this.anchorY = 0
    this.anchorSpeedX = 0
    this.anchorSpeedY = 0
    this.movementSpeedX = 0
    this.movementSpeedY = 0
    this.movementAccelX = 0
    this.movementAccelY = 0
    this.rotationAngle = 0
    this.rotationSpeed = 0
    this.rotationAccel = 0
    this.hRotationOffsetX = 0
    this.hRotationOffsetY = 0
    this.hRotationRadius = 0
    this.hRotationExpansionSpeed = 0
    this.hRotationExpansionAccel = 0
    this.hRotationAngle = 0
    this.hRotationAngularSpeed = 0
    this.hRotationAngularAccel = 0
    this.scaleFactor = 0
    this.scaleSpeed = 0
    this.scaleAccel = 0
    this.spriteMode = ''
    this.spriteHframes = 0
    this.spriteVframes = 0
    this.spriteInterval = 0
    this.spriteElapsed = 0
    this.spriteFrame = 0
    this.spriteCount = 0
    this.spriteX = 0
    this.spriteY = 0
    this.opacity = 0
    this.color = new Uint32Array(5)
    this.updateMethods()
    this.initialize()
  }

  // 初始化
  initialize() {
    const {emitter} = this
    const {lifetime, lifetimeDev, fadeout, anchor, rotation, hRotation, movement, scale, sprite} = this.data

    // 计算初始属性
    this.elapsed = 0
    this.lifetime = lifetime + lifetimeDev * (Math.random() * 2 - 1)
    this.fadeout = fadeout
    this.fadeoutTime = this.lifetime - fadeout
    this.globalAngle = emitter.angle
    this.scaleFactor = ParticleElement.getRandomParameter(scale.factor) * emitter.scale
    this.scaleSpeed = ParticleElement.getRandomParameter(scale.speed) / 1e3 * emitter.scale
    this.scaleAccel = ParticleElement.getRandomParameter(scale.accel) / 1e6 * emitter.scale
    this.anchorX = ParticleElement.getRandomParameter(anchor.x)
    this.anchorY = ParticleElement.getRandomParameter(anchor.y)
    this.anchorSpeedX = ParticleElement.getRandomParameter(anchor.speedX) / 1e3
    this.anchorSpeedY = ParticleElement.getRandomParameter(anchor.speedY) / 1e3
    this.rotationAngle = Math.radians(ParticleElement.getRandomParameter(rotation.angle)) + emitter.angle
    this.rotationSpeed = Math.radians(ParticleElement.getRandomParameter(rotation.speed)) / 1e3
    this.rotationAccel = Math.radians(ParticleElement.getRandomParameter(rotation.accel)) / 1e6
    this.hRotationOffsetX = 0
    this.hRotationOffsetY = 0
    this.hRotationRadius = ParticleElement.getRandomParameter(hRotation.radius) * emitter.scale
    this.hRotationExpansionSpeed = ParticleElement.getRandomParameter(hRotation.expansionSpeed) * emitter.scale / 1e3
    this.hRotationExpansionAccel = ParticleElement.getRandomParameter(hRotation.expansionAccel) * emitter.scale / 1e6
    this.hRotationAngle = Math.radians(ParticleElement.getRandomParameter(hRotation.angle))
    this.hRotationAngularSpeed = Math.radians(ParticleElement.getRandomParameter(hRotation.angularSpeed)) / 1e3
    this.hRotationAngularAccel = Math.radians(ParticleElement.getRandomParameter(hRotation.angularAccel)) / 1e6
    const movementAngle = Math.radians(ParticleElement.getRandomParameter(movement.angle)) + emitter.angle
    const movementSpeed = ParticleElement.getRandomParameter(movement.speed) * emitter.scale / 1e3
    this.movementSpeedX = movementSpeed * Math.cos(movementAngle)
    this.movementSpeedY = movementSpeed * Math.sin(movementAngle)
    const movementAccelAngle = Math.radians(ParticleElement.getRandomParameter(movement.accelAngle)) + emitter.angle
    const movementAccel = ParticleElement.getRandomParameter(movement.accel) * emitter.scale / 1e6
    this.movementAccelX = movementAccel * Math.cos(movementAccelAngle)
    this.movementAccelY = movementAccel * Math.sin(movementAccelAngle)
    this.opacity = 1
    this.spriteMode = sprite.mode
    this.spriteHframes = sprite.hframes
    this.spriteVframes = sprite.vframes
    this.spriteInterval = sprite.interval
    this.spriteElapsed = 0
    this.spriteCount = sprite.hframes * sprite.vframes

    // 设置初始精灵帧
    switch (this.spriteMode) {
      case 'random':
        this.spriteFrame = Math.floor(Math.random() * this.spriteCount)
        this.updateSpriteFrame()
        break
      case 'animation':
      case 'animation-loop':
        this.spriteFrame = 0
        this.spriteX = 0
        this.spriteY = 0
        break
    }

    // 设置初始位置
    this.setStartPosition(movementAngle)

    // 设置初始颜色
    this.setStartColor()
  }

  // 更新数据
  update(deltaTime) {
    // 计算当前帧新的位置
    this.elapsed += deltaTime
    this.scaleSpeed += this.scaleAccel * deltaTime
    this.scaleFactor += this.scaleSpeed * deltaTime
    this.rotationSpeed += this.rotationAccel * deltaTime
    this.rotationAngle += this.rotationSpeed * deltaTime
    this.movementSpeedX += this.movementAccelX * deltaTime
    this.movementSpeedY += this.movementAccelY * deltaTime
    this.anchorX += this.anchorSpeedX * deltaTime
    this.anchorY += this.anchorSpeedY * deltaTime
    this.x += this.movementSpeedX * deltaTime
    this.y += this.movementSpeedY * deltaTime

    // 计算水平旋转
    this.hRotationExpansionSpeed += this.hRotationExpansionAccel * deltaTime
    this.hRotationRadius += this.hRotationExpansionSpeed * deltaTime
    this.hRotationAngularSpeed += this.hRotationAngularAccel * deltaTime
    this.hRotationAngle += this.hRotationAngularSpeed * deltaTime
    const hRotationOffset = this.hRotationRadius * Math.cos(this.hRotationAngle)
    const hRotationOffsetX = hRotationOffset * Math.cos(this.globalAngle)
    const hRotationOffsetY = hRotationOffset * Math.sin(this.globalAngle)
    this.x += hRotationOffsetX - this.hRotationOffsetX
    this.y += hRotationOffsetY - this.hRotationOffsetY
    this.hRotationOffsetX = hRotationOffsetX
    this.hRotationOffsetY = hRotationOffsetY

    // 计算精灵帧
    switch (this.spriteMode) {
      case 'random':
        break
      case 'animation':
        if (this.spriteFrame < this.spriteCount - 1 &&
          (this.spriteElapsed += deltaTime) >= this.spriteInterval) {
          this.spriteElapsed -= this.spriteInterval
          this.spriteFrame++
          this.updateSpriteFrame()
        }
        break
      case 'animation-loop':
        if ((this.spriteElapsed += deltaTime) >= this.spriteInterval) {
          this.spriteElapsed -= this.spriteInterval
          this.spriteFrame = (this.spriteFrame + 1) % this.spriteCount
          this.updateSpriteFrame()
        }
        break
    }

    // 更新颜色
    this.updateColor()

    // 后期处理
    return this.postProcessing()
  }

  // 绘制图像
  draw(vi) {
    const layer = this.layer
    const sw = layer.unitWidth
    const sh = layer.unitHeight
    const tw = layer.textureWidth
    const th = layer.textureHeight
    const ax = this.anchorX + 0.5
    const ay = this.anchorY + 0.5
    const vertices = GL.arrays[0].float32
    const colors = GL.arrays[0].uint32
    const matrix = GL.matrix.reset()
    .translate(this.x, this.y)
    .rotate(this.rotationAngle)
    .scale(this.scaleFactor, this.scaleFactor)
    .translate(-ax * sw, -ay * sh)
    const R = sw
    const B = sh
    const a = matrix[0]
    const b = matrix[1]
    const c = matrix[3]
    const d = matrix[4]
    const e = matrix[6]
    const f = matrix[7]
    const sx = this.spriteX * sw
    const sy = this.spriteY * sh
    const color = this.getColorInt()
    const sl = sx / tw
    const st = sy / th
    const sr = (sx + sw) / tw
    const sb = (sy + sh) / th
    vertices[vi    ] = e
    vertices[vi + 1] = f
    vertices[vi + 2] = sl
    vertices[vi + 3] = st
    colors  [vi + 4] = color
    vertices[vi + 5] = c * B + e
    vertices[vi + 6] = d * B + f
    vertices[vi + 7] = sl
    vertices[vi + 8] = sb
    colors  [vi + 9] = color
    vertices[vi + 10] = a * R + c * B + e
    vertices[vi + 11] = b * R + d * B + f
    vertices[vi + 12] = sr
    vertices[vi + 13] = sb
    colors  [vi + 14] = color
    vertices[vi + 15] = a * R + e
    vertices[vi + 16] = b * R + f
    vertices[vi + 17] = sr
    vertices[vi + 18] = st
    colors  [vi + 19] = color
  }

  // 获取整数型颜色
  getColorInt() {
    const {color} = this
    if (color.changed) {
      color.changed = false
      const r = color[0]
      const g = color[1]
      const b = color[2]
      const a = Math.round(color[3] * this.opacity)
      color[4] = r + (g + (b + a * 256) * 256) * 256
    }
    return color[4]
  }

  // 更新精灵帧
  updateSpriteFrame() {
    this.spriteX = this.spriteFrame % this.spriteHframes
    this.spriteY = Math.floor(this.spriteFrame / this.spriteHframes)
  }

  // 更新方法
  updateMethods() {
    const {area, color} = this.data
    // 给不同的发射区域设置特有的方法
    switch (area.type) {
      case 'point':
        this.setStartPosition = this.setStartPositionPoint
        this.postProcessing = this.postProcessingCommon
        break
      case 'rectangle':
        this.setStartPosition = this.setStartPositionRectangle
        this.postProcessing = this.postProcessingCommon
        break
      case 'circle':
        this.setStartPosition = this.setStartPositionCircle
        this.postProcessing = this.postProcessingCommon
        break
      case 'edge':
        this.setStartPosition = this.setStartPositionEdge
        this.postProcessing = this.postProcessingEdge
        break
    }
    // 给不同的颜色模式设置特有的方法
    switch (color.mode) {
      case 'fixed':
        this.setStartColor = this.setStartColorFixed
        this.updateColor = Function.empty
        break
      case 'random':
        this.setStartColor = this.setStartColorRandom
        this.updateColor = Function.empty
        break
      case 'easing':
        if (this.color.start === undefined) {
          this.color.start = new Uint8Array(4)
          this.color.end = new Uint8Array(4)
        }
        this.setStartColor = this.setStartColorEasing
        this.updateColor = this.updateColorEasing
        break
      case 'texture':
        this.setStartColor = this.setStartColorTexture
        this.updateColor = Function.empty
        break
    }
  }

  // 变换初始位置
  transformStartPosition() {
    const {matrix} = this.emitter
    if (matrix !== null) {
      const a = matrix[0]
      const b = matrix[1]
      const c = matrix[3]
      const d = matrix[4]
      const e = matrix[6]
      const f = matrix[7]
      const {x, y} = this
      this.x = a * x + c * y + e
      this.y = b * x + d * y + f
    }
  }

  // 获取区域位置
  getAreaPosition() {
    const array = ParticleElement.sharedFloat64Array
    const emitter = this.emitter
    const area = this.data.area
    const cos = Math.cos(emitter.angle)
    const sin = Math.sin(emitter.angle)
    const x = area.x * emitter.scale
    const y = area.y * emitter.scale
    array[0] = x * cos - y * sin
    array[1] = x * sin + y * cos
    return array
  }

  // 设置初始位置 - 点
  setStartPositionPoint() {
    const {emitter} = this
    const pos = this.getAreaPosition()
    this.x = emitter.startX + pos[0]
    this.y = emitter.startY + pos[1]
    this.transformStartPosition()
  }

  // 设置初始位置 - 矩形
  setStartPositionRectangle() {
    const {emitter} = this
    const {area} = this.data
    const pos = this.getAreaPosition()
    const x = emitter.startX + pos[0]
    const y = emitter.startY + pos[1]
    const wh = area.width * emitter.scale / 2
    const hh = area.height * emitter.scale / 2
    this.x = Math.randomBetween(x - wh, x + wh)
    this.y = Math.randomBetween(y - hh, y + hh)
    this.transformStartPosition()
  }

  // 设置初始位置 - 圆形
  setStartPositionCircle() {
    const {emitter} = this
    const {area} = this.data
    const pos = this.getAreaPosition()
    const x = emitter.startX + pos[0]
    const y = emitter.startY + pos[1]
    const angle = Math.random() * Math.PI * 2
    const distance = Math.random() * area.radius * emitter.scale
    this.x = x + distance * Math.cos(angle)
    this.y = y + distance * Math.sin(angle)
    this.transformStartPosition()
  }

  // 设置初始位置 - 屏幕边缘
  setStartPositionEdge(movementAngle) {
    // 计算屏幕边缘的位置
    const stage = ParticleElement.stage
    const scrollLeft = stage.scrollLeft
    const scrollTop = stage.scrollTop
    const scrollRight = stage.scrollRight
    const scrollBottom = stage.scrollBottom
    const width = scrollRight - scrollLeft
    const height = scrollBottom - scrollTop
    const weightX = Math.abs(Math.sin(movementAngle) * width)
    const weightY = Math.abs(Math.sin(movementAngle - Math.PI / 2) * height)
    const threshold = weightX / (weightX + weightY)
    const random = Math.random()
    if (random < threshold) {
      const forward = this.movementSpeedY >= 0
      this.x = scrollLeft + random / threshold * width
      this.y = forward ? scrollTop : scrollBottom
      const vertices = this.computeBoundingRectangle()
      this.x -= (vertices[0] + vertices[2]) / 2 - this.x
      this.y -= forward
      ? vertices[3] - this.y
      : vertices[1] - this.y
    } else {
      const forward = this.movementSpeedX >= 0
      this.y = scrollTop + (random - threshold) / (1 - threshold) * height
      this.x = forward ? scrollLeft : scrollRight
      const vertices = this.computeBoundingRectangle()
      this.y -= (vertices[1] + vertices[3]) / 2 - this.y
      this.x -= forward
      ? vertices[2] - this.x
      : vertices[0] - this.x
    }
  }

  // 后期处理 - 通用
  postProcessingCommon() {
    // 消失
    if (this.elapsed >= this.lifetime) {
      return false
    }

    // 淡出
    if (this.elapsed > this.fadeoutTime) {
      const elapsed = this.elapsed - this.fadeoutTime
      const time = elapsed / this.fadeout
      this.opacity = Math.max(1 - time, 0)
      this.color.changed = true
    }
  }

  // 后期处理 - 屏幕边缘
  postProcessingEdge() {
    // 处于屏幕内
    const stage = ParticleElement.stage
    const vertices = this.computeBoundingRectangle()
    if (vertices[0] < stage.scrollRight &&
      vertices[1] < stage.scrollBottom &&
      vertices[2] > stage.scrollLeft &&
      vertices[3] > stage.scrollTop &&
      this.elapsed < this.lifetime) {
      this.appeared = true

      // 淡出
      if (this.elapsed > this.fadeoutTime) {
        const elapsed = this.elapsed - this.fadeoutTime
        const time = elapsed / this.fadeout
        this.opacity = Math.max(1 - time, 0)
        this.color.changed = true
      }
      return
    }

    // 处于屏幕外
    if (this.appeared ||
      this.elapsed > 500 ||
      this.elapsed >= this.lifetime) {
      this.appeared = false
      return false
    }
  }

  // 计算外接矩形
  computeBoundingRectangle() {
    const layer = this.layer
    const sw = layer.unitWidth
    const sh = layer.unitHeight
    const ax = this.anchorX + 0.5
    const ay = this.anchorY + 0.5
    const matrix = GL.matrix.reset()
    .translate(this.x, this.y)
    .rotate(this.rotationAngle)
    .scale(this.scaleFactor, this.scaleFactor)
    .translate(-ax * sw, -ay * sh)
    const R = sw
    const B = sh
    const a = matrix[0]
    const b = matrix[1]
    const c = matrix[3]
    const d = matrix[4]
    const e = matrix[6]
    const f = matrix[7]
    const x1 = e
    const y1 = f
    const x2 = c * B + e
    const y2 = d * B + f
    const x3 = a * R + c * B + e
    const y3 = b * R + d * B + f
    const x4 = a * R + e
    const y4 = b * R + f
    const vertices = ParticleElement.sharedFloat64Array
    vertices[0] = Math.min(x1, x2, x3, x4)
    vertices[1] = Math.min(y1, y2, y3, y4)
    vertices[2] = Math.max(x1, x2, x3, x4)
    vertices[3] = Math.max(y1, y2, y3, y4)
    return vertices
  }

  // 设置初始颜色 - 固定
  setStartColorFixed() {
    const {rgba} = this.data.color
    const {color} = this
    color.changed = true
    color[0] = rgba[0]
    color[1] = rgba[1]
    color[2] = rgba[2]
    color[3] = rgba[3]
  }

  // 设置初始颜色 - 随机
  setStartColorRandom() {
    const {min, max} = this.data.color
    const {color} = this
    color.changed = true
    color[0] = Math.randomBetween(min[0], max[0])
    color[1] = Math.randomBetween(min[1], max[1])
    color[2] = Math.randomBetween(min[2], max[2])
    color[3] = Math.randomBetween(min[3], max[3])
  }

  // 设置初始颜色 - 过渡
  setStartColorEasing() {
    const {startMin, startMax, endMin, endMax} = this.data.color
    const {start, end} = this.color
    start[0] = Math.randomBetween(startMin[0], startMax[0])
    start[1] = Math.randomBetween(startMin[1], startMax[1])
    start[2] = Math.randomBetween(startMin[2], startMax[2])
    start[3] = Math.randomBetween(startMin[3], startMax[3])
    end[0] = Math.randomBetween(endMin[0], endMax[0])
    end[1] = Math.randomBetween(endMin[1], endMax[1])
    end[2] = Math.randomBetween(endMin[2], endMax[2])
    end[3] = Math.randomBetween(endMin[3], endMax[3])
  }

  // 更新颜色 - 过渡
  updateColorEasing() {
    const {easing} = this.layer
    const {color} = this
    const {start, end} = color
    const clamp = ParticleElement.sharedClampedArray
    const time = Math.min(easing.map(this.elapsed / this.lifetime), 1)
    color.changed = true
    clamp[0] = start[0] * (1 - time) + end[0] * time
    clamp[1] = start[1] * (1 - time) + end[1] * time
    clamp[2] = start[2] * (1 - time) + end[2] * time
    clamp[3] = start[3] * (1 - time) + end[3] * time
    color[0] = clamp[0]
    color[1] = clamp[1]
    color[2] = clamp[2]
    color[3] = clamp[3]
  }

  // 设置初始颜色 - 纹理
  setStartColorTexture() {
    const {color} = this
    color.changed = true
    color[3] = 255
  }

  // 静态 - 元素舞台
  static stage

  // 静态 - 公共属性
  static sharedFloat64Array = new Float64Array(4)
  static sharedClampedArray = new Uint8ClampedArray(4)

  // 静态 - 生成随机参数
  static getRandomParameter([standard, deviation]) {
    return standard + deviation * (Math.random() * 2 - 1)
  }
}