'use strict'

import { IKeyboardEvent } from "./keyboard-event"
import { IPointerEvent } from "./pointer-event"

// ******************************** 键盘事件访问器 ********************************

interface IMouseKeyboardEvent extends IPointerEvent, IKeyboardEvent {}

export { IMouseKeyboardEvent }
