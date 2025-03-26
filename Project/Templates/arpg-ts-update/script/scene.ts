/** ******************************** 场景管理器 ******************************** */

let Scene = new class SceneManager {
  /** 当前绑定场景上下文 */
  public binding: SceneContext | null = null
  /** 绑定场景指针(0或1) */
  public pointer: number = 0
  /** 场景缩放系数 */
  public scale: number = 1
  /** 场景上下文列表(A、B场景) */
  public contexts: Array<SceneContext | null> = [null, null]
  /** 默认场景上下文(空场景) */
  public default!: SceneContext
  /** 实体对象管理器 */
  public entity!: EntityManager
  /** {预设ID:对象数据}映射表 */
  public presets: HashMap<SceneObjectData> = {}
  /** 最新创建对象 */
  public latest?: PresetObject
  /** 当前场景的视差图管理器 */
  public parallax!: SceneParallaxManager
  /** 当前场景的角色管理器 */
  public actor!: SceneActorManager
  /** 当前场景的动画管理器 */
  public animation!: SceneAnimationManager
  /** 当前场景的触发器管理器 */
  public trigger!: SceneTriggerManager
  /** 当前场景的区域管理器 */
  public region!: SceneRegionManager
  /** 当前场景的光源管理器 */
  public light!: SceneLightManager
  /** 当前场景的粒子发射管理器 */
  public emitter!: SceneParticleEmitterManager
  /** 当前场景中可见的角色列表 */
  public visibleActors!: CacheList<Actor>
  /** 当前场景中可见的动画列表 */
  public visibleAnimations!: CacheList<SceneAnimation>
  /** 当前场景中可见的触发器列表 */
  public visibleTriggers!: CacheList<Trigger>
  /** 当前场景中可见的粒子发射器列表 */
  public visibleEmitters!: CacheList<SceneParticleEmitter>
  /** 场景精灵渲染器 */
  public spriteRenderer!: SceneSpriteRenderer
  /** 场景直射光渲染器 */
  public directLightRenderer!: SceneDirectLightRenderer
  /** 场景事件目标角色 */
  public eventTarget: Actor | null = null
  /** 场景事件鼠标悬浮中的角色 */
  public eventHover: Actor | null = null
  /** 是否阻止场景输入事件(累计次数) */
  public preventInputEvents: number = 0
  /** 场景粒子数量计数 */
  public particleCount: number = 0
  /** 场景共享坐标点 */
  public sharedPoint: Point = {x: 0, y: 0}
  /** 场景对象选择框 */
  public selection: SelectionBox = {
    x: 0,
    y: 0,
    size: 0,
    left: -0.5,
    right: 0.5,
    top: -1,
    bottom: 0,
    timestamp: -1,
    condition: 'select',
    actor: undefined,
  }
  /** 滤镜模块列表 */
  public filters: RendererList = new RendererList()
  /** 场景事件侦听器映射表 */
  public listeners: HashMap<Array<EventCallback>> = {
    create: [],
    load: [],
    active: [],
    destroy: [],
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
  }

  /**
   * 场景转换图块坐标到像素坐标方法
   * @param tile 图块{x, y}坐标对象
   * @returns 场景{x, y}坐标对象
   */
  public convert!: (tile: Point) => Point

  /**
   * 场景转换图块坐标到像素坐标方法(浮点参数版本)
   * @param x 图块X
   * @param y 图块Y
   * @returns 场景{x, y}坐标对象
   */
  public convert2f!: (x: number, y: number) => Point

  /** 初始化场景管理器 */
  public initialize(): void {
    // 加载预设对象
    this.loadPresets()

    // 设置初始场景缩放系数
    this.setScale(Data.globalData.sceneScale)

    // 创建精灵渲染器
    this.spriteRenderer = new SceneSpriteRenderer(
      this.visibleActors = new CacheList(),
      this.visibleAnimations = new CacheList(),
      this.visibleTriggers = new CacheList(),
      this.visibleEmitters = new CacheList(),
    )

    // 创建直射光渲染器
    this.directLightRenderer = new SceneDirectLightRenderer()

    // 创建默认场景(空场景)
    this.default = new SceneContext()

    // 绑定默认场景
    this.bind(null)

    // 侦听事件
    Input.on('mousedown', this.mousedown)
    Input.on('mousedownLB', this.mousedownLB)
    Input.on('mousedownRB', this.mousedownRB)
    Input.on('mouseup', this.mouseup)
    Input.on('mouseupLB', this.mouseupLB)
    Input.on('mouseupRB', this.mouseupRB)
    Input.on('mouseleave', this.mouseleave)
    Input.on('scenemousemove', this.mousemove)
    Input.on('doubleclick', this.doubleclick)
    Input.on('keydown', (event: ScriptKeyboardEvent) => Scene.emitInputEvent('keydown', event))
    Input.on('keyup', (event: ScriptKeyboardEvent) => Scene.emitInputEvent('keyup', event))
    Input.on('mousedown', (event: ScriptMouseEvent) => Scene.emitInputEvent('mousedown', event))
    Input.on('mouseup', (event: ScriptMouseEvent) => Scene.emitInputEvent('mouseup', event))
    Input.on('mousemove', (event: ScriptMouseEvent) => Scene.emitInputEvent('mousemove', event))
    Input.on('doubleclick', (event: ScriptMouseEvent) => Scene.emitInputEvent('doubleclick', event))
    Input.on('wheel', (event: ScriptWheelEvent) => Scene.emitInputEvent('wheel', event))
    Input.on('touchstart', (event: ScriptTouchEvent) => Scene.emitInputEvent('touchstart', event))
    Input.on('touchmove', (event: ScriptTouchEvent) => Scene.emitInputEvent('touchmove', event))
    Input.on('touchend', (event: ScriptTouchEvent) => Scene.emitInputEvent('touchend', event))
    Input.on('gamepadbuttonpress', (event: ScriptGamepadEvent) => Scene.emitInputEvent('gamepadbuttonpress', event))
    Input.on('gamepadbuttonrelease', (event: ScriptGamepadEvent) => Scene.emitInputEvent('gamepadbuttonrelease', event))
    Input.on('gamepadleftstickchange', (event: ScriptGamepadEvent) => Scene.emitInputEvent('gamepadleftstickchange', event))
    Input.on('gamepadrightstickchange', (event: ScriptGamepadEvent) => Scene.emitInputEvent('gamepadrightstickchange', event))
  }

  /** 加载预设对象 */
  private loadPresets(): void {
    const presets = this.presets
    // 加载场景对象目录
    const load = (nodes: SceneObjectDataDirectory, scene: SceneFile) => {
      for (const node of nodes) {
        if (node.class === 'folder') {
          load(node.children, scene)
        } else {
          node.scene = scene
          presets[node.presetId] = node
          Data.compileEvents(node, `${scene.path}\n@ ${node.name}.${node.presetId}`)
          switch (node.class) {
            case 'actor':
              loadActor(node)
              break
            case 'animation':
              loadAnimation(node)
              break
            case 'particle':
              loadParticle(node)
              break
          }
          if (node.class !== 'actor') {
            Data.filterScripts(node.scripts)
          }
        }
      }
    }
    // 加载角色
    const loadActor = (node: SceneActorData) => {
      const actorId = node.actorId
      let data = Data.actors[actorId]
      if (data !== undefined) {
        // 修改角色数据，添加场景预设的事件和脚本
        const proxy: ActorFile = Object.create(data)
        proxy.events = node.events
        proxy.scripts = node.scripts
        Object.setPrototypeOf(node.events, data.events)
        if (node.type === 'global') {
          node.scripts.length = 0
        }
        Data.mergeScripts(node.scripts, data.scripts)
        node.data = proxy
      }
    }
    // 加载动画
    const loadAnimation = (node: SceneAnimationData) => {
      node.motion = Enum.getValue(node.motion)
      const data = Data.animations[node.animationId]
      if (data !== undefined) {
        node.data = data
      }
    }
    // 加载粒子
    const loadParticle = (node: SceneParticleData) => {
      const data = Data.particles[node.particleId]
      if (data !== undefined) {
        node.data = data
      }
    }
    // 加载所有场景的预设对象
    for (const scene of Object.values(Data.scenes) as Array<SceneFile>) {
      load(scene.objects, scene)
    }
  }

  /**
   * 鼠标按下事件
   * @param event 脚本鼠标事件
   */
  private mousedown(event: ScriptMouseEvent): void {
    if (Scene.preventInputEvents !== 0) return
    Scene.getActorAtMouse()?.emit('mousedown', event)
  }

  /**
   * 鼠标左键按下事件
   * @param event 脚本鼠标事件
   */
  private mousedownLB(event: ScriptMouseEvent): void {
    if (Scene.preventInputEvents !== 0) return
    Scene.eventTarget = Scene.getActorAtMouse() ?? null
    Scene.eventTarget?.emit('mousedownLB', event)
  }

  /**
   * 鼠标右键按下事件
   * @param event 脚本鼠标事件
   */
  private mousedownRB(event: ScriptMouseEvent): void {
    if (Scene.preventInputEvents !== 0) return
    const target = Scene.getActorAtMouse()
    target?.emit('mousedownRB', event)
  }

  /**
   * 鼠标弹起事件
   * @param event 脚本鼠标事件
   */
  private mouseup(event: ScriptMouseEvent): void {
    if (Scene.preventInputEvents !== 0) return
    const target = Scene.getActorAtMouse()
    target?.emit('mouseup', event)
  }

  /**
   * 鼠标左键弹起事件
   * @param event 脚本鼠标事件
   */
  private mouseupLB(event: ScriptMouseEvent): void {
    if (Scene.preventInputEvents !== 0) return
    const target = Scene.getActorAtMouse()
    target?.emit('mouseupLB', event)
    if (Scene.eventTarget === target) {
      target.emit('click', event)
    }
    Scene.eventTarget = null
  }

  /**
   * 鼠标右键弹起事件
   * @param event 脚本鼠标事件
   */
  private mouseupRB(event: ScriptMouseEvent): void {
    if (Scene.preventInputEvents !== 0) return
    const target = Scene.getActorAtMouse()
    target?.emit('mouseupRB', event)
  }

  /**
   * 鼠标移动事件
   * @param event 脚本鼠标事件
   */
  private mousemove(event: ScriptMouseEvent): void {
    if (Scene.preventInputEvents !== 0) return
    const last = Scene.eventHover
    const hover = Scene.getActorAtMouse() ?? null
    if (last !== hover) {
      if (last !== null) {
        last.emit('mouseleave', event)
      }
      if (hover !== null) {
        hover.emit('mouseenter', event)
      }
      Scene.eventHover = hover
    }
    hover?.emit('mousemove', event)
  }

  /**
   * 鼠标离开事件
   * @param event 脚本鼠标事件
   */
  private mouseleave(event: ScriptMouseEvent): void {
    if (Scene.preventInputEvents !== 0) return
    if (Scene.eventHover !== null) {
      Scene.eventHover.emit('mouseleave', event)
      Scene.eventHover = null
    }
  }

  /**
   * 鼠标双击事件
   * @param event 脚本鼠标事件
   */
  private doubleclick(event: ScriptMouseEvent): void {
    if (Scene.preventInputEvents !== 0) return
    if (Scene.eventTarget !== null) {
      Scene.eventTarget.emit('doubleclick', event)
    }
  }

  /**
   * 获取鼠标位置的角色
   * @returns 角色实例
   */
  public getActorAtMouse(): Actor | undefined {
    const selection = Scene.selection
    if (selection.timestamp !== Time.timestamp) {
      selection.timestamp = Time.timestamp
      selection.actor = Scene.getActorAt(Mouse.sceneX, Mouse.sceneY)
    }
    return selection.actor
  }

  /**
   * 获取指定位置的角色
   * @returns 角色实例
   */
  public getActorAt(x: number, y: number): Actor | undefined {
    if (!Scene.binding) {
      return undefined
    }
    const selection = Scene.selection
    const maxHalf = Scene.binding.maxColliderHalf
    const expansion = Math.max(
      Math.abs(selection.top),
      Math.abs(selection.left),
      Math.abs(selection.right),
      Math.abs(selection.bottom),
    )
    selection.x = x
    selection.y = y
    selection.size = (maxHalf + expansion) * 2
    return Scene.binding.getActor(selection)
  }

  /**
   * 设置缩放系数
   * @param value 缩放系数
   */
  public setScale(value: number): void {
    this.scale = value
    Camera.updateZoom()
  }

  /** 重置所有场景 */
  public reset(): void {
    const {contexts} = this
    const {length} = contexts
    for (let i = 0; i < length; i++) {
      contexts[i]?.destroy()
      contexts[i] = null
    }
    this.pointer = 0
    this.bind(null)
    this.spriteRenderer.reset()
    this.preventInputEvents = 0
  }

  /** 阻止场景输入 */
  public preventInput(): void {
    this.preventInputEvents++
  }

  /** 恢复场景输入 */
  public restoreInput(): void {
    this.preventInputEvents = Math.max(this.preventInputEvents - 1, 0)
  }

  /**
   * 激活场景上下文
   * @param pointer 场景指针(0或1)
   */
  public async activate(pointer: number): Promise<void> {
    // 推迟到栈尾执行
    await Promise.resolve()
    this.pointer = pointer
    const scene = this.get()
    if (this.binding !== scene) {
      this.bind(scene)
    }
  }

  /**
   * 加载场景
   * @param id 场景文件ID
   * @param transfer 玩家传送位置
   * @returns 场景上下文
   */
  public async load(id: string, transfer?: Point): Promise<SceneContext> {
    // 推迟到栈尾执行
    await Promise.resolve()
    const sceneData = Data.getScene(id)

    // 销毁当前场景上下文
    const current = this.get()
    if (current !== null) {
      current.destroy()
    }

    // 创建新的场景上下文
    const scene = new SceneContext(sceneData)
    if (transfer) scene.transfer = transfer
    this.bind(this.set(scene))
    return scene
  }

  /** 删除当前场景 */
  public async delete(): Promise<void> {
    // 推迟到栈尾执行
    await Promise.resolve()
    const scene = this.get()
    if (scene !== null) {
      scene.destroy()
      this.bind(this.set(null))
    }
  }

  /**
   * 更新场景
   * @param deltaTime 增量时间(毫秒)
   */
  public update(deltaTime: number): void {
    if (Game.paused === false) {
      Scene.particleCount = 0
      this.binding?.update(deltaTime)
    }
  }

  /** 渲染场景 */
  public render(): void {
    this.binding?.render()
    this.filters.render()
  }

  /**
   * 获取当前场景上下文
   * @returns 场景上下文
   */
  private get(): SceneContext | null {
    return this.contexts[this.pointer]
  }

  /**
   * 设置当前场景上下文
   * @param scene 场景上下文
   * @returns 传入的场景上下文
   */
  private set(scene: SceneContext | null): SceneContext | null {
    return this.contexts[this.pointer] = scene
  }

  /**
   * 绑定场景上下文
   * @param scene 场景上下文
   */
  private bind(scene: SceneContext | null): void {
    if (this.binding) {
      this.binding.enabled = false
    }
    this.binding = scene
    if (scene === null) {
      scene = this.default
    }

    // 获取场景组件和方法
    this.entity = scene.entity
    this.parallax = scene.parallax
    this.actor = scene.actor
    this.animation = scene.animation
    this.trigger = scene.trigger
    this.region = scene.region
    this.light = scene.light
    this.emitter = scene.emitter
    this.convert = scene.convert
    this.convert2f = scene.convert2f
    this.spriteRenderer.setObjectLists(
      scene.actor.list,
      scene.animation.list,
      scene.trigger.list,
      scene.emitter.list,
    )

    // 初始化场景
    if (scene !== this.default) {
      scene.initialize()
      scene.enabled = true
      GL.setAmbientLight(scene.ambient)
    }
  }

  /**
   * 添加场景事件侦听器
   * @param type 场景事件类型
   * @param listener 事件回调函数
   * @param priority 是否将该事件设为最高优先级
   */
  public on(type: string, listener: EventCallback, priority: boolean = false): void {
    const group = this.listeners[type]
    if (!group) {
      throw new Error('Invalid event type: ' + type)
    }
    if (!group.includes(listener)) {
      if (priority) {
        group.unshift(listener)
      } else {
        group.push(listener)
      }
    }
  }

  /**
   * 移除场景事件侦听器(未使用)
   * @param type 场景事件类型
   * @param listener 事件回调函数
   */
  public off(type: string, listener: EventCallback): void {
    const group = this.listeners[type]
    if (!group) {
      throw new Error('Invalid event type: ' + type)
    }
    const index = group.indexOf(listener)
    if (index !== -1) {
      const replacer = () => {}
      group[index] = replacer
      Callback.push(() => {
        group.remove(replacer)
      })
    }
  }

  /**
   * 发送场景事件
   * @param type 场景事件类型
   * @param argument 场景事件传递参数
   */
  public emit(type: string, argument: any): void {
    for (const listener of this.listeners[type] ?? []) {
      listener(argument)
    }
  }

  /**
   * 发送场景输入事件
   * @param type 场景事件类型
   * @param argument 场景事件传递参数
   */
  private emitInputEvent(type: string, argument: any): void {
    for (const listener of this.listeners[type] ?? []) {
      // 每次调用侦听器时判断一下，因为调用后可能发生变化
      if (Game.paused === false && Scene.preventInputEvents === 0) {
        listener(argument)
      }
    }
  }

  /**
   * 获取视差图锚点
   * @param parallax 视差图或瓦片地图对象
   * @returns 视差图锚点位置(共享对象)
   */
  public getParallaxAnchor(parallax: SceneParallax | SceneTilemap): Point {
    const point = this.sharedPoint
    const scene = this.binding!
    const tw = scene.tileWidth
    const th = scene.tileHeight
    const cx = Camera.scrollCenterX
    const cy = Camera.scrollCenterY
    const px = parallax.x * tw
    const py = parallax.y * th
    const fx = parallax.parallaxFactorX
    const fy = parallax.parallaxFactorY
    point.x = cx + fx * (px - cx)
    point.y = cy + fy * (py - cy)
    return point
  }

  /**
   * 保存场景管理器数据
   * @returns 场景管理器存档数据
   */
  public saveData(): SceneManagerSaveData {
    const contexts = []
    const active = this.pointer
    for (const scene of this.contexts) {
      if (scene) {
        contexts.push(scene.saveData())
      }
    }
    return {active, contexts}
  }

  /**
   * 加载场景管理器数据
   * @param data 场景管理器存档数据
   */
  public loadData(data: SceneManagerSaveData): void {
    this.reset()
    this.contexts = [null, null]
    for (const context of data.contexts) {
      const {id, subscenes, index} = context
      const sceneData = Data.getScene(id)
      context.subdata = subscenes.map(id => Data.getScene(id))
      this.contexts[index] = new SceneContext(sceneData, context)
    }
    // 重新激活场景
    this.activate(data.active)
  }
}

/** ******************************** 场景上下文 ******************************** */

class SceneContext {
  /** 场景文件ID */
  public id: string
  /** 场景数据 */
  public data: SceneFile
  /** 启用状态 */
  public enabled: boolean
  /** 子场景列表 */
  public subscenes: Array<SceneFile>
  /** 场景宽度(0-512) */
  public width: number
  /** 场景高度(0-512) */
  public height: number
  /** 场景图块宽度(16-256) */
  public tileWidth: number
  /** 场景图块高度(16-256) */
  public tileHeight: number
  /** 场景环境光对象 */
  public ambient: SceneAmbientLight
  /** 场景地形数据(地面:0, 水面:1, 墙块: 2) */
  public terrain: SceneTerrainManager
  /** 场景障碍数据 */
  public obstacle: SceneObstacleManager
  /** 场景图块动画已播放时间 */
  public elapsed: number
  /** 场景图块动画播放间隔 */
  public animInterval: number
  /** 场景图块动画帧计数 */
  public animFrame: number
  /** 最大的角色碰撞器半径 */
  public maxColliderHalf: number
  /** 最大的网格分区大小 */
  public maxGridCellSize: number
  /** 场景事件映射表 */
  public events!: HashMap<CommandFunctionList>
  /** 场景脚本管理器 */
  public script!: ScriptManager
  /** 实体对象管理器 */
  public entity: EntityManager
  /** 场景视差图管理器 */
  public parallax: SceneParallaxManager
  /** 场景角色管理器 */
  public actor: SceneActorManager
  /** 场景动画管理器 */
  public animation: SceneAnimationManager
  /** 场景触发器管理器 */
  public trigger: SceneTriggerManager
  /** 场景区域管理器 */
  public region: SceneRegionManager
  /** 场景光源管理器 */
  public light: SceneLightManager
  /** 场景粒子发射管理器 */
  public emitter: SceneParticleEmitterManager
  /** 场景对象数据列表 */
  private objects: SceneObjectDataDirectory
  /** 场景更新器模块列表 */
  public updaters: UpdaterList
  /** 场景渲染器模块列表 */
  public renderers: RendererList
  /** 是否已销毁 */
  public destroyed: boolean
  /** 玩家传送位置 */
  public transfer?: Point
  /** 存档数据 */
  private savedData?: SceneSaveData

  /**
   * 场景上下文对象
   * @param data 场景文件
   * @param savedData 场景存档数据
   */
  constructor(data: SceneOptions = {}, savedData?: SceneSaveData) {
    this.id = data.id ?? ''
    this.enabled = false

    // 创建场景组件
    this.entity = new EntityManager()
    this.parallax = new SceneParallaxManager(this)
    this.actor = new SceneActorManager(this)
    this.animation = new SceneAnimationManager(this)
    this.trigger = new SceneTriggerManager(this)
    this.region = new SceneRegionManager(this)
    this.light = new SceneLightManager(this)
    this.emitter = new SceneParticleEmitterManager(this)

    // 设置更新器
    this.updaters = new UpdaterList(
      this.parallax,
      this.actor,
      this.animation,
      this.trigger,
      this.region,
      this.light,
      this.emitter,
    )

    // 设置渲染器
    this.renderers = new RendererList(
      this.light,
      this.parallax.backgrounds,
      Scene.spriteRenderer,
      Scene.directLightRenderer,
      this.parallax.foregrounds,
    )

    const width = savedData?.width ?? data.width ?? 0
    const height = savedData?.height ?? data.height ?? 0
    const ambient = savedData?.ambient ?? data.ambient ?? {red: 255, green: 255, blue: 255, direct: 0}
    const terrains = savedData?.terrains ?? data.terrains ?? ''
    this.data = data as SceneFile
    this.width = width
    this.height = height
    this.tileWidth = data.tileWidth ?? 32
    this.tileHeight = data.tileHeight ?? 32
    this.ambient = ambient
    this.terrain = new SceneTerrainManager(this, width, height)
    Codec.decodeTerrains(this.terrain.rawArray, terrains)
    this.obstacle = new SceneObstacleManager(width, height)
    this.animInterval = Data.config.scene.animationInterval
    this.elapsed = 0
    this.animFrame = 0
    this.maxColliderHalf = 0
    this.maxGridCellSize = 0
    this.events = data.events ?? {}
    this.script = ScriptManager.create(this, data.scripts ?? [])
    this.subscenes = savedData?.subdata ?? []
    this.objects = data.objects ?? []
    this.destroyed = false
    this.savedData = savedData
    this.actor.partition.optimize(this)
    this.actor.partition.resize(this)
  }

  /**
   * 更新场景模块
   * @param deltaTime 时间增量(毫秒)
   */
  public update(deltaTime: number): void {
    this.elapsed += deltaTime
    if (this.elapsed > this.animInterval) {
      this.elapsed -= this.animInterval
      // 更新图块动画帧
      this.animFrame += 1
    }
    this.updaters.update(deltaTime)
  }

  /** 渲染场景画面 */
  render(): void {
    this.renderers.render()
  }

  /**
   * 获取场景指定区域中的角色
   * @returns 目标角色
   */
  public getActor({
    x,
    y,
    area = 'square',
    size = 1,
    radius = 0.5,
    selector = 'any',
    teamId = '',
    condition = 'nearest',
    attribute = '',
    divisor = '',
    activation = 'active',
    exclusionActor = undefined,
    exclusionTeamId = '',
  }: {
    /** 选择区域中心X */
    x: number
    /** 选择区域中心Y */
    y: number
    /** 选择区域类型 */
    area?: 'square' | 'circle'
    /** 正方形区域边长 */
    size?: number
    /** 圆形区域半径 */
    radius?: number
    /** 目标角色选择器 */
    selector?: 'enemy' | 'friend' | 'team' | 'any'
    /** 选择器队伍ID */
    teamId?: string
    /** 条件 */
    condition?: 'nearest' | 'farthest' | 'min-attribute-value' | 'max-attribute-value' | 'min-attribute-ratio' | 'max-attribute-ratio' | 'random' | 'select'
    /** 属性键 */
    attribute?: string
    /** 除数属性键 */
    divisor?: string
    /** 激活状态条件 */
    activation?: 'active' | 'inactive' | 'either'
    /** 排除角色 */
    exclusionActor?: Actor | undefined
    /** 排除队伍ID */
    exclusionTeamId?: string
  }): Actor | undefined {
    const inspector = SceneContext.actorInspectors[selector]
    const teamIndex = Team.get(teamId)?.index ?? -1
    const actorPool: CacheList<Actor> = CacheList.instance
    let count = 0
    let skipCond
    switch (activation) {
      case 'active':
        skipCond = false
        break
      case 'inactive':
        skipCond = true
      case 'either':
        break
    }
    switch (area) {
      case 'square': {
        const half = size / 2
        const cells = this.actor.partition.get(x - half, y - half, x + half, y + half)
        const length = cells.count
        for (let i = 0; i < length; i++) {
          for (const actor of cells[i] as Array<Actor>) {
            if (actor.active === skipCond ||
              actor === exclusionActor ||
              actor.teamId === exclusionTeamId) {
              continue
            }
            const distX = Math.abs(x - actor.x)
            const distY = Math.abs(y - actor.y)
            if (distX <= half && distY <= half && inspector(actor.teamIndex, teamIndex)) {
              actorPool[count++] = actor
            }
          }
        }
        break
      }
      case 'circle': {
        const cells = this.actor.partition.get(x - radius, y - radius, x + radius, y + radius)
        const length = cells.count
        for (let i = 0; i < length; i++) {
          for (const actor of cells[i] as Array<Actor>) {
            if (actor.active === skipCond ||
              actor === exclusionActor ||
              actor.teamId === exclusionTeamId) {
              continue
            }
            const dist = (x - actor.x) ** 2 + (y - actor.y) ** 2
            if (dist <= radius ** 2 && inspector(actor.teamIndex, teamIndex)) {
              actorPool[count++] = actor
            }
          }
        }
        break
      }
    }
    actorPool.count = count
    return SceneContext.actorFilters[condition](x, y, attribute, divisor)
  }

  /**
   * 获取场景指定区域中的多个角色
   * @returns 目标角色列表
   */
  public getMultipleActors({
    x,
    y,
    area = 'rectangle',
    width = 1,
    height = 1,
    radius = 0.5,
    selector = 'any',
    teamId = '',
    activation = 'active',
  }: {
    /** 选择区域中心X */
    x: number
    /** 选择区域中心Y */
    y: number
    /** 选择区域类型 */
    area?: 'rectangle' | 'circle'
    /** 矩形区域宽度 */
    width?: number
    /** 矩形区域高度 */
    height?: number
    /** 圆形区域半径 */
    radius?: number
    /** 目标角色选择器 */
    selector?: 'enemy' | 'friend' | 'team' | 'any'
    /** 选择器队伍ID */
    teamId?: string
    /** 激活状态条件 */
    activation?: 'active' | 'inactive' | 'either'
  }): Array<Actor> {
    const inspector = SceneContext.actorInspectors[selector]
    const teamIndex = Team.get(teamId)?.index ?? -1
    const actors = []
    let skipCond
    switch (activation) {
      case 'active':
        skipCond = false
        break
      case 'inactive':
        skipCond = true
      case 'either':
        break
    }
    switch (area) {
      case 'rectangle': {
        const halfW = width / 2
        const halfH = height / 2
        const cells = this.actor.partition.get(x - halfW, y - halfH, x + halfW, y + halfH)
        const length = cells.count
        for (let i = 0; i < length; i++) {
          for (const actor of cells[i] as Array<Actor>) {
            if (actor.active === skipCond) {
              continue
            }
            const distX = Math.abs(x - actor.x)
            const distY = Math.abs(y - actor.y)
            if (distX <= halfW && distY <= halfH && inspector(actor.teamIndex, teamIndex)) {
              actors.push(actor)
            }
          }
        }
        break
      }
      case 'circle': {
        const cells = this.actor.partition.get(x - radius, y - radius, x + radius, y + radius)
        const length = cells.count
        for (let i = 0; i < length; i++) {
          for (const actor of cells[i] as Array<Actor>) {
            if (actor.active === skipCond) {
              continue
            }
            const dist = (x - actor.x) ** 2 + (y - actor.y) ** 2
            if (dist <= radius ** 2 && inspector(actor.teamIndex, teamIndex)) {
              actors.push(actor)
            }
          }
        }
        break
      }
    }
    return actors
  }

  /**
   * 设置场景环境光
   * @param red 红[0-255]
   * @param green 绿[0-255]
   * @param blue 蓝[0-255]
   * @param easingId 过渡曲线ID
   * @param duration 持续时间(毫秒)
   */
  public setAmbientLight(red: number, green: number, blue: number, easingId: string = '', duration: number = 0): void {
    const updaters = this.updaters
    const ambient = this.ambient
    if (duration > 0) {
      let elapsed = 0
      const sRed = ambient.red
      const sGreen = ambient.green
      const sBlue = ambient.blue
      const easing = Easing.get(easingId)
      // 创建ambient更新器
      updaters.set('ambient', {
        update: deltaTime => {
          elapsed += deltaTime
          const time = easing.get(elapsed / duration)
          ambient.red = Math.clamp(sRed * (1 - time) + red * time, 0, 255)
          ambient.green = Math.clamp(sGreen * (1 - time) + green * time, 0, 255)
          ambient.blue = Math.clamp(sBlue * (1 - time) + blue * time, 0, 255)
          GL.setAmbientLight(ambient)
          // 过渡结束，延迟删除更新器
          if (elapsed >= duration) {
            updaters.deleteDelay('ambient')
          }
        }
      })
    } else {
      updaters.deleteDelay('ambient')
      ambient.red = red
      ambient.green = green
      ambient.blue = blue
      GL.setAmbientLight(ambient)
    }
  }

  /** 加载地形 */
  public loadTerrains(): void {
    const {width, height} = this
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        this.updateTerrain(x, y)
      }
    }
  }

  /**
   * 更新地形
   * @param x 场景X
   * @param y 场景Y
   */
  public updateTerrain(x: number, y: number): void {
    const ti = x + y * this.width
    this.terrain.compositeArray[ti] =
    this.terrain.rawArray[ti] ||
    this.parallax.getTileTerrain(x, y)
  }

  /**
   * 加载子场景
   * @param sceneId 场景ID
   * @param offsetX 对象偏移X
   * @param offsetY 对象偏移Y
   */
  public async loadSubscene(sceneId: string, offsetX: number = 0, offsetY: number = 0): Promise<void> {
    // 推迟到栈尾执行
    await Promise.resolve()
    const scene = Data.getScene(sceneId)
    // 偏移场景对象
    if (offsetX !== 0 || offsetY !== 0) {
      const shift = (nodes: SceneObjectDataDirectory) => {
        for (const node of nodes) {
          switch (node.class) {
            case 'folder':
              shift(node.children)
              continue
            default:
              node.x += offsetX
              node.y += offsetY
              continue
          }
        }
      }
      shift(scene.objects)
    }
    // 如果不存在相同的子场景，添加到子场景列表
    if (!this.subscenes.find(scene => scene.id === sceneId)) {
      this.subscenes.push(scene)
    }
    // 创建场景对象并发送自动执行事件
    const instances = this.loadObjects(scene.objects)
    for (const instance of instances) {
      instance.autorun()
    }
  }

  /**
   * 卸载子场景
   * @param sceneId 场景ID
   */
  public unloadSubscene(sceneId: string): void {
    const scene = this.subscenes.find(
      scene => scene.id === sceneId
    )
    if (!scene) return
    this.subscenes.remove(scene)
    const presetIdMap: HashMap<true> = {}
    const register = (nodes: SceneObjectDataDirectory) => {
      for (const node of nodes) {
        if (node.class === 'folder') {
          register(node.children)
        } else {
          presetIdMap[node.presetId] = true
        }
      }
    }
    register(scene.objects)
    // 获取待删除对象
    // 避免写在回调函数中异步执行
    const deletedObjects: Array<any> = []
    for (const manager of [this.parallax, this.light]) {
      for (const group of manager.groups) {
        let i = group.length
        while (--i >= 0) {
          const instance = group[i]
          if (presetIdMap[instance.presetId]) {
            deletedObjects.push({instance, manager})
          }
        }
      }
    }
    for (const manager of [this.actor, this.animation, this.region, this.emitter]) {
      const list = manager.list
      let i = list.length
      while (--i >= 0) {
        const instance = list[i]
        if (presetIdMap[instance.presetId]) {
          deletedObjects.push({instance, manager})
        }
      }
    }
    Callback.push(() => {
      for (const {instance, manager} of deletedObjects) {
        instance.destroy()
        manager.remove(instance)
      }
    })
  }

  /**
   * 加载初始场景对象
   * @param objectList 场景对象数据列表
   * @returns 已创建的场景对象实例列表
   */
  private loadObjects(objectList: SceneObjectDataDirectory): Array<PresetObject> {
    const scene = this
    const instances: Array<PresetObject> = []
    const loader = new class ObjectLoader {
      // 加载场景对象目录
      load = (nodes: SceneObjectDataDirectory) => {
        for (const node of nodes) {
          loader[node.class](node as any)
        }
      }

      // 加载文件夹
      folder = (node: SceneObjectFolder) => {
        loader.load(node.children)
      }

      // 加载角色
      actor = (node: SceneActorData) => {
        if (SceneContext.testConditions(node)) {
          const actor = scene.createActor(node)
          if (actor) instances.push(actor)
        }
      }

      // 加载动画
      animation = (node: SceneAnimationData) => {
        if (SceneContext.testConditions(node)) {
          const animation = scene.createAnimation(node)
          if (animation) instances.push(animation)
        }
      }

      // 加载粒子
      particle = (node: SceneParticleData) => {
        if (SceneContext.testConditions(node)) {
          const emitter = scene.createParticle(node)
          if (emitter) instances.push(emitter)
        }
      }

      // 加载区域
      region = (node: SceneRegionData) => {
        if (SceneContext.testConditions(node)) {
          const region = scene.createRegion(node)
          instances.push(region)
        }
      }

      // 加载光源
      light = (node: SceneLightData) => {
        if (SceneContext.testConditions(node)) {
          const light = scene.createLight(node)
          instances.push(light)
        }
      }

      // 加载视差图
      parallax = (node: SceneParallaxData) => {
        if (SceneContext.testConditions(node)) {
          const parallax = scene.createParallax(node)
          instances.push(parallax)
        }
      }

      // 加载瓦片地图
      tilemap = (node: SceneTilemapData) => {
        if (SceneContext.testConditions(node)) {
          const tilemap = scene.createTilemap(node)
          instances.push(tilemap)
        }
      }
    }
    // 加载场景对象
    loader.load(objectList)
    return instances
  }

  /**
   * 创建角色
   * @param node 预设角色数据
   */
  public createActor(node: SceneActorData): Actor | undefined {
    const data = node.data
    if (data) {
      Actor.enableCreateEvent = false
      let enableCreateEvent = true
      let actor: Actor
      switch (node.type) {
        case 'local':
          actor = new Actor(data)
          actor.name = node.name
          actor.presetId = node.presetId
          actor.selfVarId = node.presetId
          actor.setPosition(node.x, node.y)
          break
        case 'global': {
          let globalActor = ActorManager.get(node.actorId)
          if (globalActor) {
            enableCreateEvent = false
          } else {
            globalActor = ActorManager.create(node.actorId)!
          }
          globalActor.setSceneActorData(node)
          globalActor.transferToScene(node.x, node.y)
          actor = globalActor
          break
        }
      }
      actor.setTeam(node.teamId)
      actor.updateAngle(Math.radians(node.angle))
      if (node.scale !== 1) {
        actor.setScale(node.scale * data.scale)
      }
      this.actor.append(actor)
      Actor.enableCreateEvent = true
      if (enableCreateEvent) {
        actor.emit('create')
      }
      return Scene.latest = actor
    }
    return undefined
  }

  /**
   * 创建动画
   * @param node 预设动画数据
   */
  public createAnimation(node: SceneAnimationData): SceneAnimation | undefined {
    const data = node.data
    if (data) {
      const animation = new SceneAnimation(data, node)
      animation.selfVarId = node.presetId
      animation.setMotion(node.motion)
      animation.setAngle(Math.radians(node.angle))
      this.animation.append(animation)
      return Scene.latest = animation
    }
    return undefined
  }

  /**
   * 创建粒子
   * @param node 预设粒子数据
   */
  public createParticle(node: SceneParticleData): SceneParticleEmitter | undefined {
    const data = node.data
    if (data) {
      const emitter = new SceneParticleEmitter(data, node)
      emitter.selfVarId = node.presetId
      this.emitter.append(emitter)
      return Scene.latest = emitter
    }
    return undefined
  }

  /**
   * 创建区域
   * @param node 预设区域数据
   */
  public createRegion(node: SceneRegionData): SceneRegion {
    const region = new SceneRegion(node)
    region.selfVarId = node.presetId
    this.region.append(region)
    return Scene.latest = region
  }

  /**
   * 创建光源
   * @param node 预设光源数据
   */
  public createLight(node: SceneLightData): SceneLight {
    const light = new SceneLight(node)
    light.selfVarId = node.presetId
    this.light.append(light)
    return Scene.latest = light
  }

  /**
   * 创建视差图
   * @param node 预设视差图数据
   */
  public createParallax(node: SceneParallaxData): SceneParallax {
    const parallax = new SceneParallax(node)
    parallax.selfVarId = node.presetId
    this.parallax.append(parallax)
    return Scene.latest = parallax
  }

  /**
   * 创建瓦片地图
   * @param node 预设瓦片地图数据
   */
  public createTilemap(node: SceneTilemapData): SceneTilemap {
    const tilemap = new SceneTilemap(this, node)
    tilemap.selfVarId = node.presetId
    this.parallax.append(tilemap)
    return Scene.latest = tilemap
  }

  /**
   * 调用场景事件
   * @param type 场景事件类型
   * @returns 生成的事件处理器
   */
  public callEvent(type: string): EventHandler | undefined {
    const commands = this.events[type]
    if (commands) {
      return EventHandler.call(new EventHandler(commands), this.updaters)
    }
  }

  /**
   * 调用场景事件和脚本
   * @param type 场景事件类型
   */
  public emit(type: string): void {
    this.callEvent(type)
    this.script.emit(type, this)
    Scene.emit(type, this)
  }

  /** 销毁场景上下文 */
  public destroy(): void {
    if (!this.destroyed) {
      this.destroyed = true
      this.parallax.destroy()
      this.actor.destroy()
      this.animation.destroy()
      this.trigger.destroy()
      this.region.destroy()
      this.light.destroy()
      this.emitter.destroy()

      // 发送场景销毁事件
      this.emit('destroy')

      // 下一帧删除不再引用的图像纹理
      Callback.push(() => {
        GL.textureManager.update()
      })
    }
  }

  /**
   * 保存场景数据
   * @returns 场景存档数据
   */
  public saveData(): SceneSaveData {
    return {
      id: this.id,
      subscenes: this.subscenes.map(scene => scene.id),
      index: Scene.contexts.indexOf(this),
      width: this.width,
      height: this.height,
      ambient: this.ambient,
      terrains: this.terrain.saveData(),
      actors: this.actor.saveData(),
      animations: this.animation.saveData(),
      emitters: this.emitter.saveData(),
      regions: this.region.saveData(),
      lights: this.light.saveData(),
      parallaxes: this.parallax.saveData(),
    }
  }

  /** 初始化 */
  public initialize() {
    const savedData = this.savedData
    ScriptManager.deferredLoading = true
    // 加载场景对象
    if (!savedData) {
      this.loadObjects(this.objects)
    }
    // 加载子场景对象
    for (const subscene of this.subscenes) {
      if (!savedData) {
        this.loadObjects(subscene.objects)
      }
    }
    // 加载存档数据
    if (savedData) {
      this.actor.loadData(savedData.actors)
      this.animation.loadData(savedData.animations)
      this.emitter.loadData(savedData.emitters)
      this.region.loadData(savedData.regions)
      this.light.loadData(savedData.lights)
      this.parallax.loadData(savedData.parallaxes)
      // 立即更新回调函数
      Callback.update()
    }
    // 传送玩家角色到场景
    if (this.transfer) {
      const {x, y} = this.transfer
      Party.player?.transferToScene(x, y)
    }
    ScriptManager.loadDeferredParameters()
    // 发送场景创建事件
    if (!savedData) {
      this.emit('create')
    }
    // 发送场景加载事件
    this.emit('load')
    this.enabled = true
    // 启用场景并发送自动执行事件
    this.parallax.autorun()
    this.actor.autorun()
    this.animation.autorun()
    this.region.autorun()
    this.light.autorun()
    this.emitter.autorun()
    // 发送场景自动执行事件
    this.emit('autorun')
    // 禁用初始化方法
    this.initialize = Function.empty
    // 删除场景存档数据
    delete this.savedData
  }

  /**
   * 转换场景坐标到像素坐标(闭包允许脱离对象使用)
   * @param tile 拥有场景坐标的对象
   * @returns 像素位置
   */
  public convert = (tile: Point): Point => {
    const point = Scene.sharedPoint
    point.x = tile.x * this.tileWidth
    point.y = tile.y * this.tileHeight
    return point
  }

  /**
   * 转换场景坐标到像素坐标(浮点参数版本)(闭包允许脱离对象使用)
   * @param x 场景坐标X
   * @param y 场景坐标Y
   * @returns 像素位置
   */
  public convert2f = (x: number, y: number): Point => {
    const point = Scene.sharedPoint
    point.x = x * this.tileWidth
    point.y = y * this.tileHeight
    return point
  }

  /**
   * 判断目标点是否在墙块中
   * @param x 场景坐标X
   * @param y 场景坐标Y
   * @returns 目标点是否在墙块中
   */
  public isInWallBlock(x: number, y: number): boolean {
    return this.terrain.get(Math.floor(x), Math.floor(y)) === 0b10
  }

  /**
   * 判断起点和终点是否在视线内可见
   * @param sx 起点场景X
   * @param sy 起点场景Y
   * @param dx 终点场景X
   * @param dy 终点场景Y
   * @returns 是否可见
   */
  public isInLineOfSight(sx: number, sy: number, dx: number, dy: number): boolean {
    const width = this.width
    const height = this.height
    // 如果坐标点在场景网格外，返回false(不可视)
    if (sx < 0 || sx >= width ||
      sy < 0 || sy >= height ||
      dx < 0 || dx >= width ||
      dy < 0 || dy >= height) {
      return false
    }
    const terrains = this.terrain.compositeArray
    const tsx = Math.floor(sx)
    const tsy = Math.floor(sy)
    const tdx = Math.floor(dx)
    const tdy = Math.floor(dy)
    if (tsx !== tdx) {
      // 如果水平网格坐标不同
      const unitY = (dy - sy) / (dx - sx)
      const step = sx < dx ? 1 : -1
      const start = tsx + step
      const end = tdx + step
      // 在水平方向上栅格化相交的地形
      for (let x = start; x !== end; x += step) {
        const _x = step > 0 ? x : x + 1
        const y = Math.floor(sy + (_x - sx) * unitY)
        // 连接起点和终点，连线被垂直网格线切分成若干点
        // 如果其中一个交点的网格区域是墙块，则不可视
        if (terrains[x + y * width] === 0b10) {
          return false
        }
      }
    }
    if (tsy !== tdy) {
      // 如果垂直网格坐标不同
      const unitX = (dx - sx) / (dy - sy)
      const step = sy < dy ? 1 : -1
      const start = tsy + step
      const end = tdy + step
      // 在垂直方向上栅格化相交的地形
      for (let y = start; y !== end; y += step) {
        const _y = step > 0 ? y : y + 1
        const x = Math.floor(sx + (_y - sy) * unitX)
        // 连接起点和终点，连线被水平网格线切分成若干点
        // 如果其中一个交点的网格区域是墙块，则不可视
        if (terrains[x + y * width] === 0b10) {
          return false
        }
      }
    }
    // 如果起点和终点的网格区域都不是墙块，则可视
    return terrains[tsx + tsy * width] !== 0b10 &&
           terrains[tdx + tdy * width] !== 0b10
  }

  /**
   * 获取两点之间射线的第一个墙块位置
   * @param sx 起点场景X
   * @param sy 起点场景Y
   * @param dx 终点场景X
   * @param dy 终点场景Y
   * @returns 墙块位置
   */
  public getWallPosByRay(sx: number, sy: number, dx: number, dy: number): Point | null {
    const width = this.width
    const height = this.height
    let target = null
    let weight = Infinity
    // 如果坐标点在场景网格外
    if (sx < 0 || sx >= width ||
      sy < 0 || sy >= height ||
      dx < 0 || dx >= width ||
      dy < 0 || dy >= height) {
      return target
    }
    const terrains = this.terrain.compositeArray
    const tsx = Math.floor(sx)
    const tsy = Math.floor(sy)
    const tdx = Math.floor(dx)
    const tdy = Math.floor(dy)
    if (tsx !== tdx) {
      // 如果水平网格坐标不同
      const unitY = (dy - sy) / (dx - sx)
      const step = sx < dx ? 1 : -1
      const start = tsx + step
      const end = tdx + step
      // 在水平方向上栅格化相交的地形
      for (let x = start; x !== end; x += step) {
        const _x = step > 0 ? x : x + 1
        const y = Math.floor(sy + (_x - sx) * unitY)
        // 连接起点和终点，连线被垂直网格线切分成若干点
        // 如果其中一个交点的网格区域是墙块
        if (terrains[x + y * width] === 0b10) {
          weight = Math.dist(sx, sy, x + 0.5, y + 0.5)
          target = {x, y}
          break
        }
      }
    }
    if (tsy !== tdy) {
      // 如果垂直网格坐标不同
      const unitX = (dx - sx) / (dy - sy)
      const step = sy < dy ? 1 : -1
      const start = tsy + step
      const end = tdy + step
      // 在垂直方向上栅格化相交的地形
      for (let y = start; y !== end; y += step) {
        const _y = step > 0 ? y : y + 1
        const x = Math.floor(sx + (_y - sy) * unitX)
        // 连接起点和终点，连线被水平网格线切分成若干点
        // 如果其中一个交点的网格区域是墙块
        if (terrains[x + y * width] === 0b10) {
          const dist = Math.dist(sx, sy, x + 0.5, y + 0.5)
          if (dist < weight) {
            weight = dist
            target = {x, y}
          }
          break
        }
      }
    }
    // 如果起点的网格区域是墙块
    if (target === null && terrains[tsx + tsy * width] === 0b10) {
      target = {x: tsx, y: tsy}
    }
    // 如果终点的网格区域是墙块
    if (target === null && terrains[tdx + tdy * width] === 0b10) {
      target = {x: tdx, y: tdy}
    }
    return target
  }

  /**
   * 测试场景对象初始化条件
   * @param node 场景对象数据
   * @returns 是否通过了条件检测
   */
  private static testConditions(node: SceneObjectData): boolean {
    // 如果场景对象未启用，则不通过
    if (node.enabled === false) return false
    for (const condition of node.conditions) {
      const type = condition.type
      const tester = SceneContext.objectCondTesters[condition.operation]
      const getter = SceneContext.objectCondVarGetters[type]
      const value = type[0] === 'g'
      // @ts-ignore
      ? getter(Variable.map, condition.key)
      : getter(SelfVariable.map, node.presetId)
      // 如果有一个条件不满足，则不通过
      if (tester(value, condition.value) === false) {
        return false
      }
    }
    return true
  }

  // 对象条件测试器
  private static objectCondTesters = {
    'equal': <T>(a: T, b: T) => a === b,
    'unequal': <T>(a: T, b: T) => a !== b,
    'greater-or-equal': <T>(a: T, b: T) => a >= b,
    'less-or-equal': <T>(a: T, b: T) => a <= b,
    'greater': <T>(a: T, b: T) => a > b,
    'less': <T>(a: T, b: T) => a < b,
  }

  // 对象条件变量访问器
  private static objectCondVarGetters = {
    'global-boolean': Attribute.BOOLEAN_GET,
    'global-number': Attribute.NUMBER_GET,
    'global-string': Attribute.STRING_GET,
    'self-boolean': Attribute.BOOLEAN_GET,
    'self-number': Attribute.NUMBER_GET,
    'self-string': Attribute.STRING_GET,
  }

  // 角色检查器集合
  private static actorInspectors = new class ActorInspectors {
    /**
     * 检查器 - 判断敌对角色
     * @param teamIndex1 队伍索引1
     * @param teamIndex2 队伍索引2
     * @returns 是不是敌对关系
     */
    'enemy' = (teamIndex1: number, teamIndex2: number): boolean => {
      return Team.getRelationByIndexes(teamIndex1, teamIndex2) === 0
    }

    /**
     * 检查器 - 判断友好角色
     * @param teamIndex1 队伍索引1
     * @param teamIndex2 队伍索引2
     * @returns 是不是友好关系
     */
    'friend' = (teamIndex1: number, teamIndex2: number): boolean => {
      return Team.getRelationByIndexes(teamIndex1, teamIndex2) === 1
    }

    /**
     * 检查器 - 判断小队角色
     * @param teamIndex1 队伍索引1
     * @param teamIndex2 队伍索引2
     * @returns 是不是小队角色
     */
    'team' = (teamIndex1: number, teamIndex2: number): boolean => {
      return teamIndex1 === teamIndex2
    }

    /**
     * 检查器 - 判断任意角色
     * @returns 是任意角色
     */
    'any' = (): true => true
  }

  // 角色过滤器集合
  private static actorFilters = new class ActorFilters {
    /**
     * 角色过滤器 - 最近距离
     * @param x 场景位置X
     * @param y 场景位置Y
     * @returns 目标角色
     */
    'nearest' = (x: number, y: number): Actor | undefined => {
      return this.compareDistance(x, y, false)
    }

    /**
     * 角色过滤器 - 最远距离
     * @param x 场景位置X
     * @param y 场景位置Y
     * @returns 目标角色
     */
    'farthest' = (x: number, y: number): Actor | undefined => {
      return this.compareDistance(x, y, true)
    }

    /**
     * 角色过滤器 - 最小属性值
     * @param x 场景位置X
     * @param y 场景位置Y
     * @param attribute 属性键
     * @returns 目标角色
     */
    'min-attribute-value' = (x: number, y: number, attribute: string): Actor | undefined => {
      return this.compareAttribute(attribute, false)
    }

    /**
     * 角色过滤器 - 最大属性值
     * @param x 场景位置X
     * @param y 场景位置Y
     * @param attribute 属性键
     * @returns 目标角色
     */
    'max-attribute-value' = (x: number, y: number, attribute: string): Actor | undefined => {
      return this.compareAttribute(attribute, true)
    }

    /**
     * 角色过滤器 - 最小属性比率
     * @param x 场景位置X
     * @param y 场景位置Y
     * @param attribute 属性键
     * @param divisor 除数属性键
     * @returns 目标角色
     */
    'min-attribute-ratio' = (x: number, y: number, attribute: string, divisor: string): Actor | undefined => {
      return this.compareAttributeRatio(attribute, divisor, false)
    }

    /**
     * 角色过滤器 - 最大属性比率
     * @param x 场景位置X
     * @param y 场景位置Y
     * @param attribute 属性键
     * @param divisor 除数属性键
     * @returns 目标角色
     */
    'max-attribute-ratio' = (x: number, y: number, attribute: string, divisor: string): Actor | undefined => {
      return this.compareAttributeRatio(attribute, divisor, true)
    }

    /**
     * 角色过滤器 - 随机
     * @returns 目标角色
     */
    'random' = (): Actor | undefined => {
      const actorPool: CacheList<Actor> = CacheList.instance
      return actorPool.count !== 0
      ? actorPool[Math.randomInt(0, actorPool.count - 1)]
      : undefined
    }

    /**
     * 角色过滤器 - 选择
     * @returns 目标角色
     */
    'select' = (): Actor | undefined => {
      let target
      let weight = Infinity
      const actorPool: CacheList<Actor> = CacheList.instance
      const {x, y, top, left, right, bottom} = Scene.selection
      const count = actorPool.count
      for (let i = 0; i < count; i++) {
        const actor = actorPool[i]!
        const h = actor.collider.half
        const t = actor.y - h + top
        const l = actor.x - h + left
        const r = actor.x + h + right
        const b = actor.y + h + bottom
        if (x >= l && x <= r && y >= t && y <= b) {
          const distance = Math.dist(x, y, actor.x, actor.y)
          if (distance < weight) {
            target = actor
            weight = distance
          }
        }
      }
      return target
    }

    /**
     * 角色过滤器 - 比较距离大小
     * @param x 场景位置X
     * @param y 场景位置Y
     * @param greater 是否选择更大距离的角色
     * @returns 目标角色
     */
    private compareDistance = (x: number, y: number, greater: boolean): Actor | undefined => {
      let target: Actor | undefined
      let weight = greater ? -Infinity : Infinity
      const actorPool: CacheList<Actor> = CacheList.instance
      const count = actorPool.count
      for (let i = 0; i < count; i++) {
        const actor = actorPool[i]!
        const distX = x - actor.x
        const distY = y - actor.y
        const dist = distX ** 2 + distY ** 2
        if (dist > weight === greater) {
          weight = dist
          target = actor
        }
      }
      return target
    }

    /**
     * 角色过滤器 - 比较属性值大小
     * @param key 属性键
     * @param greater 是否选择属性值更大的角色
     * @returns 目标角色
     */
    private compareAttribute = (key: string, greater: boolean): Actor | undefined => {
      let target: Actor | undefined
      let weight = greater ? -Infinity : Infinity
      const actorPool: CacheList<Actor> = CacheList.instance
      const count = actorPool.count
      for (let i = 0; i < count; i++) {
        const actor = actorPool[i]!
        const value = actor.attributes[key]
        if (typeof value === 'number' && value > weight === greater) {
          target = actor
          weight = value
        }
      }
      return target
    }

    /**
     * 角色过滤器 - 比较属性比率大小
     * @param key 属性键1
     * @param divisor 属性键2
     * @param greater 是否选择属性值比率更大的角色
     * @returns 目标角色
     */
    private compareAttributeRatio = (key: string, divisor: string, greater: boolean): Actor | undefined => {
      let target: Actor | undefined
      let weight = greater ? -Infinity : Infinity
      const actorPool: CacheList<Actor> = CacheList.instance
      const count = actorPool.count
      for (let i = 0; i < count; i++) {
        const actor = actorPool[i]!
        const attributes = actor.attributes
        // @ts-ignore
        const ratio = attributes[key] / attributes[divisor]
        if (ratio > weight === greater) {
          target = actor
          weight = ratio
        }
      }
      return target
    }
  }
}

/** ******************************** 场景地形管理器 ******************************** */

class SceneTerrainManager {
  /** 绑定的场景上下文对象 */
  public scene: SceneContext
  /** 场景原始地形数组 */
  public rawArray: Uint8Array
  /** 场景合成地形数组 */
  public compositeArray: Uint8Array
  /** 场景地形数组列表 */
  public arrays: [Uint8Array, Uint8Array]
  /** 场景地形数组水平数量 */
  public width: number
  /** 场景地形数组垂直数量 */
  public height: number

  /**
   * 场景地形数组对象
   * @param scene 场景上下文对象
   * @param width 宽度
   * @param height 高度
   * @param copy 复制数据
   */
  constructor(scene: SceneContext, width: number, height: number) {
    const rawArray = new Uint8Array(width * height)
    const compositeArray = new Uint8Array(width * height)
    this.scene = scene
    this.rawArray = rawArray
    this.compositeArray = compositeArray
    this.arrays = [rawArray, compositeArray]
    this.width = width
    this.height = height
  }

  /**
   * 获取地形数据
   * @param x 水平位置
   * @param y 垂直位置
   * @param z 地形图层(0:原始, 1:合成)(默认:1)
   * @returns 地形码(0:地面, 1:水面, 2:墙块)
   */
  public get(x: number, y: number, z: 0 | 1 = 1): -1 | TerrainCode {
    const {width, height} = this
    if (x >= 0 && x < width && y >= 0 && y < height) {
      return this.arrays[z][x + y * width] as TerrainCode
    }
    return -1
  }

  /**
   * 设置地形数据
   * @param x 水平位置
   * @param y 垂直位置
   * @param terrain 地形码(0:地面, 1:水面, 2:墙块)
   */
  public set(x: number, y: number, terrain: TerrainCode): void {
    if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
      this.rawArray[x + y * this.width] = terrain
      this.scene.updateTerrain(x, y)
    }
  }

  /**
   * 保存数据
   * @returns 地形存档数据
   */
  public saveData(): string {
    return Codec.encodeTerrains(this.rawArray)
  }
}

/** ******************************** 场景障碍管理器 ******************************** */

class SceneObstacleManager {
  /** 场景障碍数组 */
  public array: Uint32Array
  /** 场景障碍数组水平数量 */
  public width: number
  /** 场景障碍数组垂直数量 */
  public height: number

  /**
   * 场景障碍数组对象
   * @param width 宽度
   * @param height 高度
   */
  constructor(width: number, height: number) {
    this.array = new Uint32Array(width * height)
    this.width = width
    this.height = height
  }

  /**
   * 获取障碍数据
   * @param x 水平位置
   * @param y 垂直位置
   * @returns 障碍码(-1: 溢出, 0: 无障碍, >0: 有障碍)
   */
  public get(x: number, y: number): number {
    const {width, height} = this
    if (x >= 0 && x < width && y >= 0 && y < height) {
      return this.array[x + y * width]
    }
    return -1
  }

  /**
   * 更新场景对象的障碍(根据对象的位置来分配)
   * @param actor 角色对象
   */
  public update(actor: Actor): void {
    let gridId = -1
    if (actor.collider.weight !== 0) {
      const gridX = Math.floor(actor.x)
      const gridY = Math.floor(actor.y)
      if (this.isValidPosition(gridX, gridY)) {
        gridId = gridX + gridY * this.width
      }
    }
    if (actor.gridId !== gridId) {
      // 从旧的网格中删除障碍
      if (actor.gridId !== -1) {
        this.array[actor.gridId]--
      }
      // 添加障碍到新的网格
      if (gridId !== -1) {
        this.array[gridId]++
      }
      actor.gridId = gridId
    }
  }

  /**
   * 添加场景对象障碍到数组中
   * @param actor 角色对象
   */
  public append(actor: Actor): void {
    if (actor.collider.weight !== 0) {
      const gridX = Math.floor(actor.x)
      const gridY = Math.floor(actor.y)
      if (this.isValidPosition(gridX, gridY)) {
        const gridId = gridX + gridY * this.width
        this.array[gridId]++
        actor.gridId = gridId
      }
    }
  }

  /**
   * 从管理器中移除场景对象的障碍
   * @param actor 角色对象
   */
  public remove(actor: Actor): void {
    if (actor.gridId !== -1) {
      this.array[actor.gridId]--
      actor.gridId = -1
    }
  }

  /**
   * 检查网格的位置是否有效
   * @param gridX 网格位置X
   * @param gridY 网格位置Y
   * @returns 是否在有效范围内
   */
  public isValidPosition(gridX: number, gridY: number): boolean {
    return gridX >= 0 && gridX < this.width && gridY >= 0 && gridY < this.height
  }
}

/** ******************************** 场景视差图管理器 ******************************** */

class SceneParallaxManager {
  /** 场景上下文对象 */
  public scene: SceneContext
  /** 背景层视差图群组 */
  public backgrounds: SceneParallaxGroup
  /** 前景层视差图群组 */
  public foregrounds: SceneParallaxGroup
  /** 对象层视差图群组 */
  public doodads: SceneParallaxGroup
  /** 瓦片地图群组 */
  public tilemaps: SceneParallaxGroup
  /** 视差图群组列表 */
  public groups: Array<SceneParallaxGroup>
  /** 正在重新加载地形 */
  private reloadingTerrains?: true
  /** 正在排序视差图层 */
  private sorting?: true

  /**
   * 场景视差图管理器
   * @param scene 场景上下文对象
   */
  constructor(scene: SceneContext) {
    this.scene = scene
    // 包含背景层、前景层、对象层对象列表
    // 每个列表可加入视差图或瓦片地图对象(混合)
    this.backgrounds = new SceneParallaxGroup()
    this.foregrounds = new SceneParallaxGroup()
    this.doodads = new SceneParallaxGroup()
    this.tilemaps = new SceneParallaxGroup()
    this.groups = [
      this.backgrounds,
      this.foregrounds,
      this.doodads,
    ]
  }

  /**
   * 获取指定位置的图块地形
   * @param x 场景X(整数)
   * @param y 场景Y(整数)
   * @returns 地形码
   */
  public getTileTerrain(x: number, y: number): TerrainCode {
    for (const tilemap of this.tilemaps as Array<SceneTilemap>) {
      const terrain = tilemap.getTileTerrain(x, y)
      if (terrain !== 0) return terrain
    }
    return 0
  }

  /** 重新加载地形障碍 */
  private reloadTerrains(): void {
    if (!this.reloadingTerrains) {
      this.reloadingTerrains = true
      Callback.push(() => {
        delete this.reloadingTerrains
        this.scene.loadTerrains()
      })
    }
  }

  /**
   * 添加视差图到管理器中
   * @param parallax 视差图或瓦片地图对象
   */
  public append(parallax: SceneParallax | SceneTilemap): void {
    if (parallax.parent === null) {
      parallax.parent = this
      // 根据图层添加到对应的子列表中
      switch (parallax.layer) {
        case 'background':
          this.backgrounds.push(parallax)
          break
        case 'foreground':
          this.foregrounds.push(parallax)
          break
        case 'object':
          this.doodads.push(parallax)
          break
      }
      this.scene.entity.add(parallax)
      if (this.scene.enabled) {
        parallax.autorun()
      }

      // 排序视差图层
      if (!this.sorting) {
        this.sorting = true
        Callback.push(() => {
          delete this.sorting
          this.sort()
        })
      }

      // 更新图块地形
      if (parallax instanceof SceneTilemap) {
        this.reloadTerrains()
      }
    }
  }

  /**
   * 从管理器中移除视差图
   * @param parallax 视差图或瓦片地图对象
   */
  public remove(parallax: SceneParallax | SceneTilemap): void {
    if (parallax.parent === this) {
      parallax.parent = null
      for (const group of this.groups) {
        if (group.remove(parallax)) {
          break
        }
      }
      if (parallax instanceof SceneTilemap) {
        this.tilemaps.remove(parallax)
        if (!this.scene.destroyed) {
          this.reloadTerrains()
        }
      }
      this.scene.entity.remove(parallax)
    }
  }

  /**
   * 更新管理器分组中的场景视差图
   * @param deltaTime 增量时间(毫秒)
   */
  public update(deltaTime: number): void {
    for (const group of this.groups) {
      for (const parallax of group) {
        parallax.update(deltaTime)
      }
    }
  }

  /** 排序视差图和瓦片地图图层 */
  private sort(): void {
    for (const group of this.groups) {
      group.sort()
    }
    this.tilemaps.length = 0
    for (const group of this.groups) {
      for (const parallax of group) {
        if (parallax instanceof SceneTilemap) {
          this.tilemaps.push(parallax)
        }
      }
    }
    // 颠倒瓦片地图顺序
    // 优先读取上层地形数据
    this.tilemaps.reverse()
  }

  /** 发送自动执行事件 */
  public autorun(): void {
    for (const group of this.groups) {
      for (const parallax of group) {
        parallax.autorun()
      }
    }
  }

  /** 销毁管理器中的视差图和瓦片地图 */
  public destroy(): void {
    for (const group of this.groups) {
      let i = group.length
      while (--i >= 0) {
        group[i].destroy()
      }
    }
  }

  /**
   * 保存视差图数据
   * @returns 视差图(瓦片地图)存档数据列表
   */
  public saveData(): Array<ParallaxSaveData | TilemapSaveData> {
    const data = []
    for (const group of this.groups) {
      for (const entity of group) {
        if ('saveData' in entity) {
          data.push(entity.saveData())
        }
      }
    }
    return data
  }

  /**
   * 加载视差图数据
   * @param parallaxes 视差图(瓦片地图)存档数据列表
   */
  public loadData(parallaxes: Array<ParallaxSaveData | TilemapSaveData>): void {
    const presets = Scene.presets
    const scene = this.scene
    for (const savedData of parallaxes) {
      const preset = presets[savedData.presetId]
      if (preset) {
        Object.setPrototypeOf(savedData, preset)
        switch (preset.class) {
          case 'parallax':
            // 重新创建视差图实例
            this.append(new SceneParallax(savedData as unknown as SceneParallaxData))
            continue
          case 'tilemap':
            // 重新创建瓦片地图实例
            this.append(new SceneTilemap(scene, savedData as unknown as SceneTilemapData))
            continue
        }
      }
    }
    this.sort()
  }
}

/** ******************************** 场景视差图群组 ******************************** */

class SceneParallaxGroup extends Array<SceneParallax | SceneTilemap> {
  /** 渲染视差图或瓦片地图 */
  public render(): void {
    for (const parallax of this) {
      if (parallax.visible) {
        parallax.draw()
      }
    }
  }

  /** 排序图层 */
  public sort(): this {
    return super.sort(SceneParallaxGroup.sorter)
  }

  /** 视差图层排序器函数 */
  private static sorter = (
    a: SceneParallax | SceneTilemap,
    b: SceneParallax | SceneTilemap,
  ): number => a.order - b.order
}

/** ******************************** 场景视差图 ******************************** */

class SceneParallax {
  /** 视差图名称 */
  public name: string
  /** 视差图对象实体ID */
  public entityId: string
  /** 视差图预设数据ID */
  public presetId: string
  /** 视差图独立变量ID */
  public selfVarId: string
  /** 视差图可见性 */
  public visible: boolean
  /** 视差图图层 */
  public layer: ParallaxLayer
  /** 视差图排序优先级 */
  public order: number
  /** 视差图光线采样模式 */
  public light: LightSamplingMode
  /** 视差图混合模式 */
  public blend: BlendingMode
  /** 视差图不透明度 */
  public opacity: number
  /** 视差图水平位置 */
  public x: number
  /** 视差图垂直位置 */
  public y: number
  /** 视差图水平缩放系数 */
  public scaleX: number
  /** 视差图垂直缩放系数 */
  public scaleY: number
  /** 视差图水平重复次数 */
  public repeatX: number
  /** 视差图垂直重复次数 */
  public repeatY: number
  /** 视差图水平锚点 */
  public anchorX: number
  /** 视差图垂直锚点 */
  public anchorY: number
  /** 视差图水平偏移位置 */
  public offsetX: number
  /** 视差图垂直偏移位置 */
  public offsetY: number
  /** 水平视差系数 */
  public parallaxFactorX: number
  /** 垂直视差系数 */
  public parallaxFactorY: number
  /** 视差图水平移动速度 */
  public shiftSpeedX: number
  /** 视差图垂直移动速度 */
  public shiftSpeedY: number
  /** 视差图图像色调 */
  public tint: ImageTint
  /** 视差图图像纹理 */
  public texture: ImageTexture | null
  /** 视差图纹理水平偏移 */
  public shiftX: number
  /** 视差图纹理垂直偏移 */
  public shiftY: number
  /** 视差图更新器模块列表 */
  public updaters: UpdaterList
  /** 视差图事件映射表 */
  public events: HashMap<CommandFunctionList>
  /** 视差图脚本管理器 */
  public script: ScriptManager
  /** 视差图的父级对象 */
  public parent: SceneParallaxManager | null
  /** 已开始状态 */
  private started: boolean
  /** 是否已销毁 */
  public destroyed: boolean
  /** 图像文件ID */
  private _image!: string

  /**
   * 场景视差图对象
   * @param parallax 场景中预设的视差图数据
   */
  constructor(parallax: ParallaxOptions = {}) {
    this.name = parallax.name ?? ''
    this.entityId = ''
    this.presetId = parallax.presetId ?? ''
    this.selfVarId = parallax.selfVarId ?? ''
    this.visible = parallax.visible ?? true
    this.layer = parallax.layer ?? 'background'
    this.order = parallax.order ?? 0
    this.light = parallax.light ?? 'global'
    this.blend = parallax.blend ?? 'normal'
    this.opacity = parallax.opacity ?? 1
    this.x = parallax.x ?? 0
    this.y = parallax.y ?? 0
    this.scaleX = parallax.scaleX ?? 1
    this.scaleY = parallax.scaleY ?? 1
    this.repeatX = parallax.repeatX ?? 1
    this.repeatY = parallax.repeatY ?? 1
    this.anchorX = parallax.anchorX ?? 0
    this.anchorY = parallax.anchorY ?? 0
    this.offsetX = parallax.offsetX ?? 0
    this.offsetY = parallax.offsetY ?? 0
    this.parallaxFactorX = parallax.parallaxFactorX ?? 1
    this.parallaxFactorY = parallax.parallaxFactorY ?? 1
    this.shiftSpeedX = parallax.shiftSpeedX ?? 0
    this.shiftSpeedY = parallax.shiftSpeedY ?? 0
    this.tint = parallax.tint ? [...parallax.tint] : [0, 0, 0, 0]
    this.texture = null
    this.image = parallax.image ?? ''
    this.shiftX = 0
    this.shiftY = 0
    this.updaters = new UpdaterList()
    this.events = parallax.events ?? {}
    this.script = ScriptManager.create(this, parallax.scripts ?? [])
    this.parent = null
    this.started = false
    this.destroyed = false
    GlobalEntityManager.add(this)
    this.emit('create')
  }

  /** 图像文件ID */
  public get image(): string {
    return this._image
  }
  public set image(value: string) {
    if (this._image !== value) {
      this._image = value
      // 如果存在纹理，销毁
      if (this.texture) {
        this.texture.destroy()
        this.texture = null
      }
      if (value) {
        this.texture = new ImageTexture(value)
      }
    }
  }

  /**
   * 更新场景视差图
   * @param deltaTime 增量时间(毫秒)
   */
  public update(deltaTime: number): void {
    this.updaters.update(deltaTime)

    // 如果视差图的移动速度不为0，计算纹理滚动的位置
    if (this.shiftSpeedX !== 0 || this.shiftSpeedY !== 0) {
      if (this.texture?.complete) {
        this.shiftX = (
          this.shiftX
        + this.shiftSpeedX
        * deltaTime / 1000
        / this.texture.width
        ) % 1
        this.shiftY = (
          this.shiftY
        + this.shiftSpeedY
        * deltaTime / 1000
        / this.texture.height
        ) % 1
      }
    }
  }

  /** 绘制场景视差图 */
  public draw(): void {
    const texture = this.texture
    if (!texture?.complete) {
      return
    }
    const gl = GL
    const parallax = this
    const vertices = gl.arrays[0].float32
    const pw = texture.width
             * parallax.scaleX
             * parallax.repeatX
    const ph = texture.height
             * parallax.scaleY
             * parallax.repeatY
    const ox = parallax.offsetX
    const oy = parallax.offsetY
    const ax = parallax.anchorX * pw
    const ay = parallax.anchorY * ph
    // 获取视差图锚点在场景中的像素位置，并计算出实际位置
    const anchor = Scene.getParallaxAnchor(parallax)
    const dl = anchor.x - ax + ox
    const dt = anchor.y - ay + oy
    const dr = dl + pw
    const db = dt + ph
    const cl = Camera.scrollLeft
    const ct = Camera.scrollTop
    const cr = Camera.scrollRight
    const cb = Camera.scrollBottom
    // 如果视差图在屏幕中可见，则绘制它
    if (dl < cr && dr > cl && dt < cb && db > ct) {
      const sl = this.shiftX
      const st = this.shiftY
      const sr = sl + parallax.repeatX
      const sb = st + parallax.repeatY
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
      gl.blend = parallax.blend
      gl.alpha = parallax.opacity
      const program = gl.imageProgram.use()
      const tint = parallax.tint
      const red = tint[0] / 255
      const green = tint[1] / 255
      const blue = tint[2] / 255
      const gray = tint[3] / 255
      const modeMap = SceneParallax.lightSamplingModes
      const lightMode = parallax.light
      const lightModeIndex = modeMap[lightMode]
      const matrix = gl.matrix.project(
        gl.flip,
        cr - cl,
        cb - ct,
      ).translate(-cl, -ct)
      gl.bindVertexArray(program.vao.a110)
      gl.vertexAttrib1f(program.a_Opacity, 1)
      gl.uniformMatrix3fv(program.u_Matrix, false, matrix)
      gl.uniform1i(program.u_LightMode, lightModeIndex)
      if (lightMode === 'anchor') {
        // 如果是光线采样模式为锚点采样，上传锚点位置
        gl.uniform2f(program.u_LightCoord, anchor.x, anchor.y)
      }
      gl.uniform1i(program.u_ColorMode, 0)
      gl.uniform4f(program.u_Tint, red, green, blue, gray)
      gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STREAM_DRAW, 0, 16)
      gl.bindTexture(gl.TEXTURE_2D, texture.base.glTexture)
      gl.drawArrays(gl.TRIANGLE_FAN, 0, 4)
    }
  }

  /**
   * 调用视差图事件
   * @param type 视差图事件类型
   */
  public callEvent(type: string): void {
    const commands = this.events[type]
    if (commands) {
      const event = new EventHandler(commands)
      event.triggerObject = this
      event.selfVarId = this.selfVarId
      EventHandler.call(event, this.updaters)
    }
  }

  /**
   * 调用视差图事件和脚本
   * @param type 视差图事件类型
   */
  public emit(type: string): void {
    this.callEvent(type)
    this.script.emit(type, this)
  }

  /** 自动执行 */
  public autorun(): void {
    if (this.started === false) {
      this.started = true
      this.emit('autorun')
    }
  }

  /** 销毁视差图 */
  public destroy(): void {
    if (!this.destroyed) {
      this.emit('destroy')
      this.destroyed = true
      this.parent?.remove(this)
      GlobalEntityManager.remove(this)
      if (this.texture) {
        this.texture.destroy()
        this.texture = null
      }
    }
  }

  /** 异步销毁视差图 */
  public destroyAsync(): void {
    Callback.push(() => {
      this.destroy()
    })
  }

  /**
   * 保存视差图数据
   * @returns 视差图存档数据
   */
  public saveData(): ParallaxSaveData {
    return {
      name: this.name,
      entityId: this.entityId,
      presetId: this.presetId,
      selfVarId: this.selfVarId,
      visible: this.visible,
      x: this.x,
      y: this.y,
    }
  }

  /** 光线采样模式映射表(字符串 -> 着色器中的采样模式代码) */
  private static lightSamplingModes: ParallaxLightSamplingMap = {raw: 0, global: 1, anchor: 2, ambient: 3}
}

/** ******************************** 场景瓦片地图 ******************************** */

class SceneTilemap {
  /** 瓦片地图名称 */
  public name: string
  /** 瓦片地图对象实体ID */
  public entityId: string
  /** 瓦片地图预设数据ID */
  public presetId: string
  /** 瓦片地图独立变量ID */
  public selfVarId: string
  /** 瓦片地图可见性 */
  public visible: boolean
  /** 瓦片地图图层 */
  public layer: TilemapLayer
  /** 瓦片地图排序优先级 */
  public order: number
  /** 瓦片地图光线采样模式 */
  public light: TilemapLightSamplingMode
  /** 瓦片地图混合模式 */
  public blend: BlendingMode
  /** 瓦片地图水平位置 */
  public x: number
  /** 瓦片地图垂直位置 */
  public y: number
  /** 瓦片地图的宽度 */
  public width: number
  /** 瓦片地图的高度 */
  public height: number
  /** 瓦片地图水平锚点 */
  public anchorX: number
  /** 瓦片地图垂直锚点 */
  public anchorY: number
  /** 瓦片地图水平偏移位置 */
  public offsetX: number
  /** 瓦片地图垂直偏移位置 */
  public offsetY: number
  /** 瓦片地图水平视差系数 */
  public parallaxFactorX: number
  /** 瓦片地图垂直视差系数 */
  public parallaxFactorY: number
  /** 瓦片地图不透明度 */
  public opacity: number
  /** 图块开始位置X */
  public tileStartX: number
  /** 图块开始位置Y */
  public tileStartY: number
  /** 图块结束位置X */
  public tileEndX: number
  /** 图块结束位置Y */
  public tileEndY: number
  /** 瓦片地图的图块数组 */
  public tiles: Uint32Array
  /** {ID:图块数据}映射表 */
  public tileData: TilemapTileDataMap
  /** {ID:图像数据}映射表 */
  public imageData: TilemapImageDataMap
  /** {数字ID:图块组ID}映射表 */
  public tilesetMap: HashMap<string>
  /** {图块组ID:数字ID}映射表 */
  public reverseMap: HashMap<number>
  /** {ID:纹理}映射表 */
  public textures: HashMap<BaseTexture>
  /** 瓦片地图的更新器模块列表 */
  public updaters: UpdaterList
  /** 瓦片地图的事件映射表 */
  public events: HashMap<CommandFunctionList>
  /** 瓦片地图的脚本管理器 */
  public script: ScriptManager
  /** 场景上下文对象 */
  public scene: SceneContext
  /** 瓦片地图的父级对象 */
  public parent: SceneParallaxManager | null
  /** 纹理是否已加载 */
  private loaded: boolean
  /** 已开始状态 */
  private started: boolean
  /** 是否已销毁 */
  public destroyed: boolean

  /**
   * 场景瓦片地图对象
   * @param scene 场景上下文对象
   * @param tilemap 场景中预设的瓦片地图数据
   */
  constructor(scene: SceneContext, tilemap: TilemapOptions = {}) {
    this.scene = scene
    this.name = tilemap.name ?? ''
    this.entityId = ''
    this.presetId = tilemap.presetId ?? ''
    this.selfVarId = tilemap.selfVarId ?? ''
    this.visible = tilemap.visible ?? true
    this.layer = tilemap.layer ?? 'background'
    this.order = tilemap.order ?? 0
    this.light = tilemap.light ?? 'global'
    this.blend = tilemap.blend ?? 'normal'
    this.x = tilemap.x ?? 0
    this.y = tilemap.y ?? 0
    this.width = tilemap.width ?? 0
    this.height = tilemap.height ?? 0
    this.anchorX = tilemap.anchorX ?? 0
    this.anchorY = tilemap.anchorY ?? 0
    this.offsetX = tilemap.offsetX ?? 0
    this.offsetY = tilemap.offsetY ?? 0
    this.parallaxFactorX = tilemap.parallaxFactorX ?? 1
    this.parallaxFactorY = tilemap.parallaxFactorY ?? 1
    this.opacity = tilemap.opacity ?? 1
    this.tileStartX = tilemap.tileStartX ?? Math.round(this.x - this.width * this.anchorX)
    this.tileStartY = tilemap.tileStartY ?? Math.round(this.y - this.height * this.anchorY)
    this.tileEndX = tilemap.tileEndX ?? this.tileStartX + this.width
    this.tileEndY = tilemap.tileEndY ?? this.tileStartY + this.height
    this.tiles = tilemap.code ? Codec.decodeTiles(tilemap.code, this.width, this.height) : new Uint32Array(this.width * this.height)
    this.tileData = {0: null}
    this.imageData = {0: null}
    this.tilesetMap = tilemap.tilesetMap ?? {}
    this.reverseMap = {}
    this.textures = {}
    this.updaters = new UpdaterList()
    this.events = tilemap.events ?? {}
    this.script = ScriptManager.create(this, tilemap.scripts ?? [])
    this.parent = null
    this.loaded = false
    this.started = false
    this.destroyed = false
    GlobalEntityManager.add(this)

    // 创建键值相反的图块组映射表
    this.createReverseMap(this.tilesetMap)

    // 创建所有图块数据
    this.createAllTileData()

    // 加载纹理并创建图块数据
    this.load()

    // 发送创建事件
    this.emit('create')
  }

  /** 加载 */
  private async load(): Promise<void> {
    const promise = this.loadTextures()
    if (!this.loaded) {
      this.draw = Function.empty
      await promise
      // @ts-ignore
      delete this.draw
    }
    this.createAllImageData()
  }

  /**
   * 获取指定位置的图块地形
   * @param x 场景X(整数)
   * @param y 场景Y(整数)
   * @returns 地形编码
   */
  public getTileTerrain(x: number, y: number): TerrainCode {
    if (x >= this.tileStartX && x < this.tileEndX && y >= this.tileStartY && y < this.tileEndY) {
      const tx = x - this.tileStartX
      const ty = y - this.tileStartY
      const tile = this.tiles[tx + ty * this.width]
      return this.tileData[tile & 0xffffff00]?.terrain ?? 0
    }
    return 0
  }

  /**
   * 创建键值相反的图块组映射表
   * @param tilesetMap {ID:图块组}映射表
   */
  private createReverseMap(tilesetMap: HashMap<string>): void {
    for (const [index, guid] of Object.entries(tilesetMap)) {
      this.reverseMap[guid!] = parseInt(index)
    }
  }

  /** 加载图块纹理 */
  private async loadTextures(): Promise<void> {
    await new Promise(resolve => {
      const tiles = this.tiles
      const length = tiles.length
      const textures = this.textures
      // 如果是非空图块，同步加载图块组纹理
      for (let i = 0; i < length; i++) {
        const tile = tiles[i]
        if (tile !== 0) {
          this.loadTexture(tile)
        }
      }
      // 不存在图块纹理，立即返回
      const list = Object.values(textures) as Array<BaseTexture>
      if (list.length === 0) {
        return resolve(void 0)
      }
      // 等待加载所有图块纹理
      let loaded = 0
      const callback = () => {
        if (++loaded === list.length) {
          // 全部纹理加载后完成Promise
          if (this.textures === textures) {
            this.loaded = true
            return resolve(void 0)
          }
        }
      }
      for (const texture of list) {
        // 侦听纹理加载完毕事件
        texture.on('load', callback)
      }
    })
  }

  /**
   * 加载纹理
   * @param tile 图块码
   * @param sync 是否同步加载纹理
   * @param callback 回调函数
   */
  private loadTexture(tile: number, callback?: CallbackFunction): void {
    const tileData = this.tileData[tile & 0xffffff00]
    if (tileData) {
      let texture
      switch (tileData.type) {
        case 'normal': {
          const guid = tileData.tileset.image
          texture = this.textures[guid]
          if (guid && texture === undefined) {
            texture = GL.createImageTexture(guid, {magFilter: GL.NEAREST})
            this.textures[guid] = texture
          }
          break
        }
        case 'auto': {
          const guid = tileData.autoTile.image
          texture = this.textures[guid]
          if (guid && texture === undefined) {
            texture = GL.createImageTexture(guid, {magFilter: GL.NEAREST})
            this.textures[guid] = texture
          }
          break
        }
      }
      if (callback) {
        texture?.on('load', callback)
      }
    }
  }

  /** 创建所有图块数据 */
  private createAllTileData(): void {
    const tiles = this.tiles
    const length = tiles.length
    for (let i = 0; i < length; i++) {
      this.createTileData(tiles[i])
    }
  }

  /** 创建所有图像数据 */
  private createAllImageData(): void {
    const tiles = this.tiles
    const length = tiles.length
    for (let i = 0; i < length; i++) {
      this.createImageData(tiles[i])
    }
  }

  /**
   * 创建图块数据
   * @param tile 图块码
   */
  private createTileData(tile: number): void {
    // 如果当前图块数据未创建
    const dataId = tile & 0xffffff00
    if (this.tileData[dataId] === undefined) {
      const guid = this.tilesetMap[tile >> 24]!
      const tileset = Data.tilesets[guid]
      // 如果存在图块组数据
      if (tileset !== undefined) {
        switch (tileset.type) {
          case 'normal': {
            const tx = tile >> 8 & 0xff
            const ty = tile >> 16 & 0xff
            const id = tx + ty * tileset.width
            this.tileData[dataId] = {
              x: tx,
              y: ty,
              type: 'normal',
              tileset: tileset,
              terrain: tileset.terrains[id],
              tag: tileset.tags[id],
              priority: tileset.priorities[id] + tileset.globalPriority,
            }
            return
          }
          case 'auto': {
            const tx = tile >> 8 & 0xff
            const ty = tile >> 16 & 0xff
            const id = tx + ty * tileset.width
            const autoTile = tileset.tiles[id]
            if (!autoTile) break
            const template = Data.autotiles[autoTile.template]
            if (!template) break
            this.tileData[dataId] = {
              x: tx,
              y: ty,
              type: 'auto',
              tileset: tileset,
              terrain: tileset.terrains[id],
              tag: tileset.tags[id],
              priority: tileset.priorities[id] + tileset.globalPriority,
              autoTile: autoTile,
              template: template,
            }
            return
          }
        }
      }
      // 没能创建图块数据，使用null占位，避免再次进行创建
      this.tileData[dataId] = null
    }
  }

  /**
   * 创建图像数据
   * @param tile 图块码
   */
  private createImageData(tile: number): void {
    // 如果图像数据未创建
    if (this.imageData[tile] === undefined) {
      const tileData = this.tileData[tile & 0xffffff00]
      // 如果存在图块组数据
      if (tileData) {
        switch (tileData.type) {
          case 'normal': {
            // 如果存在纹理
            const tileset = tileData.tileset
            const texture = this.textures[tileset.image]
            if (!texture) break
            const scene = this.scene
            const tw = scene.tileWidth
            const th = scene.tileHeight
            const sw = tileset.tileWidth
            const sh = tileset.tileHeight
            const sx = sw * tileData.x
            const sy = sh * tileData.y
            const dl = (tw - sw) / 2 + tileset.globalOffsetX
            const dt = (th - sh)     + tileset.globalOffsetY
            const dr = dl + sw
            const db = dt + sh
            // 对图块纹理的采样坐标进行微调(避免一些渲染间隙)
            let sl = (sx + 0.002) / texture.width
            let sr = (sx + sw - 0.002) / texture.width
            if (tile & 0b1) {
              // 普通图块水平翻转
              const temporary = sl
              sl = sr
              sr = temporary
            }
            const st = (sy + 0.002) / texture.height
            const sb = (sy + sh - 0.002) / texture.height
            const array = new Float32Array(11)
            array[0] = texture.index
            array[1] = tileData.priority
            array[2] = 1
            array[3] = dl
            array[4] = dt
            array[5] = dr
            array[6] = db
            array[7] = sl
            array[8] = st
            array[9] = sr
            array[10] = sb
            this.imageData[tile] = array
            return
          }
          case 'auto': {
            const tileset = tileData.tileset
            const tx = tile >> 8 & 0xff
            const ty = tile >> 16 & 0xff
            const id = tx + ty * tileset.width
            const autoTile = tileset.tiles[id] as AutoTileData
            const texture = this.textures[autoTile.image]
            if (!texture) break
            // 如果存在自动图块模板和纹理
            const nodeId = tile & 0b111111
            const node = tileData.template.nodes[nodeId]
            if (!node) break
            // 如果存在图块节点
            const scene = this.scene
            const tw = scene.tileWidth
            const th = scene.tileHeight
            const frames = node.frames
            const length = frames.length
            const sw = tileset.tileWidth
            const sh = tileset.tileHeight
            const dl = (tw - sw) / 2 + tileset.globalOffsetX
            const dt = (th - sh)     + tileset.globalOffsetY
            const dr = dl + sw
            const db = dt + sh
            // 基础数据长度7，每一个动画帧加长度4
            const array = new Float32Array(length * 4 + 7)
            // 0：纹理索引，1：图块优先级，2：动画帧数量
            array[0] = texture.index
            array[1] = tileData.priority
            array[2] = length
            // 图块绘制的相对坐标
            array[3] = dl
            array[4] = dt
            array[5] = dr
            array[6] = db
            const ox = autoTile.x
            const oy = autoTile.y
            const width = texture.width
            const height = texture.height
            // 遍历设置动画帧数据
            for (let i = 0; i < length; i++) {
              const index = i * 4 + 7
              const frame = frames[i]
              const sx = (ox + (frame & 0xff)) * sw
              const sy = (oy + (frame >> 8)) * sh
              const sl = (sx + 0.002) / width
              const st = (sy + 0.002) / height
              const sr = (sx + sw - 0.002) / width
              const sb = (sy + sh - 0.002) / height
              // 设置4个纹理采样坐标
              array[index    ] = sl
              array[index + 1] = st
              array[index + 2] = sr
              array[index + 3] = sb
            }
            this.imageData[tile] = array
            return
          }
        }
      }
      // 没能创建图块数据，使用null占位，避免再次进行创建
      this.imageData[tile] = null
    }
  }

  /**
   * 设置图块
   * @param x 瓦片地图X
   * @param y 瓦片地图Y
   * @param tilesetId 图块组ID
   * @param tx 图块X
   * @param ty 图块Y
   */
  public setTile(x: number, y: number, tilesetId: string, tx: number, ty: number): void {
    if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
      const tileset = Data.tilesets[tilesetId]
      if (tileset && tx >= 0 && tx < tileset.width && ty >= 0 && ty < tileset.height) {
        const {tilesetMap, reverseMap} = this
        let tileId = reverseMap[tilesetId]
        if (tileId === undefined) outer: {
          for (let i = 1; i < 256; i++) {
            if (tilesetMap[i] === undefined) {
              tilesetMap[i] = tilesetId
              reverseMap[tilesetId] = i
              tileId = i
              break outer
            }
          }
          return
        }
        const ti = x + y * this.width
        const tile = tileId << 24 | ty << 16 | tx << 8
        this.tiles[ti] = tile
        this.createTileData(tile)
        this.scene.updateTerrain(x, y)
        this.updateSurroundingAutoTiles(x, y)
        // 如果图像数据未定义，则生成
        if (this.imageData[tile] === undefined) {
          // 避免多次调用重复生成图像数据
          this.imageData[tile] = null
          this.loadTexture(tile, () => {
            this.imageData[tile] = undefined
            this.createImageData(tile)
          })
        }
      }
    }
  }

  /**
   * 删除图块
   * @param x 瓦片地图X
   * @param y 瓦片地图Y
   */
  public deleteTile(x: number, y: number): void {
    if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
      const ti = x + y * this.width
      if (this.tiles[ti] !== 0) {
        this.tiles[ti] = 0
        this.scene.updateTerrain(x, y)
      }
    }
  }

  /**
   * 更新自动图块帧
   * @param x 瓦片地图X
   * @param y 瓦片地图Y
   */
  private updateSurroundingAutoTiles(x: number, y: number): void {
    const width = this.width
    const height = this.height
    const left = Math.max(x - 1, 0)
    const top = Math.max(y - 1, 0)
    const right = Math.min(x + 2, width)
    const bottom = Math.min(y + 2, height)
    const tiles = this.tiles
    const tileData = this.tileData
    for (let y = top; y < bottom; y++) {
      for (let x = left; x < right; x++) {
        if (x >= 0 && x < width && y >= 0 && y < height) {
          const ti = x + y * width
          const tile = tiles[ti]
          const data = tileData[tile & 0xffffff00]
          if (data?.type !== 'auto') continue
          const template = data.template
          const key = tile >> 8
          const r = width - 1
          const b = height - 1
          const neighbor =
            (x > 0          && key !== tiles[ti - 1        ] >> 8) as unknown as number + 1
          | (x > 0 && y > 0 && key !== tiles[ti - 1 - width] >> 8) as unknown as number + 1 << 2
          | (         y > 0 && key !== tiles[ti     - width] >> 8) as unknown as number + 1 << 4
          | (x < r && y > 0 && key !== tiles[ti + 1 - width] >> 8) as unknown as number + 1 << 6
          | (x < r          && key !== tiles[ti + 1        ] >> 8) as unknown as number + 1 << 8
          | (x < r && y < b && key !== tiles[ti + 1 + width] >> 8) as unknown as number + 1 << 10
          | (         y < b && key !== tiles[ti     + width] >> 8) as unknown as number + 1 << 12
          | (x > 0 && y < b && key !== tiles[ti - 1 + width] >> 8) as unknown as number + 1 << 14
          const nodes = template.nodes
          const length = nodes.length
          let nodeIndex = 0
          for (let i = 0; i < length; i++) {
            const code = nodes[i].rule | neighbor
            if (Math.max(
              code       & 0b11,
              code >> 2  & 0b11,
              code >> 4  & 0b11,
              code >> 6  & 0b11,
              code >> 8  & 0b11,
              code >> 10 & 0b11,
              code >> 12 & 0b11,
              code >> 14 & 0b11,
            ) !== 0b11) {
              nodeIndex = i
              break
            }
          }
          const nTile = key << 8 | nodeIndex
          if (tiles[ti] !== nTile) {
            tiles[ti] = nTile
            this.createTileData(nTile)
            // 如果图像数据未定义，则生成
            if (this.imageData[nTile] === undefined) {
              // 避免多次调用重复生成图像数据
              this.imageData[nTile] = null
              this.loadTexture(nTile, () => {
                this.imageData[nTile] = undefined
                this.createImageData(nTile)
              })
            }
          }
        }
      }
    }
  }

  /**
   * 更新场景瓦片地图
   * @param deltaTime 增量时间(毫秒)
   */
  public update(deltaTime: number): void {
    this.updaters.update(deltaTime)
  }

  /** 绘制场景瓦片地图 */
  public draw(): void {
    const gl = GL
    const vertices = gl.arrays[0].float32
    const push = gl.batchRenderer.push
    const response = gl.batchRenderer.response
    const scene = this.scene
    const imageData = this.imageData
    const tiles = this.tiles
    const width = this.width
    const height = this.height
    const frame = scene.animFrame
    const tw = scene.tileWidth
    const th = scene.tileHeight
    const anchor = Scene.getParallaxAnchor(this)
    const pw = width * tw
    const ph = height * th
    const ax = this.anchorX * pw
    const ay = this.anchorY * ph
    const ox = anchor.x - ax + this.offsetX
    const oy = anchor.y - ay + this.offsetY
    const sl = Camera.tileLeft - ox
    const st = Camera.tileTop - oy
    const sr = Camera.tileRight - ox
    const sb = Camera.tileBottom - oy
    const bx = Math.max(Math.floor(sl / tw), 0)
    const by = Math.max(Math.floor(st / th), 0)
    const ex = Math.min(Math.ceil(sr / tw), width)
    const ey = Math.min(Math.ceil(sb / th), height)
    // 使用队列渲染器进行批量渲染
    gl.batchRenderer.setAttrSize(0)
    gl.batchRenderer.setBlendMode(this.blend)
    for (let y = by; y < ey; y++) {
      for (let x = bx; x < ex; x++) {
        const i = x + y * width
        const tile = tiles[i]
        const array = imageData[tile]
        if (!array) continue
        // 向渲染器添加纹理索引
        push(array[0])
        const fi = frame % array[2] * 4 + 7
        const ox = x * tw
        const oy = y * th
        const dl = array[3] + ox
        const dt = array[4] + oy
        const dr = array[5] + ox
        const db = array[6] + oy
        const sl = array[fi]
        const st = array[fi + 1]
        const sr = array[fi + 2]
        const sb = array[fi + 3]
        // 从渲染器中获取顶点索引和采样器索引
        const vi = response[0] * 5
        const si = response[1]
        vertices[vi    ] = dl
        vertices[vi + 1] = dt
        vertices[vi + 2] = sl
        vertices[vi + 3] = st
        vertices[vi + 4] = si
        vertices[vi + 5] = dl
        vertices[vi + 6] = db
        vertices[vi + 7] = sl
        vertices[vi + 8] = sb
        vertices[vi + 9] = si
        vertices[vi + 10] = dr
        vertices[vi + 11] = db
        vertices[vi + 12] = sr
        vertices[vi + 13] = sb
        vertices[vi + 14] = si
        vertices[vi + 15] = dr
        vertices[vi + 16] = dt
        vertices[vi + 17] = sr
        vertices[vi + 18] = st
        vertices[vi + 19] = si
      }
    }
    // 如果顶点的尾部索引不为0(存在可绘制的图块)
    const endIndex = gl.batchRenderer.getEndIndex()
    if (endIndex !== 0) {
      gl.alpha = this.opacity
      const sl = Camera.scrollLeft
      const st = Camera.scrollTop
      const program = gl.tileProgram.use()
      const modeMap = SceneTilemap.lightSamplingModes
      const lightMode = this.light
      const lightModeIndex = modeMap[lightMode]
      const matrix = Matrix.instance.project(
        gl.flip,
        Camera.width,
        Camera.height,
      ).translate(ox - sl, oy - st)
      gl.bindVertexArray(program.vao)
      gl.uniformMatrix3fv(program.u_Matrix, false, matrix)
      gl.uniform1i(program.u_LightMode, lightModeIndex)
      gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STREAM_DRAW, 0, endIndex * 5)
      gl.batchRenderer.draw()
    }
  }

  /**
   * 调用瓦片地图事件
   * @param type 瓦片地图事件类型
   */
  public callEvent(type: string): void {
    const commands = this.events[type]
    if (commands) {
      const event = new EventHandler(commands)
      event.triggerTilemap = this
      event.triggerObject = this
      event.selfVarId = this.selfVarId
      EventHandler.call(event, this.updaters)
    }
  }

  /**
   * 调用瓦片地图事件和脚本
   * @param type 瓦片地图事件类型
   */
  public emit(type: string): void {
    this.callEvent(type)
    this.script.emit(type, this)
  }

  // 自动执行
  public autorun(): void {
    if (this.started === false) {
      this.started = true
      this.emit('autorun')
    }
  }

  /** 销毁瓦片地图 */
  public destroy(): void {
    if (!this.destroyed) {
      this.emit('destroy')
      this.destroyed = true
      this.parent?.remove(this)
      GlobalEntityManager.remove(this)
      if (this.textures) {
        // 销毁所有图块组纹理
        for (const texture of Object.values(this.textures) as Array<BaseTexture>) {
          texture.decreaseRefCount()
        }
      }
    }
  }

  /** 异步销毁瓦片地图 */
  public destroyAsync(): void {
    Callback.push(() => {
      this.destroy()
    })
  }

  /**
   * 保存瓦片地图数据
   * @returns 瓦片地图存档数据
   */
  public saveData(): TilemapSaveData {
    return {
      name: this.name,
      entityId: this.entityId,
      presetId: this.presetId,
      selfVarId: this.selfVarId,
      visible: this.visible,
      x: this.x,
      y: this.y,
      tileStartX: this.tileStartX,
      tileStartY: this.tileStartY,
      tileEndX: this.tileEndX,
      tileEndY: this.tileEndY,
      tilesetMap: this.tilesetMap,
      code: Codec.encodeTiles(this.tiles),
    }
  }

  /** 静态 - 光线采样模式映射表(字符串 -> 着色器中的采样模式代码) */
  private static lightSamplingModes: TilemapLightSamplingMap = {raw: 0, global: 1, ambient: 2}
}

/** ******************************** 场景分区管理器 ******************************** */

class ScenePartitionManager<T> {
  /** 场景网格分区容器列表 */
  public cells: Array<Array<T>>
  /** 场景网格分区大小 */
  public size: number
  /** 场景网格分区移位 */
  private shiftBits: number
  /** 场景网格分区最小移位 */
  private minShiftBits: number
  /** 场景网格分区水平数量 */
  public width: number
  /** 场景网格分区垂直数量 */
  public height: number
  /** 场景网格分区导出列表 */
  private exports: CacheList<Array<T>>

  /** 场景网格分区列表 */
  constructor() {
    this.cells = []
    this.size = 4
    this.shiftBits = 2
    this.minShiftBits = 2
    this.width = 0
    this.height = 0
    this.exports = new CacheList()
  }

  /**
   * 优化中小型场景的最小分区大小
   * @param scene 场景上下文对象
   */
  public optimize(scene: SceneContext): void {
    const size = scene.width * scene.height
    if (size <= 16384) {
      this.size = 1
      this.shiftBits = 0
      this.minShiftBits = 0
    } else if (size <= 65536) {
      this.size = 2
      this.shiftBits = 1
      this.minShiftBits = 1
    }
  }

  /**
   * 调整场景网格分区的数量
   * @param scene 场景上下文对象
   */
  public resize(scene: SceneContext): void {
    // 根据场景大小调整分区数量
    const cells = this.cells.slice()
    const width = Math.ceil(scene.width / this.size)
    const height = Math.ceil(scene.height / this.size)
    const length = width * height
    this.width = width
    this.height = height
    this.cells.length = length
    for (let i = 0; i < length; i++) {
      this.cells[i] = []
    }
    // 重新添加角色到网格中
    for (const cell of cells) {
      for (const actor of cell as Array<ObjectInCell>) {
        actor.cellId = -1
        this.append(actor)
      }
    }
  }

  /**
   * (尝试)扩大网格
   * @param scene 场景上下文对象
   * @param colliderSize 角色碰撞器大小
   */
  public grow(scene: SceneContext, colliderSize: number): void {
    if (this.size < colliderSize && this.shiftBits < 4) {
      while (this.size < colliderSize && this.shiftBits < 4) {
        this.size = 1 << ++this.shiftBits
      }
      this.resize(scene)
    }
  }

  /**
   * (尝试)缩小网格
   * @param scene 场景上下文对象
   * @param colliderSize 角色碰撞器大小
   */
  public shrink(scene: SceneContext, colliderSize: number): void {
    if (this.size / 2 >= colliderSize && this.shiftBits > this.minShiftBits) {
      while (this.size / 2 >= colliderSize && this.shiftBits > this.minShiftBits) {
        this.size = 1 << --this.shiftBits
      }
      this.resize(scene)
    }
  }

  /**
   * 获取指定范围的分区列表
   * @param sx 起始X
   * @param sy 起始Y
   * @param ex 结束X
   * @param ey 结束Y
   * @returns 矩形范围框选的分区列表
   */
  public get(sx: number, sy: number, ex: number, ey: number): CacheList<Array<T>> {
    const left = Math.max(sx >> this.shiftBits, 0)
    const top = Math.max(sy >> this.shiftBits, 0)
    const right = Math.min(ex / this.size, this.width)
    const bottom = Math.min(ey / this.size, this.height)
    const exports = this.exports
    const rowOffset = this.width
    let count = 0
    // 获取小块分区中的数据，避免全局遍历
    for (let y = top; y < bottom; y++) {
      for (let x = left; x < right; x++) {
        exports[count++] = this.cells[x + y * rowOffset]
      }
    }
    exports.count = count
    return exports
  }

  /**
   * 更新场景对象的分区(根据对象的位置来分配)
   * @param object 拥有场景坐标的对象
   */
  public update(object: ObjectInCell): void {
    let cellId = -1
    const cellX = object.x >> this.shiftBits
    const cellY = object.y >> this.shiftBits
    if (this.isValidPosition(cellX, cellY)) {
      cellId = cellX + cellY * this.width
    }
    if (object.cellId !== cellId) {
      // 从旧的分区中删除对象
      if (object.cellId !== -1) {
        this.cells[object.cellId].remove(object as T)
      }
      // 添加对象到新的分区
      if (cellId !== -1) {
        this.cells[cellId].push(object as T)
      }
      object.cellId = cellId
    }
  }

  /**
   * 添加场景对象到管理器中
   * @param object 拥有场景坐标的对象
   * @returns 是否成功添加
   */
  public append(object: ObjectInCell): boolean {
    const cellX = object.x >> this.shiftBits
    const cellY = object.y >> this.shiftBits
    if (this.isValidPosition(cellX, cellY)) {
      const cellId = cellX + cellY * this.width
      this.cells[cellId].push(object as T)
      object.cellId = cellId
      return true
    }
    return false
  }

  /**
   * 从管理器中移除场景对象
   * @param object 拥有场景坐标的对象
   * @returns 是否成功添加
   */
  public remove(object: ObjectInCell): boolean {
    const cell = this.cells[object.cellId]
    if (cell !== undefined) {
      cell.remove(object as T)
      object.cellId = -1
      return true
    }
    return false
  }

  /**
   * 检查分区的位置是否有效
   * @param cellX 分区X
   * @param cellY 分区Y
   * @returns 在有效范围内
   */
  private isValidPosition(cellX: number, cellY: number): boolean {
    return cellX >= 0 && cellX < this.width && cellY >= 0 && cellY < this.height
  }
}

/** ******************************** 场景角色管理器 ******************************** */

class SceneActorManager {
  /** 场景上下文对象 */
  public scene: SceneContext
  /** 场景角色实例列表 */
  public list: Array<Actor>
  /** 场景角色分区列表 */
  public partition: ScenePartitionManager<Actor>

  /**
   * 场景角色列表
   * @param scene 场景上下文对象
   */
  constructor(scene: SceneContext) {
    this.scene = scene
    this.list = []
    this.partition = new ScenePartitionManager()
  }

  /**
   * 添加角色到管理器中
   * @param actor 场景角色实例
   * @returns 是否成功添加
   */
  public append(actor: Actor): boolean {
    if (actor.parent === null) {
      actor.parent = this
      this.list.push(actor)
      this.partition.append(actor)
      this.scene.obstacle.append(actor)
      this.scene.entity.add(actor)
      if (this.scene.enabled) {
        actor.autorun()
      }
      return true
    }
    return false
  }

  /**
   * 从管理器中移除角色
   * @param actor 场景角色实例
   * @returns 是否成功移除
   */
  public remove(actor: Actor): boolean {
    if (actor.parent === this) {
      actor.parent = null
      this.list.remove(actor)
      this.partition.remove(actor)
      this.scene.obstacle.remove(actor)
      this.scene.entity.remove(actor)
      return true
    }
    return false
  }

  /**
   * 查找指定队伍的角色数量
   * @param teamId 队伍ID
   * @returns 角色数量
   */
  public count(teamId: string): number {
    let count = 0
    const {list} = this
    const {length} = list
    for (let i = 0; i < length; i++) {
      if (list[i].teamId === teamId) {
        count++
      }
    }
    return count
  }

  /**
   * 更新场景角色
   * @param deltaTime 增量时间(毫秒)
   */
  public update(deltaTime: number): void {
    let maxColliderSize = 0
    let maxGridCellSize = 0
    for (const actor of this.list) {
      actor.update(deltaTime)
      const collider = actor.collider
      if (maxGridCellSize < collider.size) {
        if (maxColliderSize < collider.size) {
          maxColliderSize = collider.size
        }
        if (collider.weight !== 0) {
          maxGridCellSize = collider.size
        }
      }
    }
    // 设置最大的角色碰撞器大小
    this.setMaxColliderSize(maxColliderSize)
    // 设置最大的网格分区大小
    this.setMaxGridCellSize(maxGridCellSize)
    // 处理角色和场景碰撞
    ActorCollider.handleActorCollisions()
    ActorCollider.handleSceneCollisions()
    this.updateGridPosAndCells()
  }

  /**
   * 设置最大的角色碰撞器大小
   * @param size 大小
   */
  private setMaxColliderSize(size: number): void {
    if (this.scene.maxColliderHalf !== size / 2) {
      this.scene.maxColliderHalf = size / 2
    }
  }

  /**
   * 设置最大的网格分区大小
   * @param size 大小
   */
  private setMaxGridCellSize(size: number): void {
    if (this.scene.maxGridCellSize !== size) {
      if (this.scene.maxGridCellSize < size) {
        this.partition.grow(this.scene, size)
      } else {
        this.partition.shrink(this.scene, size)
      }
    }
  }

  /** 更新场景角色网格位置和分区 */
  private updateGridPosAndCells(): void {
    const {scene, list, partition} = this
    const {obstacle} = scene
    const {length} = list
    for (let i = 0; i < length; i++) {
      const actor = list[i]
      // 只有角色发生移动时，才更新区间
      if (actor.collider.moved) {
        actor.collider.moved = false
        // 更新上一次的位置
        actor.collider.updateLastPosition()
        // 更新角色的网格位置
        actor.updateGridPosition()
        // 更新角色的场景分区
        partition.update(actor)
        // 更新角色的障碍区域
        obstacle.update(actor)
      }
    }
  }

  /** 发送自动执行事件 */
  public autorun(): void {
    for (const actor of this.list) {
      actor.autorun()
    }
  }

  /** 销毁管理器中的场景角色 */
  public destroy(): void {
    const {list} = this
    let i = list.length
    while (--i >= 0) {
      list[i].destroy()
    }
  }

  /**
   * 保存场景角色列表数据
   * @returns 角色存档数据列表
   */
  public saveData(): Array<SceneActorSaveData> {
    const data: Array<SceneActorSaveData> = []
    const list = this.list
    const length = list.length
    for (let i = 0; i < length; i++) {
      const actor = list[i]
      if (!actor.active) continue
      // 保存全局角色或普通角色
      data.push(
        actor instanceof GlobalActor
      ? {globalId: actor.data.id}
      : actor.saveData()
      )
    }
    return data
  }

  /**
   * 加载场景角色列表数据
   * @param actors 角色存档数据列表
   */
  public loadData(actors: Array<SceneActorSaveData>): void {
    const presets = Scene.presets
    for (const savedData of actors) {
      if ('presetId' in savedData && savedData.presetId !== '') {
        // 加载预设角色
        const preset = presets[savedData.presetId]
        if (preset?.class === 'actor') {
          this.append(new Actor(preset.data, savedData))
        }
      } else if ('fileId' in savedData) {
        // 加载外部角色
        const data = Data.actors[savedData.fileId]
        if (data) {
          this.append(new Actor(data, savedData))
        }
      } else {
        // 加载全局角色
        const actor = ActorManager.get(savedData.globalId)
        if (actor) {
          this.append(actor)
        }
      }
    }
    // 恢复库存引用
    Inventory.reference()
  }
}

/** ******************************** 场景动画管理器 ******************************** */

class SceneAnimationManager {
  /** 场景上下文对象 */
  public scene: SceneContext
  /** 场景动画实例列表 */
  public list: Array<SceneAnimation>

  /**
   * 场景动画列表
   * @param scene 场景上下文对象
   */
  constructor(scene: SceneContext) {
    this.scene = scene
    this.list = []
  }

  /**
   * 添加动画到管理器中
   * @param animation 动画对象实例
   * @returns 是否成功添加
   */
  public append(animation: SceneAnimation): boolean {
    if (animation.parent === null) {
      animation.parent = this
      this.list.push(animation)
      this.scene.entity.add(animation)
      if (this.scene.enabled) {
        // 可能不是场景动画
        animation.autorun?.()
      }
      return true
    }
    return false
  }

  /**
   * 从管理器中移除动画
   * @param animation 动画对象实例
   * @returns 是否成功移除
   */
  public remove(animation: SceneAnimation): boolean {
    if (animation.parent === this) {
      animation.parent = null
      this.list.remove(animation)
      this.scene.entity.remove(animation)
      return true
    }
    return false
  }

  /**
   * 更新动画实例
   * @param deltaTime 增量时间(毫秒)
   */
  public update(deltaTime: number): void {
    for (const animation of this.list) {
      animation.update(deltaTime)
    }
  }

  /** 发送自动执行事件 */
  public autorun(): void {
    for (const animation of this.list) {
      // 可能不是场景动画
      animation.autorun?.()
    }
  }

  /** 销毁管理器中的动画 */
  public destroy(): void {
    const {list} = this
    let i = list.length
    while (--i >= 0) {
      list[i].destroy()
    }
  }

  /**
   * 保存动画列表数据
   * @returns 动画存档数据列表
   */
  public saveData(): Array<AnimationSaveData> {
    const list = this.list
    const length = list.length
    const data = []
    for (let i = 0; i < length; i++) {
      const animation = list[i]
      if (!animation.temporary) {
        data.push(animation.saveData())
      }
    }
    return data
  }

  /**
   * 加载动画列表数据
   * @param animations 动画存档数据列表
   */
  public loadData(animations: Array<AnimationSaveData>): void {
    const presets = Scene.presets
    for (const savedData of animations) {
      const preset = presets[savedData.presetId]
      if (preset?.class === 'animation') {
        const data = Data.animations[preset.animationId]
        if (data) {
          // 重新创建动画实例
          savedData.events = preset.events
          savedData.scripts = preset.scripts
          const animation = new SceneAnimation(data, savedData)
          animation.setMotion(savedData.motion)
          animation.setAngle(savedData.angle)
          this.append(animation)
        }
      }
    }
  }
}

/** ******************************** 场景动画 ******************************** */

class SceneAnimation extends AnimationPlayer {
  /** 场景动画名称 */
  public name: string
  /** 场景动画对象实体ID */
  public entityId: string
  /** 场景动画预设数据ID */
  public presetId: string
  /** 场景动画独立变量ID */
  public selfVarId: string
  /** 场景动画水平位置 */
  public x: number
  /** 场景动画垂直位置 */
  public y: number
  /** 场景动画的更新器模块列表 */
  public updaters: UpdaterList
  /** 场景动画事件映射表 */
  public events: HashMap<CommandFunctionList>
  /** 场景动画脚本管理器 */
  public script: ScriptManager
  /** 已开始状态 */
  private started: boolean
  /** 是否为临时对象 */
  public temporary: boolean

  /**
   * 场景动画对象
   * @param node 场景中预设的动画数据
   * @param data 动画文件数据
   */
  constructor(data: AnimationFile, node: AnimationOptions = {}) {
    super(data)
    this.name = node.name ?? ''
    this.entityId = ''
    this.presetId = node.presetId ?? ''
    this.selfVarId = node.selfVarId ?? ''
    this.visible = node.visible ?? true
    this.rotatable = node.rotatable ?? false
    this.x = node.x ?? 0
    this.y = node.y ?? 0
    this.scale = node.scale ?? 1
    this.speed = node.speed ?? 1
    this.opacity = node.opacity ?? 1
    this.priority = node.priority ?? 0
    this.updaters = new UpdaterList()
    this.events = node.events ?? {}
    this.script = ScriptManager.create(this, node.scripts ?? [])
    this.started = false
    this.temporary = false
    GlobalEntityManager.add(this)
    this.setPosition(this)
    this.emit('create')
  }

  /**
   * 更新场景动画
   * @param deltaTime 增量时间(毫秒)
   */
  public update(deltaTime: number): void {
    super.update(deltaTime)
    this.updaters.update(deltaTime)
  }

  /**
   * 调用场景动画事件
   * @param type 场景动画事件类型
   * @returns 生成的事件处理器
   */
  public callEvent(type: string): void {
    const commands = this.events[type]
    if (commands) {
      const event = new EventHandler(commands)
      event.triggerObject = this
      event.selfVarId = this.selfVarId
      EventHandler.call(event, this.updaters)
    }
  }

  /**
   * 调用场景动画事件和脚本
   * @param type 场景动画事件类型
   */
  public emit(type: string): void {
    this.callEvent(type)
    this.script.emit(type, this)
  }

  /** 自动执行 */
  public autorun(): void {
    if (this.started === false) {
      this.started = true
      this.emit('autorun')
    }
  }

  /** 销毁场景动画 */
  public destroy(): void {
    if (!this.destroyed) {
      this.emit('destroy')
      this.parent?.remove(this)
      GlobalEntityManager.remove(this)
      super.destroy()
    }
  }

  /** 异步销毁场景动画 */
  public destroyAsync(): void {
    Callback.push(() => {
      this.destroy()
    })
  }

  /**
   * 保存场景动画数据
   * @returns 动画存档数据
   */
  public saveData(): AnimationSaveData {
    return {
      name: this.name,
      entityId: this.entityId,
      presetId: this.presetId,
      selfVarId: this.selfVarId,
      visible: this.visible,
      motion: this.motionName,
      rotatable: this.rotatable,
      x: this.x,
      y: this.y,
      angle: this.angle,
      scale: this.scale,
      speed: this.speed,
      opacity: this.opacity,
      priority: this.priority,
    }
  }
}

/** ******************************** 场景触发器管理器 ******************************** */

class SceneTriggerManager {
  /** 场景上下文对象 */
  public scene: SceneContext
  /** 场景触发器实例列表 */
  public list: Array<Trigger>

  /**
   * 场景触发器列表
   * @param scene 场景上下文对象
   */
  constructor(scene: SceneContext) {
    this.scene = scene
    this.list = []
  }

  /**
   * 添加触发器到管理器中
   * @param trigger 触发器实例
   */
  public append(trigger: Trigger): void {
    if (trigger.parent === null) {
      trigger.parent = this
      trigger.autorun()
      this.list.push(trigger)
    }
  }

  /**
   * 从管理器中移除触发器
   * @param trigger 触发器实例
   */
  public remove(trigger: Trigger): void {
    if (trigger.parent === this) {
      trigger.parent = null
      this.list.remove(trigger)
    }
  }

  /**
   * 更新触发器
   * @param deltaTime 增量时间(毫秒)
   */
  public update(deltaTime: number): void {
    for (const trigger of this.list) {
      trigger.update(deltaTime)
    }
  }

  /** 销毁管理器中的触发器 */
  public destroy(): void {
    const {list} = this
    let i = list.length
    while (--i >= 0) {
      list[i].destroy()
    }
  }
}

/** ******************************** 场景区域管理器 ******************************** */

class SceneRegionManager {
  /** 场景上下文对象 */
  public scene: SceneContext
  /** 场景区域实例列表 */
  public list: Array<SceneRegion>

  /**
   * 场景区域列表
   * @param scene 场景上下文对象
   */
  constructor(scene: SceneContext) {
    this.scene = scene
    this.list = []
  }

  /**
   * 添加区域到管理器中
   * @param region 场景区域对象
   */
  public append(region: SceneRegion): void {
    if (region.parent === null) {
      region.parent = this
      this.list.push(region)
      this.scene.entity.add(region)
      if (this.scene.enabled) {
        region.autorun()
      }
    }
  }

  /**
   * 从管理器中移除区域
   * @param region 场景区域对象
   */
  public remove(region: SceneRegion): void {
    if (region.parent === this) {
      region.parent = null
      this.list.remove(region)
      this.scene.entity.remove(region)
    }
  }

  /**
   * 更新区域实例
   * @param deltaTime 增量时间(毫秒)
   */
  public update(deltaTime: number): void {
    for (const region of this.list) {
      region.update(deltaTime)
    }
  }

  /** 发送自动执行事件 */
  public autorun(): void {
    for (const region of this.list) {
      region.autorun()
    }
  }

  /** 销毁管理器中的场景区域 */
  public destroy(): void {
    const {list} = this
    let i = list.length
    while (--i >= 0) {
      list[i].destroy()
    }
  }

  /**
   * 保存场景区域列表数据
   * @returns 区域存档数据列表
   */
  public saveData(): Array<RegionSaveData> {
    const list = this.list
    const length = list.length
    const data = new Array(length)
    for (let i = 0; i < length; i++) {
      data[i] = list[i].saveData()
    }
    return data
  }

  /**
   * 加载场景区域列表数据
   * @param regions 区域存档数据列表
   */
  public loadData(regions: Array<RegionSaveData>): void {
    const presets = Scene.presets
    for (const savedData of regions) {
      const preset = presets[savedData.presetId]
      if (preset) {
        // 重新创建区域实例
        savedData.events = preset.events
        savedData.scripts = preset.scripts
        this.append(new SceneRegion(savedData))
      }
    }
  }
}

/** ******************************** 场景区域 ******************************** */

class SceneRegion {
  /** 场景区域名称 */
  public name: string
  /** 场景区域对象实体ID */
  public entityId: string
  /** 场景区域预设数据ID */
  public presetId: string
  /** 场景区域独立变量ID */
  public selfVarId: string
  /** 场景区域水平位置 */
  public x: number
  /** 场景区域垂直位置 */
  public y: number
  /** 场景区域宽度 */
  public width: number
  /** 场景区域高度 */
  public height: number
  /** 场景区域中已进入角色列表 */
  public actors: Array<Actor>
  /** 场景区域更新器模块列表 */
  public updaters: UpdaterList
  /** 场景区域事件映射表 */
  public events: HashMap<CommandFunctionList>
  /** 场景区域脚本管理器 */
  public script: ScriptManager
  /** 场景区域的父级对象 */
  public parent: SceneRegionManager | null
  /** 已开始状态 */
  private started: boolean
  /** 是否已销毁 */
  public destroyed: boolean

  /**
   * 场景区域对象
   * @param data 场景中预设的区域数据
   */
  constructor(data: RegionOptions = {}) {
    this.name = data.name ?? ''
    this.entityId = ''
    this.presetId = data.presetId ?? ''
    this.selfVarId = data.selfVarId ?? ''
    this.x = data.x ?? 0
    this.y = data.y ?? 0
    this.width = data.width ?? 1
    this.height = data.height ?? 1
    this.actors = []
    this.updaters = new UpdaterList()
    this.events = data.events ?? {}
    this.script = ScriptManager.create(this, data.scripts ?? [])
    this.parent = null
    this.started = false
    this.destroyed = false
    GlobalEntityManager.add(this)
    this.emit('create')
  }

  /**
   * 更新场景区域
   * @param deltaTime 增量时间(毫秒)
   */
  public update(deltaTime: number): void {
    // 检测进入区域的角色
    const x = this.x
    const y = this.y
    const wh = this.width / 2
    const hh = this.height / 2
    const left = x - wh
    const top = y - hh
    const right = x + wh
    const bottom = y + hh
    const selections = this.actors
    const scene = this.parent!.scene
    const cells = scene.actor.partition.get(left, top, right, bottom)
    const count = cells.count
    for (let i = 0; i < count; i++) {
      const actors = cells[i]!
      const length = actors.length
      for (let i = 0; i < length; i++) {
        const actor = actors[i] as Actor
        const {x, y} = actor
        if (x >= left && x < right && y >= top && y < bottom && actor.active) {
          if (selections.append(actor)) {
            // 触发角色进入区域事件
            if (actor === Party.player) {
              this.emit('playerenter', actor)
            }
            this.emit('actorenter', actor)
          }
        }
      }
    }

    // 检测离开区域的角色
    let i = selections.length
    while (--i >= 0) {
      const actor = selections[i]
      // 本地或全局角色离开场景
      if (actor.parent === null) {
        selections.splice(i, 1)
        continue
      }
      const {x, y} = actor
      if ((x < left || x >= right || y < top || y >= bottom) && actor.active) {
        selections.splice(i, 1)
        // 触发角色离开区域事件
        if (actor === Party.player) {
          this.emit('playerleave', actor)
        }
        this.emit('actorleave', actor)
      }
    }

    // 更新模块列表
    this.updaters.update(deltaTime)
  }

  /**
   * 获取随机位置
   * @param terrain 地形码(-1:不限地形, 0:地面, 1:水面, 2:墙块)
   * @returns 场景坐标点
   */
  public getRandomPosition(terrain: TerrainCode | -1 = -1): Point | undefined {
    if (!this.parent) return undefined
    let x = 0
    let y = 0
    let count = 0
    const manager = this.parent.scene.terrain
    do {
      const l = this.x - this.width / 2
      const r = this.x + this.width / 2
      const t = this.y - this.height / 2
      const b = this.y + this.height / 2
      x = Math.randomBetween(l, r)
      y = Math.randomBetween(t, b)
    }
    // 如果指定了地形
    // 则最多循环1000次
    while (
      terrain !== -1 &&
      manager.get(Math.floor(x), Math.floor(y)) !== terrain &&
      ++count < 1000
    )
    return count < 1000 ? {x, y} : undefined
  }

  /**
   * 调用区域事件
   * @param type 区域事件类型
   * @param triggerActor 事件触发角色
   */
  public callEvent(type: string, triggerActor?: Actor): void {
    const commands = this.events[type]
    if (commands) {
      const event = new EventHandler(commands)
      if (triggerActor) {
        event.triggerActor = triggerActor
      }
      event.triggerRegion = this
      event.triggerObject = this
      event.selfVarId = this.selfVarId
      EventHandler.call(event, this.updaters)
    }
  }

  /**
   * 调用区域事件和脚本
   * @param type 区域事件类型
   * @param triggerActor 事件触发角色
   */
  public emit(type: string, triggerActor?: Actor): void {
    this.callEvent(type, triggerActor)
    if (triggerActor instanceof Actor) {
      this.script.getEvents(type)?.call(new ScriptRegionEvent(triggerActor!, this))
    } else {
      this.script.emit(type, this)
    }
  }

  // 自动执行
  public autorun(): void {
    if (this.started === false) {
      this.started = true
      this.emit('autorun')
    }
  }

  /** 销毁场景区域 */
  public destroy(): void {
    if (!this.destroyed) {
      this.emit('destroy')
      this.destroyed = true
      this.parent?.remove(this)
      GlobalEntityManager.remove(this)
    }
  }

  /** 异步销毁场景区域 */
  public destroyAsync(): void {
    Callback.push(() => {
      this.destroy()
    })
  }

  /** 保存区域数据 */
  public saveData(): RegionSaveData {
    return {
      name: this.name,
      entityId: this.entityId,
      presetId: this.presetId,
      selfVarId: this.selfVarId,
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height,
    }
  }
}

/** ******************************** 场景光源管理器 ******************************** */

class SceneLightManager {
  /** 场景上下文对象 */
  public scene: SceneContext
  /** 场景光源群组列表 */
  public groups: Array<Array<SceneLight>>
  /** {混合模式:光源群组}映射表 */
  public groupMap: HashMap<Array<SceneLight>>

  /**
   * 场景光源管理器
   * @param scene 场景上下文对象
   */
  constructor(scene: SceneContext) {
    this.scene = scene

    // 根据混合模式创建子列表
    const max: Array<SceneLight> = []
    const screen: Array<SceneLight> = []
    const additive: Array<SceneLight> = []
    const subtract: Array<SceneLight> = []
    this.groups = [max, screen, additive, subtract]
    this.groupMap = {max, screen, additive, subtract}
  }

  /**
   * 添加场景光源到管理器中
   * @param light 场景光源实例
   */
  public append(light: SceneLight): void {
    if (light.parent === null) {
      light.parent = this
      this.groupMap[light.blend]!.push(light)
      this.scene.entity.add(light)
      if (this.scene.enabled) {
        light.autorun()
      }
    }
  }

  /**
   * 从管理器中移除场景光源
   * @param light 场景光源实例
   */
  public remove(light: SceneLight): void {
    if (light.parent === this) {
      light.parent = null
      this.groupMap[light.blend]!.remove(light)
      this.scene.entity.remove(light)
    }
  }

  /**
   * 更新场景光源
   * @param deltaTime 增量时间(毫秒)
   */
  public update(deltaTime: number): void {
    for (const group of this.groups) {
      for (const light of group) {
        light.update(deltaTime)
      }
    }
  }

  /** 渲染环境光和场景光源到纹理中 */
  public render(): void {
    // 绘制环境光
    const gl = GL
    const scene = this.scene
    const ambient = scene.ambient
    const ambientRed = ambient.red / 255
    const ambientGreen = ambient.green / 255
    const ambientBlue = ambient.blue / 255
    const ambientDirect = ambient.direct
    // 获取反射光纹理裁剪区域
    const cx = gl.reflectedLightMap.clipX
    const cy = gl.reflectedLightMap.clipY
    const cw = gl.reflectedLightMap.clipWidth
    const ch = gl.reflectedLightMap.clipHeight
    // 绑定反射光纹理FBO
    gl.bindFBO(gl.reflectedLightMap.fbo)
    gl.setViewport(cx, cy, cw, ch)
    gl.clearColor(ambientRed, ambientGreen, ambientBlue, 0)
    gl.clear(gl.COLOR_BUFFER_BIT)
    // 获取可见光源
    const queue = gl.arrays[1].uint16
    const tw = scene.tileWidth
    const th = scene.tileHeight
    // 获取场景光源可见范围，并转换成图块坐标
    const sl = Camera.lightLeft
    const st = Camera.lightTop
    const sr = Camera.lightRight
    const sb = Camera.lightBottom
    const ll = sl / tw
    const lt = st / th
    const lr = sr / tw
    const lb = sb / th
    const vs = tw / th
    const groups = this.groups
    const length = groups.length
    let qi = 0
    for (let gi = 0; gi < length; gi++) {
      const group = groups[gi]
      const length = group.length
      for (let i = 0; i < length; i++) {
        const light = group[i]
        if (light.visible) {
          const {x, y} = light
          switch (light.type) {
            case 'point': {
              const rr = light.range! / 2
              const px = x < ll ? ll : x > lr ? lr : x
              const py = y < lt ? lt : y > lb ? lb : y
              // 如果点光源可见，添加群组和光源索引到绘制队列
              if ((px - x) ** 2 + ((py - y) * vs) ** 2 < rr ** 2) {
                queue[qi++] = gi
                queue[qi++] = i
              }
              continue
            }
            case 'area': {
              const ml = x + light.measureOffsetX!
              const mt = y + light.measureOffsetY!
              const mr = ml + light.measureWidth!
              const mb = mt + light.measureHeight!
              // 如果区域光源可见，添加群组和光源索引到绘制队列
              if (ml < lr && mt < lb && mr > ll && mb > lt) {
                queue[qi++] = gi
                queue[qi++] = i
              }
              continue
            }
          }
        }
      }
    }

    // 绘制反射光
    if (qi !== 0) {
      const projMatrix = Matrix.instance.project(
        gl.flip,
        sr - sl,
        sb - st,
      )
      .translate(-sl, -st)
      .scale(tw, th)
      // 按队列顺序绘制所有可见光源
      for (let i = 0; i < qi; i += 2) {
        groups[queue[i]][queue[i + 1]].draw(projMatrix, 1)
      }
    }
    gl.resetViewport()
    // 计算直射光颜色
    const directRed = ambientRed * ambientDirect
    const directGreen = ambientGreen * ambientDirect
    const directBlue = ambientBlue * ambientDirect
    // 绑定直射光纹理FBO
    gl.bindFBO(gl.directLightMap.fbo)
    gl.clearColor(directRed, directGreen, directBlue, 0)
    gl.clear(gl.COLOR_BUFFER_BIT)
    // 绘制直射光
    if (qi !== 0) {
      const sl = Camera.scrollLeft
      const st = Camera.scrollTop
      const sr = Camera.scrollRight
      const sb = Camera.scrollBottom
      const projMatrix = Matrix.instance.project(
        gl.flip,
        sr - sl,
        sb - st,
      )
      .translate(-sl, -st)
      .scale(tw, th)
      // 按队列顺序绘制所有可见光源
      for (let i = 0; i < qi; i += 2) {
        const light = groups[queue[i]][queue[i + 1]]
        if (light.direct !== 0) {
          light.draw(projMatrix, light.direct)
        }
      }
    }
    // 解除FBO绑定
    gl.unbindFBO()
  }

  /** 发送自动执行事件 */
  public autorun(): void {
    for (const group of this.groups) {
      for (const light of group) {
        light.autorun()
      }
    }
  }

  /** 销毁管理器中的场景光源 */
  public destroy(): void {
    for (const group of this.groups) {
      let i = group.length
      while (--i >= 0) {
        group[i].destroy()
      }
    }
  }

  /**
   * 保存场景光源列表数据
   * @returns 光源存档数据列表
   */
  public saveData(): Array<LightSaveData> {
    const data = []
    for (const group of this.groups) {
      for (const light of group) {
        if (light.presetId !== '') {
          data.push(light.saveData())
        }
      }
    }
    return data
  }

  /**
   * 加载场景光源列表数据
   * @param lights 光源存档数据列表
   */
  public loadData(lights: Array<LightSaveData>): void {
    const presets = Scene.presets
    for (const savedData of lights) {
      const preset = presets[savedData.presetId]
      if (preset) {
        // 重新创建光源实例
        savedData.events = preset.events
        savedData.scripts = preset.scripts
        this.append(new SceneLight(savedData))
      }
    }
  }
}

/** ******************************** 场景光源 ******************************** */

class SceneLight {
  /** 场景光源名称 */
  public name: string
  /** 场景光源对象实体ID */
  public entityId: string
  /** 场景光源预设数据ID */
  public presetId: string
  /** 场景光源独立变量ID */
  public selfVarId: string
  /** 场景光源可见性 */
  public visible: boolean
  /** 场景光源类型 */
  public type: LightType
  /** 场景光源混合模式 */
  public blend: LightBlendingMode
  /** 场景光源水平位置 */
  public x: number
  /** 场景光源垂直位置 */
  public y: number
  /** 点光源照亮范围(直径) */
  public range?: number
  /** 点光源强度(0-1) */
  public intensity?: number
  /** 光线颜色-红(0-255) */
  public red: number
  /** 光线颜色-绿(0-255) */
  public green: number
  /** 光线颜色-蓝(0-255) */
  public blue: number
  /** 直射率(0-1) */
  public direct: number
  /** 区域光源锚点水平偏移 */
  private anchorOffsetX?: number
  /** 区域光源锚点垂直偏移 */
  private anchorOffsetY?: number
  /** 区域光源测量外接矩形水平偏移 */
  public measureOffsetX?: number
  /** 区域光源测量外接矩形垂直偏移 */
  public measureOffsetY?: number
  /** 区域光源测量外接矩形宽度 */
  public measureWidth?: number
  /** 区域光源测量外接矩形高度 */
  public measureHeight?: number
  /** 区域光源图像纹理 */
  public texture?: ImageTexture | null
  /** 场景光源更新器模块列表 */
  public updaters: UpdaterList
  /** 场景光源事件映射表 */
  public events: HashMap<CommandFunctionList>
  /** 场景光源脚本管理器 */
  public script: ScriptManager
  /** 区域光是否已经改变(用于重新测量外接矩形的尺寸) */
  private areaChanged?: boolean
  /** 场景光源的父级对象 */
  public parent: SceneLightManager | null
  /** 已开始状态 */
  private started: boolean
  /** 是否已销毁 */
  public destroyed: boolean
  /** 区域光:蒙版图像ID */
  private _mask!: string
  /** 区域光:锚点X */
  private _anchorX!: number
  /** 区域光:锚点Y */
  private _anchorY!: number
  /** 区域光:宽度 */
  private _width!: number
  /** 区域光:高度 */
  private _height!: number
  /** 区域光:角度 */
  private _angle!: number

  /**
   * 场景光源对象
   * @param light 场景中预设的光源数据
   */
  constructor(light: LightOptions = {}) {
    this.name = light.name ?? ''
    this.entityId = ''
    this.presetId = light.presetId ?? ''
    this.selfVarId = light.selfVarId ?? ''
    this.visible = light.visible ?? true
    this.type = light.type ?? 'point'
    this.blend = light.blend ?? 'screen'
    this.x = light.x ?? 0
    this.y = light.y ?? 0
    switch (this.type) {
      case 'point':
        // 加载点光源属性
        this.range = light.range ?? 4
        this.intensity = light.intensity ?? 0
        break
      case 'area':
        // 加载区域光源属性
        this.texture = null
        this.mask = light.mask ?? ''
        this.anchorX = light.anchorX ?? 0.5
        this.anchorY = light.anchorY ?? 0.5
        this.width = light.width ?? 1
        this.height = light.height ?? 1
        this.angle = Math.radians(light.angle ?? 0)
        break
    }
    this.red = light.red ?? 255
    this.green = light.green ?? 255
    this.blue = light.blue ?? 255
    this.direct = light.direct ?? 0.5
    this.updaters = new UpdaterList()
    this.events = light.events ?? {}
    this.script = ScriptManager.create(this, light.scripts ?? [])
    this.parent = null
    this.started = false
    this.destroyed = false
    SceneLight.latest = this
    GlobalEntityManager.add(this)
    this.emit('create')
  }

  /** 蒙版图像文件ID */
  public get mask(): string {
    return this._mask
  }
  public set mask(value: string) {
    if (this._mask !== value) {
      this._mask = value
      // 销毁上一次的纹理
      if (this.texture) {
        this.texture.destroy()
        this.texture = null
      }
      if (value) {
        this.texture = new ImageTexture(value)
      }
    }
  }

  /** 区域光源锚点X */
  public get anchorX(): number {
    return this._anchorX
  }
  public set anchorX(value: number) {
    this._anchorX = value
    this.areaChanged = true
  }

  /** 区域光源锚点Y */
  public get anchorY(): number {
    return this._anchorY
  }
  public set anchorY(value: number) {
    this._anchorY = value
    this.areaChanged = true
  }

  /** 区域光源宽度 */
  public get width(): number {
    return this._width
  }
  public set width(value: number) {
    this._width = value
    this.areaChanged = true
  }

  /** 区域光源高度 */
  public get height(): number {
    return this._height
  }
  public set height(value: number) {
    this._height = value
    this.areaChanged = true
  }

  /** 区域光源角度(弧度) */
  public get angle(): number {
    return this._angle
  }
  public set angle(value: number) {
    this._angle = value
    this.areaChanged = true
  }

  /**
   * 更新场景光源
   * @param deltaTime 增量时间(毫秒)
   */
  public update(deltaTime: number): void {
    // 更新模块
    this.updaters.update(deltaTime)

    // 如果区域光发生改变，重新测量位置
    if (this.areaChanged) {
      this.areaChanged = false
      this.measure()
    }
  }

  /**
   * 绘制场景光源
   * @param projMatrix 投影矩阵
   * @param opacity 不透明度
   */
  public draw(projMatrix: Matrix, opacity: number): void {
    switch (this.type) {
      case 'point':
        return this.drawPointLight(projMatrix, opacity)
      case 'area':
        return this.drawAreaLight(projMatrix, opacity)
    }
  }

  /**
   * 绘制点光源
   * @param projMatrix 投影矩阵
   * @param opacity 不透明度
   */
  private drawPointLight(projMatrix: Matrix, opacity: number): void {
    const gl = GL
    const vertices = gl.arrays[0].float32
    const r = this.range! / 2
    const ox = this.x
    const oy = this.y
    const dl = ox - r
    const dt = oy - r
    const dr = ox + r
    const db = oy + r
    vertices[0] = dl
    vertices[1] = dt
    vertices[2] = 0
    vertices[3] = 0
    vertices[4] = dl
    vertices[5] = db
    vertices[6] = 0
    vertices[7] = 1
    vertices[8] = dr
    vertices[9] = db
    vertices[10] = 1
    vertices[11] = 1
    vertices[12] = dr
    vertices[13] = dt
    vertices[14] = 1
    vertices[15] = 0
    gl.blend = this.blend
    const program = gl.lightProgram.use()
    const red = this.red * opacity / 255
    const green = this.green * opacity / 255
    const blue = this.blue * opacity / 255
    const intensity = this.intensity!
    gl.bindVertexArray(program.vao.a110)
    gl.vertexAttrib4f(program.a_LightColor, red, green, blue, intensity)
    gl.uniformMatrix3fv(program.u_Matrix, false, projMatrix)
    gl.uniform1i(program.u_LightMode, 0)
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STREAM_DRAW, 0, 16)
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4)
  }

  /**
   * 绘制区域光源
   * @param projMatrix 投影矩阵
   * @param opacity 不透明度
   */
  private drawAreaLight(projMatrix: Matrix, opacity: number): void {
    const texture = this.texture
    if (texture?.complete === false) {
      return
    }
    const gl = GL
    const vertices = gl.arrays[0].float32
    const ox = this.x
    const oy = this.y
    const dl = ox - this.anchorOffsetX!
    const dt = oy - this.anchorOffsetY!
    const dr = dl + this.width
    const db = dt + this.height
    vertices[0] = dl
    vertices[1] = dt
    vertices[2] = 0
    vertices[3] = 0
    vertices[4] = dl
    vertices[5] = db
    vertices[6] = 0
    vertices[7] = 1
    vertices[8] = dr
    vertices[9] = db
    vertices[10] = 1
    vertices[11] = 1
    vertices[12] = dr
    vertices[13] = dt
    vertices[14] = 1
    vertices[15] = 0
    gl.blend = this.blend
    const program = gl.lightProgram.use()
    const mode = texture !== null ? 1 : 2
    const red = this.red * opacity / 255
    const green = this.green * opacity / 255
    const blue = this.blue * opacity / 255
    const matrix = gl.matrix
    .set(projMatrix)
    .rotateAt(ox, oy, this._angle)
    gl.bindVertexArray(program.vao.a110)
    gl.vertexAttrib4f(program.a_LightColor, red, green, blue, 0)
    gl.uniformMatrix3fv(program.u_Matrix, false, matrix)
    gl.uniform1i(program.u_LightMode, mode)
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STREAM_DRAW, 0, 16)
    gl.bindTexture(gl.TEXTURE_2D, texture?.base.glTexture ?? null)
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4)
  }

  /** 测量区域光源的外接矩形(用于做绘制条件判断) */
  private measure(): void {
    // 如果类型不是区域光源，返回
    if (this.type !== 'area') return
    const width = this.width
    const height = this.height
    const anchorOffsetX = width * this.anchorX
    const anchorOffsetY = height * this.anchorY
    const a = -anchorOffsetX
    const b = -anchorOffsetY
    const c = a + width
    const d = b + height
    const angle = this._angle
    const angle1 = Math.atan2(b, a) + angle
    const angle2 = Math.atan2(b, c) + angle
    const angle3 = Math.atan2(d, c) + angle
    const angle4 = Math.atan2(d, a) + angle
    const distance1 = Math.sqrt(a * a + b * b)
    const distance2 = Math.sqrt(c * c + b * b)
    const distance3 = Math.sqrt(c * c + d * d)
    const distance4 = Math.sqrt(a * a + d * d)
    const x1 = Math.cos(angle1) * distance1
    const x2 = Math.cos(angle2) * distance2
    const x3 = Math.cos(angle3) * distance3
    const x4 = Math.cos(angle4) * distance4
    const y1 = Math.sin(angle1) * distance1
    const y2 = Math.sin(angle2) * distance2
    const y3 = Math.sin(angle3) * distance3
    const y4 = Math.sin(angle4) * distance4
    this.anchorOffsetX = anchorOffsetX
    this.anchorOffsetY = anchorOffsetY
    this.measureOffsetX = Math.min(x1, x2, x3, x4)
    this.measureOffsetY = Math.min(y1, y2, y3, y4)
    this.measureWidth = Math.max(Math.abs(x1 - x3), Math.abs(x2 - x4))
    this.measureHeight = Math.max(Math.abs(y1 - y3), Math.abs(y2 - y4))
  }

  /**
   * 移动场景光源
   * @param properties 光源属性词条
   * @param easingId 过渡曲线ID
   * @param duration 持续时间(毫秒)
   */
  public move(properties: HashMap<number>, easingId: string = '', duration: number = 0): void {
    // 转换属性词条的数据结构
    const propEntries = Object.entries(properties) as Array<[string, number]>
    // 允许多个过渡同时存在且不冲突
    const {updaters} = this
    let transitions = updaters.get('move') as UpdaterList | undefined
    // 如果上一次的移动光源过渡未结束，获取过渡更新器列表
    if (transitions) {
      let ti = transitions.length
      while (--ti >= 0) {
        // 获取单个过渡更新器，检查属性词条
        const updater = transitions[ti]
        const entries = updater.entries
        let ei = entries.length
        while (--ei >= 0) {
          const key = entries[ei][0]
          for (const property of propEntries) {
            // 从上一次过渡的属性中删除与当前过渡重复的属性
            if (property[0] === key) {
              entries.splice(ei, 1)
              if (entries.length === 0) {
                transitions.splice(ti, 1)
              }
              break
            }
          }
        }
      }
    }

    // 如果存在过渡
    if (duration > 0) {
      if (!transitions) {
        // 如果不存在过渡更新器列表，新建一个
        transitions = new UpdaterList()
        updaters.set('move', transitions)
      }
      const entries: Array<[key: string, start: number, end: number]> = []
      const map = SceneLight.filters[this.type]
      for (const [key, end] of propEntries) {
        // 过滤掉与当前光源类型不匹配的属性
        if (key in map) {
          const start: number = (this as any)[key]
          entries.push([key, start, end])
        }
      }
      let elapsed = 0
      const easing = Easing.get(easingId)
      // 创建更新器并添加到过渡更新器列表中
      const updater = transitions.add({
        entries: entries,
        update: (deltaTime: number) => {
          elapsed += deltaTime
          const time = easing.get(elapsed / duration)
          for (const [key, start, end] of entries) {
            (this as any)[key] = start * (1 - time) + end * time
          }
          // 如果过渡结束，延迟移除更新器
          if (elapsed >= duration) {
            Callback.push(() => {
              transitions!.remove(updater)
              // 如果过渡更新器列表为空，删除它
              if (transitions!.length === 0) {
                updaters.delete('move')
              }
            })
          }
        }
      })
    } else {
      // 直接设置光源属性
      const map = SceneLight.filters[this.type] as any
      for (const [key, value] of propEntries) {
        // 过滤掉与当前光源类型不匹配的属性
        if (!map[key]) continue
        (this as any)[key] = value
      }
      // 如果存在过渡更新器列表并为空，删除它
      if (transitions?.length === 0) {
        updaters.deleteDelay('move')
      }
    }
  }

  /**
   * 调用场景光源事件
   * @param type 场景光源事件类型
   */
  public callEvent(type: string): void {
    const commands = this.events[type]
    if (commands) {
      const event = new EventHandler(commands)
      event.triggerLight = this
      event.triggerObject = this
      event.selfVarId = this.selfVarId
      EventHandler.call(event, this.updaters)
    }
  }

  /**
   * 调用场景光源事件和脚本
   * @param type 场景光源事件类型
   */
  public emit(type: string): void {
    this.callEvent(type)
    this.script.emit(type, this)
  }

  // 自动执行
  public autorun(): void {
    if (this.started === false) {
      this.started = true
      this.emit('autorun')
    }
  }

  /** 销毁场景光源 */
  public destroy(): void {
    if (!this.destroyed) {
      this.emit('destroy')
      this.destroyed = true
      this.parent?.remove(this)
      GlobalEntityManager.remove(this)
      if (this.texture) {
        this.texture.destroy()
        this.texture = null
      }
    }
  }

  /** 异步销毁场景光源 */
  public destroyAsync(): void {
    Callback.push(() => {
      this.destroy()
    })
  }

  /**
   * 保存场景光源数据
   * @returns 光源存档数据
   */
  public saveData(): LightSaveData {
    switch (this.type) {
      case 'point':
        return {
          name: this.name,
          presetId: this.presetId,
          selfVarId: this.selfVarId,
          visible: this.visible,
          type: this.type,
          blend: this.blend,
          x: this.x,
          y: this.y,
          range: this.range!,
          intensity: this.intensity!,
          red: this.red,
          green: this.green,
          blue: this.blue,
          direct: this.direct,
        }
      case 'area':
        return {
          name: this.name,
          presetId: this.presetId,
          selfVarId: this.selfVarId,
          visible: this.visible,
          type: this.type,
          blend: this.blend,
          x: this.x,
          y: this.y,
          mask: this.mask,
          anchorX: this.anchorX,
          anchorY: this.anchorY,
          width: this.width,
          height: this.height,
          angle: this.angle,
          red: this.red,
          green: this.green,
          blue: this.blue,
          direct: this.direct,
        }
    }
  }

  /** 最新创建光源 */
  public static latest?: SceneLight

  // 属性过滤器[点光源，区域光源]
  private static filters: LightPropertyFilters = {
    point: {x: true, y: true, red: true, green: true, blue: true, range: true, intensity: true},
    area: {x: true, y: true, red: true, green: true, blue: true, anchorX: true, anchorY: true, width: true, height: true, angle: true},
  }
}

/** ******************************** 场景粒子发射管理器 ******************************** */

class SceneParticleEmitterManager {
  /** 场景上下文对象 */
  public scene: SceneContext
  /** 粒子发射器实例列表 */
  public list: Array<SceneParticleEmitter>

  /**
   * 场景粒子发射器列表
   * @param scene 场景上下文
   */
  constructor(scene: SceneContext) {
    this.scene = scene
    this.list = []
  }

  /**
   * 添加场景粒子发射器到管理器中
   * @param emitter 场景粒子发射器
   */
  public append(emitter: SceneParticleEmitter): void {
    if (emitter.parent === null) {
      emitter.parent = this
      this.list.push(emitter)
      this.scene.entity.add(emitter)
      if (this.scene.enabled) {
        // 可能不是场景粒子发射器
        emitter.autorun?.()
      }
    }
  }

  /**
   * 从管理器中移除场景粒子发射器
   * @param emitter 场景粒子发射器
   */
  public remove(emitter: SceneParticleEmitter): void {
    if (emitter.parent === this) {
      emitter.parent = null
      this.list.remove(emitter)
      this.scene.entity.remove(emitter)
    }
  }

  /**
   * 更新场景粒子发射器
   * @param deltaTime 增量时间(毫秒)
   */
  public update(deltaTime: number): void {
    for (const emitter of this.list) {
      emitter.update(deltaTime)
    }
  }

  /** 发送自动执行事件 */
  public autorun(): void {
    for (const emitter of this.list) {
      // 可能不是场景粒子发射器
      emitter.autorun?.()
    }
  }

  /** 销毁管理器中的场景粒子发射器 */
  public destroy(): void {
    const {list} = this
    let i = list.length
    while (--i >= 0) {
      list[i].destroy()
    }
  }

  /**
   * 保存场景粒子发射器列表数据
   * @returns 粒子存档数据列表
   */
  public saveData(): Array<ParticleEmitterSaveData> {
    const list = this.list
    const length = list.length
    const data = []
    for (let i = 0; i < length; i++) {
      const emitter = list[i]
      if (!emitter.temporary) {
        data.push(emitter.saveData())
      }
    }
    return data
  }

  /**
   * 加载场景粒子发射器列表数据
   * @param emitters 粒子存档数据列表
   */
  public loadData(emitters: Array<ParticleEmitterSaveData>): void {
    const presets = Scene.presets
    for (const savedData of emitters) {
      const preset = presets[savedData.presetId]
      if (preset?.class === 'particle') {
        const data = Data.particles[preset.particleId]
        if (data) {
          // 重新创建粒子实例
          savedData.events = preset.events
          savedData.scripts = preset.scripts
          this.append(new SceneParticleEmitter(data, savedData))
        }
      }
    }
  }
}

/** ******************************** 场景粒子发射器 ******************************** */

class SceneParticleEmitter extends ParticleEmitter {
  /** 粒子发射器名称 */
  public name: string
  /** 粒子发射器对象实体ID */
  public entityId: string
  /** 粒子发射器预设数据ID */
  public presetId: string
  /** 粒子发射器独立变量ID */
  public selfVarId: string
  /** 粒子发射器水平位置 */
  public x: number = 0
  /** 粒子发射器垂直位置 */
  public y: number = 0
  /** 粒子发射器更新器模块列表 */
  public updaters: UpdaterList
  /** 粒子发射器事件映射表 */
  public events: HashMap<CommandFunctionList>
  /** 粒子发射器脚本管理器 */
  public script: ScriptManager
  /** 已开始状态 */
  private started: boolean
  /** 是否为临时对象 */
  public temporary: boolean

  /**
   * 场景粒子发射器
   * @param node 场景中预设的粒子发射器数据
   * @param data 粒子文件数据
   */
  constructor(data: ParticleFile, node: ParticleEmitterOptions = {}) {
    super(data)
    this.name = node.name ?? ''
    this.entityId = ''
    this.presetId = node.presetId ?? ''
    this.selfVarId = node.selfVarId ?? ''
    this.visible = node.visible ?? true
    this.x = node.x ?? 0
    this.y = node.y ?? 0
    this.angle = node.angle ?? 0
    this.scale = node.scale ?? 1
    this.speed = node.speed ?? 1
    this.opacity = node.opacity ?? 1
    this.priority = node.priority ?? 0
    this.updaters = new UpdaterList()
    this.events = node.events ?? {}
    this.script = ScriptManager.create(this, node.scripts ?? [])
    this.started = false
    this.temporary = false
    GlobalEntityManager.add(this)
    this.emit('create')
  }

  /**
   * 更新场景粒子发射器
   * @param deltaTime 增量时间(毫秒)
   */
  public update(deltaTime: number): void {
    const al = Camera.animationLeftT
    const at = Camera.animationTopT
    const ar = Camera.animationRightT
    const ab = Camera.animationBottomT
    const x = this.x
    const y = this.y
    // 更新发射开始位置
    const manager = this.parent
    if (manager instanceof SceneParticleEmitterManager) {
      this.startX = x * manager.scene.tileWidth
      this.startY = y * manager.scene.tileHeight
    }
    // 如果粒子发射器可见，则发射新的粒子
    if (x >= al && x < ar && y >= at && y < ab || this.alwaysEmit) {
      this.emitParticles(deltaTime)
    }
    this.updateParticles(deltaTime)
    this.updaters.update(deltaTime)
  }

  /**
   * 调用场景粒子发射器事件
   * @param type 场景粒子发射器事件类型
   */
  public callEvent(type: string): void {
    const commands = this.events[type]
    if (commands) {
      const event = new EventHandler(commands)
      event.triggerObject = this
      event.selfVarId = this.selfVarId
      EventHandler.call(event, this.updaters)
    }
  }

  /**
   * 调用场景粒子发射器事件和脚本
   * @param type 场景粒子发射器事件类型
   */
  public emit(type: string): void {
    this.callEvent(type)
    this.script.emit(type, this)
  }

  // 自动执行
  public autorun(): void {
    if (this.started === false) {
      this.started = true
      this.emit('autorun')
    }
  }

  /** 销毁场景粒子发射器 */
  public destroy(): void {
    if (!this.destroyed) {
      this.emit('destroy')
      if (this.parent instanceof SceneParticleEmitterManager) {
        this.parent.remove(this)
      }
      GlobalEntityManager.remove(this)
      super.destroy()
    }
  }

  /** 异步销毁粒子发射器 */
  public destroyAsync(): void {
    Callback.push(() => {
      this.destroy()
    })
  }

  /**
   * 保存场景粒子发射器数据
   * @returns 粒子存档数据
   */
  public saveData(): ParticleEmitterSaveData {
    return {
      name: this.name,
      entityId: this.entityId,
      presetId: this.presetId,
      selfVarId: this.selfVarId,
      visible: this.visible,
      x: this.x,
      y: this.y,
      angle: this.angle,
      scale: this.scale,
      speed: this.speed,
      opacity: this.opacity,
      priority: this.priority,
    }
  }
}

/** ******************************** 场景精灵渲染器 ******************************** */

class SceneSpriteRenderer {
  /** 场景对象列表组 */
  private objectLists!: Array<Array<SceneObject>>
  /** 动画对象列表组 */
  private animationLists: Array<CacheList<SceneObject>>
  /** 缓存对象列表组 */
  private cacheLists: Array<CacheList<SceneObject>>
  /** 对象索引列表 */
  private indices: Uint32Array

  /**
   * 场景精灵渲染器
   * @param animationLists 可见动画列表组
   */
  constructor(...animationLists: Array<CacheList<SceneObject>>) {
    this.animationLists = animationLists
    this.cacheLists = animationLists.map(() => new CacheList())
    this.indices = new Uint32Array(animationLists.length)
  }

  /** 重置所有数据 */
  public reset(): void {
    for (const animList of this.animationLists) {
      animList.clear()
    }
  }

  /**
   * 设置场景对象列表组
   * @param objectLists 场景对象列表组
   */
  public setObjectLists(...objectLists: Array<Array<SceneObject>>): void {
    this.objectLists = objectLists
  }

  /** 渲染场景中的可见对象 */
  public render(): void {
    const {max, min, floor, ceil, round} = Math
    const gl = GL
    const lightmap = gl.reflectedLightMap
    const scene = Scene.binding!
    const tw = scene.tileWidth
    const th = scene.tileHeight
    const tl = Camera.tileLeft
    const tt = Camera.tileTop
    const tr = Camera.tileRight
    const tb = Camera.tileBottom
    const ll = Camera.scrollLeft - lightmap.maxExpansionLeft
    const lt = Camera.scrollTop - lightmap.maxExpansionTop
    const lr = Camera.scrollRight + lightmap.maxExpansionRight
    const lb = Camera.scrollBottom + lightmap.maxExpansionBottom
    const lw = lr - ll
    const lh = lb - lt
    const ly = th / 2 / lh
    const layers = gl.layers
    const starts = gl.zeros
    const ends = gl.arrays[1].uint32
    const set = gl.arrays[2].uint32
    const data = gl.arrays[3].float32
    const datau = gl.arrays[3].uint32
    let li = 0
    let si = 2
    let di = 0

    // 获取对象层瓦片地图中可见图块的数据
    const {doodads} = Scene.parallax
    const dLength = doodads.length
    for (let i = 0; i < dLength; i++) {
      const tilemap = doodads[i] as SceneTilemap
      if (!tilemap.visible) continue
      const imageData = tilemap.imageData
      if (imageData === null) continue
      const tiles = tilemap.tiles
      const width = tilemap.width
      const height = tilemap.height
      const anchor = Scene.getParallaxAnchor(tilemap)
      const ax = tilemap.anchorX * width * tw
      const ay = tilemap.anchorY * height * th
      const ox = anchor.x - ax + tilemap.offsetX
      const oy = anchor.y - ay + tilemap.offsetY
      const bx = max(floor((tl - ox) / tw), 0)
      const by = max(floor((tt - oy) / th), 0)
      const ex = min(ceil((tr - ox) / tw), width)
      const ey = min(ceil((tb - oy) / th), height)
      const opacity = Math.round(tilemap.opacity * 255) << 8
      for (let y = by; y < ey; y++) {
        for (let x = bx; x < ex; x++) {
          const ti = x + y * width
          const tile = tiles[ti]
          const array = imageData[tile]
          if (!array) continue
          const tp = array[1]
          // 把网格底部作为图块锚点
          const ax = (x + 0.5) * tw + ox
          const ay = (y + 1) * th + oy
          // 计算锚点在光照贴图中的位置
          const px = (ax - ll) / lw
          const py = (ay - lt + tp * th) / lh
          // 根据锚点的Y坐标来计算优先级，并作为键
          const key = max(0, min(0x3ffff, round(
            py * 0x20000 + 0x10000
          )))
          // 光线采样锚点的Y坐标向上偏移了0.5格(网格中心)
          const anchor = (
            round(max(min(px, 1), 0) * 0xffff)
          | round(max(min(py - ly, 1), 0) * 0xffff) << 16
          )
          datau[di    ] = i
          datau[di + 1] = tile
          data[di + 2] = ax - tw / 2
          data[di + 3] = ay - th
          datau[di + 4] = anchor
          datau[di + 5] = opacity
          if (starts[key] === 0) {
            starts[key] = si
            layers[li++] = key
          } else {
            set[ends[key] + 1] = si
          }
          ends[key] = si
          set[si++] = di
          set[si++] = 0
          di += 6
        }
      }
    }

    // 获取可见动画(角色、动画、触发器)
    const convert2f = Scene.convert2f
    const al = Camera.animationLeftT
    const at = Camera.animationTopT
    const ar = Camera.animationRightT
    const ab = Camera.animationBottomT
    const pFactor = th / lh
    const animLists = this.animationLists
    const cacheLists = this.cacheLists
    const objectLists = this.objectLists
    const aLength = animLists.length
    for (let a = 0; a < aLength; a++) {
      let count = 0
      const animList = animLists[a]
      const cacheList = cacheLists[a]
      const objectList = objectLists[a]
      const length = objectList.length
      if (a === 0) {
        // 遍历角色对象
        for (let i = 0; i < length; i++) {
          const actor = objectList[i] as Actor
          const {x, y} = actor
          // 如果动画在屏幕中可见或动画存在已激活粒子的情况
          if (x >= al && x < ar && y >= at && y < ab && actor.visible) {
            // 计算动画的锚点
            const {x: ax, y: ay} = convert2f(x, y)
            // 计算锚点在光照贴图中的位置
            const px = (ax - ll) / lw
            const py = (ay - lt) / lh
            const p = actor.priority * pFactor
            // 根据锚点的Y坐标来计算优先级，并作为键
            const key = max(0, min(0x3ffff, round(
              (py + p) * 0x20000 + 0x10000
            )))
            datau[di    ] = 0x10000 | a
            datau[di + 1] = count
            if (starts[key] === 0) {
              starts[key] = si
              layers[li++] = key
            } else {
              set[ends[key] + 1] = si
            }
            ends[key] = si
            set[si++] = di
            set[si++] = 0
            di += 2
            actor.animationManager.activate(ax, ay, px, py)
            cacheList[count++] = actor
          } else if (actor.animationManager.existParticles) {
            // 如果动画中存在粒子，更新粒子发射器的矩阵
            const {x: ax, y: ay} = convert2f(x, y)
            actor.animationManager.activate(ax, ay, 0, 0)
          }
        }
      } else if (a === 1) {
        // 遍历动画对象
        for (let i = 0; i < length; i++) {
          const animation = objectList[i] as SceneAnimation
          const {x, y} = animation.position
          // 如果动画在屏幕中可见或动画存在已激活粒子的情况
          if (x >= al && x < ar && y >= at && y < ab && animation.visible) {
            // 计算动画的锚点
            const {x: ax, y: ay} = convert2f(x, y)
            // 计算锚点在光照贴图中的位置
            const px = (ax - ll) / lw
            const py = (ay - lt) / lh
            const p = animation.priority * pFactor
            // 根据锚点的Y坐标来计算优先级，并作为键
            const key = max(0, min(0x3ffff, round(
              (py + p) * 0x20000 + 0x10000
            )))
            datau[di    ] = 0x10000 | a
            datau[di + 1] = count
            if (starts[key] === 0) {
              starts[key] = si
              layers[li++] = key
            } else {
              set[ends[key] + 1] = si
            }
            ends[key] = si
            set[si++] = di
            set[si++] = 0
            di += 2
            animation.activate(ax, ay, px, py)
            cacheList[count++] = animation
          } else if (animation.existParticles) {
            // 如果动画中存在粒子，更新粒子发射器的矩阵
            const {x: ax, y: ay} = convert2f(x, y)
            animation.activate(ax, ay, 0, 0)
          }
        }
      } else if (a === 2) {
        for (let i = 0; i < length; i++) {
          const trigger = objectList[i] as Trigger
          const animation = trigger.animation
          const {x, y} = trigger
          // 如果动画在屏幕中可见或动画存在已激活粒子的情况
          if (x >= al && x < ar && y >= at && y < ab) {
            // 计算动画的锚点
            const {x: ax, y: ay} = convert2f(x, y)
            // 计算锚点在光照贴图中的位置
            const px = (ax - ll) / lw
            const py = (ay - lt) / lh
            const p = animation ? animation.priority * pFactor : 0
            // 根据锚点的Y坐标来计算优先级，并作为键
            const key = max(0, min(0x3ffff, round(
              (py + p) * 0x20000 + 0x10000
            )))
            datau[di    ] = 0x10000 | a
            datau[di + 1] = count
            if (starts[key] === 0) {
              starts[key] = si
              layers[li++] = key
            } else {
              set[ends[key] + 1] = si
            }
            ends[key] = si
            set[si++] = di
            set[si++] = 0
            di += 2
            animation?.activate(ax, ay, px, py)
            cacheList[count++] = trigger
          } else if (animation?.existParticles) {
            // 如果动画中存在粒子，更新粒子发射器的矩阵
            const {x: ax, y: ay} = convert2f(x, y)
            animation.activate(ax, ay, 0, 0)
          }
        }
      } else {
        // 遍历粒子发射器
        for (let i = 0; i < length; i++) {
          const emitter = objectList[i] as SceneParticleEmitter
          const {x, y} = emitter
          // 如果粒子在屏幕中可见或总是绘制的情况
          if ((x >= al && x < ar && y >= at && y < ab || emitter.alwaysDraw) && emitter.visible) {
            // 计算粒子的锚点
            const {y: ay} = convert2f(x, y)
            // 计算锚点在光照贴图中的位置
            const py = (ay - lt) / lh
            const p = emitter.priority * pFactor
            // 根据锚点的Y坐标来计算优先级，并作为键
            const key = max(0, min(0x3ffff, round(
              (py + p) * 0x20000 + 0x10000
            )))
            datau[di    ] = 0x10000 | a
            datau[di + 1] = count
            if (starts[key] === 0) {
              starts[key] = si
              layers[li++] = key
            } else {
              set[ends[key] + 1] = si
            }
            ends[key] = si
            set[si++] = di
            set[si++] = 0
            di += 2
            cacheList[count++] = emitter
          }
        }
      }
      // 擦除过期的动画对象引用
      const end = animList.count
      for (let i = count; i < end; i++) {
        animList[i] = cacheList[i] = undefined
      }
      animList.count = count
    }

    // 绘制图像
    if (li !== 0) {
      const sl = Camera.scrollLeft
      const st = Camera.scrollTop
      const indices = this.indices.fill(0)
      const vertices = gl.arrays[0].float32
      const attributes = gl.arrays[0].uint32
      const blend = gl.batchRenderer.setBlendMode
      const push = gl.batchRenderer.push
      const response = gl.batchRenderer.response
      // 动画和对象层图块共用GL精灵程序进行绘制
      const program = gl.spriteProgram.use()
      const matrix = gl.matrix.project(
        gl.flip,
        Camera.width,
        Camera.height,
      ).translate(-sl, -st)
      // 绑定渲染器程序为当前程序
      // 切换成粒子程序后自动恢复
      gl.batchRenderer.bindProgram()
      // 使用队列渲染器进行批量渲染
      gl.batchRenderer.setAttrSize(8)
      gl.bindVertexArray(program.vao)
      gl.uniformMatrix3fv(program.u_Matrix, false, matrix)
      const modeMap = AnimationPlayer.lightSamplingModes
      const frame = scene.animFrame
      // 借助类型化数组对键(优先级)进行排序
      const queue = new Uint32Array(layers.buffer, 0, li).sort()
      for (let i = 0; i < li; i++) {
        // 通过排序后的键来获取图块或动画
        const key = queue[i]
        let si = starts[key]
        starts[key] = 0
        do {
          const di = set[si]
          const code1 = datau[di]
          const code2 = datau[di + 1]
          if (code1 < 0x10000) {
            // 如果第一个数据小于0x10000，则是图块索引
            const tilemap = doodads[code1] as SceneTilemap
            const light = modeMap[tilemap.light as keyof AnimationLightSamplingModes] << 16
            const array = tilemap.imageData[code2]!
            blend(tilemap.blend)
            push(array[0])
            const fi = frame % array[2] * 4 + 7
            const dx = data[di + 2]
            const dy = data[di + 3]
            const anchor = datau[di + 4]
            const opacity = datau[di + 5]
            const dl = array[3] + dx
            const dt = array[4] + dy
            const dr = array[5] + dx
            const db = array[6] + dy
            const sl = array[fi    ]
            const st = array[fi + 1]
            const sr = array[fi + 2]
            const sb = array[fi + 3]
            const vi = response[0] * 8
            // 参数压缩：纹理采样器ID，不透明度，光线采样模式
            const param = response[1] | opacity | light
            vertices  [vi    ] = dl
            vertices  [vi + 1] = dt
            vertices  [vi + 2] = sl
            vertices  [vi + 3] = st
            attributes[vi + 4] = param
            // 两个0x00ff00ff等于色调(0,0,0,0)
            attributes[vi + 5] = 0x00ff00ff
            attributes[vi + 6] = 0x00ff00ff
            attributes[vi + 7] = anchor
            vertices  [vi + 8] = dl
            vertices  [vi + 9] = db
            vertices  [vi + 10] = sl
            vertices  [vi + 11] = sb
            attributes[vi + 12] = param
            attributes[vi + 13] = 0x00ff00ff
            attributes[vi + 14] = 0x00ff00ff
            attributes[vi + 15] = anchor
            vertices  [vi + 16] = dr
            vertices  [vi + 17] = db
            vertices  [vi + 18] = sr
            vertices  [vi + 19] = sb
            attributes[vi + 20] = param
            attributes[vi + 21] = 0x00ff00ff
            attributes[vi + 22] = 0x00ff00ff
            attributes[vi + 23] = anchor
            vertices  [vi + 24] = dr
            vertices  [vi + 25] = dt
            vertices  [vi + 26] = sr
            vertices  [vi + 27] = st
            attributes[vi + 28] = param
            attributes[vi + 29] = 0x00ff00ff
            attributes[vi + 30] = 0x00ff00ff
            attributes[vi + 31] = anchor
          } else {
            // 否则，是动画所在列表的索引
            const li = code1 & 0xffff
            const object = cacheLists[li][code2]!
            animLists[li][indices[li]++] = object
            switch (li) {
              case 0:
                (object as Actor).animationManager.draw()
                break
              case 1:
                (object as SceneAnimation).draw()
                break
              case 2:
                (object as Trigger).animation?.draw()
                break
              case 3:
                gl.batchRenderer.draw();
                (object as SceneParticleEmitter).draw()
                break
            }
          }
        } while ((si = set[si + 1]) !== 0)
      }
      gl.batchRenderer.draw()
      gl.batchRenderer.unbindProgram()
      gl.blend = 'normal'
    }
  }
}

/** ******************************** 场景直射光渲染器 ******************************** */

class SceneDirectLightRenderer {
  // 渲染
  public render(): void {
    GL.blend = 'additive'
    GL.drawImage(GL.directLightMap, 0, 0, GL.width, GL.height)
  }
}

/** ******************************** 场景路径导航器 ******************************** */

let PathFinder = new class ScenePathFinder {
  /** 顶点开关状态列表 */
  private states!: Uint8Array
  /** 存放已打开顶点的状态索引的列表 */
  private indices!: Uint32Array
  /** 存放寻路顶点数据的列表 */
  private vertices!: Float64Array
  /** 存放已打开顶点的数据索引的列表 */
  private openset!: Uint32Array
  /** 根据期望值获取优先处理的顶点列表 */
  private queue!: Uint32Array
  /** 相邻图块的八个方向坐标偏移值列表 */
  private offsets: Int32Array = new Int32Array([0, -1,  1,  0,  0,  1, -1,  0, -1, -1,  1, -1,  1,  1, -1,  1])
  /** 已打开顶点的数量 */
  private stateCount: number = 0
  /** 顶点开集索引列表中的开启数量 */
  private opensetCount: number = 0
  /** 当前优先队列中的顶点数量 */
  private queueCount: number = 0
  /** 寻路期望值的阈值，当达到阈值后强制结束寻路 */
  private threshold: number = 0
  /** 路径的最大额外成本 */
  public maxExtraCost: number = 80
  /** 地形障碍物的成本 */
  public terrainObstacleCost: number = 40
  /** 角色障碍物的成本 */
  public actorObstacleCost: number = 16
  /** 当前场景地图宽度 */
  private width: number = 0
  /** 当前场景地图高度 */
  private height: number = 0
  /** 当前场景地形数组 */
  private terrains!: Uint8Array
  /** 当前场景障碍数组 */
  private obstacles!: Uint32Array

  /** 初始化 */
  public initialize(): void {
    this.states = new Uint8Array(GL.zeros.buffer, 0, 512 * 512)
    this.indices = new Uint32Array(GL.arrays[1].uint32.buffer, 0, 512 * 512)
    this.vertices = new Float64Array(GL.arrays[0].float64.buffer, 0, 512 * 512 * 6)
    this.openset = new Uint32Array(GL.zeros.buffer, 512 * 512, 512 * 512 * 2 / 4)
    this.queue = new Uint32Array(GL.arrays[2].uint32.buffer, 0, 100)
  }

  /**
   * 创建路径(Lazy Theta*寻路算法)
   * @param startX 起点位置X
   * @param startY 起点位置Y
   * @param destX 终点位置X
   * @param destY 终点位置Y
   * @param passage 角色通行区域
   * @param bypass 是否绕过角色
   * @returns 角色移动路径
   */
  public createPath(startX: number, startY: number, destX: number, destY: number, passage: number, bypass: boolean): MovementPath {
    const scene = Scene.binding!
    const sx = Math.floor(startX)
    const sy = Math.floor(startY)
    const dx = Math.floor(destX)
    const dy = Math.floor(destY)
    const width = PathFinder.width = scene.width
    const height = PathFinder.height = scene.height
    // 如果起点和终点在同一网格，或不受地形限制，或处于场景网格之外，返回单位路径
    if (sx === dx && sy === dy || passage === -1 ||
      sx < 0 || sx >= width || sy < 0 || sy >= height ||
      dx < 0 || dx >= width || dy < 0 || dy >= height) {
      return PathFinder.createUnitPath(destX, destY)
    }
    // 设置终点权重(权重越高，寻路计算步骤越少，计算出来的可能不是最佳路线)
    const H_WEIGHT = 1.25
    const startIndex = (sx + sy * 512) * 6
    const {vertices, openset, queue, offsets} = PathFinder
    // 设置绕开角色开关
    PathFinder.setBypass(bypass)
    // 获取场景地形
    PathFinder.terrains = scene.terrain.compositeArray
    // 获取场景障碍
    PathFinder.obstacles = scene.obstacle.array
    // 设置寻路阈值，期望值达到阈值后放弃计算
    PathFinder.threshold = Math.dist(sx, sy, dx, dy) + PathFinder.maxExtraCost
    // 打开起点
    PathFinder.openVertex(sx, sy, 0, 0, startIndex, false)
    // 循环更新顶点队列
    while (PathFinder.updateQueue()) {
      for (let i = 0; i < PathFinder.queueCount; i++) {
        // 获取队列中的顶点数据，再将其关闭
        const oi = queue[i]
        const vi = openset[oi] - 1
        const tx = vertices[vi    ]
        const ty = vertices[vi + 1]
        const c = vertices[vi + 2]
        const pi = vertices[vi + 4]
        const px = vertices[pi    ]
        const py = vertices[pi + 1]
        const pc = vertices[pi + 2]
        PathFinder.closeVertex(oi)
        // 如果到达终点，擦除数据并建立路径
        if (tx === dx && ty === dy) {
          PathFinder.clear()
          return this.buildPath(startX, startY, destX, destY, vi, passage)
        }
        // 遍历8个偏移方向的顶点
        for (let i = 0; i < 16; i += 2) {
          const nx = tx + offsets[i]
          const ny = ty + offsets[i + 1]
          // 如果顶点在有效网格区域内
          if (tx >= 0 && tx < width && ty >= 0 && ty < height) {
            const cost = PathFinder.calculateExtraCostBetween(tx, ty, nx, ny, passage)
            if (cost === 0 && PathFinder.isInLineOfSight(px, py, nx, ny, passage)) {
              // 如果相邻网格可通行，且与父节点可见
              // 则计算到父节点的成本和到终点的期望值，打开该顶点
              const nc = pc + Math.dist(nx, ny, px, py)
              const ne = nc + Math.dist(nx, ny, dx, dy) * H_WEIGHT
              PathFinder.openVertex(nx, ny, nc, ne, pi, false)
            } else {
              // 否则计算相邻成本，增加额外成本
              // 以及计算到终点的期望值，打开该顶点
              const nc = c + Math.dist(nx, ny, tx, ty) + cost
              const ne = nc + Math.dist(nx, ny, dx, dy) * H_WEIGHT
              PathFinder.openVertex(nx, ny, nc, ne, vi, cost === 0)
            }
          }
        }
      }
    }
    PathFinder.clear()
    // 没有找到路径，返回单位路径
    return PathFinder.createUnitPath(destX, destY)
  }

  /**
   * 创建单位移动路径
   * @param destX 终点位置X
   * @param destY 终点位置Y
   * @returns 角色移动路径
   */
  public createUnitPath(destX: number, destY: number): MovementPath {
    const path = new Float64Array(2) as MovementPath
    path[0] = destX
    path[1] = destY
    path.index = 0
    return path
  }

  /**
   * 使用寻路后的数据建立路径
   * @param startX 起点位置X
   * @param startY 起点位置Y
   * @param destX 终点位置X
   * @param destY 终点位置Y
   * @param endIndex 终点顶点索引
   * @param passage 角色通行区域
   * @returns 角色移动路径
   */
  private buildPath(startX: number, startY: number, destX: number, destY: number, endIndex: number, passage: number): MovementPath {
    const vertices = PathFinder.vertices
    const radius = ActorCollider.sceneCollisionRadius
    const caches = GL.arrays[1].float64
    let blocked = false
    let vi = endIndex
    let ci = caches.length
    caches[--ci] = destY
    caches[--ci] = destX
    while (true) {
      // 丢弃不可通行的节点
      while (vertices[vi + 5]) {
        blocked = true
        vi = vertices[vi + 4]
      }

      // 获取父节点索引
      vi = vertices[vi + 4]

      // 如果到达起点，跳出
      if (vertices[vi + 2] === 0) {
        break
      }

      // 插入中转点到缓存
      const x = vertices[vi]
      const y = vertices[vi + 1]
      caches[--ci] = y + 0.5
      caches[--ci] = x + 0.5
    }
    // 插入起点到缓存
    caches[--ci] = startY
    caches[--ci] = startX

    // 调整终点坐标(要求可通行)
    if (!blocked) {
      const width = PathFinder.width
      const height = PathFinder.height
      const terrains = PathFinder.terrains
      const i = caches.length - 2
      const x = Math.floor(caches[i])
      const y = Math.floor(caches[i + 1])
      const bi = x + y * width
      // 如果左边不可通行，限制水平位置避免撞墙
      if (x > 0 && terrains[bi - 1] !== passage) {
        caches[i] = Math.max(caches[i], x + radius)
      }
      // 如果右边不可通行，限制水平位置避免撞墙
      if (x < width - 1 && terrains[bi + 1] !== passage) {
        caches[i] = Math.min(caches[i], x + 1 - radius)
      }
      // 如果上边不可通行，限制垂直位置避免撞墙
      if (y > 0 && terrains[bi - width] !== passage) {
        caches[i + 1] = Math.max(caches[i + 1], y + radius)
      }
      // 如果下边不可通行，限制垂直位置避免撞墙
      if (y < height - 1 && terrains[bi + width] !== passage) {
        caches[i + 1] = Math.min(caches[i + 1], y + 1 - radius)
      }
    }

    // 调整最后一个拐点(如果存在)
    // 已发现问题：角色可能会卡在这个拐点(靠近墙，无法到达目的地)
    const pi = caches.length - 6
    if (!blocked && pi >= 0) {
      const px = caches[pi]
      const py = caches[pi + 1]
      const cx = caches[pi + 2]
      const cy = caches[pi + 3]
      const ex = Math.floor(caches[pi + 4])
      const ey = Math.floor(caches[pi + 5])
      const dist = Math.dist(cx, cy, px, py)
      for (let i = 1; i < dist; i++) {
        // 连接最后第2、3个点，计算插值节点
        const ratio = i / dist
        const x = cx * (1 - ratio) + px * ratio
        const y = cy * (1 - ratio) + py * ratio
        const dx = Math.floor(x)
        const dy = Math.floor(y)
        // 如果插值节点与终点可见，则设置最后第2个节点为该点
        if (PathFinder.isInLineOfSight(ex, ey, dx, dy, -1)) {
          caches[pi + 2] = x
          caches[pi + 3] = y
        } else {
          break
        }
      }
    }

    // 调整中转点坐标(碰撞半径不为0.5)
    if (radius !== 0.5) {
      const end = caches.length - 2
      for (let i = ci + 2; i < end; i += 2) {
        const x0 = caches[i]
        const y0 = caches[i + 1]
        const x1 = caches[i - 2]
        const y1 = caches[i - 1]
        const x2 = caches[i + 2]
        const y2 = caches[i + 3]
        const radian1 = Math.modRadians(Math.atan2(y1 - y0, x1 - x0))
        const radian2 = Math.modRadians(Math.atan2(y2 - y0, x2 - x0))
        // 求中转点拐角平分线的弧度
        const radian = Math.abs(radian1 - radian2) < Math.PI
        ? (radian1 + radian2) / 2
        : (radian1 + radian2) / 2 + Math.PI
        const horizontal = Math.cos(radian)
        const vertical = Math.sin(radian)
        const x = Math.floor(x0)
        const y = Math.floor(y0)
        // 假设中转点附近一定有墙的拐角，调整中转点，让它贴近墙面
        // 根据拐角平分线的水平和垂直分量来判定4个方位的拐角
        if (horizontal < -0.0001) caches[i] = x + radius
        if (horizontal > 0.0001) caches[i] = x + 1 - radius
        if (vertical < -0.0001) caches[i + 1] = y + radius
        if (vertical > 0.0001) caches[i + 1] = y + 1 - radius
      }
    }

    // 创建移动路径(不包括起点位置)
    const path = caches.slice(ci + 2) as MovementPath
    path.index = 0
    return path
  }

  /**
   * 打开路径顶点
   * @param x 场景图块X
   * @param y 场景图块Y
   * @param cost 已知路径成本
   * @param expectation 路径总成本期望值
   * @param parentIndex 父级顶点的索引
   * @param blocked 与上一个顶点之间是否阻塞
   */
  private openVertex = (x: number, y: number, cost: number, expectation: number, parentIndex: number, blocked: boolean): void => {
    const si = x + y * 512
    const vi = si * 6
    switch (PathFinder.states[si]) {
      case 0:
        // 如果顶点是关闭状态，则将其插入开启列表
        for (let i = 0; i <= PathFinder.opensetCount; i++) {
          if (PathFinder.openset[i] === 0) {
            if (PathFinder.opensetCount === i) {
              PathFinder.opensetCount++
            }
            // 设置顶点数据
            PathFinder.vertices[vi    ] = x
            PathFinder.vertices[vi + 1] = y
            PathFinder.vertices[vi + 2] = cost
            PathFinder.vertices[vi + 3] = expectation
            PathFinder.vertices[vi + 4] = parentIndex
            PathFinder.vertices[vi + 5] = blocked ? 1 : 0
            PathFinder.openset[i] = vi + 1
            // 设置为打开状态
            PathFinder.states[si] = 1
            PathFinder.indices[PathFinder.stateCount++] = si
            return
          }
        }
        return
      case 1:
        // 如果顶点是打开状态，且新的数据成本更低，则替换
        if (PathFinder.vertices[vi + 2] > cost) {
          PathFinder.vertices[vi + 2] = cost
          PathFinder.vertices[vi + 3] = expectation
          PathFinder.vertices[vi + 4] = parentIndex
          PathFinder.vertices[vi + 5] = blocked ? 1 : 0
        }
        return
    }
  }

  /**
   * 关闭路径顶点
   * @param openedIndex 打开的顶点索引
   */
  private closeVertex = (openedIndex: number): void => {
    PathFinder.openset[openedIndex] = 0
    // 如果顶点正好处于尾部，则减少开启列表的计数
    if (PathFinder.opensetCount === openedIndex + 1) {
      PathFinder.opensetCount = openedIndex
    }
  }

  /**
   * 更新顶点队列
   * @returns 是否还有可用的顶点
   */
  private updateQueue = (): boolean => {
    let count = 0
    let expectation = Infinity
    // 遍历开启列表中的顶点
    const {vertices, openset, queue, opensetCount} = PathFinder
    for (let oi = 0; oi < opensetCount; oi++) {
      // openset[oi] = 0为空
      // openset[oi] > 0为有效顶点
      const vi = openset[oi] - 1
      if (vi >= 0) {
        const ve = vertices[vi + 3]
        if (ve > expectation) {
          // 如果顶点期望值超出，跳过
          continue
        }
        if (ve < expectation) {
          // 如果顶点期望值较低，重置队列
          // 且把该顶点作为队列中第一个数据
          expectation = ve
          queue[0] = oi
          count = 1
        } else if (count < 100) {
          // 如果顶点期望值持平，添加顶点到队列中
          queue[count++] = oi
        }
      }
    }
    if (expectation < PathFinder.threshold) {
      // 如果最终期望值小于阈值，则设置队列长度，返回true(继续)
      PathFinder.queueCount = count
      return true
    } else {
      // 否则，则重置队列长度，返回false(中断)
      PathFinder.queueCount = 0
      return false
    }
  }

  /** 擦除寻路数据 */
  private clear = (): void => {
    // 擦除顶点的状态数据
    const {states, indices, openset} = PathFinder
    const {stateCount, opensetCount} = PathFinder
    for (let i = 0; i < stateCount; i++) {
      states[indices[i]] = 0
    }
    PathFinder.stateCount = 0

    // 擦除已打开的顶点数据(擦除首个数据即可)
    for (let i = 0; i < opensetCount; i++) {
      openset[i] = 0
    }
    PathFinder.opensetCount = 0
  }

  /**
   * 设置绕开角色开关
   * @param bypass 是否绕开角色
   */
  private setBypass(bypass: boolean): void {
    switch (bypass) {
      case false:
        this.calculateExtraCostBetween = PathFinder.normalCalculateExtraCostBetween
        this.isInLineOfSight = PathFinder.normalIsInLineOfSight
        break
      case true:
        this.calculateExtraCostBetween = PathFinder.bypassCalculateExtraCostBetween
        this.isInLineOfSight = PathFinder.bypassIsInLineOfSight
        break
    }
  }

  /**
   * 计算相邻图块之间的额外通行成本
   * @param sx 起点图块X
   * @param sy 起点图块Y
   * @param dx 终点图块X
   * @param dy 终点图块Y
   * @param passage 角色通行区域
   * @returns 额外的寻路成本
   */
  private calculateExtraCostBetween!: (sx: number, sy: number, dx: number, dy: number, passage: number) => number

  /**
   * 判断目标点是否在视线内
   * @param sx 起始图块X
   * @param sy 起始图块Y
   * @param dx 终点图块X
   * @param dy 终点图块Y
   * @param passage 角色通行区域
   * @returns 是否不存在墙块障碍
   */
  private isInLineOfSight!: (sx: number, sy: number, dx: number, dy: number, passage: number) => boolean

  /**
   * 计算相邻图块之间的额外通行成本(默认起点图块是可通行的)
   * @param sx 起点图块X
   * @param sy 起点图块Y
   * @param dx 终点图块X
   * @param dy 终点图块Y
   * @param passage 角色通行区域
   * @returns 额外的寻路成本
   */
  private normalCalculateExtraCostBetween = (sx: number, sy: number, dx: number, dy: number, passage: number): number => {
    const dIndex = dx + dy * PathFinder.width
    if (sx === dx || sy === dy) {
      if (PathFinder.terrains[dIndex] !== passage) {
        return PathFinder.terrainObstacleCost
      }
      return 0
    }
    const vIndex = sx + dy * PathFinder.width
    const hIndex = dx + sy * PathFinder.width
    if (PathFinder.terrains[dIndex] !== passage ||
      PathFinder.terrains[vIndex] !== passage ||
      PathFinder.terrains[hIndex] !== passage) {
      return PathFinder.terrainObstacleCost
    }
    return 0
  }

  /**
   * 计算相邻图块之间的额外通行成本(绕开角色)
   * @param sx 起点图块X
   * @param sy 起点图块Y
   * @param dx 终点图块X
   * @param dy 终点图块Y
   * @param passage 角色通行区域
   * @returns 额外的寻路成本
   */
  private bypassCalculateExtraCostBetween = (sx: number, sy: number, dx: number, dy: number, passage: number): number => {
    const dIndex = dx + dy * PathFinder.width
    if (sx === dx || sy === dy) {
      if (PathFinder.terrains[dIndex] !== passage) {
        return PathFinder.terrainObstacleCost
      }
      if (PathFinder.obstacles[dIndex] !== 0) {
        return PathFinder.actorObstacleCost
      }
      return 0
    }
    const vIndex = sx + dy * PathFinder.width
    const hIndex = dx + sy * PathFinder.width
    if (PathFinder.terrains[dIndex] !== passage ||
      PathFinder.terrains[vIndex] !== passage ||
      PathFinder.terrains[hIndex] !== passage) {
      return PathFinder.terrainObstacleCost
    }
    if (PathFinder.obstacles[dIndex] !== 0 ||
      PathFinder.obstacles[vIndex] !== 0 ||
      PathFinder.obstacles[hIndex] !== 0) {
      return PathFinder.actorObstacleCost
    }
    return 0
  }

  /**
   * 判断目标点是否在视线内
   * @param sx 起始图块X
   * @param sy 起始图块Y
   * @param dx 终点图块X
   * @param dy 终点图块Y
   * @param passage 角色通行区域
   * @returns 是否不存在墙块障碍
   */
  private normalIsInLineOfSight = (sx: number, sy: number, dx: number, dy: number, passage: number): boolean => {
    // 如果两点的曼哈顿距离大于80，直接返回false(不可视)
    if (Math.abs(sx - dx) + Math.abs(sy - dy) > 80) {
      return false
    }
    const width = PathFinder.width
    const terrains = PathFinder.terrains
    if (sx !== dx) {
      // 如果水平坐标不同
      const unitY = (dy - sy) / (dx - sx)
      const step = sx < dx ? 1 : -1
      const start = sx + step
      const end = dx + step
      const base = sy - (sx + step / 2) * unitY
      // 在水平方向上栅格化相交的网格区域
      for (let x = start; x !== end; x += step) {
        const y = base + x * unitY
        const a = x + Math.floor(y) * width
        const b = x + Math.ceil(y) * width
        // 连接起点和终点，连线被垂直网格线切分成若干点
        // 如果其中一个交点上下偏移0.5距离的网格区域不能通行，则不可视
        if (terrains[a] !== passage || terrains[b] !== passage) {
          return false
        }
      }
    }
    if (sy !== dy) {
      // 如果垂直坐标不同
      const unitX = (dx - sx) / (dy - sy)
      const step = sy < dy ? 1 : -1
      const start = sy + step
      const end = dy + step
      const base = sx - (sy + step / 2) * unitX
      // 在垂直方向上栅格化相交的网格区域
      for (let y = start; y !== end; y += step) {
        const x = base + y * unitX
        const a = Math.floor(x) + y * width
        const b = Math.ceil(x) + y * width
        // 连接起点和终点，连线被水平网格线切分成若干点
        // 如果其中一个交点左右偏移0.5距离的网格区域不能通行，则不可视
        if (terrains[a] !== passage || terrains[b] !== passage) {
          return false
        }
      }
    }
    // 两点可视
    return true
  }

  /**
   * 判断目标点是否在视线内(绕开角色)
   * @param sx 起始图块X
   * @param sy 起始图块Y
   * @param dx 终点图块X
   * @param dy 终点图块Y
   * @param passage 角色通行区域
   * @returns 是否不存在墙块障碍
   */
  private bypassIsInLineOfSight = (sx: number, sy: number, dx: number, dy: number, passage: number): boolean => {
    // 如果两点的曼哈顿距离大于80，直接返回false(不可视)
    if (Math.abs(sx - dx) + Math.abs(sy - dy) > 80) {
      return false
    }
    const width = PathFinder.width
    const terrains = PathFinder.terrains
    const obstacles = PathFinder.obstacles
    if (sx !== dx) {
      // 如果水平坐标不同
      const unitY = (dy - sy) / (dx - sx)
      const step = sx < dx ? 1 : -1
      const start = sx + step
      const end = dx + step
      const base = sy - (sx + step / 2) * unitY
      // 在水平方向上栅格化相交的网格区域
      for (let x = start; x !== end; x += step) {
        const y = base + x * unitY
        const a = x + Math.floor(y) * width
        const b = x + Math.ceil(y) * width
        // 连接起点和终点，连线被垂直网格线切分成若干点
        // 如果其中一个交点上下偏移0.5距离的网格区域不能通行，则不可视
        if (terrains[a] !== passage ||
          terrains[b] !== passage ||
          obstacles[a] !== 0 ||
          obstacles[b] !== 0) {
          return false
        }
      }
    }
    if (sy !== dy) {
      // 如果垂直坐标不同
      const unitX = (dx - sx) / (dy - sy)
      const step = sy < dy ? 1 : -1
      const start = sy + step
      const end = dy + step
      const base = sx - (sy + step / 2) * unitX
      // 在垂直方向上栅格化相交的网格区域
      for (let y = start; y !== end; y += step) {
        const x = base + y * unitX
        const a = Math.floor(x) + y * width
        const b = Math.ceil(x) + y * width
        // 连接起点和终点，连线被水平网格线切分成若干点
        // 如果其中一个交点左右偏移0.5距离的网格区域不能通行，则不可视
        if (terrains[a] !== passage ||
          terrains[b] !== passage ||
          obstacles[a] !== 0 ||
          obstacles[b] !== 0) {
          return false
        }
      }
    }
    // 两点可视
    return true
  }
}

/** ******************************** 实体对象管理器 ******************************** */

class EntityManager {
  /** 实体对象列表 */
  public list: Array<EntityObject> = []
  /** {实体ID:对象}映射表 */
  public entityIdMap: HashMap<EntityObject> = {}
  /** {预设ID:对象}映射表 */
  public presetIdMap: HashMap<EntityObject> = {}
  /** {名称:对象}映射表 */
  public nameMap: HashMap<EntityObject> = {}

  /**
   * 从映射表中获取对象
   * @param key 实体ID/预设ID/名称
   * @returns 返回实体对象
   */
  public get(key: string): EntityObject | undefined {
    return this.presetIdMap[key] ?? this.nameMap[key] ?? this.entityIdMap[key]
  }

  /**
   * 添加对象到管理器
   * @param object 实体对象
   */
  public add(object: EntityObject): void {
    // 添加对象到实体列表
    this.list.push(object)

    // 添加对象到实体ID映射表
    let {entityId} = object
    if (entityId === '') {
      // 生成对象的实体ID
      do {entityId = GUID.generate64bit()}
      while (entityId in this.entityIdMap)
      object.entityId = entityId
    }
    this.entityIdMap[entityId] = object

    // 添加对象到预设ID映射表
    if (object.presetId) {
      this.presetIdMap[object.presetId] = object
    }

    // 添加对象到名称映射表
    if (object.name) {
      this.nameMap[object.name] = object
    }
  }

  /**
   * 从管理器中移除对象
   * @param object 实体对象
   */
  public remove(object: EntityObject): void {
    // 从实体列表中移除对象
    this.list.remove(object)

    // 从实体ID映射表中移除对象
    delete this.entityIdMap[object.entityId]

    // 从预设ID映射表中移除对象
    if (this.presetIdMap[object.presetId] === object) {
      delete this.presetIdMap[object.presetId]
    }

    // 从名称映射表中移除对象
    if (this.nameMap[object.name] === object) {
      delete this.nameMap[object.name]
    }
  }
}

let GlobalEntityManager = new EntityManager()