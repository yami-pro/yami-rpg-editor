'use strict'

// ******************************** 字符串静态方法 ********************************

interface IString extends String {
  compress(string: string): string
}

const stringObject = <Object>String
const IString = <IString>stringObject

// 字符串静态方法 - 压缩(过滤不可见字符)
IString.compress = function IIFE() {
  const whitespace = /\s+/g
  return string => {
    return string.replace(whitespace, '')
  }
}()

export { IString }
