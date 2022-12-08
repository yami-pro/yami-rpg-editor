"use strict"

import {
  IHTMLElement,
  IDataTransfer,
  MouseEvent_ext,
  IArray
} from "../../yami"

// ******************************** 拖拽事件访问器 ********************************

interface DragEvent_ext extends MouseEvent_ext {
  dropTarget: IHTMLElement | null
  allowMove: boolean
  allowCopy: boolean
  dropPath: string | null
  dropMode: string | null
  files: IArray<IHTMLElement>
  filePaths: string[]
  promise: Promise<void>
}

interface IDragEvent extends DragEvent, DragEvent_ext {
  dataTransfer: IDataTransfer
}

export { IDragEvent }
