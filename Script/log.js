'use strict'

// ******************************** 日志窗口 ********************************

const Log = {
  // properties
  data: [],
  devmode: false,
  beep: false,
  beepdate: 0,
  // methods
  initialize: null,
  throw: null,
  error: null,
  update: null,
  message: null,
  // events
  windowOpen: null,
  windowClosed: null,
  catchError: null,
}

// 初始化
Log.initialize = function () {
  // 侦听拖拽滚动条事件
  $('#log-list').listenDraggingScrollbarEvent()

  // 侦听事件
  window.on('error', this.catchError)
  $('#log').on('open', this.windowOpen)
  $('#log').on('closed', this.windowClosed)
}

// 抛出错误
Log.throw = function (error) {
  if (this.devmode) {
    throw error
  }
}

// 输出错误
Log.error = function (message) {
  const data = this.data
  const item = data[data.length - 1]
  const date = Date.now()
  if (item?.text === message) {
    item.date = date
    item.count += 1
  } else {
    data.push({
      type: 'error',
      date: date,
      text: message,
      count: 1,
    })
  }
  if ($('#log').hasClass('open')) {
    this.update()
  } else {
    this.message(message)
  }
  if (this.beep && date - this.beepdate > 1000) {
    this.beepdate = date
    require('electron').shell.beep()
  }
}

// 更新日志列表
Log.update = function () {
  const list = $('#log-list').reload()
  const items = this.data
  const length = items.length
  for (let i = 0; i < length; i++) {
    const item = items[i]
    const count = Math.min(item.count, 99)
    const date = new Date(item.date)
    const h = date.getHours()
    const m = date.getMinutes()
    const s = date.getSeconds()
    const m2 = m.toString().padStart(2, '0')
    const s2 = s.toString().padStart(2, '0')
    const li = document.createElement('common-item')
    li.addClass(item.type)
    li.dataValue = i
    li.textContent = `[${h}:${m2}:${s2}] ${item.text}`
    if (count !== 1) {
      const counter = document.createElement('error-counter')
      counter.textContent = count.toString()
      li.appendChild(counter)
    }
    list.appendElement(li)
  }
  list.update()
}

// 显示错误消息
Log.message = function IIFE() {
  const box = $('#error-message')
  const timer = new Timer({
    duration: 6000,
    callback: timer => {
      box.textContent = ''
      box.removeClass('visible')
    }
  })
  return function (message) {
    box.textContent = message
    box.addClass('visible')
    box.removeClass('fadeout')
    // 强制刷新样式
    box.css().display
    box.addClass('fadeout')
    timer.elapsed = 0
    timer.add()
  }
}()

// 窗口打开事件
Log.windowOpen = function (event) {
  Log.update()
}

// 窗口关闭事件
Log.windowClosed = function (event) {
  $('#log-list').clear()
}

// 错误捕获事件
Log.catchError = function IIFE() {
  const regexp = /^Uncaught /
  return function (event) {
    if (Editor.state === 'open') {
      Log.error(event.message.replace(regexp, ''))
    }
  }
}()