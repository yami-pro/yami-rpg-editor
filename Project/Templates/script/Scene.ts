/** 场景脚本 */
export default class SceneScript extends Flow implements Script<Scene> {
  update(deltaTime: number): void {
    // console.log('update')
  }

  onCreate(scene: SceneContext): void {
    console.log('onCreate')
  }

  onLoad(scene: SceneContext): void {
    console.log('onLoad')
  }

  onStart(scene: SceneContext): void {
    console.log('onStart')
  }

  onDestroy(scene: SceneContext): void {
    console.log('onDestroy')
  }

  onScriptAdd(scene: SceneContext): void {
    console.log('onScriptAdd')
  }

  onScriptRemove(scene: SceneContext): void {
    console.log('onScriptRemove')
  }
}