"use strict"

// ******************************** 字符串静态方法 ********************************

interface IString extends String {
  compress(string: string): string
}

const String_as_obj = <Object>String
const IString = <IString>String_as_obj

// 字符串静态方法 - 压缩(过滤不可见字符)
IString.compress = function IIFE() {
  const whitespace = /\s+/g
  return string => {
    return string.replace(whitespace, '')
  }
}()

export { IString }
