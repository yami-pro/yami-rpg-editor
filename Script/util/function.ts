"use strict"

// ******************************** 函数静态方法 ********************************

interface IFunction extends Function {
  empty: () => void
}

type IFunction_empty_func = (() => void)

// 函数静态方法 - 空函数
// Function 是混合类型接口, 先断言为Function类型, 再断言为IFunction类型
const IFunction = (Function as Function) as IFunction

IFunction.empty = () => {}

export {
  IFunction,
  IFunction_empty_func
}
