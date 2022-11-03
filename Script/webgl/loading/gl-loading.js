'use strict'

import { GL } from '../gl.js'
import { Matrix } from '../matrix.js'
import { Texture } from '../texture.js'
import { TextureManager } from '../texture-manager.js'
import { BaseTexture } from '../base-texture.js'
import { BatchRenderer } from '../batch-renderer.js'

import { File } from '../../file-system/file.js'
import { Data } from '../../data/data.js'

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
  this.lightmap.base.protected = true
  this.lightmap.fbo = this.createTextureFBO(this.lightmap)
  this.activeTexture(this.TEXTURE0 + this.maxTexUnits - 1)
  this.bindTexture(this.TEXTURE_2D, this.lightmap.base.glTexture)
  this.activeTexture(this.TEXTURE0)

  // 创建模板纹理
  this.stencilTexture = this.stencilTexture ?? new Texture({format: this.ALPHA})
  this.stencilTexture.base.protected = true

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
    uniform     float       u_Contrast;
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
        return texture2D(u_LightSampler, lightCoord).rgb * u_Contrast;
      }
      if (u_LightMode == 3) {
        return u_Ambient * u_Contrast;
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
    uniform     float       u_Alpha;
    uniform     int         u_ColorMode;
    uniform     vec4        u_Color;
    uniform     vec4        u_Tint;
    uniform     vec4        u_Repeat;
    uniform     float       u_Contrast;
    uniform     sampler2D   u_Sampler;
    uniform     sampler2D   u_LightSampler;

    vec3 getLightColor() {
      if (v_LightColor.z != -1.0) return v_LightColor;
      return texture2D(u_LightSampler, v_LightColor.xy).rgb * u_Contrast;
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
  const u_Contrast = this.getUniformLocation(program, 'u_Contrast')
  const u_LightMode = this.getUniformLocation(program, 'u_LightMode')
  const u_LightCoord = this.getUniformLocation(program, 'u_LightCoord')
  const u_LightTexSize = this.getUniformLocation(program, 'u_LightTexSize')
  this.uniform1i(this.getUniformLocation(program, 'u_LightSampler'), this.maxTexUnits - 1)

  // 片元着色器属性
  const u_Alpha = this.getUniformLocation(program, 'u_Alpha')
  const u_ColorMode = this.getUniformLocation(program, 'u_ColorMode')
  const u_Color = this.getUniformLocation(program, 'u_Color')
  const u_Tint = this.getUniformLocation(program, 'u_Tint')
  const u_Repeat = this.getUniformLocation(program, 'u_Repeat')

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
    this.updateBlending()
    return program
  }

  // 保存程序对象
  program.use = use
  program.vao = vao
  program.alpha = 0
  program.a_Position = a_Position
  program.a_TexCoord = a_TexCoord
  program.u_Matrix = u_Matrix
  program.u_Ambient = u_Ambient
  program.u_Contrast = u_Contrast
  program.u_LightMode = u_LightMode
  program.u_LightCoord = u_LightCoord
  program.u_LightTexSize = u_LightTexSize
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
    uniform     float       u_Contrast;
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
        return u_Ambient * u_Contrast;
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
    uniform     float       u_Contrast;
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
      return texture2D(u_LightSampler, v_LightColor.xy).rgb * u_Contrast;
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
  const u_Contrast = this.getUniformLocation(program, 'u_Contrast')
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
  program.u_Contrast = u_Contrast
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
    uniform     float       u_Threshold;
    uniform     sampler2D   u_Sampler;

    void main() {
      float texAlpha = texture2D(u_Sampler, v_TexCoord).a;
      if (texAlpha == 0.0 || texAlpha < u_Threshold) {
        discard;
      }
      gl_FragColor.rgb = v_TextColor.rgb;
      gl_FragColor.a = u_Threshold == 0.0
      ? v_TextColor.a * u_Alpha * texAlpha
      : v_TextColor.a * u_Alpha;
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
    uniform     float       u_Contrast;
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
        return texture2D(u_LightSampler, a_LightCoord).rgb * u_Contrast;
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
    uniform     float       u_Contrast;
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
      return texture2D(u_LightSampler, v_LightColor.xy).rgb * u_Contrast;
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
  const u_Contrast = this.getUniformLocation(program, 'u_Contrast')
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
  program.u_Contrast = u_Contrast
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
    uniform     mat3        u_Matrix;
    varying     vec2        v_TexCoord;
    varying     vec4        v_Color;

    void main() {
      gl_Position.xyw = u_Matrix * vec3(a_Position, 1.0);
      v_TexCoord = a_TexCoord;
      v_Color = a_Color;
    }
    `,
    `
    precision   highp       float;
    varying     vec2        v_TexCoord;
    varying     vec4        v_Color;
    uniform     float       u_Alpha;
    uniform     int         u_Mode;
    uniform     vec4        u_Tint;
    uniform     sampler2D   u_Sampler;

    void main() {
      if (u_Mode == 0) {
        float alpha = texture2D(u_Sampler, v_TexCoord).a;
        gl_FragColor.a = alpha * v_Color.a * u_Alpha;
        if (gl_FragColor.a == 0.0) {
          discard;
        }
        gl_FragColor.rgb = v_Color.rgb;
        return;
      }
      if (u_Mode == 1) {
        gl_FragColor = texture2D(u_Sampler, v_TexCoord);
        gl_FragColor.a *= v_Color.a * u_Alpha;
        if (gl_FragColor.a == 0.0) {
          discard;
        }
        gl_FragColor.rgb = gl_FragColor.rgb * (1.0 - u_Tint.a) + u_Tint.rgb +
        dot(gl_FragColor.rgb, vec3(0.299, 0.587, 0.114)) * u_Tint.a;
        return;
      }
    }
    `,
  )
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

    vec3 computeLightColor() {
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
      gl_FragColor = vec4(computeLightColor(), 1.0);
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
  const B = {
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

// WebGL上下文方法 - 绘制文字
GL.drawText = function (texture, dx, dy, dw, dh, color) {
  if (!texture.complete) return

  const program = this.textProgram.use()
  const vertices = this.arrays[0].float32
  const colors = this.arrays[0].uint32
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
  const context = canvas.getContext('2d')

  // 扩展方法 - 调整画布大小
  context.resize = function (width, height) {
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

  return context
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

// 初始化WebGL上下文
GL.initialize()
