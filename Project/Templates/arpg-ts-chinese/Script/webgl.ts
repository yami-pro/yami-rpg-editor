/** WebGL上下文对象 */
let GL: WebGL2RenderingContext

/** WebGL构造器 */
let WebGL = new class WebGLBuilder {
  /**
   * WebGL上下文选项
   * https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/getContext
   */
  public webglOptions = {
    /** 是否开启抗锯齿 */
    antialias: false,
    /** 画布是否包含不透明度缓冲区 */
    alpha: false,
    /** 是否包含深度缓冲区 */
    depth: true,
    /** 是否包含模版缓冲区 */
    stencil: false,
    /** 绘制缓冲区是否包含预混合不透明度通道 */
    premultipliedAlpha: false,
    /** 是否保存绘制缓冲区，每帧不被自动擦除 */
    preserveDrawingBuffer: false,
    /**
     * 使画布绘制周期与事件循环不同步
     * - 启用后将减少渲染延迟，操作更流畅跟手，可能会造成AMD显卡驱动崩溃
     * - 关闭后帧率更稳定，但增加几帧操作延时，对低刷新率显示器影响更大
     */
    desynchronized: false,
    /** 优先考虑渲染性能而不是功耗 */
    powerPreference: 'high-performance',
  }

  /** 默认纹理设置 */
  public textureOptions = {
    /** 纹理放大滤波器 */
    magFilter: WebGLRenderingContext.prototype.NEAREST as number,
    /** 纹理缩小滤波器 */
    minFilter: WebGLRenderingContext.prototype.LINEAR as number,
    /** 纹理坐标水平填充 */
    wrapS: WebGLRenderingContext.prototype.CLAMP_TO_EDGE,
    /** 纹理坐标垂直填充 */
    wrapT: WebGLRenderingContext.prototype.CLAMP_TO_EDGE,
  }

  /** 初始化 */
  public initialize(): void {
    // 创建容器元素
    const container = this.createContainer()

    // 创建画布元素
    const canvas = this.createCanvas()

    // 设置WebGL选项
    const map = {
      nearest: WebGLRenderingContext.prototype.NEAREST,
      linear: WebGLRenderingContext.prototype.LINEAR,
    }
    this.webglOptions.desynchronized = Data.config.webgl.desynchronized
    this.textureOptions.magFilter = map[Data.config.webgl.textureMagFilter]
    this.textureOptions.minFilter = map[Data.config.webgl.textureMinFilter]

    // 默认WebGL2(Win10 DirectX11)
    // 兼容WebGL1(Win7 DirectX9以及旧移动设备)
    GL = this.createWebGL2(canvas)
    ??   this.createWebGL1(canvas)

    // 设置画布容器元素
    GL.container = container

    // 设置画布为容器的子元素
    container.appendChild(canvas)

    // 设置WebGL属性和方法
    this.setupWebGLMethods(GL)
    this.setupWebGLProperties(GL)
  }

  /** 创建容器元素 */
  private createContainer(): HTMLDivElement {
    const container = document.createElement('div')
    container.style.position = 'fixed'
    document.body.insertBefore(
      container, document.body.firstChild,
    )
    return container
  }

  /** 创建画布元素 */
  private createCanvas(): HTMLCanvasElement {
    const canvas = document.createElement('canvas')
    canvas.width = 0
    canvas.height = 0
    canvas.style.width = '100%'
    canvas.style.height = '100%'
    return canvas
  }

  /**
   * 创建WebGL2上下文
   * @param canvas 画布元素
   */
  private createWebGL2(canvas: HTMLCanvasElement): WebGL2RenderingContext | null {
    return canvas.getContext('webgl2', this.webglOptions) as WebGL2RenderingContext | null
  }

  /**
   * 创建WebGL1上下文
   * @param canvas 画布元素
   */
  private createWebGL1(canvas: HTMLCanvasElement): WebGL2RenderingContext {
    const webgl = canvas.getContext('webgl', this.webglOptions) as WebGLRenderingContext | null
      if (!webgl) {
        throw new Error('Failed to get webgl context')
      }

      // 获取元素索引 32 位无符号整数扩展
      webgl.getExtension('OES_element_index_uint')

      // 获取顶点数组对象扩展
      const vertex_array_object = webgl.getExtension('OES_vertex_array_object')!
      webgl.createVertexArray = vertex_array_object.createVertexArrayOES.bind(vertex_array_object)
      webgl.deleteVertexArray = vertex_array_object.deleteVertexArrayOES.bind(vertex_array_object)
      webgl.isVertexArray = vertex_array_object.isVertexArrayOES.bind(vertex_array_object)
      webgl.bindVertexArray = vertex_array_object.bindVertexArrayOES.bind(vertex_array_object)

      // 获取最小和最大混合模式扩展
      const blend_minmax = webgl.getExtension('EXT_blend_minmax')!
      webgl.MIN = blend_minmax.MIN_EXT
      webgl.MAX = blend_minmax.MAX_EXT

      // 更新缓冲数据
      const bufferData = WebGLRenderingContext.prototype.bufferData as (target: GLenum, srcData: Uint8Array, usage: GLenum) => void
      WebGLRenderingContext.prototype.bufferData = function (target: GLenum, srcData: Uint8Array, usage: GLenum, srcOffset: GLuint, length?: GLuint): void {
        if (length !== undefined) {
          length *= srcData.BYTES_PER_ELEMENT
          srcData = new Uint8Array(srcData.buffer, srcOffset, length)
        }
        return bufferData.call(this, target, srcData, usage)
      }

      // 获取图像像素数据
      const pixelCanvas = Object.assign(document.createElement('canvas'), {width: 0, height: 0})
      const context2d = pixelCanvas.getContext('2d')!
      const texSubImage2D = WebGLRenderingContext.prototype.texSubImage2D
      WebGLRenderingContext.prototype.texSubImage2D = function (target: GLenum, level: GLint, xoffset: GLint, yoffset: GLint, width: GLsizei, height: GLsizei, format: GLenum, type: GLenum, pixels: ArrayBufferView | HTMLImageElement | null): void {
        let data: Uint8ClampedArray | null = null
        if (pixels instanceof HTMLImageElement) {
          pixelCanvas.width = pixels.width
          pixelCanvas.height = pixels.height
          context2d.drawImage(pixels, 0, 0)
          data = context2d.getImageData(0, 0, pixels.width, pixels.height).data
        }
        texSubImage2D.call(this, target, level, xoffset, yoffset, width, height, format, type, data)
      }
      return webgl as WebGL2RenderingContext
  }

  /**
   * 安装WebGL属性
   * @param GL 上下文对象
   */
  public setupWebGLProperties(GL: WebGL2RenderingContext): void {
    // 设置初始属性
    GL.flip = -1
    GL.alpha = 1
    GL.blend = 'normal'
    GL.matrix = new Matrix()
    GL.width = GL.drawingBufferWidth
    GL.height = GL.drawingBufferHeight
    GL.program = null!
    GL.binding = null
    GL.masking = false
    GL.depthTest = false
    GL.maxTexSize = GL.getParameter(GL.MAX_TEXTURE_SIZE)
    GL.maxTexUnits = GL.getParameter(GL.MAX_TEXTURE_IMAGE_UNITS)
    GL.ambient = {red: -1, green: -1, blue: -1}

    // 创建纹理管理器
    GL.textureManager = new TextureManager()

    // 创建反射光纹理
    GL.reflectedLightMap = new Texture({
      format: GL.RGB,
      magFilter: GL.LINEAR,
      minFilter: GL.LINEAR,
    }) as ReflectedLightTexture
    GL.reflectedLightMap.fbo = GL.createTextureFBO(GL.reflectedLightMap)
    GL.activeTexture(GL.TEXTURE0 + GL.maxTexUnits - 1)
    GL.bindTexture(GL.TEXTURE_2D, GL.reflectedLightMap.base.glTexture)
    GL.activeTexture(GL.TEXTURE0)

    // 创建直射光纹理
    GL.directLightMap = new Texture({
      format: GL.RGB,
      magFilter: GL.LINEAR,
      minFilter: GL.LINEAR,
    }) as DirectLightTexture
    GL.directLightMap.fbo = GL.createTextureFBO(GL.directLightMap)

    // 创建模板纹理(用来绘制文字)
    GL.stencilTexture = new Texture({format: GL.ALPHA})

    // 创建遮罩纹理
    GL.maskTexture = new Texture({format: GL.RGBA}) as MaskTexture
    GL.maskTexture.fbo = GL.createTextureFBO(GL.maskTexture)
    GL.maskTexture.binding = null

    // 创建临时纹理(用来替代未使用的纹理)
    // 如果着色器Sampler2D属性缺失对应位置的绑定纹理(已删除)
    // 部分Android Web控制台将输出错误警告，无论是否读取属性
    GL.tempTexture = new Texture({format: GL.ALPHA}).resize(1, 1)

    // 创建图层数组(用于排序)
    GL.layers = new Uint32Array(0x40000)

    // 创建零值数组(用完后要确保所有值归零)
    GL.zeros = new Uint32Array(0x40000)

    // 创建类型化数组，分成4个区间，每个区间共享数据缓冲区
    // 主要用于读写顶点数据，也可以共享使用来减少内存开销
    const size = 512 * 512
    if (!GL.arrays) {
      const buffer1 = new ArrayBuffer(size * 96)
      const buffer2 = new ArrayBuffer(size * 12)
      const buffer3 = new ArrayBuffer(size * 8)
      const buffer4 = new ArrayBuffer(size * 40)
      GL.arrays = {
        0: {
          uint8: new Uint8Array(buffer1, 0, size * 96),
          uint16: new Uint16Array(buffer1, 0, size * 48),
          uint32: new Uint32Array(buffer1, 0, size * 24),
          float32: new Float32Array(buffer1, 0, size * 24),
          float64: new Float64Array(buffer1, 0, size * 12),
        },
        1: {
          uint8: new Uint8Array(buffer2, 0, size * 12),
          uint16: new Uint16Array(buffer2, 0, size * 6),
          uint32: new Uint32Array(buffer2, 0, size * 3),
          float32: new Float32Array(buffer2, 0, size * 3),
          float64: new Float64Array(buffer2, 0, size * 1.5),
        },
        2: {
          uint32: new Uint32Array(buffer3, 0, size * 2),
          float32: new Float32Array(buffer3, 0, size * 2),
        },
        3: {
          uint32: new Uint32Array(buffer4, 0, size * 10),
          float32: new Float32Array(buffer4, 0, size * 10),
        },
      }
    }

    // 创建通用帧缓冲区
    GL.frameBuffer = GL.createFramebuffer()!

    // 创建通用顶点缓冲区
    GL.vertexBuffer = GL.createBuffer()!

    // 创建通用元素索引缓冲区，刚好够绘制512x512个图块
    const indices = GL.arrays[0].uint32
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
    GL.elementBuffer = GL.createBuffer()!
    GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, GL.elementBuffer)
    GL.bufferData(GL.ELEMENT_ARRAY_BUFFER, indices, GL.STATIC_DRAW, 0, size * 6)
    GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, null)

    // 创建更新混合模式方法(闭包)
    GL.updateBlending = GL.createBlendingUpdater()

    // 创建批量渲染器
    GL.batchRenderer = new BatchRenderer(GL)

    // 创建离屏纹理(启用深度缓冲区)
    GL.offscreen = {
      enabled: false,
      current: new Texture({format: GL.RGB}) as OffscreenTexture,
      last: new Texture({format: GL.RGB}) as OffscreenTexture,
    }
    const {current, last} = GL.offscreen
    current.fbo = GL.createTextureFBO(current)
    last.fbo = GL.createTextureFBO(last)

    // 创建程序对象
    GL.imageProgram = GL.createImageProgram() as WebGLImageProgram
    GL.tileProgram = GL.createTileProgram() as WebGLTileProgram
    GL.spriteProgram = GL.createSpriteProgram() as WebGLSpriteProgram
    GL.particleProgram = GL.createParticleProgram() as WebGLParticleProgram
    GL.lightProgram = GL.createLightProgram() as WebGLLightProgram
    GL.graphicProgram = GL.createGraphicProgram() as WebGLGraphicProgram
  }

  /**
   * 安装WebGL方法
   * @param GL 上下文对象
   */
  private setupWebGLMethods(GL: WebGL2RenderingContext): void {
    // WebGL上下文方法 - 创建程序对象
    GL.createProgramWithShaders = function (vshader: string, fshader: string): WebGLProgram {
      const vertexShader = this.loadShader(this.VERTEX_SHADER, vshader)
      const fragmentShader = this.loadShader(this.FRAGMENT_SHADER, fshader)
      if (!vertexShader || !fragmentShader) {
        throw new Error('Failed to load shaders')
      }
      const program = this.createProgram()
      if (!program) {
        throw new Error('Failed to create program')
      }
      this.attachShader(program, vertexShader)
      this.attachShader(program, fragmentShader)
      this.linkProgram(program)
      if (!this.getProgramParameter(program, this.LINK_STATUS)) {
        const error = this.getProgramInfoLog(program)
        this.deleteProgram(program)
        this.deleteShader(fragmentShader)
        this.deleteShader(vertexShader)
        throw new Error(`Failed to link program: ${error}`)
      }
      return program
    }

    // WebGL上下文方法 - 加载着色器
    GL.loadShader = function (type: number, source: string): WebGLShader {
      const shader = this.createShader(type)
      if (!shader) {
        throw new Error('Failed to create shader')
      }
      this.shaderSource(shader, source)
      this.compileShader(shader)
      if (!this.getShaderParameter(shader, this.COMPILE_STATUS)) {
        const error = this.getShaderInfoLog(shader)
        this.deleteShader(shader)
        console.error(`Failed to compile shader: ${error}`)
      }
      return shader
    }

    // WebGL上下文方法 - 创建图像程序
    GL.createImageProgram = function (): WebGLImageProgram {
      const program = this.createProgramWithShaders(
        `
        attribute   vec2        a_Position;
        attribute   vec2        a_TexCoord;
        attribute   float       a_Opacity;
        uniform     float       u_Flip;
        uniform     mat3        u_Matrix;
        uniform     vec3        u_Ambient;
        uniform     int         u_LightMode;
        uniform     vec2        u_LightCoord;
        uniform     vec4        u_LightTexSize;
        uniform     sampler2D   u_LightSampler;
        varying     vec2        v_TexCoord;
        varying     vec3        v_LightColor;
        varying     float       v_Opacity;

        // 获取光照颜色系数
        vec3 getLightColor() {
          if (u_LightMode == 0) {
            // 光线采样：原始图像
            return vec3(1.0, 1.0, 1.0);
          }
          if (u_LightMode == 1) {
            // 光线采样：全局采样
            return vec3(
              gl_Position.x / u_LightTexSize.x + u_LightTexSize.z,
              gl_Position.y / u_LightTexSize.y * u_Flip + u_LightTexSize.w,
              -1.0
            );
          }
          if (u_LightMode == 2) {
            // 光线采样：锚点采样
            vec2 anchorCoord = (u_Matrix * vec3(u_LightCoord, 1.0)).xy;
            vec2 lightCoord = vec2(
              anchorCoord.x / u_LightTexSize.x + u_LightTexSize.z,
              anchorCoord.y / u_LightTexSize.y * u_Flip + u_LightTexSize.w
            );
            return texture2D(u_LightSampler, lightCoord).rgb;
          }
          if (u_LightMode == 3) {
            // 光线采样：环境光
            return u_Ambient;
          }
        }

        void main() {
          gl_Position.xyw = u_Matrix * vec3(a_Position, 1.0);
          v_TexCoord = a_TexCoord;
          v_LightColor = getLightColor();
          v_Opacity = a_Opacity;
        }
        `,
        `
        precision   highp       float;
        varying     vec2        v_TexCoord;
        varying     vec3        v_LightColor;
        uniform     vec2        u_Viewport;
        uniform     int         u_Masking;
        varying     float       v_Opacity;
        uniform     float       u_Alpha;
        uniform     int         u_ColorMode;
        uniform     vec4        u_Color;
        uniform     vec4        u_Tint;
        uniform     vec4        u_Repeat;
        uniform     sampler2D   u_Sampler;
        uniform     sampler2D   u_MaskSampler;
        uniform     sampler2D   u_LightSampler;

        // 获取光照颜色系数(全局采样)
        vec3 getLightColor() {
          if (v_LightColor.z != -1.0) return v_LightColor;
          return texture2D(u_LightSampler, v_LightColor.xy).rgb;
        }

        void main() {
          if (u_ColorMode == 0) {
            // 颜色模式：纹理采样 + 色调
            gl_FragColor = texture2D(u_Sampler, fract(v_TexCoord));
            if (gl_FragColor.a == 0.0) discard;
            gl_FragColor.rgb = gl_FragColor.rgb * (1.0 - u_Tint.a) + u_Tint.rgb +
            dot(gl_FragColor.rgb, vec3(0.299, 0.587, 0.114)) * u_Tint.a;
          } else if (u_ColorMode == 1) {
            // 颜色模式：指定颜色
            float alpha = texture2D(u_Sampler, v_TexCoord).a;
            if (alpha == 0.0) discard;
            gl_FragColor = vec4(u_Color.rgb, u_Color.a * alpha);
          } else if (u_ColorMode == 2) {
            // 颜色模式：纹理采样 + 切片
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
          gl_FragColor.a *= v_Opacity * u_Alpha;
          if (u_Masking == 1) {
            vec2 fragCoord = vec2(gl_FragCoord.x, (u_Viewport.y - gl_FragCoord.y));
            gl_FragColor.a *= texture2D(u_MaskSampler, fragCoord / u_Viewport).a;
          }
        }
        `,
      ) as WebGLImageProgram
      this.useProgram(program)

      // 顶点着色器属性
      const a_Position = this.getAttribLocation(program, 'a_Position')
      const a_TexCoord = this.getAttribLocation(program, 'a_TexCoord')
      const a_Opacity = this.getAttribLocation(program, 'a_Opacity')
      const u_Flip = this.getUniformLocation(program, 'u_Flip')
      const u_Matrix = this.getUniformLocation(program, 'u_Matrix')!
      const u_Ambient = this.getUniformLocation(program, 'u_Ambient')!
      const u_LightMode = this.getUniformLocation(program, 'u_LightMode')!
      const u_LightCoord = this.getUniformLocation(program, 'u_LightCoord')!
      const u_LightTexSize = this.getUniformLocation(program, 'u_LightTexSize')!
      // 设置光线采样器指向最后一个纹理
      this.uniform1i(this.getUniformLocation(program, 'u_LightSampler'), this.maxTexUnits - 1)

      // 片元着色器属性
      const u_Viewport = this.getUniformLocation(program, 'u_Viewport')!
      const u_Masking = this.getUniformLocation(program, 'u_Masking')!
      const u_Alpha = this.getUniformLocation(program, 'u_Alpha')!
      const u_ColorMode = this.getUniformLocation(program, 'u_ColorMode')!
      const u_Color = this.getUniformLocation(program, 'u_Color')!
      const u_Tint = this.getUniformLocation(program, 'u_Tint')!
      const u_Repeat = this.getUniformLocation(program, 'u_Repeat')!
      const u_MaskSampler = this.getUniformLocation(program, 'u_MaskSampler')!

      // 创建顶点数组对象
      const vao = this.createVertexArray() as WebGLVertexArrayObjectImage
      this.bindVertexArray(vao)
      this.enableVertexAttribArray(a_Position)
      this.enableVertexAttribArray(a_TexCoord)
      this.enableVertexAttribArray(a_Opacity)
      this.bindBuffer(this.ARRAY_BUFFER, this.vertexBuffer)
      this.vertexAttribPointer(a_Position, 2, this.FLOAT, false, 20, 0)
      this.vertexAttribPointer(a_TexCoord, 2, this.FLOAT, false, 20, 8)
      this.vertexAttribPointer(a_Opacity, 1, this.FLOAT, false, 20, 16)
      this.bindBuffer(this.ELEMENT_ARRAY_BUFFER, this.elementBuffer)

      // 创建顶点数组对象 - 属性[110]
      vao.a110 = this.createVertexArray()!
      this.bindVertexArray(vao.a110)
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
        if (program.masking !== this.masking) {
          program.masking = this.masking
          if (this.masking) {
            this.uniform1i(u_Masking, 1)
            this.uniform1i(u_MaskSampler, 1)
            this.activeTexture(this.TEXTURE1)
            this.bindTexture(this.TEXTURE_2D, this.maskTexture.base.glTexture)
            this.activeTexture(this.TEXTURE0)
          } else {
            this.uniform1i(u_Masking, 0)
            this.uniform1i(u_MaskSampler, 0)
            this.activeTexture(this.TEXTURE1)
            this.bindTexture(this.TEXTURE_2D, null)
            this.activeTexture(this.TEXTURE0)
          }
        }
        if (this.masking) {
          this.uniform2f(u_Viewport, this.width, this.height)
        }
        this.updateBlending()
        return program
      }

      // 保存程序对象
      program.use = use
      program.vao = vao
      program.flip = 0
      program.alpha = 0
      program.masking = false
      program.a_Position = a_Position
      program.a_TexCoord = a_TexCoord
      program.a_Opacity = a_Opacity
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
    GL.createTileProgram = function (): WebGLTileProgram {
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

        // 获取光照颜色系数
        vec3 getLightColor() {
          if (u_LightMode == 0) {
            // 光线采样：原始图像
            return vec3(1.0, 1.0, 1.0);
          }
          if (u_LightMode == 1) {
            // 光线采样：全局采样
            return vec3(
              gl_Position.x / u_LightTexSize.x + u_LightTexSize.z,
              gl_Position.y / u_LightTexSize.y * u_Flip + u_LightTexSize.w,
              -1.0
            );
          }
          if (u_LightMode == 2) {
            // 光线采样：环境光
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
        uniform     sampler2D   u_Samplers[15];
        uniform     sampler2D   u_LightSampler;

        // 采样纹理像素颜色(采样器索引，坐标)
        // 采样器数组的索引必须使用常量
        vec4 sampler(int index, vec2 uv) {
          for (int i = 0; i < 15; i++) {
            if (i == index) {
              return texture2D(u_Samplers[i], uv);
            }
          }
        }

        // 获取光照颜色系数(全局采样)
        vec3 getLightColor() {
          if (v_LightColor.z != -1.0) return v_LightColor;
          return texture2D(u_LightSampler, v_LightColor.xy).rgb;
        }

        void main() {
          gl_FragColor = sampler(int(v_TexIndex), v_TexCoord);
          if (gl_FragColor.a == 0.0) discard;
          gl_FragColor.rgb *= getLightColor();
          gl_FragColor.a *= u_Alpha;
        }
        `,
      ) as WebGLTileProgram
      this.useProgram(program)

      // 顶点着色器属性
      const a_Position = this.getAttribLocation(program, 'a_Position')
      const a_TexCoord = this.getAttribLocation(program, 'a_TexCoord')
      const a_TexIndex = this.getAttribLocation(program, 'a_TexIndex')
      const u_Flip = this.getUniformLocation(program, 'u_Flip')!
      const u_Matrix = this.getUniformLocation(program, 'u_Matrix')!
      const u_Ambient = this.getUniformLocation(program, 'u_Ambient')!
      const u_LightMode = this.getUniformLocation(program, 'u_LightMode')!
      const u_LightTexSize = this.getUniformLocation(program, 'u_LightTexSize')!
      // 设置光线采样器指向最后一个纹理
      this.uniform1i(this.getUniformLocation(program, 'u_LightSampler'), this.maxTexUnits - 1)

      // 片元着色器属性
      const u_Alpha = this.getUniformLocation(program, 'u_Alpha')!
      const u_SamplerLength = this.maxTexUnits - 1
      const u_Samplers = []
      for (let i = 0; i < u_SamplerLength; i++) {
        u_Samplers.push(this.getUniformLocation(program, `u_Samplers[${i}]`)!)
      }

      // 创建顶点数组对象
      const vao = this.createVertexArray()!
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
      program.flip = 0
      program.alpha = 0
      program.samplerNum = 1
      program.a_Position = a_Position
      program.a_TexCoord = a_TexCoord
      program.a_TexIndex = a_TexIndex
      program.u_Matrix = u_Matrix
      program.u_Ambient = u_Ambient
      program.u_LightMode = u_LightMode
      program.u_LightTexSize = u_LightTexSize
      program.u_Samplers = u_Samplers
      return program
    }

    // WebGL上下文方法 - 创建精灵程序
    GL.createSpriteProgram = function (): WebGLSpriteProgram {
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

        // 获取光照颜色系数
        vec3 getLightColor() {
          // 参数Z分量是0 = 光线采样：原始图像
          if (a_TexParam.z == 0.0) {
            return vec3(1.0, 1.0, 1.0);
          }
          // 参数Z分量是1 = 光线采样：全局采样
          if (a_TexParam.z == 1.0) {
            return vec3(
              gl_Position.x / u_LightTexSize.x + u_LightTexSize.z,
              gl_Position.y / u_LightTexSize.y * u_Flip + u_LightTexSize.w,
              -1.0
            );
          }
          // 参数Z分量是2 = 光线采样：锚点采样
          if (a_TexParam.z == 2.0) {
            return texture2D(u_LightSampler, a_LightCoord).rgb;
          }
        }

        void main() {
          gl_Position.xyw = u_Matrix * vec3(a_Position, 1.0);
          v_TexIndex = a_TexParam.x;
          // 不透明度归一化(0~255映射为0~1)
          v_Opacity = a_TexParam.y / 255.0;
          // 解压缩色调编码(0~510映射为-1~1)
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
        uniform     sampler2D   u_Samplers[15];
        uniform     sampler2D   u_LightSampler;

        // 采样纹理像素颜色(采样器索引，坐标)
        // 采样器数组的索引必须使用常量
        vec4 sampler(int index, vec2 uv) {
          for (int i = 0; i < 15; i++) {
            if (i == index) {
              return texture2D(u_Samplers[i], uv);
            }
          }
        }

        // 对颜色使用色调
        vec3 tint(vec3 color, vec4 tint) {
          return color.rgb * (1.0 - tint.a) + tint.rgb +
          dot(color.rgb, vec3(0.299, 0.587, 0.114)) * tint.a;
        }

        // 获取光照颜色系数(全局采样)
        vec3 getLightColor() {
          if (v_LightColor.z != -1.0) return v_LightColor;
          return texture2D(u_LightSampler, v_LightColor.xy).rgb;
        }

        void main() {
          gl_FragColor = sampler(int(v_TexIndex), v_TexCoord);
          if (gl_FragColor.a == 0.0) discard;
          gl_FragColor.rgb = tint(gl_FragColor.rgb, v_Tint) * getLightColor();
          gl_FragColor.a *= v_Opacity * u_Alpha;
        }
        `,
      ) as WebGLSpriteProgram
      this.useProgram(program)

      // 顶点着色器属性
      const a_Position = this.getAttribLocation(program, 'a_Position')
      const a_TexCoord = this.getAttribLocation(program, 'a_TexCoord')
      const a_TexParam = this.getAttribLocation(program, 'a_TexParam')
      const a_Tint = this.getAttribLocation(program, 'a_Tint')!
      const a_LightCoord = this.getAttribLocation(program, 'a_LightCoord')!
      const u_Flip = this.getUniformLocation(program, 'u_Flip')!
      const u_Matrix = this.getUniformLocation(program, 'u_Matrix')!
      const u_LightTexSize = this.getUniformLocation(program, 'u_LightTexSize')!
      // 设置光线采样器指向最后一个纹理
      this.uniform1i(this.getUniformLocation(program, 'u_LightSampler'), this.maxTexUnits - 1)

      // 片元着色器属性
      const u_Alpha = this.getUniformLocation(program, 'u_Alpha')
      const u_SamplerLength = this.maxTexUnits - 1
      const u_Samplers = []
      for (let i = 0; i < u_SamplerLength; i++) {
        u_Samplers.push(this.getUniformLocation(program, `u_Samplers[${i}]`)!)
      }

      // 创建顶点数组对象
      const vao = this.createVertexArray()!
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
      program.flip = 0
      program.alpha = 0
      program.samplerNum = 1
      program.a_Position = a_Position
      program.a_TexCoord = a_TexCoord
      program.a_TexParam = a_TexParam
      program.a_Tint = a_Tint
      program.a_LightCoord = a_LightCoord
      program.u_Matrix = u_Matrix
      program.u_LightTexSize = u_LightTexSize
      program.u_Samplers = u_Samplers
      return program
    }

    // WebGL上下文方法 - 创建粒子程序
    GL.createParticleProgram = function (): WebGLParticleProgram {
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
            // 光线采样：原始图像
            return vec3(1.0, 1.0, 1.0);
          }
          if (u_LightMode == 1) {
            // 光线采样：全局采样
            return vec3(
              gl_Position.x / u_LightTexSize.x + u_LightTexSize.z,
              gl_Position.y / u_LightTexSize.y * u_Flip + u_LightTexSize.w,
              -1.0
            );
          }
          if (u_LightMode == 2) {
            // 光线采样：环境光
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
            // 颜色模式：指定颜色
            float alpha = texture2D(u_Sampler, v_TexCoord).a;
            gl_FragColor.a = alpha * v_Color.a * u_Alpha;
            if (gl_FragColor.a == 0.0) discard;
            gl_FragColor.rgb = v_Color.rgb;
          } else if (u_Mode == 1) {
            // 颜色模式：纹理采样 + 色调
            gl_FragColor = texture2D(u_Sampler, v_TexCoord);
            gl_FragColor.a *= v_Color.a * u_Alpha;
            if (gl_FragColor.a == 0.0) discard;
            gl_FragColor.rgb = gl_FragColor.rgb * (1.0 - u_Tint.a) + u_Tint.rgb +
            dot(gl_FragColor.rgb, vec3(0.299, 0.587, 0.114)) * u_Tint.a;
          }
          gl_FragColor.rgb *= getLightColor();
        }
        `,
      ) as WebGLParticleProgram
      this.useProgram(program)

      // 顶点着色器属性
      const a_Position = this.getAttribLocation(program, 'a_Position')
      const a_TexCoord = this.getAttribLocation(program, 'a_TexCoord')
      const a_Color = this.getAttribLocation(program, 'a_Color')
      const u_Flip = this.getUniformLocation(program, 'u_Flip')!
      const u_Matrix = this.getUniformLocation(program, 'u_Matrix')!
      const u_Ambient = this.getUniformLocation(program, 'u_Ambient')!
      const u_LightMode = this.getUniformLocation(program, 'u_LightMode')!
      const u_LightTexSize = this.getUniformLocation(program, 'u_LightTexSize')!
      this.uniform1i(this.getUniformLocation(program, 'u_LightSampler'), this.maxTexUnits - 1)

      // 片元着色器属性
      const u_Alpha = this.getUniformLocation(program, 'u_Alpha')!
      const u_Mode = this.getUniformLocation(program, 'u_Mode')!
      const u_Tint = this.getUniformLocation(program, 'u_Tint')!

      // 创建顶点数组对象
      const vao = this.createVertexArray()!
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
      program.flip = 0
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
    GL.createLightProgram = function (): WebGLLightProgram {
      const program = this.createProgramWithShaders(
        `
        attribute   vec2        a_Position;
        attribute   vec2        a_LightCoord;
        attribute   vec4        a_LightColor;
        uniform     mat3        u_Matrix;
        varying     vec2        v_LightCoord;
        varying     vec4        v_LightColor;

        void main() {
          gl_Position.xyw = u_Matrix * vec3(a_Position, 1.0);
          v_LightCoord = a_LightCoord;
          v_LightColor = a_LightColor;
        }
        `,
        `
        precision   highp       float;
        const       float       PI = 3.1415926536;
        varying     vec2        v_LightCoord;
        varying     vec4        v_LightColor;
        uniform     int         u_LightMode;
        uniform     sampler2D   u_LightSampler;

        // 获取光照颜色
        vec3 getLightColor() {
          if (u_LightMode == 0) {
            // 光照模式：点光源
            float dist = length(vec2(
              (v_LightCoord.x - 0.5),
              (v_LightCoord.y - 0.5)
            ));
            // 放弃圆形外面像素
            if (dist > 0.5) discard;
            // 根据距离和强度来计算光照颜色系数
            float angle = dist * PI;
            float factor = mix(1.0 - sin(angle), cos(angle), v_LightColor.a);
            return v_LightColor.rgb * factor;
          }
          if (u_LightMode == 1) {
            // 光照模式：区域光源
            vec4 lightColor = texture2D(u_LightSampler, v_LightCoord);
            if (lightColor.a == 0.0) discard;
            // 从纹理中采样颜色，与光照颜色相乘
            return v_LightColor.rgb * lightColor.rgb * lightColor.a;
          }
          if (u_LightMode == 2) {
            // 光照模式：区域光源(无纹理)
            return v_LightColor.rgb;
          }
        }

        void main() {
          gl_FragColor = vec4(getLightColor(), 1.0);
        }
        `,
      ) as WebGLLightProgram
      this.useProgram(program)
      // u_LightSampler绑定的0号纹理绘制的时候不是必须的
      // 如果纹理已被删除，部分Android Web控制台输出错误警告

      // 顶点着色器属性
      const a_Position = this.getAttribLocation(program, 'a_Position')
      const a_LightCoord = this.getAttribLocation(program, 'a_LightCoord')
      const a_LightColor = this.getAttribLocation(program, 'a_LightColor')
      const u_Matrix = this.getUniformLocation(program, 'u_Matrix')!

      // 片元着色器属性
      const u_LightMode = this.getUniformLocation(program, 'u_LightMode')!

      // 创建顶点数组对象
      const vao = this.createVertexArray() as WebGLVertexArrayObjectLight
      this.bindVertexArray(vao)
      this.enableVertexAttribArray(a_Position)
      this.enableVertexAttribArray(a_LightCoord)
      this.enableVertexAttribArray(a_LightColor)
      this.bindBuffer(this.ARRAY_BUFFER, this.vertexBuffer)
      this.vertexAttribPointer(a_Position, 2, this.FLOAT, false, 32, 0)
      this.vertexAttribPointer(a_LightCoord, 2, this.FLOAT, false, 32, 8)
      this.vertexAttribPointer(a_LightColor, 4, this.FLOAT, false, 32, 16)
      this.bindBuffer(this.ELEMENT_ARRAY_BUFFER, this.elementBuffer)

      // 创建顶点数组对象 - 属性[110]
      vao.a110 = this.createVertexArray()!
      this.bindVertexArray(vao.a110)
      this.enableVertexAttribArray(a_Position)
      this.enableVertexAttribArray(a_LightCoord)
      this.bindBuffer(this.ARRAY_BUFFER, this.vertexBuffer)
      this.vertexAttribPointer(a_Position, 2, this.FLOAT, false, 16, 0)
      this.vertexAttribPointer(a_LightCoord, 2, this.FLOAT, false, 16, 8)
      this.bindBuffer(this.ELEMENT_ARRAY_BUFFER, this.elementBuffer)

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
      program.a_LightColor = a_LightColor
      program.u_Matrix = u_Matrix
      program.u_LightMode = u_LightMode
      return program
    }

    // WebGL上下文方法 - 创建图形程序
    GL.createGraphicProgram = function (): WebGLGraphicProgram {
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
      ) as WebGLGraphicProgram
      this.useProgram(program)

      // 顶点着色器属性
      const a_Position = this.getAttribLocation(program, 'a_Position')
      const a_Color = this.getAttribLocation(program, 'a_Color')
      const u_Matrix = this.getUniformLocation(program, 'u_Matrix')!

      // 片元着色器属性
      const u_Alpha = this.getUniformLocation(program, 'u_Alpha')!

      // 创建顶点数组对象
      const vao = this.createVertexArray() as WebGLVertexArrayObjectGraphic
      this.bindVertexArray(vao)
      this.enableVertexAttribArray(a_Position)
      this.enableVertexAttribArray(a_Color)
      this.bindBuffer(this.ARRAY_BUFFER, this.vertexBuffer)
      this.vertexAttribPointer(a_Position, 2, this.FLOAT, false, 12, 0)
      this.vertexAttribPointer(a_Color, 4, this.UNSIGNED_BYTE, true, 12, 8)
      this.bindBuffer(this.ELEMENT_ARRAY_BUFFER, this.elementBuffer)

      // 创建顶点数组对象 - 属性[10]
      vao.a10 = this.createVertexArray()!
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

    // WebGL上下文方法 - 重置状态
    GL.reset = function (): void {
      this.blend = 'normal'
      this.alpha = 1
      this.matrix.reset()
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
          // 关闭混合功能，切换到B组更新器
          this.disable(this.BLEND)
          updaters = B
        },
      }

      // 从复制模式切换到其他模式
      const resume = (): void => {
        // 开启混合功能，切换到A组更新器
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
        copy: Function.empty,
      }

      let updaters = A
      let blend = '' as BlendingMode
      // 返回更新混合模式方法
      return () => {
        if (blend !== this.blend) {
          updaters[blend = this.blend]()
        }
      }
    }

    // WebGL上下文方法 - 设置环境光
    GL.setAmbientLight = function (light: GLAmbientLight): void {
      const ambient = this.ambient
      if (ambient.red !== light.red ||
        ambient.green !== light.green ||
        ambient.blue !== light.blue) {
        ambient.red = light.red
        ambient.green = light.green
        ambient.blue = light.blue
        const program = this.program
        const r = ambient.red / 255
        const g = ambient.green / 255
        const b = ambient.blue / 255
        // 更新以下GL程序的环境光变量
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
    GL.resizeLightMap = function (): void {
      const texture = this.reflectedLightMap
      const width = this.width
      const height = this.height
      if (texture.innerWidth !== width ||
        texture.innerHeight !== height) {
        texture.innerWidth = width
        texture.innerHeight = height
        if (texture.paddingLeft === undefined) {
          const {lightArea} = Data.config
          // 首次调用时计算光影纹理最大扩张值(4倍)
          texture.paddingLeft = Math.min(lightArea.expansionLeft * 4, 512)
          texture.paddingTop = Math.min(lightArea.expansionTop * 4, 512)
          texture.paddingRight = Math.min(lightArea.expansionRight * 4, 512)
          texture.paddingBottom = Math.min(lightArea.expansionBottom * 4, 512)
        }
        const pl = texture.paddingLeft
        const pt = texture.paddingTop
        const pr = texture.paddingRight
        const pb = texture.paddingBottom
        const tWidth = width + pl + pr
        const tHeight = height + pt + pb
        // 重置缩放率(将会重新计算纹理参数)
        texture.scale = 0
        texture.resize(tWidth, tHeight)
        this.bindTexture(this.TEXTURE_2D, null)
        this.updateLightTexSize()
      }
    }

    // WebGL上下文方法 - 更新光照纹理大小
    GL.updateLightTexSize = function (): void {
      const texture = this.reflectedLightMap
      if (texture.width === 0) return
      const width = this.drawingBufferWidth
      const height = this.drawingBufferHeight
      const sizeX = texture.width / width * 2
      const sizeY = texture.height / height * 2
      const centerX = (texture.paddingLeft + width / 2) / texture.width
      const centerY = (texture.paddingTop + height / 2) / texture.height
      const program = this.program
      // 更新以下GL程序的光照纹理参数
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

    // WebGL上下文方法 - 更新纹理采样器数量
    GL.updateSamplerNum = function (samplerNum: number): void {
      // 在旧版的Chrome中，不重置过期的采样器索引会被警告，因此这个算法被保留了下来
      const program = this.program
      if ('samplerNum' in program) {
        const lastNum = program.samplerNum
        // 如果采样器数量发生了变化
        if (lastNum !== samplerNum) {
          const u_Samplers = program.u_Samplers
          if (lastNum < samplerNum) {
            // 如果采样器数量增多，设置新增的采样器索引
            for (let i = lastNum; i < samplerNum; i++) {
              this.uniform1i(u_Samplers[i], i)
            }
          } else {
            // 如果采样器数量减少，重置过期的采样器索引
            for (let i = samplerNum; i < lastNum; i++) {
              this.uniform1i(u_Samplers[i], 0)
            }
          }
          program.samplerNum = samplerNum
        }
      }
    }

    // WebGL上下文方法 - 绑定帧缓冲对象
    GL.bindFBO = function (fbo: WebGLFramebuffer): void {
      this.binding = fbo
      this.flip = 1
      this.bindFramebuffer(this.FRAMEBUFFER, fbo)
    }

    // WebGL上下文方法 - 解除帧缓冲对象的绑定
    GL.unbindFBO = function (): void {
      this.binding = null
      this.flip = -1
      this.bindFramebuffer(this.FRAMEBUFFER, null)
    }

    // 设置视口大小(单位:像素)
    GL.setViewport = function (x: number, y: number, width: number, height: number): void {
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

    /** WebGL上下文方法 - 激活离屏渲染 */
    GL.enableOffscreen = function enableOffscreen() {
      const {unbindFBO, resetViewport} = GL

      // 离屏模式 - 解除帧缓冲对象的绑定
      function offscreenUnbindFBO(this: typeof GL) {
        this.binding = null
        this.flip = 1
        // 重新绑定到当前离屏纹理的FBO
        this.bindFramebuffer(this.FRAMEBUFFER, this.offscreen.current.fbo)
      }

      // 离屏模式 - 重置窗口大小
      function offscreenResetViewport(this: typeof GL) {
        const base = this.offscreen.current.base
        const width = base.width
        const height = base.height
        this.width = width
        this.height = height
        // 将视口设为当前离屏纹理的大小
        this.viewport(0, 0, width, height)
      }

      return function (this: typeof GL, enabled: boolean): void {
        const offscreen = this.offscreen
        if (offscreen.enabled !== enabled) {
          offscreen.enabled = enabled
          if (enabled) {
            // 如果启用，调整当前离屏纹理大小
            const texture = offscreen.current
            const width = this.drawingBufferWidth
            const height = this.drawingBufferHeight
            if (texture.base.width !== width ||
              texture.base.height !== height) {
              texture.resize(width, height)
            }
            // 替换成离屏渲染模式下的特定方法
            this.unbindFBO = offscreenUnbindFBO
            this.resetViewport = offscreenResetViewport
          } else {
            // 如果禁用，恢复默认的方法
            this.unbindFBO = unbindFBO
            this.resetViewport = resetViewport
          }
          this.unbindFBO()
        }
      }
    }()

    // WebGL上下文方法 - 切换离屏纹理
    GL.switchOffscreen = function (): void {
      const offscreen = this.offscreen
      // 如果启用了离屏渲染
      if (offscreen.enabled) {
        const texture = offscreen.last
        const width = this.drawingBufferWidth
        const height = this.drawingBufferHeight
        // 获取上次离屏纹理，并调整大小
        if (texture.base.width !== width ||
          texture.base.height !== height) {
          texture.resize(width, height)
        }
        // 交换上次和当前的离屏纹理
        offscreen.last = offscreen.current
        offscreen.current = texture
        // 绑定当前离屏纹理的FBO(offscreenUnbindFBO)
        this.unbindFBO()
      }
    }

    // WebGL上下文方法 - 调整画布大小
    GL.resize = function (width: number, height: number): void {
      const canvas = this.canvas
      // 尽量少的画布缓冲区重置次数
      if (canvas.width !== width) {
        canvas.width = width
      }
      if (canvas.height !== height) {
        canvas.height = height
      }
      if (this.width !== width ||
        this.height !== height) {
        // 更新画布大小参数和视口
        this.width = width
        this.height = height
        this.viewport(0, 0, width, height)
        this.maskTexture.resize(width, height)
        this.directLightMap.resize(width, height)
      }
      // 调整光影纹理
      this.resizeLightMap()
    }

    namespace: {
    const defTint: ImageTint = [0, 0, 0, 0]

    // WebGL上下文方法 - 绘制图像
    GL.drawImage = function (texture: Texture, dx: number, dy: number, dw: number, dh: number, tint: ImageTint = defTint): void {
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
      this.bindVertexArray(program.vao.a110)
      this.vertexAttrib1f(program.a_Opacity, 1)
      this.uniformMatrix3fv(program.u_Matrix, false, matrix)
      this.uniform1i(program.u_LightMode, 0)
      this.uniform1i(program.u_ColorMode, 0)
      this.uniform4f(program.u_Tint, red, green, blue, gray)
      this.bufferData(this.ARRAY_BUFFER, vertices, this.STREAM_DRAW, 0, 16)
      this.bindTexture(this.TEXTURE_2D, base.glTexture)
      this.drawArrays(this.TRIANGLE_FAN, 0, 4)
    }
    }

    // WebGL上下文方法 - 绘制指定颜色的图像
    GL.drawImageWithColor = function (texture: Texture, dx: number, dy: number, dw: number, dh: number, color: number): void {
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
      this.bindVertexArray(program.vao.a110)
      this.vertexAttrib1f(program.a_Opacity, 1)
      this.uniformMatrix3fv(program.u_Matrix, false, matrix)
      this.uniform1i(program.u_LightMode, 0)
      this.uniform1i(program.u_ColorMode, 1)
      this.uniform4f(program.u_Color, red, green, blue, gray)
      this.bufferData(this.ARRAY_BUFFER, vertices, this.STREAM_DRAW, 0, 16)
      this.bindTexture(this.TEXTURE_2D, base.glTexture)
      this.drawArrays(this.TRIANGLE_FAN, 0, 4)
    }

    // WebGL上下文方法 - 绘制切片图像
    GL.drawSliceImage = function (texture: ImageTexture, dx: number, dy: number, dw: number, dh: number, clip: ImageClip, border: number, tint: ImageTint): void {
      if (!texture.complete) return

      // 计算变换矩阵
      const matrix = Matrix.instance.project(
        this.flip,
        this.width,
        this.height,
      ).multiply(this.matrix)
      .translate(dx + 0.004, dy + 0.004)

      // 更新切片数据
      const sliceClip = texture.sliceClip!
      if (texture.sliceWidth !== dw ||
        texture.sliceHeight !== dh ||
        sliceClip[0] !== clip[0] ||
        sliceClip[1] !== clip[1] ||
        sliceClip[2] !== clip[2] ||
        sliceClip[3] !== clip[3] ||
        texture.sliceBorder !== border) {
        texture.updateSliceData(dw, dh, clip, border)
      }

      // 色调归一化
      const red = tint[0] / 255
      const green = tint[1] / 255
      const blue = tint[2] / 255
      const gray = tint[3] / 255

      // 上传数据
      const program = this.imageProgram.use()
      const vertices = texture.sliceVertices!
      const thresholds = texture.sliceThresholds!
      const count = texture.sliceCount!
      this.bindVertexArray(program.vao.a110)
      this.vertexAttrib1f(program.a_Opacity, 1)
      this.uniformMatrix3fv(program.u_Matrix, false, matrix)
      this.uniform1i(program.u_LightMode, 0)
      this.uniform1i(program.u_ColorMode, 2)
      this.uniform4f(program.u_Tint, red, green, blue, gray)
      this.bufferData(this.ARRAY_BUFFER, vertices, this.STREAM_DRAW, 0, count * 16)
      this.bindTexture(this.TEXTURE_2D, texture.base.glTexture)

      // 绘制切片
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
    GL.fillRect = function (dx: number, dy: number, dw: number, dh: number, color: number): void {
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

    // WebGL上下文方法 - 创建普通纹理
    GL.createNormalTexture = function (options: NormalTextureOptions = {}): BaseTexture {
      const texture = new BaseTexture(options)
      this.textureManager.append(texture)
      return texture
    }

    // WebGL上下文方法 - 创建图像纹理
    GL.createImageTexture = function (image: string | HTMLImageElement, options: ImageTextureOptions = {}): BaseTexture {
      const guid = image instanceof Image ? image.guid : image
      const manager = this.textureManager
      let texture = manager.images[guid]
      if (!texture) {
        texture = new BaseTexture(options)
        texture.guid = guid
        manager.append(texture)
        manager.images[guid] = texture
        const initialize = (image: HTMLImageElement) => {
          // 如果纹理还在管理器中，并且加载图像成功
          if (manager.images[guid] === texture && image) {
            texture!.width = Math.min(image.naturalWidth, this.maxTexSize)
            texture!.height = Math.min(image.naturalHeight, this.maxTexSize)
            // 上传RGBA格式的图像数据到纹理
            this.bindTexture(this.TEXTURE_2D, texture!.glTexture)
            this.texImage2D(this.TEXTURE_2D, 0, texture!.format, texture!.width, texture!.height, 0, texture!.format, this.UNSIGNED_BYTE, image)
            // 执行纹理已加载回调
            texture!.reply('load')
          } else {
            // 执行纹理加载错误回调
            texture!.reply('error')
          }
        }
        if (image instanceof HTMLImageElement) {
          initialize(image)
        } else {
          const image = Loader.getImage({guid})
          if (image instanceof HTMLImageElement) {
            initialize(image)
          } else {
            Loader.loadImage({guid}).then(initialize)
          }
        }
      }
      return texture.increaseRefCount()
    }

    // WebGL上下文方法 - 创建纹理帧缓冲对象
    GL.createTextureFBO = function (texture: FBOTexture): WebGLFramebuffer {
      const fbo = this.createFramebuffer()
      if (!fbo) {
        throw new Error('Failed to create frameBuffer')
      }

      // 创建深度模板缓冲区
      texture.depthStencilBuffer = this.createRenderbuffer()

      // 重写纹理方法 - 调整大小
      texture.resize = (width: number, height: number): FBOTexture => {
        Texture.prototype.resize.call(texture, width, height)

        this.bindFramebuffer(this.FRAMEBUFFER, fbo)

        // 绑定纹理到颜色缓冲区
        this.framebufferTexture2D(this.FRAMEBUFFER, this.COLOR_ATTACHMENT0, this.TEXTURE_2D, texture.base.glTexture, 0)

        // 调整深度模板缓冲区大小
        this.bindRenderbuffer(this.RENDERBUFFER, texture.depthStencilBuffer)
        this.framebufferRenderbuffer(this.FRAMEBUFFER, this.DEPTH_STENCIL_ATTACHMENT, this.RENDERBUFFER, texture.depthStencilBuffer)
        this.renderbufferStorage(this.RENDERBUFFER, this.DEPTH_STENCIL, width, height)
        this.bindRenderbuffer(this.RENDERBUFFER, null)
        this.bindFramebuffer(this.FRAMEBUFFER, null)
        return texture
      }

      texture.resize(texture.base.width, texture.base.height)
      return fbo
    }

    // 扩展方法 - 擦除画布
    CanvasRenderingContext2D.prototype.clear = function (): void {
      this.clearRect(0, 0, this.canvas.width, this.canvas.height)
    }

    // 扩展方法 - 调整画布大小
    CanvasRenderingContext2D.prototype.resize = function (width: number, height: number): void {
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
  }
}

/** ******************************** 基础纹理 ******************************** */

class BaseTexture {
  /** WebGL纹理 */
  public glTexture: WebGLTexture
  /** 纹理宽度 */
  public width: number
  /** 纹理高度 */
  public height: number
  /** 颜色格式 */
  public format: number
  /** 纹理放大过滤器 */
  public magFilter: number
  /** 纹理缩小过滤器 */
  public minFilter: number
  /** 纹理坐标水平填充 */
  public wrapS: number
  /** 纹理坐标垂直填充 */
  public wrapT: number
  /** 纹理索引 */
  public index: number
  /** 图像GUID */
  public guid: string
  /** 引用计数 */
  public refCount: number
  /** 回调函数列表 */
  private callbacks: any

  constructor(options: NormalTextureOptions = {}) {
    this.glTexture = GL.createTexture()!
    this.width = 0
    this.height = 0
    this.format = options.format ?? GL.RGBA
    this.magFilter = options.magFilter ?? WebGL.textureOptions.magFilter
    this.minFilter = options.minFilter ?? WebGL.textureOptions.minFilter
    this.wrapS = options.wrapS ?? WebGL.textureOptions.wrapS
    this.wrapT = options.wrapT ?? WebGL.textureOptions.wrapT
    this.index = -1
    this.guid = ''
    this.refCount = 0
    // 绑定GL纹理
    GL.bindTexture(GL.TEXTURE_2D, this.glTexture)
    // 设置纹理放大和缩小采样过滤器
    GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MAG_FILTER, this.magFilter)
    GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, this.minFilter)
    // 设置纹理水平和垂直坐标包装器
    GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_S, this.wrapS)
    GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_T, this.wrapT)
  }

  /**
   * 增加引用计数
   * @returns 当前纹理
   */
  public increaseRefCount(): this {
    this.refCount++
    return this
  }

  /**
   * 减少引用计数
   * @returns 当前纹理
   */
  public decreaseRefCount(): this {
    this.refCount--
    return this
  }

  /**
   * 设置加载回调函数
   * @param type 回调事件类型
   * @param callback 回调函数
   */
  public on(type: string, callback: (texture: this) => void): void {
    // 如果已加载完成，立即执行回调
    let callbacks = this.callbacks
    if (callbacks === type) {
      callback(this)
      return
    }
    // 首次调用，创建加载回调缓存
    if (callbacks === undefined) {
      callbacks = this.callbacks =
      {load: [], error: []}
    }
    // 如果未加载完成，添加回调到缓存中
    if (typeof callbacks === 'object') {
      callbacks[type].push(callback)
    }
  }

  /**
   * 执行加载回调函数
   * @param type 回调事件类型
   */
  public reply(type: string): void {
    const callbacks = this.callbacks
    if (typeof callbacks === 'object') {
      // 调用所有的纹理加载回调
      for (const callback of callbacks[type]) {
        callback(this)
      }
    }
    // 将缓存替换为类型名称
    this.callbacks = type
  }
}

/** ******************************** 纹理 ******************************** */

class Texture {
  /** 是否已完成加载 */
  public complete!: boolean
  /** 是否已销毁 */
  public destroyed!: boolean
  /** 基础纹理 */
  public base!: BaseTexture
  /** WebGL上下文 */
  protected gl!: WebGL2RenderingContext
  /** 纹理裁剪X */
  public x!: number
  /** 纹理裁剪Y */
  public y!: number
  /** 纹理宽度 */
  public width!: number
  /** 纹理高度 */
  public height!: number

  /**
   * 普通纹理封装对象
   * @param options 普通纹理选项
   */
  constructor(options?: NormalTextureOptions) {
    if (new.target !== Texture) {
      return
    }

    // 设置属性
    this.complete = true
    this.destroyed = false
    this.base = GL.createNormalTexture(options)
    this.gl = GL
    this.x = 0
    this.y = 0
    this.width = 0
    this.height = 0
  }

  /**
   * 裁剪纹理
   * @param x 水平位置
   * @param y 垂直位置
   * @param width 裁剪宽度
   * @param height 裁剪高度
   * @returns 当前纹理
   */
  public clip(x: number, y: number, width: number, height: number): this {
    this.x = x
    this.y = y
    this.width = width
    this.height = height
    return this
  }

  /**
   * 擦除纹理中的像素
   * @param red 默认红色
   * @param green 默认绿色
   * @param blue 默认蓝色
   * @param alpha 默认不透明度
   */
  public clear(red: number = 0, green: number = 0, blue: number = 0, alpha: number = 0): void {
    const gl = this.gl
    gl.bindFBO(gl.frameBuffer)
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.base.glTexture, 0)
    gl.clearColor(red, green, blue, alpha)
    gl.clear(gl.COLOR_BUFFER_BIT)
    gl.unbindFBO()
  }

  /**
   * 调整纹理大小
   * @param width 纹理宽度
   * @param height 纹理高度
   * @returns 当前纹理
   */
  public resize(width: number, height: number): Texture {
    const {gl, base} = this
    const {format} = base
    base.width = Math.min(width, gl.maxTexSize)
    base.height = Math.min(height, gl.maxTexSize)
    gl.bindTexture(gl.TEXTURE_2D, base.glTexture)
    // 此处调整纹理大小后不立即写入数据会被Firefox警告，若只是为了消除警告而上传数据代价很大，不管它
    gl.texImage2D(gl.TEXTURE_2D, 0, format, base.width, base.height, 0, format, gl.UNSIGNED_BYTE, null)
    return this.clip(0, 0, base.width, base.height)
  }

  /**
   * 从图像中取样
   * @param image HTML图像或画布元素
   * @returns 当前纹理
   */
  public loadImage(image: HTMLImageElement | HTMLCanvasElement): Texture {
    // 上传空图像会被Chromium警告
    if (image.width === 0 && image.height === 0) {
      return this.resize(0, 0)
    }
    const gl = this.gl
    const base = this.base
    const format = base.format
    base.width = Math.min(image.width, gl.maxTexSize)
    base.height = Math.min(image.height, gl.maxTexSize)
    gl.bindTexture(gl.TEXTURE_2D, base.glTexture)
    gl.texImage2D(gl.TEXTURE_2D, 0, format, base.width, base.height, 0, format, gl.UNSIGNED_BYTE, image)
    return this.clip(0, 0, base.width, base.height)
  }

  /**
   * 获取图像像素数据
   * @param x 水平位置
   * @param y 垂直位置
   * @param width 裁剪宽度
   * @param height 裁剪高度
   * @returns 图像像素数据
   */
  public getImageData(x: number, y: number, width: number, height: number): ImageData | null {
    if (this.destroyed) return null
    const gl = this.gl
    const canvas = document.createElement('canvas')
    canvas.width = canvas.height = 0
    const context = canvas.getContext('2d')!
    const imageData = context.createImageData(width, height)
    const {buffer, length} = imageData.data
    const uint8 = new Uint8Array(buffer, 0, length)
    gl.bindFramebuffer(gl.FRAMEBUFFER, gl.frameBuffer)
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.base.glTexture, 0)
    gl.readPixels(x, y, width, height, gl.RGBA, gl.UNSIGNED_BYTE, uint8)
    gl.binding ? gl.bindFBO(gl.binding) : gl.unbindFBO()
    return imageData
  }

  /**
   * 自适应裁剪图像并缩放到指定大小
   * 再转换为BASE64编码
   * @param width 目标图像宽度
   * @param height 目标图像高度
   * @returns BASE64
   */
  public toBase64(width: number, height: number): string {
    const texture = new Texture()
    texture.resize(width, height)
    const tx = this.x
    const ty = this.y
    const tw = this.width
    const th = this.height
    const bw = this.base.width
    const bh = this.base.height
    let sx, sy, sw, sh
    if (width / height >= bw / bh) {
      sw = bw
      sh = Math.round(bw * height / width)
      sx = 0
      sy = bh - sh >> 1
    } else {
      sw = Math.round(bh * width / height)
      sh = bh
      sx = bw - sw >> 1
      sy = 0
    }
    const gl = this.gl
    this.clip(sx, sy, sw, sh)
    gl.reset()
    gl.bindFBO(gl.frameBuffer)
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture.base.glTexture, 0)
    gl.drawImage(this, 0, 0, width, height)
    gl.unbindFBO()
    this.clip(tx, ty, tw, th)
    const imageData = texture.getImageData(0, 0, width, height)!
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const context = canvas.getContext('2d')!
    context.putImageData(imageData, 0, 0)
    texture.destroy()
    return canvas.toDataURL()
  }

  /** 销毁纹理 */
  public destroy(): void {
    if (!this.destroyed) {
      this.destroyed = true
      this.complete = false
      this.gl.textureManager.delete(this.base)
    }
  }
}

/** ******************************** 图像纹理 ******************************** */

class ImageTexture extends Texture {
  /** 切片裁剪区域数组 */
  public sliceClip?: Uint32Array
  /** 切片顶点数组 */
  public sliceVertices?: Float32Array
  /** 切片阈值数组 */
  public sliceThresholds?: Float32Array
  /** 切片宽度 */
  public sliceWidth?: number
  /** 切片高度 */
  public sliceHeight?: number
  /** 切片边框宽度 */
  public sliceBorder?: number
  /** 切片计数 */
  public sliceCount?: number

  /**
   * 图像纹理封装对象
   * @param image 图像文件ID或HTML图像元素
   * @param options 图像纹理选项
   */
  constructor(image: string | HTMLImageElement, options?: ImageTextureOptions) {
    super(options)

    // 设置属性
    const texture = GL.createImageTexture(image, options)
    this.complete = false
    this.destroyed = false
    this.base = texture
    this.gl = GL
    this.x = 0
    this.y = 0
    this.width = 0
    this.height = 0

    // 设置基础纹理已加载回调
    texture.on('load', () => {
      if (this.base === texture) {
        // 如果没有被销毁，执行包装纹理的回调
        this.complete = true
        this.width = this.width || texture.width
        this.height = this.height || texture.height
        this.reply('load')
      }
    })
    // 设置基础纹理加载错误回调
    texture.on('error', () => {
      this.destroy()
      this.reply('error')
    })
  }

  /**
   * 更新图像切片数据
   * @param width 绘制区域宽度
   * @param height 绘制区域高度
   * @param clip 图像裁剪区域
   * @param border 切片边框宽度
   */
  public updateSliceData(width: number, height: number, clip: ImageClip, border: number): void {
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
    const vertices = this.sliceVertices!
    const thresholds = this.sliceThresholds!
    let vi = 0
    let ti = 0

    // 设置切片的顶点数据
    const setVertices = (sx: number, sy: number, sw: number, sh: number, dx: number, dy: number, dw: number, dh: number): void => {
      // 如果是无效顶点数据，返回
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
    Array.fill(this.sliceClip as any, clip)
    this.sliceWidth = width
    this.sliceHeight = height
    this.sliceBorder = border
    this.sliceCount = vi / 16
  }

  /** 销毁图像纹理 */
  public destroy(): void {
    if (!this.destroyed) {
      this.destroyed = true
      this.complete = false
      this.base.decreaseRefCount()
    }
  }

  /**
   * 设置加载回调
   * @param type 回调事件类型
   * @param callback 回调函数
   */
  public on(type: string, callback: (texture: this) => void): void {
    BaseTexture.prototype.on.call(this, type, callback as any)
  }

  /**
   * 执行加载回调
   * @param type 回调事件类型
   */
  private reply(type: string): void {
    BaseTexture.prototype.reply.call(this, type)
  }
}

/** ******************************** 纹理管理器 ******************************** */

class TextureManager {
  /** WebGL上下文 */
  private gl: WebGL2RenderingContext
  /** {索引:基础纹理}映射表 */
  public map: HashMap<BaseTexture>
  /** {图像ID:基础纹理}映射表 */
  public images: HashMap<BaseTexture>
  /** 从这个索引开始查找映射表的空缺位置 */
  private pointer: number
  /** 有效WebGL纹理的数量 */
  public count: number

  /** 纹理管理器 */
  constructor() {
    this.gl = GL
    this.map = {}
    this.images = {}
    this.pointer = 0
    this.count = 0
  }

  /** 更新纹理 */
  public update(): void {
    const {gl, map, images} = this
    for (const texture of Object.values(images) as Array<BaseTexture>) {
      // 删除不再引用的图像纹理
      if (texture.refCount === 0) {
        gl.deleteTexture(texture.glTexture)
        delete images[texture.guid]
        delete map[texture.index]
        this.count--
        if (this.pointer > texture.index) {
          this.pointer = texture.index
        }
      }
    }
  }

  /**
   * 添加基础纹理到管理器中
   * @param texture 基础纹理
   */
  public append(texture: BaseTexture): void {
    if (texture.index === -1) {
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

  /**
   * 从管理器中删除基础纹理
   * @param texture 基础纹理
   */
  public delete(texture: BaseTexture): void {
    const i = texture.index
    const {gl, map} = this
    gl.deleteTexture(texture.glTexture)
    // 通过索引删除映射表中的纹理
    if (map[i] === texture) {
      delete map[i]
      this.count--
      if (this.pointer > i) {
        this.pointer = i
      }
    }
  }
}

/** ******************************** 批量渲染器 ******************************** */

class BatchRenderer {
  /** 响应数据[顶点结束索引, 纹理采样器索引] */
  public response: Uint32Array
  /** 设置属性大小 */
  public setAttrSize: (size: number) => void
  /** 获取结束索引 */
  public getEndIndex: () => number
  /** 设置混合模式 */
  public setBlendMode: (blend: BlendingMode) => void
  /** 绑定当前GL程序 */
  public bindProgram: () => void
  /** 解除绑定GL程序 */
  public unbindProgram: () => void
  /** 推送绘制数据 */
  public push: (texIndex: number) => void
  /** 绘制图像 */
  public draw: () => void

  /**
   * 批量渲染器
   * @param gl WebGL上下文对象
   */
  constructor(gl: WebGL2RenderingContext) {
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
    let blendingMode: BlendingMode = 'normal'
    let program: ActiveWebGLProgram | null = null

    // 设置属性大小
    const setAttrSize = (size: number) => {
      attrSize = size
    }

    // 获取结束索引
    const getEndIndex = () => {
      return endIndex
    }

    // 设置混合模式
    const setBlendMode = (blend: BlendingMode) => {
      // 改变混合模式前，绘制队列中的内容
      if (blendingMode !== blend) {
        draw()
        blendingMode = blend
      }
    }

    // 绑定当前GL程序(中途切换程序可恢复)
    const bindProgram = () => {
      program = gl.program
    }

    // 解除绑定GL程序
    const unbindProgram = () => {
      program = null
    }

    // 推送绘制数据
    const push = (texIndex: number) => {
      // 以纹理索引为键获取采样器索引
      let samplerIndex = samplers[texIndex]
      // 如果不存在采样器索引，添加一个
      if (samplerIndex === -1) {
        samplerIndex = samplerLength
        // 如果采样器索引已用完
        if (samplerIndex === texUnits) {
          // 重置采样器索引映射表
          for (let i = 0; i < samplerLength; i++) {
            samplers[queue[queueIndex + i]] = -1
          }
          // 获取当前队列尾部索引
          const offset = queueIndex + texUnits
          // 在队列尾部记录采样器数量、起始索引和结束索引
          queue[offset    ] = samplerLength
          queue[offset + 1] = startIndex
          queue[offset + 2] = endIndex
          // 调整起始索引和队列索引
          startIndex = endIndex
          queueIndex += step
          // 重置采样器数量和索引
          samplerLength = 0
          samplerIndex = 0
        }
        // 设置队列中当前采样器偏移位置为纹理索引
        queue[queueIndex + samplerIndex] = texIndex
        // 设置采样器映射表：纹理索引 -> 采样器索引
        samplers[texIndex] = samplerIndex
        // 递增采样器数量
        samplerLength += 1
      }
      // 写入结束索引和采样器索引到返回数组中
      response[0] = endIndex
      response[1] = samplerIndex
      // 结束索引增加4表示跳跃了4个顶点
      endIndex += 4
    }

    // 绘制图像
    const draw = () => {
      // 如果存在顶点数据
      if (endIndex !== 0) {
        if (samplerLength !== 0) {
          // 重置采样器索引映射表
          for (let i = 0; i < samplerLength; i++) {
            samplers[queue[queueIndex + i]] = -1
          }
          // 获取当前队列尾部索引
          const offset = queueIndex + texUnits
          // 在队列尾部记录采样器数量、起始索引和结束索引
          queue[offset    ] = samplerLength
          queue[offset + 1] = startIndex
          queue[offset + 2] = endIndex
          // 调整队列索引
          queueIndex += step
          // 重置采样器数量
          samplerLength = 0
        }
        // 如果绑定了GL程序，恢复GL程序和VAO
        if (program !== null && program !== gl.program) {
          program.use()
          gl.bindVertexArray(program.vao)
        }
        const vLength = endIndex * attrSize
        if (vLength > 0) {
          // 上传数据到数组缓冲区(当属性大小为0时，需要手动上传数据)
          gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STREAM_DRAW, 0, vLength)
        }
        gl.blend = blendingMode
        gl.updateBlending()
        // 遍历队列的区间
        // 每个区间长度是step，前面texUnits个数据是纹理索引
        // 后面3个数据分别是采样器数量、起始索引和结束索引
        for (let qi = 0; qi < queueIndex; qi += step) {
          const offset = qi + step
          const length = queue[offset - 3]
          const start = queue[offset - 2] * 1.5
          const end = queue[offset - 1] * 1.5
          for (let si = length - 1; si >= 0; si--) {
            // 绑定采样器到对应的WebGL纹理(通过纹理索引获取)
            gl.activeTexture(gl.TEXTURE0 + si)
            gl.bindTexture(gl.TEXTURE_2D, texMap[queue[qi + si]]!.glTexture)
          }
          // 更新采样器数量并绘制图像
          gl.updateSamplerNum(length)
          gl.drawElements(gl.TRIANGLES, end - start, gl.UNSIGNED_INT, start * 4)
        }
        // 重置队列参数
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

/** ******************************** 平面矩阵 ******************************** */

class Matrix extends Float32Array {
  /** 平面矩阵 */
  constructor() {
    super(9)
    this[0] = 1
    this[4] = 1
    this[8] = 1
  }

  /**
   * 重置矩阵
   * @returns 当前矩阵
   */
  public reset(): this {
    this[0] = 1
    this[1] = 0
    this[3] = 0
    this[4] = 1
    this[6] = 0
    this[7] = 0
    return this
  }

  /**
   * 设置为目标矩阵的参数
   * @param matrix 目标矩阵
   * @returns 当前矩阵
   */
  public set(matrix: Matrix): this {
    this[0] = matrix[0]
    this[1] = matrix[1]
    this[3] = matrix[3]
    this[4] = matrix[4]
    this[6] = matrix[6]
    this[7] = matrix[7]
    return this
  }

  /**
   * 设置矩阵参数
   * @param a 矩阵参数[0]
   * @param b 矩阵参数[1]
   * @param c 矩阵参数[3]
   * @param d 矩阵参数[4]
   * @param e 矩阵参数[6]
   * @param f 矩阵参数[7]
   * @returns 当前矩阵
   */
  public set6f(a: number, b: number, c: number, d: number, e: number, f: number): this {
    this[0] = a
    this[1] = b
    this[3] = c
    this[4] = d
    this[6] = e
    this[7] = f
    return this
  }

  /**
   * 乘以目标矩阵
   * @param matrix 目标矩阵
   * @returns 当前矩阵
   */
  public multiply(matrix: Matrix): this {
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

  /**
   * 旋转
   * @param angle 旋转角度(弧度)
   * @returns 当前矩阵
   */
  public rotate(angle: number): this {
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

  /**
   * 在指定点旋转
   * @param x 旋转位置X
   * @param y 旋转位置Y
   * @param angle 旋转角度(弧度)
   * @returns 当前矩阵
   */
  public rotateAt(x: number, y: number, angle: number): this {
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

  /**
   * 缩放
   * @param h 水平缩放系数
   * @param v 垂直缩放系数
   * @returns 当前矩阵
   */
  public scale(h: number, v: number): this {
    this[0] *= h
    this[1] *= h
    this[3] *= v
    this[4] *= v
    return this
  }

  /**
   * 在指定点缩放
   * @param x 缩放位置X
   * @param y 缩放位置Y
   * @param h 水平缩放系数
   * @param v 垂直缩放系数
   * @returns 当前矩阵
   */
  public scaleAt(x: number, y: number, h: number, v: number): this {
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

  /**
   * 平移
   * @param x 水平偏移距离
   * @param y 垂直偏移距离
   * @returns 当前矩阵
   */
  public translate(x: number, y: number): this {
    this[6] += this[0] * x + this[3] * y
    this[7] += this[1] * x + this[4] * y
    return this
  }

  /**
   * 垂直平移
   * @param y 水平偏移距离
   * @returns 当前矩阵
   */
  public translateY(y: number): this {
    this[6] += this[3] * y
    this[7] += this[4] * y
    return this
  }

  /**
   * 在指定点倾斜
   * @param x 倾斜位置X
   * @param y 倾斜位置Y
   * @param h 水平倾斜系数
   * @param v 垂直倾斜系数
   * @returns 当前矩阵
   */
  public skewAt(x: number, y: number, h: number, v: number): this {
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

  /**
   * 水平镜像
   * @returns 当前矩阵
   */
  public mirrorh(): this {
    this[0] = -this[0]
    this[3] = -this[3]
    return this
  }

  /**
   * 垂直镜像
   * @returns 当前矩阵
   */
  public mirrorv(): this {
    this[1] = -this[1]
    this[4] = -this[4]
    return this
  }

  /**
   * 投影
   * @param flip 是否垂直翻转(-1或1)
   * @param width 屏幕宽度
   * @param height 屏幕高度
   * @returns 当前矩阵
   */
  public project(flip: number, width: number, height: number): this {
    this[0] = 2 / width
    this[1] = 0
    this[3] = 0
    this[4] = 2 * flip / height
    this[6] = -1
    this[7] = -flip
    return this
  }

  /** 平面矩阵实例(公共实例) */
  public static instance: Matrix = new Matrix()
}