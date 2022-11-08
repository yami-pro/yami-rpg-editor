'use strict'

import { Window } from '../yami.js'

// ******************************** 标题栏 ********************************

class TitleBar extends HTMLElement {
  dragging //:event

  constructor() {
    super()

    // 设置属性
    this.dragging = null

    // 侦听事件
    this.on('pointerdown', this.pointerdown)
    this.on('click', this.mouseclick)
    this.on('doubleclick', this.doubleclick)
  }

  // 指针按下事件
  pointerdown(event) {
    if (this.dragging) {
      return
    }
    switch (event.button) {
      case 0:
        if (event.target instanceof TitleBar) {
          const windowFrame = this.parentNode
          const rect = windowFrame.rect()
          const startX = event.clientX
          const startY = event.clientY
          const {left, top, width, height} = rect
          const pointermove = event => {
            if (this.dragging.relate(event)) {
              let right = window.innerWidth - width
              let bottom = window.innerHeight - height
              if (document.body.hasClass('border')) {
                // left和top的偏移由css:margin来填充
                const dpx = 1 / window.devicePixelRatio
                right -= dpx * 2
                bottom -= dpx * 2
              }
              const x = CSS.rasterize(left - startX + event.clientX)
              const y = CSS.rasterize(top - startY + event.clientY)
              windowFrame.style.left = `${Math.clamp(x, 0, right)}px`
              windowFrame.style.top = `${Math.clamp(y, 0, bottom)}px`
            }
          }
          const pointerup = event => {
            if (this.dragging.relate(event)) {
              cancel()
            }
          }
          const cancel = event => {
            this.dragging = null
            window.off('pointermove', pointermove)
            window.off('pointerup', pointerup)
            window.off('blur', cancel)
          }
          this.dragging = event
          event.cancel = cancel
          window.on('pointermove', pointermove)
          window.on('pointerup', pointerup)
          window.on('blur', cancel)
        }
        break
    }
  }

  // 鼠标点击事件
  mouseclick(event) {
    switch (event.target.tagName) {
      case 'MAXIMIZE': {
        const windowFrame = this.parentNode
        if (!windowFrame.hasClass('maximized')) {
          windowFrame.maximize()
        } else {
          windowFrame.unmaximize()
        }
        break
      }
      case 'CLOSE': {
        const windowFrame = this.parentNode
        Window.close(windowFrame.id)
        break
      }
    }
  }

  // 鼠标双击事件
  doubleclick(event) {
    if (event.target instanceof TitleBar &&
      event.target.querySelector('maximize')) {
      this.dragging?.cancel()
      const windowFrame = this.parentNode
      if (!windowFrame.hasClass('maximized')) {
        windowFrame.maximize()
      } else {
        windowFrame.unmaximize()
      }
    }
  }
}

customElements.define('title-bar', TitleBar)

// ******************************** 标题栏导出 ********************************

export { TitleBar }
