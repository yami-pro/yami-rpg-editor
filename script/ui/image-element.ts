"use strict"

import {
  GL,
  ImageTexture,
  UI
} from "../yami"

// ******************************** 图像元素 ********************************

class ImageElement extends UI.Element {
  texture   //:object
  _display  //:string
  _image    //:string
  flip      //:string
  shiftX    //:number
  shiftY    //:number
  border    //:number
  clip      //:array
  tint      //:array
  blend     //:string

  constructor(data) {
    super(data)
    this.texture = null
    this.display = data.display
    this.image = data.image
    this.flip = data.flip
    this.shiftX = data.shiftX
    this.shiftY = data.shiftY
    this.border = data.border
    this.clip = data.clip
    this.tint = data.tint
    this.blend = data.blend
  }

  // 读取图像
  get image() {
    return this._image
  }

  // 写入图像
  set image(value) {
    if (this._image !== value) {
      this._image = value
      if (this.texture) {
        this.texture.destroy()
        this.texture = null
      }
      if (value) {
        this.texture = new ImageTexture(value)
        this.texture.on('load', () => {
          UI.requestRendering()
        })
      }
    }
  }

  // 读取显示模式
  get display() {
    return this._display
  }

  // 写入显示模式
  set display(value) {
    this._display = value
  }

  // 绘制图像
  draw() {
    if (this.visible === false) {
      return this.drawChildren()
    }

    // 绘制图片
    const {texture} = this
    if (texture !== null) draw: {
      let dx = this.x
      let dy = this.y
      let dw = this.width
      let dh = this.height
      if (this.blend === 'mask') {
        if (GL.maskTexture.binding) {
          break draw
        }
        if (GL.depthTest) {
          GL.disable(GL.DEPTH_TEST)
        }
        GL.maskTexture.binding = this
        GL.bindFBO(GL.maskTexture.fbo)
        GL.alpha = 1
        GL.blend = 'normal'
      } else {
        GL.alpha = this.opacity
        GL.blend = this.blend
      }
      GL.matrix.set(UI.matrix).multiply(this.matrix)
      switch (this.display) {
        case 'stretch':
          texture.clip(this.shiftX, this.shiftY, texture.base.width, texture.base.height)
          break
        case 'tile':
          texture.clip(this.shiftX, this.shiftY, this.width, this.height)
          break
        case 'clip':
          texture.clip(...this.clip)
          break
        case 'slice':
          GL.drawSliceImage(texture, dx, dy, dw, dh, this.clip, this.border, this.tint)
          break draw
      }
      switch (this.flip) {
        case 'none':
          break
        case 'horizontal':
          dx += dw
          dw *= -1
          break
        case 'vertical':
          dy += dh
          dh *= -1
          break
        case 'both':
          dx += dw
          dy += dh
          dw *= -1
          dh *= -1
          break
      }
      GL.drawImage(texture, dx, dy, dw, dh, this.tint)
    } else {
      this.drawDefaultImage()
    }

    // 绘制子元素
    if (GL.maskTexture.binding === this) {
      GL.unbindFBO()
      if (GL.depthTest) {
        GL.enable(GL.DEPTH_TEST)
      }
      GL.masking = true
      this.drawChildren()
      GL.masking = false
      GL.maskTexture.binding = null
      // 擦除遮罩纹理缓冲区
      const [x1, y1, x2, y2] = this.computeBoundingRectangle()
      const sl = Math.max(Math.floor(x1 - 1), 0)
      const st = Math.max(Math.floor(y1 - 1), 0)
      const sr = Math.min(Math.ceil(x2 + 1), GL.maskTexture.width)
      const sb = Math.min(Math.ceil(y2 + 1), GL.maskTexture.height)
      const sw = sr - sl
      const sh = sb - st
      if (sw > 0 && sh > 0) {
        GL.bindFBO(GL.maskTexture.fbo)
        GL.enable(GL.SCISSOR_TEST)
        GL.scissor(sl, st, sw, sh)
        GL.clearColor(0, 0, 0, 0)
        GL.clear(GL.COLOR_BUFFER_BIT)
        GL.disable(GL.SCISSOR_TEST)
        GL.unbindFBO()
      }
    } else {
      this.drawChildren()
    }
  }

  // 调整大小
  resize() {
    if (this.parent instanceof UI.Window) {
      return this.parent.requestResizing()
    }
    this.calculatePosition()
    this.resizeChildren()
  }

  // 销毁元素
  destroy() {
    this.texture?.destroy()
    this.destroyChildren()
    delete this.node.instance
  }

  // 计算外接矩形
  computeBoundingRectangle() {
    const matrix = GL.matrix.set(UI.matrix).multiply(this.matrix)
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
    const vertices = ImageElement.sharedFloat64Array
    vertices[0] = Math.min(x1, x2, x3, x4)
    vertices[1] = Math.min(y1, y2, y3, y4)
    vertices[2] = Math.max(x1, x2, x3, x4)
    vertices[3] = Math.max(y1, y2, y3, y4)
    return vertices
  }

  // 公共属性
  static sharedFloat64Array = new Float64Array(4)
}

UI.Image = ImageElement

// ******************************** 图像元素导出 ********************************

export { ImageElement }
