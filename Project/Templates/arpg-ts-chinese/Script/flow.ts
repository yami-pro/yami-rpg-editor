/** ******************************** 脚本流程控制 ******************************** */

class Flow {
  /** 脚本指令宿主对象 */
  private flowOwner: {destroyed: boolean, active?: boolean} | null
  /** 独立执行开关 */
  private flowIndependent: boolean = false

  /**
   * @param owner 宿主对象
   */
  constructor(owner: unknown) {
    if (owner instanceof Actor) {
      this.flowOwner = owner
    } else {
      this.flowOwner = null
    }
  }

  /**
   * 检查是否继续执行异步函数(宿主对象被销毁时停止执行)
   * @param resolve Promise异步返回函数
   */
  private continue(resolve: () => void): void {
    if (this.verify()) return resolve()
  }

  /**
   * 检查有效性(宿主对象被销毁或角色未激活时返回false)
   * @returns 是否可以继续
   */
  public verify(): boolean {
    if (this.flowOwner === null) return true
    if (this.flowOwner.destroyed === false) {
      if (this.flowOwner.active !== false) {
        return true
      }
    }
    if (this.flowIndependent) return true
    return false
  }

  /**
   * 显示文本(异步)
   * 参数(目标角色, 文本参数, 文本内容)
   * 参数(目标角色, 文本内容)
   * 参数(文本参数, 文本内容)
   * 参数(文本内容)
   * @param first 第一个参数(可以是目标角色|文本参数|文本内容)
   * @param second 第二个参数(可以是文本参数|文本内容)
   * @param third 第三个参数(文本内容)
   */
  public showText(first: Actor | string, second?: string, third?: string): Promise<void> {
    let target: Actor | undefined
    let parameters: string = ''
    let content: string = ''
    // 三个参数(目标角色+文本参数+文本内容)
    if (typeof third === 'string') {
      if (first instanceof Actor) {
        target = first
      }
      parameters = second!
      content = third!
    // 两个参数(目标角色+文本内容)(文本参数+文本内容)
    } else if (typeof second === 'string') {
      if (first instanceof Actor) {
        target = first
      }
      if (typeof first === 'string') {
        parameters = first
      }
      content = second
    // 一个参数(文本内容)
    } else if (typeof first === 'string') {
      content = first
    }
    return new Promise((resolve: () => void) => {
      const events = EventManager.getEnabledEvents('showtext')
      if (events.length === 0) {
        return this.continue(resolve)
      }
      const event = new EventHandler(events[events.length - 1])
      for (let i = events.length - 2; i >= 0; i--) {
        event.stack.push(events[i], 0)
      }
      event.commands = events[0]
      event.targetActor = target
      Command.parameters = parameters
      Command.textContent = content
      EventHandler.call(event).onFinish(() => this.continue(resolve))
    })
  }

  /**
   * 显示选项(异步)
   * 参数(选项参数, 选项内容, 回调函数, ...)
   * 参数(选项内容, 回调函数, ...)
   * @param first 第一个参数(可以是选项参数|选项内容)
   * @param rests ...剩余参数([选项内容|回调函数, ...]列表)
   */
  public showChoices(first: string, ...rests: Array<string | FlowChoiceFunction>): Promise<void> {
    let offset = 1
    // 如果第一个剩余参数是字符串，表示输入了选项参数
    const parameters: string = typeof rests[0] === 'string' ? first : ''
    // 如果第一个剩余参数不是字符串，放入first作为选项内容
    if (typeof rests[0] !== 'string') {
      rests.unshift(first)
      offset = 0
    }
    return new Promise(resolve => {
      const contents: Array<string> = []
      const branches: Array<() => void> = []
      const next = () => this.continue(resolve)
      for (let i = 0; i < rests.length; i += 2) {
        const content = rests[i]
        const callback = rests[i + 1]
        if (typeof content !== 'string') {
          throw new Error('There is an incorrect argument type, which should be a string. Index: ' + (i + offset))
        }
        if (typeof callback !== 'function') {
          throw new Error('There is an incorrect argument type, which should be a function. Index: ' + (i + 1 + offset))
        }
        const branch = (): void => {
          const choiceValue = callback()
          if (choiceValue instanceof Promise) {
            // 此处脚本在渲染后运行
            choiceValue.then(next)
          } else {
            next()
          }
        }
        contents.push(content)
        branches.push(branch)
      }
      const events = EventManager.getEnabledEvents('showchoices')
      if (events.length === 0) {
        return next()
      }
      const event = new EventHandler(events[events.length - 1])
      for (let i = events.length - 2; i >= 0; i--) {
        event.stack.push(events[i], 0)
      }
      event.commands = events[0]
      Command.parameters = parameters as string
      Command.choiceContents = contents
      Command.choiceIndex = -1
      EventHandler.call(event).onFinish(() => {
        const branch = branches[Command.choiceIndex]
        return branch instanceof Function ? branch() : next()
      })
    })
  }

  /**
   * 等待(异步)
   * @param duration 持续时间(毫秒)
   */
  public wait(duration: number): Promise<void> {
    return new Promise(resolve => {
      const timer = Timer.fetch().add()
      timer.mode = 'scaled'
      timer.duration = duration
      timer.callback = () => {
        this.continue(resolve)
        Timer.recycle(timer)
      }
    })
  }

  /**
   * 等待(异步)(不受游戏速度影响)
   * @param duration 持续时间(毫秒)
   */
  public waitRaw(duration: number): Promise<void> {
    return new Promise((resolve: () => void) => {
      const timer = Timer.fetch().add()
      timer.mode = 'raw'
      timer.duration = duration
      timer.callback = () => {
        this.continue(resolve)
        Timer.recycle(timer)
      }
    })
  }

  /**
   * 过渡(异步)
   * @param start 初始值
   * @param end 结束值
   * @param easingKey 过渡曲线的键
   * @param duration 过渡持续时间
   * @param update 更新函数(每帧执行一次)
   */
  public transition(start: number, end: number, easingKey: string, duration: number, update: (interpolation: number) => void): Promise<void> {
    return new Promise(resolve => {
      const easing = Easing.get(easingKey)
      const timer = Timer.fetch().add()
      timer.mode = 'scaled'
      timer.duration = duration
      timer.update = timer => {
        if (this.verify()) {
          const time = easing.get(timer.elapsed / timer.duration)
          update(start * (1 - time) + end * time)
        } else {
          Timer.recycle(timer.remove())
        }
      }
      timer.callback = () => {
        this.continue(resolve)
        Timer.recycle(timer)
      }
    })
  }

  /**
   * 是否开启独立执行(销毁对象后仍然继续Flow异步脚本)
   * @param state 独立执行开关
   */
  public independent(state: boolean = true): void {
    this.flowIndependent = state
  }
}