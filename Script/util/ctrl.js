'use strict'

// ******************************** 事件访问器 ********************************

// 获取Ctrl组合键名称
const ctrl = navigator.userAgentData.platform === 'macOS'
? function (keyName) {return '⌘+' + keyName}
: function (keyName) {return 'Ctrl+' + keyName}

export { ctrl }
