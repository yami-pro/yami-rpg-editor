'use strict'

import { Timer } from '../yami.js'

// ******************************** 滚动侦听器 ********************************

{
  let target = null
  let highSpeed = 0
  let lowSpeed = 0
  let scrollHorizontal = false
  let scrollVertical = false
  let scrollUpdater = null

  // 计算滚动距离
  const computeScrollDelta = speed => {
    let delta = speed * Timer.deltaTime
    const dpr = window.devicePixelRatio
    const tolerance = 0.0001
    // 修正数值让正反方向每帧的滚动距离相等
    if (delta > 0) {
      return Math.max(Math.floor(delta), 1) / dpr + tolerance
    }
    if (delta < 0) {
      return Math.min(Math.ceil(delta), -1) / dpr + tolerance
    }
    return 0
  }

  // 滚动检测计时器
  const timer = new Timer({
    duration: Infinity,
    update: timer => {
      const {speedX, speedY} = timer
      const {scrollLeft, scrollTop} = target
      if (speedX !== 0) {
        target.scrollLeft += computeScrollDelta(speedX)
      }
      if (speedY !== 0) {
        target.scrollTop += computeScrollDelta(speedY)
      }
      if (target.scrollLeft !== scrollLeft ||
        target.scrollTop !== scrollTop) {
        scrollUpdater()
      }
    }
  })

  // 指针移动事件
  const pointermove = event => {
    const dpr = window.devicePixelRatio
    const rect = target.rect()
    const x = event.clientX
    const y = event.clientY
    const l = rect.left
    const t = rect.top
    const cr = target.clientWidth + l
    const cb = target.clientHeight + t
    // 对于非100%像素分辨率cr和cb偏大
    const r = Math.min(rect.right, cr) - dpr
    const b = Math.min(rect.bottom, cb) - dpr
    const scrollSpeedX = scrollHorizontal
    ? x <= l ? l - x < 100 / dpr ? -lowSpeed : -highSpeed
    : x >= r ? x - r < 100 / dpr ? +lowSpeed : +highSpeed
    : 0
    : 0
    const scrollSpeedY = scrollVertical
    ? y <= t ? t - y < 100 / dpr ? -lowSpeed : -highSpeed
    : y >= b ? y - b < 100 / dpr ? +lowSpeed : +highSpeed
    : 0
    : 0
    if (scrollSpeedX !== 0 || scrollSpeedY !== 0) {
      if (timer.speedX !== scrollSpeedX ||
        timer.speedY !== scrollSpeedY) {
        timer.speedX = scrollSpeedX
        timer.speedY = scrollSpeedY
        timer.add()
      }
    } else if (timer) {
      timer.speedX = 0
      timer.speedY = 0
      timer.remove()
    }
  }

  // 添加滚动侦听器
  HTMLElement.prototype.addScrollListener = function (mode, speed, shift, updater) {
    target?.removeScrollListener()
    target = this
    switch (mode) {
      case 'horizontal':
        scrollHorizontal = true
        scrollVertical = false
        break
      case 'vertical':
        scrollHorizontal = false
        scrollVertical = true
        break
      case 'both':
        scrollHorizontal = true
        scrollVertical = true
        break
    }
    highSpeed = speed
    lowSpeed = shift ? speed / 4 : speed
    scrollUpdater = updater ?? Function.empty
    window.on('pointermove', pointermove)
  }

  // 移除滚动侦听器
  HTMLElement.prototype.removeScrollListener = function () {
    if (target !== this) return
    if (timer.speedX || timer.speedY) {
      timer.speedX = 0
      timer.speedY = 0
      timer.remove()
    }
    target = null
    scrollUpdater = null
    window.off('pointermove', pointermove)
  }
}
