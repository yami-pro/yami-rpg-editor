"use strict"

import {
  BaseTexture,
  BatchRenderer,
  Data,
  File,
  Matrix,
  Texture,
  TextureManager,
  ImageTexture,
  FSP,
  Path
} from "../yami"

// ******************************** 声明 ********************************

type rgbColor = {red: number, green: number, blue: number}

interface GL_ext {
  contrast: number
  ambient: rgbColor
  flip: number
  alpha: number
  blend: string
  matrix: Matrix
  width: number
  height: number
  program: WebGLProgram | null
  binding: WebGLFramebuffer | null
  masking: boolean
  depthTest: boolean
  maxTexUnits: number
  lightmap: Texture
  stencilTexture: Texture
  maskTexture: Texture
  textureManager: TextureManager
  layers: Uint32Array
  zeros: Uint32Array
  arrays: { [index: number]: any }
  batchRenderer: BatchRenderer
  updateBlending: () => void
  frameBuffer: WebGLFramebuffer | null
  vertexBuffer: WebGLBuffer | null
  elementBuffer: WebGLBuffer | null
  context2d: CanvasRenderingContext2D | null
  imageProgram: WebGLProgram | null
  tileProgram: WebGLProgram | null
  textProgram: WebGLProgram | null
  spriteProgram: WebGLProgram | null
  particleProgram: WebGLProgram | null
  lightProgram: WebGLProgram | null
  graphicProgram: WebGLProgram | null
  dashedLineProgram: WebGLProgram | null

  restore(): void
  initialize(): void
  loadFileText(fileName: string): Promise<string>
  createProgramWithShaders(vsFileName: string, fsFileName: string): Promise<WebGLProgram | null>
  loadShader(type: number, source: string): WebGLShader | null
  createImageProgram(): Promise<WebGLProgram | null>
  createTileProgram(): Promise<WebGLProgram | null>
  createTextProgram(): Promise<WebGLProgram | null>
  createSpriteProgram(): Promise<WebGLProgram | null>
  createParticleProgram(): Promise<WebGLProgram | null>
  createLightProgram(): Promise<WebGLProgram | null>
  createGraphicProgram(): Promise<WebGLProgram | null>
  createDashedLineProgram(): Promise<WebGLProgram | null>
  reset(): void
  updateMasking(): void
  createBlendingUpdater(): () => void
  setContrast(contrast: number): void
  setAmbientLight(rgb: rgbColor): void
  resizeLightmap(): void
  updateLightTexSize(): void
  updateSamplerNum(samplerNum: number): void
  bindFBO(fbo: WebGLFramebuffer): void
  unbindFBO(): void
  setViewport(x: number, y: number, width: number, height: number): void
  resetViewport(): void
  resize(width: number, height: number): void
  drawImage: (texture: ImageTexture, dx: number, dy: number, dw: number, dh: number, tint: Uint8Array) => void
  drawSliceImage(texture: ImageTexture, dx: number, dy: number, dw: number, dh: number, clip: Uint32Array, border: number, tint: Uint8Array): void
  drawText(texture: Texture, dx: number, dy: number, dw: number, dh: number, color: number): void
  fillRect(dx: number, dy: number, dw: number, dh: number, color: number): void
  createContext2D(): CanvasRenderingContext2D | null
  fillTextWithOutline: (text: string, x: number, y: number, color: number, shadow: number) => void
  createNormalTexture(options: {magFilter?: number, minFilter?: number, format?: number}): BaseTexture | null
  createImageTexture(image: HTMLImageElement, options: {magFilter?: number, minFilter?: number}): ImageTexture | null
  createTextureFBO(texture: Texture): WebGLFramebuffer | null

  WEBGL_lose_context: WEBGL_lose_context
  BACKGROUND_RED: number
  BACKGROUND_GREEN: number
  BACKGROUND_BLUE: number
}

interface WebGLRenderingContext_ext {
  createVertexArray(): WebGLVertexArrayObjectOES
  deleteVertexArray(arrayObject: WebGLVertexArrayObjectOES | null): void
  isVertexArray(arrayObject: WebGLVertexArrayObjectOES | null): boolean
  bindVertexArray(arrayObject: WebGLVertexArrayObjectOES | null): void
  MIN: number
  MAX: number
}

interface CanvasRenderingContext2D_ext {
  size: number
  paddingItalic: number

  resize(width: number, height: number): void
  drawAndFitImage(image: HTMLCanvasElement, sx: number, sy: number, sw: number, sh: number): void
}

interface WebGLProgram_ext {
  use(): WebGLProgram
  alpha: number
  a_Position: number
  a_Color: number
  u_Matrix: WebGLUniformLocation | null
  flip: number | null
  vao: WebGLVertexArrayObject | null
  masking: boolean

  a_TexCoord: number
  u_Ambient: WebGLUniformLocation | null
  u_Contrast: WebGLUniformLocation | null
  u_LightMode: WebGLUniformLocation | null
  u_LightCoord: WebGLUniformLocation | null
  u_LightTexSize: WebGLUniformLocation | null
  u_Viewport: WebGLUniformLocation | null
  u_Masking: WebGLUniformLocation | null
  u_MaskSampler: WebGLUniformLocation | null
  u_ColorMode: WebGLUniformLocation | null
  u_Color: WebGLUniformLocation | null
  u_Tint: WebGLUniformLocation | null
  u_Repeat: WebGLUniformLocation | null

  samplerNum: number
  a_TexIndex: number
  u_TintMode: WebGLUniformLocation | null
  u_Samplers: WebGLUniformLocation[]
  
  a_TextColor: number
  u_Threshold: WebGLUniformLocation | null

  a_TexParam: number
  a_Tint: number
  a_LightCoord: number

  u_Mode: WebGLUniformLocation | null

  u_LightColor: WebGLUniformLocation | null

  a_Distance: number
}

interface WebGLVertexArrayObject_ext {
  a10: WebGLVertexArrayObject | null
}

// ******************************** WebGL ********************************

const context2DPrototype = CanvasRenderingContext2D.prototype

// 画布上下文方法 - 绘制图像必要时缩小使之包含于画布
context2DPrototype.drawAndFitImage = function (
  image, sx = 0, sy = 0, sw = image.width, sh = image.height) {
  const width = this.canvas.width
  const height = this.canvas.height
  let dw
  let dh
  if (sw <= width && sh <= height) {
    dw = sw
    dh = sh
  } else {
    const scaleX = width / sw
    const scaleY = height / sh
    if (scaleX < scaleY) {
      dw = width
      dh = Math.round(sh * scaleX)
    } else {
      dw = Math.round(sw * scaleY)
      dh = height
    }
  }
  const dx = width - dw >> 1
  const dy = height - dh >> 1
  this.drawImage(image, sx, sy, sw, sh, dx, dy, dw, dh)
}

let GL: WebGL2RenderingContext

{
  // 创建画布元素
  const canvas = document.createElement('canvas')
  canvas.width = 0
  canvas.height = 0
  canvas.style.position = 'absolute'
  canvas.style.width = '100%'
  canvas.style.height = '100%'

  // 主题画布背景颜色
  const background: { [index: string]: rgbColor } = {
    light: {red: 0xc8, green: 0xc8, blue: 0xc8},
    dark: {red: 0x20, green: 0x20, blue: 0x20},
  }

  // 侦听主题改变事件
  window.on('themechange', function (event: Event) {
    if (typeof event?.value === 'string') {
      const {red, green, blue} = background[event.value]
      GL.BACKGROUND_RED = red / 255
      GL.BACKGROUND_GREEN = green / 255
      GL.BACKGROUND_BLUE = blue / 255
    }
  })

  // 侦听WebGL上下文丢失事件
  canvas.on('webglcontextlost', function (event: Event) {
    event.preventDefault()
    setTimeout(() => GL.WEBGL_lose_context.restoreContext())
  })

  // 侦听WebGL上下文恢复事件
  canvas.on('webglcontextrestored', function (event: Event) {
    GL.restore()
  })

  // WebGL上下文选项
  const options: WebGLContextAttributes = {
    antialias: false,
    alpha: false,
    depth: true,
    stencil: false,
    premultipliedAlpha: false,
    preserveDrawingBuffer: false,
    desynchronized: true,
  }

  // 优先使用WebGL2(Win10 DirectX11)
  GL = <WebGL2RenderingContext>canvas.getContext('webgl2', options)
  if (GL instanceof WebGL2RenderingContext) {} else {
    // 回退到WebGL1(Win7 DirectX9以及旧移动设备)
    const GL1 = canvas.getContext('webgl', options)
    if (GL1 === null) {
      throw new Error('get webgl context error!')
    }

    // 获取元素索引 32 位无符号整数扩展
    const element_index_uint = GL1.getExtension('OES_element_index_uint')

    // 获取顶点数组对象扩展
    const vertex_array_object = GL1.getExtension('OES_vertex_array_object')
    if (vertex_array_object !== null) {
      GL1.createVertexArray = vertex_array_object.createVertexArrayOES.bind(vertex_array_object)
      GL1.deleteVertexArray = vertex_array_object.deleteVertexArrayOES.bind(vertex_array_object)
      GL1.isVertexArray = vertex_array_object.isVertexArrayOES.bind(vertex_array_object)
      GL1.bindVertexArray = vertex_array_object.bindVertexArrayOES.bind(vertex_array_object)
    }

    // 获取最小和最大混合模式扩展
    const blend_minmax = GL1.getExtension('EXT_blend_minmax')
    if (blend_minmax !== null) {
      GL1.MIN = blend_minmax.MIN_EXT
      GL1.MAX = blend_minmax.MAX_EXT
    }

    // 重写更新缓冲数据方法
    const prototype = WebGLRenderingContext.prototype
    prototype._bufferData = prototype.bufferData
    prototype.bufferData = function (target, data, usage, offset, length) {
      if (length !== undefined) {
        length *= data.BYTES_PER_ELEMENT
        data = new Uint8Array(data.buffer, offset, length)
      }
      return prototype._bufferData(target, data, usage)
    }

    // 转换到WebGL2
    const GL1_as_obj = <Object>GL1
    GL = <WebGL2RenderingContext>GL1_as_obj
  }

  // 获取失去上下文扩展
  const lose_context = GL.getExtension('WEBGL_lose_context')
  if (lose_context !== null) {
    GL.WEBGL_lose_context = lose_context
  }
}

// ******************************** WebGL方法加载 ********************************

// WebGL上下文方法 - 恢复上下文
GL.restore = function () {
  const {contrast, ambient} = this
  this.textureManager.restore()
  this.initialize()
  this.setContrast(contrast)
  this.setAmbientLight(ambient)
  this.updateLightTexSize()
}

// WebGL上下文方法 - 初始化
GL.initialize = async function () {
  // 设置初始属性
  this.flip = this.flip ?? -1
  this.alpha = this.alpha ?? 1
  this.blend = this.blend ?? 'normal'
  this.matrix = this.matrix ?? new Matrix()
  this.width = this.drawingBufferWidth
  this.height = this.drawingBufferHeight
  this.program = null
  this.binding = null
  this.masking = false
  this.depthTest = false

  // 设置光照对比度
  this.contrast = 0

  // 创建环境光对象
  this.ambient = {red: -1, green: -1, blue: -1}

  // 创建纹理管理器
  this.textureManager = this.textureManager ?? new TextureManager()

  // 设置最大纹理数量
  this.maxTexUnits = 16

  // 创建光影纹理
  this.lightmap = this.lightmap ?? new Texture({
    format: this.RGB,
    magFilter: this.LINEAR,
    minFilter: this.LINEAR,
  })

  if (this.lightmap.base) {
    this.lightmap.base.protected = true
    this.lightmap.fbo = this.createTextureFBO(this.lightmap)
    this.activeTexture(this.TEXTURE0 + this.maxTexUnits - 1)
    this.bindTexture(this.TEXTURE_2D, this.lightmap.base.glTexture)
    this.activeTexture(this.TEXTURE0)
  }


  // 创建模板纹理
  this.stencilTexture = this.stencilTexture ?? new Texture({format: this.ALPHA})
  if (this.stencilTexture.base) {
    this.stencilTexture.base.protected = true
  }
  
  // 创建遮罩纹理
  this.maskTexture = this.maskTexture ?? new Texture({format: this.RGBA})
  this.maskTexture.fbo = this.createTextureFBO(this.maskTexture)

  // 创建图层数组
  this.layers = this.layers ?? new Uint32Array(0x40000)

  // 创建零值数组
  this.zeros = this.zeros ?? new Uint32Array(0x40000)

  // 创建类型化数组
  const size = 512 * 512
  if (!this.arrays) {
    const buffer1 = new ArrayBuffer(size * 96)
    const buffer2 = new ArrayBuffer(size * 12)
    const buffer3 = new ArrayBuffer(size * 8)
    const buffer4 = new ArrayBuffer(size * 40)
    this.arrays = {
      0: {
        uint8: new Uint8Array(buffer1, 0, size * 96),
        uint32: new Uint32Array(buffer1, 0, size * 24),
        float32: new Float32Array(buffer1, 0, size * 24),
      },
      1: {
        uint16: new Uint16Array(buffer2, 0, size * 6),
        uint32: new Uint32Array(buffer2, 0, size * 3),
        float32: new Float32Array(buffer2, 0, size * 3),
      },
      2: {
        uint32: new Uint32Array(buffer3, 0, size * 2),
      },
      3: {
        uint32: new Uint32Array(buffer4, 0, size * 10),
        float32: new Float32Array(buffer4, 0, size * 10),
      },
    }
  }

  // 创建帧缓冲区
  this.frameBuffer = this.createFramebuffer()

  // 创建顶点缓冲区
  this.vertexBuffer = this.createBuffer()

  // 创建索引缓冲区
  const indices = this.arrays[0].uint32
  for (let i = 0; i < size; i++) {
    const ei = i * 6
    const vi = i * 4
    indices[ei    ] = vi
    indices[ei + 1] = vi + 1
    indices[ei + 2] = vi + 2
    indices[ei + 3] = vi
    indices[ei + 4] = vi + 2
    indices[ei + 5] = vi + 3
  }
  this.elementBuffer = this.createBuffer()
  this.bindBuffer(this.ELEMENT_ARRAY_BUFFER, this.elementBuffer)
  this.bufferData(this.ELEMENT_ARRAY_BUFFER, indices, this.STATIC_DRAW, 0, size * 6)
  this.bindBuffer(this.ELEMENT_ARRAY_BUFFER, null)

  // 创建更新混合模式方法(闭包)
  this.updateBlending = this.createBlendingUpdater()

  // 创建批量渲染器
  this.batchRenderer = new BatchRenderer(this)

  // 创建2D上下文对象
  this.context2d = this.context2d ?? this.createContext2D()

  // 创建程序对象
  this.imageProgram = await this.createImageProgram()
  this.tileProgram = await this.createTileProgram()
  this.textProgram = await this.createTextProgram()
  this.spriteProgram = await this.createSpriteProgram()
  this.particleProgram = await this.createParticleProgram()
  this.lightProgram = await this.createLightProgram()
  this.graphicProgram = await this.createGraphicProgram()
  this.dashedLineProgram = await this.createDashedLineProgram()
}

GL.loadFileText = async function (fileName: string) {
  const promise = FSP.readFile(fileName, 'utf8')
  const data = await promise
  return data
}

// WebGL上下文方法 - 创建程序对象
GL.createProgramWithShaders = async function (vsFileName, fsFileName) {
  const path = "Script/webgl/shaders/"
  const vsPath = Path.resolve(__dirname, path + vsFileName)
  const fsPath = Path.resolve(__dirname, path + fsFileName)

  const vshader = await this.loadFileText(vsPath)
  const fshader = await this.loadFileText(fsPath)
  const vertexShader = this.loadShader(this.VERTEX_SHADER, vshader)
  const fragmentShader = this.loadShader(this.FRAGMENT_SHADER, fshader)
  if (!vertexShader || !fragmentShader) {
    return null
  }

  const program = this.createProgram()
  if (!program) {
    console.error('Failed to create program')
    return null
  }

  this.attachShader(program, vertexShader)
  this.attachShader(program, fragmentShader)
  this.linkProgram(program)
  if (!this.getProgramParameter(program, this.LINK_STATUS)) {
    const error = this.getProgramInfoLog(program)
    console.error(`Failed to link program: ${error}`)
    this.deleteProgram(program)
    this.deleteShader(fragmentShader)
    this.deleteShader(vertexShader)
    return null
  }
  return program
}

// WebGL上下文方法 - 加载着色器
GL.loadShader = function (type, source) {
  const shader = this.createShader(type)
  if (!shader) {
    console.error('Unable to create shader')
    return null
  }

  this.shaderSource(shader, source)
  this.compileShader(shader)
  if (!this.getShaderParameter(shader, this.COMPILE_STATUS)) {
    const error = this.getShaderInfoLog(shader)
    console.error(`Failed to compile shader: ${error}`)
    this.deleteShader(shader)
    return null
  }
  return shader
}

// WebGL上下文方法 - 创建图像程序
GL.createImageProgram = async function () {
  const program = await this.createProgramWithShaders("image.vs", "image.fs")

  if (program !== null) {
    this.useProgram(program)

    // 顶点着色器属性
    const a_Position = this.getAttribLocation(program, 'a_Position')
    const a_TexCoord = this.getAttribLocation(program, 'a_TexCoord')
    const u_Flip = this.getUniformLocation(program, 'u_Flip')
    const u_Matrix = this.getUniformLocation(program, 'u_Matrix')
    const u_Ambient = this.getUniformLocation(program, 'u_Ambient')
    const u_Contrast = this.getUniformLocation(program, 'u_Contrast')
    const u_LightMode = this.getUniformLocation(program, 'u_LightMode')
    const u_LightCoord = this.getUniformLocation(program, 'u_LightCoord')
    const u_LightTexSize = this.getUniformLocation(program, 'u_LightTexSize')
    this.uniform1i(this.getUniformLocation(program, 'u_LightSampler'), this.maxTexUnits - 1)

    // 片元着色器属性
    const u_Viewport = this.getUniformLocation(program, 'u_Viewport')
    const u_Masking = this.getUniformLocation(program, 'u_Masking')
    const u_Alpha = this.getUniformLocation(program, 'u_Alpha')
    const u_ColorMode = this.getUniformLocation(program, 'u_ColorMode')
    const u_Color = this.getUniformLocation(program, 'u_Color')
    const u_Tint = this.getUniformLocation(program, 'u_Tint')
    const u_Repeat = this.getUniformLocation(program, 'u_Repeat')
    const u_MaskSampler = this.getUniformLocation(program, 'u_MaskSampler')

    // 创建顶点数组对象
    const vao = this.createVertexArray()
    this.bindVertexArray(vao)
    this.enableVertexAttribArray(a_Position)
    this.enableVertexAttribArray(a_TexCoord)
    this.bindBuffer(this.ARRAY_BUFFER, this.vertexBuffer)
    this.vertexAttribPointer(a_Position, 2, this.FLOAT, false, 16, 0)
    this.vertexAttribPointer(a_TexCoord, 2, this.FLOAT, false, 16, 8)
    this.bindBuffer(this.ELEMENT_ARRAY_BUFFER, this.elementBuffer)

    // 使用程序对象
    const use = () => {
      if (this.program !== program) {
        this.program = program
        this.useProgram(program)
      }
      if (program.flip !== this.flip) {
        program.flip = this.flip
        this.uniform1f(u_Flip, program.flip)
      }
      if (program.alpha !== this.alpha) {
        program.alpha = this.alpha
        this.uniform1f(u_Alpha, program.alpha)
      }
      this.updateMasking()
      this.updateBlending()
      return program
    }

    // 保存程序对象
    program.use = use
    program.vao = vao
    program.alpha = 0
    program.masking = false
    program.a_Position = a_Position
    program.a_TexCoord = a_TexCoord
    program.u_Matrix = u_Matrix
    program.u_Ambient = u_Ambient
    program.u_Contrast = u_Contrast
    program.u_LightMode = u_LightMode
    program.u_LightCoord = u_LightCoord
    program.u_LightTexSize = u_LightTexSize
    program.u_Viewport = u_Viewport
    program.u_Masking = u_Masking
    program.u_MaskSampler = u_MaskSampler
    program.u_ColorMode = u_ColorMode
    program.u_Color = u_Color
    program.u_Tint = u_Tint
    program.u_Repeat = u_Repeat
  }
  
  return program
}

// WebGL上下文方法 - 创建图块程序
GL.createTileProgram = async function () {
  const program = await this.createProgramWithShaders("tile.vs", "tile.fs")

  if (program !== null) {
    this.useProgram(program)

    // 顶点着色器属性
    const a_Position = this.getAttribLocation(program, 'a_Position')
    const a_TexCoord = this.getAttribLocation(program, 'a_TexCoord')
    const a_TexIndex = this.getAttribLocation(program, 'a_TexIndex')
    const u_Flip = this.getUniformLocation(program, 'u_Flip')
    const u_Matrix = this.getUniformLocation(program, 'u_Matrix')
    const u_Ambient = this.getUniformLocation(program, 'u_Ambient')
    const u_Contrast = this.getUniformLocation(program, 'u_Contrast')
    const u_LightMode = this.getUniformLocation(program, 'u_LightMode')
    const u_LightTexSize = this.getUniformLocation(program, 'u_LightTexSize')
    this.uniform1i(this.getUniformLocation(program, 'u_LightSampler'), this.maxTexUnits - 1)

    // 片元着色器属性
    const u_Alpha = this.getUniformLocation(program, 'u_Alpha')
    const u_TintMode = this.getUniformLocation(program, 'u_TintMode')
    const u_Tint = this.getUniformLocation(program, 'u_Tint')
    const u_SamplerLength = this.maxTexUnits - 1
    const u_Samplers: WebGLUniformLocation[] = []
    for (let i = 0; i < u_SamplerLength; i++) {
      const sampler = this.getUniformLocation(program, `u_Samplers[${i}]`)
      if (sampler) {
        u_Samplers.push(sampler)
      }
    }

    // 创建顶点数组对象
    const vao = this.createVertexArray()
    this.bindVertexArray(vao)
    this.enableVertexAttribArray(a_Position)
    this.enableVertexAttribArray(a_TexCoord)
    this.enableVertexAttribArray(a_TexIndex)
    this.bindBuffer(this.ARRAY_BUFFER, this.vertexBuffer)
    this.vertexAttribPointer(a_Position, 2, this.FLOAT, false, 20, 0)
    this.vertexAttribPointer(a_TexCoord, 2, this.FLOAT, false, 20, 8)
    this.vertexAttribPointer(a_TexIndex, 1, this.FLOAT, false, 20, 16)
    this.bindBuffer(this.ELEMENT_ARRAY_BUFFER, this.elementBuffer)

    // 使用程序对象
    const use = () => {
      if (this.program !== program) {
        this.program = program
        this.useProgram(program)
      }
      if (program.flip !== this.flip) {
        program.flip = this.flip
        this.uniform1f(u_Flip, program.flip)
      }
      if (program.alpha !== this.alpha) {
        program.alpha = this.alpha
        this.uniform1f(u_Alpha, program.alpha)
      }
      return program
    }

    // 保存程序对象
    program.use = use
    program.vao = vao
    program.flip = null
    program.alpha = 0
    program.samplerNum = 1
    program.a_Position = a_Position
    program.a_TexCoord = a_TexCoord
    program.a_TexIndex = a_TexIndex
    program.u_Matrix = u_Matrix
    program.u_Ambient = u_Ambient
    program.u_Contrast = u_Contrast
    program.u_LightMode = u_LightMode
    program.u_LightTexSize = u_LightTexSize
    program.u_TintMode = u_TintMode
    program.u_Tint = u_Tint
    program.u_Samplers = u_Samplers
  }

  return program
}

// WebGL上下文方法 - 创建文字程序
GL.createTextProgram = async function () {
  const program = await this.createProgramWithShaders("text.vs", "text.fs")

  if (program !== null) {
    this.useProgram(program)

    // 顶点着色器属性
    const a_Position = this.getAttribLocation(program, 'a_Position')
    const a_TexCoord = this.getAttribLocation(program, 'a_TexCoord')
    const a_TextColor = this.getAttribLocation(program, 'a_TextColor')

    // 片元着色器属性
    const u_Alpha = this.getUniformLocation(program, 'u_Alpha')
    const u_Threshold = this.getUniformLocation(program, 'u_Threshold')

    // 创建顶点数组对象
    const vao = this.createVertexArray()
    this.bindVertexArray(vao)
    this.enableVertexAttribArray(a_Position)
    this.enableVertexAttribArray(a_TexCoord)
    this.enableVertexAttribArray(a_TextColor)
    this.bindBuffer(this.ARRAY_BUFFER, this.vertexBuffer)
    this.vertexAttribPointer(a_Position, 2, this.FLOAT, false, 20, 0)
    this.vertexAttribPointer(a_TexCoord, 2, this.FLOAT, false, 20, 8)
    this.vertexAttribPointer(a_TextColor, 4, this.UNSIGNED_BYTE, true, 20, 16)
    this.bindBuffer(this.ELEMENT_ARRAY_BUFFER, this.elementBuffer)

    // 使用程序对象
    const use = () => {
      if (this.program !== program) {
        this.program = program
        this.useProgram(program)
      }
      if (program.alpha !== this.alpha) {
        program.alpha = this.alpha
        this.uniform1f(u_Alpha, program.alpha)
      }
      this.updateBlending()
      return program
    }

    // 保存程序对象
    program.use = use
    program.vao = vao
    program.alpha = 0
    program.a_Position = a_Position
    program.a_TexCoord = a_TexCoord
    program.a_TextColor = a_TextColor
    program.u_Threshold = u_Threshold
  }

  return program
}

// WebGL上下文方法 - 创建精灵程序
GL.createSpriteProgram = async function () {
  const program = await this.createProgramWithShaders("sprite.vs", "sprite.fs")

  if (program !== null) {
  this.useProgram(program)

    // 顶点着色器属性
    const a_Position = this.getAttribLocation(program, 'a_Position')
    const a_TexCoord = this.getAttribLocation(program, 'a_TexCoord')
    const a_TexParam = this.getAttribLocation(program, 'a_TexParam')
    const a_Tint = this.getAttribLocation(program, 'a_Tint')
    const a_LightCoord = this.getAttribLocation(program, 'a_LightCoord')
    const u_Flip = this.getUniformLocation(program, 'u_Flip')
    const u_Matrix = this.getUniformLocation(program, 'u_Matrix')
    const u_Contrast = this.getUniformLocation(program, 'u_Contrast')
    const u_LightTexSize = this.getUniformLocation(program, 'u_LightTexSize')
    this.uniform1i(this.getUniformLocation(program, 'u_LightSampler'), this.maxTexUnits - 1)

    // 片元着色器属性
    const u_Alpha = this.getUniformLocation(program, 'u_Alpha')
    const u_Tint = this.getUniformLocation(program, 'u_Tint')
    const u_SamplerLength = this.maxTexUnits - 1
    const u_Samplers: WebGLUniformLocation[] = []
    for (let i = 0; i < u_SamplerLength; i++) {
      const sampler = this.getUniformLocation(program, `u_Samplers[${i}]`)
      if (sampler) {
        u_Samplers.push(sampler)
      }
    }

    // 创建顶点数组对象
    const vao = this.createVertexArray()
    this.bindVertexArray(vao)
    this.enableVertexAttribArray(a_Position)
    this.enableVertexAttribArray(a_TexCoord)
    this.enableVertexAttribArray(a_TexParam)
    this.enableVertexAttribArray(a_Tint)
    this.enableVertexAttribArray(a_LightCoord)
    this.bindBuffer(this.ARRAY_BUFFER, this.vertexBuffer)
    this.vertexAttribPointer(a_Position, 2, this.FLOAT, false, 32, 0)
    this.vertexAttribPointer(a_TexCoord, 2, this.FLOAT, false, 32, 8)
    this.vertexAttribPointer(a_TexParam, 3, this.UNSIGNED_BYTE, false, 32, 16)
    this.vertexAttribPointer(a_Tint, 4, this.UNSIGNED_SHORT, false, 32, 20)
    this.vertexAttribPointer(a_LightCoord, 2, this.UNSIGNED_SHORT, true, 32, 28)
    this.bindBuffer(this.ELEMENT_ARRAY_BUFFER, this.elementBuffer)

    // 使用程序对象
    const use = () => {
      if (this.program !== program) {
        this.program = program
        this.useProgram(program)
      }
      if (program.flip !== this.flip) {
        program.flip = this.flip
        this.uniform1f(u_Flip, program.flip)
      }
      if (program.alpha !== this.alpha) {
        program.alpha = this.alpha
        this.uniform1f(u_Alpha, program.alpha)
      }
      return program
    }

    // 保存程序对象
    program.use = use
    program.vao = vao
    program.flip = null
    program.alpha = 0
    program.samplerNum = 1
    program.a_Position = a_Position
    program.a_TexCoord = a_TexCoord
    program.a_TexParam = a_TexParam
    program.a_Tint = a_Tint
    program.a_LightCoord = a_LightCoord
    program.u_Matrix = u_Matrix
    program.u_Contrast = u_Contrast
    program.u_LightTexSize = u_LightTexSize
    program.u_Tint = u_Tint
    program.u_Samplers = u_Samplers
  }

  return program
}

// WebGL上下文方法 - 创建粒子程序
GL.createParticleProgram = async function () {
  const program = await this.createProgramWithShaders("particle.vs", "particle.fs")

  if (program !== null) {
  this.useProgram(program)

    // 顶点着色器属性
    const a_Position = this.getAttribLocation(program, 'a_Position')
    const a_TexCoord = this.getAttribLocation(program, 'a_TexCoord')
    const a_Color = this.getAttribLocation(program, 'a_Color')
    const u_Matrix = this.getUniformLocation(program, 'u_Matrix')

    // 片元着色器属性
    const u_Alpha = this.getUniformLocation(program, 'u_Alpha')
    const u_Mode = this.getUniformLocation(program, 'u_Mode')
    const u_Tint = this.getUniformLocation(program, 'u_Tint')

    // 创建顶点数组对象
    const vao = this.createVertexArray()
    this.bindVertexArray(vao)
    this.enableVertexAttribArray(a_Position)
    this.enableVertexAttribArray(a_TexCoord)
    this.enableVertexAttribArray(a_Color)
    this.bindBuffer(this.ARRAY_BUFFER, this.vertexBuffer)
    this.vertexAttribPointer(a_Position, 2, this.FLOAT, false, 20, 0)
    this.vertexAttribPointer(a_TexCoord, 2, this.FLOAT, false, 20, 8)
    this.vertexAttribPointer(a_Color, 4, this.UNSIGNED_BYTE, true, 20, 16)
    this.bindBuffer(this.ELEMENT_ARRAY_BUFFER, this.elementBuffer)

    // 使用程序对象
    const use = () => {
      if (this.program !== program) {
        this.program = program
        this.useProgram(program)
      }
      if (program.alpha !== this.alpha) {
        program.alpha = this.alpha
        this.uniform1f(u_Alpha, program.alpha)
      }
      this.updateBlending()
      return program
    }

    // 保存程序对象
    program.use = use
    program.vao = vao
    program.alpha = 0
    program.a_Position = a_Position
    program.a_TexCoord = a_TexCoord
    program.a_Color = a_Color
    program.u_Matrix = u_Matrix
    program.u_Mode = u_Mode
    program.u_Tint = u_Tint
  }

  return program
}

// WebGL上下文方法 - 创建光源程序
GL.createLightProgram = async function () {
  const program = await this.createProgramWithShaders("light.vs", "light.fs")

  if (program !== null) {
    this.useProgram(program)

    // 顶点着色器属性
    const a_Position = this.getAttribLocation(program, 'a_Position')
    const a_LightCoord = this.getAttribLocation(program, 'a_LightCoord')
    const u_Matrix = this.getUniformLocation(program, 'u_Matrix')

    // 片元着色器属性
    const u_LightMode = this.getUniformLocation(program, 'u_LightMode')
    const u_LightColor = this.getUniformLocation(program, 'u_LightColor')

    // 创建顶点数组对象
    const vao = this.createVertexArray()
    this.bindVertexArray(vao)
    this.enableVertexAttribArray(a_Position)
    this.enableVertexAttribArray(a_LightCoord)
    this.bindBuffer(this.ARRAY_BUFFER, this.vertexBuffer)
    this.vertexAttribPointer(a_Position, 2, this.FLOAT, false, 16, 0)
    this.vertexAttribPointer(a_LightCoord, 2, this.FLOAT, false, 16, 8)

    // 使用程序对象
    const use = () => {
      if (this.program !== program) {
        this.program = program
        this.useProgram(program)
      }
      this.updateBlending()
      return program
    }

    // 保存程序对象
    program.use = use
    program.vao = vao
    program.a_Position = a_Position
    program.a_LightCoord = a_LightCoord
    program.u_Matrix = u_Matrix
    program.u_LightMode = u_LightMode
    program.u_LightColor = u_LightColor
  }

  return program
}

// WebGL上下文方法 - 创建图形程序
GL.createGraphicProgram = async function () {
  const program = await this.createProgramWithShaders("graphic.vs", "graphic.fs")

  if (program !== null) {
  this.useProgram(program)

    // 顶点着色器属性
    const a_Position = this.getAttribLocation(program, 'a_Position')
    const a_Color = this.getAttribLocation(program, 'a_Color')
    const u_Matrix = this.getUniformLocation(program, 'u_Matrix')

    // 片元着色器属性
    const u_Alpha = this.getUniformLocation(program, 'u_Alpha')

    // 创建顶点数组对象
    const vao = this.createVertexArray()
    this.bindVertexArray(vao)
    this.enableVertexAttribArray(a_Position)
    this.enableVertexAttribArray(a_Color)
    this.bindBuffer(this.ARRAY_BUFFER, this.vertexBuffer)
    this.vertexAttribPointer(a_Position, 2, this.FLOAT, false, 12, 0)
    this.vertexAttribPointer(a_Color, 4, this.UNSIGNED_BYTE, true, 12, 8)
    this.bindBuffer(this.ELEMENT_ARRAY_BUFFER, this.elementBuffer)

    // 创建顶点数组对象 - 属性[10]
    vao.a10 = this.createVertexArray()
    this.bindVertexArray(vao.a10)
    this.enableVertexAttribArray(a_Position)
    this.bindBuffer(this.ARRAY_BUFFER, this.vertexBuffer)
    this.vertexAttribPointer(a_Position, 2, this.FLOAT, false, 0, 0)
    this.bindBuffer(this.ELEMENT_ARRAY_BUFFER, this.elementBuffer)

    // 使用程序对象
    const use = () => {
      if (this.program !== program) {
        this.program = program
        this.useProgram(program)
      }
      if (program.alpha !== this.alpha) {
        program.alpha = this.alpha
        this.uniform1f(u_Alpha, program.alpha)
      }
      this.updateBlending()
      return program
    }

    // 保存程序对象
    program.use = use
    program.vao = vao
    program.alpha = 0
    program.a_Position = a_Position
    program.a_Color = a_Color
    program.u_Matrix = u_Matrix
  }

  return program
}

// WebGL上下文方法 - 创建虚线程序
GL.createDashedLineProgram = async function () {
  const program = await this.createProgramWithShaders("dashed-line.vs", "dashed-line.fs")

  if (program !== null) {
  this.useProgram(program)

    // 顶点着色器属性
    const a_Position = this.getAttribLocation(program, 'a_Position')
    const a_Distance = this.getAttribLocation(program, 'a_Distance')
    const u_Matrix = this.getUniformLocation(program, 'u_Matrix')

    // 片元着色器属性
    const u_Alpha = this.getUniformLocation(program, 'u_Alpha')
    const u_Color = this.getUniformLocation(program, 'u_Color')

    // 创建顶点数组对象
    const vao = this.createVertexArray()
    this.bindVertexArray(vao)
    this.enableVertexAttribArray(a_Position)
    this.enableVertexAttribArray(a_Distance)
    this.bindBuffer(this.ARRAY_BUFFER, this.vertexBuffer)
    this.vertexAttribPointer(a_Position, 2, this.FLOAT, false, 12, 0)
    this.vertexAttribPointer(a_Distance, 1, this.FLOAT, false, 12, 8)

    // 使用程序对象
    const use = () => {
      if (this.program !== program) {
        this.program = program
        this.useProgram(program)
      }
      if (program.alpha !== this.alpha) {
        program.alpha = this.alpha
        this.uniform1f(u_Alpha, program.alpha)
      }
      this.updateBlending()
      return program
    }

    // 保存程序对象
    program.use = use
    program.vao = vao
    program.alpha = 0
    program.a_Position = a_Position
    program.a_Distance = a_Distance
    program.u_Matrix = u_Matrix
    program.u_Color = u_Color
  }

  return program
}

// WebGL上下文方法 - 重置状态
GL.reset = function () {
  this.blend = 'normal'
  this.alpha = 1
  this.matrix.reset()
}

// WebGL上下文方法 - 更新遮罩模式
GL.updateMasking = function () {
  if (!this.program)
    return
  if (this.program.masking !== this.masking) {
    this.program.masking = this.masking
    if (this.masking && this.maskTexture.base) {
      this.uniform1i(this.program.u_Masking, 1)
      this.uniform1i(this.program.u_MaskSampler, 1)
      this.activeTexture(this.TEXTURE1)
      this.bindTexture(this.TEXTURE_2D, this.maskTexture.base.glTexture)
      this.activeTexture(this.TEXTURE0)
    } else {
      this.uniform1i(this.program.u_Masking, 0)
      this.uniform1i(this.program.u_MaskSampler, 0)
      this.activeTexture(this.TEXTURE1)
      this.bindTexture(this.TEXTURE_2D, null)
      this.activeTexture(this.TEXTURE0)
    }
  }
  if (this.masking) {
    this.uniform2f(this.program.u_Viewport, this.width, this.height)
  }
}

type mappingTable = { [index: string]: any }

// WebGL上下文方法 - 创建混合模式更新器
GL.createBlendingUpdater = function () {
  // 开启混合功能
  this.enable(this.BLEND)

  // 更新器映射表(启用混合时)
  const A: mappingTable = {
    // 正常模式
    normal: () => {
      this.blendEquation(this.FUNC_ADD)
      this.blendFuncSeparate(this.SRC_ALPHA, this.ONE_MINUS_SRC_ALPHA, this.ONE, this.ZERO)
    },
    // 滤色模式
    screen: () => {
      this.blendEquation(this.FUNC_ADD)
      this.blendFunc(this.ONE, this.ONE_MINUS_SRC_COLOR)
    },
    // 加法模式
    additive: () => {
      this.blendEquation(this.FUNC_ADD)
      this.blendFuncSeparate(this.SRC_ALPHA, this.DST_ALPHA, this.ONE, this.ZERO)
    },
    // 减法模式
    subtract: () => {
      this.blendEquation(this.FUNC_REVERSE_SUBTRACT)
      this.blendFuncSeparate(this.SRC_ALPHA, this.DST_ALPHA, this.ONE, this.ZERO)
    },
    // 上层模式
    upper: () => {
      this.blendEquation(this.FUNC_ADD)
      this.blendFuncSeparate(this.SRC_ALPHA, this.ONE_MINUS_SRC_ALPHA, this.ONE, this.ONE_MINUS_SRC_ALPHA)
    },
    // 下层模式
    lower: () => {
      this.blendEquation(this.FUNC_ADD)
      this.blendFuncSeparate(this.ONE_MINUS_DST_ALPHA, this.DST_ALPHA, this.ONE_MINUS_DST_ALPHA, this.ONE)
    },
    // 最大值模式
    max: () => {
      this.blendEquation(this.MAX)
    },
    // 复制模式
    copy: () => {
      this.disable(this.BLEND)
      updaters = B
    },
  }

  // 从复制模式切换到其他模式
  const resume = () => {
    (updaters = A)[blend]()
    this.enable(this.BLEND)
  }

  // 更新器映射表(禁用混合时)
  const B: mappingTable = {
    normal: resume,
    screen: resume,
    additive: resume,
    subtract: resume,
    upper: resume,
    lower: resume,
    max: resume,
  }

  let updaters = A
  let blend = ''
  // 返回更新混合模式方法
  return () => {
    if (blend !== this.blend) {
      updaters[blend = this.blend]()
    }
  }
}

// WebGL上下文方法 - 设置对比度
GL.setContrast = function (contrast) {
  if (this.contrast !== contrast) {
    this.contrast = contrast
    const program = this.program
    for (const program of [
      this.imageProgram,
      this.tileProgram,
      this.spriteProgram,
    ]) {
      if (!program)
        return
      this.useProgram(program)
      this.uniform1f(program.u_Contrast, contrast)
    }
    this.useProgram(program)
  }
}

// WebGL上下文方法 - 设置环境光
GL.setAmbientLight = function ({red, green, blue}) {
  const ambient = this.ambient
  if (ambient.red !== red ||
    ambient.green !== green ||
    ambient.blue !== blue) {
    ambient.red = red
    ambient.green = green
    ambient.blue = blue
    const program = this.program
    const r = ambient.red / 255
    const g = ambient.green / 255
    const b = ambient.blue / 255
    for (const program of [
      this.imageProgram,
      this.tileProgram,
    ]) {
      if (!program)
        return
      this.useProgram(program)
      this.uniform3f(program.u_Ambient, r, g, b)
    }
    this.useProgram(program)
  }
}

// WebGL上下文方法 - 调整光影纹理
GL.resizeLightmap = function () {
  const {lightmap, width, height} = this
  if (lightmap.innerWidth !== width ||
    lightmap.innerHeight !== height) {
    lightmap.innerWidth = width
    lightmap.innerHeight = height
    if (lightmap.paddingLeft === undefined) {
      const {lightArea} = Data.config
      // 计算光影纹理最大扩张值(4倍)
      // 避免频繁调整纹理尺寸
      lightmap.paddingLeft = Math.min(lightArea.expansionLeft * 4, 1024)
      lightmap.paddingTop = Math.min(lightArea.expansionTop * 4, 1024)
      lightmap.paddingRight = Math.min(lightArea.expansionRight * 4, 1024)
      lightmap.paddingBottom = Math.min(lightArea.expansionBottom * 4, 1024)
    }
    const pl = lightmap.paddingLeft
    const pt = lightmap.paddingTop
    const pr = lightmap.paddingRight
    const pb = lightmap.paddingBottom
    const tWidth = width + pl + pr
    const tHeight = height + pt + pb
    lightmap.scaleX = 0
    lightmap.scaleY = 0
    lightmap.resize(tWidth, tHeight)
    this.bindTexture(this.TEXTURE_2D, null)
    this.updateLightTexSize()
  }
}

// WebGL上下文方法 - 更新光照纹理大小
GL.updateLightTexSize = function () {
  const texture = this.lightmap
  if (texture.width === 0) return
  const width = this.drawingBufferWidth
  const height = this.drawingBufferHeight
  const sizeX = texture.width / width * 2
  const sizeY = texture.height / height * 2
  const centerX = (texture.paddingLeft + width / 2) / texture.width
  const centerY = (texture.paddingTop + height / 2) / texture.height
  const program = this.program
  for (const program of [
    this.imageProgram,
    this.tileProgram,
    this.spriteProgram,
  ]) {
    if (!program)
      return
    this.useProgram(program)
    this.uniform4f(program.u_LightTexSize, sizeX, sizeY, centerX, centerY)
  }
  this.useProgram(program)
}

// WebGL上下文方法 - 更新采样器数量
// 避免chrome 69未绑定纹理警告
GL.updateSamplerNum = function (samplerNum) {
  const program = this.program
  if (!program)
    return
  const lastNum = program.samplerNum
  if (lastNum !== samplerNum) {
    const u_Samplers = program.u_Samplers
    if (lastNum < samplerNum) {
      for (let i = lastNum; i < samplerNum; i++) {
        this.uniform1i(u_Samplers[i], i)
      }
    } else {
      for (let i = samplerNum; i < lastNum; i++) {
        this.uniform1i(u_Samplers[i], 0)
      }
    }
    program.samplerNum = samplerNum
  }
}

// WebGL上下文方法 - 绑定帧缓冲对象
GL.bindFBO = function (fbo) {
  this.binding = fbo
  this.flip = 1
  this.bindFramebuffer(this.FRAMEBUFFER, fbo)
}

// WebGL上下文方法 - 解除帧缓冲对象的绑定
GL.unbindFBO = function () {
  this.binding = null
  this.flip = -1
  this.bindFramebuffer(this.FRAMEBUFFER, null)
}

// 设置视口大小
GL.setViewport = function (x, y, width, height) {
  this.width = width
  this.height = height
  this.viewport(x, y, width, height)
}

// 重置视口大小
GL.resetViewport = function () {
  const width = this.drawingBufferWidth
  const height = this.drawingBufferHeight
  this.width = width
  this.height = height
  this.viewport(0, 0, width, height)
}

// WebGL上下文方法 - 调整画布大小
GL.resize = function (width, height) {
  const canvas = this.canvas
  if (canvas.width !== width) {
    canvas.width = width
  }
  if (canvas.height !== height) {
    canvas.height = height
  }
  if (this.binding === null && (
    this.width !== width ||
    this.height !== height)) {
    this.width = width
    this.height = height
    this.viewport(0, 0, width, height)
    this.maskTexture.resize(width, height)
  }
}

// WebGL上下文方法 - 绘制图像
GL.drawImage = function IIFE() {
  const defTint = new Uint8Array(4)
  return function (this: WebGL2RenderingContext, texture, dx, dy, dw, dh, tint = defTint) {
    if (!texture.complete)
      return

    const program = this.imageProgram?.use()
    if (!program)
      return
    const vertices = this.arrays[0].float32
    const base = texture.base
    if (!base)
      return
    const sx = texture.x
    const sy = texture.y
    const sw = texture.width
    const sh = texture.height
    const tw = base.width
    const th = base.height

    // 计算变换矩阵
    const matrix = Matrix.instance.project(
      this.flip,
      this.width,
      this.height,
    ).multiply(this.matrix)

    // 计算顶点数据
    const dl = dx + 0.004
    const dt = dy + 0.004
    const dr = dl + dw
    const db = dt + dh
    const sl = sx / tw
    const st = sy / th
    const sr = (sx + sw) / tw
    const sb = (sy + sh) / th
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

    // 色调归一化
    const red = tint[0] / 255
    const green = tint[1] / 255
    const blue = tint[2] / 255
    const gray = tint[3] / 255

    // 绘制图像
    this.bindVertexArray(program.vao)
    this.uniformMatrix3fv(program.u_Matrix, false, matrix)
    this.uniform1i(program.u_LightMode, 0)
    this.uniform1i(program.u_ColorMode, 0)
    this.uniform4f(program.u_Tint, red, green, blue, gray)
    this.bufferData(this.ARRAY_BUFFER, vertices, this.STREAM_DRAW, 0, 16)
    this.bindTexture(this.TEXTURE_2D, base.glTexture)
    this.drawArrays(this.TRIANGLE_FAN, 0, 4)
  }
}()

// WebGL上下文方法 - 绘制切片图像
GL.drawSliceImage = function (texture, dx, dy, dw, dh, clip, border, tint) {
  if (!texture)
    return
  if (!texture.complete || !texture.base)
    return

  // 计算变换矩阵
  const matrix = Matrix.instance.project(
    this.flip,
    this.width,
    this.height,
  ).multiply(this.matrix)
  .translate(dx + 0.004, dy + 0.004)

  // 更新切片数据
  const {sliceClip} = texture
  if (texture.sliceWidth !== dw ||
    texture.sliceHeight !== dh ||
    sliceClip[0] !== clip[0] ||
    sliceClip[1] !== clip[1] ||
    sliceClip[2] !== clip[2] ||
    sliceClip[3] !== clip[3] ||
    texture.sliceBorder !== border) {
    texture.updateSliceData(dw, dh, clip, border)
  }

  // 计算颜色
  const red = tint[0] / 255
  const green = tint[1] / 255
  const blue = tint[2] / 255
  const gray = tint[3] / 255

  // 绘制图像
  const program = this.imageProgram?.use()
  if (!program)
    return
  const vertices = texture.sliceVertices
  const thresholds = texture.sliceThresholds
  const count = texture.sliceCount
  this.bindVertexArray(program.vao)
  this.uniformMatrix3fv(program.u_Matrix, false, matrix)
  this.uniform1i(program.u_LightMode, 0)
  this.uniform1i(program.u_ColorMode, 2)
  this.uniform4f(program.u_Tint, red, green, blue, gray)
  this.bufferData(this.ARRAY_BUFFER, vertices, this.STREAM_DRAW, 0, count * 16)
  this.bindTexture(this.TEXTURE_2D, texture.base.glTexture)

  // 绑定纹理并绘制图像
  for (let i = 0; i < count; i++) {
    const ti = i * 4
    const x = thresholds[ti]
    const y = thresholds[ti + 1]
    const w = thresholds[ti + 2]
    const h = thresholds[ti + 3]
    this.uniform4f(program.u_Repeat, x, y, w, h)
    this.drawArrays(this.TRIANGLE_FAN, i * 4, 4)
  }
}

// WebGL上下文方法 - 绘制文字
GL.drawText = function (texture, dx, dy, dw, dh, color) {
  if (!texture.complete)
    return
  const program = this.textProgram?.use()
  if (!program)
    return
  const vertices = this.arrays[0].float32
  const colors = this.arrays[0].uint32
  const base = texture.base
  if (!base)
    return
  const sx = texture.x
  const sy = texture.y
  const sw = texture.width
  const sh = texture.height
  const tw = base.width
  const th = base.height

  // 计算变换矩阵
  const matrix = Matrix.instance.project(
    this.flip,
    this.width,
    this.height,
  ).multiply(this.matrix)

  // 计算顶点数据
  const L = dx
  const T = dy
  const R = dx + dw
  const B = dy + dh
  const a = matrix[0]
  const b = matrix[1]
  const c = matrix[3]
  const d = matrix[4]
  const e = matrix[6]
  const f = matrix[7]
  const sl = sx / tw
  const st = sy / th
  const sr = (sx + sw) / tw
  const sb = (sy + sh) / th
  vertices[0] = a * L + c * T + e
  vertices[1] = b * L + d * T + f
  vertices[2] = sl
  vertices[3] = st
  colors  [4] = color
  vertices[5] = a * L + c * B + e
  vertices[6] = b * L + d * B + f
  vertices[7] = sl
  vertices[8] = sb
  colors  [9] = color
  vertices[10] = a * R + c * B + e
  vertices[11] = b * R + d * B + f
  vertices[12] = sr
  vertices[13] = sb
  colors  [14] = color
  vertices[15] = a * R + c * T + e
  vertices[16] = b * R + d * T + f
  vertices[17] = sr
  vertices[18] = st
  colors  [19] = color

  // 绘制图像
  this.bindVertexArray(program.vao)
  this.bufferData(this.ARRAY_BUFFER, vertices, this.STREAM_DRAW, 0, 20)
  this.bindTexture(this.TEXTURE_2D, base.glTexture)
  this.drawArrays(this.TRIANGLE_FAN, 0, 4)
}

// WebGL上下文方法 - 填充矩形
GL.fillRect = function (dx, dy, dw, dh, color) {
  const program = this.graphicProgram?.use()
  if (!program)
    return
  const vertices = this.arrays[0].float32
  const colors = this.arrays[0].uint32

  // 计算变换矩阵
  const matrix = Matrix.instance.project(
    this.flip,
    this.width,
    this.height,
  ).multiply(this.matrix)

  // 计算顶点数据
  const dl = dx
  const dt = dy
  const dr = dx + dw
  const db = dy + dh
  vertices[0] = dl
  vertices[1] = dt
  colors  [2] = color
  vertices[3] = dl
  vertices[4] = db
  colors  [5] = color
  vertices[6] = dr
  vertices[7] = db
  colors  [8] = color
  vertices[9] = dr
  vertices[10] = dt
  colors  [11] = color

  // 绘制图像
  this.bindVertexArray(program.vao)
  this.uniformMatrix3fv(program.u_Matrix, false, matrix)
  this.bufferData(this.ARRAY_BUFFER, vertices, this.STREAM_DRAW, 0, 12)
  this.drawArrays(this.TRIANGLE_FAN, 0, 4)
}

// WebGL上下文方法 - 创建2D上下文对象(绘制文字专用画布)
GL.createContext2D = function () {
  const canvas = document.createElement('canvas')
  canvas.width = 0
  canvas.height = 0
  const context = canvas.getContext('2d')

  if (context !== null) {
    // 扩展方法 - 调整画布大小
    context.resize = function (width: number, height: number) {
      if (canvas.width === width &&
        canvas.height === height) {
        canvas.width = width
      } else {
        if (canvas.width !== width) {
          canvas.width = width
        }
        if (canvas.height !== height) {
          canvas.height = height
        }
      }
    }
  }

  return context
}

// WebGL上下文方法 - 填充描边文字
GL.fillTextWithOutline = function IIFE() {
  const offsets = [
    {ox: -1, oy:  0, rgba: 0},
    {ox:  1, oy:  0, rgba: 0},
    {ox:  0, oy: -1, rgba: 0},
    {ox:  0, oy:  1, rgba: 0},
    {ox:  0, oy:  0, rgba: 0},
  ]
  return function (this: WebGL2RenderingContext, text, x, y, color, shadow) {
    const context = this.context2d
    if (!context)
      return
    const size = context.size
    const measureWidth = context.measureText(text).width
    x -= measureWidth / 2
    const padding = Math.ceil(size / 10)
    const left = Math.floor(x)
    const ox = x - left
    const oy = size * 0.85
    const height = size + padding
    const width = Math.min(16384, Math.ceil(
      measureWidth + context.paddingItalic + ox
    ))
    if (x + width > 0 && x < this.width &&
      y + height > 0 && y < this.height) {
      const font = context.font
      context.resize(width, height)
      context.font = font
      context.fillStyle = '#ffffff'
      context.fillText(text, ox, oy)
      offsets[0].rgba = shadow
      offsets[1].rgba = shadow
      offsets[2].rgba = shadow
      offsets[3].rgba = shadow
      offsets[4].rgba = color
      const program = this.textProgram?.use()
      if (!program)
        return
      const vertices = this.arrays[0].float32
      const colors = this.arrays[0].uint32
      const matrix = this.matrix.project(
        this.flip,
        this.width,
        this.height,
      )
      const a = matrix[0]
      const b = matrix[1]
      const c = matrix[3]
      const d = matrix[4]
      const e = matrix[6]
      const f = matrix[7]
      let vi = 0
      for (const {ox, oy, rgba} of offsets) {
        const L = left + ox
        const T = y + oy
        const R = L + width
        const B = T + height
        const dl = a * L + c * T + e
        const dt = b * L + d * T + f
        const dr = a * R + c * B + e
        const db = b * R + d * B + f
        vertices[vi    ] = dl
        vertices[vi + 1] = dt
        vertices[vi + 2] = 0
        vertices[vi + 3] = 0
        colors  [vi + 4] = rgba
        vertices[vi + 5] = dl
        vertices[vi + 6] = db
        vertices[vi + 7] = 0
        vertices[vi + 8] = 1
        colors  [vi + 9] = rgba
        vertices[vi + 10] = dr
        vertices[vi + 11] = db
        vertices[vi + 12] = 1
        vertices[vi + 13] = 1
        colors  [vi + 14] = rgba
        vertices[vi + 15] = dr
        vertices[vi + 16] = dt
        vertices[vi + 17] = 1
        vertices[vi + 18] = 0
        colors  [vi + 19] = rgba
        vi += 20
      }
      this.stencilTexture.fromImage(context.canvas)
      this.bindVertexArray(program.vao)
      this.bufferData(this.ARRAY_BUFFER, vertices, this.STREAM_DRAW, 0, vi)
      this.drawElements(this.TRIANGLES, 30, this.UNSIGNED_INT, 0)
    }
  }
}()

// WebGL上下文方法 - 创建普通纹理
GL.createNormalTexture = function (options = {}) {
  const magFilter = options.magFilter ?? this.NEAREST
  const minFilter = options.minFilter ?? this.LINEAR
  const texture = new BaseTexture()
  texture.magFilter = magFilter
  texture.minFilter = minFilter
  texture.format = options.format ?? GL.RGBA
  this.bindTexture(this.TEXTURE_2D, texture.glTexture)
  this.texParameteri(this.TEXTURE_2D, this.TEXTURE_MAG_FILTER, magFilter)
  this.texParameteri(this.TEXTURE_2D, this.TEXTURE_MIN_FILTER, minFilter)
  this.texParameteri(this.TEXTURE_2D, this.TEXTURE_WRAP_S, this.CLAMP_TO_EDGE)
  this.texParameteri(this.TEXTURE_2D, this.TEXTURE_WRAP_T, this.CLAMP_TO_EDGE)
  this.textureManager.append(texture)
  return texture
}

// WebGL上下文方法 - 创建图像纹理
GL.createImageTexture = function (image: HTMLImageElement, options = {}) {
  const magFilter = options.magFilter ?? this.NEAREST
  const minFilter = options.minFilter ?? this.LINEAR
  const guid = image instanceof Image ? image.guid : image
  if (!guid)
    return
  const manager = this.textureManager
  let texture = manager.images[guid]
  if (!texture) {
    texture = new BaseTexture()
    texture.guid = guid
    texture.image = null
    texture.refCount = 0
    texture.magFilter = magFilter
    texture.minFilter = minFilter
    manager.append(texture)
    manager.images[guid] = texture
    const initialize = (image: HTMLImageElement) => {
      if (manager.images[guid] === texture && image) {
        texture.image = image
        texture.width = image.naturalWidth
        texture.height = image.naturalHeight
        this.bindTexture(this.TEXTURE_2D, texture.glTexture)
        this.texParameteri(this.TEXTURE_2D, this.TEXTURE_MAG_FILTER, magFilter)
        this.texParameteri(this.TEXTURE_2D, this.TEXTURE_MIN_FILTER, minFilter)
        this.texParameteri(this.TEXTURE_2D, this.TEXTURE_WRAP_S, this.CLAMP_TO_EDGE)
        this.texParameteri(this.TEXTURE_2D, this.TEXTURE_WRAP_T, this.CLAMP_TO_EDGE)
        this.texImage2D(this.TEXTURE_2D, 0, this.RGBA, this.RGBA, this.UNSIGNED_BYTE, image)
        texture.reply('load')
      } else {
        texture.reply('error')
      }
    }
    image instanceof Image
    ? initialize(image)
    : File.get({
      guid: guid,
      type: 'image',
    }).then(initialize)
  }
  texture.refCount++
  return texture
}

// WebGL上下文方法 - 创建纹理帧缓冲对象
GL.createTextureFBO = function (texture) {
  const fbo = this.createFramebuffer()
  this.bindFramebuffer(this.FRAMEBUFFER, fbo)

  if (texture && texture.base) {
    // 绑定纹理到颜色缓冲区
    this.framebufferTexture2D(this.FRAMEBUFFER, this.COLOR_ATTACHMENT0, this.TEXTURE_2D, texture.base.glTexture, 0)

    // 创建深度模板缓冲区
    const depthStencilBuffer = this.createRenderbuffer()
    this.bindRenderbuffer(this.RENDERBUFFER, depthStencilBuffer)
    this.framebufferRenderbuffer(this.FRAMEBUFFER, this.DEPTH_STENCIL_ATTACHMENT, this.RENDERBUFFER, depthStencilBuffer)
    this.renderbufferStorage(this.RENDERBUFFER, this.DEPTH_STENCIL, texture.base.width, texture.base.height)
    this.bindRenderbuffer(this.RENDERBUFFER, null)
    this.bindFramebuffer(this.FRAMEBUFFER, null)
    texture.depthStencilBuffer = depthStencilBuffer

    // 重写纹理方法 - 调整大小
    texture.resize = (width: number, height: number): any => {
      Texture.prototype.resize.call(texture, width, height)

      // 调整深度模板缓冲区大小
      this.bindRenderbuffer(this.RENDERBUFFER, depthStencilBuffer)
      this.renderbufferStorage(this.RENDERBUFFER, this.DEPTH_STENCIL, width, height)
      this.bindRenderbuffer(this.RENDERBUFFER, null)
    }
  }

  // 还需要一个方法来恢复
  return fbo
}

// 初始化WebGL上下文
GL.initialize()

// ******************************** WebGL导出 ********************************

export {
  GL,
  GL_ext,
  WebGLRenderingContext_ext,
  CanvasRenderingContext2D_ext,
  WebGLProgram_ext,
  WebGLVertexArrayObject_ext
}
