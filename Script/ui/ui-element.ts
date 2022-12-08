"use strict"

import {
  GL,
  Matrix,
  UI
} from "../yami"

// ******************************** 元素基类 ********************************

class UIElement {
  node      //:object
  x         //:number
  y         //:number
  width     //:number
  height    //:number
  matrix    //:object
  opacity   //:number
  transform //:object
  parent    //:object
  children  //:array
  visible   //:boolean
  connected //:boolean

  constructor(data) {
    this.x = 0
    this.y = 0
    this.width = 0
    this.height = 0
    this.matrix = new Matrix()
    this.opacity = 1
    this.transform = data.transform
    this.parent = null
    this.children = []
    this.visible = !data.hidden
    this.connected = false
  }

  // 绘制线框
  drawWireframe(color) {
    const gl = GL
    const vertices = gl.arrays[0].float32
    const colors = gl.arrays[0].uint32
    const matrix = gl.matrix
    .set(UI.matrix)
    .multiply(this.matrix)
    const L = this.x
    const T = this.y
    const R = L + this.width
    const B = T + this.height
    const a = matrix[0]
    const b = matrix[1]
    const c = matrix[3]
    const d = matrix[4]
    const e = matrix[6]
    const f = matrix[7]
    const x1 = a * L + c * T + e
    const y1 = b * L + d * T + f
    const x2 = a * L + c * B + e
    const y2 = b * L + d * B + f
    const x3 = a * R + c * B + e
    const y3 = b * R + d * B + f
    const x4 = a * R + c * T + e
    const y4 = b * R + d * T + f
    const angle1 = Math.atan2(y1 - y2, x1 - x2)
    const angle2 = Math.atan2(y2 - y3, x2 - x3)
    const angle3 = Math.atan2(y3 - y4, x3 - x4)
    const angle4 = Math.atan2(y4 - y1, x4 - x1)
    const ox1 = Math.cos(angle1) * 0.5
    const oy1 = Math.sin(angle1) * 0.5
    const ox2 = Math.cos(angle2) * 0.5
    const oy2 = Math.sin(angle2) * 0.5
    const ox3 = Math.cos(angle3) * 0.5
    const oy3 = Math.sin(angle3) * 0.5
    const ox4 = Math.cos(angle4) * 0.5
    const oy4 = Math.sin(angle4) * 0.5
    const bx1 = x1 + ox4 - ox1
    const by1 = y1 + oy4 - oy1
    const bx2 = x2 + ox1 - ox2
    const by2 = y2 + oy1 - oy2
    const bx3 = x3 + ox2 - ox3
    const by3 = y3 + oy2 - oy3
    const bx4 = x4 + ox3 - ox4
    const by4 = y4 + oy3 - oy4
    vertices[0] = bx1
    vertices[1] = by1
    colors  [2] = color
    vertices[3] = bx2
    vertices[4] = by2
    colors  [5] = color
    vertices[6] = bx3
    vertices[7] = by3
    colors  [8] = color
    vertices[9] = bx4
    vertices[10] = by4
    colors  [11] = color
    matrix.project(
      gl.flip,
      gl.width,
      gl.height,
    )
    gl.alpha = 1
    gl.blend = 'normal'
    const program = gl.graphicProgram.use()
    gl.bindVertexArray(program.vao)
    gl.uniformMatrix3fv(program.u_Matrix, false, matrix)
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STREAM_DRAW, 0, 12)
    gl.drawArrays(gl.LINE_LOOP, 0, 4)
  }

  // 绘制默认图像
  drawDefaultImage() {
    GL.alpha = this.opacity
    GL.blend = this.blend
    GL.matrix.set(UI.matrix).multiply(this.matrix)
    GL.fillRect(this.x, this.y, this.width, this.height, 0x80ffffff)
  }

  // 连接元素
  connect() {
    this.connected = true
    this.connectChildren()
  }

  // 断开元素
  disconnect() {
    this.connected = false
    this.disconnectChildren()
  }

  // 连接子元素
  connectChildren() {
    const children = this.children
    const length = children.length
    for (let i = 0; i < length; i++) {
      children[i].connect()
    }
  }

  // 断开子元素
  disconnectChildren() {
    const children = this.children
    const length = children.length
    for (let i = 0; i < length; i++) {
      children[i].disconnect()
    }
  }

  // 绘制子元素
  drawChildren() {
    const children = this.children
    const length = children.length
    for (let i = 0; i < length; i++) {
      children[i].draw()
    }
  }

  // 调整子元素
  resizeChildren() {
    const children = this.children
    const length = children.length
    for (let i = 0; i < length; i++) {
      children[i].resize()
    }
  }

  // 销毁子元素
  destroyChildren() {
    const children = this.children
    const length = children.length
    for (let i = 0; i < length; i++) {
      children[i].destroy()
    }
  }

  // 加入子对象
  appendChild(element) {
    if (element && this.children.append(element)) {
      element.parent instanceof UI.Element &&
      element.parent.children.remove(element)
      element.parent = this
      if (this.connected) {
        !element.connected &&
        element.connect()
        element.resize()
      }
    }
  }

  // 加入子对象到指定位置
  appendChildTo(element, index) {
    if (element instanceof UI.Element) {
      element.parent instanceof UI.Element &&
      element.parent.children.remove(element)
      if (element.parent instanceof UI.Window) {
        element.parent.requestResizing()
      }
      element.parent = this
      this.children.splice(index, 0, element)
      if (this.connected) {
        !element.connected &&
        element.connect()
        element.resize()
      }
    }
  }

  // 从父对象中移除
  remove() {
    if (this.parent instanceof UI.Element &&
      this.parent.children.remove(this)) {
      if (this.parent instanceof UI.Window) {
        this.parent.requestResizing()
      }
      this.parent = null
      if (this.connected) {
        this.disconnect()
      }
    }
  }

  // 计算位置
  calculatePosition() {
    if (this.connected === false) {
      return
    }

    const parent = this.parent
    const matrix = this.matrix.set(parent.matrix)
    const transform = this.transform
    const parentWidth = parent.width
    const parentHeight = parent.height
    const x = parent.x + transform.x + transform.x2 * parentWidth
    const y = parent.y + transform.y + transform.y2 * parentHeight
    const width = Math.max(transform.width + transform.width2 * parentWidth, 0)
    const height = Math.max(transform.height + transform.height2 * parentHeight, 0)
    const anchorX = transform.anchorX * width
    const anchorY = transform.anchorY * height
    const rotation = transform.rotation
    const scaleX = transform.scaleX
    const scaleY = transform.scaleY
    const skewX = transform.skewX
    const skewY = transform.skewY
    const opacity = transform.opacity * parent.opacity

    // 写入计算值
    this.x = x - anchorX
    this.y = y - anchorY
    this.width = width
    this.height = height
    this.opacity = opacity

    // 计算矩阵变换
    if (rotation !== 0) {
      matrix.rotateAt(x, y, Math.radians(rotation))
    }
    if (scaleX !== 1 || scaleY !== 1) {
      matrix.scaleAt(x, y, scaleX, scaleY)
    }
    if (skewX !== 0 || skewY !== 0) {
      matrix.skewAt(x, y, skewX, skewY)
    }
  }

  // 判断是否包含指定元素
  contains(element) {
    while (element) {
      if (element === this) {
        return true
      }
      element = element.parent
    }
    return false
  }

  // 判断点是否在矩形区域内
  isPointIn(x, y) {
    const W = this.width
    const H = this.height
    if (W * H === 0) {
      return false
    }

    const matrix = this.matrix
    const L = this.x
    const T = this.y
    const R = L + W
    const B = T + H
    const a = matrix[0]
    const b = matrix[1]
    const c = matrix[3]
    const d = matrix[4]
    const e = matrix[6]
    const f = matrix[7]
    const x1 = a * L + c * T + e - x
    const y1 = b * L + d * T + f - y
    const x2 = a * L + c * B + e - x
    const y2 = b * L + d * B + f - y
    const x3 = a * R + c * B + e - x
    const y3 = b * R + d * B + f - y
    const x4 = a * R + c * T + e - x
    const y4 = b * R + d * T + f - y
    const cross1 = x1 * y2 - y1 * x2
    const cross2 = x2 * y3 - y2 * x3
    const cross3 = x3 * y4 - y3 * x4
    const cross4 = x4 * y1 - y4 * x1
    return (
      cross1 * cross2 >= 0 &&
      cross2 * cross3 >= 0 &&
      cross3 * cross4 >= 0 &&
      cross4 * cross1 >= 0
    )
  }
}

UI.Element = UIElement
