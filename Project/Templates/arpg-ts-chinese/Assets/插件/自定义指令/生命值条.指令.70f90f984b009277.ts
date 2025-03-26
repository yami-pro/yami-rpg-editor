/*
@plugin #plugin
@version 1.0
@author
@link
@desc #desc

@option operation {'enable', 'disable', 'switch'}
@alias #operation {#enable, #disable, #switch}

@lang en
#plugin Switch Health Bar
#desc A Command for Health Bar Plugin
#operation Operation
#enable Enable
#disable Disable
#switch Switch

@lang ru
#plugin Переключить панель здоровья
#desc Команда для плагина Health Bar
#operation Операция
#enable Включить
#disable Выключить
#switch Переключить

@lang zh
#plugin 开关生命值条
#desc 生命值条插件的相关指令
#operation 操作
#enable 开启
#disable 关闭
#switch 切换
*/

export default class SwitchHealthBar implements Script<Command> {
  // 接口属性
  operation!: 'enable' | 'disable' | 'switch'

  call(): void {
    PluginManager.HealthBar?.[this.operation]()
  }
}