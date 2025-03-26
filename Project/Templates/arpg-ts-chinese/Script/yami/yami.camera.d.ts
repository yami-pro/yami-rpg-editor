/** 摄像机震动模式 */
type CameraShakeMode = 'random' | 'horizontal' | 'vertical'

/** 摄像机存档数据 */
type CameraSaveData = {
  target: string
  x: number
  y: number
  zoom: number
}