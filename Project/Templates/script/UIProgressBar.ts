/** 进度条元素脚本 */
export default class ProgressBarElementScript extends Flow implements Script<ProgressBarElement> {
  onStart(element: ProgressBarElement): void {
    console.log('onStart')
  }
}