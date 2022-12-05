'use strict'

import { IEventTarget } from "./event"
import { IHTMLElement } from "./element"

// ******************************** 其他 ********************************

// 测量文本大小
const measureText = function IIFE() {
  const size = {width: 0, lines: 0}
  const container = document.createElement('text')
  let appended = false
  let usedFont = ''
  let lineHeight = 0
  container.style.whiteSpace = 'pre'
  return function (text: string, font = '') {
    if (appended === false) {
      appended = true
      document.body.appendChild(container)
      container.textContent = 'a'
      lineHeight = container.offsetHeight
      Promise.resolve().then(() => {
        appended = false
        container.textContent = ''
        container.remove()
      })
    }
    if (usedFont !== font) {
      usedFont = font
      container.style.fontFamily = font ?? ''
    }
    container.textContent = text
    size.width = container.offsetWidth
    size.lines = container.offsetHeight / lineHeight
    return size
  }
}()

// 请求执行回调函数
// 过滤一帧内的重复事件
// const request = function IIFE() {
//   const keys = []
//   return function (key, callback) {
//     if (keys.append(key)) {
//       requestAnimationFrame(() => {
//         if (keys.remove(key)) {
//           callback()
//         }
//       })
//     }
//   }
// }()

const windowObject = <Object>window
const target = <IEventTarget>windowObject

{
  // 拖拽状态
  let dragging = false
  let osdragging = false

  // 拖拽开始事件 - 阻止拖拽元素
  const dragstart = function (event: MouseEvent) {
    dragging = true
    event.preventDefault()
    target.on('pointerup', pointerup)
  }

  // 拖拽结束事件 - 比指针弹起事件优先执行
  const dragend = function (event: MouseEvent) {
    if (dragging) {
      dragging = false
      target.off('pointerup', pointerup)
    }
  }

  // 指针弹起事件 - 拖拽被阻止时的备用方案
  const pointerup = function (event: MouseEvent) {
    if (dragging) {
      dragging = false
      target.off('pointerup', pointerup)
    }
  }

  // 拖拽进入事件
  const dragenter = function (event: MouseEvent) {
    if (!dragging &&
      !osdragging &&
      !event.relatedTarget) {
      osdragging = true
      target.dispatchEvent(
        new DragEvent('os-dragstart')
      )
      target.on('dragleave', dragleave)
      target.on('dragover', dragover)
      target.on('drop', drop)
    }
  }

  // 拖拽离开事件
  const dragleave = function (event: MouseEvent) {
    if (osdragging &&
      !event.relatedTarget) {
      osdragging = false
      target.dispatchEvent(
        new DragEvent('os-dragend')
      )
      target.off('dragleave', dragleave)
      target.off('dragover', dragover)
      target.off('drop', drop)
    }
  }

  // 拖拽悬停事件
  const dragover = function (event: MouseEvent) {
    event.preventDefault()
  }

  // 拖拽释放事件
  // 停止冒泡会拦截该事件
  const drop = function (event: MouseEvent) {
    if (osdragging) {
      osdragging = false
      target.dispatchEvent(
        new DragEvent('os-dragend')
      )
      target.off('dragleave', dragleave)
      target.off('dragover', dragover)
      target.off('drop', drop)
    }
  }

  // 初始化
  target.on('dragstart', dragstart)
  target.on('dragend', dragend)
  target.on('dragenter', dragenter)
}

// 获取元素读取器
const getElementReader = function (prefix: string) {
  return function (suffix: string) {
    return (<IHTMLElement>$(`#${prefix}-${suffix}`)).read()
  }
}

// 获取元素写入器
const getElementWriter = function (prefix: string, bindingObject: any) {
  return function (suffix: string, value: any) {
    if (value === undefined) {
      const nodes = typeof suffix === 'string'
                  ? suffix.split('-')
                  : [suffix]
      value = bindingObject
      for (const node of nodes) {
        value = value[node]
      }
    }
    (<IHTMLElement>$(`#${prefix}-${suffix}`)).write(value)
  }
}

// 生成整数颜色
const INTRGBA = function (hex: string) {
  const r = parseInt(hex.slice(0, 2), 16)
  const g = parseInt(hex.slice(2, 4), 16)
  const b = parseInt(hex.slice(4, 6), 16)
  const a = parseInt(hex.slice(6, 8), 16)
  return r + (g + (b + a * 256) * 256) * 256
}

// ******************************** 检测设备像素比例 ********************************

// 侦听像素比率改变事件
target.on('resize', function IIFE() {
  let dpr = window.devicePixelRatio
  return event => {
    if (dpr !== window.devicePixelRatio) {
      dpr = window.devicePixelRatio
      target.dispatchEvent(new Event('dprchange'))
    }
  }
}())

// ******************************** 其他导出 ********************************

export {
  measureText,
  getElementReader,
  getElementWriter,
  INTRGBA
}
