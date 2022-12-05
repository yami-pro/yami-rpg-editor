'use strict'

// ******************************** 事件访问器 ********************************

interface IEvent extends Event {
  mode: string
  value: 'light' | 'dark'
}

const prototype = <IEvent>Event.prototype
prototype.value = 'dark'
prototype.mode = ''

export { IEvent }
