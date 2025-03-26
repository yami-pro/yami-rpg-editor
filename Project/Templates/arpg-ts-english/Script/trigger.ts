/** ******************************** 触发器 ******************************** */

class Trigger {
  /** 触发器文件ID */
  public id: string
  /** 触发器文件数据 */
  public data: TriggerFile
  /** 触发器水平位置 */
  public x: number
  /** 触发器垂直位置 */
  public y: number
  /** 触发器上一次水平位置 */
  public lastX: number
  /** 触发器上一次垂直位置 */
  public lastY: number
  /** 触发器缩放系数 */
  public scale: number
  /** 触发器角度(弧度) */
  public angle: number
  /** 触发器移动速度(图块/秒) */
  public speed: number
  /** 触发器水平速度分量 */
  public velocityX: number
  /** 触发器垂直速度分量 */
  public velocityY: number
  /** 当前帧的增量时间(毫秒) */
  public deltaTime: number
  /** 触发器的总体播放速度 */
  public timeScale: number
  /** 触发器已经播放的时间 */
  public elapsed: number
  /** 触发器的持续时间 */
  public duration: number
  /** 触发器的形状参数对象 */
  public shape: TriggerShape
  /** 触发器的动画播放器 */
  public animation: AnimationPlayer | null
  /** 触发器的角色选择器规则 */
  public selector: ActorSelector
  /** 触发次数 */
  public hitCount: number
  /** 触发间隔(毫秒) */
  public hitInterval: number
  /** 用于启用触发器的初始延时 */
  public initialDelay: number
  /** 用于禁用触发器的超时时间 */
  public timeout: number
  /** 触发器的更新器模块列表 */
  public updaters: UpdaterList
  /** 触发器的事件映射表 */
  public events: HashMap<CommandFunctionList>
  /** 触发器的脚本管理器 */
  public script: ScriptManager
  /** 触发器的技能施放角色 */
  public caster: Actor | null
  /** 触发器的技能目标角色 */
  public target: Actor | null
  /** 触发器正在施放的技能 */
  public skill: Skill | null
  /** 触发器击中的角色列表 */
  public hitList: Array<Actor>
  /** 触发器击中角色时的时间列表 */
  public timeList: Array<number>
  /** 触发器的父级对象 */
  public parent: SceneTriggerManager | null
  /** 已开始状态 */
  private started: boolean
  /** 是否已销毁 */
  public destroyed: boolean

  /** 检测触发器与墙块碰撞 */
  private detectCollisionWithWalls: () => boolean

  /** 通过碰撞获取角色列表 */
  private getActorsByCollision:
  | typeof Trigger.actorGetters.rectangle
  | typeof Trigger.actorGetters.circle
  | typeof Trigger.actorGetters.sector

  /** 通过触发模式获取角色列表 */
  private getActorsByHitMode: () => CacheList<Actor>

  /** 更新时间列表 */
  private updateTimeList: () => void

  /**
   * 触发器对象
   * @param data 触发器文件数据
   */
  constructor(data: TriggerFile) {
    this.id = data.id
    this.data = data
    this.x = 0
    this.y = 0
    this.lastX = 0
    this.lastY = 0
    this.scale = 1
    this.angle = 0
    this.speed = data.speed
    this.velocityX = 0
    this.velocityY = 0
    this.timeScale = 1
    this.deltaTime = 0
    this.elapsed = 0
    this.duration = data.duration
    this.shape = data.shape
    this.animation = null
    this.selector = data.selector
    this.detectCollisionWithWalls = Trigger.detectCollisionWithWalls[data.onHitWalls]
    this.getActorsByCollision = Trigger.actorGetters[data.shape.type]
    this.getActorsByHitMode = Trigger.collisionFilters[data.hitMode]
    this.updateTimeList = Trigger.hitListUpdaters[data.hitMode]
    switch (data.onHitActors) {
      case 'penetrate':
        this.hitCount = Infinity
        break
      case 'destroy':
        this.hitCount = 1
        break
      case 'penetrate-destroy':
        this.hitCount = data.hitCount
        break
    }
    this.hitInterval = data.hitInterval
    this.initialDelay = data.initialDelay
    this.timeout = data.initialDelay + (data.effectiveTime || Infinity)
    this.hitList = []
    this.timeList = []
    this.updaters = new UpdaterList()
    this.events = data.events
    this.script = ScriptManager.create(this, data.scripts)
    this.caster = null
    this.target = null
    this.skill = null
    this.parent = null
    this.started = false
    this.destroyed = false
    this.loadAnimation(data)
    Trigger.latest = this
    this.emit('create')
  }

  /**
   * 加载触发器动画
   * @param data 触发器文件数据
   */
  private loadAnimation(data: TriggerFile): void {
    const animData = Data.animations[data.animationId]
    if (animData !== undefined) {
      const animation = new AnimationPlayer(animData)
      animation.parent = this
      animation.scale = this.scale
      animation.setPosition(this)
      animation.priority = data.priority
      animation.offsetY = data.offsetY
      animation.setMotion(data.motion)
      animation.redirect = animation.dirList.length > 1
      animation.rotatable = data.rotatable
      this.animation = animation
      if (this.duration === 0) {
        // 如果触发器持续时间是0，将会使用动画的持续时间
        this.duration = animation.length * AnimationPlayer.step
      }
    }
  }

  /**
   * 更新触发器的运动和碰撞检测
   * @param deltaTime 增量时间(毫秒)
   */
  public update(deltaTime: number): void {
    // 如果触发器过期，移除它
    if (this.elapsed >= this.duration) {
      this.remove()
      return
    }
    const time = deltaTime * this.timeScale
    // 计算增量时间(以秒为单位)
    this.deltaTime = time
    this.elapsed += time
    this.updaters.update(deltaTime)
    this.updateMovement()
    if (this.updateCollision()) {
      // 如果未与墙壁发生碰撞，更新动画
      this.updateAnimation(time)
    } else {
      // 否则移除
      this.remove()
    }
    // 更新上一次的位置
    this.lastX = this.x
    this.lastY = this.y
  }

  /**
   * 设置动画色调
   * @param tint 动画色调属性选项{red?: -255~255, green?: -255~255, blue?: -255~255, gray?: 0~255}
   * @param easingId 过渡曲线ID
   * @param duration 持续时间(毫秒)
   */
  public setTint(tint: ImageTintOptions, easingId: string = '', duration: number = 0): void {
    this.animation?.setTint('trigger-tint', this.updaters, tint, easingId, duration)
  }

  /**
   * 设置动画不透明度
   * @param opacity 不透明度[0-1]
   * @param easingId 过渡曲线ID
   * @param duration 持续时间(毫秒)
   */
  public setOpacity(opacity: number, easingId: string = '', duration: number = 0): void {
    this.animation?.setOpacity('trigger-opacity', this.updaters, opacity, easingId, duration)
  }

  /**
   * 设置动画垂直偏移距离
   * @param offsetY 垂直偏移距离
   * @param easingId 过渡曲线ID
   * @param duration 持续时间(毫秒)
   */
  public setOffsetY(offsetY: number, easingId: string = '', duration: number = 0): void {
    this.animation?.setOffsetY('trigger-offsetY', this.updaters, offsetY, easingId, duration)
  }

  /**
   * 设置动画旋转角度
   * @param rotation 旋转角度(弧度)
   * @param easingId 过渡曲线ID
   * @param duration 持续时间(毫秒)
   */
  public setRotation(rotation: number, easingId: string = '', duration: number = 0): void {
    this.animation?.setRotation('trigger-rotation', this.updaters, rotation, easingId, duration)
  }

  /**
   * 设置触发器位置
   * @param x 水平位置
   * @param y 垂直位置
   */
  public setPosition(x: number, y: number): void {
    this.x = x
    this.y = y
    this.lastX = x
    this.lastY = y
  }

  /**
   * 设置触发器缩放系数
   * @param scale 触发器缩放系数
   */
  public setScale(scale: number): void {
    this.scale = scale
    if (this.animation) {
      this.animation.scale = scale
    }
  }

  /**
   * 设置触发器角度
   * @param angle 触发器角度(弧度)
   */
  public setAngle(angle: number): void {
    this.angle = angle
    this.updateVelocity()
  }

  /**
   * 设置触发器速度
   * @param speed 触发器速度(图块/秒)
   */
  public setSpeed(speed: number): void {
    this.speed = speed
    this.updateVelocity()
  }

  /** 更新触发器速度分量 */
  public updateVelocity(): void {
    const cos = Math.cos(this.angle)
    const sin = Math.sin(this.angle)
    this.velocityX = this.speed * cos
    this.velocityY = this.speed * sin
  }

  /** 更新触发器的移动 */
  private updateMovement(): void {
    const deltaTime = this.deltaTime / 1000
    this.x += this.velocityX * deltaTime
    this.y += this.velocityY * deltaTime
  }

  /**
   * 更新触发器碰撞检测
   * @returns false表示触发器碰撞后需要销毁
   */
  private updateCollision(): boolean {
    // 检测与墙壁的碰撞，如果发生碰撞返回false
    if (this.detectCollisionWithWalls()) {
      return false
    }

    // 如果过去时间小于初始延时，或超时，则不会触发角色碰撞，返回true
    if (this.elapsed < this.initialDelay || this.elapsed >= this.timeout) return true

    // 获取碰撞角色列表(共享列表，用count表示长度)
    const targets = this.getActorsByCollision(this.x, this.y, this.angle, this.scale, this.shape as any)
    if (targets.count > 0) {
      // 通过选择器进一步筛选目标角色
      Trigger.getActorsBySelector(this.caster, this.selector)

      // 更新时间列表
      this.updateTimeList()

      // 获取命中的角色
      this.getActorsByHitMode()

      // 触发对应事件
      if (targets.count > 0) {
        const cmd1 = this.events.hitactor
        const {caster, target, skill} = this
        const {count} = targets
        for (let i = 0; i < count; i++) {
          const actor = targets[i]!
          // 更新角色受击时间戳
          actor.updateHitTimestamp()
          const cmd2 = actor.events.hittrigger
          if (cmd2 !== undefined) {
            // 发送目标角色的击中触发器事件
            const event = new EventHandler(cmd2)
            event.parent = actor
            event.triggerObject = this
            event.triggerActor = actor
            event.selfVarId = actor.selfVarId
            if (caster instanceof Actor) {
              event.casterActor = caster
            }
            if (skill instanceof Skill) {
              event.triggerSkill = skill
            }
            // 不需要对事件进行入栈和出栈
            // 不需要异步添加事件到更新器列表
            if (event.update(0) === false) {
              actor.updaters.add(event)
              event.onFinish(() => {
                Callback.push(() => {
                  actor.updaters.remove(event)
                })
              })
            }
          }
          // 同时发送脚本事件
          actor.script.getEvents('hittrigger')?.call(new ScriptTriggerHitEvent(actor, this))
          if (cmd1 !== undefined) {
            // 发送触发器的击中角色事件
            const event = new EventHandler(cmd1)
            event.parent = this
            event.triggerObject = this
            event.triggerActor = actor
            if (caster instanceof Actor) {
              event.casterActor = caster
            }
            if (target instanceof Actor) {
              event.targetActor = target
            }
            if (skill instanceof Skill) {
              event.triggerSkill = skill
            }
            // 不需要对事件进行入栈和出栈
            // 不需要异步添加事件到更新器列表
            if (event.update(0) === false) {
              actor.updaters.add(event)
              event.onFinish(() => {
                Callback.push(() => {
                  actor.updaters.remove(event)
                })
              })
            }
          }
          // 同时发送脚本事件
          this.script.getEvents('hitactor')?.call(new ScriptTriggerHitEvent(actor, this))
        }
        // 如果击中次数不够，返回false
        if ((this.hitCount -= count) <= 0) {
          return false
        }
      }
    } else {
      // 更新时间列表
      this.updateTimeList()
    }
    return true
  }

  /**
   * 更新触发器动画播放进度
   * @param deltaTime 增量时间(毫秒)
   */
  public updateAnimation(deltaTime: number): void {
    const {animation} = this
    // 如果不存在动画，返回
    if (animation === null) return
    if (animation.redirect) {
      // 如果开启了动画方向计算
      this.calculateAnimDirection()
    } else if (animation.rotatable) {
      // 如果开启了动画旋转，调整旋转角度
      animation.rotation = this.angle
    }
    // 更新动画
    animation.update(deltaTime)
  }

  /** 计算触发器的动画方向 */
  private calculateAnimDirection(): void {
    const animation = this.animation!
    // 设置默认动画方向为技能释放者的动画方向
    if (!animation.casterDirSync) {
      animation.casterDirSync = true
      const casterDir = this.caster?.animation?.direction
      if (typeof casterDir === 'number' && casterDir >= 0) {
        animation.setDirection(casterDir)
      }
    }
    // 设置触发器动画角度
    animation.setAngle(this.angle)
  }

  /** 移除触发器 */
  public remove(): void {
    this.destroy()
    // 延迟从触发器列表中移除自己
    Callback.push(() => {
      Scene.trigger.remove(this)
    })
  }

  /**
   * 调用触发器事件
   * @param type 触发器事件类型
   */
  public callEvent(type: string): void {
    const commands = this.events[type]
    if (commands) {
      const event = new EventHandler(commands)
      event.parent = this
      event.triggerObject = this
      if (this.caster instanceof Actor) {
        event.triggerActor = this.caster
        event.casterActor = this.caster
      }
      if (this.target instanceof Actor) {
        event.targetActor = this.target
      }
      if (this.skill instanceof Skill) {
        event.triggerSkill = this.skill
      }
      EventHandler.call(event, this.updaters)
    }
  }

  /**
   * 调用触发器事件和脚本
   * @param type 触发器事件类型
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

  /** 销毁触发器 */
  public destroy(): void {
    if (!this.destroyed) {
      this.emit('destroy')
      this.destroyed = true
      this.parent?.remove(this)
      this.animation?.destroy()
    }
  }

  /** 异步销毁触发器 */
  public destroyAsync(): void {
    Callback.push(() => {
      this.destroy()
    })
  }

  /** 最近创建触发器 */
  public static latest?: Trigger
  /** 临时角色列表 */
  private static actors: CacheList<Actor> = CacheList.instance
  /** 是否与角色形状发生碰撞 */
  public static collideWithActorShape: boolean = false

  /** 初始化 */
  public static initialize(): void {
    this.collideWithActorShape = Data.config.collision.trigger.collideWithActorShape
  }

  /**
   * 获取指定选择器筛选的角色
   * 存放到角色缓存列表
   * @param caster 技能施放角色
   * @param selector 选择器对象
   */
  private static getActorsBySelector(caster: Actor | null, selector: ActorSelector): void {
    const actors = this.actors
    let count = 0
    if (caster) {
      const inspector = Actor.inspectors[selector]
      const length = actors.count
      for (let i = 0; i < length; i++) {
        const actor = actors[i]!
        if (inspector(caster, actor)) {
          actors[count++] = actor
        }
      }
    }
    actors.count = count
  }

  // 触发器角色获取器
  private static actorGetters = new class ActorGetters {
    /**
     * 获取矩形碰撞区域中的角色
     * @param x 触发器位置X
     * @param y 触发器位置Y
     * @param angle 触发器角度(弧度)
     * @param scale 触发器缩放系数
     * @param shape 触发器形状参数对象
     * @returns 角色缓存列表
     */
    'rectangle' = (x: number, y: number, angle: number, scale: number, shape: TriggerShapeRectangle): CacheList<Actor> => {
      let count = 0
      const targets = Trigger.actors
      const width = shape.width * scale
      const height = shape.height * scale
      const anchor = shape.anchor
      const cos = Math.cos(angle)
      const sin = Math.sin(angle)
      const left = -width * anchor
      const top = -height / 2
      const right = width + left
      const bottom = height / 2
      // 计算矩形触发区域的四个顶点位置
      const x1 = left * cos - top * sin
      const y1 = left * sin + top * cos
      const x2 = left * cos - bottom * sin
      const y2 = left * sin + bottom * cos
      const x3 = right * cos - top * sin
      const y3 = right * sin + top * cos
      const x4 = right * cos - bottom * sin
      const y4 = right * sin + bottom * cos
      const tl = x + Math.min(x1, x2, x3, x4)
      const tt = y + Math.min(y1, y2, y3, y4)
      const tr = x + Math.max(x1, x2, x3, x4)
      const tb = y + Math.max(y1, y2, y3, y4)
      const expansion = Trigger.collideWithActorShape ? Scene.binding!.maxColliderHalf : 0
      // 获取矩形触发区域所在的角色分区列表
      const cells = Scene.actor.partition.get(
        tl - expansion,
        tt - expansion,
        tr + expansion,
        tb + expansion,
      )
      const length = cells.count
      for (let i = 0; i < length; i++) {
        const actors = cells[i]!
        const length = actors.length
        for (let i = 0; i < length; i++) {
          const actor = actors[i] as Actor
          // 如果角色已激活
          if (actor.active) {
            if (Trigger.collideWithActorShape) {
              switch (actor.collider.shape) {
                case 'circle': {
                  // 计算角色的相对位置
                  const rx = actor.x - x
                  const ry = actor.y - y
                  // 以触发区域中心为锚点
                  // 逆旋转角色的相对位置
                  const ox = rx * cos + ry * sin
                  const oy = ry * cos - rx * sin
                  const closestX = Math.clamp(ox, left, right)
                  const closestY = Math.clamp(oy, top, bottom)
                  if ((ox - closestX) ** 2 + (oy - closestY) ** 2 < actor.collider.half ** 2) {
                    targets[count++] = actor
                  }
                  continue
                }
                case 'square': {
                  // 投影 - 1
                  const ah = actor.collider.half
                  if (actor.x - ah >= tr || actor.x + ah <= tl || actor.y - ah >= tb || actor.y + ah <= tt) {
                    continue
                  }
                  // 投影 - 2
                  const al = actor.x - x - ah
                  const at = actor.y - y - ah
                  const ar = actor.x - x + ah
                  const ab = actor.y - y + ah
                  const x1 = al * cos + at * sin
                  const y1 = at * cos - al * sin
                  const x2 = al * cos + ab * sin
                  const y2 = ab * cos - al * sin
                  const x3 = ar * cos + ab * sin
                  const y3 = ab * cos - ar * sin
                  const x4 = ar * cos + at * sin
                  const y4 = at * cos - ar * sin
                  const rl = Math.min(x1, x2, x3, x4)
                  const rt = Math.min(y1, y2, y3, y4)
                  const rr = Math.max(x1, x2, x3, x4)
                  const rb = Math.max(y1, y2, y3, y4)
                  if (rl >= right || rr <= left || rt >= bottom || rb <= top) {
                    continue
                  }
                  targets[count++] = actor
                  continue
                }
              }
            } else {
              // 计算角色的相对位置
              const rx = actor.x - x
              const ry = actor.y - y
              // 以触发区域中心为锚点
              // 逆旋转角色的相对位置
              const ox = rx * cos + ry * sin
              const oy = ry * cos - rx * sin
              // 如果角色的锚点位于矩形触发区域中，则添加到目标列表中
              if (ox >= left && ox < right && oy >= top && oy < bottom) {
                targets[count++] = actor
              }
            }
          }
        }
      }
      targets.count = count
      return targets
    }

    /**
     * 获取圆形碰撞区域中的角色
     * @param x 触发器位置X
     * @param y 触发器位置Y
     * @param angle 触发器角度(弧度)
     * @param scale 触发器缩放系数
     * @param shape 触发器形状参数对象
     * @returns 角色缓存列表
     */
    'circle' = (x: number, y: number, angle: number, scale: number, shape: TriggerShapeCircle): CacheList<Actor> => {
      let count = 0
      const targets = Trigger.actors
      const radius = shape.radius * scale
      const expansion = Trigger.collideWithActorShape ? Scene.binding!.maxColliderHalf : 0
      // 获取圆形触发区域所在的角色分区列表
      const cells = Scene.actor.partition.get(
        x - radius - expansion,
        y - radius - expansion,
        x + radius + expansion,
        y + radius + expansion,
      )
      const length = cells.count
      for (let i = 0; i < length; i++) {
        const actors = cells[i]!
        const length = actors.length
        for (let i = 0; i < length; i++) {
          const actor = actors[i] as Actor
          // 如果角色已激活
          if (actor.active) {
            if (Trigger.collideWithActorShape) {
              switch (actor.collider.shape) {
                case 'circle':
                  if ((x - actor.x) ** 2 + (y - actor.y) ** 2 < (radius + actor.collider.half) ** 2) {
                    targets[count++] = actor
                  }
                  continue
                case 'square':
                  const ox = x - actor.x
                  const oy = y - actor.y
                  const half = actor.collider.half
                  const closestX = Math.clamp(ox, -half, half)
                  const closestY = Math.clamp(oy, -half, half)
                  if ((ox - closestX) ** 2 + (oy - closestY) ** 2 < radius ** 2) {
                    targets[count++] = actor
                  }
                  continue
              }
            } else {
              // 如果角色的锚点位于圆形触发区域中，则添加到目标列表中
              if ((x - actor.x) ** 2 + (y - actor.y) ** 2 < radius ** 2) {
                targets[count++] = actor
              }
            }
          }
        }
      }
      targets.count = count
      return targets
    }

    /**
     * 获取扇形碰撞区域中的角色
     * @param x 触发器位置X
     * @param y 触发器位置Y
     * @param angle 触发器角度(弧度)
     * @param scale 触发器缩放系数
     * @param shape 触发器形状参数对象
     * @returns 角色缓存列表
     */
    'sector' = (x: number, y: number, angle: number, scale: number, shape: TriggerShapeSector): CacheList<Actor> => {
      let count = 0
      const targets = Trigger.actors
      const radius = shape.radius * scale
      const cos = Math.cos(angle)
      const sin = Math.sin(angle)
      const expansion = Trigger.collideWithActorShape ? Scene.binding!.maxColliderHalf : 0
      // 获取圆形触发区域所在的角色分区列表
      const cells = Scene.actor.partition.get(
        x - radius - expansion,
        y - radius - expansion,
        x + radius + expansion,
        y + radius + expansion,
      )
      const length = cells.count
      for (let i = 0; i < length; i++) {
        const actors = cells[i]!
        const length = actors.length
        for (let i = 0; i < length; i++) {
          const actor = actors[i] as Actor
          // 如果角色已激活
          if (actor.active) {
            const rx = actor.x - x
            const ry = actor.y - y
            if (Trigger.collideWithActorShape) {
              switch (actor.collider.shape) {
                case 'circle': {
                  const square = rx ** 2 + ry ** 2
                  const half = actor.collider.half
                  if (square < (radius + half) ** 2) {
                    const centralAngle = Math.radians(shape.centralAngle)
                    const angle1 = angle - centralAngle / 2
                    const angle2 = angle + centralAngle / 2
                    const angle3 = centralAngle + Math.PI / 2
                    const angle4 = Math.PI * 1.5
                    const angle5 = Math.PI + centralAngle / 2
                    const relativeAngle = Math.modRadians(Math.atan2(ry, rx) - angle1)
                    // 如果角色位于扇形区域内，则添加到目标列表中
                    if (relativeAngle <= centralAngle) {
                      targets[count++] = actor
                    } else if (
                      relativeAngle >= angle3 &&
                      relativeAngle <= angle4) {
                      if (square < half ** 2) {
                        targets[count++] = actor
                      }
                    } else {
                      const angle = relativeAngle > angle5 ? angle1 : angle2
                      const cos = Math.cos(angle)
                      const sin = Math.sin(angle)
                      const ox = rx * cos + ry * sin
                      const oy = ry * cos - rx * sin
                      const px = ox < radius ? ox : radius
                      if ((px - ox) ** 2 + oy ** 2 < half ** 2) {
                        targets[count++] = actor
                      }
                    }
                  }
                  continue
                }
                case 'square': {
                  const ox = x - actor.x
                  const oy = y - actor.y
                  const half = actor.collider.half
                  const closestX = Math.clamp(ox, -half, half)
                  const closestY = Math.clamp(oy, -half, half)
                  if ((ox - closestX) ** 2 + (oy - closestY) ** 2 < radius ** 2) {
                    // 以触发区域中心为锚点
                    // 逆旋转角色的相对位置
                    const ox = rx * cos + ry * sin
                    const oy = ry * cos - rx * sin
                    const angle0 = Math.atan2(oy, ox)
                    const centralAngle = Math.radians(shape.centralAngle)
                    const halfAngle = centralAngle / 2
                    // 如果角色位于扇形区域内，则添加到目标列表中
                    if (angle0 > -halfAngle && angle0 < halfAngle) {
                      targets[count++] = actor
                    } else {
                      const ox = actor.x - x
                      const oy = actor.y - y
                      const ol = ox - half
                      const ot = oy - half
                      const or = ox + half
                      const ob = oy + half
                      const angle1 = Math.modRadians(Math.atan2(ot, ol) - angle + halfAngle)
                      const angle2 = Math.modRadians(Math.atan2(ob, ol) - angle + halfAngle)
                      const angle3 = Math.modRadians(Math.atan2(ob, or) - angle + halfAngle)
                      const angle4 = Math.modRadians(Math.atan2(ot, or) - angle + halfAngle)
                      if (Math.min(angle1, angle2, angle3, angle4) < centralAngle) {
                        targets[count++] = actor
                      }
                    }
                  }
                  continue
                }
              }
            } else {
              // 如果角色的锚点位于圆形触发区域中
              if (rx ** 2 + ry ** 2 < radius ** 2) {
                // 以触发区域中心为锚点
                // 逆旋转角色的相对位置
                const ox = rx * cos + ry * sin
                const oy = ry * cos - rx * sin
                const angle = Math.degrees(Math.atan2(oy, ox))
                const halfAngle = shape.centralAngle / 2
                // 如果角色位于扇形区域内，则添加到目标列表中
                if (angle > -halfAngle && angle < halfAngle) {
                  targets[count++] = actor
                }
              }
            }
          }
        }
      }
      targets.count = count
      return targets
    }
  }

  // 检测与墙壁的碰撞
  private static detectCollisionWithWalls = new class DetectCollisionWithWalls {
    /**
     * 检测与墙壁的碰撞 - 穿透
     * @returns 不发生碰撞
     */
    'penetrate' = (): false => false

    /**
     * 检测与墙壁的碰撞 - 销毁
     * @returns 是否发生了碰撞
     */
    'destroy' = function (this: Trigger): boolean {
      return !this.parent!.scene.isInLineOfSight(this.lastX, this.lastY, this.x, this.y)
    }
  }

  // 碰撞过滤器
  private static collisionFilters = new class CollisionFilters {
    /**
     * 碰撞过滤器 - 一次
     * @returns 角色缓存列表
     */
    'once' = function (this: Trigger): CacheList<Actor> {
      let count = 0
      const actors = Trigger.actors
      const hitList = this.hitList
      const length = actors.count
      for (let i = 0; i < length; i++) {
        const actor = actors[i] as Actor
        // 如果角色未在碰撞列表中，添加它
        if (!hitList.includes(actor)) {
          actors[count++] = actor
          hitList.push(actor)
        }
      }
      actors.count = count
      return actors
    }

    /** 碰撞过滤器 - 碰撞期间一次 */
    'once-on-overlap' = this.once

    /**
     * 碰撞过滤器 - 重复
     * @returns 角色缓存列表
     */
    'repeat' = function (this: Trigger): CacheList<Actor> {
      let count = 0
      const actors = Trigger.actors
      const time = this.elapsed
      const hitInterval = this.hitInterval
      const hitList = this.hitList
      const timeList = this.timeList
      const length = actors.count
      for (let i = 0; i < length; i++) {
        const actor = actors[i] as Actor
        const index = hitList.indexOf(actor)
        // 如果角色未在碰撞列表中，添加它
        if (index === -1) {
          actors[count++] = actor
          hitList.push(actor)
          timeList.push(time)
          continue
        }
        // 如果已经过了碰撞间隔，可以再次碰撞
        const elapsed = time - timeList[index]
        if (elapsed >= hitInterval) {
          timeList[index] += hitInterval
          actors[count++] = actor
          continue
        }
      }
      actors.count = count
      return actors
    }
  }

  // 击中列表更新器
  private static hitListUpdaters = new class HitListUpdaters {
    /** 击中列表更新器 - 一次 */
    'once' = Function.empty

    /** 击中列表更新器 - 碰撞期间一次 */
    'once-on-overlap' = function (this: Trigger): void {
      if (this.hitList.length > 0) {
        const actors = Trigger.actors
        const count = actors.count
        const hitList = this.hitList
        let i = hitList.length
        outer: while (--i >= 0) {
          const actor = hitList[i]
          // 如果已碰撞的角色还在本轮目标列表中，继续
          for (let i = 0; i < count; i++) {
            if (actors[i] === actor) {
              continue outer
            }
          }
          // 已碰撞的角色已经脱离触发器，移除
          hitList.splice(i, 1)
        }
      }
    }

    /** 击中列表更新器 - 重复 */
    'repeat' = function (this: Trigger): void {
      if (this.hitList.length > 0) {
        const actors = Trigger.actors
        const count = actors.count
        const time = this.elapsed
        const hitInterval = this.hitInterval
        const hitList = this.hitList
        const timeList = this.timeList
        let i = hitList.length
        outer: while (--i >= 0) {
          const actor = hitList[i]
          // 如果已碰撞的角色还在本轮目标列表中，继续
          for (let i = 0; i < count; i++) {
            if (actors[i] === actor) {
              continue outer
            }
          }
          // 已碰撞的角色已经脱离触发器
          // 且已经过了碰撞间隔，移除
          if (time - timeList[i] >= hitInterval) {
            hitList.splice(i, 1)
            timeList.splice(i, 1)
          }
        }
      }
    }
  }
}