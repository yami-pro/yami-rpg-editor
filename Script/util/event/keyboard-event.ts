'use strict'

import { UIEvent_ext } from './ui-event'

// ******************************** 键盘事件访问器 ********************************

interface KeyboardEvent_ext extends UIEvent_ext {}

interface IKeyboardEvent extends KeyboardEvent, KeyboardEvent_ext {}

export { IKeyboardEvent }
