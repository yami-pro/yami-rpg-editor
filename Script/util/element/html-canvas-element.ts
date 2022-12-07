'use strict'

import { EventTarget_ext } from '../event/event-target'

// ******************************** Canvas元素扩展 ********************************

interface IHTMLCanvasElement extends HTMLCanvasElement, EventTarget_ext {}

export { IHTMLCanvasElement }
