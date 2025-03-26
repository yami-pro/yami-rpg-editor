/** 状态脚本(异步事件是否执行取决于是否绑定了宿主角色) */
export default class StateScript extends Flow implements Script<State> {
  update(deltaTime: number): void {
    // console.log('update')
  }

  onStateAdd(state: State): void {
    console.log('onStateAdd')
  }

  onStateRemove(state: State): void {
    console.log('onStateRemove')
  }

  onScriptAdd(state: State): void {
    console.log('onScriptAdd')
  }

  onScriptRemove(state: State): void {
    console.log('onScriptRemove')
  }
}