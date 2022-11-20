'use strict'

// ******************************** 平面矩阵类 ********************************

class Matrix extends Float32Array {
  constructor() {
    super(9)
    this[0] = 1
    this[4] = 1
    this[8] = 1
  }

  // 重置
  reset() {
    this[0] = 1
    this[1] = 0
    this[3] = 0
    this[4] = 1
    this[6] = 0
    this[7] = 0
    return this
  }

  // 设置矩阵
  set(matrix) {
    this[0] = matrix[0]
    this[1] = matrix[1]
    this[3] = matrix[3]
    this[4] = matrix[4]
    this[6] = matrix[6]
    this[7] = matrix[7]
    return this
  }

  // 设置参数
  set6f(a, b, c, d, e, f) {
    this[0] = a
    this[1] = b
    this[3] = c
    this[4] = d
    this[6] = e
    this[7] = f
    return this
  }

  // 乘以矩阵
  multiply(matrix) {
    const A = this[0]
    const B = this[1]
    const C = this[3]
    const D = this[4]
    const E = this[6]
    const F = this[7]
    const a = matrix[0]
    const b = matrix[1]
    const c = matrix[3]
    const d = matrix[4]
    const e = matrix[6]
    const f = matrix[7]
    this[0] = A * a + C * b
    this[1] = B * a + D * b
    this[3] = A * c + C * d
    this[4] = B * c + D * d
    this[6] = A * e + C * f + E
    this[7] = B * e + D * f + F
    return this
  }

  // 旋转
  rotate(angle) {
    const cos = Math.cos(angle)
    const sin = Math.sin(angle)
    const a = this[0]
    const b = this[1]
    const c = this[3]
    const d = this[4]
    this[0] = a * cos + c * sin
    this[1] = b * cos + d * sin
    this[3] = c * cos - a * sin
    this[4] = d * cos - b * sin
    return this
  }

  // 在指定点旋转
  rotateAt(x, y, angle) {
    const cos = Math.cos(angle)
    const sin = Math.sin(angle)
    const a = this[0]
    const b = this[1]
    const c = this[3]
    const d = this[4]
    this[0] = a * cos + c * sin
    this[1] = b * cos + d * sin
    this[3] = c * cos - a * sin
    this[4] = d * cos - b * sin
    this[6] += (a - this[0]) * x + (c - this[3]) * y
    this[7] += (b - this[1]) * x + (d - this[4]) * y
    return this
  }

  // 缩放
  scale(h, v) {
    this[0] *= h
    this[1] *= h
    this[3] *= v
    this[4] *= v
    return this
  }

  // 在指定点缩放
  scaleAt(x, y, h, v) {
    const a = this[0]
    const b = this[1]
    const c = this[3]
    const d = this[4]
    this[0] *= h
    this[1] *= h
    this[3] *= v
    this[4] *= v
    this[6] += (a - this[0]) * x + (c - this[3]) * y
    this[7] += (b - this[1]) * x + (d - this[4]) * y
    return this
  }

  // 平移
  translate(x, y) {
    this[6] += this[0] * x + this[3] * y
    this[7] += this[1] * x + this[4] * y
    return this
  }

  // 在指定点倾斜
  skewAt(x, y, h, v) {
    const a = this[0]
    const b = this[1]
    const c = this[3]
    const d = this[4]
    this[0] = a + c * v
    this[1] = b + d * v
    this[3] = a * h + c
    this[4] = b * h + d
    this[6] += (a - this[0]) * x + (c - this[3]) * y
    this[7] += (b - this[1]) * x + (d - this[4]) * y
    return this
  }

  // 水平镜像
  mirrorh() {
    this[0] = -this[0]
    this[3] = -this[3]
    return this
  }

  // 垂直镜像
  mirrorv() {
    this[1] = -this[1]
    this[4] = -this[4]
    return this
  }

  // 投影
  project(flip, width, height) {
    this[0] = 2 / width
    this[1] = 0
    this[3] = 0
    this[4] = 2 * flip / height
    this[6] = -1
    this[7] = -flip
    return this
  }

  // 静态 - 平面矩阵实例
  static instance = new Matrix()
}

// ******************************** 平面矩阵类导出 ********************************

export { Matrix }
