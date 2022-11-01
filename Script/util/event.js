'use strict'

// ******************************** 事件访问器 ********************************

Object.defineProperties(Event.prototype, {
  dragKey: {
    get: function () {
      return this.spaceKey || this.altKey
    }
  },
  cmdOrCtrlKey: {
    get: navigator.userAgentData.platform === 'macOS'
    ? function () {return this.metaKey}
    : function () {return this.ctrlKey}
  },
})

// 获取Ctrl组合键名称
const ctrl = navigator.userAgentData.platform === 'macOS'
? function (keyName) {return '⌘+' + keyName}
: function (keyName) {return 'Ctrl+' + keyName}
