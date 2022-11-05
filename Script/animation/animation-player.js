'use strict'

import * as Yami from '../yami.js'

// ******************************** 动画播放器类 ********************************

class AnimationPlayer {
  visible   //:boolean
  index     //:number
  length    //:number
  loopStart //:number
  anchorX   //:number
  anchorY   //:number
  mirror    //:string
  data      //:object
  suffix    //:string
  motion    //:object
  motions   //:object
  sprites   //:object
  images    //:object
  textures  //:object
  contexts  //:array
  emitters  //:array

  constructor(animation) {
    this.index = 0
    this.length = 0
    this.loopStart = 0
    this.anchorX = 0
    this.anchorY = 0
    this.mirror = 'none'
    this.data = animation
    this.dirMap = AnimationPlayer.dirMaps[animation.mode]
    this.suffix = ''
    this.motion = null
    this.motions = {}
    this.sprites = {}
    this.images = {}
    this.textures = {}
    this.contexts = []
    this.emitters = []
    this.loadSprites()
    this.loadMotions()
  }

  // 切换动作
  switch(key, suffix = '') {
    const motions = this.motions
    const motion =
    motions[key + suffix] ??
    motions[key]
    this.suffix = suffix
    if (motion !== undefined &&
      this.motion !== motion) {
      this.motion = motion
      this.destroyContextEmitters()
      this.loadContexts(this.contexts)
      this.computeLength()
      return true
    }
    return false
  }

  // 重新开始
  restart() {
    this.index = 0
  }

  // 重置
  reset() {
    this.index = 0
    this.length = 0
    this.motion = null
    this.contexts = []
    this.destroyUpdatingEmitters()
    this.destroyContextEmitters()
  }

  // 设置动画位置
  setPosition(x, y) {
    const matrix = AnimationPlayer
    .matrix.set6f(1, 0, 0, 1, x, y)
    switch (this.mirror) {
      case 'none':
        break
      case 'horizontal':
        matrix.mirrorh()
        break
      case 'vertical':
        matrix.mirrorv()
        break
      case 'both':
        matrix.mirrorh()
        matrix.mirrorv()
        break
    }
  }

  // 设置精灵图像表
  setSpriteImages(images) {
    this.images = Object.setPrototypeOf(images, this.images)
  }

  // 计算帧列表参数
  updateFrameParameters(contexts, index) {
    const {count} = contexts
    outer: for (let i = 0; i < count; i++) {
      const context = contexts[i]
      const frames = context.layer.frames
      const last = frames.length - 1
      for (let i = 0; i <= last; i++) {
        const frame = frames[i]
        const start = frame.start
        const end = frame.end
        if (index >= start && index < end) {
          const easingId = frame.easingId
          if (easingId !== '' && i < last) {
            const next = frames[i + 1]
            const time = Yami.Easing.get(easingId).map(
              (index - start) / (next.start - start)
            )
            context.update(frame, time, next)
          } else {
            context.update(frame)
          }
          continue outer
        }
      }
      context.reset()
    }
  }

  // 加载精灵哈希表
  loadSprites() {
    const spriteMap = this.sprites
    const imageMap = this.images
    const sprites = this.data.sprites
    const length = sprites.length
    for (let i = 0; i < length; i++) {
      const sprite = sprites[i]
      spriteMap[sprite.id] = sprite
      imageMap[sprite.id] = sprite.image
    }
  }

  // 加载动作哈希表
  loadMotions() {
    const dirSuffixList = AnimationPlayer.dirSuffixLists[this.data.mode]
    const dirCounters = {}
    const motionMap = this.motions
    for (const motion of this.data.motions) {
      if (dirCounters[motion.id] === undefined) {
        dirCounters[motion.id] = 0
      }
      const suffixIndex = dirCounters[motion.id]++
      const suffix = dirSuffixList[suffixIndex]
      if (suffix !== undefined) {
        motionMap[motion.id + suffix] = motion
      }
    }
  }

  // 加载图层上下文列表
  loadContexts(contexts) {
    AnimationPlayer.loadContexts(this, contexts)
  }

  // 更新动画
  update(deltaTime) {
    this.index += deltaTime / AnimationPlayer.step
  }

  // 计算帧索引
  computeIndex() {
    if (this.index >= this.length) {
      if (this.motion.loop) {
        this.index = this.index % this.length + this.loopStart
      } else {
        this.index = this.length - 1
      }
    }
  }

  // 计算长度
  computeLength() {
    let length = 0
    const {contexts} = this
    const {count} = contexts
    for (let i = 0; i < count; i++) {
      const frames = contexts[i].layer.frames
      const frame = frames[frames.length - 1]
      if (frame !== undefined) {
        length = Math.max(length, frame.end)
      }
    }
    this.length = length
    this.loopStart = Math.min(this.motion.loopStart, length - 1)
  }

  // 发射粒子
  emitParticles(deltaTime) {
    const {contexts} = this
    const {count} = contexts
    for (let i = 0; i < count; i++) {
      const context = contexts[i]
      const {layer} = context
      if (layer.class === 'particle') {
        const {frame, emitter} = context
        if (frame !== null &&
          emitter !== undefined) {
          switch (layer.angle) {
            case 'default':
              emitter.angle = 0
              break
            case 'inherit': {
              const {matrix} = context
              const a = matrix[0]
              const b = matrix[1]
              emitter.angle = Math.atan2(b, a)
              break
            }
          }
          emitter.emitParticles(deltaTime)
        }
      }
    }
  }

  // 更新粒子
  updateParticles(deltaTime) {
    const {emitters} = this
    let i = emitters.length
    while (--i >= 0) {
      const emitter = emitters[i]
      if (emitter.updateParticles(deltaTime) === false && emitter.disabled) {
        emitter.destroy()
        emitters.splice(i, 1)
      }
    }
  }

  // 绘制动画
  draw(opacity) {
    const {contexts} = this
    const {count} = contexts
    for (let i = 0; i < count; i++) {
      const context = contexts[i]
      const {layer} = context
      if (layer.class === 'sprite' &&
        context.frame !== null) {
        const key = layer.sprite
        const texture = this.getTexture(key)
        if (texture !== null) {
          context.opacity *= opacity
          this.drawSprite(context, texture)
        }
      }
    }
    const {emitters} = this
    const {length} = emitters
    if (length !== 0) {
      Yami.GL.batchRenderer.draw()
      for (let i = 0; i < length; i++) {
        emitters[i].draw()
      }
    }
  }

  // 绘制精灵
  drawSprite(context, texture, light) {
    const gl = Yami.GL
    const vertices = gl.arrays[0].float32
    const attributes = gl.arrays[0].uint32
    const renderer = gl.batchRenderer
    const response = renderer.response
    const matrix = context.matrix
    const layer = context.layer
    const frame = context.frame
    const tint = context.tint
    const base = texture.base
    const tw = base.width
    const th = base.height
    const sw = texture.width
    const sh = texture.height
    const sx = frame.spriteX * sw
    const sy = frame.spriteY * sh
    const L = texture.offsetX
    const T = texture.offsetY
    const R = L + sw
    const B = T + sh
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
    const sl = sx / tw
    const st = sy / th
    const sr = (sx + sw) / tw
    const sb = (sy + sh) / th
    renderer.setBlendMode(layer.blend)
    renderer.push(base.index)
    if (light === undefined) {
      light = Yami.Scene.showLight ? layer.light : 'raw'
    }
    const vi = response[0] * 8
    const mode = AnimationPlayer.lightSamplingModes[light]
    const alpha = Math.round(context.opacity * 255)
    const param = response[1] | alpha << 8 | mode << 16
    const redGreen = tint[0] + (tint[1] << 16) + 0x00ff00ff
    const blueGray = tint[2] + (tint[3] << 16) + 0x00ff00ff
    const anchor = light !== 'anchor' ? 0 : (
      Math.round(Math.clamp(this.anchorX, 0, 1) * 0xffff)
    | Math.round(Math.clamp(this.anchorY, 0, 1) * 0xffff) << 16
    )
    vertices  [vi    ] = x1
    vertices  [vi + 1] = y1
    vertices  [vi + 2] = sl
    vertices  [vi + 3] = st
    attributes[vi + 4] = param
    attributes[vi + 5] = redGreen
    attributes[vi + 6] = blueGray
    attributes[vi + 7] = anchor
    vertices  [vi + 8] = x2
    vertices  [vi + 9] = y2
    vertices  [vi + 10] = sl
    vertices  [vi + 11] = sb
    attributes[vi + 12] = param
    attributes[vi + 13] = redGreen
    attributes[vi + 14] = blueGray
    attributes[vi + 15] = anchor
    vertices  [vi + 16] = x3
    vertices  [vi + 17] = y3
    vertices  [vi + 18] = sr
    vertices  [vi + 19] = sb
    attributes[vi + 20] = param
    attributes[vi + 21] = redGreen
    attributes[vi + 22] = blueGray
    attributes[vi + 23] = anchor
    vertices  [vi + 24] = x4
    vertices  [vi + 25] = y4
    vertices  [vi + 26] = sr
    vertices  [vi + 27] = st
    attributes[vi + 28] = param
    attributes[vi + 29] = redGreen
    attributes[vi + 30] = blueGray
    attributes[vi + 31] = anchor
  }

  // 获取纹理
  getTexture(spriteId) {
    const textures = this.textures
    const texture = textures[spriteId]
    if (texture === undefined) {
      const sprite = this.sprites[spriteId]
      const imageId = this.images[spriteId]
      if (sprite !== undefined && imageId) {
        const texture = new Yami.ImageTexture(imageId)
        textures[spriteId] = null
        texture.on('load', () => {
          if (this.textures === textures) {
            const {floor, max} = Math
            const {base} = texture
            const {hframes, vframes} = sprite
            const width = floor(max(base.width / hframes, 1))
            const height = floor(max(base.height / vframes, 1))
            texture.width = width
            texture.height = height
            texture.offsetX = -width / 2
            texture.offsetY = -height / 2
            textures[spriteId] = texture
            Yami.Scene.requestRendering()
          } else {
            texture.destroy()
          }
        })
        if (texture.complete) {
          return texture
        }
      }
      return null
    }
    return texture
  }

  // 销毁
  destroy() {
    // 销毁图像纹理
    for (const texture of Object.values(this.textures)) {
      if (texture instanceof Yami.ImageTexture) {
        texture.destroy()
      }
    }
    this.textures = null
    // 销毁更新中的粒子发射器
    this.destroyUpdatingEmitters()
    // 销毁上下文的粒子发射器
    this.destroyContextEmitters()
    // 销毁编辑器元素
    for (const motion of Object.values(this.motions)) {
      if (motion.loaded === undefined) continue
      delete motion.loaded
      for (const layer of motion.layers) {
        for (const frame of layer.frames) {
          delete frame.key
        }
      }
    }
  }

  // 销毁更新中的粒子发射器
  destroyUpdatingEmitters() {
    const {emitters} = this
    const {length} = emitters
    if (length === 0) return
    for (let i = 0; i < length; i++) {
      emitters[i].destroy()
    }
    emitters.length = 0
  }

  // 销毁上下文的粒子发射器
  destroyContextEmitters() {
    const {contexts} = this
    const {count} = contexts
    for (let i = 0; i < count; i++) {
      const context = contexts[i]
      const emitter = context.emitter
      if (emitter !== undefined) {
        emitter.disabled = true
        if (emitter.isEmpty()) {
          emitter.destroy()
          this.emitters.remove(emitter)
        }
        delete context.emitter
      }
    }
  }

  // 清除粒子对象
  clearParticles() {
    const {emitters} = this
    const {length} = emitters
    if (length === 0) return
    for (let i = 0; i < length; i++) {
      emitters[i].clear()
    }
  }

  // 获取指定角度的方向参数
  getDirParamsByAngle(angle) {
    const dirMap = this.dirMap
    const directions = dirMap.length
    const destAngle = Math.radians(angle)
    const proportion = Math.modRadians(destAngle) / (Math.PI * 2)
    const direction = Math.floor((proportion * directions + 0.5) % directions)
    return dirMap[direction]
  }

  // 静态 - 动画属性
  static step = 0
  static matrix = new Yami.Matrix()
  static lightSamplingModes = {raw: 0, global: 1, anchor: 2}
  static stage

  // 各种模式的动画方向后缀列表
  static dirSuffixLists = {
    '1-dir': [''],
    '1-dir-mirror': [''],
    '2-dir': ['.left', '.right'],
    '3-dir-mirror': ['.down', '.right', '.up'],
    '4-dir': ['.down', '.left', '.right', '.up'],
    '5-dir-mirror': ['.down', '.right', '.up', '.down-right', '.up-right'],
    '8-dir': ['.down', '.left', '.right', '.up', '.down-left', '.down-right', '.up-left', '.up-right'],
  }

  // 各种模式的动画方向映射表
  static dirMaps = {
    '1-dir': [
      {suffix: '', mirror: 'none'},
    ],
    '1-dir-mirror': [
      {suffix: '', mirror: 'none'},
      {suffix: '', mirror: 'horizontal'},
    ],
    '2-dir': [
      {suffix: '.right', mirror: 'none'},
      {suffix: '.left', mirror: 'none'},
    ],
    '3-dir-mirror': [
      {suffix: '.right', mirror: 'none'},
      {suffix: '.down', mirror: 'none'},
      {suffix: '.right', mirror: 'horizontal'},
      {suffix: '.up', mirror: 'none'},
    ],
    '4-dir': [
      {suffix: '.right', mirror: 'none'},
      {suffix: '.down', mirror: 'none'},
      {suffix: '.left', mirror: 'none'},
      {suffix: '.up', mirror: 'none'},
    ],
    '5-dir-mirror': [
      {suffix: '.right', mirror: 'none'},
      {suffix: '.down-right', mirror: 'none'},
      {suffix: '.down', mirror: 'none'},
      {suffix: '.down-right', mirror: 'horizontal'},
      {suffix: '.right', mirror: 'horizontal'},
      {suffix: '.up-right', mirror: 'horizontal'},
      {suffix: '.up', mirror: 'none'},
      {suffix: '.up-right', mirror: 'none'},
    ],
    '8-dir': [
      {suffix: '.right', mirror: 'none'},
      {suffix: '.down-right', mirror: 'none'},
      {suffix: '.down', mirror: 'none'},
      {suffix: '.down-left', mirror: 'none'},
      {suffix: '.left', mirror: 'none'},
      {suffix: '.up-left', mirror: 'none'},
      {suffix: '.up', mirror: 'none'},
      {suffix: '.up-right', mirror: 'none'},
    ],
  }

  // 静态 - 更新动画步长
  static updateStep() {
    this.step = 1000 / Yami.Data.config.animation.frameRate
  }

  // 静态 - 加载动画图层上下文列表
  static loadContexts(animation, contexts) {
    const {motion} = animation
    contexts.count = 0
    if (motion !== null) {
      // 如果动画已设置动作，加载所有图层上下文
      this.#loadContext(animation, motion.layers, null, contexts)
    }
  }

  // 静态 - 加载动画图层上下文
  static #loadContext(animation, layers, parent, contexts) {
    for (const layer of layers) {
      let context = contexts[contexts.count]
      if (context === undefined) {
        context = contexts[contexts.count] = {
          animation: animation,
          parent: null,
          layer: null,
          frame: null,
          matrix: new Yami.Matrix(),
          opacity: 0,
          update: null,
          reset: AnimationPlayer.contextReset,
        }
      }
      contexts.count++
      context.parent = parent
      context.layer = layer
      switch (layer.class) {
        case 'joint':
          context.update = AnimationPlayer.contextUpdate
          break
        case 'sprite':
          context.update = AnimationPlayer.contextUpdateSprite
          break
        case 'particle':
          context.update = AnimationPlayer.contextUpdateParticle
          break
      }
      if (layer.class === 'joint') {
        this.#loadContext(animation, layer.children, context, contexts)
      }
    }
  }

  // 静态 - 上下文方法 - 重置
  static contextReset() {
    const parent = this.parent
    const matrix = this.matrix
    if (parent !== null) {
      matrix.set(parent.matrix)
      this.opacity = parent.opacity
    } else {
      matrix.set(AnimationPlayer.matrix)
      this.opacity = 1
    }
    this.frame = null
  }

  // 静态 - 上下文方法 - 更新
  static contextUpdate(frame, time, next) {
    const parent = this.parent
    const matrix = this.matrix
    if (parent !== null) {
      matrix.set(parent.matrix)
      this.opacity = parent.opacity
    } else {
      matrix.set(AnimationPlayer.matrix)
      this.opacity = 1
    }
    let positionX = frame.x
    let positionY = frame.y
    let rotation = frame.rotation
    let scaleX = frame.scaleX
    let scaleY = frame.scaleY
    let opacity = frame.opacity
    if (next !== undefined) {
      const reverse = 1 - time
      positionX = positionX * reverse + next.x * time
      positionY = positionY * reverse + next.y * time
      rotation = rotation * reverse + next.rotation * time
      scaleX = scaleX * reverse + next.scaleX * time
      scaleY = scaleY * reverse + next.scaleY * time
      opacity = opacity * reverse + next.opacity * time
    }
    matrix
    .translate(positionX, positionY)
    .rotate(Math.radians(rotation))
    .scale(scaleX, scaleY)
    this.opacity *= opacity
    this.frame = frame
  }

  // 静态 - 上下文方法 - 更新精灵
  static contextUpdateSprite(frame, time, next) {
    AnimationPlayer.contextUpdate.call(this, frame, time, next)
    // 获取或创建色调数组
    let tint = this.tint
    if (tint === undefined) {
      tint = this.tint = new Int16Array(4)
    }
    // 更新色调
    let red = frame.tint[0]
    let green = frame.tint[1]
    let blue = frame.tint[2]
    let gray = frame.tint[3]
    if (next !== undefined) {
      const reverse = 1 - time
      red = Math.clamp(red * reverse + next.tint[0] * time, -255, 255)
      green = Math.clamp(green * reverse + next.tint[1] * time, -255, 255)
      blue = Math.clamp(blue * reverse + next.tint[2] * time, -255, 255)
      gray = Math.clamp(gray * reverse + next.tint[3] * time, 0, 255)
    }
    tint[0] = red
    tint[1] = green
    tint[2] = blue
    tint[3] = gray
  }

  // 静态 - 上下文方法 - 更新粒子
  static contextUpdateParticle(frame, time, next) {
    AnimationPlayer.contextUpdate.call(this, frame, time, next)
    // 获取或创建粒子发射器
    let emitter = this.emitter
    if (emitter === undefined) {
      const guid = this.layer.particleId
      const data = Yami.Data.particles[guid]
      if (!data) return
      emitter = new Yami.Particle.Emitter(data)
      emitter.matrix = this.matrix
      this.emitter = emitter
      this.animation.emitters.push(emitter)
    }
    // 更新粒子发射器
    let scale = frame.scale
    let speed = frame.speed
    if (next !== undefined) {
      const reverse = 1 - time
      scale = scale * reverse + next.scale * time
      speed = speed * reverse + next.speed * time
    }
    emitter.scale = scale
    emitter.speed = speed
  }
}

// ******************************** 动画播放器类导出 ********************************

export { AnimationPlayer }
