'use strict'

// ******************************** 数据传送方法 ********************************

// 数据传送方法 - 隐藏拖拽图像
DataTransfer.prototype.hideDragImage = function IIFE() {
  const image = document.createElement('no-drag-image')
  return function () {
    this.setDragImage(image, 0, 0)
  }
}()
