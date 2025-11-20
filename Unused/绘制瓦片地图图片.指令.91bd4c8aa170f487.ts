/*
@plugin 绘制瓦片地图图片
@version 1.0
@author
@link
@desc
输入 [瓦片地图对象列表]
输出 [BASE64图像字符串]
使用 [加载图像] 指令加载到图像元素

@variable-getter tilemapList
@alias 输入瓦片地图列表

@variable-setter outputImage
@alias 输出图像BASE64

@variable-number imageWidth
@alias 图像宽度
@clamp 64 3840
@decimals 0
@default 640

@variable-number imageHeight
@alias 图像高度
@clamp 64 3840
@decimals 0
@default 640
*/

/** 自定义指令脚本 */
export default class DrawTilemapsToImage implements Script<Command> {
  tilemapList!: SceneTilemap[]
  outputImage!: VariableSetter
  imageWidth!: number
  imageHeight!: number
  texture!: FBOTexture
  fbo!: WebGLFramebuffer

  public call(event: EventHandler): void {
    if (!Array.isArray(this.tilemapList)) {
      throw new Error('输入变量必须是瓦片地图对象列表')
    }
    for (const tilemap of this.tilemapList) {
      if (!(tilemap instanceof SceneTilemap)) {
        throw new Error('列表不能包含瓦片地图对象以外的内容')
      }
    }
    if (!this.texture) {
      this.texture = new Texture() as FBOTexture
      this.fbo = GL.createTextureFBO(this.texture)
    }
    const width = this.imageWidth
    const height = this.imageHeight
    this.texture.resize(width, height)
    for (const tilemap of this.tilemapList) {
      this.draw(tilemap)
    }
    const base64 = this.texture.toBase64(width, height)
    this.outputImage.set(base64)
  }

  /** 绘制场景瓦片地图 */
  public draw(tilemap: SceneTilemap): void {
    const gl = GL
    const vertices = gl.arrays[0].float32
    const push = gl.batchRenderer.push
    const response = gl.batchRenderer.response
    const scene = tilemap.scene
    const imageData = tilemap.imageData
    const tiles = tilemap.tiles
    const width = tilemap.width
    const height = tilemap.height
    const tw = scene.tileWidth
    const th = scene.tileHeight
    const ox = tilemap.offsetX - tilemap.anchorX * width * tw
    const oy = tilemap.offsetY - tilemap.anchorY * height * th
    const startX = tilemap.x * tw + ox
    const startY = tilemap.y * th + oy
    // 使用队列渲染器进行批量渲染
    gl.batchRenderer.setAttrSize(0)
    gl.batchRenderer.setBlendMode(tilemap.blend)
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const i = x + y * width
        const tile = tiles[i]
        const array = imageData[tile]
        if (!array) continue
        // 向渲染器添加纹理索引
        push(array[0])
        const fi = 7
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
        const vi = response[0] * 5
        const si = response[1]
        vertices[vi    ] = dl
        vertices[vi + 1] = dt
        vertices[vi + 2] = sl
        vertices[vi + 3] = st
        vertices[vi + 4] = si
        vertices[vi + 5] = dl
        vertices[vi + 6] = db
        vertices[vi + 7] = sl
        vertices[vi + 8] = sb
        vertices[vi + 9] = si
        vertices[vi + 10] = dr
        vertices[vi + 11] = db
        vertices[vi + 12] = sr
        vertices[vi + 13] = sb
        vertices[vi + 14] = si
        vertices[vi + 15] = dr
        vertices[vi + 16] = dt
        vertices[vi + 17] = sr
        vertices[vi + 18] = st
        vertices[vi + 19] = si
      }
    }
    // 如果顶点的尾部索引不为0(存在可绘制的图块)
    const endIndex = gl.batchRenderer.getEndIndex()
    if (endIndex !== 0) {
      gl.alpha = tilemap.opacity
      const totalWidth = scene.width * tw
      const totalHeight = scene.height * th
      const scaleX = this.imageWidth / totalWidth
      const scaleY = this.imageHeight / totalHeight
      const program = gl.tileProgram.use()
      const lightModeIndex = 0
      const matrix = Matrix.instance
      .project(
        1,
        gl.width,
        gl.height,
      )
      .scale(scaleX, scaleY)
      .translate(startX, startY)
      gl.bindFBO(this.fbo)
      gl.bindVertexArray(program.vao)
      gl.uniformMatrix3fv(program.u_Matrix, false, matrix)
      gl.uniform1i(program.u_LightMode, lightModeIndex)
      gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STREAM_DRAW, 0, endIndex * 5)
      gl.batchRenderer.draw()
      gl.unbindFBO()
      gl.reset()
    }
  }
}