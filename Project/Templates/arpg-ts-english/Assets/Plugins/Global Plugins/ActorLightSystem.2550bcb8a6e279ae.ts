/*
@plugin #plugin
@version 1.1
@author
@link
@desc #desc

@color lightColor
@alias #lightColor
@default ffffffff

@attribute-key lightColorAttr
@alias #lightColorAttr
@desc #lightColorAttr-desc
@filter actor

@attribute-key lightRadiusAttr
@alias #lightRadiusAttr
@desc #lightRadiusAttr-desc
@filter actor

@number intensity
@alias #intensity
@desc #intensity-desc
@clamp 0 1
@decimals 4

@lang en
#plugin Actor Light System
#desc
Render a point light when the actor has the "Light Radius" attribute and is visible on the screen.
The rendering area of the light source can be adjusted by modifying Project Settings -> Animation Rendering Area.
#lightColor Default Light Color
#lightColorAttr Light Color
#lightColorAttr-desc String: Insert <color:ffffff> tag via context menu
#lightRadiusAttr Light Radius
#lightRadiusAttr-desc Number: Equal to the number of scene grids
#intensity Intensity
#intensity-desc Affects the attenuation of light

@lang ru
#plugin Система освещения актера
#desc
Когда персонаж имеет атрибут "радиус освещения" и виден на экране，
Визуализируйте точечный источник света в месте расположения персонажа.
Вы можете настроить область рендеринга источника света, изменив настройки проекта->область рендеринга анимации.
#lightColor По умолчанию
#lightColorAttr Цвет освещения
#lightColorAttr-desc Тип строки: вставьте цветовую метку <color:ffffff> через контекстное меню
#lightRadiusAttr Радиус освещения
#lightRadiusAttr-desc Тип значения: равно количеству сеток сцены
#intensity Интенсивность
#intensity-desc Влияет на затухание света

@lang zh
#plugin 角色照明系统
#desc
当角色拥有"照明半径"属性，并且在屏幕中可见时，
在角色的位置渲染一个点光源。
可以通过修改项目设置->动画渲染区域，来调整光源的渲染区域。
#lightColor 默认照明颜色
#lightColorAttr 照明颜色
#lightColorAttr-desc 字符串类型：通过右键菜单插入<color:ffffff>颜色标签
#lightRadiusAttr 照明半径
#lightRadiusAttr-desc 数值类型：等于场景网格的数量
#intensity 强度
#intensity-desc 影响光线的衰减
*/

export default class ActorLightSystem implements Script<Plugin> {
  // 接口属性
  lightColor!: string
  lightColorAttr!: string
  lightRadiusAttr!: string
  intensity!: number

  // 脚本属性
  lightColorArray!: Float64Array
  colorMap: HashMap<Float64Array> = {}

  onStart(): void {
    // 设置点光源参数：[红, 绿, 蓝, 强度]
    const lightColor = Color.parseFloatArray(this.lightColor)
    lightColor[0] *= lightColor[3]
    lightColor[1] *= lightColor[3]
    lightColor[2] *= lightColor[3]
    lightColor[3] = this.intensity
    this.lightColorArray = lightColor

    Scene.on('load', scene => {
      const index = scene.renderers.indexOf(scene.light)
      if (index !== -1) {
        scene.renderers.splice(index + 1, 0, this)
      }
    })
  }

  /** 渲染点光源 */
  render(): void {
    const gl = GL
    const scene = Scene.binding!
    const vertices = gl.arrays[0].float32
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
    const colorMap = this.colorMap
    const radiusKey = this.lightRadiusAttr
    const colorKey = this.lightColorAttr
    const defLightColor = this.lightColorArray
    const actors = Scene.visibleActors
    const count = actors.count
    for (let i = 0; i < count; i++) {
      const actor = actors[i]!
      const radius = actor.attributes[radiusKey]
      if (typeof radius !== 'number') continue
      const {x, y} = actor
      const px = x < ll ? ll : x > lr ? lr : x
      const py = y < lt ? lt : y > lb ? lb : y
      if ((px - x) ** 2 + ((py - y) * vs) ** 2 < radius ** 2) {
        let lightColor: Float64Array | undefined = defLightColor
        const colorTag = actor.attributes[colorKey]
        // 如果角色指定了自定义光源颜色
        if (typeof colorTag === 'string') {
          lightColor = colorMap[colorTag]
          // 初始化角色光源颜色
          if (lightColor === undefined) {
            try {
              lightColor = Color.parseFloatArrayTag(colorTag)
              lightColor[0] *= lightColor[3]
              lightColor[1] *= lightColor[3]
              lightColor[2] *= lightColor[3]
              lightColor[3] = defLightColor[3]
            } catch (error) {
              lightColor = defLightColor
            }
            colorMap[colorTag] = lightColor
          }
        }
        const [red, green, blue, intensity] = lightColor
        const dl = x - radius
        const dt = y - radius
        const dr = x + radius
        const db = y + radius
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
      }
    }

    // 绘制光源
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
      // 绑定光照纹理FBO
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
  }
}