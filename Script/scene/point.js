'use strict'

// ******************************** 坐标点类 ********************************

Scene.Point = class Point {
  x //:number
  y //:number

  constructor() {
    this.x = 0
    this.y = 0
  }

  // 设置
  set(x, y) {
    this.x = x
    this.y = y
    return this
  }
}
