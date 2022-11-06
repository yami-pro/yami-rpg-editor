'use strict'

import * as Yami from '../yami.js'

const {
  GL,
  INTRGBA
} = Yami

// ******************************** 舞台颜色类 ********************************

class StageColor {
  hex       //:string
  red       //:number
  green     //:number
  blue      //:number
  alpha     //:number
  onchange  //:function

  constructor(hex, onchange) {
    this.input(hex)
    this.onchange = onchange
  }

  // 读取颜色
  read() {
    return this.hex
  }

  // 输入颜色
  input(hex) {
    if (this.hex !== hex) {
      this.hex = hex
      this.red = parseInt(hex.slice(0, 2), 16) / 255
      this.green = parseInt(hex.slice(2, 4), 16) / 255
      this.blue = parseInt(hex.slice(4, 6), 16) / 255
      this.alpha = parseInt(hex.slice(6, 8), 16) / 255
      this.onchange?.()
    }
  }

  // 获取整数颜色
  getINTRGBA() {
    return INTRGBA(this.hex)
  }

  // 获取GL颜色
  getGLRGBA() {
    const sa = this.alpha
    const da = 1 - sa
    const rgba = StageColor.rgba
    rgba[0] = GL.BACKGROUND_RED * da + this.red * sa
    rgba[1] = GL.BACKGROUND_GREEN * da + this.green * sa
    rgba[2] = GL.BACKGROUND_BLUE * da + this.blue * sa
    return rgba
  }

  // 静态 - RGBA数组
  static rgba = new Float64Array(4)
}

// ******************************** 舞台颜色类导出 ********************************

export { StageColor }
