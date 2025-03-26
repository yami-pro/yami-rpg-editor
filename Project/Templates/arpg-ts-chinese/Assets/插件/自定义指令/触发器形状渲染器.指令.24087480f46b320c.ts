/*
@plugin #plugin
@version 1.0
@author
@link
@desc #desc

@option operation {'enable', 'disable', 'switch'}
@alias #operation {#enable, #disable, #switch}

@lang en
#plugin Switch Trigger Shape Renderer
#desc A Command for Trigger Shape Renderer Plugin
#operation Operation
#enable Enable
#disable Disable
#switch Switch

@lang ru
#plugin Переключатель триггера рендеринга фигур
#desc Команда для запуска плагина рендеринга форм
#operation Операция
#enable Включить
#disable Выключить
#switch Переключить

@lang zh
#plugin 开关触发器形状渲染
#desc 触发器形状渲染器插件的相关指令
#operation 操作
#enable 开启
#disable 关闭
#switch 切换
*/

export default class SwitchTriggerShapeRenderer implements Script<Command> {
  // 接口属性
  operation!: 'enable' | 'disable' | 'switch'

  call(): void {
    PluginManager.TriggerShapeRenderer?.[this.operation]()
  }
}