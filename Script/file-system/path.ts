"use strict"

// import * as Path from 'path'

// ******************************** 路径工具 ********************************

const Path = require('path')

// 转换至斜杠分隔符
Path.slash = function IIFE() {
  const regexp = /\\/g
  return function (path) {
    if (path.indexOf('\\') !== -1) {
      path = path.replace(regexp, '/')
    }
    return path
  }
}()

// 获取文件扩展名
// Path.ext = function (path) {
//   return path.slice(path.lastIndexOf('.') + 1)
// }

// ******************************** 路径工具导出 ********************************

export { Path }
