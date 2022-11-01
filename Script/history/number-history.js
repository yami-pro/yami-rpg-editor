'use strict'

// ******************************** 数值操作历史 ********************************

class NumberHistory {
  input     //:element
  stack     //:array
  index     //:number
  lastValue //:string

  constructor(input) {
    this.input = input
    this.stack = []
    this.index = -1
    this.lastValue = ''

    // 侦听事件
    input.on('keydown', this.inputKeydown)
    input.on('input', this.inputInput)
    input.on('blur', this.inputBlur)
  }

  // 重置历史
  reset() {
    if (this.stack.length !== 0) {
      this.stack = []
      this.index = -1
    }
    this.lastValue = this.input.value
  }

  // 保存数据
  save() {
    const data = {
      value: this.lastValue,
    }

    // 删除多余的栈
    const stack = this.stack
    const length = this.index + 1
    if (length < stack.length) {
      stack.length = length
    }

    // 堆栈上限: 20
    if (stack.length < 20) {
      this.index++
      stack.push(data)
    } else {
      stack.shift()
      stack.push(data)
    }
  }

  // 恢复数据
  restore(operation) {
    let index = this.index
    if (operation === 'redo') {
      index++
    }
    if (index >= 0 && index < this.stack.length) {
      const input = this.input
      const data = this.stack[index]
      const {value} = data
      data.value = this.lastValue
      NumberHistory.restoring = true
      input.select()
      document.execCommand('insertText', false, value)
      operation === 'undo' &&
      input.select()
      NumberHistory.restoring = false
      HistoryTimer.finish()

      // 改变指针
      switch (operation) {
        case 'undo': this.index--; break
        case 'redo': this.index++; break
      }
    }
  }

  // 撤销条件判断
  canUndo() {
    return this.index >= 0
  }

  // 重做条件判断
  canRedo() {
    return this.index + 1 < this.stack.length
  }

  // 输入框 - 键盘按下事件
  inputKeydown(event) {
    if (event.cmdOrCtrlKey) {
      switch (event.code) {
        case 'KeyZ':
          this.history.canUndo() &&
          this.history.restore('undo')
          break
        case 'KeyY':
          this.history.canRedo() &&
          this.history.restore('redo')
          break
      }
    }
  }

  // 输入框 - 输入事件
  inputInput(event) {
    if (!NumberHistory.restoring) {
      switch (event.inputType) {
        case 'insertCompositionText':
          break
        case 'insertText':
        case 'deleteContentForward':
        case 'deleteContentBackward':
          if (HistoryTimer.complete ||
            HistoryTimer.type !== event.inputType) {
            this.history.save()
          }
          HistoryTimer.start(event.inputType)
          break
        case undefined:
          if (HistoryTimer.complete ||
            HistoryTimer.type !== 'quickInput') {
            this.history.save()
          }
          HistoryTimer.start('quickInput')
          break
        default:
          this.history.save()
          HistoryTimer.finish()
          break
      }
    }
    switch (event.inputType) {
      case 'insertCompositionText':
        break
      default:
        this.history.lastValue = this.value
        break
    }
  }

  // 输入框 - 失去焦点事件
  inputBlur(event) {
    HistoryTimer.finish()
  }
}

// 数值操作历史恢复中状态开关
NumberHistory.restoring = false

export { NumberHistory }
