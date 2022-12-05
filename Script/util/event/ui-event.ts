'use strict'

import { Event_ext } from "./event"

// ******************************** UI事件访问器 ********************************

interface UIEvent_ext extends Event_ext {}

interface IUIEvent extends UIEvent, UIEvent_ext {}

export { IUIEvent, UIEvent_ext }
