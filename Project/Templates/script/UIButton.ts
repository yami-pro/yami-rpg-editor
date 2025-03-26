/** 按钮元素脚本 */
export default class ButtonElementScript extends Flow implements Script<ButtonElement> {
  onStart(element: ButtonElement): void {
    console.log('onStart')
  }

  onSelect(element: ButtonElement): void {
    console.log('onSelect')
  }

  onDeselect(element: ButtonElement): void {
    console.log('onDeselect')
  }
}