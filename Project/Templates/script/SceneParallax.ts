/** 视差图脚本 */
export default class ParallaxScript extends Flow implements Script<SceneParallax> {
  update(deltaTime: number): void {
    // console.log('update')
  }

  onCreate(parallax: SceneParallax): void {
    console.log('onCreate')
  }

  onStart(parallax: SceneParallax): void {
    console.log('onStart')
  }

  onDestroy(parallax: SceneParallax): void {
    console.log('onDestroy')
  }

  onScriptAdd(parallax: SceneParallax): void {
    console.log('onScriptAdd')
  }

  onScriptRemove(parallax: SceneParallax): void {
    console.log('onScriptRemove')
  }
}