/** 区域脚本 */
export default class RegionScript extends Flow implements Script<SceneRegion> {
  update(deltaTime: number): void {
    // console.log('update')
  }

  onCreate(region: SceneRegion): void {
    console.log('onCreate')
  }

  onStart(region: SceneRegion): void {
    console.log('onStart')
  }

  onDestroy(region: SceneRegion): void {
    console.log('onDestroy')
  }

  onScriptAdd(region: SceneRegion): void {
    console.log('onScriptAdd')
  }

  onScriptRemove(region: SceneRegion): void {
    console.log('onScriptRemove')
  }

  onPlayerEnter(event: ScriptRegionEvent): void {
    console.log('onPlayerEnter')
  }

  onPlayerLeave(event: ScriptRegionEvent): void {
    console.log('onPlayerLeave')
  }

  onActorEnter(event: ScriptRegionEvent): void {
    console.log('onActorEnter')
  }

  onActorLeave(event: ScriptRegionEvent): void {
    console.log('onActorLeave')
  }
}