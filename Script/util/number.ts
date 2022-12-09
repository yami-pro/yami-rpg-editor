"use strict"

// ******************************** 数字静态方法 ********************************

interface INumber extends Number {
  computeIndexDigits: (length: number) => number
  padZero: (number: number, length: number, padString?: string | undefined) => string
}

const Number_as_obj = <Object>Number
const INumber = <INumber>Number_as_obj

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
