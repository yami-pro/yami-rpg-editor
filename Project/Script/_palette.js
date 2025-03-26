'use strict'

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
  terrains: null,
  dragging: null,
  explicit: false,
  mode: 'normal',
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
  setTerrain: null,
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
  drawTags: null,
  drawTerrains: null,
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
  switchPriority: null,
  switchTag: null,
  switchTerrain: null,
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
      const terrains = tileset.terrains
      const ro = tileset.width
      const si = sx + sy * ro
      const di = dx + dy * ro
      if (tiles[si]) {
        if (tiles[di]) {
          const tile = tiles[si]
          const priority = priorities[si]
          const terrain = terrains[si]
          tiles[si] = tiles[di]
          priorities[si] = priorities[di]
          terrains[si] = terrains[di]
          tiles[di] = tile
          priorities[di] = priority
          terrains[di] = terrain
        } else {
          tiles[di] = tiles[si]
          priorities[di] = priorities[si]
          terrains[di] = terrains[si]
          tiles[si] = 0
          priorities[si] = 0
          terrains[si] = 0
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
    // 如果在编辑模式中打开普通图块组，则关闭编辑模式
    if (this.mode === 'edit' &&
      data.type === 'normal') {
      this.switchEdit()
    }
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
  const length = width * height
  const tileset = this.tileset
  switch (tileset.type) {
    case 'normal': {
      const dPriorities = new Array(length).fill(0)
      const dTerrains = new Array(length).fill(0)
      const dro = width
      const sPriorities = tileset.priorities
      const sTerrains = tileset.terrains
      const sro = tileset.width
      const ex = Math.min(width, tileset.width)
      const ey = Math.min(height, tileset.height)
      for (let y = 0; y < ey; y++) {
        for (let x = 0; x < ex; x++) {
          const di = x + y * dro
          const si = x + y * sro
          dPriorities[di] = sPriorities[si]
          dTerrains[di] = sTerrains[si]
        }
      }
      tileset.width = width
      tileset.height = height
      tileset.priorities = dPriorities
      tileset.terrains = dTerrains
      break
    }
    case 'auto': {
      const dTiles = new Array(length).fill(0)
      const dPriorities = new Array(length).fill(0)
      const dTerrains = new Array(length).fill(0)
      const dro = width
      const sTiles = tileset.tiles
      const sPriorities = tileset.priorities
      const sTerrains = tileset.terrains
      const sro = tileset.width
      const ex = Math.min(width, tileset.width)
      const ey = Math.min(height, tileset.height)
      for (let y = 0; y < ey; y++) {
        for (let x = 0; x < ex; x++) {
          const di = x + y * dro
          const si = x + y * sro
          dTiles[di] = sTiles[si]
          dPriorities[di] = sPriorities[si]
          dTerrains[di] = sTerrains[si]
        }
      }
      tileset.width = width
      tileset.height = height
      tileset.tiles = dTiles
      tileset.priorities = dPriorities
      tileset.terrains = dTerrains
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

// 设置地形
Palette.setTerrain = function (x, y, offset) {
  const tileset = this.tileset
  const terrains = tileset.terrains
  const i = x + y * tileset.width
  if (tileset.type === 'normal' || tileset.tiles[i] !== 0) {
    terrains[i] = (terrains[i] + 3 + offset) % 3
    this.requestRendering()
    File.planToSave(this.meta)
  }
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
    this.marquee.visible && this.mode === 'normal' &&
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
      const text = i.toString()
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
    this.drawTags()
    this.drawTerrains()
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
Palette.drawPriorities = function () {
  if (this.mode === 'priority') {
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
      case 'increase-priority':
      case 'ready-to-decrease-priority':
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
            const priority = priorities[i]
            if (priority === 0) continue
            const position = positions[priority]
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
            const priority = priorities[i]
            if (tile === 0 || priority === 0) continue
            const position = positions[priority]
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

// 绘制标签
Palette.drawTags = function () {
  if (this.mode === 'tag') {
    const context = this.context
    const tileset = this.tileset
    const tags = tileset.tags
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
      case 'increase-tag':
      case 'ready-to-decrease-tag':
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
            const tag = tags[i]
            if (tag === 0) continue
            const position = positions[tag]
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
            const tag = tags[i]
            if (tile === 0 || tag === 0) continue
            const position = positions[tag]
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

// 绘制地形
Palette.drawTerrains = function () {
  if (this.mode === 'terrain') {
    const context = this.context
    const tileset = this.tileset
    const terrains = tileset.terrains
    const tro = tileset.width
    const sl = this.scrollLeft
    const st = this.scrollTop
    const sr = this.scrollRight
    const sb = this.scrollBottom
    const tw = this.scaledTileWidth
    const th = this.scaledTileHeight
    const bx = Math.max(Math.floor(sl / tw), 0)
    const by = Math.max(Math.floor(st / th), 0)
    const ex = Math.min(Math.ceil(sr / tw), tileset.width)
    const ey = Math.min(Math.ceil(sb / th), tileset.height)
    for (let y = by; y < ey; y++) {
      for (let x = bx; x < ex; x++) {
        const i = x + y * tro
        switch (terrains[i]) {
          case 0:
            continue
          case 1:
            context.fillStyle = 'rgba(0, 0, 255, 0.25)'
            context.fillRect(x * tw, y * th, tw, th)
            continue
          case 2:
            context.fillStyle = 'rgba(255, 0, 0, 0.25)'
            context.fillRect(x * tw, y * th, tw, th)
            continue
        }
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
    const terrains = tileset.terrains
    if (tiles[index]) {
      Clipboard.write('yami.tile', {
        tile: tiles[index],
        priority: priorities[index],
        terrain: terrains[index],
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
    const terrains = tileset.terrains
    const copy = Clipboard.read('yami.tile')
    if (copy && index < tiles.length) {
      tiles[index] = copy.tile
      priorities[index] = copy.priority
      terrains[index] = copy.terrain
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
    const terrains = tileset.terrains
    if (tiles[index]) {
      tiles[index] = 0
      priorities[index] = 0
      terrains[index] = 0
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
    Timer.appendUpdater('sharedRendering', this.renderingFunction)
  }
}

// 渲染函数
Palette.renderingFunction = function () {
  Palette.drawTileset()
}

// 停止渲染
Palette.stopRendering = function () {
  Timer.removeUpdater('sharedRendering', this.renderingFunction)
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

// 开关优先级
Palette.switchPriority = function IIFE() {
  const itemPriority = $('#palette-priority')
  const itemTag = $('#palette-tag')
  const itemTerrain = $('#palette-terrain')
  const itemEdit = $('#palette-edit')
  return function (enabled = this.mode !== 'priority') {
    if (enabled) {
      itemPriority.addClass('selected')
      this.marquee.visible &&
      this.marquee.selection.hide()
      this.marquee.off('doubleclick', this.marqueeDoubleclick)
      this.marquee.on('pointermove', this.marqueePointermove)
      this.marquee.on('pointerleave', this.marqueePointerleave)
    } else {
      itemPriority.removeClass('selected')
      this.marquee.visible &&
      this.marquee.selection.show()
      this.marquee.off('pointermove', this.marqueePointermove)
      this.marquee.off('pointerleave', this.marqueePointerleave)
      this.marquee.on('doubleclick', this.marqueeDoubleclick)
    }
    itemTag.removeClass('selected')
    itemTerrain.removeClass('selected')
    itemEdit.removeClass('selected')
    this.mode = enabled ? 'priority': 'normal'
    this.requestRendering()
  }
}()

// 开关标签
Palette.switchTag = function IIFE() {
  const itemPriority = $('#palette-priority')
  const itemTag = $('#palette-tag')
  const itemTerrain = $('#palette-terrain')
  const itemEdit = $('#palette-edit')
  return function (enabled = this.mode !== 'tag') {
    if (enabled) {
      itemTag.addClass('selected')
      this.marquee.visible &&
      this.marquee.selection.hide()
      this.marquee.off('doubleclick', this.marqueeDoubleclick)
      this.marquee.on('pointermove', this.marqueePointermove)
      this.marquee.on('pointerleave', this.marqueePointerleave)
    } else {
      itemTag.removeClass('selected')
      this.marquee.visible &&
      this.marquee.selection.show()
      this.marquee.off('pointermove', this.marqueePointermove)
      this.marquee.off('pointerleave', this.marqueePointerleave)
      this.marquee.on('doubleclick', this.marqueeDoubleclick)
    }
    itemPriority.removeClass('selected')
    itemTerrain.removeClass('selected')
    itemEdit.removeClass('selected')
    this.mode = enabled ? 'tag': 'normal'
    this.requestRendering()
  }
}()

// 开关地形
Palette.switchTerrain = function IIFE() {
  const itemPriority = $('#palette-priority')
  const itemTag = $('#palette-tag')
  const itemTerrain = $('#palette-terrain')
  const itemEdit = $('#palette-edit')
  return function (enabled = this.mode !== 'terrain') {
    if (enabled) {
      itemTerrain.addClass('selected')
      this.marquee.visible &&
      this.marquee.selection.hide()
      this.marquee.off('doubleclick', this.marqueeDoubleclick)
      this.marquee.on('pointermove', this.marqueePointermove)
      this.marquee.on('pointerleave', this.marqueePointerleave)
    } else {
      itemTerrain.removeClass('selected')
      this.marquee.visible &&
      this.marquee.selection.show()
      this.marquee.off('pointermove', this.marqueePointermove)
      this.marquee.off('pointerleave', this.marqueePointerleave)
      this.marquee.on('doubleclick', this.marqueeDoubleclick)
    }
    itemPriority.removeClass('selected')
    itemTag.removeClass('selected')
    itemEdit.removeClass('selected')
    this.mode = enabled ? 'terrain': 'normal'
    this.requestRendering()
  }
}()

// 开关编辑
Palette.switchEdit = function IIFE() {
  const itemPriority = $('#palette-priority')
  const itemTag = $('#palette-tag')
  const itemTerrain = $('#palette-terrain')
  const itemEdit = $('#palette-edit')
  return function (enabled = this.mode !== 'edit') {
    if (enabled) {
      itemEdit.addClass('selected')
      this.marquee.visible &&
      this.marquee.selection.hide()
      this.marquee.off('doubleclick', this.marqueeDoubleclick)
      this.marquee.on('pointermove', this.marqueePointermove)
      this.marquee.on('pointerleave', this.marqueePointerleave)
    } else {
      itemEdit.removeClass('selected')
      this.marquee.visible &&
      this.marquee.selection.show()
      this.marquee.off('pointermove', this.marqueePointermove)
      this.marquee.off('pointerleave', this.marqueePointerleave)
      this.marquee.on('doubleclick', this.marqueeDoubleclick)
    }
    itemPriority.removeClass('selected')
    itemTag.removeClass('selected')
    itemTerrain.removeClass('selected')
    this.mode = enabled ? 'edit' : 'normal'
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
          case 'priority':
            return Palette.switchPriority()
          case 'tag':
            return Palette.switchTag()
          case 'terrain':
            return Palette.switchTerrain()
          case 'edit':
            if (Palette.tileset.type === 'auto') {
              return Palette.switchEdit()
            }
            return
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
  const {x, y} = this.getTileCoords(event, true)
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
      switch (this.mode) {
        case 'normal':
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
          break
        case 'priority': {
          const tileset = this.tileset
          const i = x + y * tileset.width
          this.dragging = event
          event.mode = 'increase-priority'
          event.active = true
          event.priorities = tileset.priorities
          event.startX = x
          event.startY = y
          event.startIndex = i
          this.requestRendering()
          window.on('pointerup', this.pointerup)
          window.on('pointermove', this.pointermove)
          break
        }
        case 'tag': {
          const tileset = this.tileset
          const i = x + y * tileset.width
          this.dragging = event
          event.mode = 'increase-tag'
          event.active = true
          event.tags = tileset.tags
          event.startX = x
          event.startY = y
          event.startIndex = i
          this.requestRendering()
          window.on('pointerup', this.pointerup)
          window.on('pointermove', this.pointermove)
          break
        }
        case 'terrain':
          this.setTerrain(x, y, -1)
          // window.on('pointerup', this.pointerup)
          // window.on('pointermove', this.pointermove)
          break
        case 'edit': {
          const tileset = this.tileset
          const i = x + y * tileset.width
          switch (tileset.type) {
            case 'normal':
              break
            case 'auto': {
              const tiles = tileset.tiles
              if (tiles[i] !== 0) {
                this.dragging = event
                event.mode = 'ready-to-shift'
                event.active = true
                event.tiles = tiles
                event.startX = x
                event.startY = y
                event.startIndex = i
                this.requestRendering()
                marquee.customSelect('source', x, y)
                window.on('pointerup', this.pointerup)
                window.on('pointermove', this.pointermove)
              } else {
                event.preventDefault()
                this.editAutoTile(i)
              }
              break
            }
          }
          break
        }
      }
      break
    }
    case 2:
      switch (this.mode) {
        case 'normal':
          this.dragging = event
          event.mode = 'scroll'
          event.scrollLeft = this.screen.scrollLeft
          event.scrollTop = this.screen.scrollTop
          Cursor.open('cursor-grab')
          window.on('pointerup', this.pointerup)
          window.on('pointermove', this.pointermove)
          break
        case 'priority': {
          const tileset = this.tileset
          const i = x + y * tileset.width
          this.dragging = event
          event.mode = 'ready-to-decrease-priority'
          event.active = true
          event.priorities = tileset.priorities
          event.startX = x
          event.startY = y
          event.startIndex = i
          event.scrollLeft = this.screen.scrollLeft
          event.scrollTop = this.screen.scrollTop
          this.requestRendering()
          window.on('pointerup', this.pointerup)
          window.on('pointermove', this.pointermove)
          break
        }
        case 'tag': {
          const tileset = this.tileset
          const i = x + y * tileset.width
          this.dragging = event
          event.mode = 'ready-to-decrease-tag'
          event.active = true
          event.tags = tileset.tags
          event.startX = x
          event.startY = y
          event.startIndex = i
          event.scrollLeft = this.screen.scrollLeft
          event.scrollTop = this.screen.scrollTop
          this.requestRendering()
          window.on('pointerup', this.pointerup)
          window.on('pointermove', this.pointermove)
          break
        }
        case 'terrain':
          this.dragging = event
          event.mode = 'ready-to-increase-terrain'
          event.active = true
          event.startX = x
          event.startY = y
          event.scrollLeft = this.screen.scrollLeft
          event.scrollTop = this.screen.scrollTop
          window.on('pointerup', this.pointerup)
          window.on('pointermove', this.pointermove)
          break
        case 'edit':
          this.dragging = event
          event.mode = 'ready-to-scroll'
          event.scrollLeft = this.screen.scrollLeft
          event.scrollTop = this.screen.scrollTop
          window.on('pointerup', this.pointerup)
          window.on('pointermove', this.pointermove)
          break
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
  if (this.mode === 'edit' && this.tileset.type === 'auto') {
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
      case 'increase-priority':
      case 'ready-to-decrease-priority':
        if (dragging.active) {
          const {priorities} = dragging
          const i = dragging.startIndex
          const step = event.button === 0 ? 1 : 9
          priorities[i] = (priorities[i] + step) % 10
          this.requestRendering()
          Scene.requestRendering()
          File.planToSave(this.meta)
        }
        break
      case 'increase-tag':
      case 'ready-to-decrease-tag':
        if (dragging.active) {
          const {tags} = dragging
          const i = dragging.startIndex
          const step = event.button === 0 ? 1 : 9
          tags[i] = (tags[i] + step) % 10
          this.requestRendering()
          Scene.requestRendering()
          File.planToSave(this.meta)
        }
        break
      case 'ready-to-increase-terrain':
        this.setTerrain(dragging.startX, dragging.startY, 1)
        break
      case 'ready-to-shift':
        this.marquee.customUnselect('source')
        this.editAutoTile(dragging.startIndex)
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
      case 'ready-to-scroll':
      case 'ready-to-decrease-priority':
      case 'ready-to-decrease-tag':
      case 'ready-to-increase-terrain': {
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
      case 'increase-priority':
      case 'increase-tag': {
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

// ******************************** 自动图块 ********************************

const AutoTile = {
  // properties
  canvas: $('#autoTile-canvas'),
  templateList: $('#autoTile-templates'),
  nodeList: $('#autoTile-nodes'),
  frameList: $('#autoTile-frames'),
  templates: null,
  template: null,
  nodes: null,
  node: null,
  nodeIndex: null,
  nodeMaximum: null,
  frames: null,
  frameIndex: null,
  frameMaximum: null,
  noImage: Symbol(),
  imageId: null,
  image: null,
  offsetX: null,
  offsetY: null,
  changed: false,
  // methods
  initialize: null,
  open: null,
  create: null,
  insertTemplate: null,
  copyTemplate: null,
  pasteTemplate: null,
  deleteTemplate: null,
  shiftTemplateFrames: null,
  createTemplateId: null,
  createTemplateData: null,
  getTemplateById: null,
  insertNode: null,
  cutNode: null,
  copyNode: null,
  pasteNode: null,
  deleteNode: null,
  setNodeQuantity: null,
  createNodeData: null,
  createNodeItems: null,
  editFrame: null,
  insertFrame: null,
  cutFrame: null,
  copyFrame: null,
  pasteFrame: null,
  deleteFrame: null,
  setFrameQuantity: null,
  generateFrames: null,
  createFrameData: null,
  createFrameItems: null,
  updateFrameItem: null,
  updateCanvas: null,
  drawFrame: null,
  // events
  windowClose: null,
  windowClosed: null,
  dprchange: null,
  templatesKeydown: null,
  templatesSelect: null,
  templatesChange: null,
  templatesPopup: null,
  nodesWrite: null,
  nodesPopup: null,
  nodesKeydown: null,
  ruleNeighborInput: null,
  framesWrite: null,
  framesPopup: null,
  framesKeydown: null,
  framesDoubleclick: null,
  canvasClick: null,
  imageInput: null,
  offsetXInput: null,
  offsetYInput: null,
  confirm: null,
}

// list methods
AutoTile.templateList.updateNodeElement = Easing.list.updateNodeElement
AutoTile.templateList.updateItemName = Team.list.updateItemName
AutoTile.templateList.addElementClass = Easing.list.addElementClass
AutoTile.templateList.updateTextNode = Easing.list.updateTextNode

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
  Window.open('autoTile')
  $('#autoTile-image').write(image)
  $('#autoTile-x').write(x)
  $('#autoTile-y').write(y)
  this.templates = Object.clone(Data.autotiles)
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
    template: Data.autotiles[0].id,
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
    Clipboard.write('yami.ruletile.template', item)
  }
}

// 粘贴模板
AutoTile.pasteTemplate = function (dItem) {
  const copy = Clipboard.read('yami.ruletile.template')
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
    const get = Local.createGetter('confirmation')
    Window.confirm({
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
  const tileWidth = Palette.tileset.tileWidth
  const tileHeight = Palette.tileset.tileHeight
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
  do {id = GUID.generate64bit()}
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
    Clipboard.write('yami.ruletile.node', this.nodes[id])
  }
}

// 粘贴节点
AutoTile.pasteNode = function (id = this.nodes.length) {
  const copy = Clipboard.read('yami.ruletile.node')
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
    TileFrame.open()
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
    Clipboard.write('yami.ruletile.frame', {
      frame: this.frames[id]
    })
  }
}

// 粘贴帧
AutoTile.pasteFrame = function (id = this.frames.length) {
  const copy = Clipboard.read('yami.ruletile.frame')
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
  const tileWidth = Palette.tileset.tileWidth
  const tileHeight = Palette.tileset.tileHeight
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
    return File.get({
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
  const tileWidth = Palette.tileset.tileWidth
  const tileHeight = Palette.tileset.tileHeight
  const x = (this.offsetX + (frame & 0xff)) * tileWidth
  const y = (this.offsetY + (frame >> 8)) * tileHeight

  // 绘制图像
  context.drawAndFitImage(image, x, y, tileWidth, tileHeight)
}

// 窗口 - 关闭事件
AutoTile.windowClose = function (event) {
  if (this.changed) {
    event.preventDefault()
    const get = Local.createGetter('confirmation')
    Window.confirm({
      message: get('closeUnsavedTiles'),
    }, [{
      label: get('yes'),
      click: () => {
        this.changed = false
        Window.close('autoTile')
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
  const pastable = Clipboard.has('yami.ruletile.template')
  const deletable = selected && AutoTile.templates.length > 1
  const get = Local.createGetter('menuAutoTileTemplateList')
  Menu.popup({
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
    accelerator: ctrl('C'),
    enabled: selected,
    click: () => {
      AutoTile.copyTemplate(item)
    },
  }, {
    label: get('paste'),
    accelerator: ctrl('V'),
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
      SceneShift.open((x, y) => {
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
  const write = getElementWriter('autoTile')
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
  const pastable = insertable && Clipboard.has('yami.ruletile.node')
  const deletable = selected && nodes.length > 1
  const coverable = selected && id !== cover
  const get = Local.createGetter('menuAutoTileNodeList')
  Menu.popup({
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
    accelerator: ctrl('X'),
    enabled: deletable,
    click: () => {
      this.cutNode(id)
    },
  }, {
    label: get('copy'),
    accelerator: ctrl('C'),
    enabled: copyable,
    click: () => {
      this.copyNode(id)
    },
  }, {
    label: get('paste'),
    accelerator: ctrl('V'),
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
      SetQuantity.open(
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
  const read = getElementReader('autoTile-rule')
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
  const pastable = insertable && Clipboard.has('yami.ruletile.frame')
  const deletable = selected && frames.length > 1
  const get = Local.createGetter('menuAutoTileFrameList')
  Menu.popup({
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
    accelerator: ctrl('X'),
    enabled: deletable,
    click: () => {
      this.cutFrame(id)
    },
  }, {
    label: get('copy'),
    accelerator: ctrl('C'),
    enabled: copyable,
    click: () => {
      this.copyFrame(id)
    },
  }, {
    label: get('paste'),
    accelerator: ctrl('V'),
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
      SetQuantity.open(
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
      FrameGenerator.open((x, y, count) => {
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
    TreeList.deleteCaches(templates)
    Data.autotiles = templates
    Data.createGUIDMap(templates)
    File.planToSave(Data.manifest.project.autotiles)
  }
  const tiles = Palette.tileset.tiles
  const index = Palette.openIndex
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
      Palette.selectTiles(x, y, width, height)
    }
  }
  File.planToSave(Palette.meta)
  Palette.requestRendering()
  Scene.requestRendering()
  Window.close('autoTile')
  // console.log(JSON.stringify(tiles[index], null, 2))
}.bind(AutoTile)

// ******************************** 图块帧生成器窗口 ********************************

const FrameGenerator = {
  // properties
  callback: null,
  // methods
  initialize: null,
  open: null,
  // events
  windowClosed: null,
  confirm: null,
}

// 初始化
FrameGenerator.initialize = function () {
  // 写入参数
  $('#autoTile-generateFrames-strideX').write(0)
  $('#autoTile-generateFrames-strideY').write(0)
  $('#autoTile-generateFrames-count').write(1)

  // 侦听事件
  $('#autoTile-generateFrames').on('closed', this.windowClosed)
  $('#autoTile-generateFrames-confirm').on('click', this.confirm)
}

// 打开窗口
FrameGenerator.open = function (callback) {
  this.callback = callback
  Window.open('autoTile-generateFrames')
  $('#autoTile-generateFrames-strideX').getFocus('all')
}

// 窗口 - 已关闭事件
FrameGenerator.windowClosed = function (event) {
  this.callback = null
}.bind(FrameGenerator)

// 确定按钮 - 鼠标点击事件
FrameGenerator.confirm = function (event) {
  const strideX = $('#autoTile-generateFrames-strideX').read()
  const strideY = $('#autoTile-generateFrames-strideY').read()
  const count = $('#autoTile-generateFrames-count').read()
  if (strideX === 0 && strideY === 0) {
    return $('#autoTile-generateFrames-strideX').getFocus()
  }
  this.callback(strideX, strideY, count)
  Window.close('autoTile-generateFrames')
}.bind(FrameGenerator)

// ******************************** 图块帧索引窗口 ********************************

const TileFrame = {
  // properties
  window: $('#autoTile-frameIndex'),
  screen: $('#autoTile-frameIndex-screen'),
  clip: $('#autoTile-frameIndex-image-clip'),
  mask: $('#autoTile-frameIndex-mask'),
  image: $('#autoTile-frameIndex-image'),
  marquee: $('#autoTile-frameIndex-marquee'),
  info: $('#autoTile-frameIndex-info'),
  dragging: null,
  hframes: null,
  vframes: null,
  // methods
  initialize: null,
  open: null,
  selectTileFrame: null,
  scrollToSelection: null,
  getDevicePixelClientBoxSize: null,
  // events
  dprchange: null,
  windowClosed: null,
  keydown: null,
  marqueePointerdown: null,
  marqueePointermove: null,
  marqueePointerleave: null,
  pointerup: null,
  pointermove: null,
}

// 初始化
TileFrame.initialize = function () {
  // 侦听事件
  window.on('dprchange', this.dprchange)
  this.window.on('closed', this.windowClosed)
  this.marquee.on('pointerdown', this.marqueePointerdown)
  this.marquee.on('pointermove', this.marqueePointermove)
  this.marquee.on('pointerleave', this.marqueePointerleave)
}

// 打开
TileFrame.open = function () {
  const MAX_CONTENT_WIDTH = 1180
  const MAX_CONTENT_HEIGHT = 696
  const MIN_CONTENT_WIDTH = 100
  const MIN_CONTENT_HEIGHT = 100
  const sprite = AutoTile.image
  const windowFrame = this.window
  const screen = this.screen
  const clip = this.clip
  const mask = this.mask
  const image = this.image
  const marquee = this.marquee
  const tileWidth = Palette.tileset.tileWidth
  const tileHeight = Palette.tileset.tileHeight
  const frames = AutoTile.frames
  const offsetX = AutoTile.offsetX
  const offsetY = AutoTile.offsetY
  const index = frames[AutoTile.frameIndex]
  const hindex = offsetX + (index & 0xff)
  const vindex = offsetY + (index >> 8)
  const hframes = Math.floor(sprite.naturalWidth / tileWidth)
  const vframes = Math.floor(sprite.naturalHeight / tileHeight)
  const dpr = window.devicePixelRatio
  const innerWidth = tileWidth * Math.clamp(hframes, 1, 256)
  const innerHeight = tileHeight * Math.clamp(vframes, 1, 256)
  let contentWidth = innerWidth / dpr
  let contentHeight = innerHeight / dpr
  this.hframes = hframes
  this.vframes = vframes

  // 使用 overflow: auto 浏览器行为有时无法预测
  if (contentWidth > MAX_CONTENT_WIDTH) {
    contentHeight += 12
    screen.style.overflowX = 'scroll'
  } else {
    screen.style.overflowX = 'hidden'
  }
  if (contentHeight > MAX_CONTENT_HEIGHT) {
    contentWidth += 12
    screen.style.overflowY = 'scroll'
  } else {
    screen.style.overflowY = 'hidden'
  }

  // 计算窗口属性
  contentWidth = Math.clamp(contentWidth, MIN_CONTENT_WIDTH, MAX_CONTENT_WIDTH)
  contentHeight = Math.clamp(contentHeight, MIN_CONTENT_HEIGHT, MAX_CONTENT_HEIGHT)
  windowFrame.style.width = `${contentWidth}px`
  windowFrame.style.height = `${contentHeight + 28}px`
  window.on('keydown', this.keydown)
  Window.open('autoTile-frameIndex')

  // 设置图像剪辑
  const screenBox = this.getDevicePixelClientBoxSize(screen)
  const screenWidth = screenBox.width
  const screenHeight = screenBox.height
  const left = Math.max((screenWidth - innerWidth >> 1) / dpr, 0)
  const top = Math.max((screenHeight - innerHeight >> 1) / dpr, 0)
  clip.style.left = `${left}px`
  clip.style.top = `${top}px`
  clip.style.width = `${innerWidth / dpr}px`
  clip.style.height = `${innerHeight / dpr}px`

  // 设置遮罩
  const offsetWidth = offsetX * tileWidth
  const offsetHeight = offsetY * tileHeight
  mask.style.borderLeftWidth = `${offsetWidth / dpr}px`
  mask.style.borderTopWidth = `${offsetHeight / dpr}px`

  // 设置图像
  image.src = sprite.src
  image.style.width = `${sprite.naturalWidth / dpr}px`
  image.style.height = `${sprite.naturalHeight / dpr}px`

  // 设置选框
  marquee.style.left = `${left}px`
  marquee.style.top = `${top}px`
  marquee.style.width = `${innerWidth / dpr}px`
  marquee.style.height = `${innerHeight / dpr}px`
  marquee.scaleX = tileWidth / dpr
  marquee.scaleY = tileHeight / dpr
  marquee.select(hindex, vindex, 1, 1)

  // 跳转到选框位置
  const x = (hindex + 0.5) * tileWidth
  const y = (vindex + 0.5) * tileHeight
  screen.scrollLeft = Math.round(x - screenWidth / 2) / dpr
  screen.scrollTop = Math.round(y - screenHeight / 2) / dpr
}

// 选择动画帧
TileFrame.selectTileFrame = function () {
  let {x, y} = this.marquee
  x -= AutoTile.offsetX
  y -= AutoTile.offsetY
  if (x >= 0 && y >= 0) {
    const {frames, frameIndex} = AutoTile
    frames[frameIndex] = Math.min(x | y << 8, 0xffff)
    AutoTile.changed = true
    AutoTile.updateFrameItem()
    Window.close('autoTile-frameIndex')
  }
}

// 滚动到选中位置
TileFrame.scrollToSelection = function () {
  const marquee = this.marquee
  if (marquee.visible) {
    const screen = this.screen
    const tw = marquee.scaleX
    const th = marquee.scaleY
    const ml = marquee.x * tw
    const mt = marquee.y * th
    const mr = ml + tw
    const mb = mt + th
    const cw = screen.clientWidth
    const ch = screen.clientHeight
    const sl = screen.scrollLeft
    const st = screen.scrollTop
    const x = Math.min(Math.max(sl, mr - cw), ml)
    const y = Math.min(Math.max(st, mb - ch), mt)
    if (sl !== x || st !== y) {
      screen.scroll(x, y)
    }
  }
}

// 获取设备像素客户框大小
TileFrame.getDevicePixelClientBoxSize = function (element) {
  const rect = element.rect()
  const css = element.css()
  if (css.overflowX === 'scroll') {
    Object.defineProperty(
      rect, 'bottom', {
        value: rect.bottom - 12
      }
    )
  }
  if (css.overflowY === 'scroll') {
    Object.defineProperty(
      rect, 'right', {
        value: rect.right - 12
      }
    )
  }
  const dpr = window.devicePixelRatio
  const left = Math.round(rect.left * dpr + 1e-5)
  const right = Math.round(rect.right * dpr + 1e-5)
  const top = Math.round(rect.top * dpr + 1e-5)
  const bottom = Math.round(rect.bottom * dpr + 1e-5)
  const width = right - left
  const height = bottom - top
  return {width, height}
}

// 设备像素比改变事件
TileFrame.dprchange = function (event) {
  if (this.hframes !== null) {
    const marquee = this.marquee
    const {x, y, width, height} = marquee
    this.open()
    marquee.select(x, y, width, height)
  }
}.bind(TileFrame)

// 窗口 - 已关闭事件
TileFrame.windowClosed = function (event) {
  this.hframes = null
  this.vframes = null
  this.image.src = ''
  if (this.dragging) {
    this.pointerup(this.dragging)
  }
  window.off('keydown', this.keydown)
}.bind(TileFrame)

// 键盘按下事件
TileFrame.keydown = function (event) {
  event.preventDefault()
  if (this.dragging) {
    return
  }
  switch (event.code) {
    case 'Enter':
    case 'NumpadEnter':
      this.selectTileFrame()
      break
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
      const marquee = this.marquee
      const x = Math.clamp(marquee.x + offsetX, 0, this.hframes - 1)
      const y = Math.clamp(marquee.y + offsetY, 0, this.vframes - 1)
      if (marquee.x !== x || marquee.y !== y) {
        marquee.select(x, y, 1, 1)
        this.scrollToSelection()
      }
      break
    }
  }
}.bind(TileFrame)

// 选框区域 - 指针按下事件
TileFrame.marqueePointerdown = function (event) {
  if (this.dragging) {
    return
  }
  switch (event.button) {
    case 0: {
      if (event.altKey) {
        this.dragging = event
        event.mode = 'scroll'
        event.screen = event.target.parentNode
        event.scrollLeft = event.screen.scrollLeft
        event.scrollTop = event.screen.scrollTop
        Cursor.open('cursor-grab')
        window.on('pointerup', this.pointerup)
        window.on('pointermove', this.pointermove)
        return
      }
      const marquee = this.marquee
      const coords = event.getRelativeCoords(marquee)
      const x = Math.floor(coords.x / marquee.scaleX)
      const y = Math.floor(coords.y / marquee.scaleY)
      marquee.select(x, y, 1, 1)
      this.dragging = event
      event.mode = 'select'
      window.on('pointerup', this.pointerup)
      break
    }
    case 2:
      this.dragging = event
      event.mode = 'scroll'
      event.screen = event.target.parentNode
      event.scrollLeft = event.screen.scrollLeft
      event.scrollTop = event.screen.scrollTop
      Cursor.open('cursor-grab')
      window.on('pointerup', this.pointerup)
      window.on('pointermove', this.pointermove)
      break
  }
}.bind(TileFrame)

// 选框区域 - 指针移动事件
TileFrame.marqueePointermove = function (event) {
  const info = this.info
  const marquee = this.marquee
  const coords = event.getRelativeCoords(marquee)
  const x = Math.floor(coords.x / marquee.scaleX)
  const y = Math.floor(coords.y / marquee.scaleY)
  if (info.x !== x || info.y !== y) {
    info.x = x
    info.y = y
    info.textContent = `${x},${y}`
  }
}.bind(TileFrame)

// 选框区域 - 指针离开事件
TileFrame.marqueePointerleave = function (event) {
  const info = this.info
  info.x = -1
  info.y = -1
  info.textContent = ''
}.bind(TileFrame)

// 指针弹起事件
TileFrame.pointerup = function (event) {
  const {dragging} = this
  if (dragging.relate(event)) {
    switch (dragging.mode) {
      case 'select': {
        const marquee = this.marquee
        if (event.target === marquee) {
          const coords = event.getRelativeCoords(marquee)
          const x = Math.floor(coords.x / marquee.scaleX)
          const y = Math.floor(coords.y / marquee.scaleY)
          if (marquee.x === x && marquee.y === y) {
            this.selectTileFrame()
          }
        }
        break
      }
      case 'scroll':
        Cursor.close('cursor-grab')
        break
    }
    this.dragging = null
    window.off('pointerup', this.pointerup)
    window.off('pointermove', this.pointermove)
  }
}.bind(TileFrame)

// 指针移动事件
TileFrame.pointermove = function (event) {
  const {dragging} = this
  if (dragging.relate(event)) {
    switch (dragging.mode) {
      case 'scroll':
        dragging.screen.scrollLeft = dragging.scrollLeft + dragging.clientX - event.clientX
        dragging.screen.scrollTop = dragging.scrollTop + dragging.clientY - event.clientY
        break
    }
  }
}.bind(TileFrame)

// ******************************** 图块节点窗口 ********************************

const TileNode = {
  // properties
  canvas: $('#autoTile-selectNode-canvas'),
  context: null,
  screen: $('#autoTile-selectNode-screen'),
  marquee: $('#autoTile-selectNode-marquee'),
  dragging: null,
  nodes: null,
  image: null,
  offsetX: null,
  offsetY: null,
  hframes: null,
  vframes: null,
  scrollLeft: null,
  scrollTop: null,
  scrollRight: null,
  scrollBottom: null,
  // methods
  initialize: null,
  open: null,
  updateTransform: null,
  updateBackground: null,
  drawNodes: null,
  requestRendering: null,
  renderingFunction: null,
  stopRendering: null,
  scrollToSelection: null,
  getDevicePixelClientBoxSize: null,
  // events
  dprchange: null,
  windowClosed: null,
  keydown: null,
  screenScroll: null,
  marqueePointerdown: null,
  pointerup: null,
  pointermove: null,
}

// 初始化
TileNode.initialize = function () {
  // 设置画布上下文
  this.context = this.canvas.getContext('2d')

  // 侦听事件
  window.on('dprchange', this.dprchange)
  $('#autoTile-selectNode').on('closed', this.windowClosed)
  this.screen.on('scroll', this.screenScroll)
  this.marquee.on('pointerdown', this.marqueePointerdown)
}

// 打开
TileNode.open = function (nodes, image, offsetX, offsetY) {
  const MAX_CONTENT_WIDTH = 1180
  const MAX_CONTENT_HEIGHT = 696
  const MIN_CONTENT_WIDTH = 100
  const MIN_CONTENT_HEIGHT = 100
  const windowFrame = $('#autoTile-selectNode')
  const screen = this.screen
  const tileWidth = Palette.tileset.tileWidth
  const tileHeight = Palette.tileset.tileHeight
  const hframes = Math.min(nodes.length, 8)
  const vframes = Math.ceil(nodes.length / 8)
  const dpr = window.devicePixelRatio
  const innerWidth = tileWidth * hframes
  const innerHeight = tileHeight * vframes
  let contentWidth = innerWidth / dpr
  let contentHeight = innerHeight / dpr
  this.nodes = nodes
  this.image = image
  this.offsetX = offsetX
  this.offsetY = offsetY
  this.hframes = hframes
  this.vframes = vframes

  // 使用 overflow: auto 浏览器行为有时无法预测
  if (contentWidth > MAX_CONTENT_WIDTH) {
    contentHeight += 12
    screen.style.overflowX = 'scroll'
  } else {
    screen.style.overflowX = 'hidden'
  }
  if (contentHeight > MAX_CONTENT_HEIGHT) {
    contentWidth += 12
    screen.style.overflowY = 'scroll'
  } else {
    screen.style.overflowY = 'hidden'
  }

  // 计算窗口属性
  contentWidth = Math.clamp(contentWidth, MIN_CONTENT_WIDTH, MAX_CONTENT_WIDTH)
  contentHeight = Math.clamp(contentHeight, MIN_CONTENT_HEIGHT, MAX_CONTENT_HEIGHT)
  windowFrame.style.width = `${contentWidth}px`
  windowFrame.style.height = `${contentHeight + 28}px`
  window.on('keydown', this.keydown)
  Window.open('autoTile-selectNode')

  // 设置选框
  const screenBox = this.getDevicePixelClientBoxSize(screen)
  const screenWidth = screenBox.width
  const screenHeight = screenBox.height
  const left = Math.max((screenWidth - innerWidth >> 1) / dpr, 0)
  const top = Math.max((screenHeight - innerHeight >> 1) / dpr, 0)
  this.marquee.style.left = `${left}px`
  this.marquee.style.top = `${top}px`
  this.marquee.style.width = `${innerWidth / dpr}px`
  this.marquee.style.height = `${innerHeight / dpr}px`
  this.marquee.scaleX = tileWidth / dpr
  this.marquee.scaleY = tileHeight / dpr
  if (Palette.explicit) {
    this.marquee.select()
  } else {
    this.marquee.select(0, 0, 1, 1)
  }

  // 设置画布
  const canvasWidth = Math.min(innerWidth, screenWidth)
  const canvasHeight = Math.min(innerHeight, screenHeight)
  this.canvas.style.left = `${left}px`
  this.canvas.style.top = `${top}px`
  this.canvas.width = canvasWidth
  this.canvas.height = canvasHeight
  this.canvas.style.width = `${canvasWidth / dpr}px`
  this.canvas.style.height = `${canvasHeight / dpr}px`

  // 设置滚动条并渲染图块
  this.scrollToSelection()
  this.updateTransform()
  this.requestRendering()
}

// 更新变换参数
TileNode.updateTransform = function () {
  const dpr = window.devicePixelRatio
  this.scrollLeft = this.screen.scrollLeft * dpr
  this.scrollTop = this.screen.scrollTop * dpr
  this.scrollRight = this.scrollLeft + this.canvas.width
  this.scrollBottom = this.scrollTop + this.canvas.height
  this.context.setTransform(1, 0, 0, 1, -this.scrollLeft, -this.scrollTop)
}

// 更新背景图像
TileNode.updateBackground = Palette.updateBackground

// 绘制图块节点
TileNode.drawNodes = function () {
  if (!this.nodes) return
  const context = this.context
  const tileset = Palette.tileset
  const image = this.image
  const nodes = this.nodes
  const length = nodes.length
  const tw = tileset.tileWidth
  const th = tileset.tileHeight
  const ox = this.offsetX
  const oy = this.offsetY
  const sl = this.scrollLeft
  const st = this.scrollTop
  const sr = this.scrollRight
  const sb = this.scrollBottom
  const bx = Math.max(Math.floor(sl / tw), 0)
  const by = Math.max(Math.floor(st / th), 0)
  const ex = Math.min(Math.ceil(sr / tw), this.hframes)
  const ey = Math.min(Math.ceil(sb / th), this.vframes)
  context.clearRect(sl, st, sr - sl, sb - st)
  for (let y = by; y < ey; y++) {
    for (let x = bx; x < ex; x++) {
      const i = x | y << 3
      if (i < length) {
        const frame = nodes[i].frames[0]
        const sx = (ox + (frame & 0xff)) * tw
        const sy = (oy + (frame >> 8)) * th
        const dx = x * tw
        const dy = y * th
        context.drawImage(image, sx, sy, tw, th, dx, dy, tw, th)
      }
    }
  }
}

// 请求渲染
TileNode.requestRendering = function () {
  if (this.nodes !== null) {
    Timer.appendUpdater('sharedRendering', this.renderingFunction)
  }
}

// 渲染函数
TileNode.renderingFunction = function () {
  TileNode.drawNodes()
}

// 停止渲染
TileNode.stopRendering = function () {
  Timer.removeUpdater('sharedRendering', this.renderingFunction)
}

// 滚动到选中位置
TileNode.scrollToSelection = function () {
  const marquee = this.marquee
  if (marquee.visible) {
    const screen = this.screen
    const tw = marquee.scaleX
    const th = marquee.scaleY
    const ml = marquee.x * tw
    const mt = marquee.y * th
    const mr = ml + tw
    const mb = mt + th
    const cw = screen.clientWidth
    const ch = screen.clientHeight
    const sl = screen.scrollLeft
    const st = screen.scrollTop
    const x = Math.min(Math.max(sl, mr - cw), ml)
    const y = Math.min(Math.max(st, mb - ch), mt)
    if (sl !== x || st !== y) {
      screen.scroll(x, y)
    }
  }
}

// 获取设备像素客户框大小
TileNode.getDevicePixelClientBoxSize = function (element) {
  const rect = element.rect()
  const css = element.css()
  if (css.overflowX === 'scroll') {
    Object.defineProperty(
      rect, 'bottom', {
        value: rect.bottom - 12
      }
    )
  }
  if (css.overflowY === 'scroll') {
    Object.defineProperty(
      rect, 'right', {
        value: rect.right - 12
      }
    )
  }
  const dpr = window.devicePixelRatio
  const left = Math.round(rect.left * dpr + 1e-5)
  const right = Math.round(rect.right * dpr + 1e-5)
  const top = Math.round(rect.top * dpr + 1e-5)
  const bottom = Math.round(rect.bottom * dpr + 1e-5)
  const width = right - left
  const height = bottom - top
  return {width, height}
}

// 设备像素比改变事件
TileNode.dprchange = function (event) {
  if (this.nodes !== null) {
    const marquee = this.marquee
    const {x, y, width, height} = marquee
    this.open(this.nodes, this.image)
    marquee.select(x, y, width, height)
  }
}.bind(TileNode)

// 窗口 - 已关闭事件
TileNode.windowClosed = function (event) {
  this.nodes = null
  this.image = null
  this.canvas.width = 0
  this.canvas.height = 0
  this.stopRendering()
  if (this.dragging) {
    this.pointerup(this.dragging)
  }
  window.off('keydown', this.keydown)
}.bind(TileNode)

// 键盘按下事件
TileNode.keydown = function (event) {
  event.preventDefault()
  if (this.dragging) {
    return
  }
  switch (event.code) {
    case 'Enter':
    case 'NumpadEnter': {
      const {x, y} = this.marquee
      const tiles = (
        Scene.marquee.key === 'tile'
      ? Scene.marquee.tiles
      : Scene.marquee.saveData.tile.tiles
      )
      const length = tiles.length
      for (let i = 0; i < length; i++) {
        if (tiles[i] !== 0) {
          tiles[i] &= 0xffffffc0
          tiles[i] |= x | y << 3
          break
        }
      }
      Palette.explicit = true
      Palette.marquee.addClass('explicit')
      Window.close('autoTile-selectNode')
      break
    }
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
      const marquee = this.marquee
      const x = Math.clamp(marquee.x + offsetX, 0, this.hframes - 1)
      const y = Math.clamp(marquee.y + offsetY, 0, this.vframes - 1)
      if (marquee.x !== x || marquee.y !== y) {
        const index = x | y << 3
        if (index < this.nodes.length) {
          marquee.select(x, y, 1, 1)
          this.scrollToSelection()
        }
      }
      break
    }
  }
}.bind(TileNode)

// 屏幕 - 滚动事件
TileNode.screenScroll = function (event) {
  this.updateTransform()
  this.updateBackground()
  this.requestRendering()
}.bind(TileNode)

// 选框区域 - 指针按下事件
TileNode.marqueePointerdown = function (event) {
  if (this.dragging) {
    return
  }
  switch (event.button) {
    case 0: {
      if (event.altKey) {
        this.dragging = event
        event.mode = 'scroll'
        event.screen = event.target.parentNode
        event.scrollLeft = event.screen.scrollLeft
        event.scrollTop = event.screen.scrollTop
        Cursor.open('cursor-grab')
        window.on('pointerup', this.pointerup)
        window.on('pointermove', this.pointermove)
        return
      }
      const marquee = this.marquee
      const coords = event.getRelativeCoords(marquee)
      const x = Math.floor(coords.x / marquee.scaleX)
      const y = Math.floor(coords.y / marquee.scaleY)
      const index = x | y << 3
      if (index < this.nodes.length) {
        marquee.select(x, y, 1, 1)
        this.dragging = event
        event.mode = 'select'
        window.on('pointerup', this.pointerup)
      }
      break
    }
    case 2:
      this.dragging = event
      event.mode = 'scroll'
      event.screen = event.target.parentNode
      event.scrollLeft = event.screen.scrollLeft
      event.scrollTop = event.screen.scrollTop
      Cursor.open('cursor-grab')
      window.on('pointerup', this.pointerup)
      window.on('pointermove', this.pointermove)
      break
  }
}.bind(TileNode)

// 指针弹起事件
TileNode.pointerup = function (event) {
  const {dragging} = this
  if (dragging.relate(event)) {
    switch (dragging.mode) {
      case 'select': {
        const marquee = this.marquee
        if (event.target === marquee) {
          const coords = event.getRelativeCoords(marquee)
          const x = Math.floor(coords.x / marquee.scaleX)
          const y = Math.floor(coords.y / marquee.scaleY)
          if (marquee.x === x && marquee.y === y) {
            const tiles = (
              Scene.marquee.key === 'tile'
            ? Scene.marquee.tiles
            : Scene.marquee.saveData.tile.tiles
            )
            const length = tiles.length
            for (let i = 0; i < length; i++) {
              if (tiles[i] !== 0) {
                tiles[i] &= 0xffffffc0
                tiles[i] |= x | y << 3
                break
              }
            }
            Palette.explicit = true
            Palette.marquee.addClass('explicit')
            // 关闭窗口会额外触发一次本事件
            // 换做 mouseup 事件也一样
            Window.close('autoTile-selectNode')
          }
        }
        break
      }
      case 'scroll':
        Cursor.close('cursor-grab')
        break
    }
    this.dragging = null
    window.off('pointerup', this.pointerup)
    window.off('pointermove', this.pointermove)
  }
}.bind(TileNode)

// 指针移动事件
TileNode.pointermove = function (event) {
  const {dragging} = this
  if (dragging.relate(event)) {
    switch (dragging.mode) {
      case 'scroll':
        dragging.screen.scrollLeft = dragging.scrollLeft + dragging.clientX - event.clientX
        dragging.screen.scrollTop = dragging.scrollTop + dragging.clientY - event.clientY
        break
    }
  }
}.bind(TileNode)