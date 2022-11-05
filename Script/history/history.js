'use strict'

// ******************************** 操作历史类 ********************************

class History extends Array {
  index     //:number
  capacity  //:number
  onSave    //:function
  onRestore //:function

  constructor(capacity) {
    super()
    this.index = -1
    this.capacity = capacity
    this.onSave = null
    this.onRestore = null
  }

  // 重置记录
  reset() {
    if (this.length !== 0) {
      this.length = 0
      this.index = -1
    }
  }

  // 保存数据
  save(data) {
    // 删除多余的栈
    const length = this.index + 1
    if (length < this.length) {
      this.length = length
    }

    // 堆栈上限判断
    if (this.length < this.capacity) {
      this.index++
      this.push(data)
    } else {
      this.shift()
      this.push(data)
    }

    // 回调自定义方法
    this.onSave?.(data)
  }

  // 恢复数据
  restore(operation) {
    const index = (
      operation === 'undo' ? this.index
    : operation === 'redo' ? this.index + 1
    :                        null
    )

    if (index >= 0 && index < this.length) {
      const data = this[index]
      const processors = History.processors
      const processor = processors[data.type]
      if (processor) {
        processor(operation, data)

        // 改变指针
        switch (operation) {
          case 'undo': this.index--; break
          case 'redo': this.index++; break
        }

        // 回调自定义方法
        this.onRestore?.(data)
      }
    }
  }

  // 撤销条件判断
  canUndo() {
    return this !== null && this.index >= 0
  }

  // 重做条件判断
  canRedo() {
    return this !== null && this.index + 1 < this.length
  }

  // 操作历史处理器集合
  static processors = {}
}

// ******************************** 操作历史类导出 ********************************

export { History }
