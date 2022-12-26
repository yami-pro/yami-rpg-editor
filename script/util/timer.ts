"use strict"

// ******************************** 声明 ********************************

namespace Type {
  export type empty = (() => void)
  export type update = (timer: Timer) => boolean
  export type callback = (timer: Timer) => boolean
  export type updater = (deltaTime: number) => void
  export type updaterKey = 'stageAnimation' |
                           'stageRendering' |
                           'sharedAnimation' |
                           'sharedRendering' |
                           'sharedRendering2'
  export type updaters = {
    stageAnimation: updater | null
    stageRendering: updater | null
    sharedAnimation: updater | null
    sharedRendering: updater | null
    sharedRendering2: updater | null
  }
}

// ******************************** 计时器类 ********************************

class Timer {
  speedX: number
  speedY: number
  playbackRate: number
  elapsed: number
  duration: number
  update: Type.update | Type.empty
  callback: Type.callback | Type.empty
  target: EventTarget | null
  running: boolean
  state: 'first' |
         'delay' |
         'repeat' |
         'wait' |
         'waiting' |
         'playing'

  constructor(params: {duration: number, update: Type.update | Type.empty, callback: Type.callback | Type.empty}) {
    const {duration, update, callback} = params
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

  // 静态属性
  static timers: Timer[] = []
  static updaters: Type.updaters = {
    stageAnimation: null,
    stageRendering: null,
    sharedAnimation: null,
    sharedRendering: null,
    sharedRendering2: null,
  }
  static timestamp: number = 0
  static deltaTime: number = 0
  static frameCount: number = 0
  static frameTime: number = 0
  static tpf: number = Infinity
  static animationIndex: number = -1
  static animationWaiting: number = 0

  // 静态方法
  // 初始化
  static initialize() {
    // 设置初始参数
    this.timestamp = 0
    this.deltaTime = 0
    this.frameCount = 0
    this.frameTime = 0
    this.tpf = Infinity

    // 监测其他窗口的状态
    // 在最大化时停止播放动画
    const windowOpen = (event: Event) => {
      const target = <HTMLElement>event.target
      if (target && target.hasClass('maximized')) {
        this.animationWaiting++
      }
    }
    const windowClosed = (event: Event) => {
      const target = <HTMLElement>event.target
      if (target && target.hasClass('maximized')) {
        this.animationWaiting--
      }
    }
    const windowMaximize = (event: Event) => {
      this.animationWaiting++
    }
    const windowUnmaximize = (event: Event) => {
      this.animationWaiting--
    }
    const windows = document.querySelectorAll('#event, #selector, #imageClip')
    if (windows) {
      windows.on('open', windowOpen)
      windows.on('closed', windowClosed)
      windows.on('maximize', windowMaximize)
      windows.on('unmaximize', windowUnmaximize)
    }
  }

  // 开始动画
  static start(timestamp: number) {
    Timer.timestamp = timestamp - Timer.deltaTime
    Timer.update(timestamp)
  }

  // 更新动画
  static update(timestamp: number) {
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
  static play() {
    if (this.animationIndex === -1) {
      this.animationIndex = requestAnimationFrame(this.start)
    }
  }

  // 添加更新器
  static appendUpdater(key: Type.updaterKey, updater: Type.updater) {
    const {updaters} = this
    if (updaters[key] === null) {
      updaters[key] = updater
      this.play()
    }
  }

  // 移除更新器
  static removeUpdater(key: Type.updaterKey, updater: Type.updater) {
    const {updaters} = this
    if (updaters[key] === updater) {
      updaters[key] = null
    }
  }
}

// ******************************** 计时器类导出 ********************************

export { Timer }
