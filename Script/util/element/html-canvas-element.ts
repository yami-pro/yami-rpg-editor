"use strict"

import { EventTarget_ext } from "../../yami"

// ******************************** Canvas元素扩展 ********************************

interface HTMLCanvasElement_ext extends EventTarget_ext {}

interface JSXHTMLCanvasElement { [attributes: string]: any }

export {
  HTMLCanvasElement_ext,
  JSXHTMLCanvasElement
}
