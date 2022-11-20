'use strict'

// ******************************** 字符串静态方法 ********************************

// 字符串静态方法 - 压缩(过滤不可见字符)
String.compress = function IIFE() {
  const whitespace = /\s+/g
  return string => {
    return string.replace(whitespace, '')
  }
}()
