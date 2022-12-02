'use strict'

// ******************************** 数组声明 ********************************

interface IArray extends Array<any> {
  empty: any[]
  subtract(a: any[], b: any[]): any[]

  // 数组方法扩展
  append(value: any): boolean
  remove(value: any): boolean
}

// ******************************** 数组管理对象 ********************************

const ArrayManager = <IArray>new Object()

// 空数组
ArrayManager.empty = []

// 减法
ArrayManager.subtract = function (a, b) {
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

const prototypeObject = <Object>Array.prototype
const prototype = <IArray>prototypeObject

// 数组方法 - 添加
prototype.append = function (value) {
  if (this.indexOf(value) === -1) {
    this.push(value)
    return true
  }
  return false
}

// 数组方法 - 移除
prototype.remove = function (value) {
  const index = this.indexOf(value)
  if (index !== -1) {
    this.splice(index, 1)
    return true
  }
  return false
}

export { IArray, ArrayManager }
