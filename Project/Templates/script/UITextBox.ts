/** 文本框元素脚本 */
export default class TextBoxElementScript extends Flow implements Script<TextBoxElement> {
  onStart(element: TextBoxElement): void {
    console.log('onStart')
  }

  onInput(event: ScriptInputEvent): void {
    console.log('onInput')
  }
}