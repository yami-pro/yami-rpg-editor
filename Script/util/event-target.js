'use strict'

// ******************************** 事件目标方法 ********************************

{
let last = null

// 重写鼠标双击事件触发方式
const pointerdown = function (event) {
  if (!event.cmdOrCtrlKey &&
    !event.altKey &&
    !event.shiftKey &&
    !event.doubleclickProcessed) {
    event.doubleclickProcessed = true
    switch (event.button) {
      case 0:
        if (last !== null &&
          event.target === last.target &&
          event.timeStamp - last.timeStamp < 500 &&
          Math.abs(event.clientX - last.clientX) < 4 &&
          Math.abs(event.clientY - last.clientY) < 4 &&
          this.isInContent(event)) {
          if (!event.target.dispatchEvent(
            new PointerEvent('doubleclick', event))) {
            event.preventDefault()
          }
          last = null
        } else {
          last = event
        }
        break
      default:
        last = null
        break
    }
  }
}

// 事件目标方法 - 添加事件
EventTarget.prototype.on = function (type, listener, options) {
  switch (type) {
    case 'doubleclick':
      this.addEventListener('pointerdown', pointerdown)
      this.addEventListener('doubleclick', listener, options)
      break
    default:
      this.addEventListener(type, listener, options)
      break
  }
}

// 事件目标方法 - 删除事件
EventTarget.prototype.off = function (type, listener, options) {
  switch (type) {
    case 'doubleclick':
      this.removeEventListener('pointerdown', pointerdown, options)
      this.removeEventListener('doubleclick', listener, options)
      break
    default:
      this.removeEventListener(type, listener, options)
      break
  }
}
}

// 创建作用域
// namespace: {
// const map = new Map()
// const obs = new ResizeObserver(entries => {
//   for (const entry of entries) {
//     map.get(entry.target)(entry)
//   }
// })

// // 事件目标方法 - 开始观察指定元素
// EventTarget.prototype.observe = function (type, callback) {
//   switch (type) {
//     case 'resize':
//       if (!map.has(this)) {
//         map.set(this, callback)
//         obs.observe(this)
//       }
//       break
//   }
// }

// // 事件目标方法 - 结束观察指定元素
// EventTarget.prototype.unobserve = function (type) {
//   switch (type) {
//     case 'resize':
//       if (map.delete(this)) {
//         obs.unobserve(this)
//       }
//       break
//   }
// }
// }
