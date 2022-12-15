"use strict"

import { Scene } from "../yami"

// ******************************** 坐标点类 ********************************

class Point {
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

Scene.Point = Point

// ******************************** 坐标点类导出 ********************************

export { Point }
