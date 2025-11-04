/*
@plugin #plugin
@version 1.0
@author
@link
@desc #desc

@color lightColor
@alias #lightColor
@default ffffffff

@number lightRadius
@alias #lightRadius
@clamp 0 100
@default 1

@number intensity
@alias #intensity
@clamp 0 1
@decimals 4

@number direct
@alias #direct
@clamp 0 1
@decimals 4
@default 0.25

@number fadein
@alias #fadein
@clamp 0 10000

@number fadeout
@alias #fadeout
@clamp 0 10000

@lang en
#plugin Trigger - Point Light
#desc Render a point light at the location of the trigger
#lightColor Light Color
#lightRadius Light Radius
#intensity Intensity
#direct Direct Light Ratio
#fadein Fadein (ms)
#fadeout Fadeout (ms)

@lang ru
#plugin Триггер - Точечный свет
#desc Создает точечный источник света в месте расположения триггера.
#lightColor Цвет освещения
#lightRadius Радиус освещения
#intensity Интенсивность
#direct Коэф. освещения
#fadein Появление (ms)
#fadeout Затухание (ms)

@lang zh
#plugin 触发器 - 点光源
#desc 在触发器的位置渲染一个点光源
#lightColor 照明颜色
#lightRadius 照明半径
#intensity 强度
#direct 直射率
#fadein 渐入时间(ms)
#fadeout 渐出时间(ms)
*/

const POINT_LIGHT: unique symbol = Symbol('POINT_LIGHT')

declare global {
  interface Trigger {
    [POINT_LIGHT]: {
      color: Float64Array
      radius: number
      direct: number
      fadein: number
      fadeout: number
    }
  }
}

export default class Trigger_PointLight implements Script<Trigger> {
  // 接口属性
  lightColor!: string
  lightRadius!: number
  intensity!: number
  direct!: number
  fadein!: number
  fadeout!: number

  /** 安装渲染器 */
  setupRenderer(): void {
    if (Game.setFlag('Trigger_PointLight_Renderer_Installed')) {
      const setup = (scene: SceneContext) => {
        const index = scene.renderers.indexOf(scene.light)
        if (index !== -1) {
          scene.renderers.splice(index + 1, 0, this)
        }
      }
      // 安装渲染器到已经打开的场景中
      for (const scene of Scene.contexts) {
        if (scene instanceof SceneContext) {
          setup(scene)
        }
      }
      // 在加载场景时安装渲染器
      Scene.on('load', setup)
    }
  }

  onStart(trigger: Trigger): void {
    // 设置点光源参数：[红, 绿, 蓝, 强度]
    const lightColor = Color.parseFloatArray(this.lightColor)
    lightColor[0] *= lightColor[3]
    lightColor[1] *= lightColor[3]
    lightColor[2] *= lightColor[3]
    lightColor[3] = this.intensity
    trigger[POINT_LIGHT] = {
      color: lightColor,
      radius: this.lightRadius,
      direct: this.direct,
      fadein: this.fadein,
      fadeout: this.fadeout,
    }
    this.setupRenderer()
  }

  /** 渲染点光源 */
  render(): void {
    const gl = GL
    const scene = Scene.binding!
    const vertices = gl.arrays[0].float32
    const vertices2 = gl.arrays[3].float32
    const tw = scene.tileWidth
    const th = scene.tileHeight
    const sl = Camera.lightLeft
    const st = Camera.lightTop
    const sr = Camera.lightRight
    const sb = Camera.lightBottom
    const ll = sl / tw
    const lt = st / th
    const lr = sr / tw
    const lb = sb / th
    const vs = tw / th
    let vi = 0
    let vi2 = 0
    const triggers = Scene.visibleTriggers
    const count = triggers.count
    for (let i = 0; i < count; i++) {
      const trigger = triggers[i]!
      const light = trigger[POINT_LIGHT]
      if (light === undefined) continue
      const {x, y} = trigger
      const radius = light.radius
      const px = x < ll ? ll : x > lr ? lr : x
      const py = y < lt ? lt : y > lb ? lb : y
      if ((px - x) ** 2 + ((py - y) * vs) ** 2 < radius ** 2) {
        let [red, green, blue, intensity] = light.color
        // 计算渐入颜色
        if (light.fadein !== 0) {
          if (trigger.elapsed < light.fadein) {
            const opacity = trigger.elapsed / light.fadein
            red *= opacity
            green *= opacity
            blue *= opacity
          }
        }
        // 计算渐出颜色
        if (light.fadeout !== 0) {
          const fadeStart = trigger.duration - light.fadeout
          const elapsed = trigger.elapsed - fadeStart
          if (elapsed > 0) {
            const time = elapsed / light.fadeout
            const opacity = Math.max(1 - time, 0)
            red *= opacity
            green *= opacity
            blue *= opacity
          }
        }
        const oy = (trigger.animation?.offsetY ?? 0) / th
        const dl = x - radius
        const dt = y - radius + oy
        const dr = x + radius
        const db = y + radius + oy
        // 设置反射光绘制顶点
        vertices[vi    ] = dl
        vertices[vi + 1] = dt
        vertices[vi + 2] = 0
        vertices[vi + 3] = 0
        vertices[vi + 4] = red
        vertices[vi + 5] = green
        vertices[vi + 6] = blue
        vertices[vi + 7] = intensity
        vertices[vi + 8] = dl
        vertices[vi + 9] = db
        vertices[vi + 10] = 0
        vertices[vi + 11] = 1
        vertices[vi + 12] = red
        vertices[vi + 13] = green
        vertices[vi + 14] = blue
        vertices[vi + 15] = intensity
        vertices[vi + 16] = dr
        vertices[vi + 17] = db
        vertices[vi + 18] = 1
        vertices[vi + 19] = 1
        vertices[vi + 20] = red
        vertices[vi + 21] = green
        vertices[vi + 22] = blue
        vertices[vi + 23] = intensity
        vertices[vi + 24] = dr
        vertices[vi + 25] = dt
        vertices[vi + 26] = 1
        vertices[vi + 27] = 0
        vertices[vi + 28] = red
        vertices[vi + 29] = green
        vertices[vi + 30] = blue
        vertices[vi + 31] = intensity
        vi += 32
        const direct = light.direct
        if (direct === 0) {
          continue
        }
        red *= direct
        green *= direct
        blue *= direct
        // 设置直射光绘制顶点
        vertices2[vi2    ] = dl
        vertices2[vi2 + 1] = dt
        vertices2[vi2 + 2] = 0
        vertices2[vi2 + 3] = 0
        vertices2[vi2 + 4] = red
        vertices2[vi2 + 5] = green
        vertices2[vi2 + 6] = blue
        vertices2[vi2 + 7] = intensity
        vertices2[vi2 + 8] = dl
        vertices2[vi2 + 9] = db
        vertices2[vi2 + 10] = 0
        vertices2[vi2 + 11] = 1
        vertices2[vi2 + 12] = red
        vertices2[vi2 + 13] = green
        vertices2[vi2 + 14] = blue
        vertices2[vi2 + 15] = intensity
        vertices2[vi2 + 16] = dr
        vertices2[vi2 + 17] = db
        vertices2[vi2 + 18] = 1
        vertices2[vi2 + 19] = 1
        vertices2[vi2 + 20] = red
        vertices2[vi2 + 21] = green
        vertices2[vi2 + 22] = blue
        vertices2[vi2 + 23] = intensity
        vertices2[vi2 + 24] = dr
        vertices2[vi2 + 25] = dt
        vertices2[vi2 + 26] = 1
        vertices2[vi2 + 27] = 0
        vertices2[vi2 + 28] = red
        vertices2[vi2 + 29] = green
        vertices2[vi2 + 30] = blue
        vertices2[vi2 + 31] = intensity
        vi2 += 32
      }
    }

    if (vi === 0 && vi2 === 0) {
      return
    }

    // 绘制反射光源
    if (vi !== 0) {
      // 获取光照纹理裁剪区域
      const cx = gl.reflectedLightMap.clipX
      const cy = gl.reflectedLightMap.clipY
      const cw = gl.reflectedLightMap.clipWidth
      const ch = gl.reflectedLightMap.clipHeight
      const projMatrix = Matrix.instance.project(
        gl.flip,
        sr - sl,
        sb - st,
      )
      .translate(-sl, -st)
      .scale(tw, th)
      gl.blend = 'screen'
      const program = gl.lightProgram.use()
      // 绑定反射光纹理FBO
      gl.bindFBO(gl.reflectedLightMap.fbo)
      gl.setViewport(cx, cy, cw, ch)
      gl.bindVertexArray(program.vao)
      gl.uniformMatrix3fv(program.u_Matrix, false, projMatrix)
      gl.uniform1i(program.u_LightMode, 0)
      gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STREAM_DRAW, 0, vi)
      gl.drawElements(gl.TRIANGLES, vi / 32 * 6, gl.UNSIGNED_INT, 0)
      // 重置视口并解除FBO绑定
      gl.resetViewport()
      gl.unbindFBO()
    }

    // 绘制直射光源
    if (vi2 !== 0) {
      const sl = Camera.scrollLeft
      const st = Camera.scrollTop
      const sr = Camera.scrollRight
      const sb = Camera.scrollBottom
      const projMatrix = Matrix.instance.project(
        gl.flip,
        sr - sl,
        sb - st,
      )
      .translate(-sl, -st)
      .scale(tw, th)
      gl.blend = 'screen'
      const program = gl.lightProgram.use()
      // 绑定直射光纹理FBO
      gl.bindFBO(gl.directLightMap.fbo)
      gl.bindVertexArray(program.vao)
      gl.uniformMatrix3fv(program.u_Matrix, false, projMatrix)
      gl.uniform1i(program.u_LightMode, 0)
      gl.bufferData(gl.ARRAY_BUFFER, vertices2, gl.STREAM_DRAW, 0, vi2)
      gl.drawElements(gl.TRIANGLES, vi2 / 32 * 6, gl.UNSIGNED_INT, 0)
      // 解除FBO绑定
      gl.unbindFBO()
    }
  }
}