/*
@plugin #plugin
@version 1.0.0
@author
@link
@desc #desc

@option operation {
  'activate-achievement',
  'clear-achievement',
  'is-achievement-activated',
  'is-app-installed',
  'is-dlc-installed',
}
@alias #operation {
  #activate-achievement,
  #clear-achievement,
  #is-achievement-activated,
  #is-app-installed,
  #is-dlc-installed,
}

@string achievementName
@alias #achievementName
@desc #achievementName-desc
@cond operation {
  'activate-achievement',
  'clear-achievement',
  'is-achievement-activated',
}

@number appId
@alias #appId
@desc #appId-desc
@cond operation {
  'is-app-installed',
  'is-dlc-installed',
}
@clamp 1 100000000

@variable-setter queryResult
@alias #queryResult
@desc #queryResult-desc
@cond operation {
  'is-achievement-activated',
  'is-app-installed',
  'is-dlc-installed',
}

@lang en
#plugin Steamworks API
#desc A Command for Steamworks Plugin
#operation Operation
#activate-achievement Activate Achievement
#clear-achievement Clear Achievement
#is-achievement-activated Is Achievement Activated
#is-app-installed Is App Installed
#is-dlc-installed Is Dlc Installed
#achievementName Achievement Name
#achievementName-desc The "API Name" of the achievement
#appId App/DLC ID
#appId-desc The ID of the application or DLC to be queried
#queryResult Query Result
#queryResult-desc Return type (Boolean)

@lang ru
#plugin Steamworks API
#desc Команда для плагина Steamworks
#operation Операция
#activate-achievement Активируйте достижение
#clear-achievement Отменить достижение
#is-achievement-activated Достижения активированны?
#is-app-installed Приложение установлено?
#is-dlc-installed Установлен ли DLC?
#achievementName Назв. достижения 
#achievementName-desc Название "API Name" достижения
#appId ID Приложения/DLC 
#appId-desc ID Идентификатор запрашиваемого приложения или DLC
#queryResult Результат запроса
#queryResult-desc Возвращаемый тип (логическое значение)

@lang zh
#plugin Steamworks API
#desc Steamworks插件的相关指令
#operation 操作
#activate-achievement 激活成就
#clear-achievement 取消成就
#is-achievement-activated 判断成就是否已激活
#is-app-installed 判断应用是否已安装
#is-dlc-installed 判断DLC是否已安装
#achievementName 成就名称
#achievementName-desc 成就的“API名称”
#appId 应用/DLC ID
#appId-desc 查询的应用或DLC的ID
#queryResult 查询结果
#queryResult-desc 返回值类型(布尔值)
*/

export default class SteamworksAPI implements Script<Command> {
  // 接口属性
  operation!: string
  achievementName!: string
  appId!: number
  queryResult?: VariableSetter

  call(): void {
    switch (this.operation) {
      case 'activate-achievement':
        return PluginManager.Steamworks?.achievement?.activate(this.achievementName)
      case 'clear-achievement':
        return PluginManager.Steamworks?.achievement?.clear(this.achievementName)
      case 'is-achievement-activated':
        return this.queryResult?.set(PluginManager.Steamworks?.achievement?.isActivated(this.achievementName) ?? false)
      case 'is-app-installed':
        return this.queryResult?.set(PluginManager.Steamworks?.apps?.isAppInstalled(this.appId) ?? false)
      case 'is-dlc-installed':
        return this.queryResult?.set(PluginManager.Steamworks?.apps?.isDlcInstalled(this.appId) ?? false)
    }
  }
}