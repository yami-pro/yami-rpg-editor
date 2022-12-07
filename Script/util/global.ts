'use strict'

import { $ } from "./css"
import { selectorVar } from "./css"
import { EventTarget_ext } from "./event/event-target"

// ******************************** 全局对象 ********************************

interface IWindow extends Window, EventTarget_ext {
  $: (selector: string) => selectorVar
}

// ******************************** 绑定到全局对象 ********************************

// window对象添加dom查询器
const windowObject = <Object>window
const target = <IWindow>windowObject
target.$ = $

export { target as window }
