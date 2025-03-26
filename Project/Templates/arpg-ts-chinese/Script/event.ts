/** ******************************** 回调管理器 ******************************** */

// 在移除场景对象的组件时，经常需要将操作推迟到栈尾
// 比如在遍历组件列表时调用了事件或脚本，将其中一个组件移除
// 这可能会破坏正在遍历的顺序，从而产生意外
// 可以用Callback.push(fn)将要做的事情推迟到当前帧的栈尾执行
let Callback = new class CallbackManager {
  /** 回调函数列表 */
  private functions: Array<CallbackFunction | null> = []
  /** 回调函数计数 */
  private count: number = 0

  /**
   * 推送回调函数，稍后执行
   * @param fn 回调函数
   */
  public push(fn: CallbackFunction): void {
    this.functions[this.count++] = fn
  }

  /** 执行回调函数 */
  public update(): void {
    for (let i = 0; i < this.count; i++) {
      this.functions[i]!()
      this.functions[i] = null
    }
    this.count = 0
  }

  /** 重置回调堆栈 */
  public reset(): void {
    for (let i = 0; i < this.count; i++) {
      this.functions[i] = null
    }
    this.count = 0
  }
}

/** ******************************** 全局事件管理器 ******************************** */

let EventManager = new class GlobalEventManager {
  /** 管理器版本号(重置时更新) */
  private version: number = 0
  /** 全局事件映射表(GUID->指令列表) */
  public guidMap: HashMap<CommandFunctionList> = {}
  /** 已激活事件列表 */
  public activeEvents: Array<EventHandler> = []
  /** {类型:事件列表}映射表 */
  public typeMap: GlobalEventGroupMap = {
    common: [],
    autorun: [],
    keydown: [],
    keyup: [],
    mousedown: [],
    mouseup: [],
    mousemove: [],
    doubleclick: [],
    wheel: [],
    touchstart: [],
    touchmove: [],
    touchend: [],
    gamepadbuttonpress: [],
    gamepadbuttonrelease: [],
    gamepadleftstickchange: [],
    gamepadrightstickchange: [],
    equipmentgain: [],
    itemgain: [],
    moneygain: [],
    startup: [],
    createscene: [],
    loadscene: [],
    loadsave: [],
    showtext: [],
    showchoices: [],
    preload: [],
  }
  /** {注册键:事件}映射表 */
  public keyMap: HashMap<GlobalEventRegisterObject> = {}
  /** 脚本管理器 */
  public script!: ScriptManager

  /** 初始化全局事件管理器 */
  public initialize(): void {
    const {guidMap, typeMap} = this
    const events = Object.values(Data.events!) as Array<EventFile>

    // 删除数据释放内存
    delete Data.events

    // 编译事件指令
    for (const {id, path, enabled, priority, namespace, returnType, description, parameters, type, commands} of events) {
      commands.path = '@ ' + path
      const cmds = Command.compile(commands)
      let parent = typeMap[type]
      if (parent === undefined) {
        parent = typeMap[type] = []
      }
      cmds.type = type as string
      cmds.path = commands.path
      cmds.default = enabled
      cmds.enabled = enabled
      cmds.priority = priority
      cmds.namespace = namespace
      cmds.returnType = returnType
      cmds.description = description
      cmds.parameters = parameters
      cmds.parent = parent
      parent.push(cmds)
      guidMap[id] = cmds
    }

    // 侦听事件
    Scene.on('create', () => this.emit('createscene'))
    Scene.on('load', () => this.emit('loadscene'))
    Scene.on('keydown', (event: ScriptKeyboardEvent) => this.emit('keydown', {priority: false, argument: event}))
    Scene.on('keyup', (event: ScriptKeyboardEvent) => this.emit('keyup', {priority: false, argument: event}))
    Scene.on('mousedown', (event: ScriptMouseEvent) => this.emit('mousedown', {priority: false, argument: event}))
    Scene.on('mouseup', (event: ScriptMouseEvent) => this.emit('mouseup', {priority: false, argument: event}))
    Scene.on('mousemove', (event: ScriptMouseEvent) => this.emit('mousemove', {priority: false, argument: event}))
    Scene.on('doubleclick', (event: ScriptMouseEvent) => this.emit('doubleclick', {priority: false, argument: event}))
    Scene.on('wheel', (event: ScriptWheelEvent) => this.emit('wheel', {priority: false, argument: event}))
    Scene.on('touchstart', (event: ScriptTouchEvent) => this.emit('touchstart', {priority: false, argument: event}))
    Scene.on('touchmove', (event: ScriptTouchEvent) => this.emit('touchmove', {priority: false, argument: event}))
    Scene.on('touchend', (event: ScriptTouchEvent) => this.emit('touchend', {priority: false, argument: event}))
    Scene.on('gamepadbuttonpress', (event: ScriptGamepadEvent) => this.emit('gamepadbuttonpress', {priority: false, argument: event}))
    Scene.on('gamepadbuttonrelease', (event: ScriptGamepadEvent) => this.emit('gamepadbuttonrelease', {priority: false, argument: event}))
    Scene.on('gamepadleftstickchange', (event: ScriptGamepadEvent) => this.emit('gamepadleftstickchange', {priority: false, argument: event}))
    Scene.on('gamepadrightstickchange', (event: ScriptGamepadEvent) => this.emit('gamepadrightstickchange', {priority: false, argument: event}))
    Input.on('keydown', (event: ScriptKeyboardEvent) => this.emit('keydown', {priority: true, argument: event}), true)
    Input.on('keyup', (event: ScriptKeyboardEvent) => this.emit('keyup', {priority: true, argument: event}), true)
    Input.on('mousedown', (event: ScriptMouseEvent) => this.emit('mousedown', {priority: true, argument: event}), true)
    Input.on('mouseup', (event: ScriptMouseEvent) => this.emit('mouseup', {priority: true, argument: event}), true)
    Input.on('mousemove', (event: ScriptMouseEvent) => this.emit('mousemove', {priority: true, argument: event}), true)
    Input.on('doubleclick', (event: ScriptMouseEvent) => this.emit('doubleclick', {priority: true, argument: event}), true)
    Input.on('wheel', (event: ScriptWheelEvent) => this.emit('wheel', {priority: true, argument: event}), true)
    Input.on('touchstart', (event: ScriptTouchEvent) => this.emit('touchstart', {priority: true, argument: event}), true)
    Input.on('touchmove', (event: ScriptTouchEvent) => this.emit('touchmove', {priority: true, argument: event}), true)
    Input.on('touchend', (event: ScriptTouchEvent) => this.emit('touchend', {priority: true, argument: event}), true)
    Input.on('gamepadbuttonpress', (event: ScriptGamepadEvent) => this.emit('gamepadbuttonpress', {priority: true, argument: event}), true)
    Input.on('gamepadbuttonrelease', (event: ScriptGamepadEvent) => this.emit('gamepadbuttonrelease', {priority: true, argument: event}), true)
    Input.on('gamepadleftstickchange', (event: ScriptGamepadEvent) => this.emit('gamepadleftstickchange', {priority: true, argument: event}), true)
    Input.on('gamepadrightstickchange', (event: ScriptGamepadEvent) => this.emit('gamepadrightstickchange', {priority: true, argument: event}), true)
  }

  /**
   * 注册事件指令
   * @param key 事件的键
   * @param type 事件类型
   */
  public register(key: string, type: GlobalEventType, commandList: CommandFunctionList): void {
    if (key === '') return
    // 取消已注册的相同键的事件指令
    const context = this.keyMap[key]
    if (context) {
      // 忽略重复注册
      if (context.commandList === commandList) return
      this.stopEvents(context.commandList)
      this.typeMap[context.type]!.remove(context.commandList)
    }
    // 注册新的事件指令
    this.keyMap[key] = {type, commandList}
    // 推迟注册事件以避免立即触发
    Callback.push(() => {
      if (this.keyMap[key]?.commandList === commandList) {
        (this.typeMap[type] ??= []).push(commandList)
      }
    })
    // 如果是自动执行事件，立即执行
    if (type === 'autorun') {
      EventHandler.call(new EventHandler(commandList))
    }
  }

  /**
   * 取消注册事件指令
   * @param key 事件的键
   */
  public unregister(key: string): void {
    const context = this.keyMap[key]
    if (context) {
      const {type, commandList} = context
      this.typeMap[type]?.remove(commandList)
      this.stopEvents(commandList)
      delete this.keyMap[key]
    }
  }

  /** 取消注册所有事件指令 */
  public unregisterAll(): void {
    const keyMap = this.keyMap
    const typeMap = this.typeMap
    for (const key of Object.keys(keyMap)) {
      const {type, commandList} = keyMap[key]!
      typeMap[type]?.remove(commandList)
      this.stopEvents(commandList)
      delete keyMap[key]
    }
  }

  /**
   * 停止指定的正在执行的(多个)事件
   * @param commandList 指令函数列表
   */
  public stopEvents(commandList: CommandFunctionList): void {
    for (const event of this.activeEvents) {
      if (event.initial === commandList) {
        event.finish()
      }
    }
  }

  /**
   * 获取指定ID的事件指令列表
   * @param id 事件ID
   * @returns 指令列表
   */
  public get(id: string): CommandFunctionList | undefined {
    return this.guidMap[id]
  }

  /** 重置全局事件的状态 */
  public reset(): void {
    this.unregisterAll()
    for (const commands of Object.values(this.guidMap) as Array<CommandFunctionList>) {
      commands.enabled = commands.default
    }
    this.version++
  }

  /**
   * 获取已启用的事件指令
   * @param type 事件类型
   */
  public getEnabledEvents(type: string): Array<CommandFunctionList> {
    const list = []
    for (const commands of this.typeMap[type]!) {
      if (commands.enabled) {
        list.push(commands)
      }
    }
    return list
  }

  /**
   * 调用全局事件
   * @param id 全局事件文件ID
   * @returns 生成的事件处理器
   */
  public call(id: string): EventHandler | undefined {
    const commands = this.guidMap[id]
    if (commands) {
      return EventHandler.call(new EventHandler(commands))
    }
  }

  /**
   * 发送全局事件
   * @param type 全局事件类型
   * @param options 全局事件选项
   */
  public emit(type: string, options: GlobalEventOptions = {}): void {
    for (const commands of this.typeMap[type] ?? []) {
      if (commands.enabled && (!('priority' in options) ||
        commands.priority === options.priority)) {
        const event = new EventHandler(commands)
        // 加载事件属性
        if ('properties' in options) {
          Object.assign(event, options.properties)
        }
        // 设置事件优先级
        event.priority = commands.priority
        EventHandler.call(event)
        // 如果事件停止传递，跳出
        if (type in Input.listeners && Input.bubbles.get() === false) {
          return
        }
      }
    }
    // 执行脚本事件(默认为高优先级)
    if (options.priority !== false) {
      this.script.emit(type, options.argument)
    }
  }

  /**
   * 添加已激活事件处理器
   * @param event 事件处理器
   */
  public append(event: EventHandler): void {
    this.activeEvents.push(event)
    // 添加事件完成回调函数：延迟移除
    event.onFinish(() => {
      Callback.push(() => {
        this.activeEvents.remove(event)
      })
    })
  }

  /**
   * 更新管理器中的已激活事件处理器
   * @param deltaTime 增量时间(毫秒)
   */
  public update(deltaTime: number): void {
    if (Game.paused === false) {
      for (const event of this.activeEvents) {
        event.update(deltaTime)
      }
    } else {
      for (const event of this.activeEvents) {
        if (event.priority) {
          event.update(deltaTime)
        }
      }
    }
    // 调试模式下检查独立执行事件
    if (Stats.debug && Game.paused === false) {
      for (const event of this.activeEvents) {
        if (event.type === 'independent') {
          const independent = event as any
          if (independent.debugTimeout === undefined) {
            independent.debugTimeout = 0
          } else {
            independent.debugTimeout += deltaTime
            if (independent.debugTimeout >= 60000) {
              independent.debugTimeout = -Infinity
              const initial = independent.initial as CommandFunctionList
              const warning = `An "Independent" event has been running in the background for 1 minute.\n${initial.path}`
              console.warn(warning)
              MessageReporter.displayMessage(warning)
            }
          }
        }
      }
    }
  }

  /**
   * 启用全局事件(延迟)
   * @param id 全局事件文件ID
   */
  public enable(id: string): void {
    const commands = this.guidMap[id]
    if (commands) {
      const {version} = this
      commands.callback = () => {
        if (this.version === version) {
          commands.enabled = true
        }
        delete commands.callback
      }
      Callback.push(() => {
        commands.callback?.()
      })
    }
  }

  /**
   * 禁用全局事件(立即)
   * @param id 全局事件文件ID
   */
  public disable(id: string): void {
    const commands = this.guidMap[id]
    if (commands) {
      commands.enabled = false
      delete commands.callback
    }
  }

  /**
   * 设置全局事件为最高优先级
   * @param id 全局事件文件ID
   */
  public setToHighestPriority(id: string): void {
    const commands = this.guidMap[id]
    if (commands) {
      // 延迟执行，将事件移动到头部
      Callback.push(() => {
        commands.priority = true
        const list = commands.parent!
        const index = list.indexOf(commands)
        for (let i = index; i > 0; i--) {
          list[i] = list[i - 1]
        }
        list[0] = commands
      })
    }
  }
}

/** ******************************** 插件管理器 ******************************** */

let PluginManager = new class PluginManager {
  [key: string]: any

  /** 初始化插件管理器 */
  public initialize(): void {
    const plugins = Data.plugins
    const manager = ScriptManager.create({}, plugins)
    // 获取脚本实例，以类名作为键进行注册
    for (const instance of manager.instances) {
      const name = instance.constructor.name as string
      if (name !== '') this[name] = instance
    }
    // 设置到事件管理器中
    EventManager.script = manager
  }
}

// 正在执行的事件相关属性(全局)
let CurrentEvent: EventHandler = {commands: [], index: 0, attributes: {}} as unknown as EventHandler
let CommandList: CommandFunctionList
let CommandIndex: number

/** ******************************** 事件处理器 ******************************** */

class EventHandler {
  /** 事件是否已完成 */
  public complete: boolean
  /** 指令函数列表 */
  public commands: CommandFunctionList
  /** 初始指令函数列表 */
  public initial: CommandFunctionList
  /** 正在执行的指令索引 */
  public index: number
  /** 指令堆栈 */
  public stack: CommandStack
  /** {键:属性值}映射表 */
  public attributes: AttributeMap
  /** 父对象 */
  public parent?: object
  /** 事件所在的更新器列表 */
  public updaters?: UpdaterList
  /** 计时器 */
  public timer?: EventTimer
  /** 事件优先级 */
  public priority?: boolean
  /** 是否传递事件 */
  public bubble?: boolean
  /** 事件触发角色 */
  public triggerActor?: Actor
  /** 事件触发技能 */
  public triggerSkill?: Skill
  /** 事件触发状态 */
  public triggerState?: State
  /** 事件触发装备 */
  public triggerEquipment?: Equipment
  /** 事件触发物品 */
  public triggerItem?: Item
  /** 事件触发对象 */
  public triggerObject?: SceneObject
  /** 事件触发光源 */
  public triggerLight?: SceneLight
  /** 事件触发区域 */
  public triggerRegion?: SceneRegion
  /** 事件触发地图 */
  public triggerTilemap?: SceneTilemap
  /** 事件触发元素 */
  public triggerElement?: UIElement
  /** 技能施放角色 */
  public casterActor?: Actor
  /** 目标角色 */
  public targetActor?: Actor
  /** 独立变量ID */
  public selfVarId?: string
  /** 保存的指令列表 */
  public savedCommands?: CommandFunctionList
  /** 保存的指令索引 */
  public savedIndex?: number
  /** 遍历数据列表 */
  public forEach?: Array<ForEachCommandContext>
  /** 过渡数据列表 */
  public transitions?: Array<TransitionCommandContext>
  /** 回调函数列表 */
  private callbacks?: Array<(event: this) => void>
  /** 类型 */
  get type() {return this.initial.type}
  /** 路径 */
  get path() {return this.initial.path}

  /**
   * 事件处理器
   * @param commands 事件指令列表
   */
  constructor(commands: CommandFunctionList) {
    this.complete = false
    this.priority = false
    this.commands = commands
    this.initial = commands
    this.index = 0
    this.stack = new CommandStack()
    // 是否继承一个事件处理器的数据
    if (commands.inheritance) {
      this.inheritEventContext(commands.inheritance)
      this.attributes = commands.inheritance.attributes
    } else {
      this.attributes = {}
    }
  }

  /**
   * 执行事件指令
   * @param deltaTime 增量时间(毫秒)
   * @returns 事件是否已完成
   */
  public update(deltaTime: number): boolean {
    // 设置相关属性到全局变量
    CurrentEvent = this
    CommandList = this.commands
    CommandIndex = this.index
    // 连续执行指令，直到返回false(中断)
    while (CommandList[CommandIndex++]()) {}
    // 取回全局变量中的事件属性
    this.commands = CommandList
    this.index = CommandIndex
    // 返回事件完成状态
    return this.complete
  }

  /**
   * 获取事件计时器
   * @returns 事件计时器
   */
  public getTimer(): EventTimer {
    return this.timer ?? (this.timer = new EventTimer(this))
  }

  /**
   * 事件等待指定时间
   * @param duration 等待时间(毫秒)
   * @returns 中断指令的执行
   */
  public wait(duration: number): false {
    this.getTimer().set(duration)
    return false
  }

  /**
   * 暂停执行事件
   * @returns 中断指令的执行
   */
  public pause(): false {
    this.getTimer()
    // 设置更新函数为：等待
    this.update = EventHandler.wait
    return false
  }

  /** 继续执行事件 */
  public continue(): void {
    this.timer?.continue()
  }

  /** 调用事件结束回调函数 */
  public finish(): void {
    if (this.complete === false) {
      this.complete = true
      // 执行结束回调
      if (this.callbacks !== undefined) {
        for (const callback of this.callbacks) {
          callback(this)
        }
      }
      // 设置更新函数为：完成
      this.update = EventHandler.complete
    }
  }

  /**
   * 设置事件结束回调
   * @param callback 回调函数
   */
  public onFinish(callback: (event: this) => void): void {
    if (this.complete) {
      callback(this)
    } else {
      // 添加回调函数到队列中
      if (this.callbacks !== undefined) {
        this.callbacks.push(callback)
      } else {
        this.callbacks = [callback]
      }
    }
  }

  /** 继承事件上下文 */
  public inheritEventContext(event: EventHandler): void {
    this.attributes = event.attributes
    if ('priority' in event) {
      this.priority = event.priority
    }
    for (const key of EventHandler.inheritedKeys) {
      // 继承事件上下文属性
      if (key in event) {
        (this as any)[key] = (event as any)[key]
      }
    }
  }

  /**
   * 返回等待状态(暂停事件方法)
   * @returns 中断指令的执行
   */
  private static wait = () => false

  /**
   * 返回完成状态(完成事件方法)
   * @returns 中断指令的执行
   */
  private static complete = () => true

  /**
   * 调用事件
   * @param event 事件处理器
   * @param updaters 更新器列表
   * @returns 传入的事件处理器
   */
  public static call = (event: EventHandler, updaters?: UpdaterList): EventHandler => {
    this.save()
    // 如果事件更新后发生了等待
    if (event.update(0) === false) {
      if (updaters !== undefined) {
        event.updaters = updaters
        // 如果指定了更新器列表，延迟将未执行完的事件放入
        Callback.push(() => {
          updaters.append(event)
        })
        // 设置事件结束时回调函数：延迟从更新器中移除
        event.onFinish(() => {
          Callback.push(() => {
            updaters.remove(event)
          })
        })
      } else {
        // 如果未指定更新器列表，添加到事件管理器中
        Callback.push(() => {
          EventManager.append(event)
        })
      }
    }
    this.restore()
    return event
  }

  // 事件栈
  private static stacks: Array<EventHandler> = []

  // 事件栈索引
  private static index: number = 0

  /** 保存正在执行的事件状态 */
  private static save(): void {
    this.stacks[this.index++] = CurrentEvent
    CurrentEvent.commands = CommandList
    CurrentEvent.index = CommandIndex
  }

  /** 恢复事件状态 */
  private static restore(): void {
    CurrentEvent = this.stacks[--this.index]
    CommandList = CurrentEvent.commands
    CommandIndex = CurrentEvent.index
  }

  // 继承事件上下文的属性键
  private static inheritedKeys = [
    'triggerActor',
    'triggerSkill',
    'triggerState',
    'triggerEquipment',
    'triggerItem',
    'triggerObject',
    'triggerLight',
    'triggerRegion',
    'triggerTilemap',
    'triggerElement',
    'casterActor',
    'targetActor',
    'selfVarId',
  ]
}

/** ******************************** 事件计时器 ******************************** */

class EventTimer {
  /** 等待时间 */
  public duration: number
  /** 绑定的事件处理器 */
  private event: EventHandler

  /**
   * @param event 事件处理器
   */
  constructor(event: EventHandler) {
    this.duration = 0
    this.event = event
    event.timer = this
  }

  /**
   * 设置等待时间
   * @param waitingTime 等待时间
   */
  public set(waitingTime: number): void {
    this.duration = waitingTime
    // 设置更新函数为：计时
    this.event.update = this.tick
  }

  /** 继续事件 */
  public continue(): void {
    // 恢复更新函数
    this.event.update = EventHandler.prototype.update
  }

  /**
   * 等待计时函数
   * @param this 事件处理器
   * @param deltaTime 增量时间(毫秒)
   * @returns 事件是否执行完毕
   */
  private tick(this: EventHandler, deltaTime: number): boolean {
    if ((this.timer!.duration -= deltaTime) <= 0) {
      this.update = EventHandler.prototype.update
      return this.update(deltaTime)
    }
    return false
  }
}

/** ******************************** 脚本方法列表 ******************************** */

class ScriptMethodList extends Array<ScriptMethodWrap> {
  /** 有效方法计数 */
  public count: number = 0

  /**
   * 添加方法到列表中
   * @param scriptInstance 脚本实例
   * @param methodName 方法名称
   */
  public add(scriptInstance: HashMap<Function>, methodName: string): void {
    if (this.count < this.length) {
      const wrap = this[this.count++]
      wrap.scriptInstance = scriptInstance
      wrap.methodName = methodName
    } else {
      this[this.count++] = {
        scriptInstance,
        methodName,
      }
    }
  }

  /**
   * 调用所有方法
   * @param argument 传递方法参数
   */
  public call(argument: any): void {
    for (let i = 0; i < this.count; i++) {
      const wrap = this[i]
      wrap.scriptInstance[wrap.methodName]!(argument)
    }
  }

  /**
   * 重置列表
   * @returns 当前对象
   */
  public reset(): this {
    this.count = 0
    return this
  }
}

/** ******************************** 脚本管理器 ******************************** */

class ScriptManager {
  [key: string]: any
  /** 父对象 */
  public parent: ScriptParentNode
  /** 脚本实例 */
  public instances: Array<any>

  /**
   * 脚本管理器
   * @param owner 脚本宿主对象
   */
  constructor(owner: any) {
    this.parent = owner
    this.instances = []
  }

  /**
   * 添加脚本对象
   * @param instance 脚本对象
   */
  public add(instance: any): void {
    // 以脚本类名作为键进行注册
    const name = instance.constructor.name
    if (name !== '') this[name] = instance
    // 如果实现了update方法，则添加到父级更新器列表
    if (typeof instance.update === 'function') {
      this.parent.updaters?.push(instance)
    }
    this.instances.push(instance)
    // 触发添加脚本事件
    instance.onScriptAdd?.(this.parent)
  }

  /**
   * 移除脚本对象(未使用)
   * @param instance 脚本对象
   */
  public remove(instance: any): void {
    const name = instance.constructor.name
    if (this[name] === instance) delete this[name]
    if (typeof instance.update === 'function') {
      this.parent.updaters?.remove(instance)
    }
    this.instances.remove(instance)
    // 触发移除脚本事件
    instance.onScriptRemove?.(this.parent)
  }

  /**
   * 调用脚本方法
   * @param method 方法名称
   * @param args 传递参数
   */
  public call(method: string, ...args: Array<any>): void {
    for (const instance of this.instances) {
      instance[method]?.(...args)
    }
  }

  /**
   * 发送脚本事件
   * @param type 事件类型
   * @param argument 传递参数
   */
  public emit(type: string, argument?: any): void {
    // 将事件类型映射到脚本事件方法名称
    const method = ScriptManager.eventTypeMap[type] ?? ''
    // 调用每个脚本对象的事件方法，并传递参数
    for (const instance of this.instances) {
      if (method in instance) {
        instance[method](argument)
        // 如果事件停止传递，跳出
        if (type in Input.listeners && Input.bubbles.get() === false) {
          return
        }
      }
    }
  }

  /**
   * 获取脚本事件列表
   * @param type 事件类型
   * @returns 脚本事件列表
   */
  public getEvents(type: string): ScriptMethodList | undefined {
    // 将事件类型映射到脚本事件方法名称
    const method = ScriptManager.eventTypeMap[type] ?? ''
    const methods = ScriptManager.scriptMethods.reset()
    // 调用每个脚本对象的事件方法，并传递参数
    for (const instance of this.instances) {
      if (typeof instance[method] === 'function') {
        methods.add(instance, method)
      }
    }
    return methods.count > 0 ? methods : undefined
  }

  /** 延迟获取函数返回参数的开关 */
  public static deferredLoading: boolean = false
  /** 延迟获取函数返回参数的数量 */
  private static deferredCount: number = 0
  /** 延迟加载的脚本实例列表 */
  private static deferredInstances: Array<any> = []
  /** 延迟加载参数的键列表 */
  private static deferredKeys: Array<string> = []
  /** 延迟加载参数的返回值函数列表 */
  private static deferredValues: Array<Function | undefined> = []
  /** 脚本方法列表 */
  private static scriptMethods: ScriptMethodList = new ScriptMethodList()

  /**
   * 放入延迟获取的脚本参数
   * 等待场景对象和UI元素创建完毕后再获取
   * @param instance 脚本对象
   * @param key 参数的键
   * @param value 返回值函数
   */
  private static pushDeferredParameter(instance: object, key: string, value: Function): void {
    ScriptManager.deferredInstances[ScriptManager.deferredCount] = instance
    ScriptManager.deferredKeys[ScriptManager.deferredCount] = key
    ScriptManager.deferredValues[ScriptManager.deferredCount] = value
    ScriptManager.deferredCount++
  }

  /** 加载延迟参数到脚本对象中 */
  public static loadDeferredParameters(): void {
    for (let i = 0; i < ScriptManager.deferredCount; i++) {
      ScriptManager.deferredInstances[i][ScriptManager.deferredKeys[i]] = ScriptManager.deferredValues[i]!()
      ScriptManager.deferredInstances[i] = undefined
      ScriptManager.deferredValues[i] = undefined
    }
    ScriptManager.deferredCount = 0
    ScriptManager.deferredLoading = false
  }

  /**
   * 创建脚本管理器(使用脚本数据)
   * @param owner 脚本宿主对象
   * @param data 脚本数据列表
   * @returns 生成的脚本管理器
   */
  public static create(owner: object, data: Array<ScriptData>): ScriptManager {
    const manager = new ScriptManager(owner)
    // 如果脚本列表不为空
    if (data.length > 0) {
      for (const wrap of data) {
        // 如果脚本已禁用，跳过
        if (wrap.enabled === false) continue
        // 初始化以及重构参数列表(丢弃无效参数)
        if (wrap.initialized === undefined) {
          wrap.initialized = true
          wrap.parameters = ScriptManager.compileParamList(wrap.id, wrap.parameters)
        }
        const {id, parameters} = wrap
        const script = Data.scripts[id]
        // 如果不存在脚本，发送警告
        if (script === undefined) {
          const meta = Data.manifest.guidMap[id]
          const name = meta?.path ?? `#${id}`
          console.error(new Error(`The script is missing: ${name}`), owner)
          continue
        }
        // 创建脚本对象实例，并传递脚本参数
        const instance = new script.constructor(owner)
        const length = parameters.length
        for (let i = 0; i < length; i += 2) {
          const key = parameters[i]
          let value = parameters[i + 1]
          if (typeof value === 'function') {
            if (ScriptManager.deferredLoading) {
              // 如果值类型是函数，且开启了延时加载参数开关
              ScriptManager.pushDeferredParameter(instance, key, value)
              continue
            }
            value = value()
          }
          instance[key] = value
        }
        manager.add(instance)
      }
    }
    return manager
  }

  /**
   * 编译脚本参数列表
   * @param id 脚本文件ID
   * @param parameters 脚本参数数据列表
   * @returns 编译后的脚本参数列表
   */
  public static compileParamList(id: string, parameters: HashMap<unknown>): Array<unknown> {
    const script = Data.scripts[id]
    // 如果不存在脚本，返回空列表
    if (script === undefined) {
      return Array.empty
    }
    const defParameters = script.parameters
    const length = defParameters.length
    // 如果不存在参数，返回空列表
    if (length === 0) {
      return Array.empty
    }
    // 创建扁平化的参数列表
    const parameterList = new Array(length * 2)
    for (let i = 0; i < length; i++) {
      const defParameter = defParameters[i]
      const {key, type} = defParameter
      let value = parameters[key]
      // 根据默认参数类型，对实参进行有效性检查
      // 如果实参是无效的，则使用默认值
      switch (type) {
        case 'boolean':
        case 'number':
          if (typeof value !== type) {
            value = defParameter.value
          }
          break
        case 'variable-number':
          if (typeof value !== 'number') {
            if ((value as ScriptVariableGetter)?.getter === 'variable') {
              value = Command.compileVariable(value as VariableGetter, Attribute.NUMBER_GET)
            } else {
              value = Function.undefined
            }
          }
          break
        case 'option':
          if (!defParameter.options!.includes(value as boolean | number | string)) {
            value = defParameter.value
          }
          break
        case 'number[]':
        case 'string[]':
          if (Array.isArray(value)) {} else {
            value = defParameter.value
          }
          break
        case 'attribute':
          value = Attribute.get(value as string)
          break
        case 'attribute-key':
          value = Attribute.getKey(value as string)
          break
        case 'enum':
          value = Enum.get(value as string)
          break
        case 'enum-value':
          value = Enum.getValue(value as string)
          break
        case 'actor': {
          const id = value as string
          value = () => Scene.entity.get(id)
          break
        }
        case 'region': {
          const id = value as string
          value = () => Scene.entity.get(id)
          break
        }
        case 'light': {
          const id = value as string
          value = () => Scene.entity.get(id)
          break
        }
        case 'animation': {
          const id = value as string
          value = () => Scene.entity.get(id)
          break
        }
        case 'particle': {
          const id = value as string
          value = () => Scene.entity.get(id)
          break
        }
        case 'parallax': {
          const id = value as string
          value = () => Scene.entity.get(id)
          break
        }
        case 'tilemap': {
          const id = value as string
          value = () => Scene.entity.get(id)
          break
        }
        case 'element': {
          const id = value as string
          value = () => UI.entity.get(id)
          break
        }
        case 'keycode':
          if (typeof value !== 'string') {
            value = defParameter.value
          }
          break
        case 'variable-getter':
          if ((value as ScriptVariableGetter)?.getter === 'variable') {
            value = Command.compileVariable(value as VariableGetter, Attribute.GET)
          } else {
            value = Function.undefined
          }
          break
        case 'variable-setter':
          if ((value as ScriptVariableGetter)?.getter === 'variable') {
            value = {
              get: Command.compileVariable(value as VariableGetter, Attribute.GET),
              set: Command.compileVariable(value as VariableGetter, Attribute.SAFE_SET),
            }
          } else {
            value = Function.undefined
          }
          break
        case 'actor-getter':
          if ((value as ScriptActorGetter)?.getter === 'actor') {
            value = Command.compileActor(value as ActorGetter)
          } else {
            value = Function.undefined
          }
          break
        case 'skill-getter':
          if ((value as ScriptSkillGetter)?.getter === 'skill') {
            value = Command.compileSkill(value as SkillGetter)
          } else {
            value = Function.undefined
          }
          break
        case 'state-getter':
          if ((value as ScriptStateGetter)?.getter === 'state') {
            value = Command.compileState(value as StateGetter)
          } else {
            value = Function.undefined
          }
          break
        case 'equipment-getter':
          if ((value as ScriptEquipmentGetter)?.getter === 'equipment') {
            value = Command.compileEquipment(value as EquipmentGetter)
          } else {
            value = Function.undefined
          }
          break
        case 'item-getter':
          if ((value as ScriptItemGetter)?.getter === 'item') {
            value = Command.compileItem(value as ItemGetter)
          } else {
            value = Function.undefined
          }
          break
        case 'element-getter':
          if ((value as ScriptElementGetter)?.getter === 'element') {
            value = Command.compileElement(value as ElementGetter)
          } else {
            value = Function.undefined
          }
          break
        case 'position-getter':
          if ((value as ScriptPositionGetter)?.getter === 'position') {
            const getPoint = Command.compilePosition(value as PositionGetter)
            value = () => {
              const point = getPoint()
              return point ? {x: point.x, y: point.y} : undefined
            }
          } else {
            value = Function.undefined
          }
          break
        default:
          if (typeof value !== 'string') {
            value = defParameter.value
          }
          break
      }
      const pi = i * 2
      parameterList[pi] = key
      parameterList[pi + 1] = value
    }
    return parameterList
  }

  /** {事件类型:脚本方法名称}映射表 */
  private static eventTypeMap: HashMap<string> = {
    common: '',
    update: 'update',
    create: 'onCreate',
    load: 'onLoad',
    autorun: 'onStart',
    collision: 'onCollision',
    hittrigger: 'onHitTrigger',
    hitactor: 'onHitActor',
    destroy: 'onDestroy',
    playerenter: 'onPlayerEnter',
    playerleave: 'onPlayerLeave',
    actorenter: 'onActorEnter',
    actorleave: 'onActorLeave',
    skillcast: 'onSkillCast',
    skilladd: 'onSkillAdd',
    skillremove: 'onSkillRemove',
    stateadd: 'onStateAdd',
    stateremove: 'onStateRemove',
    equipmentadd: 'onEquipmentAdd',
    equipmentremove: 'onEquipmentRemove',
    equipmentgain: '',
    itemuse: 'onItemUse',
    itemgain: '',
    moneygain: '',
    keydown: 'onKeyDown',
    keyup: 'onKeyUp',
    mousedown: 'onMouseDown',
    mousedownLB: 'onMouseDownLB',
    mousedownRB: 'onMouseDownRB',
    mouseup: 'onMouseUp',
    mouseupLB: 'onMouseUpLB',
    mouseupRB: 'onMouseUpRB',
    mousemove: 'onMouseMove',
    mouseenter: 'onMouseEnter',
    mouseleave: 'onMouseLeave',
    click: 'onClick',
    doubleclick: 'onDoubleClick',
    wheel: 'onWheel',
    touchstart: 'onTouchStart',
    touchmove: 'onTouchMove',
    touchend: 'onTouchEnd',
    select: 'onSelect',
    deselect: 'onDeselect',
    input: 'onInput',
    focus: 'onFocus',
    blur: 'onBlur',
    ended: 'onEnded',
    gamepadbuttonpress: 'onGamepadButtonPress',
    gamepadbuttonrelease: 'onGamepadButtonRelease',
    gamepadleftstickchange: 'onGamepadLeftStickChange',
    gamepadrightstickchange: 'onGamepadRightStickChange',
    startup: 'onStartup',
    createscene: 'onSceneCreate',
    loadscene: 'onSceneLoad',
    loadsave: 'onSaveLoad',
    preload: 'onPreload',
  }
}

/** ******************************** 脚本键盘事件 ******************************** */

class ScriptKeyboardEvent {
  /** 浏览器键盘事件 */
  public browserKeyboardEvent: KeyboardEvent

  /** 键名 */
  public get keyName(): KeyboardKeyName {
    return this.browserKeyboardEvent.code as KeyboardKeyName
  }

  /** Shift键是否按下 */
  public get shiftKey(): boolean {
    return this.browserKeyboardEvent.shiftKey
  }

  /** Meta键是否按下 */
  public get metaKey(): boolean {
    return this.browserKeyboardEvent.metaKey
  }

  /** Ctrl键是否按下 */
  public get ctrlKey(): boolean {
    return this.browserKeyboardEvent.ctrlKey
  }

  /** Alt键是否按下 */
  public get altKey(): boolean {
    return this.browserKeyboardEvent.altKey
  }

  /**
   * @param event 原生键盘事件
   */
  constructor(event: KeyboardEvent) {
    this.browserKeyboardEvent = event
  }
}

/** ******************************** 脚本鼠标事件 ******************************** */

class ScriptMouseEvent {
  /** 浏览器鼠标事件 */
  public browserMouseEvent: MouseEvent

  /** 键码 */
  public get button(): number {
    return this.browserMouseEvent.button
  }

  /** Shift键是否按下 */
  public get shiftKey(): boolean {
    return this.browserMouseEvent.shiftKey
  }

  /** Meta键是否按下 */
  public get metaKey(): boolean {
    return this.browserMouseEvent.metaKey
  }

  /** Ctrl键是否按下 */
  public get ctrlKey(): boolean {
    return this.browserMouseEvent.ctrlKey
  }

  /** Alt键是否按下 */
  public get altKey(): boolean {
    return this.browserMouseEvent.altKey
  }

  /**
   * @param event 原生鼠标(指针)事件
   */
  constructor(event: MouseEvent) {
    this.browserMouseEvent = event
  }
}

/** ******************************** 脚本滚轮事件 ******************************** */

class ScriptWheelEvent {
  /** 浏览器滚轮事件 */
  public browserWheelEvent: WheelEvent

  /** 垂直滑动增量 */
  public get deltaY(): number {
    return this.browserWheelEvent.deltaY
  }

  /** Shift键是否按下 */
  public get shiftKey(): boolean {
    return this.browserWheelEvent.shiftKey
  }

  /** Meta键是否按下 */
  public get metaKey(): boolean {
    return this.browserWheelEvent.metaKey
  }

  /** Ctrl键是否按下 */
  public get ctrlKey(): boolean {
    return this.browserWheelEvent.ctrlKey
  }

  /** Alt键是否按下 */
  public get altKey(): boolean {
    return this.browserWheelEvent.altKey
  }

  /**
   * @param event 原生滚轮事件
   */
  constructor(event: WheelEvent) {
    this.browserWheelEvent = event
  }
}

/** ******************************** 脚本触摸事件 ******************************** */

class ScriptTouchEvent {
  /** 浏览器触摸事件 */
  public browserTouchEvent: TouchEvent

  /** 触摸点列表 */
  public touches: Array<TouchPoint>

  /** 已改变的触摸点列表 */
  public changedTouches: Array<TouchPoint>

  /** Shift键是否按下 */
  public get shiftKey(): boolean {
    return this.browserTouchEvent.shiftKey
  }

  /** Meta键是否按下 */
  public get metaKey(): boolean {
    return this.browserTouchEvent.metaKey
  }

  /** Ctrl键是否按下 */
  public get ctrlKey(): boolean {
    return this.browserTouchEvent.ctrlKey
  }

  /** Alt键是否按下 */
  public get altKey(): boolean {
    return this.browserTouchEvent.altKey
  }

  /**
   * @param event 原生触摸事件
   */
  constructor(event: TouchEvent) {
    this.browserTouchEvent = event
    const touchMap = ScriptTouchEvent.touchMap
    const rawTouches = event.touches
    const newTouches = new Array(rawTouches.length) as Array<TouchPoint>
    const rawChangedTouches = event.changedTouches
    const newChangedTouches = new Array(rawChangedTouches.length)
    for (let i = 0; i < rawTouches.length; i++) {
      const rawTouch = rawTouches[i]
      const id = rawTouch.identifier
      const newTouch = touchMap[id] ??= new TouchPoint()
      newTouches[i] = newTouch.set(rawTouch)
    }
    for (let i = 0; i < rawChangedTouches.length; i++) {
      const rawTouch = rawChangedTouches[i]
      const id = rawTouch.identifier
      const newTouch = touchMap[id] ??= new TouchPoint()
      newChangedTouches[i] = newTouch.set(rawTouch)
    }
    this.touches = newTouches
    this.changedTouches = newChangedTouches
  }

  /**
   * 获取触摸点
   * @param touchId 触摸点ID
   * @returns 触摸点
   */
  public getTouch(touchId: number): TouchPoint | undefined {
    for (const touch of this.changedTouches) {
      if (touch.id === touchId) {
        return touch
      }
    }
    for (const touch of this.touches) {
      if (touch.id === touchId) {
        return touch
      }
    }
    return undefined
  }

  /** 触摸点映射表 */
  public static touchMap: HashMap<TouchPoint> = {}
}

/** ******************************** 触摸点 ******************************** */

class TouchPoint {
  /** 触摸点ID */
  public id: number = 0
  /** 屏幕X */
  public screenX: number = 0
  /** 屏幕Y */
  public screenY: number = 0
  /** 界面X */
  public uiX: number = 0
  /** 界面Y */
  public uiY: number = 0
  /** 场景X */
  public sceneX: number = 0
  /** 场景Y */
  public sceneY: number = 0

  /**
   * 设置触摸点
   * @param touch 原生触摸点
   */
  public set(touch: Touch): TouchPoint {
    this.id = touch.identifier
    const {x: screenX, y: screenY} = Mouse.convertClientToScreenCoords(touch.clientX, touch.clientY)
    this.screenX = screenX
    this.screenY = screenY
    this.uiX = screenX / UI.scale
    this.uiY = screenY / UI.scale
    const {x: sceneX, y: sceneY} = Mouse.convertScreenToSceneCoords(screenX, screenY)
    this.sceneX = sceneX
    this.sceneY = sceneY
    return this
  }
}

/** ******************************** 脚本手柄事件 ******************************** */

class ScriptGamepadEvent {
  /** 游戏手柄 */
  public gamepad: Gamepad
  /** 摇杆角度(默认: -1) */
  public stickAngle: number
  /** 键码(默认: -1) */
  public buttonCode: number
  /** 键名(默认: '') */
  public buttonName: string
  /** 状态(即时更新) */
  public states: ControllerButtonStateMap

  /**
   * @param gamepad 游戏手柄
   */
  constructor(gamepad: Gamepad) {
    this.gamepad = gamepad
    this.stickAngle = Controller.stickAngle
    this.buttonCode = Controller.buttonCode
    this.buttonName = Controller.buttonName
    this.states = Controller.states
  }
}

/** ******************************** 脚本输入事件 ******************************** */

class ScriptInputEvent {
  /** 浏览器输入事件 */
  public browserInputEvent: InputEvent

  /** 输入数据 */
  public get data(): string | null {
    return this.browserInputEvent.data
  }

  /** 输入类型 */
  public get inputType(): string {
    return this.browserInputEvent.inputType
  }

  /**
   * @param event 原生输入事件
   */
  constructor(event: InputEvent) {
    this.browserInputEvent = event
  }
}

/** ******************************** 脚本碰撞事件 ******************************** */

class ScriptCollisionEvent {
  /** 当前角色 */
  public actor: Actor
  /** 碰撞角色 */
  public contact: Actor

  /**
   * @param actor 当前角色
   * @param contact 碰撞角色
   */
  constructor(actor: Actor, contact: Actor) {
    this.actor = actor
    this.contact = contact
  }
}

/** ******************************** 脚本触发器击中事件 ******************************** */

class ScriptTriggerHitEvent {
  /** 被击中的角色 */
  public actor: Actor
  /** 击中角色的触发器 */
  public trigger: Trigger
  /** 触发器技能施放者 */
  public caster: Actor | null

  /**
   * @param actor 被击中的角色
   * @param trigger 击中角色的触发器
   */
  constructor(actor: Actor, trigger: Trigger) {
    this.actor = actor
    this.trigger = trigger
    this.caster = trigger.caster
  }
}

/** ******************************** 脚本区域事件 ******************************** */

class ScriptRegionEvent {
  /** 触发事件的角色 */
  public actor: Actor
  /** 区域对象 */
  public region: SceneRegion

  /**
   * @param actor 触发事件的角色
   * @param region 区域对象
   */
  constructor(actor: Actor, region: SceneRegion) {
    this.actor = actor
    this.region = region
  }
}