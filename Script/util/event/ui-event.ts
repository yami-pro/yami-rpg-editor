"use strict"

import { Event_ext } from "../../yami"

// ******************************** UI事件访问器 ********************************

interface UIEvent_ext extends Event_ext {
  latest: UIEvent
  itemHeight: number
  itemIndex: number
}

interface IUIEvent extends UIEvent, UIEvent_ext {}

export {
  IUIEvent,
  UIEvent_ext
}
