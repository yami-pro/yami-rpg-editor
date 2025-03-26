/** 键值映射表 */
type HashMap<T> = {[key: string]: T | undefined}

/** 属性映射表 */
type AttributeMap = HashMap<AttributeValue>

/** 属性值 */
type AttributeValue = boolean | number | string | object

/** 坐标点对象 */
type Point = {x: number, y: number}

/** 光线采样模式 */
type LightSamplingMode = 'raw' | 'global' | 'anchor' | 'ambient'

/** 回调函数 */
type CallbackFunction = () => void

/** 事件回调函数 */
type EventCallback = (event?: any) => void

/** 图像裁剪区域 */
type ImageClip = [x: number, y: number, width: number, height: number]

/** 图像色调数组 */
type ImageTint = [red: number, green: number, blue: number, gray: number]

/** 图像色调选项 */
type ImageTintOptions = {red?: number, green?: number, blue?: number, gray?: number}

/** RGBA颜色数组 */
type ColorArray = [red: number, green: number, blue: number, alpha: number]

/** 更新器模块 */
interface UpdaterModule {
  [key: string]: any
  /**
   * 更新函数
   * @param deltaTime 增量时间(毫秒)
   */
  update(deltaTime: number): void
}

/** 渲染器模块 */
interface RendererModule {
  [key: string]: any
  /**
   * 渲染函数
   */
  render(): void
}