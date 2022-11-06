'use strict'

import * as Yami from '../yami.js'

const {
  Cursor,
  Timer
} = Yami

// ******************************** 元素方法 ********************************

// 元素方法 - 读取数据
HTMLElement.prototype.read = function () {
  return this.dataValue
}

// 元素方法 - 写入数据
HTMLElement.prototype.write = function (value) {
  this.dataValue = value
}

// 元素方法 - 清除子元素
HTMLElement.prototype.clear = function () {
  this.textContent = ''
  return this
}

// 元素方法 - 启用元素
HTMLElement.prototype.enable = function () {
  this.removeClass('disabled')
}

// 元素方法 - 禁用元素
HTMLElement.prototype.disable = function () {
  this.addClass('disabled')
}

// 元素方法 - 检查类名
HTMLElement.prototype.hasClass = function (className) {
  return this.classList.contains(className)
}

// 元素方法 - 添加类名
HTMLElement.prototype.addClass = function (className) {
  if (!this.classList.contains(className)) {
    this.classList.add(className)
    return true
  }
  return false
}

// 元素方法 - 删除 Class
HTMLElement.prototype.removeClass = function (className) {
  if (this.classList.contains(className)) {
    this.classList.remove(className)
    return true
  }
  return false
}

// 元素方法 - 往上搜索目标元素
HTMLElement.prototype.seek = function (tagName, count = 1) {
  let element = this
  while (count-- > 0) {
    if (element.tagName !== tagName.toUpperCase() &&
      element.parentNode instanceof HTMLElement) {
      element = element.parentNode
      continue
    }
    break
  }
  return element
}

// 元素方法 - 返回计算后的 CSS 对象
HTMLElement.prototype.css = function () {
  return getComputedStyle(this)
}

// 元素方法 - 返回边框矩形对象
HTMLElement.prototype.rect = function () {
  return this.getBoundingClientRect()
}

// 元素方法 - 隐藏
HTMLElement.prototype.hide = function () {
  this.addClass('hidden')
  return this
}

// 元素方法 - 显示
HTMLElement.prototype.show = function () {
  this.removeClass('hidden')
  return this
}

// 元素方法 - 隐藏子元素
HTMLElement.prototype.hideChildNodes = function () {
  for (const childNode of this.childNodes) {
    childNode.hide()
  }
}

// 元素方法 - 显示子元素
HTMLElement.prototype.showChildNodes = function () {
  for (const childNode of this.childNodes) {
    childNode.show()
  }
}

// 元素方法 - 获得焦点
// 异步执行可以避免与指针按下行为起冲突
HTMLElement.prototype.getFocus = function (mode = null) {
  setTimeout(() => {
    this.focus()
    switch (mode) {
      case 'all':
        if (this.select) {
          this.select()
          this.scrollLeft = 0
        }
        break
      case 'end':
        if (typeof this.selectionStart === 'number') {
          const endIndex = this.value.length
          this.selectionStart = endIndex
          this.selectionEnd = endIndex
        }
        break
    }
  })
}

// 元素方法 - 设置工具提示
HTMLElement.prototype.setTooltip = function IIFE() {
  const tooltip = $('#tooltip')
  const capture = {capture: true}
  const timer = new Timer({
    duration: 0,
    callback: () => {
      if (state === 'waiting') {
        const {tip} = target
        if (!tip) {
          state = 'closed'
          window.off('keydown', close, capture)
          window.off('pointerdown', close, capture)
          return
        }
        state = 'open'
        tooltip.addClass('open')
        tooltip.textContent = target.tip
        const {width, height} = tooltip.rect()
        const right = window.innerWidth - width
        const bottom = window.innerHeight - height
        const x = Math.min(clientX + 10, right)
        const y = Math.min(clientY + 15, bottom)
        tooltip.style.left = `${x}px`
        tooltip.style.top = `${y}px`
        rect = tooltip.rect()
      }
    }
  })
  let state = 'closed'
  let target = null
  let rect = null
  let timeStamp = 0
  let clientX = 0
  let clientY = 0

  // 关闭
  const close = function () {
    switch (state) {
      case 'waiting':
      case 'open':
        state = 'closed'
        rect = null
        timer.remove()
        tooltip.removeClass('open')
        window.off('keydown', close, capture)
        window.off('pointerdown', close, capture)
        break
    }
  }

  // 指针移动事件
  const pointermove = function (event) {
    // 两个重叠元素时执行最上层的那个
    if (timeStamp === event.timeStamp) {
      return
    }
    timeStamp = event.timeStamp
    switch (state) {
      case 'closed':
        if (target !== this) {
          state = 'waiting'
          target = this
          timer.elapsed = 0
          timer.duration = 500
          timer.add()
          clientX = event.clientX
          clientY = event.clientY
          window.on('keydown', close, capture)
          window.on('pointerdown', close, capture)
        }
        break
      case 'waiting':
        if (target === this) {
          timer.elapsed = 0
          clientX = event.clientX
          clientY = event.clientY
        } else {
          close()
        }
        break
      case 'open':
        if (target === this) {
          const x = event.clientX
          const y = event.clientY
          const l = rect.left
          const r = rect.right
          const t = rect.top
          const b = rect.bottom
          if (x >= l && x < r && y >= t && y < b) {
            close()
          }
        } else {
          close()
        }
        break
    }
  }

  // 指针离开事件
  const pointerleave = function (event) {
    target = null
    close()
  }

  return function (tip) {
    if ('tip' in this === false) {
      this.on('pointermove', pointermove)
      this.on('pointerleave', pointerleave)
    }
    switch (typeof tip) {
      case 'string':
        this.tip = tip
        break
      case 'function':
        Object.defineProperty(this, 'tip', {
          configurable: true,
          get: tip,
        })
        break
    }
  }
}()

// 元素方法 - 添加滚动条
HTMLElement.prototype.addScrollbars = function () {
  const hBar = document.createElement('scroll-bar')
  const vBar = document.createElement('scroll-bar')
  const corner = document.createElement('scroll-corner')
  const parent = this.parentNode
  const next = this.nextSibling
  if (next) {
    parent.insertBefore(hBar, next)
    parent.insertBefore(vBar, next)
    parent.insertBefore(corner, next)
  } else {
    parent.appendChild(hBar)
    parent.appendChild(vBar)
    parent.appendChild(corner)
  }
  hBar.bind(this, 'horizontal')
  vBar.bind(this, 'vertical')

  // 鼠标滚轮事件
  const wheel = event => {
    this.dispatchEvent(
      new WheelEvent('wheel', event)
    )
  }
  hBar.on('wheel', wheel)
  vBar.on('wheel', wheel)
  corner.on('wheel', wheel)

  // 用户滚动事件
  // 使用自定义的userscroll代替内置的scroll有以下原因:
  // scroll是异步的，触发时机是在Promise后Animation前
  // 如果在Animation中滚动会推迟到下一帧触发事件
  // userscroll由于手动调用可以避免不需要触发的情况
  const userscroll = new Event('userscroll')

  // 添加方法 - 开始滚动
  this.beginScrolling = function () {
    hBar.addClass('dragging')
    vBar.addClass('dragging')
  }

  // 添加方法 - 结束滚动
  this.endScrolling = function () {
    hBar.removeClass('dragging')
    vBar.removeClass('dragging')
  }

  // 添加方法 - 设置滚动条位置
  this.setScroll = function (left, top) {
    const sl = this.scrollLeft
    const st = this.scrollTop
    this.scroll(left, top)
    if (this.scrollLeft !== sl ||
      this.scrollTop !== st) {
      this.dispatchEvent(userscroll)
    }
  }

  // 添加方法 - 设置滚动条左侧位置
  this.setScrollLeft = function (left) {
    const sl = this.scrollLeft
    this.scrollLeft = left
    if (this.scrollLeft !== sl) {
      this.dispatchEvent(userscroll)
    }
  }

  // 添加方法 - 设置滚动条顶部位置
  this.setScrollTop = function (top) {
    const st = this.scrollTop
    this.scrollTop = top
    if (this.scrollTop !== st) {
      this.dispatchEvent(userscroll)
    }
  }

  // 添加方法 - 更新滚动条
  let withCorner = false
  this.updateScrollbars = function () {
    if (this.clientWidth < this.scrollWidth &&
      this.clientHeight < this.scrollHeight) {
      if (!withCorner) {
        withCorner = true
        hBar.addClass('with-corner')
        vBar.addClass('with-corner')
        corner.addClass('visible')
      }
    } else {
      if (withCorner) {
        withCorner = false
        hBar.removeClass('with-corner')
        vBar.removeClass('with-corner')
        corner.removeClass('visible')
      }
    }
    hBar.updateHorizontalBar()
    vBar.updateVerticalBar()
  }
}

// 元素方法 - 添加设置滚动方法
HTMLElement.prototype.addSetScrollMethod = function () {
  // 用户滚动事件
  const userscroll = new Event('userscroll')

  // 添加方法 - 设置滚动条位置
  this.setScroll = function (left, top) {
    const sl = this.scrollLeft
    const st = this.scrollTop
    this.scroll(left, top)
    if (this.scrollLeft !== sl ||
      this.scrollTop !== st) {
      this.dispatchEvent(userscroll)
    }
  }
}

// 元素方法 - 检查是否出现滚动条
// 缩放率不是 100% 有可能出现
// clientWidth > scrollWidth
HTMLElement.prototype.hasScrollBar = function () {
  return this.clientWidth < this.scrollWidth ||
         this.clientHeight < this.scrollHeight
}

// 元素方法 - 判断事件坐标在内容区域上
HTMLElement.prototype.isInContent = function (event) {
  const coords = event.getRelativeCoords(this)
  const x = coords.x - this.scrollLeft
  const y = coords.y - this.scrollTop
  return x >= 0 && x < this.clientWidth &&
         y >= 0 && y < this.clientHeight
}

// 元素方法 - 发送改变事件
HTMLElement.prototype.dispatchChangeEvent = function IIFE() {
  const changes = [
    new Event('change', {bubbles: true}),
    new Event('change', {bubbles: true}),
  ]
  return function (index = 0) {
    this.dispatchEvent(changes[index])
  }
}()

// 元素方法 - 发送调整事件
HTMLElement.prototype.dispatchResizeEvent = function IIFE() {
  const resize = new Event('resize')
  return function () {
    this.dispatchEvent(resize)
  }
}()

// 元素方法 - 发送更新事件
HTMLElement.prototype.dispatchUpdateEvent = function IIFE() {
  const update = new Event('update')
  return function () {
    this.dispatchEvent(update)
  }
}()

// 元素方法 - 侦听拖拽滚动条事件
HTMLElement.prototype.listenDraggingScrollbarEvent = function IIFE() {
  // 默认指针按下事件
  const defaultPointerdown = function (event) {
    if (this.dragging) {
      return
    }
    switch (event.button) {
      case 0:
        if (event.altKey) {
          event.preventDefault()
          event.stopImmediatePropagation()
          this.dragging = event
          event.mode = 'scroll'
          event.scrollLeft = this.scrollLeft
          event.scrollTop = this.scrollTop
          Cursor.open('cursor-grab')
          window.on('pointerup', this.scrollPointerup)
          window.on('pointermove', this.scrollPointermove)
        }
        break
    }
  }

  // 指针弹起事件
  const pointerup = function (event) {
    const {dragging} = this
    if (dragging.relate(event)) {
      switch (dragging.mode) {
        case 'scroll':
          Cursor.close('cursor-grab')
          break
      }
      this.dragging = null
      window.off('pointerup', this.scrollPointerup)
      window.off('pointermove', this.scrollPointermove)
    }
  }

  // 指针移动事件
  const pointermove = function (event) {
    const {dragging} = this
    if (dragging.relate(event)) {
      switch (dragging.mode) {
        case 'scroll':
          this.scrollLeft = dragging.scrollLeft + dragging.clientX - event.clientX
          this.scrollTop = dragging.scrollTop + dragging.clientY - event.clientY
          break
      }
    }
  }

  return function (pointerdown = defaultPointerdown, options) {
    this.scrollPointerup = pointerup.bind(this)
    this.scrollPointermove = pointermove.bind(this)
    this.on('pointerdown', pointerdown, options)
  }
}()
