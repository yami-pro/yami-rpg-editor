'use strict'

import { UI } from '../yami'

// ******************************** 视频元素 ********************************

class VideoElement extends UI.Element {
  video   //:string
  loop    //:boolean
  flip    //:string
  blend   //:string

  constructor(data) {
    super(data)
    this.video = data.video
    this.loop = data.loop
    this.flip = data.flip
    this.blend = data.blend
  }

  // 绘制图像
  draw() {
    this.drawDefaultImage()
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

UI.Video = VideoElement

// ******************************** 视频元素导出 ********************************

export { VideoElement }
