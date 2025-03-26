/*
@plugin #plugin
@version 1.0
@author
@link
@desc #desc

@position-getter position
@alias #position

@lang en
#plugin Set Map Marker
#desc A Command for Map Marker Plugin
#position Target Position

@lang ru
#plugin Установить маркер на карте
#desc Команда для плагина Map Marker
#position Целевая позиция

@lang zh
#plugin 设置地图标记
#desc 地图标记插件的相关指令
#position 目标位置
*/

export default class SetMapMarker implements Script<Command> {
  // 接口属性
  position?: Point

  call(): void {
    if (this.position) {
      const {x, y} = this.position
      PluginManager.MapMarker?.set(x, y)
    }
  }
}