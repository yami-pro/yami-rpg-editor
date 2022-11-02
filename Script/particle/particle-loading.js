'use strict'

import { Particle } from './particle.js'
import { Scene } from '../scene/scene.js'
import { Timer } from '../util/timer.js'
import { Matrix } from '../webgl/matrix.js'
import { GL } from '../webgl/gl.js'
import { History } from '../history/history.js'
import { Inspector } from '../inspector/inspector.js'

// ******************************** 粒子窗口加载 ********************************

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
  this.duration.on('input', this.durationInput)
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
  this.duration.write(particle.duration)

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
  context.editor.emitter.destroy()
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
  if (color === undefined) return
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
  const gl = GL
  const vertices = gl.arrays[0].float32
  const matrix = this.matrix
  const X = emitter.startX
  const Y = emitter.startY
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
      const aw = area.width
      const ah = area.height
      const ox = 0.5 / this.scaleX
      const oy = 0.5 / this.scaleY
      const L = aw * -0.5 + ox
      const T = ah * -0.5 + oy
      const R = Math.max(L, aw * +0.5 - ox)
      const B = Math.max(T, ah * +0.5 - oy)
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
      const ar = area.radius
      const segments = 100
      const step = Math.PI * 2 / segments
      for (let i = 0; i < segments; i++) {
        const angle = i * step
        vertices[vi    ] = ar * Math.cos(angle)
        vertices[vi + 1] = ar * Math.sin(angle)
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
    const {texture} = layer
    if (texture instanceof ImageTexture) {
      const elements = layer.elements
      const count = elements.count
      const sw = layer.unitWidth
      const sh = layer.unitHeight
      for (let i = 0; i < count; i++) {
        const element = elements[i]
        matrix
        .set(Particle.matrix)
        .translate(element.x, element.y)
        .rotate(element.rotationAngle)
        .scale(element.scaleFactor, element.scaleFactor)
        .translate(-element.anchorX * sw, -element.anchorY * sh)
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
      if (ax === 0.5 && ay === 0.5) {
        continue
      }
      matrix
      .rotate(element.rotationAngle)
      .scale(element.scaleFactor, element.scaleFactor)
      .translate((0.5 - ax) * sw, (0.5 - ay) * sh)
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
  let L = 0
  let T = 0
  let R = 0
  let B = 0
  const emitter = this.emitter
  const sx = emitter.startX
  const sy = emitter.startY
  for (const {area} of emitter.data.layers) {
    switch (area.type) {
      case 'edge':
        continue
    }
    if (L === 0) {
      L = T = -16
      R = B = 16
    }
    switch (area.type) {
      case 'rectangle':
        L = Math.min(L, area.width * -0.5)
        T = Math.min(T, area.height * -0.5)
        R = Math.max(R, area.width * +0.5)
        B = Math.max(B, area.height * +0.5)
        continue
      case 'circle':
        L = Math.min(L, -area.radius)
        T = Math.min(T, -area.radius)
        R = Math.max(R, +area.radius)
        B = Math.max(B, +area.radius)
        continue
    }
  }
  emitter.outerLeft = sx + L
  emitter.outerTop = sy + T
  emitter.outerRight = sx + R
  emitter.outerBottom = sy + B
  if (L === 0) {
    emitter.active = false
    emitter.selected = false
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
        case 'Space':
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

// 持续时间 - 输入事件
Particle.durationInput = function (event) {
  const duration = this.read()
  Particle.emitter.data.duration = duration
  Particle.emitter.duration = duration || Infinity
  Particle.planToSave()
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
      if (!event.altKey) {
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
        const distX = (event.clientX - dragging.clientX) / Particle.scaleX
        const distY = (event.clientY - dragging.clientY) / Particle.scaleY
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
    FileBodyPane.prototype.setIconClip(icon, path, 0, 0, -item.hframes, -item.vframes)
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
  Particle.requestRendering()
}

// 列表 - 在恢复数据时回调
Particle.list.onResume = function () {
  Particle.emitter.updateLayers()
  Particle.requestRendering()
}
