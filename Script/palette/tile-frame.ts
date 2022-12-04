'use strict'

import {
  AutoTile,
  Cursor,
  Palette,
  Window,
  IMath
} from '../yami'

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

// ******************************** 图块帧索引窗口加载 ********************************

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
  const hframes = IMath.floor(sprite.naturalWidth / tileWidth)
  const vframes = IMath.floor(sprite.naturalHeight / tileHeight)
  const dpr = window.devicePixelRatio
  const innerWidth = tileWidth * IMath.clamp(hframes, 1, 256)
  const innerHeight = tileHeight * IMath.clamp(vframes, 1, 256)
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
  contentWidth = IMath.clamp(contentWidth, MIN_CONTENT_WIDTH, MAX_CONTENT_WIDTH)
  contentHeight = IMath.clamp(contentHeight, MIN_CONTENT_HEIGHT, MAX_CONTENT_HEIGHT)
  windowFrame.style.width = `${contentWidth}px`
  windowFrame.style.height = `${contentHeight + 28}px`
  window.on('keydown', this.keydown)
  Window.open('autoTile-frameIndex')

  // 设置图像剪辑
  const screenBox = this.getDevicePixelClientBoxSize(screen)
  const screenWidth = screenBox.width
  const screenHeight = screenBox.height
  const left = IMath.max((screenWidth - innerWidth >> 1) / dpr, 0)
  const top = IMath.max((screenHeight - innerHeight >> 1) / dpr, 0)
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
  screen.scrollLeft = IMath.round(x - screenWidth / 2) / dpr
  screen.scrollTop = IMath.round(y - screenHeight / 2) / dpr
}

// 选择动画帧
TileFrame.selectTileFrame = function () {
  let {x, y} = this.marquee
  x -= AutoTile.offsetX
  y -= AutoTile.offsetY
  if (x >= 0 && y >= 0) {
    const {frames, frameIndex} = AutoTile
    frames[frameIndex] = IMath.min(x | y << 8, 0xffff)
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
    const x = IMath.min(IMath.max(sl, mr - cw), ml)
    const y = IMath.min(IMath.max(st, mb - ch), mt)
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
  const left = IMath.round(rect.left * dpr + 1e-5)
  const right = IMath.round(rect.right * dpr + 1e-5)
  const top = IMath.round(rect.top * dpr + 1e-5)
  const bottom = IMath.round(rect.bottom * dpr + 1e-5)
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
      const x = IMath.clamp(marquee.x + offsetX, 0, this.hframes - 1)
      const y = IMath.clamp(marquee.y + offsetY, 0, this.vframes - 1)
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
      const x = IMath.floor(coords.x / marquee.scaleX)
      const y = IMath.floor(coords.y / marquee.scaleY)
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
  const x = IMath.floor(coords.x / marquee.scaleX)
  const y = IMath.floor(coords.y / marquee.scaleY)
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
          const x = IMath.floor(coords.x / marquee.scaleX)
          const y = IMath.floor(coords.y / marquee.scaleY)
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

// ******************************** 图块帧索引窗口导出 ********************************

export { TileFrame }
