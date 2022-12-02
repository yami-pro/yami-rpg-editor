'use strict'

import { IDataTransfer } from './data-transfer'
import { INavigator } from './ctrl'

// ******************************** 事件访问器 ********************************

interface IEvent extends Event {
  value: 'light' | 'dark'

  spaceKey: string
  altKey: string
  metaKey: string
  ctrlKey: string

  dragKey: {
    get: (this: IEvent) => string
  }

  cmdOrCtrlKey: {
    get: (this: IEvent) => string
  }
}

interface IDragEvent extends DragEvent {
  dataTransfer: IDataTransfer
}

const prototype = <IEvent>Event.prototype

prototype.value = 'dark'

Object.defineProperties(prototype, {
  dragKey: {
    get: function (this: IEvent) {
      return this.spaceKey || this.altKey
    }
  },
  cmdOrCtrlKey: {
    get: (<INavigator>navigator).userAgentData.platform === 'macOS'
    ? function (this: IEvent) {return this.metaKey}
    : function (this: IEvent) {return this.ctrlKey}
  },
})

export { IEvent, IDragEvent }
