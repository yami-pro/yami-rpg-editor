/*
@plugin #plugin
@version 1.0
@author
@link
@desc #desc

@lang en
#plugin Trigger - Bind Caster
#desc Always in the same position as the skill casting actor

@lang ru
#plugin Триггер - Применить Навык
#desc Всегда находится в той же позиции, что и заклинатель

@lang zh
#plugin 触发器 - 绑定技能施放角色
#desc 总是和技能施放角色处于同一个位置
*/

export default class Trigger_BindActor implements Script<Trigger> {
  trigger: Trigger

  constructor(trigger: Trigger) {
    this.trigger = trigger
  }

  update(): void {
    const trigger = this.trigger
    const caster = trigger.caster
    if (caster) {
      trigger.x = caster.x
      trigger.y = caster.y
    }
  }
}