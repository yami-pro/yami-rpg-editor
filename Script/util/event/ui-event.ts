'use strict'

import { IEvent } from "./event"

// ******************************** UI事件访问器 ********************************

interface IUIEvent extends UIEvent, IEvent {
}

export { IUIEvent }
