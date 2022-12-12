"use strict"

// ******************************** 拖拽事件访问器 ********************************

interface DragEvent_ext {
  dropTarget: HTMLElement | null
  allowMove: boolean
  allowCopy: boolean
  dropPath: string | null
  dropMode: string | null
  files: HTMLElement[]
  filePaths: string[]
  promise: Promise<void>
}

export { DragEvent_ext }
