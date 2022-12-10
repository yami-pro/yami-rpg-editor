"use strict"

// ******************************** 函数静态方法 ********************************

interface FunctionConstructor_ext {
  empty: () => void
}

interface IFunctionConstructor extends FunctionConstructor, FunctionConstructor_ext {}

interface IFunction extends Function {}

type IFunction_empty_func = (() => void)

// 函数静态方法 - 空函数
const IFunction = <IFunctionConstructor>Function

IFunction.empty = () => {}

export {
  IFunction,
  IFunction_empty_func
}
