"use strict"

import {
  MouseKeyboardEvent,
  Function_empty_t
} from "../yami"

// ******************************** 计时器管理类 ********************************

interface ITimer {
  timers: Timer[]
  updaters: {
    stageAnimation: Timer_updater_value_t | null
    stageRendering: Timer_updater_value_t | null
    sharedAnimation: Timer_updater_value_t | null
    sharedRendering: Timer_updater_value_t | null
    sharedRendering2: Timer_updater_value_t | null
  }
  timestamp: number
  deltaTime: number
  frameCount: number
  frameTime: number
  tpf: number
  animationIndex: number
  animationWaiting: number

  initialize(): void
  start(timestamp: number): void
  update(timestamp: number): void
  play(): void
  appendUpdater(key: Timer_updater_key_t, updater: Timer_updater_value_t): void
  removeUpdater(key: Timer_updater_key_t, updater: Timer_updater_value_t): void
}

type Timer_update_func = (timer: Timer) => boolean
type Timer_callback_func = (timer: Timer) => boolean

const TimerManager = <ITimer>new Object()

// ******************************** 计时器类 ********************************

class Timer {
  speedX: number
  speedY: number
  playbackRate: number
  elapsed: number
  duration: number
  update: Timer_update_func | Function_empty_t
  callback: Timer_callback_func | Function_empty_t
  target: HTMLElement | null
  running: boolean

  constructor(params: {duration: number, update: Timer_update_func | Function_empty_t, callback: Timer_callback_func | Function_empty_t}) {
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
    if (TimerManager.timers.append(this)) {
      TimerManager.play()
    }
    return this
  }

  // 从列表中删除
  remove() {
    TimerManager.timers.remove(this)
    return this
  }
}

type Timer_updater_value_t = (deltaTime: number) => void
type Timer_updater_key_t = 'stageAnimation' |
                  'stageRendering' |
                  'sharedAnimation' |
                  'sharedRendering' |
                  'sharedRendering2'

// properties
TimerManager.timers = Array.empty()
TimerManager.updaters = {
  stageAnimation: null,
  stageRendering: null,
  sharedAnimation: null,
  sharedRendering: null,
  sharedRendering2: null,
}
TimerManager.timestamp = 0
TimerManager.deltaTime = 0
TimerManager.frameCount = 0
TimerManager.frameTime = 0
TimerManager.tpf = Infinity
TimerManager.animationIndex = -1
TimerManager.animationWaiting = 0

// 初始化
TimerManager.initialize = function () {
  // 设置初始参数
  this.timestamp = 0
  this.deltaTime = 0
  this.frameCount = 0
  this.frameTime = 0
  this.tpf = Infinity

  // 监测其他窗口的状态
  // 在最大化时停止播放动画
  const windowOpen = (event: MouseKeyboardEvent) => {
    const target = event.target
    if (target && target.hasClass('maximized')) {
      this.animationWaiting++
    }
  }
  const windowClosed = (event: MouseKeyboardEvent) => {
    const target = event.target
    if (target && target.hasClass('maximized')) {
      this.animationWaiting--
    }
  }
  const windowMaximize = (event: MouseKeyboardEvent) => {
    this.animationWaiting++
  }
  const windowUnmaximize = (event: MouseKeyboardEvent) => {
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
TimerManager.start = function (timestamp) {
  TimerManager.timestamp = timestamp - TimerManager.deltaTime
  TimerManager.update(timestamp)
}

// 更新动画
TimerManager.update = function (timestamp) {
  let deltaTime = timestamp - TimerManager.timestamp

  // 计算FPS相关数据
  TimerManager.frameCount++
  TimerManager.frameTime += deltaTime
  if (TimerManager.frameTime > 995) {
    TimerManager.tpf = TimerManager.frameTime / TimerManager.frameCount
    TimerManager.frameCount = 0
    TimerManager.frameTime = 0
  }

  // 修正间隔 - 减少跳帧视觉差异
  deltaTime = Math.min(deltaTime, TimerManager.tpf + 1, 35)

  // 更新属性
  TimerManager.timestamp = timestamp
  TimerManager.deltaTime = deltaTime

  // 更新计时器
  const {timers} = TimerManager
  let i = timers.length
  while (--i >= 0) {
    timers[i].tick(deltaTime)
  }

  // 更新更新器
  // 逐个获取更新器以便中途插入更新器
  const updaters = TimerManager.updaters
  const {stageAnimation} = updaters
  if (stageAnimation !== null &&
    TimerManager.animationWaiting === 0 &&
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
    TimerManager.animationWaiting === 0 &&
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
  if (TimerManager.timers.length > 0 ||
    stageAnimation !== null ||
    sharedAnimation !== null) {
    TimerManager.animationIndex = requestAnimationFrame(TimerManager.update)
  } else {
    TimerManager.animationIndex = -1
  }
}

// 播放动画
TimerManager.play = function () {
  if (this.animationIndex === -1) {
    this.animationIndex = requestAnimationFrame(this.start)
  }
}

// 添加更新器
TimerManager.appendUpdater = function (key, updater) {
  const {updaters} = this
  if (updaters[key] === null) {
    updaters[key] = updater
    this.play()
  }
}

// 移除更新器
TimerManager.removeUpdater = function (key, updater) {
  const {updaters} = this
  if (updaters[key] === updater) {
    updaters[key] = null
  }
}

// ******************************** 计时器类导出 ********************************

export {
  Timer,
  TimerManager
}
