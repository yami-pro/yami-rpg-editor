/** 文本元素脚本 */
export default class TextElementScript extends Flow implements Script<TextElement> {
  onStart(element: TextElement): void {
    console.log('onStart')
  }
}