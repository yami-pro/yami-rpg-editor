/** 触发器文件数据 */
type TriggerFile = {
  id: string //+
  path: string //+
  selector: ActorSelector
  onHitWalls: TriggerOnHitWalls
  onHitActors: TriggerOnHitActors
  hitCount: number
  shape: TriggerShape
  speed: number
  hitMode: TriggerHitMode
  hitInterval: number
  initialDelay: number
  effectiveTime: number
  duration: number
  inherit: string
  parent?: TriggerFile //+
  animationId: string
  motion: string
  priority: number
  offsetY: number
  rotatable: boolean
  events: HashMap<CommandFunctionList> //*
  scripts: Array<ScriptData>
}

/** 角色选择器 */
type ActorSelector = 'enemy' | 'friend' | 'team' | 'team-except-self' | 'any-except-self' | 'any'

/** 触发器击中墙壁选项 */
type TriggerOnHitWalls = 'penetrate' | 'destroy'

/** 触发器击中角色选项 */
type TriggerOnHitActors = 'penetrate' | 'destroy' | 'penetrate-destroy'

/** 触发器形状 */
type TriggerShape = TriggerShapeRectangle | TriggerShapeCircle | TriggerShapeSector

/** 触发器形状 - 矩形 */
type TriggerShapeRectangle = {
  type: 'rectangle'
  width: number
  height: number
  anchor: number
}

/** 触发器形状 - 圆形 */
type TriggerShapeCircle = {
  type: 'circle'
  radius: number
}

/** 触发器形状 - 扇形 */
type TriggerShapeSector = {
  type: 'sector'
  radius: number
  centralAngle: number
}

/** 触发器击中模式 */
type TriggerHitMode = 'once' | 'once-on-overlap' | 'repeat'