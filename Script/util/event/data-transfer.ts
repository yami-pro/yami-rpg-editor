"use strict"

// ******************************** 数据传送方法 ********************************

interface DataTransfer_ext {
  hideDragImage(): void
}

// 数据传送方法 - 隐藏拖拽图像
DataTransfer.prototype.hideDragImage = function IIFE() {
  const image = document.createElement('no-drag-image')
  return function (this: DataTransfer) {
    this.setDragImage(image, 0, 0)
  }
}()

export { DataTransfer_ext }
