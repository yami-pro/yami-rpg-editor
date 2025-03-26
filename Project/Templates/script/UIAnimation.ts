/** 动画元素脚本 */
export default class AnimationElementScript extends Flow implements Script<AnimationElement> {
  onStart(element: AnimationElement): void {
    console.log('onStart')
  }

  onEnded(element: AnimationElement): void {
    console.log('onEnded')
  }
}