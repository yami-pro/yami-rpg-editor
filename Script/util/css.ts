'use strict'

// ******************************** 声明 ********************************

type SelectorVar = (selector: string) => Element | NodeListOf<Element> | null

interface IWindow extends Window {
  $: SelectorVar
}

// ******************************** CSS选择器 ********************************

const $ = function IIFE() {
  const regexp = /^#(\w|-)+$/
  return function (selector: string) {
    if (regexp.test(selector)) {
      return document.querySelector(selector)
    } else {
      return document.querySelectorAll(selector)
    }
  }
}()

// ******************************** CSS静态方法 ********************************

interface ICSS {
  encodeURL: (str: string) => string
  rasterize: (csspx: number) => number
  getDevicePixelContentBoxSize: (element: Element) => {width: number, height: number}
}

const ICSS = <ICSS>new Object()

// 编码字符串为URL
ICSS.encodeURL = function IIFE() {
  const regexp = /([()])/g
  return function (str) {
    return `url(${encodeURI(str).replace(regexp, '\\$1')})`
  }
}()

// 光栅化 CSS 像素坐标使其对齐到设备像素
ICSS.rasterize = function (csspx) {
  const dpr = window.devicePixelRatio
  return Math.round(csspx * dpr) / dpr
}

// 获取设备像素内容框大小
// 在四舍五入时有精度导致的误差
// 因此暂时用 offset 来解决问题
ICSS.getDevicePixelContentBoxSize = function (element) {
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

// ******************************** 绑定到全局对象 ********************************

// 全局声明 CSS选择器
declare global { var $: SelectorVar }

// window对象添加dom查询器
if (window) {
  const windowObject = <Object>window
  const IWindow = <IWindow>windowObject
  IWindow.$ = $
}

export { ICSS }
