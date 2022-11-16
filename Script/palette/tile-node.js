'use strict'

import {
  Cursor,
  Palette,
  Scene,
  Timer,
  Window
} from '../yami.js'

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

// ******************************** 图块节点窗口加载 ********************************

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

// ******************************** 图块节点窗口导出 ********************************

export { TileNode }
