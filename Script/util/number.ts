'use strict'

// ******************************** 数字静态方法 ********************************

// 数字静态方法 - 计算索引位数
Number.computeIndexDigits = function (length) {
  return Math.floor(Math.log10(Math.max(length - 1, 1))) + 1
}

// 数字静态方法 - 填充零
Number.padZero = function (number, length, padString = '0') {
  const digits = Number.computeIndexDigits(length)
  return number.toString().padStart(digits, padString)
}
