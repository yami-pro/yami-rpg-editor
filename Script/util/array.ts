"use strict"

import {
  IHTMLElement,
  CommandHistory
} from "../yami"

// ******************************** 声明 ********************************

type commandsData = {[index: string]: any}

interface Array_ext {
  // 静态数组方法扩展
  empty<T>(): IArray<T>
  subtract<T>(a: T[], b: T[]): IArray<T>

  // 数组方法扩展
  append<T>(value: T): boolean
  remove<T>(value: T): boolean

  // 属性扩展
  versionId: number
  count: number
  start: number
  end: number
  head: IHTMLElement | null
  foot: IHTMLElement | null
  history: CommandHistory
  blank: IHTMLElement | null
  parent: commandsData
}

interface IArray<T> extends Array<T>, Array_ext {}

// ******************************** 静态数组方法 ********************************

const Array_as_obj = <Object>Array
const IArray = <Array_ext>Array_as_obj

// 空数组
IArray.empty = function <T>() {
  return <IArray<T>>new Array<T>()
}

// 减法
IArray.subtract = function <T>(a: T[], b: T[]) {
  const differences = []
  const length = a.length
  for (let i = 0; i < length; i++) {
    if (b.indexOf(a[i]) === -1) {
      differences.push(a[i])
    }
  }
  return <IArray<T>>differences
}

// ******************************** 数组方法 ********************************

const prototype_as_obj = <Object>Array.prototype
const prototype = <Array_ext>prototype_as_obj

// 数组方法 - 添加
Object.defineProperty(prototype, 'append', {
  enumerable: false,
  value: function <T>(this: IArray<T>, value: T) {
    if (this.indexOf(value) === -1) {
      this.push(value)
      return true
    }
    return false
  }
})

// 数组方法 - 移除
Object.defineProperty(prototype, 'remove', {
  enumerable: false,
  value: function <T>(this: IArray<T>, value: T) {
    const index = this.indexOf(value)
    if (index !== -1) {
      this.splice(index, 1)
      return true
    }
    return false
  }
})

export {
  IArray,
  commandsData
}
