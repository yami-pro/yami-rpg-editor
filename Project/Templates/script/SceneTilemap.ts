/** 瓦片地图脚本 */
export default class TilemapScript extends Flow implements Script<SceneTilemap> {
  update(deltaTime: number): void {
    // console.log('update')
  }

  onCreate(tilemap: SceneTilemap): void {
    console.log('onCreate')
  }

  onStart(tilemap: SceneTilemap): void {
    console.log('onStart')
  }

  onDestroy(tilemap: SceneTilemap): void {
    console.log('onDestroy')
  }

  onScriptAdd(tilemap: SceneTilemap): void {
    console.log('onScriptAdd')
  }

  onScriptRemove(tilemap: SceneTilemap): void {
    console.log('onScriptRemove')
  }
}