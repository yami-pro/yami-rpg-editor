/** 动画脚本 */
export default class AnimationScript extends Flow implements Script<SceneAnimation> {
  update(deltaTime: number): void {
    // console.log('update')
  }

  onCreate(animation: SceneAnimation): void {
    console.log('onCreate')
  }

  onStart(animation: SceneAnimation): void {
    console.log('onStart')
  }

  onDestroy(animation: SceneAnimation): void {
    console.log('onDestroy')
  }

  onScriptAdd(animation: SceneAnimation): void {
    console.log('onScriptAdd')
  }

  onScriptRemove(animation: SceneAnimation): void {
    console.log('onScriptRemove')
  }
}