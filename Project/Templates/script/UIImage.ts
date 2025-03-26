/** 图像元素脚本 */
export default class ImageElementScript extends Flow implements Script<ImageElement> {
  onStart(element: ImageElement): void {
    console.log('onStart')
  }
}