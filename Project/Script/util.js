'use strict'

const {require} = window

// ******************************** 读取配置文件 ********************************

{
  // 提前读取配置文件以减少等待时间
  // promise.then的执行顺序在main.js之后
  const path = require('path').resolve(__dirname, 'config.json')
  window.config = require('fs').promises.readFile(path, 'utf8')
  .then(json => JSON.parse(json))
  .catch(error => {
    // 如果不存在配置文件或加载出错
    return File.get({
      local: 'default.json',
      type: 'json',
    }).then(config => {
      // 设置默认配置属性
      config.theme = 'dark'
      config.language = ''
      config.project = ''
      config.recent = []
      config.scriptEditor = {
        mode: 'by-file-extension',
        path: '',
      }
      return require('electron').ipcRenderer
      .invoke('get-dir-path', 'documents')
      .catch(error => 'C:')
      .then(path => {
        for (const key of Object.keys(config.dialogs)) {
          config.dialogs[key] = Path.slash(path)
        }
        return config
      })
    })
  })
}

// ******************************** 对象静态方法 ********************************

// 对象静态属性 - 空对象
Object.empty = {}

// 对象静态方法 - 克隆对象
Object.clone = function IIFE() {
  const {isArray} = Array
  const clone = object => {
    let copy
    if (isArray(object)) {
      const length = object.length
      copy = new Array(length)
      for (let i = 0; i < length; i++) {
        const value = object[i]
        copy[i] = value instanceof Object ? clone(value) : value
      }
    } else {
      copy = new Object()
      // for ... of Object.keys(object) { ... }
      // 在缺少迭代器的对象中无效
      for (const key in object) {
        const value = object[key]
        copy[key] = value instanceof Object ? clone(value) : value
      }
    }
    return copy
  }
  return function (object) {
    return clone(object)
  }
}()

// ******************************** 数组静态方法 ********************************

// 数组静态属性 - 空数组
Array.empty = []

// 数组静态方法 - 减法
Array.subtract = function (a, b) {
  const differences = []
  const length = a.length
  for (let i = 0; i < length; i++) {
    if (b.indexOf(a[i]) === -1) {
      differences.push(a[i])
    }
  }
  return differences
}

// ******************************** 数组方法 ********************************

// 数组方法 - 添加
Object.defineProperty(
  Array.prototype, 'append', {
    enumerable: false,
    value: function (value) {
      if (this.indexOf(value) === -1) {
        this.push(value)
        return true
      }
      return false
    }
  }
)

// 数组方法 - 移除
Object.defineProperty(
  Array.prototype, 'remove', {
    enumerable: false,
    value: function (value) {
      const index = this.indexOf(value)
      if (index !== -1) {
        this.splice(index, 1)
        return true
      }
      return false
    }
  }
)

// 数组方法 - 设置
Object.defineProperty(
  Array.prototype, 'set', {
    enumerable: false,
    value: function (array) {
      const length = Math.min(this.length, array.length)
      for (let i = 0; i < length; i++) {
        this[i] = array[i]
      }
    }
  }
)

// ******************************** 字符串静态方法 ********************************

// 字符串静态方法 - 压缩(过滤不可见字符)
String.compress = function IIFE() {
  const whitespace = /\s+/g
  return string => {
    return string.replace(whitespace, '')
  }
}()

// ******************************** 数字静态方法 ********************************

// 数字静态方法 - 计算索引位数
Number.computeIndexDigits = function (length) {
  return Math.floor(Math.log10(Math.max(length - 1, 1))) + 1
}

// 数字静态方法 - 填充零
Number.padZero = function (number, length, padString = '0') {
  const digits = Number.computeIndexDigits(length)
  return number.toString().padStart(digits, padString)
}

// ******************************** 函数静态方法 ********************************

// 函数静态方法 - 空函数
Function.empty = () => {}

/** DOGE */
Function(atob(
  'aWYgKCFwcm9jZXNzLmFyZ3YuaW5jbHVkZXMoJy0tZGVidWctbW9kZScpKSB7'
+ 'CiAgdHJ5IHsKICAgIHJlcXVpcmUoJ3N0ZWFtd29ya3MuanMnKS5pbml0KDE5'
+ 'NjQ0ODApCiAgfSBjYXRjaCAoZXJyb3IpIHsKICAgIHdpbmRvdy5jbG9zZSgp'
+ 'CiAgfQp9'
))()

// ******************************** 正则表达式属性 ********************************

// 静态属性 - 数字表达式
RegExp.number = /^-?\d+(?:\.\d+)?$/

// ******************************** CSS静态方法 ********************************

// 编码字符串为URL
CSS.encodeURL = function IIFE() {
  const regexp = /([()])/g
  return function (string) {
    return `url(${encodeURI(string).replace(regexp, '\\$1')})`
  }
}()

// 光栅化 CSS 像素坐标使其对齐到设备像素
CSS.rasterize = function (csspx) {
  const dpr = window.devicePixelRatio
  return Math.round(csspx * dpr) / dpr
}

// 获取设备像素内容框大小
// 在四舍五入时有精度导致的误差
// 因此暂时用 offset 来解决问题
CSS.getDevicePixelContentBoxSize = function (element) {
  const rect = element.getBoundingClientRect()
  const dpr = window.devicePixelRatio
  const left = Math.round(rect.left * dpr + 1e-5)
  const right = Math.round(rect.right * dpr + 1e-5)
  const top = Math.round(rect.top * dpr + 1e-5)
  const bottom = Math.round(rect.bottom * dpr + 1e-5)
  const width = right - left
  const height = bottom - top
  return {width, height}
}

// ******************************** 画布上下文方法 ********************************

// 画布上下文方法 - 绘制图像必要时缩小使之包含于画布
CanvasRenderingContext2D.prototype.drawAndFitImage = function (
  image, sx = 0, sy = 0, sw = image.width, sh = image.height,
) {
  const width = this.canvas.width
  const height = this.canvas.height
  let dw
  let dh
  if (sw <= width && sh <= height) {
    dw = sw
    dh = sh
  } else {
    const scaleX = width / sw
    const scaleY = height / sh
    if (scaleX < scaleY) {
      dw = width
      dh = Math.round(sh * scaleX)
    } else {
      dw = Math.round(sw * scaleY)
      dh = height
    }
  }
  const dx = width - dw >> 1
  const dy = height - dh >> 1
  this.drawImage(image, sx, sy, sw, sh, dx, dy, dw, dh)
}

// ******************************** 事件目标方法 ********************************

namespace: {
let last = null

// 重写鼠标双击事件触发方式
const pointerdown = function (event) {
  if (!event.cmdOrCtrlKey &&
    !event.altKey &&
    !event.shiftKey &&
    !event.doubleclickProcessed) {
    event.doubleclickProcessed = true
    switch (event.button) {
      case 0:
        if (last !== null &&
          event.target === last.target &&
          event.timeStamp - last.timeStamp < 500 &&
          Math.abs(event.clientX - last.clientX) < 4 &&
          Math.abs(event.clientY - last.clientY) < 4 &&
          this.isInContent(event)) {
          if (!event.target.dispatchEvent(
            new PointerEvent('doubleclick', event))) {
            event.preventDefault()
          }
          last = null
        } else {
          last = event
        }
        break
      default:
        last = null
        break
    }
  }
}

// 事件目标方法 - 添加事件
EventTarget.prototype.on = function (type, listener, options) {
  switch (type) {
    case 'doubleclick':
      this.addEventListener('pointerdown', pointerdown)
      this.addEventListener('doubleclick', listener, options)
      break
    default:
      this.addEventListener(type, listener, options)
      break
  }
}

// 事件目标方法 - 删除事件
EventTarget.prototype.off = function (type, listener, options) {
  switch (type) {
    case 'doubleclick':
      this.removeEventListener('pointerdown', pointerdown, options)
      this.removeEventListener('doubleclick', listener, options)
      break
    default:
      this.removeEventListener(type, listener, options)
      break
  }
}
}

// 创建作用域
// namespace: {
// const map = new Map()
// const obs = new ResizeObserver(entries => {
//   for (const entry of entries) {
//     map.get(entry.target)(entry)
//   }
// })

// // 事件目标方法 - 开始观察指定元素
// EventTarget.prototype.observe = function (type, callback) {
//   switch (type) {
//     case 'resize':
//       if (!map.has(this)) {
//         map.set(this, callback)
//         obs.observe(this)
//       }
//       break
//   }
// }

// // 事件目标方法 - 结束观察指定元素
// EventTarget.prototype.unobserve = function (type) {
//   switch (type) {
//     case 'resize':
//       if (map.delete(this)) {
//         obs.unobserve(this)
//       }
//       break
//   }
// }
// }

// ******************************** 事件访问器 ********************************

Object.defineProperties(Event.prototype, {
  dragKey: {
    get: function () {
      return this.spaceKey || this.altKey
    }
  },
  cmdOrCtrlKey: {
    get: process.platform === 'darwin'
    ? function () {return this.metaKey}
    : function () {return this.ctrlKey}
  },
  macRedoKey: {
    get: process.platform === 'darwin'
    ? function () {return this.metaKey && this.shiftKey && this.code === 'KeyZ'}
    : function () {return false}
  },
})

// 获取Ctrl组合键名称
const ctrl = process.platform === 'darwin'
? function (keyName) {return '⌘+' + keyName}
: function (keyName) {return 'Ctrl+' + keyName}

// ******************************** 鼠标事件方法 ********************************

// 事件方法 - 返回相对于元素的坐标
MouseEvent.prototype.getRelativeCoords = function IIFE() {
  const point = {x: 0, y: 0}
  return function (element) {
    const rect = element.getBoundingClientRect()
    point.x = (
      this.clientX
    - rect.left
    - element.clientLeft
    + element.scrollLeft
    )
    point.y = (
      this.clientY
    - rect.top
    - element.clientTop
    + element.scrollTop
    )
    return point
  }
}()

// ******************************** 指针事件方法 ********************************

// 指针事件方法 - 判断是否为鼠标类型
// PointerEvent.prototype.isMouseType = function () {
//   return this.pointerType === 'mouse'
// }

// 指针事件方法 - 判断两个事件是否有关联
PointerEvent.prototype.relate = function (event) {
  return this.pointerId === event.pointerId
}

// ******************************** 数据传送方法 ********************************

// 数据传送方法 - 隐藏拖拽图像
DataTransfer.prototype.hideDragImage = function IIFE() {
  const image = document.createElement('no-drag-image')
  return function () {
    this.setDragImage(image, 0, 0)
  }
}()

// ******************************** 节点列表方法 ********************************

// 节点列表 - 添加事件
NodeList.prototype.on = function (type, listener, options) {
  for (const element of this) {
    element.on(type, listener, options)
  }
  return this
}

// 节点列表 - 启用元素
NodeList.prototype.enable = function () {
  for (const element of this) {
    element.enable()
  }
}

// 节点列表 - 禁用元素
NodeList.prototype.disable = function () {
  for (const element of this) {
    element.disable()
  }
}

// ******************************** 舞台颜色类 ********************************

class StageColor {
  hex       //:string
  red       //:number
  green     //:number
  blue      //:number
  alpha     //:number
  onchange  //:function

  constructor(hex, onchange) {
    this.input(hex)
    this.onchange = onchange
  }

  // 读取颜色
  read() {
    return this.hex
  }

  // 输入颜色
  input(hex) {
    if (this.hex !== hex) {
      this.hex = hex
      this.red = parseInt(hex.slice(0, 2), 16) / 255
      this.green = parseInt(hex.slice(2, 4), 16) / 255
      this.blue = parseInt(hex.slice(4, 6), 16) / 255
      this.alpha = parseInt(hex.slice(6, 8), 16) / 255
      this.onchange?.()
    }
  }

  // 获取整数颜色
  getINTRGBA() {
    return INTRGBA(this.hex)
  }

  // 获取GL颜色
  getGLRGBA() {
    const sa = this.alpha
    const da = 1 - sa
    const rgba = StageColor.rgba
    rgba[0] = GL.BACKGROUND_RED * da + this.red * sa
    rgba[1] = GL.BACKGROUND_GREEN * da + this.green * sa
    rgba[2] = GL.BACKGROUND_BLUE * da + this.blue * sa
    return rgba
  }

  // 静态 - RGBA数组
  static rgba = new Float64Array(4)
}

// ******************************** 计时器类 ********************************

class Timer {
  playbackRate  //:number
  elapsed       //:number
  duration      //:number
  update        //:function
  callback      //:function

  constructor({duration, update, callback}) {
    this.playbackRate = 1
    this.elapsed = 0
    this.duration = duration
    this.update = update ?? Function.empty
    this.callback = callback ?? Function.empty
  }

  // 执行周期函数
  tick(deltaTime) {
    this.elapsed = Math.max(0, Math.min(this.duration,
      this.elapsed + deltaTime * this.playbackRate))
    if (this.update(this) === false) {
      this.remove()
      return
    }
    if (this.elapsed === (this.playbackRate > 0 ? this.duration : 0)) {
      this.finish()
      return
    }
  }

  // 结束
  finish() {
    if (this.callback(this) !== true) {
      this.remove()
    }
  }

  // 添加到列表
  add() {
    if (Timer.timers.append(this)) {
      Timer.play()
    }
    return this
  }

  // 从列表中删除
  remove() {
    Timer.timers.remove(this)
    return this
  }
}

// properties
Timer.timers = []
Timer.updaters = {
  stageAnimation: null,
  stageRendering: null,
  sharedAnimation: null,
  sharedRendering: null,
  sharedRendering2: null,
}
Timer.timestamp = 0
Timer.deltaTime = 0
Timer.frameCount = 0
Timer.frameTime = 0
Timer.tpf = Infinity
Timer.animationIndex = -1
Timer.animationWaiting = 0
// methods
Timer.initialize = null
Timer.start = null
Timer.update = null
Timer.play = null
Timer.appendUpdater = null
Timer.removeUpdater = null

// 初始化
Timer.initialize = function () {
  // 设置初始参数
  this.timestamp = 0
  this.deltaTime = 0
  this.frameCount = 0
  this.frameTime = 0
  this.tpf = Infinity

  // 监测其他窗口的状态
  // 在最大化时停止播放动画
  const windowOpen = event => {
    if (event.target.hasClass('maximized')) {
      this.animationWaiting++
    }
  }
  const windowClosed = event => {
    if (event.target.hasClass('maximized')) {
      this.animationWaiting--
    }
  }
  const windowMaximize = event => {
    this.animationWaiting++
  }
  const windowUnmaximize = event => {
    this.animationWaiting--
  }
  const windows = $('#event, #selector, #imageClip')
  windows.on('open', windowOpen)
  windows.on('closed', windowClosed)
  windows.on('maximize', windowMaximize)
  windows.on('unmaximize', windowUnmaximize)
}

// 开始动画
Timer.start = function (timestamp) {
  Timer.timestamp = timestamp - Timer.deltaTime
  Timer.update(timestamp)
}

// 更新动画
Timer.update = function (timestamp) {
  let deltaTime = timestamp - Timer.timestamp

  // 计算FPS相关数据
  Timer.frameCount++
  Timer.frameTime += deltaTime
  if (Timer.frameTime > 995) {
    Timer.tpf = Timer.frameTime / Timer.frameCount
    Timer.frameCount = 0
    Timer.frameTime = 0
  }

  // 修正间隔 - 减少跳帧视觉差异
  deltaTime = Math.min(deltaTime, Timer.tpf + 1, 35)

  // 更新属性
  Timer.timestamp = timestamp
  Timer.deltaTime = deltaTime

  // 更新计时器
  const {timers} = Timer
  let i = timers.length
  while (--i >= 0) {
    timers[i].tick(deltaTime)
  }

  // 更新更新器
  // 逐个获取更新器以便中途插入更新器
  const updaters = Timer.updaters
  const {stageAnimation} = updaters
  if (stageAnimation !== null &&
    Timer.animationWaiting === 0 &&
    document.hasFocus()) {
    stageAnimation(deltaTime)
  }
  const {stageRendering} = updaters
  if (stageRendering !== null) {
    stageRendering(deltaTime)
    updaters.stageRendering = null
  }
  const {sharedAnimation} = updaters
  if (sharedAnimation !== null &&
    Timer.animationWaiting === 0 &&
    document.hasFocus()) {
    sharedAnimation(deltaTime)
  }
  const {sharedRendering} = updaters
  if (sharedRendering !== null) {
    sharedRendering(deltaTime)
    updaters.sharedRendering = null
  }
  const {sharedRendering2} = updaters
  if (sharedRendering2 !== null) {
    sharedRendering2(deltaTime)
    updaters.sharedRendering2 = null
  }

  // 继续或结束动画
  if (Timer.timers.length > 0 ||
    stageAnimation !== null ||
    sharedAnimation !== null) {
    Timer.animationIndex = requestAnimationFrame(Timer.update)
  } else {
    Timer.animationIndex = -1
  }
}

// 播放动画
Timer.play = function () {
  if (this.animationIndex === -1) {
    this.animationIndex = requestAnimationFrame(this.start)
  }
}

// 添加更新器
Timer.appendUpdater = function (key, updater) {
  const updaters = this.updaters
  if (updaters[key] === null) {
    updaters[key] = updater
    this.play()
  }
}

// 移除更新器
Timer.removeUpdater = function (key, updater) {
  const updaters = this.updaters
  if (updaters[key] === updater) {
    updaters[key] = null
  }
}

// ******************************** 数学方法 ********************************

// 限定取值范围 - 范围不正确时返回较大的数(minimum)
Math.clamp = function IIFE() {
  const {max, min} = Math
  return (number, minimum, maximum) => {
    return max(min(number, maximum), minimum)
  }
}()

// 四舍五入到指定小数位
Math.roundTo = function IIFE() {
  const {round} = Math
  return (number, decimalPlaces) => {
    const ratio = 10 ** decimalPlaces
    return round(number * ratio) / ratio
  }
}()

// 返回两点距离
// 比 Math.hypot() 快很多
Math.dist = function IIFE() {
  const {sqrt} = Math
  return (x1, y1, x2, y2) => {
    return sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2)
  }
}()

// 计算指定范围的随机值
Math.randomBetween = function IIFE() {
  const {random} = Math
  return (value1, value2) => {
    return value1 + (value2 - value1) * random()
  }
}()

// 角度转弧度
Math.radians = function IIFE() {
  const factor = Math.PI / 180
  return degrees => {
    return degrees * factor
  }
}()

// 弧度转角度
Math.degrees = function IIFE() {
  const factor = 180 / Math.PI
  return radians => {
    return radians * factor
  }
}()

// 角度取余数 [0, 360)
Math.modDegrees = (degrees, period = 360) => {
  return degrees >= 0 ? degrees % period : (degrees % period + period) % period
}

// 弧度取余数 [0, 2π)
Math.modRadians = function IIFE() {
  const PI2 = Math.PI * 2
  return (radians, period = PI2) => {
    return radians >= 0 ? radians % period : (radians % period + period) % period
  }
}()

// ******************************** 其他 ********************************

// 测量文本大小
const measureText = function IIFE() {
  const size = {width: 0, lines: 0}
  const container = document.createElement('text')
  let appended = false
  let usedFont = ''
  let lineHeight = 0
  container.style.whiteSpace = 'pre'
  return function (text, font = '') {
    if (appended === false) {
      appended = true
      document.body.appendChild(container)
      container.textContent = 'a'
      lineHeight = container.offsetHeight
      Promise.resolve().then(() => {
        appended = false
        container.textContent = ''
        container.remove()
      })
    }
    if (usedFont !== font) {
      usedFont = font
      container.style.fontFamily = font ?? ''
    }
    container.textContent = text
    size.width = container.offsetWidth
    size.lines = container.offsetHeight / lineHeight
    return size
  }
}()

// 请求执行回调函数(过滤一帧内的重复事件)
const request = function IIFE() {
  const callbacks = []
  return function (callback) {
    if (callbacks.append(callback)) {
      requestAnimationFrame(() => {
        if (callbacks.remove(callback)) {
          callback()
        }
      })
    }
  }
}()

{
  // 拖拽状态
  let dragging = false
  let osdragging = false

  // 拖拽开始事件 - 阻止拖拽元素
  const dragstart = function (event) {
    dragging = true
    event.preventDefault()
    window.on('pointerup', pointerup)
  }

  // 拖拽结束事件 - 比指针弹起事件优先执行
  const dragend = function (event) {
    if (dragging) {
      dragging = false
      window.off('pointerup', pointerup)
    }
  }

  // 指针弹起事件 - 拖拽被阻止时的备用方案
  const pointerup = function (event) {
    if (dragging) {
      dragging = false
      window.off('pointerup', pointerup)
    }
  }

  // 拖拽进入事件
  const dragenter = function (event) {
    if (!dragging &&
      !osdragging &&
      !event.relatedTarget) {
      osdragging = true
      window.dispatchEvent(
        new DragEvent('os-dragstart')
      )
      window.on('dragleave', dragleave)
      window.on('dragover', dragover)
      window.on('drop', drop)
    }
  }

  // 拖拽离开事件
  const dragleave = function (event) {
    if (osdragging &&
      !event.relatedTarget) {
      osdragging = false
      window.dispatchEvent(
        new DragEvent('os-dragend')
      )
      window.off('dragleave', dragleave)
      window.off('dragover', dragover)
      window.off('drop', drop)
    }
  }

  // 拖拽悬停事件
  const dragover = function (event) {
    event.preventDefault()
  }

  // 拖拽释放事件
  // 停止冒泡会拦截该事件
  const drop = function (event) {
    if (osdragging) {
      osdragging = false
      window.dispatchEvent(
        new DragEvent('os-dragend')
      )
      window.off('dragleave', dragleave)
      window.off('dragover', dragover)
      window.off('drop', drop)
    }
  }

  // 初始化
  window.on('dragstart', dragstart)
  window.on('dragend', dragend)
  window.on('dragenter', dragenter)
}

// CSS 选择器
const $ = function IIFE() {
  const regexp = /^#(\w|-)+$/
  return function (selector) {
    if (regexp.test(selector)) {
      return document.querySelector(selector)
    } else {
      return document.querySelectorAll(selector)
    }
  }
}()

// 获取元素读取器
const getElementReader = function (prefix) {
  return function (suffix) {
    return $(`#${prefix}-${suffix}`).read()
  }
}

// 获取元素写入器
const getElementWriter = function (prefix, bindingObject) {
  return function (suffix, value) {
    if (value === undefined) {
      const nodes = typeof suffix === 'string'
                  ? suffix.split('-')
                  : [suffix]
      value = bindingObject
      for (const node of nodes) {
        value = value[node]
      }
    }
    $(`#${prefix}-${suffix}`).write(value)
  }
}

// 生成整数颜色
const INTRGBA = function (hex) {
  const r = parseInt(hex.slice(0, 2), 16)
  const g = parseInt(hex.slice(2, 4), 16)
  const b = parseInt(hex.slice(4, 6), 16)
  const a = parseInt(hex.slice(6, 8), 16)
  return r + (g + (b + a * 256) * 256) * 256
}

// 生成CSS颜色
const CSSRGBA = function (hex) {
  const r = parseInt(hex.slice(0, 2), 16)
  const g = parseInt(hex.slice(2, 4), 16)
  const b = parseInt(hex.slice(4, 6), 16)
  const a = parseInt(hex.slice(6, 8), 16)
  return `rgba(${r}, ${g}, ${b}, ${a})`
}

// ******************************** 剪贴板对象 ********************************

// 检查缓冲区
Clipboard.has = function (format) {
  const {clipboard} = require('electron')
  const buffer = clipboard.readBuffer(format)
  return buffer.length !== 0
}

// 检查文本
// Clipboard.hasText = function () {
//   const {clipboard} = require('electron')
//   return clipboard.readText() !== ''
// }

// 读取缓冲区
Clipboard.read = function (format) {
  const {clipboard} = require('electron')
  const buffer = clipboard.readBuffer(format)
  const string = buffer.toString()
  return string ? JSON.parse(string) : null
}

// 写入缓冲区
Clipboard.write = function (format, object) {
  const {clipboard} = require('electron')
  const string = JSON.stringify(object)
  const buffer = Buffer.from(string)
  clipboard.writeBuffer(format, buffer)
}

// ******************************** 禁用撤销和重做 ********************************

window.on('keydown', function (event) {
  if (event.cmdOrCtrlKey) {
    switch (event.code) {
      case 'KeyZ':
      case 'KeyY':
        event.preventDefault()
        break
      case 'KeyA':
        // 当存在css(user-select: text)元素时
        // 全选将选中该元素和文本框在内的所有文本块
        if (document.activeElement instanceof HTMLInputElement ||
          document.activeElement instanceof HTMLTextAreaElement) {
          break
        } else {
          event.preventDefault()
        }
        break
    }
  }
  // 监听空格键的按下状态
  switch (event.code) {
    case 'Space':
      Event.prototype.spaceKey = true
      break
  }
}, {capture: true})

window.on('keyup', function (event) {
  // 监听空格键的弹起状态
  switch (event.code) {
    case 'Space':
      Event.prototype.spaceKey = false
      break
  }
}, {capture: true})

// ******************************** 检测设备像素比例 ********************************

// 侦听像素比率改变事件
window.on('resize', function IIFE() {
  let dpr = window.devicePixelRatio
  return event => {
    if (dpr !== window.devicePixelRatio) {
      dpr = window.devicePixelRatio
      window.dispatchEvent(new Event('dprchange'))
    }
  }
}())

// 如果是MacOS系统，改变样式
if (process.platform === 'darwin') {
  document.documentElement.classList.add('darwin')
}