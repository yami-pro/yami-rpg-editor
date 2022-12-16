"use strict"

// ******************************** 函数静态方法 ********************************

interface FunctionConstructor_ext {
  empty: () => void
}

// 函数静态方法 - 空函数
Function.empty = () => {}

export { FunctionConstructor_ext }
