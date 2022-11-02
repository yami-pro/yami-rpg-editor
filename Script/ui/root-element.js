'use strict'

import { UI } from './ui.js'
import { GL } from '../webgl/gl.js'

// ******************************** 根元素 ********************************

class RootElement extends UI.Element {
  background  //:number

  constructor() {
    super({
      transform: null,
      hidden: false,
    })
    this.connected = true
    this.background = null
  }

  // 绘制图像
  draw() {
    GL.matrix.set(UI.matrix)
    GL.alpha = 1
    GL.blend = 'normal'
    GL.fillRect(this.x, this.y, this.width, this.height, this.background)
    this.drawChildren()
  }

  // 调整大小
  resize() {
    this.x = 0
    this.y = 0
    this.width = UI.width
    this.height = UI.height
    this.background = UI.foreground.getINTRGBA()
    this.resizeChildren()
  }

  // 销毁元素
  destroy() {
    this.destroyChildren()
  }
}

UI.Root = RootElement

export { RootElement }
