'use strict'

// ******************************** 容器元素 ********************************

class ContainerElement extends UI.Element {
  // 绘制图像
  draw() {
    this.drawChildren()
  }

  // 调整大小
  resize() {
    if (this.parent instanceof UI.Window) {
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

UI.Container = ContainerElement

export { ContainerElement }
