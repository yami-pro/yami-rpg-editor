"use strict"

// ******************************** 正则表达式属性 ********************************

interface RegExpConstructor_ext {
  number: RegExp
}

// 静态属性 - 数字表达式
RegExp.number = /^-?\d+(?:\.\d+)?$/

export { RegExpConstructor_ext }
