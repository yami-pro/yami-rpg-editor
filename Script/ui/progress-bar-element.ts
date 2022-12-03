'use strict'

import {
  GL,
  ImageTexture,
  UI,
  IMath as Math
} from '../yami'

// ******************************** 进度条元素 ********************************

class ProgressBarElement extends UI.Element {
  texture       //:object
  _image        //:string
  display       //:string
  clip          //:array
  type          //:string
  step          //:number
  centerX       //:number
  centerY       //:number
  startAngle    //:number
  centralAngle  //:number
  progress      //:number
  colorMode     //:string
  color         //:array
  blend         //:string

  constructor(data) {
    super(data)
    this.texture = null
    this.image = data.image
    this.display = data.display
    this.clip = data.clip
    this.type = data.type
    this.step = data.step
    this.centerX = data.centerX
    this.centerY = data.centerY
    this.startAngle = data.startAngle
    this.centralAngle = data.centralAngle
    this.progress = data.progress
    this.colorMode = data.colorMode
    this.color = data.color
    this.blend = data.blend
  }

  // 读取文本
  get image() {
    return this._image
  }

  // 设置文本
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

  // 绘制图像
  draw() {
    if (this.visible === false) {
      return this.drawChildren()
    }

    // 绘制进度条
    const {texture} = this
    if (texture === null) {
      this.drawDefaultImage()
    } else if (texture.complete) {
      const {base} = texture
      switch (this.display) {
        case 'stretch':
          texture.clip(0, 0, base.width, base.height)
          break
        case 'clip':
          texture.clip(...this.clip)
          break
      }
      const scaleX = this.width / texture.width
      const scaleY = this.height / texture.height
      const {vertices, vertexLength, drawingLength} =
      this.calculateProgressVertices()

      // 绘制图像
      GL.alpha = this.opacity
      GL.blend = this.blend
      GL.matrix.project(
        GL.flip,
        GL.width,
        GL.height,
      )
      .multiply(UI.matrix)
      .multiply(this.matrix)
      .translate(this.x, this.y)
      .scale(scaleX, scaleY)
      const program = GL.imageProgram.use()
      GL.bindVertexArray(program.vao)
      GL.uniformMatrix3fv(program.u_Matrix, false, GL.matrix)
      GL.uniform1i(program.u_LightMode, 0)
      switch (this.colorMode) {
        case 'texture':
          GL.uniform1i(program.u_ColorMode, 0)
          GL.uniform4f(program.u_Tint, 0, 0, 0, 0)
          break
        case 'fixed': {
          const color = this.color
          const red = color[0] / 255
          const green = color[1] / 255
          const blue = color[2] / 255
          const alpha = color[3] / 255
          GL.uniform1i(program.u_ColorMode, 1)
          GL.uniform4f(program.u_Color, red, green, blue, alpha)
          break
        }
      }
      GL.bufferData(GL.ARRAY_BUFFER, vertices, GL.STREAM_DRAW, 0, vertexLength)
      GL.bindTexture(GL.TEXTURE_2D, base.glTexture)
      GL.drawArrays(GL.TRIANGLE_FAN, 0, drawingLength)
    }

    // 绘制子元素
    this.drawChildren()
  }

  // 计算进度条顶点
  calculateProgressVertices() {
    const type = this.type
    const progress = Math.clamp(this.progress, 0, 1)
    const texture = this.texture
    const x = texture.x
    const y = texture.y
    const w = texture.width
    const h = texture.height
    const tw = texture.base.width
    const th = texture.base.height
    const response = UI.ProgressBar.response
    const vertices = response.vertices
    const step = this.step
    switch (type) {
      case 'horizontal': {
        let sw = w * progress
        let sh = h
        if (step !== 0) {
          sw = Math.round(sw / step) * step
          sw = Math.clamp(sw, 0, w)
        }
        const dl = 0
        const dt = 0
        const dr = sw
        const db = sh
        const sl = x / tw
        const st = y / th
        const sr = (x + sw) / tw
        const sb = (y + sh) / th
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
        response.vertexLength = 16
        response.drawingLength = 4
        return response
      }
      case 'vertical': {
        let sw = w
        let sh = h * progress
        if (step !== 0) {
          sh = Math.round(sh / step) * step
          sh = Math.clamp(sh, 0, h)
        }
        const dl = 0
        const dt = h - sh
        const dr = sw
        const db = h
        const sl = x / tw
        const st = (y + dt) / th
        const sr = (x + sw) / tw
        const sb = (y + h) / th
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
        response.vertexLength = 16
        response.drawingLength = 4
        return response
      }
      case 'round': {
        const angles = response.angles
        const array = response.array
        let startAngle = this.startAngle
        let centralAngle = this.centralAngle
        let currentAngle = centralAngle * progress
        if (step !== 0) {
          currentAngle = Math.round(currentAngle / step) * step
          currentAngle = centralAngle >= 0
          ? Math.min(currentAngle, centralAngle)
          : Math.max(currentAngle, centralAngle)
        }
        if (currentAngle < 0) {
          currentAngle = -currentAngle
          startAngle -= currentAngle
        }
        startAngle = Math.radians(startAngle)
        currentAngle = Math.radians(currentAngle)
        const dl = 0
        const dt = 0
        const dr = w
        const db = h
        const dox = w * this.centerX
        const doy = h * this.centerY
        const tox = dox + x
        const toy = doy + y
        const sox = tox / tw
        const soy = toy / th
        const sl = x / tw
        const st = y / th
        const sr = (x + w) / tw
        const sb = (y + h) / th
        angles[0] = Math.modRadians(Math.atan2(dt - doy, dr - dox) - startAngle)
        angles[1] = Math.modRadians(Math.atan2(db - doy, dr - dox) - startAngle)
        angles[2] = Math.modRadians(Math.atan2(db - doy, dl - dox) - startAngle)
        angles[3] = Math.modRadians(Math.atan2(dt - doy, dl - dox) - startAngle)
        vertices[0] = dox
        vertices[1] = doy
        vertices[2] = sox
        vertices[3] = soy
        let minimum = angles[0]
        let startIndex = 0
        for (let i = 1; i < 4; i++) {
          if (angles[i] < minimum) {
            minimum = angles[i]
            startIndex = i
          }
        }
        let vi = 8
        let endIndex = startIndex
        for (let i = 0; i < 4; i++) {
          const index = (startIndex + i) % 4
          if (angles[index] < currentAngle) {
            switch (index) {
              case 0:
                vertices[vi    ] = dr
                vertices[vi + 1] = dt
                vertices[vi + 2] = sr
                vertices[vi + 3] = st
                break
              case 1:
                vertices[vi    ] = dr
                vertices[vi + 1] = db
                vertices[vi + 2] = sr
                vertices[vi + 3] = sb
                break
              case 2:
                vertices[vi    ] = dl
                vertices[vi + 1] = db
                vertices[vi + 2] = sl
                vertices[vi + 3] = sb
                break
              case 3:
                vertices[vi    ] = dl
                vertices[vi + 1] = dt
                vertices[vi + 2] = sl
                vertices[vi + 3] = st
                break
            }
            vi += 4
          } else {
            endIndex = index
            break
          }
        }
        array[0] = startAngle
        array[1] = startIndex
        array[2] = 4
        array[3] = startAngle + currentAngle
        array[4] = endIndex
        array[5] = vi
        for (let i = 0; i < 6; i += 3) {
          const angle = array[i]
          const side = array[i + 1]
          const vi = array[i + 2]
          switch (side) {
            case 0: {
              const x = Math.tan(angle + Math.PI * 0.5) * doy
              const dx = (dox + x)
              const sx = (tox + x) / tw
              vertices[vi    ] = dx
              vertices[vi + 1] = dt
              vertices[vi + 2] = sx
              vertices[vi + 3] = st
              break
            }
            case 1: {
              const y = Math.tan(angle) * (w - dox)
              const dy = (doy + y)
              const sy = (toy + y) / th
              vertices[vi    ] = dr
              vertices[vi + 1] = dy
              vertices[vi + 2] = sr
              vertices[vi + 3] = sy
              break
            }
            case 2: {
              const x = Math.tan(angle - Math.PI * 0.5) * (h - doy)
              const dx = (dox - x)
              const sx = (tox - x) / tw
              vertices[vi    ] = dx
              vertices[vi + 1] = db
              vertices[vi + 2] = sx
              vertices[vi + 3] = sb
              break
            }
            case 3: {
              const y = Math.tan(angle - Math.PI) * dox
              const dy = (doy - y)
              const sy = (toy - y) / th
              vertices[vi    ] = dl
              vertices[vi + 1] = dy
              vertices[vi + 2] = sl
              vertices[vi + 3] = sy
              break
            }
          }
        }
        const drawingLength = vi / 4 + 1
        response.vertexLength = drawingLength * 4
        response.drawingLength = drawingLength
        return response
      }
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

  // 静态 - 返回数据
  static response = {
    vertices: new Float32Array(28),
    angles: new Float64Array(4),
    array: new Float64Array(6),
    vertexLength: null,
    drawingLength: null,
  }
}

UI.ProgressBar = ProgressBarElement

// ******************************** 进度条元素导出 ********************************

export { ProgressBarElement }
