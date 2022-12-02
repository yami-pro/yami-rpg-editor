'use strict'

// ******************************** 组合键访问器 ********************************

// Chromium系的浏览器支持
interface INavigator extends Navigator {
  userAgentData: { platform: string }
}

// 获取Ctrl组合键名称
const ctrl = (<INavigator>navigator).userAgentData.platform === 'macOS'
? function (keyName: string) {return '⌘+' + keyName}
: function (keyName: string) {return 'Ctrl+' + keyName}

// ******************************** 组合键访问器导出 ********************************

export { ctrl, INavigator }
