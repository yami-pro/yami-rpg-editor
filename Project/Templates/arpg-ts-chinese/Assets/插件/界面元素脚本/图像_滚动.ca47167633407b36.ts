/*
@plugin #plugin
@version
@author
@link
@desc #desc

@number velocityX
@alias #velocityX
@default 10

@number velocityY
@alias #velocityY
@default 0

@lang en
#plugin Image - Scroll
#desc Automatic image scrolling
#velocityX Velocity X
#velocityY Velocity Y

@lang ru
#plugin Прокрутка - Изображения
#desc Автоматическая прокрутка изображения
#velocityX Скор. X
#velocityY Скор. Y

@lang zh
#plugin 图像 - 滚动效果
#desc 自动滚动图像
#velocityX 水平速度
#velocityY 垂直速度
*/

export default class Image_Scrolling implements Script<ImageElement> {
  // 接口属性
  velocityX!: number
  velocityY!: number

  // 脚本属性
  image!: ImageElement

  onStart(element: ImageElement): void {
    if (element instanceof ImageElement) {
      this.image = element
    } else {
      this.update = Function.empty
    }
  }

  update(deltaTime: number): void {
    this.image.shiftX += this.velocityX * deltaTime / 1000
    this.image.shiftY += this.velocityY * deltaTime / 1000
  }
}