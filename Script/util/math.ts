"use strict"

// ******************************** 数学方法 ********************************

interface IMath extends Math {
  clamp: (number: number, minimum: number, maximum: number) => number
  roundTo: (number: number, decimalPlaces: number) => number
  dist: (x1: number, y1: number, x2: number, y2: number) => number
  randomBetween: (value1: number, value2: number) => number
  radians: (degrees: number) => number
  degrees: (radians: number) => number
  modDegrees(degrees: number, period?: number): number
  modRadians: (radians: number, period?: number) => number
}

const IMath = <IMath>Math

// 限定取值范围 - 范围不正确时返回较大的数(minimum)
IMath.clamp = function IIFE() {
  const {max, min} = Math
  return (number, minimum, maximum) => {
    return max(min(number, maximum), minimum)
  }
}()

// 四舍五入到指定小数位
IMath.roundTo = function IIFE() {
  const {round} = Math
  return (number, decimalPlaces) => {
    const ratio = 10 ** decimalPlaces
    return round(number * ratio) / ratio
  }
}()

// 返回两点距离
// 比 Math.hypot() 快很多
IMath.dist = function IIFE() {
  const {sqrt} = Math
  return (x1, y1, x2, y2) => {
    return sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2)
  }
}()

// 计算指定范围的随机值
IMath.randomBetween = function IIFE() {
  const {random} = Math
  return (value1, value2) => {
    return value1 + (value2 - value1) * random()
  }
}()

// 角度转弧度
IMath.radians = function IIFE() {
  const factor = Math.PI / 180
  return degrees => {
    return degrees * factor
  }
}()

// 弧度转角度
IMath.degrees = function IIFE() {
  const factor = 180 / Math.PI
  return radians => {
    return radians * factor
  }
}()

// 角度取余数 [0, 360)
IMath.modDegrees = (degrees, period = 360) => {
  return degrees >= 0 ? degrees % period : (degrees % period + period) % period
}

// 弧度取余数 [0, 2π)
IMath.modRadians = function IIFE() {
  const PI2 = Math.PI * 2
  return (radians, period = PI2) => {
    return radians >= 0 ? radians % period : (radians % period + period) % period
  }
}()

export { IMath }
