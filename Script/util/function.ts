'use strict'

// ******************************** 函数静态方法 ********************************

interface IFunction extends Function {
  empty(): void
}

// type emptyFunc = (() => void) | null

// 函数静态方法 - 空函数
const FuncObject = <Object>Function
const Func = <IFunction>FuncObject

Func.empty = () => {}

export { Func as Function }
