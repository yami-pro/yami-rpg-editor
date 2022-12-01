'use strict'

import {
  AutoTile,
  Cursor,
  Data,
  File,
  FrameGenerator,
  Inspector,
  Layout,
  Local,
  Menu,
  Scene,
  TileFrame,
  TileNode,
  Timer,
  TimerManager,
  Window,
  Clipboard
} from '../yami'

// ******************************** 调色板 ********************************

const Palette = {
  // properties
  state: 'closed',
  page: $('#fileTileset'),
  head: $('#palette-head'),
  body: $('#palette-body'),
  window: $('#palette-frame').hide(),
  canvas: $('#palette-canvas'),
  context: null,
  screen: $('#palette-screen'),
  marquee: $('#palette-marquee'),
  symbol: null,
  meta: null,
  tileset: null,
  images: null,
  priorities: null,
  dragging: null,
  explicit: false,
  editing: false,
  scrollable: false,
  showGrid: true,
  activeIndex: null,
  openIndex: null,
  gridColor: null,
  zoom: null,
  zoomTimer: null,
  scale: null,
  scaleX: null,
  scaleY: null,
  scaledTileWidth: null,
  scaledTileHeight: null,
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
  markCanvas: null,
  tilesetMap: {},
  // methods
  initialize: null,
  open: null,
  close: null,
  suspend: null,
  resume: null,
  setZoom: null,
  setImage: null,
  setSize: null,
  setTileSize: null,
  loadImages: null,
  updateHead: null,
  resize: null,
  getTileCoords: null,
  updateCamera: null,
  updateTransform: null,
  updateBackground: null,
  createMarkCanvas: null,
  drawTileset: null,
  drawTiles: null,
  drawTileGrid: null,
  drawPriorities: null,
  editAutoTile: null,
  copyAutoTile: null,
  pasteAutoTile: null,
  deleteAutoTile: null,
  selectTiles: null,
  copyTilesFromScene: null,
  flipTiles: null,
  openSelection: null,
  editSelection: null,
  scrollToSelection: null,
  requestRendering: null,
  renderingFunction: null,
  stopRendering: null,
  skipScrollEvent: null,
  switchScroll: null,
  switchEdit: null,
  saveToProject: null,
  loadFromProject: null,
  // events
  windowResize: null,
  themechange: null,
  headPointerdown: null,
  toolbarPointerdown: null,
  zoomFocus: null,
  zoomInput: null,
  screenKeydown: null,
  screenWheel: null,
  screenUserscroll: null,
  screenBlur: null,
  marqueePointerdown: null,
  marqueePointermove: null,
  marqueePointerleave: null,
  marqueeDoubleclick: null,
  marqueePopup: null,
  pointerup: null,
  pointermove: null,
}

// ******************************** 调色板加载 ********************************

// 初始化
Palette.initialize = function () {
  // 绑定滚动条
  this.screen.addScrollbars()

  // 创建画布上下文
  this.context = this.canvas.getContext('2d', {desynchronized: true})

  // 创建初始图块图像集合
  this.images = {}

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

  // 选框区域自定义组件 - 源选框和目标选框
  const marquee = this.marquee
  const source = document.createElement('selection')
  const destination = document.createElement('selection')
  const selections = {source, destination}
  source.id = 'source-selection'
  destination.id = 'destination-selection'

  // 选框区域自定义方法 - 选择
  marquee.customSelect = function (key, x, y) {
    const selection = selections[key]
    const scaleX = this.scaleX
    const scaleY = this.scaleY
    const realX = x * scaleX
    const realY = y * scaleY
    const realWidth = scaleX
    const realHeight = scaleY
    selection.x = x
    selection.y = y
    if (selection === destination &&
      source.x === x &&
      source.y === y) {
      return selection.remove()
    }
    if (!selection.parentNode) {
      this.appendChild(selection)
    }
    selection.style.left = `${realX}px`
    selection.style.top = `${realY}px`
    selection.style.width = `${realWidth}px`
    selection.style.height = `${realHeight}px`
  }

  // 选框区域自定义方法 - 取消选择
  marquee.customUnselect = function (key) {
    selections[key].remove()
  }

  // 选框区域自定义方法 - 转移自动图块
  marquee.customShiftAutoTile = function () {
    source.remove()
    destination.remove()
    const {x: sx, y: sy} = source
    const {x: dx, y: dy} = destination
    if (sx !== dx || sy !== dy) {
      const tileset = Palette.tileset
      const tiles = tileset.tiles
      const priorities = tileset.priorities
      const ro = tileset.width
      const si = sx + sy * ro
      const di = dx + dy * ro
      if (tiles[si]) {
        if (tiles[di]) {
          const tile = tiles[si]
          const priority = priorities[si]
          tiles[si] = tiles[di]
          priorities[si] = priorities[di]
          tiles[di] = tile
          priorities[di] = priority
        } else {
          tiles[di] = tiles[si]
          priorities[di] = priorities[si]
          tiles[si] = 0
          priorities[si] = 0
        }
      }
    }
  }

  // 侦听事件
  window.on('themechange', this.themechange)
  this.page.on('resize', this.windowResize)
  $('#fileTileset-general-detail').on('toggle', this.windowResize)
  $('#palette-head-start').on('pointerdown', this.toolbarPointerdown)
  $('#palette-zoom').on('focus', this.zoomFocus)
  $('#palette-zoom').on('input', this.zoomInput)
  this.head.on('pointerdown', this.headPointerdown)
  this.screen.on('keydown', this.screenKeydown)
  this.screen.on('wheel', this.screenWheel)
  this.screen.on('userscroll', this.screenUserscroll)
  this.screen.on('blur', this.screenBlur)
  this.marquee.on('pointerdown', this.marqueePointerdown)
  this.marquee.on('doubleclick', this.marqueeDoubleclick)

  // 初始化子对象
  AutoTile.initialize()
  FrameGenerator.initialize()
  TileFrame.initialize()
  TileNode.initialize()
}

// 打开图块组
Palette.open = function (meta) {
  if (!meta || meta === this.meta) {
    return
  }
  this.close()
  const data = Data.tilesets[meta.guid]
  if (data) {
    this.state = 'loading'
    this.meta = meta
    this.tileset = data
    this.loadImages()
  } else {
    Inspector.close('tileset')
    Window.confirm({
      message: `Failed to read file: ${meta.path}`,
    }, [{
      label: 'Confirm',
    }])
  }
}

// 关闭图块组
Palette.close = function () {
  if (this.state !== 'closed') {
    this.state = 'closed'
    this.symbol = null
    this.meta = null
    this.tileset = null
    this.window.hide()
    this.marquee.clear()
    this.stopRendering()
  }
}

// 挂起
Palette.suspend = function () {
  if (this.state === 'open') {
    this.state = 'suspended'
    this.stopRendering()
  }
}

// 继续
Palette.resume = function () {
  if (this.state === 'suspended') {
    this.state = 'open'
    this.resize()
    this.requestRendering()
  }
}

// 设置缩放
Palette.setZoom = function IIFE() {
  const slider = $('#palette-zoom')
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

// 设置图块组图像
Palette.setImage = function (image) {
  this.tileset.image = image
  this.loadImages()
}

// 设置图块组大小
Palette.setSize = function (width, height) {
  const tileset = this.tileset
  switch (tileset.type) {
    case 'normal': {
      const dPriorities = new Array(width * height).fill(0)
      const dro = width
      const sPriorities = tileset.priorities
      const sro = tileset.width
      const ex = Math.min(width, tileset.width)
      const ey = Math.min(height, tileset.height)
      for (let y = 0; y < ey; y++) {
        for (let x = 0; x < ex; x++) {
          const di = x + y * dro
          const si = x + y * sro
          dPriorities[di] = sPriorities[si]
        }
      }
      tileset.width = width
      tileset.height = height
      tileset.priorities = dPriorities
      break
    }
    case 'auto': {
      const dTiles = new Array(width * height).fill(0)
      const dPriorities = new Array(width * height).fill(0)
      const dro = width
      const sTiles = tileset.tiles
      const sPriorities = tileset.priorities
      const sro = tileset.width
      const ex = Math.min(width, tileset.width)
      const ey = Math.min(height, tileset.height)
      for (let y = 0; y < ey; y++) {
        for (let x = 0; x < ex; x++) {
          const di = x + y * dro
          const si = x + y * sro
          dTiles[di] = sTiles[si]
          dPriorities[di] = sPriorities[si]
        }
      }
      tileset.width = width
      tileset.height = height
      tileset.tiles = dTiles
      tileset.priorities = dPriorities
      break
    }
  }
  this.resize()
  this.updateCamera()
  this.requestRendering()
}

// 设置图块大小
Palette.setTileSize = function (tileWidth, tileHeight) {
  const tileset = this.tileset
  tileset.tileWidth = tileWidth
  tileset.tileHeight = tileHeight
  this.resize()
  this.updateCamera()
  this.requestRendering()
}

// 加载图块组图像
Palette.loadImages = async function () {
  const last = this.images
  const images = {'': null}
  const promises = []
  const tileset = this.tileset
  switch (tileset.type) {
    case 'normal': {
      const guid = tileset.image
      if (images[guid] === undefined) {
        if (last[guid] instanceof Image) {
          images[guid] = last[guid]
        } else {
          const symbol = images[guid] = Symbol()
          promises.push(File.get({
            guid: guid,
            type: 'image',
          }).then(image => {
            if (images[guid] === symbol) {
              images[guid] = image
            }
          }))
        }
      }
      break
    }
    case 'auto': {
      const tiles = tileset.tiles
      const length = tiles.length
      for (let i = 0; i < length; i++) {
        const tile = tiles[i]
        if (tile !== 0) {
          const guid = tile.image
          if (images[guid] === undefined) {
            if (last[guid] instanceof Image) {
              images[guid] = last[guid]
            } else {
              const symbol = images[guid] = Symbol()
              promises.push(File.get({
                guid: guid,
                type: 'image',
              }).then(image => {
                if (images[guid] === symbol) {
                  images[guid] = image
                }
              }))
            }
          }
        }
      }
      break
    }
  }
  this.images = images
  const symbol = this.symbol = Symbol()
  if (promises.length > 0) {
    await Promise.all(promises)
  }
  if (this.symbol === symbol) {
    this.symbol = null
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

// 更新头部位置
Palette.updateHead = function () {
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

// 调整大小
Palette.resize = function () {
  if (this.state === 'open') {
    const tileset = this.tileset
    const scale = this.scale
    const scaledTileWidth = Math.round(tileset.tileWidth * scale)
    const scaledTileHeight = Math.round(tileset.tileHeight * scale)
    const innerWidth = tileset.width * scaledTileWidth
    const innerHeight = tileset.height * scaledTileHeight
    const screenBox = CSS.getDevicePixelContentBoxSize(this.screen)
    const screenWidth = screenBox.width
    const screenHeight = screenBox.height
    const paddingLeft = Math.max(screenWidth - innerWidth >> 1, 0)
    const paddingTop = Math.max(screenHeight - innerHeight >> 1, 0)
    const outerWidth = Math.max(innerWidth, screenWidth)
    const outerHeight = Math.max(innerHeight, screenHeight)
    const dpr = window.devicePixelRatio
    this.scaleX = scaledTileWidth / tileset.tileWidth
    this.scaleY = scaledTileHeight / tileset.tileHeight
    this.scaledTileWidth = scaledTileWidth
    this.scaledTileHeight = scaledTileHeight
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
    this.marquee.scaleX = scaledTileWidth / dpr
    this.marquee.scaleY = scaledTileHeight / dpr
    this.marquee.visible && !this.editing &&
    this.marquee.select()

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
      // this.context.imageSmoothingEnabled = scale < 1
      this.context.textAlign = 'center'
      this.context.textBaseline = 'middle'
    }
    this.context.font = `${Math.min(
      scaledTileWidth >> 1,
      scaledTileHeight >> 1,
    )}px sans-serif`
    this.updateCamera()
    this.updateTransform()
    this.skipScrollEvent()
    this.screen.updateScrollbars()
  }
}

// 获取图块坐标
Palette.getTileCoords = function IIFE() {
  const point = {x: 0, y: 0}
  return function (event, clamp = false) {
    const coords = event.getRelativeCoords(this.marquee)
    const tileset = this.tileset
    const stw = this.scaledTileWidth
    const sth = this.scaledTileHeight
    const dpr = window.devicePixelRatio
    let x = Math.floor(coords.x * dpr / stw)
    let y = Math.floor(coords.y * dpr / sth)
    if (clamp) {
      x = Math.clamp(x, 0, tileset.width - 1)
      y = Math.clamp(y, 0, tileset.height - 1)
    }
    point.x = x
    point.y = y
    return point
  }
}()

// 更新摄像机位置
Palette.updateCamera = function (x = this.meta.x, y = this.meta.y) {
  const dpr = window.devicePixelRatio
  const screen = this.screen
  const scrollX = x * this.scaledTileWidth + this.paddingLeft
  const scrollY = y * this.scaledTileHeight + this.paddingTop
  const toleranceX = this.scaledTileWidth * 0.0001
  const toleranceY = this.scaledTileHeight * 0.0001
  screen.rawScrollLeft = Math.clamp(scrollX - this.centerOffsetX, 0, this.outerWidth - this.screenWidth) / dpr
  screen.rawScrollTop = Math.clamp(scrollY - this.centerOffsetY, 0, this.outerHeight - this.screenHeight) / dpr
  screen.scrollLeft = (scrollX - (this.screenWidth >> 1) + toleranceX) / dpr
  screen.scrollTop = (scrollY - (this.screenHeight >> 1) + toleranceY) / dpr
}

// 更新变换参数
// 这里获取的是canvas的边框参数
Palette.updateTransform = function () {
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
  this.meta.x = Math.roundTo((scrollX - this.paddingLeft) / this.scaledTileWidth, 4)
  this.meta.y = Math.roundTo((scrollY - this.paddingTop) / this.scaledTileHeight, 4)
  Data.manifest.changed = true
}

// 更新背景图像
// 保持图像与网格背景的相对位置
// 避免视觉干扰并且可以测量位置
Palette.updateBackground = function () {
  const style = this.canvas.style
  const x = -this.screen.scrollLeft
  const y = -this.screen.scrollTop
  if (style.backgroundX !== x ||
    style.backgroundY !== y) {
    style.backgroundX = x
    style.backgroundY = y
    style.backgroundPosition = `${x}px ${y}px`
  }
}

// 创建标记画布
Palette.createMarkCanvas = function () {
  let canvas = this.markCanvas
  if (canvas === null) {
    const size = 128
    canvas = document.createElement('canvas')
    canvas.width = 0
    canvas.height = size * 3
    canvas.fontSize = size
    const positions = canvas.positions = {}
    const context = canvas.getContext('2d')
    const font = `${size}px sans-serif`
    context.font = font

    // 计算优先级标记位置
    let start = 0
    for (let i = 0; i < 10; i++) {
      const text = i === 0 ? '▪' : i.toString()
      const width = Math.ceil(context.measureText(text).width)
      const aspectRatio = width / size
      positions[i] = {text, start, width, aspectRatio}
      start += width
    }

    // 计算添加标记位置
    const width = Math.ceil(context.measureText('+').width)
    positions.add = {
      text: '+',
      start: start,
      width: width,
      aspectRatio: width / size,
    }
    start += width

    // 设置画布宽度并绘制内容
    canvas.width = start
    context.font = font
    context.textAlign = 'center'
    context.textBaseline = 'middle'
    context.shadowColor = '#000000'
    context.shadowBlur = size / 32
    context.shadowOffsetY = size / 32
    for (const position of Object.values(positions)) {
      const {text, start, width} = position
      const x = start + width / 2
      context.fillStyle = '#ffffff'
      context.fillText(text, x, size * 0.5)
      context.fillStyle = '#ffd700'
      context.fillText(text, x, size * 1.5)
      context.fillStyle = '#00ff00'
      context.fillText(text, x, size * 2.5)
    }
    this.markCanvas = canvas
    // canvas.style.display = 'block'
    // canvas.style.position = 'fixed'
    // document.body.appendChild(canvas)
  }
  return canvas
}

// 绘制图块组
Palette.drawTileset = function () {
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
    this.drawTiles()
    this.drawTileGrid()
    this.drawPriorities()
  }
}

// 绘制图块
Palette.drawTiles = function () {
  const context = this.context
  const tileset = this.tileset
  const images = this.images
  context.imageSmoothingEnabled = this.scale < 1
  switch (tileset.type) {
    case 'normal': {
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
      const image = images[tileset.image]
      if (image instanceof Image) {
        context.drawImage(image, sx, sy, sw, sh, dx, dy, dw, dh)
      } else if (image === undefined) {
        const guid = tileset.image
        const symbol = images[guid] = Symbol()
        File.get({
          guid: guid,
          type: 'image',
        }).then(image => {
          if (images[guid] === symbol) {
            images[guid] = image
            this.requestRendering()
          }
        })
      }
      break
    }
    case 'auto': {
      const templates = Data.autotiles.map
      const tiles = tileset.tiles
      const tro = tileset.width
      const tw = tileset.tileWidth
      const th = tileset.tileHeight
      const stw = this.scaledTileWidth
      const sth = this.scaledTileHeight
      const sl = this.scrollLeft
      const st = this.scrollTop
      const sr = this.scrollRight
      const sb = this.scrollBottom
      const bx = Math.max(Math.floor(sl / stw), 0)
      const by = Math.max(Math.floor(st / sth), 0)
      const ex = Math.min(Math.ceil(sr / stw), tileset.width)
      const ey = Math.min(Math.ceil(sb / sth), tileset.height)
      for (let y = by; y < ey; y++) {
        for (let x = bx; x < ex; x++) {
          const i = x + y * tro
          const tile = tiles[i]
          if (tile !== 0) {
            const template = templates[tile.template]
            const image = images[tile.image]
            if (template !== undefined && image instanceof Image) {
              const node = template.nodes[template.cover]
              if (node === undefined) continue
              const frame = node.frames[0]
              const sx = (tile.x + (frame & 0xff)) * tw
              const sy = (tile.y + (frame >> 8)) * th
              const dx = x * stw
              const dy = y * sth
              context.drawImage(image, sx, sy, tw, th, dx, dy, stw, sth)
            } else if (image === undefined) {
              const guid = tile.image
              const symbol = images[guid] = Symbol()
              File.get({
                guid: guid,
                type: 'image',
              }).then(image => {
                if (images[guid] === symbol) {
                  images[guid] = image
                  this.requestRendering()
                }
              })
            }
          }
        }
      }
      break
    }
  }
}

// 绘制图块网格
Palette.drawTileGrid = function () {
  if (this.showGrid) {
    const context = this.context
    const sl = this.scrollLeft
    const st = this.scrollTop
    const sr = this.scrollRight
    const sb = this.scrollBottom
    const tw = this.scaledTileWidth
    const th = this.scaledTileHeight
    const bx = Math.floor(sl / tw + 1) * tw
    const by = Math.floor(st / th + 1) * th
    const ex = Math.ceil(sr / tw) * tw
    const ey = Math.ceil(sb / th) * th
    context.beginPath()
    for (let y = by; y < ey; y += th) {
      context.moveTo(sl, y + 0.5)
      context.lineTo(sr, y + 0.5)
    }
    for (let x = bx; x < ex; x += tw) {
      context.moveTo(x + 0.5, st)
      context.lineTo(x + 0.5, sb)
    }
    context.lineWidth = 1
    context.strokeStyle = this.gridColor
    context.stroke()
  }
}

// 绘制优先级
Palette.drawPriorities = function (event) {
  if (this.editing) {
    const context = this.context
    const tileset = this.tileset
    const priorities = tileset.priorities
    const tro = tileset.width
    const sl = this.scrollLeft
    const st = this.scrollTop
    const sr = this.scrollRight
    const sb = this.scrollBottom
    const tw = this.scaledTileWidth
    const th = this.scaledTileHeight
    const ts = Math.min(tw, th)
    if (ts < 16) return
    const bx = Math.max(Math.floor(sl / tw), 0)
    const by = Math.max(Math.floor(st / th), 0)
    const ex = Math.min(Math.ceil(sr / tw), tileset.width)
    const ey = Math.min(Math.ceil(sb / th), tileset.height)
    const dragging = this.dragging
    const mark = this.createMarkCanvas()
    const positions = mark.positions
    const height = mark.fontSize
    const fs = ts / 2
    const oy = fs / 2
    let activeIndex
    let activeOffset
    switch (dragging?.mode) {
      case 'switch':
      case 'ready-to-shift':
      case 'shift':
        if (dragging.active) {
          activeIndex = dragging.startIndex
          activeOffset = height * 2
        }
        break
      default:
        activeIndex = this.activeIndex
        activeOffset = height
        break
    }
    context.imageSmoothingEnabled = fs < height
    switch (tileset.type) {
      case 'normal':
        for (let y = by; y < ey; y++) {
          for (let x = bx; x < ex; x++) {
            const i = x + y * tro
            const position = positions[priorities[i]]
            const {start, width, aspectRatio} = position
            const dw = fs * aspectRatio
            const dx = (x + 0.5) * tw - dw / 2
            const dy = (y + 0.5) * th - oy
            const sy = i === activeIndex ? activeOffset : 0
            context.drawImage(mark, start, sy, width, height, dx, dy, dw, fs)
          }
        }
        break
      case 'auto': {
        const tiles = tileset.tiles
        for (let y = by; y < ey; y++) {
          for (let x = bx; x < ex; x++) {
            const i = x + y * tro
            const tile = tiles[i]
            const key = tile === 0 ? 'add' : priorities[i]
            const position = positions[key]
            const {start, width, aspectRatio} = position
            const dw = fs * aspectRatio
            const dx = (x + 0.5) * tw - dw / 2
            const dy = (y + 0.5) * th - oy
            const sy = i === activeIndex ? activeOffset : 0
            context.drawImage(mark, start, sy, width, height, dx, dy, dw, fs)
          }
        }
        break
      }
    }
  }
}

// 编辑自动图块
Palette.editAutoTile = function (index) {
  if (this.tileset.type === 'auto') {
    const tiles = this.tileset.tiles
    if (index < tiles.length) {
      const tile = tiles[index]
      this.openIndex = index
      AutoTile.open(tile || AutoTile.create())
    }
  }
}

// 复制自动图块
Palette.copyAutoTile = function (index) {
  if (this.tileset.type === 'auto') {
    const tileset = this.tileset
    const tiles = tileset.tiles
    const priorities = tileset.priorities
    if (tiles[index]) {
      Clipboard.write('yami.tile', {
        tile: tiles[index],
        priority: priorities[index],
      })
    }
  }
}

// 粘贴自动图块
Palette.pasteAutoTile = function (index) {
  if (this.tileset.type === 'auto') {
    const tileset = this.tileset
    const tiles = tileset.tiles
    const priorities = tileset.priorities
    const copy = Clipboard.read('yami.tile')
    if (copy && index < tiles.length) {
      tiles[index] = copy.tile
      priorities[index] = copy.priority
      this.requestRendering()
      File.planToSave(this.meta)
    }
  }
}

// 删除自动图块
Palette.deleteAutoTile = function (index) {
  if (this.tileset.type === 'auto') {
    const tileset = this.tileset
    const tiles = tileset.tiles
    const priorities = tileset.priorities
    if (tiles[index]) {
      tiles[index] = 0
      priorities[index] = 0
      this.requestRendering()
      File.planToSave(this.meta)
    }
  }
}

// 选择图块
Palette.selectTiles = function (x, y, width, height) {
  // 修正笔刷
  if (Scene.brush === 'eraser') {
    Scene.switchBrush('pencil')
  }

  // 设置图块参数
  const tileset = this.tileset
  const sro = tileset.width
  const dTiles = Scene.createTiles(width, height)
  const dro = dTiles.rowOffset
  const bx = x
  const by = y
  const ex = x + width
  const ey = y + height
  switch (tileset.type) {
    case 'normal':
      for (let y = by; y < ey; y++) {
        for (let x = bx; x < ex; x++) {
          const di = (x - bx) + (y - by) * dro
          dTiles[di] = 1 << 24 | y << 16 | x << 8
        }
      }
      break
    case 'auto': {
      const sTiles = tileset.tiles
      for (let y = by; y < ey; y++) {
        for (let x = bx; x < ex; x++) {
          const si = x + y * sro
          if (sTiles[si] !== 0) {
            const di = (x - bx) + (y - by) * dro
            dTiles[di] = 1 << 24 | y << 16 | x << 8
          }
        }
      }
      break
    }
  }

  // 设置相关属性
  if (this.explicit) {
    this.explicit = false
    this.marquee.removeClass('explicit')
  }

  // 设置场景选框的图块组映射表
  Scene.marquee.tilesetMap = this.tilesetMap
  Scene.marquee.tilesetMap[1] = this.meta.guid

  // 更新场景选框
  const marquee = (
    Scene.marquee.key === 'tile'
  ? Scene.marquee
  : Scene.marquee.saveData.tile
  )
  marquee.tiles = dTiles
  marquee.width = width
  marquee.height = height
  marquee.offsetX = 0
  marquee.offsetY = 0

  // 引用自身作为标准图块
  dTiles.standard = dTiles
}

// 从场景中复制图块
Palette.copyTilesFromScene = function (x, y, width, height) {
  const sTiles = Scene.tilemap.tiles
  const sro = sTiles.rowOffset
  const dTiles = Scene.createTiles(width, height)
  const dro = dTiles.rowOffset
  const bx = x
  const by = y
  const ex = x + width
  const ey = y + height

  // 设置相关属性
  if (this.explicit) {
    this.explicit = false
    this.marquee.removeClass('explicit')
  }

  // 设置场景选框的图块组映射表
  Scene.marquee.tilesetMap = Scene.tilemap.tilesetMap

  // 更新选框图块
  const marquee = (
    Scene.marquee.key === 'tile'
  ? Scene.marquee
  : Scene.marquee.saveData.tile
  )
  marquee.tiles = dTiles

  // 设置图块属性
  for (let y = by; y < ey; y++) {
    for (let x = bx; x < ex; x++) {
      const si = x + y * sro
      const di = (x - bx) + (y - by) * dro
      dTiles[di] = sTiles[si]
    }
  }

  this.marquee.clear()
}

// 翻转选框图块
Palette.flipTiles = function () {
  const marquee = Scene.marquee
  if (Scene.state !== 'open' ||
    Scene.dragging !== null ||
    marquee.key !== 'tile') {
    return
  }
  if (marquee.visible) {
    Scene.requestRendering()
  }
  const tilesetMap = marquee.tilesetMap
  const tilesets = Data.tilesets
  const sTiles = marquee.tiles
  const width = sTiles.width
  const height = sTiles.height
  const sro = sTiles.rowOffset
  const dTiles = Scene.createTiles(width, height)
  const dro = dTiles.rowOffset
  const rx = width - 1
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const si = x + y * sro
      let tile = sTiles[si]
      if (tile !== 0) {
        const di = rx - x + y * dro
        const guid = tilesetMap[tile >> 24]
        const tileset = tilesets[guid]
        if (tileset !== undefined &&
          tileset.type === 'normal') {
          tile ^= 1
        }
        dTiles[di] = tile
      }
    }
  }
  marquee.tiles = dTiles
  // 如果图块已经是标准化的
  // 则引用自身作为标准图块
  if (sTiles === sTiles.standard) {
    const {tiles} = marquee
    tiles.standard = tiles
  }
}

// 打开选中的图块
Palette.openSelection = function () {
  const {tileset, marquee} = this
  if (tileset.type === 'auto' && marquee.visible) {
    const {x, y, width, height} = marquee
    const i = x + y * tileset.width
    const tile = tileset.tiles[i]
    if (tile !== 0) {
      const template = Data.autotiles.map[tile.template]
      const image = this.images[tile.image]
      if (width === 1 &&
        height === 1 &&
        template !== undefined &&
        image instanceof Image) {
        TileNode.open(template.nodes, image, tile.x, tile.y)
      }
    }
  }
}

// 编辑选中的图块
Palette.editSelection = function () {
  const {tileset, marquee} = this
  if (tileset.type === 'auto' && marquee.visible) {
    const {x, y, width, height} = marquee
    const i = x + y * tileset.width
    if (width === 1 &&
      height === 1 &&
      i < tileset.tiles.length) {
      Palette.editAutoTile(i)
    }
  }
}

// 滚动到选中位置
Palette.scrollToSelection = function (shiftKey) {
  const marquee = this.marquee
  if (marquee.visible) {
    const stw = this.scaledTileWidth
    const sth = this.scaledTileHeight
    const mx = marquee.x
    const my = marquee.y
    const mw = marquee.width
    const mh = marquee.height
    const ox = marquee.originX
    const oy = marquee.originY
    const mr = mx + mw
    const mb = my + mh
    const wh = this.screenWidth / stw / 2
    const hh = this.screenHeight / sth / 2
    const toleranceX = 0.5 / stw
    const toleranceY = 0.5 / sth
    const x1 = mr - wh + toleranceX
    const x2 = mx + wh - toleranceX
    const y1 = mb - hh + toleranceY
    const y2 = my + hh - toleranceY
    const meta = this.meta
    const x = shiftKey && mx === ox && mw > 1
    ? Math.max(Math.min(meta.x, x2), x1)
    : Math.min(Math.max(meta.x, x1), x2)
    const y = shiftKey && my === oy && mh > 1
    ? Math.max(Math.min(meta.y, y2), y1)
    : Math.min(Math.max(meta.y, y1), y2)
    if (meta.x !== x || meta.y !== y) {
      this.updateCamera(x, y)
      this.updateTransform()
      this.requestRendering()
      this.screen.updateScrollbars()
    }
  }
}

// 请求渲染
Palette.requestRendering = function () {
  if (this.state === 'open') {
    TimerManager.appendUpdater('sharedRendering', this.renderingFunction)
  }
}

// 渲染函数
Palette.renderingFunction = function () {
  Palette.drawTileset()
}

// 停止渲染
Palette.stopRendering = function () {
  TimerManager.removeUpdater('sharedRendering', this.renderingFunction)
}

// 跳过滚动事件
Palette.skipScrollEvent = function IIFE() {
  const screen = Palette.screen
  const restore = () => {
    if (Palette.scrollable) {
      screen.on('scroll', Palette.screenUserscroll)
    }
  }
  const restoreDelay = () => {
    requestAnimationFrame(restore)
  }
  return () => {
    if (Palette.scrollable) {
      screen.off('scroll', Palette.screenUserscroll)
      // 触发resize事件时需要延迟一帧恢复
      // 在动画队列中调用此方法就不需要了
      window.event?.type === 'resize'
      ? requestAnimationFrame(restoreDelay)
      : requestAnimationFrame(restore)
    }
  }
}()

// 开关滚动
Palette.switchScroll = function IIFE() {
  const item = $('#palette-scroll')
  return function (enabled = !this.scrollable) {
    if (enabled) {
      item.addClass('selected')
      this.screen.addClass('scrollable')
      this.screen.on('scroll', this.screenUserscroll)
      this.screen.off('userscroll', this.screenUserscroll)
    } else {
      item.removeClass('selected')
      this.screen.removeClass('scrollable')
      this.screen.off('scroll', this.screenUserscroll)
      this.screen.on('userscroll', this.screenUserscroll)
    }
    this.scrollable = enabled
  }
}()

// 开关编辑
Palette.switchEdit = function IIFE() {
  const item = $('#palette-edit')
  return function (enabled = !this.editing) {
    if (enabled) {
      item.addClass('selected')
      this.marquee.visible &&
      this.marquee.selection.hide()
      this.marquee.off('doubleclick', this.marqueeDoubleclick)
      this.marquee.on('pointermove', this.marqueePointermove)
      this.marquee.on('pointerleave', this.marqueePointerleave)
    } else {
      item.removeClass('selected')
      this.marquee.visible &&
      this.marquee.selection.show()
      this.marquee.off('pointermove', this.marqueePointermove)
      this.marquee.off('pointerleave', this.marqueePointerleave)
      this.marquee.on('doubleclick', this.marqueeDoubleclick)
    }
    this.editing = enabled
    this.requestRendering()
  }
}()

// 保存状态到项目文件
Palette.saveToProject = function (project) {
  const {palette} = project
  const zoom = this.zoom
  if (zoom !== null) {
    palette.zoom = zoom
  }
}

// 从项目文件中加载状态
Palette.loadFromProject = function (project) {
  const {palette} = project
  this.setZoom(palette.zoom)
}

// 窗口 - 调整大小事件
Palette.windowResize = function (event) {
  // 检查器页面不可见时挂起
  if (this.body.clientWidth === 0) {
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
}.bind(Palette)

// 主题改变事件
Palette.themechange = function (event) {
  switch (event.value) {
    case 'light':
      this.gridColor = 'rgba(0, 0, 0, 0.5)'
      break
    case 'dark':
      this.gridColor = 'rgba(255, 255, 255, 0.5)'
      break
  }
  this.requestRendering()
}.bind(Palette)

// 头部 - 指针按下事件
Palette.headPointerdown = function (event) {
  if (!(event.target instanceof HTMLInputElement)) {
    event.preventDefault()
    if (document.activeElement !== Palette.screen) {
      Palette.screen.focus()
    }
  }
}

// 工具栏 - 指针按下事件
Palette.toolbarPointerdown = function (event) {
  switch (event.button) {
    case 0: {
      const element = event.target
      if (element.tagName === 'ITEM') {
        switch (element.getAttribute('value')) {
          case 'scroll':
            return Palette.switchScroll()
          case 'edit':
            return Palette.switchEdit()
          case 'flip':
            return Palette.flipTiles()
        }
      }
      break
    }
  }
}

// 缩放 - 获得焦点事件
Palette.zoomFocus = function (event) {
  Palette.screen.focus()
}

// 缩放 - 输入事件
Palette.zoomInput = function (event) {
  Palette.setZoom(this.read())
}

// 屏幕 - 键盘按下事件
Palette.screenKeydown = function (event) {
  switch (event.code) {
    case 'Space':
      // 阻止默认的下滚行为
      event.preventDefault()
      break
  }
  if (Palette.state === 'open' &&
    Palette.dragging === null) {
    switch (event.code) {
      case 'Enter':
      case 'NumpadEnter': {
        event.stopPropagation()
        if (event.cmdOrCtrlKey) {
          Palette.editSelection()
        } else {
          Palette.openSelection()
        }
        break
      }
      case 'ArrowLeft':
      case 'ArrowUp':
      case 'ArrowRight':
      case 'ArrowDown': {
        event.preventDefault()
        const marquee = Palette.marquee
        if (!marquee.visible) return
        const tileset = Palette.tileset
        const hframes = tileset.width
        const vframes = tileset.height
        let mx = marquee.x
        let my = marquee.y
        let mw = marquee.width
        let mh = marquee.height
        // 调整选框大小
        if (event.shiftKey) {
          const ox = marquee.originX
          const oy = marquee.originY
          switch (event.code) {
            case 'ArrowLeft':
              if (mx === ox && mw > 1) {
                mw--
              } else {
                mx--
                mw++
              }
              break
            case 'ArrowRight':
              if (mx === ox) {
                mw++
              } else {
                mx++
                mw--
              }
              break
            case 'ArrowUp':
              if (my === oy && mh > 1) {
                mh--
              } else {
                my--
                mh++
              }
              break
            case 'ArrowDown':
              if (my === oy) {
                mh++
              } else {
                my++
                mh--
              }
              break
          }
          if (mx >= 0 && mx + mw <= hframes &&
            my >= 0 && my + mh <= vframes) {
            marquee.select(mx, my, mw, mh)
            Palette.selectTiles(mx, my, mw, mh)
            Palette.scrollToSelection(true)
            Scene.requestRendering()
          }
          return
        }
        // 移动选框
        let offsetX = 0
        let offsetY = 0
        switch (event.code) {
          case 'ArrowLeft':  offsetX = -1; break
          case 'ArrowUp':    offsetY = -1; break
          case 'ArrowRight': offsetX = +1; break
          case 'ArrowDown':  offsetY = +1; break
        }
        const x = Math.clamp(mx + offsetX, 0, hframes - mw)
        const y = Math.clamp(my + offsetY, 0, vframes - mh)
        if (mx !== x || my !== y) {
          marquee.select(x, y, mw, mh)
          marquee.originX += x - mx
          marquee.originY += y - my
          Palette.selectTiles(x, y, mw, mh)
          Palette.scrollToSelection(false)
          Scene.requestRendering()
        }
        break
      }
      case 'Minus':
      case 'NumpadSubtract':
        Palette.setZoom(Palette.zoom - 1)
        break
      case 'Equal':
      case 'NumpadAdd':
        Palette.setZoom(Palette.zoom + 1)
        break
      case 'Digit0':
      case 'Numpad0':
        Palette.setZoom(2)
        break
    }
  }
}

// 屏幕 - 鼠标滚轮事件
Palette.screenWheel = function IIFE() {
  let timerIsWorking = false
  const timer = new Timer({
    duration: 400,
    callback: timer => {
      timerIsWorking = false
      Palette.screen.endScrolling()
    }
  })
  return function (event) {
    if (this.scrollable) {
      timer.elapsed = 0
      if (!timerIsWorking) {
        timerIsWorking = true
        timer.add()
        this.screen.beginScrolling()
      }
    } else {
      event.preventDefault()
      if (event.deltaY !== 0 &&
        this.dragging === null) {
        this.setZoom(this.zoom + (event.deltaY > 0 ? -1 : 1))
      }
    }
  }.bind(Palette)
}()

// 屏幕 - 用户滚动事件
Palette.screenUserscroll = function (event) {
  if (this.state === 'open') {
    this.screen.rawScrollLeft = this.screen.scrollLeft
    this.screen.rawScrollTop = this.screen.scrollTop
    this.updateTransform()
    this.updateBackground()
    this.requestRendering()
    this.screen.updateScrollbars()
  }
}.bind(Palette)

// 屏幕 - 失去焦点事件
Palette.screenBlur = function (event) {
  if (this.dragging) {
    this.pointerup(this.dragging)
  }
}.bind(Palette)

// 选框 - 指针按下事件
Palette.marqueePointerdown = function (event) {
  if (this.dragging) {
    return
  }
  switch (event.button) {
    case 0: {
      // 如果正在修改图块组宽高，让它立即生效
      document.activeElement.blur()
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
      const {x, y} = this.getTileCoords(event, true)
      if (event.cmdOrCtrlKey) {
        const tileset = this.tileset
        if (tileset.type === 'auto') {
          const i = x + y * tileset.width
          this.dragging = event
          event.mode = 'edit'
          event.active = true
          event.startX = x
          event.startY = y
          event.startIndex = i
          this.marqueePointerleave()
          this.marquee.customSelect('source', x, y)
          window.on('pointerup', this.pointerup)
          window.on('pointermove', this.pointermove)
          return
        }
      }
      const {marquee} = this
      if (this.editing) {
        const tileset = this.tileset
        const priorities = tileset.priorities
        const i = x + y * tileset.width
        switch (tileset.type) {
          case 'normal':
            this.dragging = event
            event.mode = 'switch'
            event.active = true
            event.priorities = priorities
            event.startX = x
            event.startY = y
            event.startIndex = i
            this.requestRendering()
            window.on('pointerup', this.pointerup)
            window.on('pointermove', this.pointermove)
            break
          case 'auto': {
            const tiles = tileset.tiles
            if (tiles[i] !== 0) {
              this.dragging = event
              event.mode = 'ready-to-shift'
              event.active = true
              event.tiles = tiles
              event.priorities = priorities
              event.startX = x
              event.startY = y
              event.startIndex = i
              this.requestRendering()
              window.on('pointerup', this.pointerup)
              window.on('pointermove', this.pointermove)
            } else {
              event.preventDefault()
              this.editAutoTile(i)
            }
            break
          }
        }
      } else {
        if (event.shiftKey && marquee.visible) {
          const ox = marquee.originX
          const oy = marquee.originY
          const mx = Math.min(x, ox)
          const my = Math.min(y, oy)
          const mw = Math.abs(x - ox) + 1
          const mh = Math.abs(y - oy) + 1
          marquee.select(mx, my, mw, mh)
        } else {
          marquee.select(x, y, 1, 1)
          marquee.originX = x
          marquee.originY = y
        }
        // 退出指定节点模式
        if (this.explicit) {
          this.explicit = false
          marquee.removeClass('explicit')
        }
        this.dragging = event
        event.mode = 'select'
        window.on('pointerup', this.pointerup)
        window.on('pointermove', this.pointermove)
        this.screen.addScrollListener('both', this.scaleX / 4, false, () => {
          this.screen.beginScrolling()
          this.updateTransform()
          this.requestRendering()
          this.screen.updateScrollbars()
          this.pointermove(event.latest)
        })
        Scene.marquee.style.pointerEvents = 'none'
      }
      break
    }
    case 2:
      if (this.editing) {
        this.dragging = event
        event.mode = 'ready-to-scroll'
        event.scrollLeft = this.screen.scrollLeft
        event.scrollTop = this.screen.scrollTop
        window.on('pointerup', this.pointerup)
        window.on('pointermove', this.pointermove)
      } else {
        this.dragging = event
        event.mode = 'scroll'
        event.scrollLeft = this.screen.scrollLeft
        event.scrollTop = this.screen.scrollTop
        Cursor.open('cursor-grab')
        window.on('pointerup', this.pointerup)
        window.on('pointermove', this.pointermove)
      }
      break
  }
}.bind(Palette)

// 选框 - 指针移动事件
Palette.marqueePointermove = function (event) {
  if (this.dragging === null) {
    const {x, y} = this.getTileCoords(event, true)
    const index = x + y * this.tileset.width
    if (this.activeIndex !== index) {
      this.activeIndex = index
      this.requestRendering()
    }
  }
}.bind(Palette)

// 选框 - 指针离开事件
Palette.marqueePointerleave = function (event) {
  if (this.activeIndex !== null) {
    this.activeIndex = null
    this.requestRendering()
  }
}.bind(Palette)

// 选框 - 鼠标双击事件
Palette.marqueeDoubleclick = function (event) {
  this.openSelection()
}.bind(Palette)

// 选框 - 菜单弹出事件
Palette.marqueePopup = function (event) {
  if (this.editing && this.tileset.type === 'auto') {
    const {x, y} = this.getTileCoords(event, true)
    const tiles = this.tileset.tiles
    const index = x + y * this.tileset.width
    const existing = !!tiles[index]
    const editable = true
    const copyable = existing
    const pastable = Clipboard.has('yami.tile')
    const deletable = existing
    const get = Local.createGetter('menuTileset')
    Menu.popup({
      x: event.clientX,
      y: event.clientY,
      minWidth: 0,
    }, [{
      label: get('edit'),
      enabled: editable,
      click: () => {
        this.editAutoTile(index)
      },
    }, {
      label: get('cut'),
      enabled: copyable,
      click: () => {
        this.copyAutoTile(index)
        this.deleteAutoTile(index)
      },
    }, {
      label: get('copy'),
      enabled: copyable,
      click: () => {
        this.copyAutoTile(index)
      },
    }, {
      label: get('paste'),
      enabled: pastable,
      click: () => {
        this.pasteAutoTile(index)
      },
    }, {
      label: get('delete'),
      enabled: deletable,
      click: () => {
        this.deleteAutoTile(index)
      },
    }])
  }
}

// 指针弹起事件
Palette.pointerup = function (event) {
  const {dragging} = this
  if (dragging.relate(event)) {
    // 打开窗口时触发的blur事件会导致再次执行pointerup
    // 因此提前重置dragging来避免重复执行
    this.dragging = null
    switch (dragging.mode) {
      case 'select': {
        const {x, y, width, height} = this.marquee
        this.selectTiles(x, y, width, height)
        this.screen.endScrolling()
        this.screen.removeScrollListener()
        Scene.marquee.style.pointerEvents = 'inherit'
        break
      }
      case 'ready-to-scroll':
        if (event.target === this.marquee) {
          this.marqueePopup(event)
        }
        break
      case 'scroll':
        this.screen.endScrolling()
        Cursor.close('cursor-grab')
        break
      case 'edit':
        if (dragging.active) {
          this.marquee.customUnselect('source')
          this.editAutoTile(dragging.startIndex)
        }
        break
      case 'switch':
      case 'ready-to-shift':
        if (dragging.active) {
          const {priorities} = dragging
          const i = dragging.startIndex
          const step = event.shiftKey ? 9 : 1
          priorities[i] = (priorities[i] + step) % 10
          this.requestRendering()
          Scene.requestRendering()
          File.planToSave(this.meta)
        }
        break
      case 'shift':
        this.marquee.customShiftAutoTile()
        this.screen.endScrolling()
        this.screen.removeScrollListener()
        this.requestRendering()
        Scene.requestRendering()
        Scene.marquee.style.pointerEvents = 'inherit'
        File.planToSave(this.meta)
        break
    }
    window.off('pointerup', this.pointerup)
    window.off('pointermove', this.pointermove)
  }
}.bind(Palette)

// 指针移动事件
Palette.pointermove = function (event) {
  const {dragging} = this
  if (dragging.relate(event)) {
    switch (dragging.mode) {
      case 'select': {
        dragging.latest = event
        const marquee = this.marquee
        const coords = this.getTileCoords(event, true)
        const x = Math.min(coords.x, marquee.originX)
        const y = Math.min(coords.y, marquee.originY)
        const width = Math.abs(coords.x - marquee.originX) + 1
        const height = Math.abs(coords.y - marquee.originY) + 1
        if (marquee.x !== x ||
          marquee.y !== y ||
          marquee.width !== width ||
          marquee.height !== height) {
          marquee.select(x, y, width, height)
        }
        break
      }
      case 'ready-to-scroll': {
        const distX = event.clientX - dragging.clientX
        const distY = event.clientY - dragging.clientY
        this.screen.setScroll(
          dragging.scrollLeft - distX,
          dragging.scrollTop - distY,
        )
        if (Math.sqrt(distX ** 2 + distY ** 2) > 4) {
          dragging.mode = 'scroll'
          Cursor.open('cursor-grab')
        }
        break
      }
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
      case 'edit': {
        const sx = dragging.startX
        const sy = dragging.startY
        const {x, y} = this.getTileCoords(event)
        const active = sx === x && sy === y
        if (dragging.active !== active) {
          (dragging.active = active)
          ? this.marquee.customSelect('source')
          : this.marquee.customUnselect('source')
        }
        break
      }
      case 'switch': {
        const sx = dragging.startX
        const sy = dragging.startY
        const {x, y} = this.getTileCoords(event)
        const active = sx === x && sy === y
        if (dragging.active !== active) {
          dragging.active = active
          this.requestRendering()
        }
        break
      }
      case 'ready-to-shift': {
        const distX = event.clientX - dragging.clientX
        const distY = event.clientY - dragging.clientY
        if (Math.sqrt(distX ** 2 + distY ** 2) > 4) {
          dragging.mode = 'shift'
          dragging.active = false
          const x = dragging.startX
          const y = dragging.startY
          this.requestRendering()
          this.marquee.customSelect('source', x, y)
          this.marquee.customSelect('destination', x, y)
          this.screen.addScrollListener('both', this.scaleX / 4, false, () => {
            this.screen.beginScrolling()
            this.updateTransform()
            this.requestRendering()
            this.screen.updateScrollbars()
            this.pointermove(dragging.latest)
          })
          Scene.marquee.style.pointerEvents = 'none'
        }
        break
      }
      case 'shift': {
        dragging.latest = event
        const {x, y} = this.getTileCoords(event, true)
        this.marquee.customSelect('destination', x, y)
        break
      }
    }
  }
}.bind(Palette)

// ******************************** 调色板导出 ********************************

export { Palette }
