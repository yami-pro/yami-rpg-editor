/** ******************************** 离屏渲染 - 开始 ******************************** */

let OffscreenStart = new class OffscreenStartRenderer {
  /** 开始渲染离屏画面 */
  public render(): void {
    // 启用离屏纹理并擦除画布
    GL.enableOffscreen(true)
    GL.clearColor(0, 0, 0, 0)
    GL.clear(GL.COLOR_BUFFER_BIT)
    // 销毁UI时可能删除了绑定的0号纹理
    // 在帧渲染起始位置绑定一个临时纹理
    // 避免部分Android Web控制台输出错误警告
    GL.activeTexture(GL.TEXTURE0)
    GL.bindTexture(GL.TEXTURE_2D, GL.tempTexture.base.glTexture)
  }
}

/** ******************************** 离屏渲染 - 结束 ******************************** */

let OffscreenEnd = new class OffscreenEndRenderer {
  /** 结束渲染离屏画面 */
  public render(): void {
    // 禁用离屏纹理并复制纹理像素到画布中
    GL.enableOffscreen(false)
    GL.blend = 'copy'
    // 如果用blitFramebuffer在抗锯齿模式下会报错
    const program = GL.imageProgram.use()
    const vertices = GL.arrays[0].float32
    vertices[0] = -1
    vertices[1] = 1
    vertices[2] = 0
    vertices[3] = 0
    vertices[4] = -1
    vertices[5] = -1
    vertices[6] = 0
    vertices[7] = 1
    vertices[8] = 1
    vertices[9] = -1
    vertices[10] = 1
    vertices[11] = 1
    vertices[12] = 1
    vertices[13] = 1
    vertices[14] = 1
    vertices[15] = 0
    GL.bindVertexArray(program.vao.a110)
    GL.vertexAttrib1f(program.a_Opacity, 1)
    GL.uniformMatrix3fv(program.u_Matrix, false, GL.matrix.reset())
    GL.uniform1i(program.u_LightMode, 0)
    GL.uniform1i(program.u_ColorMode, 0)
    GL.uniform4f(program.u_Tint, 0, 0, 0, 0)
    GL.bufferData(GL.ARRAY_BUFFER, vertices, GL.STREAM_DRAW, 0, 16)
    GL.bindTexture(GL.TEXTURE_2D, GL.offscreen.current.base.glTexture)
    GL.drawArrays(GL.TRIANGLE_FAN, 0, 4)
  }
}

/** ******************************** 屏幕染色器 ******************************** */

let ScreenTinter = new class TintFilter {
  /** 色调数组 */
  private tint: ImageTint = [0, 0, 0, 0]
  /** 过度计时器 */
  private transition?: Timer

  constructor() {
    Scene.filters.set('screen-tinter', this)
  }

  /** 重置色调 */
  public reset(): void {
    if (this.transition) {
      this.transition.remove()
      delete this.transition
    }
    this.tint[0] = 0
    this.tint[1] = 0
    this.tint[2] = 0
    this.tint[3] = 0
  }

  /** 渲染场景色调 */
  public render(): void {
    const {tint} = this
    if (tint[0] === 0 &&
      tint[1] === 0 &&
      tint[2] === 0 &&
      tint[3] === 0) {
      return
    }
    // 切换离屏纹理
    GL.switchOffscreen()
    GL.blend = 'copy'
    // 复制染色后的画面到当前的离屏纹理
    GL.drawImage(GL.offscreen.last, 0, 0, GL.width, GL.height, tint)
  }

  /**
   * 设置场景色调
   * @param tint 色调数组[-255~255, -255~255, -255~255, 0~255]
   * @param easingId 过渡曲线ID
   * @param duration 持续时间(毫秒)
   */
  public set(tint: ImageTint, easingId: string = '', duration: number = 0): void {
    // 如果上一次的色调过渡未结束，移除
    if (this.transition) {
      this.transition.remove()
      delete this.transition
    }
    if (duration > 0) {
      const start = Array.from(this.tint)
      const end = tint
      const easing = Easing.get(easingId)
      // 创建色调过渡计时器
      this.transition = new Timer({
        duration: duration,
        update: timer => {
          const tint = this.tint
          const time = easing.get(timer.elapsed / duration)
          tint[0] = Math.clamp(start[0] * (1 - time) + end[0] * time, -255, 255)
          tint[1] = Math.clamp(start[1] * (1 - time) + end[1] * time, -255, 255)
          tint[2] = Math.clamp(start[2] * (1 - time) + end[2] * time, -255, 255)
          tint[3] = Math.clamp(start[3] * (1 - time) + end[3] * time, 0, 255)
        },
        callback: () => {
          delete this.transition
        },
      }).add()
    } else {
      // 直接设置色调
      this.tint[0] = tint[0]
      this.tint[1] = tint[1]
      this.tint[2] = tint[2]
      this.tint[3] = tint[3]
    }
  }
}

/** ******************************** 角色描边效果 ******************************** */

let ActorOutline = new class ActorOutline {
  /** 角色列表 */
  public actorList: Array<Actor> = new Array()
  /** {角色:颜色}映射表 */
  public actorColorMap: Map<Actor, ColorArray> = new Map()
  /** 透明颜色数组 */
  public transparentColorArray: ColorArray = [0, 0, 0, 0]
  /** 描边颜色数组 */
  public defaultColorArray: ColorArray = [1, 1, 1, 1]
  /** 像素偏移列表 */
  public offsets = [
    {ox:  0, oy:  0},
    {ox: -1, oy:  0},
    {ox:  1, oy:  0},
    {ox:  0, oy: -1},
    {ox:  0, oy:  1},
  ]

  constructor() {
    Scene.filters.set('actor-outline', this)
  }

  /** 添加角色 */
  public add(actor: Actor, color: ColorArray = this.defaultColorArray): void {
    if (!this.actorColorMap.has(actor)) {
      this.actorList.append(actor)
    }
    this.actorColorMap.set(actor, color)
  }

  /** 移除角色 */
  public remove(actor: Actor): void {
    if (this.actorColorMap.delete(actor)) {
      this.actorList.remove(actor)
    }
  }

  /** 重置 */
  public reset(): void {
    this.actorList.length = 0
    this.actorColorMap.clear()
  }

  /** 剔除已销毁的角色 */
  private trim(): void {
    const actors = this.actorList
    const map = this.actorColorMap
    let i = actors.length
    while (--i >= 0) {
      if (actors[i].destroyed) {
        map.delete(actors[i])
        actors.splice(i, 1)
      }
    }
  }

  /** 渲染角色描边 */
  public render(): void {
    const map = this.actorColorMap
    if (map.size === 0) return
    this.trim()
    const gl = GL
    const vertices = gl.arrays[0].float32
    gl.enable(gl.DEPTH_TEST)
    // 按反向渲染顺序绘制描边
    const actors = Scene.visibleActors
    for (let i = actors.count - 1; i >= 0; i--) {
      const actor = actors[i]!
      if (map.has(actor) === false) {
        continue
      }
      const {active, animation} = actor
      if (active === false || animation === null) {
        continue
      }
      const {contexts} = animation
      const {count} = contexts
      for (const {ox, oy} of this.offsets) {
        let color
        if (ox === 0 && oy === 0) {
          gl.depthFunc(gl.ALWAYS)
          color = this.transparentColorArray
        } else {
          gl.depthFunc(gl.NOTEQUAL)
          color = map.get(actor)!
        }
        const projMatrix = gl.matrix.project(
          gl.flip,
          Camera.width,
          Camera.height,
        ).translate(
          ox - Camera.scrollLeft,
          oy - Camera.scrollTop,
        )
        for (let i = 0; i < count; i++) {
          const context = contexts[i]!
          const {layer} = context
          if (layer.class === 'sprite' &&
            context.frame !== null) {
            const key = layer.sprite
            const texture = animation.getTexture(key)
            if (texture) {
              const matrix = context.matrix
              const frame = context.frame as AnimationSpriteFrame
              const base = texture.base
              const tw = base.width
              const th = base.height
              const sw = texture.width
              const sh = texture.height
              const sx = frame.spriteX * sw
              const sy = frame.spriteY * sh
              const L = -(sw * context.anchorX + context.pivotX)
              const T = -(sh * context.anchorY + context.pivotY)
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
              vertices[0] = x1
              vertices[1] = y1
              vertices[2] = sl
              vertices[3] = st
              vertices[4] = x2
              vertices[5] = y2
              vertices[6] = sl
              vertices[7] = sb
              vertices[8] = x3
              vertices[9] = y3
              vertices[10] = sr
              vertices[11] = sb
              vertices[12] = x4
              vertices[13] = y4
              vertices[14] = sr
              vertices[15] = st
              const program = gl.imageProgram.use()
              gl.bindVertexArray(program.vao.a110)
              gl.vertexAttrib1f(program.a_Opacity, 1)
              gl.uniformMatrix3fv(program.u_Matrix, false, projMatrix)
              gl.uniform1i(program.u_LightMode, 0)
              gl.uniform1i(program.u_ColorMode, 1)
              gl.uniform4fv(program.u_Color, color)
              gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STREAM_DRAW, 0, 16)
              gl.bindTexture(gl.TEXTURE_2D, base.glTexture)
              gl.drawArrays(gl.TRIANGLE_FAN, 0, 4)
            }
          }
        }
      }
    }
    gl.clear(gl.DEPTH_BUFFER_BIT)
    gl.disable(gl.DEPTH_TEST)
  }
}