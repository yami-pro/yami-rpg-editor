/*
@plugin #plugin
@version 1.0
@author
@link
@desc #desc

@option operation {'enable', 'disable', 'switch'}
@alias #operation {#enable, #disable, #switch}

@lang en
#plugin Switch Movement Path
#desc A Command for Movement Path Plugin
#operation Operation
#enable Enable
#disable Disable
#switch Switch

@lang ru
#plugin Изменить траекторию движения
#desc Команда для плагина Траектории перемещения
#operation Операция
#enable Включить
#disable Выключить
#switch Переключить

@lang zh
#plugin 开关移动路径
#desc 移动路径插件的相关指令
#operation 操作
#enable 开启
#disable 关闭
#switch 切换
*/

export default class SwitchMovementPath implements Script<Command> {
  // 接口属性
  operation!: 'enable' | 'disable' | 'switch'

  call(): void {
    PluginManager.MovementPath?.[this.operation]()
  }
}