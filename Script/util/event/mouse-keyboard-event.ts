'use strict'

import { IMouseEvent } from "./mouse-event"
import { IKeyboardEvent } from "./keyboard-event"

// ******************************** 键盘事件访问器 ********************************

interface IMouseKeyboardEvent extends IMouseEvent, IKeyboardEvent {}

export { IMouseKeyboardEvent }
