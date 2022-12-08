"use strict"

// ******************************** 函数静态方法 ********************************

interface IFunction extends Function {
  empty(): void
}

type emptyFunc = (() => void)

// 函数静态方法 - 空函数
const functionObject = <Object>Function
const IFunction = <IFunction>functionObject

IFunction.empty = () => {}

export { IFunction, emptyFunc }
