'use strict'

import { HistoryTimer } from '../yami'

// ******************************** 文本操作历史 ********************************

class TextHistory {
  input           //:element
  stack           //:array
  index           //:number
  inputType       //:string
  deleted         //:string
  inserted        //:string
  lastInsert      //:string
  lastStart       //:number
  lastEnd         //:number
  editingStart    //:number
  selectionStart  //:number
  selectionEnd    //:number

  constructor(input) {
    this.input = input
    this.stack = []
    this.index = -1
    this.inputType = ''
    this.deleted = ''
    this.inserted = ''
    this.lastInsert = ''
    this.lastStart = 0
    this.lastEnd = 0
    this.editingStart = 0
    this.selectionStart = 0
    this.selectionEnd = 0

    // 扩展方法 - 替换文本
    input.replace = TextHistory.inputReplace

    // 侦听事件
    input.on('keydown', this.inputKeydown)
    input.on('beforeinput', this.inputBeforeinput)
    input.on('input', this.inputInput)
    input.on('blur', this.inputBlur)
    input.on('compositionstart', this.inputCompositionstart)
    input.on('compositionend', this.inputCompositionEnd)
  }

  // 重置历史
  reset() {
    if (this.stack.length !== 0) {
      this.stack = []
      this.index = -1
    }
    this.inputType = ''
    this.lastInsert = ''
  }

  // 保存数据
  save() {
    if (this.inputType) {
      this.inputType = ''
    } else {
      return
    }
    if (!this.deleted &&
      !this.inserted) {
      return
    }

    const data = {
      deleted: this.deleted,
      inserted: this.inserted,
      lastStart: this.lastStart,
      lastEnd: this.lastEnd,
      editingStart: this.editingStart,
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
    if (operation === 'undo') {
      this.save()
    }
    let index = this.index
    if (operation === 'redo') {
      index++
    }
    if (index >= 0 && index < this.stack.length) {
      const input = this.input
      const data = this.stack[index]
      const {
        deleted,
        inserted,
        lastStart,
        lastEnd,
        editingStart,
      } = data

      // 撤销或重做
      let inputType
      TextHistory.restoring = true
      switch (operation) {
        case 'undo':
          inputType = 'historyUndo'
          if (inserted.length > 0) {
            input.selectionStart = editingStart
            input.selectionEnd = editingStart + inserted.length
            document.execCommand('delete')
          }
          if (deleted.length > 0) {
            input.selectionStart = editingStart
            input.selectionEnd = editingStart
            document.execCommand('insertText', false, deleted)
            input.selectionStart = lastStart
            input.selectionEnd = lastEnd
          }
          this.index--
          break
        case 'redo':
          inputType = 'historyRedo'
          if (deleted.length > 0) {
            input.selectionStart = editingStart
            input.selectionEnd = editingStart + deleted.length
            document.execCommand('delete')
          }
          if (inserted.length > 0) {
            input.selectionStart = editingStart
            input.selectionEnd = editingStart
            document.execCommand('insertText', false, inserted)
          }
          this.index++
          break
      }
      TextHistory.restoring = false
      HistoryTimer.finish()
      input.dispatchEvent(
        new InputEvent('input', {
          inputType: inputType,
          bubbles: true,
      }))
    }
  }

  // 撤销条件判断
  canUndo() {
    return this.index >= 0 || !!this.inputType
  }

  // 重做条件判断
  canRedo() {
    return this.index + 1 < this.stack.length
  }

  // 更新状态
  updateStates(event) {
    const {input} = this
    const inputType = event.inputType
    if (this.inputType !== inputType) {
      this.inputType = inputType ?? 'unknown'
      this.inserted = ''
      this.deleted = ''
      this.lastStart = input.selectionStart
      this.lastEnd = input.selectionEnd
      this.editingStart = input.selectionStart
      if (input.selectionStart !== input.selectionEnd) {
        this.deleted = input.value.slice(
          input.selectionStart, input.selectionEnd,
        )
      }
    }
    switch (inputType) {
      case 'insertLineBreak':
        this.inserted += '\n'
        break
      case 'insertText':
        if (event.data) {
          this.inserted += event.data
        }
        break
      case 'deleteContentForward':
        if (input.selectionStart < input.value.length &&
          input.selectionStart === input.selectionEnd) {
          const char = input.value[input.selectionStart]
          this.deleted = this.deleted + char
        }
        break
      case 'deleteContentBackward':
        if (input.selectionStart > 0 &&
          input.selectionStart === input.selectionEnd) {
          const char = input.value[input.selectionStart - 1]
          this.deleted = char + this.deleted
          this.editingStart--
        }
        break
      case 'replaceText':
        this.inserted = event.data
        break
      default:
        if (event.data) {
          this.inserted = (
            event.data.indexOf('\r') !== -1
          ? event.data.replace(/\r/g, '')
          : event.data
          )
        }
        break
    }
  }

  // 更新选择区域
  updateSelection(event) {
    const {input} = this
    this.lastInsert = event.data
    this.selectionStart = input.selectionStart
    this.selectionEnd = input.selectionEnd
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

  // 输入框 - 输入前事件
  inputBeforeinput(event) {
    const {history} = this
    switch (event.inputType) {
      case 'insertCompositionText':
        return
      case 'insertLineBreak':
        if (this instanceof HTMLInputElement) {
          return
        }
      case 'insertText':
        switch (event.data) {
          case ' ':
          case '<':
            if (history.lastInsert !== event.data) {
              HistoryTimer.finish()
            }
            break
        }
      case 'deleteContentForward':
      case 'deleteContentBackward':
        if (history.inputType !== '' && (
          HistoryTimer.complete ||
          HistoryTimer.type !== event.inputType ||
          history.selectionStart !== this.selectionStart ||
          history.selectionEnd !== this.selectionEnd)) {
          history.save()
        }
        HistoryTimer.start(event.inputType)
        switch (event.data) {
          case ':':
          case '>':
            if (history.lastInsert !== event.data) {
              HistoryTimer.finish()
            }
            break
        }
        break
      case 'replaceText':
        if (history.inputType !== null && (
          HistoryTimer.complete ||
          HistoryTimer.type !== event.inputType)) {
          history.save()
        }
        HistoryTimer.start(event.inputType)
        break
      case 'inputCompositionText':
      default:
        history.save()
        HistoryTimer.finish()
        break
    }
    history.updateStates(event)
  }

  // 输入框 - 输入事件
  inputInput(event) {
    switch (event.inputType) {
      case 'insertCompositionText':
        break
      default:
        if (TextHistory.restoring) {
          event.stopImmediatePropagation()
        } else {
          this.history.updateSelection(event)
        }
        break
    }
  }

  // 输入框 - 失去焦点事件
  inputBlur(event) {
    HistoryTimer.finish()
  }

  // 输入框 - 文本合成开始事件
  inputCompositionstart(event) {
    const {history} = this
    const struct = TextHistory.eventStruct
    struct.data = null
    history.save()
    history.inputBeforeinput.call(this, struct)
    history.updateSelection(event)
  }

  // 输入框 - 文本合成结束事件
  inputCompositionEnd(event) {
    const {history} = this
    if (event.data || history.deleted) {
      const struct = TextHistory.eventStruct
      struct.data = event.data
      history.updateStates(struct)
      history.updateSelection(event)
    } else {
      history.inputType = ''
    }
  }
}

// 文本操作历史恢复中状态开关
TextHistory.restoring = false

// 模拟事件结构
TextHistory.eventStruct = {
  inputType: 'inputCompositionText',
  data: null,
}

// 输入框 - 替换文本
TextHistory.inputReplace = function IIFE() {
  const eventStruct = {
    inputType: 'replaceText',
    data: null,
  }
  return function (value) {
    if (typeof value === 'number') {
      value = value.toString()
    }
    eventStruct.data = value
    this.select()
    this.history.inputBeforeinput.call(this, eventStruct)
    this.value = value
  }
}()

// ******************************** 文本操作历史导出 ********************************

export { TextHistory }
