"use strict"

// ******************************** 拖放提示 ********************************

class DragAndDropHint extends HTMLElement {
  left    //:number
  top     //:number
  width   //:number
  height  //:number
  upper   //:boolean

  constructor() {
    super()

    // 设置属性
    this.left = 0
    this.top = 0
    this.width = 0
    this.height = 0
  }

  // 测量位置
  measure(item) {
    const parent = this.parentNode
    let bl = parent.borderLeft
    let bt = parent.borderTop
    if (bl === undefined) {
      const css = parent.css()
      bl = parseInt(css.borderLeftWidth)
      bt = parseInt(css.borderTopWidth)
      parent.borderLeft = bl
      parent.borderTop = bt
    }
    const pRect = parent.rect()
    const tRect = item.rect()
    const left = tRect.left - pRect.left - bl
    const top = tRect.top - pRect.top - bt
    const width = tRect.width
    const height = tRect.height
    return {left, top, width, height}
  }

  // 向上移动
  moveUp() {
    if (!this.upper) {
      this.upper = true
      this.style.zIndex = '1'
    }
    return this
  }

  // 向下移动
  moveDown() {
    if (this.upper) {
      this.upper = false
      this.style.zIndex = ''
    }
    return this
  }

  // 设置位置
  set({left, top, width, height}) {
    if (this.left !== left ||
      this.top !== top ||
      this.width !== width ||
      this.height !== height) {
      this.left = left
      this.top = top
      this.width = width
      this.height = height
      this.style.left = `${left}px`
      this.style.top = `${top}px`
      this.style.width = `${width}px`
      this.style.height = `${height}px`
    }
  }
}

customElements.define('drag-and-drop-hint', DragAndDropHint)

// ******************************** 拖放提示导出 ********************************

export { DragAndDropHint }
