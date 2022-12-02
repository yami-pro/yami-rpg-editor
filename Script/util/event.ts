'use strict'

import { IDataTransfer } from './data-transfer'
import { INavigator } from './ctrl'

// ******************************** 事件访问器 ********************************

interface IEvent extends Event {
  value: 'light' | 'dark'
}

interface IDragEvent extends DragEvent {
  dataTransfer: IDataTransfer
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
    get: (<INavigator>navigator).userAgentData.platform === 'macOS'
    ? function () {return this.metaKey}
    : function () {return this.ctrlKey}
  },
})

export { IEvent, IDragEvent }
