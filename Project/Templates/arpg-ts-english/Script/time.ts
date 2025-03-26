// ******************************** 游戏时间对象 ********************************

let Time = new class TimeManager {
  /** 时间戳 */
  public timestamp: number = 0
  /** 时间缩放率 */
  public timeScale: number = 1
  /** 已过去时间 */
  public elapsed: number = 0
  /** 累计游戏时间 */
  public playTime: number = 0
  /** 增量时间 */
  public deltaTime: number = 0
  /** 原生增量时间 */
  public rawDeltaTime: number = 0
  /** 最大增量时间 */
  public maxDeltaTime: number = 35
  /** 短期累计帧数 */
  public frameCount: number = 0
  /** 短期累计帧时间 */
  public frameTime: number = 0
  /** 每秒游戏帧数 */
  public fps: number = 0
  /** 平均每帧游戏时间 */
  public tpf: number = Infinity
  // 游戏速度过渡结束后回调
  private callbacks: Array<CallbackFunction> | null = null
  // 游戏速度过渡上下文
  private transition: TimeTransitionContext | null = null

  /** 初始化游戏时间管理器 */
  public initialize(): void {
    this.timestamp = performance.now()
  }

  /** 重置游戏时间管理器 */
  public reset(): void {
    this.timeScale = 1
    this.playTime = 0
    this.callbacks = null
    this.transition = null
  }

  /**
   * 更新当前帧的时间相关参数
   * @param timestamp 增量时间(毫秒)
   */
  public update(timestamp: number): void {
    let deltaTime = timestamp - this.timestamp

    // 累计帧数和所用时间
    this.frameCount++
    this.frameTime += deltaTime

    // 每秒计算FPS
    if (this.frameTime > 995) {
      this.fps = Math.round(this.frameCount / (this.frameTime / 1000))
      this.tpf = this.frameTime / this.frameCount
      this.frameCount = 0
      this.frameTime = 0
    }

    // 限制增量时间 - 发生跳帧时减少视觉上的落差
    deltaTime = Math.min(deltaTime, this.tpf + 1, this.maxDeltaTime)

    // 计算游戏速度改变时的过渡
    const _transition = this.transition
    if (_transition !== null) {
      _transition.elapsed = Math.min(
        _transition.elapsed + deltaTime,
        _transition.duration,
      )
      const { start, end, easing, elapsed, duration } = _transition
      const time = easing.get(elapsed / duration)
      this.timeScale = start * (1 - time) + end * time
      // 过渡结束后执行回调
      if (elapsed === duration) {
        this.transition = null
        this.executeCallbacks()
      }
    }

    // 更新时间属性
    this.timestamp = timestamp
    this.deltaTime = this.timeScale * deltaTime
    this.rawDeltaTime = deltaTime
    this.elapsed += this.deltaTime
    this.playTime += deltaTime
  }

  /**
   * 设置增量时间缩放比例
   * @param timeScale 增量时间缩放比例
   * @param easingId 过渡曲线ID
   * @param duration 持续时间(毫秒)
   */
  public setTimeScale(timeScale: number, easingId: string = '', duration: number = 0): void {
    if (duration > 0) {
      // 过渡模式
      this.transition = {
        start: this.timeScale,
        end: timeScale,
        easing: Easing.get(easingId),
        elapsed: 0,
        duration: duration,
      }
    } else {
      // 立即模式
      this.timeScale = timeScale
      this.transition = null
      this.executeCallbacks()
    }
  }

  /**
   * 解析日期时间戳
   * @param timestamp 时间戳
   * @param format 日期格式
   * @returns 格式化的日期
   */
  public parseDateTimestamp(timestamp: number, format: string): string {
    const date = new Date(timestamp)
    return format.replace(/\{[YMDhms]\}/g, (match: string): string => {
      switch (match) {
        case '{Y}': return date.getFullYear().toString()
        case '{M}': return date.getMonth() + 1 + ''
        case '{D}': return date.getDate().toString()
        case '{h}': return date.getHours().toString().padStart(2, '0')
        case '{m}': return date.getMinutes().toString().padStart(2, '0')
        case '{s}': return date.getSeconds().toString().padStart(2, '0')
        default: return ''
      }
    })
  }

  /**
   * 设置时间缩放过渡结束回调
   * @param callback 回调函数
   */
  public onTransitionEnd(callback: CallbackFunction): void {
    if (this.callbacks !== null) {
      this.callbacks.push(callback)
    } else {
      this.callbacks = [callback]
    }
  }

  /** 执行时间缩放过渡结束回调 */
  private executeCallbacks(): void {
    if (this.callbacks !== null) {
      for (const callback of this.callbacks) {
        callback()
      }
      this.callbacks = null
    }
  }
}

// ******************************** 计时器 ********************************

class Timer {
  /** 计时器当前时间 */
  public elapsed: number
  /** 计时器持续时间 */
  public duration: number
  /** 计时器模式 */
  public mode: TimerMode
  /** 计时器更新函数 */
  public update: (timer: Timer) => void
  /** 计时器结束回调函数 */
  public callback: (timer: Timer) => void

  /** 计时器对象 */
  constructor(options: {
    /** 计时器模式(缩放|原生) */
    mode?: TimerMode
    /** 计时器持续时间 */
    duration: number
    /** 计时器更新回调函数 */
    update?: (timer: Timer) => void
    /** 计时器结束回调函数 */
    callback?: (timer: Timer) => void
  }) {
    this.elapsed = 0
    this.duration = options.duration
    this.mode = options.mode ?? 'scaled'
    this.update = options.update ?? Function.empty
    this.callback = options.callback ?? Function.empty
  }

  /**
   * 执行周期回调函数
   * @param deltaTime 增量时间(毫秒)
   */
  private tick(deltaTime: number): void {
    this.elapsed = Math.min(this.elapsed + deltaTime, this.duration)
    this.update(this)
    if (this.elapsed === this.duration) {
      this.callback(this)
      this.remove()
    }
  }

  /**
   * 添加计时器到列表
   * @returns 当前计时器
   */
  public add(): this {
    switch (this.mode) {
      case 'scaled':
        Timer.scaledTimers.append(this)
        return this
      case 'raw':
        Timer.rawTimers.append(this)
        return this
    }
  }

  /**
   * 从列表中移除计时器
   * @returns 当前计时器
   */
  public remove(): this {
    switch (this.mode) {
      case 'scaled':
        Timer.scaledTimers.remove(this)
        return this
      case 'raw':
        Timer.rawTimers.remove(this)
        return this
    }
  }

  /** 计时器列表 */
  public static scaledTimers: Array<Timer> = []
  /** 计时器列表(原生时间) */
  public static rawTimers: Array<Timer> = []
  /** 备用的计时器对象池 */
  public static timerPool: CacheList<Timer> = new CacheList()

  /**
   * 更新计时器
   * @param deltaTime 增量时间(毫秒)
   */
  public static update(deltaTime: number): void {
    // 更新缩放时间的计时器
    if (Game.paused === false) {
      const {scaledTimers} = this
      let i = scaledTimers.length
      while (--i >= 0) {
        scaledTimers[i].tick(deltaTime)
      }
    }
    // 更新原生时间的计时器
    {
      const {rawTimers} = this
      const {rawDeltaTime} = Time
      let i = rawTimers.length
      while (--i >= 0) {
        rawTimers[i].tick(rawDeltaTime)
      }
    }
  }

  /**
   * 从对象池中取出计时器实例
   * @returns 计时器实例
   */
  public static fetch(): Timer {
    const timers = this.timerPool
    return timers.count !== 0
      ? timers[--timers.count]!
      : new Timer({ duration: 0 })
  }

  /**
   * 回收计时器实例到对象池
   * @param timer 计时器实例
   */
  public static recycle(timer: Timer): void {
    const timers = this.timerPool
    if (timers.count < 100000) {
      timers[timers.count++] = timer
      timer.elapsed = 0
      timer.update = Function.empty
      timer.callback = Function.empty
    }
  }
}

// ******************************** 过渡曲线管理器 ********************************

let Easing = new class EasingManager {
  /** 过渡曲线开始点 */
  private startPoint: Point = {x: 0, y: 0}
  /** 过渡曲线结束点 */
  private endPoint: Point = {x: 1, y: 1}
  /** {键:ID}重映射表 */
  private keyRemap: HashMap<string> = {}
  /** {ID:过渡曲线}映射表 */
  private easingMaps: HashMap<EasingMap> = {}
  /** 线性过渡(默认) */
  private linear: EasingMap = { get: time => Math.min(time, 1) } as EasingMap

  /** 初始化 */
  public initialize(): void {
    // 生成{键:ID}重映射表
    for (const { id, key } of Object.values(Data.easings) as Array<EasingData>) {
      this.keyRemap[id] = id
      if (key) {
        this.keyRemap[key] = id
      }
    }
  }

  /**
   * 获取过渡曲线映射表
   * @param key 过渡曲线ID或键
   * @returns 过渡曲线映射表
   */
  public get(key: string): EasingMap {
    // 返回缓存映射表
    const id = this.keyRemap[key] ?? ''
    const map = this.easingMaps[id]
    if (map) return map

    // 创建新的映射表
    const easing = Data.easings[id]
    if (easing) {
      return this.easingMaps[id] = new EasingMap(
        this.startPoint, ...easing.points, this.endPoint,
      )
    }

    // 返回缺省值(线性)
    return this.linear
  }
}

// 过渡曲线映射表类
class EasingMap extends Float32Array {
  /**
   * 过渡曲线映射表
   * @param points 控制点列表
   */
  constructor(...points: Array<Point>) {
    const scale = EasingMap.scale
    super(scale + 1)
    const length = points.length - 1
    let pos = -1
    // 生成过渡曲线，键值对(X，Y)写入映射表
    for (let i = 0; i < length; i += 3) {
      const {x: x0, y: y0} = points[i]
      const {x: x1, y: y1} = points[i + 1]
      const {x: x2, y: y2} = points[i + 2]
      const {x: x3, y: y3} = points[i + 3]
      for (let n = 0; n <= scale; n++) {
        const t0 = n / scale
        const t1 = 1 - t0
        const n0 = t1 ** 3
        const n1 = 3 * t0 * t1 ** 2
        const n2 = 3 * t0 ** 2 * t1
        const n3 = t0 ** 3
        const x = x0 * n0 + x1 * n1 + x2 * n2 + x3 * n3
        const i = Math.round(x * scale)
        if (i > pos && i <= scale) {
          const y = y0 * n0 + y1 * n1 + y2 * n2 + y3 * n3
          this[i] = y
          if (i > pos + 1) {
            for (let j = pos + 1; j < i; j++) {
              this[j] = this[pos] + (this[i] - this[pos]) * (j - pos) / (i - pos)
            }
          }
          pos = i
        }
      }
    }
    this[scale] = 1
  }

  /**
   * 获取过渡时间
   * @param time 原生时间
   * @returns 处理后的过渡时间
   */
  public get(time: number): number {
    return this[Math.round(Math.clamp(time, 0, 1) * EasingMap.scale)]
  }

  /** 过渡曲线映射表刻度(精度) */
  public static scale: number = 10000
}