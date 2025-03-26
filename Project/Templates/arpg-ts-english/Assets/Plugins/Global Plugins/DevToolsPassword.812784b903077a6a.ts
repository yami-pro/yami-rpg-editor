/*
@plugin #plugin
@version
@author
@link
@desc #desc

@string codes
@alias #codes
@default '9527'

@lang en
#plugin Developer Tools Startup Password
#desc Enter password to open the developer tools after deployment
#codes Password


@lang ru
#plugin Пароль для запуска инструментов разработчика
#desc Введите пароль, чтобы открыть инструменты разработчика после развертывания
#codes пароль


@lang zh
#plugin 开发者工具启动密码
#desc 部署后输入密码打开开发者工具
#codes 密码
*/

export default class DevTools implements Script<Plugin> {
  codes!: string

  onStart(): void {
    const chars = this.codes.split('')
    for (let i = 0; i < chars.length; i++) {
      chars[i] = chars[i].trim().toLowerCase()
    }
    let index = 0;
    window.on('keydown', event => {
      if (document.activeElement !== document.body) {
        index = 0
      } else {
        switch (event.key) {
          case chars[index]:
            if (++index === chars.length) {
              index = 0
              require('electron').ipcRenderer.send('open-devTools')
            }
            break
          case chars[0]:
            index = 1
            break
          default:
            index = 0
            break
        }
      }
    })
  }
}