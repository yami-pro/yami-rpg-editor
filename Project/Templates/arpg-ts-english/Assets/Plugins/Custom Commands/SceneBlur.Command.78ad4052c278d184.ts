/*
@plugin #plugin
@version
@author
@link
@desc

@option operation {'enable', 'disable'}
@alias #operation {#enable, #disable}

@number blurriness
@cond operation {'enable'}
@alias #blurriness
@clamp 10 20
@default 20

@easing easingId
@alias #easingId

@number duration
@alias #duration
@clamp 0 1000
@default 500

@lang en
#plugin Blurriness
#operation Operation
#enable Enable
#disable Disable
#blurriness Blurriness
#easingId Easing
#duration Duration(ms)

@lang ru
#plugin Размытость
#operation Операция
#enable Включить
#disable Выключить
#blurriness Размытость
#easingId Плавность
#duration Продолж-сть(ms)

@lang zh
#plugin 场景模糊
#operation 操作
#enable 启用
#disable 禁用
#blurriness 模糊强度
#easingId 过渡方式
#duration 持续时间(毫秒)
*/

interface WebGLBlurProgram extends WebGLImageProgram {
  u_Offset: WebGLUniformLocation
  use(): WebGLBlurProgram
}

export default class BlurCommand implements Script<Command> {
  operation!: string
  blurriness!: number
  easingId!: string
  duration!: number
  program!: WebGLBlurProgram
  state: 'on' | 'off' | 'turning-on' | 'turning-off' = 'off'
  elapsed: number = 0
  blurTimes: number = 0
  blurStartTimes: number = 0
  blurEndTimes: number = 0

  onStart(): void {
    this.program = this.createProgram()
  }

  call(event: EventHandler): void {
    switch (this.operation) {
      case 'enable':
        //@ts-ignore
        Scene.filters.append(this)
        this.state = 'turning-on'
        this.elapsed = 0
        this.blurStartTimes = this.blurTimes
        this.blurEndTimes = this.blurriness
        break
      case 'disable':
        this.state = 'turning-off'
        this.elapsed = 0
        this.blurStartTimes = this.blurTimes
        this.blurEndTimes = 0
        break
    }
  }

  transit(): number {
    this.elapsed += Time.rawDeltaTime
    const elapsed = this.elapsed
    const duration = this.duration
    const start = this.blurStartTimes
    const end = this.blurEndTimes
    const easing = Easing.get(this.easingId)
    const time = elapsed < duration ? easing.get(elapsed / duration) : 1
    this.blurTimes = start * (1 - time) + end * time
    return time
  }

  render(): void {
    switch (this.state) {
      case 'turning-on':
        if (this.transit() === 1) {
          this.state = 'on'
        }
        break
      case 'turning-off':
        if (this.transit() === 1) {
          this.state = 'off'
          Scene.filters.remove(this)
        }
        break
    }
    GL.blend = 'copy'
    const program = this.program.use()
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
    GL.bindVertexArray(program.vao)
    GL.uniformMatrix3fv(program.u_Matrix, false, GL.matrix.reset())
    GL.bufferData(GL.ARRAY_BUFFER, vertices, GL.STREAM_DRAW, 0, 16)
    // 重复绘制高斯模糊画面
    for (let i = 1; i <= this.blurTimes; i++) {
      GL.switchOffscreen()
      GL.uniform2f(program.u_Offset, i / GL.width, i / GL.height)
      GL.bindTexture(GL.TEXTURE_2D, GL.offscreen.last.base.glTexture)
      GL.drawArrays(GL.TRIANGLE_FAN, 0, 4)
    }
  }

  createProgram(): WebGLBlurProgram {
    const program = GL.createProgramWithShaders(
      `
    attribute   vec2        a_Position;
    attribute   vec2        a_TexCoord;
    uniform     mat3        u_Matrix;
    varying     vec2        v_TexCoord;

    void main() {
      gl_Position.xyw = u_Matrix * vec3(a_Position, 1.0);
      gl_Position.y = -gl_Position.y;
      v_TexCoord = a_TexCoord;
    }
    `,
      `
    precision   highp       float;
    varying     vec2        v_TexCoord;
    uniform     sampler2D   u_Sampler;
    uniform     vec2        u_Offset;

    void main() {
      gl_FragColor = texture2D(u_Sampler, fract(v_TexCoord)) * 0.147761;
      gl_FragColor += texture2D(u_Sampler, max(v_TexCoord + vec2(-u_Offset.x, 0.0), 0.0)) * 0.118318;
      gl_FragColor += texture2D(u_Sampler, min(v_TexCoord + vec2(u_Offset.x, 0.0), 1.0)) * 0.118318;
      gl_FragColor += texture2D(u_Sampler, min(v_TexCoord + vec2(0.0, u_Offset.y), 1.0)) * 0.118318;
      gl_FragColor += texture2D(u_Sampler, max(v_TexCoord + vec2(0.0, -u_Offset.y), 0.0)) * 0.118318;
      gl_FragColor += texture2D(u_Sampler, max(v_TexCoord + vec2(-u_Offset.x, -u_Offset.y), 0.0)) * 0.0947416;
      gl_FragColor += texture2D(u_Sampler, min(v_TexCoord + vec2(u_Offset.x, u_Offset.y), 1.0)) * 0.0947416;
      gl_FragColor += texture2D(u_Sampler, clamp(v_TexCoord + vec2(-u_Offset.x, u_Offset.y), 0.0, 1.0)) * 0.0947416;
      gl_FragColor += texture2D(u_Sampler, clamp(v_TexCoord + vec2(u_Offset.x, -u_Offset.y), 0.0, 1.0)) * 0.0947416;
      if (gl_FragColor.a == 0.0) discard;
    }
    `,
    ) as WebGLBlurProgram
    GL.useProgram(program)

    // 顶点着色器属性
    const a_Position = GL.getAttribLocation(program, 'a_Position')
    const a_TexCoord = GL.getAttribLocation(program, 'a_TexCoord')
    const u_Matrix = GL.getUniformLocation(program, 'u_Matrix')!

    // 片元着色器属性
    const u_Offset = GL.getUniformLocation(program, 'u_Offset')!

    // 创建顶点数组对象
    const vao = GL.createVertexArray() as WebGLVertexArrayObjectImage
    GL.bindVertexArray(vao)
    GL.enableVertexAttribArray(a_Position)
    GL.enableVertexAttribArray(a_TexCoord)
    GL.bindBuffer(GL.ARRAY_BUFFER, GL.vertexBuffer)
    GL.vertexAttribPointer(a_Position, 2, GL.FLOAT, false, 16, 0)
    GL.vertexAttribPointer(a_TexCoord, 2, GL.FLOAT, false, 16, 8)
    GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, GL.elementBuffer)

    // 使用程序对象
    const use = () => {
      if (GL.program !== program) {
        GL.program = program
        GL.useProgram(program)
      }
      GL.updateBlending()
      return program
    }

    // 保存程序对象
    program.use = use
    program.vao = vao
    program.a_Position = a_Position
    program.a_TexCoord = a_TexCoord
    program.u_Matrix = u_Matrix
    program.u_Offset = u_Offset
    return program.use()
  }
}