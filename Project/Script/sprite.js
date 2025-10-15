'use strict'

// ******************************** 精灵窗口 ********************************

const Sprite = {
  // properties
  state: 'closed',
  body: $('#sprite-body'),
  window: $('#sprite-frame').hide(),
  canvas: $('#sprite-canvas'),
  context: null,
  info: $('#sprite-info'),
  slider: $('#sprite-zoom'),
  screen: $('#sprite-screen'),
  marquee: $('#sprite-marquee'),
  symbol: null,
  target: null,
  hframes: null,
  vframes: null,
  image: null,
  dragging: null,
  showGrid: true,
  gridColor: null,
  zoom: null,
  zoomTimer: null,
  scale: null,
  scaleX: null,
  scaleY: null,
  scaledUnitWidth: null,
  scaledUnitHeight: null,
  unitWidth: null,
  unitHeight: null,
  outerWidth: null,
  outerHeight: null,
  screenWidth: null,
  screenHeight: null,
  scrollLeft: null,
  scrollTop: null,
  scrollRight: null,
  scrollBottom: null,
  centerOffsetX: null,
  centerOffsetY: null,
  paddingLeft: null,
  paddingTop: null,
  centerX: null,
  centerY: null,
  // methods
  initialize: null,
  open: null,
  close: null,
  suspend: null,
  resume: null,
  setZoom: null,
  loadImage: null,
  updateTargetInfo: null,
  resize: null,
  getUnitCoords: null,
  updateCamera: null,
  updateTransform: null,
  updateBackground: null,
  drawSprite: null,
  drawSpriteLayer: null,
  drawGridLayer: null,
  selectSprite: null,
  scrollToSelection: null,
  requestRendering: null,
  renderingFunction: null,
  stopRendering: null,
  saveToProject: null,
  loadFromProject: null,
  // events
  windowResize: null,
  themechange: null,
  zoomFocus: null,
  zoomInput: null,
  screenKeydown: null,
  screenWheel: null,
  screenUserscroll: null,
  marqueePointerdown: null,
  pointerup: null,
  pointermove: null,
}

// 初始化
Sprite.initialize = function () {
  // 绑定滚动条
  this.screen.addScrollbars()

  // 创建画布上下文
  this.context = this.canvas.getContext('2d', {desynchronized: true})

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

  // 侦听事件
  window.on('themechange', this.themechange)
  $('#animSpriteFrame').on('resize', this.windowResize)
  $('#animSpriteFrame-properties-detail').on('toggle', this.windowResize)
  $('#animSpriteFrame-sprite-detail').on('toggle', this.windowResize)
  this.slider.on('focus', this.zoomFocus)
  this.slider.on('input', this.zoomInput)
  this.screen.on('keydown', this.screenKeydown)
  this.screen.on('wheel', this.screenWheel)
  this.screen.on('userscroll', this.screenUserscroll)
  this.marquee.on('pointerdown', this.marqueePointerdown)
}

// 打开精灵
Sprite.open = function (target) {
  if (this.target !== target) {
    this.close()
    if (Animation.timelineMarquee.layer.sprite) {
      this.state = 'loading'
      this.target = target
      this.loadImage()
    }
  }
}

// 关闭精灵
Sprite.close = function () {
  if (this.state !== 'closed') {
    this.state = 'closed'
    this.symbol = null
    this.target = null
    this.image = null
    this.window.hide()
    this.info.clear()
    this.marquee.clear()
    this.stopRendering()
  }
}

// 挂起
Sprite.suspend = function () {
  if (this.state === 'open') {
    this.state = 'suspended'
    this.info.hide()
    this.slider.hide()
    this.stopRendering()
  }
}

// 继续
Sprite.resume = function () {
  if (this.state === 'suspended') {
    this.state = 'open'
    this.info.show()
    this.slider.show()
    this.resize()
    this.requestRendering()
  }
}

// 设置缩放
Sprite.setZoom = function IIFE() {
  const slider = $('#sprite-zoom')
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

// 加载精灵图像
Sprite.loadImage = async function () {
  const symbol = this.symbol = Symbol()
  const name = Animation.timelineMarquee.layer.sprite
  let texture = Animation.player.textures[name]
  if (texture instanceof Promise) {
    texture = await texture
  }
  if (this.symbol === symbol) {
    this.symbol = null
    if (!texture) {
      return this.close()
    }
    const {image} = texture.base
    this.image = image
    this.hframes = texture.hframes
    this.vframes = texture.vframes
    this.unitWidth = texture.width
    this.unitHeight = texture.height
    this.window.show()
    if (this.body.clientWidth > 0) {
      this.state = 'open'
      this.resize()
      this.requestRendering()
    } else {
      this.state = 'suspended'
    }
  }
}

// 更新目标对象信息
Sprite.updateTargetInfo = function () {
  const {target} = this
  if (target) {
    const x = target.spriteX
    const y = target.spriteY
    const uw = this.unitWidth
    const uh = this.unitHeight
    this.info.textContent = `${x},${y} [${uw}x${uh}]`
  }
}

// 调整大小
Sprite.resize = function () {
  if (this.state === 'open') {
    const scale = this.scale
    const scaledUnitWidth = Math.round(this.unitWidth * scale)
    const scaledUnitHeight = Math.round(this.unitHeight * scale)
    const innerWidth = this.hframes * scaledUnitWidth
    const innerHeight = this.vframes * scaledUnitHeight
    const screenBox = CSS.getDevicePixelContentBoxSize(this.screen)
    const screenWidth = screenBox.width
    const screenHeight = screenBox.height
    const paddingLeft = Math.max(screenWidth - innerWidth >> 1, 0)
    const paddingTop = Math.max(screenHeight - innerHeight >> 1, 0)
    const outerWidth = Math.max(innerWidth, screenWidth)
    const outerHeight = Math.max(innerHeight, screenHeight)
    const dpr = window.devicePixelRatio
    this.scaleX = scaledUnitWidth / this.unitWidth
    this.scaleY = scaledUnitHeight / this.unitHeight
    this.scaledUnitWidth = scaledUnitWidth
    this.scaledUnitHeight = scaledUnitHeight
    this.outerWidth = outerWidth
    this.outerHeight = outerHeight
    this.screenWidth = screenWidth
    this.screenHeight = screenHeight
    this.centerOffsetX = outerWidth > screenWidth ? screenWidth / 2 : paddingLeft + innerWidth / 2
    this.centerOffsetY = outerHeight > screenHeight ? screenHeight / 2 : paddingTop + innerHeight / 2
    this.paddingLeft = paddingLeft
    this.paddingTop = paddingTop

    // 调整选框
    this.marquee.style.left = `${paddingLeft / dpr}px`
    this.marquee.style.top = `${paddingTop / dpr}px`
    this.marquee.style.width = `${innerWidth / dpr}px`
    this.marquee.style.height = `${innerHeight / dpr}px`
    this.marquee.scaleX = scaledUnitWidth / dpr
    this.marquee.scaleY = scaledUnitHeight / dpr

    // 更新选中位置
    if (this.marquee.visible) {
      this.marquee.select()
    } else {
      const target = this.target
      const hindex = target.spriteX
      const vindex = target.spriteY
      this.centerX = hindex + 0.5
      this.centerY = vindex + 0.5
      this.marquee.select(hindex, vindex, 1, 1)
      this.updateTargetInfo()
    }

    // 调整画布
    const canvasWidth = Math.min(innerWidth, screenWidth)
    const canvasHeight = Math.min(innerHeight, screenHeight)
    this.canvas.style.left = `${paddingLeft / dpr}px`
    this.canvas.style.top = `${paddingTop / dpr}px`
    if (this.canvas.dpr !== dpr ||
      this.canvas.width !== canvasWidth ||
      this.canvas.height !== canvasHeight) {
      this.canvas.dpr = dpr
      this.canvas.width = canvasWidth
      this.canvas.height = canvasHeight
      this.canvas.style.width = `${canvasWidth / dpr}px`
      this.canvas.style.height = `${canvasHeight / dpr}px`
      this.context.imageSmoothingEnabled = false
    }
    this.updateCamera()
    this.updateTransform()
    this.screen.updateScrollbars()
  }
}

// 获取单位坐标
Sprite.getUnitCoords = function IIFE() {
  const point = {x: 0, y: 0}
  return function (event) {
    const coords = event.getRelativeCoords(this.marquee)
    const suw = this.scaledUnitWidth
    const suh = this.scaledUnitHeight
    const dpr = window.devicePixelRatio
    point.x = Math.clamp(Math.floor(coords.x * dpr / suw), 0, this.hframes - 1)
    point.y = Math.clamp(Math.floor(coords.y * dpr / suh), 0, this.vframes - 1)
    return point
  }
}()

// 更新摄像机位置
Sprite.updateCamera = function (x = this.centerX, y = this.centerY) {
  const dpr = window.devicePixelRatio
  const screen = this.screen
  const scrollX = x * this.scaledUnitWidth + this.paddingLeft
  const scrollY = y * this.scaledUnitHeight + this.paddingTop
  const toleranceX = this.scaledUnitWidth * 0.0001
  const toleranceY = this.scaledUnitHeight * 0.0001
  screen.rawScrollLeft = Math.clamp(scrollX - this.centerOffsetX, 0, this.outerWidth - this.screenWidth) / dpr
  screen.rawScrollTop = Math.clamp(scrollY - this.centerOffsetY, 0, this.outerHeight - this.screenHeight) / dpr
  screen.scrollLeft = (scrollX - (this.screenWidth >> 1) + toleranceX) / dpr
  screen.scrollTop = (scrollY - (this.screenHeight >> 1) + toleranceY) / dpr
}

// 更新变换参数
// 这里获取的是canvas的边框参数
Sprite.updateTransform = function () {
  const dpr = window.devicePixelRatio
  const screen = this.screen
  const left = Math.roundTo(screen.scrollLeft * dpr, 4)
  const top = Math.roundTo(screen.scrollTop * dpr, 4)
  const right = left + this.canvas.width
  const bottom = top + this.canvas.height
  this.scrollLeft = left
  this.scrollTop = top
  this.scrollRight = right
  this.scrollBottom = bottom
  this.context.setTransform(1, 0, 0, 1, -left, -top)
  const scrollX = screen.rawScrollLeft * dpr + this.centerOffsetX
  const scrollY = screen.rawScrollTop * dpr + this.centerOffsetY
  this.centerX = Math.roundTo((scrollX - this.paddingLeft) / this.scaledUnitWidth, 4)
  this.centerY = Math.roundTo((scrollY - this.paddingTop) / this.scaledUnitHeight, 4)
}

// 更新背景图像
Sprite.updateBackground = Palette.updateBackground

// 绘制精灵
Sprite.drawSprite = function () {
  if (this.body.clientWidth > 0 &&
    this.canvas.width !== 0 &&
    this.canvas.height !== 0) {
    // 擦除画布
    const context = this.context
    const sl = this.scrollLeft
    const st = this.scrollTop
    const sr = this.scrollRight
    const sb = this.scrollBottom
    context.clearRect(sl, st, sr - sl, sb - st)

    // 绘制图层
    this.drawSpriteLayer()
    this.drawGridLayer()
  }
}

// 绘制精灵层
Sprite.drawSpriteLayer = function () {
  const context = this.context
  const image = this.image
  const scaleX = this.scaleX
  const scaleY = this.scaleY
  const dx = this.scrollLeft
  const dy = this.scrollTop
  const dw = this.scrollRight - dx
  const dh = this.scrollBottom - dy
  const sx = dx / scaleX
  const sy = dy / scaleY
  const sw = dw / scaleX
  const sh = dh / scaleY
  context.drawImage(image, sx, sy, sw, sh, dx, dy, dw, dh)
}

// 绘制网格层
Sprite.drawGridLayer = function () {
  if (this.showGrid) {
    const context = this.context
    const sl = this.scrollLeft
    const st = this.scrollTop
    const sr = this.scrollRight
    const sb = this.scrollBottom
    const uw = this.scaledUnitWidth
    const uh = this.scaledUnitHeight
    const bx = Math.floor(sl / uw + 1) * uw
    const by = Math.floor(st / uh + 1) * uh
    const ex = Math.ceil(sr / uw) * uw
    const ey = Math.ceil(sb / uh) * uh
    context.beginPath()
    for (let y = by; y < ey; y += uh) {
      context.moveTo(sl, y + 0.5)
      context.lineTo(sr, y + 0.5)
    }
    for (let x = bx; x < ex; x += uw) {
      context.moveTo(x + 0.5, st)
      context.lineTo(x + 0.5, sb)
    }
    context.lineWidth = 1
    context.strokeStyle = this.gridColor
    context.stroke()
  }
}

// 选择精灵
Sprite.selectSprite = function (hindex, vindex) {
  const target = this.target
  if (target !== null) {
    this.marquee.select(hindex, vindex, 1, 1)
    Animation.planToSave()
    const x = Animation.timelineMarquee.x
    const history = Animation.history
    const index = history.index
    const length = history.length
    const record = history[index]
    const type = 'animation-target-index'
    if (index !== length - 1 ||
      record === undefined ||
      record.type !== type ||
      record.target !== target) {
      history.save({
        type: type,
        motion: Animation.motion,
        direction: Animation.direction,
        target: target,
        hindex: target.spriteX,
        vindex: target.spriteY,
      })
    }
    target.spriteX = hindex
    target.spriteY = vindex
    this.updateTargetInfo()
    Animation.loadFrames(x)
    Animation.requestRendering()
  }
}

// 滚动到选中位置
Sprite.scrollToSelection = function () {
  const marquee = this.marquee
  if (marquee.visible) {
    const suw = this.scaledUnitWidth
    const suh = this.scaledUnitHeight
    const mx = marquee.x
    const my = marquee.y
    const mr = marquee.width + mx
    const mb = marquee.height + my
    const wh = this.screenWidth / suw / 2
    const hh = this.screenHeight / suh / 2
    const toleranceX = 0.5 / suw
    const toleranceY = 0.5 / suh
    const x1 = mr - wh + toleranceX
    const x2 = mx + wh - toleranceX
    const y1 = mb - hh + toleranceY
    const y2 = my + hh - toleranceY
    const x = Math.min(Math.max(this.centerX, x1), x2)
    const y = Math.min(Math.max(this.centerY, y1), y2)
    if (this.centerX !== x || this.centerY !== y) {
      this.updateCamera(x, y)
      this.updateTransform()
      this.requestRendering()
      this.screen.updateScrollbars()
    }
  }
}

// 请求渲染
Sprite.requestRendering = function () {
  if (this.state === 'open') {
    Timer.appendUpdater('sharedRendering', this.renderingFunction)
  }
}

// 渲染函数
Sprite.renderingFunction = function () {
  Sprite.drawSprite()
}

// 停止渲染
Sprite.stopRendering = function () {
  Timer.removeUpdater('sharedRendering', this.renderingFunction)
}

// 保存状态到项目文件
Sprite.saveToProject = function (project) {
  const {sprite} = project
  const zoom = this.zoom
  if (zoom !== null) {
    sprite.zoom = zoom
  }
}

// 从项目文件中加载状态
Sprite.loadFromProject = function (project) {
  const {sprite} = project
  this.setZoom(sprite.zoom)
}

// 窗口 - 调整大小事件
Sprite.windowResize = function (event) {
  // 检查器页面不可见时挂起
  if (this.body.clientWidth === 0) {
    return this.suspend()
  }
  switch (this.state) {
    case 'open':
      this.resize()
      this.requestRendering()
      break
    case 'suspended':
      this.resume()
      break
  }
}.bind(Sprite)

// 主题改变事件
Sprite.themechange = function (event) {
  switch (event.value) {
    case 'light':
      this.gridColor = 'rgba(0, 0, 0, 0.5)'
      break
    case 'dark':
      this.gridColor = 'rgba(255, 255, 255, 0.5)'
      break
  }
  this.requestRendering()
}.bind(Sprite)

// 缩放 - 获得焦点事件
Sprite.zoomFocus = function (event) {
  Sprite.screen.focus()
}

// 缩放 - 输入事件
Sprite.zoomInput = function (event) {
  Sprite.setZoom(this.read())
}

// 屏幕 - 键盘按下事件
Sprite.screenKeydown = function (event) {
  if (Sprite.state === 'open' &&
    Sprite.dragging === null) {
    switch (event.code) {
      case 'ArrowLeft':
      case 'ArrowUp':
      case 'ArrowRight':
      case 'ArrowDown': {
        let offsetX = 0
        let offsetY = 0
        switch (event.code) {
          case 'ArrowLeft':  offsetX = -1; break
          case 'ArrowUp':    offsetY = -1; break
          case 'ArrowRight': offsetX = +1; break
          case 'ArrowDown':  offsetY = +1; break
        }
        const marquee = Sprite.marquee
        const x = Math.clamp(marquee.x + offsetX, 0, Sprite.hframes - 1)
        const y = Math.clamp(marquee.y + offsetY, 0, Sprite.vframes - 1)
        if (marquee.x !== x || marquee.y !== y) {
          Sprite.selectSprite(x, y)
          Sprite.scrollToSelection()
        }
        break
      }
      case 'Minus':
      case 'NumpadSubtract':
        Sprite.setZoom(Sprite.zoom - 1)
        break
      case 'Equal':
      case 'NumpadAdd':
        Sprite.setZoom(Sprite.zoom + 1)
        break
      case 'Digit0':
      case 'Numpad0':
        Sprite.setZoom(2)
        break
    }
  }
}

// 屏幕 - 鼠标滚轮事件
Sprite.screenWheel = function (event) {
  event.preventDefault()
  if (event.deltaY !== 0 &&
    this.dragging === null) {
    this.setZoom(this.zoom + (event.deltaY > 0 ? -1 : 1))
  }
}.bind(Sprite)

// 屏幕 - 用户滚动事件
Sprite.screenUserscroll = function (event) {
  if (this.state === 'open') {
    this.screen.rawScrollLeft = this.screen.scrollLeft
    this.screen.rawScrollTop = this.screen.scrollTop
    this.updateTransform()
    this.updateBackground()
    this.requestRendering()
    this.screen.updateScrollbars()
  }
}.bind(Sprite)

// 选框 - 指针按下事件
Sprite.marqueePointerdown = function (event) {
  // 优先触发检查器输入框的blur事件
  if (Inspector.manager.focusing) {
    document.activeElement.blur()
  }
  if (this.dragging) {
    return
  }
  switch (event.button) {
    case 0: {
      if (event.dragKey) {
        this.dragging = event
        event.mode = 'scroll'
        event.scrollLeft = this.screen.scrollLeft
        event.scrollTop = this.screen.scrollTop
        Cursor.open('cursor-grab')
        window.on('pointerup', this.pointerup)
        window.on('pointermove', this.pointermove)
        return
      }
      const {x, y} = this.getUnitCoords(event)
      const {marquee} = this
      if (!marquee.visible ||
        marquee.x !== x ||
        marquee.y !== y) {
        this.selectSprite(x, y)
      }
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
}.bind(Sprite)

// 指针弹起事件
Sprite.pointerup = function (event) {
  const {dragging} = this
  if (dragging.relate(event)) {
    switch (dragging.mode) {
      case 'scroll':
        this.screen.endScrolling()
        Cursor.close('cursor-grab')
        break
    }
    this.dragging = null
    window.off('pointerup', this.pointerup)
    window.off('pointermove', this.pointermove)
  }
}.bind(Sprite)

// 指针移动事件
Sprite.pointermove = function (event) {
  const {dragging} = this
  if (dragging.relate(event)) {
    switch (dragging.mode) {
      case 'scroll': {
        const distX = event.clientX - dragging.clientX
        const distY = event.clientY - dragging.clientY
        this.screen.beginScrolling()
        this.screen.setScroll(
          dragging.scrollLeft - distX,
          dragging.scrollTop - distY,
        )
        break
      }
    }
  }
}.bind(Sprite)