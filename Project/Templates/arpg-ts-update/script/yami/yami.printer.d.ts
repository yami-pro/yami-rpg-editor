/** 打印机指令 */
type PrinterCommand = {
  string: string
  x: number
  y: number
  font: string
  size: number
  color: string
  effect: TextEffect | null
  image: PrinterImageElement | null
  imageWidth: number
  imageHeight: number
  imageSpacing: number
  horizontalWidth: number
  drawingMethod: (
  | typeof Printer.drawText
  | typeof Printer.drawTextWithShadow
  | typeof Printer.drawTextWithStroke
  | typeof Printer.drawTextWithOutline
  | typeof Function.empty
  )
}

/**
 * 自动换行规则  
 * break: 自动换行时强制断开，适用于中文、日语、韩语  
 * keep: 自动换行时保持完整的单词提前换行，适用于英语等
 */
type WordWrap = 'keep' | 'break'

/** 打印机绘制方法映射表 */
type PrinterDrawingMethods = {
  none: 'drawText'
  shadow: 'drawTextWithShadow'
  stroke: 'drawTextWithStroke'
  outline: 'drawTextWithOutline'
}

/** 打印机渲染上下文 */
interface PrinterRenderingContext extends CanvasRenderingContext2D {
  paddingItalic: number
  paddingVertical: number
  size: number
}

/** 打印机字体 */
interface FontFace {
  guid: string
  name: string
}

/** 打印机图像元素 */
interface PrinterImageElement extends ImageElement {
  startX: number
  startY: number
}