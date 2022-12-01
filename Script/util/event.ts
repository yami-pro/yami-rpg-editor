'use strict'

// ******************************** 事件访问器 ********************************

interface IEvent extends Event {
  value: 'light' | 'dark'
}

const prototype = <IEvent>Event.prototype

prototype.value = 'dark'

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

export { IEvent }
