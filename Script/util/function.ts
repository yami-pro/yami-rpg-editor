"use strict"

// ******************************** 函数静态方法 ********************************

interface IFunction extends Function {
  empty: () => void
}

type IFunction_empty_func = (() => void)

// 函数静态方法 - 空函数
const Function_as_obj = <Object>Function
const IFunction = <IFunction>Function_as_obj

IFunction.empty = () => {}

export {
  IFunction,
  IFunction_empty_func
}
