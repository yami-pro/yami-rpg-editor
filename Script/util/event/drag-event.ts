'use strict'

import { IDataTransfer } from './data-transfer'

// ******************************** 拖拽事件访问器 ********************************

interface IDragEvent extends DragEvent {
  dataTransfer: IDataTransfer
}

export { IDragEvent }
