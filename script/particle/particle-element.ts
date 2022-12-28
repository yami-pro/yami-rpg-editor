"use strict"

import {
  GL,
  Particle
} from "../yami"

// ******************************** 粒子元素类 ********************************

class ParticleElement {
  emitter           //:object
  layer             //:object
  data              //:object
  elapsed           //:number
  lifetime          //:number
  fadeout           //:number
  fadeoutTime       //:number
  x                 //:number
  y                 //:number
  anchorX           //:number
  anchorY           //:number
  movementSpeedX    //:number
  movementSpeedY    //:number
  movementAccelX    //:number
  movementAccelY    //:number
  rotationAngle     //:number
  rotationSpeed     //:number
  rotationAccel     //:number
  scaleFactor       //:number
  scaleSpeed        //:number
  scaleAccel        //:number
  hindex            //:number
  vindex            //:number
  opacity           //:number
  color             //:array
  setStartPosition  //:function
  postProcessing    //:function
  setStartColor     //:function
  updateColor       //:function

  constructor(layer) {
    this.emitter = layer.emitter
    this.layer = layer
    this.data = layer.data
    this.elapsed = 0
    this.lifetime = 0
    this.fadeout = 0
    this.fadeoutTime = 0
    this.x = 0
    this.y = 0
    this.anchorX = 0
    this.anchorY = 0
    this.movementSpeedX = 0
    this.movementSpeedY = 0
    this.movementAccelX = 0
    this.movementAccelY = 0
    this.rotationAngle = 0
    this.rotationSpeed = 0
    this.rotationAccel = 0
    this.scaleFactor = 0
    this.scaleSpeed = 0
    this.scaleAccel = 0
    this.hindex = 0
    this.vindex = 0
    this.opacity = 0
    this.color = new Uint32Array(5)
    this.updateMethods()
    this.initialize()
  }

  // 初始化
  initialize() {
    const {emitter} = this
    const {lifetime, lifetimeDev, fadeout, anchor, rotation, movement, scale, hframes, vframes} = this.data

    // 计算初始属性
    this.elapsed = 0
    this.lifetime = lifetime + lifetimeDev * (Math.random() * 2 - 1)
    this.fadeout = fadeout
    this.fadeoutTime = this.lifetime - fadeout
    this.scaleFactor = Math.randomBetween(scale.factor[0], scale.factor[1]) * emitter.scale
    this.scaleSpeed = Math.randomBetween(scale.speed[0], scale.speed[1]) / 1e3 * emitter.scale
    this.scaleAccel = Math.randomBetween(scale.accel[0], scale.accel[1]) / 1e6 * emitter.scale
    this.anchorX = Math.randomBetween(anchor.x[0], anchor.x[1])
    this.anchorY = Math.randomBetween(anchor.y[0], anchor.y[1])
    this.rotationAngle = Math.radians(Math.randomBetween(rotation.angle[0], rotation.angle[1])) + emitter.angle
    this.rotationSpeed = Math.radians(Math.randomBetween(rotation.speed[0], rotation.speed[1])) / 1e3
    this.rotationAccel = Math.radians(Math.randomBetween(rotation.accel[0], rotation.accel[1])) / 1e6
    const movementAngle = Math.radians(Math.randomBetween(movement.angle[0], movement.angle[1])) + emitter.angle
    const movementSpeed = Math.randomBetween(movement.speed[0], movement.speed[1]) / 1e3
    this.movementSpeedX = movementSpeed * Math.cos(movementAngle)
    this.movementSpeedY = movementSpeed * Math.sin(movementAngle)
    const movementAccelAngle = Math.radians(Math.randomBetween(movement.accelAngle[0], movement.accelAngle[1])) + emitter.angle
    const movementAccel = Math.randomBetween(movement.accel[0], movement.accel[1]) / 1e6
    this.movementAccelX = movementAccel * Math.cos(movementAccelAngle)
    this.movementAccelY = movementAccel * Math.sin(movementAccelAngle)
    const frame = Math.floor(Math.random() * hframes * vframes)
    this.hindex = frame % hframes
    this.vindex = Math.floor(frame / hframes)
    this.opacity = 1

    // 设置初始位置
    this.setStartPosition(movementAngle)

    // 设置初始颜色
    this.setStartColor()
  }

  // 更新数据
  update(deltaTime) {
    // 计算当前帧新的位置
    this.elapsed += deltaTime
    this.scaleSpeed += this.scaleAccel * deltaTime
    this.scaleFactor += this.scaleSpeed * deltaTime
    this.rotationSpeed += this.rotationAccel * deltaTime
    this.rotationAngle += this.rotationSpeed * deltaTime
    this.movementSpeedX += this.movementAccelX * deltaTime
    this.movementSpeedY += this.movementAccelY * deltaTime
    this.x += this.movementSpeedX * deltaTime
    this.y += this.movementSpeedY * deltaTime

    // 更新颜色
    this.updateColor()

    // 后期处理
    return this.postProcessing()
  }

  // 绘制图像
  draw(vi) {
    const layer = this.layer
    const sw = layer.unitWidth
    const sh = layer.unitHeight
    const tw = layer.textureWidth
    const th = layer.textureHeight
    const vertices = GL.arrays[0].float32
    const colors = GL.arrays[0].uint32
    const matrix = GL.matrix.reset()
    .translate(this.x, this.y)
    .rotate(this.rotationAngle)
    .scale(this.scaleFactor, this.scaleFactor)
    .translate(-this.anchorX * sw, -this.anchorY * sh)
    const R = sw
    const B = sh
    const a = matrix[0]
    const b = matrix[1]
    const c = matrix[3]
    const d = matrix[4]
    const e = matrix[6]
    const f = matrix[7]
    const sx = this.hindex * sw
    const sy = this.vindex * sh
    const color = this.getColorInt()
    const sl = sx / tw
    const st = sy / th
    const sr = (sx + sw) / tw
    const sb = (sy + sh) / th
    vertices[vi    ] = e
    vertices[vi + 1] = f
    vertices[vi + 2] = sl
    vertices[vi + 3] = st
    colors  [vi + 4] = color
    vertices[vi + 5] = c * B + e
    vertices[vi + 6] = d * B + f
    vertices[vi + 7] = sl
    vertices[vi + 8] = sb
    colors  [vi + 9] = color
    vertices[vi + 10] = a * R + c * B + e
    vertices[vi + 11] = b * R + d * B + f
    vertices[vi + 12] = sr
    vertices[vi + 13] = sb
    colors  [vi + 14] = color
    vertices[vi + 15] = a * R + e
    vertices[vi + 16] = b * R + f
    vertices[vi + 17] = sr
    vertices[vi + 18] = st
    colors  [vi + 19] = color
  }

  // 获取整数型颜色
  getColorInt() {
    const {color} = this
    if (color.changed) {
      color.changed = false
      const r = color[0]
      const g = color[1]
      const b = color[2]
      const a = Math.round(color[3] * this.opacity)
      color[4] = r + (g + (b + a * 256) * 256) * 256
    }
    return color[4]
  }

  // 更新方法
  updateMethods() {
    const {area, color} = this.data
    switch (area.type) {
      case 'point':
        this.setStartPosition = this.setStartPositionPoint
        this.postProcessing = this.postProcessingCommon
        break
      case 'rectangle':
        this.setStartPosition = this.setStartPositionRectangle
        this.postProcessing = this.postProcessingCommon
        break
      case 'circle':
        this.setStartPosition = this.setStartPositionCircle
        this.postProcessing = this.postProcessingCommon
        break
      case 'edge':
        this.setStartPosition = this.setStartPositionEdge
        this.postProcessing = this.postProcessingEdge
        break
    }
    switch (color.mode) {
      case 'fixed':
        this.setStartColor = this.setStartColorFixed
        this.updateColor = Function.empty
        break
      case 'random':
        this.setStartColor = this.setStartColorRandom
        this.updateColor = Function.empty
        break
      case 'easing':
        if (this.color.start === undefined) {
          this.color.start = new Uint8Array(4)
          this.color.end = new Uint8Array(4)
        }
        this.setStartColor = this.setStartColorEasing
        this.updateColor = this.updateColorEasing
        break
      case 'texture':
        this.setStartColor = this.setStartColorTexture
        this.updateColor = Function.empty
        break
    }
  }

  // 变换初始位置
  transformStartPosition() {
    const {matrix} = this.emitter
    if (matrix !== null) {
      const a = matrix[0]
      const b = matrix[1]
      const c = matrix[3]
      const d = matrix[4]
      const e = matrix[6]
      const f = matrix[7]
      const {x, y} = this
      this.x = a * x + c * y + e
      this.y = b * x + d * y + f
    }
  }

  // 设置初始位置 - 点
  setStartPositionPoint() {
    const {emitter} = this
    const {area} = this.data
    this.x = emitter.startX + area.x
    this.y = emitter.startY + area.y
    this.transformStartPosition()
  }

  // 设置初始位置 - 矩形
  setStartPositionRectangle() {
    const {emitter} = this
    const {area} = this.data
    const x = emitter.startX + area.x
    const y = emitter.startY + area.y
    const wh = area.width / 2
    const hh = area.height / 2
    this.x = Math.randomBetween(x - wh, x + wh)
    this.y = Math.randomBetween(y - hh, y + hh)
    this.transformStartPosition()
  }

  // 设置初始位置 - 圆形
  setStartPositionCircle() {
    const {emitter} = this
    const {area} = this.data
    const x = emitter.startX + area.x
    const y = emitter.startY + area.y
    const angle = Math.random() * Math.PI * 2
    const distance = Math.random() * area.radius
    this.x = x + distance * Math.cos(angle)
    this.y = y + distance * Math.sin(angle)
    this.transformStartPosition()
  }

  // 设置初始位置 - 屏幕边缘
  setStartPositionEdge(movementAngle) {
    // 计算屏幕边缘的位置
    const stage = ParticleElement.stage
    const scrollLeft = stage.scrollLeft
    const scrollTop = stage.scrollTop
    const scrollRight = stage.scrollRight
    const scrollBottom = stage.scrollBottom
    const width = scrollRight - scrollLeft
    const height = scrollBottom - scrollTop
    const weightX = Math.abs(Math.sin(movementAngle) * width)
    const weightY = Math.abs(Math.sin(movementAngle - Math.PI / 2) * height)
    const threshold = weightX / (weightX + weightY)
    const random = Math.random()
    if (random < threshold) {
      const forward = this.movementSpeedY >= 0
      this.x = scrollLeft + random / threshold * width
      this.y = forward ? scrollTop : scrollBottom
      const vertices = this.computeBoundingRectangle()
      this.x -= (vertices[0] + vertices[2]) / 2 - this.x
      this.y -= forward
      ? vertices[3] - this.y
      : vertices[1] - this.y
    } else {
      const forward = this.movementSpeedX >= 0
      this.y = scrollTop + (random - threshold) / (1 - threshold) * height
      this.x = forward ? scrollLeft : scrollRight
      const vertices = this.computeBoundingRectangle()
      this.y -= (vertices[1] + vertices[3]) / 2 - this.y
      this.x -= forward
      ? vertices[2] - this.x
      : vertices[0] - this.x
    }
  }

  // 后期处理 - 通用
  postProcessingCommon() {
    // 消失
    if (this.elapsed >= this.lifetime) {
      return false
    }

    // 淡出
    if (this.elapsed > this.fadeoutTime) {
      const elapsed = this.elapsed - this.fadeoutTime
      const time = elapsed / this.fadeout
      this.opacity = Math.max(1 - time, 0)
      this.color.changed = true
    }
  }

  // 后期处理 - 屏幕边缘
  postProcessingEdge() {
    // 处于屏幕内
    const stage = ParticleElement.stage
    const vertices = this.computeBoundingRectangle()
    if (vertices[0] < stage.scrollRight &&
      vertices[1] < stage.scrollBottom &&
      vertices[2] > stage.scrollLeft &&
      vertices[3] > stage.scrollTop &&
      this.elapsed < this.lifetime) {
      this.appeared = true

      // 淡出
      if (this.elapsed > this.fadeoutTime) {
        const elapsed = this.elapsed - this.fadeoutTime
        const time = elapsed / this.fadeout
        this.opacity = Math.max(1 - time, 0)
        this.color.changed = true
      }
      return
    }

    // 处于屏幕外
    if (this.appeared ||
      this.elapsed > 500 ||
      this.elapsed >= this.lifetime) {
      this.appeared = false
      return false
    }
  }

  // 计算外接矩形
  computeBoundingRectangle() {
    const layer = this.layer
    const sw = layer.unitWidth
    const sh = layer.unitHeight
    const matrix = GL.matrix.reset()
    .translate(this.x, this.y)
    .rotate(this.rotationAngle)
    .scale(this.scaleFactor, this.scaleFactor)
    .translate(-this.anchorX * sw, -this.anchorY * sh)
    const R = sw
    const B = sh
    const a = matrix[0]
    const b = matrix[1]
    const c = matrix[3]
    const d = matrix[4]
    const e = matrix[6]
    const f = matrix[7]
    const x1 = e
    const y1 = f
    const x2 = c * B + e
    const y2 = d * B + f
    const x3 = a * R + c * B + e
    const y3 = b * R + d * B + f
    const x4 = a * R + e
    const y4 = b * R + f
    const vertices = ParticleElement.sharedFloat64Array
    vertices[0] = Math.min(x1, x2, x3, x4)
    vertices[1] = Math.min(y1, y2, y3, y4)
    vertices[2] = Math.max(x1, x2, x3, x4)
    vertices[3] = Math.max(y1, y2, y3, y4)
    return vertices
  }

  // 设置初始颜色 - 固定
  setStartColorFixed() {
    const {rgba} = this.data.color
    const {color} = this
    color.changed = true
    color[0] = rgba[0]
    color[1] = rgba[1]
    color[2] = rgba[2]
    color[3] = rgba[3]
  }

  // 设置初始颜色 - 随机
  setStartColorRandom() {
    const {min, max} = this.data.color
    const {color} = this
    color.changed = true
    color[0] = Math.randomBetween(min[0], max[0])
    color[1] = Math.randomBetween(min[1], max[1])
    color[2] = Math.randomBetween(min[2], max[2])
    color[3] = Math.randomBetween(min[3], max[3])
  }

  // 设置初始颜色 - 过渡
  setStartColorEasing() {
    const {startMin, startMax, endMin, endMax} = this.data.color
    const {start, end} = this.color
    start[0] = Math.randomBetween(startMin[0], startMax[0])
    start[1] = Math.randomBetween(startMin[1], startMax[1])
    start[2] = Math.randomBetween(startMin[2], startMax[2])
    start[3] = Math.randomBetween(startMin[3], startMax[3])
    end[0] = Math.randomBetween(endMin[0], endMax[0])
    end[1] = Math.randomBetween(endMin[1], endMax[1])
    end[2] = Math.randomBetween(endMin[2], endMax[2])
    end[3] = Math.randomBetween(endMin[3], endMax[3])
  }

  // 更新颜色 - 过渡
  updateColorEasing() {
    const {easing} = this.layer
    const {color} = this
    const {start, end} = color
    const clamp = ParticleElement.sharedClampedArray
    const time = Math.min(easing.get(this.elapsed / this.lifetime), 1)
    color.changed = true
    clamp[0] = start[0] * (1 - time) + end[0] * time
    clamp[1] = start[1] * (1 - time) + end[1] * time
    clamp[2] = start[2] * (1 - time) + end[2] * time
    clamp[3] = start[3] * (1 - time) + end[3] * time
    color[0] = clamp[0]
    color[1] = clamp[1]
    color[2] = clamp[2]
    color[3] = clamp[3]
  }

  // 设置初始颜色 - 纹理
  setStartColorTexture() {
    const {color} = this
    color.changed = true
    color[3] = 255
  }

  // 静态 - 元素舞台
  static stage

  // 静态 - 公共属性
  static sharedFloat64Array = new Float64Array(4)
  static sharedClampedArray = new Uint8ClampedArray(4)
}

Particle.Element = ParticleElement

// ******************************** 粒子元素类导出 ********************************

export { ParticleElement }
