/** ******************************** 玩家队伍管理器 ******************************** */

let Party = new class PartyManager {
  /** 玩家角色对象 */
  public player: GlobalActor | null = null
  /** 玩家队伍成员列表 */
  public members: Array<GlobalActor> = []
  /** 队伍版本(随着队伍成员的添加和移除发生变化) */
  public version: number = 0

  /** 重置队伍角色 */
  public reset(): void {
    this.player = null
    this.members = []
  }

  /**
   * 设置玩家角色
   * @param actor 玩家角色
   */
  public setPlayer(actor: GlobalActor | null): void {
    if (actor instanceof GlobalActor && !actor.destroyed) {
      this.player = actor
    }
    if (actor === null) {
      this.player = null
    }
  }

  /**
   * 添加玩家队伍成员
   * @param actor 队伍成员
   */
  public addMember(actor: GlobalActor): void {
    if (actor instanceof GlobalActor && !actor.destroyed) {
      if (this.members.append(actor)) {
        this.version++
      }
    }
  }

  /**
   * 移除玩家队伍成员
   * @param actor 队伍成员
   */
  public removeMember(actor: GlobalActor): void {
    if (actor instanceof GlobalActor) {
      if (this.members.remove(actor)) {
        this.version++
      }
    }
  }

  /** 保存队伍角色数据 */
  public saveData(): PartySaveData {
    return {
      player: this.player?.data.id ?? '',
      members: this.members.map(a => a.data.id),
    }
  }

  /**
   * 加载队伍角色数据
   * @param party 队伍存档数据
   */
  public loadData(party: PartySaveData): void {
    const {player, members} = party
    this.player = ActorManager.get(player) ?? null
    this.members = []
    for (const member of members) {
      const actor = ActorManager.get(member)
      if (actor) this.addMember(actor)
    }
  }
}

/** ******************************** 势力队伍管理器 ******************************** */

let Team = new class TeamManager {
  /** 队伍列表 */
  public list: Array<TeamItem> = []
  /** 队伍的键(ID)列表 */
  public keys: Array<string> = []
  /** {ID:队伍}映射表 */
  public map: HashMap<TeamItem> = {}
  /** 默认队伍ID */
  public defaultId: string = ''
  /** 队伍关系数组(0:敌对, 1:友好) */
  public relationMap: Uint8Array = new Uint8Array(65536)
  /** 队伍碰撞开关表(0:关闭, 1:开启) */
  public collisionMap: Uint8Array = new Uint8Array(65536)

  /** 初始化 */
  public initialize(): void {
    // 给队伍设置索引
    const map = this.map
    const teams = Data.teams.list as Array<TeamItem>
    const keys = teams.map((team: TeamItem) => team.id)
    this.list = teams
    this.keys = keys
    const data = this.unpackTeamData(keys, Data.teams)
    const length = teams.length
    for (let i = 0; i < length; i++) {
      const team = teams[i]
      const key = keys[i]
      team.index = i
      team.relations = data.relationsMap[key]!
      team.collisions = data.collisionsMap[key]!
      map[team.id] = team
      for (let j = 0; j < length; j++) {
        this.relationMap[i | j << 8] = team.relations[keys[j]]!
        this.collisionMap[i | j << 8] = team.collisions[keys[j]]!
      }
    }
    this.defaultId = keys[0]
  }

  /**
   * 解包角色队伍数据
   * @param keys 队伍的ID列表
   * @param data 队伍的数据
   * @returns 解码后的队伍数据
   */
  private unpackTeamData(keys: string[], data: any): UnpackedTeamData {
    const relationsMap: HashMap<HashMap<number>> = {}
    const collisionsMap: HashMap<HashMap<number>> = {}
    const length = keys.length
    // 解码已压缩的队伍关系数据
    const sRelations = Codec.decodeTeamData(data.relations, length)
    const sCollisions = Codec.decodeTeamData(data.collisions, length)
    const a = length * 2
    // 构建完整的队伍关系数据结构
    for (let i = 0; i < length; i++) {
      const dRelations: HashMap<number> = {}
      const dCollisions: HashMap<number> = {}
      for (let j = 0; j < i; j++) {
        const ri = (a - j + 1) / 2 * j - j + i
        dRelations[keys[j]] = sRelations[ri]
        dCollisions[keys[j]] = sCollisions[ri]
      }
      const b = (a - i + 1) / 2 * i - i
      for (let j = i; j < length; j++) {
        const ri = b + j
        dRelations[keys[j]] = sRelations[ri]
        dCollisions[keys[j]] = sCollisions[ri]
      }
      relationsMap[keys[i]] = dRelations
      collisionsMap[keys[i]] = dCollisions
    }
    return {relationsMap, collisionsMap}
  }

  /**
   * 通过ID获取队伍
   * @param teamId 队伍ID
   * @returns ID匹配的队伍
   */
  public get(teamId: string): TeamItem | undefined {
    return this.map[teamId]
  }

  /**
   * 通过队伍索引获取队伍关系
   * @param teamIndex1 队伍索引1
   * @param teamIndex2 队伍索引2
   * @returns 队伍关系(0:敌对, 1:友好)
   */
  public getRelationByIndexes(teamIndex1: number, teamIndex2: number): number {
    return this.relationMap[teamIndex1 | teamIndex2 << 8]
  }

  /**
   * 判断敌对关系
   * @param teamId1 队伍ID1
   * @param teamId2 队伍ID2
   * @returns 是否为敌对关系
   */
  public isEnemy(teamId1: string, teamId2: string): boolean {
    return this.map[teamId1]?.relations[teamId2] === 0
  }

  /**
   * 判断友好关系
   * @param teamId1 队伍ID1
   * @param teamId2 队伍ID2
   * @returns 是否为友好关系
   */
  public isFriendly(teamId1: string, teamId2: string): boolean {
    return this.map[teamId1]?.relations[teamId2] === 1
  }

  /**
   * 改变角色队伍的关系
   * @param teamId1 队伍ID1
   * @param teamId2 队伍ID2
   * @param relation 队伍1和队伍2的关系(0:敌对, 1:友好)
   */
  public changeRelation(teamId1: string, teamId2: string, relation: 0 | 1): void {
    const team1 = this.get(teamId1)
    const team2 = this.get(teamId2)
    if (team1 && team2) {
      team1.relations[teamId2] = relation
      team2.relations[teamId1] = relation
      this.relationMap[team1.index | team2.index << 8] = relation
      this.relationMap[team2.index | team1.index << 8] = relation
    }
  }

  /**
   * 保存队伍关系数据
   * @returns 队伍存档数据
   */
  public saveData(): TeamSaveData {
    const keys = this.keys
    const teams = this.list
    const length = teams.length
    const dRelations = GL.arrays[0].uint8
    const dCollisions = GL.arrays[1].uint8
    let ri = 0
    // 压缩队伍关系数据
    for (let i = 0; i < length; i++) {
      const team = teams[i]
      const sRelations = team.relations
      const sCollisions = team.collisions
      for (let j = i; j < length; j++, ri++) {
        dRelations[ri] = sRelations[keys[j]]!
        dCollisions[ri] = sCollisions[keys[j]]!
      }
    }
    // 编码已压缩的队伍关系数据
    return {
      keys: keys,
      relations: Codec.encodeTeamData(new Uint8Array(dRelations.buffer, 0, ri)),
      collisions: Codec.encodeTeamData(new Uint8Array(dCollisions.buffer, 0, ri)),
    }
  }

  /**
   * 加载队伍关系数据
   * @param team 队伍存档数据
   */
  public loadData(team: TeamSaveData): void {
    const sKeys = team.keys
    const data = this.unpackTeamData(sKeys, team)
    const dKeys = this.keys
    const teams = this.list
    const length = teams.length
    // 将加载的队伍关系数据合并到现有的数据中
    // 丢弃项目编辑所造成的无效数据
    for (let i = 0; i < length; i++) {
      const key = dKeys[i]
      const sRelations = data.relationsMap[key]
      const sCollisions = data.collisionsMap[key]
      if (!sRelations || !sCollisions) continue
      const team = teams[i]
      const dRelations = team.relations
      const dCollisions = team.collisions
      for (let j = 0; j < length; j++) {
        const key = dKeys[j]
        const relation = sRelations[key]
        if (relation !== undefined) {
          dRelations[key] = relation
          this.relationMap[i | j << 8] = relation
        }
        const collision = sCollisions[key]
        if (collision !== undefined) {
          dCollisions[key] = collision
          this.collisionMap[i | j << 8] = collision
        }
      }
    }
  }
}

/** ******************************** 全局角色管理器 ******************************** */

let ActorManager = new class GlobalActorManager {
  /** 全局角色列表 */
  public list: Array<GlobalActor> = []
  /** {ID:全局角色实例}映射表 */
  public idMap: HashMap<GlobalActor> = {}

  /** 重置全局角色 */
  public reset(): void {
    this.clearGlobalActors()
  }

  /** 清除所有全局角色 */
  public clearGlobalActors(): void {
    this.idMap = {}
    // 遍历所有全局角色
    for (const actor of this.list) {
      // 从所有场景角色列表中移除该角色
      for (const context of Scene.contexts) {
        context?.actor.remove(actor)
      }
      actor.destroy()
    }
    this.list = []
  }

  /**
   * 创建全局角色
   * @param actorId 角色文件ID
   * @param savedData 角色存档数据
   * @returns 全局角色
   */
  public create(actorId: string, savedData?: ActorSaveData): GlobalActor | undefined {
    const data = Data.actors[actorId]
    if (!this.idMap[actorId] && data) {
      // 如果角色ID未被占用，则创建角色
      const actor = new GlobalActor(data, savedData)
      this.idMap[actorId] = actor
      this.list.push(actor)
      return actor
    }
    return undefined
  }

  /**
   * 删除全局角色
   * @param actorId 角色文件ID
   */
  public delete(actorId: string): void {
    const actor = this.idMap[actorId]
    if (actor) {
      // 从所有场景角色列表中移除该角色
      for (const context of Scene.contexts) {
        context?.actor.remove(actor)
      }
      delete this.idMap[actorId]
      actor.destroy()
      this.list.remove(actor)
      Party.removeMember(actor)
      if (Party.player === actor) {
        Party.player = null
      }
    }
  }

  /**
   * 获取全局角色
   * @param actorId 角色文件ID
   * @returns 全局角色
   */
  public get(actorId: string): GlobalActor | undefined {
    return this.idMap[actorId]
  }

  /**
   * 保存全局角色列表数据
   * @returns 角色存档数据列表
   */
  public saveData(): Array<ActorSaveData> {
    const actors = this.list
    const length = actors.length
    const data = new Array(length)
    for (let i = 0; i < length; i++) {
      data[i] = actors[i].saveData()
    }
    return data
  }

  /**
   * 加载全局角色列表数据
   * @param actors 角色存档数据列表
   */
  public loadData(actors: Array<ActorSaveData>): void {
    this.clearGlobalActors()
    // 恢复全局角色列表
    for (const savedData of actors) {
      this.create(
        savedData.fileId,
        savedData,
      )
    }
  }
}

/** ******************************** 角色 ******************************** */

class Actor {
  /** 角色对象名称 */
  public name: string
  /** 角色对象实体ID */
  public entityId: string
  /** 角色预设数据ID */
  public presetId: string
  /** 角色独立变量ID */
  public selfVarId: string
  /** 角色对象可见性 */
  public visible: boolean
  /** 角色头像ID */
  public portrait: string
  /** 角色头像矩形裁剪区域 */
  public clip: ImageClip
  /** 角色文件数据 */
  public data: ActorFile
  /** 角色的场景分区ID */
  public cellId: number
  /** 角色的场景网格ID */
  public gridId: number
  /** 角色队伍ID */
  public teamId: string
  /** 角色队伍索引 */
  public teamIndex: number
  /** 角色的激活状态 */
  public active: boolean
  /** 角色是否已销毁 */
  public destroyed: boolean
  /** 角色的通行区域码 */
  public passage: number
  /** 角色的渲染优先级 */
  public priority: number
  /** 角色的场景位置X */
  public x: number
  /** 角色的场景位置Y */
  public y: number
  /** 角色的整数位置X */
  public intX: number
  /** 角色的整数位置Y */
  public intY: number
  /** 角色的缩放系数 */
  public scale: number
  /** 角色的角度 */
  public angle: number
  /** 是否固定角度 */
  public angleFixed: boolean
  /** 受击时间戳 */
  public hitTimestamp: number
  /** 角色碰撞器 */
  public collider: ActorCollider
  /** 角色导航器 */
  public navigator: ActorNavigator
  /** 角色动画播放器 */
  public animation: AnimationPlayer | null
  /** {精灵ID:图像ID}映射表 */
  public sprites: HashMap<string>
  /** 角色更新器列表 */
  public updaters: UpdaterList
  /** {键:属性值}映射表 */
  public attributes: AttributeMap
  /** 角色动画控制器 */
  public animationController: AnimationController
  /** 角色动画管理器 */
  public animationManager: AnimationManager
  /** 角色技能管理器 */
  public skill: SkillManager
  /** 角色状态管理器 */
  public state: StateManager
  /** 角色装备管理器 */
  public equipment: EquipmentManager
  /** 角色公共冷却管理器 */
  public cooldown: CooldownManager
  /** 角色快捷栏管理器 */
  public shortcut: ShortcutManager
  /** 角色目标对象管理器 */
  public target: TargetManager
  /** 角色库存管理器 */
  public inventory: Inventory
  /** {类型:事件}映射表 */
  public events: HashMap<CommandFunctionList>
  /** {类型:注册事件}映射表 */
  public registeredEvents: HashMap<CommandFunctionList>
  /** 角色脚本管理器 */
  public script: ScriptManager
  /** 角色的父级对象 */
  public parent: SceneActorManager | null
  /** 已开始状态 */
  protected started: boolean
  /** 保存的角色库存管理器 */
  public savedInventory?: Inventory

  /**
   * 场景角色对象
   * @param data 角色文件数据
   * @param savedData 角色存档数据
   * @param presetId 角色预设数据ID
   */
  constructor(data: ActorFile, savedData?: ActorSaveData, presetId: string = '') {
    this.name = ''
    this.entityId = ''
    this.presetId = presetId
    this.selfVarId = ''
    this.visible = true
    this.portrait = data.portrait
    this.clip = [...data.clip]
    this.data = data
    this.cellId = -1
    this.gridId = -1
    this.teamId = Team.defaultId
    this.teamIndex = 0
    this.active = true
    this.destroyed = false
    this.priority = data.priority
    this.x = 0
    this.y = 0
    this.intX = 0
    this.intY = 0
    this.passage = 0
    this.scale = data.scale
    this.angle = 0
    this.angleFixed = false
    this.hitTimestamp = -100000000
    this.parent = null
    this.started = false

    // 角色组件
    this.collider = new ActorCollider(this)
    this.navigator = new ActorNavigator(this)
    this.animation = null
    this.sprites = {}
    this.updaters = new UpdaterList()
    this.attributes = {}
    this.animationController = new AnimationController(this)
    this.animationManager = new AnimationManager(this)
    this.skill = new SkillManager(this)
    this.state = new StateManager(this)
    this.equipment = new EquipmentManager(this)
    this.cooldown = new CooldownManager(this)
    this.shortcut = new ShortcutManager(this)
    this.target = new TargetManager(this)
    this.inventory = new Inventory(this)
    this.events = data.events
    this.registeredEvents = {}
    this.script = ScriptManager.create(this, data.scripts)
    Actor.latest = this

    if (savedData) {
      // 加载存档数据
      this.visible = savedData.visible
      this.entityId = savedData.entityId
      this.presetId = savedData.presetId
      this.selfVarId = savedData.selfVarId
      this.name = savedData.name
      this.active = savedData.active
      this.passage = savedData.passage
      this.priority = savedData.priority
      this.portrait = savedData.portrait
      this.clip = savedData.clip
      this.scale = savedData.scale
      this.angle = savedData.angle
      this.sprites = savedData.sprites
      this.setTeam(savedData.teamId)
      this.setPosition(savedData.x, savedData.y)
      this.collider.weight = savedData.weight
      this.navigator.movementSpeed = savedData.movementSpeed
      this.navigator.movementFactor = savedData.movementFactor
      this.attributes = savedData.attributes
      this.animationController.loadData(savedData.motions)
      this.animationManager.loadData(savedData.animations)
      this.animation = this.animationManager.get('actor') ?? null
      this.animation?.setSpriteImages(savedData.sprites)
      this.animationController.bindAnimation(this.animation)
      this.skill.loadData(savedData.skills)
      this.state.loadData(savedData.states)
      this.equipment.loadData(savedData.equipments)
      this.cooldown.loadData(savedData.cooldowns)
      this.inventory.loadData(savedData.inventory)
      this.shortcut.loadData(savedData.shortcuts)
      GlobalEntityManager.add(this)
    } else {
      // 初始化
      GlobalEntityManager.add(this)
      this.setPassage(data.passage)
      this.setAnimation(data.animationId)
      this.loadSprites()
      this.loadAttributes()
      this.loadSkills()
      this.loadEquipments()
      this.loadInventory()
      if (Actor.enableCreateEvent) {
        this.emit('create')
      }
    }

    // 定义临时属性
    Actor.defineTempAttributes(this.attributes)
  }

  /** 加载初始动画精灵哈希表 */
  private loadSprites(): void {
    const map = this.sprites
    const sprites = this.data.sprites
    const length = sprites.length
    // 使用精灵数组生成哈希表
    for (let i = 0; i < length; i++) {
      const sprite = sprites[i]
      map[sprite.id] = sprite.image
    }
  }

  /** 加载初始角色属性 */
  private loadAttributes(): void {
    Attribute.loadEntries(
      this.attributes,
      this.data.attributes,
    )
  }

  /** 加载初始角色技能 */
  private loadSkills(): void {
    const {skill: skillManager} = this
    const dataMap = Data.skills
    const skills = this.data.skills
    const length = skills.length
    // 创建初始技能并设置快捷键
    for (let i = 0; i < length; i++) {
      const skill = skills[i]
      const data = dataMap[skill.id]
      const key = Enum.get(skill.key)
      if (data !== undefined) {
        const skill = new Skill(data)
        skillManager.add(skill)
        if (key &&
          this.shortcut.get(key.value) === undefined) {
          this.shortcut.set(key.value, skill)
        }
      }
    }
  }

  /** 加载初始角色装备 */
  private loadEquipments(): void {
    const {equipment: equipmentManager} = this
    const dataMap = Data.equipments
    const equipments = this.data.equipments
    const length = equipments.length
    // 创建初始装备并设置快捷键
    for (let i = 0; i < length; i++) {
      const equipment = equipments[i]
      const data = dataMap[equipment.id]
      const slot = Enum.get(equipment.slot)
      if (data !== undefined && slot !== undefined &&
        equipmentManager.get(slot.value) === undefined) {
        equipmentManager.set(slot.value, new Equipment(data))
      }
    }
  }

  /** 加载初始角色库存 */
  private loadInventory(): void {
    const inventory = this.inventory
    const list = this.data.inventory
    const length = list.length
    // 创建初始物品和装备，避免触发获得事件
    for (let i = 0; i < length; i++) {
      const goods = list[i]
      switch (goods.type) {
        case 'item': {
          const data = Data.items[goods.id]
          if (data) {
            const item = new Item(data)
            inventory.insert(item)
            item.increase(goods.quantity)
          }
          continue
        }
        case 'equipment': {
          const data = Data.equipments[goods.id]
          if (data) {
            inventory.insert(new Equipment(data))
          }
          continue
        }
        case 'money':
          inventory.money += goods.money
          continue
      }
    }
  }

  /**
   * 角色朝指定角度位移一段距离
   * @param angle 位移角度(弧度)
   * @param distance 位移距离(单位:图块)
   * @param easingId 过渡曲线ID
   * @param duration 持续时间(毫秒)
   * @param key 位移更新器的键(指定以避免冲突)
   */
  public translate(angle: number, distance: number, easingId: string = '', duration: number = 0, key: string = 'translate'): void {
    const distX = distance * Math.cos(angle)
    const distY = distance * Math.sin(angle)
    if (duration > 0) {
      // 创建过渡更新器，使用set方法:
      // 如果已有同名更新器，则替换
      let elapsed = 0
      let lastTime = 0
      const easing = Easing.get(easingId)
      this.updaters.set(key, {
        protected: true,
        update: deltaTime => {
          // 更新中不断设置角色位置
          elapsed += deltaTime
          const time = easing.get(elapsed / duration)
          const increase = time - lastTime
          const x = distX * increase
          const y = distY * increase
          this.move(x, y)
          lastTime = time
          // 过渡结束，延迟删除更新器
          if (elapsed >= duration) {
            this.updaters.deleteDelay(key)
          }
        }
      })
    } else {
      // 立即执行
      this.updaters.deleteDelay(key)
      const x = this.x + distX
      const y = this.y + distY
      this.setPosition(x, y)
    }
  }

  /**
   * 设置角色的缩放系数
   * @param scale 角色缩放系数
   * @param easingId 过渡曲线ID
   * @param duration 持续时间(毫秒)
   */
  public setScale(scale: number, easingId: string = '', duration: number = 0): void {
    if (duration > 0) {
      // 创建过渡更新器，使用set方法:
      // 如果已有同名更新器，则替换
      let elapsed = 0
      const start = this.scale
      const easing = Easing.get(easingId)
      this.updaters.set('scale', {
        protected: true,
        update: deltaTime => {
          // 更新中不断设置角色角度
          elapsed += deltaTime
          const time = easing.get(elapsed / duration)
          this.scale = start * (1 - time) + scale * time
          this.animationManager.setGlobalScale(this.scale)
          // 过渡结束，延迟删除更新器
          if (elapsed >= duration) {
            this.updaters.deleteDelay('scale')
          }
        }
      })
    } else {
      // 立即执行
      this.updaters.deleteDelay('scale')
      this.scale = scale
      this.animationManager.setGlobalScale(this.scale)
    }
  }

  /**
   * 设置角色的角度
   * @param angle 角色角度(弧度)
   * @param easingId 过度曲线ID
   * @param duration 持续时间(毫秒)
   */
  public setAngle(angle: number, easingId: string = '', duration: number = 0): void {
    if (duration > 0) {
      this.rotate(angle - this.angle, easingId, duration)
    } else {
      // 立即执行
      this.updaters.deleteDelay('rotate')
      this.updateAngle(angle)
    }
  }

  /**
   * 角色旋转指定的角度
   * @param angle 旋转角度(弧度)
   * @param easingId 过渡曲线ID
   * @param duration 持续时间(毫秒)
   * @param key 旋转更新器的键(指定以避免冲突)
   */
  public rotate(angle: number, easingId: string = '', duration: number = 0, key: string = 'rotate'): void {
    if (duration > 0) {
      // 创建过渡更新器，使用set方法:
      // 如果已有同名更新器，则替换
      let elapsed = 0
      let lastTime = 0
      const easing = Easing.get(easingId)
      this.updaters.set(key, {
        protected: true,
        update: deltaTime => {
          // 更新中不断设置角色角度
          elapsed += deltaTime
          const time = easing.get(elapsed / duration)
          this.updateAngle(this.angle + angle * (time - lastTime))
          lastTime = time
          // 过渡结束，延迟删除更新器
          if (elapsed >= duration) {
            this.updaters.deleteDelay(key)
          }
        }
      })
    } else {
      // 立即执行
      this.updaters.deleteDelay(key)
      this.updateAngle(this.angle + angle)
    }
  }

  /**
   * 设置角色动画
   * @param animationId 动画文件ID
   */
  public setAnimation(animationId: string): void {
    this.animation?.finish()
    const data = Data.animations[animationId]
    if (data) {
      // 如果动画ID有效，创建新的动画播放器
      const animation = new AnimationPlayer(data)
      animation.rotatable = this.data.rotatable
      animation.syncAngle = true
      // 角色精灵图像优先于默认动画精灵图像
      animation.setSpriteImages(this.sprites)
      this.animationManager.set('actor', animation)
      this.animation = animation
    } else if (this.animation) {
      // 否则销毁上一个动画播放器
      this.animationManager.delete('actor')
      this.animation = null
    }
    // 绑定到动画控制器
    this.animationController.bindAnimation(this.animation)
  }

  /**
   * 设置角色的精灵图
   * @param spriteId 精灵图ID
   * @param imageId 图像文件ID
   */
  public setSprite(spriteId: string, imageId: string): void {
    // 修改角色精灵表中的键值
    this.sprites[spriteId] = imageId
    // 如果角色动画已经加载了同名纹理，则删除
    this.animation?.deleteTexture(spriteId)
  }

  /**
   * 设置动画色调
   * @param tint 动画色调属性选项{red?: -255~255, green?: -255~255, blue?: -255~255, gray?: 0~255}
   * @param easingId 过渡曲线ID
   * @param duration 持续时间(毫秒)
   */
  public setTint(tint: ImageTintOptions, easingId: string = '', duration: number = 0): void {
    this.animation?.setTint('actor-tint', this.updaters, tint, easingId, duration)
  }

  /**
   * 设置全部动画的色调
   * @param tint 动画色调属性选项{red?: -255~255, green?: -255~255, blue?: -255~255, gray?: 0~255}
   * @param easingId 过渡曲线ID
   * @param duration 持续时间(毫秒)
   */
  public setTintForAll(tint: ImageTintOptions, easingId: string = '', duration: number = 0): void {
    for (const animation of this.animationManager.list) {
      const id = animation.key + '-tint'
      animation.setTint(id, this.updaters, tint, easingId, duration)
    }
  }

  /**
   * 设置动画不透明度
   * @param opacity 不透明度[0-1]
   * @param easingId 过渡曲线ID
   * @param duration 持续时间(毫秒)
   */
  public setOpacity(opacity: number, easingId: string = '', duration: number = 0): void {
    this.animation?.setOpacity('actor-opacity', this.updaters, opacity, easingId, duration)
  }

  /**
   * 设置全部动画的不透明度
   * @param opacity 不透明度[0-1]
   * @param easingId 过渡曲线ID
   * @param duration 持续时间(毫秒)
   */
  public setOpacityForAll(opacity: number, easingId: string = '', duration: number = 0): void {
    for (const animation of this.animationManager.list) {
      const id = animation.key + '-opacity'
      animation.setOpacity(id, this.updaters, opacity, easingId, duration)
    }
  }

  /**
   * 设置动画垂直偏移位置
   * @param offsetY 垂直偏移位置
   * @param easingId 过渡曲线ID
   * @param duration 持续时间(毫秒)
   */
  public setOffsetY(offsetY: number, easingId: string = '', duration: number = 0): void {
    this.animation?.setOffsetY('actor-offsetY', this.updaters, offsetY, easingId, duration)
  }

  /**
   * 设置全部动画的垂直偏移位置
   * @param offsetY 垂直偏移位置
   * @param easingId 过渡曲线ID
   * @param duration 持续时间(毫秒)
   */
  public setOffsetYForAll(offsetY: number, easingId: string = '', duration: number = 0): void {
    for (const animation of this.animationManager.list) {
      const id = animation.key + '-offsetY'
      animation.setOffsetY(id, this.updaters, offsetY, easingId, duration)
    }
  }

  /**
   * 设置动画旋转角度
   * @param rotation 旋转角度(弧度)
   * @param easingId 过渡曲线ID
   * @param duration 持续时间(毫秒)
   */
  public setRotation(rotation: number, easingId: string = '', duration: number = 0): void {
    this.animation?.setRotation('actor-rotation', this.updaters, rotation, easingId, duration)
  }

  /**
   * 设置全部动画的旋转角度
   * @param rotation 旋转角度(弧度)
   * @param easingId 过渡曲线ID
   * @param duration 持续时间(毫秒)
   */
  public setRotationForAll(rotation: number, easingId: string = '', duration: number = 0): void {
    for (const animation of this.animationManager.list) {
      const id = animation.key + '-rotation'
      animation.setRotation(id, this.updaters, rotation, easingId, duration)
    }
  }

  /**
   * 设置角色的队伍
   * @param teamId 队伍ID
   */
  public setTeam(teamId: string): void {
    const team = Team.get(teamId)
    if (team !== undefined) {
      this.teamId = teamId
      this.teamIndex = team.index
    }
  }

  /**
   * 设置通行区域
   * @param passage 通行区域
   */
  public setPassage(passage: keyof ActorPassageMap): void {
    this.passage = Actor.passageMap[passage]
  }

  /**
   * 移动角色
   * @param x 位移X
   * @param y 位移Y
   */
  public move(x: number, y: number): void {
    this.x += x
    this.y += y
    // 设置碰撞器为已经移动状态
    this.collider.moved = true
    this.collider.handleImmovableCollisions()
  }

  /**
   * 设置角色在场景中的位置
   * @param x 场景网格X
   * @param y 场景网格Y
   */
  public setPosition(x: number, y: number): void {
    this.x = x
    this.y = y
    this.updateGridPosition()
    // 设置碰撞器为已经移动状态
    this.collider.moved = true
  }

  /**
   * 更新角色在场景中的网格位置
   */
  public updateGridPosition(): void {
    this.intX = Math.floor(this.x)
    this.intY = Math.floor(this.y)
  }

  /**
   * 更新受击时间戳
   */
  public updateHitTimestamp(): void {
    this.hitTimestamp = Time.elapsed
  }

  /**
   * 设置角色的激活状态
   * @param active 如果禁用，角色将不再更新事件和脚本
   */
  public setActive(active: boolean): void {
    if (this.active !== active) {
      this.active = active
      // 如果是未激活状态，重置目标列表
      if (!active) {
        this.target.reset()
      }
    }
  }

  /**
   * 判断角色是否处于激活状态(并且已出场)
   * @returns 角色是激活状态
   */
  public isActive(): boolean {
    return this.active && this.parent !== null
  }

  /**
   * 更新角色的角度，并计算动画动作方向
   * @param angle 弧度
   */
  public updateAngle(angle: number): void {
    if (this.angleFixed) return
    angle = Math.modRadians(angle)
    // 当新的角度与当前角度不同时，计算动画方向
    // 允许存在一点角度误差，避免频繁计算动画方向
    if (Math.abs(this.angle - angle) >= 0.0001) {
      this.angle = angle
      this.animationManager.setAngle(angle)
    }
  }

  /**
   * 更新角色的模块
   * @param deltaTime 增量时间(毫秒)
   */
  public update(deltaTime: number): void {
    // 更新导航器
    this.navigator.update(deltaTime)

    // 更新动画组件
    this.animationManager.update(deltaTime)

    // 更新模块列表
    if (this.active) {
      this.updaters.update(deltaTime)
    } else {
      // 如果角色未激活，仅执行受保护的更新器
      for (const updater of this.updaters) {
        if (updater.protected) {
          updater.update(deltaTime)
        }
      }
    }
  }

  /**
   * 使用指定全局角色的库存
   * @param inventory 全局角色的库存
   */
  public useInventory(inventory: Inventory): void {
    if (this.inventory !== inventory) {
      if (!this.savedInventory) {
        this.savedInventory = this.inventory
      }
      this.inventory = inventory
    }
  }

  /**
   * 恢复角色的库存引用
   */
  public restoreInventory(): void {
    if (this.savedInventory) {
      this.inventory = this.savedInventory
      delete this.savedInventory
    }
  }

  /**
   * 调用角色事件
   * @param type 角色事件类型
   * @returns 生成的事件处理器
   */
  public callEvent(type: string): EventHandler | undefined {
    const commands = this.registeredEvents[type] ?? this.events[type]
    if (commands) {
      const event = new EventHandler(commands)
      event.parent = this
      event.triggerActor = this
      event.triggerObject = this
      event.selfVarId = this.selfVarId
      EventHandler.call(event, this.updaters)
      return event
    }
  }

  /**
   * 调用角色事件和脚本
   * @param type 角色事件类型
   * @returns 生成的事件处理器
   */
  public emit(type: string, scriptEvent?: any): EventHandler | undefined {
    const event = this.callEvent(type)
    this.script.emit(type, scriptEvent ?? this)
    return event
  }

  /**
   * 注册事件指令
   * @param key 事件的键
   * @param type 事件类型
   */
  public register(type: string, commandList: CommandFunctionList): void {
    // 忽略重复注册
    if (this.registeredEvents[type] !== commandList) {
      // 取消已注册的相同键的事件指令
      this.unregister(type)
      // 注册新的事件指令
      this.registeredEvents[type] = commandList
      // 如果是自动执行事件，立即执行
      if (type === 'autorun' && this.started) {
        this.callEvent('autorun')
      }
    }
  }

  /**
   * 取消注册事件指令
   * @param type 事件类型
   */
  public unregister(type: string): void {
    const commands = this.registeredEvents[type]
    if (commands) {
      this.stopEvents(commands)
      delete this.registeredEvents[type]
    }
  }

  /** 取消注册所有事件指令 */
  public unregisterAll(): void {
    const map = this.registeredEvents
    for (const key of Object.keys(map)) {
      this.stopEvents(map[key]!)
      delete map[key]
    }
  }

  /**
   * 停止指定的正在执行的(多个)事件
   * @param commandList 指令函数列表
   */
  public stopEvents(commandList: CommandFunctionList): void {
    for (const updater of this.updaters) {
      if (updater instanceof EventHandler && updater.initial === commandList) {
        updater.finish()
      }
    }
  }

  /** 发送自动执行事件 */
  public autorun(): void {
    if (this.started === false) {
      this.started = true
      this.emit('autorun')
    }
  }

  /** 销毁角色 */
  public destroy(): void {
    if (!this.destroyed) {
      this.emit('destroy')
      GlobalEntityManager.remove(this)
      this.parent?.remove(this)
      this.destroyed = true
      this.active = false
      this.target.reset()
      this.animationManager.destroy()
    }
  }

  /** 异步销毁角色 */
  public destroyAsync(): void {
    Callback.push(() => {
      this.destroy()
    })
  }

  /** 保存角色数据 */
  public saveData(): ActorSaveData {
    return {
      visible: this.visible,
      entityId: this.entityId,
      presetId: this.presetId,
      selfVarId: this.selfVarId,
      fileId: this.data.id,
      teamId: this.teamId,
      active: this.active,
      passage: this.passage,
      priority: this.priority,
      name: this.name,
      x: this.x,
      y: this.y,
      scale: this.scale,
      angle: this.angle,
      portrait: this.portrait,
      clip: this.clip,
      sprites: this.sprites,
      weight: this.collider.weight,
      motions: this.animationController.saveData(),
      movementSpeed: this.navigator.movementSpeed,
      movementFactor: this.navigator.movementFactor,
      attributes: this.attributes,
      animations: this.animationManager.saveData(),
      skills: this.skill.saveData(),
      states: this.state.saveData(),
      equipments: this.equipment.saveData(),
      cooldowns: this.cooldown.saveData(),
      shortcuts: this.shortcut.saveData(),
      inventory: this.inventory.saveData(this),
    }
  }

  /** 最新创建的角色 */
  public static latest?: Actor
  /** 是否启用发送创建事件 */
  public static enableCreateEvent: boolean = true
  /** 通行区域映射表 */
  private static passageMap: ActorPassageMap = {
    land: 0,
    water: 1,
    unrestricted: -1,
  }

  /** 定义临时属性映射表函数 */
  private static defineTempAttributes(attributes: AttributeMap): void {}

  /** 初始化角色相关的数据 */
  public static initialize(): void {
    // 创建角色临时属性的描述器
    let hasAttributes = false
    const properties: PropertyDescriptorMap = {}
    for (const entry of Data.config.actor.tempAttributes) {
      const attr = Attribute.get(entry.key)
      if (!attr) continue
      let value = entry.value
      if (attr.type === 'enum') {
        const enumstr = Enum.get(value as string)
        if (!enumstr) continue
        value = enumstr.value
      }
      hasAttributes = true
      properties[attr.key] = {
        configurable: true,
        writable: true,
        value: value,
      }
    }
    // 创建定义角色临时属性方法
    if (hasAttributes) {
      Actor.defineTempAttributes = attributes => {
        Object.defineProperties(attributes, properties)
      }
    }
  }

  /** 角色检查器集合 */
  public static inspectors = new class ActorInspectors {
    /** 检查器 - 判断敌对角色 */
    'enemy' = (a: Actor, b: Actor): boolean => {
      return Team.relationMap[a.teamIndex | b.teamIndex << 8] === 0 && a !== b
    }

    /** 检查器 - 判断友好角色 */
    'friend' = (a: Actor, b: Actor): boolean => {
      return Team.relationMap[a.teamIndex | b.teamIndex << 8] === 1
    }

    /** 检查器 - 判断小队角色 */
    'team' = (a: Actor, b: Actor): boolean => {
      return a.teamId === b.teamId
    }

    /** 检查器 - 判断小队角色除自己以外 */
    'team-except-self' = (a: Actor, b: Actor): boolean => {
      return a !== b && a.teamId === b.teamId
    }

    /** 检查器 - 判断任意角色除自己以外 */
    'any-except-self' = (a: Actor, b: Actor): boolean => {
      return a !== b
    }

    /** 检查器 - 判断任意角色 */
    'any' = (): boolean => true
  }
}

/** ******************************** 全局角色 ******************************** */

class GlobalActor extends Actor {
  /** 场景角色的本地事件标记键 */
  private static localEventKey = Symbol("LOCAL_EVENT")

  /**
   * 转移到场景中的指定位置
   * @param x 场景坐标X
   * @param y 场景坐标Y
   */
  public transferToScene(x: number, y: number): void {
    if (Scene.binding && !this.destroyed) {
      this.parent?.remove(this)
      this.target.reset()
      this.setPosition(x, y)
      this.updateSceneActorData()
      Scene.actor.append(this)
    }
  }

  /** 销毁全局角色 */
  public override destroy(): void {
    if (ActorManager.get(this.data.id) === this) {
      // 如果角色还存在于管理器中，释放资源
      this.parent?.remove(this)
      this.navigator.stopMoving()
      this.target.reset()
      this.animationManager.release()
      this.setSceneActorData(null)
    } else {
      super.destroy()
    }
  }

  /**
   * 调用角色事件
   * @param type 角色事件类型
   * @returns 生成的事件处理器
   */
  public override callEvent(type: string): EventHandler | undefined {
    const event = super.callEvent(type)
    if (event && this.presetId !== '') {
      const type = event.type
      if (this.events.hasOwnProperty(type) && event.initial === this.events[type]) {
        (event as any)[GlobalActor.localEventKey] = true
      }
    }
    return event
  }

  /** 更新场景角色数据 */
  private updateSceneActorData() {
    if (this.presetId && !Scene.presets[this.presetId]) {
      this.setSceneActorData(null)
    }
  }

  /** 设置场景角色数据 */
  public setSceneActorData(preset: SceneActorData | null): void {
    const presetId = preset?.presetId ?? ''
    if (this.presetId !== presetId) {
      if (preset) {
        this.name = preset.name
        this.presetId = preset.presetId
        this.selfVarId = preset.presetId
        this.setEventMap(preset.data.events)
      } else {
        this.name = ''
        this.presetId = ''
        this.selfVarId = ''
        this.setEventMap(this.data.events)
      }
    }
  }

  /** 设置事件映射表 */
  public setEventMap(map: HashMap<CommandFunctionList>): void {
    for (const updater of this.updaters) {
      if (updater instanceof EventHandler &&
        GlobalActor.localEventKey in updater as any) {
        updater.finish()
      }
    }
    const oldAutorun = this.registeredEvents.autorun ?? this.events.autorun
    const newAutorun = this.registeredEvents.autorun ?? map.autorun
    if (oldAutorun !== newAutorun) this.started = false
    this.events = map
  }
}

/** ******************************** 角色碰撞器 ******************************** */

class ActorCollider {
  /** 绑定的角色对象 */
  public actor: Actor
  /** 碰撞器的形状 */
  public shape: string
  /** 角色碰撞体积大小 */
  public size: number
  /** 角色碰撞体积半径 */
  public half: number
  /** 角色碰撞体重大小 */
  public weight: number
  /** 角色是否不可推动 */
  public immovable: boolean
  /** 角色上一次的位置X */
  public lastX: number
  /** 角色上一次的位置Y */
  public lastY: number
  /** 角色是否已经移动 */
  public moved: boolean

  /**
   * 角色碰撞器
   * @param actor 绑定的角色对象
   */
  constructor(actor: Actor) {
    const {data} = actor
    this.actor = actor
    this.shape = data.shape
    this.size = data.size
    this.half = data.size / 2
    this.weight = data.weight
    this.immovable = data.immovable
    this.lastX = -1
    this.lastY = -1
    this.moved = false
  }

  /**
   * 设置体重
   * @param weight 碰撞器体重
   */
  public setWeight(weight: number): void {
    this.weight = weight
    // 更新角色的障碍区域
    this.actor.parent?.scene.obstacle.update(this.actor)
  }

  /** 更新上一次的位置 */
  public updateLastPosition(): void {
    this.lastX = this.actor.x
    this.lastY = this.actor.y
  }

  /** 处理不可推动碰撞 */
  public handleImmovableCollisions(): void {
    const self = this.actor
    const ox = self.x
    const oy = self.y
    const half = this.half
    const expansion = Scene.binding!.maxColliderHalf
    // 获取探测范围所在的角色区间列表
    const cells = Scene.actor.partition.get(
      ox - half - expansion,
      oy - half - expansion,
      ox + half + expansion,
      oy + half + expansion,
    )
    const count = cells.count
    // 查找所有角色区间
    for (let i = 0; i < count; i++) {
      const actors = cells[i]!
      const length = actors.length
      // 查找区间中的所有角色
      for (let i = 0; i < length; i++) {
        const actor = actors[i] as Actor
        if (actor !== self && actor.collider.immovable) {
          ActorCollider.handleCollisionBetweenTwoActors(self, actor, 1)
        }
      }
    }
  }

  /** 角色碰撞系统开关 */
  public static actorCollisionEnabled: boolean = true
  /** 场景碰撞系统开关 */
  public static sceneCollisionEnabled: boolean = true
  /** 场景碰撞系统角色半径 */
  public static sceneCollisionRadius: number = 0
  /** 角色碰撞距离 */
  public static actorCollisionDist: number = 0

  /** 初始化 */
  public static initialize(): void {
    const {collision} = Data.config
    // 设置角色碰撞系统开关
    this.actorCollisionEnabled = collision.actor.enabled
    // 设置场景碰撞系统开关
    this.sceneCollisionEnabled = collision.scene.enabled
    // 设置场景碰撞角色体积的半径
    this.sceneCollisionRadius = collision.scene.actorSize / 2
    // 设置角色碰撞的最小距离
    this.actorCollisionDist = collision.scene.actorSize
  }

  /** 处理角色与场景之间的碰撞 */
  public static handleSceneCollisions(): void {
    if (ActorCollider.sceneCollisionEnabled === false) return
    const scene = Scene.binding!
    const radius = ActorCollider.sceneCollisionRadius
    const radiusSquared = radius ** 2
    const terrains = scene.terrain.compositeArray
    const width = scene.width
    const height = scene.height
    if (width * height === 0) return
    const right = width - 1
    const bottom = height - 1
    const actors = scene.actor.list
    const length = actors.length
    // 遍历场景角色，计算碰撞
    for (let i = 0; i < length; i++) {
      const actor = actors[i]
      const collider = actor.collider
      // 如果角色未移动，跳过
      if (collider.moved === false) {
        continue
      }
      // 如果角色在场景网格之外，跳过
      if (actor.x < radius) actor.x = radius
      if (actor.y < radius) actor.y = radius
      if (actor.x > width - radius) actor.x = width - radius
      if (actor.y > height - radius) actor.y = height - radius
      const passage = actor.passage
      if (passage === -1) continue
      const sx = Math.clamp(actor.intX, 0, right)
      const sy = Math.clamp(actor.intY, 0, bottom)
      let dx = Math.floor(actor.x)
      let dy = Math.floor(actor.y)
      // 如果角色锚点穿过了水平网格
      if (sx !== dx) {
        const unitY = (dy - sy) / (dx - sx)
        const step = sx < dx ? 1 : -1
        let x = sx
        do {
          x += step
          const y = Math.floor(sy + (x - sx) * unitY)
          if (terrains[x + y * width] !== passage) {
            actor.x = sx < dx ? x - radius : x + 1 + radius
            dx = Math.floor(actor.x)
            break
          }
        }
        while (x !== dx)
      }
      // 如果角色锚点穿过了垂直网格
      if (sy !== dy) {
        const unitX = (dx - sx) / (dy - sy)
        const step = sy < dy ? 1 : -1
        let y = sy
        do {
          y += step
          const x = Math.floor(sx + (y - sy) * unitX)
          if (terrains[x + y * width] !== passage) {
            actor.y = sy < dy ? y - radius : y + 1 + radius
            dy = Math.floor(actor.y)
            break
          }
        }
        while (y !== dy)
      }
      const ax = actor.x
      const ay = actor.y
      const al = Math.floor(ax - radius)
      const at = Math.floor(ay - radius)
      const ar = Math.ceil(ax + radius)
      const ab = Math.ceil(ay + radius)
      const x = Math.round(ax)
      const y = Math.round(ay)
      let ox = 0
      let oy = 0
      // 如果角色跨越了水平网格
      if (al + 1 !== ar) {
        if (x === dx) {
          // 如果角色锚点在网格中靠左的位置
          if (terrains[al + dy * width] !== passage) {
            // 如果左边是不能通行的区域，让角色贴墙
            actor.x = x + radius
          } else {
            ox = -1
          }
        } else {
          // 如果角色锚点在网格中靠右的位置
          if (terrains[x + dy * width] !== passage) {
            // 如果右边是不能通行的区域，让角色贴墙
            actor.x = x - radius
          } else {
            ox = 1
          }
        }
      }
      // 如果角色跨越了垂直网格
      if (at + 1 !== ab) {
        if (y === dy) {
          // 如果角色锚点在网格中靠上的位置
          if (terrains[dx + at * width] !== passage) {
            // 如果上边是不能通行的区域，让角色贴墙
            actor.y = y + radius
          } else {
            oy = -1
          }
        } else {
          // 如果角色锚点在网格中靠下的位置
          if (terrains[dx + y * width] !== passage) {
            // 如果下边是不能通行的区域，让角色贴墙
            actor.y = y - radius
          } else {
            oy = 1
          }
        }
      }
      // 如果角色跨越了场景网格，但是未发生碰撞
      // 则判断地形的一角是否与角色发生碰撞
      if (ox !== 0 && oy !== 0 &&
        terrains[dx + ox + (dy + oy) * width] !== passage) {
        // 如果离角色最近的网格角不可通行，且距离小于碰撞半径，则判定为碰撞
        const distSquared = (x - ax) ** 2 + (y - ay) ** 2
        if (distSquared >= radiusSquared) continue
        // 计算最小移动向量，把角色推离到碰撞边缘
        const hypot = radius - Math.sqrt(distSquared)
        const angle = Math.atan2(ay - y, ax - x)
        actor.x += hypot * Math.cos(angle)
        actor.y += hypot * Math.sin(angle)
      }
    }
  }

  /** 处理角色与角色之间的碰撞 */
  public static handleActorCollisions(): void {
    if (ActorCollider.actorCollisionEnabled === false) return
    const {partition} = Scene.actor
    const {width, height, cells} = partition
    const {length} = cells

    // 计算同一个区间的角色碰撞
    for (let i = 0; i < length; i++) {
      const cell = cells[i]
      const length = cell.length
      for (let si = 0; si < length; si++) {
        const sActor = cell[si]
        if (sActor.collider.weight === 0) continue
        for (let di = si + 1; di < length; di++) {
          ActorCollider.handleCollisionBetweenTwoActors(sActor, cell[di])
        }
      }
    }

    // 计算左右区间的角色碰撞
    const ex = width - 1
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < ex; x++) {
        const i = x + y * width
        ActorCollider.handleCollisionsBetweenTwoCells(cells[i], cells[i + 1])
      }
    }

    // 计算上下区间的角色碰撞
    const ey = height - 1
    for (let x = 0; x < width; x++) {
      for (let y = 0; y < ey; y++) {
        const i = x + y * width
        ActorCollider.handleCollisionsBetweenTwoCells(cells[i], cells[i + width])
      }
    }

    // 计算左上到右下区间的角色碰撞
    const lowerRight = width + 1
    for (let i = 0; i < ex; i++) {
      const end = Math.min(ex - i, ey)
      for (let x = i, y = 0; y < end; x++, y++) {
        const i = x + y * width
        ActorCollider.handleCollisionsBetweenTwoCells(cells[i], cells[i + lowerRight])
      }
    }
    for (let i = 1; i < ey; i++) {
      const end = Math.min(ex, ey - i)
      for (let x = 0, y = i; x < end; x++, y++) {
        const i = x + y * width
        ActorCollider.handleCollisionsBetweenTwoCells(cells[i], cells[i + lowerRight])
      }
    }

    // 计算右上到左下区间的角色碰撞
    const lowerLeft = width - 1
    for (let i = ex; i > 0; i--) {
      const end = Math.min(i, ey)
      for (let x = i, y = 0; y < end; x--, y++) {
        const i = x + y * width
        ActorCollider.handleCollisionsBetweenTwoCells(cells[i], cells[i + lowerLeft])
      }
    }
    for (let i = 1; i < ey; i++) {
      const end = Math.min(ex + i, ey)
      for (let x = ex, y = i; y < end; x--, y++) {
        const i = x + y * width
        ActorCollider.handleCollisionsBetweenTwoCells(cells[i], cells[i + lowerLeft])
      }
    }
  }

  /** 处理两个角色之间的碰撞 */
  public static handleCollisionBetweenTwoActors: (sActor: Actor, dActor: Actor, ratio?: number) => void = (IIFE => {
    // 添加容差值避免陷入无限碰撞
    const TOLERANCE = 0.01

    // 触发角色碰撞事件
    const collide = (sActor: Actor, dActor: Actor): void => {
      const commands = sActor.events.collision
      if (commands) {
        const event = new EventHandler(commands)
        event.parent = sActor
        event.triggerActor = sActor
        event.triggerObject = sActor
        event.targetActor = dActor
        event.selfVarId = sActor.selfVarId
        EventHandler.call(event, sActor.updaters)
      }
      sActor.script.getEvents('collision')?.call(new ScriptCollisionEvent(sActor, dActor))
    }

    // 碰撞 - 正方形和正方形
    const collideSquareAndSquare = (sCollider: ActorCollider, dCollider: ActorCollider, ratio?: number): void => {
      const sActor = sCollider.actor
      const dActor = dCollider.actor
      const distMin = sCollider.half + dCollider.half
      const distX = Math.abs(sActor.x - dActor.x)
      const distY = Math.abs(sActor.y - dActor.y)
      // 如果角色之间的水平和垂直距离小于最小距离，则发生碰撞
      if (distX < distMin && distY < distMin) {
        // 体重比值0.5~2映射为0~1的推力
        if (ratio === undefined) {
          const sWeight = sCollider.weight
          const dWeight = dCollider.weight
          ratio = Math.clamp(dWeight * 3 / (sWeight + dWeight) - 1, 0, 1)
        }
        if (distX > distY) {
          // 如果水平距离大于垂直距离，把两个角色从水平方向上分开
          const offset = distMin - distX + TOLERANCE
          const sOffset = offset * ratio
          const dOffset = offset - sOffset
          // 根据角色左右位置情况进行计算
          if (sActor.x < dActor.x) {
            sActor.x -= sOffset
            dActor.x += dOffset
          } else {
            sActor.x += sOffset
            dActor.x -= dOffset
          }
        } else {
          // 如果垂直距离大于水平距离，把两个角色从垂直方向上分开
          const offset = distMin - distY + TOLERANCE
          const sOffset = offset * ratio
          const dOffset = offset - sOffset
          // 根据角色上下位置情况进行计算
          if (sActor.y < dActor.y) {
            sActor.y -= sOffset
            dActor.y += dOffset
          } else {
            sActor.y += sOffset
            dActor.y -= dOffset
          }
        }
        // 设置角色为已移动状态
        sCollider.moved = true
        dCollider.moved = true
        // 发送角色碰撞事件
        collide(sActor, dActor)
        collide(dActor, sActor)
      }
    }

    // 碰撞 - 圆形和圆形
    const collideCircleAndCircle = (sCollider: ActorCollider, dCollider: ActorCollider, ratio?: number): void => {
      const sActor = sCollider.actor
      const dActor = dCollider.actor
      const distMin = sCollider.half + dCollider.half
      const distX = dActor.x - sActor.x
      const distY = dActor.y - sActor.y
      const distSquared = distX ** 2 + distY ** 2
      // 如果角色之间的水平和垂直距离小于最小距离，则发生碰撞
      if (distSquared < distMin ** 2) {
        const dist = Math.sqrt(distSquared)
        const offset = distMin - dist
        const offsetX = offset / dist * distX
        const offsetY = offset / dist * distY
        // 体重比值0.5~2映射为0~1的推力
        if (ratio === undefined) {
          const sWeight = sCollider.weight
          const dWeight = dCollider.weight
          ratio = Math.clamp(dWeight * 3 / (sWeight + dWeight) - 1, 0, 1)
        }
        if (offsetX !== 0) {
          // 如果水平距离大于垂直距离，把两个角色从水平方向上分开
          const tOffsetX = offsetX + (offsetX > 0 ? TOLERANCE : -TOLERANCE)
          const sOffset = tOffsetX * ratio
          const dOffset = tOffsetX - sOffset
          // 根据角色左右位置情况进行计算
          sActor.x -= sOffset
          dActor.x += dOffset
        }
        if (offsetY !== 0) {
          // 如果垂直距离大于水平距离，把两个角色从垂直方向上分开
          const tOffsetY = offsetY + (offsetY > 0 ? TOLERANCE : -TOLERANCE)
          const sOffset = tOffsetY * ratio
          const dOffset = tOffsetY - sOffset
          // 根据角色上下位置情况进行计算
          sActor.y -= sOffset
          dActor.y += dOffset
        }
        // 设置角色为已移动状态
        sCollider.moved = true
        dCollider.moved = true
        // 发送角色碰撞事件
        collide(sActor, dActor)
        collide(dActor, sActor)
      }
    }

    // 碰撞 - 正方形和圆形
    const collideSquareAndCircle = (sCollider: ActorCollider, dCollider: ActorCollider, ratio?: number): void => {
      const sActor = sCollider.actor
      const dActor = dCollider.actor
      const distMin = dCollider.half
      const sx = sActor.x
      const sy = sActor.y
      const dx = dActor.x
      const dy = dActor.y
      const sl = sx - sCollider.half
      const sr = sx + sCollider.half
      const st = sy - sCollider.half
      const sb = sy + sCollider.half
      const distX = dx - (dx < sl ? sl : dx > sr ? sr : dx)
      const distY = dy - (dy < st ? st : dy > sb ? sb : dy)
      const distSquared = distX ** 2 + distY ** 2
      // 如果角色之间的水平和垂直距离小于最小距离，则发生碰撞
      if (distSquared < distMin ** 2) {
        const dist = Math.sqrt(distSquared)
        const offset = distMin - dist
        let offsetX
        let offsetY
        if (distX !== 0 && distY !== 0) {
          offsetX = offset / distMin * distX
          offsetY = offset / distMin * distY
        } else {
          const rx = dx - sx
          const ry = dy - sy
          if (Math.abs(rx) > Math.abs(ry)) {
            offsetX = offset * Math.sign(rx)
            offsetY = 0
          } else {
            offsetX = 0
            offsetY = offset * Math.sign(ry)
          }
        }
        // 体重比值0.5~2映射为0~1的推力
        if (ratio === undefined) {
          const sWeight = sCollider.weight
          const dWeight = dCollider.weight
          ratio = Math.clamp(dWeight * 3 / (sWeight + dWeight) - 1, 0, 1)
        }
        if (offsetX !== 0) {
          // 如果水平距离大于垂直距离，把两个角色从水平方向上分开
          const tOffsetX = offsetX + (offsetX > 0 ? TOLERANCE : -TOLERANCE)
          const sOffset = tOffsetX * ratio
          const dOffset = tOffsetX - sOffset
          // 根据角色左右位置情况进行计算
          sActor.x -= sOffset
          dActor.x += dOffset
        }
        if (offsetY !== 0) {
          // 如果垂直距离大于水平距离，把两个角色从垂直方向上分开
          const tOffsetY = offsetY + (offsetY > 0 ? TOLERANCE : -TOLERANCE)
          const sOffset = tOffsetY * ratio
          const dOffset = tOffsetY - sOffset
          // 根据角色上下位置情况进行计算
          sActor.y -= sOffset
          dActor.y += dOffset
        }
        // 设置角色为已移动状态
        sCollider.moved = true
        dCollider.moved = true
        // 发送角色碰撞事件
        collide(sActor, dActor)
        collide(dActor, sActor)
      }
    }

    /**
     * 处理两个角色的碰撞
     * @param sCell 角色1
     * @param dCell 角色2
     * @param ratio 互相推移距离比例[0, 1]
     */
    return (sActor: Actor, dActor: Actor, ratio?: number): void => {
      const dCollider = dActor.collider
      // 如果角色体重为0，不参与碰撞
      if (dCollider.weight === 0) return
      // 如果角色队伍之间不可碰撞
      const code = sActor.teamIndex | dActor.teamIndex << 8
      if (Team.collisionMap[code] === 0) return
      const sCollider = sActor.collider
      switch (sCollider.shape) {
        case 'circle':
          switch (dCollider.shape) {
            case 'circle':
              return collideCircleAndCircle(sCollider, dCollider, ratio)
            case 'square':
              if (ratio !== undefined) ratio = 1 - ratio
              return collideSquareAndCircle(dCollider, sCollider, ratio)
          }
        case 'square':
          switch (dCollider.shape) {
            case 'circle':
              return collideSquareAndCircle(sCollider, dCollider, ratio)
            case 'square':
              return collideSquareAndSquare(sCollider, dCollider, ratio)
          }
      }
    }
  })()

  /**
   * 处理两个分区之间的角色碰撞
   * @param sCell 场景角色分区1
   * @param dCell 场景角色分区2
   */
  private static handleCollisionsBetweenTwoCells = (sCell: Array<Actor>, dCell: Array<Actor>): void => {
    const sLength = sCell.length
    const dLength = dCell.length
    for (let si = 0; si < sLength; si++) {
      const sActor = sCell[si]
      // 如果角色的体重为0，跳过
      if (sActor.collider.weight === 0) continue
      for (let di = 0; di < dLength; di++) {
        ActorCollider.handleCollisionBetweenTwoActors(sActor, dCell[di])
      }
    }
  }
}

/** ******************************** 角色导航器 ******************************** */

class ActorNavigator {
  /** 角色导航模式 */
  public mode: string
  /** 绑定的角色对象 */
  public actor: Actor
  /** 跟随的目标角色 */
  public target: Actor | null
  /** 角色移动角度 */
  public movementAngle: number
  /** 角色移动速度 */
  public movementSpeed: number
  /** 角色移动速度系数 */
  public movementFactor: number
  /** 角色移动速度系数(临时) */
  public movementFactorTemp: number
  /** 角色移动路径 */
  public movementPath: MovementPath | null
  /** 角色移动速度X */
  public velocityX: number
  /** 角色移动速度Y */
  public velocityY: number
  /** 角色移动结束后回调函数 */
  private callbacks: Array<Function> | null
  /** 角色移动超时时间(毫秒) */
  private timeout: number
  /** 角色跟随目标时的最小距离 */
  private minDist: number
  /** 角色跟随目标时的最大距离 */
  private maxDist: number
  /** 角色跟随目标时的最大垂直距离 */
  private vertDist: number
  /** 角色跟随目标时的最小缓冲距离 */
  private minDistInner: number
  /** 角色跟随目标时的最大缓冲距离 */
  private maxDistInner: number
  /** 角色跟随目标时的最大垂直缓冲距离 */
  private vertDistInner: number
  /** 计算路径的时候是否绕过角色 */
  private bypass: boolean
  /** 角色圆形跟随模式的偏移值(-0.8~+0.8) */
  private followingOffset: number
  /** 角色在跟随目标时是否进行寻路 */
  private followingNavigate: boolean
  /** 角色跟随目标一次之后停止移动 */
  private followOnce: boolean
  /**
   * 角色跟随目标时切换动作的缓冲时间
   * - case 0: 需要等待一段时间后停止移动动画
   * - case >0: 正在等待并准备切换到闲置动画
   * - case -1: 已经执行过了，无需跳转
   */
  private animBufferTime: number

  /**
   * 角色导航器
   * @param actor 绑定的角色对象
   */
  constructor(actor: Actor) {
    this.mode = 'stop'
    this.actor = actor
    this.target = null
    this.movementAngle = 0
    this.movementSpeed = actor.data.speed
    this.velocityX = 0
    this.velocityY = 0
    this.movementFactor = 1
    this.movementFactorTemp = 1
    this.movementPath = null
    this.callbacks = null
    this.timeout = 0
    this.minDist = 0
    this.maxDist = 0
    this.vertDist = 0
    this.minDistInner = 0
    this.maxDistInner = 0
    this.vertDistInner = 0
    this.bypass = false
    this.followingOffset = 0
    this.followingNavigate = false
    this.followOnce = false
    this.animBufferTime = 0
  }

  /** 导航器的更新函数(切换状态机被替换) */
  public update(deltaTime: number): void {}

  /** 跟随目标函数(切换状态机被替换) */
  private followTarget(deltaTime: number): void {}

  /**
   * 设置角色的移动速度
   * @param speed 移动速度(图块/秒)
   */
  public setMovementSpeed(speed: number): void {
    this.movementSpeed = speed
    this.calculateVelocity(this.movementAngle)
  }

  /**
   * 设置角色的移动速度系数
   * @param factor 移动速度系数
   */
  public setMovementFactor(factor: number): void {
    this.movementFactor = factor
    this.calculateVelocity(this.movementAngle)
  }

  /**
   * 设置角色的移动速度系数(临时)
   * @param factor 移动速度系数(不保存)
   */
  public setMovementFactorTemp(factor: number): void {
    this.movementFactorTemp = factor
    this.calculateVelocity(this.movementAngle)
  }

  /**
   * 计算角色的移动速度分量
   * @param angle 移动速度的角度(弧度)
   */
  private calculateVelocity(angle: number): void {
    const speed = this.movementSpeed
    * this.movementFactor
    * this.movementFactorTemp
    this.movementAngle = angle
    this.velocityX = speed * Math.cos(angle) / 1000
    this.velocityY = speed * Math.sin(angle) / 1000
  }

  /** 角色停止移动 */
  public stopMoving(): void {
    if (this.mode !== 'stop') {
      this.mode = 'stop'
      this.target = null
      this.movementPath = null
      this.animBufferTime = 0
      this.actor.animationController.startIdle()
      // 设置更新函数为：空函数
      this.update = Function.empty
      // 执行结束回调(如果有)
      if (this.callbacks !== null) {
        for (const callback of this.callbacks) {
          callback()
        }
        this.callbacks = null
      }
    }
  }

  /**
   * 设置移动结束回调函数
   * @param callback 在角色停止当前的移动行为后触发
   */
  public onFinish(callback: CallbackFunction): void {
    if (this.mode === 'stop') {
      return callback()
    }
    if (this.callbacks !== null) {
      this.callbacks.push(callback)
    } else {
      this.callbacks = [callback]
    }
  }

  /**
   * 角色向指定角度持续移动
   * @param angle 移动角度(弧度)
   */
  public moveTowardAngle(angle: number): void {
    if (this.mode !== 'keep') {
      this.stopMoving()
      this.mode = 'keep'
      this.actor.animationController.startMoving()
    }
    this.calculateVelocity(angle)
    // 设置更新函数为：向前移动
    this.update = this.updateForwardMovement
  }

  /**
   * 角色移动到指定位置
   * @param x 场景图块X
   * @param y 场景图块Y
   */
  public moveTo(x: number, y: number): void {
    this.route(PathFinder.createUnitPath(x, y))
  }

  /**
   * 角色导航到指定位置
   * @param x 场景图块X
   * @param y 场景图块Y
   * @param bypass 是否绕过角色
   */
  public navigateTo(x: number, y: number, bypass: boolean = false): void {
    this.bypass = bypass
    this.route(PathFinder.createPath(this.actor.x, this.actor.y, x, y, this.actor.passage, bypass), true)
  }

  /**
   * 角色设置移动路线
   * @param path 移动路线，长度是2的整数倍
   * @param navigate 是否开启导航
   */
  private route(path: MovementPath, navigate: boolean = false): void {
    if (this.mode !== 'navigate') {
      this.stopMoving()
      this.mode = 'navigate'
      this.actor.animationController.startMoving()
    }
    this.timeout = navigate ? 500 : -1
    this.movementPath = path
    // 设置更新函数为：路径移动
    this.update = this.updatePathMovement
  }

  /**
   * 跟随目标角色(圆形模式)
   * @param target 目标角色
   * @param minDist 保持最小距离
   * @param maxDist 保持最大距离
   * @param offset 跟随位置偏移[-0.8 ~ +0.8]
   * @param bufferDist 跟随缓冲距离
   * @param navigate 是否开启自动寻路
   * @param bypass 自动寻路是否绕过角色
   * @param once 跟随一次(到达位置后停止移动)
   */
  public followCircle(target: Actor, minDist: number, maxDist: number, offset: number = 0, bufferDist: number = 0, navigate: boolean = false, bypass: boolean = false, once: boolean = false): void {
    if (this.mode !== 'follow') {
      this.stopMoving()
      this.mode = 'follow'
    } else {
      this.movementPath = null
      this.animBufferTime = 0
    }
    // 调整缓冲距离到合理范围
    const width = Math.max(maxDist - minDist - 0.1, 0)
    const buffer = Math.clamp(bufferDist, 0, width / 2)
    this.target = target
    // 设置最小和最大距离(至少是最小距离 + 0.1)
    this.minDist = minDist
    this.maxDist = Math.max(maxDist, minDist + 0.1)
    this.minDistInner = this.minDist + buffer
    this.maxDistInner = this.maxDist - buffer
    this.followingOffset = offset
    this.followingNavigate = navigate
    this.bypass = bypass
    this.followOnce = once
    this.followTarget = this._circleFollowTarget
    // 设置更新函数为：跟随角色
    this.update = this.followTarget
  }

  /**
   * // 跟随目标角色(矩形模式)
   * @param target 目标角色
   * @param minDist 保持最小水平距离
   * @param maxDist 保持最大水平距离
   * @param vertDist 保持最大垂直距离
   * @param bufferDist 跟随缓冲距离
   * @param navigate 是否开启自动寻路
   * @param bypass 自动寻路是否绕过角色
   * @param once 跟随一次(到达位置后停止移动)
   */
  public followRectangle(target: Actor, minDist: number, maxDist: number, vertDist: number = 0, bufferDist = 0, navigate: boolean = false, bypass: boolean = false, once: boolean = false): void {
    if (this.mode !== 'follow') {
      this.stopMoving()
      this.mode = 'follow'
    } else {
      this.movementPath = null
    }
    // 调整缓冲距离到合理范围
    const width = Math.max(maxDist - minDist - 0.1, 0)
    const buffer = Math.clamp(bufferDist, 0, width / 2)
    const buffer2 = Math.clamp(bufferDist, 0, vertDist)
    this.target = target
    // 设置最小和最大距离(至少是最小距离 + 0.1)
    this.minDist = minDist
    this.maxDist = Math.max(maxDist, minDist + 0.1)
    this.vertDist = vertDist
    this.minDistInner = this.minDist + buffer
    this.maxDistInner = this.maxDist - buffer
    this.vertDistInner = this.vertDist - buffer2
    this.followingNavigate = navigate
    this.bypass = bypass
    this.followOnce = once
    this.followTarget = this._rectangleFollowTarget
    // 设置更新函数为：跟随角色
    this.update = this.followTarget
  }

  /**
   * 更新角色向前移动
   * @param deltaTime 增量时间(毫秒)
   */
  private updateForwardMovement(deltaTime: number): void {
    const actor = this.actor
    const x = this.velocityX * deltaTime
    const y = this.velocityY * deltaTime
    actor.updateAngle(this.movementAngle)
    actor.move(x, y)
  }

  /**
   * 更新角色路径移动
   * @param deltaTime 增量时间(毫秒)
   */
  private updatePathMovement(deltaTime: number): void {
    // 逐帧计算角度，并计算移动速度分量
    const actor = this.actor
    const path = this.movementPath!
    if (this.timeout !== -1 && (this.timeout -= deltaTime) <= 0) {
      const destX = path[path.length - 2]
      const destY = path[path.length - 1]
      return this.navigateTo(destX, destY, this.bypass)
    }
    const pi = path.index
    const dx = path[pi]
    const dy = path[pi + 1]
    const distX = dx - actor.x
    const distY = dy - actor.y
    const angle = Math.atan2(distY, distX)
    actor.updateAngle(angle)
    this.calculateVelocity(angle)

    // 计算当前帧向前移动的距离
    const mx = this.velocityX * deltaTime
    const my = this.velocityY * deltaTime
    if (Math.abs(distX) <= Math.abs(mx) + 0.0001 &&
    Math.abs(distY) <= Math.abs(my) + 0.0001) {
      // 如果目标点在当前帧移动范围内，则将角色位置设为目标点
      // 并且将路径索引指向下一个路线节点
      actor.setPosition(dx, dy)
      path.index += 2
      // 如果已经是终点，则停止移动
      if (path.index === path.length) {
        this.stopMoving()
      }
    } else {
      // 将角色的位置加上当前帧移动距离
      actor.move(mx, my)
    }
  }

  /**
   * 切换到跟随缓冲模式，如果是跟随一次则停止移动
   */
  private _switchToFollowTargetBuffer(): void {
    if (this.followOnce) {
      this.stopMoving()
    } else {
      this.update = this._followTargetBuffer
      this.animBufferTime = 100
    }
  }

  /**
   * 跟随目标角色时用来切换状态的缓冲函数
   * @param deltaTime 增量时间(毫秒)
   */
  private _followTargetBuffer(deltaTime: number): void {
    // 缓冲时间结束后切换动画为idle动作
    // 避免跟随者移动速度>=目标时频繁地切换动作
    if ((this.animBufferTime -= deltaTime) <= 0) {
      this.animBufferTime = -1
      this.actor.animationController.startIdle()
      // 设置更新函数为：跟随角色
      this.update = this.followTarget
      return this.update(deltaTime)
    }
    // 缓冲未结束，调用跟随角色函数
    this.followTarget(deltaTime)
  }

  /**
   * 圆形模式 - 跟随目标角色
   * @param deltaTime 增量时间(毫秒)
   */
  private _circleFollowTarget(deltaTime: number): void {
    const actor = this.actor
    const target = this.target!
    // 如果目标已销毁，停止跟随
    if (target.destroyed) {
      return this.stopMoving()
    }
    const dist = Math.sqrt(
      (actor.x - target.x) ** 2
    + (actor.y - target.y) ** 2
    )
    // 如果角色距离大于最大距离，开始接近
    // 设置更新函数为：接近目标(圆形模式)
    if (dist > this.maxDist) {
      actor.animationController.startMoving()
      this.animBufferTime = 0
      this.update = this.followingNavigate
      ? this._circleNavigateToTarget
      : this._circleApproachTarget
      return this.update(deltaTime)
    }
    // 如果角色距离小于最小距离，开始远离
    // 设置更新函数为：远离目标(圆形模式)
    if (dist < this.minDist) {
      actor.animationController.startMoving()
      this.animBufferTime = 0
      this.update = this._circleLeaveTarget
      return this.update(deltaTime)
    }
    // 如果角色的位置已经在跟随范围之内
    if (this.animBufferTime === 0) {
      // 进入跟随缓冲模式
      this.update = this._switchToFollowTargetBuffer
      return this.update(deltaTime)
    }
  }

  /**
   * 圆形模式 - 接近目标角色
   * @param deltaTime 增量时间(毫秒)
   */
  private _circleApproachTarget(deltaTime: number): void {
    const actor = this.actor
    const target = this.target!
    // 如果目标已销毁，停止跟随
    if (target.destroyed) {
      return this.stopMoving()
    }
    let distX = target.x - actor.x
    let distY = target.y - actor.y
    // 如果角色距离小于等于最大距离，进入跟随缓冲模式(100ms)
    if (Math.sqrt(distX ** 2 + distY ** 2) <= this.maxDistInner) {
      return this._switchToFollowTargetBuffer()
    }
    let angle = Math.atan2(distY, distX)
    const offset = this.followingOffset
    if (offset !== 0 && this.maxDistInner > 0) {
      // 计算跟随偏移距离和偏移角度
      const offsetDist = Math.abs(this.maxDistInner * offset)
      angle += offset > 0 ? Math.PI / 2 : -Math.PI / 2
      // 加上偏移分量，计算朝向偏移目标点的角度
      distX += offsetDist * Math.cos(angle)
      distY += offsetDist * Math.sin(angle)
      angle = Math.atan2(distY, distX)
    }
    // 向接近目标的方向移动
    this.calculateVelocity(angle)
    this.updateForwardMovement(deltaTime)
  }

  /**
   * 圆形模式 - 导航到目标角色
   * @param deltaTime 增量时间(毫秒)
   */
  private _circleNavigateToTarget(deltaTime: number): void {
    const actor = this.actor
    const target = this.target!
    // 如果目标已销毁，停止跟随
    if (target.destroyed) {
      return this.stopMoving()
    }
    const sx = actor.x
    const sy = actor.y
    const distX = target.x - sx
    const distY = target.y - sy
    // 如果角色距离小于等于最大距离，进入跟随缓冲模式(100ms)
    if (Math.sqrt(distX ** 2 + distY ** 2) <= this.maxDistInner) {
      this.movementPath = null
      this._switchToFollowTargetBuffer()
      return
    }
    // 每隔一段时间计算移动路径
    if (!this.movementPath || (this.timeout -= deltaTime) <= 0) {
      let {x, y} = target
      const offset = this.followingOffset
      if (offset !== 0 && this.maxDistInner > 0) {
        // 计算跟随偏移距离和偏移角度
        const offsetDist = Math.abs(this.maxDistInner * offset)
        const offsetAngle = offset > 0 ? Math.PI / 2 : -Math.PI / 2
        const angle = Math.atan2(distY, distX) + offsetAngle
        x += offsetDist * Math.cos(angle)
        y += offsetDist * Math.sin(angle)
      }
      this.movementPath = PathFinder.createPath(sx, sy, x, y, actor.passage, this.bypass)
      this.timeout = 500
    }
    // 逐帧计算角度，并计算移动速度分量
    const path = this.movementPath
    const pi = path.index
    const dx = path[pi]
    const dy = path[pi + 1]
    const pDistX = dx - sx
    const pDistY = dy - sy
    const angle = Math.atan2(pDistY, pDistX)
    actor.updateAngle(angle)
    this.calculateVelocity(angle)

    // 计算当前帧向前移动的距离
    const mx = this.velocityX * deltaTime
    const my = this.velocityY * deltaTime
    if (Math.abs(pDistX) <= Math.abs(mx) + 0.0001 &&
      Math.abs(pDistY) <= Math.abs(my) + 0.0001) {
      actor.setPosition(dx, dy)
      path.index += 2
      if (path.index === path.length) {
        this.movementPath = null
      }
    } else {
      actor.move(mx, my)
    }
  }

  /**
   * 圆形模式 - 远离目标角色
   * @param deltaTime 增量时间(毫秒)
   */
  private _circleLeaveTarget(deltaTime: number): void {
    const actor = this.actor
    const target = this.target!
    // 如果目标已销毁，停止跟随
    if (target.destroyed) {
      return this.stopMoving()
    }
    const distX = actor.x - target.x
    const distY = actor.y - target.y
    // 如果角色距离大于等于最小距离，进入跟随缓冲模式(100ms)
    if (Math.sqrt(distX ** 2 + distY ** 2) >= this.minDistInner) {
      return this._switchToFollowTargetBuffer()
    }
    // 向远离目标的方向移动
    const angle = Math.atan2(distY, distX)
    this.calculateVelocity(angle)
    this.updateForwardMovement(deltaTime)
  }

  /**
   * 矩形模式 - 跟随目标角色
   * @param deltaTime 增量时间(毫秒)
   */
  private _rectangleFollowTarget(deltaTime: number): void {
    const actor = this.actor
    const target = this.target!
    // 如果目标已销毁，停止跟随
    if (target.destroyed) {
      return this.stopMoving()
    }
    const distX = Math.abs(actor.x - target.x)
    const distY = Math.abs(actor.y - target.y)
    // 如果角色水平距离大于最大距离或小于最小距离
    // 或者角色垂直距离大于垂直距离(+0.0001容差)
    // 设置更新函数为：接近目标(矩形模式)
    if (distX > this.maxDist ||
      distX < this.minDist ||
      distY > this.vertDist + 0.0001) {
      actor.animationController.startMoving()
      this.animBufferTime = 0
      this.update = this.followingNavigate
      ? this._rectangleNavigateToTarget
      : this._rectangleApproachTarget
      return this.update(deltaTime)
    }
    // 如果角色的位置已经在跟随范围之内(避免重复执行)
    if (this.animBufferTime === 0) {
      // 进入跟随缓冲模式
      this.update = this._switchToFollowTargetBuffer
      return this.update(deltaTime)
    }
  }

  /**
   * 矩形模式 - 接近目标角色
   * @param deltaTime 增量时间(毫秒)
   */
  private _rectangleApproachTarget(deltaTime: number): void {
    const actor = this.actor
    const target = this.target!
    // 如果目标已销毁，停止跟随
    if (target.destroyed) {
      return this.stopMoving()
    }
    const sx = actor.x
    const sy = actor.y
    const tx = target.x
    const ty = target.y
    const dx = sx < tx
    // 根据宿主角色在目标角色左侧或右侧的情况来计算终点水平坐标
    ? Math.clamp(sx, tx - this.maxDistInner, tx - this.minDistInner)
    : Math.clamp(sx, tx + this.minDistInner, tx + this.maxDistInner)
    // 计算终点垂直坐标
    const dy = Math.clamp(sy, ty - this.vertDistInner, ty + this.vertDistInner)
    const distX = dx - sx
    const distY = dy - sy
    const angle = Math.atan2(distY, distX)
    // 设置角度并计算移动速度分量
    actor.updateAngle(angle)
    this.calculateVelocity(angle)

    // 计算当前帧向前移动的距离并更新角色位置
    const mx = this.velocityX * deltaTime
    const my = this.velocityY * deltaTime
    actor.move(mx, my)
    const absDistX = Math.abs(actor.x - tx)
    if (absDistX >= this.minDistInner &&
      absDistX <= this.maxDistInner &&
      Math.abs(distY) <= Math.abs(my) + 0.0001) {
      // 角色进入最小和最大距离的范围
      // 并且垂直移动距离超过了角色垂直距离
      // 则将角色垂直位置设为目标点垂直位置
      actor.setPosition(actor.x, dy)
      // 进入跟随缓冲模式
      this._switchToFollowTargetBuffer()
    }
  }

  /**
   * 矩形模式 - 导航到目标角色
   * @param deltaTime 增量时间(毫秒)
   */
  private _rectangleNavigateToTarget(deltaTime: number): void {
    const actor = this.actor
    const target = this.target!
    // 如果目标已销毁，停止跟随
    if (target.destroyed) {
      return this.stopMoving()
    }
    const sx = actor.x
    const sy = actor.y
    const tx = target.x
    const ty = target.y
    const dx = sx < tx
    // 根据宿主角色在目标角色左侧或右侧的情况来计算终点水平坐标
    ? Math.clamp(sx, tx - this.maxDistInner, tx - this.minDistInner)
    : Math.clamp(sx, tx + this.minDistInner, tx + this.maxDistInner)
    // 计算终点垂直坐标
    const dy = Math.clamp(sy, ty - this.vertDistInner, ty + this.vertDistInner)
    // 每隔一段时间计算移动路径
    if (!this.movementPath || (this.timeout -= deltaTime) <= 0) {
      this.movementPath = PathFinder.createPath(sx, sy, dx, dy, actor.passage, this.bypass)
      this.timeout = 500
    }
    // 逐帧计算角度，并计算移动速度分量
    const path = this.movementPath
    const pi = path.index
    const px = path[pi]
    const py = path[pi + 1]
    const pDistX = px - sx
    const pDistY = py - sy
    if (pDistX === 0 && pDistY === 0) {
      this.velocityX = 0
      this.velocityY = 0
    } else {
      const angle = Math.atan2(pDistY, pDistX)
      actor.updateAngle(angle)
      this.calculateVelocity(angle)
    }

    // 计算当前帧向前移动的距离
    const mx = this.velocityX * deltaTime
    const my = this.velocityY * deltaTime
    // 由于计算移动速度现在已经是精确值
    // 这里的容差值0.0001有可能不需要了
    if (Math.abs(pDistX) <= Math.abs(mx) + 0.0001 &&
      Math.abs(pDistY) <= Math.abs(my) + 0.0001) {
      actor.setPosition(px, py)
      path.index += 2
      if (path.index === path.length) {
        this.movementPath = null
        const absDistX = Math.abs(actor.x - tx)
        const absDistY = Math.abs(actor.y - dy)
        if (absDistX >= this.minDistInner &&
          absDistX <= this.maxDistInner &&
          absDistY <= Math.abs(my) + 0.0001) {
          // 角色进入最小和最大距离的范围
          // 并且垂直移动距离超过了角色垂直距离
          // 则将角色垂直位置设为目标点垂直位置
          actor.setPosition(actor.x, dy)
          // 进入跟随缓冲模式
          this._switchToFollowTargetBuffer()
        }
      }
    } else {
      actor.move(mx, my)
    }
  }
}

/** ******************************** 角色动画管理器 ******************************** */

class AnimationManager {
  /** 绑定角色 */
  public actor: Actor
  /** 缩放系数 */
  public scale: number
  /** 是否存在粒子 */
  public existParticles: boolean
  /** 动画列表 */
  public list: Array<AnimationPlayer>
  /** {键:动画}映射表 */
  public keyMap: HashMap<AnimationPlayer>

  /**
   * 角色动画管理器
   * @param actor 绑定的角色对象
   */
  constructor(actor: Actor) {
    this.actor = actor
    this.scale = actor.scale
    this.existParticles = false
    this.list = []
    this.keyMap = {}
  }

  /**
   * 获取动画播放器
   * @param key 动画键
   * @returns 动画播放器
   */
  public get(key: string): AnimationPlayer | undefined {
    return this.keyMap[key]
  }

  /**
   * 设置动画播放器
   * @param key 动画键
   * @param animation 动画播放器
   */
  public set(key: string, animation: AnimationPlayer): void {
    if (key && this.keyMap[key] !== animation) {
      animation.key = key
      animation.parent = this
      animation.setPosition(this.actor)
      // 设置原始缩放系数
      if (animation.rawScale === undefined) {
        animation.rawScale = animation.scale
        animation.scale *= this.scale
      }
      // 设置原始偏移Y
      if (animation.rawOffsetY === undefined) {
        animation.rawOffsetY = animation.offsetY
        animation.offsetY *= this.scale
      }
      // 如果存在旧的动画替换它(销毁)
      const oldAnim = this.keyMap[key]
      if (oldAnim instanceof AnimationPlayer) {
        // 继承一部分数据
        animation.rawScale = oldAnim.rawScale
        animation.scale = oldAnim.scale
        animation.speed = oldAnim.speed
        animation.opacity = oldAnim.opacity
        animation.setMotion(oldAnim.motionName)
        animation.setAngle(oldAnim.angle)
        oldAnim.destroy()
        this.list.replace(oldAnim, animation)
        this.keyMap[key] = animation
      } else {
        this.list.push(animation)
        this.keyMap[key] = animation
      }
      this.sort()
    }
  }

  /**
   * 删除动画播放器
   * @param key 动画键
   */
  public delete(key: string): void {
    const animation = this.keyMap[key]
    if (animation) {
      animation.destroy()
      this.list.remove(animation)
      delete this.keyMap[key]
    }
  }

  /**
   * 播放动作(结束时恢复动作)
   * @param key 动画键
   * @param motionName 动作名称
   * @returns 受影响的动画播放器
   */
  public playMotion(key: string, motionName: string): AnimationPlayer | undefined {
    const animation = this.get(key)
    if (animation?.setMotion(motionName)) {
      animation.playing = true
      // 重新播放动画
      const callback = () => {
        if (animation.playing) {
          // 播放结束后设置回默认动作
          animation.playing = false
          if (animation.setMotion(animation.defaultMotion!)) {
            animation.restart()
          }
        } else {
          animation.onFinish(callback)
        }
      }
      animation.restart()
      animation.onFinish(callback)
      // 返回动画播放器
      return animation
    }
    return undefined
  }

  /**
   * 停止播放动画动作
   * @param key 动画键
   */
  public stopMotion(key: string): void {
    this.get(key)?.finish()
  }

  /**
   * 设置全局缩放系数
   * @param scale 缩放系数
   */
  public setGlobalScale(scale: number): void {
    this.scale = scale
    for (const animation of this.list) {
      animation.scale = animation.rawScale! * scale
      animation.offsetY = animation.rawOffsetY! * scale
    }
  }

  /**
   * 设置动画缩放系数
   * @param key 动画键
   * @param scale 缩放系数
   */
  public setScale(key: string, scale: number): void {
    const animation = this.keyMap[key]
    if (animation) {
      animation.rawScale = scale
      animation.scale = scale * this.scale
    }
  }

  /**
   * 设置动画角度
   * @param angle 角度(弧度)
   */
  public setAngle(angle: number): void {
    for (const animation of this.list) {
      if (animation.syncAngle) {
        if (animation.playing) {
          animation.playing = false
          animation.setAngle(angle)
          animation.playing = true
        } else {
          animation.setAngle(angle)
        }
      }
    }
  }

  /**
   * 设置动画优先级
   * @param key 动画键
   * @param priority 排序优先级
   */
  public setPriority(key: string, priority: number): void {
    const animation = this.keyMap[key]
    if (animation) {
      animation.priority = priority
      this.sort()
    }
  }

  /**
   * 设置动画垂直偏移距离
   * @param key 动画键
   * @param offsetY 垂直偏移
   */
  public setOffsetY(key: string, offsetY: number): void {
    const animation = this.keyMap[key]
    if (animation) {
      animation.rawOffsetY = offsetY
      animation.offsetY = offsetY * this.scale
    }
  }

  /**
   * 设置角色的精灵图
   * @param key 动画键
   * @param spriteId 精灵图ID
   * @param imageId 图像文件ID
   */
  public setSprite(key: string, spriteId: string, imageId: string): void {
    const animation = this.keyMap[key]
    if (animation && spriteId) {
      // 创建优先精灵图像映射表
      if (!animation.priorityImages) {
        animation.priorityImages = {}
        animation.setSpriteImages(animation.priorityImages)
      }
      // 修改角色精灵表中的键值
      animation.priorityImages[spriteId] = imageId
      // 如果角色动画已经加载了同名纹理，则删除
      animation?.deleteTexture(spriteId)
    }
  }

  /** 排序动画组件 */
  private sort(): void {
    this.list.sort(AnimationManager.sorter)
  }

  /**
   * 更新角色动画播放进度
   * @param deltaTime 增量时间(毫秒)
   */
  public update(deltaTime: number): void {
    this.existParticles = false
    for (const animation of this.list) {
      animation.update(deltaTime)
      if (animation.existParticles) {
        this.existParticles = true
      }
    }
  }

  /**
   * 绘制角色动画
   */
  public draw(): void {
    for (const animation of this.list) {
      animation.draw()
    }
  }

  /**
   * 激活管理器中的动画
   * @param x 动画的场景X
   * @param y 动画的场景Y
   * @param lightX 反射光纹理坐标X
   * @param lightY 反射光纹理坐标Y
   */
  public activate(drawX: number, drawY: number, lightX: number, lightY: number): void {
    for (const animation of this.list) {
      animation.activate(drawX, drawY, lightX, lightY)
    }
  }

  /** 释放所有动画组件显存 */
  public release(): void {
    for (const animation of this.list) {
      animation.release()
    }
  }

  /** 销毁所有动画组件 */
  public destroy(): void {
    for (const animation of this.list) {
      // 完成动画结束回调并销毁动画
      animation.finish()
      animation.destroy()
    }
  }

  /**
   * 保存动画组件列表数据
   * @returns 动画组件存档数据列表
   */
  public saveData(): Array<AnimationComponentSaveData> {
    const length = this.list.length
    const animations = new Array(length)
    for (let i = 0; i < length; i++) {
      const animation = this.list[i]
      // 编码为json时忽略undefined
      animations[i] = {
        id: animation.data.id,
        key: animation.key,
        rotatable: animation.rotatable,
        syncAngle: animation.syncAngle,
        angle: animation.angle,
        scale: animation.rawScale,
        speed: animation.speed,
        opacity: animation.opacity,
        priority: animation.priority,
        offsetY: animation.rawOffsetY,
        motion: animation.defaultMotion ?? undefined,
        images: animation.priorityImages ?? undefined,
      }
    }
    return animations
  }

  /**
   * 加载动画组件列表数据
   * @param animations 动画组件存档数据列表
   */
  public loadData(animations: Array<AnimationComponentSaveData>): void {
    this.scale = this.actor.scale
    for (const savedData of animations) {
      const data = Data.animations[savedData.id]
      if (data) {
        const animation = new AnimationPlayer(data)
        animation.key = savedData.key
        animation.playing = false
        animation.rotatable = savedData.rotatable
        animation.syncAngle = savedData.syncAngle
        animation.rawScale = savedData.scale
        animation.scale = savedData.scale * this.scale
        animation.speed = savedData.speed
        animation.opacity = savedData.opacity
        animation.priority = savedData.priority
        animation.rawOffsetY = savedData.offsetY
        animation.offsetY = savedData.offsetY * this.scale
        animation.parent = this
        animation.setPosition(this.actor)
        animation.setAngle(savedData.angle)
        if (savedData.motion) {
          animation.defaultMotion = savedData.motion
          animation.setMotion(savedData.motion)
        }
        if (savedData.images) {
          animation.priorityImages = savedData.images
          animation.setSpriteImages(savedData.images)
        }
        this.list.push(animation)
        this.keyMap[animation.key] = animation
      }
    }
  }

  /**
   * 动画组件排序器函数
   * @param a 动画播放器A
   * @param b 动画播放器B
   */
  private static sorter = (a: AnimationPlayer, b: AnimationPlayer): number => a.priority - b.priority
}

/** ******************************** 角色动画控制器 ******************************** */

class AnimationController {
  /** 角色动画状态 */
  public state: string
  /** 角色动画正在播放中 */
  public playing: boolean
  /** 绑定的角色对象 */
  public actor: Actor
  /** 绑定的角色动画 */
  public animation: AnimationPlayer | null
  /** 角色动画闲置动作名称 */
  public idleMotion: string
  /** 角色动画移动动作名称 */
  public moveMotion: string

  /**
   * 角色动画控制器
   * @param actor 绑定的角色对象
   */
  constructor(actor: Actor) {
    this.state = 'idle'
    this.playing = false
    this.actor = actor
    this.animation = null
    this.idleMotion = actor.data.idleMotion
    this.moveMotion = actor.data.moveMotion
  }

  /**
   * 绑定角色动画
   * @param animation 动画实例
   */
  public bindAnimation(animation: AnimationPlayer | null): void {
    this.animation = animation
    if (animation) {
      // 设置角色动画的初始动作
      animation.setMotion(this.getCurrentMotionName())
      animation.setAngle(this.actor.angle)
    }
  }

  /**
   * 改变角色动作
   * @param type 动作类型
   * @param motionName 新的动作名称
   */
  public changeMotion(type: string, motionName: string): void {
    switch (type) {
      case 'idle':
        this.idleMotion = motionName
        if (this.state === 'idle') {
          this.startIdle()
        }
        break
      case 'move':
        this.moveMotion = motionName
        if (this.state === 'move') {
          this.startMoving()
        }
        break
    }
  }

  /** 开始闲置动作 */
  public startIdle(): void {
    this.state = 'idle'
    if (this.animation && this.playing === false) {
      if (this.animation.motionName === this.idleMotion) return
      if (this.animation.setMotion(this.idleMotion)) {
        this.animation.restart()
      }
    }
  }

  /** 开始移动动作 */
  public startMoving(): void {
    this.state = 'move'
    if (this.animation && this.playing === false) {
      if (this.animation.motionName === this.moveMotion) return
      if (this.animation.setMotion(this.moveMotion)) {
        this.animation.restart()
      }
    }
  }

  /** 重新播放动作 */
  public restart(): void {
    if (this.animation) {
      this.playing = false
      this.animation.speed = 1
      if (this.animation.setMotion(this.getCurrentMotionName())) {
        this.animation.restart()
      }
    }
  }

  /** 获取当前动作名称 */
  private getCurrentMotionName(): string {
    switch (this.state) {
      case 'idle': return this.idleMotion
      case 'move': return this.moveMotion
      default: throw new Error('Invalid state')
    }
  }

  /**
   * 播放角色动作(结束时恢复动作)
   * @param motionName 动作名称
   * @param speed 播放速度
   * @returns 目标动画播放器
   */
  public playMotion(motionName: string, speed: number = 1): AnimationPlayer | undefined {
    if (this.animation?.setMotion(motionName)) {
      this.playing = true
      this.animation.speed = speed
      // 重新播放动画
      this.animation.restart()
      this.animation.onFinish(() => {
        // 播放结束后设置回闲置或移动动作
        this.restart()
      })
      // 返回动画播放器
      return this.animation
    }
    return undefined
  }

  /** 停止播放角色动作 */
  public stopMotion(): void {
    this.animation?.finish()
  }

  /**
   * 保存角色动作设定
   * @returns 角色动作存档数据
   */
  public saveData(): ActorMotionSaveData {
    return {
      idle: this.idleMotion,
      move: this.moveMotion,
    }
  }

  /**
   * 加载角色动作设定
   * @param motions 角色动作存档数据
   */
  public loadData(motions: ActorMotionSaveData): void {
    this.idleMotion = motions.idle
    this.moveMotion = motions.move
  }
}

/** ******************************** 技能管理器 ******************************** */

class SkillManager {
  /** 绑定的角色对象 */
  public actor: Actor
  /** {ID:技能}映射表 */
  public idMap: HashMap<Skill>
  /** 技能冷却列表 */
  public cooldownList: SkillCooldownList
  /** 技能管理器版本(随着技能添加和移除发生变化) */
  public version: number

  /**
   * 角色技能管理器
   * @param actor 绑定的角色对象
   */
  constructor(actor: Actor) {
    this.actor = actor
    this.idMap = {}
    this.cooldownList = new SkillCooldownList(actor)
    this.version = 0
  }

  /**
   * 获取角色技能
   * @param id 技能文件ID
   * @returns 技能实例
   */
  public get(id: string): Skill | undefined {
    return this.idMap[id]
  }

  /**
   * 添加角色技能
   * @param skill 技能实例
   */
  public add(skill: Skill): void {
    const {id} = skill
    const {idMap} = this
    // 如果不存在该技能，则添加，并触发技能添加事件
    if (!idMap[id]) {
      idMap[id] = skill
      this.version++
      skill.parent = this
      skill.emit('skilladd')
    }
  }

  /**
   * 移除角色技能
   * @param skill 技能实例
   */
  public remove(skill: Skill): void {
    const {id} = skill
    const {idMap} = this
    // 如果存在该技能，则移除，并触发技能移除事件
    if (idMap[id] === skill) {
      delete idMap[id]
      this.version++
      skill.emit('skillremove')
      skill.parent = null
    }
  }

  /**
   * 删除角色技能
   * @param id 技能文件ID
   */
  public delete(id: string): void {
    // 从管理器中移除指定ID的技能
    const skill = this.idMap[id]
    if (skill) this.remove(skill)
  }

  /** 自动排序技能列表 */
  public sort(): void {
    const idMap: HashMap<Skill> = {}
    // 使用idMap创建技能列表，并通过文件名排序
    const list = (Object.values(this.idMap) as Array<Skill>).sort(
      (a: Skill, b: Skill) => a.data.filename.localeCompare(b.data.filename)
    )
    // 遍历技能列表，重构idMap
    const length = list.length
    for (let i = 0; i < length; i++) {
      const skill = list[i]
      idMap[skill.id] = skill
    }
    this.idMap = idMap
    this.version++
  }

  /**
   * 保存技能列表数据
   * @returns 技能存档数据列表
   */
  public saveData(): Array<SkillSaveData> {
    const skills = Object.values(this.idMap) as Array<Skill>
    const length = skills.length
    const data = new Array<SkillSaveData>(length)
    for (let i = 0; i < length; i++) {
      data[i] = skills[i].saveData()
    }
    return data
  }

  /**
   * 加载技能列表数据
   * @param skills 技能存档数据列表
   */
  public loadData(skills: Array<SkillSaveData>): void {
    const dataMap = Data.skills
    const {idMap, cooldownList} = this
    for (const savedData of skills) {
      const id = savedData.id
      const data = dataMap[id]
      if (data) {
        // 重新创建技能实例
        const skill = new Skill(data, savedData)
        idMap[id] = skill
        skill.parent = this
        // 如果技能正在冷却中
        // 添加到技能冷却列表
        if (skill.cooldown !== 0) {
          cooldownList.append(skill)
        }
      }
    }
  }
}

/** ******************************** 技能冷却列表 ******************************** */

class SkillCooldownList extends Array<Skill> {
  /** 绑定的角色对象 */
  public actor: Actor

  /**
   * 角色技能冷却列表
   * @param actor 绑定的角色对象
   */
  constructor(actor: Actor) {
    super()
    this.actor = actor
  }

  /**
   * 添加角色技能
   * @param skill 技能实例
   * @returns 是否成功添加
   */
  public append(skill: Skill): boolean {
    // 如果列表为空，延迟将本列表添加到角色的更新器列表中
    if (this.length === 0) {
      Callback.push(() => {
        this.actor.updaters.add(this)
      })
    }
    return super.append(skill)
  }

  /**
   * 更新列表中的技能冷却时间
   * @param deltaTime 增量时间(毫秒)
   */
  public update(deltaTime: number): void {
    let i = this.length
    // 逆序遍历冷却中的技能
    while (--i >= 0) {
      // 如果冷却结束，则将技能从列表中移除
      if ((this[i].cooldown -= deltaTime) <= 0) {
        this[i].cooldown = 0
        this[i].duration = 0
        this.splice(i, 1)
        // 如果列表为空，延迟将本列表从角色的更新器列表中移除
        if (this.length === 0) {
          Callback.push(() => {
            this.actor.updaters.remove(this)
          })
        }
      }
    }
  }
}

/** ******************************** 技能 ******************************** */

class Skill {
  /** 技能文件ID */
  public id: string
  /** 技能文件数据 */
  public data: SkillFile
  /** 技能图标文件ID */
  public icon: string
  /** 技能图标矩形裁剪区域 */
  public clip: ImageClip
  /** 技能当前冷却时间 */
  public cooldown: number
  /** 技能持续冷却时间 */
  public duration: number
  /** {键:属性值}映射表 */
  public attributes: AttributeMap
  /** {类型:事件}映射表 */
  public events: HashMap<CommandFunctionList>
  /** 技能脚本管理器 */
  public script: ScriptManager
  /** 技能管理器 */
  public parent: SkillManager | null
  /** 技能目标角色 */
  public target: Actor | null
  /** 技能施放角色 */
  public get caster() {
    return this.parent?.actor ?? null
  }

  /**
   * 角色技能对象
   * @param data 技能文件数据
   * @param savedData 技能存档数据
   */
  constructor(data: SkillFile, savedData?: SkillSaveData) {
    this.id = data.id
    this.data = data
    this.icon = data.icon
    this.clip = data.clip
    this.cooldown = 0
    this.duration = 0
    this.attributes = {}
    this.events = data.events
    this.script = ScriptManager.create(this, data.scripts)
    this.parent = null
    this.target = null
    Skill.latest = this

    if (savedData) {
      // 加载存档数据
      this.cooldown = savedData.cooldown
      this.duration = savedData.duration
      this.attributes = savedData.attributes
    } else {
      // 初始化
      Attribute.loadEntries(
        this.attributes,
        data.attributes,
      )
    }
  }

  /** 读取技能冷却进度 */
  public get progress(): number {
    return this.cooldown === 0 ? 0 : this.cooldown / this.duration
  }

  /**
   * 施放角色技能
   * @param target 目标角色
   */
  public cast(target?: Actor): EventHandler | undefined {
    // 如果冷却结束且施放角色已激活，返回技能释放事件
    if (this.cooldown === 0 &&
      this.parent?.actor.isActive()) {
      this.target = target ?? null
      const event = this.emit('skillcast')
      this.target = null
      return event
    }
  }

  /**
   * 设置技能的冷却时间
   * @param cooldown 冷却时间(毫秒)
   */
  public setCooldown(cooldown: number): void {
    if (cooldown >= 0 &&
      this.cooldown !== cooldown) {
      this.cooldown = cooldown
      this.duration = cooldown
      // 添加技能到冷却列表
      this.parent?.cooldownList.append(this)
    }
  }

  /**
   * 增加技能的冷却时间
   * @param cooldown 冷却时间(毫秒)
   */
  public increaseCooldown(cooldown: number): void {
    if (cooldown > 0) {
      this.cooldown += cooldown
      this.duration = Math.max(this.cooldown, this.duration)
      // 添加技能到冷却列表
      this.parent?.cooldownList.append(this)
    }
  }

  /**
   * 减少技能的冷却时间
   * @param cooldown 冷却时间(毫秒)
   */
  public decreaseCooldown(cooldown: number): void {
    if (cooldown > 0) {
      this.cooldown = Math.max(this.cooldown - cooldown, 0)
    }
  }

  /** 移除角色技能 */
  public remove(): void {
    this.parent?.remove(this)
  }

  /**
   * 调用技能事件
   * @param type 技能事件类型
   * @returns 生成的事件处理器
   */
  public callEvent(type: string): EventHandler | undefined {
    const {caster, target} = this
    const commands = this.events[type]
    if (commands) {
      const event = new EventHandler(commands)
      event.parent = this
      event.triggerSkill = this
      if (caster) {
        event.triggerActor = caster
        event.casterActor = caster
      }
      if (target) {
        event.targetActor = target
      }
      EventHandler.call(event, caster?.updaters)
      return event
    }
  }

  /**
   * 调用技能事件和脚本
   * @param type 技能事件类型
   * @returns 生成的事件处理器
   */
  public emit(type: string): EventHandler | undefined {
    const event = this.callEvent(type)
    this.script.emit(type, this)
    return event
  }

  /**
   * 保存技能数据
   * @returns 技能存档数据
   */
  public saveData(): SkillSaveData {
    return {
      id: this.id,
      cooldown: this.cooldown,
      duration: this.duration,
      attributes: this.attributes,
    }
  }

  /** 最新创建技能 */
  public static latest?: Skill
}

/** ******************************** 状态管理器 ******************************** */

class StateManager {
  /** 绑定的角色对象 */
  public actor: Actor
  /** {ID:状态}映射表 */
  public idMap: HashMap<State>
  /** 状态倒计时列表 */
  public countdownList: StateCountdownList
  /** 状态管理器版本(随着状态添加和移除发生变化) */
  public version: number

  /**
   * 角色状态管理器
   * @param actor 绑定的角色对象
   */
  constructor(actor: Actor) {
    this.actor = actor
    this.idMap = {}
    this.countdownList = new StateCountdownList(this)
    this.version = 0
  }

  /**
   * 获取角色状态
   * @param id 状态文件ID
   * @returns 状态实例
   */
  public get(id: string): State | undefined {
    return this.idMap[id]
  }

  /**
   * 添加角色状态
   * @param state 状态实例
   */
  public add(state: State): void {
    const {id} = state
    const {idMap} = this
    // 如果存在该状态，先移除
    if (id in idMap) {
      this.remove(idMap[id]!)
    }
    idMap[id] = state
    this.version++
    this.countdownList.append(state)
    state.parent = this
    state.emit('stateadd')
  }

  /**
   * 移除角色状态
   * @param state 状态实例
   */
  public remove(state: State): void {
    const {id} = state
    const {idMap} = this
    // 如果存在该状态，则移除，并触发状态移除事件
    if (idMap[id] === state) {
      delete idMap[id]
      this.version++
      this.countdownList.remove(state)
      state.emit('stateremove')
      state.parent = null
    }
  }

  /**
   * 删除角色状态
   * @param id 状态文件ID
   */
  public delete(id: string): void {
    // 从管理器中移除指定ID的状态
    const state = this.idMap[id]
    if (state) this.remove(state)
  }

  /**
   * 保存状态列表数据
   * @returns 状态存档数据列表
   */
  public saveData(): Array<StateSaveData> {
    const states = Object.values(this.idMap) as Array<State>
    const length = states.length
    const data = new Array<StateSaveData>(length)
    for (let i = 0; i < length; i++) {
      data[i] = states[i].saveData()
    }
    return data
  }

  /**
   * 加载状态列表数据
   * @param states 状态存档数据列表
   */
  public loadData(states: Array<StateSaveData>): void {
    for (const savedData of states) {
      const id = savedData.id
      const data = Data.states[id]
      if (data) {
        // 重新创建状态实例
        const state = new State(data, savedData)
        this.countdownList.append(state)
        this.idMap[id] = state
        state.parent = this
      }
    }
  }
}

/** ******************************** 状态倒计时列表 ******************************** */

class StateCountdownList extends Array {
  /** 绑定的角色对象 */
  public actor: Actor
  /** 状态管理器 */
  public manager: StateManager

  /**
   * 角色状态倒计时列表
   * @param stateManager 角色状态管理器实例
   */
  constructor(stateManager: StateManager) {
    super()
    this.actor = stateManager.actor
    this.manager = stateManager
  }

  /**
   * 添加角色状态
   * @param state 状态实例
   * @returns 是否成功添加
   */
  public append(state: State): boolean {
    if (state.currentTime === 0) return false
    // 如果列表为空，延迟将本列表添加到角色的更新器列表中
    if (this.length === 0) {
      Callback.push(() => {
        this.actor.updaters.add(this)
      })
    }
    return super.append(state)
  }

  /**
   * 移除角色状态
   * @param state 状态实例
   * @returns 是否成功移除
   */
  public remove(state: State): boolean {
    // 如果存在该状态，则移除
    const i = this.indexOf(state)
    if (i !== -1) {
      this.splice(i, 1)
      // 如果列表为空，延迟将本列表从角色的更新器列表中移除
      if (this.length === 0) {
        Callback.push(() => {
          this.actor.updaters.remove(this)
        })
      }
      return true
    }
    return false
  }

  /**
   * 更新列表中的状态剩余时间
   * @param deltaTime 增量时间(毫秒)
   */
  public update(deltaTime: number): void {
    let i = this.length
    // 逆序遍历倒计时中的状态
    while (--i >= 0) {
      const state = this[i]
      state.autorun()
      state.updaters.update(deltaTime)
      // 如果倒计时结束，则将状态从列表中移除
      if ((state.currentTime -= deltaTime) <= 0) {
        state.currentTime = 0
        this.manager.remove(state)
      }
    }
  }
}

/** ******************************** 状态 ******************************** */

class State {
  /** 状态文件ID */
  public id: string
  /** 状态文件数据 */
  public data: StateFile
  /** 状态图标文件ID */
  public icon: string
  /** 状态图标矩形裁剪区域 */
  public clip: ImageClip
  /** 状态当前时间 */
  public currentTime: number
  /** 状态持续时间 */
  public duration: number
  /** 状态更新器列表 */
  public updaters: UpdaterList
  /** {键:属性值}映射表 */
  public attributes: AttributeMap
  /** 技能施放者 */
  public caster: Actor | null
  /** {类型:事件}映射表 */
  public events: HashMap<CommandFunctionList>
  /** 状态脚本管理器 */
  public script: ScriptManager
  /** 状态管理器 */
  public parent: StateManager | null
  /** 已开始状态 */
  private started: boolean

  /**
   * 角色状态对象
   * @param data 状态文件数据
   * @param savedData 状态存档数据
   */
  constructor(data: StateFile, savedData?: StateSaveData) {
    this.id = data.id
    this.data = data
    this.icon = data.icon
    this.clip = data.clip
    this.currentTime = 0
    this.duration = 0
    this.updaters = new UpdaterList()
    this.attributes = {}
    this.caster = null
    this.events = data.events
    this.script = ScriptManager.create(this, data.scripts)
    this.parent = null
    this.started = false
    State.latest = this

    if (savedData) {
      // 加载存档数据
      this.currentTime = savedData.currentTime
      this.duration = savedData.duration
      this.attributes = savedData.attributes
      if (savedData.caster) {
        Callback.push(() => {
          const caster = GlobalEntityManager.get(savedData.caster)
          if (caster instanceof Actor) {
            this.caster = caster
          }
        })
      }
    } else {
      // 初始化
      Attribute.loadEntries(
        this.attributes,
        data.attributes,
      )
    }
  }

  /**
   * 设置角色状态的时间
   * @param time 持续时间(毫秒)
   */
  public setTime(time: number): void {
    if (time >= 0) {
      this.currentTime = time
      this.duration = time
    }
  }

  /**
   * 增加角色状态的时间
   * @param time 持续时间(毫秒)
   */
  public increaseTime(time: number): void {
    if (time > 0) {
      this.currentTime += time
      this.duration = Math.max(this.currentTime, this.duration)
    }
  }

  /**
   * 减少角色状态的时间
   * @param time 持续时间(毫秒)
   */
  public decreaseTime(time: number): void {
    if (time > 0) {
      this.currentTime = Math.max(this.currentTime - time, 0)
    }
  }

  /**
   * 调用状态事件
   * @param type 状态事件类型
   */
  public callEvent(type: string): void {
    const actor = this.parent?.actor
    const caster = this.caster ?? undefined
    const commands = this.events[type]
    if (commands) {
      const event = new EventHandler(commands)
      event.parent = this
      event.triggerState = this
      event.triggerActor = actor
      event.casterActor = caster
      EventHandler.call(event, this.updaters)
    }
  }

  /**
   * 调用状态事件和脚本
   * @param type 状态事件类型
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

  /**
   * 保存状态数据
   * @returns 状态存档数据
   */
  public saveData(): StateSaveData {
    return {
      id: this.id,
      caster: this.caster?.entityId ?? '',
      currentTime: this.currentTime,
      duration: this.duration,
      attributes: this.attributes,
    }
  }

  /** 最新创建状态 */
  public static latest?: State
}

/** ******************************** 装备管理器 ******************************** */

class EquipmentManager {
  /** 绑定的角色对象 */
  public actor: Actor
  /** {装备槽:装备}映射表 */
  public slotMap: HashMap<Equipment>
  /** 装备管理器版本(随着装备添加和移除发生变化) */
  public version: number

  /**
   * 角色装备管理器
   * @param actor 绑定的角色对象
   */
  constructor(actor: Actor) {
    this.actor = actor
    this.slotMap = {}
    this.version = 0
  }

  /**
   * 获取角色装备
   * @param slot 装备槽
   * @returns 装备实例
   */
  public get(slot: string): Equipment | undefined {
    return this.slotMap[slot]
  }

  /**
   * 设置角色装备
   * @param slot 装备槽
   * @param equipment 装备实例
   */
  public set(slot: string, equipment: Equipment): void {
    if (this.actor.active && slot && equipment.parent !== this) {
      // 先从其他管理器中移除该装备
      equipment.remove()
      // 如果槽已被占用，则移除槽对应的装备
      const slotMap = this.slotMap
      const holder = slotMap[slot]
      if (holder) {
        this.remove(holder)
      }
      // 设置装备槽对应值为该装备，并发送装备添加事件
      slotMap[slot] = equipment
      this.version++
      equipment.slot = slot
      equipment.parent = this
      equipment.emit('equipmentadd')
    }
  }

  /**
   * 移除角色装备
   * @param equipment 装备实例
   */
  public remove(equipment: Equipment): void {
    if (this.actor.active && equipment.parent === this) {
      // 从管理器中移除该装备，重置键位，并发送装备移除事件
      delete this.slotMap[equipment.slot]
      this.version++
      equipment.slot = ''
      equipment.emit('equipmentremove')
      equipment.parent = null
      // 在角色库存中插入移除的装备
      this.actor.inventory.insert(equipment)
    }
  }

  /**
   * 删除角色装备
   * @param slot 装备槽
   */
  public delete(slot: string): void {
    // 从管理器中移除指定键的装备
    const equipment = this.slotMap[slot]
    if (equipment) this.remove(equipment)
  }

  /**
   * 通过ID获取装备
   * @param equipmentId 装备文件ID
   * @returns 装备实例
   */
  public getById(equipmentId: string): Equipment | undefined {
    for (const equipment of Object.values(this.slotMap) as Array<Equipment>) {
      if (equipment.id === equipmentId) return equipment
    }
    return undefined
  }

  /**
   * 保存装备列表数据
   * @returns 装备存档数据列表
   */
  public saveData(): Array<EquipmentSaveData> {
    const equipments = Object.values(this.slotMap) as Array<Equipment>
    const length = equipments.length
    const data = Array<EquipmentSaveData>(length)
    for (let i = 0; i < length; i++) {
      data[i] = equipments[i].saveData()
    }
    return data
  }

  /**
   * 加载装备列表数据
   * @param equipments 装备存档数据列表
   */
  public loadData(equipments: Array<EquipmentSaveData>): void {
    for (const savedData of equipments) {
      const data = Data.equipments[savedData.id]
      if (data) {
        // 重新创建装备实例
        const equipment = new Equipment(data, savedData)
        equipment.parent = this
        this.slotMap[savedData.slot] = equipment
      }
    }
  }
}

/** ******************************** 装备 ******************************** */

class Equipment {
  /** 装备文件ID */
  public id: string
  /** 装备槽 */
  public slot: string
  /** 装备在库存中的位置(如果不在库存中为-1) */
  public order: number
  /** 装备文件数据 */
  public data: EquipmentFile
  /** 装备图标文件ID */
  public icon: string
  /** 装备图标矩形裁剪区域 */
  public clip: ImageClip
  /** {键:属性值}映射表 */
  public attributes: AttributeMap
  /** {类型:事件}映射表 */
  public events: HashMap<CommandFunctionList>
  /** 装备脚本管理器 */
  public script: ScriptManager
  /** 父级对象 */
  public parent: Inventory | EquipmentManager | null

  /**
   * 角色装备对象
   * @param data 装备文件数据
   * @param savedData 装备存档数据
   */
  constructor(data: EquipmentFile, savedData?: EquipmentSaveData) {
    this.id = data.id
    this.slot = ''
    this.order = -1
    this.data = data
    this.icon = data.icon
    this.clip = data.clip
    this.attributes = {}
    this.events = data.events
    this.script = ScriptManager.create(this, data.scripts)
    this.parent = null
    Equipment.latest = this

    if (savedData) {
      // 加载存档数据
      this.slot = savedData.slot
      this.order = savedData.order
      this.attributes = savedData.attributes
    } else {
      // 初始化
      Attribute.loadEntries(
        this.attributes,
        data.attributes,
      )
      this.emit('create')
    }
  }

  /**
   * 穿上角色装备(共享库存的代价：需要传递事件触发角色)
   * @param slot 装备槽
   * @param actor 事件触发角色
   */
  public equip(slot: string, actor: Actor | undefined = this.parent?.actor): void {
    if (this.parent instanceof Inventory) {
      actor?.equipment.set(slot, this)
    }
  }

  /** 移除角色装备 */
  public remove(): void {
    this.parent?.remove(this)
  }

  /**
   * 调用装备事件
   * @param type 装备事件类型
   */
  public callEvent(type: string): void {
    const actor = this.parent?.actor
    const commands = this.events[type]
    if (type === 'equipmentgain') {
      EventManager.emit(type, {
        argument: {},
        properties: {
          triggerActor: actor,
          triggerEquipment: this,
        }
      })
    }
    if (commands) {
      const event = new EventHandler(commands)
      event.parent = this
      event.triggerActor = actor
      event.triggerEquipment = this
      EventHandler.call(event, actor?.updaters)
    }
  }

  /**
   * 调用装备事件和脚本
   * @param type 装备事件类型
   */
  public emit(type: string): void {
    this.callEvent(type)
    this.script.emit(type, this)
  }

  /**
   * 保存装备数据
   * @returns 装备存档数据
   */
  public saveData(): EquipmentSaveData {
    return {
      id: this.id,
      slot: this.slot,
      order: this.order,
      attributes: this.attributes,
    }
  }

  /** 最新创建装备 */
  public static latest?: Equipment
}

/** ******************************** 物品 ******************************** */

class Item {
  /** 物品文件ID */
  public id: string
  /** 物品在库存中的位置(如果不在库存中为-1) */
  public order: number
  /** 物品文件数据 */
  public data: ItemFile
  /** 物品图标文件ID */
  public icon: string
  /** 物品图标矩形裁剪区域 */
  public clip: ImageClip
  /** 物品数量 */
  public quantity: number
  /** {键:属性值}映射表 */
  public attributes: AttributeMap
  /** {类型:事件}映射表 */
  public events: HashMap<CommandFunctionList>
  /** 物品脚本管理器 */
  public script: ScriptManager
  /** 父级对象 */
  public parent: Inventory | null

  /**
   * 角色物品对象
   * @param data 物品文件数据
   * @param savedData 物品存档数据
   */
  constructor(data: ItemFile, savedData?: ItemSaveData) {
    this.id = data.id
    this.order = -1
    this.data = data
    this.icon = data.icon
    this.clip = data.clip
    this.quantity = 0
    this.attributes = data.attributes
    this.events = data.events
    this.script = ScriptManager.create(this, data.scripts)
    this.parent = null

    if (savedData) {
      // 加载存档数据
      this.order = savedData.order
      this.quantity = savedData.quantity
    } else {
      this.emit('create')
    }
  }

  /**
   * 使用角色物品
   * @param actor 使用物品的角色
   * @returns 生成的事件处理器
   */
  public use(actor: Actor | undefined = this.parent?.actor): EventHandler | undefined {
    // 如果数量大于0，则返回物品使用事件
    if (this.quantity > 0 && actor?.isActive()) {
      return this.emit('itemuse', actor)
    }
  }

  /**
   * 增加物品的数量
   * @param quantity 物品数量
   */
  public increase(quantity: number): void {
    const {parent} = this
    if (parent && quantity > 0) {
      this.quantity += quantity
      parent.version++
    }
  }

  /**
   * 减少物品的数量，当物品数量不够时将被从库存中移除
   * @param quantity 物品数量
   */
  public decrease(quantity: number): void {
    const {parent} = this
    if (parent && quantity > 0) {
      this.quantity -= quantity
      // 如果物品数量不足，则移除
      if (this.quantity <= 0) {
        this.quantity = 0
        this.remove()
        // 当数量减少到零时默认已销毁
        // 标记父对象兼容StopEvent指令
        this.parent = parent
      }
      parent.version++
    }
  }

  /** 将货物从库存中移除 */
  public remove(): void {
    this.parent?.remove(this)
  }

  /**
   * 调用物品事件(共享库存的代价：需要传递事件触发角色)
   * @param type 物品事件类型
   * @param actor 事件触发角色
   * @returns 生成的事件处理器
   */
  public callEvent(type: string, actor: Actor | undefined = this.parent?.actor): EventHandler | undefined {
    const commands = this.events[type]
    if (type === 'itemgain') {
      EventManager.emit(type, {
        argument: {},
        properties: {
          triggerActor: actor,
          triggerItem: this,
        }
      })
    }
    if (commands) {
      const event = new EventHandler(commands)
      event.parent = this
      event.triggerActor = actor
      event.triggerItem = this
      EventHandler.call(event, actor?.updaters)
      return event
    }
  }

  /**
   * 调用物品事件和脚本
   * @param type 物品事件类型
   * @param actor 事件触发角色
   * @returns 生成的事件处理器
   */
  public emit(type: string, actor?: Actor): EventHandler | undefined {
    const event = this.callEvent(type, actor)
    this.script.emit(type, this)
    return event
  }

  /**
   * 保存物品数据
   * @returns 物品存档数据
   */
  public saveData(): ItemSaveData {
    return {
      id: this.id,
      order: this.order,
      quantity: this.quantity,
    }
  }

  /** 最新获得物品 */
  public static latest?: Item
  /** 最新获得物品的增量 */
  public static increment: number = 0
}

/** ******************************** 库存 ******************************** */

class Inventory {
  /** 绑定的角色对象 */
  public actor: Actor
  /** 库存中的金钱 */
  public money: number
  /** 预测下一个空槽的插入位置 */
  private pointer: number
  /** 库存货物列表 */
  public list: Array<Item | Equipment>
  /** {ID:货物集合}映射表 */
  public idMap: HashMap<Array<Item | Equipment>>
  /** 库存管理器版本(随着货物添加和移除发生变化) */
  public version: number

  /**
   * 角色库存管理器
   * @param actor 绑定的角色对象
   */
  constructor(actor: Actor) {
    this.actor = actor
    this.money = 0
    this.pointer = 0
    this.list = []
    this.idMap = {}
    this.version = 0
  }

  /**
   * 获取库存货物
   * @param id 货物文件ID
   * @returns 物品或装备实例
   */
  public get(id: string): Item | Equipment | undefined {
    return this.idMap[id]?.[0]
  }

  /**
   * 获取库存货物列表
   * @param id 货物文件ID
   * @returns 物品或装备列表
   */
  public getList(id: string): Array<Item | Equipment> | undefined {
    return this.idMap[id]
  }

  /** 重置库存中的物品、装备、金币 */
  public reset(): void {
    // 遍历库存中的所有物品装备，重置属性
    for (const goods of this.list) {
      goods.parent = null
      goods.order = -1
    }
    // 重置库存属性
    this.money = 0
    this.pointer = 0
    this.list = []
    this.idMap = {}
    this.version++
  }

  /**
   * 插入物品或装备到库存中的空位置
   * @param goods 插入货物
   */
  public insert(goods: Item | Equipment): void {
    if (goods.parent === null) {
      // 将物品插入到空槽位
      let i = this.pointer
      const {list} = this
      while (list[i]?.order === i) {i++}
      list.splice(i, 0, goods)
      goods.order = i
      goods.parent = this
      // 将物品添加到映射表
      this.addToMap(goods)
      // 设置空槽位起始查找位置
      this.pointer = i + 1
      this.version++
    }
  }

  /**
   * 从库存中移除物品或装备
   * @param goods 移除货物
   */
  public remove(goods: Item | Equipment): void {
    if (goods.parent === this) {
      const {list} = this
      const i = list.indexOf(goods)
      list.splice(i, 1)
      goods.order = -1
      goods.parent = null
      // 将物品从映射表中移除
      this.removeFromMap(goods)
      // 设置空槽位起始查找位置
      if (this.pointer > i) {
        this.pointer = i
      }
      this.version++
    }
  }

  /**
   * 添加物品或装备到映射表
   * @param goods 添加货物
   */
  private addToMap(goods: Item | Equipment): void {
    if (this.idMap[goods.id]) {
      this.idMap[goods.id]!.push(goods)
    } else {
      this.idMap[goods.id] = [goods]
    }
  }

  /**
   * 从映射表中移除物品或装备
   * @param goods 移除对象
   */
  private removeFromMap(goods: Item | Equipment): void {
    this.idMap[goods.id]?.remove(goods)
    if (this.idMap[goods.id]?.length === 0) {
      delete this.idMap[goods.id]
    }
  }

  /**
   * 交换物品或装备(如果存在)在库存中的位置
   * @param order1 货物1的位置
   * @param order2 货物2的位置
   */
  public swap(order1: number, order2: number): void {
    if (order1 >= 0 && order2 >= 0 && order1 !== order2) {
      // 确保order1小于order2
      if (order1 > order2) {
        const temp = order1
        order1 = order2
        order2 = temp
      }
      const {list} = this
      const goods1 = list.find(a => a.order === order1)
      const goods2 = list.find(a => a.order === order2)
      if (goods1 && goods2) {
        // 同时存在两个物品
        const pos1 = list.indexOf(goods1)
        const pos2 = list.indexOf(goods2)
        goods1.order = order2
        goods2.order = order1
        list[pos1] = goods2
        list[pos2] = goods1
        this.version++
      } else if (goods1) {
        // 存在索引较小的物品
        const pos1 = list.indexOf(goods1)
        list.splice(pos1, 1)
        let pos2 = pos1
        const {length} = list
        while (pos2 < length) {
          if (list[pos2].order > order2) {
            break
          }
          pos2++
        }
        goods1.order = order2
        list.splice(pos2, 0, goods1)
        this.version++
        // 设置空槽位起始查找位置
        if (this.pointer > pos1) {
          this.pointer = pos1
        }
      } else if (goods2) {
        // 存在索引较大的物品
        const pos2 = list.indexOf(goods2)
        list.splice(pos2, 1)
        let pos1 = pos2
        while (--pos1 >= 0) {
          if (list[pos1].order < order1) {
            pos1++
            break
          }
        }
        pos1 = Math.max(pos1, 0)
        goods2.order = order1
        list.splice(pos1, 0, goods2)
        this.version++
      }
    }
  }

  /**
   * 排序库存中的对象
   * @param byOrder 如果设置为true，则按文件名排序，物品优先于装备
   */
  public sort(byOrder: boolean = false): void {
    const {list} = this
    const {length} = list
    // 如果通过文件名排序
    if (byOrder) list.sort((a: Item | Equipment, b: Item | Equipment) => {
      const typeA = a instanceof Item ? 'item' : 'equipment'
      const typeB = b instanceof Item ? 'item' : 'equipment'
      // 物品优先于装备，然后再比较文件名
      if (typeA !== typeB) {
        return typeA === 'item' ? -1 : 1
      }
      return a.data.filename.localeCompare(b.data.filename)
    })
    // 遍历物品列表，更新索引
    for (let i = 0; i < length; i++) {
      list[i].order = i
    }
    this.pointer = length
    this.version++
  }

  /**
   * 查找指定的物品或装备数量
   * @param id 物品或装备的文件ID
   * @returns 货物的数量
   */
  public count(id: string): number {
    const list = this.getList(id)
    if (!list) return 0
    let count = 0
    for (const goods of list) {
      count += goods instanceof Item ? goods.quantity : 1
    }
    return count
  }

  //
  /**
   * 增加库存中的金钱
   * @param money 金钱数量
   */
  public increaseMoney(money: number): void {
    this.money += Math.max(money, 0)
    Inventory.moneyIncrement = money
    EventManager.emit('moneygain', {
      argument: {},
      properties: {
        triggerActor: this.actor,
      }
    })
  }

  /**
   * 减少库存中的金钱
   * @param money 金钱数量
   */
  public decreaseMoney(money: number): void {
    this.money -= Math.max(money, 0)
  }

  /**
   * 在库存中创建物品实例
   * @param id 物品文件ID
   * @param quantity 物品数量
   */
  public createItems(id: string, quantity: number): void {
    const data = Data.items[id]
    if (data && quantity > 0) {
      const item = new Item(data)
      // 插入到库存
      Item.latest = item
      Item.increment = quantity
      this.insert(item)
      item.increase(quantity)
      item.callEvent('itemgain')
    }
  }

  /**
   * 在库存中增加物品数量(如果找不到物品，新建一个实例)
   * @param id 物品文件ID
   * @param quantity 物品数量
   */
  public increaseItems(id: string, quantity: number): void {
    const item = this.get(id)
    // 如果存在该物品，则增加数量，否则创建物品
    if (item instanceof Item) {
      Item.latest = item
      Item.increment = quantity
      item.increase(quantity)
      item.callEvent('itemgain')
    }
    else {
      this.createItems(id, quantity)
    }
  }

  /**
   * 在库存中减少物品数量(从多个物品实例中减去足够的数量)
   * @param id 物品文件ID
   * @param quantity 物品数量
   */
  public decreaseItems(id: string, quantity: number): void {
    const {list} = this
    let i = list.length
    while (--i >= 0) {
      const item = list[i]
      if (item.id === id && item instanceof Item) {
        // 查找物品并减少数量
        if (item.quantity >= quantity) {
          item.decrease(quantity)
          return
        }
        // 如果数量不够，继续查找
        quantity -= item.quantity
        item.decrease(item.quantity)
      }
    }
  }

  /**
   * 在库存中创建装备实例(通过文件ID)
   * @param id 装备文件ID
   */
  public createEquipment(id: string): void {
    const data = Data.equipments[id]
    if (data) {
      this.gainEquipment(new Equipment(data))
    }
  }

  /**
   * 从库存中删除装备实例(通过文件ID)
   * @param id 装备文件ID
   */
  public deleteEquipment(id: string): void {
    const equipment = this.get(id)
    if (equipment instanceof Equipment) {
      this.loseEquipment(equipment)
    }
  }

  /**
   * 添加装备实例到库存
   * @param equipment 装备实例
   */
  public gainEquipment(equipment: Equipment): void {
    if (equipment.parent !== this) {
      equipment.remove()
      this.insert(equipment)
      equipment.callEvent('equipmentgain')
    }
  }

  /**
   * 从库存中移除装备实例
   * @param equipment 装备实例
   */
  public loseEquipment(equipment: Equipment): void {
    if (equipment.parent === this) {
      this.remove(equipment)
    }
  }

  /**
   * 保存库存数据
   * @param actor 为这个角色保存库存(可能不是库存的主人)
   * @returns 库存存档数据
   */
  public saveData(actor: Actor): InventorySaveData {
    if (actor.savedInventory) {
      return {
        ref: this.actor.data.id,
        ...actor.savedInventory.saveData(actor),
      }
    }
    const {list} = this
    const {length} = list
    const data = new Array(length)
    for (let i = 0; i < length; i++) {
      data[i] = list[i].saveData()
    }
    return {
      list: data,
      money: this.money,
    }
  }

  /**
   * 加载库存数据
   * @param inventory 库存存档数据
   */
  public loadData(inventory: InventorySaveData): void {
    if ('ref' in inventory) {
      Inventory.references.push({
        actor: this.actor,
        ref: inventory.ref!,
      })
    }
    const {list} = this
    for (const savedData of inventory.list) {
      const {id} = savedData
      if ('quantity' in savedData) {
        // 如果是物品数据
        const data = Data.items[id]
        if (data) {
          // 重新创建物品实例
          const item = new Item(data, savedData)
          item.parent = this
          list.push(item)
          this.addToMap(item)
        }
      } else {
        // 如果是装备数据
        const data = Data.equipments[id]
        if (data) {
          // 重新创建装备实例
          const equipment = new Equipment(data, savedData)
          equipment.parent = this
          list.push(equipment)
          this.addToMap(equipment)
        }
      }
    }
    this.money = inventory.money
    // 设置空槽位起始查找位置
    let i = 0
    while (list[i]?.order === i) {i++}
    this.pointer = i
  }

  /** 金钱增量 */
  public static moneyIncrement: number = 0
  /** 引用库存延迟处理列表 */
  private static references: InventoryReferenceList = []

  /** 恢复库存引用 */
  public static reference(): void {
    for (const {actor, ref} of this.references) {
      const target = ActorManager.get(ref)
      if (target instanceof GlobalActor) {
        actor.useInventory(target.inventory)
      }
    }
  }
}

/** ******************************** 快捷栏管理器 ******************************** */

class ShortcutManager {
  /** 绑定的角色对象 */
  public actor: Actor
  /** {快捷键:快捷项}映射表 */
  public keyMap: HashMap<Shortcut>
  /** 快捷栏管理器版本(随着快捷键的设置和删除发生变化) */
  public version: number

  /**
   * 角色快捷栏管理器
   * @param actor 绑定的角色对象
   */
  constructor(actor: Actor) {
    this.actor = actor
    this.keyMap = {}
    this.version = 0
  }

  /**
   * 获取快捷栏的快捷项
   * @param key 快捷键
   * @returns 快捷项
   */
  public get(key: string): Shortcut | undefined {
    return this.keyMap[key]
  }

  /**
   * 获取快捷栏的物品
   * @param key 快捷键
   * @returns 物品实例
   */
  public getItem(key: string): Item | undefined {
    const shortcut = this.keyMap[key]
    if (shortcut?.type === 'item') {
      return this.actor.inventory.get(shortcut.id) as Item
    }
    return undefined
  }

  /**
   * 获取快捷栏的技能
   * @param key 快捷键
   * @returns 技能实例
   */
  public getSkill(key: string): Skill | undefined {
    const shortcut = this.keyMap[key]
    if (shortcut?.type === 'skill') {
      return this.actor.skill.get(shortcut.id)
    }
    return undefined
  }

  /**
   * 获取快捷栏的目标对象(物品或技能)
   * @param key 快捷键
   * @returns 物品或技能实例
   */
  public getTarget(key: string): Skill | Item | undefined {
    const shortcut = this.keyMap[key]
    switch (shortcut?.type) {
      case 'skill':
        return this.actor.skill.get(shortcut.id)
      case 'item':
        return this.actor.inventory.get(shortcut.id) as Item
      default:
        return undefined
    }
  }

  /**
   * 设置快捷栏的快捷项
   * @param key 快捷键
   * @param 物品或技能实例
   */
  public set(key: string, target: Item | Skill): void {
    if (!key) return
    if (target instanceof Skill) {
      this.keyMap[key] = new Shortcut('skill', key, target.id, target.data)
      this.version++
      return
    }
    if (target instanceof Item) {
      this.keyMap[key] = new Shortcut('item', key, target.id, target.data)
      this.version++
      return
    }
  }

  /**
   * 设置快捷栏项目(文件ID)
   * @param key 快捷键
   * @param id 物品或技能的文件ID
   */
  public setId(key: string, id: string): void {
    if (id in Data.skills) {
      this.keyMap[key] = new Shortcut('skill', key, id, Data.skills[id]!)
      this.version++
      return
    }
    if (id in Data.items) {
      this.keyMap[key] = new Shortcut('item', key, id, Data.items[id]!)
      this.version++
      return
    }
  }

  /**
   * 删除快捷栏项目
   * @param key 快捷键
   */
  public delete(key: string): void {
    if (key in this.keyMap) {
      delete this.keyMap[key]
      this.version++
    }
  }

  /**
   * 交换快捷栏项目
   * @param sKey 源快捷键
   * @param dKey 目标快捷键
   */
  public swap(sKey: string, dKey: string): void {
    if (sKey !== dKey && sKey && dKey) {
      const map = this.keyMap
      const sItem = map[sKey]
      const dItem = map[dKey]
      if (sItem) {
        sItem.key = dKey
        map[dKey] = sItem
      } else {
        delete map[dKey]
      }
      if (dItem) {
        dItem.key = sKey
        map[sKey] = dItem
      } else {
        delete map[sKey]
      }
      this.version++
    }
  }

  /**
   * 保存快捷栏数据
   * @returns 快捷项存档数据列表
   */
  public saveData(): Array<ShortcutSaveData> {
    const shortcuts = Object.values(this.keyMap) as Array<Shortcut>
    const length = shortcuts.length
    const data = new Array<ShortcutSaveData>(length)
    for (let i = 0; i < length; i++) {
      const shortcut = shortcuts[i]
      data[i] = {
        key: shortcut.key,
        id: shortcut.id,
      }
    }
    return data
  }

  /**
   * 加载快捷栏数据
   * @param shortcuts 快捷项存档数据列表
   */
  public loadData(shortcuts: Array<ShortcutSaveData>): void {
    for (const shortcut of shortcuts) {
      this.setId(shortcut.key, shortcut.id)
    }
  }
}

/** ******************************** 快捷栏项目 ******************************** */

class Shortcut {
  /** 类型 */
  public type: string
  /** 快捷键 */
  public key: string
  /** 数据ID */
  public id: string
  /** 目标文件数据 */
  public data: ItemFile | SkillFile
  /** 图标文件ID */
  public icon: string
  /** 图标矩形裁剪区域 */
  public clip: ImageClip

  /**
   * 快捷栏项目
   * @param type 类型
   * @param key 快捷键
   * @param id 数据ID
   * @param data 目标对象的文件数据
   */
  constructor(type: string, key: string, id: string, data: ItemFile | SkillFile) {
    this.type = type
    this.key = key
    this.id = id
    this.data = data
    this.icon = data.icon
    this.clip = data.clip
  }
}

/** ******************************** 公共冷却管理器 ******************************** */

class CooldownManager {
  /** 绑定的角色对象 */
  public actor: Actor
  /** {冷却键:冷却项目}映射表 */
  public keyMap: HashMap<CooldownItem>
  /** 冷却项目列表 */
  public cooldownList: Array<CooldownItem>

  /**
   * 角色公共冷却管理器
   * @param actor 绑定的角色对象
   */
  constructor(actor: Actor) {
    this.actor = actor
    this.keyMap = {}
    this.cooldownList = []
  }

  /**
   * 获取冷却项目
   * @param key 冷却键
   * @returns 冷却项实例
   */
  public get(key: string): CooldownItem | undefined {
    return this.keyMap[key]
  }

  /**
   * 创建冷却项目
   * @param key 冷却键
   * @returns 冷却项实例
   */
  private create(key: string): CooldownItem {
    let item = this.keyMap[key]
    // 如果不存在冷却项目，则新建一个
    if (item === undefined) {
      // 如果列表为空，延迟将本列表添加到角色的更新器列表中
      if (this.cooldownList.length === 0) {
        Callback.push(() => {
          this.actor.updaters.add(this)
        })
      }
      // 创建冷却项目
      item = new CooldownItem(key)
      this.keyMap[key] = item
      this.cooldownList.append(item)
    }
    return item
  }

  /**
   * 删除冷却项目
   * @param key 冷却键
   */
  private delete(key: string): void {
    const item = this.keyMap[key]
    if (item) {
      delete this.keyMap[key]
      this.cooldownList.remove(item)
      // 如果列表为空，延迟将本列表从角色的更新器列表中移除
      if (this.cooldownList.length === 0) {
        Callback.push(() => {
          this.actor.updaters.remove(this)
        })
      }
    }
  }

  /**
   * 设置冷却时间
   * @param key 冷却键
   * @param cooldown 冷却时间
   */
  public setCooldown(key: string, cooldown: number): void {
    if (key && cooldown > 0) {
      const item = this.create(key)
      item.cooldown = cooldown
      item.duration = cooldown
    }
  }

  /**
   * 增加冷却时间
   * @param key 冷却键
   * @param cooldown 冷却时间
   */
  public increaseCooldown(key: string, cooldown: number): void {
    if (key && cooldown > 0) {
      const item = this.create(key)
      item.cooldown += cooldown
      item.duration = Math.max(item.cooldown, item.duration)
    }
  }

  /**
   * 减少冷却时间
   * @param key 冷却键
   * @param cooldown 冷却时间
   */
  public decreaseCooldown(key: string, cooldown: number): void {
    const item = this.keyMap[key]
    if (item && cooldown > 0) {
      item.cooldown -= cooldown
      // 如果冷却结束，删除键
      if (item.cooldown <= 0) {
        this.delete(key)
      }
    }
  }

  /**
   * 更新公共冷却时间
   * @param deltaTime 增量时间(毫秒)
   */
  public update(deltaTime: number): void {
    const {cooldownList} = this
    let i = cooldownList.length
    // 逆序遍历冷却列表
    while (--i >= 0) {
      // 如果冷却结束，删除键
      if ((cooldownList[i].cooldown -= deltaTime) <= 0) {
        this.delete(cooldownList[i].key)
      }
    }
  }

  /**
   * 保存公共冷却列表数据
   * @returns 冷却存档数据列表
   */
  public saveData(): Array<CooldownItem> {
    return this.cooldownList
  }

  /**
   * 加载公共冷却列表数据
   * @param cooldowns
   */
  public loadData(cooldowns: Array<CooldownItem>): void {
    if (cooldowns.length !== 0) {
      // 重构冷却列表
      for (const cooldown of cooldowns) {
        const instance = new CooldownItem(cooldown.key)
        instance.cooldown = cooldown.cooldown
        instance.duration = cooldown.duration
        this.keyMap[cooldown.key] = instance
        this.cooldownList.push(instance)
      }
      this.actor.updaters.add(this)
    }
  }
}

/** ******************************** 公共冷却项目 ******************************** */

class CooldownItem {
  /** 冷却键 */
  public key: string
  /** 当前冷却时间 */
  public cooldown: number
  /** 持续冷却时间 */
  public duration: number

  /**
   * 公共冷却项目
   * @param key 冷却键
   */
  constructor(key: string) {
    this.key = key
    this.cooldown = 0
    this.duration = 0
  }

  /** 读取公共冷却进度 */
  public get progress(): number {
    return this.cooldown / this.duration
  }
}

/** ******************************** 角色目标管理器 ******************************** */

class TargetManager {
  /** 绑定的角色对象 */
  public actor: Actor
  /** 目标角色列表 */
  public targets: Array<Actor>
  /** 仇恨值数据列表 */
  public threats: Array<number>
  /** 相关目标角色列表 */
  public relatedTargets: Array<Actor>

  /**
   * 角色目标管理器
   * @param actor 绑定的角色对象
   */
  constructor(actor: Actor) {
    this.actor = actor
    this.targets = []
    this.threats = []
    this.relatedTargets = []
  }

  /**
   * 增加对目标角色的仇恨值，如果还不是目标，则将他放到目标列表中
   * @param actor 目标角色
   * @param threat 增加的仇恨值
   */
  public increaseThreat(actor: Actor, threat: number): void {
    const index = this.targets.indexOf(actor)
    if (index !== -1) {
      // 如果存在目标角色，增加仇恨值
      this.threats[index] += threat
    } else if (actor.active) {
      // 如果不存在目标角色，且目标角色已激活
      // 添加目标角色和仇恨值，并让目标角色将自己添加为相关目标
      this.targets.push(actor)
      this.threats.push(threat)
      actor.target.relatedTargets.push(this.actor)
    }
  }

  /**
   * 减少对目标角色的仇恨值
   * @param actor 目标角色
   * @param threat 减少的仇恨值
   */
  public decreaseThreat(actor: Actor, threat: number): void {
    const index = this.targets.indexOf(actor)
    if (index !== -1) {
      // 如果存在目标角色，减少仇恨值
      this.threats[index] = Math.max(this.threats[index] - threat, 0)
    }
  }

  /** 判断角色是否存在目标 */
  public exists(): boolean {
    return this.targets.length !== 0
  }

  /**
   * 探测目标角色，将符合条件的角色添加到目标列表中
   * @param distance 探测距离(单位:图块)
   * @param selector 目标角色选择器
   * @param inSight 是否判断目标角色在视野中可见
   * @returns 是否已经存在目标
   */
  public detect(distance: number, selector: ActorSelector, inSight: boolean = false): boolean {
    const inspector = Actor.inspectors[selector]
    const owner = this.actor
    const ox = owner.x
    const oy = owner.y
    // 获取探测范围所在的角色区间列表
    const cells = Scene.actor.partition.get(
      ox - distance,
      oy - distance,
      ox + distance,
      oy + distance,
    )
    const square = distance ** 2
    const count = cells.count
    // 查找所有角色区间
    for (let i = 0; i < count; i++) {
      const actors = cells[i]!
      const length = actors.length
      // 查找区间中的所有角色
      for (let i = 0; i < length; i++) {
        const actor = actors[i] as Actor
        // 如果角色已激活，距离小于等于探测距离，且符合条件，则把该角色添加到目标列表中
        if (actor.active && (ox - actor.x) ** 2 + (oy - actor.y) ** 2 <= square &&
          inspector(owner, actor) && (inSight === false ||
          actor.parent!.scene.isInLineOfSight(ox, oy, actor.x, actor.y))) {
          this.append(actor)
        }
      }
    }
    return this.exists()
  }

  /**
   * 放弃远处的目标角色
   * @param selector 目标角色选择器
   * @param distance 如果与目标角色的距离达到这个阈值，将他从目标列表中移除
   */
  public discard(selector: ActorSelector, distance: number = 0): void {
    const inspector = Actor.inspectors[selector]
    const owner = this.actor
    const ox = owner.x
    const oy = owner.y
    const square = distance ** 2
    const targets = this.targets
    let i = targets.length
    // 逆序查找目标列表中的所有角色
    while (--i >= 0) {
      const actor = targets[i]
      // 如果角色符合条件，且距离大于等于放弃距离，则把该角色从目标列表中移除
      if (inspector(owner, actor) && (ox - actor.x) ** 2 + (oy - actor.y) ** 2 >= square) {
        this.remove(actor)
      }
    }
  }

  /** 重置角色目标管理器 */
  public reset(): void {
    this.resetTargets()
    this.resetRelatedTargets()
  }

  /** 重置目标角色列表 */
  public resetTargets(): void {
    const targets = this.targets
    const length = targets.length
    if (length !== 0) {
      const owner = this.actor
      // 遍历所有目标，将本角色从它们的相关列表中删除
      for (let i = 0; i < length; i++) {
        targets[i].target.relatedTargets.remove(owner)
      }
      // 重置目标和仇恨值列表
      this.targets = []
      this.threats = []
    }
  }

  /** 重置相关目标角色列表 */
  public resetRelatedTargets(): void {
    const relatedTargets = this.relatedTargets
    const length = relatedTargets.length
    if (length !== 0) {
      const owner = this.actor
      // 遍历所有相关目标，将本角色从它们的目标和仇恨值列表中删除
      for (let i = 0; i < length; i++) {
        const actor = relatedTargets[i]
        const manager = actor.target
        const targets = manager.targets
        const threats = manager.threats
        const index = targets.indexOf(owner)
        if (index !== -1) {
          targets.splice(index, 1)
          threats.splice(index, 1)
        }
      }
      // 重置相关列表
      this.relatedTargets = []
    }
  }

  /**
   * 添加角色到目标列表中
   * @param actor 目标角色
   */
  public append(actor: Actor): void {
    const index = this.targets.indexOf(actor)
    if (index === -1) {
      // 如果不存在该目标，则添加目标和仇恨值
      // 并让目标角色将本角色添加到相关列表
      this.targets.push(actor)
      this.threats.push(0)
      actor.target.relatedTargets.push(this.actor)
    }
  }

  /**
   * 从目标列表中移除角色
   * @param actor 目标角色
   */
  public remove(actor: Actor): void {
    const index = this.targets.indexOf(actor)
    if (index !== -1) {
      // 如果存在该目标，则移除目标和仇恨值
      // 并让目标角色将本角色从相关列表中移除
      this.targets.splice(index, 1)
      this.threats.splice(index, 1)
      actor.target.relatedTargets.remove(this.actor)
    }
  }

  /**
   * 获取目标角色 - 最大仇恨值
   * @param selector 目标角色选择器
   * @returns 目标池中符合条件的角色实例
   */
  public getTargetMaxThreat(selector: ActorSelector): Actor | undefined {
    let target: Actor | undefined
    let weight = -1
    const inspector = Actor.inspectors[selector]
    const owner = this.actor
    const targets = this.targets
    const threats = this.threats
    const length = targets.length
    for (let i = 0; i < length; i++) {
      const actor = targets[i]
      // 检查角色关系，并找出最大仇恨值的目标
      if (inspector(owner, actor)) {
        const threat = threats[i]
        if (threat > weight) {
          target = actor
          weight = threat
        }
      }
    }
    return target
  }

  /**
   * 获取目标角色 - 最近距离
   * @param selector 目标角色选择器
   * @returns 目标池中符合条件的角色实例
   */
  public getTargetNearest(selector: ActorSelector): Actor | undefined {
    let target: Actor | undefined
    let weight = Infinity
    const inspector = Actor.inspectors[selector]
    const owner = this.actor
    const targets = this.targets
    const length = targets.length
    for (let i = 0; i < length; i++) {
      const actor = targets[i]
      // 检查角色关系，并找出最近距离的目标
      if (inspector(owner, actor)) {
        const distance = Math.dist(owner.x, owner.y, actor.x, actor.y)
        if (distance < weight) {
          target = actor
          weight = distance
        }
      }
    }
    return target
  }

  /**
   * 获取目标角色 - 最远距离
   * @param selector 目标角色选择器
   * @returns 目标池中符合条件的角色实例
   */
  public getTargetFarthest(selector: ActorSelector): Actor | undefined {
    let target: Actor | undefined
    let weight = -Infinity
    const inspector = Actor.inspectors[selector]
    const owner = this.actor
    const targets = this.targets
    const length = targets.length
    for (let i = 0; i < length; i++) {
      const actor = targets[i]
      // 检查角色关系，并找出最远距离的目标
      if (inspector(owner, actor)) {
        const distance = Math.dist(owner.x, owner.y, actor.x, actor.y)
        if (distance > weight) {
          target = actor
          weight = distance
        }
      }
    }
    return target
  }

  /**
   * 获取目标角色 - 最小属性值
   * @param selector 目标角色选择器
   * @param key 属性键
   * @returns 目标池中符合条件的角色实例
   */
  public getTargetMinAttributeValue(selector: ActorSelector, key: string): Actor | undefined {
    let target: Actor | undefined
    let weight = Infinity
    const inspector = Actor.inspectors[selector]
    const owner = this.actor
    const targets = this.targets
    const length = targets.length
    for (let i = 0; i < length; i++) {
      const actor = targets[i]
      // 检查角色关系，并找出最小属性值的目标
      if (inspector(owner, actor)) {
        const value = actor.attributes[key]
        if (typeof value === 'number' && value < weight) {
          target = actor
          weight = value
        }
      }
    }
    return target
  }

  /**
   * 获取目标角色 - 最大属性值
   * @param selector 目标角色选择器
   * @param key 属性键
   * @returns 目标池中符合条件的角色实例
   */
  public getTargetMaxAttributeValue(selector: ActorSelector, key: string): Actor | undefined {
    let target: Actor | undefined
    let weight = -Infinity
    const inspector = Actor.inspectors[selector]
    const owner = this.actor
    const targets = this.targets
    const length = targets.length
    for (let i = 0; i < length; i++) {
      const actor = targets[i]
      // 检查角色关系，并找出最大属性值的目标
      if (inspector(owner, actor)) {
        const value = actor.attributes[key]
        if (typeof value === 'number' && value > weight) {
          target = actor
          weight = value
        }
      }
    }
    return target
  }

  /**
   * 获取目标角色 - 最小属性比率
   * @param selector 目标角色选择器
   * @param key 属性键1
   * @param divisor 属性键2
   * @returns 目标池中符合条件的角色实例
   */
  public getTargetMinAttributeRatio(selector: ActorSelector, key: string, divisor: string): Actor | undefined {
    let target: Actor | undefined
    let weight = Infinity
    const inspector = Actor.inspectors[selector]
    const owner = this.actor
    const targets = this.targets
    const length = targets.length
    for (let i = 0; i < length; i++) {
      const actor = targets[i]
      // 检查角色关系，并找出最小属性比率的目标
      if (inspector(owner, actor)) {
        const attributes = actor.attributes
        const a = attributes[key]
        const b = attributes[divisor]
        if (typeof a === 'number' && typeof b === 'number') {
          const ratio = a / b
          if (ratio < weight) {
            target = actor
            weight = ratio
          }
        }
      }
    }
    return target
  }

  /**
   * 获得目标角色 - 最大属性比率
   * @param selector 目标角色选择器
   * @param key 属性键1
   * @param divisor 属性键2
   * @returns 目标池中符合条件的角色实例
   */
  public getTargetMaxAttributeRatio(selector: ActorSelector, key: string, divisor: string): Actor | undefined {
    let target: Actor | undefined
    let weight = -Infinity
    const inspector = Actor.inspectors[selector]
    const owner = this.actor
    const targets = this.targets
    const length = targets.length
    for (let i = 0; i < length; i++) {
      const actor = targets[i]
      // 检查角色关系，并找出最大属性值的目标
      if (inspector(owner, actor)) {
        const attributes = actor.attributes
        const a = attributes[key]
        const b = attributes[divisor]
        if (typeof a === 'number' && typeof b === 'number') {
          const ratio = a / b
          if (ratio > weight) {
            target = actor
            weight = ratio
          }
        }
      }
    }
    return target
  }

  /**
   * 获取目标角色 - 随机
   * @param selector 目标角色选择器
   * @returns 目标池中符合条件的角色实例
   */
  public getTargetRandom(selector: ActorSelector): Actor | undefined {
    let target: Actor | undefined
    let count = 0
    const inspector = Actor.inspectors[selector]
    const owner = this.actor
    const targets = this.targets
    const indices = GL.arrays[0].uint32
    const length = targets.length
    for (let i = 0; i < length; i++) {
      // 检查角色关系，把索引保存在indices中
      if (inspector(owner, targets[i])) {
        indices[count++] = i
      }
    }
    if (count !== 0) {
      // 获取随机索引指向的角色
      target = targets[indices[Math.floor(Math.random() * count)]]
    }
    return target
  }
}