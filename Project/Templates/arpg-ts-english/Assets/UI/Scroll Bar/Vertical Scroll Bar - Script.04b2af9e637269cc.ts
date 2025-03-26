/*
@plugin #plugin
@version
@author
@link
@desc

@number sensitivity
@alias #sensitivity
@clamp 10 500
@default 64

@lang en
#plugin Vertical Scroll Bar
#sensitivity Sensitivity

@lang ru
#plugin Вертикальная полоса прокрутки
#sensitivity Чувствительность

@lang zh
#plugin 垂直滚动条
#sensitivity 灵敏度
*/

export default class MainScript implements Script<ContainerElement> {
  sensitivity!: number
  scrollY: number = -1
  scrollHeight: number = -1
  gridWindow!: WindowElement
  scrollBar!: ContainerElement
  scrollBarTrack!: ContainerElement
  scrollBarThumb!: ContainerElement
  decrementButton!: ImageElement
  incrementButton!: ImageElement

  onStart(element: ContainerElement): void {
    this.decrementButton = element.query('presetId', 'e1168760e27e0de1') as ImageElement
    this.incrementButton = element.query('presetId', 'af0afec479d14156') as ImageElement
    this.scrollBarTrack = element.query('presetId', 'b0c551937dd55aa9') as ContainerElement
    this.scrollBarThumb = element.query('presetId', '4a1ba16b81eb1a75') as ContainerElement
    if (this.decrementButton instanceof UIElement &&
      this.incrementButton instanceof UIElement &&
      this.scrollBarTrack instanceof UIElement &&
      this.scrollBarThumb instanceof UIElement) {
      this.scrollBar = element
      this.findGridWindow()
      this.decrementButton.script.add(new ScrollButtonScript(this, -this.sensitivity))
      this.incrementButton.script.add(new ScrollButtonScript(this, this.sensitivity))
      this.scrollBarThumb.script.add(new ScrollThumbScript(this))
    } else {
      this.update = Function.empty
    }
  }

  findGridWindow(): void {
    for (const element of this.scrollBar.parent!.children) {
      if (element instanceof WindowElement) {
        element.script.add(new WindowMouseWheelScript(this))
        this.gridWindow = element
      }
    }
  }

  update(): void {
    if (this.scrollY !== this.gridWindow.scrollY || this.scrollHeight !== this.gridWindow.scrollHeight) {
      this.scrollY = this.gridWindow.scrollY
      this.scrollHeight = this.gridWindow.scrollHeight
      this.resizeScrollBar()
    }
  }

  /** 重新调整滚动条 */
  resizeScrollBar(): void {
    const ratioY = this.gridWindow.scrollY / this.gridWindow.scrollHeight
    const ratioH = this.gridWindow.height / this.gridWindow.scrollHeight
    if (ratioH >= 1) {
      this.scrollBar.hide()
      return
    }
    this.scrollBarThumb.set({
      y: ratioY * this.scrollBarTrack.height,
      height: ratioH * this.scrollBarTrack.height,
    })
    this.scrollBar.show()
  }
}

// 滚动按钮脚本
class ScrollButtonScript implements Script<ImageElement> {
  manager: MainScript
  sensitivity: number

  constructor(manager: MainScript, sensitivity: number) {
    this.manager = manager
    this.sensitivity = sensitivity
  }

  onMouseDownLB(): void {
    this.manager.gridWindow.scrollY += this.sensitivity
  }
}

// 滚动滑块脚本
class ScrollThumbScript implements Script<ContainerElement> {
  gridWindow: WindowElement
  scrollBarTrack: ContainerElement
  mouseDownY: number
  startScrollY: number

  constructor(manager: MainScript) {
    this.gridWindow = manager.gridWindow
    this.scrollBarTrack = manager.scrollBarTrack
    this.mouseDownY = 0
    this.startScrollY = 0
  }

  onDestroy(): void {
    // 释放拖拽状态
    this.windowOnMouseUpLB()
  }

  onMouseDownLB(): void {
    this.mouseDownY = Mouse.screenY
    this.startScrollY = this.gridWindow.scrollY
    Input.on('mousemove', this.windowOnMouseMove, true)
    Input.on('mouseupLB', this.windowOnMouseUpLB, true)
  }

  windowOnMouseUpLB = (): void => {
    Input.off('mousemove', this.windowOnMouseMove)
    Input.off('mouseupLB', this.windowOnMouseUpLB)
    Input.bubbles.stop()
  }

  windowOnMouseMove = (): void => {
    const ratioY = this.gridWindow.scrollHeight / this.scrollBarTrack.height
    const deltaY = (Mouse.screenY - this.mouseDownY) * ratioY
    this.gridWindow.scrollY = this.startScrollY + deltaY
  }
}

// 窗口鼠标滚轮脚本
class WindowMouseWheelScript implements Script<WindowElement> {
  manager: MainScript
  scrollTime: number
  scrollTargetY: number

  constructor(manager: MainScript) {
    this.manager = manager
    this.scrollTime = 0
    this.scrollTargetY = 0
  }

  onWheel(event: ScriptWheelEvent): void {
    const manager = this.manager
    const gridWindow = manager.gridWindow
    const sensitivity = manager.sensitivity
    const deltaY = event.deltaY
    if (this.scrollTime <= 0) {
      this.scrollTargetY = gridWindow.scrollY
    }
    let scrollY = this.scrollTargetY
    // 向上滚动
    if (deltaY < 0) {
      scrollY = Math.max(scrollY - sensitivity, 0)
    }
    // 向下滚动
    if (deltaY > 0) {
      const maxScrollY = gridWindow.scrollHeight - gridWindow.height
      scrollY = Math.min(scrollY + sensitivity, maxScrollY)
    }
    // 检查滚动有效性
    if (gridWindow.scrollY !== scrollY) {
      this.scrollTime = 100
      this.scrollTargetY = scrollY
    }
  }

  update(deltaTime: number): void {
    if (this.scrollTime > 0) {
      const gridWindow = this.manager.gridWindow
      const ratioY = Math.min(deltaTime / this.scrollTime, 1)
      const deltaY = (this.scrollTargetY - gridWindow.scrollY) * ratioY
      if ((this.scrollTime -= deltaTime) <= 0) {
        gridWindow.scrollY = this.scrollTargetY
      } else {
        gridWindow.scrollY += deltaY
      }
    }
  }
}