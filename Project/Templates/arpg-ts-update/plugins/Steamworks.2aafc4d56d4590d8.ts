/*
@plugin #plugin
@version 1.0.0
@author
@link
@desc #desc

@number appId
@alias #appId
@desc #appId-desc
@clamp 1 100000000

@boolean verify
@alias #verify
@desc #verify-desc
@default true

@lang en
#plugin Steamworks
#desc
STEAM game platform API, including:
Achievement system, get the user's software and DLC purchase status, anti-piracy features...

Script methods:
PluginManager.Steamworks.achievement.activate(name)
PluginManager.Steamworks.achievement.clear(name)
PluginManager.Steamworks.achievement.isActivated(name)
PluginManager.Steamworks.apps.isAppInstalled(appId)
PluginManager.Steamworks.apps.isDlcInstalled(dlcId)
#appId App ID
#appId-desc The ID of your game in steamworks
#verify Verify App
#verify-desc After deployment, if steam is not running or the game is not in the library, force quit the game.

@lang ru
#plugin Мастерская Стим
#desc
API игровой платформы STEAM, включая:
Система достижений, получение статуса покупки ПО и DLC пользователем, функция борьбы с пиратством...

Методы написания сценариев:
PluginManager.Steamworks.achievement.activate(name)
PluginManager.Steamworks.achievement.clear(name)
PluginManager.Steamworks.achievement.isActivated(name)
PluginManager.Steamworks.apps.isAppInstalled(appId)
PluginManager.Steamworks.apps.isDlcInstalled(dlcId)
#appId ID приложение
#appId-desc Идентификатор вашей игры в Steamworks
#verify Проверить приложение
#verify-desc После установки, если Steam не работает или игры нет в библиотеке, принудительно закройте игру.

@lang zh
#plugin Steamworks
#desc
STEAM游戏平台API，包括：
成就系统、获取用户的软件和DLC购买状态，防盗版功能...

脚本方法:
PluginManager.Steamworks.achievement.activate(name)
PluginManager.Steamworks.achievement.clear(name)
PluginManager.Steamworks.achievement.isActivated(name)
PluginManager.Steamworks.apps.isAppInstalled(appId)
PluginManager.Steamworks.apps.isDlcInstalled(dlcId)
#appId 应用ID
#appId-desc 你的游戏在steamworks中的ID
#verify 验证应用
#verify-desc 部署后，如果未登录STEAM或游戏不在库中，则强制退出。
*/

export default class Steamworks {
  // 接口属性
  appId!: number
  verify!: boolean

  onStart(): void {
    if (window.process) {
      try {
        const steamworks = require(this.getSteamworksPath())
        const client = steamworks.init(this.appId)
        Object.setPrototypeOf(this, client)
      } catch (error) {
        if (Stats.debug) {
          console.error(error)
        } else if (this.verify) {
          window.close()
        }
      }
    }
  }

  /**
   * 获取steamworks路径
   * @returns 路径字符串
   */
  getSteamworksPath(): string {
    if (Stats.debug) {
      let match
      const regexp = /^--app-path=(.+)$/
      for (const arg of process.argv) {
        if (match = arg.match(regexp)) {
          return require('path').resolve(match[1], 'node_modules', 'steamworks.js')
        }
      }
    }
    return 'steamworks.js'
  }
}