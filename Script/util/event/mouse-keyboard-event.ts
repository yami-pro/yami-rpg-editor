"use strict"

// ******************************** 键盘事件访问器 ********************************

interface MouseKeyboardEvent extends PointerEvent, WheelEvent, KeyboardEvent {
  target: HTMLElement
}

export { MouseKeyboardEvent }
