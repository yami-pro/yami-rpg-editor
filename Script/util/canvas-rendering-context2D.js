'use strict'

// ******************************** 画布上下文方法 ********************************

// 画布上下文方法 - 绘制图像必要时缩小使之包含于画布
CanvasRenderingContext2D.prototype.drawAndFitImage = function (
  image, sx = 0, sy = 0, sw = image.width, sh = image.height,
) {
  const width = this.canvas.width
  const height = this.canvas.height
  let dw
  let dh
  if (sw <= width && sh <= height) {
    dw = sw
    dh = sh
  } else {
    const scaleX = width / sw
    const scaleY = height / sh
    if (scaleX < scaleY) {
      dw = width
      dh = Math.round(sh * scaleX)
    } else {
      dw = Math.round(sw * scaleY)
      dh = height
    }
  }
  const dx = width - dw >> 1
  const dy = height - dh >> 1
  this.drawImage(image, sx, sy, sw, sh, dx, dy, dw, dh)
}
