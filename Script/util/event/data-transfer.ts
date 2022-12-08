"use strict"

// ******************************** 数据传送方法 ********************************

interface IDataTransfer extends DataTransfer {
  hideDragImage: () => void
}

const prototype = <IDataTransfer>DataTransfer.prototype

// 数据传送方法 - 隐藏拖拽图像
prototype.hideDragImage = function IIFE() {
  const image = document.createElement('no-drag-image')
  return function (this: IDataTransfer) {
    this.setDragImage(image, 0, 0)
  }
}()

export { IDataTransfer }
