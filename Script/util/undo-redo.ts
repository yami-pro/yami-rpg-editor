"use strict"

// ******************************** 禁用撤销和重做 ********************************

window.on('keydown', function (event: KeyboardEvent) {
  if (event.cmdOrCtrlKey) {
    switch (event.code) {
      case 'KeyZ':
      case 'KeyY':
        event.preventDefault()
        break
      case 'KeyA':
        // 当存在css(user-select: text)元素时
        // 全选将选中该元素和文本框在内的所有文本块
        if (document.activeElement instanceof HTMLInputElement ||
          document.activeElement instanceof HTMLTextAreaElement) {
          break
        } else {
          event.preventDefault()
        }
        break
    }
  }
  // 监听空格键的按下状态
  switch (event.code) {
    case 'Space':
      Event.prototype.spaceKey = true
      break
  }
}, {capture: true})

window.on('keyup', function (event: KeyboardEvent) {
  // 监听空格键的弹起状态
  switch (event.code) {
    case 'Space':
      Event.prototype.spaceKey = false
      break
  }
}, {capture: true})

export {}
