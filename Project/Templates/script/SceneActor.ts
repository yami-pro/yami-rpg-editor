/** 角色脚本 */
export default class ActorScript extends Flow implements Script<Actor> {
  update(deltaTime: number): void {
    // console.log('update')
  }

  onCreate(actor: Actor): void {
    console.log('onCreate')
  }

  onStart(actor: Actor): void {
    console.log('onStart')
  }

  onDestroy(actor: Actor): void {
    console.log('onDestroy')
  }

  onScriptAdd(actor: Actor): void {
    console.log('onScriptAdd')
  }

  onScriptRemove(actor: Actor): void {
    console.log('onScriptRemove')
  }

  onCollision(event: ScriptCollisionEvent): void {
    console.log('onCollision')
  }

  onHitTrigger(event: ScriptTriggerHitEvent): void {
    console.log('onHitTrigger')
  }

  onMouseDown(event: ScriptMouseEvent): void {
    console.log('onMouseDown')
  }

  onMouseDownLB(event: ScriptMouseEvent): void {
    console.log('onMouseDownLB')
  }

  onMouseDownRB(event: ScriptMouseEvent): void {
    console.log('onMouseDownRB')
  }

  onMouseUp(event: ScriptMouseEvent): void {
    console.log('onMouseUp')
  }

  onMouseUpLB(event: ScriptMouseEvent): void {
    console.log('onMouseUpLB')
  }

  onMouseUpRB(event: ScriptMouseEvent): void {
    console.log('onMouseUpRB')
  }

  onMouseMove(event: ScriptMouseEvent): void {
    // console.log('onMouseMove')
  }

  onMouseEnter(event: ScriptMouseEvent): void {
    console.log('onMouseEnter')
  }

  onMouseLeave(event: ScriptMouseEvent): void {
    console.log('onMouseLeave')
  }

  onClick(event: ScriptMouseEvent): void {
    console.log('onClick')
  }

  onDoubleClick(event: ScriptMouseEvent): void {
    console.log('onDoubleClick')
  }
}