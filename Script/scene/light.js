'use strict'

import * as Yami from '../yami.js'

// ******************************** 光源类 ********************************

class Light {
  data            //:object
  angle           //:number
  anchorOffsetX   //:number
  anchorOffsetY   //:number
  measureOffsetX  //:number
  measureOffsetY  //:number
  measureWidth    //:number
  measureHeight   //:number

  constructor(data) {
    this.data = data
    this.measure()
  }

  // 绘制图像
  draw(projMatrix) {
    switch (this.data.type) {
      case 'point':
        return this.drawPointLight(projMatrix)
      case 'area':
        return this.drawAreaLight(projMatrix)
    }
  }

  // 绘制点光
  drawPointLight(projMatrix) {
    const gl = Yami.GL
    const vertices = gl.arrays[0].float32
    const light = this.data
    const r = light.range / 2
    const ox = light.x
    const oy = light.y
    const dl = ox - r
    const dt = oy - r
    const dr = ox + r
    const db = oy + r
    vertices[0] = dl
    vertices[1] = dt
    vertices[2] = 0
    vertices[3] = 0
    vertices[4] = dl
    vertices[5] = db
    vertices[6] = 0
    vertices[7] = 1
    vertices[8] = dr
    vertices[9] = db
    vertices[10] = 1
    vertices[11] = 1
    vertices[12] = dr
    vertices[13] = dt
    vertices[14] = 1
    vertices[15] = 0
    gl.blend = light.blend
    const program = gl.lightProgram.use()
    const red = light.red / 255
    const green = light.green / 255
    const blue = light.blue / 255
    const intensity = light.intensity
    gl.bindVertexArray(program.vao)
    gl.uniformMatrix3fv(program.u_Matrix, false, projMatrix)
    gl.uniform1i(program.u_LightMode, 0)
    gl.uniform4f(program.u_LightColor, red, green, blue, intensity)
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STREAM_DRAW, 0, 16)
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4)
  }

  // 绘制区域光
  drawAreaLight(projMatrix) {
    const light = this.data
    const textures = Yami.Scene.textures
    const texture = textures[light.mask]
    if (texture === undefined) {
      return textures.load(light.mask)
    }
    if (texture instanceof Promise) {
      return
    }
    const gl = Yami.GL
    const vertices = gl.arrays[0].float32
    const ox = light.x
    const oy = light.y
    const dl = ox - this.anchorOffsetX
    const dt = oy - this.anchorOffsetY
    const dr = dl + light.width
    const db = dt + light.height
    vertices[0] = dl
    vertices[1] = dt
    vertices[2] = 0
    vertices[3] = 0
    vertices[4] = dl
    vertices[5] = db
    vertices[6] = 0
    vertices[7] = 1
    vertices[8] = dr
    vertices[9] = db
    vertices[10] = 1
    vertices[11] = 1
    vertices[12] = dr
    vertices[13] = dt
    vertices[14] = 1
    vertices[15] = 0
    gl.blend = light.blend
    const program = gl.lightProgram.use()
    const mode = texture !== null ? 1 : 2
    const red = light.red / 255
    const green = light.green / 255
    const blue = light.blue / 255
    const matrix = gl.matrix
    .set(projMatrix)
    .rotateAt(ox, oy, this.angle)
    gl.bindVertexArray(program.vao)
    gl.uniformMatrix3fv(program.u_Matrix, false, matrix)
    gl.uniform1i(program.u_LightMode, mode)
    gl.uniform4f(program.u_LightColor, red, green, blue, 0)
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STREAM_DRAW, 0, 16)
    gl.bindTexture(gl.TEXTURE_2D, texture?.base.glTexture)
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4)
  }

  // 测量
  measure() {
    const light = this.data
    if (light.type !== 'area') return
    const width = light.width
    const height = light.height
    const anchorOffsetX = width * light.anchorX
    const anchorOffsetY = height * light.anchorY
    const a = -anchorOffsetX
    const b = -anchorOffsetY
    const c = a + width
    const d = b + height
    const angle = Math.radians(light.angle)
    const angle1 = Math.atan2(b, a) + angle
    const angle2 = Math.atan2(b, c) + angle
    const angle3 = Math.atan2(d, c) + angle
    const angle4 = Math.atan2(d, a) + angle
    const distance1 = Math.sqrt(a * a + b * b)
    const distance2 = Math.sqrt(c * c + b * b)
    const distance3 = Math.sqrt(c * c + d * d)
    const distance4 = Math.sqrt(a * a + d * d)
    const x1 = Math.cos(angle1) * distance1
    const x2 = Math.cos(angle2) * distance2
    const x3 = Math.cos(angle3) * distance3
    const x4 = Math.cos(angle4) * distance4
    const y1 = Math.sin(angle1) * distance1
    const y2 = Math.sin(angle2) * distance2
    const y3 = Math.sin(angle3) * distance3
    const y4 = Math.sin(angle4) * distance4
    const measureOffsetX = Math.min(x1, x2, x3, x4)
    const measureOffsetY = Math.min(y1, y2, y3, y4)
    const measureWidth = Math.max(Math.abs(x1 - x3), Math.abs(x2 - x4))
    const measureHeight = Math.max(Math.abs(y1 - y3), Math.abs(y2 - y4))
    this.angle = angle
    this.anchorOffsetX = anchorOffsetX
    this.anchorOffsetY = anchorOffsetY
    this.measureOffsetX = measureOffsetX
    this.measureOffsetY = measureOffsetY
    this.measureWidth = measureWidth
    this.measureHeight = measureHeight
  }
}

export { Light }
