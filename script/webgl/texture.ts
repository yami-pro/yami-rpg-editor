"use strict"

import {
  GL,
  BaseTexture
} from "../yami"

// ******************************** 纹理类 ********************************

class Texture {
  complete: boolean
  base: BaseTexture | null
  gl
  x: number
  y: number
  width: number
  height: number

  fbo: WebGLFramebuffer | null
  innerWidth: number
  innerHeight: number
  paddingLeft: number
  paddingTop: number
  paddingRight: number
  paddingBottom: number
  scaleX: number
  scaleY: number

  depthStencilBuffer: WebGLRenderbuffer | null

  constructor(options = {}) {
    if (new.target !== Texture) {
      return
    }

    // 设置属性
    this.complete = true
    this.base = GL.createNormalTexture(options)
    this.gl = GL
    this.x = 0
    this.y = 0
    this.width = 0
    this.height = 0
  }

  // 裁剪
  clip(x, y, width, height) {
    this.x = x
    this.y = y
    this.width = width
    this.height = height
    return this
  }

  // 擦除
  clear(red = 0, green = 0, blue = 0, alpha = 0) {
    const gl = this.gl
    gl.bindFBO(gl.frameBuffer)
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.base.glTexture, 0)
    gl.clearColor(red, green, blue, alpha)
    gl.clear(gl.COLOR_BUFFER_BIT)
    gl.unbindFBO()
  }

  // 调整大小
  resize(width: number, height: number) {
    const {gl, base} = this
    const {format} = base
    base.width = width
    base.height = height
    gl.bindTexture(gl.TEXTURE_2D, base.glTexture)
    gl.texImage2D(gl.TEXTURE_2D, 0, format, width, height, 0, format, gl.UNSIGNED_BYTE, null)
    return this.clip(0, 0, width, height)
  }

  // 从图像中取样
  fromImage(image) {
    const gl = this.gl
    const base = this.base
    const format = base.format
    const width = image.width
    const height = image.height
    base.image = image
    base.width = width
    base.height = height
    gl.bindTexture(gl.TEXTURE_2D, base.glTexture)
    gl.texImage2D(gl.TEXTURE_2D, 0, format, format, gl.UNSIGNED_BYTE, image)
    return this.clip(0, 0, width, height)
  }

  // 获取图像数据
  getImageData(x, y, width, height) {
    const gl = this.gl
    const base = this.base
    if (base instanceof WebGLTexture) {
      const imageData = gl.context2d.createImageData(width, height)
      const {buffer, length} = imageData.data
      const uint8 = new Uint8Array(buffer, 0, length)
      gl.bindFramebuffer(gl.FRAMEBUFFER, gl.frameBuffer)
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, base.glTexture, 0)
      gl.readPixels(x, y, width, height, gl.RGBA, gl.UNSIGNED_BYTE, uint8)
      gl.binding ? gl.bindFBO(gl.binding) : gl.unbindFBO()
      return imageData
    }
    return null
  }

  // 查看纹理 - 调试用
  // view() {
  //   if (!this.viewer) {
  //     this.viewer = new Image()
  //     this.viewer.style.position = 'fixed'
  //     this.viewer.style.background = 'var(--grid-background)'
  //     document.body.appendChild(this.viewer)
  //   }
  //   const {x, y, width, height} = this
  //   if (width > 0 && height > 0) {
  //     const imageData = this.getImageData(x, y, width, height)
  //     const canvas = document.createElement('canvas')
  //     canvas.width = width
  //     canvas.height = height
  //     const context = canvas.getContext('2d')
  //     context.putImageData(imageData, 0, 0)
  //     this.viewer.src = canvas.toDataURL()
  //   } else {
  //     this.viewer.src = ''
  //   }
  // }

  // 销毁
  destroy() {
    if (this.base) {
      this.complete = false
      this.gl.textureManager.delete(this.base)
      this.base = null
    }
  }
}

// ******************************** 纹理类导出 ********************************

export { Texture }
