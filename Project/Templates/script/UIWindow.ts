/** 窗口元素脚本 */
export default class WindowElementScript extends Flow implements Script<WindowElement> {
  onStart(element: WindowElement): void {
    console.log('onStart')
  }
}