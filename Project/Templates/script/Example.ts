/** 角色脚本示例(添加到角色脚本列表中以启用) */
export default class ActorScriptExample extends Flow implements Script<Actor> {
  private actor!: Actor
  private startX: number = 0
  private startY: number = 0

  /** 对应自动执行事件 */
  async onStart(actor: Actor) {
    // 保存角色对象
    this.actor = actor
    this.startX = actor.x
    this.startY = actor.y
    // 等待1000毫秒
    await this.wait(1000)
    // 等待1帧
    await this.wait(0)
    // 过渡(计算0到-100的插值，减速，500毫秒，返回到变量i)
    await this.transition(0, -100, 'ease-out', 500, i => {
      if (actor.animation) {
        actor.animation.offsetY = i
      }
    })
    // 过渡(计算-100到0的插值，加速，500毫秒，返回到变量i)
    await this.transition(-100, 0, 'ease-in', 500, i => {
      if (actor.animation) {
        actor.animation.offsetY = i
      }
    })
    // 等待原生的(0-1000)毫秒
    await this.waitRaw(Math.random() * 1000)
    // 跳转到闲置状态
    return this.idle()
  }

  /** 鼠标进入角色事件 */
  onMouseEnter(event: ScriptMouseEvent): void {
    // 添加轮廓线
    ActorOutline.add(this.actor)
    // 改变动画色调
    this.actor.setTint({green: 128}, 'linear', 500)
  }

  /** 鼠标离开角色事件 */
  onMouseLeave(event: ScriptMouseEvent): void {
    // 移除轮廓线
    ActorOutline.remove(this.actor)
    // 恢复正常色调
    this.actor.setTint({green: 0}, 'linear', 500)
  }

  /** 鼠标左键按下角色事件 */
  async onMouseDownLB(event: ScriptMouseEvent) {
    // 显示对话框
    await this.showText('method 1')
    await this.showText(this.actor, 'method 2')
    await this.showText('argument:true', 'method 3')
    await this.showText(this.actor, 'argument:true', 'method 4')
    // 显示对话框
    await this.showText(this.actor, 'What are you doing ?')
    // 显示选项
    await this.showChoices(
      'Wait 1000ms', async () => {
        await this.wait(1000)
      },
      'No wait', async () => {}
    )
    await this.showChoices(
      'argument:true',
      'Kill you', () => {
        // 销毁当前角色
        this.actor.destroy()
      },
      'Quit Game', () => {
        window.close()
      },
    )
  }

  /** 闲置状态 */
  async idle(): Promise<void> {
    console.log('Start idling')
    const {target} = this.actor
    while (true) {
      // 探测周围是否有敌人
      console.log('Detecting enemies')
      if (target.detect(8, 'enemy', false)) {
        // 发现敌人，跳转到战斗状态
        console.log('Enemy detected')
        return this.combat()
      }
      await this.wait(1000)
    }
  }

  /** 战斗状态 */
  async combat(): Promise<void> {
    console.log('Start combat')
    const {actor} = this
    const {target} = actor
    while (true) {
      await this.wait(100)
      target.discard('any', 12)
      const enemy = target.getTargetMaxThreat('enemy')
      if (enemy?.parent !== actor.parent) {
        console.log('Enemy lost')
        return this.goback()
      }
      const distX = Math.abs(actor.x - enemy.x)
      const distY = Math.abs(actor.y - enemy.y)
      if (distX <= 1.5 && distY <= 0.5) {
        console.log('Attack enemy')
        actor.navigator.stopMoving()
        actor.setAngle(this.getAngleToTarget(enemy))
        actor.shortcut.getSkill('RB')?.cast(enemy)
        await this.wait(500)
      } else {
        console.log('Move to enemy')
        const manhattanDist = distX + distY
        if (manhattanDist <= 5) {
          actor.navigator.followRectangle(enemy, 0.5, 1, 0, 0, true, true)
        } else {
          actor.navigator.followRectangle(enemy, 0.5, 1, 0, 0)
        }
        await this.wait(500)
      }
    }
  }

  /** 返回状态 */
  async goback(): Promise<void> {
    console.log('Start returning')
    this.actor.target.reset()
    this.actor.navigator.navigateTo(this.startX, this.startY, true)
    await this.waitForMovement()
    return this.idle()
  }

  /**
   * 计算朝向目标位置的角度
   * @param target 目标角色
   * @returns 弧度
   */
  getAngleToTarget(target: Actor): number {
    const dx = target.x - this.actor.x
    const dy = target.y - this.actor.y
    return Math.atan2(dy, dx)
  }

  /** 等待角色移动结束 */
  waitForMovement() {
    return new Promise<void>(resolve => {
      this.actor.navigator.onFinish(resolve)
    })
  }
}