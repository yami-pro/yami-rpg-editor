'use strict'

import { IDataTransfer } from './data-transfer'
import { MouseEvent_ext } from './mouse-event'

// ******************************** 拖拽事件访问器 ********************************

interface DragEvent_ext extends MouseEvent_ext {}

interface IDragEvent extends DragEvent, DragEvent_ext {
  dataTransfer: IDataTransfer
}

export { IDragEvent }
