'use strict'

import { UI } from './ui.js'
import { GL } from '../webgl/gl.js'
import { ImageTexture } from '../webgl/image-texture.js'

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
      GL.alpha = this.opacity
      GL.blend = this.blend
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
    this.drawChildren()
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
}

UI.Image = ImageElement

export { ImageElement }
