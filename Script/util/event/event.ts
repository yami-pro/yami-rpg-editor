'use strict'

// ******************************** 事件访问器 ********************************

interface Event_ext {
  mode: string
  value: 'light' | 'dark'
}

interface IEvent extends Event, Event_ext {}

const prototype = <IEvent>Event.prototype
prototype.value = 'dark'
prototype.mode = ''

export { IEvent, Event_ext }
