"use strict"

import { DetailSummary } from "../yami"

// ******************************** 细节框 ********************************

// 默认 details 的子元素无法正确获得 css 百分比高度属性
class DetailBox extends HTMLElement {
  toggleEventEnabled //:boolean

  constructor() {
    super()

    // 设置属性
    this.toggleEventEnabled = false
  }

  // 开关窗口
  toggle() {
    if (this.hasAttribute('open')) {
      this.close()
    } else {
      this.open()
    }
  }

  // 打开窗口
  open() {
    if (!this.hasAttribute('open')) {
      this.setAttribute('open', '')
      for (const node of this.children) {
        if (!(node instanceof DetailSummary)) {
          node.show()
        }
      }
      if (this.toggleEventEnabled) {
        const toggle = new Event('toggle')
        toggle.value = 'open'
        this.dispatchEvent(toggle)
      }
    }
  }

  // 关闭窗口
  close() {
    if (this.hasAttribute('open')) {
      this.removeAttribute('open')
      for (const node of this.children) {
        if (!(node instanceof DetailSummary)) {
          node.hide()
        }
      }
      if (this.toggleEventEnabled) {
        const toggle = new Event('toggle')
        toggle.value = 'closed'
        this.dispatchEvent(toggle)
      }
    }
  }

  // 添加事件
  on(type: string, listener: EventListenerOrEventListenerObject | null, options?: boolean | AddEventListenerOptions) {
    super.on(type, listener, options)
    switch (type) {
      case 'toggle':
        this.toggleEventEnabled = true
        break
    }
  }
}

customElements.define('detail-box', DetailBox)

// ******************************** 细节框导出 ********************************

export { DetailBox }
