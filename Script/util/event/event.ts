"use strict"

// ******************************** 事件访问器 ********************************

interface Event_ext {
  mode: string | null
  value: string | number | boolean | null
}

Event.prototype.value = null
Event.prototype.mode = null

export { Event_ext }
