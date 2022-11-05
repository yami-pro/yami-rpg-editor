'use strict'

import * as Yami from '../yami.js'

// ******************************** 细节概要 ********************************

class DetailSummary extends HTMLElement {
  constructor() {
    super()

    // 设置属性
    // this.tabIndex = -1

    // 侦听事件
    this.on('keydown', this.keydown)
    this.on('pointerdown', this.pointerdown)
  }

  // 开关父元素
  toggle() {
    const parent = this.parentNode
    if (parent instanceof Yami.DetailBox) {
      parent.toggle()
    }
  }

  // 键盘按下事件
  keydown(event) {
    switch (event.code) {
      case 'Enter':
      case 'NumpadEnter':
        if (!event.cmdOrCtrlKey &&
          !event.altKey) {
          this.toggle()
        }
        break
    }
  }

  // 指针按下事件
  pointerdown(event) {
    switch (event.button) {
      case 0:
        if (event.target === this) {
          this.toggle()
        }
        break
    }
  }
}

customElements.define('detail-summary', DetailSummary)

export { DetailSummary }
