'use strict'

import * as Yami from '../yami.js'

// ******************************** 窗口元素 ********************************

class WindowElement extends Yami.UI.Element {
  _layout       //:string
  scrollWidth   //:number
  scrollHeight  //:number
  _scrollX      //:number
  _scrollY      //:number
  gridWidth     //:number
  gridHeight    //:number
  gridGapX      //:number
  gridGapY      //:number
  paddingX      //:number
  paddingY      //:number
  overflow      //:string
  columns       //:number
  rows          //:number

  constructor(data) {
    super(data)
    this.layout = data.layout
    this.scrollWidth = 0
    this.scrollHeight = 0
    this.scrollX = data.scrollX
    this.scrollY = data.scrollY
    this.gridWidth = data.gridWidth
    this.gridHeight = data.gridHeight
    this.gridGapX = data.gridGapX
    this.gridGapY = data.gridGapY
    this.paddingX = data.paddingX
    this.paddingY = data.paddingY
    this.overflow = data.overflow
    this.columns = 0
    this.rows = 0
  }

  // 读取布局
  get layout() {
    return this._layout
  }

  // 写入布局
  set layout(value) {
    if (this._layout !== value) {
      this._layout = value
      switch (value) {
        case 'normal':
          delete this.resize
          break
        case 'horizontal-grid':
          this.resize = WindowElement.horizontalGridResize
          break
        case 'vertical-grid':
          this.resize = WindowElement.verticalGridResize
          break
      }
      if (this.connected) {
        this.resize()
      }
    }
  }

  // 读取滚动X
  get scrollX() {
    return this._scrollX
  }

  // 写入滚动X
  set scrollX(value) {
    const max = this.scrollWidth - this.width
    const scrollX = Math.clamp(value, 0, max)
    if (this._scrollX !== scrollX) {
      this._scrollX = scrollX
      if (this.connected) {
        this.resize()
        Yami.UI.requestRendering()
      }
    }
  }

  // 读取滚动Y
  get scrollY() {
    return this._scrollY
  }

  // 写入滚动Y
  set scrollY(value) {
    const max = this.scrollHeight - this.height
    const scrollY = Math.clamp(value, 0, max)
    if (this._scrollY !== value) {
      this._scrollY = scrollY
      if (this.connected) {
        this.resize()
        Yami.UI.requestRendering()
      }
    }
  }

  // 绘制图像
  draw() {
    switch (this.overflow) {
      case 'visible':
        this.drawChildren()
        break
      case 'hidden':
        Yami.GL.alpha = 1
        Yami.GL.blend = 'normal'
        Yami.GL.enable(Yami.GL.DEPTH_TEST)
        Yami.GL.depthFunc(Yami.GL.ALWAYS)
        Yami.GL.matrix.set(Yami.UI.matrix).multiply(this.matrix)
        Yami.GL.fillRect(this.x, this.y, this.width, this.height, 0x00000000)
        Yami.GL.depthFunc(Yami.GL.EQUAL)
        this.drawChildren()
        Yami.GL.clear(Yami.GL.DEPTH_BUFFER_BIT)
        Yami.GL.disable(Yami.GL.DEPTH_TEST)
        break
    }
  }

  // 调整大小
  resize() {
    if (this.parent instanceof Yami.UI.Window) {
      return this.parent.requestResizing()
    }
    this.calculatePosition()
    const {children} = this
    const {length} = children
    const {proxy} = WindowElement
    proxy.x = this.x - this.scrollX
    proxy.y = this.y - this.scrollY
    proxy.width = this.width
    proxy.height = this.height
    proxy.matrix = this.matrix
    proxy.opacity = this.opacity
    for (let i = 0; i < length; i++) {
      const element = children[i]
      element.parent = proxy
      element.resize()
      element.parent = this
    }
    this._calculateScrollArea()
  }

  // 请求调整大小
  requestResizing = (IIFE => {
    const timer = new Yami.Timer({
      duration: 0,
      callback: () => this.resize(),
    })
    return () => timer.add()
  })()

  // 计算滚动区域
  _calculateScrollArea() {
    const {max} = Math
    const {children} = this
    const {length} = children
    const parentWidth = this.width
    const parentHeight = this.height
    let scrollWidth = this.width
    let scrollHeight = this.height
    for (let i = 0; i < length; i++) {
      const {transform} = children[i]
      const sx = transform.scaleX
      const sy = transform.scaleY
      const x = transform.x + transform.x2 * parentWidth
      const y = transform.y + transform.y2 * parentHeight
      const w = max(transform.width + transform.width2 * parentWidth, 0)
      const h = max(transform.height + transform.height2 * parentHeight, 0)
      scrollWidth = max(scrollWidth, x + (1 - transform.anchorX) * w * sx)
      scrollHeight = max(scrollHeight, y + (1 - transform.anchorY) * h * sy)
    }
    this.scrollWidth = scrollWidth
    this.scrollHeight = scrollHeight
    // this.scrollX = this.scrollX
    // this.scrollY = this.scrollY
  }

  // 销毁元素
  destroy() {
    this.destroyChildren()
    delete this.node.instance
  }

  // 代理元素
  static proxy = {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    matrix: null,
    opacity: 0,
  }

  // 水平网格 - 调整大小
  static horizontalGridResize() {
    this.calculatePosition()
    const {children} = this
    const {length} = children
    if (length === 0) {
      this.columns = 0
      this.rows = 0
      return
    }
    const {floor, ceil, max} = Math
    const {proxy} = WindowElement
    const {gridWidth, gridHeight, gridGapX, gridGapY, paddingX, paddingY} = this
    const unitWidth = gridWidth + gridGapX
    const unitHeight = gridHeight + gridGapY
    const columns = unitWidth === 0 ? length
    : max(floor((this.width + gridGapX - paddingX * 2) / unitWidth), 1)
    const rows = ceil(length / columns)
    const scrollHeight = rows * unitHeight - gridGapY + paddingY * 2
    this.scrollWidth = max(this.width, gridWidth)
    this.scrollHeight = max(this.height, scrollHeight)
    this.columns = columns
    this.rows = rows
    proxy.width = gridWidth
    proxy.height = gridHeight
    proxy.matrix = this.matrix
    proxy.opacity = this.opacity
    const sx = this.x - this.scrollX + paddingX
    const sy = this.y - this.scrollY + paddingY
    for (let i = 0; i < length; i++) {
      const element = children[i]
      proxy.x = sx + i % columns * unitWidth
      proxy.y = sy + floor(i / columns) * unitHeight
      element.parent = proxy
      element.resize()
      element.parent = this
    }
  }

  // 垂直网格 - 调整大小
  static verticalGridResize() {
    this.calculatePosition()
    const {children} = this
    const {length} = children
    if (length === 0) {
      this.columns = 0
      this.rows = 0
      return
    }
    const {floor, ceil, max} = Math
    const {proxy} = WindowElement
    const {gridWidth, gridHeight, gridGapX, gridGapY, paddingX, paddingY} = this
    const unitWidth = gridWidth + gridGapX
    const unitHeight = gridHeight + gridGapY
    const rows = unitHeight === 0 ? length
    : max(floor((this.height + gridGapY - paddingY * 2) / unitHeight), 1)
    const columns = ceil(length / rows)
    const scrollWidth = columns * unitWidth - gridGapX + paddingX * 2
    this.scrollWidth = max(this.width, scrollWidth)
    this.scrollHeight = max(this.height, gridHeight)
    this.columns = columns
    this.rows = rows
    proxy.width = gridWidth
    proxy.height = gridHeight
    proxy.matrix = this.matrix
    proxy.opacity = this.opacity
    const sx = this.x - this.scrollX + paddingX
    const sy = this.y - this.scrollY + paddingY
    for (let i = 0; i < length; i++) {
      const element = children[i]
      proxy.x = sx + floor(i / rows) * unitWidth
      proxy.y = sy + i % rows * unitHeight
      element.parent = proxy
      element.resize()
      element.parent = this
    }
  }
}

Yami.UI.Window = WindowElement

export { WindowElement }
