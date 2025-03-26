'use strict'

/**
 * @type {WebGLRenderingContext}
 */
let GL
namespace: {
  // 创建画布元素
  const canvas = document.createElement('canvas')
  canvas.width = 0
  canvas.height = 0
  canvas.style.position = 'absolute'
  canvas.style.width = '100%'
  canvas.style.height = '100%'

  // 主题画布背景颜色
  const background = {
    light: {r: 0xc8, g: 0xc8, b: 0xc8},
    dark: {r: 0x20, g: 0x20, b: 0x20},
  }

  // 侦听主题改变事件
  window.on('themechange', function (event) {
    const {r, g, b} = background[event.value]
    GL.BACKGROUND_RED = r / 255
    GL.BACKGROUND_GREEN = g / 255
    GL.BACKGROUND_BLUE = b / 255
  })

  // 侦听WebGL上下文丢失事件
  canvas.on('webglcontextlost', function (event) {
    console.log('webglcontextlost')
    event.preventDefault()
    setTimeout(() => GL.WEBGL_lose_context.restoreContext())
  })

  // 侦听WebGL上下文恢复事件
  canvas.on('webglcontextrestored', function (event) {
    console.log('webglcontextrestored')
    GL.restore()
  })

  // WebGL上下文选项
  const options = {
    antialias: false,
    alpha: false,
    depth: true,
    stencil: false,
    premultipliedAlpha: false,
    preserveDrawingBuffer: false,
    desynchronized: true,
  }

  // 优先使用WebGL2(Win10 DirectX11)
  GL = canvas.getContext('webgl2', options)
  if (!GL) {
    // 回退到WebGL1(Win7 DirectX9以及旧移动设备)
    GL = canvas.getContext('webgl', options)

    // 获取元素索引 32 位无符号整数扩展
    const element_index_uint = GL.getExtension('OES_element_index_uint')

    // 获取顶点数组对象扩展
    const vertex_array_object = GL.getExtension('OES_vertex_array_object')
    GL.createVertexArray = vertex_array_object.createVertexArrayOES.bind(vertex_array_object)
    GL.deleteVertexArray = vertex_array_object.deleteVertexArrayOES.bind(vertex_array_object)
    GL.isVertexArray = vertex_array_object.isVertexArrayOES.bind(vertex_array_object)
    GL.bindVertexArray = vertex_array_object.bindVertexArrayOES.bind(vertex_array_object)

    // 获取最小和最大混合模式扩展
    const blend_minmax = GL.getExtension('EXT_blend_minmax')
    GL.MIN = blend_minmax.MIN_EXT
    GL.MAX = blend_minmax.MAX_EXT

    // 重写更新缓冲数据方法
    const prototype = WebGLRenderingContext.prototype
    prototype._bufferData = prototype.bufferData
    prototype.bufferData = function (target, data, usage, offset, length) {
      if (length !== undefined) {
        length *= data.BYTES_PER_ELEMENT
        data = new Uint8Array(data.buffer, offset, length)
      }
      return this._bufferData(target, data, usage)
    }
  }

  // 获取失去上下文扩展
  GL.WEBGL_lose_context = GL.getExtension('WEBGL_lose_context')
}

// ******************************** WebGL方法 ********************************

// WebGL上下文方法 - 恢复上下文
GL.restore = function () {
  const {ambient} = this
  this.textureManager.restore()
  this.initialize()
  this.setAmbientLight(ambient)
  this.updateLightTexSize()
}

// WebGL上下文方法 - 初始化
GL.initialize = function () {
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

  // 创建环境光对象
  this.ambient = {red: -1, green: -1, blue: -1}

  // 创建纹理管理器
  this.textureManager = this.textureManager ?? new TextureManager()

  // 最大纹理尺寸(PC: 16384, Mobile: 4096，超过会出错)
  // 如果需要兼容移动设备，使用4096x4096分辨率以内的图像文件
  this.maxTexSize = this.getParameter(this.MAX_TEXTURE_SIZE)

  // 设置最大纹理数量(通常是16)
  this.maxTexUnits = this.getParameter(this.MAX_TEXTURE_IMAGE_UNITS)

  // 创建反射光纹理
  this.reflectedLightMap = this.reflectedLightMap ?? new Texture({
    format: this.RGB,
    magFilter: this.LINEAR,
    minFilter: this.LINEAR,
  })
  this.reflectedLightMap.base.protected = true
  this.reflectedLightMap.fbo = this.createTextureFBO(this.reflectedLightMap)
  this.activeTexture(this.TEXTURE0 + this.maxTexUnits - 1)
  this.bindTexture(this.TEXTURE_2D, this.reflectedLightMap.base.glTexture)
  this.activeTexture(this.TEXTURE0)

  // 创建直射光纹理
  this.directLightMap = this.directLightMap ?? new Texture({
    format: this.RGB,
    magFilter: this.LINEAR,
    minFilter: this.LINEAR,
  })
  this.directLightMap.base.protected = true
  this.directLightMap.fbo = this.createTextureFBO(this.directLightMap)

  // 创建模板纹理
  this.stencilTexture = this.stencilTexture ?? new Texture({format: this.ALPHA})
  this.stencilTexture.base.protected = true

  // 创建遮罩纹理
  this.maskTexture = this.maskTexture ?? new Texture({format: this.RGBA})
  this.maskTexture.base.protected = true
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
        uint8: new Uint8Array(buffer2, 0, size * 12),
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
  this.imageProgram = this.createImageProgram()
  this.tileProgram = this.createTileProgram()
  this.textProgram = this.createTextProgram()
  this.spriteProgram = this.createSpriteProgram()
  this.particleProgram = this.createParticleProgram()
  this.lightProgram = this.createLightProgram()
  this.graphicProgram = this.createGraphicProgram()
  this.dashedLineProgram = this.createDashedLineProgram()
}

// WebGL上下文方法 - 创建程序对象
GL.createProgramWithShaders = function (vshader, fshader) {
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
GL.createImageProgram = function () {
  const program = this.createProgramWithShaders(
    `
    attribute   vec2        a_Position;
    attribute   vec2        a_TexCoord;
    uniform     float       u_Flip;
    uniform     mat3        u_Matrix;
    uniform     vec3        u_Ambient;
    uniform     int         u_LightMode;
    uniform     vec2        u_LightCoord;
    uniform     vec4        u_LightTexSize;
    uniform     sampler2D   u_LightSampler;
    varying     vec2        v_TexCoord;
    varying     vec3        v_LightColor;

    vec3 getLightColor() {
      if (u_LightMode == 0) {
        return vec3(1.0, 1.0, 1.0);
      }
      if (u_LightMode == 1) {
        return vec3(
          gl_Position.x / u_LightTexSize.x + u_LightTexSize.z,
          gl_Position.y / u_LightTexSize.y * u_Flip + u_LightTexSize.w,
          -1.0
        );
      }
      if (u_LightMode == 2) {
        vec2 anchorCoord = (u_Matrix * vec3(u_LightCoord, 1.0)).xy;
        vec2 lightCoord = vec2(
          anchorCoord.x / u_LightTexSize.x + u_LightTexSize.z,
          anchorCoord.y / u_LightTexSize.y * u_Flip + u_LightTexSize.w
        );
        return texture2D(u_LightSampler, lightCoord).rgb;
      }
      if (u_LightMode == 3) {
        return u_Ambient;
      }
    }

    void main() {
      gl_Position.xyw = u_Matrix * vec3(a_Position, 1.0);
      v_TexCoord = a_TexCoord;
      v_LightColor = getLightColor();
    }
    `,
    `
    precision   highp       float;
    varying     vec2        v_TexCoord;
    varying     vec3        v_LightColor;
    uniform     vec2        u_Viewport;
    uniform     int         u_Masking;
    uniform     float       u_Alpha;
    uniform     int         u_ColorMode;
    uniform     vec4        u_Color;
    uniform     vec4        u_Tint;
    uniform     vec4        u_Repeat;
    uniform     sampler2D   u_Sampler;
    uniform     sampler2D   u_MaskSampler;
    uniform     sampler2D   u_LightSampler;

    vec3 getLightColor() {
      if (v_LightColor.z != -1.0) return v_LightColor;
      return texture2D(u_LightSampler, v_LightColor.xy).rgb;
    }

    void main() {
      if (u_ColorMode == 0) {
        gl_FragColor = texture2D(u_Sampler, fract(v_TexCoord));
        if (gl_FragColor.a == 0.0) discard;
        gl_FragColor.rgb = gl_FragColor.rgb * (1.0 - u_Tint.a) + u_Tint.rgb +
        dot(gl_FragColor.rgb, vec3(0.299, 0.587, 0.114)) * u_Tint.a;
      } else if (u_ColorMode == 1) {
        float alpha = texture2D(u_Sampler, v_TexCoord).a;
        if (alpha == 0.0) discard;
        gl_FragColor = vec4(u_Color.rgb, u_Color.a * alpha);
      } else if (u_ColorMode == 2) {
        vec2 uv = vec2(
          mod(v_TexCoord.x - u_Repeat.x, u_Repeat.z) + u_Repeat.x,
          mod(v_TexCoord.y - u_Repeat.y, u_Repeat.w) + u_Repeat.y
        );
        gl_FragColor = texture2D(u_Sampler, uv);
        if (gl_FragColor.a == 0.0) discard;
        gl_FragColor.rgb = gl_FragColor.rgb * (1.0 - u_Tint.a) + u_Tint.rgb +
        dot(gl_FragColor.rgb, vec3(0.299, 0.587, 0.114)) * u_Tint.a;
      }
      gl_FragColor.rgb *= getLightColor();
      gl_FragColor.a *= u_Alpha;
      if (u_Masking == 1) {
        vec2 fragCoord = vec2(gl_FragCoord.x, (u_Viewport.y - gl_FragCoord.y));
        gl_FragColor.a *= texture2D(u_MaskSampler, fragCoord / u_Viewport).a;
      }
    }
    `,
  )
  this.useProgram(program)

  // 顶点着色器属性
  const a_Position = this.getAttribLocation(program, 'a_Position')
  const a_TexCoord = this.getAttribLocation(program, 'a_TexCoord')
  const u_Flip = this.getUniformLocation(program, 'u_Flip')
  const u_Matrix = this.getUniformLocation(program, 'u_Matrix')
  const u_Ambient = this.getUniformLocation(program, 'u_Ambient')
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
  return program
}

// WebGL上下文方法 - 创建图块程序
GL.createTileProgram = function () {
  const program = this.createProgramWithShaders(
    `
    attribute   vec2        a_Position;
    attribute   vec2        a_TexCoord;
    attribute   float       a_TexIndex;
    uniform     float       u_Flip;
    uniform     mat3        u_Matrix;
    uniform     vec3        u_Ambient;
    uniform     int         u_LightMode;
    uniform     vec4        u_LightTexSize;
    uniform     sampler2D   u_LightSampler;
    varying     float       v_TexIndex;
    varying     vec2        v_TexCoord;
    varying     vec3        v_LightColor;

    vec3 getLightColor() {
      if (u_LightMode == 0) {
        return vec3(1.0, 1.0, 1.0);
      }
      if (u_LightMode == 1) {
        return vec3(
          gl_Position.x / u_LightTexSize.x + u_LightTexSize.z,
          gl_Position.y / u_LightTexSize.y * u_Flip + u_LightTexSize.w,
          -1.0
        );
      }
      if (u_LightMode == 2) {
        return u_Ambient;
      }
    }

    void main() {
      gl_Position.xyw = u_Matrix * vec3(a_Position, 1.0);
      v_TexCoord = a_TexCoord;
      v_TexIndex = a_TexIndex;
      v_LightColor = getLightColor();
    }
    `,
    `
    precision   highp       float;
    varying     float       v_TexIndex;
    varying     vec2        v_TexCoord;
    varying     vec3        v_LightColor;
    uniform     float       u_Alpha;
    uniform     int         u_TintMode;
    uniform     vec4        u_Tint;
    uniform     sampler2D   u_Samplers[15];
    uniform     sampler2D   u_LightSampler;

    vec4 sampler(int index, vec2 uv) {
      for (int i = 0; i < 15; i++) {
        if (i == index) {
          return texture2D(u_Samplers[i], uv);
        }
      }
    }

    vec3 getLightColor() {
      if (v_LightColor.z != -1.0) return v_LightColor;
      return texture2D(u_LightSampler, v_LightColor.xy).rgb;
    }

    void main() {
      gl_FragColor = sampler(int(v_TexIndex), v_TexCoord);
      if (gl_FragColor.a == 0.0) {
        discard;
      }
      if (u_TintMode == 1) {
        gl_FragColor.rgb = gl_FragColor.rgb * (1.0 - u_Tint.a) + u_Tint.rgb +
        dot(gl_FragColor.rgb, vec3(0.299, 0.587, 0.114)) * u_Tint.a;
      }
      gl_FragColor.rgb *= getLightColor();
      gl_FragColor.a *= u_Alpha;
    }
    `,
  )
  this.useProgram(program)

  // 顶点着色器属性
  const a_Position = this.getAttribLocation(program, 'a_Position')
  const a_TexCoord = this.getAttribLocation(program, 'a_TexCoord')
  const a_TexIndex = this.getAttribLocation(program, 'a_TexIndex')
  const u_Flip = this.getUniformLocation(program, 'u_Flip')
  const u_Matrix = this.getUniformLocation(program, 'u_Matrix')
  const u_Ambient = this.getUniformLocation(program, 'u_Ambient')
  const u_LightMode = this.getUniformLocation(program, 'u_LightMode')
  const u_LightTexSize = this.getUniformLocation(program, 'u_LightTexSize')
  this.uniform1i(this.getUniformLocation(program, 'u_LightSampler'), this.maxTexUnits - 1)

  // 片元着色器属性
  const u_Alpha = this.getUniformLocation(program, 'u_Alpha')
  const u_TintMode = this.getUniformLocation(program, 'u_TintMode')
  const u_Tint = this.getUniformLocation(program, 'u_Tint')
  const u_SamplerLength = this.maxTexUnits - 1
  const u_Samplers = []
  for (let i = 0; i < u_SamplerLength; i++) {
    u_Samplers.push(this.getUniformLocation(program, `u_Samplers[${i}]`))
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
  program.u_LightMode = u_LightMode
  program.u_LightTexSize = u_LightTexSize
  program.u_TintMode = u_TintMode
  program.u_Tint = u_Tint
  program.u_Samplers = u_Samplers
  return program
}

// WebGL上下文方法 - 创建文字程序
GL.createTextProgram = function () {
  const program = this.createProgramWithShaders(
    `
    attribute   vec2        a_Position;
    attribute   vec2        a_TexCoord;
    attribute   vec4        a_TextColor;
    varying     vec2        v_TexCoord;
    varying     vec4        v_TextColor;

    void main() {
      gl_Position.xyw = vec3(a_Position, 1.0);
      v_TexCoord = a_TexCoord;
      v_TextColor = a_TextColor;
    }
    `,
    `
    precision   highp       float;
    varying     vec2        v_TexCoord;
    varying     vec4        v_TextColor;
    uniform     float       u_Alpha;
    uniform     sampler2D   u_Sampler;

    void main() {
      float texAlpha = texture2D(u_Sampler, v_TexCoord).a;
      if (texAlpha == 0.0) {
        discard;
      }
      gl_FragColor.rgb = v_TextColor.rgb;
      gl_FragColor.a = v_TextColor.a * texAlpha * u_Alpha;
    }
    `,
  )
  this.useProgram(program)

  // 顶点着色器属性
  const a_Position = this.getAttribLocation(program, 'a_Position')
  const a_TexCoord = this.getAttribLocation(program, 'a_TexCoord')
  const a_TextColor = this.getAttribLocation(program, 'a_TextColor')

  // 片元着色器属性
  const u_Alpha = this.getUniformLocation(program, 'u_Alpha')

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
  return program
}

// WebGL上下文方法 - 创建精灵程序
GL.createSpriteProgram = function () {
  const program = this.createProgramWithShaders(
    `
    attribute   vec2        a_Position;
    attribute   vec2        a_TexCoord;
    attribute   vec3        a_TexParam;
    attribute   vec4        a_Tint;
    attribute   vec2        a_LightCoord;
    uniform     float       u_Flip;
    uniform     mat3        u_Matrix;
    uniform     vec4        u_LightTexSize;
    uniform     sampler2D   u_LightSampler;
    varying     float       v_TexIndex;
    varying     float       v_Opacity;
    varying     vec4        v_Tint;
    varying     vec2        v_TexCoord;
    varying     vec3        v_LightColor;

    vec3 getLightColor() {
      if (a_TexParam.z == 0.0) {
        return vec3(1.0, 1.0, 1.0);
      }
      if (a_TexParam.z == 1.0) {
        return vec3(
          gl_Position.x / u_LightTexSize.x + u_LightTexSize.z,
          gl_Position.y / u_LightTexSize.y * u_Flip + u_LightTexSize.w,
          -1.0
        );
      }
      if (a_TexParam.z == 2.0) {
        return texture2D(u_LightSampler, a_LightCoord).rgb;
      }
    }

    void main() {
      gl_Position.xyw = u_Matrix * vec3(a_Position, 1.0);
      v_TexIndex = a_TexParam.x;
      v_Opacity = a_TexParam.y / 255.0;
      v_Tint = a_Tint / 255.0 - 1.0;
      v_TexCoord = a_TexCoord;
      v_LightColor = getLightColor();
    }
    `,
    `
    precision   highp       float;
    varying     float       v_TexIndex;
    varying     float       v_Opacity;
    varying     vec4        v_Tint;
    varying     vec2        v_TexCoord;
    varying     vec3        v_LightColor;
    uniform     float       u_Alpha;
    uniform     vec4        u_Tint;
    uniform     sampler2D   u_Samplers[15];
    uniform     sampler2D   u_LightSampler;

    vec4 sampler(int index, vec2 uv) {
      for (int i = 0; i < 15; i++) {
        if (i == index) {
          return texture2D(u_Samplers[i], uv);
        }
      }
    }

    vec3 tint(vec3 color, vec4 tint) {
      return color.rgb * (1.0 - tint.a) + tint.rgb +
      dot(color.rgb, vec3(0.299, 0.587, 0.114)) * tint.a;
    }

    vec3 getLightColor() {
      if (v_LightColor.z != -1.0) return v_LightColor;
      return texture2D(u_LightSampler, v_LightColor.xy).rgb;
    }

    void main() {
      gl_FragColor = sampler(int(v_TexIndex), v_TexCoord);
      if (gl_FragColor.a == 0.0) {
        discard;
      }
      gl_FragColor.rgb = tint(tint(gl_FragColor.rgb, v_Tint), u_Tint) * getLightColor();
      gl_FragColor.a *= v_Opacity * u_Alpha;
    }
    `,
  )
  this.useProgram(program)

  // 顶点着色器属性
  const a_Position = this.getAttribLocation(program, 'a_Position')
  const a_TexCoord = this.getAttribLocation(program, 'a_TexCoord')
  const a_TexParam = this.getAttribLocation(program, 'a_TexParam')
  const a_Tint = this.getAttribLocation(program, 'a_Tint')
  const a_LightCoord = this.getAttribLocation(program, 'a_LightCoord')
  const u_Flip = this.getUniformLocation(program, 'u_Flip')
  const u_Matrix = this.getUniformLocation(program, 'u_Matrix')
  const u_LightTexSize = this.getUniformLocation(program, 'u_LightTexSize')
  this.uniform1i(this.getUniformLocation(program, 'u_LightSampler'), this.maxTexUnits - 1)

  // 片元着色器属性
  const u_Alpha = this.getUniformLocation(program, 'u_Alpha')
  const u_Tint = this.getUniformLocation(program, 'u_Tint')
  const u_SamplerLength = this.maxTexUnits - 1
  const u_Samplers = []
  for (let i = 0; i < u_SamplerLength; i++) {
    u_Samplers.push(this.getUniformLocation(program, `u_Samplers[${i}]`))
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
  program.u_LightTexSize = u_LightTexSize
  program.u_Tint = u_Tint
  program.u_Samplers = u_Samplers
  return program
}

// WebGL上下文方法 - 创建粒子程序
GL.createParticleProgram = function () {
  const program = this.createProgramWithShaders(
    `
    attribute   vec2        a_Position;
    attribute   vec2        a_TexCoord;
    attribute   vec4        a_Color;
    uniform     float       u_Flip;
    uniform     mat3        u_Matrix;
    uniform     vec3        u_Ambient;
    uniform     int         u_LightMode;
    uniform     vec4        u_LightTexSize;
    uniform     sampler2D   u_LightSampler;
    varying     vec2        v_TexCoord;
    varying     vec4        v_Color;
    varying     vec3        v_LightColor;

    vec3 getLightColor() {
      if (u_LightMode == 0) {
        return vec3(1.0, 1.0, 1.0);
      }
      if (u_LightMode == 1) {
        return vec3(
          gl_Position.x / u_LightTexSize.x + u_LightTexSize.z,
          gl_Position.y / u_LightTexSize.y * u_Flip + u_LightTexSize.w,
          -1.0
        );
      }
      if (u_LightMode == 2) {
        return u_Ambient;
      }
    }

    void main() {
      gl_Position.xyw = u_Matrix * vec3(a_Position, 1.0);
      v_TexCoord = a_TexCoord;
      v_Color = a_Color;
      v_LightColor = getLightColor();
    }
    `,
    `
    precision   highp       float;
    varying     vec2        v_TexCoord;
    varying     vec4        v_Color;
    varying     vec3        v_LightColor;
    uniform     float       u_Alpha;
    uniform     int         u_Mode;
    uniform     vec4        u_Tint;
    uniform     sampler2D   u_Sampler;
    uniform     sampler2D   u_LightSampler;

    vec3 getLightColor() {
      if (v_LightColor.z != -1.0) return v_LightColor;
      return texture2D(u_LightSampler, v_LightColor.xy).rgb;
    }

    void main() {
      if (u_Mode == 0) {
        float alpha = texture2D(u_Sampler, v_TexCoord).a;
        gl_FragColor.a = alpha * v_Color.a * u_Alpha;
        if (gl_FragColor.a == 0.0) {
          discard;
        }
        gl_FragColor.rgb = v_Color.rgb;
      } else if (u_Mode == 1) {
        gl_FragColor = texture2D(u_Sampler, v_TexCoord);
        gl_FragColor.a *= v_Color.a * u_Alpha;
        if (gl_FragColor.a == 0.0) {
          discard;
        }
        gl_FragColor.rgb = gl_FragColor.rgb * (1.0 - u_Tint.a) + u_Tint.rgb +
        dot(gl_FragColor.rgb, vec3(0.299, 0.587, 0.114)) * u_Tint.a;
      }
      gl_FragColor.rgb *= getLightColor();
    }
    `,
  )
  this.useProgram(program)

  // 顶点着色器属性
  const a_Position = this.getAttribLocation(program, 'a_Position')
  const a_TexCoord = this.getAttribLocation(program, 'a_TexCoord')
  const u_Flip = this.getUniformLocation(program, 'u_Flip')
  const a_Color = this.getAttribLocation(program, 'a_Color')
  const u_Matrix = this.getUniformLocation(program, 'u_Matrix')
  const u_Ambient = this.getUniformLocation(program, 'u_Ambient')
  const u_LightMode = this.getUniformLocation(program, 'u_LightMode')
  const u_LightTexSize = this.getUniformLocation(program, 'u_LightTexSize')
  this.uniform1i(this.getUniformLocation(program, 'u_LightSampler'), this.maxTexUnits - 1)

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
    if (program.flip !== this.flip) {
      program.flip = this.flip
      this.uniform1f(u_Flip, program.flip)
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
  program.u_Ambient = u_Ambient
  program.u_LightMode = u_LightMode
  program.u_LightTexSize = u_LightTexSize
  program.u_Mode = u_Mode
  program.u_Tint = u_Tint
  return program
}

// WebGL上下文方法 - 创建光源程序
GL.createLightProgram = function () {
  const program = this.createProgramWithShaders(
    `
    attribute   vec2        a_Position;
    attribute   vec2        a_LightCoord;
    uniform     mat3        u_Matrix;
    varying     vec2        v_LightCoord;

    void main() {
      gl_Position.xyw = u_Matrix * vec3(a_Position, 1.0);
      v_LightCoord = a_LightCoord;
    }
    `,
    `
    precision   highp       float;
    const       float       PI = 3.1415926536;
    varying     vec2        v_LightCoord;
    uniform     int         u_LightMode;
    uniform     vec4        u_LightColor;
    uniform     sampler2D   u_LightSampler;

    vec3 getLightColor() {
      if (u_LightMode == 0) {
        float dist = length(vec2(
          (v_LightCoord.x - 0.5),
          (v_LightCoord.y - 0.5)
        ));
        if (dist > 0.5) {
          discard;
        }
        float angle = dist * PI;
        float factor = mix(1.0 - sin(angle), cos(angle), u_LightColor.a);
        return u_LightColor.rgb * factor;
      }
      if (u_LightMode == 1) {
        vec4 lightColor = texture2D(u_LightSampler, v_LightCoord);
        if (lightColor.a == 0.0) {
          discard;
        }
        return u_LightColor.rgb * lightColor.rgb * lightColor.a;
      }
      if (u_LightMode == 2) {
        return u_LightColor.rgb;
      }
    }

    void main() {
      gl_FragColor = vec4(getLightColor(), 1.0);
    }
    `,
  )
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
  return program
}

// WebGL上下文方法 - 创建图形程序
GL.createGraphicProgram = function () {
  const program = this.createProgramWithShaders(
    `
    attribute   vec2        a_Position;
    attribute   vec4        a_Color;
    uniform     mat3        u_Matrix;
    varying     vec4        v_Color;

    void main() {
      gl_Position.xyw = u_Matrix * vec3(a_Position, 1.0);
      v_Color = a_Color;
    }
    `,
    `
    precision   highp       float;
    varying     vec4        v_Color;
    uniform     float       u_Alpha;

    void main() {
      gl_FragColor.rgb = v_Color.rgb;
      gl_FragColor.a = v_Color.a * u_Alpha;
    }
    `,
  )
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
  // 注意：未启用的属性不能初始化赋值一次
  // 因为：gl.vertexAttrib1f方法会影响到其他program
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
  return program
}

// WebGL上下文方法 - 创建虚线程序
GL.createDashedLineProgram = function () {
  const program = this.createProgramWithShaders(
    `
    attribute   vec2        a_Position;
    attribute   float       a_Distance;
    uniform     mat3        u_Matrix;
    varying     float       v_Distance;

    void main() {
      gl_Position.xyw = u_Matrix * vec3(a_Position, 1.0);
      v_Distance = a_Distance;
    }
    `,
    `
    precision   highp       float;
    const       float       REPEAT = 4.0;
    varying     float       v_Distance;
    uniform     float       u_Alpha;
    uniform     vec4        u_Color;

    void main() {
      float alpha = floor(2.0 * fract(v_Distance / REPEAT));
      gl_FragColor.rgb = u_Color.rgb;
      gl_FragColor.a = u_Color.a * alpha * u_Alpha;
    }
    `,
  )
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
  if (this.program.masking !== this.masking) {
    this.program.masking = this.masking
    if (this.masking) {
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

// WebGL上下文方法 - 创建混合模式更新器
GL.createBlendingUpdater = function () {
  // 开启混合功能
  this.enable(this.BLEND)

  // 更新器映射表(启用混合时)
  const A = {
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
  const B = {
    normal: resume,
    screen: resume,
    additive: resume,
    subtract: resume,
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
      this.particleProgram,
    ]) {
      this.useProgram(program)
      this.uniform3f(program.u_Ambient, r, g, b)
    }
    this.useProgram(program)
  }
}

// WebGL上下文方法 - 调整光影纹理
GL.resizeLightMap = function () {
  const width = this.width
  const height = this.height
  const texture = this.reflectedLightMap
  if (texture.innerWidth !== width ||
    texture.innerHeight !== height) {
    texture.innerWidth = width
    texture.innerHeight = height
    if (texture.paddingLeft === undefined) {
      const {lightArea} = Data.config
      // 计算光影纹理最大扩张值(4倍)
      // 避免频繁调整纹理尺寸
      texture.paddingLeft = Math.min(lightArea.expansionLeft * 4, 1024)
      texture.paddingTop = Math.min(lightArea.expansionTop * 4, 1024)
      texture.paddingRight = Math.min(lightArea.expansionRight * 4, 1024)
      texture.paddingBottom = Math.min(lightArea.expansionBottom * 4, 1024)
    }
    const pl = texture.paddingLeft
    const pt = texture.paddingTop
    const pr = texture.paddingRight
    const pb = texture.paddingBottom
    const tWidth = width + pl + pr
    const tHeight = height + pt + pb
    texture.scaleX = 0
    texture.scaleY = 0
    texture.resize(tWidth, tHeight)
    this.bindTexture(this.TEXTURE_2D, null)
    this.updateLightTexSize()
  }
}

// WebGL上下文方法 - 更新光照纹理大小
GL.updateLightTexSize = function () {
  const texture = this.reflectedLightMap
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
    this.particleProgram,
  ]) {
    this.useProgram(program)
    this.uniform4f(program.u_LightTexSize, sizeX, sizeY, centerX, centerY)
  }
  this.useProgram(program)
}

// WebGL上下文方法 - 更新采样器数量
// 避免chrome 69未绑定纹理警告
GL.updateSamplerNum = function (samplerNum) {
  const program = this.program
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
    this.directLightMap.resize(width, height)
  }
}

// WebGL上下文方法 - 绘制图像
GL.drawImage = function drawImage() {
const defTint = new Uint8Array(4)
return function (texture, dx, dy, dw, dh, tint = defTint) {
  if (!texture.complete) return

  const program = this.imageProgram.use()
  const vertices = this.arrays[0].float32
  const base = texture.base
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

// WebGL上下文方法 - 绘制指定颜色的图像
GL.drawImageWithColor = function (texture, dx, dy, dw, dh, color) {
  if (!texture.complete) return

  const program = this.imageProgram.use()
  const vertices = this.arrays[0].float32
  const base = texture.base
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
  const red = (color & 0xff) / 255
  const green = (color >> 8 & 0xff) / 255
  const blue = (color >> 16 & 0xff) / 255
  const gray = (color >> 24 & 0xff) / 255

  // 绘制图像
  this.bindVertexArray(program.vao)
  this.uniformMatrix3fv(program.u_Matrix, false, matrix)
  this.uniform1i(program.u_LightMode, 0)
  this.uniform1i(program.u_ColorMode, 1)
  this.uniform4f(program.u_Color, red, green, blue, gray)
  this.bufferData(this.ARRAY_BUFFER, vertices, this.STREAM_DRAW, 0, 16)
  this.bindTexture(this.TEXTURE_2D, base.glTexture)
  this.drawArrays(this.TRIANGLE_FAN, 0, 4)
}

// WebGL上下文方法 - 绘制切片图像
GL.drawSliceImage = function (texture, dx, dy, dw, dh, clip, border, tint) {
  if (!texture.complete) return

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
  const program = this.imageProgram.use()
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

// WebGL上下文方法 - 填充矩形
GL.fillRect = function (dx, dy, dw, dh, color) {
  const program = this.graphicProgram.use()
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
  return canvas.getContext('2d')
}

// WebGL上下文方法 - 填充描边文字
GL.fillTextWithOutline = function fillTextWithOutline() {
  const offsets = [
    {ox: -1, oy:  0, rgba: 0},
    {ox:  1, oy:  0, rgba: 0},
    {ox:  0, oy: -1, rgba: 0},
    {ox:  0, oy:  1, rgba: 0},
    {ox:  0, oy:  0, rgba: 0},
  ]
  return function (text, x, y, color, shadow) {
    const context = this.context2d
    const size = context.size
    const measureWidth = context.measureText(text).width
    x -= measureWidth / 2
    const padding = Math.ceil(size / 10)
    const left = Math.floor(x)
    const ox = x - left
    const oy = size * 0.85
    const height = size + padding
    const width = Math.min(this.maxTexSize, Math.ceil(measureWidth + ox))
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
      const program = this.textProgram.use()
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
GL.createImageTexture = function (image, options = {}) {
  const magFilter = options.magFilter ?? this.NEAREST
  const minFilter = options.minFilter ?? this.LINEAR
  const guid = image instanceof Image ? image.guid : image
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
    const initialize = image => {
      if (manager.images[guid] === texture && image) {
        texture.image = image
        texture.width = Math.min(image.naturalWidth, this.maxTexSize)
        texture.height = Math.min(image.naturalHeight, this.maxTexSize)
        this.bindTexture(this.TEXTURE_2D, texture.glTexture)
        this.texParameteri(this.TEXTURE_2D, this.TEXTURE_MAG_FILTER, magFilter)
        this.texParameteri(this.TEXTURE_2D, this.TEXTURE_MIN_FILTER, minFilter)
        this.texParameteri(this.TEXTURE_2D, this.TEXTURE_WRAP_S, this.CLAMP_TO_EDGE)
        this.texParameteri(this.TEXTURE_2D, this.TEXTURE_WRAP_T, this.CLAMP_TO_EDGE)
        this.texImage2D(this.TEXTURE_2D, 0, this.RGBA, texture.width, texture.height, 0, this.RGBA, this.UNSIGNED_BYTE, image)
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
  texture.resize = (width, height) => {
    Texture.prototype.resize.call(texture, width, height)

    // 调整深度模板缓冲区大小
    this.bindRenderbuffer(this.RENDERBUFFER, depthStencilBuffer)
    this.renderbufferStorage(this.RENDERBUFFER, this.DEPTH_STENCIL, width, height)
    this.bindRenderbuffer(this.RENDERBUFFER, null)
  }
  // 还需要一个方法来恢复
  return fbo
}

// 扩展方法 - 调整画布大小
CanvasRenderingContext2D.prototype.resize = function (width, height) {
  const canvas = this.canvas
  if (canvas.width === width &&
    canvas.height === height) {
    // 宽高不变时重置画布
    canvas.width = width
  } else {
    // 尽量少的画布缓冲区重置次数
    if (canvas.width !== width) {
      canvas.width = width
    }
    if (canvas.height !== height) {
      canvas.height = height
    }
  }
}

// ******************************** 基础纹理类 ********************************

class BaseTexture {
  constructor() {
    this.glTexture = GL.createTexture()
    this.width = 0
    this.height = 0
    this.format = GL.RGBA
  }

  // 恢复普通纹理
  restoreNormalTexture() {
    this.glTexture = GL.createTexture()
    const {format, width, height} = this
    GL.bindTexture(GL.TEXTURE_2D, this.glTexture)
    GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MAG_FILTER, this.magFilter)
    GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, this.minFilter)
    GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_S, GL.CLAMP_TO_EDGE)
    GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_T, GL.CLAMP_TO_EDGE)
    GL.texImage2D(GL.TEXTURE_2D, 0, format, width, height, 0, format, GL.UNSIGNED_BYTE, null)
  }

  // 恢复图像纹理
  restoreImageTexture() {
    this.glTexture = GL.createTexture()
    const {width, height} = this
    GL.bindTexture(GL.TEXTURE_2D, this.glTexture)
    GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MAG_FILTER, this.magFilter)
    GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, this.minFilter)
    GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_S, GL.CLAMP_TO_EDGE)
    GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_T, GL.CLAMP_TO_EDGE)
    GL.texImage2D(GL.TEXTURE_2D, 0, GL.RGBA, width, height, 0, GL.RGBA, GL.UNSIGNED_BYTE, this.image)
  }

  /**
   * 基础纹理方法 - 设置加载回调
   * @param {string} type 回调事件类型
   * @param {function} callback 回调函数
   */
  on(type, callback) {
    // 如果已加载完成，立即执行回调
    let cache = this[BaseTexture.CALLBACK]
    if (cache === type) {
      callback(this)
      return
    }
    // 首次调用，创建加载回调缓存
    if (cache === undefined) {
      cache = this[BaseTexture.CALLBACK] =
      {load: [], error: []}
    }
    // 如果未加载完成，添加回调到缓存中
    if (typeof cache === 'object') {
      cache[type].push(callback)
    }
  }

  /**
   * 基础纹理方法 - 执行加载回调
   * @param {string} type 回调事件类型
   */
  reply(type) {
    const cache = this[BaseTexture.CALLBACK]
    if (typeof cache === 'object') {
      // 调用所有的纹理加载回调
      for (const callback of cache[type]) {
        callback(this)
      }
    }
    // 将缓存替换为类型名称
    this[BaseTexture.CALLBACK] = type
  }

  static CALLBACK = Symbol('LOAD_CALLBACK')
}

// ******************************** 纹理类 ********************************

class Texture {
  complete  //:boolean
  base      //:object
  gl        //:object
  x         //:number
  y         //:number
  width     //:number
  height    //:number

  constructor(options = {}) {
    if (new.target !== Texture) {
      return
    }

    // 设置属性
    this.complete = true
    this.base = GL.createNormalTexture(options)
    this.gl = GL
    this.x = 0
    this.y = 0
    this.width = 0
    this.height = 0
  }

  // 裁剪
  clip(x, y, width, height) {
    this.x = x
    this.y = y
    this.width = width
    this.height = height
    return this
  }

  // 擦除
  clear(red = 0, green = 0, blue = 0, alpha = 0) {
    const gl = this.gl
    gl.bindFBO(gl.frameBuffer)
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.base.glTexture, 0)
    gl.clearColor(red, green, blue, alpha)
    gl.clear(gl.COLOR_BUFFER_BIT)
    gl.unbindFBO()
  }

  // 调整大小
  resize(width, height) {
    const {gl, base} = this
    const {format} = base
    base.width = Math.min(width, gl.maxTexSize)
    base.height = Math.min(height, gl.maxTexSize)
    gl.bindTexture(gl.TEXTURE_2D, base.glTexture)
    gl.texImage2D(gl.TEXTURE_2D, 0, format, base.width, base.height, 0, format, gl.UNSIGNED_BYTE, null)
    return this.clip(0, 0, base.width, base.height)
  }

  // 从图像中取样
  fromImage(image) {
    // 上传空图像会被Chromium警告
    if (image.width === 0 && image.height === 0) {
      return this.resize(0, 0)
    }
    const gl = this.gl
    const base = this.base
    const format = base.format
    base.image = image
    base.width = Math.min(image.width, gl.maxTexSize)
    base.height = Math.min(image.height, gl.maxTexSize)
    gl.bindTexture(gl.TEXTURE_2D, base.glTexture)
    gl.texImage2D(gl.TEXTURE_2D, 0, format, base.width, base.height, 0, format, gl.UNSIGNED_BYTE, image)
    return this.clip(0, 0, base.width, base.height)
  }

  // 获取图像数据
  getImageData(x, y, width, height) {
    const gl = this.gl
    const base = this.base
    if (base instanceof WebGLTexture) {
      const imageData = gl.context2d.createImageData(width, height)
      const {buffer, length} = imageData.data
      const uint8 = new Uint8Array(buffer, 0, length)
      gl.bindFramebuffer(gl.FRAMEBUFFER, gl.frameBuffer)
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, base.glTexture, 0)
      gl.readPixels(x, y, width, height, gl.RGBA, gl.UNSIGNED_BYTE, uint8)
      gl.binding ? gl.bindFBO(gl.binding) : gl.unbindFBO()
      return imageData
    }
    return null
  }

  // 查看纹理 - 调试用
  // view() {
  //   if (!this.viewer) {
  //     this.viewer = new Image()
  //     this.viewer.style.position = 'fixed'
  //     this.viewer.style.background = 'var(--grid-background)'
  //     document.body.appendChild(this.viewer)
  //   }
  //   const {x, y, width, height} = this
  //   if (width > 0 && height > 0) {
  //     const imageData = this.getImageData(x, y, width, height)
  //     const canvas = document.createElement('canvas')
  //     canvas.width = width
  //     canvas.height = height
  //     const context = canvas.getContext('2d')
  //     context.putImageData(imageData, 0, 0)
  //     this.viewer.src = canvas.toDataURL()
  //   } else {
  //     this.viewer.src = ''
  //   }
  // }

  // 销毁
  destroy() {
    if (this.base) {
      this.complete = false
      this.gl.textureManager.delete(this.base)
      this.base = null
    }
  }
}

// ******************************** 图像纹理类 ********************************

class ImageTexture extends Texture {
  constructor(image, options = {}) {
    super(options)

    // 设置属性
    const texture = GL.createImageTexture(image, options)
    this.complete = false
    this.base = texture
    this.gl = GL
    this.x = 0
    this.y = 0
    this.width = 0
    this.height = 0

    // 设置异步加载回调
    texture.on('load', () => {
      if (this.base === texture) {
        this.complete = true
        this.width = this.width || texture.width
        this.height = this.height || texture.height
        this.reply('load')
      }
    })
    texture.on('error', () => {
      this.destroy()
      this.reply('error')
    })
  }

  // 更新切片数据
  updateSliceData(width, height, clip, border) {
    if (!this.complete) return
    const {min, max} = Math
    const [cx, cy, cw, ch] = clip
    const B = min(border, cw / 2, ch / 2)
    const W = max(cw - B * 2, 0)
    const H = max(ch - B * 2, 0)
    const w = max(width - B * 2, 0)
    const h = max(height - B * 2, 0)
    let l, r, t, b
    if (w > 0) {
      l = B
      r = B
    } else {
      l = min(B, width)
      r = width - l
    }
    if (h > 0) {
      t = B
      b = B
    } else {
      t = min(B, height)
      b = height - t
    }

    if (!this.sliceClip) {
      // 首次调用时创建相关数组
      this.sliceClip = new Uint32Array(4)
      this.sliceVertices = new Float32Array(9 * 16)
      this.sliceThresholds = new Float32Array(9 * 4)

      // 绘制切片图像需要使用临近采样
      const {gl} = this
      this.base.magFilter = gl.NEAREST
      this.base.minFilter = gl.NEAREST
      gl.bindTexture(gl.TEXTURE_2D, this.base.glTexture)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
    }
    const bw = this.base.width
    const bh = this.base.height
    const vertices = this.sliceVertices
    const thresholds = this.sliceThresholds
    let vi = 0
    let ti = 0

    // 设置顶点数据
    const setVertices = (sx, sy, sw, sh, dx, dy, dw, dh) => {
      if (sw * sh * dw * dh === 0) return
      const dl = dx
      const dt = dy
      const dr = dx + dw
      const db = dy + dh
      const sl = (cx + sx) / bw
      const st = (cy + sy) / bh
      const sr = (cx + sx + dw) / bw
      const sb = (cy + sy + dh) / bh
      vertices[vi    ] = dl
      vertices[vi + 1] = dt
      vertices[vi + 2] = sl
      vertices[vi + 3] = st
      vertices[vi + 4] = dl
      vertices[vi + 5] = db
      vertices[vi + 6] = sl
      vertices[vi + 7] = sb
      vertices[vi + 8] = dr
      vertices[vi + 9] = db
      vertices[vi + 10] = sr
      vertices[vi + 11] = sb
      vertices[vi + 12] = dr
      vertices[vi + 13] = dt
      vertices[vi + 14] = sr
      vertices[vi + 15] = st
      thresholds[ti    ] = sl
      thresholds[ti + 1] = st
      thresholds[ti + 2] = sw / bw
      thresholds[ti + 3] = sh / bh
      vi += 16
      ti += 4
    }

    // 创建顶点数据
    const BW = B + W
    const BH = B + H
    const lw = l + w
    const th = t + h
    setVertices(B, B, W, H, l, t, w, h)
    setVertices(0, 0, B, B, 0, 0, l, t)
    setVertices(B, 0, W, B, l, 0, w, t)
    setVertices(BW, 0, B, B, lw, 0, r, t)
    setVertices(0, B, B, H, 0, t, l, h)
    setVertices(BW, B, B, H, lw, t, r, h)
    setVertices(0, BH, B, B, 0, th, l, b)
    setVertices(B, BH, W, B, l, th, w, b)
    setVertices(BW, BH, B, B, lw, th, r, b)
    this.sliceClip.set(clip)
    this.sliceWidth = width
    this.sliceHeight = height
    this.sliceBorder = border
    this.sliceCount = vi / 16
  }

  // 销毁
  destroy() {
    if (this.base) {
      this.complete = false
      if (--this.base.refCount === 0) {
        this.gl.textureManager.delete(this.base)
      }
      this.base = null
    }
  }
}

// 设置加载回调
ImageTexture.prototype.on = BaseTexture.prototype.on

// 执行加载回调
ImageTexture.prototype.reply = BaseTexture.prototype.reply

// ******************************** 纹理管理器类 ********************************

class TextureManager {
  gl      //:object
  map     //:object
  images  //:object
  pointer //:number
  count   //:number

  constructor() {
    this.gl = GL
    this.map = {}
    this.images = {}
    this.pointer = 0
    // count属性未使用，可在devTools中查看纹理数量
    this.count = 0
  }

  // 更新图像纹理
  updateImage(guid) {
    const texture = this.images[guid]
    if (texture === undefined) return
    File.get({
      guid: guid,
      type: 'image',
    }).then(image => {
      if (this.images[guid] === texture && image) {
        const {gl} = this
        texture.image = image
        texture.width = Math.min(image.naturalWidth, gl.maxTexSize)
        texture.height = Math.min(image.naturalHeight, gl.maxTexSize)
        gl.bindTexture(gl.TEXTURE_2D, texture.glTexture)
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, texture.width, texture.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, image)
      }
    })
  }

  // 添加纹理
  append(texture) {
    if (texture.index === undefined) {
      // 给纹理分配一个未使用的索引
      let i = this.pointer
      const map = this.map
      while (map[i] !== undefined) {i++}
      map[i] = texture
      texture.index = i
      this.pointer = i + 1
      this.count++
    }
  }

  // 删除纹理
  delete(texture) {
    const i = texture.index
    const {gl, map} = this
    gl.deleteTexture(texture.glTexture)
    // 通过ID删除图像映射表中的纹理
    if (texture.refCount === 0) {
      delete this.images[texture.guid]
    }
    // 通过索引删除映射表中的纹理
    if (map[i] === texture) {
      delete map[i]
      this.count--
      if (this.pointer > i) {
        this.pointer = i
      }
    }
  }

  // 清除所有纹理
  clear() {
    const {gl, map, images} = this
    for (const texture of Object.values(map)) {
      if (texture.protected === undefined) {
        delete map[texture.index]
        gl.deleteTexture(texture.glTexture)
        this.count--
        if (this.pointer > texture.index) {
          this.pointer = texture.index
        }
      }
    }
    for (const texture of Object.values(images)) {
      if (texture.protected === undefined) {
        delete images[texture.guid]
      }
    }
  }

  // 替换纹理
  replace(oldTex, newTex) {
    newTex.index = oldTex.index
    if (this.map[oldTex.index]) {
      this.map[oldTex.index] = newTex
    }
    if (oldTex instanceof ImageTexture &&
      oldTex.guid === newTex.guid) {
      if (this.images[oldTex.guid] === oldTex) {
        this.images[oldTex.guid] = newTex
      }
    }
  }

  // 恢复纹理
  restore() {
    for (const texture of Object.values(this.map)) {
      if (texture.onRestore) {
        texture.onRestore(texture)
        continue
      }
      if (texture.image !== undefined) {
        texture.restoreImageTexture()
      } else {
        texture.restoreNormalTexture()
      }
    }
  }
}

// ******************************** 批量渲染器 ********************************

class BatchRenderer {
  response      //:array
  setAttrSize   //:function
  getEndIndex   //:function
  setBlendMode  //:function
  bindProgram   //:function
  unbindProgram //:function
  push          //:function
  draw          //:function

  constructor(gl) {
    // 初始化上下文
    const vertices = gl.arrays[0].float32
    const texMap = gl.textureManager.map
    const texUnits = gl.maxTexUnits - 1
    const queue = new Uint32Array(512 * 512)
    const step = texUnits + 3
    const samplers = new Int8Array(10000).fill(-1)
    const response = new Uint32Array(2)
    let attrSize = 0
    let queueIndex = 0
    let samplerLength = 0
    let startIndex = 0
    let endIndex = 0
    let blendMode = 'normal'
    let program = null

    // 设置属性大小
    const setAttrSize = size => {
      attrSize = size
    }

    // 获取结束索引
    const getEndIndex = () => {
      return endIndex
    }

    // 设置混合模式
    const setBlendMode = blend => {
      if (blendMode !== blend) {
        draw()
        blendMode = blend
      }
    }

    // 绑定GL程序(中途切换程序可恢复)
    const bindProgram = () => {
      program = gl.program
    }

    // 解除绑定GL程序
    const unbindProgram = () => {
      program = null
    }

    // 推送绘制数据
    const push = texIndex => {
      let samplerIndex = samplers[texIndex]
      if (samplerIndex === -1) {
        samplerIndex = samplerLength
        if (samplerIndex === texUnits) {
          for (let i = 0; i < samplerLength; i++) {
            samplers[queue[queueIndex + i]] = -1
          }
          const offset = queueIndex + texUnits
          queue[offset    ] = samplerLength
          queue[offset + 1] = startIndex
          queue[offset + 2] = endIndex
          startIndex = endIndex
          queueIndex += step
          samplerLength = 0
          samplerIndex = 0
        }
        queue[queueIndex + samplerIndex] = texIndex
        samplers[texIndex] = samplerIndex
        samplerLength += 1
      }
      response[0] = endIndex
      response[1] = samplerIndex
      endIndex += 4
    }

    // 绘制图像
    const draw = () => {
      if (endIndex !== 0) {
        if (samplerLength !== 0) {
          for (let i = 0; i < samplerLength; i++) {
            samplers[queue[queueIndex + i]] = -1
          }
          const offset = queueIndex + texUnits
          queue[offset    ] = samplerLength
          queue[offset + 1] = startIndex
          queue[offset + 2] = endIndex
          queueIndex += step
          samplerLength = 0
        }
        if (program !== null && program !== gl.program) {
          program.use()
          gl.bindVertexArray(program.vao)
        }
        const vLength = endIndex * attrSize
        if (vLength > 0) {
          gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STREAM_DRAW, 0, vLength)
        }
        gl.blend = blendMode
        gl.updateBlending()
        for (let qi = 0; qi < queueIndex; qi += step) {
          const offset = qi + step
          const length = queue[offset - 3]
          const start = queue[offset - 2] * 1.5
          const end = queue[offset - 1] * 1.5
          for (let si = length - 1; si >= 0; si--) {
            gl.activeTexture(gl.TEXTURE0 + si)
            gl.bindTexture(gl.TEXTURE_2D, texMap[queue[qi + si]].glTexture)
          }
          gl.updateSamplerNum(length)
          gl.drawElements(gl.TRIANGLES, end - start, gl.UNSIGNED_INT, start * 4)
        }
        queueIndex = 0
        startIndex = 0
        endIndex = 0
      }
    }

    // 设置属性
    this.response = response
    this.setAttrSize = setAttrSize
    this.getEndIndex = getEndIndex
    this.setBlendMode = setBlendMode
    this.bindProgram = bindProgram
    this.unbindProgram = unbindProgram
    this.push = push
    this.draw = draw
  }
}

// ******************************** 平面向量类 ********************************

class Vector {
  constructor(x = 0, y = 0) {
    this.x = x
    this.y = y
  }

  // 读取长度
  get length() {
    const {x, y} = this
    return Math.sqrt(x * x + y * y)
  }

  // 写入长度
  set length(value) {
    const {length} = this
    if (length !== 0) {
      const ratio = value / length
      this.x *= ratio
      this.y *= ratio
    }
  }

  // 设置向量
  set(x, y) {
    this.x = x
    this.y = y
    return this
  }

  // 添加向量
  add(vector) {
    this.x += vector.x
    this.y += vector.y
    return this
  }

  // 叉乘
  // cross(vector) {
  //   return this.x * vector.y - this.y * vector.x
  // }

  // 求夹角余弦值
  cos(vector) {
    const a = this.x * vector.x + this.y * vector.y
    const b = Math.sqrt(this.x ** 2 + this.y ** 2)
    const c = Math.sqrt(vector.x ** 2 + vector.y ** 2)
    return a / (b * c)
  }

  // 求夹角正弦值
  sin(vector) {
    const cos = this.cos(vector)
    return Math.sqrt(1 - cos ** 2)
  }

  // 归一化
  normalize() {
    this.length = 1
    return this
  }

  // 创建平面向量实例数组
  static instances = [
    new Vector(),
    new Vector(),
    new Vector(),
    new Vector(),
    new Vector(),
    new Vector(),
    new Vector(),
    new Vector(),
  ]
}

// ******************************** 平面矩阵类 ********************************

class Matrix extends Float32Array {
  constructor() {
    super(9)
    this[0] = 1
    this[4] = 1
    this[8] = 1
  }

  // 重置
  reset() {
    this[0] = 1
    this[1] = 0
    this[3] = 0
    this[4] = 1
    this[6] = 0
    this[7] = 0
    return this
  }

  // 设置矩阵
  set(matrix) {
    this[0] = matrix[0]
    this[1] = matrix[1]
    this[3] = matrix[3]
    this[4] = matrix[4]
    this[6] = matrix[6]
    this[7] = matrix[7]
    return this
  }

  // 设置参数
  set6f(a, b, c, d, e, f) {
    this[0] = a
    this[1] = b
    this[3] = c
    this[4] = d
    this[6] = e
    this[7] = f
    return this
  }

  // 乘以矩阵
  multiply(matrix) {
    const A = this[0]
    const B = this[1]
    const C = this[3]
    const D = this[4]
    const E = this[6]
    const F = this[7]
    const a = matrix[0]
    const b = matrix[1]
    const c = matrix[3]
    const d = matrix[4]
    const e = matrix[6]
    const f = matrix[7]
    this[0] = A * a + C * b
    this[1] = B * a + D * b
    this[3] = A * c + C * d
    this[4] = B * c + D * d
    this[6] = A * e + C * f + E
    this[7] = B * e + D * f + F
    return this
  }

  // 旋转
  rotate(angle) {
    const cos = Math.cos(angle)
    const sin = Math.sin(angle)
    const a = this[0]
    const b = this[1]
    const c = this[3]
    const d = this[4]
    this[0] = a * cos + c * sin
    this[1] = b * cos + d * sin
    this[3] = c * cos - a * sin
    this[4] = d * cos - b * sin
    return this
  }

  // 在指定点旋转
  rotateAt(x, y, angle) {
    const cos = Math.cos(angle)
    const sin = Math.sin(angle)
    const a = this[0]
    const b = this[1]
    const c = this[3]
    const d = this[4]
    this[0] = a * cos + c * sin
    this[1] = b * cos + d * sin
    this[3] = c * cos - a * sin
    this[4] = d * cos - b * sin
    this[6] += (a - this[0]) * x + (c - this[3]) * y
    this[7] += (b - this[1]) * x + (d - this[4]) * y
    return this
  }

  // 缩放
  scale(h, v) {
    this[0] *= h
    this[1] *= h
    this[3] *= v
    this[4] *= v
    return this
  }

  // 在指定点缩放
  scaleAt(x, y, h, v) {
    const a = this[0]
    const b = this[1]
    const c = this[3]
    const d = this[4]
    this[0] *= h
    this[1] *= h
    this[3] *= v
    this[4] *= v
    this[6] += (a - this[0]) * x + (c - this[3]) * y
    this[7] += (b - this[1]) * x + (d - this[4]) * y
    return this
  }

  // 平移
  translate(x, y) {
    this[6] += this[0] * x + this[3] * y
    this[7] += this[1] * x + this[4] * y
    return this
  }

  // 在指定点倾斜
  skewAt(x, y, h, v) {
    const a = this[0]
    const b = this[1]
    const c = this[3]
    const d = this[4]
    this[0] = a + c * v
    this[1] = b + d * v
    this[3] = a * h + c
    this[4] = b * h + d
    this[6] += (a - this[0]) * x + (c - this[3]) * y
    this[7] += (b - this[1]) * x + (d - this[4]) * y
    return this
  }

  // 水平镜像
  mirrorh() {
    this[0] = -this[0]
    this[3] = -this[3]
    return this
  }

  // 垂直镜像
  mirrorv() {
    this[1] = -this[1]
    this[4] = -this[4]
    return this
  }

  // 投影
  project(flip, width, height) {
    this[0] = 2 / width
    this[1] = 0
    this[3] = 0
    this[4] = 2 * flip / height
    this[6] = -1
    this[7] = -flip
    return this
  }

  // 静态 - 平面矩阵实例
  static instance = new Matrix()
}

// 初始化WebGL上下文
GL.initialize()