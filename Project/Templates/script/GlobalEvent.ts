/** 全局事件脚本(添加到插件列表) */
export default class GlobalScript extends Flow implements Script<Global> {
  onStart(): void {
    console.log('onStart')
  }

  onKeyDown(event: ScriptKeyboardEvent): void {
    console.log('onKeyDown')
  }

  onKeyUp(event: ScriptKeyboardEvent): void {
    console.log('onKeyUp')
  }

  onMouseDown(event: ScriptMouseEvent): void {
    console.log('onMouseDown')
  }

  onMouseUp(event: ScriptMouseEvent): void {
    console.log('onMouseUp')
  }

  onMouseMove(event: ScriptMouseEvent): void {
    // console.log('onMouseMove')
  }

  onDoubleClick(event: ScriptMouseEvent): void {
    console.log('onDoubleClick')
  }

  onWheel(event: ScriptWheelEvent): void {
    console.log('onWheel')
  }

  onTouchStart(event: ScriptTouchEvent): void {
    console.log('onTouchStart')
  }

  onTouchMove(event: ScriptTouchEvent): void {
    console.log('onTouchMove')
  }

  onTouchEnd(event: ScriptTouchEvent): void {
    console.log('onTouchEnd')
  }

  onGamepadButtonPress(event: ScriptGamepadEvent): void {
    console.log('onGamepadButtonPress')
  }

  onGamepadButtonRelease(event: ScriptGamepadEvent): void {
    console.log('onGamepadButtonRelease')
  }

  onGamepadLeftStickChange(event: ScriptGamepadEvent): void {
    console.log('onGamepadLeftStickChange')
  }

  onGamepadRightStickChange(event: ScriptGamepadEvent): void {
    console.log('onGamepadRightStickChange')
  }

  onStartup(): void {
    console.log('onStartup')
  }

  onSceneCreate(): void {
    console.log('onSceneCreate')
  }

  onSceneLoad(): void {
    console.log('onSceneLoad')
  }

  onSaveLoad(): void {
    console.log('onSaveLoad')
  }

  onPreload(): void {
    console.log('onPreload')
  }
}