"use strict"

import { EventTarget_ext } from "../../yami"

// ******************************** Canvas元素扩展 ********************************

interface IHTMLCanvasElement extends HTMLCanvasElement, EventTarget_ext {}

export { IHTMLCanvasElement }
