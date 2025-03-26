/*
@plugin #plugin
@version 1.1
@author
@link
@desc #desc

@option state {'enabled', 'disabled'}
@alias #state {#state-enabled, #state-disabled}
@desc #state-desc

@option showObstacles {true, false}
@alias #showObstacles {#showObstacles-enabled, #showObstacles-disabled}
@desc #showObstacles-desc

@color obstacleColor
@alias #obstacleColor
@desc #obstacleColor-desc
@default ffff0040
@cond showObstacles {true}

@color waterColor
@alias #waterColor
@desc #waterColor-desc
@default 0000ff40
@cond showObstacles {true}

@color wallColor
@alias #wallColor
@desc #wallColor-desc
@default ff000040
@cond showObstacles {true}

@color movementPathColor
@alias #movementPathColor
@desc #movementPathColor-desc
@default 00ff00c0

@color followingPathColor
@alias #followingPathColor
@desc #followingPathColor-desc
@default ffff00c0

@lang en
#plugin Movement Path
#desc
Debugging tool for drawing movement paths

Script methods:
PluginManager.MovementPath.enable()
PluginManager.MovementPath.disable()
PluginManager.MovementPath.switch()
#state Initial State
#state-enabled Enabled
#state-disabled Disabled
#state-desc This plugin can be switched later by script
#showObstacles Show Obstacles
#showObstacles-enabled Enabled
#showObstacles-disabled Disabled
#showObstacles-desc Renders terrains and actor obstacles
#obstacleColor Actor Obstacle Color
#obstacleColor-desc The color of actor obstacles
#waterColor Water Terrain Color
#waterColor-desc The color of water terrains
#wallColor Wall Terrain Color
#wallColor-desc The color of wall terrains
#movementPathColor Movement Path Color
#movementPathColor-desc The color of movement path arrows
#followingPathColor Following Path Color
#followingPathColor-desc The color of following path arrows

@lang ru
#plugin Траектория движения
#desc
Инструмент отладки для отрисовки траектории перемещения персонажа

Скриптовый метод:
PluginManager.MovementPath.enable()
PluginManager.MovementPath.disable()
PluginManager.MovementPath.switch()
#state Состояние
#state-enabled Включить
#state-disabled Выключить
#state-desc Плагины можно переключать с помощью скриптовых методов
#showObstacles Показ. препятствия
#showObstacles-enabled Включить
#showObstacles-disabled Выключить
#showObstacles-desc Рендеринг ландшафта и областей препятствий персонажа
#obstacleColor Цвет препятствий
#obstacleColor-desc Цвет актерских препятствий
#waterColor Поверхность воды
#waterColor-desc Цвет, используемый для окраски поверхности воды.
#wallColor Рельеф стены
#wallColor-desc Цвет области стенового блока
#movementPathColor Траект. движения
#movementPathColor-desc Траектория движения Цвет, которым будут рисоваться стрелки пути движения
#followingPathColor Стрелки
#followingPathColor-desc Цвет стрелок,которым будут рисоваться стрелки, следующие по пути.

@lang zh
#plugin 移动路径
#desc
用于绘制角色移动路径的调试工具

脚本方法:
PluginManager.MovementPath.enable()
PluginManager.MovementPath.disable()
PluginManager.MovementPath.switch()
#state 初始状态
#state-enabled 开启
#state-disabled 关闭
#state-desc 可以通过脚本方法开关插件
#showObstacles 显示障碍
#showObstacles-enabled 启用
#showObstacles-disabled 禁用
#showObstacles-desc 渲染地形和角色障碍区域
#obstacleColor 角色障碍颜色
#obstacleColor-desc 绘制角色占据的图块区域颜色
#waterColor 水面地形颜色
#waterColor-desc 绘制水面区域的颜色
#wallColor 墙块地形颜色
#wallColor-desc 绘制墙块区域的颜色
#movementPathColor 移动路径颜色
#movementPathColor-desc 绘制移动路径箭头的颜色
#followingPathColor 跟随路径颜色
#followingPathColor-desc 绘制跟随路径箭头的颜色
*/

export default class MovementPath implements Script<Plugin> {
  // 接口属性
  state!: 'enabled' | 'disabled'
  showObstacles!: boolean
  obstacleColor!: string
  waterColor!: string
  wallColor!: string
  movementPathColor!: string
  followingPathColor!: string

  // 脚本属性
  enabled: boolean = true
  texture!: Texture
  terrainColors!: {
    0: Float64Array
    1: Float64Array
    2: Float64Array
  }

  onStart(): void {
    // 设置初始状态
    switch (this.state) {
      case 'disabled':
        this.disable()
        break
    }

    // 侦听事件
    Scene.on('load', scene => {
      scene.renderers.push(this)
    })

    // 生成CSS颜色
    const [mr, mg, mb, ma] = Color.parseIntArray(this.movementPathColor)
    const [fr, fg, fb, fa] = Color.parseIntArray(this.followingPathColor)
    const styles = [
      `rgba(${mr}, ${mg}, ${mb}, ${ma / 255})`,
      `rgba(${fr}, ${fg}, ${fb}, ${fa / 255})`,
    ]

    // 创建路径箭头纹理
    const canvas = document.createElement('canvas')
    canvas.width = 40
    canvas.height = 64
    const context = canvas.getContext('2d')!
    for (let i = 0; i < 2; i++) {
      const y = i * 32
      context.beginPath()
      context.moveTo(6, y + 4)
      context.lineTo(34, y + 16)
      context.lineTo(6, y + 28)
      context.closePath()
      context.fillStyle = styles[i]
      context.fill()
    }
    this.texture = new Texture({
      magFilter: GL.LINEAR,
      minFilter: GL.LINEAR,
    })
    this.texture.loadImage(canvas)

    // 如果未启用障碍渲染，禁用
    if (!this.showObstacles) {
      this.renderTerrainsAndObstacles = Function.empty
    }

    // 生成地形颜色
    this.terrainColors = {
      0: Color.parseFloatArray(this.obstacleColor),
      1: Color.parseFloatArray(this.waterColor),
      2: Color.parseFloatArray(this.wallColor),
    }
  }

  /** 启用 */
  enable(): void {
    if (!this.enabled) {
      this.enabled = true
      // @ts-ignore
      delete this.render
    }
  }

  /** 禁用 */
  disable(): void {
    if (this.enabled) {
      this.enabled = false
      this.render = Function.empty
    }
  }

  /** 开关 */
  switch(): void {
    switch (this.enabled) {
      case false: return this.enable()
      case true: return this.disable()
    }
  }

  /** 渲染 */
  render(): void {
    this.renderTerrainsAndObstacles()
    const WIDTH = 10
    const OFFSET = 4
    const gl = GL
    const vertices = gl.arrays[0].float32
    const coords = gl.arrays[1].float64
    const arrowOffset = -Time.timestamp % 1000 / 2000 * WIDTH
    const {dist} = Math
    let vi = 0

    // 计算可见角色的移动路线
    const convert = Scene.convert
    const convert2f = Scene.convert2f
    const actors = Scene.visibleActors
    const count = actors.count
    for (let i = 0; i < count; i++) {
      const actor = actors[i]!
      const {navigator} = actor
      if (navigator.movementPath) {
        // 计算线段顶点坐标
        const path = navigator.movementPath
        let distance = 0
        let ci = 0
        const {x, y} = convert(actor)
        coords[ci    ] = x
        coords[ci + 1] = y
        coords[ci + 2] = 0
        coords[ci + 3] = 0
        ci += 4
        const start = path.index
        const length = path.length
        for (let i = start; i < length; i += 2) {
          const {x, y} = convert2f(path[i], path[i + 1])
          const scale = dist(coords[ci - 4], coords[ci - 3], x, y)
          distance += scale
          coords[ci    ] = x
          coords[ci + 1] = y
          coords[ci + 2] = scale
          coords[ci + 3] = distance
          ci += 4
        }
        // 设置三角带中继点
        for (let i = 4; i < ci; i += 4) {
          const x1 = coords[i - 4]
          const y1 = coords[i - 3]
          const x2 = coords[i    ]
          const y2 = coords[i + 1]
          const scale = coords[i + 2]
          const ox = (y1 - y2) / scale * OFFSET
          const oy = (x2 - x1) / scale * OFFSET
          const uvx1 = (coords[i - 1] - distance) / WIDTH + arrowOffset
          const uvx2 = (coords[i + 3] - distance) / WIDTH + arrowOffset
          vertices[vi    ] = x1 - ox
          vertices[vi + 1] = y1 - oy
          vertices[vi + 2] = uvx1
          vertices[vi + 3] = 0
          vertices[vi + 4] = x1 + ox
          vertices[vi + 5] = y1 + oy
          vertices[vi + 6] = uvx1
          vertices[vi + 7] = 0.5
          vertices[vi + 8] = x2 + ox
          vertices[vi + 9] = y2 + oy
          vertices[vi + 10] = uvx2
          vertices[vi + 11] = 0.5
          vertices[vi + 12] = x2 - ox
          vertices[vi + 13] = y2 - oy
          vertices[vi + 14] = uvx2
          vertices[vi + 15] = 0
          vi += 16
        }
        continue
      }
      if (navigator.target) {
        const {target} = navigator
        const {x: x1, y: y1} = convert(actor)
        const {x: x2, y: y2} = convert(target)
        const distance = dist(x1, y1, x2, y2)
        const scale = distance
        const ox = (y1 - y2) / scale * OFFSET
        const oy = (x2 - x1) / scale * OFFSET
        const uvx1 = arrowOffset - distance / WIDTH
        const uvx2 = arrowOffset
        vertices[vi    ] = x1 - ox
        vertices[vi + 1] = y1 - oy
        vertices[vi + 2] = uvx1
        vertices[vi + 3] = 0.5
        vertices[vi + 4] = x1 + ox
        vertices[vi + 5] = y1 + oy
        vertices[vi + 6] = uvx1
        vertices[vi + 7] = 1
        vertices[vi + 8] = x2 + ox
        vertices[vi + 9] = y2 + oy
        vertices[vi + 10] = uvx2
        vertices[vi + 11] = 1
        vertices[vi + 12] = x2 - ox
        vertices[vi + 13] = y2 - oy
        vertices[vi + 14] = uvx2
        vertices[vi + 15] = 0.5
        vi += 16
        continue
      }
    }

    // 绘制图像
    if (vi !== 0) {
      gl.blend = 'additive'
      const program = gl.imageProgram.use()
      gl.matrix.project(
        gl.flip,
        Camera.width,
        Camera.height,
      ).translate(-Camera.scrollLeft, -Camera.scrollTop)
      gl.bindVertexArray(program.vao.a110)
      gl.vertexAttrib1f(program.a_Opacity, 1)
      gl.uniformMatrix3fv(program.u_Matrix, false, gl.matrix)
      gl.uniform1i(program.u_LightMode, 0)
      gl.uniform1i(program.u_ColorMode, 0)
      gl.uniform4f(program.u_Tint, 0, 0, 0, 0)
      gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STREAM_DRAW, 0, vi)
      gl.bindTexture(gl.TEXTURE_2D, this.texture.base.glTexture)
      gl.drawElements(gl.TRIANGLES, vi / 16 * 6, gl.UNSIGNED_INT, 0)
    }
  }

  /** 渲染地形和障碍 */
  renderTerrainsAndObstacles(): void {
    const scene = Scene.binding
    if (scene === null) return
    const gl = GL
    const verticesMap = {
      0: gl.arrays[0].float32,
      1: gl.arrays[1].float32,
      2: gl.arrays[2].float32,
    }
    const viMap = {
      0: 0,
      1: 0,
      2: 0,
    }
    const terrains = scene.terrain.compositeArray
    const obstacles = scene.obstacle.array
    const width = scene.width
    const height = scene.height
    const tw = scene.tileWidth
    const th = scene.tileHeight
    const sl = Camera.tileLeft
    const st = Camera.tileTop
    const sr = Camera.tileRight
    const sb = Camera.tileBottom
    const bx = Math.max(Math.floor(sl / tw), 0)
    const by = Math.max(Math.floor(st / th), 0)
    const ex = Math.min(Math.ceil(sr / tw), width)
    const ey = Math.min(Math.ceil(sb / th), height)
    for (let y = by; y < ey; y++) {
      for (let x = bx; x < ex; x++) {
        const i = x + y * width
        const terrain = terrains[i]
        switch (terrain) {
          default:
          case 0: {
            const obstacle = obstacles[i]
            if (obstacle === 0) continue
            const vertices = verticesMap[0]
            const vi = viMap[0]
            vertices[vi    ] = x
            vertices[vi + 1] = y
            vertices[vi + 2] = x
            vertices[vi + 3] = y + 1
            vertices[vi + 4] = x + 1
            vertices[vi + 5] = y + 1
            vertices[vi + 6] = x + 1
            vertices[vi + 7] = y
            viMap[0] += 8
            continue
          }
          case 1:
          case 2: {
            const vertices = verticesMap[terrain]
            const vi = viMap[terrain]
            vertices[vi    ] = x
            vertices[vi + 1] = y
            vertices[vi + 2] = x
            vertices[vi + 3] = y + 1
            vertices[vi + 4] = x + 1
            vertices[vi + 5] = y + 1
            vertices[vi + 6] = x + 1
            vertices[vi + 7] = y
            viMap[terrain] += 8
            continue
          }
        }
      }
    }
    // 绘制墙块地形
    if (viMap[0] + viMap[1] + viMap[2] !== 0) {
      gl.blend = 'normal'
      const program = gl.graphicProgram.use()
      gl.matrix.project(
        gl.flip,
        Camera.width,
        Camera.height,
      )
      .translate(-Camera.scrollLeft, -Camera.scrollTop)
      .scale(tw, th)
      gl.bindVertexArray(program.vao.a10)
      gl.uniformMatrix3fv(program.u_Matrix, false, gl.matrix)
      for (let i = 0; i <= 2; i++) {
        const index = i as 0 | 1 | 2
        const vi = viMap[index]
        if (vi === 0) continue
        gl.bufferData(gl.ARRAY_BUFFER, verticesMap[index], gl.STREAM_DRAW, 0, vi)
        gl.vertexAttrib4fv(program.a_Color, this.terrainColors[index])
        gl.drawElements(gl.TRIANGLES, vi / 8 * 6, gl.UNSIGNED_INT, 0)
      }
    }
  }
}