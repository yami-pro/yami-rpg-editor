"use strict"

import {
  GL,
  ImageTexture,
  Scene
} from "../yami"

// ******************************** 视差图类 ********************************

class Parallax {
  data    //:object
  shiftX  //:number
  shiftY  //:number
  texture //:object

  constructor(data) {
    this.data = data
    this.shiftX = 0
    this.shiftY = 0
    this.texture = null
    this.loadTexture()
  }

  // 更新数据
  update(deltaTime) {
    const {shiftSpeedX, shiftSpeedY} = this.data
    if (shiftSpeedX !== 0 || shiftSpeedY !== 0) {
      const texture = this.texture
      if (texture instanceof ImageTexture) {
        this.shiftX = (
          this.shiftX
        + shiftSpeedX
        * deltaTime / 1000
        / texture.width
        ) % 1
        this.shiftY = (
          this.shiftY
        + shiftSpeedY
        * deltaTime / 1000
        / texture.height
        ) % 1
      }
    }
  }

  // 绘制图像
  draw(id) {
    const texture = this.texture
    if (texture instanceof ImageTexture) {
      const gl = GL
      const parallax = this.data
      const vertices = gl.arrays[0].float32
      const pw = texture.width
               * parallax.scaleX
               * parallax.repeatX
      const ph = texture.height
               * parallax.scaleY
               * parallax.repeatY
      const ox = parallax.offsetX
      const oy = parallax.offsetY
      const ax = parallax.anchorX * pw
      const ay = parallax.anchorY * ph
      const anchor = Scene.getParallaxAnchor(parallax)
      const dl = anchor.x - ax + ox
      const dt = anchor.y - ay + oy
      const dr = dl + pw
      const db = dt + ph
      const cl = Scene.scrollLeft
      const ct = Scene.scrollTop
      const cr = Scene.scrollRight
      const cb = Scene.scrollBottom
      if (dl < cr && dr > cl && dt < cb && db > ct) {
        const sl = this.shiftX
        const st = this.shiftY
        const sr = sl + parallax.repeatX
        const sb = st + parallax.repeatY
        vertices[0] = dl
        vertices[1] = dt
        vertices[2] = sl
        vertices[3] = st
        vertices[4] = dl
        vertices[5] = db
        vertices[6] = sl
        vertices[7] = sb
        vertices[8] = dr
        vertices[9] = db
        vertices[10] = sr
        vertices[11] = sb
        vertices[12] = dr
        vertices[13] = dt
        vertices[14] = sr
        vertices[15] = st
        gl.blend = parallax.blend
        gl.alpha = parallax.opacity
        const activeId = Scene.activeTilemapId
        if (activeId !== -1 && id > activeId) {
          gl.alpha *= 0.25
        }
        const program = gl.imageProgram.use()
        const tint = parallax.tint
        const red = tint[0] / 255
        const green = tint[1] / 255
        const blue = tint[2] / 255
        const gray = tint[3] / 255
        const modeMap = Parallax.lightSamplingModes
        const lightMode = Scene.showLight ? parallax.light : 'raw'
        const lightModeIndex = modeMap[lightMode]
        const matrix = gl.matrix.project(
          gl.flip,
          cr - cl,
          cb - ct,
        ).translate(-cl, -ct)
        gl.bindVertexArray(program.vao)
        gl.uniformMatrix3fv(program.u_Matrix, false, matrix)
        gl.uniform1i(program.u_LightMode, lightModeIndex)
        if (lightMode === 'anchor') {
          gl.uniform2f(program.u_LightCoord, anchor.x, anchor.y)
        }
        gl.uniform1i(program.u_ColorMode, 0)
        gl.uniform4f(program.u_Tint, red, green, blue, gray)
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STREAM_DRAW, 0, 16)
        gl.bindTexture(gl.TEXTURE_2D, texture.base.glTexture)
        gl.drawArrays(gl.TRIANGLE_FAN, 0, 4)
        gl.blend = 'normal'
      }
    } else {
      this.drawDefaultImage()
    }
  }

  // 绘制默认图像
  drawDefaultImage() {
    const parallax = this.data
    const width = 128 * parallax.scaleX * parallax.repeatX
    const height = 128 * parallax.scaleY * parallax.repeatY
    const ox = parallax.offsetX
    const oy = parallax.offsetY
    const ax = parallax.anchorX * width
    const ay = parallax.anchorY * height
    const anchor = Scene.getParallaxAnchor(parallax)
    const x = anchor.x - ax + ox
    const y = anchor.y - ay + oy
    GL.matrix.set(Scene.matrix)
    GL.alpha = parallax.opacity
    GL.blend = parallax.blend
    GL.fillRect(x, y, width, height, 0x80ffffff)
  }

  // 加载纹理
  loadTexture() {
    const guid = this.data.image
    if (guid) {
      const texture = new ImageTexture(guid)
      this.texture = texture
      if (texture.complete) {
        return texture
      }
      this.update = Function.empty
      this.draw = Function.empty
      texture.on('load', () => {
        Scene.requestRendering()
        delete this.update
        delete this.draw
      })
    }
  }

  // 销毁
  destroy() {
    if (this.texture instanceof ImageTexture) {
      this.texture.destroy()
    }
    this.texture = null
  }

  // 静态 - 光线采样模式映射表
  static lightSamplingModes = {raw: 0, global: 1, anchor: 2, ambient: 3}
}

// ******************************** 视差图类导出 ********************************

export { Parallax }
