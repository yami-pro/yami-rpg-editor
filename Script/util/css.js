'use strict'

// ******************************** CSS静态方法 ********************************

// 编码字符串为URL
CSS.encodeURL = function IIFE() {
  const regexp = /([()])/g
  return function (string) {
    return `url(${encodeURI(string).replace(regexp, '\\$1')})`
  }
}()

// 光栅化 CSS 像素坐标使其对齐到设备像素
CSS.rasterize = function (csspx) {
  const dpr = window.devicePixelRatio
  return Math.round(csspx * dpr) / dpr
}

// 获取设备像素内容框大小
// 在四舍五入时有精度导致的误差
// 因此暂时用 offset 来解决问题
CSS.getDevicePixelContentBoxSize = function (element) {
  const rect = element.getBoundingClientRect()
  const dpr = window.devicePixelRatio
  const left = Math.round(rect.left * dpr + 1e-5)
  const right = Math.round(rect.right * dpr + 1e-5)
  const top = Math.round(rect.top * dpr + 1e-5)
  const bottom = Math.round(rect.bottom * dpr + 1e-5)
  const width = right - left
  const height = bottom - top
  return {width, height}
}
