'use strict'

import {
  Data,
  File,
  getElementReader,
  getElementWriter,
  Local,
  Menu,
  Rename,
  UI,
  Window,
  IMath
} from '../yami'

// ******************************** 拾色器窗口 ********************************

const Color = {
  // properties
  target: null,
  dragging: null,
  paletteX: null,
  paletteY: null,
  pillarY: null,
  indexEnabled: null,
  // methods
  initialize: null,
  open: null,
  drawPalette: null,
  drawPillar: null,
  drawViewer: null,
  setPaletteCursor: null,
  setPillarCursor: null,
  getRGBFromPalette: null,
  getRGBFromPillar: null,
  getRGBAFromHex: null,
  getHexFromRGBA: null,
  getCSSColorFromRGBA: null,
  writeRGBAToInputs: null,
  readRGBAFromInputs: null,
  loadIndexedColors: null,
  simplifyHexColor: null,
  // events
  windowClosed: null,
  palettePointerdown: null,
  pillarPointerdown: null,
  indexedColorInput: null,
  indexedColorPointerdown: null,
  pointerup: null,
  pointermove: null,
  hexBeforeinput: null,
  hexInput: null,
  rgbaInput: null,
  confirm: null,
}

// ******************************** 拾色器窗口加载 ********************************

// 初始化
Color.initialize = function () {
  // 设置十六进制的最大长度
  $('#color-hex').setMaxLength(8)

  // 设置颜色索引单选框为可取消
  $('#color-index').cancelable = true

  // 侦听事件
  $('#color').on('closed', this.windowClosed)
  $('#color-palette-frame').on('pointerdown', this.palettePointerdown)
  $('#color-pillar-frame').on('pointerdown', this.pillarPointerdown)
  $('#color-index').on('input', this.indexedColorInput)
  $('[name="color-index"]').on('pointerdown', this.indexedColorPointerdown)
  $('#color-r, #color-g, #color-b, #color-a').on('input', this.rgbaInput)
  $('#color-hex').on('beforeinput', this.hexBeforeinput, {capture: true})
  $('#color-hex').on('input', this.hexInput)
  $('#color-confirm').on('click', this.confirm)
}

// 打开窗口
Color.open = function (target, indexEnabled = false) {
  this.target = target
  this.indexEnabled = indexEnabled
  Window.open('color')
  let color = target.read()
  switch (typeof color) {
    case 'string':
      break
    case 'number':
      $('#color-index').write(color)
      color = Data.config.indexedColors[color].code
      break
  }
  const rgba = this.getRGBAFromHex(color)
  this.drawPalette()
  this.drawPillar(rgba)
  this.setPillarCursor(0)
  this.writeRGBAToInputs(rgba)
  this.drawViewer(rgba)
  this.loadIndexedColors()
  $('#color-hex').getFocus('all')
}

// 绘制调色板
Color.drawPalette = function () {
  const canvas = $('#color-palette-canvas')
  if (!canvas.initialized) {
    canvas.initialized = true

    // 绘制水平渐变色带
    const context = canvas.getContext('2d')
    const gradient = context.createLinearGradient(0.5, 0, 255.5, 0)
    gradient.addColorStop(0, '#ff0000')
    gradient.addColorStop(1 / 6, '#ffff00')
    gradient.addColorStop(2 / 6, '#00ff00')
    gradient.addColorStop(3 / 6, '#00ffff')
    gradient.addColorStop(4 / 6, '#0000ff')
    gradient.addColorStop(5 / 6, '#ff00ff')
    gradient.addColorStop(1, '#ff0000')
    context.fillStyle = gradient
    context.fillRect(0, 0, 256, 194)

    // 绘制7根纯色线条
    context.fillStyle = '#ff0000'
    context.fillRect(0, 0, 1, 194)
    context.fillStyle = '#ffff00'
    context.fillRect(43, 0, 1, 194)
    context.fillStyle = '#00ff00'
    context.fillRect(85, 0, 1, 194)
    context.fillStyle = '#00ffff'
    context.fillRect(128, 0, 1, 194)
    context.fillStyle = '#0000ff'
    context.fillRect(170, 0, 1, 194)
    context.fillStyle = '#ff00ff'
    context.fillRect(213, 0, 1, 194)
    context.fillStyle = '#ff0000'
    context.fillRect(255, 0, 1, 194)

    // 绘制垂直渐变色带
    const upperGradient = context.createLinearGradient(0, 0.5, 0, 96.5)
    upperGradient.addColorStop(0, 'rgba(255, 255, 255, 1)')
    upperGradient.addColorStop(1, 'rgba(255, 255, 255, 0)')
    context.fillStyle = upperGradient
    context.fillRect(0, 0, 256, 97)
    const lowerGradient = context.createLinearGradient(0, 97.5, 0, 193.5)
    lowerGradient.addColorStop(0, 'rgba(0, 0, 0, 0)')
    lowerGradient.addColorStop(1, 'rgba(0, 0, 0, 1)')
    context.fillStyle = lowerGradient
    context.fillRect(0, 97, 256, 97)

    // 设置指针初始位置
    this.setPaletteCursor(0, 193)
  }
}

// 绘制色柱
Color.drawPillar = function ([r, g, b]) {
  const canvas = $('#color-pillar-canvas')
  const context = canvas.getContext('2d')
  const gradient = context.createLinearGradient(0, 0.5, 0, 255.5)
  gradient.addColorStop(0, `rgba(${r}, ${g}, ${b})`)
  gradient.addColorStop(1, `rgba(255, 255, 255)`)
  context.fillStyle = gradient
  context.fillRect(0, 0, 20, 256)
}

// 绘制查看器
Color.drawViewer = function ([r, g, b, a]) {
  $('#color-viewer').style.backgroundColor = `rgba(${r}, ${g}, ${b}, ${a / 255})`
}

// 设置调色板指针
Color.setPaletteCursor = function (x, y) {
  const cursor = $('#color-palette-cursor')
  this.paletteX = x
  this.paletteY = y
  cursor.style.left = `${x - 5}px`
  cursor.style.top = `${y - 5}px`
}

// 设置色柱指针
Color.setPillarCursor = function (y) {
  const cursor = $('#color-pillar-cursor')
  this.pillarY = y
  cursor.style.top = `${y}px`
}

// 从调色板中获取颜色分量
Color.getRGBFromPalette = function () {
  const x = IMath.round(this.paletteX)
  const y = IMath.round(this.paletteY)
  const canvas = $('#color-palette-canvas')
  const context = canvas.getContext('2d')
  const [r, g, b, a] = context.getImageData(x, y, 1, 1).data
  return [r, g, b]
}

// 从色柱中获取颜色分量
Color.getRGBFromPillar = function () {
  const y = IMath.round(this.pillarY)
  const canvas = $('#color-pillar-canvas')
  const context = canvas.getContext('2d')
  const [r, g, b, a] = context.getImageData(0, y, 1, 1).data
  return [r, g, b]
}

// 从十六进制中获取颜色分量
Color.getRGBAFromHex = function (hex) {
  const r = parseInt(hex.slice(0, 2) || '00', 16)
  const g = parseInt(hex.slice(2, 4) || '00', 16)
  const b = parseInt(hex.slice(4, 6) || '00', 16)
  const a = parseInt(hex.slice(6, 8) || 'ff', 16)
  return [r, g, b, a]
}

// 从颜色分量中获取十六进制
Color.getHexFromRGBA = function (rgba) {
  const r = rgba[0].toString(16).padStart(2, '0')
  const g = rgba[1].toString(16).padStart(2, '0')
  const b = rgba[2].toString(16).padStart(2, '0')
  const a = rgba[3].toString(16).padStart(2, '0')
  return `${r}${g}${b}${a}`
}

// 从颜色分量中获取 CSS 颜色
Color.getCSSColorFromRGBA = function (rgba) {
  const [r, g, b, a] = rgba
  return `rgba(${r}, ${g}, ${b}, ${a / 255})`
}

// 写入颜色分量到输入框
Color.writeRGBAToInputs = function ([r, g, b, a]) {
  const write = getElementWriter('color')
  const hex = this.getHexFromRGBA([r, g, b, a])
  write('hex', this.simplifyHexColor(hex))
  write('r', r)
  write('g', g)
  write('b', b)
  write('a', a)
}

// 读取颜色分量从输入框
Color.readRGBAFromInputs = function () {
  const read = getElementReader('color')
  const r = read('r')
  const g = read('g')
  const b = read('b')
  const a = read('a')
  return [r, g, b, a]
}

// 加载索引颜色
Color.loadIndexedColors = function () {
  const radios = document.getElementsByName('color-index')
  const colors = Data.config.indexedColors
  const length = colors.length
  for (let i = 0; i < length; i++) {
    const radio = radios[i]
    const color = colors[i]
    const rgba = this.getRGBAFromHex(color.code)
    const csscolor = this.getCSSColorFromRGBA(rgba)
    radio.style.backgroundColor = csscolor
    radio.setTooltip(color.name)
  }
}

// 简化十六进制颜色代码
Color.simplifyHexColor = function IIFE() {
  const regexp = /^([\da-f]{6})ff$/i
  return function (hex) {
    return hex.replace(regexp, '$1')
  }
}()

// 窗口 - 已关闭事件
Color.windowClosed = function (event) {
  $('#color-index').reset()
  if (this.dragging) {
    this.pointerup(this.dragging)
  }
}.bind(Color)

// 调色板 - 指针按下事件
Color.palettePointerdown = function (event) {
  switch (event.button) {
    case 0: case -1: {
      if (!this.dragging) {
        this.dragging = event
        event.mode = 'palette'
        window.on('pointerup', this.pointerup)
        window.on('pointermove', this.pointermove)
      }
      const canvas = $('#color-palette-canvas')
      const coords = event.getRelativeCoords(canvas)
      const x = IMath.clamp(coords.x, 0, 255)
      const y = IMath.clamp(coords.y, 0, 193)
      this.setPaletteCursor(x, y)

      const rgb = this.getRGBFromPalette()
      const a = $('#color-a').read()
      const rgba = [...rgb, a]
      this.drawPillar(rgb)
      this.setPillarCursor(0)
      this.writeRGBAToInputs(rgba)
      this.drawViewer(rgba)
      $('#color-index').reset()
      break
    }
  }
}.bind(Color)

// 色柱 - 指针按下事件
Color.pillarPointerdown = function (event) {
  switch (event.button) {
    case 0: case -1: {
      if (!this.dragging) {
        this.dragging = event
        event.mode = 'pillar'
        window.on('pointerup', this.pointerup)
        window.on('pointermove', this.pointermove)
      }
      const canvas = $('#color-pillar-canvas')
      const coords = event.getRelativeCoords(canvas)
      const y = IMath.clamp(coords.y, 0, 255)
      this.setPillarCursor(y)

      const rgb = this.getRGBFromPillar()
      const a = $('#color-a').read()
      const rgba = [...rgb, a]
      this.writeRGBAToInputs(rgba)
      this.drawViewer(rgba)
      $('#color-index').reset()
      break
    }
  }
}.bind(Color)

// 索引颜色 - 输入事件
Color.indexedColorInput = function (event) {
  const index = event.value
  const hex = Data.config.indexedColors[index].code
  const rgba = this.getRGBAFromHex(hex)
  this.drawPillar(rgba)
  this.setPillarCursor(0)
  this.writeRGBAToInputs(rgba)
  this.drawViewer(rgba)
  if (!this.indexEnabled) {
    event.target.reset()
  }
}.bind(Color)

// 索引颜色 - 指针按下事件
Color.indexedColorPointerdown = function (event) {
  switch (event.button) {
    case 2: {
      const element = event.target
      const index = element.dataValue
      const indexedColor = Data.config.indexedColors[index]
      const get = Local.createGetter('menuIndexedColor')
      Menu.popup({
        x: event.clientX,
        y: event.clientY,
      }, [{
        label: get('saveColor'),
        click: () => {
          const rgba = this.readRGBAFromInputs()
          const hex = this.getHexFromRGBA(rgba)
          const csscolor = this.getCSSColorFromRGBA(rgba)
          if (indexedColor.code !== hex) {
            indexedColor.code = hex
            element.style.backgroundColor = csscolor
            UI.updateIndexedColor(index)
            File.planToSave(Data.manifest.project.config)
          }
        },
      }, {
        label: get('rename'),
        click: () => {
          Rename.open(indexedColor.name, name => {
            indexedColor.name = name
            element.setTooltip(name)
            File.planToSave(Data.manifest.project.config)
          })
        },
      }])
      break
    }
  }
}.bind(Color)

// 指针弹起事件
Color.pointerup = function (event) {
  const {dragging} = this
  if (dragging.relate(event)) {
    this.dragging = null
    window.off('pointerup', this.pointerup)
    window.off('pointermove', this.pointermove)
  }
}.bind(Color)

// 指针移动事件
Color.pointermove = function (event) {
  const {dragging} = this
  if (dragging.relate(event)) {
    switch (dragging.mode) {
      case 'palette':
        return this.palettePointerdown(event)
      case 'pillar':
        return this.pillarPointerdown(event)
    }
  }
}.bind(Color)

// 十六进制 - 输入前事件
Color.hexBeforeinput = function (event) {
  if (event.inputType === 'insertText' &&
    typeof event.data === 'string') {
    const regexp = /[^0-9a-f]/i
    if (regexp.test(event.data)) {
      event.preventDefault()
      event.stopPropagation()
    }
  }
}

// 十六进制 - 输入事件
Color.hexInput = function (event) {
  const read = getElementReader('color')
  const write = getElementWriter('color')
  const oldHex = read('hex')
  const newHex = oldHex.replace(/[^0-9a-f]/gi, '')
  const [r, g, b, a] = this.getRGBAFromHex(newHex)
  if (oldHex !== newHex) {
    write('hex', newHex)
  }
  write('r', r)
  write('g', g)
  write('b', b)
  write('a', a)
  this.drawPillar([r, g, b])
  this.setPillarCursor(0)
  this.drawViewer([r, g, b, a])
  $('#color-index').reset()
}.bind(Color)

// 颜色分量 - 输入事件
Color.rgbaInput = function (event) {
  const read = getElementReader('color')
  const write = getElementWriter('color')
  const r = read('r')
  const g = read('g')
  const b = read('b')
  const a = read('a')
  const hex = this.getHexFromRGBA([r, g, b, a])
  write('hex', this.simplifyHexColor(hex))
  this.drawPillar([r, g, b])
  this.setPillarCursor(0)
  this.drawViewer([r, g, b, a])
  $('#color-index').reset()
}.bind(Color)

// 保存颜色 - 鼠标点击事件
Color.confirm = function (event) {
  const index = $('#color-index').read()
  if (this.indexEnabled && index !== null) {
    this.target.input(index)
  } else {
    const rgba = this.readRGBAFromInputs()
    const hex = this.getHexFromRGBA(rgba)
    this.target.input(hex)
  }
  Window.close('color')
}.bind(Color)

// ******************************** 拾色器窗口导出 ********************************

export { Color }
