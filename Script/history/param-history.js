// ******************************** 参数操作历史 ********************************

class ParamHistory {
  list  //:element
  stack //:array
  index //:number

  constructor(list) {
    this.list = list
    this.stack = []
    this.index = -1
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

    // 堆栈上限: 100
    if (stack.length < 100) {
      this.index++
      stack.push(data)
    } else {
      stack.shift()
      stack.push(data)
    }
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
      const type = data.type
      ParamHistory.restore(list, data, type, operation)

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

  // 静态 - 恢复数据
  static restore(list, data, type, operation) {
    const loaded = list.data === data.array
    switch (type) {
      case 'insert': {
        const {array, index, items} = data
        const length = items.length
        if (operation === 'undo') {
          if (index + length <= array.length) {
            array.splice(index, length)
            if (loaded) {
              list.update()
              list.select(index)
            }
          }
        } else {
          if (index <= array.length) {
            array.splice(index, 0, ...items)
            if (loaded) {
              list.update()
              list.select(index, index + length - 1)
            }
          }
        }
        break
      }
      case 'replace': {
        const {array, index, oldItem, newItem} = data
        if (operation === 'undo') {
          if (index < array.length) {
            array[index] = oldItem
            if (loaded) {
              list.update()
              list.select(index)
            }
          }
        } else {
          if (index < array.length) {
            array[index] = newItem
            if (loaded) {
              list.update()
              list.select(index)
            }
          }
        }
        break
      }
      case 'delete': {
        const {array, index, items} = data
        const length = items.length
        if (operation === 'undo') {
          if (index <= array.length) {
            array.splice(index, 0, ...items)
            if (loaded) {
              list.update()
              list.select(index, index + length - 1)
            }
          }
        } else {
          if (index + length <= array.length) {
            array.splice(index, length)
            if (loaded) {
              list.update()
              list.select(index)
            }
          }
        }
        break
      }
      case 'toggle': {
        const {array, method, items} = data
        if (operation === 'undo' && method === 'disable' ||
          operation === 'redo' && method === 'enable') {
          list.enableItems(items)
        } else {
          list.disableItems(items)
        }
        const length = items.length
        const sItem = items[0]
        const eItem = items[length - 1]
        list.update()
        list.select(
          array.indexOf(sItem),
          array.indexOf(eItem),
        )
        break
      }
    }
    if (loaded) {
      list.scrollToSelection()
      list.dispatchChangeEvent()
    }
  }
}
