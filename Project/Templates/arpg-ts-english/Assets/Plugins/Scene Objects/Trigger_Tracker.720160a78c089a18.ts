/*
@plugin #plugin
@version 1.0
@author
@link
@desc #desc

@number range
@alias #range
@clamp 1 100
@default 10

@number angularSpeed
@alias #angularSpeed
@clamp 0 3600
@default 90

@number angularSpeedDev
@alias #angularSpeedDev
@clamp 0 360

@lang en
#plugin Trigger - Tracker
#desc Automatically find and follow nearby targets
#range Detection Range
#angularSpeed Angular Speed
#angularSpeedDev Angular Speed Dev

@lang ru
#plugin Триггер - Отслеживания
#desc Автоматически находить близлежащие цели и следить за ними
#range Даль. обнаружения
#angularSpeed Скор. вращ
#angularSpeedDev Отклонение

@lang zh
#plugin 触发器 - 追踪器
#desc 自动寻找并跟随附近的目标
#range 锁定范围
#angularSpeed 角速度
#angularSpeedDev 角速度偏差
*/

export default class Trigger_Tracker implements Script<Trigger> {
  // 接口属性
  range!: number
  angularSpeed!: number
  angularSpeedDev!: number

  // 脚本属性
  trigger!: Trigger
  target!: Actor

  onStart(trigger: Trigger): void {
    if (!trigger.caster) {
      this.update = Function.empty
      return
    }
    this.trigger = trigger
    const dev = this.vary(this.angularSpeedDev)
    const angle = Math.max(this.angularSpeed + dev, 0)
    this.angularSpeed = Math.radians(angle)
    this.searchTarget()
  }

  update(): void {
    let target = this.target
    if (!target.active) {
      this.searchTarget()
      target = this.target
      if (!target) return
    }
    const trigger = this.trigger
    const distX = target.x - trigger.x
    const distY = target.y - trigger.y
    const sAngle = trigger.angle
    const dAngle = Math.atan2(distY, distX)
    const iAngle = dAngle - sAngle
    const diff = Math.abs(iAngle)
    if (diff < 0.0001) return
    const angle = Math.modRadians(iAngle)
    const step = Math.min(this.angularSpeed * trigger.deltaTime / 1000, diff)
    trigger.angle += angle < Math.PI ? step : -step
    trigger.updateVelocity()
  }

  /**
   * 计算离散率
   * @param variance 离散度
   * @returns 随机离散值(-variance ~ + variance)
   */
  vary(variance: number): number {
    return variance === 0 ? 0 : variance * (Math.random() - Math.random())
  }

  /** 搜索目标 */
  searchTarget(): void {
    const range = this.range
    const trigger = this.trigger
    const caster = trigger.caster!
    const inspector = Actor.inspectors[trigger.selector]
    const targets = CacheList.instance as CacheList<Actor>
    const {x, y} = caster
    const left = x - range
    const top = y - range
    const right = x + range
    const bottom = y + range
    const cells = Scene.actor.partition.get(left, top, right, bottom)
    const count = cells.count
    const rangeSquared = range ** 2
    let targetCount = 0
    for (let i = 0; i < count; i++) {
      const actors = cells[i]!
      const length = actors.length
      for (let i = 0; i < length; i++) {
        const actor = actors[i] as Actor
        if (actor.active && inspector(caster, actor)) {
          const distSquared = (x - actor.x) ** 2 + (y - actor.y) ** 2
          if (distSquared < rangeSquared) {
            targets[targetCount++] = actor
          }
        }
      }
    }
    if (targetCount !== 0) {
      const index = Math.floor(Math.random() * targetCount)
      this.target = targets[index]!
    } else {
      trigger.updaters.remove(this)
    }
  }
}