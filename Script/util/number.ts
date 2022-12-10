"use strict"

// ******************************** 数字静态方法 ********************************

interface NumberConstructor_ext {
  computeIndexDigits: (length: number) => number
  padZero: (number: number, length: number, padString?: string | undefined) => string
}

interface INumberConstructor extends NumberConstructor, NumberConstructor_ext {}

interface INumber extends Number {}

const INumber = <INumberConstructor>Number

// 数字静态方法 - 计算索引位数
INumber.computeIndexDigits = function (length) {
  return Math.floor(Math.log10(Math.max(length - 1, 1))) + 1
}

// 数字静态方法 - 填充零
INumber.padZero = function (number, length, padString = '0') {
  const digits = INumber.computeIndexDigits(length)
  return number.toString().padStart(digits, padString)
}

export { INumber }
