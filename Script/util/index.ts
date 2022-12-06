'use strict'

export { ICSS, selectorVar } from './css'
export { window } from './global'
export { ctrl } from './ctrl'
export { IMath } from './math'
export { INodeList } from './node-list'
export { INumber } from './number'
export { IObject } from './object'

export {
  IEvent,
  IUIEvent,
  IMouseEvent,
  IDragEvent,
  IPointerEvent
} from './event/index'

export {
  IHTMLElement,
  IHTMLButtonElement,
  IHTMLImageElement
} from './element/index'

export { IRegExp } from './reg-exp'
export { IString } from './string'
export { Cursor } from './cursor'
export { IArray } from './array'
export { IFunction, emptyFunc } from './function'
export { Timer, TimerManager } from './timer'
export { StageColor } from './stage-color'

export {
  measureText,
  getElementReader,
  getElementWriter,
  INTRGBA
} from './util'

export { Clipboard } from './clipboard'

import './undo-redo'
