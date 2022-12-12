"use strict"

import { IHTMLElement } from "../yami"

// ******************************** 页面管理器 ********************************

class PageManager extends IHTMLElement {
  index: string
  active: IHTMLElement
  switchEventEnabled: boolean

  constructor() {
    super()

    // 处理子元素
    const elements = this.childNodes
    if (elements.length > 0) {
      let i = elements.length
      while (--i >= 0) {
        const element = elements[i]
        if (element.tagName === 'PAGE-FRAME') {
          element.dataValue = element.getAttribute('value')
        } else {
          this.removeChild(element)
        }
      }
    }

    // 设置属性
    this.index = null
    this.active = null
    this.switchEventEnabled = false
  }

  // 切换页面
  switch(value) {
    const last = this.index
    if (last !== value) {
      let target = null
      if (value !== null) {
        for (const element of this.childNodes) {
          if (element.dataValue === value) {
            target = element
            break
          }
        }
      }
      const active = this.active
      if (active !== target) {
        this.index = value
        this.active = target
        active?.removeClass('visible')
        target?.addClass('visible')
        // if (target) {
        //   this.scrollLeft = 0
        //   this.scrollTop = 0
        // }
        if (this.switchEventEnabled) {
          const event = new Event('switch')
          event.last = last
          event.value = value
          this.dispatchEvent(event)
        }
        active?.dispatchResizeEvent()
        target?.dispatchResizeEvent()
      }
    }
  }

  // 添加事件
  on(type: string, listener: EventListenerOrEventListenerObject | null, options?: boolean | AddEventListenerOptions) {
    super.on(type, listener, options)
    switch (type) {
      case 'switch':
        this.switchEventEnabled = true
        break
    }
  }
}

customElements.define('page-manager', PageManager)

interface JSXPageManager { [attributes: string]: any }

// ******************************** 页面管理器导出 ********************************

export {
  PageManager,
  JSXPageManager
}
