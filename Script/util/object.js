'use strict'

// ******************************** 对象静态方法 ********************************

// 对象静态属性 - 空对象
Object.empty = {}

// 对象静态方法 - 克隆对象
Object.clone = function IIFE() {
  const {isArray} = Array
  const clone = object => {
    let copy
    if (isArray(object)) {
      const length = object.length
      copy = new Array(length)
      for (let i = 0; i < length; i++) {
        const value = object[i]
        copy[i] = value instanceof Object ? clone(value) : value
      }
    } else {
      copy = new Object()
      // for ... of Object.keys(object) { ... }
      // 在缺少迭代器的对象中无效
      for (const key in object) {
        const value = object[key]
        copy[key] = value instanceof Object ? clone(value) : value
      }
    }
    return copy
  }
  return function (object) {
    return clone(object)
  }
}()
