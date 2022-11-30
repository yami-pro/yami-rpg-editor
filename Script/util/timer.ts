'use strict'

// ******************************** 计时器类 ********************************

class ITimer {
  // properties
  timers = []
  updaters = {
    stageAnimation: null,
    stageRendering: null,
    sharedAnimation: null,
    sharedRendering: null,
    sharedRendering2: null,
  }
  timestamp = 0
  deltaTime = 0
  frameCount = 0
  frameTime = 0
  tpf = Infinity
  animationIndex = -1
  animationWaiting = 0

  // 初始化
  initialize() {
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
  start(timestamp) {
    this.timestamp = timestamp - this.deltaTime
    this.update(timestamp)
  }

  // 更新动画
  update(timestamp) {
    let deltaTime = timestamp - this.timestamp

    // 计算FPS相关数据
    this.frameCount++
    this.frameTime += deltaTime
    if (this.frameTime > 995) {
      this.tpf = this.frameTime / this.frameCount
      this.frameCount = 0
      this.frameTime = 0
    }

    // 修正间隔 - 减少跳帧视觉差异
    deltaTime = Math.min(deltaTime, this.tpf + 1, 35)

    // 更新属性
    this.timestamp = timestamp
    this.deltaTime = deltaTime

    // 更新计时器
    const {timers} = this
    let i = timers.length
    while (--i >= 0) {
      timers[i].tick(deltaTime)
    }

    // 更新更新器
    // 逐个获取更新器以便中途插入更新器
    const updaters = this.updaters
    const {stageAnimation} = updaters
    if (stageAnimation !== null &&
      this.animationWaiting === 0 &&
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
      this.animationWaiting === 0 &&
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
    if (this.timers.length > 0 ||
      stageAnimation !== null ||
      sharedAnimation !== null) {
      this.animationIndex = requestAnimationFrame(this.update)
    } else {
      this.animationIndex = -1
    }
  }

  // 播放动画
  play() {
    if (this.animationIndex === -1) {
      this.animationIndex = requestAnimationFrame(this.start)
    }
  }

  // 添加更新器
  appendUpdater(key, updater) {
    const updaters = this.updaters
    if (updaters[key] === null) {
      updaters[key] = updater
      this.play()
    }
  }

  // 移除更新器
  removeUpdater(key, updater) {
    const updaters = this.updaters
    if (updaters[key] === updater) {
      updaters[key] = null
    }
  }
}

class Timer {
  state: string | null
  playbackRate: number
  elapsed: number
  duration: number
  update: (timer: Timer) => boolean
  callback: (timer: Timer) => boolean

  private static instance: ITimer
  static getInstance() {
    if (!this.instance) {
      this.instance = new ITimer()
    }
    return this.instance
  }

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
    if (Timer.getInstance().timers.append(this)) {
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

// ******************************** 计时器类导出 ********************************

export { Timer }
