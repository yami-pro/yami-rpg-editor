/*
@plugin #plugin
@version 1.0
@author
@link

@lang en
#plugin Trigger - Rebound on Hit Walls

@lang ru
#plugin Триггер - Отскок от стены

@lang zh
#plugin 触发器 - 撞墙反弹
*/

export default class Trigger_ReboundOnHitWalls implements Script<Trigger> {
  constructor(trigger: Trigger) {
    // @ts-ignore 替换触发器撞墙反弹方法
    trigger.detectCollisionWithWalls = detectCollisionWithWalls
  }
}

/**
 * 矢量叉乘
 * @param x1 矢量1.x
 * @param y1 矢量1.y
 * @param x2 矢量2.x
 * @param y2 矢量2.y
 * @returns 叉积
 */
function cross(x1: number, y1: number, x2: number, y2: number): number {
  return x1 * y2 - y1 * x2
}

/** 触发器重载方法 - 触发器撞墙检测函数 */
function detectCollisionWithWalls(this: Trigger): boolean {
  const trigger = this
  const scene = trigger.parent!.scene
  const sx = trigger.lastX
  const sy = trigger.lastY
  const dx = trigger.x
  const dy = trigger.y
  // 如果触发器没有移动或上一次的位置在墙块中，返回
  if (sx === dx && sy === dy || scene.isInWallBlock(sx, sy)) {
    return false
  }
  // 获取碰撞的第一个墙块位置
  const point = scene.getWallPosByRay(sx, sy, dx, dy)
  if (point) {
    const ox = point.x + 0.5
    const oy = point.y + 0.5
    const wl = point.x
    const wt = point.y
    const wr = point.x + 1
    const wb = point.y + 1
    const vx = dx - sx
    const vy = dy - sy
    const offset = 0.01
    let hitFace = ''
    let newAngle = 0
    let vectorRatio = 0
    // 计算触发器与墙块的碰撞面方向
    if (sx < ox) {
      if (sy < oy) {
        // 触发器起始点位于墙块中心的左上
        hitFace = cross(wl - sx, wt - sy, vx, vy) < 0 ? 'top' : 'left'
      } else {
        // 触发器起始点位于墙块中心的左下
        hitFace = cross(wl - sx, wb - sy, vx, vy) > 0 ? 'bottom' : 'left'
      }
    } else {
      if (sy < oy) {
        // 触发器起始点位于墙块中心的右上
        hitFace = cross(wr - sx, wt - sy, vx, vy) > 0 ? 'top' : 'right'
      } else {
        // 触发器起始点位于墙块中心的右下
        hitFace = cross(wr - sx, wb - sy, vx, vy) < 0 ? 'bottom' : 'right'
      }
    }
    // 根据墙块碰撞面计算反弹角度和移动矢量比率
    switch (hitFace) {
      case 'left':
        newAngle = -trigger.angle + Math.PI
        vectorRatio = (wl - offset - sx) / vx
        break
      case 'top':
        newAngle = -trigger.angle
        vectorRatio = (wt - offset - sy) / vy
        break
      case 'right':
        newAngle = -trigger.angle + Math.PI
        vectorRatio = (wr + offset - sx) / vx
        break
      case 'bottom':
        newAngle = -trigger.angle
        vectorRatio = (wb + offset - sy) / vy
        break
    }
    // 设置碰到墙块反弹的角度
    trigger.setAngle(newAngle)
    // 调整位置到墙块边缘外，避免高速移动穿墙
    trigger.setPosition(sx + vx * vectorRatio, sy + vy * vectorRatio)
  }
  return false
}