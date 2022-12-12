"use strict"

import {
  IPointerEvent,
  EventTarget_ext,
  Element_ext,
  Cursor,
  Timer,
  TimerManager,
  IFunction,
  commandsData,
  ScrollBarManager,
  FolderItem,
  FileItem
} from "../../yami"

// ******************************** 声明 ********************************

type tipVar = (...params: any[]) => any | {get: () => any}

interface HTMLElement_components_ext {
  // contents: any[] | null
  // dataKey: boolean
  // dataList: commandsData[] | null
  // dataItem: any
  // dataIndex: number
  // dataIndent: number
  // enabled: boolean

  // updaters: any[]

  range: Uint32Array
  // path: string
  versionId: number
  count: number
  // itemSize: number
  // visibleLines: number
  // normalCountPerLine: number
  // scrollCountPerLine: number
  // scrollCount: number
  // countPerLine: number
  // changed: boolean

  // file: FolderItem | FileItem
  // fileIcon: IHTMLElement
  // nameBox: IHTMLElement

  // isImageChanged: () => boolean
}

interface HTMLElement_object_ext {
  name: {get: () => any, set: (value: any) => void}
  innerHeight: number
}

interface HTMLElement_scroll_ext {
  addScrollListener: (mode: string, speed: number, shift: boolean, updater: () => void) => void
  removeScrollListener: () => void
}

interface HTMLElement_ext extends Element_ext {
  dragging: IPointerEvent | null
  dataValue: any

  _padding: number
  tip: string | tipVar
  top: number
  left: number
  width: number
  height: number
  visible: boolean

  read(): any
  write(value: any): void
  clear(): void
  enable(): void
  disable(): void
  hasClass(className: string): boolean
  addClass(className: string): boolean
  removeClass(className: string): boolean
  seek(tagName: string, count?: number): IHTMLElement
  css(): CSSStyleDeclaration
  rect(): DOMRect
  hide(): void
  show(): void
  hideChildNodes(): void
  showChildNodes(): void
  getFocus(mode: string): void
  setTooltip: (tip: string | tipVar) => void
  addScrollbars(): void
  addSetScrollMethod(): void
  hasScrollBar(): void
  dispatchChangeEvent: (index?: number) => void
  dispatchResizeEvent: () => void
  dispatchUpdateEvent: () => void
  listenDraggingScrollbarEvent: (pointerdown?: (event: IPointerEvent) => void, options?: any) => void

  beginScrolling(): void
  endScrolling(): void
  setScroll(left: number, top: number): void
  setScrollLeft(left: number): void
  setScrollTop(top: number):void
  updateScrollbars(): void

  scrollPointerup(this: IHTMLElement, event: IPointerEvent): void
  scrollPointermove(this: IHTMLElement, event: IPointerEvent): void
}

interface IHTMLElement extends HTMLElement, HTMLElement_ext, HTMLElement_object_ext, HTMLElement_scroll_ext, HTMLElement_components_ext, EventTarget_ext {}

// ******************************** 元素扩展 ********************************

const prototype = <IHTMLElement>HTMLElement.prototype

// 元素方法 - 读取数据
prototype.read = function () {
  return this.dataValue
}

// 元素方法 - 写入数据
prototype.write = function (value) {
  this.dataValue = value
}

// 元素方法 - 清除子元素
prototype.clear = function () {
  this.textContent = ''
  return this
}

// 元素方法 - 启用元素
prototype.enable = function () {
  this.removeClass('disabled')
}

// 元素方法 - 禁用元素
prototype.disable = function () {
  this.addClass('disabled')
}

// 元素方法 - 检查类名
prototype.hasClass = function (className) {
  return this.classList.contains(className)
}

// 元素方法 - 添加类名
prototype.addClass = function (className) {
  if (!this.classList.contains(className)) {
    this.classList.add(className)
    return true
  }
  return false
}

// 元素方法 - 删除 Class
prototype.removeClass = function (className) {
  if (this.classList.contains(className)) {
    this.classList.remove(className)
    return true
  }
  return false
}

// 元素方法 - 往上搜索目标元素
prototype.seek = function (tagName, count = 1) {
  let element = this
  while (count-- > 0) {
    if (element.tagName !== tagName.toUpperCase() &&
      element.parentNode instanceof HTMLElement) {
      element = <IHTMLElement>element.parentNode
      continue
    }
    break
  }
  return element
}

// 元素方法 - 返回计算后的 CSS 对象
prototype.css = function () {
  return getComputedStyle(this)
}

// 元素方法 - 返回边框矩形对象
prototype.rect = function () {
  return this.getBoundingClientRect()
}

// 元素方法 - 隐藏
prototype.hide = function () {
  this.addClass('hidden')
  return this
}

// 元素方法 - 显示
prototype.show = function () {
  this.removeClass('hidden')
  return this
}

// 元素方法 - 隐藏子元素
prototype.hideChildNodes = function () {
  this.childNodes.forEach(
    childNode => (<IHTMLElement>childNode).hide()
  )
}

// 元素方法 - 显示子元素
prototype.showChildNodes = function () {
  this.childNodes.forEach(
    childNode => (<IHTMLElement>childNode).show()
  )
}

// 元素方法 - 设置工具提示
prototype.setTooltip = function IIFE() {
  const tooltip = $('#tooltip')
  const capture = {capture: true}

  let state = 'closed'
  let target: IHTMLElement | null = null
  let rect: DOMRect | null = null
  let timeStamp = 0
  let clientX = 0
  let clientY = 0

  const timer = new Timer({
    duration: 0,
    update: IFunction.empty,
    callback: () => {
      if (state === 'waiting' && target) {
        const {tip} = target
        if (!tip) {
          state = 'closed'
          window.off('keydown', close, capture)
          window.off('pointerdown', close, capture)
          return
        }
        state = 'open'
        if (tooltip !== null) {
          tooltip.addClass('open')
          tooltip.textContent = <string>target.tip
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
    }
  })

  // 关闭
  const close = function () {
    switch (state) {
      case 'waiting':
      case 'open':
        state = 'closed'
        rect = null
        timer.remove()
        tooltip?.removeClass('open')
        window.off('keydown', close, capture)
        window.off('pointerdown', close, capture)
        break
    }
  }

  // 指针移动事件
  const pointermove = function (this: IHTMLElement, event: MouseEvent) {
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
        if (target === this && event && rect) {
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
  const pointerleave = function (event: MouseEvent) {
    target = null
    close()
  }

  return function (this: IHTMLElement, tip: string | tipVar) {
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
prototype.addScrollbars = function () {
  ScrollBarManager.addScrollbars(this)
}

// 元素方法 - 添加设置滚动方法
prototype.addSetScrollMethod = function () {
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
prototype.hasScrollBar = function () {
  return this.clientWidth < this.scrollWidth ||
         this.clientHeight < this.scrollHeight
}

// 元素方法 - 发送改变事件
prototype.dispatchChangeEvent = function IIFE() {
  const changes = [
    new Event('change', {bubbles: true}),
    new Event('change', {bubbles: true}),
  ]
  return function (this: IHTMLElement, index = 0) {
    this.dispatchEvent(changes[index])
  }
}()

// 元素方法 - 发送调整事件
prototype.dispatchResizeEvent = function IIFE() {
  const resize = new Event('resize')
  return function (this: IHTMLElement) {
    this.dispatchEvent(resize)
  }
}()

// 元素方法 - 发送更新事件
prototype.dispatchUpdateEvent = function IIFE() {
  const update = new Event('update')
  return function (this: IHTMLElement) {
    this.dispatchEvent(update)
  }
}()

// 元素方法 - 侦听拖拽滚动条事件
prototype.listenDraggingScrollbarEvent = function IIFE() {
  // 默认指针按下事件
  const defaultPointerdown = function (this: IHTMLElement, event: IPointerEvent) {
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
  const pointerup = function (this: IHTMLElement, event: IPointerEvent) {
    const {dragging} = this
    if (dragging?.relate(event)) {
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
  const pointermove = function (this: IHTMLElement, event: IPointerEvent) {
    const {dragging} = this
    if (dragging?.relate(event)) {
      switch (dragging.mode) {
        case 'scroll':
          this.scrollLeft = dragging.scrollLeft + dragging.clientX - event.clientX
          this.scrollTop = dragging.scrollTop + dragging.clientY - event.clientY
          break
      }
    }
  }

  return function (this: IHTMLElement, pointerdown = defaultPointerdown, options) {
    this.scrollPointerup = pointerup.bind(this)
    this.scrollPointermove = pointermove.bind(this)
    this.on('pointerdown', pointerdown, options)
  }
}()

// ******************************** 元素访问器 ********************************

// 元素访问器 - 名称
Object.defineProperty(
  prototype, 'name', {
    get: function (this: IHTMLElement) {
      return this.getAttribute('name')
    },
    set: function (this: IHTMLElement, value: string) {
      this.setAttribute('name', value)
    },
  }
)

// 元素访问器 - 内部高度
Object.defineProperty(
  prototype, 'innerHeight', {
    get: function (this: IHTMLElement) {
      let padding = this._padding
      if (padding === undefined) {
        const css = this.css()
        const pt = parseInt(css.paddingTop)
        const pb = parseInt(css.paddingBottom)
        padding = this._padding = pt + pb
      }
      const outerHeight = this.clientHeight
      const innerHeight = outerHeight - padding
      return Math.max(innerHeight, 0)
    }
  }
)

// ******************************** 滚动侦听器 ********************************

type scrollUpdaterVar = (() => void) | null
{
  let target: IHTMLElement | null = null
  let highSpeed = 0
  let lowSpeed = 0
  let scrollHorizontal = false
  let scrollVertical = false
  let scrollUpdater: scrollUpdaterVar = null

  // 计算滚动距离
  const computeScrollDelta = (speed: number) => {
    let delta = speed * TimerManager.deltaTime
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
    callback: IFunction.empty,
    update: timer => {
      if (!target)
        return false
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
        if (scrollUpdater)
          scrollUpdater()
      }
      return true
    }
  })

  // 指针移动事件
  const pointermove = (event: PointerEvent) => {
    if (!target)
      return
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
  prototype.addScrollListener = function (mode, speed, shift, updater) {
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
    scrollUpdater = updater ?? IFunction.empty
    window.on('pointermove', pointermove)
  }

  // 移除滚动侦听器
  prototype.removeScrollListener = function () {
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

interface IHTMLElementConstructor {
  new(): IHTMLElement
  prototype: IHTMLElement
}

const IHTMLElement = <IHTMLElementConstructor>HTMLElement

interface JSXHTMLElement { [attributes: string]: any }

export {
  IHTMLElement,
  HTMLElement_ext,
  HTMLElement_scroll_ext,
  JSXHTMLElement
}
