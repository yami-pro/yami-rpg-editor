/*
@plugin #plugin
@version 1.0
@author
@link
@desc #desc

@lang en
#plugin Exit the Game
#desc For desktop application mode

@lang ru
#plugin Выход из игры
#desc Только для настольных ПК

@lang zh
#plugin 退出游戏
#desc 桌面应用模式专用
*/

export default class ExitTheGame implements Script<Command> {
  call(): void {
    if (Stats.shell === 'electron') {
      window.close()
    }
  }
}