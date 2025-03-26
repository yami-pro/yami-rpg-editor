/** ******************************** 运行时指令栈 ******************************** */

class CommandStack {
  /** 指令列表数组 */
  private commandArray: Array<CommandFunctionList> = []
  /** 指令索引数组 */
  private indexArray: Array<number> = []
  /** 指令栈索引 */
  private index: number = 0

  /**
   * 推入事件指令的执行状态
   * @param commands 事件指令列表
   * @param index 事件指令索引
   */
  public push(commands: CommandFunctionList, index: number): void {
    this.commandArray[this.index] = commands
    this.indexArray[this.index] = index
    this.index++
  }

  /**
   * 弹出事件指令的执行状态
   * @returns 事件指令状态包装器
   */
  public pop(): CommandStackWrap | null {
    if (this.index !== 0) {
      this.index--
      CommandStack.wrap[0] = this.commandArray[this.index]
      CommandStack.wrap[1] = this.indexArray[this.index]
      return CommandStack.wrap
    }
    return null
  }

  // 数据包装[指令列表, 索引]
  private static wrap: CommandStackWrap = new Array(2) as CommandStackWrap
}

/** ******************************** 编译时指令栈 ******************************** */

class CompileTimeCommandStack extends Array<CompileTimeCommandContext> {
  /** 获取上一次入栈的指令上下文 */
  public get() {return this[this.length - 1]}
}

/** ******************************** 指令函数列表 ******************************** */

class CommandFunctionList extends Array<CommandFunction> {
  public type: string = ''
  public path: string = ''
  public default?: boolean
  public enabled?: boolean
  public priority?: boolean
  public namespace?: boolean
  public inheritance?: EventHandler
  public returnType?: GlobalEventReturnType
  public description?: string
  public parameters?: Array<GlobalEventParameter>
  public parent?: Array<CommandFunctionList>
  public callback?: CallbackFunction
}

/** ******************************** 指令编译器 ******************************** */

let Command = new class CommandCompiler {
  /** 编译时指令栈 */
  private stack: CompileTimeCommandStack = new CompileTimeCommandStack()
  /** 编译时标签上下文集合 */
  private labels: HashMap<compileTimeLabelContext> = Object.empty
  /** 编译时跳转上下文集合 */
  private jumps: Array<compileTimeJumpContext> = Array.empty
  /** 编译时返回上下文集合 */
  private returns: Array<compileTimeReturnContext> = Array.empty
  /** 自定义指令脚本映射表 */
  private scriptMap: HashMap<any> = {}
  /** 参数正则表达式映射表 */
  private paramRegExpMap: HashMap<RegExp> = {}
  /** 参数字符串 */
  public parameters: string = ''
  /** 显示文本指令内容 */
  public textContent: string = ''
  /** 显示选项进入分支 */
  public choiceIndex: number = -1
  /** 显示选项内容列表 */
  public choiceContents: Array<string> = []
  /** 返回值的键 */
  public returnKey: symbol = Symbol('RETURN_VALUE')
  /** 继承事件指令列表的键 */
  public inheritKey = Symbol("INHERITED_COMMANDS")
  /** 异步指令块事件列表的键 */
  public asyncKey = Symbol("ASYNC_COMMANDS")
  /** 自定义指令脚本管理器 */
  public custom!: ScriptManager

  /** 初始化自定义指令 */
  public initialize(): void {
    const commands = Data.commands
    const parameters = {}
    // 给自定义指令添加空的参数表
    for (const command of commands) {
      command.parameters = parameters
    }
    // 创建自定义指令的脚本管理器
    this.custom = ScriptManager.create({}, commands)
    // 获取脚本实例，以GUID作为键进行注册
    for (const instance of this.custom.instances) {
      const guid: string = instance.constructor.guid
      this.scriptMap[guid] = instance
    }
  }

  /**
   * 编译指令
   * @param commands 指令数据列表
   * @param callback 指令执行完毕时回调函数
   * @param loop 当前指令列表是否处于循环状态
   * @returns 编译后的事件指令函数列表
   */
  public compile(commands: CommandDataList, callback?: CommandFunction, loop: boolean = false): CommandFunctionList {
    const stack = this.stack
    const functions = new CommandFunctionList()
    const context: CompileTimeCommandContext = {
      commands: functions,
      index: 0,
      loop: loop,
      path: '',
    }
    // 创建标签集合与跳转列表
    if (stack.length === 0) {
      context.path = commands.path
      this.labels = {}
      this.jumps = []
      this.returns = []
    }
    stack.push(context)
    const length = commands.length
    for (let i = 0; i < length; i++) {
      const command = commands[i]
      // 如果指令是函数，添加并跳过
      if (typeof command === 'function') {
        functions[context.index++] = command
        continue
      }
      const id = command.id
      // 跳过禁用的事件指令
      if (id[0] === '!') continue
      // 编译内置和自定义指令
      const fn = id in this
      ? (this as any)[id](command.params)
      : this.compileScript(command)
      // 跳过无效编译函数
      if (fn === null) continue
      if (typeof fn === 'function') {
        functions[context.index++] = fn
        continue
      }
      for (const cmdfn of fn) {
        functions[context.index++] = cmdfn
      }
    }
    // 添加栈尾回调函数
    functions.push(callback ?? Command.readStack)
    stack.pop()
    // 编译跳转
    if (stack.length === 0) {
      Command.compileJumps()
      Command.compileReturns(context)
    }
    // 返回编译后的函数列表
    return functions
  }

  /**
   * 编译独立指令
   * @param commands 指令数据列表
   * @param callback 指令执行完毕时回调函数
   * @param loop 当前指令列表是否处于循环状态
   * @returns 编译后的事件指令函数列表
   */
  public compileIndependent(commands: CommandDataList): CommandFunctionList {
    const {stack, labels, jumps, returns} = Command
    Command.stack = new CompileTimeCommandStack()
    const compiledCommands = Command.compile(commands)
    Command.stack = stack
    Command.labels = labels
    Command.jumps = jumps
    Command.returns = returns
    return compiledCommands
  }

  /** 编译自定义指令脚本 */
  private compileScript({id, params}: {
    /** 事件指令ID */
    id: string
    /** 事件指令参数 */
    params: HashMap<unknown>
  }): CommandFunction {
    let fn = Command.skip
    return () => {
      const script = this.scriptMap[id]
      if (typeof script?.call === 'function') {
        // 如果指令脚本拥有call方法，则编译参数列表，替换指令函数
        const parameters = ScriptManager.compileParamList(id, params)
        const length = parameters.length
        if (length === 0) {
          fn = () => (script.call(CurrentEvent) ?? true)
        } else {
          fn = () => {
            for (let i = 0; i < length; i += 2) {
              let value = parameters[i + 1]
              if (typeof value === 'function') {
                value = value()
              }
              script[parameters[i] as string] = value
            }
            return script.call(CurrentEvent) ?? true
          }
        }
      }
      // 编译时不能确定脚本已加载，因此使用运行时编译
      return (CommandList[CommandIndex - 1] = fn)()
    }
  }

  /** 编译跳转(后处理) */
  private compileJumps() {
    const {labels, jumps} = this
    for (const {operation, label, commands, index} of jumps) {
      const context = labels[label]
      if (context) {
        const jump = Command.goto(
          context.commands,
          context.index,
        )
        let fn
        switch (operation) {
          case 'jump':
            fn = jump
            break
          case 'save-jump':
            fn = () => {
              CurrentEvent.savedCommands = CommandList
              CurrentEvent.savedIndex = CommandIndex
              return jump()
            }
            break
        }
        // 替换指令占位函数
        commands[index] = fn
      }
    }
    this.labels = Object.empty
    this.jumps = Array.empty
  }

  /** 编译返回(后处理) */
  private compileReturns(context: CompileTimeCommandContext) {
    for (const {commands, index} of this.returns) {
      const commandFn = commands[index]
      const jumpToEnd = Command.goto(
        context.commands,
        context.index,
      )
      // 替换指令占位函数
      if (commandFn === Command.skip) {
        commands[index] = jumpToEnd
      } else {
        commands[index] = () => (commandFn(), jumpToEnd())
      }
    }
    this.returns = Array.empty
  }

  /** 返回值 */
  protected return({type, value}: GlobalEventResultGetter): CommandFunction {
    const {commands, index} = this.stack.get()
    this.returns.push({commands, index})
    const returnKey = this.returnKey
    const setter = type === 'none'
    ? Function.empty
    : (value: any) => {
      (CurrentEvent.attributes as any)[returnKey] = value
    }
    switch (type) {
      case 'none':
        return Command.skip
      case 'boolean':
        return () => (setter(value), true)
      case 'number': {
        const getNumber = Command.compileNumber(value)
        return () => (setter(getNumber()), true)
      }
      case 'string': {
        const getString = Command.compileString(value)
        return () => (setter(getString()), true)
      }
      case 'object': {
        const getObject = Command.compileVariable(value, Attribute.OBJECT_GET)
        return () => (setter(getObject()), true)
      }
      case 'actor': {
        const getActor = Command.compileActor(value)
        return () => (setter(getActor()), true)
      }
      case 'skill': {
        const getSkill = Command.compileSkill(value)
        return () => (setter(getSkill()), true)
      }
      case 'state': {
        const getState = Command.compileState(value)
        return () => (setter(getState()), true)
      }
      case 'equipment': {
        const getEquipment = Command.compileEquipment(value)
        return () => (setter(getEquipment()), true)
      }
      case 'item': {
        const getItem = Command.compileItem(value)
        return () => (setter(getItem()), true)
      }
      case 'trigger': {
        const getTrigger = Command.compileTrigger(value)
        return () => (setter(getTrigger()), true)
      }
      case 'light': {
        const getLight = Command.compileLight(value)
        return () => (setter(getLight()), true)
      }
      case 'element': {
        const getElement = Command.compileElement(value)
        return () => (setter(getElement()), true)
      }
    }
  }

  /**
   * 编译数值
   * @param number 数值或变量访问器
   * @param defValue 默认值
   * @param min 最小值
   * @param max 最大值
   * @returns 数值访问器函数
   */
  private compileNumber(number: number | VariableGetter, defValue?: number, min?: number, max?: number): () => number {
    switch (typeof number) {
      case 'number':
        return () => number
      case 'object': {
        const getNumber = Command.compileVariable(number, Attribute.NUMBER_GET)
        if (typeof defValue !== 'number') defValue = 0
        return typeof min === 'number' && typeof max === 'number'
        ? () => Math.clamp(getNumber() ?? defValue, min, max)
        : () => getNumber() ?? defValue
      }
    }
  }

  /**
   * 编译字符串
   * @param string 字符串或变量访问器
   * @param defValue 默认值
   * @returns 字符串访问器函数
   */
  private compileString(string: string | VariableGetter, defValue?: string): () => string {
    switch (typeof string) {
      case 'string':
        return () => string
      case 'object': {
        const getString = Command.compileVariable(string, Attribute.GET)
        if (typeof defValue !== 'string') defValue = ''
        return () => {
          const value = getString()
          switch (typeof value) {
            case 'string':
              return value
            case 'number':
            case 'boolean':
              return value.toString()
            default:
              return defValue!
          }
        }
      }
    }
  }

  /**
   * 编译枚举值
   * @param enumId 枚举值ID或变量访问器
   * @returns 枚举值访问器函数
   */
  private compileEnumValue(enumId: string | VariableGetter): () => string {
    switch (typeof enumId) {
      case 'string': {
        const enumString = Enum.getValue(enumId)
        return () => enumString
      }
      case 'object': {
        const getString = Command.compileVariable(enumId, Attribute.STRING_GET)
        return () => getString() ?? ''
      }
    }
  }

  /** 编译变量对象 */
  public compileVariable = function compileVariable(IIFE) {
    const compilers = {
      actor: (actor: ActorGetter) => Command.compileActor(actor),
      skill: (skill: SkillGetter) => Command.compileSkill(skill),
      state: (state: StateGetter) => Command.compileState(state),
      equipment: (equipment: EquipmentGetter) => Command.compileEquipment(equipment),
      item: (item: ItemGetter) => Command.compileItem(item),
      element: (element: ElementGetter) => Command.compileElement(element),
    }
    /**
     * 编译变量对象
     * @param variable 变量访问器
     * @param operation 变量操作
     * @returns 变量操作函数
     */
    return function (variable: VariableGetter, operation: Function): (value?: any) => any {
      const key = 'key' in variable ? variable.key : ''
      const type = variable.type
      switch (type) {
        case 'local':
          return (value?: any) => operation(CurrentEvent.attributes, key, value)
        case 'global':
          return (value?: any) => operation(Variable.map, key, value)
        case 'self':
          return (value?: any) => CurrentEvent.selfVarId && operation(SelfVariable.map, CurrentEvent.selfVarId, value)
        case 'actor':
        case 'skill':
        case 'state':
        case 'equipment':
        case 'item':
        case 'element':
          switch (typeof key) {
            case 'string': {
              // @ts-ignore
              const getter = compilers[type](variable[type])
              const attrKey = Attribute.get(key)?.key
              if (!attrKey) return Function.empty
              return (value?: any) => {
                const target = getter()
                if (target) {
                  return operation(target.attributes, attrKey, value)
                }
              }
            }
            case 'object': {
              // @ts-ignore
              const getter = compilers[type](variable[type])
              const getString = Command.compileString(key)
              return (value?: any) => {
                const target = getter()
                const attrKey = getString()
                if (target && attrKey) {
                  return operation(target.attributes, attrKey, value)
                }
              }
            }
          }
      }
    }
  }()

  /**
   * 筛选出有效的场景对象
   * @returns 有效对象(如果有)
   */
  private filterValidObject<T extends SceneObject>(object: T | undefined): T | undefined {
    return object?.destroyed === false ? object : undefined
  }

  /**
   * 编译角色对象
   * @param actor 角色访问器
   * @returns 角色访问器函数
   */
  public compileActor(actor: ActorGetter): () => Actor | undefined {
    switch (actor.type) {
      case 'trigger':
        return () => Command.filterValidObject(CurrentEvent.triggerActor)
      case 'caster':
        return () => Command.filterValidObject(CurrentEvent.casterActor)
      case 'latest':
        return () => Command.filterValidObject(Actor.latest)
      case 'target':
        return () => Command.filterValidObject(CurrentEvent.targetActor)
      case 'player':
        return () => Command.filterValidObject(Party.player ?? undefined)
      case 'member': {
        const getMemberId = Command.compileNumber(actor.memberId)
        return () => Party.members[getMemberId()]
      }
      case 'global': {
        const {actorId} = actor
        return () => ActorManager.get(actorId)
      }
      case 'by-id': {
        const {presetId} = actor
        return () => {
          return Scene.entity.get(presetId) as Actor | undefined
        }
      }
      case 'variable': {
        const getActor = Command.compileVariable(actor.variable, Attribute.ACTOR_GET)
        return () => Command.filterValidObject(getActor())
      }
    }
  }

  /**
   * 编译技能对象
   * @param skill 技能访问器
   * @returns 技能访问器函数
   */
  public compileSkill(skill: SkillGetter): () => Skill | undefined {
    switch (skill.type) {
      case 'trigger':
        return () => CurrentEvent.triggerSkill
      case 'latest':
        return () => Skill.latest
      case 'by-key': {
        const getActor = Command.compileActor(skill.actor)
        const getShortcutKey = Command.compileEnumValue(skill.key)
        return () => getActor()?.shortcut.getSkill(getShortcutKey())
      }
      case 'by-id': {
        const getActor = Command.compileActor(skill.actor)
        return () => getActor()?.skill.get(skill.skillId)
      }
      case 'variable':
        return Command.compileVariable(skill.variable, Attribute.SKILL_GET)
    }
  }

  /**
   * 编译状态对象
   * @param state 状态访问器
   * @returns 状态访问器函数
   */
  public compileState(state: StateGetter): () => State | undefined {
    switch (state.type) {
      case 'trigger':
        return () => CurrentEvent.triggerState
      case 'latest':
        return () => State.latest
      case 'by-id': {
        const getActor = Command.compileActor(state.actor)
        return () => getActor()?.state.get(state.stateId)
      }
      case 'variable':
        return Command.compileVariable(state.variable, Attribute.STATE_GET)
    }
  }

  /**
   * 编译装备对象
   * @param equipment 装备访问器
   * @returns 装备访问器函数
   */
  public compileEquipment(equipment: EquipmentGetter): () => Equipment | undefined {
    switch (equipment.type) {
      case 'trigger':
        return () => CurrentEvent.triggerEquipment
      case 'latest':
        return () => Equipment.latest
      case 'by-slot': {
        const getActor = Command.compileActor(equipment.actor)
        const getSlot = Command.compileEnumValue(equipment.slot)
        return () => {
          return getActor()?.equipment.get(getSlot())
        }
      }
      case 'by-id-equipped': {
        const getActor = Command.compileActor(equipment.actor)
        return () => getActor()?.equipment.getById(equipment.equipmentId)
      }
      case 'by-id-inventory': {
        const getActor = Command.compileActor(equipment.actor)
        return () => {
          const goods = getActor()?.inventory.get(equipment.equipmentId)
          return goods instanceof Equipment ? goods : undefined
        }
      }
      case 'variable':
        return Command.compileVariable(equipment.variable, Attribute.EQUIPMENT_GET)
    }
  }

  /**
   * 编译物品对象
   * @param item 物品访问器
   * @returns 物品访问器函数
   */
  public compileItem(item: ItemGetter): () => Item | undefined {
    switch (item.type) {
      case 'trigger':
        return () => CurrentEvent.triggerItem
      case 'latest':
        return () => Item.latest
      case 'by-key': {
        const getActor = Command.compileActor(item.actor)
        const getShortcutKey = Command.compileEnumValue(item.key)
        return () => getActor()?.shortcut.getItem(getShortcutKey())
      }
      case 'by-id': {
        const getActor = Command.compileActor(item.actor)
        return () => {
          const goods = getActor()?.inventory.get(item.itemId)
          return goods instanceof Item ? goods : undefined
        }
      }
      case 'variable':
        return Command.compileVariable(item.variable, Attribute.ITEM_GET)
    }
  }

  /** 编译场景位置对象 */
  public compilePosition(position: PositionGetter): (reference?: any) => Point | undefined {
    switch (position.type) {
      case 'absolute': {
        const getX = Command.compileNumber(position.x)
        const getY = Command.compileNumber(position.y)
        return () => {
          return {
            x: getX(),
            y: getY(),
          }
        }
      }
      case 'relative': {
        const getX = Command.compileNumber(position.x)
        const getY = Command.compileNumber(position.y)
        return reference => {
          if (reference) {
            return {
              x: reference.x + getX(),
              y: reference.y + getY(),
            }
          }
        }
      }
      case 'actor':
        return Command.compileActor(position.actor)
      case 'trigger':
        return Command.compileTrigger(position.trigger)
      case 'light':
        return Command.compileLight(position.light)
      case 'region': {
        const getRegion = Command.compileRegion(position.region)
        switch (position.mode) {
          case 'center':
            return getRegion
          case 'random':
            return () => getRegion()?.getRandomPosition()
          case 'random-land':
            return () => getRegion()?.getRandomPosition(0)
          case 'random-water':
            return () => getRegion()?.getRandomPosition(1)
          case 'random-wall':
            return () => getRegion()?.getRandomPosition(2)
        }
      }
      case 'object': {
        const objectId = (position as any).objectId
        return () => Scene.entity.get(objectId) as Point | undefined
      }
      case 'mouse':
        return () => {
          return {
            x: Mouse.sceneX,
            y: Mouse.sceneY,
          }
        }
    }
  }

  /**
   * 编译角度对象
   * @param angle 角度访问器
   * @returns 角度访问器函数(弧度)
   */
  private compileAngle(angle: AngleGetter): (origin?: any) => number {
    switch (angle.type) {
      case 'position': {
        const getPoint = Command.compilePosition(angle.position)
        return origin => {
          const point = getPoint()
          if (point) {
            const distY = point.y - origin.y
            const distX = point.x - origin.x
            return Math.atan2(distY, distX)
          }
          return origin.angle ?? 0
        }
      }
      case 'absolute': {
        const getDegrees = Command.compileNumber(angle.degrees)
        return () => Math.radians(getDegrees())
      }
      case 'relative': {
        const getDegrees = Command.compileNumber(angle.degrees)
        return origin => (origin.angle ?? 0) + Math.radians(getDegrees())
      }
      case 'direction': {
        const radians = Math.radians(angle.degrees)
        return origin => {
          const animation = origin.animation
          if (animation) {
            return animation.getDirectionAngle() + radians
          }
          return radians
        }
      }
      case 'random': {
        const radians = Math.PI * 2
        return () => Math.random() * radians
      }
    }
  }

  /**
   * 编译触发器对象
   * @param trigger 触发器访问器
   * @returns 触发器访问器函数
   */
  private compileTrigger(trigger: TriggerGetter): () => Trigger | undefined {
    switch (trigger.type) {
      case 'trigger':
        return () => {
          const object = CurrentEvent.triggerObject
          return Command.filterValidObject(object instanceof Trigger ? object : undefined)
        }
      case 'latest':
        return () => Command.filterValidObject(Trigger.latest)
      case 'variable': {
        const getTrigger = Command.compileVariable(trigger.variable, Attribute.TRIGGER_GET)
        return () => Command.filterValidObject(getTrigger())
      }
    }
  }

  /**
   * 编译光源对象
   * @param light 光源访问器
   * @returns 光源访问器函数
   */
  private compileLight(light: LightGetter): () => SceneLight | undefined {
    switch (light.type) {
      case 'trigger':
        return () => Command.filterValidObject(CurrentEvent.triggerLight)
      case 'latest':
        return () => Command.filterValidObject(SceneLight.latest)
      case 'by-id': {
        const {presetId} = light
        return () => {
          return Scene.entity.get(presetId) as SceneLight | undefined
        }
      }
      case 'variable': {
        const getLight = Command.compileVariable(light.variable, Attribute.LIGHT_GET)
        return Command.filterValidObject(getLight())
      }
    }
  }

  /**
   * 编译区域对象
   * @param region 区域访问器
   * @returns 区域访问器函数
   */
  private compileRegion(region: RegionGetter): () => SceneRegion | undefined {
    switch (region.type) {
      case 'trigger':
        return () => Command.filterValidObject(CurrentEvent.triggerRegion)
      case 'by-id': {
        const {presetId} = region
        return () => {
          return Scene.entity.get(presetId) as SceneRegion | undefined
        }
      }
    }
  }

  /**
   * 编译瓦片地图对象
   * @param tilemap 瓦片地图访问器
   * @returns 瓦片地图访问器函数
   */
  private compileTilemap(tilemap: TilemapGetter): () => SceneTilemap | undefined {
    switch (tilemap.type) {
      case 'trigger':
        return () => Command.filterValidObject(CurrentEvent.triggerTilemap)
      case 'by-id': {
        const {presetId} = tilemap
        return () => {
          return Scene.entity.get(presetId) as SceneTilemap | undefined
        }
      }
    }
  }

  /**
   * 编译场景对象
   * @param object 对象访问器
   * @returns 对象访问器函数
   */
  private compileObject(object: ObjectGetter): () => PresetObject | undefined {
    switch (object.type) {
      case 'trigger':
        return () => {
          const object = CurrentEvent.triggerObject
          return Command.filterValidObject(object instanceof Trigger ? undefined : object)
        }
      case 'latest':
        return () => Command.filterValidObject(Scene.latest)
      case 'by-id': {
        const {presetId} = object
        return () => {
          return Scene.entity.get(presetId) as PresetObject | undefined
        }
      }
      case 'variable': {
        const getObject = Command.compileVariable(object.variable, Attribute.OBJECT_GET)
        return () => {
          const object = getObject()
          return Command.filterValidObject(
             object instanceof Actor
          || object instanceof SceneAnimation
          || object instanceof SceneParticleEmitter
          || object instanceof SceneRegion
          || object instanceof SceneLight
          || object instanceof SceneParallax
          || object instanceof SceneTilemap
          ?  object
          :  undefined)
        }
      }
    }
  }

  /**
   * 编译元素对象
   * @param element 元素访问器
   * @returns 元素访问器函数
   */
  public compileElement(element: ElementGetter): () => UIElement | undefined {
    switch (element.type) {
      case 'trigger':
        return () => CurrentEvent.triggerElement
      case 'latest':
        return () => UI.latest
      case 'by-id': {
        const {presetId} = element
        return () => UI.get(presetId)
      }
      case 'by-index': {
        const getParent = Command.compileElement(element.parent)
        const getIndex = Command.compileNumber(element.index, -1)
        return () => getParent()?.children[getIndex()]
      }
      case 'by-ancestor-and-id': {
        const {ancestor, presetId} = element
        const getAncestor = Command.compileElement(ancestor)
        return () => {
          const ancestor = getAncestor()
          return ancestor
          ? ancestor.query('presetId', presetId)
          ?? ancestor.query('referenceId', presetId)
          : undefined
        }
      }
      case 'by-button-index': {
        const getFocus = Command.compileElement(element.focus)
        const getIndex = Command.compileNumber(element.index, -1)
        return () => {
          const focus = getFocus()
          return focus instanceof UIElement
          ? UI.getFocusedButtons(focus, true)[getIndex()]
          : undefined
        }
      }
      case 'selected-button': {
        const getFocus = Command.compileElement(element.focus)
        return () => UI.getSelectedButton(getFocus())
      }
      case 'focus':
        return () => UI.getFocus()
      case 'parent': {
        const getElement = Command.compileVariable(element.variable, Attribute.ELEMENT_GET)
        return () => getElement()?.parent ?? undefined
      }
      case 'variable':
        return Command.compileVariable(element.variable, Attribute.ELEMENT_GET)
    }
  }

  /**
   * 编译函数
   * @param script 函数返回值脚本
   * @returns 编译后的函数
   */
  private compileFunction(script: string): Function {
    try {
      return new Function(`return ${script}`)
    } catch (error) {
      return Function.empty
    }
  }

  /**
   * 从参数字符串中获取指定类型的值
   * @param key 参数名称
   * @param type 参数类型
   * @returns 参数值
   */
  public getParameter(key: string, type: CommandParameterType): boolean | number | string | undefined {
    if (!key) return undefined
    let regexp = this.paramRegExpMap[key]
    if (regexp === undefined) {
      regexp = new RegExp(`(?:^|,)\\s*${key}(?:\\s*:\\s*(.*?))?\\s*(?:$|,)`)
      this.paramRegExpMap[key] = regexp
    }
    const match = Command.parameters.match(regexp)
    if (match) {
      switch (type) {
        case 'boolean':
          switch (match[1]) {
            case undefined:
            case 'true':
              return true
            case 'false':
              return false
          }
          return undefined
        case 'number': {
          const string = match[1]
          if (string) {
            const number = parseFloat(string)
            if (!isNaN(number)) return number
          }
          return undefined
        }
        case 'string':
          return match[1]
      }
    }
  }

  /** 编译条件列表 */
  private compileConditions = function (IIFE) {
    const {GET, BOOLEAN_GET, NUMBER_GET, STRING_GET, OBJECT_GET, LIST_GET} = Attribute

    // 编译布尔操作数
    const compileBooleanOperand = (operand: any): any => {
      switch (operand.type) {
        case 'none':
          return Function.undefined
        case 'constant': {
          const {value} = operand
          return () => value
        }
        case 'variable':
          return Command.compileVariable(operand.variable, BOOLEAN_GET)
      }
    }

    // 编译数值操作数
    const compileNumberOperand = (operand: any): any => {
      switch (operand.type) {
        case 'none':
          return Function.undefined
        case 'constant': {
          const {value} = operand
          return () => value
        }
        case 'variable':
          return Command.compileVariable(operand.variable, NUMBER_GET)
      }
    }

    // 编译字符串操作数
    const compileStringOperand = (operand: any): any => {
      switch (operand.type) {
        case 'none':
          return Function.undefined
        case 'constant': {
          const {value} = operand
          return () => value
        }
        case 'variable':
          return Command.compileVariable(operand.variable, STRING_GET)
        case 'enum': {
          const string = Enum.getValue(operand.stringId)
          return () => string
        }
      }
    }

    // 编译对象操作数
    const compileObjectOperand = (operand: any): any => {
      switch (operand.type) {
        case 'none':
          return Function.undefined
        case 'actor':
          return Command.compileActor(operand.actor)
        case 'skill':
          return Command.compileSkill(operand.skill)
        case 'state':
          return Command.compileState(operand.state)
        case 'equipment':
          return Command.compileEquipment(operand.equipment)
        case 'item':
          return Command.compileItem(operand.item)
        case 'trigger':
          return Command.compileTrigger(operand.trigger)
        case 'light':
          return Command.compileLight(operand.light)
        case 'element':
          return Command.compileElement(operand.element)
        case 'variable':
          return Command.compileVariable(operand.variable, OBJECT_GET)
      }
    }

    // 编译条件
    const compileCondition = (condition: any): () => boolean => {
      switch (condition.type) {
        case 'boolean': {
          const {variable, operation, operand} = condition
          const a = Command.compileVariable(variable, BOOLEAN_GET)
          const b = compileBooleanOperand(operand)
          switch (operation) {
            case 'equal':
              return () => a() === b()
            case 'unequal':
              return () => a() !== b()
          }
        }
        case 'number': {
          const {variable, operation, operand} = condition
          const a = Command.compileVariable(variable, NUMBER_GET)
          const b = compileNumberOperand(operand)
          switch (operation) {
            case 'equal':
              return () => a() === b()
            case 'unequal':
              return () => a() !== b()
            case 'greater-or-equal':
              return () => a() >= b()
            case 'less-or-equal':
              return () => a() <= b()
            case 'greater':
              return () => a() > b()
            case 'less':
              return () => a() < b()
          }
        }
        case 'string': {
          const {variable, operation, operand} = condition
          const a = Command.compileVariable(variable, STRING_GET)
          const b = compileStringOperand(operand)
          switch (operation) {
            case 'equal':
              return () => a() === b()
            case 'unequal':
              return () => a() !== b()
            case 'include':
              return () => a()?.indexOf(b()) > -1
            case 'exclude':
              return () => a()?.indexOf(b()) === -1
          }
        }
        case 'object': {
          const {variable, operation, operand} = condition
          const a = Command.compileVariable(variable, OBJECT_GET)
          switch (operation) {
            case 'equal': {
              const b = compileObjectOperand(operand)
              return () => a() === b()
            }
            case 'unequal': {
              const b = compileObjectOperand(operand)
              return () => a() !== b()
            }
            case 'is-actor':
              return () => a() instanceof Actor
            case 'is-skill':
              return () => a() instanceof Skill
            case 'is-state':
              return () => a() instanceof State
            case 'is-equipment':
              return () => a() instanceof Equipment
            case 'is-item':
              return () => a() instanceof Item
            case 'is-trigger':
              return () => a() instanceof Trigger
            case 'is-light':
              return () => a() instanceof SceneLight
            case 'is-element':
              return () => a() instanceof UIElement
          }
        }
        case 'actor': {
          const {actor, operation} = condition
          const getActor = Command.compileActor(actor)
          switch (operation) {
            case 'present-active':
              return () => {
                const actor = getActor()
                return actor ? Scene.actor === actor.parent && actor.active : false
              }
            case 'present':
              return () => Scene.actor === getActor()?.parent
            case 'absent':
              return () => Scene.actor !== getActor()?.parent
            case 'active':
              return () => {
                const actor = getActor()
                return actor ? actor.active : false
              }
            case 'inactive':
              return () => {
                const actor = getActor()
                return actor ? !actor.active : false
              }
            case 'has-targets':
              // @ts-ignore
              return () => getActor()?.target.targets.length > 0
            case 'has-no-targets':
              return () => getActor()?.target.targets.length === 0
            case 'in-screen':
              return () => {
                const actor = getActor()
                if (actor) {
                  return (
                    actor.x >= Camera.scrollLeftT &&
                    actor.x < Camera.scrollRightT &&
                    actor.y >= Camera.scrollTopT &&
                    actor.y < Camera.scrollBottomT
                  )
                }
                return false
              }
            case 'is-player':
              return () => Party.player === getActor()
            case 'is-member':
              // @ts-ignore
              return () => Party.members.includes(getActor())
            case 'has-skill': {
              const {skillId} = condition
              return () => !!getActor()?.skill.get(skillId)
            }
            case 'has-state': {
              const {stateId} = condition
              return () => !!getActor()?.state.get(stateId)
            }
            case 'has-items': {
              const {itemId, quantity} = condition
              // @ts-ignore
              return () => getActor()?.inventory.count(itemId) >= quantity
            }
            case 'has-equipments': {
              const {equipmentId, quantity} = condition
              // @ts-ignore
              return () => getActor()?.inventory.count(equipmentId) >= quantity
            }
            case 'has-skill-shortcut': {
              const getKey = Command.compileEnumValue(condition.shortcutKey)
              return () => getActor()?.shortcut.get(getKey())?.type === 'skill'
            }
            case 'has-item-shortcut': {
              const getKey = Command.compileEnumValue(condition.shortcutKey)
              return () => getActor()?.shortcut.get(getKey())?.type === 'item'
            }
            case 'equipped': {
              const {equipmentId} = condition
              return () => !!getActor()?.equipment.getById(equipmentId)
            }
            case 'is-teammate': {
              const getTarget = Command.compileActor(condition.target)
              return () => {
                const actor = getActor()
                const target = getTarget()
                return !!actor && !!target && actor.teamId === target.teamId
              }
            }
            case 'is-friend': {
              const getTarget = Command.compileActor(condition.target)
              return () => Team.isFriendly(getActor()?.teamId ?? '', getTarget()?.teamId ?? '')
            }
            case 'is-enemy': {
              const getTarget = Command.compileActor(condition.target)
              return () => Team.isEnemy(getActor()?.teamId ?? '', getTarget()?.teamId ?? '')
            }
            case 'is-team-member':
              return () => getActor()?.teamId === condition.teamId
            case 'is-team-friend':
              return () => Team.isFriendly(getActor()?.teamId ?? '', condition.teamId)
            case 'is-team-enemy':
              return () => Team.isEnemy(getActor()?.teamId ?? '', condition.teamId)
          }
        }
        case 'element': {
          const {element, operation} = condition
          const getElement = Command.compileElement(element)
          switch (operation) {
            case 'present':
              return () => getElement()?.connected === true
            case 'absent':
              return () => getElement()?.connected !== true
            case 'visible':
              return () => getElement()?.isVisible() === true
            case 'invisible':
              return () => getElement()?.isVisible() === false
            case 'is-focus':
              // @ts-ignore
              return () => UI.focuses.includes(getElement())
            case 'dialogbox-is-paused':
            case 'dialogbox-is-updating':
            case 'dialogbox-is-waiting':
            case 'dialogbox-is-complete': {
              const index = operation.lastIndexOf('-')
              const state = operation.slice(index + 1)
              return () => {
                const element = getElement()
                if (element instanceof DialogBoxElement) {
                  return element.state === state
                }
                return true
              }
            }
          }
        }
        case 'keyboard': {
          const {keycode, state} = condition
          switch (state) {
            case 'just-pressed':
              return () => Input.getKeyDown(keycode)
            case 'just-released':
              return () => Input.getKeyUp(keycode)
            case 'pressed':
              return () => Input.getKey(keycode)
            case 'released':
              return () => !Input.getKey(keycode)
          }
        }
        case 'gamepad': {
          const {button, state} = condition
          switch (state) {
            case 'just-pressed':
              return () => Input.getGamepadButtonDown(button)
            case 'just-released':
              return () => Input.getGamepadButtonUp(button)
            case 'pressed':
              return () => Input.getGamepadButton(button)
            case 'released':
              return () => !Input.getGamepadButton(button)
          }
        }
        case 'mouse': {
          const {button, state} = condition
          switch (state) {
            case 'just-pressed':
              return () => Input.getMouseButtonDown(button)
            case 'just-released':
              return () => Input.getMouseButtonUp(button)
            case 'pressed':
              return () => Input.getMouseButton(button)
            case 'released':
              return () => !Input.getMouseButton(button)
          }
        }
        case 'list': {
          const {list, operation, target} = condition
          const getList = Command.compileVariable(list, LIST_GET)
          const getTarget = Command.compileVariable(target, GET)
          switch (operation) {
            case 'include':
              return () => {
                const list = getList()
                const target = getTarget()
                return list && target !== undefined && list.includes(target)
              }
            case 'exclude':
              return () => {
                const list = getList()
                const target = getTarget()
                return list && target !== undefined && !list.includes(target)
              }
          }
        }
        case 'other':
          switch (condition.key) {
            case 'mouse-entered':
              return () => Mouse.entered
            case 'mouse-left':
              return () => !Mouse.entered
            case 'game-is-paused':
              return () => Game.paused
            case 'game-is-not-paused':
              return () => !Game.paused
            case 'scene-input-is-prevented':
              return () => Scene.preventInputEvents !== 0
            case 'scene-input-is-not-prevented':
              return () => Scene.preventInputEvents === 0
            case 'status-debugging':
              return () => !Data.config.deployed
            case 'status-deployed':
              return () => Data.config.deployed
            case 'platform-windows':
              return () => Stats.isWindows()
            case 'platform-macos':
              return () => Stats.isMacOS()
            case 'platform-mobile':
              return () => Stats.isMobile()
          }
      }
      throw new Error('Invalid condition:', condition)
    }

    /** 编译条件列表
     * @param mode 满足所有条件|满足任意条件
     * @param conditions 条件数据列表
     * @returns 条件检测函数
     */
    return (mode: string, conditions: Array<any>): () => boolean => {
      const length = conditions.length
      if (length === 1) {
        return compileCondition(conditions[0])
      }
      const testers = new Array(length) as Array<() => boolean>
      for (let i = 0; i < length; i++) {
        testers[i] = compileCondition(conditions[i])
      }
      switch (mode) {
        case 'all':
          if (length < 6) {
            const [a, b, c, d, e] = testers
            switch (length) {
              case 2: return () => a() && b()
              case 3: return () => a() && b() && c()
              case 4: return () => a() && b() && c() && d()
              case 5: return () => a() && b() && c() && d() && e()
            }
          }
          return () => {
            for (let i = 0; i < length; i++) {
              if (testers[i]() === false) {
                return false
              }
            }
            return true
          }
        case 'any':
          if (length < 6) {
            const [a, b, c, d, e] = testers
            switch (length) {
              case 2: return () => a() || b()
              case 3: return () => a() || b() || c()
              case 4: return () => a() || b() || c() || d()
              case 5: return () => a() || b() || c() || d() || e()
            }
          }
          return () => {
            for (let i = 0; i < length; i++) {
              if (testers[i]() === true) {
                return true
              }
            }
            return false
          }
      }
      throw new Error('Invalid conditions')
    }
  }()

  /**
   * 编译文本内容
   * @param content 需要解析插入变量的文本内容
   * @returns 文本内容解析函数
   */
  public compileTextContent(content: string): () => string {
    if (typeof content === 'object') {
      return Command.compileString(content)
    }
    // 获取变量标签正则表达式
    const method = this.compileTextContent as any
    let {regexp} = method
    if (!regexp) {
      regexp = method.regexp = /<(local):(.*?)>|<(global):([0-9a-f]{16})>/g
    }
    const slices: Array<AttributeValue | undefined> = []
    const setters: Array<Function> = []
    let li = 0
    let match
    while (match = regexp.exec(content)) {
      const mi = match.index
      if (mi > li) {
        slices.push(content.slice(li, mi))
      }
      const index = slices.length
      const scope: string = match[1] ?? match[3]
      const key: string = match[2] ?? match[4]
      let getter: () => AttributeValue | undefined
      switch (scope) {
        case 'local':
          getter = () => CurrentEvent.attributes[key]
          break
        case 'global':
          getter = () => Variable.get(key)
          break
      }
      const setter = () => slices[index] = getter()
      setters.push(setter)
      slices.push('')
      li = regexp.lastIndex
    }
    // 无匹配标签的情况
    if (li === 0) {
      const fn = () => content
      fn.constant = true
      return fn
    }
    // 找到标签的情况
    if (content.length > li) {
      slices.push(content.slice(li))
    }
    return () => {
      for (const setter of setters) {
        setter()
      }
      return slices.join('')
    }
  }

  /**
   * 读取指令栈
   * @returns 指令栈中是否有可用的指令
   */
  private readStack = (): boolean => {
    const wrap = CurrentEvent.stack.pop()
    if (wrap === null) {
      CurrentEvent.finish()
      return false
    }
    CommandList = wrap[0]
    CommandIndex = wrap[1]
    return true
  }

  /**
   * 跳过指令
   * @returns 返回true继续执行下一个指令
   */
  private skip = (): true => true

  /**
   * 编译跳转函数
   * @param commands 编译后的指令函数列表
   * @param index 跳转到列表中的索引位置
   * @returns 继续执行
   */
  private goto(commands: CommandFunctionList, index: number): CommandFunction {
    // 跳转到头部
    if (index === 0) {
      return () => {
        CommandList = commands
        CommandIndex = 0
        return true
      }
    }
    // 跳转到索引(通用)
    return () => {
      CommandList = commands
      CommandIndex = index
      return true
    }
  }

  /** 显示文本 */
  protected showText({target, parameters, content}: {
    target: ActorGetter
    parameters: string
    content: string
  }): CommandFunction {
    const getActor = Command.compileActor(target)
    const getContent = Command.compileTextContent(content)
    return () => {
      const list = EventManager.getEnabledEvents('showtext')
      const fn = list.length === 0 ? Command.skip : () => {
        CurrentEvent.targetActor = getActor()
        Command.parameters = parameters
        Command.textContent = getContent()
        CurrentEvent.stack.push(CommandList, CommandIndex)
        for (let i = list.length - 1; i >= 1; i--) {
          CurrentEvent.stack.push(list[i], 0)
        }
        CommandList = list[0]
        CommandIndex = 0
        return true
      }
      // 编译时不能确定事件已加载，因此使用运行时编译
      return (CommandList[CommandIndex - 1] = fn)()
    }
  }

  /** 显示选项 */
  protected showChoices({choices, parameters}: {
    choices: Array<any>
    parameters: string
  }): Array<CommandFunction> {
    // 解析变量文本内容
    const method = this.showChoices as any
    let {parseVariable} = method
    if (!parseVariable) {
      const regexp = /<(local):(.*?)>|<(global):([0-9a-f]{16})>/g
      const replacer = (match: string, m1?: string, m2?: string, m3?: string, m4?: string): any => {
        const tag = m1 ?? m3!
        const key = m2 ?? m4!
        switch (tag) {
          case 'local':
            return CurrentEvent.attributes[key]?.toString()
          case 'global':
            return Variable.get(key)?.toString()
        }
      }
      const mapper = (content: string) => content.replace(regexp, replacer)
      parseVariable = method.parseVariable = (contents: Array<string>) => contents.map(mapper)
    }
    const {commands, index} = this.stack.get()
    const pop = Command.goto(commands, index + 2)
    const contents: Array<string> = []
    const branches: Array<CommandFunctionList> = []
    for (const choice of choices) {
      contents.push(choice.content)
      branches.push(Command.compile(choice.commands, pop))
    }
    const fn1 = () => {
      const list = EventManager.getEnabledEvents('showchoices')
      const fn = list.length === 0 ? Command.skip : () => {
        Command.parameters = parameters
        Command.choiceContents = parseVariable(contents)
        Command.choiceIndex = -1
        CurrentEvent.stack.push(CommandList, CommandIndex)
        for (let i = list.length - 1; i >= 1; i--) {
          CurrentEvent.stack.push(list[i], 0)
        }
        CommandList = list[0]
        CommandIndex = 0
        return true
      }
      // 编译时不能确定事件已加载，因此使用运行时编译
      return (CommandList[CommandIndex - 1] = fn)()
    }
    const fn2 = () => {
      switch (Command.choiceIndex) {
        case -1:
          return true
        default: {
          const commands = branches[Command.choiceIndex]
          if (commands) {
            CommandList = commands
            CommandIndex = 0
          }
          return true
        }
      }
    }
    return [fn1, fn2]
  }

  /** 注释 */
  protected comment({comment}: {comment: string}): null {
    return null
  }

  /** 设置布尔值 */
  protected setBoolean = function (IIFE) {
    const {BOOLEAN_GET, LIST_GET} = Attribute

    // 布尔值操作映射表
    const operationMap = {
      set: Attribute.BOOLEAN_SET,
      not: Attribute.BOOLEAN_NOT,
      and: Attribute.BOOLEAN_AND,
      or: Attribute.BOOLEAN_OR,
      xor: Attribute.BOOLEAN_XOR,
    }

    // 编译操作数
    const compileOperand = (operand: any): () => AttributeValue | undefined => {
      switch (operand.type) {
        case 'constant': {
          const {value} = operand
          return () => value
        }
        case 'variable':
          return Command.compileVariable(operand.variable, BOOLEAN_GET)
        case 'list': {
          const getList = Command.compileVariable(operand.variable, LIST_GET)
          const getIndex = Command.compileNumber(operand.index, -1)
          return () => {
            const value = getList()?.[getIndex()]
            return typeof value === 'boolean' ? value : undefined
          }
        }
        case 'parameter': {
          const getKey = Command.compileString(operand.key)
          return () => Command.getParameter(getKey(), 'boolean')
        }
        case 'script':
          return Command.compileFunction(operand.script) as any
      }
      throw new Error('Compiling Error')
    }

    /** 设置布尔值 */
    return function ({variable, operation, operand}: {
      variable: VariableGetter
      operation: keyof typeof operationMap
      operand: object
    }): CommandFunction {
      const OP = operationMap[operation]
      const getter = compileOperand(operand)
      const setter = Command.compileVariable(variable, OP)
      return () => {
        const value = getter()
        if (typeof value === 'boolean') {
          setter(value)
        }
        return true
      }
    }
  }()

  /** 设置数值 */
  protected setNumber = function (IIFE) {
    const {NUMBER_GET, STRING_GET, LIST_GET} = Attribute

    // 数值操作映射表
    const operationMap = {
      set: Attribute.NUMBER_SET,
      add: Attribute.NUMBER_ADD,
      sub: Attribute.NUMBER_SUB,
      mul: Attribute.NUMBER_MUL,
      div: Attribute.NUMBER_DIV,
      mod: Attribute.NUMBER_MOD,
    }

    // 操作优先级映射表
    const operationPriorityMap = {
      add: 0,
      sub: 0,
      mul: 1,
      div: 1,
      mod: 1,
    }

    // 编译操作数
    const compileOperand = (operand: any): () => number | undefined => {
      switch (operand.type) {
        case 'constant': {
          const {value} = operand
          return () => value
        }
        case 'variable':
          return Command.compileVariable(operand.variable, NUMBER_GET)
        case 'math':
          switch (operand.method) {
            case 'round': {
              const {round, roundTo} = Math
              const getter = Command.compileVariable(operand.variable, NUMBER_GET)
              const decimals = operand.decimals
              return decimals === 0
              ? () => round(getter())
              : () => roundTo(getter(), decimals)
            }
            case 'floor':
            case 'ceil':
            case 'sqrt':
            case 'abs': {
              const mathMethod = Math[operand.method as keyof Math] as any
              const getter = Command.compileVariable(operand.variable, NUMBER_GET)
              return () => mathMethod(getter())
            }
            case 'cos':
            case 'sin':
            case 'tan': {
              const mathMethod = Math[operand.method as keyof Math] as any
              const getAngle = Command.compileVariable(operand.variable, NUMBER_GET)
              return () => mathMethod(Math.radians(getAngle()))
            }
            case 'random':
              return Math.random
            case 'random-int': {
              const {randomInt} = Math
              const getMin = Command.compileNumber(operand.min)
              const getMax = Command.compileNumber(operand.max)
              return () => randomInt(getMin(), getMax())
            }
            case 'distance': {
              const {dist} = Math
              const getStart = Command.compilePosition(operand.start)
              const getEnd = Command.compilePosition(operand.end)
              return () => {
                const start = getStart()
                const end = getEnd()
                if (start && end) {
                  return dist(start.x, start.y, end.x, end.y)
                }
              }
            }
            case 'distance-x': {
              const {abs} = Math
              const getStart = Command.compilePosition(operand.start)
              const getEnd = Command.compilePosition(operand.end)
              return () => {
                const start = getStart()
                const end = getEnd()
                if (start && end) {
                  return abs(start.x - end.x)
                }
              }
            }
            case 'distance-y': {
              const {abs} = Math
              const getStart = Command.compilePosition(operand.start)
              const getEnd = Command.compilePosition(operand.end)
              return () => {
                const start = getStart()
                const end = getEnd()
                if (start && end) {
                  return abs(start.y - end.y)
                }
              }
            }
            case 'relative-angle': {
              const {degrees, atan2} = Math
              const getStart = Command.compilePosition(operand.start)
              const getEnd = Command.compilePosition(operand.end)
              return () => {
                const start = getStart()
                const end = getEnd()
                if (start && end) {
                  const x = end.x - start.x
                  const y = end.y - start.y
                  return degrees(atan2(y, x))
                }
              }
            }
          }
        case 'string': {
          const getter = Command.compileVariable(operand.variable, STRING_GET)
          switch (operand.method) {
            case 'length':
              return () => getter()?.length
            case 'parse':
              return () => parseFloat(getter())
            case 'search': {
              const getSearch = Command.compileString(operand.search)
              return () => getter()?.indexOf(getSearch() || undefined)
            }
          }
        }
        case 'object':
          switch (operand.property) {
            case 'actor-x': {
              const getActor = Command.compileActor(operand.actor)
              return () => getActor()?.x
            }
            case 'actor-y': {
              const getActor = Command.compileActor(operand.actor)
              return () => getActor()?.y
            }
            case 'actor-ui-x': {
              const getActor = Command.compileActor(operand.actor)
              return () => {
                const scene = Scene.binding
                const actor = getActor()
                if (scene !== null && actor) {
                  const {width, scrollLeft} = Camera
                  const x = actor.x * scene.tileWidth
                  return (x - scrollLeft) / width * GL.width / UI.scale
                }
              }
            }
            case 'actor-ui-y': {
              const getActor = Command.compileActor(operand.actor)
              return () => {
                const scene = Scene.binding
                const actor = getActor()
                if (scene !== null && actor) {
                  const {height, scrollTop} = Camera
                  const y = actor.y * scene.tileHeight
                  return (y - scrollTop) / height * GL.height / UI.scale
                }
              }
            }
            case 'actor-screen-x': {
              const getActor = Command.compileActor(operand.actor)
              return () => {
                const scene = Scene.binding
                const actor = getActor()
                if (scene !== null && actor) {
                  const {width, scrollLeft} = Camera
                  const x = actor.x * scene.tileWidth
                  return (x - scrollLeft) / width * GL.width
                }
              }
            }
            case 'actor-screen-y': {
              const getActor = Command.compileActor(operand.actor)
              return () => {
                const scene = Scene.binding
                const actor = getActor()
                if (scene !== null && actor) {
                  const {height, scrollTop} = Camera
                  const y = actor.y * scene.tileHeight
                  return (y - scrollTop) / height * GL.height
                }
              }
            }
            case 'actor-angle': {
              const {degrees} = Math
              const getActor = Command.compileActor(operand.actor)
              return () => {
                const actor = getActor()
                if (actor) {
                  return degrees(actor.angle)
                }
                return undefined
              }
            }
            case 'actor-direction': {
              const {degrees} = Math
              const getActor = Command.compileActor(operand.actor)
              return () => {
                const animation = getActor()?.animation
                if (animation) {
                  return degrees(animation.getDirectionAngle())
                }
                return undefined
              }
            }
            case 'actor-movement-speed': {
              const getActor = Command.compileActor(operand.actor)
              return () => getActor()?.navigator.movementSpeed
            }
            case 'actor-collision-size': {
              const getActor = Command.compileActor(operand.actor)
              return () => getActor()?.collider.size
            }
            case 'actor-collision-weight': {
              const getActor = Command.compileActor(operand.actor)
              return () => getActor()?.collider.weight
            }
            case 'actor-scaling-factor': {
              const getActor = Command.compileActor(operand.actor)
              return () => getActor()?.scale
            }
            case 'actor-inventory-item-quantity': {
              const getActor = Command.compileActor(operand.actor)
              const getId = Command.compileString(operand.itemId)
              return () => getActor()?.inventory.count(getId())
            }
            case 'actor-inventory-equipment-quantity': {
              const getActor = Command.compileActor(operand.actor)
              const getId = Command.compileString(operand.equipmentId)
              return () => getActor()?.inventory.count(getId())
            }
            case 'actor-inventory-money': {
              const getActor = Command.compileActor(operand.actor)
              return () => getActor()?.inventory.money
            }
            case 'actor-inventory-used-space': {
              const getActor = Command.compileActor(operand.actor)
              return () => getActor()?.inventory.list.length
            }
            case 'actor-inventory-version': {
              const getActor = Command.compileActor(operand.actor)
              return () => getActor()?.inventory.version ?? -1
            }
            case 'actor-skill-version': {
              const getActor = Command.compileActor(operand.actor)
              return () => getActor()?.skill.version ?? -1
            }
            case 'actor-state-version': {
              const getActor = Command.compileActor(operand.actor)
              return () => getActor()?.state.version ?? -1
            }
            case 'actor-equipment-version': {
              const getActor = Command.compileActor(operand.actor)
              return () => getActor()?.equipment.version ?? -1
            }
            case 'actor-shortcut-version': {
              const getActor = Command.compileActor(operand.actor)
              return () => getActor()?.shortcut.version ?? -1
            }
            case 'actor-animation-current-time': {
              const getActor = Command.compileActor(operand.actor)
              return () => getActor()?.animation?.getCurrentTime()
            }
            case 'actor-animation-duration': {
              const getActor = Command.compileActor(operand.actor)
              return () => getActor()?.animation?.getDuration()
            }
            case 'actor-animation-progress': {
              const getActor = Command.compileActor(operand.actor)
              return () => {
                const animation = getActor()?.animation
                // @ts-ignore
                if (animation?.length > 0) {
                  return animation!.index / animation!.length
                }
              }
            }
            case 'actor-cooldown-time': {
              const getActor = Command.compileActor(operand.actor)
              const getKey = Command.compileEnumValue(operand.key)
              return () => {
                const actor = getActor()
                if (actor) {
                  return actor.cooldown.get(getKey())?.cooldown ?? 0
                }
              }
            }
            case 'actor-cooldown-duration': {
              const getActor = Command.compileActor(operand.actor)
              const getKey = Command.compileEnumValue(operand.key)
              return () => {
                const actor = getActor()
                if (actor) {
                  return actor.cooldown.get(getKey())?.duration ?? 0
                }
              }
            }
            case 'actor-cooldown-progress': {
              const getActor = Command.compileActor(operand.actor)
              const getKey = Command.compileEnumValue(operand.key)
              return () => {
                const actor = getActor()
                if (actor) {
                  return actor.cooldown.get(getKey())?.progress ?? 0
                }
              }
            }
            case 'skill-cooldown-time': {
              const getSkill = Command.compileSkill(operand.skill)
              return () => getSkill()?.cooldown
            }
            case 'skill-cooldown-duration': {
              const getSkill = Command.compileSkill(operand.skill)
              return () => getSkill()?.duration
            }
            case 'skill-cooldown-progress': {
              const getSkill = Command.compileSkill(operand.skill)
              return () => getSkill()?.progress
            }
            case 'state-current-time': {
              const getState = Command.compileState(operand.state)
              return () => getState()?.currentTime
            }
            case 'state-duration': {
              const getState = Command.compileState(operand.state)
              return () => getState()?.duration
            }
            case 'state-progress': {
              const getState = Command.compileState(operand.state)
              return () => {
                const state = getState()
                if (state) {
                  return state.duration === 0 ? 1 : state.currentTime / state.duration
                }
              }
            }
            case 'equipment-order': {
              const getEquipment = Command.compileEquipment(operand.equipment)
              return () => getEquipment()?.order
            }
            case 'item-order': {
              const getItem = Command.compileItem(operand.item)
              return () => getItem()?.order
            }
            case 'item-quantity': {
              const getItem = Command.compileItem(operand.item)
              return () => getItem()?.quantity
            }
            case 'trigger-speed': {
              const getTrigger = Command.compileTrigger(operand.trigger)
              return () => getTrigger()?.speed
            }
            case 'trigger-angle': {
              const {degrees} = Math
              const getTrigger = Command.compileTrigger(operand.trigger)
              return () => {
                const trigger = getTrigger()
                if (trigger) {
                  return degrees(trigger.angle)
                }
              }
            }
            case 'tilemap-width': {
              const getTilemap = Command.compileTilemap(operand.tilemap)
              return () => getTilemap()?.width
            }
            case 'tilemap-height': {
              const getTilemap = Command.compileTilemap(operand.tilemap)
              return () => getTilemap()?.height
            }
            case 'list-length': {
              const getList = Command.compileVariable(operand.variable, LIST_GET)
              return () => {
                return getList()?.length
              }
            }
          }
        case 'element': {
          const {element, property} = operand
          const getElement = Command.compileElement(element)
          const index = property.indexOf('-')
          const prefix = property.slice(0, index)
          const key = property.slice(index + 1) as string
          switch (prefix) {
            case 'element':
              switch (key) {
                case 'x':
                case 'y':
                case 'width':
                case 'height':
                  return () => getElement()?.[key]
                case 'children-count':
                  return () => getElement()?.children.length
                case 'index-of-selected-button':
                  return () => UI.getIndexOfSelectedButton(getElement())
              }
            case 'transform':
              return () => getElement()?.transform[key as TransformKey]
            case 'window':
              switch (key) {
                case 'visibleGridColumns':
                  return () => {
                    const element = getElement()
                    if (element instanceof WindowElement) {
                      const columns = element.getVisibleGridColumns()
                      return Number.isFinite(columns) ? columns : 0
                    }
                  }
                case 'visibleGridRows':
                  return () => {
                    const element = getElement()
                    if (element instanceof WindowElement) {
                      const rows = element.getVisibleGridRows()
                      return Number.isFinite(rows) ? rows : 0
                    }
                  }
              }
            case 'text':
              return () => {
                const element = getElement()
                if (element instanceof TextElement) {
                  element.update()
                  // @ts-ignore
                  return element[key]
                }
              }
            case 'textBox':
              return () => {
                const element = getElement()
                if (element instanceof TextBoxElement) {
                  // @ts-ignore
                  return element[key]
                }
              }
            case 'dialogBox':
              switch (key) {
                case 'printEndX':
                  return () => {
                    const element = getElement()
                    if (element instanceof DialogBoxElement) {
                      return element.printEndX
                    }
                  }
                case 'printEndY':
                  return () => {
                    const element = getElement()
                    if (element instanceof DialogBoxElement) {
                      return element.printEndY
                    }
                  }
              }
          }
        }
        case 'list': {
          const getList = Command.compileVariable(operand.variable, LIST_GET)
          const getIndex = Command.compileNumber(operand.index, -1)
          return () => {
            const value = getList()?.[getIndex()]
            return typeof value === 'number' ? value : undefined
          }
        }
        case 'parameter': {
          const getKey = Command.compileString(operand.key)
          return () => Command.getParameter(getKey(), 'number') as number | undefined
        }
        case 'script':
          return Command.compileFunction(operand.script) as any
        case 'other':
          switch (operand.data) {
            case 'trigger-button':
              return () => Input.event instanceof ScriptMouseEvent ? Input.event.button : undefined
            case 'trigger-wheel-y':
              return () => Input.event instanceof ScriptWheelEvent ? Input.event.deltaY : 0
            case 'trigger-gamepad-button':
              return () => Controller.buttonCode
            case 'gamepad-left-stick-angle':
              return () => Controller.states.LeftStickAngle
            case 'gamepad-right-stick-angle':
              return () => Controller.states.RightStickAngle
            case 'mouse-screen-x':
              return () => Mouse.screenX
            case 'mouse-screen-y':
              return () => Mouse.screenY
            case 'mouse-ui-x':
              return () => Mouse.screenX / UI.scale
            case 'mouse-ui-y':
              return () => Mouse.screenY / UI.scale
            case 'mouse-scene-x':
              return () => Mouse.sceneX
            case 'mouse-scene-y':
              return () => Mouse.sceneY
            case 'touch-screen-x': {
              const getTouchId = Command.compileNumber(operand.touchId)
              return () => Input.getTouch(getTouchId())?.screenX
            }
            case 'touch-screen-y': {
              const getTouchId = Command.compileNumber(operand.touchId)
              return () => Input.getTouch(getTouchId())?.screenY
            }
            case 'touch-ui-x': {
              const getTouchId = Command.compileNumber(operand.touchId)
              return () => Input.getTouch(getTouchId())?.uiX
            }
            case 'touch-ui-y': {
              const getTouchId = Command.compileNumber(operand.touchId)
              return () => Input.getTouch(getTouchId())?.uiY
            }
            case 'touch-scene-x': {
              const getTouchId = Command.compileNumber(operand.touchId)
              return () => Input.getTouch(getTouchId())?.sceneX
            }
            case 'touch-scene-y': {
              const getTouchId = Command.compileNumber(operand.touchId)
              return () => Input.getTouch(getTouchId())?.sceneY
            }
            case 'virtual-axis-x':
              return () => VirtualAxis.x
            case 'virtual-axis-y':
              return () => VirtualAxis.y
            case 'virtual-axis-angle':
              return () => VirtualAxis.angle
            case 'start-position-x':
              return () => Data.config.startPosition.x
            case 'start-position-y':
              return () => Data.config.startPosition.y
            case 'camera-x':
              return () => Camera.x
            case 'camera-y':
              return () => Camera.y
            case 'camera-zoom':
              return () => Camera.zoom
            case 'raw-camera-zoom':
              return () => Camera.rawZoom
            case 'screen-width':
              return () => GL.width
            case 'screen-height':
              return () => GL.height
            case 'scene-scale':
              return () => Scene.scale
            case 'ui-scale':
              return () => UI.scale
            case 'scene-width':
              return () => Scene.binding?.width
            case 'scene-height':
              return () => Scene.binding?.height
            case 'play-time':
              return () => Time.playTime
            case 'elapsed-time':
              return () => Time.elapsed
            case 'delta-time':
              return () => Time.deltaTime
            case 'raw-delta-time':
              return () => Time.rawDeltaTime
            case 'timestamp':
              return () => Date.now()
            case 'party-version':
              return () => Party.version
            case 'party-member-count':
              return () => Party.members.length
            case 'actor-count':
              return () => Scene.binding?.actor.count(operand.teamId) ?? 0
            case 'latest-item-increment':
              return () => Item.increment
            case 'latest-money-increment':
              return () => Inventory.moneyIncrement
            case 'loader-loaded-bytes':
              return () => Loader.loadedBytes
            case 'loader-total-bytes':
              return () => Loader.totalBytes
            case 'loader-completion-progress':
              return () => Loader.completionProgress
          }
      }
      throw new Error('Compiling Error')
    }

    // 编译操作数列表
    const compileOperands = (operands: Array<any>): () => number | undefined => {
      let length = operands.length
      if (length === 1) {
        return compileOperand(operands[0])
      }
      const items = new Array(length)
      for (let i = 0; i < length; i++) {
        const operand = operands[i]
        const operation = operand.operation.replace('()', '') as keyof typeof operationPriorityMap
        let priority = operationPriorityMap[operation]
        if (operation !== operand.operation) {
          priority += 2
        }
        items[i] = {
          operation: operation,
          priority: priority,
          getter: compileOperand(operand),
        }
      }
      do {
        let getter
        let priority = 0
        for (let i = 1; i < length; i++) {
          priority = Math.max(priority, items[i].priority)
        }
        for (let i = 1; i < length; i++) {
          const item = items[i]
          if (item.priority === priority) {
            const prev = items[i - 1]
            const a = prev.getter
            const b = item.getter
            switch (item.operation) {
              case 'add': getter = () => a() + b(); break
              case 'sub': getter = () => a() - b(); break
              case 'mul': getter = () => a() * b(); break
              case 'div': getter = () => a() / b(); break
              case 'mod': getter = () => a() % b(); break
            }
            prev.getter = getter
            items.splice(i--, 1)
            length--
          }
        }
      } while (length > 1)
      return items[0].getter
    }

    /** 设置数值 */
    return function ({variable, operation, operands}: {
      variable: VariableGetter
      operation: keyof typeof operationMap
      operands: Array<object>
    }): CommandFunction {
      const OP = operationMap[operation]
      const getter = compileOperands(operands)
      const setter = Command.compileVariable(variable, OP)
      return () => {
        const value = getter()
        if (Number.isFinite(value)) {
          setter(value)
        }
        return true
      }
    }
  }()

  /** 设置字符串 */
  protected setString = function (IIFE) {
    const {GET, STRING_GET, LIST_GET} = Attribute
    const patternEscape = /[(){}\\^$*+?.|[\]]/g

    // 字符串操作映射表
    const operationMap = {
      set: Attribute.STRING_SET,
      add: Attribute.STRING_ADD,
    }

    // 编译操作数
    const compileOperand = (operand: any): () => string | undefined => {
      switch (operand.type) {
        case 'constant': {
          const {value} = operand
          return () => value
        }
        case 'variable': {
          const getter = Command.compileVariable(operand.variable, GET)
          return () => {
            const value = getter()
            switch (typeof value) {
              case 'string':
                return value
              case 'number':
              case 'boolean':
                return value.toString()
            }
          }
        }
        case 'template':
          return Command.compileTextContent(operand.value)
        case 'string':
          switch (operand.method) {
            case 'char': {
              const getter = Command.compileVariable(operand.variable, STRING_GET)
              const getIndex = Command.compileNumber(operand.index, -1)
              return () => getter()?.[getIndex()]
            }
            case 'slice': {
              const getter = Command.compileVariable(operand.variable, STRING_GET)
              const getBegin = Command.compileNumber(operand.begin)
              const getEnd = Command.compileNumber(operand.end)
              return () => getter()?.slice(getBegin(), getEnd())
            }
            case 'pad-start': {
              const getter = Command.compileVariable(operand.variable, GET)
              const {length, pad} = operand
              return () => {
                let value = getter()
                switch (typeof value) {
                  case 'number':
                    value = value.toString()
                  case 'string':
                    return value.padStart(length, pad)
                }
              }
            }
            case 'replace':
            case 'replace-all': {
              const defaultString = '$INVALID_VARIABLE$'
              const getter = Command.compileVariable(operand.variable, STRING_GET)
              const getPattern = Command.compileString(operand.pattern, defaultString)
              const getReplacement = Command.compileString(operand.replacement, defaultString)
              return () => {
                let pattern: string | RegExp = getPattern()
                const replacement = getReplacement()
                if (pattern !== defaultString && replacement !== defaultString) {
                  if (operand.method === 'replace-all') {
                    pattern = pattern.replace(patternEscape, '\\$&')
                    pattern = new RegExp(pattern, 'g')
                  }
                  return getter()?.replace(pattern, replacement)
                }
              }
            }
          }
        case 'attribute': {
          const string = Attribute.getKey(operand.attributeId) || undefined
          return () => string
        }
        case 'enum': {
          const string = Enum.getValue(operand.stringId) || undefined
          return () => string
        }
        case 'object':
          switch (operand.property) {
            case 'actor-team-id': {
              const getActor = Command.compileActor(operand.actor)
              return () => getActor()?.teamId
            }
            case 'actor-file-id': {
              const getActor = Command.compileActor(operand.actor)
              return () => getActor()?.data.id
            }
            case 'actor-animation-motion-name': {
              const getActor = Command.compileActor(operand.actor)
              return () => getActor()?.animation?.motion?.name
            }
            case 'skill-file-id': {
              const getSkill = Command.compileSkill(operand.skill)
              return () => getSkill()?.id
            }
            case 'trigger-file-id': {
              const getTrigger = Command.compileTrigger(operand.trigger)
              return () => getTrigger()?.id
            }
            case 'state-file-id': {
              const getState = Command.compileState(operand.state)
              return () => getState()?.id
            }
            case 'equipment-file-id': {
              const getEquipment = Command.compileEquipment(operand.equipment)
              return () => getEquipment()?.id
            }
            case 'equipment-slot': {
              const getEquipment = Command.compileEquipment(operand.equipment)
              return () => getEquipment()?.slot
            }
            case 'item-file-id': {
              const getItem = Command.compileItem(operand.item)
              return () => getItem()?.id
            }
            case 'file-id': {
              const {fileId} = operand
              return () => fileId
            }
          }
        case 'element': {
          const getElement = Command.compileElement(operand.element)
          switch (operand.property) {
            case 'text-content':
              return () => {
                const element = getElement()
                if (element instanceof TextElement) {
                  return element.content
                }
              }
            case 'textBox-text':
              return () => {
                const element = getElement()
                if (element instanceof TextBoxElement) {
                  return element.text
                }
              }
            case 'dialogBox-content':
              return () => {
                const element = getElement()
                if (element instanceof DialogBoxElement) {
                  return element.content
                }
              }
          }
        }
        case 'list': {
          const getList = Command.compileVariable(operand.variable, LIST_GET)
          const getIndex = Command.compileNumber(operand.index, -1)
          return () => {
            const value = getList()?.[getIndex()]
            return typeof value === 'string' ? value : undefined
          }
        }
        case 'parameter': {
          const getKey = Command.compileString(operand.key)
          return () => Command.getParameter(getKey(), 'string') as string | undefined
        }
        case 'script':
          return Command.compileFunction(operand.script) as any
        case 'other':
          switch (operand.data) {
            case 'trigger-key':
              return () => Input.event instanceof ScriptKeyboardEvent ? Input.event.keyName : undefined
            case 'start-position-scene-id':
              return () => Data.config.startPosition.sceneId
            case 'showText-content':
              return () => Command.textContent
            // 补丁：2023-1-18
            case 'showChoices-content-0':
            case 'showChoices-content-1':
            case 'showChoices-content-2':
            case 'showChoices-content-3': {
              const index = parseInt(operand.data.slice(-1))
              return () => Command.choiceContents[index] ?? ''
            }
            case 'showChoices-content': {
              const getIndex = Command.compileNumber(operand.choiceIndex)
              return () => Command.choiceContents[getIndex()] ?? ''
            }
            case 'parse-timestamp': {
              const getTimestamp = Command.compileNumber(operand.variable, -1)
              const format = operand.format
              return () => {
                const timestamp = getTimestamp()
                if (timestamp !== -1) {
                  return Time.parseDateTimestamp(timestamp, format)
                }
              }
            }
            case 'screenshot': {
              const {width, height} = operand
              return () => GL.offscreen.current.toBase64(width, height)
            }
            case 'game-language':
              return () => Local.language
          }
      }
      throw new Error('Compiling Error')
    }

    /** 设置字符串 */
    return function ({variable, operation, operand}: {
      variable: VariableGetter
      operation: keyof typeof operationMap
      operand: object
    }): CommandFunction {
      const OP = operationMap[operation]
      const getter = compileOperand(operand)
      const setter = Command.compileVariable(variable, OP)
      return () => {
        const value = getter()
        if (typeof value === 'string') {
          setter(value)
        }
        return true
      }
    }
  }()

  /** 设置对象 */
  protected setObject = function (IIFE) {
    const {OBJECT_GET, OBJECT_SET, LIST_GET} = Attribute

    // 编译操作数
    const compileOperand = (operand: any): any => {
      switch (operand.type) {
        case 'none':
          return Function.undefined
        case 'actor':
          return Command.compileActor(operand.actor)
        case 'skill':
          return Command.compileSkill(operand.skill)
        case 'state':
          return Command.compileState(operand.state)
        case 'equipment':
          return Command.compileEquipment(operand.equipment)
        case 'item':
          return Command.compileItem(operand.item)
        case 'trigger':
          return Command.compileTrigger(operand.trigger)
        case 'light':
          return Command.compileLight(operand.light)
        case 'object':
          return Command.compileObject(operand.object)
        case 'element':
          return Command.compileElement(operand.element)
        case 'variable':
          return Command.compileVariable(operand.variable, OBJECT_GET)
        case 'list': {
          const getList = Command.compileVariable(operand.variable, LIST_GET)
          const getIndex = Command.compileNumber(operand.index, -1)
          return () => {
            const value = getList()?.[getIndex()]
            return typeof value === 'object' ? value : undefined
          }
        }
      }
    }

    /** 设置对象 */
    return function ({variable, operand}: {
      variable: VariableGetter
      operand: object
    }): CommandFunction {
      const getter = compileOperand(operand)
      const setter = Command.compileVariable(variable, OBJECT_SET)
      return () => {
        setter(getter())
        return true
      }
    }
  }()

  /** 设置列表 */
  protected setList = function (IIFE) {
    const {GET, NUMBER_GET, STRING_GET, OBJECT_SET, LIST_GET} = Attribute
    const {floor} = Math
    const compileListIndex = (index: number | VariableGetter): () => number | undefined => {
      switch (typeof index) {
        case 'number':
          return () => index
        case 'object': {
          const getter = Command.compileVariable(index, NUMBER_GET)
          return () => {
            const index = getter()
            if (index >= 0) {
              return floor(index)
            }
          }
        }
      }
    }
    /** 设置列表 */
    return function ({variable, operation, list, index, constant, operand, separator, groupId, actor}: {
      variable: VariableGetter
      operation: string
      list?: Array<number> | Array<string>
      index?: number | VariableGetter
      constant?: boolean | number | string
      operand?: VariableGetter
      separator?: string | VariableGetter
      groupId?: string
      actor?: ActorGetter
    }): CommandFunction {
      switch (operation) {
        case 'set-empty': {
          const setList = Command.compileVariable(variable, OBJECT_SET)
          return () => {
            setList([])
            return true
          }
        }
        case 'set-numbers':
        case 'set-strings': {
          const setList = Command.compileVariable(variable, OBJECT_SET)
          return () => {
            setList(list!.slice())
            return true
          }
        }
        case 'set-boolean':
        case 'set-number':
        case 'set-string': {
          const getList = Command.compileVariable(variable, LIST_GET)
          const getIndex = compileListIndex(index!)
          return () => {
            const list = getList()
            const index = getIndex()
            // @ts-ignore
            if (list?.length >= index) {
              list[index!] = constant
            }
            return true
          }
        }
        case 'set-variable': {
          const getList = Command.compileVariable(variable, LIST_GET)
          const getIndex = compileListIndex(index!)
          const getValue = Command.compileVariable(operand!, GET)
          return () => {
            const list = getList()
            const index = getIndex()
            const value = getValue()
            // @ts-ignore
            if (list?.length >= index && value !== undefined) {
              list[index!] = value
            }
            return true
          }
        }
        case 'split-string': {
          const setList = Command.compileVariable(variable, OBJECT_SET)
          const getString = Command.compileVariable(operand!, STRING_GET)
          const getSeparator = Command.compileString(separator!, '$INVALID_VARIABLE$')
          return () => {
            const string = getString()
            const separator = getSeparator()
            if (string !== undefined && separator !== '$INVALID_VARIABLE$') {
              setList(string.split(separator))
            }
            return true
          }
        }
        case 'push':
        case 'remove': {
          const getList = Command.compileVariable(variable, LIST_GET)
          const getValue = Command.compileVariable(operand!, GET)
          return () => {
            const list = getList()
            const value = getValue()
            if (list !== undefined && value !== undefined) {
              list[operation](value)
            }
            return true
          }
        }
        case 'get-attribute-names': {
          const setList = Command.compileVariable(variable, OBJECT_SET)
          const group = Attribute.getGroup(groupId!)
          const names = group?.list.map(Item => Item.name) ?? []
          return () => {
            setList(names.slice())
            return true
          }
        }
        case 'get-attribute-keys': {
          const setList = Command.compileVariable(variable, OBJECT_SET)
          const group = Attribute.getGroup(groupId!)
          const keys = group?.list.map(Item => Item.key) ?? []
          return () => {
            setList(keys.slice())
            return true
          }
        }
        case 'get-enum-names': {
          const setList = Command.compileVariable(variable, OBJECT_SET)
          const group = Enum.getGroup(groupId!)
          const names = group?.list.map(item => item.name) ?? []
          return () => {
            setList(names.slice())
            return true
          }
        }
        case 'get-enum-values': {
          const setList = Command.compileVariable(variable, OBJECT_SET)
          const group = Enum.getGroup(groupId!)
          const values = group?.list.map(item => item.value) ?? []
          return () => {
            setList(values.slice())
            return true
          }
        }
        case 'get-actor-targets': {
          const setList = Command.compileVariable(variable, OBJECT_SET)
          const getActor = Command.compileActor(actor!)
          return () => {
            const actor = getActor()
            if (actor) {
              setList(actor.target.targets.slice())
            }
            return true
          }
        }
      }
      throw new Error('Compiling Error')
    }
  }()

  /** 删除变量 */
  protected deleteVariable({variable}: {variable: VariableGetter}): CommandFunction {
    const deleter = Command.compileVariable(variable, Attribute.DELETE)
    return () => {
      deleter()
      return true
    }
  }

  /** 如果 */
  protected if({branches, elseCommands}: {
    branches: Array<any>
    elseCommands?: CommandDataList
  }): CommandFunction {
    const {commands, index} = this.stack.get()
    const pop = Command.goto(commands, index + 1)
    const length = branches.length
    const testers = new Array(length)
    const functions = new Array(length)
    for (let i = 0; i < length; i++) {
      const {mode, conditions, commands} = branches[i]
      testers[i] = Command.compileConditions(mode, conditions)
      functions[i] = Command.goto(Command.compile(commands, pop), 0)
    }
    const elseFn = elseCommands !== undefined
    ? Command.goto(Command.compile(elseCommands, pop), 0)
    : Command.skip
    if (length < 6) {
      const [a, b, c, d, e] = testers
      const [f, g, h, i, j] = functions
      switch (length) {
        case 1: return () => (a() ? f : elseFn)()
        case 2: return () => (a() ? f : b() ? g : elseFn)()
        case 3: return () => (a() ? f : b() ? g : c() ? h : elseFn)()
        case 4: return () => (a() ? f : b() ? g : c() ? h : d() ? i : elseFn)()
        case 5: return () => (a() ? f : b() ? g : c() ? h : d() ? i : e() ? j : elseFn)()
      }
    }
    return () => {
      for (let i = 0; i < length; i++) {
        if (testers[i]()) {
          return functions[i]()
        }
      }
      return elseFn()
    }
  }

  /** 条件分支 */
  protected switch = function (IIFE) {
    const {GET} = Attribute
    let Value: any

    // 编译条件
    const compileCondition = (condition: any): () => boolean => {
      switch (condition.type) {
        case 'none':
          return () => Value === undefined
        case 'boolean':
        case 'number':
        case 'string': {
          const {value} = condition
          return () => Value === value
        }
        case 'attribute': {
          const string = Attribute.getKey(condition.attributeId) || null
          return () => Value === string
        }
        case 'enum': {
          const string = Enum.getValue(condition.stringId) || null
          return () => Value === string
        }
        case 'keyboard': {
          const {keycode} = condition
          return () => Value === keycode
        }
        case 'gamepad': {
          const {button} = condition
          return () => Value === button
        }
        case 'mouse': {
          const {button} = condition
          return () => Value === button
        }
        case 'variable': {
          const getter = Command.compileVariable(condition.variable, GET)
          return () => Value === getter()
        }
      }
      throw new Error('Compiling Error')
    }

    // 编译条件列表
    const compileConditions = (conditions: Array<any>): () => boolean => {
      const length = conditions.length
      if (length === 1) {
        return compileCondition(conditions[0])
      }
      const testers = new Array(length)
      for (let i = 0; i < length; i++) {
        testers[i] = compileCondition(conditions[i])
      }
      if (length < 6) {
        const [a, b, c, d, e] = testers
        switch (length) {
          case 2: return () => a() || b()
          case 3: return () => a() || b() || c()
          case 4: return () => a() || b() || c() || d()
          case 5: return () => a() || b() || c() || d() || e()
        }
      }
      return () => {
        for (let i = 0; i < length; i++) {
          if (testers[i]()) {
            return true
          }
        }
        return false
      }
    }

    /** 条件分支 */
    return function ({variable, branches, defaultCommands}: {
      variable: VariableGetter
      branches: Array<any>
      defaultCommands?: CommandDataList
    }): CommandFunction {
      const {commands, index} = Command.stack.get()
      const pop = Command.goto(commands, index + 1)
      const length = branches.length
      const testers = new Array(length)
      const functions = new Array(length)
      for (let i = 0; i < length; i++) {
        const {conditions, commands} = branches[i]
        testers[i] = compileConditions(conditions)
        functions[i] = Command.goto(Command.compile(commands, pop), 0)
      }
      const defFn = defaultCommands !== undefined
      ? Command.goto(Command.compile(defaultCommands, pop), 0)
      : Command.skip
      const getter = Command.compileVariable(variable, GET)
      if (length < 6) {
        const [a, b, c, d, e] = testers
        const [f, g, h, i, j] = functions
        switch (length) {
          case 1: return () => (Value = getter(), a() ? f : defFn)()
          case 2: return () => (Value = getter(), a() ? f : b() ? g : defFn)()
          case 3: return () => (Value = getter(), a() ? f : b() ? g : c() ? h : defFn)()
          case 4: return () => (Value = getter(), a() ? f : b() ? g : c() ? h : d() ? i : defFn)()
          case 5: return () => (Value = getter(), a() ? f : b() ? g : c() ? h : d() ? i : e() ? j : defFn)()
        }
      }
      return () => {
        Value = getter()
        for (let i = 0; i < length; i++) {
          if (testers[i]()) {
            return functions[i]()
          }
        }
        return defFn()
      }
    }
  }()

  /** 循环 */
  protected loop({mode, conditions, commands}: {
    mode: string
    conditions: Array<object>
    commands: CommandDataList
  }): CommandFunction | null {
    if (commands.length === 0) {
      return null
    }
    const cmdpath = this.stack[0].path
    const context = this.stack.get()
    const nextCommands = context.commands
    const nextIndex = context.index + 1
    let infiniteLoopTest = Function.empty
    if (Stats.debug) {
      let timestamp = 0
      let cycleCount = 0
      infiniteLoopTest = () => {
        if (timestamp !== Time.timestamp) {
          timestamp = Time.timestamp
          cycleCount = 1
        } else if (++cycleCount > 100000000) {
          CommandList = nextCommands
          CommandIndex = nextIndex
          console.error(`The number of loops exceeds 100000000, it may be an infinite loop.\n${cmdpath}`)
        }
      }
    }
    if (conditions.length !== 0) {
      const tester = Command.compileConditions(mode, conditions)
      const loopCommands = Command.compile(commands, () => {
        if (tester()) {
          CommandIndex = 0
          infiniteLoopTest()
        } else {
          CommandList = nextCommands
          CommandIndex = nextIndex
        }
        return true
      }, true)
      return () => {
        if (tester()) {
          CommandList = loopCommands
          CommandIndex = 0
        }
        return true
      }
    } else {
      const loopCommands = Command.compile(commands, () => {
        CommandIndex = 0
        infiniteLoopTest()
        return true
      }, true)
      return Command.goto(loopCommands, 0)
    }
  }

  /** 遍历 */
  protected forEach = function forEach(IIFE) {
    const {SET, LIST_GET} = Attribute

    // 编译通用迭代器
    const compileCommonIterator = (variable: VariableGetter): CommandFunction => {
      const context = Command.stack.get()
      const nextCommands = context.commands
      const nextIndex = context.index + 1
      const setter = Command.compileVariable(variable, SET)
      return () => {
        const wrap = CurrentEvent.forEach![0]
        const value = wrap.list[wrap.index++]
        if (value !== undefined) {
          setter(value)
          CommandIndex = 0
        } else {
          CurrentEvent.forEach!.shift()
          CommandList = nextCommands
          CommandIndex = nextIndex
        }
        return true
      }
    }

    // 编译存档迭代器
    const compileSaveIterator = (variable: VariableGetter): CommandFunction => {
      const context = Command.stack.get()
      const nextCommands = context.commands
      const nextIndex = context.index + 1
      const setSaveIndex = Command.compileVariable(variable, SET)
      return () => {
        const wrap = CurrentEvent.forEach![0]
        const meta = wrap.list[wrap.index++]
        if (meta) {
          setSaveIndex(meta.index)
          const {data} = meta
          const {attributes} = CurrentEvent
          for (const key of Object.keys(data)) {
            attributes[key] = data[key]
          }
          CommandIndex = 0
        } else {
          CurrentEvent.forEach!.shift()
          CommandList = nextCommands
          CommandIndex = nextIndex
        }
        return true
      }
    }

    // 编译角色组件列表
    const compileActorComponentList = (actor: ActorGetter, data: string) => {
      const getActor = Command.compileActor(actor)
      return () => {
        const actor = getActor()
        if (actor) {
          switch (data) {
            case 'skill':
              return Object.values(actor.skill.idMap)
            case 'state':
              return Object.values(actor.state.idMap)
            case 'equipment':
              return Object.values(actor.equipment.slotMap)
            case 'inventory':
              return actor.inventory.list.slice()
          }
        }
      }
    }

    /** 遍历 */
    return function ({data, list, actor, element, groupId, variable, saveIndex, touchId, commands}: {
      data: string
      list?: VariableGetter
      actor?: ActorGetter
      element?: ElementGetter
      groupId?: string
      variable?: VariableGetter
      saveIndex?: VariableGetter
      touchId?: VariableGetter
      commands: CommandDataList
    }): CommandFunction | null {
      if (commands.length === 0) {
        return null
      }
      let getList: () => Array<any> | undefined
      switch (data) {
        case 'list':
          getList = Command.compileVariable(list!, LIST_GET)
          break
        case 'skill':
        case 'state':
        case 'equipment':
        case 'inventory':
          getList = compileActorComponentList(actor!, data)
          break
        case 'element': {
          const getElement = Command.compileElement(element!)
          getList = () => getElement()?.children.slice()
          break
        }
        case 'member':
          getList = () => Party.members.slice()
          break
        case 'attribute': {
          const group = Attribute.getGroup(groupId!)
          const attrKeys = group?.list.map(item => item.key) ?? []
          getList = () => attrKeys
          break
        }
        case 'enum': {
          const group = Enum.getGroup(groupId!)
          const enumValues = group?.list.map(item => item.value) ?? []
          getList = () => enumValues
          break
        }
        case 'touch':
          getList = () => {
            return Input.event instanceof ScriptTouchEvent
            ? Input.event.touches.map(touch => touch.id)
            : []
          }
          break
        case 'changed-touch':
          getList = () => {
            return Input.event instanceof ScriptTouchEvent
            ? Input.event.changedTouches.map(touch => touch.id)
            : []
          }
          break
      }
      switch (data) {
        default: {
          const iterator = compileCommonIterator(variable ?? touchId!)
          const loopCommands = Command.compile(commands, iterator, true)
          return () => {
            const list = getList()
            // @ts-ignore
            if (list?.length > 0) {
              if (!CurrentEvent.forEach) CurrentEvent.forEach = []
              CurrentEvent.forEach.unshift({list: list!, index: 0})
              CommandList = loopCommands
              iterator()
            }
            return true
          }
        }
        case 'save': {
          const iterator = compileSaveIterator(saveIndex!)
          const loopCommands = Command.compile(commands, iterator, true)
          return () => {
            const event = CurrentEvent
            Data.loadSaveMeta().then(list => {
              if (list.length !== 0) {
                if (!event.forEach) event.forEach = []
                event.forEach.unshift({list, index: 0})
                event.commands = loopCommands
                event.index = loopCommands.length - 1
              }
              event.continue()
            })
            return CurrentEvent.pause()
          }
        }
      }
    }
  }()

  /** 跳出循环 */
  protected break(): CommandFunction | null {
    const {stack} = this
    let i = stack.length
    while (--i >= 0) {
      if (stack[i].loop) {
        const {commands, index} = stack[i - 1]
        return Command.goto(commands, index + 1)
      }
    }
    return null
  }

  /** 继续循环 */
  protected continue(): CommandFunction | null {
    const {stack} = this
    const {length} = stack
    let i = length
    while (--i >= 0) {
      const context = stack[i]
      if (context.loop) {
        const {commands} = context
        return () => {
          let fn
          const index = commands.length - 1
          if (CommandList === commands) {
            fn = () => {
              CommandIndex = index
              return true
            }
          } else {
            fn = () => {
              CommandList = commands
              CommandIndex = index
              return true
            }
          }
          // 编译时不能确定当前指令栈长度，因此使用运行时编译
          return (CommandList[CommandIndex - 1] = fn)()
        }
      }
    }
    return null
  }

  /** 独立执行 */
  protected independent({commands}: {commands: CommandDataList}): CommandFunction | null {
    if (commands.length === 0) {
      return null
    }
    const compiledCommands = Command.compileIndependent(commands)
    compiledCommands.path = commands.path = this.stack[0].path
    compiledCommands.type = 'independent'
    return () => {
      const event = new EventHandler(compiledCommands)
      event.inheritEventContext(CurrentEvent)
      EventHandler.call(event)
      return true
    }
  }

  /** 编译事件参数访问器 */
  private compileArgumentAccessors(
    eventArgs: Array<GlobalEventArgument>,
    eventParams: Array<GlobalEventParameter>,
  ): {
    getArguments: CallbackFunction,
    setArguments: CallbackFunction,
  } {
    // 编译每个参数写入和读取器
    const flags: HashMap<true> = {}
    const getters: Array<() => void> = []
    const setters: Array<(value: any) => void> = []
    outer: for (const {type, key} of eventParams!) {
      for (const arg of eventArgs!) {
        if (arg.key === key && arg.type === type) {
          if (key in flags) {
            continue
          }
          flags[key] = true
          const variable: VariableGetter = {type: 'local', key: key}
          const value = arg.value
          switch (type) {
            case 'boolean':
              getters.push(() => value as boolean)
              setters.push(Command.compileVariable(variable, Attribute.BOOLEAN_SET))
              break
            case 'number':
              getters.push(Command.compileNumber(value as number | VariableGetter))
              setters.push(Command.compileVariable(variable, Attribute.NUMBER_SET))
              break
            case 'string':
              getters.push(Command.compileString(value as string | VariableGetter))
              setters.push(Command.compileVariable(variable, Attribute.STRING_SET))
              break
            case 'object':
              getters.push(Command.compileVariable(value as VariableGetter, Attribute.OBJECT_GET))
              setters.push(Command.compileVariable(variable, Attribute.OBJECT_SET))
              break
            case 'actor':
              getters.push(Command.compileActor(value as ActorGetter))
              setters.push(Command.compileVariable(variable, Attribute.OBJECT_SET))
              break
            case 'skill':
              getters.push(Command.compileSkill(value as SkillGetter))
              setters.push(Command.compileVariable(variable, Attribute.OBJECT_SET))
              break
            case 'state':
              getters.push(Command.compileState(value as StateGetter))
              setters.push(Command.compileVariable(variable, Attribute.OBJECT_SET))
              break
            case 'equipment':
              getters.push(Command.compileEquipment(value as EquipmentGetter))
              setters.push(Command.compileVariable(variable, Attribute.OBJECT_SET))
              break
            case 'item':
              getters.push(Command.compileItem(value as ItemGetter))
              setters.push(Command.compileVariable(variable, Attribute.OBJECT_SET))
              break
            case 'trigger':
              getters.push(Command.compileTrigger(value as TriggerGetter))
              setters.push(Command.compileVariable(variable, Attribute.OBJECT_SET))
              break
            case 'light':
              getters.push(Command.compileLight(value as LightGetter))
              setters.push(Command.compileVariable(variable, Attribute.OBJECT_SET))
              break
            case 'element':
              getters.push(Command.compileElement(value as ElementGetter))
              setters.push(Command.compileVariable(variable, Attribute.OBJECT_SET))
              break
          }
          continue outer
        }
      }
    }
    const values = new Array(getters.length)
    let getArguments = Function.empty
    let setArguments = Function.empty
    // 编译读取参数方法
    {
      const [a, b, c, d, e] = getters
      switch (getters.length) {
        case 0:
          break
        case 1:
          getArguments = () => {
            values[0] = a()
          }
          break
        case 2:
          getArguments = () => {
            values[0] = a()
            values[1] = b()
          }
          break
        case 3:
          getArguments = () => {
            values[0] = a()
            values[1] = b()
            values[2] = c()
          }
          break
        case 4:
          getArguments = () => {
            values[0] = a()
            values[1] = b()
            values[2] = c()
            values[3] = d()
          }
          break
        case 5:
          getArguments = () => {
            values[0] = a()
            values[1] = b()
            values[2] = c()
            values[3] = d()
            values[4] = e()
          }
          break
        default:
          getArguments = () => {
            const length = getters.length
            for (let i = 0; i < length; i++) {
              values[i] = getters[i]()
            }
          }
          break
      }
    }
    // 编译写入参数方法
    {
      const [a, b, c, d, e] = setters
      switch (setters.length) {
        case 0:
          break
        case 1:
          setArguments = () => {
            a(values[0])
          }
          break
        case 2:
          setArguments = () => {
            a(values[0])
            b(values[1])
          }
          break
        case 3:
          setArguments = () => {
            a(values[0])
            b(values[1])
            c(values[2])
          }
          break
        case 4:
          setArguments = () => {
            a(values[0])
            b(values[1])
            c(values[2])
            d(values[3])
          }
          break
        case 5:
          setArguments = () => {
            a(values[0])
            b(values[1])
            c(values[2])
            d(values[3])
            e(values[4])
          }
          break
        default:
          setArguments = () => {
            const length = setters.length
            for (let i = 0; i < length; i++) {
              setters[i](values[i])
            }
          }
          break
      }
    }
    return {getArguments, setArguments}
  }

  /** 编译事件返回值访问器 */
  private compileReturnValueAccessors(
    eventResult: GlobalEventResultSetter,
    returnType: GlobalEventReturnType,
  ): {
    getReturnValue: CallbackFunction,
    setReturnValue: CallbackFunction,
  } {
    let getReturnValue = Function.empty
    let setReturnValue = Function.empty
    // 如果返回值类型无效
    if (eventResult.type !== returnType) {
      return {getReturnValue, setReturnValue}
    }
    let result: any
    // 编译读取返回值方法
    switch (eventResult.type) {
      case 'none':
        break
      default: {
        const returnKey = this.returnKey
        getReturnValue = () => {
          result = (CurrentEvent.attributes as any)[returnKey]
        }
        break
      }
    }
    // 编译写入返回值方法
    switch (eventResult.type) {
      case 'none':
        break
      case 'boolean': {
        const setter = Command.compileVariable(eventResult.variable, Attribute.BOOLEAN_SET)
        setReturnValue = () => {if (typeof result === 'boolean') setter(result)}
        break
      }
      case 'number': {
        const setter = Command.compileVariable(eventResult.variable, Attribute.NUMBER_SET)
        setReturnValue = () => {if (Number.isFinite(result)) setter(result)}
        break
      }
      case 'string': {
        const setter = Command.compileVariable(eventResult.variable, Attribute.STRING_SET)
        setReturnValue = () => {if (typeof result === 'string') setter(result)}
        break
      }
      case 'object': {
        const setter = Command.compileVariable(eventResult.variable, Attribute.OBJECT_SET)
        setReturnValue = () => {if (typeof result === 'object' || result === undefined) setter(result)}
        break
      }
      case 'actor': {
        const setter = Command.compileVariable(eventResult.variable, Attribute.OBJECT_SET)
        setReturnValue = () => {if (result instanceof Actor || result === undefined) setter(result)}
        break
      }
      case 'skill': {
        const setter = Command.compileVariable(eventResult.variable, Attribute.OBJECT_SET)
        setReturnValue = () => {if (result instanceof Skill || result === undefined) setter(result)}
        break
      }
      case 'state': {
        const setter = Command.compileVariable(eventResult.variable, Attribute.OBJECT_SET)
        setReturnValue = () => {if (result instanceof State || result === undefined) setter(result)}
        break
      }
      case 'equipment': {
        const setter = Command.compileVariable(eventResult.variable, Attribute.OBJECT_SET)
        setReturnValue = () => {if (result instanceof Equipment || result === undefined) setter(result)}
        break
      }
      case 'item': {
        const setter = Command.compileVariable(eventResult.variable, Attribute.OBJECT_SET)
        setReturnValue = () => {if (result instanceof Item || result === undefined) setter(result)}
        break
      }
      case 'trigger': {
        const setter = Command.compileVariable(eventResult.variable, Attribute.OBJECT_SET)
        setReturnValue = () => {if (result instanceof Trigger || result === undefined) setter(result)}
        break
      }
      case 'light': {
        const setter = Command.compileVariable(eventResult.variable, Attribute.OBJECT_SET)
        setReturnValue = () => {if (result instanceof SceneLight || result === undefined) setter(result)}
        break
      }
      case 'element': {
        const setter = Command.compileVariable(eventResult.variable, Attribute.OBJECT_SET)
        setReturnValue = () => {if (result instanceof UIElement || result === undefined) setter(result)}
        break
      }
    }
    return {getReturnValue, setReturnValue}
  }

  /**
   * 获取继承的事件指令列表
   * @param event 事件处理器
   * @returns 事件指令列表
   */
  private getInheritedCommandList(object: Actor | Skill | Trigger | Item | Equipment | State | UIElement, found: boolean = false): CommandFunctionList | undefined {
    let override: CommandFunctionList
    const event: any = CurrentEvent
    const array = event[Command.inheritKey]
    if (array && array.length > 0) {
      override = array[array.length - 1]
    } else {
      override = CurrentEvent.initial
    }
    const type = override.type
    let events = object.events
    do {
      if (found) {
        // 已找到重载函数的情况下
        // 开始查找虚函数并调用
        const virtual = events[type]
        if (virtual !== undefined && virtual !== override) {
          return virtual
        }
      } else if (events[type] === override) {
        found = true
      }
      events = Object.getPrototypeOf(events)
    } while (events !== Object.prototype)
    return undefined
  }

  /**
   * 获取继承的角色或元素的事件指令列表
   * @param event 事件处理器
   * @returns 事件指令列表
   */
  private getInheritedCommandList2(object: Actor | UIElement): CommandFunctionList | undefined {
    let override: CommandFunctionList
    const event: any = CurrentEvent
    const array = event[Command.inheritKey]
    if (array && array.length > 0) {
      override = array[array.length - 1]
    } else {
      override = CurrentEvent.initial
    }
    const found = object.registeredEvents[override.type] === override
    return this.getInheritedCommandList(object, found)
  }

  /**
   * 编译子事件指令函数元组
   * @param commands 指令函数列表
   * @returns 两个指令函数
   */
  private compileCommandTuple(commands: CommandFunctionList): [CommandFunction, CommandFunction] {
    const fn1 = () => {
      CurrentEvent.stack.push(CommandList, CommandIndex)
      CommandList = commands
      CommandIndex = 0
      return true
    }
    const fn2 = Command.skip
    return [fn1, fn2]
  }

  /**
   * 编译带命名空间的子事件指令函数元组
   * @param commands 指令函数列表
   * @returns 两个指令函数
   */
  private compileCommandTupleInNamespace(commands: CommandFunctionList): [CommandFunction, CommandFunction] {
    const attrMapKey = Symbol('ATTRIBUTES_BACKUP')
    const fn1 = () => {
      (CurrentEvent as any)[attrMapKey] = CurrentEvent.attributes
      CurrentEvent.attributes = {}
      CurrentEvent.stack.push(CommandList, CommandIndex)
      CommandList = commands
      CommandIndex = 0
      return true
    }
    const fn2 = () => {
      CurrentEvent.attributes = (CurrentEvent as any)[attrMapKey]
      return true
    }
    return [fn1, fn2]
  }

  /**
   * 编译继承的事件指令函数元组
   * @param commands 指令函数列表
   * @returns 两个指令函数
   */
  private compileInheritedCommandTuple(): [CommandFunction, CommandFunction] {
    const inheritKey = Command.inheritKey
    const attrMapKey = Symbol('ATTRIBUTES_BACKUP')
    let commands: CommandFunctionList | undefined
    const fn1 = () => {
      const owner = CurrentEvent.parent
      if (
        owner instanceof Actor ||
        owner instanceof UIElement) {
        commands = this.getInheritedCommandList2(owner)
      } else if (
        owner instanceof Skill ||
        owner instanceof Trigger ||
        owner instanceof Item ||
        owner instanceof Equipment ||
        owner instanceof State) {
        commands = this.getInheritedCommandList(owner)
      } else {
        commands = undefined
      }
      if (commands) {
        const event: any = CurrentEvent;
        (event[inheritKey] ??= []).push(commands)
        event[attrMapKey] = event.attributes
        event.attributes = {}
        event.stack.push(CommandList, CommandIndex)
        CommandList = commands
        CommandIndex = 0
      }
      return true
    }
    const fn2 = () => {
      if (commands) {
        const event: any = CurrentEvent
        event[inheritKey].pop()
        event.attributes = event[attrMapKey]
      }
      return true
    }
    return [fn1, fn2]
  }

  /** 调用事件 */
  protected callEvent({type, actor, skill, state, equipment, item, light, element, eventId, eventArgs, eventResult, eventType}: {
    type: 'global' | 'inherited' | 'scene' | 'actor' | 'skill' | 'state' | 'equipment' | 'item' | 'light' | 'element'
    actor?: ActorGetter
    skill?: SkillGetter
    state?: StateGetter
    equipment?: EquipmentGetter
    item?: ItemGetter
    light?: LightGetter
    element?: ElementGetter
    eventId?: string
    eventArgs?: Array<GlobalEventArgument>
    eventResult?: GlobalEventResultSetter
    eventType?: string
  }): CommandFunction | Array<CommandFunction> {
    switch (type) {
      case 'global': {
        // 补丁：2025-2-22
        if (eventArgs === undefined) {
          eventArgs = []
        }
        if (eventResult === undefined) {
          eventResult = {type: 'none', variable: undefined}
        }
        const fn = () => {
          const commands = EventManager.guidMap[eventId!]
          let fn1: CommandFunction = Command.skip
          let fn2: CommandFunction = Command.skip
          if (commands) {
            const wrap = commands.namespace
            ? Command.compileCommandTupleInNamespace(commands)
            : Command.compileCommandTuple(commands)
            fn1 = wrap[0]
            fn2 = wrap[1]
            const {getArguments, setArguments} = Command.compileArgumentAccessors(eventArgs!, commands.parameters!)
            const {getReturnValue, setReturnValue} = Command.compileReturnValueAccessors(eventResult!, commands.returnType!)
            if (getArguments !== Function.empty) {
              const callEvent = fn1
              fn1 = () => {
                getArguments()
                callEvent()
                setArguments()
                return true
              }
            }
            if (getReturnValue !== Function.empty) {
              const handleReturn = fn2
              fn2 = () => {
                getReturnValue()
                handleReturn()
                setReturnValue()
                return true
              }
            }
          }
          CommandList[CommandIndex - 1] = fn1
          CommandList[CommandIndex    ] = fn2
          // 编译时不能确定事件已加载，因此使用运行时编译
          return fn1()
        }
        return [fn, Command.skip]
      }
      case 'inherited':
        return Command.compileInheritedCommandTuple()
      case 'scene': {
        const type = Enum.getValue(eventType!) || eventType
        return () => {
          Scene.binding?.callEvent(type!)
          return true
        }
      }
      case 'actor': {
        const getActor = Command.compileActor(actor!)
        const type = Enum.getValue(eventType!) || eventType
        return () => (getActor()?.callEvent(type!), true)
      }
      case 'skill': {
        const getSkill = Command.compileSkill(skill!)
        const type = Enum.getValue(eventType!) || eventType
        return () => (getSkill()?.callEvent(type!), true)
      }
      case 'state': {
        const getState = Command.compileState(state!)
        const type = Enum.getValue(eventType!) || eventType
        return () => (getState()?.callEvent(type!), true)
      }
      case 'equipment': {
        const getEquipment = Command.compileEquipment(equipment!)
        const type = Enum.getValue(eventType!) || eventType
        return () => (getEquipment()?.callEvent(type!), true)
      }
      case 'item': {
        const getItem = Command.compileItem(item!)
        const type = Enum.getValue(eventType!) || eventType
        return () => (getItem()?.callEvent(type!), true)
      }
      case 'light': {
        const getLight = Command.compileLight(light!)
        const type = Enum.getValue(eventType!) || eventType
        return () => (getLight()?.callEvent(type!), true)
      }
      case 'element': {
        const getElement = Command.compileElement(element!)
        const type = Enum.getValue(eventType!) || eventType
        return () => (getElement()?.callEvent(type!), true)
      }
    }
  }

  /** 停止正在执行的对象事件(通过类型) */
  private stopActiveEventsByType(updaters: UpdaterList | undefined, type: string): void {
    if (updaters === undefined) return
    for (const updater of updaters) {
      if (updater instanceof EventHandler && updater.type === type) {
        updater.finish()
      }
    }
  }

  /** 停止事件 */
  protected stopEvent({type, actor, skill, state, equipment, item, light, element, eventId, eventType}: {
    type: 'current' | 'global' | 'scene' | 'actor' | 'skill' | 'state' | 'equipment' | 'item' | 'light' | 'element'
    actor?: ActorGetter
    skill?: SkillGetter
    state?: StateGetter
    equipment?: EquipmentGetter
    item?: ItemGetter
    light?: LightGetter
    element?: ElementGetter
    eventId?: string
    eventType?: string
  }): CommandFunction | Array<CommandFunction> {
    // 补丁：2025-2-27
    if (type === undefined) {
      type = 'current'
    }
    switch (type) {
      case 'current':
        return () => (CurrentEvent.finish(), false)
      case 'global':
        return () => {
          const commands = EventManager.guidMap[eventId!]
          const fn = !commands ? Command.skip : () => {
            EventManager.stopEvents(commands)
            return true
          }
          // 编译时不能确定事件已加载，因此使用运行时编译
          return (CommandList[CommandIndex - 1] = fn)()
        }
      case 'scene': {
        const type = Enum.getValue(eventType!) || eventType!
        return () => {
          Command.stopActiveEventsByType(Scene.binding?.updaters, type)
          return true
        }
      }
      case 'actor': {
        const getActor = Command.compileActor(actor!)
        const type = Enum.getValue(eventType!) || eventType!
        return () => {
          Command.stopActiveEventsByType(getActor()?.updaters, type)
          return true
        }
      }
      case 'skill': {
        const getSkill = Command.compileSkill(skill!)
        const type = Enum.getValue(eventType!) || eventType!
        return () => {
          Command.stopActiveEventsByType(getSkill()?.parent?.actor.updaters, type)
          return true
        }
      }
      case 'state': {
        const getState = Command.compileState(state!)
        const type = Enum.getValue(eventType!) || eventType!
        return () => {
          Command.stopActiveEventsByType(getState()?.updaters, type)
          return true
        }
      }
      case 'equipment': {
        const getEquipment = Command.compileEquipment(equipment!)
        const type = Enum.getValue(eventType!) || eventType!
        return () => {
          Command.stopActiveEventsByType(getEquipment()?.parent?.actor.updaters, type)
          return true
        }
      }
      case 'item': {
        const getItem = Command.compileItem(item!)
        const type = Enum.getValue(eventType!) || eventType!
        return () => {
          Command.stopActiveEventsByType(getItem()?.parent?.actor.updaters, type)
          return true
        }
      }
      case 'light': {
        const getLight = Command.compileLight(light!)
        const type = Enum.getValue(eventType!) || eventType!
        return () => {
          Command.stopActiveEventsByType(getLight()?.updaters, type)
          return true
        }
      }
      case 'element': {
        const getElement = Command.compileElement(element!)
        const type = Enum.getValue(eventType!) || eventType!
        return () => {
          Command.stopActiveEventsByType(getElement()?.updaters, type)
          return true
        }
      }
    }
  }

  /** 注册事件 */
  protected registerEvent({target, actor, element, operation, type, priority, tag, commands}: {
    target: 'global' | 'actor' | 'element'
    tag?: string | VariableGetter
    actor?: ActorGetter
    element?: ElementGetter
    operation: 'register' | 'unregister' | 'reset'
    type?: string
    priority?: boolean
    commands?: CommandDataList
  }): CommandFunction {
    switch (target) {
      case 'global':
        switch (operation) {
          case 'register': {
            let getTag: () => string
            if (tag) {
              getTag = Command.compileString(tag)
            } else {
              const tag = GUID.generate64bit()
              getTag = () => tag
            }
            const commandList = Command.compileIndependent(commands!)
            commandList.type = type!
            commandList.enabled = true
            commandList.priority = priority ?? false
            return () => {
              const copy = Object.create(commandList) as CommandFunctionList
              copy.inheritance = CurrentEvent
              EventManager.register(getTag(), type!, copy)
              return true
            }
          }
          case 'unregister': {
            const getTag = Command.compileString(tag!)
            return () => {
              EventManager.unregister(getTag())
              return true
            }
          }
          case 'reset':
            return () => {
              EventManager.unregisterAll()
              return true
            }
        }
      case 'actor':
        switch (operation) {
          case 'register': {
            const getActor = Command.compileActor(actor!)
            const commandList = Command.compileIndependent(commands!)
            commandList.type = type!
            return () => {
              const copy = Object.create(commandList) as CommandFunctionList
              copy.inheritance = CurrentEvent
              getActor()?.register(type!, copy)
              return true
            }
          }
          case 'unregister': {
            const getActor = Command.compileActor(actor!)
            return () => {
              getActor()?.unregister(type!)
              return true
            }
          }
          case 'reset': {
            const getActor = Command.compileActor(actor!)
            return () => {
              getActor()?.unregisterAll()
              return true
            }
          }
        }
      case 'element':
        switch (operation) {
          case 'register': {
            const getElement = Command.compileElement(element!)
            const commandList = Command.compileIndependent(commands!)
            commandList.type = type!
            return () => {
              const copy = Object.create(commandList) as CommandFunctionList
              copy.inheritance = CurrentEvent
              getElement()?.register(type!, copy)
              return true
            }
          }
          case 'unregister': {
            const getElement = Command.compileElement(element!)
            return () => {
              getElement()?.unregister(type!)
              return true
            }
          }
          case 'reset': {
            const getElement = Command.compileElement(element!)
            return () => {
              getElement()?.unregisterAll()
              return true
            }
          }
        }
    }
  }

  /** 设置事件 */
  protected setEvent({operation, variable, eventId, choiceIndex}: {
    operation: string
    variable?: VariableGetter
    eventId?: string
    choiceIndex?: number
  }): CommandFunction {
    switch (operation) {
      case 'stop-propagation':
        return () => {
          if (CurrentEvent.bubble !== false) {
            Input.bubbles.stop()
          }
          return true
        }
      case 'prevent-scene-input-events':
        return () => {
          Scene.preventInput()
          return true
        }
      case 'restore-scene-input-events':
        return () => {
          Scene.restoreInput()
          return true
        }
      case 'pause': {
        const setter = Command.compileVariable(variable!, Attribute.OBJECT_SET)
        return () => {
          setter(CurrentEvent)
          return CurrentEvent.pause()
        }
      }
      case 'continue': {
        const getter = Command.compileVariable(variable!, Attribute.OBJECT_GET)
        const setter = Command.compileVariable(variable!, Attribute.OBJECT_SET)
        return () => {
          const event = getter()
          if (event instanceof EventHandler) {
            event.continue()
            setter(undefined)
          }
          return true
        }
      }
      case 'enable':
        return () => {
          EventManager.enable(eventId!)
          return true
        }
      case 'disable':
        return () => {
          EventManager.disable(eventId!)
          return true
        }
      case 'highest-priority':
        return () => {
          EventManager.setToHighestPriority(eventId!)
          return true
        }
      case 'goto-choice-branch': {
        const getIndex = Command.compileNumber(choiceIndex!)
        return () => {
          Command.choiceIndex = getIndex()
          return true
        }
      }
    }
    throw new Error('Compiling Error')
  }

  /** 过渡 */
  protected transition({variable, start, end, easingId, duration, commands}: {
    variable: VariableGetter
    start: number | VariableGetter
    end: number | VariableGetter
    easingId: string
    duration: number | VariableGetter
    commands: CommandDataList
  }): CommandFunction | null {
    if (commands.length === 0) {
      return null
    }
    const context = Command.stack.get()
    const nextCommands = context.commands
    const nextIndex = context.index + 1
    const getStart = Command.compileNumber(start)
    const getEnd = Command.compileNumber(end)
    const getDuration = Command.compileNumber(duration)
    const setNumber = Command.compileVariable(variable, Attribute.NUMBER_SET)
    const setVariable: CommandFunction = () => {
      const transition = CurrentEvent.transitions![0]
      transition.elapsed -= CurrentEvent.timer!.duration
      const {start, end, duration} = transition
      const easing = Easing.get(easingId)
      const time = easing.get(transition.elapsed / duration)
      const value = start * (1 - time) + end * time
      setNumber(value)
      return true
    }
    const checkLoopCond = () => {
      const {elapsed, duration} = CurrentEvent.transitions![0]
      if (elapsed < duration) {
        CommandIndex = 0
        return CurrentEvent.wait(0)
      } else {
        CurrentEvent.transitions!.shift()
        CommandList = nextCommands
        CommandIndex = nextIndex
        return true
      }
    }
    const loopCommands = Command.compile([setVariable, ...commands] as CommandDataList, checkLoopCond)
    return () => {
      const duration = getDuration()
      if (duration > 0) {
        if (!CurrentEvent.transitions) {
          CurrentEvent.transitions = []
        }
        CurrentEvent.transitions.unshift({
          elapsed: 0,
          start: getStart(),
          end: getEnd(),
          duration: duration,
        })
        const timer = CurrentEvent.getTimer()
        timer.duration = 0
        CommandList = loopCommands
        CommandIndex = 0
      }
      return true
    }
  }

  /** 指令块 */
  protected block({note, asynchronous, commands}: {
    note: string,
    asynchronous: boolean,
    commands: CommandDataList,
  }): CommandFunction | CommandFunctionList {
    // 补丁：2025-3-21
    if (asynchronous === undefined) {
      asynchronous = false
    }
    switch (asynchronous) {
      case false: {
        const functions = Command.compile(commands)
        functions.remove(Command.readStack)
        return functions
      }
      case true: {
        const commandList = Command.compileIndependent(commands)
        commandList.type = 'asynchronous'
        return () => {
          const copy = Object.create(commandList) as CommandFunctionList
          copy.inheritance = CurrentEvent
          const mainEvent = CurrentEvent as any
          if (mainEvent[Command.asyncKey] === undefined) {
            mainEvent[Command.asyncKey] = []
            CurrentEvent.onFinish(() => {
              let i = asyncEvents.length
              while (--i >= 0) {
                asyncEvents[i].finish()
              }
            })
          }
          const asyncEvents = mainEvent[Command.asyncKey] as Array<EventHandler>
          const asyncEvent = new EventHandler(copy)
          EventHandler.call(asyncEvent, CurrentEvent.updaters)
          if (!asyncEvent.complete) {
            asyncEvents.push(asyncEvent)
            asyncEvent.onFinish(() => {
              asyncEvents.remove(asyncEvent)
            })
          }
          return true
        }
      }
    }
  }

  /** 插入标签 */
  protected label({name}: {name: string}): null {
    const {commands, index} = this.stack.get()
    this.labels[name] = {commands, index}
    return null
  }

  /** 跳转到标签 */
  protected jumpTo({operation, label}: {
    operation: string
    label: string
  }): CommandFunction {
    switch (operation) {
      case 'jump':
      case 'save-jump':
        const {commands, index} = this.stack.get()
        this.jumps.push({operation, label, commands, index})
        return Command.skip
      case 'return':
        return () => {
          const {savedCommands, savedIndex} = CurrentEvent
          if (savedCommands !== undefined) {
            CurrentEvent.savedCommands = undefined
            CurrentEvent.savedIndex = undefined
            CommandList = savedCommands
            CommandIndex = savedIndex!
          }
          return true
        }
    }
    throw new Error('Compiling Error')
  }

  /** 等待 */
  protected wait({duration}: {duration: number | VariableGetter}): CommandFunction {
    switch (typeof duration) {
      case 'number':
        return () => CurrentEvent.wait(duration)
      case 'object': {
        const getDuration = Command.compileNumber(duration)
        return () => CurrentEvent.wait(getDuration())
      }
    }
  }

  /** 创建元素 */
  protected createElement({operation, parent, uiId, presetId}: {
    operation: string
    parent?: ElementGetter
    uiId?: string
    presetId?: string
  }): CommandFunction {
    switch (operation) {
      case 'append-all-to-root':
        return () => {
          UI.root.appendChildren(UI.load(uiId!))
          return true
        }
      case 'append-one-to-root':
        return () => {
          try {UI.add(presetId!)}
          catch (error) {console.warn(error)}
          return true
        }
      case 'append-all-to-element': {
        const getElement = Command.compileElement(parent!)
        return () => {
          getElement()?.appendChildren(UI.load(uiId!))
          return true
        }
      }
      case 'append-one-to-element': {
        const getElement = Command.compileElement(parent!)
        return () => {
          try {getElement()?.appendChild(UI.createElement(presetId!))}
          catch (error) {console.warn(error)}
          return true
        }
      }
    }
    throw new Error('Compiling Error')
  }

  /** 设置图像 */
  protected setImage({element, properties}: {
    element: ElementGetter
    properties: Array<{key: string, value: any}>
  }): CommandFunction {
    const method = this.setImage as any
    if (!method.clipMap) {
      method.clipMap = {
        'clip-0': true,
        'clip-1': true,
        'clip-2': true,
        'clip-3': true,
      }
    }
    const getElement = Command.compileElement(element)
    for (const property of properties) {
      if (typeof property.value === 'object') {
        property.value = Command.compileNumber(property.value)
      }
    }
    return () => {
      const element = getElement()
      if (element instanceof ImageElement) {
        for (let {key, value} of properties) {
          if (typeof value === 'function') {
            value = value()
          }
          if (method.clipMap[key]) {
            element.clip[parseInt(key[5])] = value
            continue
          }
          // @ts-ignore
          element[key] = value
        }
      }
      return true
    }
  }

  /** 加载图像 */
  protected loadImage({element, type, actor, skill, state, equipment, item, key, variable}: {
    element: ElementGetter
    type: string
    actor?: ActorGetter
    skill?: SkillGetter
    state?: StateGetter
    equipment?: EquipmentGetter
    item?: ItemGetter
    key?: string | VariableGetter
    variable?: VariableGetter
  }): CommandFunction {
    const method = this.loadImage as any
    let {setImageClip} = method
    if (!setImageClip) {
      setImageClip = method.setImageClip = (element?: ImageElement, object?: any) => {
        if (element instanceof ImageElement && object) {
          element.setImageClip(object.icon ?? object.portrait, object.clip)
          element.resize()
        }
      }
    }
    const getElement = Command.compileElement(element)
    switch (type) {
      case 'actor-portrait': {
        const getActor = Command.compileActor(actor!)
        return () => {
          setImageClip(getElement(), getActor())
          return true
        }
      }
      case 'skill-icon': {
        const getSkill = Command.compileSkill(skill!)
        return () => {
          setImageClip(getElement(), getSkill())
          return true
        }
      }
      case 'state-icon': {
        const getState = Command.compileState(state!)
        return () => {
          setImageClip(getElement(), getState())
          return true
        }
      }
      case 'equipment-icon': {
        const getEquipment = Command.compileEquipment(equipment!)
        return () => {
          setImageClip(getElement(), getEquipment())
          return true
        }
      }
      case 'item-icon': {
        const getItem = Command.compileItem(item!)
        return () => {
          setImageClip(getElement(), getItem())
          return true
        }
      }
      case 'shortcut-icon': {
        const getActor = Command.compileActor(actor!)
        const getKey = Command.compileEnumValue(key!)
        return () => {
          setImageClip(getElement(), getActor()?.shortcut.get(getKey()))
          return true
        }
      }
      case 'base64': {
        const getBase64 = Command.compileVariable(variable!, Attribute.STRING_GET)
        return () => {
          const base64 = getBase64()
          const element = getElement()
          if (typeof base64 === 'string' && element instanceof ImageElement) {
            element.loadBase64(base64)
          }
          return true
        }
      }
    }
    throw new Error('Compiling Error')
  }

  /** 改变图像色调 */
  protected tintImage({element, mode, tint, easingId, duration, wait}: {
    element: ElementGetter
    mode: string
    tint: ImageTint
    easingId: string
    duration: number
    wait: boolean
  }): CommandFunction {
    const getElement = Command.compileElement(element)
    const tintProps: HashMap<number> = {}
    switch (mode) {
      case 'full':
        tintProps.red = tint[0]
        tintProps.green = tint[1]
        tintProps.blue = tint[2]
        tintProps.gray = tint[3]
        break
      case 'rgb':
        tintProps.red = tint[0]
        tintProps.green = tint[1]
        tintProps.blue = tint[2]
        break
      case 'gray':
        tintProps.gray = tint[3]
        break
    }
    return () => {
      const element = getElement()
      if (element instanceof ImageElement) {
        element.setTint(tintProps, easingId, duration)
        if (wait && duration > 0) {
          return CurrentEvent.wait(duration)
        }
      }
      return true
    }
  }

  /** 设置文本 */
  protected setText({element, properties}: {
    element: ElementGetter
    properties: Array<{key: string, value: any}>
  }): CommandFunction {
    const getElement = Command.compileElement(element)
    const variables: Array<{key: string, value: any}> = []
    const constants: Array<any> = []
    for (const property of properties) {
      switch (property.key) {
        case 'content': {
          const getter = Command.compileTextContent(property.value)
          // @ts-ignore
          if (!getter.constant) {
            variables.push({
              key: property.key,
              value: getter,
            })
            continue
          }
          // 如果内容是常量，进入默认分支
        }
        default:
          constants.push(property)
          continue
      }
    }
    // 对单属性变量进行优化
    if (variables.length === 1 && constants.length === 0) {
      const {key, value} = variables[0]
      return () => {
        const element = getElement()
        if (element instanceof TextElement) {
          // @ts-ignore
          element[key] = value()
        }
        return true
      }
    }
    // 对单属性常量进行优化
    if (variables.length === 0 && constants.length === 1) {
      const {key, value} = constants[0]
      return () => {
        const element = getElement()
        if (element instanceof TextElement) {
          // @ts-ignore
          element[key] = value
        }
        return true
      }
    }
    return () => {
      const element = getElement()
      if (element instanceof TextElement) {
        for (const property of variables) {
          // @ts-ignore
          element[property.key] = property.value()
        }
        for (const property of constants) {
          // @ts-ignore
          element[property.key] = property.value
        }
      }
      return true
    }
  }

  /** 设置文本框 */
  protected setTextBox({element, properties}: {
    element: ElementGetter
    properties: Array<{key: string, value: any}>
  }): CommandFunction {
    const getElement = Command.compileElement(element)
    for (const property of properties) {
      switch (property.key) {
        case 'text':
          if (typeof property.value === 'object') {
            property.value = Command.compileString(property.value)
          }
          continue
        case 'number':
        case 'min':
        case 'max':
          if (typeof property.value === 'object') {
            property.value = Command.compileNumber(property.value)
          }
          continue
      }
    }
    return () => {
      const element = getElement()
      if (element instanceof TextBoxElement) {
        for (let {key, value} of properties) {
          if (typeof value === 'function') {
            value = value()
          }
          // @ts-ignore
          element[key] = value
        }
      }
      return true
    }
  }

  /** 设置对话框 */
  protected setDialogBox({element, properties}: {
    element: ElementGetter
    properties: Array<{key: string, value: any}>
  }): CommandFunction {
    const getElement = Command.compileElement(element)
    const variables: Array<{key: string, value: any}> = []
    const constants: Array<any> = []
    for (const property of properties) {
      switch (property.key) {
        case 'content': {
          const getter = Command.compileTextContent(property.value)
          // @ts-ignore
          if (!getter.constant) {
            variables.push({
              key: property.key,
              value: getter,
            })
            continue
          }
          // 如果内容是常量，进入默认分支
        }
        default:
          constants.push(property)
          continue
      }
    }
    return () => {
      const element = getElement()
      if (element instanceof DialogBoxElement) {
        for (const property of variables) {
          // @ts-ignore
          element[property.key] = property.value()
        }
        for (const property of constants) {
          // @ts-ignore
          element[property.key] = property.value
        }
      }
      return true
    }
  }

  /** 控制对话框 */
  protected controlDialog({element, operation}: {
    element: ElementGetter
    operation: string
  }): CommandFunction {
    const method = this.controlDialog as any
    if (!method.methodMap) {
      method.methodMap = {
        'pause': 'pause',
        'continue': 'continue',
        'print-immediately': 'printImmediately',
        'print-next-page': 'printNextPage',
      }
    }
    const getElement = Command.compileElement(element)
    const methodName = method.methodMap[operation]
    return () => {
      const element = getElement()
      if (element instanceof DialogBoxElement) {
        // @ts-ignore
        element[methodName]()
      }
      return true
    }
  }

  /** 设置进度条 */
  protected setProgressBar({element, properties}: {
    element: ElementGetter
    properties: Array<{key: string, value: any}>
  }): CommandFunction {
    const method = this.setProgressBar as any
    if (!method.initialized) {
      method.initialized = true
      method.clipMap = {
        'clip-0': true,
        'clip-1': true,
        'clip-2': true,
        'clip-3': true,
      }
      method.colorMap = {
        'color-0': true,
        'color-1': true,
        'color-2': true,
        'color-3': true,
      }
    }
    const getElement = Command.compileElement(element)
    for (const property of properties) {
      if (typeof property.value === 'object') {
        property.value = Command.compileNumber(property.value)
      }
    }
    return () => {
      const element = getElement()
      if (element instanceof ProgressBarElement) {
        for (let {key, value} of properties) {
          if (typeof value === 'function') {
            value = value()
          }
          if (method.clipMap[key]) {
            element.clip[parseInt(key[5])] = value
            continue
          }
          if (method.colorMap[key]) {
            element.color[parseInt(key[6])] = value
            continue
          }
          // @ts-ignore
          element[key] = value
        }
      }
      return true
    }
  }

  /** 设置按钮 */
  protected setButton({element, properties}: {
    element: ElementGetter
    properties: Array<{key: string, value: any}>
  }): CommandFunction {
    const method = this.setButton as any
    if (!method.initialized) {
      method.initialized = true
      method.arrayMap = {
        'normalClip': true,
        'hoverClip': true,
        'activeClip': true,
        'normalTint': true,
        'hoverTint': true,
        'activeTint': true,
      }
    }
    const getElement = Command.compileElement(element)
    const variables: Array<{key: string, value: any}> = []
    const constants: Array<any> = []
    for (const property of properties) {
      switch (property.key) {
        case 'content': {
          const getter = Command.compileTextContent(property.value)
          // @ts-ignore
          if (!getter.constant) {
            variables.push({
              key: property.key,
              value: getter,
            })
            continue
          }
          // 如果内容是常量，进入默认分支
        }
        default:
          constants.push(property)
          continue
      }
    }
    // 对单属性变量进行优化
    if (variables.length === 1 && constants.length === 0) {
      const {key, value} = variables[0]
      return () => {
        const element = getElement()
        if (element instanceof ButtonElement) {
          // @ts-ignore
          element[key] = value()
        }
        return true
      }
    }
    // 对单属性常量进行优化
    if (variables.length === 0 && constants.length === 1) {
      const {key, value} = constants[0]
      return () => {
        const element = getElement()
        if (element instanceof ButtonElement) {
          if (method.arrayMap[key]) {
            // @ts-ignore
            Array.fill(element[key], value)
          } else {
            // @ts-ignore
            element[key] = value
          }
        }
        return true
      }
    }
    return () => {
      const element = getElement()
      if (element instanceof ButtonElement) {
        for (const property of variables) {
          // @ts-ignore
          element[property.key] = property.value()
        }
        for (const property of constants) {
          if (element instanceof ButtonElement) {
            if (method.arrayMap[property.key]) {
              // @ts-ignore
              element[property.key].set(property.value)
            } else {
              // @ts-ignore
              element[property.key] = property.value
            }
          }
        }
      }
      return true
    }
  }

  /** 控制按钮 */
  protected controlButton({element, operation}: {
    element: ElementGetter
    operation: string
  }): CommandFunction {
    switch (operation) {
      case 'select-default':
        return () => {
          UI.selectDefaultButton()
          return true
        }
    }
    const getElement = Command.compileElement(element)
    return () => {
      const element = getElement()
      if (element instanceof ButtonElement) {
        switch (operation) {
          case 'select':
            UI.selectButton(element)
            break
          case 'hover-mode':
            element.mode = 'hover'
            break
          case 'active-mode':
            element.mode = 'active'
            break
          case 'normal-mode':
            element.mode = 'normal'
            break
        }
      }
      return true
    }
  }

  /** 设置动画 */
  protected setAnimation({element, properties}: {
    element: ElementGetter
    properties: Array<{key: string, value: any}>
  }): CommandFunction {
    const getElement = Command.compileElement(element)
    for (const property of properties) {
      switch (property.key) {
        case 'animation-from-actor':
          property.value = Command.compileActor(property.value)
          continue
        case 'motion':
          property.value = Enum.getValue(property.value)
          continue
        case 'angle':
        case 'frame':
          if (typeof property.value === 'object') {
            property.value = Command.compileNumber(property.value, 0, 0, 10000)
          }
          continue
      }
    }
    return () => {
      const element = getElement()
      if (element instanceof AnimationElement) {
        for (let {key, value} of properties) {
          switch (key) {
            case 'animation-from-actor': {
              const actor = value()
              if (actor instanceof Actor) {
                element.loadActorAnimation(actor)
              }
              continue
            }
            default:
              if (typeof value === 'function') {
                value = value()
              }
              // @ts-ignore
              element[key] = value
              continue
          }
        }
      }
      return true
    }
  }

  /** 设置视频 */
  protected setVideo({element, properties}: {
    element: ElementGetter
    properties: Array<{key: string, value: any}>
  }): CommandFunction {
    const getElement = Command.compileElement(element)
    for (const property of properties) {
      switch (property.key) {
        case 'playbackRate':
          if (typeof property.value === 'object') {
            property.value = Command.compileNumber(property.value, 0, 0, 4)
          }
          break
      }
    }
    return () => {
      const element = getElement()
      if (element instanceof VideoElement) {
        for (let {key, value} of properties) {
          if (typeof value === 'function') {
            value = value()
          }
          // @ts-ignore
          element[key] = value
        }
      }
      return true
    }
  }

  /** 设置窗口 */
  protected setWindow({element, properties}: {
    element: ElementGetter
    properties: Array<{key: string, value: any}>
  }): CommandFunction {
    const getElement = Command.compileElement(element)
    for (const property of properties) {
      switch (property.key) {
        case 'scrollX':
        case 'scrollY':
        case 'gridWidth':
        case 'gridHeight':
        case 'gridGapX':
        case 'gridGapY':
        case 'paddingX':
        case 'paddingY':
          if (typeof property.value === 'object') {
            property.value = Command.compileNumber(property.value, 0, 0, 10000)
          }
          continue
      }
    }
    return () => {
      const element = getElement()
      if (element instanceof WindowElement) {
        for (let {key, value} of properties) {
          if (typeof value === 'function') {
            value = value()
          }
          // @ts-ignore
          element[key] = value
        }
      }
      return true
    }
  }

  /** 等待视频结束 */
  protected waitForVideo({element}: {element: ElementGetter}): CommandFunction {
    const getElement = Command.compileElement(element)
    return () => {
      const element = getElement()
      if (element instanceof VideoElement && element.state !== 'ended') {
        const event = CurrentEvent
        element.onEnded(() => {
          event.continue()
        })
        return CurrentEvent.pause()
      }
      return true
    }
  }

  /** 设置元素 */
  protected setElement({element, operation}: {
    element: ElementGetter
    operation: string
  }): CommandFunction {
    const getElement = Command.compileElement(element)
    switch (operation) {
      case 'hide':
        return () => {
          getElement()?.hide()
          return true
        }
      case 'show':
        return () => {
          getElement()?.show()
          return true
        }
      case 'disable-pointer-events':
        return () => {
          const element = getElement()
          if (element) {
            element.pointerEvents = 'disabled'
          }
          return true
        }
      case 'enable-pointer-events':
        return () => {
          const element = getElement()
          if (element) {
            element.pointerEvents = 'enabled'
          }
          return true
        }
      case 'skip-pointer-events':
        return () => {
          const element = getElement()
          if (element) {
            element.pointerEvents = 'skipped'
          }
          return true
        }
      case 'move-to-first':
        return () => {
          getElement()?.moveToIndex(0)
          return true
        }
      case 'move-to-last':
        return () => {
          getElement()?.moveToIndex(-1)
          return true
        }
    }
    throw new Error('Compiling Error')
  }

  /** 嵌套元素 */
  protected nestElement({parent, child}: {
    parent: ElementGetter
    child: ElementGetter
  }): CommandFunction {
    const getParent = Command.compileElement(parent)
    const getChild = Command.compileElement(child)
    return () => {
      const parent = getParent()
      const child = getChild()
      if (parent && child && parent !== child) {
        child.remove()
        parent.appendChild(child)
      }
      return true
    }
  }

  /** 移动元素 */
  protected moveElement = function (IIFE) {
    const compileProperties = (properties: Array<{key: string, value: any}>): () => HashMap<any> => {
      const propMap: HashMap<number> = {}
      for (const property of properties) {
        if (typeof property.value === 'object') {
          const length = properties.length
          const keys: Array<string> = new Array(length)
          const getters: Array<() => number> = new Array(length)
          for (let i = 0; i < length; i++) {
            const {key, value} = properties[i]
            keys[i] = key
            getters[i] = Command.compileNumber(value)
          }
          return () => {
            for (let i = 0; i < length; i++) {
              propMap[keys[i]] = getters[i]()
            }
            return propMap
          }
        }
      }
      for (const {key, value} of properties) {
        propMap[key] = value
      }
      return () => propMap
    }
    /** 移动元素 */
    return function ({element, properties, easingId, duration, wait}: {
      element: ElementGetter
      properties: Array<{key: string, value: any}>
      easingId: string
      duration: number
      wait: boolean
    }): CommandFunction {
      const getElement = Command.compileElement(element)
      const getPropMap = compileProperties(properties)
      return () => {
        const element = getElement()
        if (element) {
          element.move(getPropMap(), easingId, duration)
          if (wait && duration > 0) {
            return CurrentEvent.wait(duration)
          }
        }
        return true
      }
    }
  }()

  /** 删除元素 */
  protected deleteElement({operation, element}: {
    operation: string
    element: ElementGetter
  }): CommandFunction {
    switch (operation) {
      case 'delete-element': {
        const getElement = Command.compileElement(element)
        return () => {
          getElement()?.destroy()
          return true
        }
      }
      case 'delete-children': {
        const getElement = Command.compileElement(element)
        return () => {
          getElement()?.clear()
          return true
        }
      }
      case 'delete-all':
        return () => {
          UI.reset()
          return true
        }
    }
    throw new Error('Compiling Error')
  }

  /** 设置指针事件根元素 */
  protected setPointerEventRoot({operation, element}: {
    operation: string
    element?: ElementGetter
  }): CommandFunction {
    // 补丁：2023-3-19
    if (operation === 'set') {
      operation = 'add'
    }
    switch (operation) {
      case 'add': {
        const getElement = Command.compileElement(element!)
        return () => {
          const element = getElement()
          if (element) {
            UI.addPointerEventRoot(element)
          }
          return true
        }
      }
      case 'remove': {
        const getElement = Command.compileElement(element!)
        return () => {
          const element = getElement()
          if (element) {
            UI.removePointerEventRoot(element)
          }
          return true
        }
      }
      case 'remove-latest':
        return () => {
          UI.removeLatestPointerEventRoot()
          return true
        }
      case 'reset':
        return () => {
          UI.resetPointerEventRoots()
          return true
        }
    }
    throw new Error('Compiling Error')
  }

  /** 设置焦点 */
  protected setFocus({operation, element, mode, cancelable}: {
    operation: string
    element?: ElementGetter
    mode?: FocusMode
    cancelable?: boolean
  }): CommandFunction {
    switch (operation) {
      case 'add': {
        // 补丁：2023-3-21
        if (mode === undefined) {
          mode = 'control-child-buttons'
        }
        const getElement = Command.compileElement(element!)
        return () => {
          const element = getElement()
          if (element) {
            element.focusMode = mode
            element.focusCancelable = cancelable
            UI.addFocus(element)
          }
          return true
        }
      }
      case 'remove': {
        const getElement = Command.compileElement(element!)
        return () => {
          const element = getElement()
          if (element) {
            UI.removeFocus(element)
          }
          return true
        }
      }
      case 'remove-latest':
        return () => {
          UI.removeLatestFocus()
          return true
        }
      case 'reset':
        return () => {
          UI.resetFocuses()
          return true
        }
    }
    throw new Error('Compiling Error')
  }

  /** 创建对象 */
  protected createObject({presetId, position}: {
    presetId: string
    position: PositionGetter
  }): CommandFunction {
    const getPoint = Command.compilePosition(position)
    return () => {
      let fn = Command.skip
      const preset = Scene.presets[presetId]
      switch (preset?.class) {
        case 'actor':
          fn = () => {
            const actor = Scene.binding?.createActor(preset)
            const point = getPoint(preset)
            if (actor && point) {
              actor.setPosition(point.x, point.y)
            }
            return true
          }
          break
        case 'animation':
          fn = () => {
            const animation = Scene.binding?.createAnimation(preset)
            const point = getPoint(preset)
            if (animation && point) {
              animation.x = point.x
              animation.y = point.y
            }
            return true
          }
          break
        case 'particle':
          fn = () => {
            const particle = Scene.binding?.createParticle(preset)
            const point = getPoint(preset)
            if (particle && point) {
              particle.x = point.x
              particle.y = point.y
            }
            return true
          }
          break
        case 'region':
          fn = () => {
            const region = Scene.binding?.createRegion(preset)
            const point = getPoint(preset)
            if (region && point) {
              region.x = point.x
              region.y = point.y
            }
            return true
          }
          break
        case 'light':
          fn = () => {
            const light = Scene.binding?.createLight(preset)
            const point = getPoint(preset)
            if (light && point) {
              light.x = point.x
              light.y = point.y
            }
            return true
          }
          break
        case 'parallax':
          fn = () => {
            const parallax = Scene.binding?.createParallax(preset)
            const point = getPoint(preset)
            if (parallax && point) {
              parallax.x = point.x
              parallax.y = point.y
            }
            return true
          }
          break
        case 'tilemap':
          fn = () => {
            const tilemap = Scene.binding?.createTilemap(preset)
            const point = getPoint(preset)
            if (tilemap && point) {
              tilemap.x = point.x
              tilemap.y = point.y
            }
            return true
          }
          break
      }
      // 编译时不能确定预设对象数据已加载，因此使用运行时编译
      return (CommandList[CommandIndex - 1] = fn)()
    }
  }

  /** 移动光源 */
  protected moveLight = function (IIFE) {
    const ranges: HashMap<[number, number]> = {
      range: [0, 128],
      intensity: [0, 1],
      anchorX: [0, 1],
      anchorY: [0, 1],
      width: [0, 128],
      height: [0, 128],
      red: [0, 255],
      green: [0, 255],
      blue: [0, 255],
    }
    const compileProperties = (properties: Array<{key: string, value: any}>) => {
      const propMap: HashMap<number> = {}
      for (const property of properties) {
        if (typeof property.value === 'object') {
          const length = properties.length
          const keys: Array<string> = new Array(length)
          const getters: Array<() => number> = new Array(length)
          for (let i = 0; i < length; i++) {
            const {key, value} = properties[i]
            const range = ranges[key] ?? Array.empty
            keys[i] = key
            getters[i] = Command.compileNumber(value, 0, ...range)
          }
          return () => {
            for (let i = 0; i < length; i++) {
              propMap[keys[i]] = getters[i]()
            }
            return propMap
          }
        }
      }
      for (const {key, value} of properties) {
        propMap[key] = value
      }
      return () => propMap
    }
    /** 移动光源 */
    return function ({light, properties, easingId, duration, wait}: {
      light: LightGetter
      properties: Array<{key: string, value: any}>
      easingId: string
      duration: number
      wait: boolean
    }): CommandFunction {
      const getLight = Command.compileLight(light)
      const getPropMap = compileProperties(properties)
      return () => {
        const light = getLight()
        if (light) {
          light.move(getPropMap(), easingId, duration)
          if (wait && duration > 0) {
            return CurrentEvent.wait(duration)
          }
        }
        return true
      }
    }
  }()

  /** 删除对象 */
  protected deleteObject({object}: {object: ObjectGetter}): CommandFunction {
    const getObject = Command.compileObject(object)
    return () => {
      getObject()?.destroyAsync()
      return true
    }
  }

  /** 设置状态 */
  protected setState({state, operation, time}: {
    state: StateGetter
    operation: string
    time: number | VariableGetter
  }): CommandFunction {
    const getState = Command.compileState(state)
    const getTime = Command.compileNumber(time)
    switch (operation) {
      case 'set-time':
        return () => {
          getState()?.setTime(getTime())
          return true
        }
      case 'increase-time':
        return () => {
          getState()?.increaseTime(getTime())
          return true
        }
      case 'decrease-time':
        return () => {
          getState()?.decreaseTime(getTime())
          return true
        }
    }
    throw new Error('Compiling Error')
  }

  /** 播放动画 */
  protected playAnimation({mode, position, actor, animationId, motion, rotatable, priority, offsetY, angle, speed, wait}: {
    mode: string
    position?: PositionGetter
    actor?: ActorGetter
    animationId: string
    motion: string
    rotatable: boolean
    priority: number
    offsetY: number
    angle: number | VariableGetter
    speed: number | VariableGetter
    wait: boolean
  }): CommandFunction | null {
    let getPoint: () => Point | undefined
    switch (mode) {
      case 'position':
        getPoint = Command.compilePosition(position!)
        break
      case 'actor':
        getPoint = Command.compileActor(actor!)
        break
    }
    const getAngle = Command.compileNumber(angle)
    const getSpeed = Command.compileNumber(speed, 1, 0.1, 10)
    const data = Data.animations[animationId]
    const motionName = Enum.getValue(motion)
    return !data ? null : () => {
      const point = getPoint()
      if (point) {
        const animation = new SceneAnimation(data)
        if (mode === 'position') {
          animation.setPosition({x: point.x, y: point.y})
        } else {
          animation.setPosition(point)
        }
        if (animation.setMotion(motionName)) {
          animation.rotatable = rotatable
          animation.priority = priority
          animation.offsetY = offsetY
          animation.speed = getSpeed()
          animation.setAngle(Math.radians(getAngle()))
          animation.onFinish(() => {
            animation.destroy()
            Callback.push(() => {
              Scene.animation.remove(animation)
            })
          })
          Scene.animation.append(animation)
          if (wait) {
            const event = CurrentEvent
            animation.onFinish(() => {
              event.continue()
            })
            return CurrentEvent.pause()
          }
        }
      }
      return true
    }
  }

  /** 设置对象动画 */
  protected setObjectAnimation({sort, object, operation, tint, opacity, offsetY, rotation, easingId, duration, wait}: {
    sort: 'actor' | 'components' | 'trigger' | 'animation'
    object: ActorGetter | TriggerGetter | ObjectGetter
    operation: 'set-tint' | 'set-rgb' | 'set-gray' | 'set-opacity' | 'set-offsetY' | 'set-rotation'
    tint?: ImageTint
    opacity?: number | VariableGetter
    offsetY?: number | VariableGetter
    rotation: number | VariableGetter
    easingId: string
    duration: number
    wait: boolean
  }): CommandFunction {
    let tintProps: HashMap<number>
    let getOpacity: () => number
    let getOffsetY: () => number
    let getRotation: () => number
    switch (operation) {
      case 'set-tint':
        tintProps = {
          red: tint![0],
          green: tint![1],
          blue: tint![2],
          gray: tint![3],
        }
        break
      case 'set-rgb':
        tintProps = {
          red: tint![0],
          green: tint![1],
          blue: tint![2],
        }
        break
      case 'set-gray':
        tintProps = {
          gray: tint![3],
        }
        break
      case 'set-opacity':
        getOpacity = Command.compileNumber(opacity!, 1, 0, 1)
        break
      case 'set-offsetY':
        getOffsetY = Command.compileNumber(offsetY!, 0, -10000, 10000)
        break
      case 'set-rotation': {
        const getDegrees = Command.compileNumber(rotation!, 0, -10000, 10000)
        getRotation = () => Math.radians(getDegrees())
        break
      }
    }
    switch (sort) {
      case 'actor': {
        const getActor = Command.compileActor(object as ActorGetter)
        return () => {
          const actor = getActor()
          if (actor) {
            if (tintProps) {
              actor.setTint(tintProps, easingId, duration)
            } else if (getOpacity) {
              actor.setOpacity(getOpacity(), easingId, duration)
            } else if (getOffsetY) {
              actor.setOffsetY(getOffsetY(), easingId, duration)
            } else if (getRotation) {
              actor.setRotation(getRotation(), easingId, duration)
            }
            if (wait && duration > 0) {
              return CurrentEvent.wait(duration)
            }
          }
          return true
        }
      }
      case 'components': {
        const getActor = Command.compileActor(object as ActorGetter)
        return () => {
          const actor = getActor()
          if (actor) {
            if (tintProps) {
              actor.setTintForAll(tintProps, easingId, duration)
            } else if (getOpacity) {
              actor.setOpacityForAll(getOpacity(), easingId, duration)
            } else if (getOffsetY) {
              actor.setOffsetYForAll(getOffsetY(), easingId, duration)
            } else if (getRotation) {
              actor.setRotationForAll(getRotation(), easingId, duration)
            }
            if (wait && duration > 0) {
              return CurrentEvent.wait(duration)
            }
          }
          return true
        }
      }
      case 'trigger': {
        const getTrigger = Command.compileTrigger(object as TriggerGetter)
        return () => {
          const trigger = getTrigger()
          if (trigger) {
            if (tintProps) {
              trigger.setTint(tintProps, easingId, duration)
            } else if (getOpacity) {
              trigger.setOpacity(getOpacity(), easingId, duration)
            } else if (getOffsetY) {
              trigger.setOffsetY(getOffsetY(), easingId, duration)
            } else if (getRotation) {
              trigger.setRotation(getRotation(), easingId, duration)
            }
            if (wait && duration > 0) {
              return CurrentEvent.wait(duration)
            }
          }
          return true
        }
      }
      case 'animation': {
        const getObject = Command.compileObject(object as ObjectGetter)
        return () => {
          const animation = getObject()
          if (animation instanceof SceneAnimation) {
            const updaters = animation.updaters
            if (tintProps) {
              animation.setTint('command-set-tint', updaters, tintProps, easingId, duration)
            } else if (getOpacity) {
              animation.setOpacity('command-set-opacity', updaters, getOpacity(), easingId, duration)
            } else if (getOffsetY) {
              animation.setOffsetY('command-set-offsetY', updaters, getOffsetY(), easingId, duration)
            } else if (getRotation) {
              animation.setRotation('command-set-rotation', updaters, getRotation(), easingId, duration)
            }
            if (wait && duration > 0) {
              return CurrentEvent.wait(duration)
            }
          }
          return true
        }
      }
    }
  }

  /** 播放音频 */
  protected playAudio({type, audio, volume, location}: {
    type: AudioType | 'se-attenuated'
    audio: string
    volume: number
    location?: PositionGetter
  }): CommandFunction {
    switch (type) {
      case 'se-attenuated': {
        const getLocation = Command.compilePosition(location!)
        return () => {
          const location = getLocation()
          if (location) {
            AudioManager.se.playAt(audio, location, volume)
          }
          return true
        }
      }
      default:
        return () => {
          AudioManager[type].play(audio, volume)
          return true
        }
    }
  }

  /** 停止播放音频 */
  protected stopAudio({type}: {type: AudioType | 'all'}): CommandFunction {
    switch (type) {
      case 'all':
        return () => {
          AudioManager.bgm.stop()
          AudioManager.bgs.stop()
          AudioManager.cv.stop()
          AudioManager.se.stop()
          return true
        }
      default:
        return () => {
          AudioManager[type].stop()
          return true
        }
    }
  }

  /** 设置音量 */
  protected setVolume({type, volume, easingId, duration, wait}: {
    type: AudioType
    volume: number | VariableGetter
    easingId: string
    duration: number
    wait: boolean
  }): CommandFunction {
    const getVolume = Command.compileNumber(volume, 0, 0, 1)
    return () => {
      AudioManager[type].setVolume(getVolume(), easingId, duration)
      if (wait && duration > 0) {
        return CurrentEvent.wait(duration)
      }
      return true
    }
  }

  /** 设置声像 */
  protected setPan({type, pan, easingId, duration, wait}: {
    type: AudioType
    pan: number | VariableGetter
    easingId: string
    duration: number
    wait: boolean
  }): CommandFunction {
    const getPan = Command.compileNumber(pan, 0, -1, 1)
    return () => {
      AudioManager[type].setPan(getPan(), easingId, duration)
      if (wait && duration > 0) {
        return CurrentEvent.wait(duration)
      }
      return true
    }
  }

  /** 设置混响 */
  protected setReverb({type, dry, wet, easingId, duration, wait}: {
    type: AudioType
    dry: number
    wet: number
    easingId: string
    duration: number
    wait: boolean
  }): CommandFunction {
    const getDry = Command.compileNumber(dry, 0, 0, 1)
    const getWet = Command.compileNumber(wet, 0, 0, 1)
    return () => {
      AudioManager[type].setReverb(getDry(), getWet(), easingId, duration)
      if (wait && duration > 0) {
        return CurrentEvent.wait(duration)
      }
      return true
    }
  }

  /** 设置循环 */
  protected setLoop({type, loop}: {
    type: Exclude<AudioType, 'se'>
    loop: boolean
  }): CommandFunction {
    return () => {
      AudioManager[type].setLoop(loop)
      return true
    }
  }

  /** 保存音频 */
  protected saveAudio({type}: {type: 'bgm' | 'bgs' | 'cv'}): CommandFunction {
    return () => {
      AudioManager[type].save()
      return true
    }
  }

  /** 恢复音频 */
  protected restoreAudio({type}: {type: 'bgm' | 'bgs' | 'cv'}): CommandFunction {
    return () => {
      AudioManager[type].restore()
      return true
    }
  }

  /** 创建角色 */
  protected createActor({actorId, teamId, position, angle}: {
    actorId: string
    teamId: string
    position: PositionGetter
    angle: number | VariableGetter
  }): CommandFunction | null {
    const getPoint = Command.compilePosition(position)
    const getDegrees = Command.compileNumber(angle)
    const data = Data.actors[actorId]
    return !data ? null : () => {
      if (Scene.binding !== null) {
        const point = getPoint()
        if (point) {
          const actor = new Actor(data)
          actor.setTeam(teamId)
          actor.setPosition(point.x, point.y)
          actor.updateAngle(Math.radians(getDegrees()))
          Scene.actor.append(actor)
        }
      }
      return true
    }
  }

  /** 移动角色 */
  protected moveActor({actor, mode, angle, destination, wait}: {
    actor: ActorGetter
    mode: string
    angle: number | VariableGetter
    destination: PositionGetter
    wait: boolean
  }): CommandFunction {
    const getActor = Command.compileActor(actor)
    switch (mode) {
      case 'stop':
        return () => {
          getActor()?.navigator.stopMoving()
          return true
        }
      case 'keep': {
        const {radians} = Math
        const getDegrees = Command.compileNumber(angle)
        return () => {
          getActor()?.navigator.moveTowardAngle(radians(getDegrees()))
          return true
        }
      }
      case 'straight': {
        const getPoint = Command.compilePosition(destination)
        return () => {
          const actor = getActor()
          const point = getPoint(actor)
          if (actor && point) {
            actor.navigator.moveTo(point.x, point.y)
            if (wait) {
              const event = CurrentEvent
              actor.navigator.onFinish(() => {
                event.continue()
              })
              return CurrentEvent.pause()
            }
          }
          return true
        }
      }
      case 'navigate':
      case 'navigate-bypass': {
        const getPoint = Command.compilePosition(destination)
        const bypass = mode === 'navigate-bypass'
        return () => {
          const actor = getActor()
          const point = getPoint(actor)
          if (Scene.binding !== null && actor && point) {
            actor.navigator.navigateTo(point.x, point.y, bypass)
            if (wait) {
              const event = CurrentEvent
              actor.navigator.onFinish(() => {
                event.continue()
              })
              return CurrentEvent.pause()
            }
          }
          return true
        }
      }
      case 'teleport': {
        const getPoint = Command.compilePosition(destination)
        return () => {
          const actor = getActor()
          const point = getPoint(actor)
          if (actor && point) {
            actor.setPosition(point.x, point.y)
          }
          return true
        }
      }
    }
    throw new Error('Compiling Error')
  }

  /** 跟随角色 */
  protected followActor({actor, target, mode, minDist, maxDist, offset, vertDist, bufferDist, navigate, bypass, once, wait}: {
    actor: ActorGetter
    target: ActorGetter
    mode: 'circle' | 'rectangle'
    minDist: number
    maxDist: number
    offset?: number
    vertDist?: number
    bufferDist: number
    navigate: boolean
    bypass?: boolean
    once: boolean
    wait: boolean
  }): CommandFunction {
    // 补丁：2023-1-30
    bypass = bypass ?? false
    // 补丁：2025-3-5
    bufferDist = bufferDist ?? 0
    const getActor = Command.compileActor(actor)
    const getTarget = Command.compileActor(target)
    const getMinDist = Command.compileNumber(minDist)
    const getMaxDist = Command.compileNumber(maxDist)
    switch (mode) {
      case 'circle':
        return () => {
          const actor = getActor()
          const target = getTarget()
          if (actor && target && actor !== target) {
            actor.navigator.followCircle(target, getMinDist(), getMaxDist(), offset, bufferDist, navigate, bypass, once)
            if (wait) {
              const event = CurrentEvent
              actor.navigator.onFinish(() => {
                event.continue()
              })
              return CurrentEvent.pause()
            }
          }
          return true
        }
      case 'rectangle':
        return () => {
          const actor = getActor()
          const target = getTarget()
          if (actor && target && actor !== target) {
            actor.navigator.followRectangle(target, getMinDist(), getMaxDist(), vertDist, bufferDist, navigate, bypass, once)
            if (wait) {
              const event = CurrentEvent
              actor.navigator.onFinish(() => {
                event.continue()
              })
              return CurrentEvent.pause()
            }
          }
          return true
        }
    }
  }

  /** 平移角色 */
  protected translateActor({actor, angle, distance, easingId, duration, wait}: {
    actor: ActorGetter
    angle: AngleGetter
    distance: number | VariableGetter
    easingId: string
    duration: number | VariableGetter
    wait: boolean
  }): CommandFunction {
    const getActor = Command.compileActor(actor)
    const getAngle = Command.compileAngle(angle)
    const getDistance = Command.compileNumber(distance)
    const getDuration = Command.compileNumber(duration)
    return () => {
      const actor = getActor()
      if (actor) {
        const radians = getAngle(actor)
        const distance = getDistance()
        const duration = getDuration()
        actor.translate(radians, distance, easingId, duration)
        if (wait && duration > 0) {
          return CurrentEvent.wait(duration)
        }
      }
      return true
    }
  }

  /** 增减仇恨值 */
  protected changeThreat({actor, target, operation, threat}: {
    actor: ActorGetter
    target: ActorGetter
    operation: string
    threat: number | VariableGetter
  }): CommandFunction {
    const method = this.changeThreat as any
    if (!method.operationMap) {
      method.operationMap = {
        increase: 'increaseThreat',
        decrease: 'decreaseThreat',
      }
    }
    const OP = method.operationMap[operation] as 'increaseThreat' | 'decreaseThreat'
    const getActor = Command.compileActor(actor)
    const getTarget = Command.compileActor(target)
    const getThreat = Command.compileNumber(threat)
    return () => {
      const actor = getActor()
      const target = getTarget()
      const threat = getThreat()
      if (actor && target && actor !== target && threat > 0) {
        actor.target[OP](target, threat)
      }
      return true
    }
  }

  /** 设置体重 */
  protected setWeight({actor, weight}: {
    actor: ActorGetter
    weight: number | VariableGetter
  }): CommandFunction {
    const getActor = Command.compileActor(actor)
    const getWeight = Command.compileNumber(weight, 0, 0, 8)
    return () => {
      getActor()?.collider.setWeight(getWeight())
      return true
    }
  }

  /** 设置移动速度 */
  protected setMovementSpeed({actor, property, base, factor}: {
    actor: ActorGetter
    property: 'base' | 'factor' | 'factor-temp'
    base?: number | VariableGetter
    factor?: number | VariableGetter
  }): CommandFunction {
    const getActor = Command.compileActor(actor)
    switch (property) {
      case 'base': {
        const getBase = Command.compileNumber(base!, 0, 0, 32)
        return () => {
          getActor()?.navigator.setMovementSpeed(getBase())
          return true
        }
      }
      case 'factor': {
        const getFactor = Command.compileNumber(factor!, 0, 0, 4)
        return () => {
          getActor()?.navigator.setMovementFactor(getFactor())
          return true
        }
      }
      case 'factor-temp': {
        const getFactor = Command.compileNumber(factor!, 0, 0, 4)
        return () => {
          getActor()?.navigator.setMovementFactorTemp(getFactor())
          return true
        }
      }
    }
  }

  /** 设置角度 */
  protected setAngle({actor, angle, easingId, duration, wait}: {
    actor: ActorGetter
    angle: AngleGetter
    easingId: string
    duration: number | VariableGetter
    wait: boolean
  }): CommandFunction {
    const getActor = Command.compileActor(actor)
    const getAngle = Command.compileAngle(angle)
    const getDuration = Command.compileNumber(duration)
    return () => {
      const actor = getActor()
      if (actor) {
        const radians = getAngle(actor)
        const duration = getDuration()
        actor.setAngle(radians, easingId, duration)
        if (wait && duration > 0) {
          return CurrentEvent.wait(duration)
        }
      }
      return true
    }
  }

  /** 固定角度 */
  protected fixAngle({actor, fixed}: {
    actor: ActorGetter
    fixed: boolean
  }): CommandFunction {
    const getActor = Command.compileActor(actor)
    return () => {
      const actor = getActor()
      if (actor) {
        actor.angleFixed = fixed
      }
      return true
    }
  }

  /** 设置激活状态 */
  protected setActive({actor, active}: {
    actor: ActorGetter
    active: boolean
  }): CommandFunction {
    const getActor = Command.compileActor(actor)
    return () => {
      getActor()?.setActive(active)
      return true
    }
  }

  /** 获取角色 */
  protected getActor({variable, position, area, size, radius, selector, teamId, condition, attribute, divisor, activation, exclusion, exclusionActor, exclusionTeamId, active}: {
    variable: VariableGetter
    position: PositionGetter
    area: 'circle' | 'square'
    size?: number
    radius?: number
    selector: 'enemy' | 'friend' | 'team' | 'any'
    teamId?: string
    condition: 'nearest' | 'farthest' | 'min-attribute-value' | 'max-attribute-value' | 'min-attribute-ratio' | 'max-attribute-ratio' | 'random'
    attribute?: string
    divisor?: string
    activation: 'active' | 'inactive' | 'either'
    exclusion: string
    exclusionActor?: ActorGetter
    exclusionTeamId?: string
    active?: boolean
  }): CommandFunction {
    // 补丁：2023-1-7
    switch (selector) {
      // @ts-ignore
      case 'team-enemy':
        selector = 'enemy'
        break
      // @ts-ignore
      case 'team-friend':
        selector = 'friend'
        break
      // @ts-ignore
      case 'team-member':
        selector = 'team'
        break
    }
    switch (active) {
      case true:
        activation = 'active'
        break
      case false:
        activation = 'either'
        break
    }
    condition = condition ?? 'nearest'
    exclusion = exclusion ?? 'none'
    const setActor = Command.compileVariable(variable, Attribute.OBJECT_SET)
    const getPoint = Command.compilePosition(position)
    let getSize: () => number
    let getRadius: () => number
    let getTeamId: () => string
    let getExclusionActor: () => Actor | undefined
    let getExclusionTeamId: () => string
    if (teamId) {
      getTeamId = Command.compileString(teamId)
    }
    switch (area) {
      case 'square':
        getSize = Command.compileNumber(size!, 0, 0, 512)
        break
      case 'circle':
        getRadius = Command.compileNumber(radius!, 0, 0, 256)
        break
    }
    switch (exclusion) {
      case 'actor':
        getExclusionActor = Command.compileActor(exclusionActor!)
        break
      case 'team':
        getExclusionTeamId = Command.compileString(exclusionTeamId!)
        break
    }
    if (attribute) attribute = Attribute.getKey(attribute)
    if (divisor) divisor = Attribute.getKey(divisor)
    return () => {
      const point = getPoint()
      if (point) {
        setActor(Scene.binding?.getActor({
          x: point.x,
          y: point.y,
          area,
          size: getSize?.(),
          radius: getRadius?.(),
          selector,
          teamId: getTeamId?.(),
          condition,
          attribute: attribute!,
          divisor: divisor!,
          activation,
          exclusionActor: getExclusionActor?.(),
          exclusionTeamId: getExclusionTeamId?.(),
        }))
      }
      return true
    }
  }

  /** 获取多个角色 */
  protected getMultipleActors({variable, position, area, width, height, radius, selector, teamId, activation}: {
    variable: VariableGetter
    position: PositionGetter
    area: 'rectangle' | 'circle'
    width?: number
    height?: number
    radius?: number
    selector: 'enemy' | 'friend' | 'team' | 'any'
    teamId?: string
    activation: 'active' | 'inactive' | 'either'
  }): CommandFunction {
    const setActor = Command.compileVariable(variable, Attribute.OBJECT_SET)
    const getPoint = Command.compilePosition(position)
    let getWidth: () => number
    let getHeight: () => number
    let getRadius: () => number
    let getTeamId: () => string
    if (teamId) {
      getTeamId = Command.compileString(teamId)
    }
    switch (area) {
      case 'rectangle':
        getWidth = Command.compileNumber(width!, 0, 0, 512)
        getHeight = Command.compileNumber(height!, 0, 0, 512)
        break
      case 'circle':
        getRadius = Command.compileNumber(radius!, 0, 0, 256)
        break
    }
    return () => {
      const point = getPoint()
      if (point) {
        setActor(Scene.binding?.getMultipleActors({
          x: point.x,
          y: point.y,
          area,
          width: getWidth?.(),
          height: getHeight?.(),
          radius: getRadius?.(),
          selector,
          teamId: getTeamId?.(),
          activation,
        }))
      }
      return true
    }
  }

  /** 删除角色 */
  protected deleteActor({actor}: {actor: ActorGetter}): CommandFunction {
    const getActor = Command.compileActor(actor)
    return () => {
      getActor()?.destroyAsync()
      return true
    }
  }

  /** 设置玩家角色 */
  protected setPlayerActor({actor}: {actor: ActorGetter}): CommandFunction {
    const getActor = Command.compileActor(actor)
    return () => {
      const actor = getActor()
      if (actor instanceof GlobalActor) {
        Party.setPlayer(actor)
      }
      return true
    }
  }

  /** 设置队伍成员 */
  protected setPartyMember({operation, actor}: {
    operation: 'add' | 'remove'
    actor: ActorGetter
  }): CommandFunction {
    const getActor = Command.compileActor(actor)
    switch (operation) {
      case 'add':
        return () => {
          const actor = getActor()
          if (actor instanceof GlobalActor) {
            Party.addMember(actor)
          }
          return true
        }
      case 'remove':
        return () => {
          const actor = getActor()
          if (actor instanceof GlobalActor) {
            Party.removeMember(actor)
          }
          return true
        }
    }
  }

  /** 改变通行区域 */
  protected changePassableTerrain({actor, passage}: {
    actor: ActorGetter
    passage: keyof ActorPassageMap
  }): CommandFunction {
    const getActor = Command.compileActor(actor)
    return () => {
      getActor()?.setPassage(passage)
      return true
    }
  }

  /** 改变角色队伍 */
  protected changeActorTeam({actor, teamId}: {
    actor: ActorGetter
    teamId: string
  }) {
    const getActor = Command.compileActor(actor)
    return () => {
      getActor()?.setTeam(teamId)
      return true
    }
  }

  /** 改变角色状态 */
  protected changeActorState({actor, operation, stateId, state}: {
    actor: ActorGetter
    operation: 'add' | 'remove' | 'remove-instance'
    stateId?: string
    state?: StateGetter
  }): CommandFunction | null {
    const getActor = Command.compileActor(actor)
    switch (operation) {
      case 'add': {
        const data = Data.states[stateId!]
        return !data ? null : () => {
          const actor = getActor()
          if (actor) {
            const state = new State(data)
            if (CurrentEvent.casterActor) {
              state.caster = CurrentEvent.casterActor
            }
            state.currentTime = 60000
            state.duration = 60000
            actor.state.add(state)
          }
          return true
        }
      }
      case 'remove':
        return () => {
          getActor()?.state.delete(stateId!)
          return true
        }
      case 'remove-instance': {
        const getState = Command.compileState(state!)
        return () => {
          const state = getState()
          if (state) {
            getActor()?.state.remove(state)
          }
          return true
        }
      }
    }
  }

  /** 改变角色装备 */
  protected changeActorEquipment({actor, operation, slot, equipmentId, equipment}: {
    actor: ActorGetter
    operation: 'add' | 'remove' | 'add-instance' | 'remove-instance' | 'remove-slot'
    slot: string | VariableGetter
    equipmentId?: string
    equipment?: EquipmentGetter
  }): CommandFunction | null {
    const getActor = Command.compileActor(actor)
    switch (operation) {
      case 'add': {
        const equipmentData = Data.equipments[equipmentId!]
        const getSlot = Command.compileEnumValue(slot)
        return !equipmentData ? null : () => {
          getActor()?.equipment.set(getSlot(), new Equipment(equipmentData))
          return true
        }
      }
      case 'remove':
        return () => {
          const actor = getActor()
          if (actor) {
            const equipment = actor.equipment.getById(equipmentId!)
            if (equipment) actor.equipment.remove(equipment)
          }
          return true
        }
      case 'add-instance': {
        const getEquipment = Command.compileEquipment(equipment!)
        const getSlot = Command.compileEnumValue(slot)
        return () => {
          const equipment = getEquipment()
          if (equipment) {
            getActor()?.equipment.set(getSlot(), equipment)
          }
          return true
        }
      }
      case 'remove-instance': {
        const getEquipment = Command.compileEquipment(equipment!)
        return () => {
          const equipment = getEquipment()
          if (equipment) {
            getActor()?.equipment.remove(equipment)
          }
          return true
        }
      }
      case 'remove-slot': {
        const getSlot = Command.compileEnumValue(slot)
        return () => {
          getActor()?.equipment.delete(getSlot())
          return true
        }
      }
    }
  }

  /** 改变角色技能 */
  protected changeActorSkill({actor, operation, skillId, skill}: {
    actor: ActorGetter
    operation: 'add' | 'remove' | 'remove-instance' | 'sort-by-order'
    skillId?: string | VariableGetter
    skill?: SkillGetter
  }): CommandFunction {
    const getActor = Command.compileActor(actor)
    switch (operation) {
      case 'add': {
        const getSkillId = Command.compileString(skillId!)
        return () => {
          const manager = getActor()?.skill
          const skillId = getSkillId()
          const data = Data.skills[skillId]
          if (manager && data && !manager.get(skillId)) {
            manager.add(new Skill(data))
          }
          return true
        }
      }
      case 'remove': {
        const getSkillId = Command.compileString(skillId!)
        return () => {
          getActor()?.skill.delete(getSkillId())
          return true
        }
      }
      case 'remove-instance': {
        const getSkill = Command.compileSkill(skill!)
        return () => {
          const skill = getSkill()
          if (skill) {
            getActor()?.skill.remove(skill)
          }
          return true
        }
      }
      case 'sort-by-order':
        return () => {
          getActor()?.skill.sort()
          return true
        }
    }
  }

  /** 改变角色头像 */
  protected changeActorPortrait({actor, mode, portrait, clip}: {
    actor: ActorGetter
    mode: 'full' | 'portrait' | 'clip'
    portrait?: string
    clip?: ImageClip
  }): CommandFunction {
    const getActor = Command.compileActor(actor)
    return () => {
      const actor = getActor()
      if (actor) {
        switch (mode) {
          case 'full':
            actor.portrait = portrait!
            Array.fill(actor.clip, clip!)
            break
          case 'portrait':
            actor.portrait = portrait!
            break
          case 'clip':
            Array.fill(actor.clip, clip!)
            break
        }
      }
      return true
    }
  }

  /** 改变角色动画 */
  protected changeActorAnimation({actor, animationId}: {
    actor: ActorGetter
    animationId: string
  }): CommandFunction {
    const getActor = Command.compileActor(actor)
    return () => {
      getActor()?.setAnimation(animationId)
      return true
    }
  }

  /** 改变角色精灵图(动画ID参数只是在编辑器中用来辅助获取精灵ID) */
  protected changeActorSprite({actor, animationId, spriteId, image}: {
    actor: ActorGetter
    animationId: string
    spriteId: string
    image: string
  }): CommandFunction {
    const getActor = Command.compileActor(actor)
    return () => {
      getActor()?.setSprite(spriteId, image)
      return true
    }
  }

  /** 改变角色动作 */
  protected changeActorMotion({actor, type, motion}: {
    actor: ActorGetter
    type: string
    motion: string
  }): CommandFunction | null {
    const getActor = Command.compileActor(actor)
    const motionName = Enum.getValue(motion)
    return !motionName ? null : () => {
      getActor()?.animationController.changeMotion(type, motionName)
      return true
    }
  }

  /** 播放角色动画 */
  protected playActorAnimation({actor, motion, speed, wait}: {
    actor: ActorGetter
    motion: string
    speed: number | VariableGetter
    wait: boolean
  }): CommandFunction {
    const getActor = Command.compileActor(actor)
    const getSpeed = Command.compileNumber(speed, 1, 0.1, 10)
    const motionName = Enum.getValue(motion)
    return () => {
      const actor = getActor()
      if (actor) {
        const animation = actor.animationController.playMotion(motionName, getSpeed())
        if (wait && animation) {
          const event = CurrentEvent
          animation.onFinish(() => {
            event.continue()
          })
          return CurrentEvent.pause()
        }
      }
      return true
    }
  }

  /** 停止角色动画 */
  protected stopActorAnimation({actor}: {actor: ActorGetter}): CommandFunction {
    const getActor = Command.compileActor(actor)
    return () => {
      getActor()?.animationController.stopMotion()
      return true
    }
  }

  /** 添加动画组件 */
  protected addAnimationComponent({actor, animationId, motion, rotatable, syncAngle, priority, offsetY}: {
    actor: ActorGetter
    animationId: string
    motion: string
    rotatable: boolean
    syncAngle: boolean
    priority: number
    offsetY: number
  }): CommandFunction | null {
    syncAngle = syncAngle ?? false // 补丁
    offsetY = offsetY ?? 0 // 补丁
    const animData = Data.animations[animationId]
    if (!animData) return null
    const key = animationId + motion
    const getActor = Command.compileActor(actor)
    const motionName = Enum.getValue(motion)
    return () => {
      const actor = getActor()
      if (actor) {
        const animation = new AnimationPlayer(animData)
        if (animation.setMotion(motionName)) {
          animation.playing = false
          animation.defaultMotion = motionName
          animation.rotatable = rotatable
          animation.syncAngle = syncAngle
          animation.priority = priority
          animation.offsetY = offsetY
          actor.animationManager.set(key, animation)
        }
      }
      return true
    }
  }

  /** 设置动画组件 */
  protected setAnimationComponent({actor, animationId, motion, operation, angle, scale, speed, opacity, priority, offsetY, spriteId, image, playMotion, wait}: {
    actor: ActorGetter
    animationId: string
    motion: string
    operation: string
    angle?: AngleGetter
    scale?: number
    speed?: number | VariableGetter
    opacity?: number
    priority?: number
    offsetY?: number
    spriteId?: string
    image?: string
    playMotion?: string
    wait?: boolean
  }): CommandFunction {
    const key = animationId + motion
    const getActor = Command.compileActor(actor)
    switch (operation) {
      case 'set-angle': {
        const getAngle = Command.compileAngle(angle!)
        return () => {
          const actor = getActor()
          const animation = actor?.animationManager.get(key)
          if (animation) animation.setAngle(getAngle(actor))
          return true
        }
      }
      case 'set-scale': {
        const getScale = Command.compileNumber(scale!)
        return () => {
          const scale = Math.clamp(getScale(), 0, 10)
          getActor()?.animationManager.setScale(key, scale)
          return true
        }
      }
      case 'set-speed': {
        const getSpeed = Command.compileNumber(speed!)
        return () => {
          const animation = getActor()?.animationManager.get(key)
          if (animation) animation.speed = Math.clamp(getSpeed(), 0, 10)
          return true
        }
      }
      case 'set-opacity': {
        const getOpacity = Command.compileNumber(opacity!)
        return () => {
          const animation = getActor()?.animationManager.get(key)
          if (animation) animation.opacity = Math.clamp(getOpacity(), 0, 1)
          return true
        }
      }
      case 'set-priority':
        return () => {
          getActor()?.animationManager.setPriority(key, priority!)
          return true
        }
      case 'set-offsetY':
        return () => {
          getActor()?.animationManager.setOffsetY(key, offsetY!)
          return true
        }
      case 'set-sprite':
        return () => {
          getActor()?.animationManager.setSprite(key, spriteId!, image!)
          return true
        }
      case 'play-motion': {
        const motionName = Enum.getValue(playMotion!)
        return () => {
          const actor = getActor()
          if (actor) {
            const animation = actor.animationManager.playMotion(key, motionName)
            if (wait && animation) {
              const event = CurrentEvent
              animation.onFinish(() => {
                event.continue()
              })
              return CurrentEvent.pause()
            }
          }
          return true
        }
      }
      case 'stop-motion':
        return () => {
          getActor()?.animationManager.stopMotion(key)
          return true
        }
    }
    throw new Error('Compiling Error')
  }

  /** 移除动画组件 */
  protected removeAnimationComponent({actor, animationId, motion}: {
    actor: ActorGetter
    animationId: string
    motion: string
  }): CommandFunction {
    const key = animationId + motion
    const getActor = Command.compileActor(actor)
    return () => {
      getActor()?.animationManager.delete(key)
      return true
    }
  }

  /** 创建全局角色 */
  protected createGlobalActor({actorId, teamId}: {
    actorId: string
    teamId: string
  }): CommandFunction {
    return () => {
      ActorManager.create(actorId)?.setTeam(teamId)
      return true
    }
  }

  /** 转移全局角色 */
  protected transferGlobalActor({actor, position}: {
    actor: ActorGetter
    position: PositionGetter
  }): CommandFunction {
    const getActor = Command.compileActor(actor)
    const getPoint = Command.compilePosition(position)
    return () => {
      const actor = getActor()
      const point = getPoint()
      if (actor instanceof GlobalActor && point) {
        actor.transferToScene(point.x, point.y)
      }
      return true
    }
  }

  /** 删除全局角色 */
  protected deleteGlobalActor({actorId}: {actorId: string}): CommandFunction {
    return () => {
      ActorManager.delete(actorId)
      return true
    }
  }

  /** 设置目标 */
  protected setTarget({actor}: {actor: ActorGetter}): CommandFunction {
    const getActor = Command.compileActor(actor)
    return () => {
      CurrentEvent.targetActor = getActor()
      return true
    }
  }

  /** 获取目标 */
  protected getTarget({actor, selector, condition, attribute, divisor}: {
    actor: ActorGetter
    selector: ActorSelector
    condition: string
    attribute?: string
    divisor?: string
  }): CommandFunction {
    const getActor = Command.compileActor(actor)
    switch (condition) {
      case 'max-threat':
        return () => {
          CurrentEvent.targetActor = getActor()?.target.getTargetMaxThreat(selector)
          return true
        }
      case 'nearest':
        return () => {
          CurrentEvent.targetActor = getActor()?.target.getTargetNearest(selector)
          return true
        }
      case 'farthest':
        return () => {
          CurrentEvent.targetActor = getActor()?.target.getTargetFarthest(selector)
          return true
        }
      case 'min-attribute-value': {
        const attributeKey = Attribute.getKey(attribute!)
        return () => {
          CurrentEvent.targetActor = getActor()?.target.getTargetMinAttributeValue(selector, attributeKey)
          return true
        }
      }
      case 'max-attribute-value': {
        const attributeKey = Attribute.getKey(attribute!)
        return () => {
          CurrentEvent.targetActor = getActor()?.target.getTargetMaxAttributeValue(selector, attributeKey)
          return true
        }
      }
      case 'min-attribute-ratio': {
        const attributeKey = Attribute.getKey(attribute!)
        const divisorKey = Attribute.getKey(divisor!)
        return () => {
          CurrentEvent.targetActor = getActor()?.target.getTargetMinAttributeRatio(selector, attributeKey, divisorKey)
          return true
        }
      }
      case 'max-attribute-ratio': {
        const attributeKey = Attribute.getKey(attribute!)
        const divisorKey = Attribute.getKey(divisor!)
        return () => {
          CurrentEvent.targetActor = getActor()?.target.getTargetMaxAttributeRatio(selector, attributeKey, divisorKey)
          return true
        }
      }
      case 'random':
        return () => {
          CurrentEvent.targetActor = getActor()?.target.getTargetRandom(selector)
          return true
        }
    }
    throw new Error('Compiling Error')
  }

  /** 添加目标 */
  protected appendTarget({actor, target}: {
    actor: ActorGetter
    target: ActorGetter
  }): CommandFunction {
    const getActor = Command.compileActor(actor)
    const getTarget = Command.compileActor(target)
    return () => {
      const target = getTarget()
      if (target && Scene.actor === target.parent && target.active) {
        getActor()?.target.append(target)
      }
      return true
    }
  }

  /** 移除目标 */
  protected removeTarget({actor, target}: {
    actor: ActorGetter
    target: ActorGetter
  }): CommandFunction {
    const getActor = Command.compileActor(actor)
    const getTarget = Command.compileActor(target)
    return () => {
      const target = getTarget()
      if (target && Scene.actor === target.parent && target.active) {
        getActor()?.target.remove(target)
      }
      return true
    }
  }

  /** 探测目标 */
  protected detectTargets({actor, distance, selector, inSight}: {
    actor: ActorGetter
    distance: number | VariableGetter
    selector: ActorSelector
    inSight: boolean
  }): CommandFunction {
    const getActor = Command.compileActor(actor)
    const getDistance = Command.compileNumber(distance)
    return () => {
      getActor()?.target.detect(getDistance(), selector, inSight)
      return true
    }
  }

  /** 放弃目标 */
  protected discardTargets({actor, selector, distance}: {
    actor: ActorGetter
    selector: ActorSelector
    distance: number
  }): CommandFunction {
    const getActor = Command.compileActor(actor)
    return () => {
      getActor()?.target.discard(selector, distance)
      return true
    }
  }

  /** 重置目标列表 */
  protected resetTargets({actor}: {actor: ActorGetter}): CommandFunction {
    const getActor = Command.compileActor(actor)
    return () => {
      getActor()?.target.resetTargets()
      return true
    }
  }

  /** 渲染轮廓 */
  protected renderOutline({operation, actor, color}: {
    operation: 'add' | 'remove' | 'reset'
    actor?: ActorGetter
    color?: string
  }): CommandFunction {
    switch (operation) {
      case 'add': {
        const getActor = Command.compileActor(actor!)
        const colorArray = [...Color.parseFloatArray(color!)] as ColorArray
        return () => {
          const actor = getActor()
          if (actor) {
            ActorOutline.add(actor, colorArray)
          }
          return true
        }
      }
      case 'remove': {
        const getActor = Command.compileActor(actor!)
        return () => {
          const actor = getActor()
          if (actor) {
            ActorOutline.remove(actor)
          }
          return true
        }
      }
      case 'reset':
        return () => {
          ActorOutline.reset()
          return true
        }
    }
  }

  /** 施放技能 */
  protected castSkill({actor, mode, key, skillId, skill, wait}: {
    actor: ActorGetter
    mode: string
    key?: string
    skillId?: string
    skill?: SkillGetter
    wait: boolean
  }): CommandFunction {
    const getActor = Command.compileActor(actor)
    let getSkill: () => Skill | undefined
    switch (mode) {
      case 'by-key': {
        const shortcutKey = Enum.getValue(key!)
        getSkill = () => getActor()?.shortcut.getSkill(shortcutKey)
        break
      }
      case 'by-id':
        getSkill = () => getActor()?.skill.get(skillId!)
        break
      case 'by-skill': {
        const getInstance = Command.compileSkill(skill!)
        getSkill = () => {
          const actor = getActor()
          const skill = getInstance()
          if (actor && skill && actor.skill === skill.parent) {
            return skill
          }
        }
        break
      }
    }
    switch (wait) {
      case false:
        return () => {
          getSkill()?.cast(CurrentEvent.targetActor)
          return true
        }
      case true:
        return () => {
          const casting = getSkill()?.cast(CurrentEvent.targetActor)
          if (casting && !casting.complete) {
            const event = CurrentEvent
            casting.onFinish(() => {
              event.continue()
            })
            return CurrentEvent.pause()
          }
          return true
        }
    }
  }

  /** 设置技能 */
  protected setSkill({skill, operation, cooldown}: {
    skill: SkillGetter
    operation: 'set-cooldown' | 'increase-cooldown' | 'decrease-cooldown'
    cooldown: number | VariableGetter
  }): CommandFunction {
    const getSkill = Command.compileSkill(skill)
    switch(operation) {
      case 'set-cooldown': {
        const getCD = Command.compileNumber(cooldown)
        return () => {
          getSkill()?.setCooldown(getCD())
          return true
        }
      }
      case 'increase-cooldown': {
        const getCD = Command.compileNumber(cooldown)
        return () => {
          getSkill()?.increaseCooldown(getCD())
          return true
        }
      }
      case 'decrease-cooldown': {
        const getCD = Command.compileNumber(cooldown)
        return () => {
          getSkill()?.decreaseCooldown(getCD())
          return true
        }
      }
    }
  }

  /** 创建触发器 */
  protected createTrigger({triggerId, caster, origin, angle, distance, scale, timeScale}: {
    triggerId: string
    caster: ActorGetter
    origin: PositionGetter
    angle: AngleGetter
    distance: number | VariableGetter
    scale: number | VariableGetter
    timeScale: number | VariableGetter
  }): CommandFunction {
    const getTriggerId = Command.compileString(triggerId)
    const getCaster = Command.compileActor(caster)
    const getOrigin = Command.compilePosition(origin)
    const getAngle = Command.compileAngle(angle)
    const getDistance = Command.compileNumber(distance)
    const getScale = Command.compileNumber(scale, 1, 0.1, 10)
    const getTimeScale = Command.compileNumber(timeScale, 1, 0.1, 10)
    return () => {
      const data = Data.triggers[getTriggerId()]
      const caster = getCaster()
      const origin = getOrigin()
      if (data && caster && origin) {
        const angle = getAngle(origin)
        const cos = Math.cos(angle)
        const sin = Math.sin(angle)
        const trigger = new Trigger(data)
        const distance = getDistance()
        const x = origin.x + distance * cos
        const y = origin.y + distance * sin
        trigger.angle = angle
        trigger.caster = caster
        trigger.target = CurrentEvent.targetActor ?? null
        trigger.skill = CurrentEvent.triggerSkill ?? null
        trigger.timeScale = getTimeScale()
        trigger.setScale(getScale())
        trigger.setPosition(x, y)
        trigger.updateVelocity()
        // 如果在低优先级事件中创建触发器
        // 有必要立即更新动作方向
        trigger.updateAnimation(0)
        Scene.trigger.append(trigger)
      }
      return true
    }
  }

  /** 设置触发器速度 */
  protected setTriggerSpeed({trigger, speed}: {
    trigger: TriggerGetter
    speed: number | VariableGetter
  }): CommandFunction {
    const getTrigger = Command.compileTrigger(trigger)
    const getSpeed = Command.compileNumber(speed)
    return () => {
      getTrigger()?.setSpeed(getSpeed())
      return true
    }
  }

  /** 设置触发器角度 */
  protected setTriggerAngle({trigger, angle}: {
    trigger: TriggerGetter
    angle: AngleGetter
  }): CommandFunction {
    const getTrigger = Command.compileTrigger(trigger)
    const getAngle = Command.compileAngle(angle)
    return () => {
      const trigger = getTrigger()
      if (trigger) {
        trigger.setAngle(getAngle(trigger))
      }
      return true
    }
  }

  /** 设置触发器持续时间 */
  protected setTriggerDuration({trigger, operation, duration}: {
    trigger: TriggerGetter
    operation: 'set' | 'increase' | 'decrease'
    duration: number | VariableGetter
  }): CommandFunction {
    const getTrigger = Command.compileTrigger(trigger)
    const getDuration = Command.compileNumber(duration)
    return () => {
      const trigger = getTrigger()
      if (trigger) {
        switch (operation) {
          case 'set':
            trigger.duration = getDuration()
            break
          case 'increase':
            trigger.duration += getDuration()
            break
          case 'decrease':
            trigger.duration -= getDuration()
            break
        }
      }
      return true
    }
  }

  /** 设置触发器动作 */
  protected setTriggerMotion({trigger, motion}: {
    trigger: TriggerGetter
    motion: string
  }): CommandFunction | null {
    const getTrigger = Command.compileTrigger(trigger)
    const motionName = Enum.getValue(motion)
    return !motionName ? null : () => {
      getTrigger()?.animation?.setMotion(motionName)
      return true
    }
  }

  /** 设置库存 */
  protected setInventory({actor, operation, money, itemId, quantity, equipmentId, equipment, order1, order2, refActor}: {
    actor: ActorGetter
    operation: string
    money?: number | VariableGetter
    itemId?: string | VariableGetter
    quantity?: number | VariableGetter
    equipmentId?: string | VariableGetter
    equipment?: EquipmentGetter
    order1: number | VariableGetter
    order2: number | VariableGetter
    refActor?: ActorGetter
  }): CommandFunction {
    const getActor = Command.compileActor(actor)
    switch (operation) {
      case 'increase-money': {
        const getMoney = Command.compileNumber(money!)
        return () => {
          getActor()?.inventory.increaseMoney(getMoney())
          return true
        }
      }
      case 'decrease-money': {
        const getMoney = Command.compileNumber(money!)
        return () => {
          getActor()?.inventory.decreaseMoney(getMoney())
          return true
        }
      }
      case 'increase-items': {
        const getId = Command.compileString(itemId!)
        const getQuantity = Command.compileNumber(quantity!)
        return () => {
          getActor()?.inventory.increaseItems(getId(), getQuantity())
          return true
        }
      }
      case 'decrease-items': {
        const getId = Command.compileString(itemId!)
        const getQuantity = Command.compileNumber(quantity!)
        return () => {
          getActor()?.inventory.decreaseItems(getId(), getQuantity())
          return true
        }
      }
      case 'gain-equipment': {
        const getId = Command.compileString(equipmentId!)
        return () => {
          getActor()?.inventory.createEquipment(getId())
          return true
        }
      }
      case 'lose-equipment': {
        const getId = Command.compileString(equipmentId!)
        return () => {
          getActor()?.inventory.deleteEquipment(getId())
          return true
        }
      }
      case 'gain-equipment-instance': {
        const getEquipment = Command.compileEquipment(equipment!)
        return () => {
          const equipment = getEquipment()
          if (equipment) {
            getActor()?.inventory.gainEquipment(equipment)
          }
          return true
        }
      }
      case 'lose-equipment-instance': {
        const getEquipment = Command.compileEquipment(equipment!)
        return () => {
          const equipment = getEquipment()
          if (equipment) {
            getActor()?.inventory.loseEquipment(equipment)
          }
          return true
        }
      }
      case 'swap': {
        const getOrder1 = Command.compileNumber(order1)
        const getOrder2 = Command.compileNumber(order2)
        return () => {
          getActor()?.inventory.swap(getOrder1(), getOrder2())
          return true
        }
      }
      case 'sort':
        return () => {
          getActor()?.inventory.sort(false)
          return true
        }
      case 'sort-by-order':
        return () => {
          getActor()?.inventory.sort(true)
          return true
        }
      case 'reference': {
        const getRefActor = Command.compileActor(refActor!)
        return () => {
          const sActor = getActor()
          const dActor = getRefActor()
          if (sActor && dActor instanceof GlobalActor) {
            sActor.useInventory(dActor.inventory)
          }
          return true
        }
      }
      case 'dereference':
        return () => {
          getActor()?.restoreInventory()
          return true
        }
      case 'reset':
        return () => {
          getActor()?.inventory.reset()
          return true
        }
    }
    throw new Error('Compiling Error')
  }

  /** 使用物品 */
  protected useItem({actor, mode, key, itemId, item, wait}: {
    actor: ActorGetter
    mode: string
    key?: string
    itemId?: string
    item?: ItemGetter
    wait: boolean
  }): CommandFunction {
    const getActor = Command.compileActor(actor)
    let getItem: () => Item | undefined
    switch (mode) {
      case 'by-key': {
        const shortcutKey = Enum.getValue(key!)
        getItem = () => getActor()?.shortcut.getItem(shortcutKey)
        break
      }
      case 'by-id':
        getItem = () => getActor()?.inventory.get(itemId!) as Item | undefined
        break
      case 'by-item': {
        const getInstance = Command.compileItem(item!)
        getItem = () => {
          const actor = getActor()
          const item = getInstance()
          if (actor && item && actor.inventory === item.parent) {
            return item
          }
        }
        break
      }
    }
    switch (wait) {
      case false:
        return () => {
          getItem()?.use(getActor())
          return true
        }
      case true:
        return () => {
          const using = getItem()?.use(getActor())
          if (using && !using.complete) {
            const event = CurrentEvent
            using.onFinish(() => {
              event.continue()
            })
            return CurrentEvent.pause()
          }
          return true
        }
    }
  }

  /** 设置物品 */
  protected setItem({item, operation, quantity}: {
    item: ItemGetter
    operation: 'increase' | 'decrease'
    quantity: number | VariableGetter
  }): CommandFunction {
    const getItem = Command.compileItem(item)
    switch(operation) {
      case 'increase': {
        const getQuantity = Command.compileNumber(quantity)
        return () => (getItem()?.increase(getQuantity()), true)
      }
      case 'decrease': {
        const getQuantity = Command.compileNumber(quantity)
        return () => (getItem()?.decrease(getQuantity()), true)
      }
    }
  }

  /** 设置冷却时间 */
  protected setCooldown({actor, operation, key, cooldown}: {
    actor: ActorGetter
    operation: 'set' | 'increase' | 'decrease'
    key: string | VariableGetter
    cooldown: number | VariableGetter
  }): CommandFunction {
    const getActor = Command.compileActor(actor)
    const getKey = Command.compileEnumValue(key)
    const getCooldown = Command.compileNumber(cooldown)
    const methodName = {
      set: 'setCooldown',
      increase: 'increaseCooldown',
      decrease: 'decreaseCooldown',
    }[operation] as 'setCooldown' | 'increaseCooldown' | 'decreaseCooldown'
    return () => {
      getActor()?.cooldown[methodName](getKey(), getCooldown())
      return true
    }
  }

  /** 设置快捷键 */
  protected setShortcut({actor, operation, key, key2, itemId, skillId}: {
    actor: ActorGetter
    operation: 'set-item-shortcut' | 'set-skill-shortcut' | 'delete-shortcut' | 'swap-shortcuts'
    key: string
    key2?: string
    itemId?: string
    skillId?: string
  }): CommandFunction {
    const getActor = Command.compileActor(actor)
    const getShortcutKey = Command.compileEnumValue(key)
    switch(operation) {
      case 'set-item-shortcut': {
        const getItemId = Command.compileString(itemId!)
        return () => {
          getActor()?.shortcut.setId(getShortcutKey(), getItemId())
          return true
        }
      }
      case 'set-skill-shortcut': {
        const getSkillId = Command.compileString(skillId!)
        return () => {
          getActor()?.shortcut.setId(getShortcutKey(), getSkillId())
          return true
        }
      }
      case 'delete-shortcut':
        return () => {
          getActor()?.shortcut.delete(getShortcutKey())
          return true
        }
      case 'swap-shortcuts': {
        const getShortcutKey2 = Command.compileEnumValue(key2!)
        return () => {
          getActor()?.shortcut.swap(getShortcutKey(), getShortcutKey2())
          return true
        }
      }
    }
  }

  /** 激活场景 */
  protected activateScene({pointer}: {pointer: number}): CommandFunction {
    return () => {
      if (Scene.pointer === pointer) {
        return true
      }
      Scene.activate(pointer)
      return CurrentEvent.wait(0)
    }
  }

  /** 加载场景 */
  protected loadScene({sceneId, transfer, x, y}: {
    sceneId: string
    transfer: boolean
    x: number
    y: number
  }): CommandFunction {
    const getSceneId = Command.compileString(sceneId)
    switch (transfer) {
      case true: {
        const getX = Command.compileNumber(x)
        const getY = Command.compileNumber(y)
        return () => {
          const event = CurrentEvent
          const x = Math.floor(getX()) + 0.5
          const y = Math.floor(getY()) + 0.5
          Scene.load(getSceneId(), {x, y}).then(() => {
            event.continue()
          })
          return CurrentEvent.pause()
        }
      }
      case false:
        return () => {
          const event = CurrentEvent
          Scene.load(getSceneId()).then(() => {
            event.continue()
          })
          return CurrentEvent.pause()
        }
    }
  }

  /** 加载子场景 */
  protected loadSubscene({sceneId, shiftX, shiftY}: {
    sceneId: string
    shiftX: number
    shiftY: number
  }): CommandFunction {
    const getSceneId = Command.compileString(sceneId)
    const getShiftX = Command.compileNumber(shiftX)
    const getShiftY = Command.compileNumber(shiftY)
    return () => {
      Scene.binding?.loadSubscene(
        getSceneId(),
        Math.floor(getShiftX()),
        Math.floor(getShiftY()),
      )
      return true
    }
  }

  /** 卸载子场景 */
  protected unloadSubscene({sceneId}: {sceneId: string}): CommandFunction {
    const getSceneId = Command.compileString(sceneId)
    return () => {
      Scene.binding?.unloadSubscene(getSceneId())
      return true
    }
  }

  /** 删除场景 */
  protected deleteScene(): CommandFunction {
    return () => {
      Scene.delete()
      return true
    }
  }

  /** 限制摄像机边界 */
  protected clampCamera({left, top, right, bottom}: {
    left: number | VariableGetter
    top: number | VariableGetter
    right: number | VariableGetter
    bottom: number | VariableGetter
  }): CommandFunction {
    const getLeft = Command.compileNumber(left, 0, -1000, 1000)
    const getTop = Command.compileNumber(top, 0, -1000, 1000)
    const getRight = Command.compileNumber(right, 0, -1000, 1000)
    const getBottom = Command.compileNumber(bottom, 0, -1000, 1000)
    return () => {
      Camera.clamp(getLeft(), getTop(), getRight(), getBottom())
      return true
    }
  }

  /** 解除摄像机边界 */
  protected unclampCamera(): CommandFunction {
    return () => {
      Camera.unclamp()
      return true
    }
  }

  /** 移动摄像机 */
  protected moveCamera({mode, position, actor, easingId, duration, wait}: {
    mode: 'position' | 'actor'
    position?: PositionGetter
    actor?: ActorGetter
    easingId: string
    duration: number
    wait: boolean
  }): CommandFunction {
    switch (mode) {
      case 'position': {
        const getPoint = Command.compilePosition(position!)
        return () => {
          if (Scene.binding !== null) {
            const point = getPoint(Camera)
            if (point) {
              Camera.moveTo(point.x, point.y, easingId, duration)
              if (wait && duration > 0) {
                return CurrentEvent.wait(duration)
              }
            }
          }
          return true
        }
      }
      case 'actor': {
        const getActor = Command.compileActor(actor!)
        return () => {
          if (Scene.binding !== null) {
            const actor = getActor()
            if (actor && !actor.destroyed) {
              Camera.follow(actor, easingId, duration)
              if (wait && duration > 0) {
                return CurrentEvent.wait(duration)
              }
            }
          }
          return true
        }
      }
    }
  }

  /** 设置缩放率 */
  protected setZoomFactor({zoom, easingId, duration, wait}: {
    zoom: number | VariableGetter
    easingId: string
    duration: number
    wait: boolean
  }): CommandFunction {
    const getZoom = Command.compileNumber(zoom, 1, 1, 8)
    const getDuration = Command.compileNumber(duration)
    return () => {
      if (Scene.binding !== null) {
        const zoom = getZoom()
        const duration = getDuration()
        Camera.setZoomFactor(zoom, easingId, duration)
        if (wait && duration > 0) {
          return CurrentEvent.wait(duration)
        }
      }
      return true
    }
  }

  /** 设置环境光 */
  protected setAmbientLight({red, green, blue, easingId, duration, wait}: {
    red: number | VariableGetter
    green: number | VariableGetter
    blue: number | VariableGetter
    easingId: string
    duration: number | VariableGetter
    wait: boolean
  }): CommandFunction {
    const getRed = Command.compileNumber(red, 0, 0, 255)
    const getGreen = Command.compileNumber(green, 0, 0, 255)
    const getBlue = Command.compileNumber(blue, 0, 0, 255)
    const getDuration = Command.compileNumber(duration)
    return () => {
      if (Scene.binding !== null) {
        const red = getRed()
        const green = getGreen()
        const blue = getBlue()
        const duration = getDuration()
        Scene.binding.setAmbientLight(red, green, blue, easingId, duration)
        if (wait && duration > 0) {
          return CurrentEvent.wait(duration)
        }
      }
      return true
    }
  }

  /** 改变画面色调 */
  protected tintScreen({tint, easingId, duration, wait}: {
    tint: ImageTint
    easingId: string
    duration: number
    wait: boolean
  }): CommandFunction {
    return () => {
      ScreenTinter.set(tint, easingId, duration)
      if (wait && duration > 0) {
        return CurrentEvent.wait(duration)
      }
      return true
    }
  }

  /** 震动屏幕 */
  protected shakeScreen({mode, power, speed, easingId, duration, wait}: {
    mode: CameraShakeMode
    power: number
    speed: number
    easingId: string
    duration: number
    wait: boolean
  }): CommandFunction {
    return () => {
      Camera.shake(mode, power, speed, easingId, duration)
      if (wait && duration > 0) {
        return CurrentEvent.wait(duration)
      }
      return true
    }
  }

  /** 设置图块 */
  protected setTile({tilemap, tilemapX, tilemapY, tilesetId, tilesetX, tilesetY}: {
    tilemap: TilemapGetter
    tilemapX: number | VariableGetter
    tilemapY: number | VariableGetter
    tilesetId: string
    tilesetX: number | VariableGetter
    tilesetY: number | VariableGetter
  }): CommandFunction {
    const getTilemap = Command.compileTilemap(tilemap)
    const getTilemapX = Command.compileNumber(tilemapX, -1)
    const getTilemapY = Command.compileNumber(tilemapY, -1)
    const getTilesetX = Command.compileNumber(tilesetX, -1)
    const getTilesetY = Command.compileNumber(tilesetY, -1)
    return () => {
      const tilemap = getTilemap()
      if (tilemap) {
        tilemap.setTile(
          Math.floor(getTilemapX()),
          Math.floor(getTilemapY()),
          tilesetId,
          Math.floor(getTilesetX()),
          Math.floor(getTilesetY()),
        )
      }
      return true
    }
  }

  /** 删除图块 */
  protected deleteTile({tilemap, tilemapX, tilemapY}: {
    tilemap: TilemapGetter
    tilemapX: number | VariableGetter
    tilemapY: number | VariableGetter
  }): CommandFunction {
    const getTilemap = Command.compileTilemap(tilemap)
    const getTilemapX = Command.compileNumber(tilemapX, -1)
    const getTilemapY = Command.compileNumber(tilemapY, -1)
    return () => {
      getTilemap()?.deleteTile(
        Math.floor(getTilemapX()),
        Math.floor(getTilemapY()),
      )
      return true
    }
  }

  /** 设置地形 */
  protected setTerrain({position, terrain}: {
    position: PositionGetter
    terrain: 'land' | 'water' | 'wall'
  }): CommandFunction {
    const getPoint = Command.compilePosition(position)
    let code: TerrainCode
    switch (terrain) {
      case 'land': code = 0; break
      case 'water': code = 1; break
      case 'wall': code = 2; break
    }
    return () => {
      const scene = Scene.binding
      const point = getPoint()
      if (scene !== null && point) {
        const x = Math.floor(point.x)
        const y = Math.floor(point.y)
        scene.terrain.set(x, y, code)
      }
      return true
    }
  }

  /** 设置游戏速度 */
  protected setGameSpeed({speed, easingId, duration, wait}: {
    speed: number | VariableGetter
    easingId: string
    duration: number | VariableGetter
    wait: boolean
  }): CommandFunction {
    const getSpeed = Command.compileNumber(speed, 0, 0, 10)
    const getDuration = Command.compileNumber(duration)
    return () => {
      const speed = getSpeed()
      const duration = getDuration()
      Time.setTimeScale(speed, easingId, duration)
      if (wait && duration > 0) {
        const event = CurrentEvent
        Time.onTransitionEnd(() => {
          event.continue()
        })
        return CurrentEvent.pause()
      }
      return true
    }
  }

  /** 设置鼠标指针 */
  protected setCursor({image}: {image: string}): CommandFunction {
    const style = document.documentElement.style as any
    const meta = Data.manifest.guidMap[image]
    const path = meta?.path ?? ''
    let cursor = 'default'
    let promise: Promise<any> | null = null
    if (path) {
      promise = Loader.loadImage({guid: image, save: true}).then(image => {
        cursor = `${CSS.encodeURL(image.src)}, default`
        promise = null
      }).catch(error => {
        console.warn(error)
      })
    }
    return () => {
      if (style.path !== path) {
        style.path = path
        style.cursor = cursor
        promise?.then(() => {
          if (style.path === path) {
            style.cursor = cursor
          }
        })
      }
      return true
    }
  }

  /** 设置队伍关系 */
  protected setTeamRelation({teamId1, teamId2, relation}: {
    teamId1: string
    teamId2: string
    relation: 0 | 1
  }) {
    return () => {
      Team.changeRelation(teamId1, teamId2, relation)
      return true
    }
  }

  /** 开关碰撞系统 */
  protected switchCollisionSystem({operation}: {
    operation: 'enable-actor-collision' | 'disable-actor-collision' | 'enable-scene-collision' | 'disable-scene-collision'
  }): CommandFunction {
    switch (operation) {
      case 'enable-actor-collision':
        return () => {
          ActorCollider.actorCollisionEnabled = true
          return true
        }
      case 'disable-actor-collision':
        return () => {
          ActorCollider.actorCollisionEnabled = false
          return true
        }
      case 'enable-scene-collision':
        return () => {
          ActorCollider.sceneCollisionEnabled = true
          return true
        }
      case 'disable-scene-collision':
        return () => {
          ActorCollider.sceneCollisionEnabled = false
          return true
        }
    }
  }

  /** 游戏数据 */
  protected gameData({operation, index, variables}: {
    operation: 'save' | 'load' | 'delete'
    index: number
    variables?: string
  }): CommandFunction {
    switch (operation) {
      case 'save': {
        const getIndex = Command.compileNumber(index, -1, -1, 32)
        const keys = variables!.split(/\s*,\s*/)
        return () => {
          const index = getIndex()
          if (index === -1) {
            return true
          }
          const meta: AttributeMap = {}
          const event = CurrentEvent
          const {attributes} = event
          for (const key of keys) {
            const value = attributes[key]
            switch (typeof value) {
              case 'boolean':
              case 'number':
              case 'string':
                meta[key] = value
                continue
            }
          }
          Data.saveGameData(index, meta).then(() => {
            event.continue()
          })
          return CurrentEvent.pause()
        }
      }
      case 'load': {
        const getIndex = Command.compileNumber(index, -1, -1, 32)
        return () => {
          const index = getIndex()
          if (index === -1) {
            return true
          }
          const event = CurrentEvent
          Data.loadGameData(index).then(() => {
            event.continue()
          })
          return CurrentEvent.pause()
        }
      }
      case 'delete': {
        const getIndex = Command.compileNumber(index, -1, -1, 32)
        return () => {
          const index = getIndex()
          if (index === -1) {
            return true
          }
          const event = CurrentEvent
          Data.deleteGameData(index).then(() => {
            event.continue()
          })
          return CurrentEvent.pause()
        }
      }
    }
  }

  /** 重置游戏 */
  protected reset(): CommandFunction {
    return () => {
      Game.reset()
      return true
    }
  }

  /** 暂停游戏 */
  protected pauseGame(): CommandFunction {
    return () => {
      Game.pause()
      return true
    }
  }

  /** 继续游戏 */
  protected continueGame(): CommandFunction {
    return () => {
      Game.continue()
      return true
    }
  }

  /** 阻止场景输入事件 */
  protected preventSceneInput(): CommandFunction {
    return () => {
      Scene.preventInput()
      return true
    }
  }

  /** 恢复场景输入事件 */
  protected restoreSceneInput(): CommandFunction {
    return () => {
      Scene.restoreInput()
      return true
    }
  }

  /** 模拟按键 */
  protected simulateKey({operation, keycode}: {
    operation: 'click' | 'press' | 'release'
    keycode: string
  }): CommandFunction {
    return () => {
      switch (operation) {
        case 'click':
          Input.simulateKey('keydown', keycode)
          Input.simulateKey('keyup', keycode)
          break
        case 'press':
          Input.simulateKey('keydown', keycode)
          break
        case 'release':
          Input.simulateKey('keyup', keycode)
          break
      }
      return true
    }
  }

  /** 设置语言 */
  protected setLanguage({language}: {language: string}): CommandFunction {
    return () => {
      Local.setLanguage(language)
      return true
    }
  }

  /** 设置分辨率 */
  protected setResolution({width, height, sceneScale, uiScale}: {
    width: number | VariableGetter
    height: number | VariableGetter
    sceneScale: number | VariableGetter
    uiScale: number | VariableGetter
  }): CommandFunction {
    const getWidth = Command.compileNumber(width, 1920, 240, 7680)
    const getHeight = Command.compileNumber(height, 1080, 240, 7680)
    const getSceneScale = Command.compileNumber(sceneScale, 1, 0.5, 4)
    const getUiScale = Command.compileNumber(uiScale, 1, 0.5, 4)
    return () => {
      Stage.setResolution(getWidth(), getHeight(), getSceneScale(), getUiScale())
      return true
    }
  }

  /** 执行脚本 */
  protected script({script}: {script: string}): CommandFunction | null {
    const method = this.script as any
    let {escape} = method
    if (escape === undefined) {
      escape = /(?<=(?:[^\p{L}$_\d\s]|\n|^)\s*)\(\s*([\p{L}$_\d]+)\s*\)(?!\s*=>)/gu
      method.escape = escape
    }
    try {
      const code = script.replace(escape, 'CurrentEvent.attributes["$1"]')
      const fn = new Function(code)
      return () => (fn(), true)
    } catch (error) {
      return null
    }
  }
}