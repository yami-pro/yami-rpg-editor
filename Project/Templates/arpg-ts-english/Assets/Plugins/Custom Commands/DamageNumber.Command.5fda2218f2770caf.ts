/*
@plugin #plugin
@version 1.0
@author
@link
@desc #desc

@actor-getter actor
@alias #actor

@option style {0, 1, 2, 3, 4, 5}
@alias #style

@variable-number damage
@alias #damage

@lang en
#plugin Popup Damage Number
#desc A Command for Damage Number Plugin
#actor Target Actor
#style Style
#damage Damage Value

@lang ru
#plugin Всплывающие цифры повреждений
#desc Инструкция по использованию подключаемого модуля числового повреждения
#actor Актер
#style Стиль
#damage Величина ущерба

@lang zh
#plugin 弹出伤害数字
#desc 伤害数字插件的相关指令
#actor 目标角色
#style 样式
#damage 伤害值
*/

export default class PopupDamageNumber implements Script<Command> {
  actor?: Actor
  style!: 0 | 1 | 2 | 3 | 4 | 5
  damage!: number

  call(): void {
    if (this.actor && typeof this.damage === 'number') {
      PluginManager.DamageNumber?.popup(this.actor, this.style, this.damage)
    }
  }
}