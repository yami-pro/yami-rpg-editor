'use strict'

import { Timer } from '../yami'

// ******************************** 历史操作计时器 ********************************

const HistoryTimer = new Timer({
  duration: 2000,
  callback: timer => {
    timer.complete = true
  }
})

// 初始状态
HistoryTimer.complete = true

// 开始计时
HistoryTimer.start = function (type) {
  if (this.complete) {
    this.complete = false
    this.add()
  }
  this.type = type
  this.elapsed = 0
}

// 完成计时
HistoryTimer.finish = function () {
  if (!this.complete) {
    this.complete = true
    this.remove()
  }
}

// ******************************** 历史操作计时器导出 ********************************

export { HistoryTimer }
