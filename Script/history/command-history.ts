'use strict'

import {
  IFunction
} from '../yami'

// ******************************** 指令操作历史 ********************************

class CommandHistory {
  list      //:element
  stack     //:array
  index     //:number
  capacity  //:number
  versionId //:number
  lastState //:number

  constructor(list) {
    this.list = list
    this.stack = []
    this.index = -1
    this.capacity = 100
    this.versionId = 0
    this.lastState = 0
  }

  // 重置历史
  reset() {
    if (this.stack.length !== 0) {
      this.stack = []
      this.index = -1
    }
  }

  // 保存数据
  save(data) {
    // 删除多余的栈
    const stack = this.stack
    const length = this.index + 1
    if (length < stack.length) {
      stack.length = length
    }

    // 堆栈上限
    if (stack.length < this.capacity) {
      this.index++
      stack.push(data)
    } else {
      stack.shift()
      stack.push(data)
    }

    // 更新版本ID
    this.versionId++
  }

  // 恢复数据
  restore(operation) {
    const index = (
      operation === 'undo' ? this.index
    : operation === 'redo' ? this.index + 1
    :                        null
    )

    if (index >= 0 && index < this.stack.length) {
      const list = this.list
      const data = this.stack[index]
      switch (data.type) {
        case 'insert': {
          const {array, index, commands} = data
          const length = commands.length
          const sCommand = commands[0]
          const eCommand = commands[length - 1]
          if (operation === 'undo') {
            if (index + length <= array.length) {
              const start = list.getRangeByData(sCommand)[0]
              array.splice(index, length)
              list.update()
              list.select(start)
            }
          } else {
            if (index <= array.length) {
              array.splice(index, 0, ...commands)
              list.update()
              list.select(
                list.getRangeByData(sCommand)[0],
                list.getRangeByData(eCommand)[1],
              )
              
            }
          }
          break
        }
        case 'replace': {
          const {array, index, commands} = data
          const [oldCommand, newCommand] = commands
          if (operation === 'undo') {
            if (index < array.length) {
              array[index] = oldCommand
              list.update()
              list.select(...list.getRangeByData(oldCommand))
            }
          } else {
            if (index < array.length) {
              array[index] = newCommand
              list.update()
              list.select(...list.getRangeByData(newCommand))
            }
          }
          break
        }
        case 'delete': {
          const {array, index, commands} = data
          const length = commands.length
          const sCommand = commands[0]
          const eCommand = commands[length - 1]
          if (operation === 'undo') {
            if (index <= array.length) {
              array.splice(index, 0, ...commands)
              list.update()
              list.select(
                list.getRangeByData(sCommand)[0],
                list.getRangeByData(eCommand)[1],
              )
            }
          } else {
            if (index + length <= array.length) {
              const start = list.getRangeByData(sCommand)[0]
              array.splice(index, length)
              list.update()
              list.select(start)
            }
          }
          break
        }
        case 'toggle': {
          const {method, commands} = data
          if (operation === 'undo' && method === 'disable' ||
            operation === 'redo' && method === 'enable') {
            list.enableItems(commands)
          } else {
            list.disableItems(commands)
          }
          const length = commands.length
          const sCommand = commands[0]
          const eCommand = commands[length - 1]
          let [start, end] = list.getRangeByData(sCommand)
          if (length > 1) {
            end = list.getRangeByData(eCommand)[1]
          }
          list.update()
          list.select(start, end)
          break
        }
      }
      list.scrollToSelection('restore')
      list.dispatchChangeEvent()

      // 改变指针
      switch (operation) {
        case 'undo':
          this.index--
          this.versionId--
          break
        case 'redo':
          this.index++
          this.versionId++
          break
      }
    }
  }

  // 保存状态
  saveState() {
    this.lastState = this.versionId
  }

  // 恢复状态
  restoreState() {
    let steps = this.lastState - this.versionId
    if (Math.abs(steps) <= this.capacity) {
      // 禁用不必要的列表方法
      const list = this.list
      list.update = IFunction.empty
      list.select = IFunction.empty
      list.scrollToSelection = IFunction.empty
      while (steps < 0) {
        this.restore('undo')
        steps++
      }
      while (steps > 0) {
        this.restore('redo')
        steps--
      }
      delete list.update
      delete list.select
      delete list.scrollToSelection
      return true
    }
    return false
  }

  // 撤销条件判断
  canUndo() {
    return this.index >= 0
  }

  // 重做条件判断
  canRedo() {
    return this.index + 1 < this.stack.length
  }
}

// ******************************** 指令操作历史导出 ********************************

export { CommandHistory }
