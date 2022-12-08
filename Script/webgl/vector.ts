"use strict"

// ******************************** 平面向量类 ********************************

class Vector {
  constructor(x = 0, y = 0) {
    this.x = x
    this.y = y
  }

  // 读取长度
  get length() {
    const {x, y} = this
    return Math.sqrt(x * x + y * y)
  }

  // 写入长度
  set length(value) {
    const {length} = this
    if (length !== 0) {
      const ratio = value / length
      this.x *= ratio
      this.y *= ratio
    }
  }

  // 设置向量
  set(x, y) {
    this.x = x
    this.y = y
    return this
  }

  // 添加向量
  add(vector) {
    this.x += vector.x
    this.y += vector.y
    return this
  }

  // 叉乘
  // cross(vector) {
  //   return this.x * vector.y - this.y * vector.x
  // }

  // 求夹角余弦值
  cos(vector) {
    const a = this.x * vector.x + this.y * vector.y
    const b = Math.sqrt(this.x ** 2 + this.y ** 2)
    const c = Math.sqrt(vector.x ** 2 + vector.y ** 2)
    return a / (b * c)
  }

  // 求夹角正弦值
  sin(vector) {
    const cos = this.cos(vector)
    return Math.sqrt(1 - cos ** 2)
  }

  // 归一化
  normalize() {
    this.length = 1
    return this
  }

  // 创建平面向量实例数组
  static instances = [
    new Vector(),
    new Vector(),
    new Vector(),
    new Vector(),
    new Vector(),
    new Vector(),
    new Vector(),
    new Vector(),
  ]
}

// ******************************** 平面向量类导出 ********************************

export { Vector }
