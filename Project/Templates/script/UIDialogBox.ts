/** 对话框元素脚本 */
export default class DialogBoxElementScript extends Flow implements Script<DialogBoxElement> {
  onStart(element: DialogBoxElement): void {
    console.log('onStart')
  }
}