"use strict"

import { MouseEvent_ext } from "../../yami"

// ******************************** 键盘事件访问器 ********************************

interface WheelEvent_ext extends MouseEvent_ext {}

interface IWheelEvent extends WheelEvent, WheelEvent_ext {}

export { IWheelEvent }
