'use strict'

import * as Yami from '../yami.js'

// ******************************** 容器元素 ********************************

class ContainerElement extends Yami.UI.Element {
  // 绘制图像
  draw() {
    this.drawChildren()
  }

  // 调整大小
  resize() {
    if (this.parent instanceof Yami.UI.Window) {
      return this.parent.requestResizing()
    }
    this.calculatePosition()
    this.resizeChildren()
  }

  // 销毁元素
  destroy() {
    this.destroyChildren()
    delete this.node.instance
  }
}

Yami.UI.Container = ContainerElement

// ******************************** 容器元素导出 ********************************

export { ContainerElement }
