/** 光源脚本 */
export default class LightScript extends Flow implements Script<SceneLight> {
  update(deltaTime: number): void {
    // console.log('update')
  }

  onCreate(light: SceneLight): void {
    console.log('onCreate')
  }

  onStart(light: SceneLight): void {
    console.log('onStart')
  }

  onDestroy(light: SceneLight): void {
    console.log('onDestroy')
  }

  onScriptAdd(light: SceneLight): void {
    console.log('onScriptAdd')
  }

  onScriptRemove(light: SceneLight): void {
    console.log('onScriptRemove')
  }
}