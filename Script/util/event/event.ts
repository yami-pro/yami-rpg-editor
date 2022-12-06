'use strict'

// ******************************** 事件访问器 ********************************

interface Event_ext {
  mode: string | null
  value: string | number | boolean | null
}

interface IEvent extends Event, Event_ext {}

const prototype = <IEvent>Event.prototype
prototype.value = null
prototype.mode = null

export { IEvent, Event_ext }
