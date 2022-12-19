"use strict"

import {
  CommandHistory,
  FileItem,
  FolderItem
} from "../yami"

// ******************************** 声明 ********************************

namespace Type {
  export type data = {[index: string]: any}
}

// ArrayConstructor扩展
interface ArrayConstructor_ext {
  // static
  empty<T>(): T[]
  subtract<T>(a: T[], b: T[]): T[]
}

// Array扩展
interface Array_ext {
  // prototype
  // 使用Object.defineProperty定义
  append<T>(value: T): boolean
  remove<T>(value: T): boolean

  versionId: number
  count: number
  start: number
  end: number
  head: HTMLElement | null
  foot: HTMLElement | null
  history: CommandHistory
  blank: HTMLElement | null
  parent: Type.data
  files: (FolderItem | FileItem)[]
}

// ******************************** 静态数组方法 ********************************

// 空数组
Array.empty = function <T>() {
  return new Array<T>()
}

// 减法
Array.subtract = function <T>(a: T[], b: T[]) {
  const differences = []
  const length = a.length
  for (let i = 0; i < length; i++) {
    if (b.indexOf(a[i]) === -1) {
      differences.push(a[i])
    }
  }
  return differences
}

// ******************************** 数组方法 ********************************

// 数组方法 - 添加
Object.defineProperty(Array.prototype, 'append', {
  enumerable: false,
  value: function <T>(this: T[], value: T) {
    if (this.indexOf(value) === -1) {
      this.push(value)
      return true
    }
    return false
  }
})

// 数组方法 - 移除
Object.defineProperty(Array.prototype, 'remove', {
  enumerable: false,
  value: function <T>(this: T[], value: T) {
    const index = this.indexOf(value)
    if (index !== -1) {
      this.splice(index, 1)
      return true
    }
    return false
  }
})

export {
  Array_ext,
  ArrayConstructor_ext
}
