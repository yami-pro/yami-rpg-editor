'use strict'

// ******************************** 数组静态方法 ********************************

interface IArray extends Array<any> {
  // 数组静态方法扩展
  empty: any[]
  subtract(a: any[], b: any[]): any[]

  // 数组方法扩展
  append(value: any): boolean
  remove(value: any): boolean
}

const ArrObject = <Object>Array
const Arr = <IArray>ArrObject

// 数组静态属性 - 空数组
Arr.empty = []

// 数组静态方法 - 减法
Arr.subtract = function (a: any[], b: any[]) {
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
prototype.append = function (value: any) {
  if (this.indexOf(value) === -1) {
    this.push(value)
    return true
  }
  return false
}

// 数组方法 - 移除
prototype.remove = function (value: any) {
  const index = this.indexOf(value)
  if (index !== -1) {
    this.splice(index, 1)
    return true
  }
  return false
}

export { Arr as Array, IArray }
