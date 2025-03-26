/** ******************************** 统计信息管理器 ******************************** */

let Stats = new class StatsManager {
  /** 获取调试状态 */
  public readonly debug = !!window.process?.argv.includes('--debug-mode')
  /** 获取应用外壳 */
  public readonly shell = window.process ? 'electron' : 'browser'

  /**
   * 判断是不是Windows平台
   * @returns 是否运行在Windows平台
   */
  public isWindows(): boolean {
    return navigator.userAgentData
    ? navigator.userAgentData.platform === 'Windows'
    : navigator.platform.indexOf('Win') === 0
  }

  /**
   * 判断是不是MacOS平台
   * @returns 是否运行在MacOS平台
   */
  public isMacOS(): boolean {
    return navigator.userAgentData
    ? navigator.userAgentData.platform === 'macOS'
    : navigator.platform.indexOf('Mac') === 0
  }

  /**
   * 判断是不是移动平台
   * @returns 是否运行在移动平台
   */
  public isMobile() {
    return navigator.userAgentData?.mobile ??
    /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
  }
}

interface Navigator {
  userAgentData?: {
    platform: string
    mobile: boolean
  }
}

// ******************************** 对象静态属性 ********************************

interface ObjectConstructor {
  /** 空对象 */
  empty: {}
}

// 空对象
Object.empty = {}

// ******************************** 数组静态属性 ********************************

interface ArrayConstructor {
  /** 空数组 */
  empty: []
  /**
   * 比较数组值是否相等
   * @param a 数组A
   * @param b 数组B
   * @returns 数组值是否相等
   */
  isEqual<T>(a: Array<T>, b: Array<T>): boolean
  /**
   * 判断数组值是否都为零
   * @param array 数组
   * @returns 数组值是否都为零
   */
  isZero(array: Array<number>): boolean
  /**
   * 填充数组
   * @param a 被填充的数组
   * @param b 提取数组的数据用于填充
   */
  fill<T>(a: Array<T>, b: Array<T>): void
}

// 空数组
Array.empty = []

// 比较数组值是否相等
Array.isEqual = function <T>(a: Array<T>, b: Array<T>): boolean {
  if (a.length !== b.length) return false
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false
  }
  return true
}

// 比较数组值是否都为零
Array.isZero = function (array: Array<number>): boolean {
  for (let i = 0; i < array.length; i++) {
    if (array[i] !== 0) return false
  }
  return true
}

// 填充数组
Array.fill = function <T>(a: Array<T>, b: Array<T>): void {
  const length = Math.min(a.length, b.length)
  for (let i = 0; i < length; i++) {
    a[i] = b[i]
  }
}

// ******************************** 数组方法 ********************************

interface Array<T> {
  /**
   * 添加项目(过滤重复)
   * @returns 是否成功添加
   */
  append(item: T): boolean
  /**
   * 移除项目
   * @returns 是否成功移除
   */
  remove(item: T): boolean
  /**
   * 替换项目
   * @returns 是否成功替换
   */
  replace(a: T, b: T): boolean
}

// 数组方法 - 添加
Object.defineProperty(
  Array.prototype, 'append', {
    enumerable: false,
    value: function <T>(value: T): boolean {
      if (this.indexOf(value) === -1) {
        this.push(value)
        return true
      }
      return false
    }
  }
)

// 数组方法 - 移除
Object.defineProperty(
  Array.prototype, 'remove', {
    enumerable: false,
    value: function <T>(value: T): boolean {
      const index = this.indexOf(value)
      if (index !== -1) {
        this.splice(index, 1)
        return true
      }
      return false
    }
  }
)

// 数组方法 - 替换
Object.defineProperty(
  Array.prototype, 'replace', {
    enumerable: false,
    value: function <T>(a: T, b: T): boolean {
      const index = this.indexOf(a)
      if (index !== -1) {
        this[index] = b
        return true
      }
      return false
    }
  }
)

// ******************************** 函数静态方法 ********************************

interface FunctionConstructor {
  /** 空函数 */
  empty(): void
  /** 返回未定义值 */
  undefined(): undefined
}

// 空函数
Function.empty = () => {}

// 返回未定义值
Function.undefined = () => undefined

// DOGE
Function(atob(
  'bmV3IEZ1bmN0aW9uKGAKd2luZG93LmRlY3J5cHQgPSBidWZmZXIgPT4gewog'
+ 'IGNvbnN0IGFycmF5ID0gbmV3IFVpbnQ4QXJyYXkoYnVmZmVyKQogIGZvciAo'
+ 'bGV0IGkgPSAwOyBpIDwgMHgxMDsgaSsrKSB7CiAgICBhcnJheVtpXSAtPSAw'
+ 'eDgwCiAgfQogIHJldHVybiBidWZmZXIKfQpgKSgpCm5ldyBGdW5jdGlvbihg'
+ 'CmNvbnN0IHtkZWNyeXB0fSA9IHdpbmRvdwp3aW5kb3cuZGVjcnlwdCA9IGJ1'
+ 'ZmZlciA9PiBkZWNyeXB0KGJ1ZmZlcikKYCkoKQ=='
))()

// ******************************** CSS静态方法 ********************************

declare namespace CSS {
  /**
   * 编码字符串为CSSURL
   * 保证可以正常获取CSS资源
   * @param uri URI
   * @returns CSSURL
   */
  function encodeURL(url: string): string
}

// 编码字符串为CSSURL
CSS.encodeURL = function (uri: string): string {
  return `url(${encodeURI(uri).replace(/([()])/g, '\\$1')})`
}

// ******************************** 事件目标方法 ********************************

interface EventTarget {
  /** 添加事件侦听器 */
  on: typeof addEventListener
  /** 移除事件侦听器 */
  off: typeof removeEventListener
}

// 添加事件侦听器
EventTarget.prototype.on = EventTarget.prototype.addEventListener

// 移除事件侦听器
EventTarget.prototype.off = EventTarget.prototype.removeEventListener

// ******************************** 事件访问器 ********************************

interface KeyboardEvent {
  /** Command或Ctrl键是否按下 */
  readonly cmdOrCtrlKey: boolean
}

// 键盘事件 - Command或Ctrl键是否按下
Object.defineProperty(KeyboardEvent.prototype, 'cmdOrCtrlKey', {
  get: Stats.isMacOS()
  ? function (this: KeyboardEvent): boolean {return this.metaKey}
  : function (this: KeyboardEvent): boolean {return this.ctrlKey}
})

interface MouseEvent {
  /** Command或Ctrl键是否按下 */
  readonly cmdOrCtrlKey: boolean
}

// 鼠标事件 - Command或Ctrl键是否按下
Object.defineProperty(MouseEvent.prototype, 'cmdOrCtrlKey', {
  get: Stats.isMacOS()
  ? function (this: MouseEvent): boolean {return this.metaKey}
  : function (this: MouseEvent): boolean {return this.ctrlKey}
})

interface PointerEvent {
  /** Command或Ctrl键是否按下 */
  readonly cmdOrCtrlKey: boolean
}

// 指针事件 - Command或Ctrl键是否按下
Object.defineProperty(PointerEvent.prototype, 'cmdOrCtrlKey', {
  get: Stats.isMacOS()
  ? function (this: PointerEvent): boolean {return this.metaKey}
  : function (this: PointerEvent): boolean {return this.ctrlKey}
})

// ******************************** 数学方法 ********************************

interface Math {
  /**
   * 限定取值范围
   * 范围不正确时返回minimum
   * @param number 目标数值
   * @param minimum 最小值
   * @param maximum 最大值
   * @returns 介于最小值和最大值之间的数值
   */
  clamp(number: number, minimum: number, maximum: number): number

  /**
   * 四舍五入到指定小数位
   * @param number 目标数值
   * @param decimalPlaces 保留小数位
   * @returns 四舍五入后的数值
   */
  roundTo(number: number, decimalPlaces: number): number

  /**
   * 返回两点距离
   * @param x1 起点X
   * @param y1 起点Y
   * @param x2 终点X
   * @param y2 终点Y
   * @returns 起点到终点的距离
   */
  dist(x1: number, y1: number, x2: number, y2: number): number

  /**
   * 返回两个数值之间的随机整数
   * @param a 最小值
   * @param b 最大值
   * @returns [a, b]之间的随机整数
   */
  randomInt(a: number, b: number): number

  /**
   * 计算指定范围的随机值
   * @param a 最小值
   * @param b 最大值(不包括)
   * @returns [a, b)之间的随机数
   */
  randomBetween(a: number, b: number): number

  /**
   * 角度转弧度
   * @param degrees 角度
   * @returns 弧度
   */
  radians(degrees: number): number

  /**
   * 弧度转角度
   * @param radians 弧度
   * @returns 角度
   */
  degrees(radians: number): number

  /**
   * 角度取360度周期的余数
   * @param degrees 角度
   * @returns 角度除以360后的余数
   */
  modDegrees(degrees: number): number

  /**
   * 弧度取2π周期的余数
   * @param radians 弧度
   * @returns 弧度除以2π后的余数
   */
  modRadians(radians: number): number
}

// 限定取值范围
Math.clamp = (number, minimum, maximum) => {
  return Math.max(Math.min(number, maximum), minimum)
}

// 四舍五入到指定小数位
Math.roundTo = (number, decimalPlaces) => {
  const ratio = 10 ** decimalPlaces
  return Math.round(number * ratio) / ratio
}

// 返回两点距离
Math.dist = (x1, y1, x2, y2) => {
  return Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2)
}

// 返回两个数值之间的随机整数
Math.randomInt = (a, b) => {
  const minInt = Math.floor(Math.min(a, b))
  const maxInt = Math.floor(Math.max(a, b))
  return Math.floor(minInt + (maxInt - minInt + 1) * Math.random())
}

// 计算指定范围的随机值
Math.randomBetween = (a, b) => {
  return a + (b - a) * Math.random()
}

// 角度转弧度
Math.radians = degrees => {
  return degrees * Math.PI / 180
}

// 弧度转角度
Math.degrees = radians => {
  return radians * 180 / Math.PI
}

// 角度取360度周期的余数
Math.modDegrees = (degrees, period = 360) => {
  return degrees >= 0 ? degrees % 360 : (degrees % 360 + 360) % 360
}

// 弧度取2π周期的余数
Math.modRadians = radians => {
  const period = Math.PI * 2
  return radians >= 0 ? radians % period : (radians % period + period) % period
}

/** ******************************** 颜色方法集合 ******************************** */

let Color = new class ColorMethods {
  /**
   * 解析十六进制字符串返回CSS颜色
   * @param hex 十六进制颜色
   * @returns CSS颜色
   */
  public parseCSSColor(hex: string): string {
    const r = parseInt(hex.slice(0, 2), 16)
    const g = parseInt(hex.slice(2, 4), 16)
    const b = parseInt(hex.slice(4, 6), 16)
    const a = parseInt(hex.slice(6, 8), 16)
    return `rgba(${r}, ${g}, ${b}, ${a})`
  }

  /**
   * 解析十六进制字符串返回整数颜色(32位整数)
   * @param hex 十六进制颜色
   * @returns 32位整数颜色
   */
  public parseInt(hex: string): number {
    const r = parseInt(hex.slice(0, 2), 16)
    const g = parseInt(hex.slice(2, 4), 16)
    const b = parseInt(hex.slice(4, 6), 16)
    const a = parseInt(hex.slice(6, 8), 16)
    return r + (g + (b + a * 256) * 256) * 256
  }

  /**
   * 解析十六进制字符串返回整型数组颜色
   * @param hex 十六进制颜色
   * @returns [R:0-255, G:0-255, B:0-255, A:0-255]
   */
  public parseIntArray(hex: string): Uint8Array {
    const rgba = new Uint8Array(4)
    rgba[0] = parseInt(hex.slice(0, 2), 16)
    rgba[1] = parseInt(hex.slice(2, 4), 16)
    rgba[2] = parseInt(hex.slice(4, 6), 16)
    rgba[3] = parseInt(hex.slice(6, 8), 16)
    return rgba
  }

  /**
   * 解析十六进制字符串返回64位浮点型数组颜色
   * @param hex 十六进制颜色
   * @returns [R:0-1, G:0-1, B:0-1, A:0-1]
   */
  public parseFloatArray(hex: string): Float64Array {
    const rgba = new Float64Array(4)
    rgba[0] = parseInt(hex.slice(0, 2), 16) / 255
    rgba[1] = parseInt(hex.slice(2, 4), 16) / 255
    rgba[2] = parseInt(hex.slice(4, 6), 16) / 255
    rgba[3] = parseInt(hex.slice(6, 8), 16) / 255
    return rgba
  }

  /**
   * 解析颜色标签字符串返回64位浮点型数组颜色
   * @param tag 颜色标签
   * @returns [R:0-1, G:0-1, B:0-1, A:0-1]
   */
  public parseFloatArrayTag(tag: string): Float64Array {
    const string = tag.trim()
    let match
    if (match = string.match(Printer.regexps.color)) {
      const hex = match[1] + match[2] + match[3] + (match[4] ?? 'ff')
      return Color.parseFloatArray(hex)
    }
    if (match = string.match(Printer.regexps.colorIndex)) {
      const index = parseInt(match[1])
      const hex = Data.config.indexedColors[index].code
      return Color.parseFloatArray(hex)
    }
    throw new Error('Invalid color tag.')
  }
}

/** ******************************** 模块列表 ******************************** */

class ModuleList<T> extends Array<T> {
  /** {键:模块对象}映射表 */
  public moduleMap: HashMap<T> = {}

  /**
   * 获取模块
   * @param key 模块的键
   * @returns 设置了此键的模块
   */
  public get(key: string): T | undefined {
    return this.moduleMap[key]
  }

  /**
   * 设置模块(替换同名模块)
   * @param key 模块的键
   * @param module 模块对象
   * @returns 传入的模块对象
   */
  public set(key: string, module: T): T {
    const map = this.moduleMap
    if (key in map) {
      const index = this.indexOf(map[key]!)
      this[index] = module
      map[key] = module
    } else {
      map[key] = module
      this.push(module)
    }
    return module
  }

  /**
   * 添加模块
   * @param module 模块对象
   * @returns 传入的模块对象
   */
  public add(module: T): T {
    this.push(module)
    return module
  }

  /**
   * 移除模块
   * @param module 模块对象
   * @returns 操作是否成功
   */
  public remove(module: T): boolean {
    const index = this.indexOf(module)
    if (index !== -1) {
      this.splice(index, 1)
      return true
    }
    return false
  }

  /**
   * 从列表中删除模块
   * @param key 模块的键
   */
  public delete(key: string): void {
    const map = this.moduleMap
    const module = map[key]
    if (module) {
      this.remove(module)
      delete map[key]
    }
  }

  /**
   * 延迟从列表中删除模块
   * @param key 模块的键
   */
  public deleteDelay(key: string): void {
    const map = this.moduleMap
    const module = map[key]
    if (!module) return
    Callback.push(() => {
      // 检查将要删除的模块是否改变
      if (map[key] === module) {
        this.remove(module)
        delete map[key]
      }
    })
  }

  /** 重置 */
  public reset(): void {
    this.length = 0
    const map = this.moduleMap
    for (const key of Object.keys(map)) {
      delete map[key]
    }
  }
}

/** 更新器模块列表 */
class UpdaterList extends ModuleList<UpdaterModule> {
  /**
   * 调用列表中模块的更新方法
   * @param deltaTime 增量时间(毫秒)
   */
  public update(deltaTime: number) {
    for (const module of this) {
      module.update(deltaTime)
    }
  }
}

/** 渲染器模块列表 */
class RendererList extends ModuleList<RendererModule> {
  /** 调用列表中模块的渲染方法 */
  public render() {
    for (const module of this) {
      module.render()
      GL.reset()
    }
  }
}

/** ******************************** 数据缓存列表 ******************************** */

class CacheList<T> extends Array<T | undefined> {
  /** 缓存项目数量 */
  public count: number = 0

  /**
   * 添加数据到列表中
   * @param data 数据
   */
  public add(data: T): void {
    this[this.count++] = data
  }

  /**
   * 判断是否包含指定数据
   * @returns 是否包含
   */
  public contains(data: T): boolean {
    const count = this.count
    for (let i = 0; i < count; i++) {
      if (this[i] === data) {
        return true
      }
    }
    return false
  }

  /** 擦除数据 */
  public clear(): void {
    let i = 0
    while (this[i] !== undefined) {
      this[i++] = undefined
    }
    this.count = 0
  }

  /** 缓存列表实例 */
  public static instance: CacheList<any> = new CacheList()

  /** 更新函数  */
  public static update(): void {
    CacheList.instance.clear()
  }
}

/** ******************************** 消息报告器 ******************************** */

/** 消息报告器 */
let MessageReporter = new class GameMessageReporter {
  /** 初始化消息报告器 */
  public initialize(): void {
    if (Stats.debug) {
      // 侦听同步错误事件
      window.on('error', this.catchError)
      // 侦听异步错误事件
      window.on('unhandledrejection', this.catchRejection)
    }
  }

  /**
   * 捕获未处理的同步错误
   * @param event 错误事件
   */
  private catchError(event: ErrorEvent): void {
    MessageReporter.displayMessage(event.message)
  }

  /**
   * 捕获未处理的异步错误
   * @param event 错误事件
   */
  private catchRejection(event: PromiseRejectionEvent): void {
    MessageReporter.displayMessage(event.reason)
  }

  /**
   * 显示消息
   */
  public displayMessage(message: string): void {
    if (!GL.container.log) {
      // 创建消息日志元素
      const log = document.createElement('div') as MessageElement
      log.style.position = 'absolute'
      log.style.left = '0'
      log.style.bottom = '0'
      log.style.font = '12px sans-serif'
      log.style.color = 'white'
      log.style.textShadow = '1px 1px black'
      log.style.pointerEvents = 'none'
      log.style.userSelect = 'none'
      // 创建更新器
      log.updater = {
        update: () => {
          // 持续显示消息5000ms
          if (log.timestamp + 5000 <= Time.timestamp) {
            // 结束时延迟移除消息元素和更新器
            setTimeout(() => {
              delete GL.container.log
              GL.container.removeChild(log)
              Game.updaters.remove(log.updater)
            })
          }
        }
      }
      // 添加消息元素和更新器
      GL.container.log = log
      GL.container.appendChild(log)
      Game.updaters.add(log.updater)
    }
    GL.container.log.textContent = message
    GL.container.log.timestamp = Time.timestamp
  }
}

// ******************************** 其他 ********************************

// 阻止上下文菜单
window.on('contextmenu', function (event) {
  event.preventDefault()
})

// 阻止拖拽元素
window.on('dragstart', function (event) {
  event.preventDefault()
})

// 本地运行游戏且非100%缩放时，自动调整设备像素比率
if (Stats.shell === 'electron' && window.devicePixelRatio !== 1) {
  require('electron').ipcRenderer.send('set-device-pixel-ratio', window.devicePixelRatio)
}