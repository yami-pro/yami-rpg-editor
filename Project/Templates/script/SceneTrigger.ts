/** 触发器脚本 */
export default class TriggerScript extends Flow implements Script<Trigger> {
  update(deltaTime: number): void {
    // console.log('update')
  }

  onCreate(trigger: Trigger): void {
    console.log('onCreate')
  }

  onStart(trigger: Trigger): void {
    console.log('onStart')
  }

  onDestroy(trigger: Trigger): void {
    console.log('onDestroy')
  }

  onScriptAdd(trigger: Trigger): void {
    console.log('onScriptAdd')
  }

  onScriptRemove(trigger: Trigger): void {
    console.log('onScriptRemove')
  }

  onHitActor(event: ScriptTriggerHitEvent): void {
    console.log('onHitActor')
  }
}