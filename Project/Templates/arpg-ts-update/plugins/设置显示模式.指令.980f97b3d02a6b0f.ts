/*
@plugin #plugin
@version 1.0
@author
@link
@desc #desc

@option display {'windowed', 'maximized', 'fullscreen'}
@alias #display {#windowed, #maximized, #fullscreen}

@lang en
#plugin Set Display Mode
#desc Set the display mode of the application
#display Display
#windowed Windowed
#maximized Maximized
#fullscreen Fullscreen

@lang ru
#plugin Установите режим отображения
#desc Установите режим отображения приложения
#display Отобразить
#windowed В окне
#maximized Развернуть окно
#fullscreen Полный экран

@lang zh
#plugin 设置显示模式
#desc 设置应用的显示模式
#display 显示模式
#windowed 窗口模式
#maximized 窗口最大化
#fullscreen 全屏
*/

export default class SwitchWindowDisplay implements Script<Command> {
  // 接口属性
  display!: 'windowed' | 'maximized' | 'fullscreen'

  call(): void {
    if (window.process) {
      Data.config.window.display = this.display
      const path = Loader.route('Data/config.json')
      const json = JSON.stringify(Data.config, null, 2)
      Data.writeFile(path, json)
      require('electron').ipcRenderer.send('set-display-mode', this.display)
    }
  }
}