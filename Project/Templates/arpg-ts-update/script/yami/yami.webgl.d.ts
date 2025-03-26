/** WebGL2渲染上下文接口 */
interface WebGL2RenderingContext {
  /** 是否垂直翻转渲染(Y轴系数) */
  flip: 1 | -1
  /** 不透明度 */
  alpha: number
  /** 混合模式 */
  blend: BlendingMode
  /** 平面矩阵 */
  matrix: Matrix
  /** 画布宽度 */
  width: number
  /** 画布高度 */
  height: number
  /** 当前程序 */
  program: ActiveWebGLProgram
  /** 当前绑定FBO */
  binding: WebGLFramebuffer | null
  /** 是否处于遮罩模式 */
  masking: boolean
  /** 是否开启深度检测 */
  depthTest: boolean
  /**
   * 最大纹理尺寸
   * - PC: 16384, Mobile: 4096，超过会出错
   * - 如果需要兼容移动设备，使用4096x4096分辨率以内的图像文件
   */
  maxTexSize: number
  /** 环境光对象 */
  ambient: {
    red: number
    green: number
    blue: number
  }
  /** 纹理管理器 */
  textureManager: TextureManager
  /** 最大绑定纹理数量(通常是16) */
  maxTexUnits: number
  /** 反射光纹理 */
  reflectedLightMap: ReflectedLightTexture
  /** 直射光纹理 */
  directLightMap: DirectLightTexture
  /** 模板纹理 */
  stencilTexture: Texture
  /** 遮罩纹理 */
  maskTexture: MaskTexture
  /** 临时纹理 */
  tempTexture: Texture
  /** 图层数组 */
  layers: Uint32Array
  /** 零值数组 */
  zeros: Uint32Array
  /** 类型数组集合 */
  arrays: {
    0: {
      uint8: Uint8Array
      uint16: Uint16Array
      uint32: Uint32Array
      float32: Float32Array
      float64: Float64Array
    }
    1: {
      uint8: Uint8Array
      uint16: Uint16Array
      uint32: Uint32Array
      float32: Float32Array
      float64: Float64Array
    }
    2: {
      uint32: Uint32Array
      float32: Float32Array
    }
    3: {
      uint32: Uint32Array
      float32: Float32Array
    }
  }
  /** 通用帧缓冲区 */
  frameBuffer: WebGLFramebuffer
  /** 通用顶点缓冲区 */
  vertexBuffer: WebGLBuffer
  /** 通用元素索引缓冲区 */
  elementBuffer: WebGLBuffer
  /** 批量渲染器 */
  batchRenderer: BatchRenderer
  // 离屏纹理(启用深度缓冲区)
  offscreen: {
    enabled: boolean
    current: OffscreenTexture
    last: OffscreenTexture
  }
  /** 图像程序 */
  imageProgram: WebGLImageProgram
  /** 图块程序 */
  tileProgram: WebGLTileProgram
  /** 精灵程序 */
  spriteProgram: WebGLSpriteProgram
  /** 粒子程序 */
  particleProgram: WebGLParticleProgram
  /** 光源程序 */
  lightProgram: WebGLLightProgram
  /** 图形程序 */
  graphicProgram: WebGLGraphicProgram
  /** WebGL画布容器元素 */
  container: WebGLContainerElement
  /** 初始化 */
  initialize(): void
  /** 更新混合模式方法 */
  updateBlending(): void
  /**
   * 创建程序对象
   * @param vshader 顶点着色器代码
   * @param fshader 片元着色器代码
   * @returns WebGL程序
   */
  createProgramWithShaders(vshader: string, fshader: string): WebGLProgram
  /**
   * 加载着色器
   * @param type 着色器类型
   * @param source 着色器代码
   * @returns WebGL着色器
   */
  loadShader(type: number, source: string): WebGLShader
  /**
   * 创建图像程序
   * @returns WebGL程序
   */
  createImageProgram(): WebGLImageProgram
  /**
   * 创建图块程序
   * @returns WebGL程序
   */
  createTileProgram(): WebGLTileProgram
  /**
   * 创建精灵程序
   * @returns WebGL程序
   */
  createSpriteProgram(): WebGLSpriteProgram
  /**
   * 创建粒子程序
   * @returns WebGL程序
   */
  createParticleProgram(): WebGLParticleProgram
  /**
   * 创建光源程序
   * @returns WebGL程序
   */
  createLightProgram(): WebGLLightProgram
  /**
   * 创建图形程序
   * @returns WebGL程序
   */
  createGraphicProgram(): WebGLGraphicProgram
  /**
   * 重置状态
   */
  reset(): void
  /**
   * 更新遮罩模式
   */
  updateMasking(): void
  /**
   * 创建混合模式更新器
   * @returns 更新混合模式函数
   */
  createBlendingUpdater(): () => void
  /**
   * 设置环境光
   */
  setAmbientLight(light: GLAmbientLight): void
  /**
   * 调整光影纹理
   */
  resizeLightMap(): void
  /**
   * 更新光照纹理大小
   */
  updateLightTexSize(): void
  /**
   * 更新纹理采样器数量
   * @param samplerNum 采样器数量
   */
  updateSamplerNum(samplerNum: number): void
  /**
   * 绑定帧缓冲对象
   * @param fbo 帧缓冲对象
   */
  bindFBO(fbo: WebGLFramebuffer): void
  /**
   * 解除帧缓冲对象的绑定
   */
  unbindFBO(): void
  /**
   * 设置视口大小(单位:像素)
   * @param x 视口X
   * @param y 视口Y
   * @param width 视口宽度
   * @param height 视口高度
   */
  setViewport(x: number, y: number, width: number, height: number): void
  /**
   * 重置视口大小
   */
  resetViewport(): void
  /**
   * 激活离屏渲染
   */
  enableOffscreen(enabled: boolean): void
  /**
   * 切换离屏纹理
   */
  switchOffscreen(): void
  /**
 * 调整画布大小
 * @param width 画布宽度
 * @param height 画布高度
 */
  resize(width: number, height: number): void
  /**
   * 绘制图像
   * @param texture 图像纹理
   * @param dx 绘制位置X
   * @param dy 绘制位置Y
   * @param dw 绘制宽度
   * @param dh 绘制高度
   * @param tint 图像色调
   */
  drawImage(texture: Texture, dx: number, dy: number, dw: number, dh: number, tint?: ImageTint): void
  /**
   * 绘制指定颜色的图像
   * @param texture 图像纹理
   * @param dx 绘制位置X
   * @param dy 绘制位置Y
   * @param dw 绘制宽度
   * @param dh 绘制高度
   * @param color 整数颜色
   */
  drawImageWithColor(texture: Texture, dx: number, dy: number, dw: number, dh: number, color: number): void
  /**
   * 绘制切片图像
   * @param texture 图像纹理
   * @param dx 绘制位置X
   * @param dy 绘制位置Y
   * @param dw 绘制宽度
   * @param dh 绘制高度
   * @param clip 图像裁剪区域
   * @param border 切片边框宽度
   * @param tint 图像色调
   */
  drawSliceImage(texture: ImageTexture, dx: number, dy:number, dw: number, dh: number, clip: ImageClip, border: number, tint: ImageTint): void
  /**
   * 填充矩形
   * @param dx 绘制位置X
   * @param dy 绘制位置Y
   * @param dw 绘制宽度
   * @param dh 绘制高度
   * @param color 整数颜色
   */
  fillRect(dx: number, dy: number, dw: number, dh: number, color: number): void
  /**
   * 创建普通纹理
   * @param options 普通纹理选项
   * @returns WebGL纹理
   */
  createNormalTexture(options?: NormalTextureOptions): BaseTexture
  /**
   * 创建图像纹理
   * @param image 图像文件ID或HTML图像元素
   * @param options 图像纹理选项
   * @returns WebGL纹理
   */
  createImageTexture(image: string | HTMLImageElement, options?: ImageTextureOptions): BaseTexture
  /**
   * 创建纹理帧缓冲对象
   * @param texture 纹理
   * @returns WebGL帧缓冲对象
   */
  createTextureFBO(texture: FBOTexture): WebGLFramebuffer
}

/** WebGL1渲染上下文接口(兼容) */
interface WebGLRenderingContext {
  MIN: 0x8007
  MAX: 0x8008
  createVertexArray(): WebGLVertexArrayObjectOES | null
  deleteVertexArray(arrayObject: WebGLVertexArrayObjectOES | null): void
  isVertexArray(arrayObject: WebGLVertexArrayObjectOES | null): GLboolean
  bindVertexArray(arrayObject: WebGLVertexArrayObjectOES | null): void
  bufferData(target: GLenum, srcData: Uint8Array, usage: GLenum, srcOffset: GLuint, length: GLuint): void
  texSubImage2D(target: GLenum, level: GLint, xoffset: GLint, yoffset: GLint, width: GLsizei, height: GLsizei, format: GLenum, type: GLenum, pixels: ArrayBufferView | HTMLImageElement | null): void;
}

/** 画布2D渲染上下文接口 */
interface CanvasRenderingContext2D {
  /** 擦除画布 */
  clear(): void
  /**
   * 调整画布大小
   * @param width 画布宽度
   * @param height 画布高度
   */
  resize(width: number, height: number): void
}

/** HTML图像元素接口 */
interface HTMLImageElement {
  guid: string
}

/** GL环境光 */
type GLAmbientLight = {
  /** 红[0, 255] */
  red: number
  /** 绿[0, 255] */
  green: number
  /** 蓝[0, 255] */
  blue: number
}

interface WebGLTexture {
  on(type: string, callback: Function): void
  reply(type: string): void
}

/** 普通纹理选项 */
type NormalTextureOptions = {
  /** GL纹理放大过滤器 */
  magFilter?: number
  /** GL纹理缩小过滤器 */
  minFilter?: number
  /** 纹理坐标水平填充 */
  wrapS?: number
  /** 纹理坐标垂直填充 */
  wrapT?: number
  /** GL颜色格式 */
  format?: number
}

/** 图像纹理选项 */
type ImageTextureOptions = {
  /** GL纹理放大过滤器 */
  magFilter?: number
  /** GL纹理缩小过滤器 */
  minFilter?: number
}

/** FBO纹理 */
interface FBOTexture extends Texture {
  depthStencilBuffer: WebGLRenderbuffer
  resize(width: number, height: number): FBOTexture
}

/** 反射光纹理 */
interface ReflectedLightTexture extends FBOTexture {
  fbo: WebGLFramebuffer
  scale: number
  paddingLeft: number
  paddingTop: number
  paddingRight: number
  paddingBottom: number
  expansionLeft: number
  expansionTop: number
  expansionRight: number
  expansionBottom: number
  maxExpansionLeft: number
  maxExpansionTop: number
  maxExpansionRight: number
  maxExpansionBottom: number
  clipX: number
  clipY: number
  clipWidth: number
  clipHeight: number
  innerWidth: number
  innerHeight: number
}

/** 直射光纹理 */
interface DirectLightTexture extends FBOTexture {
  fbo: WebGLFramebuffer
}

/** 遮罩纹理 */
interface MaskTexture extends FBOTexture {
  fbo: WebGLFramebuffer
  binding: ImageElement | null
}

/** 离屏渲染纹理 */
interface OffscreenTexture extends FBOTexture {
  fbo: WebGLFramebuffer
}

/** WebGL画布容器 */
interface WebGLContainerElement extends HTMLDivElement {
  info?: StatisticsElement
  progress?: LoadingProgressElement
  log?: MessageElement
}

/** 统计信息元素 */
interface StatisticsElement extends HTMLDivElement {
  renderer: RendererModule
}

/** 消息元素 */
interface MessageElement extends HTMLDivElement {
  timestamp: number
  updater: UpdaterModule
}

/** 已激活的WebGL程序 */
type ActiveWebGLProgram =
| WebGLImageProgram
| WebGLTileProgram
| WebGLSpriteProgram
| WebGLParticleProgram
| WebGLLightProgram
| WebGLGraphicProgram

/** WebGL图像程序 */
interface WebGLImageProgram extends WebGLProgram {
  use(): WebGLImageProgram
  vao: WebGLVertexArrayObjectImage
  flip: 0 | 1 | -1
  alpha: number
  masking: boolean
  a_Position: number
  a_TexCoord: number
  a_Opacity: number
  u_Matrix: WebGLUniformLocation
  u_Ambient: WebGLUniformLocation
  u_LightMode: WebGLUniformLocation
  u_LightCoord: WebGLUniformLocation
  u_LightTexSize: WebGLUniformLocation
  u_Viewport: WebGLUniformLocation
  u_Masking: WebGLUniformLocation
  u_MaskSampler: WebGLUniformLocation
  u_ColorMode: WebGLUniformLocation
  u_Color: WebGLUniformLocation
  u_Tint: WebGLUniformLocation
  u_Repeat: WebGLUniformLocation
}

/** WebGL顶点数组对象 - 图像 */
interface WebGLVertexArrayObjectImage extends WebGLVertexArrayObject {
  a110: WebGLVertexArrayObject
}

/** WebGL图块程序 */
interface WebGLTileProgram extends WebGLProgram {
  use(): WebGLTileProgram
  vao: WebGLVertexArrayObject
  flip: 0 | 1 | -1
  alpha: number
  samplerNum: number
  a_Position: number
  a_TexCoord: number
  a_TexIndex: number
  u_Matrix: WebGLUniformLocation
  u_Ambient: WebGLUniformLocation
  u_LightMode: WebGLUniformLocation
  u_LightTexSize: WebGLUniformLocation
  u_Samplers: Array<WebGLUniformLocation>
}

/** WebGL精灵程序 */
interface WebGLSpriteProgram extends WebGLProgram {
  use(): WebGLSpriteProgram
  vao: WebGLVertexArrayObject
  flip: 0 | 1 | -1
  alpha: number
  samplerNum: number
  a_Position: number
  a_TexCoord: number
  a_TexParam: number
  a_Tint: number
  a_LightCoord: number
  u_Matrix: WebGLUniformLocation
  u_LightTexSize: WebGLUniformLocation
  u_Samplers: Array<WebGLUniformLocation>
}

/** WebGL粒子程序 */
interface WebGLParticleProgram extends WebGLProgram {
  use(): WebGLParticleProgram
  vao: WebGLVertexArrayObject
  flip: number
  alpha: number
  a_Position: number
  a_TexCoord: number
  a_Color: number
  u_Matrix: WebGLUniformLocation
  u_Ambient: WebGLUniformLocation
  u_LightMode: WebGLUniformLocation
  u_LightTexSize: WebGLUniformLocation
  u_Mode: WebGLUniformLocation
  u_Tint: WebGLUniformLocation
}

/** WebGL光源程序 */
interface WebGLLightProgram extends WebGLProgram {
  use(): WebGLLightProgram
  vao: WebGLVertexArrayObjectLight
  a_Position: number
  a_LightCoord: number
  a_LightColor: number
  u_Matrix: WebGLUniformLocation
  u_LightMode: WebGLUniformLocation
}

/** WebGL顶点数组对象 - 光源 */
interface WebGLVertexArrayObjectLight extends WebGLVertexArrayObject {
  a110: WebGLVertexArrayObject
}

/** WebGL图形程序 */
interface WebGLGraphicProgram extends WebGLProgram {
  use(): WebGLGraphicProgram
  vao: WebGLVertexArrayObjectGraphic
  alpha: number
  a_Position: number
  a_Color: number
  u_Matrix: WebGLUniformLocation
}

/** WebGL顶点数组对象 - 图形 */
interface WebGLVertexArrayObjectGraphic extends WebGLVertexArrayObject {
  a10: WebGLVertexArrayObject
}