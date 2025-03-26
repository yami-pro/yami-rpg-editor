/** 计时器模式(缩放时间|原生时间) */
type TimerMode = 'scaled' | 'raw'

/** 时间管理器过渡数据 */
type TimeTransitionContext = {
  start: number
  end: number
  easing: EasingMap
  elapsed: number
  duration: number
}