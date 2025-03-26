/** 容器元素脚本 */
export default class ContainerElementScript extends Flow implements Script<ContainerElement> {
  onCreate(element: ContainerElement): void {
    console.log('onCreate')
  }

  onStart(element: ContainerElement): void {
    console.log('onStart')
  }

  onDestroy(element: ContainerElement): void {
    console.log('onDestroy')
  }

  onFocus(element: ContainerElement): void {
    console.log('onFocus')
  }

  onBlur(element: ContainerElement): void {
    console.log('onBlur')
  }

  onScriptAdd(element: ContainerElement): void {
    console.log('onScriptAdd')
  }

  onScriptRemove(element: ContainerElement): void {
    console.log('onScriptRemove')
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

  onKeyDown(event: ScriptKeyboardEvent): void {
    console.log('onKeydown')
  }

  onKeyUp(event: ScriptKeyboardEvent): void {
    console.log('onKeyUp')
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
}