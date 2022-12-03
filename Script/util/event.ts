'use strict'

import { IDataTransfer } from './data-transfer'

// ******************************** 事件访问器 ********************************

interface IEvent extends Event {
  value: 'light' | 'dark'
}

interface IDragEvent extends DragEvent {
  dataTransfer: IDataTransfer
}

const prototype = <IEvent>Event.prototype
prototype.value = 'dark'

export { IEvent, IDragEvent }
