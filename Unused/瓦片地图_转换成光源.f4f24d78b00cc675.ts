/*
@plugin 瓦片地图 - 转换成光源
@version 1.0
@author
@link
@desc
禁用瓦片地图的默认渲染方法
改为渲染到照明层
可使用图块组合照明效果
如果图块设置了优先级
每1点优先级增加10%直射率
*/

interface WebGLTileLightProgram extends WebGLTileProgram {
  use(): WebGLTileLightProgram
}

const draw = () => {}

export default class Tilemap_PointLight implements Script<SceneTilemap> {
  tileLightProgram!: WebGLTileLightProgram

  // 接口属性
  lightColor!: string
  direct!: number

  /** 安装渲染器 */
  setupRenderer(): void {
    if (Game.setFlag('Tilemap_Light_Renderer_Installed')) {
      const setup = (scene: SceneContext) => {
        const index = scene.renderers.indexOf(scene.light)
        if (index !== -1) {
          scene.renderers.splice(index + 1, 0, this)
        }
      }
      // 创建图块直射光渲染程序
      this.tileLightProgram = this.createProgram()
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

  onStart(tilemap: SceneTilemap): void {
    if (!(tilemap instanceof SceneTilemap))
    {
      throw new Error('宿主对象必须是瓦片地图')
    }
    // 禁用瓦片地图绘制方法
    tilemap.draw = draw
    this.setupRenderer()
  }

  /** 创建图块直射光渲染程序 */
  private createProgram(): WebGLTileLightProgram {
    const program = GL.createProgramWithShaders(
      `
      attribute   vec2        a_Position;
      attribute   vec2        a_TexCoord;
      attribute   float       a_TexIndex;
      attribute   float       a_Opacity;
      uniform     mat3        u_Matrix;
      varying     float       v_TexIndex;
      varying     vec2        v_TexCoord;
      varying     float       v_Opacity;

      void main() {
        gl_Position.xyw = u_Matrix * vec3(a_Position, 1.0);
        v_TexCoord = a_TexCoord;
        v_TexIndex = a_TexIndex;
        v_Opacity = a_Opacity;
      }
      `,
      `
      precision   highp       float;
      varying     float       v_TexIndex;
      varying     vec2        v_TexCoord;
      varying     float       v_Opacity;
      uniform     float       u_Alpha;
      uniform     sampler2D   u_Samplers[15];

      // 采样纹理像素颜色(采样器索引，坐标)
      // 采样器数组的索引必须使用常量
      vec4 sampler(int index, vec2 uv) {
        for (int i = 0; i < 15; i++) {
          if (i == index) {
            return texture2D(u_Samplers[i], uv);
          }
        }
      }

      void main() {
        gl_FragColor = sampler(int(v_TexIndex), v_TexCoord);
        if (gl_FragColor.a == 0.0) discard;
        gl_FragColor.rgb *= v_Opacity * u_Alpha;
      }
      `,
    ) as WebGLTileLightProgram
    GL.useProgram(program)

    // 顶点着色器属性
    const a_Position = GL.getAttribLocation(program, 'a_Position')
    const a_TexCoord = GL.getAttribLocation(program, 'a_TexCoord')
    const a_TexIndex = GL.getAttribLocation(program, 'a_TexIndex')
    const a_Opacity = GL.getAttribLocation(program, 'a_Opacity')
    const u_Matrix = GL.getUniformLocation(program, 'u_Matrix')!

    // 片元着色器属性
    const u_Alpha = GL.getUniformLocation(program, 'u_Alpha')!
    const u_SamplerLength = GL.maxTexUnits - 1
    const u_Samplers = []
    for (let i = 0; i < u_SamplerLength; i++) {
      u_Samplers.push(GL.getUniformLocation(program, `u_Samplers[${i}]`)!)
    }

    // 创建顶点数组对象
    const vao = GL.createVertexArray()!
    GL.bindVertexArray(vao)
    GL.enableVertexAttribArray(a_Position)
    GL.enableVertexAttribArray(a_TexCoord)
    GL.enableVertexAttribArray(a_TexIndex)
    GL.enableVertexAttribArray(a_Opacity)
    GL.bindBuffer(GL.ARRAY_BUFFER, GL.vertexBuffer)
    GL.vertexAttribPointer(a_Position, 2, GL.FLOAT, false, 24, 0)
    GL.vertexAttribPointer(a_TexCoord, 2, GL.FLOAT, false, 24, 8)
    GL.vertexAttribPointer(a_TexIndex, 1, GL.FLOAT, false, 24, 16)
    GL.vertexAttribPointer(a_Opacity, 1, GL.FLOAT, false, 24, 20)
    GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, GL.elementBuffer)

    // 使用程序对象
    const use = () => {
      if (GL.program !== program) {
        GL.program = program
        GL.useProgram(program)
      }
      if (program.alpha !== GL.alpha) {
        program.alpha = GL.alpha
        GL.uniform1f(u_Alpha, program.alpha)
      }
      return program
    }

    // 保存程序对象
    program.use = use
    program.vao = vao
    program.flip = 0
    program.alpha = 0
    program.samplerNum = 1
    program.a_Position = a_Position
    program.a_TexCoord = a_TexCoord
    program.a_TexIndex = a_TexIndex
    program.u_Matrix = u_Matrix
    program.u_Samplers = u_Samplers
    return program
  }

  /** 渲染瓦片地图到照明层 */
  public render(): void {
    this.unbindReflectedLightMap()
    for (const parallax of Scene.parallax.tilemaps) {
      const tilemap = parallax as SceneTilemap
      if (tilemap.draw === draw) {
        this.drawReflectedLight(tilemap)
        this.drawDirectLight(tilemap)
      }
    }
    this.bindReflectedLightMap()
  }

  /** 绑定反射光纹理 */
  private bindReflectedLightMap(): void {
    GL.activeTexture(GL.TEXTURE0 + GL.maxTexUnits - 1)
    GL.bindTexture(GL.TEXTURE_2D, GL.reflectedLightMap.base.glTexture)
    GL.activeTexture(GL.TEXTURE0)
  }

  /** 解绑反射光纹理 */
  private unbindReflectedLightMap(): void {
    GL.activeTexture(GL.TEXTURE0 + GL.maxTexUnits - 1)
    GL.bindTexture(GL.TEXTURE_2D, GL.tempTexture.base.glTexture)
    GL.activeTexture(GL.TEXTURE0)
  }

  /** 绘制瓦片地图反射光 */
  private drawReflectedLight(tilemap: SceneTilemap): void {
    const gl = GL
    const vertices = gl.arrays[0].float32
    const push = gl.batchRenderer.push
    const response = gl.batchRenderer.response
    const scene = tilemap.scene
    const imageData = tilemap.imageData
    const tiles = tilemap.tiles
    const width = tilemap.width
    const height = tilemap.height
    const frame = scene.animFrame
    const tw = scene.tileWidth
    const th = scene.tileHeight
    const anchor = Scene.getParallaxAnchor(tilemap)
    const pw = width * tw
    const ph = height * th
    const ax = tilemap.anchorX * pw
    const ay = tilemap.anchorY * ph
    const ox = anchor.x - ax + tilemap.offsetX
    const oy = anchor.y - ay + tilemap.offsetY
    const sl = Camera.lightLeft - ox
    const st = Camera.lightTop - oy
    const sr = Camera.lightRight - ox
    const sb = Camera.lightBottom - oy
    const bx = Math.max(Math.floor(sl / tw), 0)
    const by = Math.max(Math.floor(st / th), 0)
    const ex = Math.min(Math.ceil(sr / tw), width)
    const ey = Math.min(Math.ceil(sb / th), height)
    // 使用队列渲染器进行批量渲染
    gl.batchRenderer.setAttrSize(0)
    gl.batchRenderer.setBlendMode('screen')
    for (let y = by; y < ey; y++) {
      for (let x = bx; x < ex; x++) {
        const i = x + y * width
        const tile = tiles[i]
        const array = imageData[tile]
        if (!array) continue
        // 向渲染器添加纹理索引
        push(array[0])
        const fi = frame % array[2] * 4 + 7
        const ox = x * tw
        const oy = y * th
        const dl = array[3] + ox
        const dt = array[4] + oy
        const dr = array[5] + ox
        const db = array[6] + oy
        const sl = array[fi]
        const st = array[fi + 1]
        const sr = array[fi + 2]
        const sb = array[fi + 3]
        // 从渲染器中获取顶点索引和采样器索引
        const vi = response[0] * 6
        const si = response[1]
        vertices[vi    ] = dl
        vertices[vi + 1] = dt
        vertices[vi + 2] = sl
        vertices[vi + 3] = st
        vertices[vi + 4] = si
        vertices[vi + 5] = 1
        vertices[vi + 6] = dl
        vertices[vi + 7] = db
        vertices[vi + 8] = sl
        vertices[vi + 9] = sb
        vertices[vi + 10] = si
        vertices[vi + 11] = 1
        vertices[vi + 12] = dr
        vertices[vi + 13] = db
        vertices[vi + 14] = sr
        vertices[vi + 15] = sb
        vertices[vi + 16] = si
        vertices[vi + 17] = 1
        vertices[vi + 18] = dr
        vertices[vi + 19] = dt
        vertices[vi + 20] = sr
        vertices[vi + 21] = st
        vertices[vi + 22] = si
        vertices[vi + 23] = 1
      }
    }
    // 如果顶点的尾部索引不为0(存在可绘制的图块)
    const endIndex = gl.batchRenderer.getEndIndex()
    if (endIndex !== 0) {
      gl.alpha = tilemap.opacity
      const sl = Camera.lightLeft
      const st = Camera.lightTop
      const sr = Camera.lightRight
      const sb = Camera.lightBottom
      const cx = gl.reflectedLightMap.clipX
      const cy = gl.reflectedLightMap.clipY
      const cw = gl.reflectedLightMap.clipWidth
      const ch = gl.reflectedLightMap.clipHeight
      const program = this.tileLightProgram.use()
      const matrix = Matrix.instance.project(
        gl.flip,
        sr - sl,
        sb - st,
      ).translate(ox - sl, oy - st)
      gl.bindFBO(gl.reflectedLightMap.fbo)
      gl.setViewport(cx, cy, cw, ch)
      gl.bindVertexArray(program.vao)
      gl.uniformMatrix3fv(program.u_Matrix, false, matrix)
      gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STREAM_DRAW, 0, endIndex * 6)
      gl.batchRenderer.draw()
      gl.resetViewport()
      gl.unbindFBO()
    }
  }

  /** 绘制瓦片地图直射光 */
  private drawDirectLight(tilemap: SceneTilemap): void {
    const gl = GL
    const vertices = gl.arrays[0].float32
    const push = gl.batchRenderer.push
    const response = gl.batchRenderer.response
    const scene = tilemap.scene
    const imageData = tilemap.imageData
    const tiles = tilemap.tiles
    const width = tilemap.width
    const height = tilemap.height
    const frame = scene.animFrame
    const tw = scene.tileWidth
    const th = scene.tileHeight
    const anchor = Scene.getParallaxAnchor(tilemap)
    const pw = width * tw
    const ph = height * th
    const ax = tilemap.anchorX * pw
    const ay = tilemap.anchorY * ph
    const ox = anchor.x - ax + tilemap.offsetX
    const oy = anchor.y - ay + tilemap.offsetY
    const sl = Camera.tileLeft - ox
    const st = Camera.tileTop - oy
    const sr = Camera.tileRight - ox
    const sb = Camera.tileBottom - oy
    const bx = Math.max(Math.floor(sl / tw), 0)
    const by = Math.max(Math.floor(st / th), 0)
    const ex = Math.min(Math.ceil(sr / tw), width)
    const ey = Math.min(Math.ceil(sb / th), height)
    // 使用队列渲染器进行批量渲染
    gl.batchRenderer.setAttrSize(0)
    gl.batchRenderer.setBlendMode('screen')
    for (let y = by; y < ey; y++) {
      for (let x = bx; x < ex; x++) {
        const i = x + y * width
        const tile = tiles[i]
        const array = imageData[tile]
        if (!array || array[1] <= 0) continue
        // 向渲染器添加纹理索引
        push(array[0])
        const fi = frame % array[2] * 4 + 7
        const ox = x * tw
        const oy = y * th
        const dl = array[3] + ox
        const dt = array[4] + oy
        const dr = array[5] + ox
        const db = array[6] + oy
        const sl = array[fi]
        const st = array[fi + 1]
        const sr = array[fi + 2]
        const sb = array[fi + 3]
        // 从渲染器中获取顶点索引和采样器索引
        const vi = response[0] * 6
        const si = response[1]
        const opacity = Math.min(array[1] / 10, 1)
        vertices[vi    ] = dl
        vertices[vi + 1] = dt
        vertices[vi + 2] = sl
        vertices[vi + 3] = st
        vertices[vi + 4] = si
        vertices[vi + 5] = opacity
        vertices[vi + 6] = dl
        vertices[vi + 7] = db
        vertices[vi + 8] = sl
        vertices[vi + 9] = sb
        vertices[vi + 10] = si
        vertices[vi + 11] = opacity
        vertices[vi + 12] = dr
        vertices[vi + 13] = db
        vertices[vi + 14] = sr
        vertices[vi + 15] = sb
        vertices[vi + 16] = si
        vertices[vi + 17] = opacity
        vertices[vi + 18] = dr
        vertices[vi + 19] = dt
        vertices[vi + 20] = sr
        vertices[vi + 21] = st
        vertices[vi + 22] = si
        vertices[vi + 23] = opacity
      }
    }
    // 如果顶点的尾部索引不为0(存在可绘制的图块)
    const endIndex = gl.batchRenderer.getEndIndex()
    if (endIndex !== 0) {
      gl.alpha = tilemap.opacity
      const sl = Camera.scrollLeft
      const st = Camera.scrollTop
      const program = this.tileLightProgram.use()
      const matrix = Matrix.instance.project(
        gl.flip,
        Camera.width,
        Camera.height,
      ).translate(ox - sl, oy - st)
      gl.bindFBO(gl.directLightMap.fbo)
      gl.bindVertexArray(program.vao)
      gl.uniformMatrix3fv(program.u_Matrix, false, matrix)
      gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STREAM_DRAW, 0, endIndex * 6)
      gl.batchRenderer.draw()
      gl.unbindFBO()
    }
  }
}