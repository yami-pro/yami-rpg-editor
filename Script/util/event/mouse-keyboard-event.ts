"use strict"

import {
  IKeyboardEvent,
  IPointerEvent,
  IDragEvent,
  IWheelEvent
} from "../../yami"

// ******************************** 键盘事件访问器 ********************************

interface IMouseKeyboardEvent extends IPointerEvent, IKeyboardEvent, IDragEvent, IWheelEvent {}

export { IMouseKeyboardEvent }
