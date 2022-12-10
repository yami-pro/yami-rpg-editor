"use strict"

// ******************************** 字符串静态方法 ********************************

interface StringConstructor_ext {
  compress(string: string): string
}

interface IStringConstructor extends StringConstructor, StringConstructor_ext {}

interface IString extends String {}

const IString = <IStringConstructor>String

// 字符串静态方法 - 压缩(过滤不可见字符)
IString.compress = function IIFE() {
  const whitespace = /\s+/g
  return string => {
    return string.replace(whitespace, '')
  }
}()

export { IString }
