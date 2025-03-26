/** 输入事件侦听器映射表 */
type InputEventListenersMap = {
  keydown: Array<EventCallback>
  keyup: Array<EventCallback>
  mousedown: Array<EventCallback>
  mousedownLB: Array<EventCallback>
  mousedownRB: Array<EventCallback>
  mouseup: Array<EventCallback>
  mouseupLB: Array<EventCallback>
  mouseupRB: Array<EventCallback>
  mousemove: Array<EventCallback>
  mouseleave: Array<EventCallback>
  doubleclick: Array<EventCallback>
  wheel: Array<EventCallback>
  touchstart: Array<EventCallback>
  touchmove: Array<EventCallback>
  touchend: Array<EventCallback>
  scenemousemove: Array<EventCallback>
  gamepadbuttonpress: Array<EventCallback>
  gamepadbuttonrelease: Array<EventCallback>
  gamepadleftstickchange: Array<EventCallback>
  gamepadrightstickchange: Array<EventCallback>
}

/** 输入事件类型 */
type InputEventType = keyof InputEventListenersMap

/** 输入脚本事件 */
type InputScriptEvent = ScriptKeyboardEvent | ScriptMouseEvent | ScriptWheelEvent | ScriptTouchEvent | ScriptGamepadEvent | ScriptInputEvent

/** 控制器按钮{索引:名称}映射表 */
type ControllerButtonNameMap = {
  0: 'A'
  1: 'B'
  2: 'X'
  3: 'Y'
  4: 'LB'
  5: 'RB'
  6: 'LT'
  7: 'RT'
  8: 'View'
  9: 'Menu'
  10: 'LS'
  11: 'RS'
  12: 'Up'
  13: 'Down'
  14: 'Left'
  15: 'Right'
}

/** 控制器按钮码 */
type ControllerButtonCode = keyof ControllerButtonNameMap

/** 控制器按钮{名称:状态}映射表 */
type ControllerButtonStateMap = {
  A: boolean
  B: boolean
  X: boolean
  Y: boolean
  LB: boolean
  RB: boolean
  LT: boolean
  RT: boolean
  View: boolean
  Menu: boolean
  LS: boolean
  RS: boolean
  Up: boolean
  Down: boolean
  Left: boolean
  Right: boolean
  LeftStickAngle: number
  RightStickAngle: number
}

/** 控制器按钮名称 */
type ControllerButtonName = keyof ControllerButtonStateMap