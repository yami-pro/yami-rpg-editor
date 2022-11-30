'use strict'

// ******************************** 声明 ********************************

interface ITimer {
  timers: any
  updaters: any
  timestamp: number
  deltaTime: number
  frameCount: number
  frameTime: number
  tpf: any
  animationIndex: number
  animationWaiting: number

  initialize(): void
  start(timestamp: number): void
  update(timestamp: number): void
  play(): void
  appendUpdater(key: any, updater: any): void
  removeUpdater(key: any, updater: any): void
}

// ******************************** 计时器类 ********************************

class Timer {
  static instance = <ITimer>new Object()

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
  tick(deltaTime: number) {
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
    if (Timer.instance.timers.append(this)) {
      Timer.instance.play()
    }
    return this
  }

  // 从列表中删除
  remove() {
    Timer.instance.timers.remove(this)
    return this
  }
}

// properties
Timer.instance.timers = []
Timer.instance.updaters = {
  stageAnimation: null,
  stageRendering: null,
  sharedAnimation: null,
  sharedRendering: null,
  sharedRendering2: null,
}
Timer.instance.timestamp = 0
Timer.instance.deltaTime = 0
Timer.instance.frameCount = 0
Timer.instance.frameTime = 0
Timer.instance.tpf = Infinity
Timer.instance.animationIndex = -1
Timer.instance.animationWaiting = 0

// 初始化
Timer.instance.initialize = function () {
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
Timer.instance.start = function (timestamp) {
  Timer.instance.timestamp = timestamp - Timer.instance.deltaTime
  Timer.instance.update(timestamp)
}

// 更新动画
Timer.instance.update = function (timestamp) {
  let deltaTime = timestamp - Timer.instance.timestamp

  // 计算FPS相关数据
  Timer.instance.frameCount++
  Timer.instance.frameTime += deltaTime
  if (Timer.instance.frameTime > 995) {
    Timer.instance.tpf = Timer.instance.frameTime / Timer.instance.frameCount
    Timer.instance.frameCount = 0
    Timer.instance.frameTime = 0
  }

  // 修正间隔 - 减少跳帧视觉差异
  deltaTime = Math.min(deltaTime, Timer.instance.tpf + 1, 35)

  // 更新属性
  Timer.instance.timestamp = timestamp
  Timer.instance.deltaTime = deltaTime

  // 更新计时器
  const {timers} = Timer.instance
  let i = timers.length
  while (--i >= 0) {
    timers[i].tick(deltaTime)
  }

  // 更新更新器
  // 逐个获取更新器以便中途插入更新器
  const updaters = Timer.instance.updaters
  const {stageAnimation} = updaters
  if (stageAnimation !== null &&
    Timer.instance.animationWaiting === 0 &&
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
    Timer.instance.animationWaiting === 0 &&
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
  if (Timer.instance.timers.length > 0 ||
    stageAnimation !== null ||
    sharedAnimation !== null) {
    Timer.instance.animationIndex = requestAnimationFrame(Timer.instance.update)
  } else {
    Timer.instance.animationIndex = -1
  }
}

// 播放动画
Timer.instance.play = function () {
  if (this.animationIndex === -1) {
    this.animationIndex = requestAnimationFrame(this.start)
  }
}

// 添加更新器
Timer.instance.appendUpdater = function (key, updater) {
  const updaters = this.updaters
  if (updaters[key] === null) {
    updaters[key] = updater
    this.play()
  }
}

// 移除更新器
Timer.instance.removeUpdater = function (key, updater) {
  const updaters = this.updaters
  if (updaters[key] === updater) {
    updaters[key] = null
  }
}

// ******************************** 计时器类导出 ********************************

export { Timer }
