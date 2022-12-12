"use strict"

import {
  Layout,
  TitleBar,
  Window,
  MouseKeyboardEvent
} from "../yami"

// ******************************** 窗口框架 ********************************

class WindowFrame extends HTMLElement {
  enableAmbient: boolean
  activeElement: HTMLElement
  focusableElements: HTMLElement[]
  windowResize: (event: MouseKeyboardEvent) => void
  openEventEnabled: boolean
  closeEventEnabled: boolean
  closedEventEnabled: boolean
  resizeEventEnabled: boolean
  maximizeEventEnabled: boolean
  unmaximizeEventEnabled: boolean

  constructor() {
    super()

    // 设置属性
    this.enableAmbient = true
    this.activeElement = null
    this.focusableElements = null
    this.windowResize = null
    this.openEventEnabled = false
    this.closeEventEnabled = false
    this.closedEventEnabled = false
    this.resizeEventEnabled = false
    this.maximizeEventEnabled = false
    this.unmaximizeEventEnabled = false
  }

  // 打开窗口
  open() {
    if (Window.frames.append(this)) {
      Window.ambient.update()
      this.addClass('open')
      this.computePosition()
      this.style.zIndex = Window.frames.length
      if (this.openEventEnabled) {
        this.dispatchEvent(new Event('open'))
      }
      if (this.resizeEventEnabled &&
        this.hasClass('maximized')) {
        this.dispatchEvent(new Event('resize'))
        window.on('resize', this.windowResize)
      }
    }
  }

  // 关闭窗口
  close() {
    if (this.closeEventEnabled &&
      !this.dispatchEvent(
        new Event('close', {
          cancelable: true
      }))) {
      return false
    }
    if (Window.frames.remove(this)) {
      Window.ambient.update()
      this.removeClass('open')
      if (this.closedEventEnabled) {
        this.dispatchEvent(new Event('closed'))
      }
      if (this.resizeEventEnabled &&
        this.hasClass('maximized')) {
        window.off('resize', this.windowResize)
      }
      // 快捷键操作不会触发 blur
      if (document.activeElement !== document.body) {
        document.activeElement.blur()
      }
      return true
    }
    return false
  }

  // 最大化窗口
  maximize() {
    if (this.addClass('maximized')) {
      this.style.left = '0'
      this.style.top = '0'
      if (this.maximizeEventEnabled) {
        this.dispatchEvent(new Event('maximize'))
      }
      if (this.resizeEventEnabled) {
        this.dispatchEvent(new Event('resize'))
        window.on('resize', this.windowResize)
      }
    }
  }

  // 取消最大化窗口
  unmaximize() {
    if (this.removeClass('maximized')) {
      this.computePosition()
      if (this.unmaximizeEventEnabled) {
        this.dispatchEvent(new Event('unmaximize'))
      }
      if (this.resizeEventEnabled) {
        this.dispatchEvent(new Event('resize'))
        window.off('resize', this.windowResize)
      }
    }
  }

  // 获得焦点
  focus() {
    if (this.removeClass('blur')) {
      this.removeClass('translucent')
      const elements = this.focusableElements
      for (const element of elements) {
        element.tabIndex += 1
      }
      this.focusableElements = null
      if (this.activeElement) {
        this.activeElement.focus()
        this.activeElement = null
      }
    }
  }

  // 失去焦点
  blur() {
    if (this.addClass('blur')) {
      if (!this.hasClass('opaque') &&
        !this.hasClass('maximized')) {
        this.addClass('translucent')
      }
      const selector = Layout.focusableSelector
      const elements = this.querySelectorAll(selector)
      for (const element of elements) {
        element.tabIndex -= 1
      }
      this.focusableElements = elements
      if (document.activeElement !== document.body) {
        this.activeElement = document.activeElement
        this.activeElement.blur()
      }
    }
  }

  // 计算位置
  computePosition() {
    const mode = this.getAttribute('mode')
    switch (mode ?? Window.positionMode) {
      case 'center':
        this.center()
        break
      case 'absolute': {
        const pos = Window.absolutePos
        this.absolute(pos.x, pos.y)
        break
      }
      case 'overlap': {
        const frames = Window.frames
        const parent = frames[frames.length - 2]
        this.overlap(parent)
        break
      }
    }
  }

  // 居中位置
  center() {
    const rect = this.rect()
    const x = CSS.rasterize((window.innerWidth - rect.width) / 2)
    const y = CSS.rasterize((window.innerHeight - rect.height) / 2)
    this.setPosition(x, y, rect)
  }

  // 绝对位置
  absolute(left, top) {
    const rect = this.rect()
    const x = CSS.rasterize(left)
    const y = CSS.rasterize(top)
    this.setPosition(x, y, rect)
  }

  // 堆叠位置
  overlap(parent) {
    const rect = this.rect()
    const {left, top} = parent.style
    const x = CSS.rasterize(parseFloat(left) + 24)
    const y = CSS.rasterize(parseFloat(top) + 24)
    this.setPosition(x, y, rect)
  }

  // 设置位置
  setPosition(x, y, rect) {
    // 应用窗口带边框需要减去1px的margin
    if (document.body.hasClass('border')) {
      const dpx = 1 / window.devicePixelRatio
      x -= dpx
      y -= dpx
    }
    const xMax = window.innerWidth - rect.width
    const yMax = window.innerHeight - rect.height
    this.style.left = `${Math.clamp(x, 0, xMax)}px`
    this.style.top = `${Math.clamp(y, 0, yMax)}px`
  }

  // 设置标题
  setTitle(text) {
    const titleBar = this.firstElementChild
    if (titleBar instanceof TitleBar) {
      for (const childNode of titleBar.childNodes) {
        if (childNode instanceof Text) {
          childNode.nodeValue = text
          return
        }
      }
    }
  }

  // 添加事件
  on(type: string, listener: EventListenerOrEventListenerObject | null, options?: boolean | AddEventListenerOptions) {
    super.on(type, listener, options)
    switch (type) {
      case 'open':
        this.openEventEnabled = true
        break
      case 'close':
        this.closeEventEnabled = true
        break
      case 'closed':
        this.closedEventEnabled = true
        break
      case 'resize':
        this.resizeEventEnabled = true
        this.windowResize = event => {
          this.dispatchEvent(new Event('resize'))
        }
        break
      case 'maximize':
        this.maximizeEventEnabled = true
        break
      case 'unmaximize':
        this.unmaximizeEventEnabled = true
        break
    }
  }
}

customElements.define('window-frame', WindowFrame)

interface JSXWindowFrame { [attributes: string]: any }

// ******************************** 窗口框架导出 ********************************

export {
  WindowFrame,
  JSXWindowFrame
}
