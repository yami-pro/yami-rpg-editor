'use strict'

import * as Yami from '../yami.js'

// ******************************** 根元素 ********************************

class RootElement extends Yami.UI.Element {
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
    Yami.GL.matrix.set(Yami.UI.matrix)
    Yami.GL.alpha = 1
    Yami.GL.blend = 'normal'
    Yami.GL.fillRect(this.x, this.y, this.width, this.height, this.background)
    this.drawChildren()
  }

  // 调整大小
  resize() {
    this.x = 0
    this.y = 0
    this.width = Yami.UI.width
    this.height = Yami.UI.height
    this.background = Yami.UI.foreground.getINTRGBA()
    this.resizeChildren()
  }

  // 销毁元素
  destroy() {
    this.destroyChildren()
  }
}

Yami.UI.Root = RootElement

// ******************************** 根元素导出 ********************************

export { RootElement }
